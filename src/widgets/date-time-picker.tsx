import RNDateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';
import {Icons} from 'assets';
import moment from 'moment';
import React, {ReactElement, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from 'utils/colors';
import {Text} from './text';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type Props = PartialBy<IOSNativeProps | AndroidNativeProps, 'value'> & {
  placeholder?: string;
  datePickerButton?: ViewStyle,
  datePickerButtonText?: TextStyle;
};

const styles = StyleSheet.create({
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray,
    height: 36,
    flex: 1,
  },

  datePickerButtonText: {
    textAlign: 'center',
  },

  dateDropDownIcon: {
    height: 18,
    position: 'absolute',
    right: 8,
    width: 18,
  },

  modalScrim: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    width: Dimensions.get('window').width * 0.9,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  modalCloseButtonText: {
    color: Colors.blue2,
    textAlign: 'right',
    fontSize: 16,
  },

  modalCloseButton: {
    marginBottom: 20,
    width: '90%',
  },
});

export const DateTimePicker = ({
  onChange,
  value,
  placeholder = 'Seleccione la fecha',
  datePickerButton,
  datePickerButtonText,
  ...rest
}: Props): ReactElement => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={{...styles.datePickerButton, ...datePickerButton}}
        onPress={(): void => {
          setVisible(true);
        }}>
        <Text style={{...styles.datePickerButtonText, ...datePickerButtonText}}>
          {value ? moment(value).format('D [de] MMMM') : placeholder}
        </Text>
        <Image source={Icons.dropDown} style={styles.dateDropDownIcon} />
      </TouchableOpacity>

      {((): ReactElement => {
        if (Platform.OS === 'android') {
          return visible ? (
            <RNDateTimePicker
              onChange={(event, newDate): void => {
                setVisible(false);
                onChange?.(event, newDate);
              }}
              value={value || new Date()}
              {...rest}
            />
          ) : (
            <></>
          );
        }

        // No funcional en iOS aún.
        return (
          <Modal animationType="slide" transparent visible={visible}>
            <View style={styles.modalScrim}>
              <View style={styles.modalContent}>
                <RNDateTimePicker
                  onChange={onChange}
                  value={value || new Date()}
                  {...rest}
                />
                <TouchableOpacity>
                  <View style={styles.modalCloseButton}>
                    <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
      })()}
    </>
  );
};
