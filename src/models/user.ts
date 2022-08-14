import {Person, RawPerson, fromRawPerson} from './person';

export type User = {
  id: number;
  email: string;
  verified: boolean;
  authType: AuthType;
  level: Level;
  person: Person;
  active: boolean;
};

export type AuthType = 'normal' | 'google' | 'facebook';

export type Level = 'super-admin' | 'admin' | 'client';

export type RawUser = {
  id: number;
  email: string;
  level: number;
  status: number;
  verified: number;
  facebook: number;
  google: number;
  person: RawPerson;
};

export const fromRawUser = (user: RawUser): User => {
  return {
    id: user.id,
    email: user.email,
    level:
      user.level === 1 ? 'super-admin' : user.level === 2 ? 'admin' : 'client',
    verified: !!user.verified,
    active: !!user.status,
    authType: user.google ? 'google' : user.facebook ? 'facebook' : 'normal',
    person: fromRawPerson(user.person),
  };
};
