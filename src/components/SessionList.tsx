import styled from "styled-components";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCommentIcon from "@mui/icons-material/AddComment";
import type { ChatSession } from "../types";

interface SessionListProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export const DRAWER_WIDTH = 280;

const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
`;

function SessionList({
  sessions,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: SessionListProps) {
  return (
    <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH }}>
      <Box sx={{ width: DRAWER_WIDTH }}>
        <Header>
          <Typography variant="h6">Диалоги</Typography>
          <IconButton onClick={onNewChat} color="primary" aria-label="Новый чат">
            <AddCommentIcon />
          </IconButton>
        </Header>
        <List>
          {sessions.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
              Пока нет сохранённых диалогов
            </Typography>
          )}
          {sessions.map((session) => (
            <ListItemButton
              key={session.id}
              selected={session.id === activeId}
              onClick={() => onSelect(session.id)}
              dense
            >
              <ListItemText
                primary={session.title}
                primaryTypographyProps={{ noWrap: true }}
              />
              <IconButton
                size="small"
                aria-label="Удалить диалог"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SessionList;
