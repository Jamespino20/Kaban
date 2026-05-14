import { auth } from "@/lib/auth";
import { setAuthToken } from "./api-client";

export async function syncApiToken() {
  const session = await auth();
  if (session?.user?.apiToken) {
    setAuthToken(session.user.apiToken as string);
  }
}
