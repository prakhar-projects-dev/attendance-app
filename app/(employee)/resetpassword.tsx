import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TextInput, SafeAreaView, StyleSheet, BackHandler, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Inter_300Light, Inter_200ExtraLight, Inter_700Bold } from '@expo-google-fonts/inter';
import OTPInput from "@codsod/react-native-otp-input";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { buttonColor } from '@/components/Button';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';


const Resetpassword = () => {
	const [confirm, setConfirm] = useState('');
	const [key, setKey] = useState(0); // Force re-render of SelectList
	const [old, setOld] = useState('');
	const [newMpin, setNewMpin] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [spinner, setSpinner] = useState(false);
	const [formError, setFormError] = useState({});
	const [success, setSuccess] = useState('');
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const handleSubmit = async () => {
		setSpinner(true);
		resetAllErrors();

		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length === 0) {
			const token = await AsyncStorage.getItem('secure_token');
			if (token) {
				const config = {
					'headers': {
						'X-Authorization': `Bearer ${token}`
					}
				}
				const data = {
					'old': old,
					'newMpin': newMpin
				}

				axios.post(apiUrl + '/mpin/reset', data, config)
					.then(res => {
						setSpinner(false);
						if (res.data && res.data.success) {
							setOld('');
							setNewMpin('');
							setConfirm('');
							Dialog.show({
								type: ALERT_TYPE.SUCCESS,
								title: 'Success',
								textBody: res.data.message,
								button: 'close',
							});
							// Alert.alert('Success', res.data.message);
							setSuccess(res.data.message);
							setKey((prevKey) => prevKey + 1); // Force re-render

						}
					})
					.catch(err => {
						setSpinner(false);
						if (err.response) {
							setError(err.response.data.message);
							Dialog.show({
								type: ALERT_TYPE.DANGER,
								title: 'Error',
								textBody: err.response.data.message,
								button: 'close',
							});
							// Alert.alert('Error', err.response.data.message);
						}
						else if (err.message) {
							setError(err.message);
							Dialog.show({
								type: ALERT_TYPE.DANGER,
								title: 'Error',
								textBody: err.message,
								button: 'close',
							});
							// Alert.alert('Error', err.message);
						}
					})
			}
		}
		else {
			setSpinner(false);
			setFormError(validationErrors);
		}

	}

	const validateForm = () => {
		let validationErrors = {};
		if (!old) {
			validationErrors.old = 'This field is required.';
		}

		if (!newMpin) {
			validationErrors.newMpin = 'This field is required.';
		}
		else if (newMpin.length != 4) {
			validationErrors.newMpin = 'New MPIN must be 4-digit long';
		}

		if (!confirm) {
			validationErrors.confirm = 'This field is required.';
		}
		else if (confirm && newMpin && confirm !== newMpin) {
			validationErrors.confirm = 'Confirm MPIN must be same as New MPIN';
		}

		return validationErrors;
	}
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
			resetAllErrors();
			resetForm();
			setKey((prevKey) => prevKey + 1); // Force re-render

		}, 2000);
	}, []);

	const resetForm = () => {
		setOld('');
		setNewMpin('');
		setConfirm('');
	}

	const resetAllErrors = () => {
		setFormError({});
		setError('');
		setSuccess('');
	}

	useFocusEffect(
		React.useCallback(() => {
			resetForm();
			resetAllErrors();
			setKey((prevKey) => prevKey + 1);
		}, [])
	);

	return <>
		<AlertNotificationRoot theme='light'>
			<SafeAreaProvider>
			<SafeAreaView style={[styles.container]}>
				<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

					<View style={styles.headingView}>
						<Text style={[styles.heading, styles.fontStyle]}>Reset MPIN</Text>
					</View>

					{success && <>
						<View style={styles.successHeading}>
							<Text style={[styles.success, styles.fontStyle]}>{success}</Text>
						</View>
					</>}

					{error && <>
						<View style={styles.errDiv}>
							<Text style={[styles.error, styles.fontStyle, { alignItems: 'center' }]}>{error}</Text>
						</View>
					</>}
					<View style={styles.inputButtons}>
						<View style={{ marginVertical: verticalScale(5) }}>
							<View style={styles.label}>
								<Text style={[styles.fontStyle, { fontSize: RFPercentage(2) }]}>Old MPIN</Text>
							</View>
							<OTPInput secureTextEntry={true} key={key} length={4} onOtpComplete={(txt: string) => setOld(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
							{/*<TextInput maxLength={4} style={[styles.input, styles.fontStyle]} keyboardType="numeric" onChangeText={(text) => setOld(text)} value={old} placeholder="Old MPIN"/>*/}
							{formError.old && <Text style={[styles.error, styles.errHeading, styles.fontStyle]}>{formError.old}</Text>}
						</View>
						<View style={{ marginVertical: verticalScale(5) }}>
							<View style={styles.label}>
								<Text style={[styles.fontStyle, { fontSize: RFPercentage(2) }]}>New MPIN</Text>
							</View>
							<OTPInput secureTextEntry={true} key={key} length={4} onOtpComplete={(txt: string) => setNewMpin(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
							{/*<TextInput maxLength={4} style={[styles.input, styles.fontStyle]} keyboardType="numeric" onChangeText={(text) => setNewMpin(text)} value={newMpin} placeholder="New"/>*/}
							{formError.newMpin && <Text style={[styles.error, styles.errHeading, styles.fontStyle]}>{formError.newMpin}</Text>}
						</View>
						<View style={{ marginVertical: verticalScale(5) }}>
							<View style={styles.label}>
								<Text style={[styles.fontStyle, { fontSize: RFPercentage(2) }]}>Confirm MPIN</Text>
							</View>
							<OTPInput secureTextEntry={true} key={key} length={4} onOtpComplete={(txt: string) => setConfirm(txt)} style={styles.otpContainer} inputStyle={styles.inputStyle} />
							{/*<TextInput maxLength={4} style={[styles.input, styles.fontStyle]} keyboardType="numeric" onChangeText={(text) => setConfirm(text)} value={confirm} placeholder="Confirm"/>*/}
							{formError.confirm && <Text style={[styles.error, styles.errHeading, styles.fontStyle]}>{formError.confirm}</Text>}
						</View>
					</View>
					<View style={styles.submitButton}>
						{spinner ? <ActivityIndicator /> : <>
							<TouchableOpacity activeOpacity={0.8} style={[styles.button, buttonColor]} onPress={handleSubmit}>
								<Text style={[{ color: 'white' }, styles.fontStyle]}>Reset Password</Text>
							</TouchableOpacity>
						</>
						}

					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	</AlertNotificationRoot >
	</>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	errHeading: {
		marginHorizontal: 10,
		marginVertical: verticalScale(10)
	},
	errDiv: {
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: verticalScale(10),
	},
	error: {
		color: 'red',
		fontSize: RFPercentage(2)
	},
	inputButtons: {
		marginVertical: verticalScale(10),
		marginHorizontal: 40
	},
	input: {
		height: verticalScale(40),
		margin: 12,
		borderWidth: 1,
		padding: 10,
		borderRadius: 10
	},
	successHeading: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	success: {
		color: 'green',
		fontSize: RFPercentage(2)
	},
	headingView: {
		marginVertical: 10,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		padding: 10,
		marginHorizontal: scale(10)

	},
	heading: {
		fontSize: 18,
		color: '#11A13A'
	},
	fontStyle: {
		fontFamily: 'Inter_200ExtraLight'
	},
	horizontal: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 10,
	},
	button: {
		backgroundColor: "red",
		paddingVertical: 15,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		width: scale(150)
	},
	submitButton: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	inputStyle: {
		borderRadius: moderateScale(15),
		height: verticalScale(50),
		width: scale(50),
		borderColor: '#11A13A'
	},
	otpContainer: {
		gap: scale(10)
	},
	label: {
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 10
	},
	btnFontStyle: {
		fontFamily: 'Inter_700Bold'
	},
});

export default Resetpassword;