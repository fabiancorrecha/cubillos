import React, { ReactElement, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView
} from 'react-native';
import { withNavigation } from 'react-navigation';
import {
  NavigationStackScreenProps,
  NavigationStackScreenComponent,
  NavigationStackOptions,
} from 'react-navigation-stack';
import { Icons } from 'assets/icons';

const IMAGE_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: 50
  },
  currentItemContainer: {
    flex: 1,
  },
  currentItem: {
    resizeMode: 'contain',
    height: '100%',
    width: '100%',
  },
  item: {
    height: IMAGE_SIZE,
    resizeMode: 'cover',
    width: IMAGE_SIZE,
  },
  itemList: {
    height: IMAGE_SIZE,
  },
  headerButtonContainer: {
    padding: 12,
  },
  homeButton: {
    left: 4
  },
  headerButton: {
    height: 24,
    width: 24,
    tintColor: '#000'
  }
});

type ItemProps = { uri: string; selected: boolean; onPress: () => void };

const Item = ({uri, selected, onPress}: ItemProps): ReactElement => {
  return (
    <TouchableOpacity
      onPress={ onPress}
      style={ selected ? { backgroundColor: 'black' } : {} }>
      <Image
        source={ { uri } }
        resizeMode="cover"
        style={ [styles.item, selected ? { opacity: 0.5 } : null] }
      />
    </TouchableOpacity>
  );
};

type Params = { images: string[]; title: string };
type Props = NavigationStackScreenProps<Params, {}>;

const ViewImagesComponent: NavigationStackScreenComponent<Params, Props> = ({
  navigation,
}: Props) => {
  const items = navigation.getParam('images');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  return (
    <SafeAreaView style={ { flex: 1 } }>
      <View>
        <TouchableOpacity
          style={ { ...styles.headerButtonContainer, ...styles.homeButton, position: 'absolute', zIndex: 999 } }
          onPress={ () => navigation.goBack(null) }>
          <Image style={ styles.headerButton } source={ Icons.back } />
        </TouchableOpacity>

        <View style={ styles.container }>
          <TouchableOpacity onPress={ () => navigation.goBack(null) }>
            <View>
              
            </View>
          </TouchableOpacity>
          <View style={ styles.currentItemContainer }>
            <Image
              source={ { uri: items[currentItemIndex] } }
              style={ styles.currentItem }
            />
          </View>
          <View style={ styles.itemList }>
            <FlatList
              data={ items }
              horizontal
              extraData={ currentItemIndex }
              keyExtractor={ (_, index): string => index.toString() }
              renderItem={ ({ item, index }): ReactElement => (
                <Item
                  uri={ item }
                  selected={ currentItemIndex === index }
                  onPress={ (): void => setCurrentItemIndex(index) }
                />
              ) }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

ViewImagesComponent.navigationOptions = ({
  navigation,
}): NavigationStackOptions => ({
  title: navigation.getParam('title', 'Ver imágenes'),
});

export const ViewImages = withNavigation(ViewImagesComponent);
