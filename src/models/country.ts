export type Country = {
  id: number;
  sortName: string;
  name: string;
};

export type RawCountry = {
  id: number;
  sortname: string;
  name: string;
};

export const fromRawCountry = (rawCountry: RawCountry): Country => ({
  id: rawCountry.id,
  sortName: rawCountry.sortname,
  name: rawCountry.name,
});
