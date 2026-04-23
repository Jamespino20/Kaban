import { NextResponse } from "next/server";
import { getHomepageContent } from "@/actions/site-content";

export async function GET() {
  try {
    const content = await getHomepageContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load site content." },
      { status: 500 },
    );
  }
}
