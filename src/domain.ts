import moment from "moment";
import { DateTime } from "luxon";

export type Sender = {
  id: string;
  username: string;
};

export type Location = {
  lat: number;
  long: number;
};

export type Message = {
  id: string;
  content: string;
  sender: Sender;
  location: Location;
  sentAt: DateTime;
  receivedAt: DateTime;
  clientId: string;
  distanceInMeters: number;
};

export type PendingMessage = {
  clientId: string;
  content: string;
  sender: Sender;
  location: Location;
  retries: number;
  failed: boolean;
  sentAt: DateTime;
  succeeded: boolean;
};

export const isMessage = (
  value: Message | PendingMessage
): value is Message => {
  return value.hasOwnProperty("id");
};
