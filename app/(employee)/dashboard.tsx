import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, SafeAreaView, StyleSheet, BackHandler, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl, Button } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import OTPInput from "@codsod/react-native-otp-input";
import { SelectList } from 'react-native-dropdown-select-list';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { buttonColor } from '@/components/Button';
import SwipeButton from 'rn-swipe-button';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [manualPunch, setManualPunch] = useState(false);
  const [manualPunchText, setManualPunchText] = useState('');
  const [branchError, setBranchError] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [error, setError] = useState('');
  const [checkInStatus, setCheckInStatus] = useState({});
  const [checkOutStatus, setCheckOutStatus] = useState({});
  const [checkinLoader, setCheckinLoader] = useState(false);
  const [checkoutLoader, setCheckoutLoader] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [mpinSubmitText, setMpinSubmitText] = useState('');
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [modalError, setModalError] = useState({});
  const [requestLoader, setRequestLoader] = useState(false);
  const [attandanceId, setAttandanceId] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [modalGlobalError, setModalGlobalError] = useState('');
  const [mpinError, setMpinError] = useState('');
  const [mapInitialRegion, setMapInitialRegion] = useState(null);
  const [authoriseLocation, setAuthoriseLocation] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [authType, setAuthType] = useState([]);
  const [fromWork, setFromWork] = useState(true);
  const [fromLocation, setFromLocation] = useState(false);
  const [mpin, setMpin] = useState('');
  const [workColor, setWorkColor] = useState('#11A13A');
  const [locationColor, setLocationColor] = useState('lightgrey');
  const [mpinVisible, setMpinVisible] = useState(false);
  const [mpinSpinner, setMpinSpinner] = useState(false);
  const activeColor = '#11A13A';
  const inActiveColor = 'default';
  const apiKey = '60c058a5fd2c4af6b17a577c532b803e';
  const [selected, setSelected] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);
  const [swipeReset, setSwipeReset] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;


  // const getName = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('username');
  //     setName(value);
  //     const code = await AsyncStorage.getItem('emp_code');
  //     setEmpCode(code);
  //   }
  //   catch (error) {
  //     setName('');
  //   }

  // };

  const getCurrentStatus = (config) => {
    let newConfig = {};
    AsyncStorage.getItem('secure_token')
      .then(res => {
        newConfig = {
          'headers': {
            'X-Authorization': `Bearer ${res}`
          }
        };

        axios.post(apiUrl + '/get_current_status', [], newConfig)
          .then(res => {
            if (res.data.data) {
              setCheckInStatus(res.data.data.check_in_status);
              setCheckOutStatus(res.data.data.check_out_status);
              setAttandanceId(res.data.data.check_in_status.attandance_id);
            }
          })
          .catch(err => {
            if (err.response && err.response.data) {
              setError(err.response.data.message);
            }
            else if (err.message) {
              setError(err.message);
            }
          })

      });

  }


  const handleBiometricAuth = async () => {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
    if (!isBiometricAvailable) {
      setErrorMsg('Biometric Not Supported');
      Alert.alert('Error', 'Biometric Not Supported');
    }

    let supportBiometrics;
    if (isBiometricAvailable) {
      supportBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
    }

    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
    if (!savedBiometrics) {
      setErrorMsg('Biometric record not found.');
      Alert.alert('Error', 'Biometric record not found.');
    }

  }

  const rightSwipeIcon = () => {
    return <AntDesign name="right" size={24} color="black" />;
  }

  const checkBiometric = () => {
    LocalAuthentication.hasHardwareAsync()
      .then(res => {
        if (res) {
          setIsBiometricSupported(res);
        }

      })
  }

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('secure_token');
      setToken(value);
      const headers = {
        'headers': {
          'X-Authorization': `Bearer ${value}`
        }
      }
      await getCurrentStatus(headers);
    }
    catch (error) {
      setToken('');
    }
  };

  const config = {
    'headers': {
      'X-Authorization': `Bearer ${token}`
    }
  }

  const onPress = () => {
    setManualPunch(true);
    setManualPunchText('Swipe to Check In');
    setBranchError('');
  }

  const manualCheckIn = (locationid) => {

    const data = {
      'latitude': latitude,
      'longitude': longitude,
      'location': address,
      'locationId': locationid
    };
    axios.post(apiUrl + '/manual/checkIn', data, config)
      .then(res => {
        if (res.data) {
          setError('');
          getCurrentStatus(config);
          setCheckinLoader(false);
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: res.data.message,
            button: 'close',
          });
          // Alert.alert('Success', res.data.message);
        }
      })
      .catch(err => {
        setCheckinLoader(false);
        if (err.response && err.response.data) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.response.data.message,
            button: 'close',
          });
          // setError(err.response.data.message);
        }
        else if (err.message) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.message,
            button: 'close',
          });
          // setError(err.message)
        }
      })
  }

  const handleManualCheckOut = async () => {
    setManualPunch(true);
    setManualPunchText('Swipe to Check Out');
    setBranchError('');
  }

  const handleManualPunch = async () => {
    if (locationId) {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: manualPunchText,
        cancelLabel: 'cancel',
        disableDeviceFallback: true,
      });

      if (biometricAuth.success) {
        setManualPunch(false);
        if (attandanceId) {
          setCheckoutLoader(true);
          manualCheckOut(locationId);
        }
        else {
          setCheckinLoader(true);
          manualCheckIn(locationId);
        }
      }
      else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Biometric not registered',
          button: 'close',
        });
        // Alert.alert('Biometric Error', 'Biometric not registered');
      }
    }
    else {
      setBranchError('Invalid Branch');
      setSwipeReset(true);
    }
  }

  const manualCheckOut = (locationid) => {
    const data = {
      'latitude': latitude,
      'longitude': longitude,
      'location': address,
      'locationId': locationid
    };
    axios.post(apiUrl + '/manual/checkOut', data, config)
      .then(res => {
        if (res.data) {
          setError('');
          getCurrentStatus(config);
          setCheckoutLoader(false);
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: res.data.message,
            button: 'close',
          });
        }
      })
      .catch(err => {
        setCheckoutLoader(false);
        if (err.response && err.response.data) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.response.data.message,
            button: 'close',
          });
          // setError(err.response.data.message);
        }
        else if (err.message) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: err.message,
            button: 'close',
          });
          // setError(err.message)
        }

      })
  }



  const getCurrentLocation = async () => {
    setSpinner(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setSpinner(false);
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setSpinner(false);
    setLocation(location);
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
    isAuthorise(location.coords.latitude, location.coords.longitude);
    getLocationInfo(location.coords.latitude, location.coords.longitude);
    setMapInitialRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getCurrentStatus(config);
      setRefreshing(false);
      setError('');
      getBranches();
      setBranchError('');

    }, 2000);
  }, []);

  const isAuthorise = (lat, long) => {
    let newConfig = {};
    const locationData = {
      'latitude': lat,
      'longitude': long
    }
    AsyncStorage.getItem('secure_token')
      .then(res => {
        newConfig = {
          'headers': {
            'X-Authorization': `Bearer ${res}`
          }
        };
        axios.post(apiUrl + '/validate_location', locationData, newConfig)
          .then(res => {
            if (res.data && res.data.data) {
              setAuthoriseLocation(res.data.data.location);
            }
          })
          .catch(err => {
            if (err.response && err.response.data) {
              setError(err.response.data.message);
            }
            else if (err.message) {
              setError(err.message);
            }
          })

      })


  }
  const getLocationInfo = (latitude, longitude) => {

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${apiKey}&address_only=1`;
    axios.get(url)
      .then((data) => {
        if (data.status === 200) {
          if (data.data.results.length > 0) {
            setAddress(data.data.results[0].formatted);
            setErrorMsg("");
          }
          else {
            setErrorMsg("Reverse geolocation request failed.");
          }
        } else {

          setErrorMsg("Reverse geolocation request failed.");

        }
      })
      .catch((error) => console.error(error));
  }

  const checkInModal = () => {
    setModalError({});
    setModalTitle('Check In Form');
    setLocationLabel('Location for Check In');
    setModalVisible(true);
  }

  const showCheckOutModal = () => {
    setModalError({});
    setModalTitle('Check Out Form');
    setLocationLabel('Location for Check Out');
    setModalVisible(true);
  }

  const cancelRequest = () => {
    setModalVisible(false);

  }

  const handleSubmit = () => {
    setRequestLoader(true);
    setModalError({});
    setModalGlobalError('');
    let requestUrl = '';
    if (attandanceId) {
      requestUrl = apiUrl + '/request/checkOut';
    }
    else {
      requestUrl = apiUrl + '/request/checkIn';
    }
    const validationErrors = validateModal();
    if (Object.keys(validationErrors).length === 0) {
      const data = {
        'location': address,
        'latitude': latitude,
        'longitude': longitude,
        'address': manualLocation,
        'reason': reason,
        'remark': remark,
        'attandance_id': attandanceId
      }

      axios.post(requestUrl, data, config)
        .then(res => {
          if (res.data) {
            setRequestLoader(false);
            getCurrentStatus(config);
            if (res.data.data.attandance_id) {
              setAttandanceId(res.data.data.attandance_id);
            }
            Dialog.show({
              type: ALERT_TYPE.SUCCESS,
              title: 'Success',
              textBody: res.data.message,
              button: 'close',
            });
            setModalVisible(false);
          }
        })
        .catch(err => {
          setRequestLoader(false);
          if (err.response) {
            setModalGlobalError(err.response.data.message);
          }
          else {
            setModalGlobalError('Something went wrong. Request not able to submit');
          }
        })

    }
    else {
      setRequestLoader(false);
      setModalError(validationErrors);
    }

  }

  const validateModal = () => {
    let validationErrors = {};

    if (!manualLocation) {
      validationErrors.manualLocation = 'This field is required.';
    }

    if (!reason) {
      validationErrors.reason = 'This field is required.';
    }

    return validationErrors;
  };


  const handleBackDropPress = () => {
    setMpin('');
    setMpinVisible(false);
    setMpinError('');
    setLocationId('');
  }

  const onBackPress = () => {
    BackHandler.exitApp();
    return true;
  }

  const handleBack = () => {
    setManualPunch(false);
    setBranchError('');
    setLocationId('');
  }
  const checkInAtWork = () => {
    setWorkColor('#11A13A');
    setLocationColor('lightgrey');
    setFromWork(true);
    setFromLocation(false);
  }
  const checkInOther = () => {
    setWorkColor('lightgrey');
    setLocationColor('#11A13A');
    setFromWork(false);
    setFromLocation(true);

  }

  const verifyCheckInMpin = () => {
    setMpinVisible(true);
    setMpinError('');
    setMpinSubmitText('Check In');
  }
  const verifyCheckOutMpin = () => {
    setMpinVisible(true);
    setMpinError('');
    setMpinSubmitText('Check Out');
  }

  const verifyMpin = () => {
    setMpinSpinner(true);
    if (mpin.length === 4 && locationId) {
      let mpindata = {
        'mpin': mpin,
      }
      axios.post(apiUrl + '/mpin/verify', mpindata, config)
        .then(res => {
          if (res.data && res.data.data.mpin) {
            setMpinVisible(false);
            setMpinError('');
            if (attandanceId) {
              manualCheckOut(locationId);
            }
            else {
              manualCheckIn(locationId);
            }
            setMpin('');
            setMpinSpinner(false);
          }
        })
        .catch(err => {
          setMpinSpinner(false);

          if (err.response) {
            setMpinError(err.response.data.message);
          }
          else if (err.message) {
            setMpinError(err.message);
          }
        })
    }
    else {
      setMpinError('Invalid MPIN or Invalid Branch');
      setMpinSpinner(false);
    }

  }

  const getBranches = () => {
    axios.post(apiUrl + '/get_branches', {}, config)
      .then(res => {
        if (res.data && res.data.success) {
          setLocations(res.data.data.data);
        }
      })
      .catch(err => {
        if (err.response) {
          setMpinError(err.response.data.message);
        }
        else if (err.message) {
          setMpinError(err.message);
        }
      })
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      // Clean up the listener when the component unmounts
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    // getName();
    getCurrentLocation();
    handleBiometricAuth();
    getBranches();
    let time = '';
    const timer = setInterval(() => {

      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));

    }, 1000);
    return () => {
      clearInterval(timer);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getToken();
    }, [])
  );

  return (

    <SafeAreaView style={{
      paddingBottom: insets.bottom,
      flex: 1,
    }}>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
        <Text style={[{ fontSize: RFPercentage(2), fontWeight: 'bold', color: '#11A13A' }, styles.fontStyle]}><Fontisto name="date" size={18} color="#11A13A" /> : {new Date().toLocaleDateString()}</Text>
        <View style={{ flexDirection: 'row' }}>
          <Ionicons name="time-outline" size={18} color="#11A13A" />
          <Text style={[{ fontSize: 14, fontWeight: 'bold', justifyContent: 'center', alignItems: 'center', color: '#11A13A' }, styles.fontStyle]}>: {currentTime}</Text>
        </View>
      </View>

      {mapInitialRegion &&
        <>
          <View style={styles.mapContainer}>
            <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={mapInitialRegion} showsUserLocation={true} showsMyLocationButton={true}>
            </MapView>

            {
              latitude && <>
                {/*<View style={{ marginVertical: 10 }}>
              <Text style={styles.paragraph}>Latitude : {latitude}</Text>
              <Text style={styles.paragraph}>Longitude : {longitude}</Text>
            </View>*/}
                <View style={[styles.addressStyle, buttonColor]}>
                  <Text style={[{ fontSize: RFValue(15), padding: moderateScale(2), alignItems: 'center', color: 'white' }, styles.fontStyle]} ><Text style={{ fontWeight: 'bold' }}><Entypo name="location-pin" size={moderateScale(20)} color="white" /> </Text>{authoriseLocation ? authoriseLocation : address}</Text>
                </View>
              </>
            }
          </View>
        </>
      }
      <AlertNotificationRoot theme='light'>
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
          {
            error && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}> <Text style={[styles.errormsg, styles.fontStyle]}>{error}</Text></View>
          }
          {
            errorMsg && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={[styles.errormsg, styles.fontStyle]}>{errorMsg}</Text></View>
          }

          {
            spinner && <><View style={[styles.container, styles.horizontal]}>
              <ActivityIndicator size="small" color="#0000ff" />
            </View></>
          }
          {/* {isBiometricSupported && <>
        <Text>Biometric Supported</Text>
          <Button title="Click Me" onPress={handleBiometricAuth} />
        </>}*/}


          {/*Show Check In and Check Out Status*/}
          {
            checkInStatus.status && <>
              <View style={styles.checkStatus}>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.cardLabel}>Check In!</Text>
                  <View style={styles.checkCard}>
                    <Text style={[styles.paragraph, styles.fontStyle]}>{checkInStatus.status === 'Checked In' ? <Text style={{ color: '#11A13A' }}>{checkInStatus.time}</Text> : <Text>{checkInStatus.time}</Text>}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.cardLabel}>Status!</Text>
                  <View style={styles.checkCard}>
                    <Text style={[styles.paragraph, styles.fontStyle]}>
                      {checkInStatus.status === 'Checked In' ? <Text style={{ color: '#11A13A', fontWeight: 'bold' }}><AntDesign name="checkcircle" size={moderateScale(15)} color="#11A13A" /> Success</Text> : checkInStatus.status === 'Pending' ? <Text style={{ color: 'orange' }}><AntDesign name="clockcircleo" size={24} color="orange" /> {checkInStatus.status}</Text> : checkInStatus.status === 'Rejected' && <Text style={{ color: 'red' }}>{checkInStatus.status}</Text>} </Text>
                  </View>
                </View>
              </View>
            </>
          }

          {
            checkOutStatus.status && <>
              <View style={styles.checkStatus}>
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.cardLabel}>Check Out!</Text>
                  <View style={styles.checkCard}>
                    <Text style={[styles.paragraph, styles.fontStyle]}>{checkOutStatus.status === 'Checked Out' ? <Text style={{ color: '#11A13A' }}>{checkOutStatus.time}</Text> : <Text>{checkOutStatus.time}</Text>}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={styles.cardLabel}>Status!</Text>
                  <View style={styles.checkCard}>
                    <Text style={[styles.paragraph, styles.fontStyle]}>
                      {checkOutStatus.status === 'Checked Out' ? <Text style={{ color: '#11A13A' }}><AntDesign name="checkcircle" size={moderateScale(15)} color="#11A13A" /> Success</Text> : checkOutStatus.status === 'Pending' ? <Text style={{ color: 'orange', fontWeight: 'bold' }}><AntDesign name="clockcircle" size={moderateScale(15)} color="orange" /> {checkOutStatus.status}</Text> : checkOutStatus.status === 'Rejected' && <Text style={{ color: 'red' }}>{checkOutStatus.status}</Text>} </Text>
                  </View>
                </View>
              </View>
            </>
          }

          {
            (checkInStatus.length === 0 || checkOutStatus?.status?.length === 0) ? <>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: "5%" }}>
                <View>
                  <TouchableOpacity style={[styles.workStyle, { backgroundColor: workColor }]} onPress={checkInAtWork}>
                    <Text style={[{ color: 'white', marginHorizontal: '5%' }, styles.btnFontStyle]}>At Work</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity style={[styles.otherLocation, { backgroundColor: locationColor }]} onPress={checkInOther}>
                    <Text style={[{ color: 'white', marginHorizontal: '5%' }, styles.btnFontStyle]}>From Other Location</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
              : ''
          }


          {!errorMsg && <>
            <View style={styles.buttonContainer}>
              {/* Buttton to show status of requests. */}
              {/*  {
                            checkInStatus.status && checkInStatus.status === 'Checked In' ? <Text style={styles.successButton}>{checkInStatus.status}</Text> : checkInStatus.status === 'Rejected' ? <Text style={styles.rejectButton}>{checkInStatus.status}</Text> : checkInStatus.status === 'Pending' ? <Text style={styles.pendingButton}>{checkInStatus.status}</Text> : ''
                          }*/}
              {/*  {
                            checkOutStatus.status && checkOutStatus.status === 'Checked Out' ? <Text style={styles.successButton}>{checkOutStatus.status}</Text> : checkOutStatus.status === 'Rejected' ? <Text style={styles.rejectButton}>{checkOutStatus.status}</Text> : checkOutStatus.status === 'Pending' ? <Text style={styles.pendingButton}>{checkOutStatus.status}</Text> : ''
                          }*/}

              {
                checkInStatus?.status?.length === 0 || checkInStatus.length === 0 ? <>
                  {
                    checkinLoader ? (<View style={{ flex: 1 }}>
                      <ActivityIndicator size="small" color="#0000ff" /> </View>) : <>
                      {/*<View style={{flexDirection : 'column', alignItems:'center'}}>*/}
                      {fromWork && <>
                        <TouchableOpacity style={[styles.button, buttonColor]} onPress={onPress}>
                          <Text style={[styles.buttonText, styles.btnFontStyle]}>Check In</Text>
                        </TouchableOpacity>
                        <Text style={styles.link} onPress={verifyCheckInMpin}>check in using MPIN</Text>

                      </>}
                      {fromLocation && <>
                        <TouchableOpacity style={[styles.button, buttonColor]} onPress={checkInModal}>
                          <Text style={[styles.buttonText, styles.btnFontStyle]}>Send Check In Request</Text>
                        </TouchableOpacity>
                        {/*<Text style={{ color: '#4154f1' }} onPress={checkInModal}>Mark your attandance from other location</Text>*/}
                      </>}
                      {/*</View>*/}
                    </>
                  }
                </>
                  : ''
              }

              {
                checkOutStatus?.status?.length === 0 && <>
                  {
                    checkoutLoader ? (<View style={{ flex: 1 }}>
                      <ActivityIndicator size="small" color="#0000ff" /> </View>) : <>
                      {/*<View style={{flexDirection : 'column', alignItems:'center'}}>*/}
                      {fromWork && <>
                        <TouchableOpacity style={[styles.button, buttonColor]} onPress={handleManualCheckOut}>
                          <Text style={[styles.buttonText, styles.btnFontStyle]}>Check Out</Text>
                        </TouchableOpacity>
                        <Text style={styles.link} onPress={verifyCheckOutMpin}>check out using MPIN</Text>
                      </>}
                      {fromLocation && <>
                        <TouchableOpacity style={[styles.button, buttonColor]} onPress={showCheckOutModal}>
                          <Text style={[styles.buttonText, styles.btnFontStyle]}>Send Check Out Request</Text>
                        </TouchableOpacity>

                      </>}
                      {/*</View>*/}
                    </>
                  }

                </>
              }

              <Modal isVisible={manualPunch} onBackdropPress={handleBack} onBackButtonPress={handleBack}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalTitleDiv}>
                    <Text style={[styles.modalTitle, styles.fontStyle]}>Select Branch</Text>
                  </View>

                  <View style={{ marginVertical: '7%' }}>
                    {branchError && <Text style={styles.errormsg}>{branchError}</Text>}

                    <SelectList
                      setSelected={(val) => setLocationId(val)}
                      data={locations}
                      save="key"
                      placeholder='Select Branch'
                      fontFamily='Inter_300Light'
                      boxStyles={[styles.selectInput, { borderColor: '#11A13A' }]}
                      inputStyles={{ fontSize: RFPercentage(2), height: verticalScale(20) }}
                      dropdownTextStyles={[styles.dropdownTextStyles, { borderColor: '#11A13A' }]}
                      selected={locationId}
                      dropdownStyles={{ position: 'relative', top: verticalScale(-10), borderColor: '#11A13A' }}
                    />

                  </View>

                  {mpinSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <>
                    <SwipeButton title={manualPunchText} railBackgroundColor="#11A13A" titleColor="white" thumbIconComponent={() => rightSwipeIcon()} thumbIconBackgroundColor="white" railFillBackgroundColor="rgba(0,0,0,0.1)" onSwipeSuccess={handleManualPunch} shouldResetAfterSuccess={true} />
                  </>
                  }
                  {/* <View style={styles.modalbuttons}>
                  {mpinSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <>
                    <TouchableOpacity style={[styles.button, buttonColor]} onPress={handleManualPunch}>
                      <Text style={[styles.modalButtonText, styles.btnFontStyle]}>{manualPunchText}</Text>
                    </TouchableOpacity></>
                  }
                </View> */}
                </View>
              </Modal>

              <Modal isVisible={mpinVisible} onBackdropPress={handleBackDropPress} onBackButtonPress={handleBackDropPress}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalTitleDiv}>
                    <Text style={[styles.modalTitle, styles.fontStyle]}>Enter MPIN</Text>
                  </View>

                  <View style={{ marginVertical: '5%' }}>
                    {mpinError && <Text style={styles.errormsg}>{mpinError}</Text>}

                    <SelectList
                      setSelected={(val) => setLocationId(val)}
                      data={locations}
                      save="key"
                      placeholder='Select Branch'
                      fontFamily='Inter_300Light'
                      boxStyles={[styles.selectInput, { borderColor: '#11A13A' }]}
                      inputStyles={{ fontSize: RFPercentage(2), height: verticalScale(20) }}
                      dropdownTextStyles={[styles.dropdownTextStyles, { borderColor: '#11A13A' }]}
                      selected={locationId}
                      dropdownStyles={{ position: 'relative', top: verticalScale(-10), borderColor: '#11A13A' }}
                    />


                    <OTPInput secureTextEntry={true} length={4} onOtpComplete={(txt: string) => setMpin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />

                  </View>
                  <View style={styles.modalbuttons}>
                    {mpinSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <>
                      <TouchableOpacity style={[styles.button, buttonColor]} onPress={verifyMpin}>
                        <Text style={[styles.modalButtonText, styles.btnFontStyle]}>{mpinSubmitText}</Text>
                      </TouchableOpacity></>
                    }
                  </View>
                </View>
              </Modal>

              <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} onBackButtonPress={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalTitleDiv}>
                    <Text style={[styles.modalTitle, styles.fontStyle]}>{modalTitle}</Text>
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    {modalGlobalError && <Text style={styles.errormsg}>{modalGlobalError}</Text>}
                    <Text style={styles.fontStyle}>Current Location</Text>
                    <TextInput
                      style={[styles.input, styles.fontStyle]}
                      defaultValue={address}
                      readOnly={true}
                    />
                  </View>

                  <View style={{ marginVertical: 10 }}>
                    <Text style={styles.fontStyle}>{locationLabel} <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.fontStyle]}
                      placeholder="Enter Location"
                      onChangeText={newText => setManualLocation(newText)}
                      defaultValue=''
                    />
                    {modalError.manualLocation && <Text style={styles.errormsg}>{modalError.manualLocation}</Text>}
                  </View>

                  <View style={{ marginVertical: 10 }}>
                    <Text style={styles.fontStyle}>Reason <Text style={{ color: 'red' }}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.fontStyle]}
                      placeholder="Enter Reason"
                      onChangeText={newText => setReason(newText)}
                      defaultValue=''
                    />
                    {modalError.reason && <Text style={styles.errormsg}>{modalError.reason}</Text>}
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <Text style={styles.fontStyle}>Remark</Text>
                    <TextInput
                      style={[styles.input, styles.fontStyle]}
                      placeholder="Enter Remark"
                      onChangeText={newText => setRemark(newText)}
                      defaultValue=''
                    />
                  </View>
                  <View style={styles.modalbuttons}>

                    {requestLoader ? (<View style={{ flex: 1 }}> <ActivityIndicator size="small" color="#0000ff" /> </View>) : <>
                      <TouchableOpacity style={[styles.modalButton, buttonColor]} onPress={handleSubmit}>
                        <Text style={[styles.modalButtonText, styles.btnFontStyle]}>Request</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.modalButton, buttonColor]} onPress={cancelRequest}>
                        <Text style={[styles.modalButtonText, styles.btnFontStyle]}>Cancel</Text>
                      </TouchableOpacity>

                    </>}
                  </View>

                </View>
              </Modal>

            </View>

          </>}
        </ScrollView>
      </AlertNotificationRoot>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  link: {
    color: '#11A13A',
    textDecorationLine: 'underline',
    marginVertical: 10
  },
  workStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: scale(150),
    height: verticalScale(50),
    marginHorizontal: 5,
  },
  otherLocation: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: scale(150),
    height: verticalScale(50),
    activeOpacity: 0.7
  },
  dateText: {
    fontSize: RFPercentage(2),
    fontWeight: 'bold'
  },
  text: {
    fontSize: RFPercentage(2),
    color: 'blue',
    fontWeight: '500'
  },

  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    height: verticalScale(50),
    borderRadius: 10,
    width: scale(200)
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    height: verticalScale(50),
    marginTop: verticalScale(4),
    borderRadius: 10,
    width: scale(200)
  },
  buttonText: {
    color: 'white',
    fontSize: RFPercentage(2),
    justifyContent: 'center',
    textAlign: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: RFPercentage(2),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 'auto',
    marginVertical: '5%',
    marginHorizontal: '1%'
  },
  modalbuttons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: RFPercentage(2.5),
    marginHorizontal: 20,
    marginVertical: 20,
    fontWeight: 'bold'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  errormsg: {
    color: 'red',
    marginVertical: 3,
    marginHorizontal: 'auto'
  },
  successButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: 'white',
    margin: 1,
    fontSize: RFPercentage(2),
    textAlign: 'center',

  },
  pendingButton: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: 'white',
    margin: 1,
    fontSize: RFPercentage(2),
    textAlign: 'center',
    width: '32%'
  },
  fontStyle: {
    fontFamily: 'Inter_200ExtraLight',
  },
  btnFontStyle: {
    fontFamily: 'Inter_700Bold'
  },
  rejectButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: 'white',
    margin: 1,
    fontSize: RFPercentage(2),

  },
  scrollView: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: 'auto',
    padding: 20
  },
  modalText: {
    fontSize: RFPercentage(2),
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderColor: '#11A13A',
    marginVertical: 5
  },
  selectInput: {
    borderWidth: 1,
    height: verticalScale(40),
    paddingHorizontal: scale(15),
    borderRadius: 10,
    marginBottom: '5%'
  },
  modalTitle: {
    fontSize: RFPercentage(2.5),

  },
  modalTitleDiv: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginBottom: 15
  },
  mapContainer: {
    width: '95%',
    height: verticalScale(250),
    borderWidth: 3,
    borderColor: "#11A13A",
    marginHorizontal: '2%',
    borderRadius: 5

  },
  map: {
    height: '100%'
  },
  addressStyle: {
    position: 'absolute',
    width: scale(329),
    // marginHorizontal : 10,
    backgroundColor: 'black',
    top: verticalScale(208),
    justifyContent: 'center',
    borderRadius: 5
  },
  inputStyle: {
    borderColor: '#11A13A',
    borderRadius: moderateScale(15),
    height: verticalScale(50),
    width: scale(50)
  },
  otpContainer: {
    gap: scale(10)
  },
  dropdownTextStyles: {
    fontSize: RFPercentage(2),
    backgroundColor: 'white',
    padding: '5%',
    borderWidth: 0.5
  },
  checkStatus: {
    marginVertical: 15,
    marginHorizontal: 20,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  checkCard: {
    backgroundColor: '#DCFBDE',
    padding: moderateScale(10),
    textAlign: 'center',
    borderRadius: 10,
    marginTop: 15,
    width: scale(150),
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 5
  },
  cardLabel: {
    fontWeight: 'bold',
    fontSize: RFValue(20),
    marginHorizontal: 'auto'
  }


});

export default Dashboard;