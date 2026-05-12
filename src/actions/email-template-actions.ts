"use server";

import prisma from "@/lib/prisma";
import { requireSuperadminSession } from "@/lib/authorization";

export type EmailTemplateCreateData = {
  category: string;
  slug: string;
  subject: string;
  html_body: string;
  text_body?: string;
  variables?: string[];
  tenant_id?: number;
};

export type EmailTemplateUpdateData = Partial<EmailTemplateCreateData> & {
  is_active?: boolean;
};

export async function getEmailTemplates(tenantId?: number | null) {
  const session = await requireSuperadminSession();
  try {
    const where = tenantId ? { tenant_id: tenantId } : {};
    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [{ category: "asc" }, { slug: "asc" }],
    });
    return { success: true, data: templates };
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    return { success: false, error: "Failed to load email templates" };
  }
}

export async function createEmailTemplate(data: EmailTemplateCreateData) {
  const session = await requireSuperadminSession();
  try {
    const template = await prisma.emailTemplate.create({
      data: {
        category: data.category as any,
        slug: data.slug,
        subject: data.subject,
        html_body: data.html_body,
        text_body: data.text_body || null,
        variables: data.variables || [],
        tenant_id: data.tenant_id ?? null,
      },
    });
    return { success: true, data: template };
  } catch (error: any) {
    console.error("Failed to create email template:", error);
    if (error?.code === "P2002") {
      return {
        success: false,
        error: "A template with this slug already exists for this tenant",
      };
    }
    return { success: false, error: "Failed to create email template" };
  }
}

export async function updateEmailTemplate(id: number, data: EmailTemplateUpdateData) {
  const session = await requireSuperadminSession();
  try {
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.category && { category: data.category as any }),
        ...(data.slug && { slug: data.slug }),
        ...(data.subject && { subject: data.subject }),
        ...(data.html_body && { html_body: data.html_body }),
        ...(data.text_body !== undefined && { text_body: data.text_body }),
        ...(data.variables && { variables: data.variables }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.tenant_id !== undefined && { tenant_id: data.tenant_id }),
      },
    });
    return { success: true, data: template };
  } catch (error: any) {
    console.error("Failed to update email template:", error);
    if (error?.code === "P2002") {
      return {
        success: false,
        error: "A template with this slug already exists for this tenant",
      };
    }
    return { success: false, error: "Failed to update email template" };
  }
}

export async function deleteEmailTemplate(id: number) {
  const session = await requireSuperadminSession();
  try {
    await prisma.emailTemplate.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete email template:", error);
    return { success: false, error: "Failed to delete email template" };
  }
}

export async function renderEmailTemplate(slug: string, variables: Record<string, string>) {
  const session = await requireSuperadminSession();
  try {
    const template = await prisma.emailTemplate.findFirst({
      where: { slug, is_active: true },
    });
    if (!template) {
      return { success: false, error: "Template not found or inactive" };
    }
    let rendered = template.html_body;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    let renderedSubject = template.subject;
    for (const [key, value] of Object.entries(variables)) {
      renderedSubject = renderedSubject.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return { success: true, data: { subject: renderedSubject, html: rendered } };
  } catch (error) {
    console.error("Failed to render email template:", error);
    return { success: false, error: "Failed to render template" };
  }
}
