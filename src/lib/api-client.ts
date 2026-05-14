const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || '';
const API_PREFIX = '/v1';

let authToken: string | null = null;
let cookieJar: string = '';

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    if (typeof window !== 'undefined') localStorage.setItem('agapay_token', token);
  } else {
    if (typeof window !== 'undefined') localStorage.removeItem('agapay_token');
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('agapay_token');
  }
  return authToken;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${API_PREFIX}${endpoint}`;
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (compatible; Agapay/1.0)',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookieJar) headers['Cookie'] = cookieJar;
  if (API_HOST) headers['Host'] = API_HOST;

  if (!API_BASE && !process.env.CI) {
    throw new Error(
      'API_URL not configured. Set NEXT_PUBLIC_API_URL or run locally with MySQL directly.'
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API Client] → ${url}`);
  }

  let res = await fetch(url, { ...options, headers, redirect: 'follow' });

  // Handle InfinityFree security challenge (aes.js HTML page)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('json')) {
    const text = await res.text();
    if (text.includes('aes.js') || text.includes('toNumbers')) {
      // Store any cookies from the challenge response
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) cookieJar = setCookie.split(';')[0];
      // Retry with the cookie
      const retryHeaders = { ...headers };
      if (cookieJar) retryHeaders['Cookie'] = cookieJar;
      res = await fetch(url, { ...options, headers: retryHeaders, redirect: 'follow' });
      const retryContentType = res.headers.get('content-type') || '';
      if (!retryContentType.includes('json')) {
        const retryText = await res.text();
        const snippet = retryText.substring(0, 200);
        console.error(`[API Client] Retry still non-JSON from ${endpoint}: ${snippet}`);
        throw new Error(`API security challenge could not be bypassed for ${url}. Try disabling InfinityFree bot protection or use a different hosting URL.`);
      }
    } else {
      const snippet = text.substring(0, 200);
      console.error(`[API Client] Non-JSON response from ${endpoint} (${res.status}): ${snippet}`);
      throw new Error(`API returned ${res.status} — expected JSON. Check ${url}`);
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.error || `API error: ${res.status}`);
  }

  return data;
}

// =========================================================================
// Types
// =========================================================================

export interface AuthUser {
  user_id: number;
  username: string;
  email: string;
  role: 'superadmin' | 'operator' | 'member';
  tenant_id: number | null;
  first_name?: string;
  last_name?: string;
  member_code?: string;
  interest_tier?: string;
  status?: string;
  requires_2fa?: boolean;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  created_at?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  tenant_id?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
}

export interface MeResponse {
  status: string;
  user: AuthUser;
}

export interface Tenant {
  tenant_id: number;
  name: string;
  slug: string;
  brand_color?: string;
  accent_color?: string;
  logo_url?: string;
  region?: string;
  is_active: boolean;
  member_count?: number;
  description?: string;
}

export interface Region {
  region: string;
  tenant_count: number;
  total_members: number;
}

export interface LoanProduct {
  product_id: number;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  interest_rate_percent: number;
  max_term_months: number;
  is_active: boolean;
  tenant_id: number;
  guarantor_liability_rate?: number;
}

export interface Loan {
  loan_id: number;
  tenant_id: number;
  user_id: number;
  product_id: number;
  loan_reference: string;
  principal_amount: number;
  purpose?: string;
  term_months: number;
  interest_applied: number;
  principal_receivable: number;
  interest_receivable: number;
  fees_applied: number;
  total_payable: number;
  balance_remaining: number;
  status: 'pending' | 'approved' | 'active' | 'paid' | 'defaulted' | 'rejected';
  applied_at: string;
  approved_at?: string;
  approved_by?: number;
  repayment_frequency: string;
  product_name?: string;
  username?: string;
}

export interface LoanApplicationData {
  product_id: number;
  amount: number;
  term_months: number;
  frequency?: string;
  purpose?: string;
  guarantor_ids?: number[];
}

export interface LoanSchedule {
  schedule_id: number;
  loan_id: number;
  tenant_id: number;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_due: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  days_late: number;
  penalty_applied: number;
}

