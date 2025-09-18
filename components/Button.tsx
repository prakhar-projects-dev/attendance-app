import {StyleSheet, Text, TouchableOpacity} from 'react-native';

const Button = ({title, onPress}) => {
    return (

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.button}
                onPress={onPress}
                >
            <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>

    );
}
export default Button;

export const buttonColor = {
    backgroundColor:"#11A13A"
}


const styles = StyleSheet.create({
    button : {
        backgroundColor:"#11A13A",
        paddingHorizontal : 40,
        paddingVertical : 15,
        borderRadius : 10,
        justifyContent : 'center',
        alignItems : 'center'
        },
        text : {
            fontSize : 16, 
            color : 'white', 
            fontWeight : 'bold'
            }
    })