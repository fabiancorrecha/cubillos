import {setUser} from 'actions/user';
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Country} from 'models/country';
import {User} from 'models/user';
import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity
} from 'react-native';
import Toast from 'react-native-root-toast';
import {SafeAreaView} from 'react-navigation';
import {useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {CountriesService, UsersService} from 'services';
import {useTypedDispatch} from 'store';
import {openImagePicker, prop, showAlert, trace} from 'utils';
import Colors from 'utils/colors';
import {validatePhoneNumber} from 'validators';
import {AlertModal, FormUser, OptionsMenu, UserForm} from 'widgets';

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
    marginTop: 32,
    flex: 1,
  },
  container: {
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  logo: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    color: Colors.yellow,
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.blue,
    height: 50,
  },
  homeButton: {
    left: 4,
  },
  optionsButton: {
    right: 4,
    position: 'absolute',
  },
  headerButton: {
    height: 24,
    width: 24,
  },
  headerButtonContainer: {
    padding: 12,
  },
  profilePictureContainer: {
    zIndex: 10,
    position: 'relative',
    marginTop: -70,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#f2f2f2',
    alignSelf: 'center',
  },
  profilePictureContentContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: Colors.yellow,
    backgroundColor: Colors.gray,
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
});

export const Profile: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const user = useTypedSelector(prop('user')) as User;

  const {goBack, navigate} = useNavigation();

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const formRef = useRef<UserForm>(null);

  const [profilePicture, setProfilePicture] = useState(
    user.person.profilePicture
      ? {uri: user.person.profilePicture, rotation: 0}
      : null,
  );

  useEffect(() => {
    CountriesService.get()
      .then(setCountries)
      .catch(err => {
        console.log('Register: useEffect: CountriesService.get:', err);
        showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        goBack(null);
      });
  }, [goBack]);

  const [loading, setLoading] = useState(false);

  const save = ({
    name,
    lastName,
    email,
    password,
    confirmedPassword,
    address,
    phoneNumber,
    countryID,
  }: FormUser): void => {
    if (!validatePhoneNumber(phoneNumber)) {
      Toast.show('El número de teléfono es inválido');
      return;
    }

    setLoading(true);
    UsersService.update(
      user.id,
      name,
      lastName,
      email,
      password,
      confirmedPassword,
      address,
      phoneNumber,
      countryID,
      profilePicture
    )
      .then(user => {
        setLoading(false);
        setSuccessModalVisible(true);
        dispatch(setUser(user));
        formRef.current?.reset();
      })
      .catch((err: AxiosError) => {
        if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.message);
        } else {
          console.log('Profile: save:', JSON.stringify(err));
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
        setLoading(false);
      });
  };

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButtonContainer, styles.homeButton]}
            onPress={(): void => {
              navigate('Dashboard');
            }}>
            <Image style={styles.headerButton} source={Icons.home} />
          </TouchableOpacity>
          <View style={[styles.headerButtonContainer, styles.optionsButton]}>
            <OptionsMenu
              options={[
                {
                  label: 'Editar perfil',
                  action: (): void => {
                    navigate('Profile');
                  },
                },
                {
                  label: 'Cerrar sesión',
                  action: (): void => {
                    navigate('Logout');
                  },
                },
              ]}>
              <Image source={Icons.hamburgerMenu} style={styles.headerButton} />
            </OptionsMenu>
          </View>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={{flex: 1}}
          contentContainerStyle={{
            paddingBottom: 15,
          }}>
          {
            countries && (
              <React.Fragment>
                <View style={ {
                  backgroundColor: Colors.blue,
                  width: '100%',
                  height: 100
                } }></View>
                <View style={styles.profilePictureContainer}>
                  <TouchableWithoutFeedback
                    onPress={(): void => {
                      openImagePicker()
                        .then(uri =>
                          navigate('ImageEditor', {
                            uri,
                            onSave: (uri: string, rotation: number) => {
                              setProfilePicture({
                                uri,
                                rotation,
                              });
                            },
                            onCancel: () => {
                              // Do nothing.
                            },
                          }),
                        )
                        .catch(trace('RegisterWithSocialNetwork: openImagePicker:'));
                    }}>
                    <View style={styles.profilePictureContentContainer}>
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
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </React.Fragment>
            )
          }
          <View style={ { paddingHorizontal: 15 } }>
            {!countries ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator color={Colors.yellow} size="large" />
              </View>
            ) : (
              <UserForm
                ref={formRef}
                initialForm={{
                  name: user.person.name,
                  lastName: user.person.lastName,
                  email: user.email,
                  password: '',
                  confirmedPassword: '',
                  address: user.person.address,
                  phoneNumber: user.person.phoneNumber,
                  countryID: user.person.country.id,
                }}
                countries={countries}
                loading={loading}
                onSubmit={save}
                showPasswordAndEmail={user.authType === 'normal'}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <AlertModal
        button={{
          title: 'Confirmar',
          onPress: (): void => {
            setSuccessModalVisible(false);
          },
        }}
        image={Icons.person}
        title="Se han guardado los cambios"
        visible={successModalVisible}
      />
    </>
  );
};
