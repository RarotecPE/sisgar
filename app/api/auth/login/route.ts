import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "O login local foi substituído pelo RaroNexus." },
    { status: 410 }
  )
}
