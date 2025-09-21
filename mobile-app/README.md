# Potato Disease Detection Mobile App

A React Native mobile application for detecting potato plant diseases using machine learning.

## Prerequisites

1. Node.js (v12 or newer)
2. React Native development environment setup
3. Android Studio (for Android development)
4. Xcode (for iOS development, macOS only)
5. Running API server (from the api directory)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add required image assets:
- Copy the required images to the `assets` directory (see assets/README.md for details)

3. Configure the API endpoint:
- The `.env` file is already configured with the API endpoint
- For Android emulator: `API_URL=http://10.0.2.2:8000`
- For iOS simulator: `API_URL=http://localhost:8000`
- For physical device: Use your computer's IP address, e.g., `API_URL=http://192.168.1.100:8000`

## Running the App

### Android

1. Start an Android emulator or connect a physical device

2. Build and run the app:
```bash
npm run android
```

### iOS (macOS only)

1. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

2. Start the app:
```bash
npm run ios
```

## Features

- Capture photos using the device camera
- Select images from the device gallery
- Real-time disease detection
- Clear and intuitive user interface
- Error handling and loading states
- Support for both Android and iOS

## Troubleshooting

1. If you encounter build errors:
```bash
npm run clean
npm run android
```

2. If the API connection fails:
- Ensure the API server is running
- Verify the API_URL in .env is correct for your setup
- Check your device's network connection

3. For permission issues:
- Grant camera and storage permissions in device settings
- For Android, ensure the permissions are properly declared in AndroidManifest.xml

## Contributing

Feel free to submit issues and enhancement requests!