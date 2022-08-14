import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { withNavigation } from 'react-navigation';
import {
  NavigationStackScreenComponent,
  NavigationStackScreenProps,
} from 'react-navigation-stack';
import { Icons } from 'assets';

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'black',
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
});

type Params = { image: string };
type Props = NavigationStackScreenProps<Params, {}>;

const ViewImageComponent: NavigationStackScreenComponent<Params, Props> = ({
  navigation,
}: Props) => {
  const image = navigation.getParam('image');

  return (
    <SafeAreaView style={ { flex: 1 } }>
      <View>
        <Image source={ { uri: image } } style={ styles.image } />
        <TouchableOpacity
          onPress={ () => navigation.goBack() }
          style={ {
            paddingHorizontal: 20,
            paddingVertical: 20,
            position: 'absolute',
          } }>
          <Image source={ Icons.close } style={ { height: 16, width: 16 } } />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const ViewImage = withNavigation(ViewImageComponent);
