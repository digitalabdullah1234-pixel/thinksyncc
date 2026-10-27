import { NextResponse } from "next/server";

interface ContactPayload {
  name?: string;
  contact?: string;
  service?: string;
  message?: string;
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, contact, message } = body;

  if (!name?.trim() || !contact?.trim() || !message?.trim()) {
    return NextResponse.json(
      { success: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  console.log("[ThinkSync] New project inquiry:", body);

  return NextResponse.json({ success: true });
}
