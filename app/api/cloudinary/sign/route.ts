import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAllowedFolder, signUpload } from "@/lib/cloudinary/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const folder = body?.folder;

  if (typeof folder !== "string" || !isAllowedFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const signed = signUpload({ uid, folder });
  return NextResponse.json(signed);
}
