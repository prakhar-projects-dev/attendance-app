import OTPInput from "@codsod/react-native-otp-input";
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const Mpin = () => {
	const router = useRouter();
	const { empCode, deviceid } = useLocalSearchParams();
	const insets = useSafeAreaInsets();
	const [error, setError] = useState('');
	const [title, setTitle] = useState('Verify');
	const [spinner, setSpinner] = useState(false);
	const [enableCreate, setEnableCreate] = useState(true);
	const [enableConfirm, setEnableConfirm] = useState(false);
	const [pinText, setPinText] = useState('Create a 4-digit MPIN');
	const [heading, setHeading] = useState('Set New MPIN');
	const [createPin, setCreatePin] = useState('');
	const [confirmPin, setConfirmPin] = useState('');
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const setToken = async (token) => {
		await AsyncStorage.setItem('secure_token', token);
	};
	const setName = async (name) => {
		await AsyncStorage.setItem('username', name);
	};

	const verify = () => {
		if (createPin.length === 4) {
			setTitle('Confirm');
			setEnableConfirm(true);
			setEnableCreate(false);
			setPinText('Confirm your 4-digit MPIN');
			setHeading('Confirm');
		}
		else {
			setError('MPIN must be of 4 digit');
		}

	}

	const confirm = async () => {
		// const { status: existingStatus } = await Notifications.getPermissionsAsync();
		// let finalStatus = existingStatus;
		// if (existingStatus !== 'granted') {
		// 	await Notifications.requestPermissionsAsync();
		// }
		// const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
		// const pushTokenString = (
		// 	await Notifications.getExpoPushTokenAsync({
		// 		projectId,
		// 	})
		// ).data;

		setSpinner(true);
		setError('');
		if (createPin === confirmPin) {
			const data = {
				'emp_code': empCode,
				'mpin': confirmPin,
				'deviceid': deviceid,
				'token': 'not able to generate'
			}
			axios.post(apiUrl + '/mpin/create', data)
				.then(res => {
					if (res.data && res.data.success) {
						setToken(res.data.data.token);
						setName(res.data.data.name);
						router.navigate('/(employee)/dashboard');
					}

				})
				.catch(err => {
					setSpinner(false);
					if (err.response) {
						setError(err.response.data.message);
						Alert.alert('Error', err.response.data.message);
					}
					else if (err.message) {
						setError(err.message);
						Alert.alert('Error', err.message);
					}
				})
		}
		else {
			setSpinner(false);
			setError('Confirm MPIN must me same as Create MPIN');
		}

	}

	useEffect(() => {
		if (!empCode) {
			router.navigate('login');
		}
	}, [empCode]);

	return <>
		<View style={{
			paddingTop: insets.top,
			paddingBottom: insets.bottom,
			flex: 1,
			justifyContent: 'space-between',
		}}
		>
			<View style={styles.head}>
				<Link href="/login"><AntDesign name="arrowleft" style={styles.backButton} color="black" /></Link>
				<Text style={[styles.headTitle, styles.fontStyle]}>{heading}</Text>
			</View>
			<View style={styles.body}>
				{error && <Text style={[styles.error, styles.fontStyle]}>{error}</Text>}
				<Text style={[styles.otpSendText, styles.fontStyle]}>{pinText}</Text>

				{enableCreate && <>
					<OTPInput length={4} onOtpComplete={(txt: string) => setCreatePin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
				</>}

				{enableConfirm && <>
					<OTPInput length={4} onOtpComplete={(txt: string) => setConfirmPin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
				</>
				}
			</View>
			<View style={styles.footer}>
				{enableCreate && <Button title={title} color="#11A13A" onPress={verify} />}
				{spinner ? <ActivityIndicator size="small" color="#0000ff" /> : enableConfirm ? <Button title={title} color="#11A13A" onPress={confirm} /> : ''}

			</View>
		</View>
	</>
}

const styles = StyleSheet.create({
	container: {},
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
	}

})
export default Mpin;