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

const DEFAULT_BRANCH_ROOMS = [
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
};

async function requireCommunityTenantContext(): Promise<CommunityTenantContext> {
  const session = await requireAuthenticatedSession();
  return {
    session,
    tenantId: session.user.tenantId ?? null,
  };
}

async function ensureBranchRooms(tenantId: number, actorUserId?: number) {
  await Promise.all(
    DEFAULT_BRANCH_ROOMS.map((room) =>
      prisma.conversation.upsert({
        where: {
          tenant_id_type_slug: {
            tenant_id: tenantId,
            type: ConversationType.branch_room,
            slug: room.slug,
          },
        },
        update: {
          title: room.title,
        },
        create: {
          tenant_id: tenantId,
          type: ConversationType.branch_room,
          slug: room.slug,
          title: room.title,
          created_by: actorUserId,
        },
      }),
    ),
  );
}

async function assertConversationAccess(
  session: AuthorizedSession,
  conversationId: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        where: { user_id: session.user.user_id },
        take: 1,
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const sameTenant =
    session.user.role === "superadmin"
      ? session.user.tenantId === null ||
        session.user.tenantId === conversation.tenant_id
      : session.user.tenantId === conversation.tenant_id;

  if (!sameTenant) {
    throw new Error("Unauthorized");
  }

  if (
    conversation.type === ConversationType.direct &&
    conversation.participants.length === 0
  ) {
    throw new Error("Unauthorized");
  }

  return conversation;
}

function buildUnreadFlag(lastReadAt: Date | null | undefined, lastMessageAt?: Date) {
  if (!lastMessageAt) return false;
  if (!lastReadAt) return true;
  return lastMessageAt.getTime() > lastReadAt.getTime();
}

