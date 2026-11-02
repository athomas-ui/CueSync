import { connection } from "next/server";
import { db } from "./db";

// SESSION 1 STAND-IN: there is no sign-in yet, so every request uses the demo
// workspace. This is NOT authorization.
//
// Session 2 replaces this with the real check (CLAUDE.md rule 1):
//   read the signed-in user from the session
//   -> look up their WorkspaceMembership
//   -> return only a workspace they belong to, plus their role.
// Every page already gets its workspace from this one function, so that change
// happens in one place.
export async function getCurrentWorkspace() {
  await connection(); // render per request, never prebuilt with someone's data
  return db.workspace.findFirst({ where: { isDemo: true }, orderBy: { createdAt: "asc" } });
}
