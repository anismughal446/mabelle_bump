import { db, isDemoMode } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  if (isDemoMode) {
    return Response.json({ error: "Demo mode — register needs database." }, { status: 503 });
  }
  try {
    const { name, email, password, role, dueDate } = await req.json();
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length) {
      return Response.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    const allowedRole = role === "vendor" ? "vendor" : "customer";
    const [user] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        role: allowedRole,
        dueDate: dueDate || null,
      })
      .returning();

    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    await setAuthCookie(signToken(session));
    return Response.json({ user: session });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
