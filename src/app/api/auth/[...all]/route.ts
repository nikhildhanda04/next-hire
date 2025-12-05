import { auth } from "@/lib/auth"; // Import auth instance
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
