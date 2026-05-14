export function shouldUseApiClient(): boolean {
  return !!process.env.NEXT_PUBLIC_API_URL;
}
