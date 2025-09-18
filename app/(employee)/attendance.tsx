import { Text, View, FlatList, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { buttonColor } from '@/components/Button';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
const Attendance = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const [allAttendance, setAllAttendance] = useState([]);
    const [month, setMonth] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const getAttendance = async () => {
        const token = await AsyncStorage.getItem('secure_token');
        const config = {
            'headers': {
                'X-Authorization': `Bearer ${token}`
            }
        }
        axios.post(apiUrl + '/current_month_attendance', {}, config)
            .then(res => {
                if (res.data) {
                    setIsLoading(false);
                    setAllAttendance(res.data.data.attendance);
                    setMonth(res.data.data.month);
                }
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    Alert.alert(err.response.data.message);
                }
            });
    }


    const Item = ({ inTime, OutTime, date }) =>
    (
        <View style={styles.item}>
            <View style={styles.dateBox}>
                <Text style={styles.dateTitle}>{new Date(date * 1000).toLocaleDateString('en-US', { day: "2-digit" })}</Text>
                <Text style={styles.dateTitle}>{new Date(date * 1000).toLocaleDateString('en-US', { weekday: "short" })}</Text>
            </View>
            <View style={styles.punchBox}>
                <Text style={styles.title}>Punch In</Text>
                <Text>{new Date(inTime * 1000).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
            </View>
            <View style={styles.punchBox}>
                <Text style={styles.title}>Punch Out</Text>
                <Text>{OutTime ? new Date(OutTime * 1000).toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</Text>
            </View>

        </View>
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            getAttendance();
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        getAttendance();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            getAttendance();
        }, [])
    );
    return <>
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView>
                {isLoading ? <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: verticalScale(100) }}><ActivityIndicator size="large" color="#0000ff" /> </View> : <>
                    <FlatList
                        data={allAttendance}
                        renderItem={({ item }) => <Item inTime={item.check_in} OutTime={item.check_out} date={item.date} />}
                        keyExtractor={item => item.id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListHeaderComponent={
                            <View style={{ marginVertical: verticalScale(9), alignItems: 'center' }}>
                                <Text style={{ fontWeight: 'bold', color: '#11A13A', fontSize: RFValue(20) }}>
                                    My Attendance!
                                </Text>

                                <View style={[buttonColor, { borderRadius: 20, paddingHorizontal: 40, padding: moderateScale(15), alignItems:'center', marginTop: 20 }]}>
                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: RFValue(20) }}>
                                        {month}
                                    </Text>
                                </View> 
                            </View>
                        }
                    />

                    {allAttendance.length === 0 && <>
                    
                    <View style={{ alignItems: 'center', marginVertical:verticalScale(20) }} >
                        <Text style={{color : 'red', fontSize: RFValue(15)}}>No attendance records found for this month.</Text>
                    </View>
                    </>}

                </>}
            </SafeAreaView >
        </SafeAreaProvider>
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: verticalScale(5)
    },
    fontStyle: {
        fontFamily: 'Inter_200ExtraLight'
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'lightgrey',
        padding: moderateScale(20),
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10
    },
    dateTitle: {
        fontSize: RFPercentage(2),
        fontWeight: 'bold',
    },
    title: {
        fontSize: RFPercentage(2),
        fontWeight: 'bold',
        marginBottom: 10
    },
    dateBox: {
        backgroundColor: 'white',
        flexDirection: 'column',
        alignItems: 'center',
        padding: moderateScale(20),
        borderRadius: 10,
        width: scale(80)
    },
    punchBox: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: moderateScale(20)
    }
})

export default Attendance;