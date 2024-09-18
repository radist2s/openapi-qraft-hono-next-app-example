// Stand-alone server to be used without Next.js

import { serve } from "@hono/node-server";

import app from "./app";

serve(app);
