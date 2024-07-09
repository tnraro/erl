import { treaty } from "@elysiajs/eden";
import type { App } from "@erl/api";

const path = import.meta.env.PROD ? location.host : import.meta.env.VITE_API;

export const client = treaty<App>(path);