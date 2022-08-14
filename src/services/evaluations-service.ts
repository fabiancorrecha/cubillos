/* eslint-disable @typescript-eslint/camelcase */

import {Evaluation} from 'models/evaluation';
import {
  EvaluationMessage,
  RawEvaluationMessage,
} from 'models/evaluation-message';
import {SentPhoto} from 'models/sent-photo';
import {useEffect} from 'react';
import {pluck} from 'utils';
import {axios} from './axios';
import {objectToFormData} from './object-to-form-data';
import {socket} from './socket';

export const EvaluationsService = {
  store: (
    userId: number,
    procedures: Set<number>,
    photos: SentPhoto[],
    referencePhotos: SentPhoto[],
    description: string,
    weight: number,
    weight_unit_id: number,
    height: number,
    height_unit_id: number,
    payment: string,
    payment_code: string,
    bust_size: number,
    hip_measurement: number,
    waist_measurement: number,
    medicines?: string,
    previous_procedures?: string,
    birthdate?: string,
    allergies?: string,
    gender?: string,
    diseases?: string,
    onUploadProgress?: (event: any) => void
  ): Promise<void> => {
    return axios.post(
      'evaluations',
      objectToFormData({
        user_id: userId,
        procedures_ids: Array.from(procedures),
        photos: photos.map(SentPhoto.toFile),
        photos_rotations: photos.flatMap(pluck(['rotation'])),
        reference_photos: referencePhotos.map(SentPhoto.toFile),
        reference_photos_rotations: referencePhotos.flatMap(
          pluck(['rotation']),
        ),
        description,
        weight_unit_id,
        weight,
        height_unit_id,
        height,
        payment,
        payment_code,
        waist_measurement,
        hip_measurement,
        bust_size,
        medicines,
        previous_procedures,
        birthdate,
        allergies,
        gender,
        diseases,
      }),
      {
        onUploadProgress
      }
    );
  },

  create: (
    userId: number,
    procedures: Set<number>,
    photos: SentPhoto[],
    referencePhotos: SentPhoto[],
    info: {
      weight: number;
      weight_unit_id: number;
      height: number;
      height_unit_id: number;
      bust_size: number;
      hip_measurement: number;
      waist_measurement: number;
    },
    description: {
      description: string;
      medicines?: string;
      previous_procedures?: string;
      birthdate?: string;
      allergies?: string;
      gender?: string;
      diseases?: string;
    },
    toSave: 'onlysave' | 'onlypayment',
    onUploadProgress?: (event: any) => void,
    payment?: string,
    payment_code?: string,
  ): Promise<void> => {
    return axios.post(
      'evaluations/create',
      objectToFormData({
        user_id: userId,
        procedures: Array.from(procedures),
        photos: photos.map(SentPhoto.toFile),
        photos_rotations: photos.flatMap(pluck(['rotation'])),
        reference_photos: referencePhotos.map(SentPhoto.toFile),
        reference_photos_rotations: referencePhotos.flatMap(
          pluck(['rotation']),
        ),
        weight_unit_id: info.weight_unit_id,
        weight: info.weight,
        height_unit_id: info.height_unit_id,
        height: info.height,
        waist_measurement: info.waist_measurement,
        hip_measurement: info.hip_measurement,
        bust_size: info.bust_size,
        description: description.description,
        medicines: description.medicines,
        previous_procedures: description.previous_procedures,
        birthdate: description.birthdate,
        allergies: description.allergies,
        gender: description.gender,
        diseases: description.diseases,
        [toSave]: true,
        payment,
        payment_code,
      }),
      {
        onUploadProgress
      }
    );
  },

  deleteEvaluationPending: (userId: number, id: number): Promise<void> => {
    return axios.post('evaluations/deletepending', {user_id: userId, id});
  },

  storeFailedPayment: (payment: string): Promise<void> =>
    axios.post('evaluations/payment-failed', payment, {
      headers: {'Content-Type': 'application/json'},
    }),

  index: (userId?: number): Promise<Evaluation[]> =>
    new Promise((resolve, reject) =>
      axios
        .get(`evaluations${userId ? `?user_id=${userId}` : ''}`)
        .then(({data}) => {
          resolve(data.map(Evaluation.fromRawEvaluation));
        })
        .catch(reject),
    ),

  checkEvaluationPending: (user_id: number): Promise<Evaluation> =>
    new Promise((resolve, reject) =>
      axios
        .post('evaluations/checkpending', { user_id })
        .then(({data}) => {
          // console.log({data});
          if (data?.evaluation) {
            data.evaluation.budgets = [];
            data.evaluation.photos = [];
            data.evaluation.referencePhotos = {};

            const info = {
              weight: data.evaluation.weight,
              weight_unit_id: data.evaluation.weight_unit_id,
              height: data.evaluation.height,
              height_unit_id: data.evaluation.height_unit_id,
              hip_measurement: data.evaluation.hip_measurement || 0,
              waist_measurement: data.evaluation.waist_measurement || 0,
              bust_size: data.evaluation.bust_size || 0,
            };

            const description = {
              description: data.evaluation.description,
              medicines: data.evaluation.user.data.medicines,
              previous_procedures: data.evaluation.user.data.previous_procedures,
              birthdate: data.evaluation.user.data.birthdate,
              allergies: data.evaluation.user.data.allergies,
              gender: data.evaluation.user.data.gender,
              diseases: data.evaluation.user.data.diseases,
            };

            resolve({
              ...data.evaluation,
              ...Evaluation.fromRawEvaluation(data.evaluation),
              info,
              description,
            });
          } else {
            reject();
          }
        })
        .catch(reject),
    ),

  getMessages: (
    userId: number,
    evaluationId: number,
  ): Promise<EvaluationMessage[]> =>
    new Promise((resolve, reject) =>
      axios
        .get(`evaluations/${evaluationId}/messages?user_id=${userId}`)
        .then(({data}) => {
          resolve(data.map(EvaluationMessage.fromRaw));
        })
        .catch(reject),
    ),

  sendMessage: (
    userId: number,
    evaluationId: number,
    text: string,
    attachmentUri: string,
  ): Promise<RawEvaluationMessage> =>
    new Promise((resolve, reject) =>
      axios
        .post(
          `evaluations/${evaluationId}/send-message`,
          objectToFormData({
            text,
            user_id: userId,
            file: attachmentUri
              ? SentPhoto.toFile({uri: attachmentUri, rotation: 0})
              : undefined,
          }),
        )
        .then(({data}) => {
          resolve(data);
        })
        .catch(reject),
    ),

  sawMessage: (messageId: number): Promise<void> =>
    axios.put(`evaluations/saw-message/${messageId}`, {_method: 'PUT'}),

  useSendMessageListener: (listener: (_: EvaluationMessage) => void): void => {
    useEffect(() => {
      const realListener = (message: RawEvaluationMessage): void => {
        listener(EvaluationMessage.fromRaw(message));
      };

      socket.on('evaluations/send-message', realListener);
      return (): void => {
        socket.off('evaluations/send-message', realListener);
      };
    }, [listener]);
  },
};
