import React, {ReactElement} from 'react';
import {
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

export type AlertModalProps = {
  visible: boolean;
  image: ImageSourcePropType;
  title: string;
  button?: {
    title: string;
    onPress: () => void;
  };
};

/**
 * Modal de alerta usada en la página de registro, editar perfil y recuperar
 * contraseña.
 */
export const AlertModal = ({
  visible,
  image,
  title,
  button,
}: AlertModalProps): ReactElement => (
  <Modal
    animationType="fade"
    onRequestClose={
      button?.onPress ??
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
      {button && (
        <Button
          style={styles.button}
          titleStyle={styles.buttonTitle}
          title={button.title}
          onPress={button.onPress}
        />
      )}
    </View>
  </Modal>
);
