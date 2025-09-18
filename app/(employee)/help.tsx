import { Text, View, SafeAreaView, ScrollView, StyleSheet, Alert, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Inter_300Light, Inter_200ExtraLight, Inter_700Bold } from '@expo-google-fonts/inter';
import { scale, verticalScale } from 'react-native-size-matters';
import Button from '@/components/Button';
import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectList } from 'react-native-dropdown-select-list';
import { useFocusEffect } from '@react-navigation/native';
import { buttonColor } from '@/components/Button';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';

const Help = () => {
  const [issueId, setIssueId] = useState("");
  const [key, setKey] = useState(0); // Force re-render of SelectList
  const [spinner, setSpinner] = useState(false);
  const [success, setSuccess] = useState('');
  const [reason, setReason] = useState("");
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [issues, setIssues] = useState([]);
  const [formError, setFormError] = useState({});
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const lightColors = {
    success: 'red', // your custom success color
    label: 'red'
  };
  const getToken = async () => {
    let tokenValue = await AsyncStorage.getItem('secure_token');
    setToken(tokenValue);
    getIssues(tokenValue);
  }

  const getIssues = (token) => {
    let header = {
      'headers': {
        'X-Authorization': `Bearer ${token}`
      }
    }
    axios.post(apiUrl + '/appissues/list', [], header)
      .then(res => {
        if (res.data && res.data.success) {
          setIssues(res.data.data.data);
        }
      })
      .catch(err => {
        if (err.response) {
          setError(err.response.data.message);
        }
        else if (err.message) {
          setError(err.message);
        }
      })
  }

  const handleSubmit = () => {
    setSuccess('');
    setFormError({});
    setSpinner(true);
    const getErrors = validateForm();
    if (Object.keys(getErrors).length === 0) {
      const data = {
        'issue_id': issueId,
        'reason': reason
      }
      const config = {
        'headers': {
          'X-Authorization': `Bearer ${token}`
        }
      }
      axios.post(apiUrl + '/appissues/generate', data, config)
        .then(res => {
          if (res.data.success) {
            setSpinner(false);
            setFormError({});
            setKey((prevKey) => prevKey + 1); // Force re-render
            setError('');
            setReason('');
            setIssueId('');
            Dialog.show({
              type: ALERT_TYPE.SUCCESS,
              title: 'Success',
              textBody: res.data.message,
              button: 'close',
            });
            // Alert.alert('Success', res.data.message);
            setSuccess(res.data.message);
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
            // setError(err.response.data.message);
          }
          else if (err.message) {
            Dialog.show({
              type: ALERT_TYPE.DANGER,
              title: 'Error',
              textBody: err.message,
              button: 'close',
            });
            // setError(err.response.message);
          }
        })
    }
    else {
      setSpinner(false);
      setFormError(getErrors);
    }
  }

  const validateForm = () => {

    let validationErrors = {};

    if (!issueId) {
      validationErrors.issueError = 'This field is required.';
    }

    if (!reason) {
      validationErrors.reasonError = 'This field is required.';
    }

    return validationErrors;
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      AsyncStorage.getItem('secure_token')
        .then(value => {
          getIssues(value);
        });
      setSuccess('');
      setError('');
      setFormError({});
      setReason('');
      setRefreshing(false);
    }, 2000);

  }, []);


  useFocusEffect(
    React.useCallback(() => {
      getToken();
      setReason('');
      setSuccess('');
      setError('');
      setFormError({});
    }, [])
  );
  return <>
    <AlertNotificationRoot theme='light'>
      <SafeAreaView style={styles.container}>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.headingView}>
            <Text style={[styles.heading, styles.fontStyle]}>Generate Ticket</Text>
          </View>

          {success && <>
            <View style={{ marginVertical: 4, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.success, styles.fontStyle]}>{success}</Text>
            </View>
          </>}
          {error && <>
            <View style={{ marginVertical: 4, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.error, styles.fontStyle]}>{error}</Text>
            </View>
          </>}

          <View style={{ marginHorizontal: 10 }}>
            <SelectList
              key={key}
              setSelected={(val) => setIssueId(val)}
              data={issues}
              save="key"
              placeholder='Select Issue'
              fontFamily='Inter_300Light'
              boxStyles={styles.input}
              inputStyles={{ fontSize: 16, borderColor: '#11A13A' }}
              dropdownTextStyles={styles.dropdownTextStyles}
              selected={issueId}
              dropdownStyles={{ position: 'relative', top: verticalScale(-25), borderColor: '#11A13A' }}
            />
            {formError.issueError && <Text style={[styles.error, styles.fontStyle]}>{formError.issueError}</Text>}
            <TextInput
              editable
              multiline
              numberOfLines={7}
              // maxLength={40}
              style={[styles.textArea, styles.fontStyle]}
              placeholder={'Elaborate your problem here.'}
              onChangeText={(val) => setReason(val)}
              value={reason}
              scrollEnabled={true}
            />
            {formError.reasonError && <Text style={[styles.error, styles.fontStyle]}>{formError.reasonError}</Text>}
          </View>
          <View style={styles.submitButton}>
            {spinner ? <ActivityIndicator /> : <>
              <TouchableOpacity activeOpacity={0.8} style={[styles.button, buttonColor]} onPress={handleSubmit}>
                <Text style={[{ color: 'white' }, styles.fontStyle]}>Generate Ticket</Text>
              </TouchableOpacity>
            </>}

          </View>

        </ScrollView>
      </SafeAreaView>
    </AlertNotificationRoot >
  </>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    color: 'red',
    marginVertical: 10,
    fontSize: 15
  },
  success: {
    color: 'green',
    marginVertical: 10,
    fontSize: 15
  },
  inputStyles: {
    fontSize: 16
  },
  headingView: {
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal: scale(10)

  },

  dropdownTextStyles: {
    fontSize: 16,
    backgroundColor: '#11A13A',
    padding: 10,
    borderRadius: 15,
    color: 'white'
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#11A13A',
    marginVertical: 20,
    fontSize: 16
  },

  textArea: {
    // height: verticalScale(100),
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginVertical: 20,
    fontSize: 16,
    borderColor: '#11A13A'
  },
  heading: {
    fontSize: 18,
    color: '#11A13A'
  },
  fontStyle: {
    fontFamily: 'Inter_200ExtraLight'
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
  btnFontStyle: {
    fontFamily: 'Inter_700Bold'
  },
});


export default Help;