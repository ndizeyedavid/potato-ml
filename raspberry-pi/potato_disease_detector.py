import os
import time
from datetime import datetime
from pathlib import Path
import requests
from PIL import Image
import cv2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://192.168.0.225:8000')  # Replace with your API server IP
CAPTURE_INTERVAL = int(os.getenv('CAPTURE_INTERVAL', '300'))  # Default 5 minutes
SAVE_IMAGES = os.getenv('SAVE_IMAGES', 'true').lower() == 'true'
IMAGE_DIR = 'captured_images'

class PotatoDiseaseDetector:
    def __init__(self):
        # Initialize camera
        self.camera = cv2.VideoCapture(0)  # Use default webcam (usually USB webcam)
        if not self.camera.isOpened():
            raise RuntimeError("Could not open webcam")
        
        # Create directory for saving images if enabled
        if SAVE_IMAGES:
            Path(IMAGE_DIR).mkdir(exist_ok=True)

    def capture_image(self):
        """Capture an image and return its path"""
        # Capture frame
        ret, frame = self.camera.read()
        if not ret:
            raise RuntimeError("Failed to capture image from webcam")
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if SAVE_IMAGES:
            image_path = f"{IMAGE_DIR}/potato_{timestamp}.jpg"
        else:
            image_path = "temp_capture.jpg"
            
        cv2.imwrite(image_path, frame)
        return image_path

    def analyze_image(self, image_path):
        """Send image to API for analysis"""
        try:
            # Prepare image for API
            with Image.open(image_path) as img:
                # Resize image if needed
                max_size = (1024, 1024)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                if not SAVE_IMAGES:
                    img.save(image_path)

            # Send to API
            with open(image_path, 'rb') as img_file:
                files = {'file': ('image.jpg', img_file, 'image/jpeg')}
                response = requests.post(f"{API_URL}/predict", files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        'success': True,
                        'prediction': result.get('class'),
                        'confidence': result.get('confidence'),
                        'timestamp': datetime.now().isoformat()
                    }
                else:
                    return {
                        'success': False,
                        'error': f"API Error: {response.status_code}",
                        'timestamp': datetime.now().isoformat()
                    }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
        finally:
            # Clean up temporary file
            if not SAVE_IMAGES and os.path.exists(image_path):
                os.remove(image_path)

    def run_continuous(self):
        """Run continuous monitoring"""
        print("Starting Potato Disease Detection Monitor")
        print(f"Capturing images every {CAPTURE_INTERVAL} seconds")
        
        while True:
            try:
                print("\nCapturing image...")
                image_path = self.capture_image()
                print("Analyzing image...")
                result = self.analyze_image(image_path)
                
                if result['success']:
                    print(f"Prediction: {result['prediction']}")
                    print(f"Confidence: {result['confidence']:.2f}%")
                else:
                    print(f"Error: {result['error']}")
                
                print(f"Next capture in {CAPTURE_INTERVAL} seconds...")
                time.sleep(CAPTURE_INTERVAL)
                
            except KeyboardInterrupt:
                print("\nStopping monitoring...")
                break
            except Exception as e:
                print(f"Error: {str(e)}")
                print("Retrying in 60 seconds...")
                time.sleep(60)

if __name__ == "__main__":
    detector = PotatoDiseaseDetector()
    detector.run_continuous()