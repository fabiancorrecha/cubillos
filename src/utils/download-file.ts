import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';

class _DownloadFile {

    download (urlFile: string, fileName = null, description = 'Se esta descargando un archivo', type: string = 'GET') {
        if (Platform.OS == 'android') {
            const splitExtension = urlFile.split('.')
            const extension = splitExtension[splitExtension.length - 1]
            const splitName = urlFile.split('/')
            const originalName = splitName[splitName.length - 1]
            const date = new Date;
            
            const fileNameDownload = fileName 
                ? `DrCarlosRamos_${fileName}_${date.getTime()}.${extension}` 
                : `${date.getTime()}${originalName}`;

            const addAndroidDownloads = {
                useDownloadManager : true,
                notification: true,
                description,
                path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileNameDownload}`,
            }

            let config = {}

            if (Platform.OS === 'android') {
                config = {
                    addAndroidDownloads
                }
            }

            // @ts-ignore
            return RNFetchBlob.config(config).fetch(type,urlFile)
        }
        else {
            return {
                path: () => urlFile
            }
        }        
    }
}

export const DownloadFile = new _DownloadFile();