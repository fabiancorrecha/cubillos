import { setUser } from 'actions/user';
import { Icons, Images } from 'assets';
import { AxiosError } from 'axios';
import { Country } from 'models/country';
import { User } from 'models/user';
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  ActivityIndicatorProps,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import { SafeAreaView } from 'react-navigation';
import { useNavigation } from 'react-navigation-hooks';
import { useTypedSelector } from 'reducers';
import { CountriesService, UsersService } from 'services';
import { useTypedDispatch } from 'store';
import { prop, showAlert } from 'utils';
import Colors from 'utils/colors';
import { validatePhoneNumber } from 'validators';
import { AlertModal, FormUser, Text, UserForm } from 'widgets';
import GradientContainer from 'widgets/gradient-container';

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
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
  }
});

const ActivityIndicator = (props: ActivityIndicatorProps): ReactElement => (
  <RNActivityIndicator color="white" { ...props } />
);

export const Profile: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const user = useTypedSelector(prop('user')) as User;

  const { goBack } = useNavigation();

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const formRef = useRef<UserForm>(null);

  useEffect(() => {
    CountriesService.get()
      .then(setCountries)
      .catch(err => {
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
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      <SafeAreaView style={ { flex: 1 } }>
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={ { height: '100%' } }
          contentContainerStyle={ { minHeight: '100%' } }>
          <GradientContainer style={ styles.container }>
            <Image source={ Images.logo } style={ styles.logo } />
            <Text style={styles.title} bold>
              Editar perfil
            </Text>
            { !countries ? (
              <View style={ styles.emptyContainer }>
                <ActivityIndicator />
              </View>
            ) : (
              <UserForm
                ref={ formRef }
                initialForm={ {
                  name: user.person.name,
                  lastName: user.person.lastName,
                  email: user.email,
                  password: '',
                  confirmedPassword: '',
                  address: user.person.address,
                  phoneNumber: user.person.phoneNumber,
                  countryID: user.person.country.id,
                } }
                countries={ countries }
                loading={ loading }
                onSubmit={ save }
                showPasswordAndEmail={ user.authType === 'normal' }
                onBack={ (): void => {
                  goBack(null);
                } }
              />
            )}
          </GradientContainer>
        </ScrollView>
      </SafeAreaView>
      <AlertModal
        button={ {
          title: 'Confirmar',
          onPress: (): void => {
            setSuccessModalVisible(false);
          },
        } }
        image={ Icons.person }
        title="Se han guardado los cambios"
        visible={ successModalVisible }
      />
    </React.Fragment>
  );
};
