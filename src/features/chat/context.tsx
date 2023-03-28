import { createContext } from "react";
import {
  RemovePendingMessageFunc,
  ResendMessageFunc,
  SendMessageFunc,
} from "./hooks";
import { Location } from "../../domain";

export type ChatContextValue = {
  sendMessage: SendMessageFunc;
  removePendingMessage: RemovePendingMessageFunc;
  resendMessage: ResendMessageFunc;
  position: Location | undefined;
  radiusInMeters: number;
};

export const ChatContext = createContext<ChatContextValue>({
  sendMessage: (_) => {
    throw new Error("default implementation");
  },
  removePendingMessage: (_) => {
    throw new Error("default implementation");
  },
  resendMessage: (_) => {
    throw new Error("default implementation");
  },
  position: undefined,
  radiusInMeters: 0,
});
