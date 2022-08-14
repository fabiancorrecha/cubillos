import {Icons} from 'assets';
import {Procedure} from 'models/procedure';
import {SentPhoto} from 'models/sent-photo';
import React, {FunctionComponent, ReactElement, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {exhaustiveCheck, ImagePickerError, openImagePicker} from 'utils';
import Colors from 'utils/colors';
import {Text} from 'widgets';
import Button from 'widgets/button';
import {MandatoryPhotos} from './choose-photos';

const IMAGE_SIZE = 88;
const INFO_MSG = 'Debe seleccionar máximo 3 fotos (opcional)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentPhotoContainer: {
    flex: 1,
  },
  currentPhoto: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%',
  },
  itemImage: {
    height: IMAGE_SIZE,
    resizeMode: 'cover',
    width: IMAGE_SIZE,
  },
  addPhoto: {
    alignItems: 'center',
    backgroundColor: Colors.blue,
    height: IMAGE_SIZE,
    justifyContent: 'center',
    width: IMAGE_SIZE,
  },
  addPhotoIcon: {
    height: 36,
    width: 36,
  },
  photos: {
    height: IMAGE_SIZE,
  },
  button: {
    backgroundColor: 'white',
    height: 48,
    borderRadius: 24,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButton: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    margin: 8,
    width: 120,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  nextButtonTitle: {
    color: 'white',
    textAlign: 'center',
  },

  backButton: {
    width: 120,
    alignSelf: 'center',
    backgroundColor: Colors.black,
    borderRadius: 100,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  backButtonTitle: {
    color: 'white',
    textAlign: 'center',
  },
});

type ItemProps = {
  photo: SentPhoto;
  selected: boolean;
  onPress: () => void;
};

type ButtonProps = {
  source: ImageSourcePropType;
  onPress: () => void;
};

const FABButton: FunctionComponent<ButtonProps> = ({
  source,
  onPress,
}: ButtonProps) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Image
      source={source}
      style={{width: 24, height: 24, tintColor: Colors.blue}}
    />
  </TouchableOpacity>
);

const Item: FunctionComponent<ItemProps> = ({
  photo: {uri, rotation},
  onPress,
  selected,
}: ItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={selected ? {backgroundColor: 'black'} : {}}>
    <Image
      source={{uri}}
      resizeMode="cover"
      style={[
        styles.itemImage,
        selected ? {opacity: 0.5} : null,
        {transform: [{rotate: `${rotation}deg`}]},
      ]}
    />
  </TouchableOpacity>
);

type ChooseReferencePhotosProps = {
  procedures: Set<Procedure>;
  extraPhotos: SentPhoto[];
  mandatoryPhotos: MandatoryPhotos;
  initialReferencePhotos?: SentPhoto[];
  info: {
    weight: number;
    height: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  onBack: () => void;
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
  ) => void;
};

export const ChooseReferencePhotos = ({
  procedures,
  extraPhotos,
  mandatoryPhotos,
  initialReferencePhotos,
  onSubmit,
  info,
  onBack,
}: ChooseReferencePhotosProps): ReactElement => {
  // TODO: Las fotos podrían representarse con un zipper en vez de un array.

  const [referencePhotos, setReferencePhotos] = useState<SentPhoto[]>(
    initialReferencePhotos || [],
  );
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);

  const addPhoto = (): void => {
    openImagePicker()
      .then(uri => {
        const newReferencePhotos = [{uri, rotation: 0}, ...referencePhotos];
        setReferencePhotos(newReferencePhotos);
        requestAnimationFrame(() => {
          setCurrentPhotoIndex(0);
          flatListRef.current?.scrollToOffset({offset: 0, animated: true});
        });
      })
      .catch((err: ImagePickerError) => {
        switch (err.type) {
          case 'canceled':
            console.log('ChoosePhotos: addPhoto: user canceled');
            break;
          case 'library-error':
            console.log(`ChoosePhotos: addPhoto: library error: ${err.error}`);
            break;
          default:
            exhaustiveCheck(err);
            break;
        }
      });
  };

  const deleteCurrentPhoto = (): void => {
    // Esta función solo se ejecuta si el usuario está viendo una foto,
    // pero el diseño actual no permite expresar esto en el sistema de
    // tipado.
    const index = currentPhotoIndex as number;
    const newReferencePhotos = [...referencePhotos];
    newReferencePhotos.splice(index, 1);

    // Si el arreglo esta vacío, hay que hacer que el índice sea nulo.
    // Este diseño se podría mejorar con un zipper.
    setCurrentPhotoIndex(
      newReferencePhotos.length === 0 ? null : newReferencePhotos.length - 1,
    );
    setReferencePhotos(newReferencePhotos);
  };

  const addRotationToCurrentPhoto = (rotation: number) => (): void => {
    // Esta función solo se ejecuta si el usuario está viendo una foto,
    // pero el diseño actual no permite expresar esto en el sistema de
    // tipado.
    const index = currentPhotoIndex as number;

    const currentPhoto = referencePhotos[index];
    currentPhoto.rotation += rotation;

    const newPhotos = [...referencePhotos];
    newPhotos[index] = currentPhoto;

    setReferencePhotos(newPhotos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.currentPhotoContainer}>
        {currentPhotoIndex !== null ? (
          <>
            <Image
              source={{uri: referencePhotos[currentPhotoIndex].uri}}
              style={[
                styles.currentPhoto,
                {
                  transform: [
                    {
                      rotate: `${referencePhotos[currentPhotoIndex].rotation}deg`,
                    },
                  ],
                },
              ]}
            />
            <View
              style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                flexDirection: 'row',
              }}>
              <FABButton source={Icons.trash} onPress={deleteCurrentPhoto} />
              <View style={{width: 16}} />
              <FABButton
                source={Icons.rotateLeft}
                onPress={addRotationToCurrentPhoto(-90)}
              />
              <View style={{width: 16}} />
              <FABButton
                source={Icons.rotateRight}
                onPress={addRotationToCurrentPhoto(90)}
              />
            </View>
          </>
        ) : (
          <View style={{alignItems: 'center', padding: 24}}>
            <Text style={{textAlign: 'center'}}>{INFO_MSG}</Text>
          </View>
        )}
      </View>
      <View style={styles.photos}>
        <FlatList
          data={referencePhotos}
          ref={flatListRef}
          horizontal
          extraData={currentPhotoIndex}
          keyExtractor={(_, index): string => index.toString()}
          renderItem={({item, index}): ReactElement => (
            <Item
              photo={item}
              selected={currentPhotoIndex === index}
              onPress={(): void => setCurrentPhotoIndex(index)}
            />
          )}
          ListHeaderComponent={
            <TouchableOpacity onPress={addPhoto} style={styles.addPhoto}>
              <Image style={styles.addPhotoIcon} source={Icons.addPhoto} />
            </TouchableOpacity>
          }
        />
      </View>
      <View
        style={{
          alignItems: 'center',
          padding: 16,
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Button
            onPress={onBack}
            style={styles.backButton}
            textBold
            titleStyle={styles.backButtonTitle}
            title="Volver"
          />
          <View style={{width: 32}} />
          <Button
            onPress={(): void => {
              if (referencePhotos.length <= 3) {
                onSubmit(
                  procedures,
                  extraPhotos,
                  mandatoryPhotos,
                  referencePhotos,
                  info,
                );
              } else {
                Toast.show(INFO_MSG);
              }
            }}
            style={styles.nextButton}
            textBold
            titleStyle={styles.nextButtonTitle}
            title="Siguiente"
          />
        </View>
      </View>
    </View>
  );
};
