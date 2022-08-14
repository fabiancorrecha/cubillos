import React, {useEffect, useState, ReactElement} from 'react';
import {View, ActivityIndicator, StyleSheet, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import {PayPalApiService} from 'services';
import {
  PUBLIC_URL,
  PAYPAL_MODE,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
} from 'react-native-dotenv';
import {Text} from 'widgets';
import qs from 'qs';
import {CurrencyType} from 'models/currency-type';
const windowWidth = Dimensions.get('window').width;
import {decode as atob, encode as btoa} from 'base-64';
import { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';
declare let window: any;

window.btoa = btoa;

type Props = {
  amount: number;
  userId: number;
  onSubmit: (responseCode: string) => void;
  onError: (error: any) => void;
  onCancel: () => void;
};

export const PayPalPayment = ({
  amount,
  userId,
  onSubmit,
  onCancel,
  onError,
}: Props): ReactElement => {
  const [approvalUrl, setApprovalUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const [id, setId] = useState('');

  const successUrl = PUBLIC_URL + 'paypal/success';
  const cancelUrl = PUBLIC_URL + 'paypal/cancel';
  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [
      {
        amount: {
          total: amount || 10,
          currency: 'USD',
          details: {
            subtotal: amount || 10,
            tax: '0',
            shipping: '0',
            handling_fee: '0',
            shipping_discount: '0',
            insurance: '0',
          },
        },
        description: 'Pago de cita online',
      },
    ],
    redirect_urls: {
      return_url: successUrl,
      cancel_url: cancelUrl,
    },
  };

  const getAccessToken = () => {
    const params = qs.stringify({grant_type: 'client_credentials'});

    return PayPalApiService.post('/v1/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Credentials': true,
      },
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
    });
  };

  const getRefreshToken = (access_token: string) => {
    setAccessToken(access_token);
    const params = qs.stringify({grant_type: 'client_credentials'});

    return PayPalApiService.post('/v1/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Credentials': true,
        Authorization: `Bearer ${access_token}`,
      },
    });
  };

  const processPayment = (access_token: string) => {
    return PayPalApiService.post('/v1/payments/payment', paymentDetails, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
  };

  const executePaypment = (paymentId: string, PayerID: string) => {
    return PayPalApiService.post(
      `v1/payments/payment/${paymentId}/execute`,
      {payer_id: PayerID},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  };

  useEffect(() => {
    getAccessToken()
      .then((res: any) => getRefreshToken(res.data.access_token))
      .then((res: any) => processPayment(res.data.access_token))
      .then((res: any) => {
        const {id, links} = res.data;
        const approvalUrl = links.find(
          (data: any) => data.rel == 'approval_url',
        );
        setApprovalUrl(approvalUrl.href);
        setId(id);
      })
      .catch(err => {
        onError(err);
        console.log('err', err);
      });
  }, []);

  const onNavigationStateChange = ({url}: any) => {
    console.log('onNavigationStateChange: url: ', url);
    if (url.includes(successUrl) && !paypalSuccess) {
      setPaypalSuccess(true);
      const getParam = getParams(url);
      const paymentId = getParam('paymentId');
      const PayerID = getParam('PayerID');
      executePaypment(paymentId, PayerID)
      .then(res => {
          setApprovalUrl('');
          console.log("Se borro la url");
          // Se hace esto para dejar toda la logica de paypal que ya estaba
          const payment = {
            amount: res.data.transactions[0].amount.total,
            user_id: userId,
            response_code:
              res.data.transactions[0].related_resources[0].sale.id,
            currency_id: CurrencyType.USD, // USD.
            method_id: 1, // PayPal.
          };
          console.log('executePaypment: payment:', payment);
          onSubmit(JSON.stringify(payment));
        })
        .catch(err => {
          onError(err);
          console.log('executePaypment: error', err);
        });
      return;
    }

    if (url.includes(cancelUrl)) {
      onCancel();
    }
  };

  const Loading = (): ReactElement => {
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <ActivityIndicator size="large" />
        <Text>
          Conectando con PayPal. {PAYPAL_MODE === 'sandbox' ? PAYPAL_MODE : ''}
        </Text>
      </View>
    );
  };

  const webViewError = (error: WebViewErrorEvent) => {
    if(approvalUrl) {
      onError(error)
    }
  }

  return (
    <View style={styles.container}>
      {approvalUrl ? (
        <WebView
          style={styles.webView}
          source={{uri: approvalUrl}}
          onNavigationStateChange={onNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={Loading}
          onError={webViewError}
        />
      ) : (
        <View style={{marginTop: 20}}>
          <ActivityIndicator size="large" />
          <Text>
            Conectando con PayPal.{' '}
            {PAYPAL_MODE === 'sandbox' ? PAYPAL_MODE : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const getParams = (url: string) => {
  const [_, params] = url.split('?');
  return (name: string) =>
    params
      .split('&')
      .filter(p => p.startsWith(name))
      .toString()
      .replace(`${name}=`, '');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth,
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
    width: windowWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
