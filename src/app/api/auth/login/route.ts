import { db, isDemoMode } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  if (isDemoMode) {
    return Response.json({ error: "Demo mode — login needs database. Browse shop without login." }, { status: 503 });
  }
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    await setAuthCookie(signToken(session));
    return Response.json({ user: session });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
