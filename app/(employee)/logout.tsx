import { buttonColor } from '@/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import Modal from 'react-native-modal';
import { RFValue } from "react-native-responsive-fontsize";
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Logout = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [spinner, setSpinner] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const getToken = async () => {
    setModalVisible(true);
    setError('');
    try {
      const value = await AsyncStorage.getItem('secure_token');
      setToken(value);
    }
    catch (error) {
    }

  };

  const removeToken = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  const toggleModal = () => {
    setError('');
    setModalVisible(false);
    router.navigate('dashboard');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setError('');
      setRefreshing(false);
      setSpinner(false);
      setModalVisible(true);
    }, 2000);
  }, []);

  const handleLogout = () => {
    setSpinner(true);
    setModalVisible(false);

    const config = {
      'headers': {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
      }
    }
    axios.post(apiUrl + '/logout', [], config)
      .then(res => {
        if (res.data && res.data.success) {
          removeToken('secure_token');
          removeToken('name');
          setSpinner(false);
          // router.navigate('/');
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: 'Logout Successfull.',
            button: 'close',
            onHide: () => router.navigate('/')
          });
          // Alert.alert('Logout', 'Logout Successfull.', [
          //   { text: 'OK', onPress: () => router.navigate('/') }
          // ]);
        }


      })
      .catch(err => {
        setSpinner(false);
        if (err.response) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.response.data.message,
            button: 'close',
          });
          // Alert.alert('Error', err.response.data.message);
          setError(err.response.data.message);
        }
        else if (err.message) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.message,
            button: 'close',
          });
          // Alert.alert('Error', err.message);
          setError(err.message);
        }
      })
  }

  useFocusEffect(
    React.useCallback(() => {
      getToken(); // Call when the screen is focused
    }, [])
  );

  return (
    <SafeAreaView style={styles.fullArea}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={{ flex: 1 }}>

          {
            spinner && <><View style={[styles.container, styles.horizontal]}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View></>
          }
          {
            error && <View style={styles.colorDiv}><Text style={[styles.errorMsg, styles.fontStyle]}>{error}</Text></View>
          }

          <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} onBackButtonPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <Text style={[styles.modalText, styles.fontStyle]}>Are you sure you want to logout?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, buttonColor]} onPress={toggleModal}>
                  <Text style={[styles.buttonText, styles.fontStyle]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, buttonColor]} onPress={handleLogout}>
                  <Text style={[styles.buttonText, styles.fontStyle]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        <AlertNotificationRoot theme='light' />
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  fullArea: {
    flex: 1,
  },
  colorDiv: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: '10%',
    height: '100%',
  },
  errorMsg: {
    color: 'red'
  },
  modalContainer: {
    backgroundColor: 'white',
    height: verticalScale(125),
    padding: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  modalText: {
    fontSize: RFValue(16),
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(14),
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  fontStyle: {
    fontFamily: 'Inter_200ExtraLight'
  },
  btnFontStyle: {
    fontFamily: 'Inter_700Bold'
  },
});


export default Logout;