import React, {ReactElement, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import {withNavigation} from 'react-navigation';
import {
  NavigationStackScreenProps,
  NavigationStackScreenComponent,
} from 'react-navigation-stack';
import {Icons} from 'assets';
import Colors from 'utils/colors';
import {Text} from 'widgets';

const IMAGE_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
});

type ItemProps = {uri: string; selected: boolean; onPress: () => void};

const Item = ({uri, selected, onPress}: ItemProps): ReactElement => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={selected ? {backgroundColor: 'black'} : {}}>
      <Image
        source={{uri}}
        resizeMode="cover"
        style={[styles.item, selected ? {opacity: 0.5} : null]}
      />
    </TouchableOpacity>
  );
};

type Params = {images: string[]; title: string};
type Props = NavigationStackScreenProps<Params, {}>;

const ViewImagesComponent: NavigationStackScreenComponent<Params, Props> = ({
  navigation,
}: Props) => {
  const items = navigation.getParam('images');
  const title = navigation.getParam('title', 'Ver imágenes');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: Colors.blue,
        }}>
        <TouchableOpacity
          onPress={(): void => {
            navigation.goBack();
          }}>
          <Image source={Icons.back} style={{width: 24, height: 24}} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
          }}>
          <Text style={{color: 'white', fontSize: 16}} bold>
            {title}
          </Text>
        </View>
        <View style={{width: 24, height: 24}} />
      </View>
      <View style={styles.container}>
        <View style={styles.currentItemContainer}>
          <Image
            source={{uri: items[currentItemIndex]}}
            style={styles.currentItem}
          />
        </View>
        <View style={styles.itemList}>
          <FlatList
            data={items}
            horizontal
            extraData={currentItemIndex}
            keyExtractor={(_, index): string => index.toString()}
            renderItem={({item, index}): ReactElement => (
              <Item
                uri={item}
                selected={currentItemIndex === index}
                onPress={(): void => setCurrentItemIndex(index)}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

ViewImagesComponent.navigationOptions = {headerShown: false};

export const ViewImages = withNavigation(ViewImagesComponent);
