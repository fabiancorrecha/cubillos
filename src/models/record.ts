export type Record = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  files: {id: number; file_url: string}[];
};
