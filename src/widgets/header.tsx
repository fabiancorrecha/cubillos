import {Icons} from 'assets';
import React, {ReactElement} from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'utils/colors';
import {OptionsMenu} from './options-menu';
import {Text} from './text';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.blue,
    height: 112,

    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
  },
  icon: {
    height: 36,
    marginEnd: 8,
    width: 36,
  },
  homeButton: {
    left: 4,
    position: 'absolute',
    top: 4,
  },
  optionsButton: {
    right: 4,
    position: 'absolute',
    top: 4,
  },
  button: {
    height: 24,
    width: 24,
  },
  buttonContainer: {
    padding: 12,
  },
});

type HeaderProps = {
  icon: ImageSourcePropType;
  title: string;
  backIcon?: ImageSourcePropType;
  navigation: {
    navigate: (route: string) => void;
    goBack: () => void;
  };
};

export const Header = ({
  icon,
  title,
  backIcon,
  navigation: {navigate, goBack},
}: HeaderProps): ReactElement => {
  return (
    <View style={styles.container}>
      {/* CENTERED TITLE & ICON */}
      <View style={styles.titleContainer}>
        <Image style={styles.icon} source={icon} />
        <Text style={styles.title} bold>
          {title}
        </Text>
      </View>

      {/* BACK BUTTON */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.homeButton]}
        onPress={(): void => goBack()}>
        <Image
          style={styles.button}
          source={backIcon ? backIcon : Icons.back}
        />
      </TouchableOpacity>

      {/* OPTIONS BUTTON */}
      <View style={[styles.buttonContainer, styles.optionsButton]}>
        <OptionsMenu
          options={[
            {label: 'Editar perfil', action: (): void => navigate('Profile')},
            {label: 'Cerrar sesión', action: (): void => navigate('Logout')},
          ]}>
          <Image source={Icons.hamburgerMenu} style={styles.button} />
        </OptionsMenu>
      </View>
    </View>
  );
};
