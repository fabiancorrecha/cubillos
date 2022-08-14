import React, {ReactElement} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {PayPalService} from 'services';
import Colors from 'utils/colors';
import Button from 'widgets/button';

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
  },

  buttonTitle: {
    color: 'white',
  },
});

type Props = {
  userId: number;
  amount: number;

  show: boolean;

  onSubmit: (paymentJsonString: string) => void;
  onError: () => void;
  onCancel: () => void;
};

export const PayPal = ({
  userId,
  amount,

  show,

  onSubmit,
  onError,
  onCancel,
}: Props): ReactElement => {
  return (
    <>
      {show && (
        <Modal animationType="fade" transparent>
          <View
            style={{
              padding: 16,
              paddingBottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              height: '100%',
            }}>
            <WebView
              source={{uri: PayPalService.FORM_URL}}
              containerStyle={{borderRadius: 8}}
              injectedJavaScript={`
                document.getElementById('price').value = "${amount}";
                document.getElementById('user_id').value = "${userId}";
                document.getElementById('title').value = "Pago de cita";
                document.getElementById('form').submit();`}
              onNavigationStateChange={({title}): void => {
                if (title.startsWith('successful:')) {
                  onSubmit(title.replace('successful:', ''));
                  return;
                }

                if (title === 'failure') {
                  onError();
                }
              }}
            />
            <Button
              onPress={onCancel}
              style={styles.button}
              titleStyle={styles.buttonTitle}
              textBold
              title="Cancelar"
            />
          </View>
        </Modal>
      )}
    </>
  );
};
