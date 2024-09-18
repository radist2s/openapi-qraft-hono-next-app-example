import { handle } from "hono/vercel";
import { app } from "@/api/app";

export const GET = handle(app);
export const POST = handle(app);
