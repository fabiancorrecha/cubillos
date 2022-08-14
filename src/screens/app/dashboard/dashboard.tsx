import {Icons, Images} from 'assets';
import { User } from 'models/user';
import React, {EffectCallback, FunctionComponent, ReactElement, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {useNavigation} from 'react-navigation-hooks';
import { useTypedSelector } from 'reducers';
import { EvaluationsService } from 'services';
import { prop } from 'utils';
import Colors from 'utils/colors';
import {AlertModal, AlertModalDualButton, OptionsMenu, Text} from 'widgets';

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    resizeMode: 'cover',
  },
  item: {
    backgroundColor: '#393a3c',
    width: '100%',
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  itemText: {
    color: 'white',
    padding: 10,
    paddingTop: 15,
  },
  itemIcon: {
    width: 30,
    height: 30,
  },
  itemIconContainer: {
    padding: 10,
    backgroundColor: Colors.blue,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  chatButton: {
    backgroundColor: Colors.blue,
    width: 50,
    height: 50,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIcon: {
    width: 35,
    height: 35,
  },
  itemContainer: {
    padding: 16,
  },
  chatButtonContainer: {
    margin: 16,
    position: 'absolute',
    bottom: 0,
  },
  menu: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  iconMenu: {
    width: 20,
    height: 20,
  },
});

interface ItemProps {
  title: string;
  icon: number;
  onPress: () => void;
}

const Item = ({onPress, icon, title}: ItemProps): ReactElement => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.item}>
      <View style={styles.itemIconContainer}>
        <Image source={icon} style={styles.itemIcon} />
      </View>
      <Text style={styles.itemText} bold>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

interface Item {
  title: string;
  icon: number;
  onPress: EffectCallback;
}

export const Dashboard: FunctionComponent = () => {
  const {navigate} = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletingEvaluation, setDeletingEvaluation] = useState(false);
  const [checkingEvaluation, setCheckingEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>({});

  const logout = (): void => {
    navigate('Logout');
  };

  const profile = (): void => {
    navigate('Profile');
  };

  const requestEvaluation = (): void => {
    if (checkingEvaluation || showConfirmModal) {
      return;
    }
    navigate('RequestEvaluation');
  };

  const evaluationHistory = (): void => {
    navigate('EvaluationHistory');
  };

  const appointments = (): void => {
    navigate('Appointments');
  };

  const items: Item[] = [
    {
      title: 'Asesoría online',
      icon: Icons.menu.evaluation,
      onPress: requestEvaluation,
    },
    {
      title: 'Bandeja de evaluación',
      icon: Icons.menu.evaluationHistory,
      onPress: evaluationHistory,
    },
    // {
    //   title: 'Consulta presencial',
    //   icon: Icons.menu.appointments,
    //   onPress: appointments,
    // },
  ];

  const payEvaluation = (): void => {
    setShowConfirmModal(false);
    navigate('RequestEvaluation', {initialStep: 'payment', pendingEvaluation: evaluation})
  };

  const deleteEvaluation = async (): Promise<void> => {
    setDeletingEvaluation(true);
    const { data }: any = await EvaluationsService.deleteEvaluationPending(user.id, evaluation.id);

    setDeletingEvaluation(false);
    if (data?.result) {
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    }
  };

  useEffect(() => {
    const get = async(): Promise<void> => {
      setCheckingEvaluation(true);

      await EvaluationsService.checkEvaluationPending(user.id)
        .then((res) => {
          setEvaluation(res);
          setShowConfirmModal(true);
        })
        .catch(err => err && console.log('Dashboard: checkEvaluationPending' + err));

      setCheckingEvaluation(false);
    }

    get();
  }, []);

  return (
    <SafeAreaView style={{height: '100%'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 72}}>
        <AlertModalDualButton
          visible={ showConfirmModal }
          image={ Icons.alert }
          title="Posees una consulta pendiente por cancelar. Dirígete a 'solicitar una cita online' para culminar el proceso de pago, o haz click en eliminar si deseas comenzar una nueva consulta."
          buttonLeft={{
            color: 'black',
            title: 'Aceptar',
            onPress: (): void => payEvaluation(),
          }}
          buttonRight={{
            isLoading: deletingEvaluation,
            title: 'Eliminar',
            onPress: (): Promise<void> => deleteEvaluation(),
          }}
        />
        <AlertModal
          button={{
            title: 'Confirmar',
            onPress: (): void => setShowSuccessModal(false),
          }}
          image={ Icons.checkBig }
          title="Eliminada consulta pendiente."
          visible={ showSuccessModal }
        />
        <ImageBackground source={Images.banner} style={styles.banner}>
          {/* <TouchableOpacity onPress={ openMenu }>
            <View style={ styles.menu }>
              <Image source={ Menu } style={ styles.iconMenu } />
            </View>
          </TouchableOpacity> */}
          <OptionsMenu
            options={[
              {label: 'Editar perfil', action: profile},
              {label: 'Cerrar sesión', action: logout},
            ]}
            style={{alignSelf: 'flex-end'}}>
            <Image
              source={Icons.hamburgerMenu}
              style={{
                height: 24,
                margin: 12,
                resizeMode: 'contain',
                width: 24,
              }}
            />
          </OptionsMenu>
        </ImageBackground>
        <View style={styles.itemContainer}>
          {items.map((item: Item, index) => (
            <Item
              key={index.toString()}
              onPress={item.onPress}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.chatButtonContainer}>
        <TouchableOpacity
          onPress={(): void => {
            navigate('Chat');
          }}>
          <View style={styles.chatButton}>
            <Image source={Icons.menu.chat} style={styles.chatIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
