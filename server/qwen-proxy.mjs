// Простой прокси-сервер для обхода CORS при работе с DashScope API.
// Слушает порт 8787: принимает /api/chat и пересылает в DashScope,
// а также отдаёт статику из dist/ (для продакшена).
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const UPSTREAM =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const PORT = 8787;
const STATIC_ROOT = join(process.cwd(), "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Прокси чат-запросов к DashScope
  if (req.method === "POST" && req.url.startsWith("/api/chat")) {
    const auth = req.headers["authorization"] || "";
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString("utf8");

      const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body,
      });

      const payload = await upstream.text();
      res.writeHead(upstream.status, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(payload);
    } catch (error) {
      res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          error: { message: `Прокси-ошибка: ${error.message}` },
        })
      );
    }
    return;
  }

  // Статика собранного приложения (для продакшена)
  let path = req.url.split("?")[0];
  if (path === "/" || path === "/web-2024-template/" || path === "/web-2024-template") {
    path = "/index.html";
  }
  if (path.startsWith("/web-2024-template")) {
    path = path.replace("/web-2024-template", "") || "/index.html";
  }
  const safePath = normalize(path).replace(/^(\.\.[/\\])+/, "");
  try {
    const file = await readFile(join(STATIC_ROOT, safePath));
    res.writeHead(200, {
      "Content-Type": MIME[extname(safePath)] ?? "application/octet-stream",
    });
    res.end(file);
  } catch {
    try {
      const index = await readFile(join(STATIC_ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(index);
    } catch {
      res.writeHead(404);
      res.end("Not found. Run `npm run build` first.");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Qwen proxy listening on http://localhost:${PORT}`);
});
