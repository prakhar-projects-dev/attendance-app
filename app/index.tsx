import { Text, View } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Button from '@/components/Button';

const Index = () => {
    const router = useRouter();
    const onContinue = () => {
        router.navigate('/login');
        // router.navigate('/mpin');
    };
    useFocusEffect(() => {
        router.replace('/login');
    });
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* <Button title="Welcome" onPress={onContinue} /> */}
        </View>
    )
}

export default Index;