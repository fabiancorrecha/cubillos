export const prop = <T, K extends keyof T>(key: K) => (object: T): T[K] =>
  object[key];