export interface WalletAccount {
  account_id: number;
  tenant_id: number;
  user_id: number;
  account_type: string;
  owner_role?: string;
  balance: number;
  is_locked?: boolean;
  lock_reason?: string;
  opened_at: string;
  updated_at: string;
}

export interface Transaction {
  transaction_id: number;
  account_id: number;
  tenant_id: number;
  transaction_type: string;
  amount: number;
  fee_amount: number;
  net_amount?: number;
  status: string;
  method_label?: string;
  external_reference?: string;
  reference?: string;
  processed_at: string;
  processed_by?: number;
}

export interface TopUpRequest {
  id: number;
  tenant_id: number;
  user_id: number;
  request_type: 'deposit' | 'withdrawal';
  amount: number;
  fee_amount: number;
  net_amount?: number;
  method_label?: string;
  external_reference?: string;
  status: string;
  receipt_url?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: number;
  username?: string;
  email?: string;
}

export interface Member {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  member_code?: string;
  role: string;
  status: string;
  interest_tier?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  province?: string;
  business_name?: string;
  photo_url?: string;
}

export interface MemberProfile {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  business_name?: string;
  marital_status?: string;
  occupation?: string;
  place_of_birth?: string;
  tin?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  phone?: string;
  photo_url?: string;
}

export interface DashboardMetrics {
  total_members: number;
  active_members: number;
  total_loans: number;
  total_principal: number;
  active_loans: number;
  outstanding_balance: number;
  pending_loans: number;
  pending_loan_amount: number;
  total_savings: number;
  overdue_installments: number;
}

export interface PendingApprovals {
  pending_loans: Loan[];
  pending_topups: TopUpRequest[];
  pending_identities: any[];
}

export interface SuperadminMetrics {
  total_tenants: number;
  active_tenants: number;
  availed_tenants: number;
  total_users: number;
  active_users: number;
  total_loans: number;
  total_principal: number;
  active_loans: number;
  outstanding_balance: number;
  total_savings: number;
  pending_applications: number;
}

export interface TenantApplication {
  application_id: number;
  tenant_name: string;
  tenant_slug: string;
  applicant_name?: string;
  applicant_email: string;
  applicant_phone?: string;
  estimated_members?: number;
  tenant_group_id?: number;
  brand_color?: string;
  accent_color?: string;
  logo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: number;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  submitted_by_name?: string;
  created_at: string;
}

export interface TenantDetails extends Tenant {
  group_name?: string;
  member_count?: number;
  entitlement_status?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  log_id: number;
  log_type?: string;
  event_type?: string;
  tenant_id?: number;
  user_id?: number;
  actor_role?: string;
  actor_label?: string;
  module: string;
  action: string;
  action_category?: string;
  severity?: string;
  entity_type?: string;
  entity_id?: number;
  entity_ref?: string;
  request_id?: string;
  session_id?: string;
  old_values?: any;
  new_values?: any;
  changed_fields?: any;
  ip_address?: string;
  user_agent?: string;
  route?: string;
  http_method?: string;
  city?: string;
  region?: string;
  created_at: string;
  actor_name?: string;
}

export interface GrowthMetrics {
  member_growth: { period: string; count: number }[];
  loan_trend: { period: string; count: number; volume: number }[];
  savings_trend: { period: string; count: number; volume: number }[];
}

export interface Conversation {
  id: string;
  tenant_id: number;
  type: string;
  title?: string;
  slug?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  tenant_id: number;
  sender_id: number;
  content: string;
  is_broadcast?: boolean;
  created_at: string;
  conversation_id: string;
  reply_to_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: number;
  emoji: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  ticket_type?: string;
  tenant_id?: number;
  requester_id?: number;
  category: string;
  module_context?: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  assigned_to?: number;
  assigned_at?: string;
  resolved_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketDetail extends SupportTicket {
  replies?: SupportTicketReply[];
}

export interface SupportTicketReply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  created_at: string;
  user_name?: string;
}

export interface NotificationItem {
  id: string;
  tenant_id?: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  action_url?: string;
  channel?: string;
  is_read: boolean;
  emailed_at?: string;
  created_at: string;
}

