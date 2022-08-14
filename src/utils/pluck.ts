export const pluck = <T, K extends keyof T>(keys: K[]) => (object: T): T[K][] =>
  keys.map(key => object[key]);