export async function getCommunityDashboardData() {
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return {
      requiresTenantContext: true,
      branchRooms: [],
      directConversations: [],
      discoverableUsers: [],
      mentorships: [],
    };
  }

  await ensureBranchRooms(tenantId, session.user.user_id);

  const [branchRooms, directConversations, discoverableUsers, mentorships] =
    await Promise.all([
      prisma.conversation.findMany({
        where: {
          tenant_id: tenantId,
          type: ConversationType.branch_room,
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
      prisma.conversation.findMany({
        where: {
          tenant_id: tenantId,
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
      prisma.user.findMany({
        where: {
          tenant_id: tenantId,
          user_id: { not: session.user.user_id },
          status: UserStatus.active,
          role: {
            in: [Role.member, Role.admin, Role.lender],
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
      prisma.mentorshipConnection.findMany({
        where: {
          tenant_id: tenantId,
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
    branchRooms: branchRooms.map((room) => {
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
    directConversations: directConversations.map((conversation) => {
      const selfParticipant = conversation.participants.find(
        (participant) => participant.user_id === session.user.user_id,
      );
      const counterparty = conversation.participants.find(
        (participant) => participant.user_id !== session.user.user_id,
      )?.user;
      const lastMessage = conversation.messages[0];

      return {
        id: conversation.id,
        counterparty: counterparty
          ? {
              userId: counterparty.user_id,
              role: counterparty.role,
              name:
                counterparty.profile?.first_name && counterparty.profile?.last_name
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
    discoverableUsers: discoverableUsers.map((user) => ({
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
              (sum, item) => sum + item.score,
              0,
            ) / user.social_vouches_received.length
          : null,
    })),
    mentorships: mentorships.map((connection) => ({
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
          : connection.endorser?.username ||
            null,
      createdAt: connection.created_at,
    })),
  };
}

export async function getCommunityStaffSummary() {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter =
    session.user.role === "superadmin" && !tenantId ? {} : { tenant_id: tenantId };

  const [pendingMentorships, activeMentorships, conversationCount, recentMessages] =
    await Promise.all([
      prisma.mentorshipConnection.findMany({
        where: {
          ...tenantFilter,
          status: MentorshipStatus.pending_endorsement,
        },
        include: {
          requester: { include: { profile: true } },
          mentor: { include: { profile: true } },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      prisma.mentorshipConnection.count({
        where: {
          ...tenantFilter,
          status: MentorshipStatus.endorsed,
        },
      }),
      prisma.conversation.count({
        where: tenantFilter,
      }),
      prisma.message.findMany({
        where: tenantFilter,
        include: {
          sender: { include: { profile: true } },
          conversation: true,
        },
        orderBy: { created_at: "desc" },
        take: 8,
      }),
    ]);

  return {
    pendingMentorships: pendingMentorships.map((connection) => ({
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
    recentMessages: recentMessages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.created_at,
      conversationTitle:
        message.conversation.title ||
        (message.conversation.type === ConversationType.branch_room
          ? "Branch Room"
          : "Direct Message"),
      senderName:
        message.sender.profile?.first_name && message.sender.profile?.last_name
          ? `${message.sender.profile.first_name} ${message.sender.profile.last_name}`
          : message.sender.username,
    })),
  };
}

export async function getConversationThread(
  conversationId: string,
  options?: { beforeMessageId?: string; take?: number },
) {
  const { session } = await requireCommunityTenantContext();
  const conversation = await assertConversationAccess(session, conversationId);

  if (conversation.type === ConversationType.branch_room && session.user.tenantId) {
    await prisma.conversationParticipant.upsert({
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
      },
    });
  }

  const thread = await prisma.conversation.findUnique({
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
    throw new Error("Conversation not found.");
  }

  return {
    id: thread.id,
    type: thread.type,
    title: thread.title,
    participants: thread.participants.map((participant) => ({
      userId: participant.user_id,
      name:
        participant.user.profile?.first_name && participant.user.profile?.last_name
          ? `${participant.user.profile.first_name} ${participant.user.profile.last_name}`
          : participant.user.username,
      role: participant.user.role,
    })),
    messages: thread.messages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      senderName:
        message.sender.profile?.first_name && message.sender.profile?.last_name
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
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        mimeType: attachment.mime_type,
        sizeBytes: attachment.size_bytes,
      })),
      reactions: message.reactions,
    })),
  };
}

export async function openDirectConversation(targetUserId: number) {
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Pumili muna ng branch bago gumamit ng community tools." };
  }

  if (targetUserId === session.user.user_id) {
    return { error: "Hindi puwedeng sarili mo ang kausap." };
  }

  const target = await prisma.user.findFirst({
    where: {
      user_id: targetUserId,
      tenant_id: tenantId,
      status: UserStatus.active,
      role: { in: [Role.member, Role.admin, Role.lender] },
    },
  });

  if (!target) {
    return { error: "Hindi makita ang target na Ka-Agapay sa branch na ito." };
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      tenant_id: tenantId,
      type: ConversationType.direct,
      AND: [
        {
          participants: {
            some: {
              user_id: session.user.user_id,
            },
          },
        },
        {
          participants: {
            some: {
              user_id: targetUserId,
            },
          },
        },
        {
          participants: {
            none: {
              user_id: {
                notIn: [session.user.user_id, targetUserId],
              },
            },
          },
        },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        tenant_id: tenantId,
        type: ConversationType.direct,
        created_by: session.user.user_id,
        participants: {
          create: [
            { user_id: session.user.user_id },
            { user_id: targetUserId },
          ],
        },
      },
    });
  }

  return { success: true, conversationId: conversation.id };
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
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Pumili muna ng branch bago magpadala ng mensahe." };
  }

  const content = input.content.trim();
  if (content.length < 2) {
    return { error: "Maglagay ng mas malinaw na mensahe." };
  }

  const conversation = await assertConversationAccess(session, input.conversationId);

  if (conversation.type === ConversationType.branch_room) {
    await prisma.conversationParticipant.upsert({
      where: {
        conversation_id_user_id: {
          conversation_id: conversation.id,
          user_id: session.user.user_id,
        },
      },
      update: {
        last_read_at: new Date(),
      },
      create: {
        conversation_id: conversation.id,
        user_id: session.user.user_id,
        last_read_at: new Date(),
      },
    });
  }

  const createdMessage = await prisma.message.create({
    data: {
      tenant_id: conversation.tenant_id,
      conversation_id: conversation.id,
      sender_id: session.user.user_id,
      content,
      reply_to_id: input.replyToMessageId ?? null,
      is_broadcast: conversation.type === ConversationType.branch_room,
      attachments:
        input.attachments && input.attachments.length > 0
          ? {
              create: input.attachments.map((attachment) => ({
                file_name: attachment.fileName,
                file_url: attachment.fileUrl,
                mime_type: attachment.mimeType,
                size_bytes: attachment.sizeBytes,
              })),
            }
          : undefined,
    },
    include: {
      conversation: {
        include: {
          participants: true,
        },
      },
    },
  });

  const participantIds = createdMessage.conversation.participants
    .map((participant) => participant.user_id)
    .filter((participantUserId) => participantUserId !== session.user.user_id);

  await Promise.all(
    participantIds.map((recipientUserId) =>
      createNotification({
        userId: recipientUserId,
        tenantId: conversation.tenant_id,
        type:
          conversation.type === ConversationType.branch_room
            ? "branch_announcement"
            : "direct_message",
        title:
          conversation.type === ConversationType.branch_room
            ? "May bagong branch message"
            : "May bagong direct message",
        body: content,
        actionUrl:
          conversation.type === ConversationType.branch_room
            ? "/agapay-pintig"
            : "/agapay-pintig",
        channel:
          conversation.type === ConversationType.branch_room
            ? NotificationChannel.in_app
            : NotificationChannel.both,
      }),
    ),
  );

  revalidatePath("/agapay-pintig");
  revalidatePath("/agapay-tanaw");

  return { success: "Naipadala ang mensahe." };
}

export async function toggleMessageReaction(input: {
  messageId: string;
  emoji: string;
}) {
  const { session } = await requireCommunityTenantContext();
  const message = await prisma.message.findUnique({
    where: { id: input.messageId },
    include: {
      conversation: true,
    },
  });

  if (!message) {
    return { error: "Message not found." };
  }

  await assertConversationAccess(session, message.conversation_id);

  const existing = await prisma.messageReaction.findUnique({
    where: {
      message_id_user_id_emoji: {
        message_id: input.messageId,
        user_id: session.user.user_id,
        emoji: input.emoji,
      },
    },
  });

  if (existing) {
    await prisma.messageReaction.delete({
      where: {
        message_id_user_id_emoji: {
          message_id: input.messageId,
          user_id: session.user.user_id,
          emoji: input.emoji,
        },
      },
    });
    return { success: "Reaction removed." };
  }

  await prisma.messageReaction.create({
    data: {
      message_id: input.messageId,
      user_id: session.user.user_id,
      emoji: input.emoji,
    },
  });

  return { success: "Reaction added." };
}

export async function createGroupConversation(input: {
  title: string;
  participantUserIds: number[];
}) {
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Pumili muna ng branch bago gumawa ng group chat." };
  }

  const uniqueParticipantIds = [
    ...new Set(input.participantUserIds.filter(Boolean)),
    session.user.user_id,
  ];

  if (uniqueParticipantIds.length < 3) {
    return { error: "Kailangan ng hindi bababa sa 3 participants para sa group chat." };
  }

  const validParticipants = await prisma.user.findMany({
    where: {
      tenant_id: tenantId,
      user_id: { in: uniqueParticipantIds },
      status: UserStatus.active,
      role: { in: [Role.member, Role.admin, Role.lender] },
    },
    select: { user_id: true },
  });

  if (validParticipants.length !== uniqueParticipantIds.length) {
    return { error: "May participant na hindi valid para sa branch group chat na ito." };
  }

  const conversation = await prisma.conversation.create({
    data: {
      tenant_id: tenantId,
      type: ConversationType.group_chat,
      title: input.title.trim(),
      created_by: session.user.user_id,
      participants: {
        create: uniqueParticipantIds.map((participantUserId) => ({
          user_id: participantUserId,
        })),
      },
    },
  });

  await Promise.all(
    uniqueParticipantIds
      .filter((participantUserId) => participantUserId !== session.user.user_id)
      .map((participantUserId) =>
        createNotification({
          userId: participantUserId,
          tenantId,
          type: "direct_message",
          title: "Naidagdag ka sa group chat",
          body: `Kasali ka na sa "${input.title.trim()}" group conversation.`,
          actionUrl: "/agapay-pintig",
          channel: NotificationChannel.both,
        }),
      ),
  );

  return { success: true, conversationId: conversation.id };
}

export async function markConversationRead(conversationId: string) {
  const { session } = await requireCommunityTenantContext();
  const conversation = await assertConversationAccess(session, conversationId);

  await prisma.conversationParticipant.upsert({
    where: {
      conversation_id_user_id: {
        conversation_id: conversation.id,
        user_id: session.user.user_id,
      },
    },
    update: {
      last_read_at: new Date(),
    },
    create: {
      conversation_id: conversation.id,
      user_id: session.user.user_id,
      last_read_at: new Date(),
    },
  });

  return { success: true };
}

export async function requestMentorship(input: {
  mentorUserId: number;
  focusArea?: string;
  notes?: string;
}) {
  const { session, tenantId } = await requireCommunityTenantContext();

  if (!tenantId) {
    return { error: "Pumili muna ng branch bago mag-request ng mentorship." };
  }

  if (input.mentorUserId === session.user.user_id) {
    return { error: "Hindi puwedeng sarili mo ang piliing mentor." };
  }

  const mentor = await prisma.user.findFirst({
    where: {
      user_id: input.mentorUserId,
      tenant_id: tenantId,
      status: UserStatus.active,
      role: { in: [Role.member, Role.admin, Role.lender] },
    },
  });

  if (!mentor) {
    return { error: "Hindi available ang napiling mentor sa branch na ito." };
  }

  await prisma.mentorshipConnection.upsert({
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

  revalidatePath("/agapay-pintig");
  revalidatePath("/agapay-tanaw");

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

  return { success: "Naipasa na ang mentorship request para sa endorsement." };
}

export async function reviewMentorshipConnection(input: {
  connectionId: string;
  status: "endorsed" | "rejected";
  notes?: string;
}) {
  const session = await requireTanawSession();

  const connection = await prisma.mentorshipConnection.findUnique({
    where: { id: input.connectionId },
  });

  if (!connection) {
    return { error: "Mentorship request not found." };
  }

  if (
    !canAccessTenantStaffResource(session, connection.tenant_id) &&
    session.user.role !== "superadmin"
  ) {
    return { error: "Unauthorized" };
  }

  await prisma.mentorshipConnection.update({
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

  revalidatePath("/agapay-pintig");
  revalidatePath("/agapay-tanaw");

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
}