// =========================================================================
// API Client
// =========================================================================

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: RegisterData) =>
      apiFetch<{ status: string; message: string; user_id?: number }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => apiFetch<MeResponse>('/auth/me'),
    enable2FA: () =>
      apiFetch<{ status: string; secret: string; message: string }>('/auth/2fa/enable', {
        method: 'POST',
      }),
    verify2FA: (code: string) =>
      apiFetch<{ status: string; message: string }>('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    disable2FA: () =>
      apiFetch<{ status: string; message: string }>('/auth/2fa/disable', {
        method: 'POST',
      }),
    forgotPassword: (email: string) =>
      apiFetch<{ status: string; message: string; reset_token?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      apiFetch<{ status: string; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
  },

  tenants: {
    list: () => apiFetch<{ status: string; tenants: Tenant[] }>('/tenants'),
    get: (id: number) => apiFetch<{ status: string; tenant: Tenant }>(`/tenants/${id}`),
    search: (q: string) =>
      apiFetch<{ status: string; tenants: Tenant[] }>(`/tenants/search?q=${encodeURIComponent(q)}`),
    regions: () => apiFetch<{ status: string; regions: Region[] }>('/tenants/regions'),
  },

  loans: {
    list: () => apiFetch<{ status: string; loans: Loan[] }>('/loans'),
    myLoans: () => apiFetch<{ status: string; loans: Loan[] }>('/loans/my-loans'),
    products: (tenantId?: number) =>
      apiFetch<{ status: string; products: LoanProduct[] }>(
        `/loans/products${tenantId ? `?tenant_id=${tenantId}` : ''}`
      ),
    apply: (data: LoanApplicationData & { userId?: number; tenantId?: number }) =>
      apiFetch<{ status: string; loan_id: number; reference: string; success?: boolean }>('/loans/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approve: (opts: { loanId: number }) =>
      apiFetch<{ status: string; message: string }>('/loans/approve', {
        method: 'POST',
        body: JSON.stringify({ loan_id: opts.loanId }),
      }),
    reject: (opts: { loanId: number; notes?: string }) =>
      apiFetch<{ status: string; message: string }>('/loans/reject', {
        method: 'POST',
        body: JSON.stringify({ loan_id: opts.loanId, reason: opts.notes }),
      }),
    release: (opts: { loanId: number }) =>
      apiFetch<{ status: string; message: string }>('/loans/release', {
        method: 'POST',
        body: JSON.stringify({ loan_id: opts.loanId }),
      }),
    pay: (loanId: number, methodId?: number, notes?: string) =>
      apiFetch<{ status: string; message: string; schedule_id: number; payment_reference: string }>(
        '/loans/pay',
        {
          method: 'POST',
          body: JSON.stringify({ loan_id: loanId, method_id: methodId, notes }),
        }
      ),
    fullPay: (loanId: number, methodId?: number, notes?: string) =>
      apiFetch<{ status: string; message: string; amount_paid: number; payment_reference: string }>(
        '/loans/full-pay',
        {
          method: 'POST',
          body: JSON.stringify({ loan_id: loanId, method_id: methodId, notes }),
        }
      ),
    schedule: (loanId: number) =>
      apiFetch<{ status: string; schedule: LoanSchedule[] }>(`/loans/schedule?loan_id=${loanId}`),
  },

  wallet: {
    get: () =>
      apiFetch<{ status: string; account: WalletAccount; recent_transactions: Transaction[] }>(
        '/wallet'
      ),
    requestTopUp: (opts: {
      userId: number;
      tenantId: number;
      amount: number;
      receiptUrl?: string;
      methodLabel?: string;
      externalReference?: string;
    }) =>
      apiFetch<{ status: string; message: string; request_id: number }>('/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({
          amount: opts.amount,
          method_label: opts.methodLabel,
          external_reference: opts.externalReference,
          receipt_url: opts.receiptUrl,
        }),
      }),
    topup: (amount: number, methodLabel?: string, externalReference?: string, receiptUrl?: string) =>
      apiFetch<{ status: string; message: string; request_id: number }>('/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method_label: methodLabel,
          external_reference: externalReference,
          receipt_url: receiptUrl,
        }),
      }),
    withdraw: (amount: number, methodLabel?: string, externalReference?: string) =>
      apiFetch<{ status: string; message: string; request_id: number }>('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method_label: methodLabel,
          external_reference: externalReference,
        }),
      }),
    getTransactions: (userId: number) => {
      return apiFetch<{
        status: string;
        transactions: Transaction[];
        total: number;
        page: number;
        pages: number;
      }>(`/wallet/transactions`);
    },
    transactions: (page?: number, limit?: number) => {
      const qs = new URLSearchParams();
      if (page) qs.set('page', String(page));
      if (limit) qs.set('limit', String(limit));
      return apiFetch<{
        status: string;
        transactions: Transaction[];
        total: number;
        page: number;
        pages: number;
      }>(`/wallet/transactions?${qs}`);
    },
    getPendingTopUps: () => {
      return apiFetch<{ status: string; requests: TopUpRequest[] }>(
        `/wallet/pending-topups`
      );
    },
    pendingTopups: (type?: string) => {
      const qs = type ? `?type=${encodeURIComponent(type)}` : '';
      return apiFetch<{ status: string; requests: TopUpRequest[] }>(
        `/wallet/pending-topups${qs}`
      );
    },
    approveTopup: (requestId: number, notes?: string) =>
      apiFetch<{ status: string; message: string; new_balance?: number }>('/wallet/approve-topup', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, notes }),
      }),
    rejectTopup: (requestId: number, reason?: string) =>
      apiFetch<{ status: string; message: string }>('/wallet/reject-topup', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, reason }),
      }),
  },

  admin: {
    getDashboardMetrics: () => {
      return apiFetch<{ status: string; metrics: DashboardMetrics }>(
        '/admin/dashboard-metrics'
      );
    },
    dashboardMetrics: (tenantId?: number) => {
      const qs = tenantId ? `?tenant_id=${tenantId}` : '';
      return apiFetch<{ status: string; metrics: DashboardMetrics }>(
        `/admin/dashboard-metrics${qs}`
      );
    },
    getTenantMembers: () => {
      return apiFetch<{ status: string; members: Member[]; total: number; page: number; pages: number }>(
        '/admin/members'
      );
    },
    members: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      return apiFetch<{ status: string; members: Member[]; total: number; page: number; pages: number }>(
        `/admin/members?${qs}`
      );
    },
    getPendingApprovals: () =>
      apiFetch<{ status: string; pending_loans: Loan[]; pending_topups: TopUpRequest[]; pending_identities: any[] }>(
        '/admin/pending-approvals'
      ),
    pendingApprovals: () =>
      apiFetch<{ status: string; pending_loans: Loan[]; pending_topups: TopUpRequest[]; pending_identities: any[] }>(
        '/admin/pending-approvals'
      ),
    updateProfile: (userId: number, data: MemberProfile) =>
      apiFetch<{ status: string; message: string }>(`/admin/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (userId: number, status: string) =>
      apiFetch<{ status: string; message: string }>(`/admin/status/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    resetPassword: (userId: number, password?: string) =>
      apiFetch<{ status: string; message: string; new_password?: string }>(`/admin/reset-pw/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    sendNotification: (userId: number, title: string, body: string, type?: string, actionUrl?: string) =>
      apiFetch<{ status: string; message: string; notification_id?: string }>(`/admin/notify/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ title, body, type, action_url: actionUrl }),
      }),
    getOverview: () =>
      apiFetch<{ status: string; overview: SuperadminMetrics }>('/admin/superadmin-overview'),
    superadminOverview: () =>
      apiFetch<{ status: string; overview: SuperadminMetrics }>('/admin/superadmin-overview'),
    getTenantApplications: () =>
      apiFetch<{ status: string; applications: TenantApplication[] }>('/admin/pending-applications'),
    pendingApplications: () =>
      apiFetch<{ status: string; applications: TenantApplication[] }>('/admin/pending-applications'),
    approveApplication: (id: number, plan?: string, notes?: string) =>
      apiFetch<{ status: string; message: string }>(`/admin/applications/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'approve', plan, notes }),
      }),
    rejectApplication: (id: number, notes?: string) =>
      apiFetch<{ status: string; message: string }>(`/admin/applications/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'reject', notes }),
      }),
    allTenants: () =>
      apiFetch<{ status: string; tenants: TenantDetails[] }>('/admin/tenants'),
    updateTenantLifecycle: (opts: { tenantId: number; action: 'avail' | 'suspend' | 'decommission' | 'restore' }) =>
      apiFetch<{ status: string; message: string }>(`/admin/tenants/${opts.tenantId}`, {
        method: 'POST',
        body: JSON.stringify({ action: opts.action }),
      }),
    tenantLifecycle: (id: number, action: 'avail' | 'suspend' | 'decommission' | 'restore') =>
      apiFetch<{ status: string; message: string }>(`/admin/tenants/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      }),
    auditLogs: (params?: { page?: number; module?: string; eventType?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.module) qs.set('module', params.module);
      if (params?.eventType) qs.set('event_type', params.eventType);
      if (params?.limit) qs.set('limit', String(params.limit));
      return apiFetch<{ status: string; logs: AuditLogEntry[]; total: number; page: number; pages: number }>(
        `/admin/audit-logs?${qs}`
      );
    },
    growthMetrics: (months?: number) => {
      const qs = months ? `?months=${months}` : '';
      return apiFetch<{ status: string; metrics: GrowthMetrics }>(`/admin/growth-metrics${qs}`);
    },
  },

  community: {
    conversations: () =>
      apiFetch<{ conversations: Conversation[] }>('/community/conversations'),
    messages: (conversationId: number, page?: number) => {
      const qs = new URLSearchParams();
      qs.set('conversation_id', String(conversationId));
      if (page) qs.set('page', String(page));
      return apiFetch<{ messages: Message[]; page: number }>(`/community/messages?${qs}`);
    },
    sendMessage: (conversationId: number, content: string, replyToId?: string) =>
      apiFetch<{ message: Message }>('/community/messages', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId, content, reply_to_id: replyToId }),
      }),
    createConversation: (type: string, name?: string, participantIds?: number[]) =>
      apiFetch<{ conversation: Conversation }>('/community/conversations', {
        method: 'POST',
        body: JSON.stringify({ type, name, participant_ids: participantIds }),
      }),
    toggleReaction: (messageId: string, emoji: string) =>
      apiFetch<{ status: string; action: string; id?: string }>('/community/reactions', {
        method: 'POST',
        body: JSON.stringify({ message_id: messageId, emoji }),
      }),
    markRead: (conversationId: string) =>
      apiFetch<{ status: string; message: string }>('/community/read', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId }),
      }),
    operatorRoom: () => apiFetch<{ room: Conversation }>('/community/operator-room'),
  },

  support: {
    tickets: () =>
      apiFetch<{ tickets: SupportTicket[] }>('/support/tickets'),
    createTicket: (subject: string, description: string, category?: string, priority?: string) =>
      apiFetch<{ ticket: SupportTicket }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, description, category, priority }),
      }),
    getTicket: (id: number) =>
      apiFetch<{ ticket: SupportTicketDetail }>(`/support/tickets/${id}`),
    replyTicket: (id: number, message: string) =>
      apiFetch<{ reply: SupportTicketReply }>(`/support/tickets/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    updateTicketStatus: (id: number, status: string) =>
      apiFetch<{ status: string; message: string }>(`/support/tickets/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    submitFeedback: (subject: string, message: string, category?: string) =>
      apiFetch<{ feedback: any }>('/support/feedback', {
        method: 'POST',
        body: JSON.stringify({ subject, message, category }),
      }),
  },

  notifications: {
    list: () =>
      apiFetch<{ notifications: NotificationItem[]; unread_count: number }>('/notifications'),
    markRead: (notificationId: string) =>
      apiFetch<{ status: string; message: string }>('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ notification_id: notificationId }),
      }),
    markAllRead: () =>
      apiFetch<{ status: string; message: string; updated?: number }>('/notifications/mark-all-read', {
        method: 'POST',
      }),
  },
};
