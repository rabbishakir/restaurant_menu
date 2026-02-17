import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "../lib/session";

export default function HomePage() {
  const hasSession = Boolean(cookies().get(SESSION_COOKIE_NAME)?.value);
  redirect(hasSession ? "/dashboard" : "/login");
}
