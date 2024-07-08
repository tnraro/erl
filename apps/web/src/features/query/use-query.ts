import { treaty } from "@elysiajs/eden";
import type { App } from "@erl/api";
import { useEffect, useRef, useState } from "react";

export function useQuery(path: string, options: { onready?: () => void, oncancel?: () => void }) {
  const clientRef = useRef<ReturnType<typeof treaty<App>>>();
  const wsRef = useRef<any>();
  const [users, setUsers] = useState<string[]>();
  const [myName, setMyName] = useState<string>();

  useEffect(() => {
    const client = treaty<App>(path);
    clientRef.current = client;

    const ws = client.ws.subscribe();
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

    return () => {
      ws.close();
    }
  }, []);

  return { users, myName, wsRef };
}