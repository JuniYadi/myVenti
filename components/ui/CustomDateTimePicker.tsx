import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

// Safely import DateTimePicker with fallback
let DateTimePicker: any = null;
let DateTimePickerEvent: any = null;

try {
  const dateTimePickerModule = require('@react-native-community/datetimepicker');
  DateTimePicker = dateTimePickerModule.default;
  DateTimePickerEvent = dateTimePickerModule.DateTimePickerEvent;
} catch (error) {
  console.warn('DateTimePicker native module not available:', error);
}

interface CustomDateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'compact' | 'inline';
  onChange?: (event: any, selectedDate?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  style?: any;
}

export interface CustomDateTimePickerRef {
  show: () => void;
  hide: () => void;
}

const CustomDateTimePicker = forwardRef<CustomDateTimePickerRef, CustomDateTimePickerProps>(
  (
    {
      value,
      mode = 'date',
      display = 'default',
      onChange,
      minimumDate,
      maximumDate,
      disabled = false,
      placeholder = 'Select date',
      style,
    },
    ref
  ) => {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(value);
    const [isNativeModuleAvailable, setIsNativeModuleAvailable] = useState(!!DateTimePicker);

    useImperativeHandle(ref, () => ({
      show: () => setShow(true),
      hide: () => setShow(false),
    }));

    const handleShowPicker = () => {
      if (!isNativeModuleAvailable) {
        Alert.alert(
          'Date Picker Not Available',
          'The date picker is currently unavailable. Please try restarting the app.',
          [{ text: 'OK' }]
        );
        return;
      }
      setShow(true);
    };

    const handleChange = (event: any, selectedDate?: Date) => {
      setShow(false);

      if (event.type === 'dismissed') {
        return;
      }

      if (selectedDate) {
        setDate(selectedDate);
        if (onChange) {
          onChange(event, selectedDate);
        }
      }
    };

    const handleError = (error: any) => {
      console.error('DateTimePicker error:', error);
      setIsNativeModuleAvailable(false);
      Alert.alert(
        'Date Picker Error',
        'Unable to open date picker. Please restart the app.',
        [{ text: 'OK' }]
      );
    };

    // For web platform, use native HTML date input
    if (Platform.OS === 'web') {
      return (
        <View style={style}>
          <input
            type={mode === 'time' ? 'time' : 'date'}
            value={date.toISOString().split('T')[0]}
            min={minimumDate?.toISOString().split('T')[0]}
            max={maximumDate?.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                setDate(newDate);
                if (onChange) {
                  onChange({ type: 'set' } as DateTimePickerEvent, newDate);
                }
              }
            }}
            disabled={disabled}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              fontSize: 16,
            }}
          />
        </View>
      );
    }

    // For native platforms
    if (show && isNativeModuleAvailable && DateTimePicker) {
      try {
        return (
          <DateTimePicker
            value={date}
            mode={mode}
            display={display}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onError={handleError}
            style={style}
          />
        );
      } catch (error) {
        handleError(error);
      }
    }

    // Fallback UI when picker is not shown or unavailable
    return (
      <TouchableOpacity
        onPress={handleShowPicker}
        disabled={disabled}
        style={[
          {
            padding: 15,
            borderWidth: 1,
            borderColor: isNativeModuleAvailable ? '#ddd' : '#ff6b6b',
            borderRadius: 8,
            backgroundColor: disabled ? '#f5f5f5' : '#fff',
          },
          style,
        ]}
      >
        <Text style={{ fontSize: 16, color: isNativeModuleAvailable ? '#333' : '#ff6b6b' }}>
          {isNativeModuleAvailable
            ? date.toLocaleDateString()
            : 'Date Picker Unavailable'
          }
        </Text>
      </TouchableOpacity>
    );
  }
);

CustomDateTimePicker.displayName = 'CustomDateTimePicker';

export default CustomDateTimePicker;