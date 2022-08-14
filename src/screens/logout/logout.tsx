import {removeUser} from 'actions/user';
import {FunctionComponent, useEffect} from 'react';
import {useNavigation} from 'react-navigation-hooks';
import {useTypedSelector} from 'reducers';
import {FacebookAuthService, GoogleAuthService} from 'services';
import {useTypedDispatch} from 'store';
import {prop} from 'utils';

export const Logout: FunctionComponent = () => {
  const dispatch = useTypedDispatch();
  const {navigate} = useNavigation();
  const user = useTypedSelector(prop('user'));

  useEffect(() => {
    if (user?.authType === 'facebook') {
      FacebookAuthService.logOut();
    } else if (user?.authType === 'google') {
      GoogleAuthService.logOut();
    }

    dispatch(removeUser());
    navigate('Login');
  }, [dispatch, navigate, user]);

  return null;
};
