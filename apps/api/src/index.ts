import { file } from "bun";
import Elysia, { t } from "elysia";

export type App = typeof app;
export const app = new Elysia()
  .get("/", () => file("public/index.html"))
  .get("/assets/:filename", ({ params }) => file(`public/assets/${params.filename}`))
  .decorate({
    users: new Map<string, string>(),
  })
  .ws("/api/ws/:roomId", {
    body: t.Object({
      type: t.Literal("rename"),
      name: t.String(),
    }),
    response: t.Union([
      t.Object({
        type: t.Literal("users"),
        users: t.Array(t.String()),
      }),
      t.Object({
        type: t.Literal("me"),
        name: t.String(),
      })
    ]),
    open(ws) {
      ws.data.users.set(ws.id, generateNickname());
      console.log("open", ws.data.users.get(ws.id), ws.id);
      ws.subscribe(ws.data.params.roomId);

      ws.publish(ws.data.params.roomId, { type: "users", users: [...ws.data.users.values()] });
      ws.send({ type: "users", users: [...ws.data.users.values()] });
      ws.send({ type: "me", name: ws.data.users.get(ws.id)! });

      function generateNickname() {
        const items = ["🍋", "🍇", "🍎", "🍥"];
        const nicknames = new Set(ws.data.users.values())

        for (const item of items) {
          if (!nicknames.has(item)) {
            return item;
          }
        }

        return crypto.randomUUID();
      }
    },
    message(ws, message) {
      console.log("message", ws.data.users.get(ws.id), ws.id);
      switch (message.type) {
        case "rename": {
          ws.data.users.set(ws.id, message.name);
          ws.publish(ws.data.params.roomId, { type: "users", users: [...ws.data.users.values()] });
          ws.send({ type: "users", users: [...ws.data.users.values()] });
          ws.send({ type: "me", name: ws.data.users.get(ws.id)! });
          break;
        }
        default: {
          console.warn("unknown message:", message);
        }
      }
    },
    close(ws) {
      console.log("close", ws.data.users.get(ws.id), ws.id);
      ws.data.users.delete(ws.id);
      server.server?.publish(ws.data.params.roomId, JSON.stringify({ type: "users", users: [...ws.data.users.values()] }));

      ws.unsubscribe(ws.data.params.roomId);
    },
    perMessageDeflate: true,
  });

const server = app.listen(3000);
console.log(server.server?.port)