import {AxiosError} from 'axios';
import React, {FunctionComponent, ReactElement, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {useNavigation} from 'react-navigation-hooks';
import {AuthService} from 'services';
import {showAlert} from 'utils';
import Colors from 'utils/colors';
import {TextInput, Text, AlertModal} from 'widgets';
import Button from 'widgets/button';
import GradientContainer from 'widgets/gradient-container';
import {Images, Icons} from 'assets';

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  button: {
    width: '90%',
    marginTop: 5,
    padding: 8,
    borderRadius: 30,
    alignSelf: 'center',
  },
  yellowButton: {
    backgroundColor: Colors.yellow,
  },
  whiteButton: {
    backgroundColor: Colors.white,
  },
  whiteTitle: {
    color: Colors.white,
    textAlign: 'center',
  },
  yellowTitle: {
    color: Colors.yellow,
    textAlign: 'center',
  },
  logo: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  subtitle: {
    color: Colors.yellow,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});

const Separator: FunctionComponent = () => <View style={{height: 16}} />;

export const ResetPassword: FunctionComponent = () => {
  const {goBack} = useNavigation();

  const [isLoading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [email, setEmail] = useState('');

  const resetPassword = (): void => {
    setLoading(true);

    AuthService.resetPassword(email)
      .then(() => {
        setEmail('');
        setLoading(false);
        setSuccessModalVisible(true);
        setTimeout(setSuccessModalVisible, 3000, false);
      })
      .catch((err: AxiosError) => {
        setLoading(false);

        if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.message);
        } else if (err.response?.status === 404) {
          Toast.show(
            'Esa dirección de email no está asociada a ninguna cuenta',
            {duration: 5000},
          );
        } else {
          console.log('ResetPassword: resetPassword', err);
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
      });
  };

  return (
    <>
      <SafeAreaView>
        <GradientContainer style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{padding: 20}}>
            <Image source={Images.logo} style={styles.logo} />
            <Text style={styles.subtitle} bold>
              Recuperar cuenta
            </Text>
            <TextInput
              autoFocus
              editable={!isLoading}
              onChangeText={setEmail}
              onSubmitEditing={resetPassword}
              placeholder="Correo electrónico"
              returnKeyType="done"
              textContentType="username"
              value={email}
            />
            <Separator />
            <ButtonsContainer
              onBack={(): void => {
                goBack(null);
              }}>
              {isLoading ? (
                <ActivityIndicator
                  color="white"
                  style={{
                    marginTop: 15,
                  }}
                />
              ) : (
                <Button
                  style={[styles.button, styles.yellowButton]}
                  titleStyle={styles.whiteTitle}
                  title="Enviar"
                  onPress={resetPassword}
                />
              )}
            </ButtonsContainer>
          </ScrollView>
        </GradientContainer>
      </SafeAreaView>
      <AlertModal
        image={Icons.checkBig}
        title="Se le ha enviado un correo con las instrucciones para recuperar su contraseña"
        visible={successModalVisible}
      />
    </>
  );
};

interface ButtonsContainerProps {
  onBack?: () => void;
  children: ReactElement;
}

const ButtonsContainer = ({
  onBack,
  children,
}: ButtonsContainerProps): ReactElement => {
  if (onBack) {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 0.5}}>
          <Button
            onPress={onBack}
            style={[styles.button, styles.whiteButton]}
            titleStyle={styles.yellowTitle}
            title="Volver"
          />
        </View>
        <View style={{flex: 0.5}}>{children}</View>
      </View>
    );
  }

  return children;
};
