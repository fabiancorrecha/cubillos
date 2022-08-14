import AsyncStorage from '@react-native-community/async-storage';
import {useDispatch} from 'react-redux';
import {rootReducer} from 'reducers';
import {applyMiddleware, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import {persistReducer, persistStore} from 'redux-persist';
import {name as appName} from '../../app.json';

const persistConfig = {
  key: appName,
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  // applyMiddleware(createLogger()),
);

export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch: () => AppDispatch = useDispatch;

export const persistor = persistStore(store);
