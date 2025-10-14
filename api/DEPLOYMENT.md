# Deployment Guide for Render

This guide explains how to deploy the Potato Disease Classification API to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- Git repository with your code pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Connect Your Repository**

   - Log in to Render Dashboard
   - Click "New +" and select "Web Service"
   - Connect your Git repository

2. **Configure the Service**

   - **Name**: `potato-disease-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (use repository root)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./api/Dockerfile`
   - **Docker Context**: `.` (repository root)
   - **Instance Type**: Free or paid plan

3. **Set Environment Variables**

   - `PORT`: `8000` (Render will override this automatically)
   - `HOST`: `0.0.0.0`
   - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://yourfrontend.com`)
   - `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://username:password@host:port`)
   - `MONGODB_DATABASE`: Your MongoDB database name (default: `potato_disease_db`)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

### Option 2: Using render.yaml (Infrastructure as Code)

1. Place the `render.yaml` file in your repository root
2. In Render Dashboard, go to "Blueprint" → "New Blueprint Instance"
3. Connect your repository
4. Render will automatically detect and use the `render.yaml` configuration

## Building Locally (Testing)

To test the Docker build locally before deploying:

```bash
# Navigate to repository root
cd /path/to/potato-disease-classification

# Build the Docker image
docker build -f api/Dockerfile -t potato-api .

# Run the container
docker run -p 8000:8000 -e PORT=8000 potato-api

# Test the API
curl http://localhost:8000/ping
```

## Important Notes

1. **Docker Context**: The Dockerfile must be built from the repository root (not the `api` directory) because it needs access to the `models/` directory
2. **Build Time**: First deployment may take 5-10 minutes due to TensorFlow installation
3. **Memory**: Ensure your Render plan has sufficient memory (minimum 512MB recommended, 1GB+ ideal)
4. **Health Check**: The `/ping` endpoint is used for health checks
5. **CORS**: Update `ALLOWED_ORIGINS` environment variable with your frontend domain
6. **MongoDB**: For production deployments, configure `MONGODB_URI` and `MONGODB_DATABASE` environment variables

## Troubleshooting

### Build Fails

- Check that `models/potatoes_v1.h5` exists in the repository
- Verify all dependencies in `requirements.txt` are compatible
- Check Render build logs for specific errors

### Service Crashes

- Check if memory limit is exceeded (upgrade plan if needed)
- Verify model file is correctly copied (check logs)
- Ensure PORT environment variable is set

### API Not Responding

- Verify the service is running in Render Dashboard
- Check health check status at `/ping` endpoint
- Review application logs for errors

### MongoDB Connection Issues

- Verify `MONGODB_URI` is correctly formatted
- Ensure MongoDB service is accessible from your deployment environment
- Check MongoDB authentication credentials
- Review application logs for MongoDB connection errors

## API Endpoints

- `GET /ping` - Health check endpoint
- `POST /predict` - Image classification endpoint

## Support

For issues specific to Render deployment, consult:

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
