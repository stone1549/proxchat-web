import React from "react";
import { Message, PendingMessage, Sender } from "../../domain";
import { ListItem, ListItemText, Theme } from "@mui/material";

type ChatBubbleProps = {
  message: PendingMessage | Message;
  sender: Sender;
  key: string;
};
export const ChatBubble: React.FunctionComponent<ChatBubbleProps> = ({
  message,
  sender,
}) => {
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
      <ListItemText>
        <span style={styles.chatBubbleSender}>{message.sender.username}:</span>{" "}
        {message.content}
      </ListItemText>
    </ListItem>
  );
};

const styles = {
  chatLogItem: {
    maxWidth: "75%",
    borderRadius: "5vh",
    padding: "10px 10px",
    marginTop: "1vh",
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
  }),
  chatBubbleSender: {
    fontWeight: "bold",
  },
};
