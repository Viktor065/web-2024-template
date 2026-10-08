import { useState } from "react";
import styled from "styled-components";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface ApiKeyDialogProps {
  apiKey: string;
  onSave: (key: string) => void;
}

const StyledDialogTitle = styled(DialogTitle)`
  && {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const HelpText = styled(Typography)`
  && {
    margin-top: 8px;
  }
`;

function ApiKeyDialog({ apiKey, onSave }: ApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");

  const handleOpen = () => {
    setDraftKey(apiKey);
    setOpen(true);
  };

  const handleSave = () => {
    onSave(draftKey.trim());
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={apiKey ? "Изменить API-ключ" : "Ввести API-ключ"}>
        <IconButton onClick={handleOpen} color={apiKey ? "success" : "warning"}>
          {apiKey ? <VisibilityOffIcon /> : <KeyIcon />}
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <StyledDialogTitle>
          <KeyIcon /> API-ключ Alibaba Cloud (DashScope)
        </StyledDialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            label="API Key"
            placeholder="sk-..."
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            autoFocus
          />
          <HelpText variant="body2" color="text.secondary">
            Получите ключ на платформе Alibaba Cloud DashScope. Ключ хранится
            только в вашем браузере (localStorage) и не передаётся третьим
            лицам. Из-за политики CORS браузерные запросы к API могут
            блокироваться — для полноценной работы добавьте прокси или бэкенд.
          </HelpText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained" disabled={!draftKey.trim()}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ApiKeyDialog;
