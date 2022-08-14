/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable react/destructuring-assignment */

import DateTimePicker from '@react-native-community/datetimepicker';
import {Country} from 'models/country';
import moment from 'moment';
import React, {
  Component,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Colors from 'utils/colors';
import Button from 'widgets/button';
import ModalContainerIOS from 'widgets/modal-container-ios';
import {Picker} from './picker';
import {TextInput} from './text-input';

const _DatepickerContainer = (props: any) => (
  <DateTimePicker
    locale="es-ES"
    maximumDate={new Date()}
    value={props.date || new Date()}
    mode="date"
    display="default"
    onChange={(_, e) => {
      if (e) {
        props.success();
        props.onChange(moment(e).format('DD/MM/YYYY'));
      }
    }}
  />
);

const styles = StyleSheet.create({
  button: {
    width: '90%',
    maxWidth: 200,
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
});

export type FormUser = {
  name: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  countryID: number;
  password: string;
  confirmedPassword: string;
  medicines?: string;
  allergies?: string;
  previous_procedures?: string;
  diseases?: string;
  gender?: string;
  birthdate?: string;
};

export type UserFormProps = {
  initialForm?: FormUser;
  countries: Country[];
  loading: boolean;
  showPasswordAndEmail: boolean;
  onSubmit: (_: FormUser) => void;
  onBack?: () => void;
  register?: boolean;
};

type State = FormUser;

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

export class UserForm extends Component<UserFormProps> {
  buildState = () => ({
    name: this.props.initialForm?.name ?? '',
    lastName: this.props.initialForm?.lastName ?? '',
    email: this.props.initialForm?.email ?? '',
    address: this.props.initialForm?.address ?? '',
    phoneNumber: this.props.initialForm?.phoneNumber ?? '',
    countryID: this.props.initialForm?.countryID ?? this.props.countries[0].id,
    password: this.props.initialForm?.password ?? '',
    confirmedPassword: this.props.initialForm?.confirmedPassword ?? '',
    previous_procedures: this.props.initialForm?.previous_procedures ?? '',
    medicines: this.props.initialForm?.medicines ?? '',
    allergies: this.props.initialForm?.allergies ?? '',
    diseases: this.props.initialForm?.diseases ?? '',
    birthdate: this.props.initialForm?.birthdate ?? '',
    gender: this.props.initialForm?.gender ?? '',
  });

  state = {
    ...this.buildState(),
    showDatePicker: false,
    genders: [
      {value: 'M', label: 'M'},
      {value: 'F', label: 'F'},
    ],
  };

  readonly editing = !!this.props.initialForm;

  reset(): void {
    this.setState(this.buildState());
  }

  render(): ReactNode {
    const {loading, countries, onBack, showPasswordAndEmail} = this.props;
    const {
      name,
      lastName,
      email,
      address,
      phoneNumber,
      password,
      confirmedPassword,
      countryID,
      diseases,
      previous_procedures,
      allergies,
      medicines,
    } = this.state;

    return (
      <View>
        {Platform.OS == 'ios' ? (
          <ModalContainerIOS
            visible={this.state.showDatePicker}
            success={(): void => this.setState({showDatePicker: false})}>
            <_DatepickerContainer
              date={
                this.state.birthdate
                  ? moment(this.state.birthdate, 'DD/MM/YYYY').toDate()
                  : null
              }
              onChange={this.updateKey('birthdate')}
              success={(): void => this.setState({showDatePicker: false})}
            />
          </ModalContainerIOS>
        ) : (
          this.state.showDatePicker && (
            <_DatepickerContainer
              date={
                this.state.birthdate
                  ? moment(this.state.birthdate, 'DD/MM/YYYY').toDate()
                  : null
              }
              onChange={this.updateKey('birthdate')}
              success={(): void => this.setState({showDatePicker: false})}
            />
          )
        )}

        <TextInput
          autoCapitalize="words"
          blurOnSubmit={false}
          editable={!loading}
          onChangeText={this.updateKey('name')}
          placeholder="Nombre"
          returnKeyType="next"
          value={name}
          maxLength={15}
        />
        <TextInput
          autoCapitalize="words"
          blurOnSubmit={false}
          editable={!loading}
          onChangeText={this.updateKey('lastName')}
          placeholder="Apellido"
          returnKeyType="next"
          value={lastName}
          maxLength={15}
        />
        <TextInput
          autoCompleteType="tel"
          editable={!loading}
          keyboardType="phone-pad"
          onChangeText={this.updateKey('phoneNumber')}
          placeholder="Teléfono"
          textContentType="telephoneNumber"
          returnKeyType="next"
          value={phoneNumber}
          maxLength={50}
        />
        {showPasswordAndEmail && (
          <TextInput
            blurOnSubmit={false}
            editable={!loading}
            onChangeText={this.updateKey('email')}
            placeholder="Correo electrónico"
            returnKeyType="next"
            textContentType="username"
            value={email}
            maxLength={100}
          />
        )}
        {showPasswordAndEmail && (
          <>
            <TextInput
              autoCompleteType="password"
              blurOnSubmit={false}
              editable={!loading}
              onChangeText={this.updateKey('password')}
              placeholder={this.editing ? 'Nueva contraseña' : 'Contraseña'}
              returnKeyType="next"
              secureTextEntry
              textContentType="password"
              value={password}
              maxLength={72}
            />
            <TextInput
              autoCompleteType="password"
              editable={!loading}
              onChangeText={this.updateKey('confirmedPassword')}
              onSubmitEditing={this.submit}
              placeholder={
                this.editing
                  ? 'Confirmar nueva contraseña'
                  : 'Confirmar contraseña'
              }
              secureTextEntry
              textContentType="password"
              value={confirmedPassword}
              maxLength={72}
            />
          </>
        )}
        <Picker
          displayValue={countries.find(it => it.id === countryID)?.name ?? ''}
          enabled={!loading}
          onValueChange={this.updateKey('countryID')}
          selectedValue={countryID}>
          {countries.map(({id, name}) => (
            <Picker.Item key={id} label={name} value={id} />
          ))}
        </Picker>
        <Separator />
        <ButtonsContainer onBack={onBack}>
          {loading ? (
            <ActivityIndicator color={Colors.yellow} />
          ) : (
            <Button
              style={[styles.button, styles.yellowButton]}
              titleStyle={styles.whiteTitle}
              title={this.editing ? 'Guardar cambios' : 'Registrar'}
              onPress={this.submit}
            />
          )}
        </ButtonsContainer>
      </View>
    );
  }

  updateKey = <K extends keyof State>(key: K) => (value: State[K]): void =>
    this.setState({...this.state, [key]: value});

  submit = (): void => {
    Keyboard.dismiss();
    this.props.onSubmit(this.state);
  };
}
