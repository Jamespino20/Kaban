"use server";

import prisma from "@/lib/prisma";
import {
  canAccessTenantStaffResource,
  requireAuthenticatedSession,
  requireTanawSession,
  type AuthorizedSession,
} from "@/lib/authorization";
import {
  ConversationType,
  MentorshipStatus,
  NotificationChannel,
  Role,
  UserStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

const DEFAULT_OPERATOR_ROOMS = [
  {
    slug: "ka-agapay-community",
    title: "Ka-Agapay Community",
  },
  {
    slug: "mentorship-guarantor-help",
    title: "Mentorship at Guarantor Help",
  },
] as const;

type CommunityTenantContext = {
  session: AuthorizedSession;
  tenantId: number | null;
  tenantSlug: string | null;
};

async function requireCommunityTenantContext(): Promise<CommunityTenantContext> {
  const session = await requireAuthenticatedSession();
  return {
    session,
    tenantId: session.user.tenantId,
    tenantSlug: session.user.tenantSlug,
  };
}

async function ensureTenantRooms(
  tenantId: number,
  actorUserId: number | string | undefined,
  db: any,
) {
  const database = db;
  if (!database) {
    throw new Error("RLS context (tx) required for ensureTenantRooms");
  }

  await Promise.all(
    DEFAULT_OPERATOR_ROOMS.map((room) =>
      database.conversation.upsert({
        where: {
          tenant_id_type_slug: {
            tenant_id: tenantId,
            type: ConversationType.operator_room,
            slug: room.slug,
          },
        },
        update: {
          title: room.title,
        },
        create: {
          tenant_id: tenantId,
          type: ConversationType.operator_room,
          slug: room.slug,
          title: room.title,
          created_by: actorUserId ? Number(actorUserId) : undefined,
        },
      }),
    ),
  );
}
async function assertConversationAccess(
  session: AuthorizedSession,
  conversationId: string,
) {
  const tenantId = session.user.tenantId;
  const query = async (db: any) => {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { user_id: session.user.user_id },
          take: 1,
        },
      },
    });

    if (!conversation) {
      throw new Error(
        `Conversation not found for conversation ID: ${conversationId}.`,
      );
    }

    const sameTenant =
      session.user.role === "superadmin"
        ? session.user.tenantId === null ||
          session.user.tenantId === conversation.tenant_id
        : session.user.tenantId === conversation.tenant_id;

    if (!sameTenant) {
      throw new Error(
        "Unauthorized: User does not belong to tenant of conversation " +
          conversationId +
          ".",
      );
    }

    if (
      conversation.type === ConversationType.direct &&
      conversation.participants.length === 0
    ) {
      throw new Error(
        "Unauthorized: User is not a participant of direct conversation " +
          conversationId +
          ".",
      );
    }

    return conversation;
  };

  return await prisma.$withTenant(tenantId || -1, async (tx: any) => {
    return await query(tx);
  });
}

function buildUnreadFlag(
  lastReadAt: Date | null | undefined,
  lastMessageAt?: Date,
) {
  if (!lastMessageAt) return false;
  if (!lastReadAt) return true;
  return lastMessageAt.getTime() > lastReadAt.getTime();
}

