import {setUser} from 'actions/user';
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Country} from 'models/country';
import React, {
  Component,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import Toast from 'react-native-root-toast';
import {SafeAreaView} from 'react-navigation';
import {NavigationStackProp} from 'react-navigation-stack';
import {connect, ConnectedProps} from 'react-redux';
import {AuthService, CountriesService} from 'services';
import {showAlert, openImagePicker, trace} from 'utils';
import Colors from 'utils/colors';
import {validatePhoneNumber} from 'validators';
import {AlertModal, Picker, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import GradientContainer from 'widgets/gradient-container';
import {SentPhoto} from 'models/sent-photo';
import moment from 'moment';
import ModalContainerIOS from 'widgets/modal-container-ios';
import DateTimePicker from '@react-native-community/datetimepicker';

const _DatepickerContainer = (props: any) => (
    <DateTimePicker
      locale="es-ES"
      maximumDate={ new Date() }
      value={ props.date || new Date() }
      mode="date"
      display="default"
      onChange={ (_,e) => {
        if (e) {
          if (Platform.OS == 'android') {
            props.success();
          }  
          props.onChange(moment(e).format('DD/MM/YYYY'));
        }        
      } }
    />
)

const styles = StyleSheet.create({
  button: {
    width: '90%',
    marginTop: 5,
    padding: 8,
    borderRadius: 30,
    alignSelf: 'center',
  },
  birthdate: {
    backgroundColor: Colors.gray,
      fontSize: 12,
      marginVertical: 12,
      padding: 12,
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

  textArea: {
    minHeight: 100,
  },

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

const connector = connect(() => ({}));

type Props = {
  navigation: NavigationStackProp<
    {},
    {
      firstName: string;
      lastName: string;
      email: string;
      token: string;
      tokenType: 'google' | 'facebook';
    }
  >;
} & ConnectedProps<typeof connector>;

const initialForm = {
  address: '',
  phoneNumber: '',
  countryId: 1,
  profilePicture: null as SentPhoto | null,
  previous_procedures: '',
  birthdate: '',
  gender: '',
  medicines: '',
  allergies: '',
  diseases: ''
};

type Form = typeof initialForm;

const initialState = {
  form: initialForm,
  submitting: false,
  countries: [] as Country[],
  successModalVisible: false,
  showDatePicker: false,
  genders: [
    { value: 'M', label: 'M' },
    { value: 'F', label: 'F' }
  ]
};

type State = typeof initialState;

interface ButtonsContainerProps {
  onBack?: () => void;
  children: ReactNode;
}

const ButtonsContainer = ({
  onBack,
  children,
}: ButtonsContainerProps): ReactElement => {
  if (onBack) {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 0.5}}>
          <Button
            onPress={onBack}
            style={[styles.button, styles.whiteButton]}
            titleStyle={styles.yellowTitle}
            title="Volver"
          />
        </View>
        <View style={{flex: 0.5, justifyContent: 'center'}}>{children}</View>
      </View>
    );
  }

  return <>{children}</>;
};

const Separator: FunctionComponent = () => <View style={{height: 16}} />;

class RegisterWithSocialNetworkComponent extends Component<Props, State> {
  state = initialState;

  componentDidMount(): void {
    const {navigation} = this.props;

    CountriesService.get()
      .then(countries => this.setState({countries}))
      .catch(err => {
        console.log('RegisterWithSocialNetwork: componentDidMount:', err);
        showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        navigation.goBack();
      });
  }

  updateFormField = <K extends keyof Form>(key: K) => (
    value: Form[K],
  ): void => {
    const {form} = this.state;

    this.setState({form: {...form, [key]: value}});
  };

  submit = (): void => {
    let {
      form: {phoneNumber, address, countryId, profilePicture, previous_procedures, medicines, allergies, diseases, birthdate, gender},
    } = this.state;

    if (!validatePhoneNumber(phoneNumber)) {
      Keyboard.dismiss();
      Toast.show('El número de teléfono es inválido');
      return;
    }
    // if (!gender) {
    //   Toast.show('Debe indicar su género');
    //   return;
    // }
    // if (!birthdate) {
    //   Toast.show('Debe indicar su fecha de nacimiento');
    //   return;
    // }
    // if (!allergies) {
    //   Toast.show('Debe indicar si es alérgico a algún medicamento');
    //   return;
    // }
    // if (!previous_procedures) {
    //   Toast.show('Debe indicar si tiene procedimientos quirúrgicos previos');
    //   return;
    // }
    // if (!diseases) {
    //   Toast.show('Debe indicar si padece de alguna enfermedad');
    //   return;
    // }
    // if (!medicines) {
    //   Toast.show('Debe indicar si está tomando algún medicamento');
    //   return;
    // }

    // birthdate = moment(birthdate,'DD/MM/YYYY').format('YYYY-MM-DD');

    const {navigation, dispatch} = this.props;

    const [firstName, lastName, email, token, tokenType] = [
      navigation.getParam('firstName'),
      navigation.getParam('lastName'),
      navigation.getParam('email'),
      navigation.getParam('token'),
      navigation.getParam('tokenType'),
    ];

    this.setState({submitting: true});
    AuthService.registerWithSocialNetwork(
      firstName,
      lastName,
      email,
      address,
      phoneNumber,
      countryId,
      token,
      tokenType,
      profilePicture,
      previous_procedures,
      medicines,
      allergies,
      diseases,
      birthdate,
      gender,
    )
      .then(user => {
        dispatch(setUser(user));
        this.setState({submitting: false, successModalVisible: true});
      })
      .catch((err: AxiosError) => {
        if (err.response?.status === 422) {
          showAlert('Datos inválidos', err.response.data.message);
        } else {
          console.log('Register: register: ', JSON.stringify(err));
          showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        }
        this.setState({submitting: false});
      });
  };

  render(): ReactNode {
    const {navigation} = this.props;

    const {
      submitting,
      countries,
      successModalVisible,
      genders,
      form: {phoneNumber, address, countryId, profilePicture, previous_procedures, diseases, medicines, allergies, birthdate, gender},
    } = this.state;

    return (
      <>
        { Platform.OS == 'ios' ? (
          <ModalContainerIOS
            visible={ this.state.showDatePicker }
            success={ () => this.setState({ showDatePicker: false }) }>
            <_DatepickerContainer
              date={ birthdate ? moment(birthdate,'DD/MM/YYYY').toDate() : null }
              onChange={ this.updateFormField('birthdate') }
              success={ () => this.setState({ showDatePicker: false }) }
            />
          </ModalContainerIOS>
        ) : (
          this.state.showDatePicker && <_DatepickerContainer
            date={ birthdate ? moment(birthdate,'DD/MM/YYYY').toDate() : null }
            onChange={ this.updateFormField('birthdate') }
            success={ () => this.setState({ showDatePicker: false }) }
          />
        ) }

        <SafeAreaView>
          <ScrollView
            contentContainerStyle={{minHeight: '100%'}}
            keyboardShouldPersistTaps="always"
            style={{height: '100%'}}>
            <GradientContainer style={styles.registerContainer}>
              <TouchableOpacity
                style={styles.profilePictureContainer}
                onPress={(): void => {
                  openImagePicker()
                    .then(uri =>
                      navigation.navigate('ImageEditor', {
                        uri,
                        onSave: (uri: string, rotation: number) => {
                          this.updateFormField('profilePicture')({
                            uri,
                            rotation,
                          });
                        },
                        onCancel: () => {
                          // Do nothing.
                        },
                      }),
                    )
                    .catch(
                      trace('RegisterWithSocialNetwork: openImagePicker:'),
                    );
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
              <Text style={styles.title} bold>
                Complete su registro
              </Text>
              {((): ReactNode => {
                if (!countries) {
                  return (
                    <View style={styles.emptyContainer}>
                      <ActivityIndicator color="white" />
                    </View>
                  );
                }

                return (
                  <View>
                    <TextInput
                      editable={!submitting}
                      keyboardType="phone-pad"
                      onChangeText={this.updateFormField('phoneNumber')}
                      placeholder="Teléfono"
                      textContentType="telephoneNumber"
                      value={phoneNumber}
                      maxLength={50}
                    />
                    <Picker
                      displayValue={
                        countries.find(({id}) => id === countryId)?.name ?? ''
                      }
                      enabled={!submitting}
                      onValueChange={this.updateFormField('countryId')}
                      selectedValue={countryId}>
                      {countries.map(({id, name}) => (
                        <Picker.Item key={id} label={name} value={id} />
                      ))}
                    </Picker>
                    {/*<TextInput
                      blurOnSubmit={false}
                      editable={!submitting}
                      textAlignVertical="top"
                      onChangeText={this.updateFormField('address')}
                      placeholder="Dirección"
                      returnKeyType="next"
                      textContentType="fullStreetAddress"
                      value={address}
                      maxLength={150}
                      multiline={true}
                      numberOfLines={5}
                      style={styles.textArea}
                    />
                    <TextInput
                      editable={!submitting}
                      textAlignVertical="top"
                      onChangeText={this.updateFormField('previous_procedures')}
                      placeholder="Procedimientos quirúrgicos anteriores"
                      value={previous_procedures}
                      multiline={true}
                      numberOfLines={5}
                      style={styles.textArea}
                    />
                    <TextInput
                      editable={!submitting}
                      textAlignVertical="top"
                      onChangeText={this.updateFormField('diseases')}
                      placeholder="¿Padece de alguna enfermedad?"
                      value={diseases}
                      multiline={true}
                      numberOfLines={5}
                      style={styles.textArea}
                    />
                    <TextInput
                      editable={!submitting}
                      textAlignVertical="top"
                      onChangeText={this.updateFormField('medicines')}
                      placeholder="¿Toma algún medicamento?"
                      value={medicines}
                      multiline={true}
                      numberOfLines={5}
                      style={styles.textArea}
                    />
                    <TextInput
                      editable={!submitting}
                      textAlignVertical="top"
                      onChangeText={this.updateFormField('allergies')}
                      placeholder="¿Es alérgico a algún medicamento?"
                      value={allergies}
                      multiline={true}
                      numberOfLines={5}
                      style={styles.textArea}
                    />
                    <TouchableWithoutFeedback onPress={ () => {
                      this.setState({
                        showDatePicker: true
                      });
                    } }>
                      <View>
                        <Text bold style={ { color: '#fff' } }>Fecha de Nacimiento</Text>
                        <View style={ styles.birthdate }>
                          <Text>{ birthdate }</Text>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                    <View>
                        <Text bold style={ { color: '#fff' } }>Género</Text>
                        <Picker
                          displayValue={ gender }
                          onValueChange={ (e: any) => {
                            if (e != '') {
                              this.setState({
                                form: {
                                  ...this.state.form,
                                  gender: e
                                }                                
                              });
                            }                      
                          } }
                          selectedValue={ gender }>
                          <Picker.Item
                              value={ '' }
                              label={ 'Seleccione' }
                          />
                          {/* 
                          { genders.map((i: any) => (
                            <Picker.Item
                              key={ i.value.toString() }
                              value={ i.value }
                              label={ i.label }
                            />
                          )) }
                        </Picker>
                    </View>*/}
                    <Separator />
                    <ButtonsContainer
                      onBack={(): void => {
                        const {navigation} = this.props;
                        navigation.goBack(null);
                      }}>
                      {submitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Button
                          style={[styles.button, styles.yellowButton]}
                          titleStyle={styles.whiteTitle}
                          title="Registrar"
                          onPress={this.submit}
                        />
                      )}
                    </ButtonsContainer>
                  </View>
                );
              })()}
            </GradientContainer>
          </ScrollView>
        </SafeAreaView>
        <AlertModal
          button={{
            title: 'Confirmar',
            onPress: (): void => {
              this.setState({successModalVisible: false});
              requestAnimationFrame(() => {
                navigation.navigate('Dashboard');
              });
            },
          }}
          image={Icons.person}
          title="Su registro ha sido exitoso"
          visible={successModalVisible}
        />
      </>
    );
  }
}

export const RegisterWithSocialNetwork = connector(
  RegisterWithSocialNetworkComponent,
);
