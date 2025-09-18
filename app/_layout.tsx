import { Stack } from "expo-router/stack";
import React, {useEffect, useState} from "react";
import { AppState } from 'react-native';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from 'expo-router';
import {useFonts, Inter_300Light} from '@expo-google-fonts/inter';

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
