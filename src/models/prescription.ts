export type Prescription = {
  id: number;
  details: PrescriptionDetails[];
  created_at: string;
};

export type PrescriptionDetails = {
  id: number;
  name: string;
  indications: string;
};
