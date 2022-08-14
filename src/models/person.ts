import {Country, RawCountry, fromRawCountry} from './country';

export type Person = {
  id: number;
  name: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  country: Country;
  profilePicture: string | null;
};

export type RawPerson = {
  id: number;
  name: string;
  lastname: string;
  phone: string;
  address: string;
  country: RawCountry;
  profile_picture_url: string | null;
};

export const fromRawPerson = (user: RawPerson): Person => {
  return {
    id: user.id,
    name: user.name,
    lastName: user.lastname,
    phoneNumber: user.phone,
    address: user.address,
    country: fromRawCountry(user.country),
    profilePicture: user.profile_picture_url,
  };
};
