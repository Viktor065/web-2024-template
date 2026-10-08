import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import styled from "styled-components";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { sendChatRequest, createUserMessage, createAssistantMessage } from "./api/qwen";
import { MODELS } from "./types";
import type { ChatSession } from "./types";
import ApiKeyDialog from "./components/ApiKeyDialog";
import ChatWindow from "./components/ChatWindow";
import SessionList, { DRAWER_WIDTH } from "./components/SessionList";

const theme = createTheme({
  palette: {
    primary: { main: "#6c5ce7" },
    background: { default: "#fafafa" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const MainArea = styled.div`
  margin-left: ${DRAWER_WIDTH}px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
`;

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createEmptySession = (): ChatSession => ({
  id: generateId(),
  title: "Новый диалог",
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

function App() {
  const [apiKey, setApiKey] = useLocalStorageState<string>("qwen-api-key", {
    defaultValue: "",
  });
  const [model, setModel] = useLocalStorageState<string>("qwen-model", {
    defaultValue: MODELS[0].id,
  });
  const [sessions, setSessions] = useLocalStorageState<ChatSession[]>(
    "qwen-sessions",
    { defaultValue: [] }
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessions[0]?.id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSessionId && !sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0]?.id ?? null);
    }
  }, [sessions, activeSessionId]);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ?? null;

  const updateSession = (
    sessionId: string,
    updater: (session: ChatSession) => ChatSession
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? updater(session) : session
      )
    );
  };

  const handleNewChat = () => {
    const session = createEmptySession();
    setSessions([session, ...sessions]);
    setActiveSessionId(session.id);
    setError(null);
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter((session) => session.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[0]?.id ?? null);
    }
  };

  const handleSend = async (text: string) => {
    if (!apiKey) {
      setError("Сначала укажите API-ключ Alibaba Cloud DashScope.");
      return;
    }

    let session = activeSession;
    if (!session) {
      session = createEmptySession();
      setSessions([session, ...sessions]);
      setActiveSessionId(session.id);
    }

    const userMessage = createUserMessage(text);
    const updatedMessages = [...session.messages, userMessage];
    const sessionId = session.id;

    updateSession(sessionId, (prev) => ({
      ...prev,
      messages: updatedMessages,
      title: prev.messages.length === 0 ? text.slice(0, 40) : prev.title,
      updatedAt: Date.now(),
    }));

    setIsLoading(true);
    setError(null);

    try {
      const answer = await sendChatRequest({
        apiKey,
        model,
        messages: updatedMessages,
      });
      updateSession(sessionId, (prev) => ({
        ...prev,
        messages: [...prev.messages, createAssistantMessage(answer)],
        updatedAt: Date.now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Qwen Чат
          </Typography>
          <Select
            size="small"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            sx={{
              mr: 2,
              color: "#fff",
              "& .MuiSelect-icon": { color: "#fff" },
            }}
          >
            {MODELS.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <ApiKeyDialog apiKey={apiKey} onSave={setApiKey} />
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex" }}>
        <SessionList
          sessions={sessions}
          activeId={activeSessionId}
          onSelect={(id) => {
            setActiveSessionId(id);
            setError(null);
          }}
          onDelete={handleDeleteSession}
          onNewChat={handleNewChat}
        />
        <MainArea>
          <ChatWindow
            messages={activeSession?.messages ?? []}
            isLoading={isLoading}
            error={error}
            disabled={!apiKey}
            onSend={handleSend}
            onDismissError={() => setError(null)}
          />
        </MainArea>
      </Box>
    </ThemeProvider>
  );
}

export default App;
