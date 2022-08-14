import {Icons} from 'assets';
import {Procedure} from 'models/procedure';
import {SentPhoto} from 'models/sent-photo';
import React, {FunctionComponent, ReactElement} from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationScreenProp, SafeAreaView} from 'react-navigation';
import {prop} from 'utils';
import Colors from 'utils/colors';
import {Text} from 'widgets';
import Button from 'widgets/button';
import {MandatoryPhotos} from './choose-photos';

const styles = StyleSheet.create({
  outlineButton: {
    backgroundColor: Colors.blue,
    borderRadius: 56,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  outlineButtonIcon: {
    width: 24,
    height: 24,
    marginEnd: 6,
    tintColor: Colors.yellow,
  },
  outlineButtonTitle: {
    color: 'white',
  },
  container: {
    padding: 16,
    alignItems: 'center',
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

const Separator: FunctionComponent = () => <View style={{height: 8}} />;

type ButtonProps = {
  icon: ImageSourcePropType;
  title: string;
  onPress: () => void;
};

const OutlineButton: FunctionComponent<ButtonProps> = ({
  icon,
  title,
  onPress,
}: ButtonProps) => (
  <TouchableOpacity style={{alignSelf: 'center'}} onPress={onPress}>
    <View style={styles.outlineButton}>
      <Image style={styles.outlineButtonIcon} source={icon} />
      <Text bold style={styles.outlineButtonTitle}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

type AddDescriptionProps = {
  navigation: NavigationScreenProp<{}>;
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  referencePhotos: SentPhoto[];
  info: {
    weight: number;
    weight_unit_id: number;
    height: number;
    height_unit_id: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  description: {
    description: string;
    medicines?: string;
    previous_procedures?: string;
    birthdate?: string;
    allergies?: string;
    gender?: string;
    diseases?: string;
  };
  onSubmit: (
    procedures: Set<Procedure>,
    photos: SentPhoto[],
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
};

export const Verified = ({
  procedures,
  extraPhotos,
  mandatoryPhotos,
  referencePhotos,
  info,
  onSubmit,
  description,
  onBack,
  navigation,
}: AddDescriptionProps): ReactElement => {
  const pay = (): void => {
    const photos = mandatoryPhotos
      ? [
        ...(Object.values(mandatoryPhotos).filter(
          it => it !== null,
        ) as SentPhoto[]),
        ...extraPhotos,
      ]
      : [];
    onSubmit(
      procedures,
      photos,
      extraPhotos,
      mandatoryPhotos,
      referencePhotos,
      info,
      description,
    );
  };

  const back = (): void => {
    onBack(
      procedures,
      extraPhotos,
      mandatoryPhotos,
      referencePhotos,
      info,
      description,
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="always">
      <SafeAreaView style={styles.container}>
        <Text
          bold
          style={{fontSize: 16, color: Colors.blue, textAlign: 'center'}}>
          Verifique sus datos
        </Text>
        <Separator />
        <OutlineButton
          title="Ver fotos actuales"
          icon={Icons.view}
          onPress={(): void => {
            navigation.navigate('ViewImages', {
              images: Object.values(mandatoryPhotos)
                .filter(it => it !== null)
                .map(photo => (photo as SentPhoto).uri)
                .concat(extraPhotos.map(prop('uri'))),
              title: 'Fotos actuales',
            });
          }}
        />
        <Separator />
        {referencePhotos.length > 0 && (
          <>
            <OutlineButton
              title="Más fotos (opcional)"
              icon={Icons.view}
              onPress={(): void => {
                navigation.navigate('ViewImages', {
                  images: referencePhotos.map(prop('uri')),
                  title: 'Más fotos',
                });
              }}
            />
            <Separator />
          </>
        )}
        <View
          style={{
            width: '66%',
          }}>
          <Text>
            <Text style={{color: 'black'}} bold>
              Operaciones:
            </Text>
            {Array.from(procedures)
              .map(prop('name'))
              .join(', ')}
          </Text>
          <Text>
            <Text style={{color: 'black'}} bold>
              Estatura:
            </Text>{' '}
            {info.height} m
          </Text>
          <Text>
            <Text style={{color: 'black'}} bold>
              Peso:
            </Text>{' '}
            {info.weight} kg
          </Text>
          {/*<Text>
            <Text style={{color: 'black'}} bold>
              Tamaño de busto:
            </Text>{' '}
            {info.bust_size} cm
          </Text>
          <Text>
            <Text style={{color: 'black'}} bold>
              Medida de cadera:
            </Text>{' '}
            {info.hip_measurement} cm
          </Text>
          <Text>
            <Text style={{color: 'black'}} bold>
              Medida de cintura:
            </Text>{' '}
            {info.waist_measurement} cm
          </Text>*/}
          <Text>
            <Text style={{color: 'black'}} bold>
              Descripción:
            </Text>{' '}
            {description.description}
          </Text>
        </View>
        <Separator />
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
              title="Pagar"
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
