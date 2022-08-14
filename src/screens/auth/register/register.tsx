import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Country} from 'models/country';
import {SentPhoto} from 'models/sent-photo';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {SafeAreaView} from 'react-navigation';
import {useNavigation} from 'react-navigation-hooks';
import {AuthService, CountriesService} from 'services';
import {openImagePicker, showAlert, trace} from 'utils';
import Colors from 'utils/colors';
import {validatePhoneNumber} from 'validators';
import {AlertModal, FormUser, Text, UserForm} from 'widgets';
import GradientContainer from 'widgets/gradient-container';
import moment from 'moment';

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  registerContainer: {
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  profilePictureContainer: {
    width: 128,
    height: 128,
    marginVertical: 24,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: Colors.yellow,
    backgroundColor: Colors.gray,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderWidth: 3,
    borderColor: Colors.yellow,
    borderRadius: 64,
    resizeMode: 'cover',
  },
  addProfilePicture: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  title: {
    color: Colors.yellow,
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export const Register: FunctionComponent = () => {
  const {goBack, navigate} = useNavigation();

  const [countries, setCountries] = useState<Country[] | null>(null);
  useEffect(() => {
    CountriesService.get()
      .then(setCountries)
      .catch(err => {
        console.log('Register: useEffect: CountriesService.get:', err);
        showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        goBack(null);
      });
  }, [goBack]);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profilePicture, setProfilePicture] = useState<SentPhoto | null>(null);

  const register = ({
    name,
    lastName,
    email,
    password,
    confirmedPassword,
    address,
    phoneNumber,
    countryID,
    previous_procedures,
    diseases,
    medicines,
    allergies,
    birthdate,
    gender,
  }: FormUser): void => {
    if (!validatePhoneNumber(phoneNumber)) {
      Toast.show('El número de teléfono es inválido');
      return;
    }

    // birthdate = moment(birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');

    setLoading(true);
    AuthService.register(
      name,
      lastName,
      email,
      password,
      confirmedPassword,
      address,
      phoneNumber,
      countryID,
      profilePicture,
      previous_procedures,
      diseases,
      medicines,
      allergies,
      birthdate,
      gender,
    )
      .then(() => {
        setLoading(false);
        setSuccessModalVisible(true);
      })
      .catch((err: AxiosError) => {
        if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.message);
        } else {
          console.log('Register: register: ', err);
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
        setLoading(false);
      });
  };

  return (
    <>
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={{minHeight: '100%'}}
          keyboardShouldPersistTaps="always"
          style={{height: '100%'}}>
          <GradientContainer style={styles.registerContainer}>
            {countries && (
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={(): void => {
                  openImagePicker()
                    .then(uri =>
                      navigate('ImageEditor', {
                        uri,
                        onSave: (uri: string, rotation: number) => {
                          setProfilePicture({uri, rotation});
                        },
                        onCancel: () => {
                          // Do nothing.
                        },
                      }),
                    )
                    .catch(trace('Register: openImagePicker:'));
                }}>
                {profilePicture ? (
                  <Image
                    source={{uri: profilePicture.uri}}
                    style={[
                      styles.profilePicture,
                      {transform: [{rotate: `${profilePicture.rotation}deg`}]},
                    ]}
                  />
                ) : (
                  <Image
                    source={Icons.addProfilePicture}
                    style={styles.addProfilePicture}
                  />
                )}
              </TouchableOpacity>
            )}
            <Text style={styles.title} bold>
              Registro
            </Text>
            {!countries ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <UserForm
                register={true}
                countries={countries}
                loading={loading}
                onSubmit={register}
                showPasswordAndEmail={true}
                onBack={(): void => {
                  goBack(null);
                }}
              />
            )}
          </GradientContainer>
        </ScrollView>
      </SafeAreaView>
      <AlertModal
        button={{
          title: 'Confirmar',
          onPress: (): void => {
            setSuccessModalVisible(false);
            goBack(null);
          },
        }}
        image={Icons.person}
        title="Su registro ha sido exitoso"
        visible={successModalVisible}
      />
    </>
  );
};
