import React from "react";
import { isMessage, Message, PendingMessage, Sender } from "../../domain";
import { ListItem, ListItemText, Theme } from "@mui/material";
import { useSettings } from "../settings/hooks";
import { convertToDesiredUnits, Units, UnitSystems } from "../../utils";
import { DateTime } from "luxon";

const displayTimeSince = (ts: DateTime) => {
  const durationObject = ts
    .diffNow(["year", "month", "week", "day", "hour", "minute", "second"])
    .toObject();
  const years = Math.round(Math.abs(durationObject.years || 0));
  const months = Math.round(Math.abs(durationObject.months || 0));
  const weeks = Math.round(Math.abs(durationObject.weeks || 0));
  const days = Math.round(Math.abs(durationObject.days || 0));
  const hours = Math.round(Math.abs(durationObject.hours || 0));
  const minutes = Math.round(Math.abs(durationObject.minutes || 0));
  const seconds = Math.round(Math.abs(durationObject.seconds || 0));

  if (years !== 0) {
    if (months < 3) {
      return `${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months < 10) {
      return `over ${years} year${years > 1 ? "s" : ""} ago`;
    } else {
      return `almost ${years + 1} years ago`;
    }
  } else if (months !== 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (weeks !== 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (days !== 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours !== 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes !== 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
};

const displayDistance = (distanceInMeters: number, unitSystem: UnitSystems) => {
  switch (unitSystem) {
    case UnitSystems.metric:
      const km = distanceInMeters / 1000;

      if (km > 0.5) {
        return `${km.toFixed()}km away`;
      }
      return `${distanceInMeters.toFixed()}m away`;
    case UnitSystems.standard:
      const inMiles = convertToDesiredUnits(
        distanceInMeters,
        Units.m,
        Units.mi
      );
      const inFeet = convertToDesiredUnits(distanceInMeters, Units.m, Units.ft);

      if (inMiles < 0.1) {
        return `${inFeet.toFixed(2)}ft away`;
      }
      return `${inMiles.toFixed(2)} miles away`;
    default:
      throw new Error("unsupported unit type");
  }
};

type ChatBubbleProps = {
  message: PendingMessage | Message;
  sender: Sender;
  key: string;
};
export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
  sender,
}) => {
  const ownMessage = message.sender.username === sender.username;
  const { unitSystem } = useSettings();
  return (
    <ListItem
      sx={
        message.sender.username === sender.username
          ? [styles.chatLogItem, styles.chatLogOwnItem]
          : [styles.chatLogItem, styles.chatLogOtherItem]
      }
      color={
        message.sender.username === sender.username ? "primary" : "secondary"
      }
    >
      <ListItemText sx={styles.chatLogItemLabel}>
        <span style={styles.chatLogItemLabelTxt}>
          {ownMessage ? "" : sender.username}{" "}
          {!ownMessage &&
            isMessage(message) &&
            `(${displayDistance(message.distanceInMeters, unitSystem)}) `}
          {isMessage(message)
            ? displayTimeSince(message.receivedAt)
            : displayTimeSince(message.sentAt)}
        </span>
      </ListItemText>
      <ListItemText sx={styles.chatLogItemContent}>
        <span style={{ fontSize: "14pt" }}>{message.content}</span>
      </ListItemText>
    </ListItem>
  );
};

const styles = {
  chatLogItem: {
    maxWidth: "75%",
    borderRadius: "5vh",
    padding: "5px 5px",
    marginTop: "5px",
    flexDirection: "column",
  },
  chatLogOtherItem: (theme: Theme) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    alignSelf: "flex-start",
    textAlign: "left",
    paddingLeft: 5,
    marginLeft: 2,
  }),
  chatLogOwnItem: (theme: Theme) => ({
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    alignSelf: "flex-end",
    textAlign: "right",
    paddingRight: 5,
    marginRight: 2,
    flexDirection: "column",
  }),
  chatLogItemLabel: {
    marginTop: 0,
    marginBottom: 0,
    width: "100%",
    textAlign: "center",
  },
  chatLogItemLabelTxt: {
    fontWeight: "bold",
    fontSize: "8pt",
  },
  chatLogItemContent: {
    marginTop: 0,
    marginBottom: 0,
    width: "100%",
  },
  chatLogItemTxt: {
    fontSize: "12pt",
  },
};
