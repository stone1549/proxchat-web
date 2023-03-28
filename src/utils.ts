import { Sender } from "./domain";
import jwt_decode, { JwtPayload } from "jwt-decode";
import { DateTime } from "luxon";

type AppToken = JwtPayload & {
  username: string | undefined;
};

export const getSenderFromToken = (token: string): Sender => {
  if (!token) {
    return {
      username: "",
      id: "",
    };
  }
  const decoded = jwt_decode<AppToken>(token);
  return {
    username: decoded.username || "",
    id: decoded.sub || "",
  };
};

export const dateTimeReviver: (key: string, value: any) => any = (
  key,
  value
) => {
  if (typeof value === "string") {
    const dt = DateTime.fromISO(value);
    if (dt.isValid) {
      return dt;
    }
  }
  return value;
};
