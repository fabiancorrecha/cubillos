/* eslint-disable @typescript-eslint/camelcase */
import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Appointment} from 'models/appointment';
import {Record as RecordModel} from 'models/record';
import moment from 'moment';
import React, {Component, ReactElement, ReactNode, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {NavigationStackProp} from 'react-navigation-stack';
import MedicalHistoryService from 'services/admin/medical-history';
import {objectToFormData} from 'services/object-to-form-data';
import Colors from 'utils/colors';
import {OptionsMenu, Text} from 'widgets';
import Button from 'widgets/button';

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
  item: RecordModel;

  onPress: () => void;
  onPressDelete: () => void;
  onPressDownload: (fileUrl: string) => void;
};

const Item = ({
  item: {title, content, created_at, files},

  onPress,
  onPressDelete,
  onPressDownload,
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
          {title}
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
            <View style={{height: 8}} />
            <Text>
              <Text bold>Descripción: </Text>
              {content}
            </Text>
            <View style={{height: 4}} />
            {files.map(({id, file_url}) => (
              <TouchableOpacity
                key={id}
                style={styles.file}
                onPress={(): void => onPressDownload(file_url)}>
                <Text bold numberOfLines={1} style={styles.fileTitle}>
                  {file_url.substring(file_url.lastIndexOf('/') + 1)}
                </Text>
                <Image
                  style={{
                    height: 24,
                    marginStart: 16,
                    tintColor: Colors.blue,
                    width: 24,
                  }}
                  source={Icons.download}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const initialState = {
  isLoading: true,
  isLoadingMore: false,
  data: [] as RecordModel[],
  currentPage: 1,
  lastPage: 1,
};

type State = typeof initialState;

type Props = {
  appointment: Appointment;
  navigation: NavigationStackProp;
};

class Record extends Component<Props, State> {
  state = initialState;

  componentDidMount(): void {
    this.load();
  }

  load = (): void => {
    const {currentPage} = this.state;
    const {appointment} = this.props;

    this.setState({isLoading: true});
    MedicalHistoryService.get({
      page: currentPage,
      id: appointment.user.id,
    })
      .then(({history: {last_page, data}}) => {
        this.setState({
          data,
          lastPage: last_page,
          isLoading: false,
        });
      })
      .catch((err: AxiosError) => {
        console.log('Records: load: ', err);
        this.setState({isLoading: false});
      });
  };

  loadMore = (): void => {
    const {currentPage} = this.state;
    const {appointment} = this.props;

    this.setState({isLoadingMore: true});
    MedicalHistoryService.get({
      id: appointment.user.id,
      page: currentPage + 1,
    })
      .then(({history: {data}}) => {
        this.setState(oldState => ({
          currentPage: oldState.currentPage + 1,
          data: [...oldState.data, ...data],
          isLoadingMore: false,
        }));
      })
      .catch((err: AxiosError) => {
        console.log('Records: load: ', err);
        this.setState({isLoadingMore: false});
      });
  };

  render(): ReactNode {
    const {data, isLoading} = this.state;
    const {navigation, appointment} = this.props;

    return (
      <View
        style={{
          flex: 1,
        }}>
        <FlatList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={this.extractKey}
          refreshControl={
            <RefreshControl refreshing={isLoading} enabled={false} />
          }
          renderItem={this.renderItem}
          ListEmptyComponent={this.renderEmpty}
          ItemSeparatorComponent={this.renderItemSeparator}
          ListFooterComponent={this.renderFooter}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={(): void => {
            navigation.navigate('RecordForm', {
              onSuccess: (
                title: string,
                content: string,
                newFiles: {file: string; type: string; name: string}[],
                deletedFiles: number[],
              ) => {
                this.setState({isLoading: true});

                MedicalHistoryService.create(
                  objectToFormData({
                    title,
                    content,
                    user_id: appointment.user.id,
                    files: newFiles.map(({name, file, type}) => ({
                      name,
                      uri: file,
                      type,
                    })),
                    files_deleted: deletedFiles,
                  }),
                )
                  .then(() => {
                    Toast.show('Se ha creado el historial médico');

                    this.setState(
                      {
                        currentPage: 1,
                      },
                      () => {
                        this.load();
                      },
                    );
                  })
                  .catch(err => {
                    console.log("Record: addButton's onSuccess: ", err);
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
      </View>
    );
  }

  renderItem = ({item}: ListRenderItemInfo<RecordModel>): ReactElement => {
    const {navigation} = this.props;

    return (
      <Item
        {...{item}}
        onPress={(): void => {
          this.setState({isLoading: true});

          navigation.navigate('RecordForm', {
            initialForm: {
              title: item.title,
              content: item.content,
              files: item.files,
            },
            onSuccess: (
              title: string,
              content: string,
              newFiles: {file: string; type: string; name: string}[],
              deletedFiles: number[],
            ) => {
              MedicalHistoryService.edit(
                objectToFormData({
                  title,
                  content,
                  id: item.id,
                  files: newFiles.map(({name, file, type}) => ({
                    name,
                    uri: file,
                    type,
                  })),
                  files_deleted: deletedFiles,
                }),
              )
                .then(() => {
                  Toast.show('Se ha editado el historial médico');

                  this.setState(
                    {
                      currentPage: 1,
                    },
                    () => {
                      this.load();
                    },
                  );
                })
                .catch(err => {
                  console.log("Record: Item's onSuccess: ", err);
                  this.setState({isLoading: false});
                });
            },
          });
        }}
        onPressDelete={(): void => {
          MedicalHistoryService.delete({id: item.id})
            .then(() => {
              Toast.show('Se ha eliminado el registro médico');
              this.setState((oldState: State) => ({
                data: oldState.data.filter(({id}) => id !== item.id),
              }));
            })
            .catch(console.log.bind(console));
        }}
        onPressDownload={(fileUrl: string): void => {
          Linking.openURL(fileUrl);
        }}
      />
    );
  };

  renderEmpty = (): ReactElement | null => {
    const {isLoading} = this.state;

    if (!isLoading) {
      return <Text style={{textAlign: 'center'}}>No hay registros</Text>;
    }

    return null;
  };

  renderFooter = (): ReactElement | null => {
    const {isLoadingMore, lastPage, currentPage} = this.state;

    if (isLoadingMore) {
      return (
        <ActivityIndicator
          color={Colors.yellow}
          style={styles.activityIndicator}
        />
      );
    }

    if (lastPage > currentPage) {
      return (
        <Button
          onPress={this.loadMore}
          style={styles.button}
          textBold
          title="Cargar más"
          titleStyle={styles.buttonTitle}
        />
      );
    }
    return null;
  };

  renderItemSeparator = (): ReactElement => (
    <View style={styles.listSeparator} />
  );

  extractKey = ({id}: RecordModel): string => id.toString();
}

export default Record;
