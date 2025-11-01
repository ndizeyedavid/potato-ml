from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os
from typing import Optional, Dict, Any
import logging
from functools import lru_cache
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Potato Disease Classification API",
             description="API for classifying potato plant diseases",
             version="1.0.0")

# Get allowed origins from environment variable or use defaults
origins_env = os.getenv("ALLOWED_ORIGINS", "")
if origins_env:
    origins = origins_env.split(",")
else:
    # Default to allow all origins in development, or specify your frontend domains
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model as None
MODEL: Optional[tf.keras.Model] = None
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
MODEL_INPUT_SIZE = (256, 256)
BATCH_SIZE = 32  # Optimal batch size for prediction

# Cache the model in memory
@lru_cache(maxsize=1)
def get_model() -> tf.keras.Model:
    """Get the cached model instance"""
    global MODEL
    if MODEL is None:
        load_model()
    return MODEL

def load_model() -> Optional[tf.keras.Model]:
    """Load the ML model and handle potential errors"""
    global MODEL
    try:
        # Enable mixed precision for faster computation
        tf.keras.mixed_precision.set_global_policy('mixed_float16')
        
        # Try Docker path first, then fall back to local development path
        docker_model_path = "/app/models/potatoes_v1.h5"
        local_model_path = os.path.join(os.path.dirname(__file__), "..", "models", "potatoes_v1.h5")
        
        if os.path.exists(docker_model_path):
            model_path = docker_model_path
        elif os.path.exists(local_model_path):
            model_path = local_model_path
        else:
            raise FileNotFoundError(f"Model file not found at {docker_model_path} or {local_model_path}")
        
        # Load model with optimized settings
        MODEL = tf.keras.models.load_model(
            model_path,
            compile=False  # Load without compilation first
        )
        
        # Recompile the model with optimized configuration
        MODEL.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(reduction='mean'),
            metrics=['accuracy'],
            run_eagerly=False  # Disable eager execution for better performance
        )
        
        logger.info("Model loaded and compiled successfully with optimized settings")
        
        # Validate model input shape
        if len(MODEL.input_shape) != 4:
            raise ValueError("Invalid model input shape")
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise RuntimeError(f"Failed to load ML model: {str(e)}")
    
    return MODEL

@app.on_event("startup")
async def startup():
    """Initialize the model and MongoDB when the application starts"""
    load_model()
    init_mongodb()

# Initialize MongoDB client as None
MONGO_CLIENT: Optional[MongoClient] = None
MONGO_DB = None

def get_mongo_client() -> Optional[MongoClient]:
    """Get the MongoDB client instance"""
    global MONGO_CLIENT
    return MONGO_CLIENT

def get_database():
    """Get the database instance"""
    global MONGO_DB
    return MONGO_DB

