/* eslint-disable @typescript-eslint/camelcase */
import {Procedure} from 'models/procedure';
import {SentPhoto} from 'models/sent-photo';
import React, {
  ReactElement,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
  TouchableWithoutFeedback,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {showAlert, prop} from 'utils';
import Colors from 'utils/colors';
import {TextInput, Picker} from 'widgets';
import Button from 'widgets/button';
import {MandatoryPhotos} from './choose-photos';
import ModalContainerIOS from 'widgets/modal-container-ios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {UsersService} from 'services';
import {User} from 'models/user';
import {useTypedSelector} from 'reducers';
import Toast from 'react-native-root-toast';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    padding: 48,
  },
  textarea: {
    minHeight: 150,
  },
  button: {
    width: 120,
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonTitle: {
    color: 'white',
    textAlign: 'center',
  },
  buttonBlack: {
    width: 120,
    alignSelf: 'center',
    backgroundColor: Colors.black,
    borderRadius: 100,
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonBlackTitle: {
    color: 'white',
    textAlign: 'center',
  },
  birthdate: {
    backgroundColor: Colors.gray,
    fontSize: 12,
    marginVertical: 12,
    padding: 12,
  },
  textArea: {
    minHeight: 100,
  },
});

const _DatepickerContainer = (props: any) => (
  <DateTimePicker
    locale="es-ES"
    maximumDate={new Date()}
    value={props.date || new Date()}
    mode="date"
    display="default"
    onChange={(_, e) => {
      if (e) {
        if (Platform.OS == 'android') {
          props.success();
        }  
        props.onChange(moment(e).format('DD/MM/YYYY'));
      }
    }}
  />
);

const DESCRIPTION_ERROR = `Ingrese una descripción válida`;

