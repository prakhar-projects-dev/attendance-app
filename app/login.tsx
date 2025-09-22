import Button, { buttonColor } from '@/components/Button';
import OTPInput from "@codsod/react-native-otp-input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'expo-modules-core';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Login = () => {
    const router = useRouter();
    const [spinner, setSpinner] = useState(false);
    const [empCode, setEmpCode] = useState('');
    const [disabled, setDisabled] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [tokenState, setTokenState] = useState(null);
    const [nameState, setNameState] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [mpinVisible, setMpinVisible] = useState(false);
    const [locationId, setLocationId] = useState("");
    const [mpinError, setMpinError] = useState('');
    const [mpin, setMpin] = useState('');
    const [mpinSpinner, setMpinSpinner] = useState(false);
    const [mpinSubmitText, setMpinSubmitText] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [credentialLogin, setCredentialLogin] = useState(true);
    const [createMpinForm, setCreateMpinForm] = useState(true);
    const [loginButtonText, setLoginButtonText] = useState('Login');
    // const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const apiUrl = Constants.expoConfig.extra.EXPO_PUBLIC_API_URL;
    const scrollViewRef = useRef(null);
    const inputRef = useRef(null); // Ref for the TextInput
    const setToken = async (token) => {
        await AsyncStorage.setItem('secure_token', token);
    };
    const setName = async (name) => {
        await AsyncStorage.setItem('username', name);
    };

    const handleBackDropPress = () => {
        setMpin('');
        setMpinVisible(false);
        setMpinError('');
        setLocationId('');
    }

    const setCode = async (code) => {
        await AsyncStorage.setItem('emp_code', code);
    }

    const getToken = async () => {
        try {
            const value = await AsyncStorage.getItem('secure_token');
            setTokenState(value);
        }
        catch (error) {
            setTokenState('');
        }

    };

    const getDeviceId = async () => {
        if (Platform.OS === 'android') {
            setDeviceId(Application.getAndroidId());
        } else {
            let deviceid = await SecureStore.getItemAsync('deviceId');

            if (!deviceid) {
                deviceid = Constants.deviceId; //or generate uuid
                await SecureStore.setItemAsync('deviceId', deviceid);
            }
            setDeviceId(deviceid);
        }

    }

    // Submit using emp code and password.
    const onSubmit = () => {
        setErrors({});

        // Validate form and get errors
        const validationErrors = validateForm();
        setSpinner(true);
        if (Object.keys(validationErrors).length === 0) {
            setDisabled('disabled');

            const data = {
                'emp_code': empCode,
                'password': password,
                device_id: deviceId
            };
            
            axios.post('/login', data)
                .then(res => {
                    if (res.data) {
                        if (res.data.data.emp_code) {
                            router.push({
                                pathname: "/mpin",
                                params: {
                                    empCode: res.data.data.emp_code,
                                    deviceid: deviceId
                                },
                            });
                        }
                        else if (res.data.data.token) {
                            setToken(res.data.data.token);
                            setName(res.data.data.name);
                            router.navigate('/(employee)/dashboard');
                        }
                    }
                })
                .catch(err => {
                    setSpinner(false);

                    if (err.response) {
                        const error = err.response.data;
                        Dialog.show({
                            type: ALERT_TYPE.DANGER,
                            title: error.message,
                            textBody: apiUrl+" "+data,
                            button: 'close',
                        });
                        // Alert.alert(error.message, 'Please check your credentials.');
                        setErrors({
                            'globalError': error.message
                        });
                    }
                    else if (err.message) {
                        Dialog.show({
                            type: ALERT_TYPE.DANGER,
                            title: err.message,
                            textBody: apiUrl+" "+data.emp_code+" "+data.password,
                            button: 'close',
                        });
                        setErrors({
                            'globalError': err.message
                        });
                    }

                });

        } else {
            setSpinner(false);
            setErrors(validationErrors);
        }

    }
    const validateForm = () => {
        let validationErrors = {};

        // Validate empCode field
        if (!empCode) {
            validationErrors.empCode = 'Emp Code is required.';
        }

        // Validate password field
        if (!password) {
            validationErrors.password = 'Password is required.';
        } else if (password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters.';
        }

        // Set the errors and update form validity
        return validationErrors;
    };

    const LoginUsingMpin = () => {

        if (mpin == '' || mpin.length < 4) {
            Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Invalid MPIN',
                textBody: 'Please enter 4-digit MPIN',
                button: 'close',
            });
            // Alert.alert('Invalid MPIN', 'Please enter 4-digit MPIN');
            return '';
        }
        setMpinSpinner(true);
        const data = {
            mpin: mpin,
            device_id: deviceId
        }
        axios.post(apiUrl + '/login_using_mpin', data)
            .then(res => {
                if (res.data && res.data.data.token) {
                    setMpinSpinner(false);
                    setToken(res.data.data.token);
                    setName(res.data.data.name);
                    router.navigate('/(employee)/dashboard');
                }
            })
            .catch(err => {
                setMpinSpinner(false);
                if (err.response) {
                    const error = err.response.data;
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: error.message,
                        textBody: 'Please check your mpin.',
                        button: 'close',
                    });
                    // Alert.alert(error.message, 'Please check your mpin.');

                }
                else if (err.message) {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'error',
                        textBody: err.message,
                        button: 'close',
                    });
                    // Alert.alert(err.message);
                }

            });
    }

    const handleMpinForm = () => {
        setMpinVisible(false);
        setCredentialLogin(true);
        setLoginButtonText('Create mPIN');
        setErrors('');
    }
    const useMpinForm = () => {
        setMpinVisible(true);
        setCredentialLogin(false);
        setLoginButtonText('Login');
        setErrors('');
    }

    const useCredentialForm = () => {
        setMpinVisible(false);
        setCredentialLogin(true);
        setLoginButtonText('Login');
        setErrors('');
    }

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        getDeviceId();
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const keyboardListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                }, 100); // Wait a bit to let layout settle
            }
        );

        return () => {
            keyboardListener.remove();
        };
    }, []);

    return (
        <SafeAreaView>
            <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef} >

                <View style={{
                    flex: 1
                }}>
                    <View style={{ flex: 1, marginLeft: scale(5), marginVertical: verticalScale(8) }}>
                        <Image source={require("@/assets/images/prakhar-logo.png")}
                            style={styles.logoStyle}
                        />
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.heading}>e-Attendance</Text>
                        <Text style={styles.paragraph}>An Easy Way To Record & Track Attendance</Text>
                        <Image source={require("@/assets/images/login-image.png")}
                            style={{
                                width: scale(300),
                                height: verticalScale(257)
                            }}
                            resizeMode="contain"
                        />
                        <Text style={{ fontSize: RFValue(19), fontWeight: 'bold' }}>Sign In. Stay Accounted!</Text>
                    </View>


                    {/* Employee code form */}
                    {credentialLogin && <>
                        <View style={{
                            padding: moderateScale(15),
                            gap: 20
                        }}>
                            {/* {errors.globalError && <Text style={styles.error}>{errors.globalError}</Text>} */}
                            <TextInput placeholder="Enter Your employee code" style={{ borderWidth: 1, height: 50, paddingHorizontal: 20, borderRadius: 10 }} value={empCode} name="emp_code" onChangeText={setEmpCode} />
                            {errors.empCode && <Text style={styles.error}>{errors.empCode}</Text>}

                            <TextInput secureTextEntry={true} placeholder="Enter Your password" style={{ borderWidth: 1, height: 50, paddingHorizontal: 20, borderRadius: 10 }} value={password} name="emp_code" onChangeText={setPassword} />
                            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

                            {
                                spinner ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title={loginButtonText} onPress={onSubmit} disabled={disabled} />
                            }
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={() => useMpinForm()}>Or, Login with mPIN</Text>
                            </View>

                        </View>
                    </>}
                    {mpinVisible && <>

                        <View style={{ alignItems: 'center', marginTop: 25 }} >
                            <Text style={{ fontSize: RFValue(15), fontWeight: 'bold' }}>Enter your mPIN</Text>

                            <View style={{ marginBottom: verticalScale(12) }}>
                                {mpinError && <Text style={styles.errormsg}>{mpinError}</Text>}
                                <OTPInput secureTextEntry={true} length={4} onOtpComplete={(txt: string) => setMpin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} onOtpRemove={(txt: string) => setMpin(txt)} />

                            </View>

                            <View style={styles.modalbuttons}>
                                {mpinSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <>
                                    <TouchableOpacity style={[styles.button, buttonColor]} onPress={LoginUsingMpin}>
                                        <Text style={[styles.modalButtonText, styles.btnFontStyle]}>{loginButtonText}</Text>
                                    </TouchableOpacity></>
                                }
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: verticalScale(10), marginHorizontal: '15' }}>
                            <View>
                                <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={() => useCredentialForm()}>HRMS Login</Text>
                            </View>
                            <View>
                                <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }} onPress={handleMpinForm}>Create mPIN</Text>
                            </View>
                        </View>
                    </>}


                </View>



                {/* Mpin Modal */}
                {/* <Modal isVisible={mpinVisible} onBackdropPress={handleBackDropPress} onBackButtonPress={handleBackDropPress}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalTitleDiv}>
                            <Text style={[styles.modalTitle, styles.fontStyle]}>Enter MPIN</Text>
                        </View>

                        <View style={{ marginVertical: '5%' }}>
                            {mpinError && <Text style={styles.errormsg}>{mpinError}</Text>}

                            <OTPInput secureTextEntry={true} length={4} onOtpComplete={(txt: string) => setMpin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} onOtpRemove={(txt: string) => setMpin(txt)} />

                        </View>

                        <View style={styles.modalbuttons}>
                            {mpinSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <>
                                <TouchableOpacity style={[styles.button, buttonColor]} onPress={LoginUsingMpin}>
                                    <Text style={[styles.modalButtonText, styles.btnFontStyle]}>Login</Text>
                                </TouchableOpacity></>
                            }
                        </View>
                    </View>
                </Modal> */}
            </ScrollView>
            <AlertNotificationRoot
                theme="light"
            />
        </SafeAreaView>
    )
}

