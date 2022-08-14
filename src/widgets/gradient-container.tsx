import React, {ReactNode, ReactElement} from 'react';
import {ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from 'utils/colors';

interface GradientProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const GradientContainer = ({children, style}: GradientProps): ReactElement => (
  <LinearGradient colors={[Colors.gradient1, Colors.gradient2]} style={style}>
    {children}
  </LinearGradient>
);

export default GradientContainer;