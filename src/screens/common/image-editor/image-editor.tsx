import {Icons} from 'assets';
import React, {Component, ReactNode} from 'react';
import {
  BackHandler,
  Image,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import {
  NavigationStackOptions,
  NavigationStackScreenProps,
} from 'react-navigation-stack';
import Colors from 'utils/colors';
import {Text} from 'widgets';
import Button from 'widgets/button';

const withShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.62,

  elevation: 4,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gradient1,
    height: '100%',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.blue,
    flexDirection: 'row',
    padding: 16,
  },
  headerButton: {
    width: 24,
    height: 24,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
  },
  profilePicture: {
    alignSelf: 'center',
    borderColor: Colors.yellow,
    borderRadius: 72,
    borderWidth: 3,
    height: 144,
    marginTop: 48,
    resizeMode: 'cover',
    width: 144,
  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
  },
  saveButton: {
    ...withShadow,
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonTitle: {
    color: 'white',
  },
  rotateButton: {
    ...withShadow,
    backgroundColor: 'white',
    height: 36,
    borderRadius: 24,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateButtonIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.blue,
  },
  buttonSeparator: {
    height: 16,
    width: 16,
  },
});

type Params = {
  uri: string;
  onSave: (uri: string, rotation: number) => void;
  onCancel: () => void;
};

type Props = NavigationStackScreenProps<Params>;

const initialState = {rotation: 0};

type State = typeof initialState;

export class ImageEditor extends Component<Props, State> {
  static navigationOptions: NavigationStackOptions = {
    headerShown: false,
  };

  state = initialState;

  cancel = (): boolean => {
    const {navigation} = this.props;
    const onCancel = navigation.getParam('onCancel');

    onCancel();
    navigation.goBack();

    return true;
  };

  save = (): void => {
    const {navigation} = this.props;
    const {rotation} = this.state;
    const [uri, onSave] = [
      navigation.getParam('uri'),
      navigation.getParam('onSave'),
    ];

    onSave(uri, rotation);
    navigation.goBack();
  };

  rotate = (deg: number) => (): void =>
    this.setState((prevState: State) => ({rotation: prevState.rotation + deg}));

  rotateRight = this.rotate(90);

  rotateLeft = this.rotate(-90);

  render(): ReactNode {
    const {navigation} = this.props;
    const {rotation} = this.state;
    const uri = navigation.getParam('uri');

    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={(): void => {
            BackHandler.addEventListener('hardwareBackPress', this.cancel);
          }}
          onDidBlur={(): void => {
            BackHandler.removeEventListener('hardwareBackPress', this.cancel);
          }}
        />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={(): void => {
              this.cancel();
            }}>
            <Image source={Icons.back} style={styles.headerButton} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} bold>
              Rotar imagen
            </Text>
          </View>
          {/* Esto solo ocupa espacio para centrar el título. */}
          <View style={styles.headerButton} />
        </View>

        {/* PROFILE PICTURE */}
        <Image
          source={{uri}}
          style={[
            styles.profilePicture,
            {
              transform: [{rotate: `${rotation}deg`}],
            },
          ]}
        />

        {/* BUTTONS */}
        <View style={styles.buttonsContainer}>
          <Button
            textBold
            style={styles.saveButton}
            titleStyle={styles.saveButtonTitle}
            onPress={this.save}
            title="Guardar"
          />
          <View style={styles.buttonSeparator} />
          <TouchableOpacity
            onPress={this.rotateLeft}
            style={styles.rotateButton}>
            <Image source={Icons.rotateLeft} style={styles.rotateButtonIcon} />
          </TouchableOpacity>
          <View style={styles.buttonSeparator} />
          <TouchableOpacity
            onPress={this.rotateRight}
            style={styles.rotateButton}>
            <Image source={Icons.rotateRight} style={styles.rotateButtonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
