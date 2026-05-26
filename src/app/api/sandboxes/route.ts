import { getActiveSandboxes } from "@/lib/sandbox-manager";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const active = getActiveSandboxes();
    return NextResponse.json({ sandboxes: active });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
