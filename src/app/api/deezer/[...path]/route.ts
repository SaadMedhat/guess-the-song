import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const DEEZER_BASE_URL = "https://api.deezer.com"

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: ReadonlyArray<string> }> }
): Promise<NextResponse> => {
  const { path } = await params
  const deezerPath = path.join("/")
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${DEEZER_BASE_URL}/${deezerPath}${searchParams ? `?${searchParams}` : ""}`

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Deezer API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data: unknown = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from Deezer API" },
      { status: 502 }
    )
  }
}
