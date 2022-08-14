import React, {ReactElement} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'utils/colors';

interface ModalContainerIOSProps {
  visible: boolean;
  success: () => void;
  children: React.ReactNode;
}

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWhite: {
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
    elevation: 5,
  },
  text: {
    color: Colors.blue2,
    textAlign: 'right',
    fontSize: 16,
  },
  button: {
    marginBottom: 20,
    width: '90%',
  },
});

const ModalContainerIOS = ({
  visible,
  success,
  children,
}: ModalContainerIOSProps): ReactElement => (
  <Modal transparent={true} visible={visible} animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalWhite}>
        {children}
        <TouchableOpacity onPress={success}>
          <View style={styles.button}>
            <Text style={styles.text}>Cerrar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default ModalContainerIOS;
