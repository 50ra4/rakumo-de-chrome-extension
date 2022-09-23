import { useEffect } from 'react';

export const useMutationObservable = <E extends HTMLElement>(
  element: E | null,
  callback: MutationCallback,
  config: MutationObserverInit,
) => {
  useEffect(() => {
    if (!element) return;

    const observer = new MutationObserver(callback);
    observer.observe(element, config);

    return () => {
      observer.disconnect();
    };

    // run only if element changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);
};
