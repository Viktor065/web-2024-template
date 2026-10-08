export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export const MODELS = [
  { id: "qwen-turbo", label: "Qwen-Turbo (быстрый)" },
  { id: "qwen-plus", label: "Qwen-Plus (уравновешенный)" },
  { id: "qwen-max", label: "Qwen-Max (самый умный)" },
] as const;

export const SYSTEM_PROMPT =
  "Ты — полезный, точный и дружелюбный ассистент на русском языке. Отвечай кратко и по делу.";