export async function getCommunityDashboardData() {
  if (shouldUseApiClient()) {
    const res = await api.community.conversations();
    return {
      requiresTenantContext: false,
      operatorRooms: [],
      directConversations: [],
      groupChats: [],
      discoverableUsers: [],
      mentorships: [],
    };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return {
      requiresTenantContext: true,
      operatorRooms: [],
      directConversations: [],
      groupChats: [],
      discoverableUsers: [],
      mentorships: [],
    };
  }

  return await prisma.$withTenant(tenantId, async (tx: any) => {
    await ensureTenantRooms(tenantId, session.user.user_id, tx);

    const [
      operatorRooms,
      directConversations,
      groupChats,
      discoverableUsers,
      mentorships,
    ] = await Promise.all([
      tx.conversation.findMany({
        where: {
          type: ConversationType.operator_room,
        },
        include: {
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              sender: {
                include: { profile: true },
              },
            },
          },
          participants: {
            where: { user_id: session.user.user_id },
            take: 1,
          },
        },
        orderBy: { title: "asc" },
      }),
      tx.conversation.findMany({
        where: {
          type: ConversationType.direct,
          participants: {
            some: {
              user_id: session.user.user_id,
            },
          },
        },
        include: {
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              sender: {
                include: { profile: true },
              },
            },
          },
          participants: {
            include: {
              user: {
                include: { profile: true },
              },
            },
          },
        },
        orderBy: { updated_at: "desc" },
      }),
      tx.conversation.findMany({
        where: {
          type: ConversationType.group_chat,
          participants: {
            some: {
              user_id: session.user.user_id,
            },
          },
        },
        include: {
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
            include: {
              sender: {
                include: { profile: true },
              },
            },
          },
          participants: {
            include: {
              user: {
                include: { profile: true },
              },
            },
          },
        },
        orderBy: { updated_at: "desc" },
      }),
      tx.user.findMany({
        where: {
          user_id: { not: session.user.user_id },
          status: UserStatus.active,
          role: {
            in: [Role.member, Role.operator],
          },
        },
        include: {
          profile: true,
          social_vouches_received: {
            select: {
              score: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { created_at: "desc" }],
        take: 16,
      }),
      tx.mentorshipConnection.findMany({
        where: {
          OR: [
            { requester_id: session.user.user_id },
            { mentor_id: session.user.user_id },
          ],
        },
        include: {
          requester: {
            include: { profile: true },
          },
          mentor: {
            include: { profile: true },
          },
          endorser: {
            include: { profile: true },
          },
        },
        orderBy: { created_at: "desc" },
      }),
    ]);

    return {
      requiresTenantContext: false,
      operatorRooms: operatorRooms.map((room: any) => {
        const lastReadAt = room.participants[0]?.last_read_at;
        const lastMessage = room.messages[0];

        return {
          id: room.id,
          title: room.title,
          slug: room.slug,
          lastMessagePreview: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.created_at ?? null,
          lastMessageSender:
            lastMessage?.sender?.profile?.first_name ||
            lastMessage?.sender?.username ||
            null,
          hasUnread: buildUnreadFlag(lastReadAt, lastMessage?.created_at),
        };
      }),
      directConversations: directConversations.map((conversation: any) => {
        const selfParticipant = conversation.participants.find(
          (participant: any) => participant.user_id === session.user.user_id,
        );
        const counterparty = conversation.participants.find(
          (participant: any) => participant.user_id !== session.user.user_id,
        )?.user;
        const lastMessage = conversation.messages[0];

        return {
          id: conversation.id,
          counterparty: counterparty
            ? {
                userId: counterparty.user_id,
                role: counterparty.role,
                name:
                  counterparty.profile?.first_name &&
                  counterparty.profile?.last_name
                    ? `${counterparty.profile.first_name} ${counterparty.profile.last_name}`
                    : counterparty.username,
                subtitle:
                  counterparty.profile?.business_name ||
                  counterparty.profile?.occupation ||
                  counterparty.role,
              }
            : null,
          lastMessagePreview: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.created_at ?? null,
          lastMessageSenderId: lastMessage?.sender_id ?? null,
          hasUnread: buildUnreadFlag(
            selfParticipant?.last_read_at,
            lastMessage?.created_at,
          ),
        };
      }),
      groupChats: groupChats.map((conversation: any) => {
        const selfParticipant = conversation.participants.find(
          (participant: any) => participant.user_id === session.user.user_id,
        );
        const lastMessage = conversation.messages[0];

        return {
          id: conversation.id,
          title: conversation.title || "Group Chat",
          participantCount: conversation.participants.length,
          lastMessagePreview: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.created_at ?? null,
          lastMessageSender:
            lastMessage?.sender?.profile?.first_name ||
            lastMessage?.sender?.username ||
            null,
          hasUnread: buildUnreadFlag(
            selfParticipant?.last_read_at,
            lastMessage?.created_at,
          ),
        };
      }),
      discoverableUsers: discoverableUsers.map((user: any) => ({
        userId: user.user_id,
        role: user.role,
        name:
          user.profile?.first_name && user.profile?.last_name
            ? `${user.profile.first_name} ${user.profile.last_name}`
            : user.username,
        subtitle:
          user.profile?.business_name ||
          user.profile?.occupation ||
          "Ka-Agapay",
        averageVouchScore:
          user.social_vouches_received.length > 0
            ? user.social_vouches_received.reduce(
                (sum: number, item: any) => sum + item.score,
                0,
              ) / user.social_vouches_received.length
            : null,
      })),
      mentorships: mentorships.map((connection: any) => ({
        id: connection.id,
        status: connection.status,
        focusArea: connection.focus_area,
        notes: connection.notes,
        requesterName:
          connection.requester.profile?.first_name &&
          connection.requester.profile?.last_name
            ? `${connection.requester.profile.first_name} ${connection.requester.profile.last_name}`
            : connection.requester.username,
        mentorName:
          connection.mentor.profile?.first_name &&
          connection.mentor.profile?.last_name
            ? `${connection.mentor.profile.first_name} ${connection.mentor.profile.last_name}`
            : connection.mentor.username,
        endorsedBy:
          connection.endorser?.profile?.first_name &&
          connection.endorser?.profile?.last_name
            ? `${connection.endorser.profile.first_name} ${connection.endorser.profile.last_name}`
            : connection.endorser?.username || null,
        createdAt: connection.created_at,
      })),
    };
  });
}

