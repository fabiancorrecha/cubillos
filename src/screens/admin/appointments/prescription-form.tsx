import {Icons} from 'assets';
import {PrescriptionDetails as PrescriptionDetailsModel} from 'models/prescription';
import React, {Component, ReactNode} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationEvents, NavigationRoute} from 'react-navigation';
import {NavigationStackProp} from 'react-navigation-stack';
import Colors from 'utils/colors';
import {Header, Text, TextInput} from 'widgets';
import Button from 'widgets/button';
import Toast from 'react-native-root-toast';

type PrescriptionDetails = Omit<PrescriptionDetailsModel, 'id'>;

const styles = StyleSheet.create({
  addDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
    paddingStart: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray,
    marginBottom: 16,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  addDetailsTitle: {
    color: Colors.blue,
    flex: 1,
  },
  addDetailsIcon: {
    height: 24,
    marginStart: 16,
    marginEnd: 12,
    marginVertical: 8,
    tintColor: Colors.blue,
    width: 24,
  },
  details: {
    borderRadius: 8,
    backgroundColor: Colors.gray,
    alignItems: 'center',
    marginBottom: 16,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  detailsText: {
    color: Colors.blue,
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  detailsButton: {
    tintColor: Colors.blue,
    height: 16,
    width: 16,
    margin: 16,
  },
});

type SuccessFunc = (details: PrescriptionDetails[]) => void;

type IndicationProps = PrescriptionDetails & {
  onChangeName: (title: string) => void;
  onChangeDetails: (description: string) => void;
  onPressDelete: () => void;
};

const Details = ({
  name,
  indications,
  onChangeDetails,
  onChangeName,
  onPressDelete,
}: IndicationProps) => (
  <View style={[styles.details, {flexDirection: 'column'}]}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity onPress={onPressDelete}>
        <View style={{alignItems: 'center', flexDirection: 'row'}}>
          <Image
            source={Icons.trash}
            style={{
              tintColor: Colors.blue,
              width: 20,
              height: 20,
              marginVertical: 12,
              marginStart: 12,
              marginEnd: 6,
            }}
          />
          <View
            style={{
              backgroundColor: Colors.gray2,
              height: 20,
              width: 1,
              marginEnd: 12,
            }}
          />
        </View>
      </TouchableOpacity>
      <View style={{flex: 1}}>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.gray2,
            marginEnd: 16,
          }}
          numberOfLines={1}
          onChangeText={onChangeName}
          placeholder="Nombre"
          value={name}
        />
      </View>
    </View>
    <TextInput
      numberOfLines={1}
      onChangeText={onChangeDetails}
      placeholder="Indicaciones"
      containerStyle={{
        width: '100%',
      }}
      style={{
        marginHorizontal: 16,
        marginTop: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray2,
      }}
      value={indications}
    />
  </View>
);

type Params = {
  onSuccess: SuccessFunc;
  details: PrescriptionDetails[];
};

type Props = {
  navigation: NavigationStackProp<NavigationRoute<Params>, Params>;
};

const initialState = {
  isEditing: false,
  details: [] as PrescriptionDetails[],
};

type State = typeof initialState;

export class PrescriptionForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {navigation} = props;
    this.state = {
      details: navigation.getParam('details')?.slice() ?? [],
      isEditing: !!navigation.getParam('details'),
    };
  }

  render(): ReactNode {
    const {navigation} = this.props;
    const {details, isEditing} = this.state;
    const onSuccess = navigation.getParam('onSuccess');

    return (
      <View style={{height: '100%'}}>
        <NavigationEvents
          onDidFocus={() => {
            const {navigation} = this.props;
            this.setState({
              details: navigation.getParam('details')?.slice() ?? [],
              isEditing: !!navigation.getParam('details'),
            });
          }}
        />
        <Header
          icon={Icons.menu.appointments}
          navigation={navigation}
          title={isEditing ? 'Editar receta' : 'Crear receta'}
        />
        <ScrollView
          contentContainerStyle={{padding: 16}}
          keyboardShouldPersistTaps="always">
          <TouchableOpacity
            onPress={(): void => {
              this.setState((prevState: State) => ({
                details: [{name: '', indications: ''}, ...prevState.details],
              }));
            }}
            style={styles.addDetails}>
            <Text bold numberOfLines={1} style={styles.addDetailsTitle}>
              Añadir
            </Text>
            <Image style={styles.addDetailsIcon} source={Icons.add} />
          </TouchableOpacity>
          {details.map((details, idx) => (
            <Details
              {...details}
              key={idx}
              onPressDelete={(): void => {
                this.setState((prevState: State) => ({
                  details: [
                    ...prevState.details.slice(0, idx),
                    ...prevState.details.slice(idx + 1),
                  ],
                }));
              }}
              onChangeName={newName => {
                this.setState((prevState: State) => {
                  const newDetails = [...prevState.details];
                  newDetails[idx] = {
                    ...newDetails[idx],
                    name: newName,
                  };

                  return {details: newDetails};
                });
              }}
              onChangeDetails={newIndications => {
                this.setState((prevState: State) => {
                  const newDetails = [...prevState.details];
                  newDetails[idx] = {
                    ...newDetails[idx],
                    indications: newIndications,
                  };

                  return {details: newDetails};
                });
              }}
            />
          ))}
          <Button
            title="Guardar"
            style={{
              alignSelf: 'center',
              backgroundColor: Colors.yellow,
              borderRadius: 100,
              paddingVertical: 8,
              marginBottom: 10,
              paddingHorizontal: 16,
            }}
            titleStyle={{
              color: 'white',
            }}
            textBold
            onPress={(): void => {
              if (!details.length) {
                Toast.show('Debe ingresar al menos un medicamento');
                return;
              }

              if (
                details.some(({name, indications}) => !name || !indications)
              ) {
                Toast.show('Debe ingresar todos los datos de la receta');
                return;
              }

              onSuccess(details);
              navigation.goBack();
            }}
          />
        </ScrollView>
      </View>
    );
  }
}
