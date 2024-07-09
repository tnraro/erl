import { env, file } from "bun";
import Elysia, { t } from "elysia";
import { RoomManager } from "./features/room/room-manager";
import cors from "@elysiajs/cors";

export type App = typeof app;
export const app = new Elysia()
  .use(cors({
    origin: env.ORIGIN ?? "*",
  }))
  .get("/assets/:filename", ({ params }) => file(`public/assets/${params.filename}`))
  .decorate({
    rooms: new RoomManager(),
  })
  .group("/api", app => app
    .post("/rooms", ({ rooms }) => {
      return {
        roomId: rooms.add(),
      };
    })
    .ws("/rooms/:roomId/ws", {
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
        const room = ws.data.rooms.get(ws.data.params.roomId);
        if (room == null) return;
        room.enterUser(ws.id);
        console.log("open", room.getUser(ws.id), ws.id);
        ws.subscribe(ws.data.params.roomId);

        ws.publish(ws.data.params.roomId, { type: "users", users: room.participants });
        ws.send({ type: "users", users: room.participants });
        ws.send({ type: "me", name: room.getUser(ws.id)! });
      },
      message(ws, message) {
        const room = ws.data.rooms.get(ws.data.params.roomId);
        if (room == null) return;
        console.log("message", room.getUser(ws.id), ws.id);
        switch (message.type) {
          case "rename": {
            room.renameUser(ws.id, message.name);
            ws.publish(ws.data.params.roomId, { type: "users", users: room.participants });
            ws.send({ type: "users", users: room.participants });
            ws.send({ type: "me", name: room.getUser(ws.id)! });
            break;
          }
          default: {
            console.warn("unknown message:", message);
          }
        }
      },
      close(ws) {
        const room = ws.data.rooms.get(ws.data.params.roomId);
        if (room == null) return;
        console.log("close", room.getUser(ws.id), ws.id);
        room.leaveUser(ws.id);
        ws.data.rooms.collect(ws.data.params.roomId);
        server.server?.publish(ws.data.params.roomId, JSON.stringify({ type: "users", users: room.participants }));

        ws.unsubscribe(ws.data.params.roomId);
      },
      perMessageDeflate: true,
    })
  )
  .get("/", () => file("public/index.html"))
  .get("/rooms/:roomId", () => file("public/index.html"), {
    beforeHandle({ rooms, params, set }) {
      if (!rooms.has(params.roomId)) {
        set.status = "Not Found";
        return set.status;
      }
    }
  })
  .get("/not-found", () => file("public/index.html"))

const server = app.listen(3000);
console.log(server.server?.port)