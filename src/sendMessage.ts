type SendMessageRequest =
  | {
      name: 'FETCH_ACTIVE_TABS';
    }
  | {
      name: 'FETCH_ATTENDANCE_REPORT_DOCUMENT';
    };

type SendMessageResponse<T, E extends Error> =
  | {
      status: 'error';
      error: E;
    }
  | {
      status: 'success';
      data: T;
    };

export type OnMessageListenerParameter = [
  request: SendMessageRequest,
  sender: chrome.runtime.MessageSender,
  response: (res: SendMessageResponse<any, Error>) => void, // FIXME: type
];

type SendMessageParameter<T, E extends Error = Error> = [
  request: SendMessageRequest,
  response: (res: SendMessageResponse<T, E>) => void,
];

// type SendMessage<T, E extends Error = Error> = (...args: SendMessageParameter<T, E>) => void;

export const sendMessage = <T>(...args: SendMessageParameter<T>) =>
  chrome.runtime.sendMessage(args[0], args[1]);
