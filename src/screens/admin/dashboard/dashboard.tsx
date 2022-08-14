import { Icons, Images } from 'assets';
import React, { EffectCallback, FunctionComponent, ReactElement, useState, useCallback } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import Colors from 'utils/colors';
import { OptionsMenu, Text } from 'widgets';
import { useTypedSelector } from 'reducers';
import { prop } from 'utils';
import { ModeratorService } from 'services/admin';
import { User } from 'models/user';
import LoadingContainer from 'widgets/loading-container';

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    resizeMode: 'cover',
  },
  item: {
    backgroundColor: Colors.gray2,
    width: '100%',
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  itemText: {
    color: Colors.blue,
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

const Item = ({ onPress, icon, title }: ItemProps): ReactElement => (
  <TouchableOpacity onPress={ onPress }>
    <View style={ styles.item }>
      <View style={ styles.itemIconContainer }>
        <Image source={ icon } style={ styles.itemIcon } />
      </View>
      <Text style={ styles.itemText } bold>
        { title }
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
  const { navigate } = useNavigation();
  const user = useTypedSelector(prop('user')) as User;
  const [permissions,setPermissions] = useState([]);
  const [loading,setLoading] = useState(true);

  const navigateTo = (page: string): void => {
    navigate(page);
  };

  const items: Item[] = [
    {
      title: 'Pacientes',
      icon: Icons.menu.AdminPatients,
      onPress: () => navigateTo('Patients')
    },
    {
      title: 'Asesoría online',
      icon: Icons.menu.AdminEvaluation,
      onPress: () => navigateTo('Evaluations')
    },
    {
      title: 'Consulta presencial',
      icon: Icons.menu.AdminAppointments,
      onPress: () => navigateTo('Appointments')
    },
    {
      title: 'Procedimientos',
      icon: Icons.menu.AdminProcedures,
      onPress: () => navigateTo('Procedures')
    },
    {
      title: 'Chat',
      icon: Icons.menu.AdminChat,
      onPress: () => navigateTo('Chat')
    },
    {
      title: 'Horario',
      icon: Icons.menu.AdminSchedule,
      onPress: () => navigateTo('Schedule')
    },
    {
      title: 'Precios',
      icon: Icons.menu.AdminPrices,
      onPress: () => navigateTo('Prices')
    },
    {
      title: 'Moderadores',
      icon: Icons.menu.AdminModerators,
      onPress: () => navigateTo('Moderators')
    }
  ];

  const fetchPermissions = useCallback(() => {
    if (!user) {
      return;
    }
    
    ModeratorService.getUserPermissions({
      id: user.id
    })
    .then((res: any) => setPermissions(res.permissions.map((i: any) => i.name)))
    .catch((err: any) => console.log(err))
    .finally(() => setLoading(false));
  }, [user]);

  useFocusEffect(fetchPermissions);

  return (
    <SafeAreaView style={ { height: '100%' } }>
      <ScrollView>
        <ImageBackground source={ Images.banner } style={ styles.banner }>
          <OptionsMenu
            options={ [
              { label: 'Editar perfil', action: () => navigateTo('Profile') },
              { label: 'Cerrar sesión', action: () => navigateTo('Logout') },
            ] }
            style={ { alignSelf: 'flex-end' } }>
            <Image
              source={ Icons.hamburgerMenu }
              style={ {
                height: 24,
                margin: 12,
                resizeMode: 'contain',
                width: 24,
              } }
            />
          </OptionsMenu>
        </ImageBackground>        
        <View style={ styles.itemContainer }>
          <LoadingContainer loading={ loading && user.level != 'super-admin' }>
            { items.map((item: Item, index) => {
              // @ts-ignore
              if (user?.level == 'super-admin' || permissions.indexOf(item.title) != -1) {
                return (
                  <Item
                    key={ index.toString() }
                    onPress={ item.onPress }
                    title={ item.title }
                    icon={ item.icon }
                  />
                ) 
              }
              else {
                return null;
              }                                  
            }) }
          </LoadingContainer>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
