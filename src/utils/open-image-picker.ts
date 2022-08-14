import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

type CanceledError = {type: 'canceled'};
type LibraryError = {type: 'library-error'; error: string};
export type ImagePickerError = CanceledError | LibraryError;

export const openImagePicker = (): Promise<string> =>
  new Promise((resolve, reject) => {
    ImagePicker.showImagePicker(
      {
        // noData: true,
        // maxHeight: 1000,
        // maxWidth: 1000,
        // quality: 0.85,
        title: 'Seleccione',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar la Cámara',
        chooseFromLibraryButtonTitle: 'Usar la Galería',
      },
      resp => {
        if (resp.didCancel) {
          reject({type: 'canceled'});
        } else if (resp.error) {
          reject({type: 'library-error', error: resp.error});
        } else {
          // resolve(resp.uri);
          ImageResizer.createResizedImage(resp.uri, 1000, 1000,'JPEG',80).then((_response: any) => {
              resolve(_response.uri);
          }).catch(() => reject({type: 'canceled'}));
        }
      },
    );
  });
