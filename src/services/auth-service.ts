/* eslint-disable @typescript-eslint/camelcase */
import {fromRawUser, User} from 'models/user';
import {axios} from './axios';
import {objectToFormData} from './object-to-form-data';
import {SentPhoto} from 'models/sent-photo';

export const AuthService = {
  login: (email: string, password: string): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post('auth/login', {email, password})
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  loginWithGoogle: (email: string, token: string): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post('auth/login-with-google', {email, token})
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  loginWithFacebook: (email: string, token: string): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post('auth/login-with-facebook', {email, token})
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  register: (
    name: string,
    lastName: string,
    email: string,
    password: string,
    confirmedPassword: string,
    address: string,
    phoneNumber: string,
    countryId: number,
    profilePicture: SentPhoto | null,
    diseases?: string,
    previous_procedures?: string,
    allergies?: string,
    medicines?: string,
    birthdate?: string,
    gender?: string
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      axios
        .post(
          'auth/register',
          objectToFormData({
            name,
            email,
            password,
            address,
            medicines,
            previous_procedures,
            allergies,
            diseases,
            birthdate,
            gender,
            last_name: lastName,
            password_confirmation: confirmedPassword,
            phone_number: phoneNumber,
            country_id: countryId,
            profile_picture: profilePicture
              ? SentPhoto.toFile(profilePicture)
              : null,
            profile_picture_rotation: profilePicture?.rotation,
          }),
        )
        .then(() => {
          resolve();
        })
        .catch(reject);
    }),

  registerWithSocialNetwork: (
    name: string,
    lastName: string,
    email: string,
    address: string,
    phoneNumber: string,
    countryId: number,
    token: string,
    tokenType: 'google' | 'facebook',
    profilePicture: SentPhoto | null,
    diseases?: string,
    previous_procedures?: string,
    allergies?: string,
    medicines?: string,
    birthdate?: string,
    gender?: string
  ): Promise<User> =>
    new Promise((resolve, reject) => {
      axios
        .post(
          'auth/register-with-social-network',
          objectToFormData({
            name,
            email,
            address,
            token,
            medicines,
            previous_procedures,
            allergies,
            diseases,
            birthdate,
            gender,
            last_name: lastName,
            phone_number: phoneNumber,
            country_id: countryId,
            token_type: tokenType,
            profile_picture: profilePicture
              ? SentPhoto.toFile(profilePicture)
              : null,
            profile_picture_rotation: profilePicture?.rotation,
          }),
        )
        .then(({data}) => {
          resolve(fromRawUser(data));
        })
        .catch(reject);
    }),

  resetPassword: (email: string): Promise<void> =>
    new Promise((resolve, reject) => {
      axios
        .post('auth/reset-password', {email})
        .then(() => {
          resolve();
        })
        .catch(reject);
    }),
};
