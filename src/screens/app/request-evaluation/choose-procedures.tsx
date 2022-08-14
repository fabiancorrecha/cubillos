import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Procedure} from 'models/procedure';
import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text as RNText
} from 'react-native';
import Toast from 'react-native-root-toast';
import {ProceduresService, TreatmentService} from 'services';
import Colors from 'utils/colors';
import {Text} from 'widgets';
import Button from 'widgets/button';
import {PUBLIC_URL} from 'react-native-dotenv';
import {prop} from 'utils';
import ModalTreatment from './modal-treatment';
import ModalOtherProcedure from './modal-other-procedure';
import Modal from 'react-native-modal';

const defaultIcon: string = PUBLIC_URL + 'storage/defaultIcon.png';

const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: 'center',
    padding: 48,
  },
  item: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 10,
    backgroundColor: Colors.black,
    borderRadius: 5,
    marginHorizontal: '2.5%',
    justifyContent: 'center',
    padding: 10,
    borderColor: Colors.black,
    borderWidth: 2,
  },
  itemTitle: {
    color: Colors.white,
    fontSize: 11,
    textAlign: 'center',
  },
  itemDescription: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  itemCheckBox: {
    height: 24,
    tintColor: 'rgba(0, 0, 0, 0.5)',
    width: 24,
    marginEnd: 8,
  },
  button: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonTitle: {
    color: 'white',
  },
  itemIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  itemSelected: {
    borderColor: Colors.yellow,
  },
});

type ItemProps = Procedure & {
  selected: boolean;
  onPress: (id: number) => void;
  isOdd: boolean;
  inline?: boolean;
  icon: string;
};

const Item = React.memo(({id, name, selected, onPress, icon, inline}: ItemProps) => {
  return (
    <TouchableOpacity
      onPress={(): void => onPress(id)}
      style={[styles.item, selected ? styles.itemSelected : undefined, inline ? {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'row'
      } : null]}>
      <Image
        style={[styles.itemIcon,inline ? {
          marginRight: 10
        } : null]}
        source={
          icon ? {uri: PUBLIC_URL + 'storage/' + icon} : {uri: defaultIcon}
        }
      />
      <Text style={styles.itemTitle} numberOfLines={2} bold>
        {name}
      </Text>
    </TouchableOpacity>
  );
});

Item.displayName = 'Item';

type ChooseProceduresProps = {
  onSubmit: (procedures: Set<Procedure>) => void;
  onError: (err: AxiosError) => void;
  initialProcedures?: Set<Procedure>;
};

export const ChooseProcedures = ({
  onSubmit,
  onError,
  initialProcedures,
}: ChooseProceduresProps): ReactElement => {
  const [procedures, setProcedures] = useState<Procedure[] | null>(null);
  const [treatments, setTreatments] = useState([]);
  const [treatment, setTreatment] = useState(null);
  const [contact, setContact] = useState(null);
  const [modalTreatment, setModalTreatment] = useState(false);
  const [modalOtherProcedure, setModalOtherProcedure] = useState(false);
  const [selected, setSelected] = useState(
    new Set<number>(
      initialProcedures ? Array.from(initialProcedures).map(prop('id')) : [],
    ),
  );

  const fetchProcedures = useCallback(() => {
    ProceduresService.get()
      .then(procedures =>
        setProcedures(
          procedures?.sort((a, b) => {
            return a.name
              .toLowerCase()
              .localeCompare(b.name.toLocaleLowerCase());
          }),
        ),
      )
      .catch(onError);
  }, [onError]);

  useEffect(() => {
    fetchProcedures();
  }, [fetchProcedures]);

  const fetchTreatments = useCallback(() => {
    TreatmentService.get()
      .then(data => {
        setTreatments(data.treatments)
        setContact(data.contact)
      })
      .catch(onError);
  }, [onError]);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const onSelect = useCallback(
    id => {
      const newSelected = new Set<number>(selected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }

      setSelected(newSelected);
    },
    [selected],
  );

  const extractKey = useCallback(({id}) => id.toString(), []);

  const next = (): void => {
    if (Array.from(selected).length < 1) {
      Toast.show('Debe seleccionar al menos un procedimiento');
    } else {
      onSubmit(
        new Set((procedures as Procedure[]).filter(it => selected.has(it.id))),
      );
    }
  };

  const other = treatments.find((i: any) => i.other == 1);

  return (
    <View style={ { flex: 1, backgroundColor: Colors.gray3 } }>
      <Modal
        avoidKeyboard
        isVisible={ modalTreatment }>            
        <ModalTreatment
          contact={ contact }
          treatment={ treatment }
          onBack={ () => setModalTreatment(false) } />
      </Modal>

      <Modal
        avoidKeyboard 
        isVisible={ modalOtherProcedure }>
        <ModalOtherProcedure
          contact={ contact }
          onBack={ () => setModalOtherProcedure(false) } />
      </Modal>
      
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="always">
        <View style={{flex: 1}}>        
          <FlatList
            contentContainerStyle={{paddingHorizontal: 36}}
            data={procedures}
            extraData={selected}
            keyExtractor={extractKey}
            numColumns={2}
            renderItem={({item, index}): ReactElement => (
              <Item
                {...item}
                onPress={onSelect}
                selected={!!selected.has(item.id)}
                isOdd={index % 2 === 1}
              />
            )}
            ListHeaderComponent={
              <Text style={{textAlign: 'center', color: Colors.gray}}>
                Seleccione las operaciones a consultar
              </Text>
            }
            ListHeaderComponentStyle={{paddingVertical: 16}}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" />
              </View>
            }
          />
          <FlatList
            contentContainerStyle={{paddingHorizontal: 36}}
            data={treatments.filter((i: any) => i.other == 0)}
            extraData={selected}
            keyExtractor={extractKey}
            style={{flex: 1}}
            numColumns={2}
            renderItem={({item, index}): ReactElement => (
              <Item
                {...item}
                onPress={ () => {
                  setTreatment(item);
                  setModalTreatment(true);
                }}
                isOdd={index % 2 === 1}
              />
            )}
            ListHeaderComponent={
              <React.Fragment>
                <RNText style={{
                  textAlign: 'center', 
                  color: Colors.yellow,
                  fontWeight: 'bold',
                  backgroundColor: Colors.gray3,
                  position: 'relative',
                  zIndex: 2,
                  flexDirection: 'row', 
                  paddingHorizontal: 20,
                  alignSelf: 'center'
                }}>
                  Tratamientos
                </RNText>
                <View style={{ 
                  width: '100%', 
                  height: 2, 
                  backgroundColor: Colors.yellow, 
                  position: 'relative', 
                  zIndex: 1,
                  top: -10 }} />
              </React.Fragment>
            }
            ListHeaderComponentStyle={{paddingVertical: 16}}
            ListFooterComponent={
              <React.Fragment>
                {
                  other && (
                    <Item
                      {...other}
                      onPress={ () => {
                        setModalOtherProcedure(true);
                      }}
                      inline={ true }
                    />
                  )
                }                
                <View
                  style={{
                    padding: 16,
                    alignItems: 'center',
                  }}>
                  <Button
                    style={styles.button}
                    titleStyle={styles.buttonTitle}
                    title="Siguiente"
                    onPress={next}
                    textBold
                  />
                </View>
              </React.Fragment>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" />
              </View>
            }
          />        
        </View>
      </ScrollView>
    </View>
  );
};