def init_mongodb():
    """Initialize MongoDB connection"""
    global MONGO_CLIENT, MONGO_DB
    try:
        # Get MongoDB connection details from environment variables
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://potatoml_milenodded:ad021f2d26979368a8c42bd5102032da7d171866@ym0c1x.h.filess.io:61034/potatoml_milenodded")
        db_name = os.getenv("MONGODB_DATABASE", "potato_disease_db")
        
        # Create MongoDB client
        MONGO_CLIENT = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        # Test the connection
        MONGO_CLIENT.admin.command('ping')
        MONGO_DB = MONGO_CLIENT[db_name]
        logger.info(f"Successfully connected to MongoDB at {mongo_uri}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        MONGO_CLIENT = None
        MONGO_DB = None
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {str(e)}")
        MONGO_CLIENT = None
        MONGO_DB = None

def save_prediction_to_mongodb(prediction_data: Dict[str, Any]):
    """Save prediction result to MongoDB"""
    try:
        db = get_database()
        if db is None:
            logger.warning("MongoDB not initialized, skipping save")
            return False
            
        collection = db["predictions"]
        result = collection.insert_one(prediction_data)
        logger.info(f"Saved prediction to MongoDB with ID: {result.inserted_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to save prediction to MongoDB: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def is_valid_file_type(filename: str) -> bool:
    """Check if the file type is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(contents: bytes) -> np.ndarray:
    """Preprocess the image for model prediction with optimized operations"""
    try:
        # Use BytesIO for efficient memory handling
        image = Image.open(BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Resize with LANCZOS for better quality and performance
        image = image.resize(MODEL_INPUT_SIZE, Image.LANCZOS)
        
        # Convert to numpy array efficiently
        image_array = np.asarray(image, dtype=np.float32)
        
        # Normalize to [0,1] range
        image_array = image_array / 255.0
        
        return image_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise ValueError(f"Invalid image format: {str(e)}")

@app.get("/ping")
async def ping() -> Dict[str, Any]:
    """Health check endpoint"""
    model = get_model()
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_info": {
            "input_shape": model.input_shape if model else None,
            "class_names": CLASS_NAMES,
            "mixed_precision": tf.keras.mixed_precision.global_policy().name
        }
    }

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
) -> Dict[str, Any]:
    """Predict the disease class for an uploaded image with optimized processing"""
    # Validate file presence
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB")
    
    # Validate file type
    if not is_valid_file_type(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Get cached model instance
        model = get_model()
        if model is None:
            logger.error("Model not loaded")
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Preprocess image
        processed_image = preprocess_image(contents)
        
        # Prepare batch for prediction
        img_batch = np.expand_dims(processed_image, 0)
        
        try:
            # Make prediction with optimized settings
            predictions = model.predict(img_batch, verbose=0)
        except Exception as pred_error:
            logger.error(f"Prediction error: {str(pred_error)}")
            raise HTTPException(status_code=500, detail="Error during prediction")
        
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        # Get confidence scores for all classes
        class_confidences = {
            class_name: float(conf)
            for class_name, conf in zip(CLASS_NAMES, predictions[0])
        }
        
        # Prepare prediction data for MongoDB
        prediction_data = {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "class_confidences": class_confidences,
            "file_metadata": {
                "filename": file.filename,
                "size": file_size
            },
            "processing_details": {
                "input_shape": img_batch.shape,
                "prediction_shape": predictions.shape
            },
            "timestamp": datetime.utcnow()
        }
        
        # Save to MongoDB asynchronously (non-blocking)
        save_prediction_to_mongodb(prediction_data)
        
        return {
            'class': predicted_class,
            'confidence': confidence,
            'class_confidences': class_confidences,
            'status': 'success',
            'details': {
                'file_name': file.filename,
                'file_size': file_size,
                'input_shape': img_batch.shape,
                'prediction_shape': predictions.shape,
                'processing_info': {
                    'mixed_precision': tf.keras.mixed_precision.global_policy().name
                }
            }
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error during prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                'status': 'error',
                'detail': str(e),
                'type': 'UnexpectedError'
            }
        )

@app.get("/predictions")
async def get_predictions(
    page: int = 1,
    page_size: int = 20
) -> Dict[str, Any]:
    """Retrieve all prediction records from MongoDB with pagination"""
    try:
        # Validate pagination parameters
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20
            
        # Get database connection
        db = get_database()
        if db is None:
            logger.warning("MongoDB not initialized")
            raise HTTPException(
                status_code=503,
                detail="Database not available"
            )
            
        # Calculate skip value for pagination
        skip = (page - 1) * page_size
        
        # Retrieve predictions from MongoDB
        collection = db["predictions"]
        predictions = list(collection.find(
            {},
            {"_id": 0}  # Exclude MongoDB _id field
        ).skip(skip).limit(page_size).sort("timestamp", -1))  # Sort by timestamp descending
        
        # Get total count for pagination info
        total_count = collection.count_documents({})
        
        return {
            "status": "success",
            "data": predictions,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total_count,
                "pages": (total_count + page_size - 1) // page_size
            }
        }
        
    except OperationFailure as e:
        logger.error(f"MongoDB authorization error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Database authentication failed"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve predictions from MongoDB: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Internal server error while retrieving predictions"
        )

# Add this new endpoint after the existing endpoints
@app.get("/digital-twin")
async def get_digital_twin_data() -> Dict[str, Any]:
    """Get latest prediction data formatted for Unity Digital-twin prototype"""
    try:
        # Get database connection
        db = get_database()
        if db is None:
            logger.warning("MongoDB not initialized")
            raise HTTPException(
                status_code=503,
                detail="Database not available"
            )
            
        # Retrieve the latest prediction from MongoDB
        collection = db["predictions"]
        latest_prediction = collection.find_one(
            {},
            sort=[("timestamp", -1)]  # Sort by timestamp descending to get the latest
        )
        
        if not latest_prediction:
            # If no predictions exist, return default healthy state
            return {
                "plant_id": "plot-A-03",
                "disease_type": "healthy",
                "disease_level": 0.0,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        
        # Map disease types to levels
        disease_level_map = {
            "Early Blight": 0.6,
            "Late Blight": 1.0,
            "Healthy": 0.0
        }
        
        # Extract required data
        disease_type = latest_prediction.get("predicted_class", "Healthy")
        disease_level = disease_level_map.get(disease_type, 0.0)
        
        # Format the response
        timestamp = latest_prediction.get("timestamp", datetime.utcnow())
        if hasattr(timestamp, 'isoformat'):
            timestamp_str = timestamp.isoformat()
        else:
            timestamp_str = str(timestamp)
        
        # Ensure timestamp ends with Z for UTC
        if not timestamp_str.endswith('Z'):
            timestamp_str += "Z"
        
        return {
            "plant_id": "plot-A-03",
            "disease_type": disease_type.lower().replace(" ", "_"),
            "disease_level": disease_level,
            "timestamp": timestamp_str
        }
        
    except OperationFailure as e:
        logger.error(f"MongoDB authorization error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Database authentication failed"
        )
    except Exception as e:
        logger.error(f"Failed to retrieve digital twin data: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail="Internal server error while retrieving digital twin data"
        )

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "localhost")
    
    # Configure uvicorn with optimized settings
    uvicorn.run(
        app,
        host=host,
        port=port,
        workers=1,  # Single worker for better resource utilization
        loop="uvloop",  # Use uvloop for better performance
        http="httptools"  # Use httptools for better HTTP parsing performance
    )

