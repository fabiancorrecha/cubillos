/* eslint-disable @typescript-eslint/camelcase */

import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {emit} from 'jetemit';
import {Appointment} from 'models/appointment';
import {Prescription, PrescriptionDetails} from 'models/prescription';
import moment from 'moment';
import React, {Component, ReactElement, ReactNode, useState} from 'react';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {NavigationStackProp} from 'react-navigation-stack';
import RNFetchBlob from 'rn-fetch-blob';
import AppointmentsService from 'services/admin/appointments';
import Colors from 'utils/colors';
import {OptionsMenu, Text} from 'widgets';

const styles = StyleSheet.create({
  activityIndicator: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  buttonTitle: {
    color: 'white',
  },
  list: {
    paddingBottom: 88,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listSeparator: {
    height: 16,
  },
  itemContainer: {
    borderRadius: 8,
    backgroundColor: Colors.gray,
    alignItems: 'center',

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
  itemText: {
    color: Colors.blue,
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  file: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  fileTitle: {
    color: Colors.blue,
    flex: 1,
  },
  fileIcon: {},
  addButton: {
    // Alinear el botón en la parte inferior.
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{translateX: -56 / 2}],

    // Alinear el icono en el centro.
    alignItems: 'center',
    justifyContent: 'center',

    // Tamaño y color.
    height: 56,
    width: 56,
    backgroundColor: Colors.yellow,
    borderRadius: 100,

    // Sombra.
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

type ItemProps = {
  item: Prescription;

  onPress: () => void;
  onPressDelete: () => void;
  onPressDownload: () => void;
  onPressSend: () => void;
};

const Item = ({
  item: {details, created_at},

  onPress,
  onPressDownload,
  onPressDelete,
  onPressSend,
}: ItemProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = (): void => setIsExpanded(prevIsExpanded => !prevIsExpanded);

  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <OptionsMenu
          options={[
            {
              label: 'Eliminar',
              action: onPressDelete,
            },
            {
              label: 'Descargar',
              action: onPressDownload,
            },
            {
              label: 'Enviar por correo',
              action: onPressSend,
            },
          ]}>
          <View style={{alignItems: 'center', flexDirection: 'row'}}>
            <Image
              source={Icons.options}
              style={{
                width: 16,
                height: 16,
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
        </OptionsMenu>
        <Text style={styles.itemText} bold>
          Medicamentos: {details.length}
        </Text>
        <TouchableOpacity onPress={toggle}>
          <Image
            source={Icons.dropDown}
            style={{height: 16, width: 16, margin: 16}}
          />
        </TouchableOpacity>
      </View>
      {isExpanded && (
        <View style={{width: '100%', paddingHorizontal: 16, paddingBottom: 16}}>
          <View
            style={{
              backgroundColor: Colors.gray2,
              height: 1,
              width: '100%',
              marginBottom: 8,
            }}
          />
          <View style={{marginTop: 8}}>
            <Text>
              <Text bold>Fecha: </Text>
              {moment(created_at).format('LLL')}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

type Props = {
  appointment: Appointment;
  navigation: NavigationStackProp;
};

const initialState = {
  isLoading: false,
};

type State = typeof initialState;

class Prescriptions extends Component<Props, State> {
  state = initialState;

  render(): ReactNode {
    const {appointment, navigation} = this.props;
    const {isLoading} = this.state;

    return (
      <View style={{flex: 1}}>
        <FlatList
          contentContainerStyle={styles.list}
          data={appointment.prescriptions}
          keyExtractor={this.extractKey}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl enabled={false} refreshing={isLoading} />
          }
          ListEmptyComponent={this.renderEmpty}
          ItemSeparatorComponent={this.renderItemSeparator}
        />
        {appointment.status === 'confirmed' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={(): void => {
              navigation.navigate('PrescriptionForm', {
                onSuccess: (newDetails: PrescriptionDetails[]) => {
                  this.setState({isLoading: true});

                  AppointmentsService.createRecipe({
                    appointment_id: appointment.id,
                    details: newDetails,
                  })
                    .then(({recipes}) => {
                      this.setState({isLoading: false});
                      Toast.show('Se ha creado la receta');
                      emit('PRESCRIPTIONS_UPDATED', {
                        appointmentId: appointment.id,
                        prescriptions: recipes,
                      });
                    })
                    .catch(err => {
                      console.log("Prescriptions: addButton's onPress:", err);
                      this.setState({isLoading: false});
                    });
                },
              });
            }}>
            <Image
              source={Icons.add}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
                tintColor: 'black',
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderItem = ({item}: ListRenderItemInfo<Prescription>): ReactElement => {
    const {navigation, appointment} = this.props;

    return (
      <Item
        {...{item}}
        onPress={(): void => {
          navigation.navigate('PrescriptionForm', {
            details: [...item.details],
            onSuccess: (newDetails: PrescriptionDetails[]) => {
              this.setState({isLoading: true});

              AppointmentsService.createRecipe({
                appointment_id: appointment.id,
                details: newDetails,
                id: item.id,
              })
                .then(({recipes}) => {
                  this.setState({isLoading: false});
                  Toast.show('Se ha actualizado la receta');
                  emit('PRESCRIPTIONS_UPDATED', {
                    appointmentId: appointment.id,
                    prescriptions: recipes,
                  });
                })
                .catch(err => {
                  console.log("Prescriptions: Item's onPress:", err);
                  this.setState({isLoading: false});
                });
            },
          });
        }}
        onPressDelete={(): void => {
          this.setState({isLoading: true});

          AppointmentsService.deleteRecipe({id: item.id})
            .then(() => {
              this.setState({isLoading: false});
              emit('PRESCRIPTION_DELETED', item.id);
              Toast.show('Se ha eliminado la receta');
            })
            .catch((err: AxiosError) => {
              this.setState({isLoading: false});
              console.log('Prescriptions: ', err);
            });
        }}
        onPressDownload={(): void => {
          this.setState({isLoading: true});

          AppointmentsService.print({id: item.id})
            .then(({url, name}) => {
              const path = `${RNFetchBlob.fs.dirs.DownloadDir}/${name.substring(
                name.lastIndexOf('/') + 1,
              )}`;

              RNFetchBlob.config({
                path,
                addAndroidDownloads: {
                  mime: 'application/pdf',
                  path,
                  useDownloadManager: true,
                  notification: true,
                },
              })
                .fetch('GET', url)
                .then(resp => {
                  switch (Platform.OS) {
                    case 'android':
                      RNFetchBlob.android.actionViewIntent(
                        resp.path(),
                        'application/pdf',
                      );
                      break;

                    case 'ios':
                      RNFetchBlob.ios.openDocument(resp.path());
                      break;

                    default:
                      console.warn(
                        'Opening files is not implemented for this OS',
                      );
                      break;
                  }

                  return AppointmentsService.deletePrint({name});
                })
                .then(() => {
                  this.setState({isLoading: false});
                })
                .catch(err => {
                  this.setState({isLoading: false});
                  console.log('Prescriptions: onPressDownload#1: ', err);
                });
            })
            .catch(err => {
              this.setState({isLoading: false});
              console.log('Prescriptions: onPressDownload#2: ', err);
            });
        }}
        onPressSend={(): void => {
          this.setState({isLoading: true});

          const {
            appointment: {
              user: {email},
            },
          } = this.props;
          AppointmentsService.send({
            id: item.id,
            email,
          })
            .then(() => {
              Toast.show('Se ha enviado el correo electrónico');
              this.setState({isLoading: false});
            })
            .catch(err => {
              console.log('Prescriptions: onPressSend: ', err);
              Toast.show(
                'Ha ocurrido un error al enviar el correo electrónico',
              );
              this.setState({isLoading: false});
            });
        }}
      />
    );
  };

  renderEmpty = (): ReactElement => (
    <Text style={{textAlign: 'center'}}>No hay registros</Text>
  );

  renderItemSeparator = (): ReactElement => (
    <View style={styles.listSeparator} />
  );

  extractKey = ({id}: Prescription): string => id.toString();
}

export default Prescriptions;
