import { Inter_300Light, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Stack } from "expo-router/stack";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import { AppState } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appState, setAppState] = useState(AppState.currentState);
    let [fontsLoaded] = useFonts({Inter_300Light});

    const router = useRouter();
    const checkLogin = async () => {
         const value = await AsyncStorage.getItem('secure_token');
           if(value){
               router.push('/dashboard');
              }
    }

      useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
          if (nextAppState === 'active') {
            // Reinitialize when the app comes to the foreground
            checkLogin();
          }
          setAppState(nextAppState);
        };

        AppState.addEventListener('change', handleAppStateChange);

        return () => {
          AppState.removeEventListener('change', handleAppStateChange);
        };
      }, []);

      useEffect(() => {
        checkLogin();

        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      }, [fontsLoaded]);

  return <>
      <Stack
        screenOptions={{
            headerShown : false
        }}>
        {/* Optionally configure static options outside the route.*/}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="sendemail" />
        <Stack.Screen name="mpin" />
      </Stack>
     <StatusBar style="dark" />
    </>;
}
