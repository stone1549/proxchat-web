import { Location, Message, PendingMessage } from "../../domain";
import { isEqual } from "lodash";
import { AuthError, ChatError, pollChat, send } from "../../api";
import { useInterval } from "../../hooks";
import { useContext, useMemo, useState } from "react";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../App";

export const CHAT_POLL_MS = 5000;
export const GPS_POLL_MS = 300000;

export type RemovePendingMessageFunc = (
  message: Message | PendingMessage
) => void;
export type SendMessageFunc = (content: string, position: Location) => void;
export type ResendMessageFunc = (message: PendingMessage) => void;

export const useChat = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<PendingMessage>>(
    []
  );
  const [error, setError] = useState("");
  const { position } = usePosition();
  const { token, sender } = useContext(AuthContext);

  const removePendingMessage = useMemo<RemovePendingMessageFunc>(() => {
    return (message: Message | PendingMessage) => {
      for (const [index, pending] of pendingMessages.entries()) {
        if (match(pending, message)) {
          const before = pendingMessages.slice(0, index);
          const after = pendingMessages.slice(index + 1);
          setPendingMessages([...before, ...after]);
        }
      }
    };
  }, [pendingMessages, setPendingMessages]);

  const poll = async (token: string) => {
    await sendPendingMessages(
      pendingMessages,
      setPendingMessages,
      messages,
      token
    );
    let after = moment().subtract(10, "minutes");

    if (messages.length > 0) {
      after = messages[messages.length - 1].createdAt;
    }

    if (position !== undefined) {
      const newMessages = await pollChat(position, after, token);
      setError("");
      if (newMessages.length > 0) {
        for (const newMessage of newMessages) {
          removePendingMessage(newMessage);
        }
        setMessages([...messages, ...newMessages]);
      }
    }
  };

  useInterval(
    async () => {
      try {
        await poll(token);
      } catch (e) {
        await handleError(e, poll, setError);
      }
    },
    CHAT_POLL_MS,
    true
  );

  const sendMessage = useMemo<SendMessageFunc>(() => {
    return async (content: string, position: Location) => {
      setPendingMessages([
        ...pendingMessages,
        {
          clientId: uuidv4(),
          content,
          sender: sender,
          location: position,
          retries: 0,
          failed: false,
          createdAt: moment(),
          succeeded: false,
        },
      ]);
    };
  }, [sender, setPendingMessages, pendingMessages]);

  const resendMessage: ResendMessageFunc = async (
    message: PendingMessage
  ): Promise<void> => {
    const sendFunc = async (token: string) => {
      await send(message.content, message.location, message.clientId, token);
    };
    try {
      for (const [index, pm] of pendingMessages.entries()) {
        if (isEqual(pm, message)) {
          setPendingMessages([
            ...pendingMessages.slice(0, index),
            {
              content: message.content,
              location: message.location,
              failed: false,
              retries: message.retries + 1,
              createdAt: moment(),
              clientId: message.clientId,
              sender: message.sender,
              succeeded: false,
            },
            ...pendingMessages.slice(index + 1),
          ]);
          break;
        }
      }
      await sendFunc(token);
    } catch (e) {
      await handleError(e, sendFunc, setError);
    }
  };
  return {
    messages,
    pendingMessages,
    position,
    sendMessage,
    error,
    removePendingMessage,
    resendMessage,
  };
};

const match = (pending: PendingMessage, message: Message | PendingMessage) => {
  return pending.clientId === message.clientId;
};

const sendPendingMessages = async (
  pendingMessages: Array<PendingMessage>,
  setPendingMessages: (pendingMessages: Array<PendingMessage>) => void,
  messages: Array<Message>,
  token: string
) => {
  const stillPending: Array<PendingMessage> = [];
  for (const pendingMessage of pendingMessages) {
    const sendFunc = async (token: string) => {
      await send(
        pendingMessage.content,
        pendingMessage.location,
        pendingMessage.clientId,
        token
      );
    };

    try {
      if (!pendingMessage.succeeded && !pendingMessage.failed) {
        await sendFunc(token);
        pendingMessage.succeeded = true;
        stillPending.push(pendingMessage);
      } else if (pendingMessage.succeeded) {
        if (!messages.some((pm) => pm.clientId === pendingMessage.clientId)) {
          stillPending.push(pendingMessage);
        }
      } else {
        stillPending.push(pendingMessage);
      }
    } catch (e) {
      if (pendingMessage.retries < 5) {
        pendingMessage.retries += 1;
      } else {
        pendingMessage.failed = true;
      }

      stillPending.push(pendingMessage);
    }
  }
  setPendingMessages([...stillPending]);
};

export const usePosition = () => {
  const [position, setPosition] = useState<Location | undefined>(undefined);
  const [error, setError] = useState("");

  useInterval(
    () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        (positionError) => {
          setPosition(undefined);
          setError(positionError.message);
        }
      );
    },
    GPS_POLL_MS,
    true
  );

  return { position, error };
};

const handleError = async (
  e: unknown,
  retryFunc: (token: string) => Promise<void>,
  setError: (message: string) => void
) => {
  if (e instanceof AuthError) {
    setError("not authenticated");
    return;
  } else if (e instanceof ChatError) {
    setError(e.message);
    return;
  }
  setError("unable to connect to server");
};
