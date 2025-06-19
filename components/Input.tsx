import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
type Variant = 'default' | 'search' | 'password' | 'mail';
interface InputProps {
    placeholder: string;
    variant?: Variant;
    value: string;
    onChange?: (text: string) => void;
    style?: any;
}
export const Input = ({
    variant = 'default',
    value,
    placeholder,
    onChange,
    style,
}: InputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = variant === 'password';
    const isSearch = variant === 'search';
    return (
        <View style={[styles.container, style]}>
            <TextInput
                style={styles.text}
                placeholder={placeholder}
                placeholderTextColor={Colors.dark.text}
                secureTextEntry={isPassword && !isPasswordVisible}
                onChangeText={onChange}
                value={value}
            />
            {isSearch && (
                <Image source={require('@/assets/images/icon-search.png')} style={styles.icon} />
            )}
            {isPassword && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(prev => !prev)} style={styles.iconContainer}>
                    <Image
                        source={require('@/assets/images/icon-eye.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 350,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: Colors.dark.text,
        paddingHorizontal: 5,
        display: 'flex',
        flexDirection: 'row',
    },
    text: {
        fontSize: 15,
        textAlign: 'left',
        color: Colors.dark.text,
        flex: 1,
        paddingBottom: 2,
    },
    iconContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: 22,
        height: 22,
        objectFit: 'cover',
    }
});
