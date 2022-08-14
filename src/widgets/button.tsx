import React, {ReactElement} from 'react';
import {
  GestureResponderEvent,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Text, TextStyle} from './text';

interface ButtonProps {
  title: string;
  style?: ViewStyle | ViewStyle[];
  textBold?: boolean;
  titleStyle?: TextStyle | TextStyle[];
  onPress?: (event: GestureResponderEvent) => void;
}

const Button = ({
  title,
  style,
  textBold,
  titleStyle,
  onPress,
}: ButtonProps): ReactElement => (
  <TouchableOpacity onPress={onPress}>
    <View style={style}>
      <Text style={titleStyle} bold={textBold}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

export default Button;