export async function getCommunityStaffSummary() {
  if (shouldUseApiClient()) {
    return { pendingMentorships: [], activeMentorships: 0, conversationCount: 0, recentMessages: [] };
  }
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId;

  const query = async (db: any) => {
    const [
      pendingMentorships,
      activeMentorships,
      conversationCount,
      recentMessages,
    ] = await Promise.all([
      db.mentorshipConnection.findMany({
        where: {
          status: MentorshipStatus.pending_endorsement,
        },
        include: {
          requester: { include: { profile: true } },
          mentor: { include: { profile: true } },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      db.mentorshipConnection.count({
        where: {
          status: MentorshipStatus.endorsed,
        },
      }),
      db.conversation.count(),
      db.message.findMany({
        include: {
          sender: { include: { profile: true } },
          conversation: true,
        },
        orderBy: { created_at: "desc" },
        take: 8,
      }),
    ]);

    return {
      pendingMentorships: pendingMentorships.map((connection: any) => ({
        id: connection.id,
        requesterName:
          connection.requester.profile?.first_name &&
          connection.requester.profile?.last_name
            ? `${connection.requester.profile.first_name} ${connection.requester.profile.last_name}`
            : connection.requester.username,
        mentorName:
          connection.mentor.profile?.first_name &&
          connection.mentor.profile?.last_name
            ? `${connection.mentor.profile.first_name} ${connection.mentor.profile.last_name}`
            : connection.mentor.username,
        focusArea: connection.focus_area,
        createdAt: connection.created_at,
      })),
      activeMentorships,
      conversationCount,
      recentMessages: recentMessages.map((message: any) => ({
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        conversationTitle:
          message.conversation.title ||
          (message.conversation.type === ConversationType.operator_room
            ? "Operator Room"
            : "Direct Message"),
        senderName:
          message.sender.profile?.first_name &&
          message.sender.profile?.last_name
            ? `${message.sender.profile.first_name} ${message.sender.profile.last_name}`
            : message.sender.username,
      })),
    };
  };

  return await prisma.$withTenant(tenantId || -1, async (tx: any) => {
    return await query(tx);
  });
}

export async function getConversationThread(
  conversationId: string,
  options?: { beforeMessageId?: string; take?: number },
) {
  if (shouldUseApiClient()) {
    const res = await api.community.messages(Number(conversationId));
    return { id: conversationId, type: "direct", title: null, participants: [], messages: (res.messages || []).map((m: any) => ({ id: m.id, content: m.content, senderId: m.sender_id, senderName: m.sender_name || "Unknown", createdAt: m.created_at, replyTo: null, attachments: [], reactions: [] })) };
  }
  const { session, tenantId } = await requireCommunityTenantContext();
  const conversation = await assertConversationAccess(session, conversationId);

  const query = async (db: any) => {
    if (conversation.type === ConversationType.operator_room && tenantId) {
      await db.conversationParticipant.upsert({
        where: {
          conversation_id_user_id: {
            conversation_id: conversationId,
            user_id: session.user.user_id,
          },
        },
        update: {},
        create: {
          conversation_id: conversationId,
          user_id: session.user.user_id,
          tenant_id: tenantId,
        },
      });
    }

    const thread = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { created_at: "desc" },
          ...(options?.beforeMessageId
            ? {
                cursor: { id: options.beforeMessageId },
                skip: 1,
              }
            : {}),
          take: options?.take ?? 30,
          include: {
            sender: {
              include: { profile: true },
            },
            reply_to: {
              include: {
                sender: {
                  include: { profile: true },
                },
              },
            },
            attachments: true,
            reactions: true,
          },
        },
        participants: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!thread) {
      throw new Error(
        "Conversation thread not found for ID: " + conversationId + ".",
      );
    }

    return {
      id: thread.id,
      type: thread.type,
      title: thread.title,
      participants: thread.participants.map((participant: any) => ({
        userId: participant.user_id,
        name:
          participant.user.profile?.first_name &&
          participant.user.profile?.last_name
            ? `${participant.user.profile.first_name} ${participant.user.profile.last_name}`
            : participant.user.username,
        role: participant.user.role,
      })),
      messages: thread.messages.map((message: any) => ({
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        senderName:
          message.sender.profile?.first_name &&
          message.sender.profile?.last_name
            ? `${message.sender.profile.first_name} ${message.sender.profile.last_name}`
            : message.sender.username,
        createdAt: message.created_at,
        replyTo: message.reply_to
          ? {
              id: message.reply_to.id,
              senderName:
                message.reply_to.sender.profile?.first_name &&
                message.reply_to.sender.profile?.last_name
                  ? `${message.reply_to.sender.profile.first_name} ${message.reply_to.sender.profile.last_name}`
                  : message.reply_to.sender.username,
              content: message.reply_to.content,
            }
          : null,
        attachments: message.attachments.map((attachment: any) => ({
          id: attachment.id,
          fileName: attachment.file_name,
          fileUrl: attachment.file_url,
          mimeType: attachment.mime_type,
          sizeBytes: attachment.size_bytes,
        })),
        reactions: message.reactions,
      })),
    };
  };

  return await prisma.$withTenant(tenantId || -1, async (tx: any) => {
    return await query(tx);
  });
}

export async function openDirectConversation(targetUserId: number) {
  if (shouldUseApiClient()) {
    const res = await api.community.createConversation("direct", undefined, [targetUserId]);
    return { success: true, conversationId: res.conversation?.id || "" };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Please select a tenant before using community tools." };
  }

  if (targetUserId === session.user.user_id) {
    return { error: "You cannot send a message to yourself." };
  }

  return await prisma.$withTenant(tenantId, async (tx: any) => {
    const target = await tx.user.findFirst({
      where: { user_id: targetUserId },
    });

    if (!target) {
      return { error: "The selected member was not found in this tenant." };
    }

    const existing = await tx.conversation.findFirst({
      where: {
        type: ConversationType.direct,
        AND: [
          { participants: { some: { user_id: session.user.user_id } } },
          { participants: { some: { user_id: targetUserId } } },
        ],
      },
    });

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    const conversation = await tx.conversation.create({
      data: {
        tenant_id: tenantId,
        type: ConversationType.direct,
        created_by: session.user.user_id,
        participants: {
          create: [
            { user_id: session.user.user_id, tenant_id: tenantId },
            { user_id: targetUserId, tenant_id: tenantId },
          ],
        },
      },
    });

    revalidatePath("/agapay-pintig");
    return { success: true, conversationId: conversation.id };
  });
}

export async function sendConversationMessage(input: {
  conversationId: string;
  content: string;
  replyToMessageId?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
  }>;
}) {
  if (shouldUseApiClient()) {
    const res = await api.community.sendMessage(Number(input.conversationId), input.content, input.replyToMessageId);
    return { success: true, messageId: res.message?.id || "" };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!input.content?.trim() && !input.attachments?.length) {
    return { error: "Please enter a message or attach a file." };
  }

  // Resolve tenant context: superadmin may not have tenantId, derive from conversation
  let resolvedTenantId = tenantId;
  if (!resolvedTenantId && session.user.role === "superadmin") {
    const conv = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      select: { tenant_id: true },
    });
    if (!conv) return { error: "Conversation not found." };
    resolvedTenantId = conv.tenant_id;
  }

  if (!resolvedTenantId) {
    return { error: "Please select a tenant before sending a message." };
  }

  const result = await prisma.$withTenant(resolvedTenantId, async (tx: any) => {
    const message = await tx.message.create({
      data: {
        tenant_id: resolvedTenantId,
        conversation_id: input.conversationId,
        sender_id: session.user.user_id,
        content: input.content.trim(),
        reply_to_id: input.replyToMessageId ?? null,
        attachments: input.attachments
          ? {
              create: input.attachments.map((a) => ({
                tenant_id: resolvedTenantId,
                file_name: a.fileName,
                file_url: a.fileUrl,
                mime_type: a.mimeType,
                size_bytes: a.sizeBytes,
              })),
            }
          : undefined,
      },
    });

    await tx.conversation.update({
      where: { id: input.conversationId },
      data: { updated_at: new Date() },
    });

    return message;
  });

  revalidatePath("/agapay-pintig");
  return { success: true, messageId: result.id };
}

