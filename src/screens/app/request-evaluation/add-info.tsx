/* eslint-disable @typescript-eslint/camelcase */
import {Procedure} from 'models/procedure';
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {axios} from 'services/axios';
import {showAlert, trace} from 'utils';
import Colors from 'utils/colors';
import {Picker, Text, TextInput} from 'widgets';
import Button from 'widgets/button';

// UNITS

enum Type {
  Weight = 1,
  Height,
}

enum Category {
  International = 1,
  American,
}

type Unit = {
  id: number;
  name: string;
  type: Type;
  category: Category;
};

type GetUnitsRequest = {
  type?: Type;
  category?: Category;
};

const getUnits = async (params?: GetUnitsRequest): Promise<Unit[]> => {
  const {data} = await axios.get<Unit[]>('units', {params});
  return data;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  textarea: {
    minHeight: 100,
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
});

const WEIGHT_EXAMPLE = 'e.j. 55,5';
const WEIGHT_ERROR = `Ingrese un peso válido (${WEIGHT_EXAMPLE})`;
const HEIGHT_EXAMPLE = 'e.j. 1,75';
const HEIGHT_ERROR = `Ingrese una altura válida (${HEIGHT_EXAMPLE})`;

const InputContainer = ({children}: {children: ReactNode}): ReactElement => (
  <View style={{flexDirection: 'row', alignItems: 'center'}}>{children}</View>
);

type AddInfoProps = {
  procedures: Set<Procedure>;
  initialInfo?: {
    weight: number;
    height: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  onSubmit: (
    procedures: Set<Procedure>,
    info: {
      weight: number;
      height: number;
      height_unit_id: number;
      weight_unit_id: number;
      bust_size: number;
      hip_measurement: number;
      waist_measurement: number;
    },
  ) => void;
  onBack: () => void;
};

export const AddInfo = ({
  procedures,
  onSubmit,
  onBack,
  initialInfo,
}: AddInfoProps): ReactElement => {
  const [weight, setWeight] = useState(initialInfo?.weight.toString() ?? '');
  const [weightFocused, setWeightFocused] = useState(true);
  const [height, setHeight] = useState(initialInfo?.height.toString() ?? '');
  const [heightFocused, setHeightFocused] = useState(true);
  const [bustSize] = useState(initialInfo?.bust_size.toString() ?? '');
  const [waistMeasurement] = useState(
    initialInfo?.waist_measurement.toString() ?? '',
  );
  const [hipMeasurement] = useState(
    initialInfo?.hip_measurement.toString() ?? '',
  );
  const isWeightValid = (): boolean => !!weight.match(/^\d+(?:[,.]\d+)?$/);
  const heightValid = (): boolean => !!height.match(/^\d+(?:[,.]\d+)?$/);
  const [weightUnitId, setWeightUnitId] = useState(0);
  const [heightUnitId, setHeightUnitId] = useState(0);

  const pay = (): void => {
    if (!isWeightValid()) {
      showAlert('Datos inválidos', WEIGHT_ERROR);
      return;
    }

    if (!heightValid()) {
      showAlert('Datos inválidos', HEIGHT_ERROR);
      return;
    }

    if (!weightUnitId) {
      showAlert('Datos inválidos', 'Debe especificar la unidad de su peso');
      return;
    }

    if (!heightUnitId) {
      showAlert('Datos inválidos', 'Debe especificar la unidad de su altura');
      return;
    }

    onSubmit(procedures, {
      height,
      weight,
      height_unit_id: heightUnitId,
      weight_unit_id: weightUnitId,
      hip_measurement: hipMeasurement,
      waist_measurement: waistMeasurement,
      bust_size: bustSize,
    });
  };

  const back = (): void => {
    onBack();
  };

  const weightRef = useRef<RNTextInput>(null);
  const heightRef = useRef<RNTextInput>(null);
  const descriptionRef = useRef<RNTextInput>(null);

  const [units, setUnits] = useState([] as Unit[]);
  useEffect(() => {
    getUnits()
      .then(setUnits)
      .catch(trace('AddInfo: getUnits:'));
  }, []);

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <SafeAreaView style={styles.container}>
        <InputContainer>
          <TextInput
            blurOnSubmit={false}
            containerStyle={{flex: 1}}
            keyboardType="numeric"
            maxLength={4}
            onBlur={(): void => setWeightFocused(false)}
            onChangeText={setWeight}
            onFocus={(): void => setWeightFocused(true)}
            onSubmitEditing={(): void => heightRef.current?.focus()}
            placeholder={`Peso (${WEIGHT_EXAMPLE})`}
            ref={weightRef}
            returnKeyType="next"
            value={weight}
          />
          <Picker
            containerStyle={{flex: 0.3, marginStart: 16}}
            selectedValue={weightUnitId}
            onValueChange={(weightUnitId: number): void => {
              setWeightUnitId(weightUnitId);
              const category =
                units.find(({id}) => weightUnitId === id)?.category ?? 1;
              setHeightUnitId(
                units.find(
                  unit =>
                    unit.category === category && unit.type === Type.Height,
                )?.id ?? 1,
              );
            }}
            displayValue={
              units.find(({id}) => weightUnitId === id)?.name ?? '-'
            }>
            {[
              <Picker.Item key={0} value={0} label="-" />,
              ...units
                .filter(({type}) => type === Type.Weight)
                .map(({id, name}) => (
                  <Picker.Item key={id} value={id} label={name} />
                )),
            ]}
          </Picker>
        </InputContainer>
        {!isWeightValid() && !weightFocused && (
          <Text style={{color: 'red'}}>{WEIGHT_ERROR}</Text>
        )}
        <InputContainer>
          <TextInput
            blurOnSubmit={false}
            containerStyle={{flex: 1}}
            maxLength={4}
            onBlur={(): void => setHeightFocused(false)}
            onChangeText={setHeight}
            onFocus={(): void => setHeightFocused(true)}
            onSubmitEditing={(): void => descriptionRef.current?.focus()}
            keyboardType="numeric"
            placeholder={`Altura (${HEIGHT_EXAMPLE})`}
            ref={heightRef}
            returnKeyType="next"
            value={height}
          />
          <View style={{flex: 0.3, marginStart: 16}}>
            <TextInput
              editable={false}
              style={{color: 'black'}}
              value={units.find(({id}) => heightUnitId === id)?.name ?? '-'}
            />
          </View>
        </InputContainer>
        {!heightValid() && !heightFocused && (
          <Text style={{color: 'red'}}>{HEIGHT_ERROR}</Text>
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
              onPress={pay}
              title="Siguiente"
              style={styles.button}
              titleStyle={styles.buttonTitle}
              textBold
            />
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};
