import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/Drawer';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RFValue } from "react-native-responsive-fontsize";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const EmployeeRoute = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('secure_token');
      if (value) {
        setIsLogin(true);
      }
    }

    catch (error) {
      setIsLogin(false);
    }

  };

  const getName = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      setName(value);
    }
    catch (error) {
      setName('');
    }

  };

  useFocusEffect(
    React.useCallback(() => {
      getToken(); // Call when the screen is focused
      getName();
    }, [])
  );

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1, fontFamily: 'Inter_300Light' }}>
        <Tabs screenOptions={{
          tabBarActiveTintColor: '#11A13A',
          tabBarInactiveTintColor: 'grey', tabBarStyle: styles.tabBarStyle,
          tabBarHideOnKeyboard: true,
        }} >
          <Tabs.Screen
            name="dashboard" // This is the name of the page and must match the url from root
            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Dashboard
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={[styles.viewStyle]}>
                  <MaterialCommunityIcons name="view-dashboard-outline" size={24} style={[styles.iconStyle, { color: color || 'green' }]} />

                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="help" // This is the name of the page and must match the url from root
            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Help Center
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLights', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={styles.viewStyle}>
                  <Feather name="help-circle" size={24} style={[styles.iconStyle, { color: color || '#000' }]} />
                </View>
              ),
            }}

          />
          <Tabs.Screen
            name="resetpassword" // This is the name of the page and must match the url from root

            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Reset MPIN
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={styles.viewStyle}>
                  <MaterialIcons name="lock-reset" size={24} style={[styles.iconStyle, { color: color || '#000' }]} />
                </View>
              ),
            }}

          />
          {/* <Tabs.Screen
            name="forgotmpin" // This is the name of the page and must match the url from root

            options={{
               tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Forgot MPIN
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={styles.viewStyle}>
                  <Feather name="unlock" size={24} style={[styles.iconStyle, { color: color || '#000' }]} />
                </View>
              ),
            }}

          /> */}
          
          <Tabs.Screen
            name="attendance" // This is the name of the page and must match the url from root

            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Attendance
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={styles.viewStyle}>
                  <MaterialIcons name="punch-clock" size={24}  style={[styles.iconStyle, { color: color || '#000' }]}/>
                </View>
              ),
            }}

          />
          <Tabs.Screen
            name="logout" // This is the name of the page and must match the url from root

            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: RFValue(10),
                    color: color,
                    fontWeight: focused ? '700' : '500', // bold when active
                  }}
                >
                  Logout
                </Text>
              ),
              headerTitle: () => (
                <Text style={{ fontFamily: 'Inter_200ExtraLight', fontSize: 18, color: '#11A13A' }}>
                  Hi {name}!
                </Text>
              ),
              headerTitleAlign: 'center',
              tabBarIcon: ({ color }) => (
                <View style={styles.viewStyle}>
                  <SimpleLineIcons name="logout" size={24} style={[styles.iconStyle, { color: color || '#000' }]} />
                </View>
              ),
            }}

          />

        </Tabs>
      </GestureHandlerRootView>

      <StatusBar style="dark" />

    </>

  );
}

const styles = StyleSheet.create({

  label: {
    fontFamily: 'Inter_200ExtraLight',
    fontSize: 15
  },
  iconStyle: {
    marginRight: 7
  },
  viewStyle: {
    flexDirection: 'row',
  },
  tabBarStyle: {
    // position: 'absolute',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: verticalScale(60),
    paddingBottom: 10,
    paddingTop: 5,
    borderColor: 'white',
    bottom: 0,
    elevation: 0,
  }
});

export default EmployeeRoute;