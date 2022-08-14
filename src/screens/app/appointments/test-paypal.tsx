import React, {useState} from 'react';
import {View, Text, Modal} from 'react-native';
import Button from 'widgets/button';
import {PayPalPayment} from './paypal-payment';

const TestPaypal = () => {
  const [show, setShow] = useState(false);

  const print = (text: string) => (param: string = '') => {
    setShow(false);
    console.log(text, param);
  };

  return (
    <View>
      <Text style={{fontSize: 30}}>Test de paypal</Text>
      <Button title="Pagar" onPress={() => setShow(true)} />
      {show && (
        <Modal animationType="fade">
          <PayPalPayment
            amount={10}
            onCancel={print('canecel')}
            onSubmit={print('submit:')}
            onError={print('error')}
          />
        </Modal>
      )}
    </View>
  );
};

export default TestPaypal;
