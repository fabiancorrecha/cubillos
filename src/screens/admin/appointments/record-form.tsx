/* eslint-disable @typescript-eslint/camelcase */

import {Icons} from 'assets';
import React, {useState, ReactElement} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import Colors from 'utils/colors';
import {Header, Text, TextInput} from 'widgets';
import DocumentPicker from 'react-native-document-picker';
import Button from 'widgets/button';
import {prop} from 'utils';
import Toast from 'react-native-root-toast';

const initialForm = {
  title: '',
  content: '',
  files: [] as {
    id: number;
    file_url: string;
  }[],
};

const styles = StyleSheet.create({
  file: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
    paddingStart: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray,
    marginBottom: 16,

    // Sombra
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  fileTitle: {
    color: Colors.blue,
    flex: 1,
  },
  fileButton: {
    height: 24,
    marginStart: 16,
    marginEnd: 12,
    marginVertical: 8,
    tintColor: Colors.blue,
    width: 24,
  },
  sectionHeaderContainer: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 2,
    flexDirection: 'row',
    paddingVertical: 4,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: Colors.blue,
  },
});

type SuccessFunc = (
  title: string,
  content: string,
  newFiles: (FileType & {type: string})[],
  deletedFiles: number[],
) => void;

type FileProps = {
  name: string;
  onPress: () => void;
  onPressDelete: () => void;
};

const File = ({name, onPress, onPressDelete}: FileProps): ReactElement => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.file}>
      <Text bold numberOfLines={1} style={styles.fileTitle}>
        {name}
      </Text>
      <TouchableOpacity onPress={onPressDelete}>
        <Image style={styles.fileButton} source={Icons.trash} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

type FileType = {name: string; file: string};

export const RecordForm = (): ReactElement => {
  const navigation = useNavigation();
  const initialFormFromParams = navigation.getParam(
    'initialForm',
    initialForm,
  ) as typeof initialForm;
  const onSuccess = navigation.getParam('onSuccess') as SuccessFunc;

  const [isEditing] = useState(
    typeof navigation.getParam('initialForm') === 'object',
  );

  const [title, setTitle] = useState(initialFormFromParams.title);
  const [content, setContent] = useState(initialFormFromParams.content);
  const [files, setFiles] = useState(
    initialFormFromParams.files.map(({id, file_url}) => ({
      id: id,
      file: file_url,
      name: file_url.substring(file_url.lastIndexOf('/') + 1),
    })),
  );
  const [deletedFiles, setDeletedFiles] = useState(
    [] as (FileType & {id: number})[],
  );
  const [newFiles, setNewFiles] = useState([] as (FileType & {type: string})[]);

  return (
    <View style={{height: '100%'}}>
      <Header
        icon={Icons.menu.appointments}
        navigation={navigation}
        title={
          isEditing ? 'Editar historial médico' : 'Agregar historial médico'
        }
      />
      <ScrollView
        contentContainerStyle={{padding: 16}}
        keyboardShouldPersistTaps="always">
        <TextInput onChangeText={setTitle} placeholder="Nombre" value={title} />
        <TextInput
          onChangeText={setContent}
          placeholder="Descripción"
          value={content}
        />
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderTitle} bold>
            Archivos
          </Text>
        </View>
        {files.map(({file, name}, idx) => (
          <File
            name={name}
            key={idx}
            onPress={(): void => {
              Linking.openURL(file);
            }}
            onPressDelete={(): void => {
              setDeletedFiles(prevDeletedFiles => [
                ...prevDeletedFiles,
                files[idx],
              ]);

              setFiles(prevFiles => [
                ...prevFiles.slice(0, idx),
                ...prevFiles.slice(idx + 1),
              ]);
            }}
          />
        ))}
        {newFiles.map(({name, file}, idx) => (
          <File
            name={name}
            key={idx}
            onPress={(): void => {
              Linking.openURL(file);
            }}
            onPressDelete={(): void => {
              setNewFiles(prevNewFiles => [
                ...prevNewFiles.slice(0, idx),
                ...prevNewFiles.slice(idx + 1),
              ]);
            }}
          />
        ))}
        <TouchableOpacity
          onPress={(): void => {
            DocumentPicker.pick({
              type: [DocumentPicker.types.allFiles],
            })
              .then(({uri, name, type}) => {
                setNewFiles(prevNewFiles => [
                  ...prevNewFiles,
                  {name, type, file: uri},
                ]);
              })
              .catch(console.log.bind(console));
          }}
          style={styles.file}>
          <Text bold numberOfLines={1} style={styles.fileTitle}>
            Añadir
          </Text>
          <Image style={styles.fileButton} source={Icons.add} />
        </TouchableOpacity>
        <Button
          title="Guardar"
          style={{
            alignSelf: 'center',
            backgroundColor: Colors.yellow,
            borderRadius: 100,
            paddingVertical: 8,
            marginBottom: 10,
            paddingHorizontal: 16,
          }}
          titleStyle={{
            color: 'white',
          }}
          textBold
          onPress={(): void => {
            if (!title) {
              Toast.show('Debe ingresar un nombre');
              return;
            }

            if (!content) {
              Toast.show('Debe ingresar una descripción');
              return;
            }

            onSuccess(title, content, newFiles, deletedFiles.map(prop('id')));
            navigation.goBack();
          }}
        />
      </ScrollView>
    </View>
  );
};
