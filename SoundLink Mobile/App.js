import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import MiniPlayer from './src/components/MiniPlayer';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'VirtualizedLists should never be nested',
]);

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PlayerProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <AppNavigator />
            <MiniPlayer />
            <Toast />
          </NavigationContainer>
        </PlayerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App; 