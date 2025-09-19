import { buttonColor } from '@/components/Button';
import OTPInput from "@codsod/react-native-otp-input";
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Sendemail = () => {

	const router = useRouter();
	const [spinner, setSpinner] = useState(false);
	const [resendSpinner, setResendSpinner] = useState(false);
	const insets = useSafeAreaInsets();
	const { otpid } = useLocalSearchParams();
	const [otp, setOTP] = useState("");
	const [otpId, setOtpId] = useState('');
	const [error, setError] = useState('');
	const [resend, setResend] = useState(false);
	const [timer, setTimer] = useState(56);
	const [success, setSuccess] = useState('');
	const [deviceId, setDeviceId] = useState(''); // Only for android.
	const [empCode, setEmpCode] = useState('');
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;
	const setToken = async (token) => {
		await AsyncStorage.setItem('secure_token', token);
	};
	const setName = async (name) => {
		await AsyncStorage.setItem('username', name);
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

	const sendOtp = async () => {
		setResendSpinner(true);
		const empcode = await AsyncStorage.getItem('emp_code');
		const values = {
			'emp_code': empcode,
			'disable': otpId
		}
		axios.post(apiUrl + '/otp/send', values)
			.then(res => {
				if (res.data.success) {
					setResendSpinner(false);
					setOtpId(res.data.data.otpid);
					setResend(false);
					setError('');
					setSuccess('OTP resend successfully.');
				}
			})
			.catch(err => {
				setError(err.message);
			})
	}


	const validateOtp = async () => {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== 'granted') {
			await Notifications.requestPermissionsAsync();
		}
		const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
		const pushTokenString = (
			await Notifications.getExpoPushTokenAsync({
				projectId,
			})
		).data;

		setSpinner(true);
		setError('');
		const data = {
			'otp': otp,
			'otpid': otpId,
			'deviceid': deviceId,
			'token': 'not able to generate'
		}
		axios.post(apiUrl + '/otp/verify', data)
			.then(res => {
				setSpinner(false);
				if (res.data) {
					if (res.data.data.emp_code) {
						setEmpCode(res.data.data.emp_code);
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
					Alert.alert(error.message, error.message);
					setError(error.message);
				}
				else if (err.message) {
					Alert.alert(err.message);
					setError(err.message);
				}
			})
	}

	useEffect(() => {
		let intervalId; // Declare interval ID outside for cleanup
		if (otpid) {
			if (!otpId) {
				setOtpId(otpid);
			}
			let counter = 56;
			intervalId = setInterval(() => {
				counter -= 1;
				setTimer(counter);
				if (counter <= 0) {
					clearInterval(intervalId); // Stop timer when counter reaches 0
					setResend(true);
				}
			}, 1000);
		}
		else {
			router.navigate('login');
		}
		getDeviceId();
		return () => {
			clearInterval(intervalId); // Cleanup interval on component unmount
		};

	}, [otpId]);

	return <>
		<View
			style={{
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				flex: 1,
				justifyContent: 'space-between',
			}}
		>
			<View style={styles.head}>
				<Link href="/login"><AntDesign name="arrowleft" style={styles.backButton} color="black" /></Link>
				<Text style={[styles.headTitle, styles.fontStyle]}>Enter OTP Code</Text>
			</View>
			<View style={styles.body}>
				{success && <Text style={[styles.success, styles.fontStyle]}>{success}</Text>}
				{error && <Text style={[styles.error, styles.fontStyle]}>{error}</Text>}
				<Text style={[styles.otpSendText, styles.fontStyle]}>Code has been sent to your registered mail.</Text>
				<OTPInput length={4} onOtpComplete={(txt: string) => setOTP(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
				{resend ? resendSpinner ? <ActivityIndicator size="small" color="#0000ff" /> : <TouchableOpacity style={[styles.resendButton, buttonColor]} onPress={sendOtp}><Text style={[{ color: 'white' }, styles.fontStyle]}>Resend</Text></TouchableOpacity> : <Text style={[styles.otpSendText, styles.fontStyle]}>Resend Code in <Text style={styles.counterText}>{timer}</Text> s</Text>}
			</View>
			<View style={styles.footer}>
				{spinner ? <ActivityIndicator size="small" color="#0000ff" /> : <Button title="Verify" color="#11A13A" onPress={validateOtp} />}

			</View>
		</View>
	</>
}

const styles = StyleSheet.create({
	container: {},
	success: {
		color: '#00A884'
	},
	resendButton: {
		padding: 10,
		borderRadius: 10,
		backgroundColor: 'orange',
		borderColor: 'black',
		color: 'white'
	},
	error: {
		color: 'red'
	},
	head: {
		flexDirection: 'row',
		gap: scale(10),
		alignItems: 'left',
		padding: moderateScale(20)

	},
	backButton: {
		fontSize: moderateScale(24),
		color: 'black',
		fontWeight: 'bold'
	},
	headTitle: {
		fontSize: moderateScale(20),
		color: 'black',
		fontWeight: 'bold'
	},

	body: {
		alignItems: 'center',
		gap: verticalScale(25)
	},
	counterText: {
		color: '#00A884',
	},
	otpSendText: {
		fontSize: moderateScale(16),
		fontWeight: '400'
	},
	inputStyle: {
		borderColor: 'black',
		borderRadius: moderateScale(15),
		height: verticalScale(50),
		width: scale(50)
	},
	otpContainer: {
		gap: scale(10)
	},

	footer: {
		borderRadius: moderateScale(10),
		padding: moderateScale(10),
	},

	fontStyle: {
		fontFamily: 'Inter_200ExtraLight'
	}

})
export default Sendemail;