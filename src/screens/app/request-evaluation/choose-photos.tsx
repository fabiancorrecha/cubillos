import {Icons, Images} from 'assets';
import {Procedure} from 'models/procedure';
import {SentPhoto} from 'models/sent-photo';
import React, {FunctionComponent, ReactElement, useRef, useState, useEffect, useCallback} from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import Toast from 'react-native-root-toast';
import {exhaustiveCheck, ImagePickerError, openImagePicker, showAlert} from 'utils';
import Colors from 'utils/colors';
import {Text} from 'widgets';
import Button from 'widgets/button';
import { TypePhotoService } from 'services';

const IMAGE_SIZE = 88;

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
  emptyContainer: {
    justifyContent: 'center',
    padding: 48,
  },
  itemImage: {
    height: IMAGE_SIZE,
    resizeMode: 'cover',
    width: IMAGE_SIZE,
  },
  mandatoryItem: {
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    backgroundColor: '#393a3c',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  addPhoto: {
    alignItems: 'center',
    height: IMAGE_SIZE,
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    width: IMAGE_SIZE,
  },
  addPhotoIcon: {
    height: 48,
    width: 48,
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

// export type MandatoryPhotos = {
//   back: SentPhoto | null;
//   faceLeft: SentPhoto | null;
//   face: SentPhoto | null;
//   faceRight: SentPhoto | null;
//   front: SentPhoto | null;
//   sideLeft: SentPhoto | null;
//   sideRight: SentPhoto | null;
//   waist: SentPhoto | null;
// };

interface SentPhotoNew extends SentPhoto {
  photo_id?: number
}

export type MandatoryPhotos = (SentPhotoNew | null)[];

// const getMandatoryPhotoDisplayName = (name: keyof MandatoryPhotos): string => {
//   switch (name) {
//     case 'front':
//       return 'Frente';

//     case 'back':
//       return 'Espalda';

//     case 'waist':
//       return 'Cintura';

//     case 'sideLeft':
//       return 'Lateral Izq';

//     case 'sideRight':
//       return 'Lateral Dr';

//     case 'face':
//       return 'Rostro';

//     case 'faceLeft':
//       return 'Perfil Izq';

//     case 'faceRight':
//       return 'Perfil Dr';

//     default:
//       exhaustiveCheck(name);
//       return name;
//   }
// };

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

type ItemProps = {
  photo: SentPhoto;
  selected: boolean;
  onPress: () => void;
};

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

// type MandatoryItemProps = {
//   selected: boolean;
//   onPress: () => void;
//   type: keyof MandatoryPhotos;
//   loaded: boolean;
// };

// const MandatoryItem: FunctionComponent<MandatoryItemProps> = ({
//   type,
//   onPress,
//   selected,
//   loaded,
// }: MandatoryItemProps) => (
//   <TouchableOpacity
//     onPress={onPress}
//     style={[styles.mandatoryItem, selected ? {backgroundColor: 'black'} : {}]}>
//     <Image
//       source={Images.photos[type]}
//       resizeMode="cover"
//       style={{width: 48, height: 48}}
//     />
//     <Text style={{color: Colors.gray}} bold>
//       {getMandatoryPhotoDisplayName(type)}
//     </Text>
//     {loaded && (
//       <View
//         style={{
//           backgroundColor: Colors.yellow,
//           width: 4,
//           height: 4,
//           borderRadius: 16,
//           position: 'absolute',
//           right: 8,
//           top: 8,
//         }}
//       />
//     )}
//   </TouchableOpacity>
// );

const MandatoryItem = (props: any) => (
  <TouchableOpacity
    onPress={props.onPress}
    style={[styles.mandatoryItem,props.selected ? {backgroundColor: 'black'} : {}]}>
    <Image
      source={ { uri: props.item.icon_url } }
      resizeMode="cover"
      style={{width: 48, height: 48, marginTop: 3}}
    />
    <Text style={{
      color: Colors.gray,
      fontSize: 8,
      textAlign: 'center',
      width: '90%',
      alignSelf: 'center',
      marginVertical: 3
    }} bold>
      { props.item.name }
    </Text>
    {props.loaded && (
      <View
        style={{
          backgroundColor: Colors.yellow,
          width: 4,
          height: 4,
          borderRadius: 16,
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      />
    )}
  </TouchableOpacity>
);

type ChoosePhotosProps = {
  procedures: Set<Procedure>;
  info: {
    weight: number;
    height: number;
    bust_size: number;
    hip_measurement: number;
    waist_measurement: number;
  };
  initialExtraPhotos?: SentPhoto[];
  initialMandatoryPhotos?: MandatoryPhotos;
  onSubmit: (
    procedures: Set<Procedure>,
    extraPhotos: SentPhoto[],
    mandatoryPhotos: MandatoryPhotos,
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
  onBack: () => void;
};

export const ChoosePhotos = ({
  procedures,
  info,
  initialExtraPhotos,
  initialMandatoryPhotos,
  onSubmit,
  onBack,
}: ChoosePhotosProps): ReactElement => {
  // TODO: Las fotos podrían representarse con un zipper en vez de un array.

  const [photos, setPhotos] = useState<SentPhoto[]>(initialExtraPhotos || []);
  const [typePhotos, setTypePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(
    null,
  );

  if (!initialMandatoryPhotos) {
    initialMandatoryPhotos = [];
  }

  const [mandatoryPhotos, setMandatoryPhotos] = useState<MandatoryPhotos>([]);
  const [currentMandatoryPhoto, setCurrentMandatoryPhoto] = useState<
    number | null
  >(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const addPhoto = (): void => {
    openImagePicker()
      .then(uri => {
        const newPhotos = [...photos, {uri, rotation: 0}];
        setPhotos(newPhotos);
        requestAnimationFrame(() => {
          setCurrentPhotoIndex(0);
          setCurrentMandatoryPhoto(null);
          scrollViewRef.current?.scrollToEnd();
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
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);

    // Si el arreglo esta vacío, hay que hacer que el índice sea nulo.
    // Este diseño se podría mejorar con un zipper.
    setCurrentPhotoIndex(newPhotos.length === 0 ? null : newPhotos.length - 1);
    setCurrentMandatoryPhoto(null);
    setPhotos(newPhotos);
  };

  const addRotationToCurrentPhoto = (rotation: number) => (): void => {
    // Esta función solo se ejecuta si el usuario está viendo una foto,
    // pero el diseño actual no permite expresar esto en el sistema de
    // tipado.
    const index = currentPhotoIndex as number;

    const currentPhoto = photos[index];
    currentPhoto.rotation += rotation;

    const newPhotos = [...photos];
    newPhotos[index] = currentPhoto;

    setPhotos(newPhotos);
  };

  const fetchPhotos = useCallback(() => {
    TypePhotoService.get([...procedures].map(i => i.id))
      .then(data => {
        setTypePhotos(data.photos);
        setLoading(false);

        if (initialMandatoryPhotos) {
          let _data: (SentPhotoNew | null)[] = [];
          data.photos.forEach((item: any, _index: number) => {
            if (initialMandatoryPhotos) {
              const index: number = initialMandatoryPhotos.findIndex((i: any) => i.photo_id == item.id);
              if (index != -1) {
                _data[_index] = initialMandatoryPhotos[index];
              }
            }            
          });
          setMandatoryPhotos(_data);
        }
      })
      .catch((err: any) => console.log(err));
  }, [procedures]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <React.Fragment>
      {
        !loading && (
          <View style={styles.container}>
            <View style={styles.currentPhotoContainer}>
              {currentPhotoIndex !== null && (
                <React.Fragment>
                  <Image
                    source={{uri: photos[currentPhotoIndex].uri}}
                    style={[
                      styles.currentPhoto,
                      {
                        transform: [
                          {rotate: `${photos[currentPhotoIndex].rotation}deg`},
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
                </React.Fragment>
              )}
              {currentMandatoryPhoto !== null && (
                <React.Fragment>
                  <Image
                    source={{uri: mandatoryPhotos[currentMandatoryPhoto]?.uri}}
                    style={[
                      styles.currentPhoto,
                      {
                        transform: [
                          {
                            rotate: `${mandatoryPhotos[currentMandatoryPhoto]?.rotation}deg`,
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
                    <FABButton
                      source={Icons.trash}
                      onPress={(): void => {
                        const newMandatoryPhotos = {...mandatoryPhotos};
                        newMandatoryPhotos[currentMandatoryPhoto] = null;
                        setCurrentMandatoryPhoto(null);
                        setMandatoryPhotos(newMandatoryPhotos);
                      }}
                    />
                    <View style={{width: 16}} />
                    <FABButton
                      source={Icons.rotateLeft}
                      onPress={(): void => {
                        const newMandatoryPhotos = {...mandatoryPhotos};
                        const newPhoto = newMandatoryPhotos[
                          currentMandatoryPhoto
                        ] as SentPhoto;
                        newPhoto.rotation += 90;
                        newMandatoryPhotos[currentMandatoryPhoto] = newPhoto;
                        setMandatoryPhotos(newMandatoryPhotos);
                      }}
                    />
                    <View style={{width: 16}} />
                    <FABButton
                      source={Icons.rotateRight}
                      onPress={(): void => {
                        const newMandatoryPhotos = {...mandatoryPhotos};
                        const newPhoto = newMandatoryPhotos[
                          currentMandatoryPhoto
                        ] as SentPhoto;
                        newPhoto.rotation -= 90;
                        newMandatoryPhotos[currentMandatoryPhoto] = newPhoto;
                        setMandatoryPhotos(newMandatoryPhotos);
                      }}
                    />
                  </View>
                </React.Fragment>
              )}
            </View>
            <View style={styles.photos}>
              <ScrollView horizontal ref={scrollViewRef}>
                {/* MANDATORY PHOTOS */}
                {typePhotos.map((item: any,index: number) => (
                  <MandatoryItem
                    key={ index }
                    item={ item }
                    loaded={ !!mandatoryPhotos[index] }
                    selected={ currentMandatoryPhoto === index }
                    onPress={(): void => {
                      if (!mandatoryPhotos[index]) {
                        openImagePicker()
                          .then(uri => {
                            const newMandatoryPhotos = {
                              ...mandatoryPhotos,
                            };
                            newMandatoryPhotos[index] = {
                              uri,
                              rotation: 0,
                            };
                            setMandatoryPhotos(newMandatoryPhotos);
                            requestAnimationFrame(() => {
                              setCurrentPhotoIndex(null);
                              setCurrentMandatoryPhoto(index);
                            });
                          })
                          .catch((err: ImagePickerError) => {
                            switch (err.type) {
                              case 'canceled':
                                console.log('ChoosePhotos: addPhoto: user canceled');
                                break;
                              case 'library-error':
                                console.log(
                                  `ChoosePhotos: addPhoto: library error: ${err.error}`,
                                );
                                break;
                              default:
                                exhaustiveCheck(err);
                                break;
                            }
                          });

                        return;
                      }

                      setCurrentPhotoIndex(null);
                      setCurrentMandatoryPhoto(index);
                    }}
                  />
                ))}

                {/* EXTRA PHOTOS */}
                {/*photos.map((item, index) => (
                  <Item
                    key={index}
                    photo={item}
                    selected={currentPhotoIndex === index}
                    onPress={(): void => {
                      setCurrentMandatoryPhoto(null);
                      setCurrentPhotoIndex(index);
                    }}
                  />
                ))*/}

                {/* ADD EXTRA PHOTO */}
                {/* <TouchableOpacity onPress={addPhoto} style={styles.addPhoto}>
                  <Image style={{width: 48, height: 48}} source={Icons.addPhoto} />
                  <Text style={{color: Colors.gray}} bold>
                    Extra
                  </Text>
                </TouchableOpacity> */}
              </ScrollView>
            </View>
            <View
              style={{
                alignItems: 'center',
                padding: 16,
              }}>
              <Text>Carga las fotos de tu apariencia actual</Text>
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
                    if (typePhotos.length > Object.values(mandatoryPhotos).filter((i: any) => i != null).length) {
                      showAlert('Alerta','Debe cargar todas las imagenes para continuar');
                      return;
                    }

                    let data: (SentPhotoNew | null)[] = Object.values(mandatoryPhotos);

                    data.forEach((item: (SentPhotoNew | null), index) => {
                      if (item) {
                        // @ts-ignore
                        item.photo_id = typePhotos[index].id;
                      }
                    });

                    onSubmit(procedures, photos, data, info);
                  }}
                  style={styles.nextButton}
                  textBold
                  titleStyle={styles.nextButtonTitle}
                  title="Siguiente"
                />
              </View>
            </View>
          </View>
        )
      }

      {
        loading && (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" />
          </View>
        )
      }      
    </React.Fragment>
  );
};
