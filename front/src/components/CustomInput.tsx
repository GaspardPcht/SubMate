import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

interface CustomInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad' | 'phone-pad';
  secureTextEntry?: boolean;
  right?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  style?: any;
  fadeAnim?: Animated.Value;
  slideAnim?: Animated.Value;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  right,
  error = false,
  disabled = false,
  style,
  fadeAnim,
  slideAnim,
}) => {
  const inputContainer = (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        outlineStyle={{
          borderRadius: 10,
          borderWidth: 1,
          backgroundColor: 'white',
        }}
        outlineColor="#e0e0e0"
        activeOutlineColor="#377AF2"
        style={{
          backgroundColor: 'white',
          height: 40,
          ...style,
        }}
        contentStyle={{
          paddingHorizontal: 6,
          fontSize: 14,
        }}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        right={right}
        error={error}
        disabled={disabled}
      />
    </View>
  );

  if (fadeAnim && slideAnim) {
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {inputContainer}
      </Animated.View>
    );
  }

  return inputContainer;
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
});

export default CustomInput; 