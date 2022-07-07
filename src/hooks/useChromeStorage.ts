import { useEffect, useRef, useState } from 'react';

export const useChromeStorage = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue);
  const isInitialized = useRef(false);

  useEffect(() => {
    chrome.storage.local
      .get(key)
      .then((res) => setState(res[key]))
      .catch(() => {
        console.warn(`useChromeStorage get error: ${key}`);
        setState(defaultValue);
      })
      .finally(() => {
        isInitialized.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    chrome.storage.local.set({ [key]: state }).catch(() => {
      console.warn(`useChromeStorage set error: ${key}`);
    });
  }, [key, state]);

  return [state, setState] as const;
};
