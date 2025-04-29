# SoundLink Mobile

A cross-platform mobile application for Android and iOS to interact with the SoundLink streaming service.

## Features

- User authentication (login, registration, profile management)
- Browse music catalog (songs, albums, artists)
- Music playback with full player controls
- Create and manage playlists
- Favorites management
- Sleek, modern UI with smooth animations
- Offline listening capabilities (coming soon)

## Screenshots

(Screenshots will be added here after the first build)

## Technologies Used

- React Native
- React Navigation
- React Native Track Player
- Axios for API communication
- AsyncStorage for local data persistence
- Linear Gradient for beautiful UI gradients
- React Native Vector Icons for UI icons

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- For iOS: macOS, Xcode
- For Android: Android Studio, JDK

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/soundlink-mobile.git
cd soundlink-mobile
```

2. Install dependencies:
```
npm install
# or
yarn install
```

3. Set up configuration:
   - Create a `.env` file in the root directory with the following variables:
   ```
   BACKEND_URL=http://your-backend-url.com/api
   ```

4. Run the app:

   **For iOS:**
   ```
   npx pod-install ios
   npx react-native run-ios
   ```

   **For Android:**
   ```
   npx react-native run-android
   ```

## Connecting to Backend

This mobile app is designed to connect to the SoundLink Backend API. Make sure your backend server is running and accessible from your mobile device or emulator.

For Android emulator, use `10.0.2.2` instead of `localhost` to access your computer's local services.

## Building for Production

### Android

1. Update the version code and name in `android/app/build.gradle`
2. Create a signing key if you don't have one
3. Configure the signing in `android/app/build.gradle`
4. Run:
```
cd android && ./gradlew assembleRelease
```

### iOS

1. Update the version and build number in Xcode
2. Follow the standard iOS deployment process through Xcode

## Folder Structure

```
src/
  ├── assets/           # Images, fonts, and other static resources
  ├── components/       # Reusable UI components
  ├── context/          # React Context for state management
  ├── navigation/       # Navigation configuration
  ├── screens/          # Screen components
  └── utils/            # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 