// Styles for the components
const styles = StyleSheet.create({
    error: {
        color: 'red',
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
    logoStyle: {
        width: scale(190),
        height: verticalScale(80),
        resizeMode: 'contain',
    },
    heading: {
        color: '#11A13A',
        fontWeight: 'bold',
        fontSize: RFValue(25),

    },
    paragraph: {
        fontWeight: 'bold',
        fontSize: RFValue(13),
    },
    inputStyle: {
        borderColor: 'black',
        borderRadius: moderateScale(15),
        height: verticalScale(50),
        width: scale(50),
        marginTop: 30
    },
    otpContainer: {
        gap: scale(10)
    },
    modalTitle: {
        fontSize: RFPercentage(2.5),

    },
    modalTitleDiv: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginBottom: 15
    },
    modalButtonText: {
        color: 'white',
        fontSize: RFPercentage(2.2),
        textAlign: 'center',
    },
    fontStyle: {
        fontFamily: 'Inter_200ExtraLight',
    },
    btnFontStyle: {
        fontFamily: 'Inter_700Bold'
    },
    modalbuttons: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errormsg: {
        color: 'red',
        marginVertical: 3,
        marginHorizontal: 'auto'
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: verticalScale(50),
        borderRadius: 10,
        width: scale(200)
    },
    modalContainer: {
        backgroundColor: 'white',
        height: 'auto',
        padding: 20
    },
});

export default Login;