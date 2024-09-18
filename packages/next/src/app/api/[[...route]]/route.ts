import { handle } from "hono/vercel";
import { app } from "@my-project/api";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
