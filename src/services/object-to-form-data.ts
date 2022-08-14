/* eslint-disable @typescript-eslint/no-explicit-any */

const valueForFormData = (value: any): string | {[_: string]: any} => {
  // TODO: Incompleto.

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
};

export const objectToFormData = (object: {[_: string]: any}): FormData => {
  // TODO: ¿Soporte para arreglos dentro de arreglos y/u objetos?

  const formData = new FormData();
  Object.entries(object).forEach(([key, value]) => {
    if (!Array.isArray(value)) {
      formData.append(key, valueForFormData(value));
    } else {
      value.forEach((arrayValue, index) => {
        formData.append(`${key}[${index}]`, valueForFormData(arrayValue));
      });
    }
  });

  return formData;
};
