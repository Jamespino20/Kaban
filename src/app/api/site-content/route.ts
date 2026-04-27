import { NextResponse } from "next/server";
import { fetchHomepageContent } from "@/actions/site-content";

export async function GET() {
  try {
    const content = await fetchHomepageContent();
    return NextResponse.json(content);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to load site content." },
      { status: 500 },
    );
  }
}
