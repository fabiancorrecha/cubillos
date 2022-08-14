import React, {ReactElement} from 'react';
import {
  StyleProp,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle as RNTextStyle,
} from 'react-native';

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

// TODO: Debe haber una mejor manera de hacer ésto.

export type TextStyle = Without<
  Without<Without<RNTextStyle, 'fontWeight'>, 'fontFamily'>,
  'fontStyle'
>;

export interface TextProps extends RNTextProps {
  bold?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  style?: StyleProp<TextStyle>;
}

export const Text = ({bold, style, ...rest}: TextProps): ReactElement => (
  <RNText
    {...rest}
    style={[
      style,
      bold
        ? {fontFamily: 'Montserrat-Bold'}
        : {fontFamily: 'Montserrat-Regular'},
    ]}
  />
);
