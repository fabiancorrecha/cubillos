import React, {ReactElement} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import Colors from 'utils/colors';
import Button from './button';
import {Text} from './text';

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    padding: 24,
  },
  image: {
    height: 72,
    marginBottom: 16,
    resizeMode: 'contain',
    width: 72,
  },
  title: {
    color: Colors.blue,
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  buttonSeparator: {
    width: 20,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonTitle: {
    color: 'white',
  },
});

export type AlertModalDualButtonProps = {
  visible: boolean;
  image: ImageSourcePropType;
  title: string;
  buttonLeft: {
    isLoading?: boolean;
    color?: string;
    title: string;
    onPress: () => void;
  };
  buttonRight: {
    isLoading?: boolean;
    color?: string;
    title: string;
    onPress: () => void;
  };
};

/**
 * Modal de alerta usada en la página de registro, editar perfil y recuperar
 * contraseña.
 */
export const AlertModalDualButton = ({
  visible,
  image,
  title,
  buttonLeft,
  buttonRight,
}: AlertModalDualButtonProps): ReactElement => {
  buttonLeft.color = buttonLeft?.color ? buttonLeft.color : Colors.yellow;
  buttonRight.color = buttonRight?.color ? buttonRight.color : Colors.yellow;

  return (
  <Modal
    animationType="fade"
    onRequestClose={
      buttonLeft?.onPress ??
      ((): void => {
        // Do nothing
      })
    }
    transparent
    visible={visible}>
    <View style={styles.scrim}>
      <View style={styles.container}>
        <Image style={styles.image} source={image} />
        <Text style={styles.title} bold>
          {title}
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        {buttonLeft.isLoading ?
          (
            <ActivityIndicator style={[styles.button, { backgroundColor: buttonLeft.color }]} size={15} color="white" />
          ) : (
            <Button
              style={[styles.button, { backgroundColor: buttonLeft.color }]}
              titleStyle={styles.buttonTitle}
              title={buttonLeft.title}
              onPress={buttonLeft.onPress}
            />
          )}

        <View style={styles.buttonSeparator} />

        {buttonRight.isLoading ?
          (
            <ActivityIndicator style={[styles.button, { backgroundColor: buttonRight.color }]} size={15} color="white" />
          ) : (
            <Button
              style={[styles.button, { backgroundColor: buttonRight.color }]}
              titleStyle={styles.buttonTitle}
              title={buttonRight.title}
              onPress={buttonRight.onPress}
            />
          )}
      </View>
    </View>
  </Modal>
)};
