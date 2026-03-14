import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, county, projectType, description } = body
    if (!name || !email || !county || !projectType || !description)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    console.log('New lead:', { name, email, county, projectType })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
