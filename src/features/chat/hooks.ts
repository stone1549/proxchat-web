import { Location, Message, PendingMessage } from "../../domain";
import { isEqual } from "lodash";
import { useInterval } from "../../hooks";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../App";
import {
  isChatMessageNotificationMessage,
  isErrorResponseMessage,
  sendHandshake,
  ServerMessage,
  ServerPayload,
  toClientSendChatMessage,
  toMessage,
} from "./protocol";
import { dateTimeReviver } from "../../utils";
import { DateTime } from "luxon";
import { SettingsContext } from "../settings/context";

export const GPS_POLL_MS = 300000;

export type RemovePendingMessageFunc = (clientId: string) => void;
export type SendMessageFunc = (content: string, position: Location) => void;
export type ResendMessageFunc = (message: PendingMessage) => void;

export const useChat = () => {
  const [reconnectDelay, setReconnectDelay] = useState(250);
  const [checkConnectionDelay, setCheckConnectionDelay] = useState(15000);
  const { radiusInMeters } = useContext(SettingsContext);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [pendingMessages, setPendingMessages] = useState<Array<PendingMessage>>(
    []
  );
  const [error, setError] = useState("");
  const { position } = usePosition();
  const { token, sender, logout } = useContext(AuthContext);
  const ws = useRef<WebSocket | null>(null);

  // Currently logs a warning about the dependency on `reconnect` being unnecessary because it is not used inside
  // the useMemo callback. This is a false positive, because the `reconnect` value is used solely to trigger
  // the creation of a new WebSocket instance.
  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:9006/ws");

    return () => {
      ws.current?.close();
    };
  }, []);

  const removePendingMessage = useMemo<RemovePendingMessageFunc>(() => {
    return (clientId: string) => {
      const index = pendingMessages.findIndex((m) => m.clientId === clientId);
      if (index !== -1) {
        const before = pendingMessages.slice(0, index);
        const after = pendingMessages.slice(index + 1);

        setPendingMessages([...before, ...after]);
      }
    };
  }, [pendingMessages, setPendingMessages]);

  const sendMessage = useMemo<SendMessageFunc>(() => {
    return async (content: string, position: Location) => {
      const message: PendingMessage = {
        clientId: uuidv4(),
        content,
        sentAt: DateTime.utc(),
        sender: sender,
        location: position,
        retries: 0,
        failed: false,
        succeeded: false,
      };
      setPendingMessages([...pendingMessages, message]);
      ws.current?.send(JSON.stringify(toClientSendChatMessage(message, token)));
    };
  }, [ws, pendingMessages, setPendingMessages, token]);

  const resendMessage = async (message: PendingMessage) => {
    for (const [index, pm] of pendingMessages.entries()) {
      if (isEqual(pm, message)) {
        setPendingMessages([
          ...pendingMessages.slice(0, index),
          {
            content: message.content,
            location: message.location,
            failed: false,
            retries: message.retries + 1,
            sentAt: DateTime.utc(),
            clientId: message.clientId,
            sender: message.sender,
            succeeded: false,
          },
          ...pendingMessages.slice(index + 1),
        ]);
        break;
      }
    }
    ws.current?.send(JSON.stringify(toClientSendChatMessage(message, token)));
  };

  if (ws.current) {
    ws.current.onopen = () => {
      setError("");
      setCheckConnectionDelay(15000);
      setReconnectDelay(250);
      if (position && ws.current) {
        sendHandshake(ws.current, token, position, radiusInMeters);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message: ServerMessage<ServerPayload> = JSON.parse(
          event.data,
          dateTimeReviver
        );

        switch (message.payload.type) {
          case "ChatMessageNotification":
            if (isChatMessageNotificationMessage(message)) {
              setMessages([...messages, toMessage(message, position)]);
              // delay(() => {
              removePendingMessage(message.payload.message.clientId);
              // }, 10);
            } else {
              console.error("Invalid ChatMessageNotification message", message);
            }
            break;
          case "HandshakeResponse":
            if (pendingMessages.length > 0) {
              pendingMessages.forEach((m) => {
                if (!m.failed && !m.succeeded) {
                  ws.current?.send(
                    JSON.stringify(toClientSendChatMessage(m, token))
                  );
                }
              });
            }
            break;
          case "ErrorResponse":
            if (isErrorResponseMessage(message)) {
              if (message.payload.code === 401) {
                logout();
              } else if (message.payload.code !== 409) {
                // This error is caused when the simulator refreshes the UI to hotload changes and ends up
                // sending the handshake message more than once. We can ignore it as it should never happen
                // in production.
                setError(message.payload.error);
              }
            } else {
              console.error("Invalid ErrorResponse message", message);
            }
            break;
          default: {
            console.error("Unknown message type", message);
          }
        }
      } catch (e) {
        console.error("Failed to parse message", event.data, e);
      }
    };

    ws.current.onerror = () => {
      setError("connection error");
      ws.current?.close();
    };

    ws.current.onclose = (_) => {
      console.log("Websocket closed");
    };
  }

  useInterval(() => {
    if (ws.current && ws.current.readyState === WebSocket.CLOSED) {
      console.log(
        `websocket closed, reconnecting after delay... ${reconnectDelay}`
      );
      setReconnectDelay(Math.min(reconnectDelay * 2, 10000));
      setCheckConnectionDelay(Math.min(reconnectDelay * 2, 10000));
      ws.current = new WebSocket("ws://127.0.0.1:9006/ws");
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        setError("reconnecting...");
      }
    }
  }, checkConnectionDelay);

  return {
    messages,
    pendingMessages,
    position,
    sendMessage,
    error,
    removePendingMessage,
    resendMessage,
    radius: radiusInMeters,
  };
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
