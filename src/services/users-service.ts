/* eslint-disable @typescript-eslint/camelcase */
import {fromRawUser, User} from 'models/user';
import {axios} from './axios';
import {SentPhoto} from 'models/sent-photo';
import {objectToFormData} from './object-to-form-data';

export const UsersService = {
  update: (
    userId: number,
    name: string,
    lastName: string,
    email: string,
    password: string | null,
    confirmedPassword: string | null,
    address: string,
    phoneNumber: string,
    countryId: number,
    profilePicture?: SentPhoto | null
  ): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post(
          `users/${userId}`,
          objectToFormData({
            name,
            email,
            address,
            password: password || '',
            last_name: lastName,
            password_confirmation: confirmedPassword || '',
            phone_number: phoneNumber,
            country_id: countryId,
            profile_picture: profilePicture
              ? SentPhoto.toFile(profilePicture)
              : null,
            profile_picture_rotation: profilePicture?.rotation,
            _method: 'PATCH',
          }),
        )
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  show: (userId: number): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .get(`users/${userId}`)
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  getData: (userId: number): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post('users/get-data',{
          id: userId
        })
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject);
    }),
};