export async function createGroupConversation(input: {
  title: string;
  participantUserIds: number[];
}) {
  if (shouldUseApiClient()) {
    const res = await api.community.createConversation("group_chat", input.title, input.participantUserIds);
    return { success: true, conversationId: res.conversation?.id || "" };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Please select a tenant before creating a group chat." };
  }

  const allParticipantIds = Array.from(
    new Set([session.user.user_id, ...input.participantUserIds]),
  );

  if (allParticipantIds.length < 3) {
    return { error: "A group chat requires at least 3 participants." };
  }

  return await prisma.$withTenant(tenantId, async (tx: any) => {
    const validMembers = await tx.user.findMany({
      where: { user_id: { in: allParticipantIds } },
      select: { user_id: true },
    });

    if (validMembers.length !== allParticipantIds.length) {
      return {
        error:
          "One or more selected participants are not valid members of this tenant.",
      };
    }

    const conversation = await tx.conversation.create({
      data: {
        tenant_id: tenantId,
        type: ConversationType.group_chat,
        title: input.title?.trim() || "Group Chat",
        created_by: session.user.user_id,
        participants: {
          create: allParticipantIds.map((uid) => ({
            user_id: uid,
            tenant_id: tenantId,
          })),
        },
      },
    });

    revalidatePath("/agapay-pintig");
    return { success: true, conversationId: conversation.id };
  });
}

