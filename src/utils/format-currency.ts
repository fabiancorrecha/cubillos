export const formatCurrency = (symbol: string, value: number): string => {
  return (
    symbol +
    value
      .toFixed(2)
      .replace('.', ',')
      .replace(/\d(?=(\d{3})+,)/g, '$&.')
  );
};
