import type { ChatMessage } from "../types";
import { SYSTEM_PROMPT } from "../types";

const DASHSCOPE_ENDPOINT =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

interface QwenRequestParams {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
}

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const sendChatRequest = async ({
  apiKey,
  model,
  messages,
}: QwenRequestParams): Promise<string> => {
  const response = await fetch(DASHSCOPE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody?.error?.message ?? JSON.stringify(errorBody);
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `Ошибка API (${response.status}): ${detail || response.statusText}`
    );
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Пустой ответ от модели");
  }
  return content;
};

export const createUserMessage = (content: string): ChatMessage => ({
  id: generateId(),
  role: "user",
  content,
  createdAt: Date.now(),
});

export const createAssistantMessage = (content: string): ChatMessage => ({
  id: generateId(),
  role: "assistant",
  content,
  createdAt: Date.now(),
});