export async function requestMentorship(input: {
  mentorUserId: number;
  focusArea?: string;
  notes?: string;
}) {
  if (shouldUseApiClient()) {
    return { success: "Naipasa na ang mentorship request para sa endorsement." };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Please select a tenant before requesting mentorship." };
  }

  if (input.mentorUserId === session.user.user_id) {
    return { error: "You cannot select yourself as a mentor." };
  }

  try {
    await prisma.$withTenant(tenantId, async (tx: any) => {
      const mentor = await tx.user.findFirst({
        where: { user_id: input.mentorUserId },
      });

      if (!mentor) {
        throw new Error(
          `Mentor with user ID ${input.mentorUserId} not found or not available in tenant.`,
        );
      }

      await tx.mentorshipConnection.upsert({
        where: {
          tenant_id_requester_id_mentor_id: {
            tenant_id: tenantId,
            requester_id: session.user.user_id,
            mentor_id: input.mentorUserId,
          },
        },
        update: {
          status: MentorshipStatus.pending_endorsement,
          focus_area: input.focusArea?.trim() || null,
          notes: input.notes?.trim() || null,
          endorsed_by: null,
          endorsed_at: null,
        },
        create: {
          tenant_id: tenantId,
          requester_id: session.user.user_id,
          mentor_id: input.mentorUserId,
          focus_area: input.focusArea?.trim() || null,
          notes: input.notes?.trim() || null,
        },
      });

      await createNotification({
        userId: input.mentorUserId,
        tenantId,
        type: "mentorship_request",
        title: "May bagong mentorship request",
        body:
          input.focusArea?.trim() ||
          "May gustong lumapit sa iyo para sa mentorship o guarantor support.",
        actionUrl: "/agapay-pintig",
        channel: NotificationChannel.both,
      });
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return {
      success: "Naipasa na ang mentorship request para sa endorsement.",
    };
  } catch (err: any) {
    return { error: err.message || "Failed to request mentorship." };
  }
}

export async function reviewMentorshipConnection(input: {
  connectionId: string;
  status: "endorsed" | "rejected";
  notes?: string;
}) {
  if (shouldUseApiClient()) {
    return { success: input.status === "endorsed" ? "Na-endorse na ang mentorship pairing." : "Na-reject ang mentorship request." };
  }
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId;

  if (!tenantId && session.user.role !== "superadmin") {
    return { error: "Tenant context required." };
  }

  try {
    const query = async (db: any) => {
      const connection = await db.mentorshipConnection.findUnique({
        where: { id: input.connectionId },
      });

      if (!connection) {
        throw new Error(
          `Mentorship request not found for connection ID: ${input.connectionId}.`,
        );
      }

      if (
        !canAccessTenantStaffResource(session, connection.tenant_id) &&
        session.user.role !== "superadmin"
      ) {
        throw new Error(
          "Unauthorized: User does not have staff access to tenant " +
            connection.tenant_id +
            ".",
        );
      }

      await db.mentorshipConnection.update({
        where: { id: input.connectionId },
        data: {
          status:
            input.status === "endorsed"
              ? MentorshipStatus.endorsed
              : MentorshipStatus.rejected,
          notes: input.notes?.trim() || connection.notes,
          endorsed_by: session.user.user_id,
          endorsed_at: new Date(),
        },
      });

      await createNotification({
        userId: connection.requester_id,
        tenantId: connection.tenant_id,
        type:
          input.status === "endorsed"
            ? "mentorship_endorsed"
            : "mentorship_rejected",
        title:
          input.status === "endorsed"
            ? "Na-endorse ang mentorship request mo"
            : "Na-reject ang mentorship request mo",
        body:
          input.notes?.trim() ||
          (input.status === "endorsed"
            ? "Maari mo nang makita ang formal mentorship connection sa Agapay."
            : "Maaari kang makipag-usap muna at magsumite ulit kung kinakailangan."),
        actionUrl: "/agapay-pintig",
        channel: NotificationChannel.both,
      });

      return {
        success:
          input.status === "endorsed"
            ? "Na-endorse na ang mentorship pairing."
            : "Na-reject ang mentorship request.",
      };
    };

    let result;
    if (!tenantId) {
      result = await query(prisma);
    } else {
      result = await prisma.$withTenant(tenantId, async (tx: any) => {
        return await query(tx);
      });
    }

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return result;
  } catch (err: any) {
    return { error: err.message || "Failed to review mentorship." };
  }
}

export async function markConversationRead(conversationId: string) {
  if (shouldUseApiClient()) {
    await api.community.markRead(conversationId);
    return { success: true };
  }
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) return { error: "Tenant context required." };

  await prisma.$withTenant(tenantId, async (tx: any) => {
    await tx.conversationParticipant.update({
      where: {
        conversation_id_user_id: {
          conversation_id: conversationId,
          user_id: session.user.user_id,
        },
      },
      data: { last_read_at: new Date() },
    });
  });

  return { success: true };
}

export async function toggleMessageReaction(input: {
  messageId: string;
  emoji: string;
}) {
  if (shouldUseApiClient()) {
    await api.community.toggleReaction(input.messageId, input.emoji);
    return { success: true };
  }
  try {
    const { session, tenantId } = await requireCommunityTenantContext();

    if (!tenantId) return { error: "Tenant context required." };

    await prisma.$withTenant(tenantId, async (tx: any) => {
      const existing = await tx.messageReaction.findFirst({
        where: {
          message_id: input.messageId,
          user_id: session.user.user_id,
          emoji: input.emoji,
        },
      });

      if (existing) {
        await tx.messageReaction.delete({
          where: { id: existing.id },
        });
      } else {
        await tx.messageReaction.create({
          data: {
            tenant_id: tenantId,
            message_id: input.messageId,
            user_id: session.user.user_id,
            emoji: input.emoji,
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("toggleMessageReaction failed:", error);
    return { error: "Failed to toggle reaction." };
  }
}
