/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable react/destructuring-assignment */
import moment from 'moment';
import React, {ReactElement, ReactNode} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import {socket} from 'services/socket';
import Colors from 'utils/colors';
import {Text, TextInput as AppTextInput, TextInputProps} from 'widgets';
import GradientContainer from 'widgets/gradient-container';
import Button from 'widgets/button';

const TextInput = (props: TextInputProps): ReactElement => (
  <AppTextInput {...props} style={{color: 'black'}} />
);

const styles = StyleSheet.create({
  button: {
    width: '90%',
    marginTop: 5,
    padding: 8,
    borderRadius: 30,
    alignSelf: 'center',
  },
  whiteButton: {
    backgroundColor: Colors.white,
  },
  yellowTitle: {
    color: Colors.yellow,
    textAlign: 'center',
  },
  yellowButton: {
    backgroundColor: Colors.yellow,
  },
  whiteTitle: {
    color: Colors.white,
    textAlign: 'center',
  },
  container: {
    height: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  bold: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  textArea: {
    minHeight: 100,
  },
  itemCheckBox: {
    height: 24,
    tintColor: Colors.white,
    width: 24,
    marginEnd: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  tabText: {
    color: Colors.white,
    textAlign: 'center',
  },
  tabItem: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  input: {
    backgroundColor: Colors.gray,
    fontSize: 12,
    marginVertical: 12,
    padding: 12,
  },
});

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class ViewPatient extends React.Component<Props> {
  state = {
    countries: this.props.navigation.getParam('countries').map((i: any) => {
      return {
        value: i.id,
        label: i.name,
      };
    }),
    document_types: this.props.navigation
      .getParam('document_types')
      .map((i: any) => {
        return {
          value: i.id,
          label: i.name,
        };
      }),
    genders: [
      {value: 'M', label: 'M'},
      {value: 'F', label: 'F'},
    ],
    showDatePicker: false,
    form: {
      name: '',
      lastname: '',
      country: {
        value: '',
        label: 'Seleccione',
      },
      address: '',
      phone: '',
      email: '',
      id: null,
      password: '',
      password_confirmation: '',
    },
    loading: false,
    tab: 1,
    loadingData: false,
    formData: {
      birthdate: '',
      document_type_id: {
        value: '',
        label: 'Seleccione',
      },
      document: '',
      gender: {
        value: '',
        label: 'Seleccione',
      },
      marital_status: '',
      occupation: '',
      residence: '',
      responsable: '',
      responsable_relationship: '',
      responsable_phone: '',
      companion: '',
      companion_phone: '',
      insurance: '',
      type_union: '',
      city: '',
      previous_procedures: '',
      medicines: '',
      allergies: '',
      diseases: ''
    },
  };

  onUserDeleted = (userId: number) => {
    const {navigation} = this.props;

    if (navigation.getParam('patient')?.id === userId) {
      Toast.show('Este paciente ha sido eliminado');
      navigation.goBack();
    }
  };

  componentDidMount(): void {
    socket.on('patients/user-delete', this.onUserDeleted);

    if (this.props.navigation.getParam('patient')) {
      const patient: any = this.props.navigation.getParam('patient');
      const item: any = patient.data || {};
      this.setState({
        form: {
          ...this.state.form,
          name: patient.person.name,
          lastname: patient.person.lastname,
          address: patient.person.address,
          country: {
            value: patient.person.country.id,
            label: patient.person.country.name,
          },
          phone: patient.person.phone,
          email: patient.email,
          id: patient.id,
        },
        formData: {
          birthdate: item.birthdate
            ? moment(item.birthdate).format('DD/MM/YYYY')
            : '',
          document_type_id: {
            value: item.document_type_id || '',
            label: item.document_type_id
              ? this.state.document_types.find(
                  (i: any) => i.value == item.document_type_id,
                ).label
              : 'Seleccione',
          },
          document: item.document || '',
          gender: {
            value: item.gender || '',
            label: item.gender || 'Seleccione',
          },
          marital_status: item.marital_status || '',
          occupation: item.occupation || '',
          residence: item.residence || '',
          responsable: item.responsable || '',
          responsable_relationship: item.responsable_relationship || '',
          responsable_phone: item.responsable_phone || '',
          companion: item.companion || '',
          companion_phone: item.companion_phone || '',
          insurance: item.insurance || '',
          type_union: item.type_union || '',
          city: item.city || '',
          previous_procedures: item.previous_procedures || '',
          medicines: item.medicines || '',
          allergies: item.allergies || '',
          diseases: item.diseases || ''
        },
      });
    }
  }

  componentWillUnmount(): void {
    socket.removeListener('patients/user-delete', this.onUserDeleted);
  }

  render(): ReactNode {
    const {tab} = this.state;
    const {navigation} = this.props;
    const setTab = (tab: number): void => this.setState({tab});

    return (
      <SafeAreaView style={{flex: 1}}>
        <GradientContainer style={styles.container}>
          {this.props.navigation.getParam('patient') && (
            <View style={styles.tabContainer}>
              <View style={{flex: 0.5}}>
                <TouchableOpacity onPress={() => setTab(1)}>
                  <View
                    style={{
                      ...styles.tabItem,
                      backgroundColor: tab == 1 ? Colors.white : undefined,
                      borderTopLeftRadius: 5,
                      borderBottomLeftRadius: 5,
                    }}>
                    <Text
                      style={{
                        ...styles.tabText,
                        color: tab == 1 ? Colors.blue : Colors.white,
                      }}
                      numberOfLines={1}>
                      Datos del Paciente
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{flex: 0.5}}>
                <TouchableOpacity onPress={() => setTab(2)}>
                  <View
                    style={{
                      ...styles.tabItem,
                      backgroundColor: tab == 2 ? Colors.white : undefined,
                      borderTopRightRadius: 5,
                      borderBottomRightRadius: 5,
                    }}>
                    <Text
                      style={{
                        ...styles.tabText,
                        color: tab == 2 ? Colors.blue : Colors.white,
                      }}
                      numberOfLines={1}>
                      Datos Adicionales
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {tab == 1 && (
            <ScrollView keyboardShouldPersistTaps="always">
              <View>
                <Text style={styles.bold}>Nombre</Text>
                <TextInput editable={false} value={this.state.form.name} />
              </View>
              <View>
                <Text style={styles.bold}>Apellido</Text>
                <TextInput editable={false} value={this.state.form.lastname} />
              </View>
              <View>
                <Text style={styles.bold}>Correo Electrónico</Text>
                <TextInput editable={false} value={this.state.form.email} />
              </View>
              <View>
                <Text style={styles.bold}>Teléfono</Text>
                <TextInput
                  editable={false}
                  keyboardType="phone-pad"
                  value={this.state.form.phone}
                />
              </View>
              <View>
                <Text style={styles.bold}>Dirección</Text>
                <TextInput
                  editable={false}
                  style={styles.textArea}
                  numberOfLines={5}
                  multiline={true}
                  value={this.state.form.address}
                />
              </View>
              <View>
                <Text style={styles.bold}>País</Text>
                <View style={styles.input}>
                  <Text style={{fontSize: 12, color: 'black'}}>
                    {this.state.form.country.label}
                  </Text>
                </View>
              </View>
              <Button
                onPress={(): void => {
                  navigation.goBack();
                }}
                style={[styles.button, styles.whiteButton, {width: '33%'}]}
                titleStyle={styles.yellowTitle}
                title="Volver"
              />
            </ScrollView>
          )}

          {tab == 2 && (
            <ScrollView keyboardShouldPersistTaps="always">
              <View>
                <Text style={styles.bold}>Fecha de Nacimiento</Text>
                <View style={styles.input}>
                  <Text style={{fontSize: 12, color: 'black'}}>
                    {this.state.formData.birthdate || 'No seleccionada'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.bold}>Ciudad</Text>
                <TextInput editable={false} value={this.state.formData.city} />
              </View>
              <View>
                <Text style={styles.bold}>Género</Text>
                <View style={styles.input}>
                  <Text style={{fontSize: 12, color: 'black'}}>
                    {this.state.formData.gender.value || 'No seleccionado'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.bold}>Tipo de Documento</Text>
                <View style={styles.input}>
                  <Text style={{fontSize: 12, color: 'black'}}>
                    {this.state.formData.document_type_id.value ||
                      'No seleccionado'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.bold}>Documento de Identidad</Text>
                <TextInput
                  editable={false}
                  keyboardType="phone-pad"
                  value={this.state.formData.document}
                />
              </View>
              <View>
                <Text style={styles.bold}>Estado Civil</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.marital_status}
                />
              </View>
              <View>
                <Text style={styles.bold}>Ocupación</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.occupation}
                />
              </View>
              <View>
                <Text style={styles.bold}>Lugar de Residencia</Text>
                <TextInput
                  editable={false}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                  value={this.state.formData.residence}
                />
              </View>
              <View>
                <Text style={styles.bold}>Responsable</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.responsable}
                />
              </View>
              <View>
                <Text style={styles.bold}>Parentesco del Responsable</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.responsable_relationship}
                />
              </View>
              <View>
                <Text style={styles.bold}>Teléfono del Responsable</Text>
                <TextInput
                  editable={false}
                  keyboardType="phone-pad"
                  value={this.state.formData.responsable_phone}
                />
              </View>
              <View>
                <Text style={styles.bold}>Acompañante</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.companion}
                />
              </View>
              <View>
                <Text style={styles.bold}>Teléfono del Acompañante</Text>
                <TextInput
                  editable={false}
                  keyboardType="phone-pad"
                  value={this.state.formData.companion_phone}
                />
              </View>
              <View>
                <Text style={styles.bold}>Aseguradora</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.insurance}
                />
              </View>
              <View>
                <Text style={styles.bold}>Tipo de Vinculación</Text>
                <TextInput
                  editable={false}
                  value={this.state.formData.type_union}
                />
              </View>
              <View>
                <Text style={styles.bold}>Procedimientos quirúrgicos anteriores</Text>
                <TextInput
                  editable={ false }
                  textAlignVertical="top"
                  placeholder="Procedimientos quirúrgicos anteriores"
                  value={this.state.formData.previous_procedures}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              </View>
              <View>
                <Text style={styles.bold}>¿Padece de alguna enfermedad?</Text>
                <TextInput
                  editable={ false }
                  textAlignVertical="top"
                  placeholder="¿Padece de alguna enfermedad?"
                  value={this.state.formData.diseases}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              </View>
              <View>
                <Text style={styles.bold}>¿Toma algún medicamento?</Text>
                <TextInput
                  editable={ false }
                  textAlignVertical="top"
                  placeholder="¿Toma algún medicamento?"
                  value={this.state.formData.medicines}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              </View>
              <View>
                <Text style={styles.bold}>¿Es alérgico a algún medicamento?</Text>
                <TextInput
                  editable={ false }
                  textAlignVertical="top"
                  placeholder="¿Es alérgico a algún medicamento?"
                  value={this.state.formData.allergies}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              </View>
              <Button
                onPress={(): void => {
                  navigation.goBack();
                }}
                style={[styles.button, styles.whiteButton, {width: '33%'}]}
                titleStyle={styles.yellowTitle}
                title="Volver"
              />
            </ScrollView>
          )}
        </GradientContainer>
      </SafeAreaView>
    );
  }
}

export default ViewPatient;
