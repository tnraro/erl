import { useEffect, useRef, useState } from "react";
import { client } from "./client";

export function useRoom(roomId: string, options: { onready?: () => void, oncancel?: () => void }) {
  const wsRef = useRef<any>();
  const [users, setUsers] = useState<string[]>();
  const [myName, setMyName] = useState<string>();

  useEffect(() => {
    const ws = client.api.rooms({ roomId }).ws.subscribe();
    wsRef.current = ws;
    ws.subscribe(({ data }) => {
      switch (data.type) {
        case "users": {
          setUsers(data.users);
          if (data.users.length === 3) {
            options.onready?.();
          } else {
            options.oncancel?.();
          }
          break;
        }
        case "me": {
          setMyName(data.name);
          break;
        }
        default: {
          console.warn("unknown data:", data);
        }
      }
    });
    ws.addEventListener("error", handleError);

    return () => {
      ws.close();
      ws.removeEventListener("error", handleError);
    }

    function handleError(e: Event) {
      console.error(e);
    }
  }, []);

  return { users, myName, wsRef };
}