import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import FlatList from "flatlist-react";
import { useChat } from "./hooks";
import { renderFunc } from "flatlist-react/lib/___subComponents/uiFunctions";
import { isMessage, Message, PendingMessage } from "../../domain";
import { ChatContext } from "./context";
import { ChatInput } from "./ChatInput";
import { Container, Divider, List, Paper, Theme } from "@mui/material";
import { AuthContext, AuthContextValue } from "../../App";
import { ChatBubble } from "./ChatBubble";
import { ChatAppBar } from "./ChatAppBar";
import { v4 as uuidv4 } from "uuid";

type ChatProps = {};

export const Chat: React.FunctionComponent<ChatProps> = () => {
  const [id] = useState(uuidv4().toString());
  const { sender } = useContext<AuthContextValue>(AuthContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [disableAutoScroll, setDisableAutoScroll] = useState(false);
  const {
    messages,
    pendingMessages,
    removePendingMessage,
    sendMessage,
    resendMessage,
    error,
    position,
  } = useChat();

  const renderItem: renderFunc<Message | PendingMessage> = useMemo(() => {
    return (message) => {
      const key = isMessage(message) ? message.id : message.clientId;
      return <ChatBubble message={message} sender={sender} key={key} />;
    };
  }, [sender]);

  const combinedMessages = useMemo<Array<PendingMessage | Message>>(() => {
    return [...messages, ...pendingMessages];
  }, [messages, pendingMessages]);

  useEffect(() => {
    if (!disableAutoScroll) {
      scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollRef, messages.length + pendingMessages.length, disableAutoScroll]);

  const onScrollChatLog = useMemo(() => {
    return () => {
      const bottom = scrollRef?.current?.getBoundingClientRect()?.bottom;

      if (bottom && bottom <= window.innerHeight) {
        if (disableAutoScroll) {
          setDisableAutoScroll(false);
        }
      } else {
        if (!disableAutoScroll) {
          setDisableAutoScroll(true);
        }
      }
    };
  }, [scrollRef, disableAutoScroll, setDisableAutoScroll]);

  console.log("rendering Chat", id);
  return (
    <ChatContext.Provider
      value={{ sendMessage, resendMessage, removePendingMessage, position }}
    >
      <Container sx={styles.chatContainer}>
        <ChatAppBar />
        <Paper sx={styles.chatPaper}>
          {error && (
            <div>
              <span>{error}</span>
            </div>
          )}
          <List sx={styles.chatLog} onScroll={onScrollChatLog}>
            {!!messages && (
              <FlatList list={combinedMessages} renderItem={renderItem} />
            )}
            <div ref={scrollRef} />
          </List>
          <Divider />
          <ChatInput />
        </Paper>
      </Container>
    </ChatContext.Provider>
  );
};

const styles = {
  chatContainer: (theme: Theme) => ({
    height: "100%",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "65%",
      minWidth: "65%",
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: "50%",
      minWidth: "50%",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: "40%",
      minWidth: "40%",
    },
  }),
  chatLog: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: "90%",
    maxHeight: "90%",
    width: "100%",
    overflow: "scroll",
    listStyle: "none",
  },
  chatPaper: {
    width: "100%",
    height: "92%",
  },
};
