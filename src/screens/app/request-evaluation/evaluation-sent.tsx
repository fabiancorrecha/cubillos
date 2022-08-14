import {Images, Icons} from 'assets';
import React, {ReactElement, useEffect} from 'react';
import {
  ImageBackground,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
} from 'react-native';
import {OptionsMenu, Text} from 'widgets';
import Colors from 'utils/colors';
import {useNavigation, useIsFocused} from 'react-navigation-hooks';

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.blue,
  },
  homeButton: {
    left: 4,
  },
  optionsButton: {
    right: 4,
    position: 'absolute',
  },
  headerButton: {
    height: 24,
    width: 24,
  },
  headerButtonContainer: {
    padding: 12,
  },
});

export const EvaluationSent = (): ReactElement => {
  const {navigate} = useNavigation();
  const isFocused = useIsFocused();
  
  useEffect(() => {
    const backHandler = (): boolean => {
      if (!isFocused) {
        return false;
      }

      navigate('Dashboard');
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backHandler);

    return (): void => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [isFocused, navigate]);

  return (
    <ImageBackground
      source={Images.evaluationSent}
      style={{width: '100%', height: '100%'}}
      resizeMode="cover">
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={[styles.headerButtonContainer, styles.homeButton]}
        onPress={(): void => {
          navigate('Dashboard');
        }}>
        <Image style={styles.headerButton} source={Icons.home} />
      </TouchableOpacity>

      {/* OPTIONS BUTTON */}
      <View style={[styles.headerButtonContainer, styles.optionsButton]}>
        <OptionsMenu
          options={[
            {
              label: 'Editar perfil',
              action: (): void => {
                navigate('Profile');
              },
            },
            {
              label: 'Cerrar sesión',
              action: (): void => {
                navigate('Logout');
              },
            },
          ]}>
          <Image source={Icons.hamburgerMenu} style={styles.headerButton} />
        </OptionsMenu>
      </View>

      {/* BOTTOM TEXT */}
      <View style={{justifyContent: 'flex-end', alignItems: 'center', flex: 1}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={Icons.checkBig}
            style={{width: 24, height: 24, marginEnd: 4}}
          />
          <Text style={{color: 'white', fontSize: 16}} bold>
            Su pago ha sido exitoso
          </Text>
        </View>
        <View
          style={{
            marginTop: 8,
            marginBottom: 56,
            marginHorizontal: 48,
            backgroundColor: 'white',
            borderRadius: 16,
            alignItems: 'center',
            padding: 12,
          }}>
          <Text
            style={{textAlign: 'center', fontSize: 13, color: Colors.blue}}
            bold>
            La evaluación será entregada a través del correo con el que se
            registró en un plazo de 7 días hábiles.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};
