import {Platform} from 'react-native';

export type SentPhoto = {
  uri: string;
  rotation: number;
};

const toLocalUri = (uri: string): string =>
  Platform.OS === 'android' ? uri : uri.replace('file://', '');

export const SentPhoto = {
  toFile: (
    photo: SentPhoto,
  ): {
    name: string;
    type: string;
    uri: string;
    rotation: string;
  } => ({
    name: photo.uri.substring(photo.uri.lastIndexOf('/') + 1),
    type: 'image/jpeg',
    uri: toLocalUri(photo.uri),
    rotation: photo.rotation.toString(),
  }),
};
