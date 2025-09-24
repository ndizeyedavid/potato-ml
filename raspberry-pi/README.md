# Raspberry Pi Potato Disease Detector

This Python application uses a Raspberry Pi camera to continuously monitor potato plants for diseases using machine learning.

## Setup Instructions

1. Install system dependencies:
```bash
sudo apt-get update
sudo apt-get install -y python3-pip python3-picamera2
```

2. Install Python dependencies:
```bash
pip3 install -r requirements.txt
```

3. Configure the application:
```bash
cp .env.example .env
```
Edit the `.env` file to set your API server address and other preferences.

4. Run the application:
```bash
python3 potato_disease_detector.py
```

## Features

- Continuous monitoring with configurable intervals
- Automatic image capture using Raspberry Pi camera
- Image analysis using machine learning API
- Optional image saving for record keeping
- Error handling and automatic retries
- Environment-based configuration

## Configuration Options

- `API_URL`: The URL of your prediction API server
- `CAPTURE_INTERVAL`: Time between captures in seconds
- `SAVE_IMAGES`: Whether to save captured images locally

## Directory Structure

- `captured_images/`: Directory where images are saved (if enabled)
- `.env`: Configuration file
- `potato_disease_detector.py`: Main application script

## Troubleshooting

1. Camera not working:
   - Ensure the camera is properly connected
   - Check if camera is enabled in raspi-config
   - Verify camera permissions

2. API connection issues:
   - Check if API_URL is correct in .env
   - Verify network connectivity
   - Ensure API server is running