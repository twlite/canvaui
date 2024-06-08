export const stringify = (
  name: string,
  value: string | number | boolean | Record<any, any>
) => {
  if (name === 'style' && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  return String(value);
};
