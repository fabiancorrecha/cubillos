import React, {forwardRef, ReactElement, Ref} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  ViewStyle,
  Platform
} from 'react-native';
import Colors from 'utils/colors';
import {TextStyle} from './text';

const defaultStyles = StyleSheet.create({
  container: {},
  textInput: {
    backgroundColor: Colors.gray,
    fontSize: 12,
    marginVertical: 12,
    padding: 12,
  },
});

export interface TextInputProps extends RNTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle> & StyleProp<TextStyle>;
  bold?: boolean;
}

export const TextInput = forwardRef(
  (
    {containerStyle, style, bold, ...rest}: TextInputProps,
    ref: Ref<RNTextInput>,
  ): ReactElement => (
    <View style={[defaultStyles.container, containerStyle]}>
      <RNTextInput
        ref={ref}
        caretHidden={ Platform.OS == 'android' }
        style={[
          bold
            ? // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              {fontFamily: 'Montserrat-Bold'}
            : {fontFamily: 'Montserrat-Regular'},
          defaultStyles.textInput,
          style,
        ]}
        {...rest}
      />
    </View>
  ),
);

TextInput.displayName = 'TextInput';
