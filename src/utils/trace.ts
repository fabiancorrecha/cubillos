export const trace = (message: string) => <T>(what: T): T => {
  console.log(message, what);
  return what;
};
