// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => unknown>(
  callback: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};
