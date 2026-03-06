import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useTheme } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase';
import {
  setupNotificationHandler,
  setupNotificationChannel,
} from './src/utils/notifications';

// Initialize notification handler at module level (before any component renders)
setupNotificationHandler();


function AppContent() {
  const theme = useTheme();
  const [user, setUser] = useState(undefined); // undefined: loading, null: not logged in

  useEffect(() => {
    setupNotificationChannel();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log('Auth state changed:', u ? { uid: u.uid, email: u.email } : null);
      setUser(u || null);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    // 可加 loading 动画
    return null;
  }

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} translucent />
      {user ? <AppNavigator /> : <AuthScreen />}
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
