import styled from "styled-components";
import { Paper, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import type { ChatMessage } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

const Bubble = styled(Paper)<{ isUser: boolean }>`
  && {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 16px;
    max-width: 85%;
    align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
    background-color: ${(props) => (props.isUser ? "#6c5ce7" : "#f0f0f0")};
    color: ${(props) => (props.isUser ? "#fff" : "inherit")};
  }
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageText = styled(Typography)`
  && {
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  return (
    <Bubble elevation={1} isUser={isUser}>
      <Avatar>{isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}</Avatar>
      <MessageText variant="body1">{message.content}</MessageText>
    </Bubble>
  );
};

export default MessageBubble;
