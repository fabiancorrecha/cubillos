import React, {ReactElement, ReactNode} from 'react';
import {Platform, StyleProp, View, ViewStyle} from 'react-native';
// TODO: Dependencia innecesaria.
import RNOptionsMenu from 'react-native-options-menu';
import {prop} from 'utils';

type NonEmptyArray<T> = T[] & {0: T};

type OptionsMenuProps = {
  cancelLabel?: string;
  children: ReactNode;
  options: NonEmptyArray<Option>;
  style?: StyleProp<ViewStyle>;
};

type Option = {
  label: string;
  action: () => void;
};

export const OptionsMenu = ({
  cancelLabel = 'Cancelar',
  children,
  options,
  style,
}: OptionsMenuProps): ReactElement => {
  let rnOptions = options.map(prop('label'));
  let rnActions = options.map(prop('action'));
  if (Platform.OS === 'ios') {
    rnOptions = [...rnOptions, cancelLabel];
    rnActions = [
      ...rnActions,
      (): void => {
        // Do nothing.
      },
    ];
  }

  return (
    <View style={style}>
      <RNOptionsMenu
        customButton={children}
        options={rnOptions}
        actions={rnActions}
      />
    </View>
  );
};
