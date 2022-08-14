import {Icons} from 'assets';
import React, {ReactElement, ReactNode, useCallback, useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  LayoutChangeEvent,
  Picker as RNPicker,
  PickerProps as RNPickerProps,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  PickerItemProps,
} from 'react-native';
import Colors from 'utils/colors';
import ModalContainerIOS from 'widgets/modal-container-ios';
import {Text, TextStyle} from './text';

const defaultStyles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginBottom: Platform.OS == 'ios' ? 50 : undefined,
  },
  textContainer: {
    backgroundColor: Colors.gray,
    flexDirection: 'row',
    width: '100%',
    padding: 12,
    paddingTop:11,
    position: 'absolute',
  },
  picker: {
    opacity: 0,
  },
  text: {
    color: 'black',
    flex: 1,
    fontSize: 12,
  },
  icon: {
    width: 18,
    height: 18,
    padding: 6,
  },
});

interface PickerProps extends RNPickerProps {
  children: ReactElement<PickerItemProps>[];
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  textContainerStyle?: StyleProp<ViewStyle>;
  displayValue?: string;
  icon?: ImageSourcePropType;
  iconStyle?: StyleProp<ImageStyle>;
}

export const Picker = ({
  containerStyle,
  textContainerStyle,
  displayValue,
  textStyle,
  icon,
  iconStyle,
  ...rest
}: PickerProps): ReactElement => {
  const [height, setHeight] = useState(0);
  const [visible, setVisible] = useState(false);
  const doSetHeight = useCallback((event: LayoutChangeEvent): void => {
    setHeight(event.nativeEvent.layout.height);
  }, []);

  const success = useCallback((): void => {
    setVisible(false);
  }, []);

  return (
    <View style={[defaultStyles.container, containerStyle]}>
      <TouchableWithoutFeedback
        onPress={(): void => {
          if (Platform.OS == 'ios') {
            setVisible(true);
          }
        }}>
        <View
          style={[defaultStyles.textContainer, textContainerStyle]}
          onLayout={doSetHeight}>
          <Text style={[defaultStyles.text, textStyle]}>{displayValue}</Text>
          <Image
            style={[defaultStyles.icon, iconStyle]}
            source={icon || Icons.dropDown}
          />
        </View>
      </TouchableWithoutFeedback>
      {rest.children.length > 0 ? (
        Platform.OS == 'android' ? (
          <RNPicker style={[defaultStyles.picker, {height}]} {...rest} />
        ) : (
          <ModalContainerIOS visible={visible} success={success}>
            <RNPicker {...rest} />
          </ModalContainerIOS>
        )
      ) : null}
    </View>
  );
};

Picker.Item = RNPicker.Item;
