import {Icons} from 'assets';
import {AxiosError} from 'axios';
import {Evaluation} from 'models/evaluation';
import {User} from 'models/user';
import React, {
  EffectCallback,
  FunctionComponent,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import {useFocusEffect, useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {EvaluationsService} from 'services';
import {prop, showAlert} from 'utils';
import {Text, Header} from 'widgets';
import colors from 'utils/colors';
import {useSocketEvent} from 'hooks';

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',

    // Sombra
    // TODO: Extraer la lógica para crear las sombras a una función.
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  itemCheckBox: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  itemText: {
    flex: 1,
    color: colors.blue,
  },
  itemIconsContainer: {
    flexDirection: 'row',
  },
  itemIcon: {
    width: 20,
    height: 20,
  },
  itemIconSeparator: {
    width: 16,
  },
});

type ItemProps = {
  evaluation: Evaluation;
  onPress: EffectCallback;
};

const Item = ({
  evaluation: {createdAt, budget, messageCount, closed},
  onPress,
}: ItemProps): ReactElement => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <Image
      style={styles.itemCheckBox}
      source={closed ? Icons.evaluationCheck : Icons.appointmentConfirmed}
    />
    <View
      style={{
        height: '100%',
        backgroundColor: colors.gray2,
        width: 1,
        marginEnd: 8,
      }}
    />
    <Text style={styles.itemText} bold>
      Evaluación {createdAt}
    </Text>
    <View style={styles.itemIconsContainer}>
      <Image
        style={styles.itemIcon}
        source={messageCount > 0 ? Icons.message : Icons.messageSeen}
      />
      {budget && (
        <>
          <View style={{width: 16}} />
          <Image style={styles.itemIcon} source={Icons.budget} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

const extractItemKey = ({id}: Evaluation): string => id.toString();

export const EvaluationHistory: FunctionComponent = () => {
  const {goBack, navigate} = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const [evaluations, setEvaluations] = useState<Evaluation[] | null>(null);

  const fetchEvaluations = useCallback(() => {
    EvaluationsService.index(user.id)
      .then(setEvaluations)
      .catch((err: AxiosError) => {
        console.log(
          'EvaluationHistory: useEffect: EvaluationsService.get:',
          err,
        );
        showAlert('Lo sentimos', 'Ha ocurrido un error desconocido');
        goBack(null);
      });
  }, [goBack, user.id]);

  useFocusEffect(fetchEvaluations);

  useSocketEvent('evaluations/finish', (): void => {
    fetchEvaluations();
  });

  const renderEvaluation = ({
    item,
  }: ListRenderItemInfo<Evaluation>): ReactElement => (
    <Item
      evaluation={item}
      onPress={(): void => {
        navigate('ViewEvaluation', {evaluation: item});
      }}
    />
  );

  return (
    <SafeAreaView style={ { flex: 1 } }>
      <Header
        backIcon={ Icons.home }
        icon={Icons.menu.evaluationHistory}
        title="Bandeja de evaluación"
        navigation={{goBack, navigate}}
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={evaluations}
        keyExtractor={extractItemKey}
        renderItem={renderEvaluation}
        ListEmptyComponent={(): ReactElement => (
          <View style={{padding: 16}}>
            {evaluations === null ? (
              <ActivityIndicator size="large" />
            ) : (
              <Text style={{textAlign: 'center'}}>
                No ha pedido ninguna evaluación
              </Text>
            )}
          </View>
        )}
        ItemSeparatorComponent={(): ReactElement => (
          <View style={{height: 16}} />
        )}
      />
    </SafeAreaView>
  );
};