type AddDescriptionProps = {
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  initialDescription?: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  info: {
    weight: number;
    height: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  onSubmit: (
    procedures: Set<Procedure>,
    extraPhotos: SentPhoto[],
    mandatoryPhotos: MandatoryPhotos,
    referencePhotos: SentPhoto[],
    info: {
      weight: number;
      weight_unit_id: number;
      height: number;
      height_unit_id: number;
      bust_size: number;
      hip_measurement: number;
      waist_measurement: number;
    },
    description: {
      description: string;
      medicines?: string;
      previous_procedures?: string;
      birthdate?: string;
      allergies?: string;
      gender?: string;
      diseases?: string;
    },
  ) => void;
  onBack: (
    procedures: Set<Procedure>,
    extraPhotos: SentPhoto[],
    mandatoryPhotos: MandatoryPhotos,
    referencePhotos: SentPhoto[],
    info: {
      weight: number;
      height: number;
      bust_size: number;
      hip_measurement: number;
      waist_measurement: number;
    },
  ) => void;
};

export const AddDescription = ({
  procedures,
  extraPhotos,
  mandatoryPhotos,
  referencePhotos,
  info,
  onSubmit,
  onBack,
  initialDescription,
}: AddDescriptionProps): ReactElement => {
  const genders = [
    {value: 'M', label: 'M'},
    {value: 'F', label: 'F'},
  ];
  const [showDatePicker, setShowDatePicker] = useState(false);
  const user = useTypedSelector(prop('user')) as User;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>([]);

  const [description, setDescription] = useState(
    initialDescription?.description ?? '',
  );

  const [medicines, setMedicines] = useState(
    initialDescription?.medicines ?? '',
  );

  const [allergies, setAllergies] = useState(
    initialDescription?.allergies ?? '',
  );

  const [previousProcedures, setPreviousProcedures] = useState(
    initialDescription?.previous_procedures ?? '',
  );

  const [diseases, setDiseases] = useState(initialDescription?.diseases ?? '');

  const [gender, setGender] = useState(initialDescription?.gender ?? '');

  const [birthdate, setBirthdate] = useState(
    initialDescription?.birthdate ?? '',
  );

  const updateQuestionsBirthdate = (newDate: string): void => {
    if (moment().diff(moment(newDate, 'DD/MM/YYYY'), 'years') < 18) {
      Toast.show('Solo apto para mayores de 18 años');
    } else {
      setBirthdate(newDate);
    }
  };


  const submit = (): void => {
    if (!description) {
      showAlert('Datos inválidos', DESCRIPTION_ERROR);
      return;
    }

    const _birthdate = birthdate
      ? moment(birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD')
      : '';

    onSubmit(procedures, extraPhotos, mandatoryPhotos, referencePhotos, info, {
      description,
      birthdate: _birthdate,
      diseases,
      previous_procedures: previousProcedures,
      gender,
      allergies,
      medicines,
    });
  };

  const back = (): void => {
    onBack(procedures, extraPhotos, mandatoryPhotos, referencePhotos, info);
  };

  const descriptionRef = useRef<RNTextInput>(null);

  const fetchData = useCallback(() => {
    UsersService.getData(user.id)
      .then((data: any) => {
        setLoading(false);
        setData(data);
      })
      .catch((err: any) => console.log(err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <React.Fragment>
      {Platform.OS == 'ios' ? (
        <ModalContainerIOS
          visible={showDatePicker}
          success={() => setShowDatePicker(false)}>
          <_DatepickerContainer
            date={birthdate ? moment(birthdate, 'DD/MM/YYYY').toDate() : null}
            onChange={updateQuestionsBirthdate}
            success={() => setShowDatePicker(false)}
          />
        </ModalContainerIOS>
      ) : (
        showDatePicker && (
          <_DatepickerContainer
            date={birthdate ? moment(birthdate, 'DD/MM/YYYY').toDate() : null}
            onChange={updateQuestionsBirthdate}
            success={() => setShowDatePicker(false)}
          />
        )
      )}

      <ScrollView keyboardShouldPersistTaps="always">
        <SafeAreaView style={styles.container}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <React.Fragment>
              <TextInput
                maxLength={150}
                multiline
                numberOfLines={5}
                onChangeText={setDescription}
                placeholder="Descripción"
                ref={descriptionRef}
                textAlignVertical="top"
                value={description}
                style={styles.textarea}
              />
              {!data.previous_procedures && (
                <TextInput
                  textAlignVertical="top"
                  onChangeText={setPreviousProcedures}
                  placeholder="Procedimientos quirúrgicos anteriores"
                  value={previousProcedures}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              )}
              {!data.diseases && (
                <TextInput
                  textAlignVertical="top"
                  onChangeText={setDiseases}
                  placeholder="¿Padece de alguna enfermedad?"
                  value={diseases}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              )}
              {!data.medicines && (
                <TextInput
                  textAlignVertical="top"
                  onChangeText={setMedicines}
                  placeholder="¿Toma algún medicamento?"
                  value={medicines}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              )}
              {!data.allergies && (
                <TextInput
                  textAlignVertical="top"
                  onChangeText={setAllergies}
                  placeholder="¿Es alérgico a algún medicamento?"
                  value={allergies}
                  multiline={true}
                  numberOfLines={5}
                  style={styles.textArea}
                />
              )}
              {!data.birthdate && (
                <TouchableWithoutFeedback
                  onPress={() => {
                    setShowDatePicker(true);
                  }}>
                  <View>
                    <Text style={{fontWeight: 'bold'}}>
                      Fecha de Nacimiento
                    </Text>
                    <View style={styles.birthdate}>
                      <Text>{birthdate}</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
              {!data.gender && (
                <View>
                  <Text style={{fontWeight: 'bold'}}>Género</Text>
                  <Picker
                    displayValue={gender}
                    onValueChange={(e: any) => {
                      if (e != '') {
                        setGender(e);
                      }
                    }}
                    selectedValue={gender}>
                    <Picker.Item value={''} label={'Seleccione'} />
                    {/* */}
                    {genders.map((i: any) => (
                      <Picker.Item
                        key={i.value.toString()}
                        value={i.value}
                        label={i.label}
                      />
                    ))}
                  </Picker>
                </View>
              )}
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 0.5}}>
                  <Button
                    onPress={back}
                    title="Volver"
                    style={styles.buttonBlack}
                    titleStyle={styles.buttonBlackTitle}
                    textBold
                  />
                </View>
                <View style={{flex: 0.5}}>
                  <Button
                    onPress={submit}
                    title="Siguiente"
                    style={styles.button}
                    titleStyle={styles.buttonTitle}
                    textBold
                  />
                </View>
              </View>
            </React.Fragment>
          )}
        </SafeAreaView>
      </ScrollView>
    </React.Fragment>
  );
};
