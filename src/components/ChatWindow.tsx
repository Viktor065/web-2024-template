import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  TextField,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import type { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  disabled: boolean;
  onSend: (text: string) => void;
  onDismissError: () => void;
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  gap: 8px;
`;

const ErrorBar = styled(Alert)`
  && {
    margin: 0 16px 8px;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
`;

function ChatWindow({
  messages,
  isLoading,
  error,
  disabled,
  onSend,
  onDismissError,
}: ChatWindowProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <ChatContainer>
      {messages.length === 0 ? (
        <EmptyState>
          <span style={{ fontSize: 48 }}>💬</span>
          <span>Начните диалог с Qwen — задайте любой вопрос!</span>
        </EmptyState>
      ) : (
        <MessagesArea>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <CircularProgress size={24} sx={{ alignSelf: "flex-start" }} />
          )}
          <div ref={bottomRef} />
        </MessagesArea>
      )}
      {error && (
        <ErrorBar severity="error" onClose={onDismissError}>
          {error}
        </ErrorBar>
      )}
      <InputRow>
        <TextField
          fullWidth
          multiline
          maxRows={5}
          size="small"
          variant="outlined"
          placeholder={disabled ? "Сначала укажите API-ключ…" : "Напишите сообщение…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading || disabled}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isLoading || disabled || !text.trim()}
          aria-label="Отправить"
        >
          <SendIcon />
        </IconButton>
      </InputRow>
    </ChatContainer>
  );
}

export default ChatWindow;
