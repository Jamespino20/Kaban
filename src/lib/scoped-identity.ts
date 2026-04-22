export function createScopedIdentity(email: string, tenantId: number | null) {
  return `${tenantId ?? "global"}::${email.toLowerCase()}`;
}

export function parseScopedIdentity(value: string) {
  const [tenantPart, ...emailParts] = value.split("::");
  const email = emailParts.join("::");

  return {
    tenantId: tenantPart === "global" ? null : Number.parseInt(tenantPart, 10),
    email,
  };
}
