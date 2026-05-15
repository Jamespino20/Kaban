# Agapay Mobile REST API — v1

> Secure, multi-tenant REST endpoints for the **Agapay Pintig** native Android/iOS client.

Base URL (production):
```
https://agapay-saas.vercel.app/api/v1/mobile
```

Base URL (local dev):
```
http://10.0.2.2:3000/api/v1/mobile
```

> ⚠️ Android emulators map `localhost` to the emulator itself. Use `10.0.2.2` to reach your host machine.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Tenants](#tenants)
   - [Users / Wallet](#users--wallet)
   - [Loans](#loans)
   - [Community](#community)
   - [Support](#support)
   - [Notifications](#notifications)
3. [Error Reference](#error-reference)
4. [Android Integration Guide](#android-integration-guide)

---

## Authentication

### Public Endpoints (no token required)

| Endpoint | Method | Description |
|---|---|---|
| `/auth/login` | POST | Authenticate with email/username + password |
| `/auth/register` | POST | Create a new member account |
| `/auth/forgot-password` | POST | Request password reset email |
| `/auth/reset-password` | POST | Reset password with token |
| `/tenants` | GET | List active cooperatives |
| `/tenants/regions` | GET | List regions/groups |

### Authenticated Endpoints (Bearer token required)

All other endpoints require an `Authorization: Bearer <token>` header. Obtain the token from the login response (see below).

> **Multi-tenancy** — every request is scoped to the user's tenant via their account. The token already encodes the user's tenant context.

---

## Endpoints

### Auth

#### `POST /auth/login`

Authenticate a member within their cooperative.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `tenantId` | `number` | ✅ | Cooperative's numeric ID |
| `username` | `string` | ✅ | Username **or** email address |
| `password` | `string` | ✅ | Account password |

**200 — Success:**

```json
{
  "status": "success",
  "token": "uuid-string-here",
  "user": {
    "user_id": 60118,
    "username": "mariasantos",
    "email": "maria.santos@example.com",
    "role": "member",
    "tenant_id": 60001,
    "tenant_slug": "malolos",
    "member_code": "MALOLOS-M-060118"
  }
}
```

**200 — 2FA Required:**

```json
{
  "status": "success",
  "requires_2fa": true,
  "user": { "user_id": 60118, "username": "mariasantos", "role": "member", "tenant_id": 60001 }
}
```

**Errors:** `400` invalid fields, `401` wrong credentials, `403` account suspended.

---

#### `POST /auth/register`

Register a new member within a specific tenant.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `tenantId` | `number` | ✅ | Cooperative's numeric ID |
| `email` | `string` | ✅ | Valid email |
| `username` | `string` | ✅ | Min 3 characters |
| `password` | `string` | ✅ | Min 6 characters |
| `firstName` | `string` | ✅ | Legal first name |
| `lastName` | `string` | ✅ | Legal last name |
| `phone` | `string` | ✅ | Min 10 digits |
| `maritalStatus` | `string` | ✅ | `single`, `married`, etc. |
| `birthdate` | `string` | ✅ | `YYYY-MM-DD` |
| `gender` | `string` | ✅ | `male`, `female` |
| `region` | `string` | ✅ | PSGC region |
| `province` | `string` | ✅ | Province name |
| `city` | `string` | ✅ | City/Municipality |
| `barangay` | `string` | ✅ | Barangay |
| `streetAddress` | `string` | ✅ | Full address |
| `idPicture` | `string` | ✅ | URL of uploaded valid ID |

**201 — Success:**

```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "user": { "user_id": 60118, "username": "mariasantos", "member_code": "MALOLOS-M-060118", "tenant_id": 60001 },
  "token": "uuid-auth-token"
}
```

**Errors:** `400` invalid fields, `404` tenant not found, `409` email/username taken.

---

#### `POST /auth/2fa/verify`

Complete 2FA challenge during login.

**Request body:** `{ "userId": 60118, "code": "123456" }`

**200 — Success:** `{ "status": "success", "token": "uuid", "user": { ... } }`

---

#### `POST /auth/forgot-password`

Request a password reset token.

**Request body:** `{ "email": "user@example.com", "tenantId": 60001 }`

**200:** `{ "status": "success", "message": "If the email exists, a reset link has been sent." }`

---

#### `POST /auth/reset-password`

Reset password with token.

**Request body:** `{ "token": "reset-token", "password": "newPassword123" }`

**200:** `{ "status": "success", "message": "Password has been reset." }`

---

#### `GET /auth/session`

Validate the current Bearer token and return user profile.

**Headers:** `Authorization: Bearer <token>`

**200:** `{ "status": "success", "data": { "user": { ... }, "profile": { ... } } }`

---

### Tenants

#### `GET /tenants`

List all active cooperatives. Public.

**200:** `{ "status": "success", "data": [{ "tenant_id": 1, "name": "Malolos...", "slug": "malolos", "brand_color": "#2563eb", "member_count": 26 }, ...] }`

#### `GET /tenants/{id}`

Get a single tenant's details.

**200:** `{ "status": "success", "data": { "tenant_id": 1, "name": "...", "slug": "...", "brand_color": "...", "accent_color": "...", "group_name": "Central Luzon", "member_count": 26 } }`

#### `GET /tenants/search?q=malolos`

Search tenants by name.

**200:** `{ "status": "success", "data": [{ "tenant_id": 1, "name": "Malolos...", "slug": "malolos", ... }] }`

#### `GET /tenants/regions`

List tenant groups with nested tenants.

**200:** `{ "status": "success", "data": [{ "group_name": "Central Luzon", "tenants": [{ "tenant_id": 1, "name": "Malolos..." }] }] }`

---

### Users / Wallet

All endpoints require `Authorization: Bearer <token>`.

#### `GET /users/profile`

Get the current user's full profile.

**200:** `{ "status": "success", "data": { "user": { "user_id": 1, "username": "...", "email": "...", "role": "member" }, "profile": { "first_name": "...", "last_name": "...", "photo_url": "...", "phone": "..." } } }`

#### `PUT /users/profile`

Update profile fields.

**Request body:** `{ "firstName": "...", "lastName": "...", "email": "...", "phone": "...", "photoUrl": "..." }`

**200:** `{ "status": "success", "data": { "user": { ... }, "profile": { ... } } }`

#### `GET /users/wallet`

Get wallet balance and recent transactions.

**200:** `{ "status": "success", "data": { "balance": 1500.00, "transactions": [{ "type": "deposit", "amount": 500, "status": "verified", "created_at": "..." }] } }`

#### `POST /users/wallet/topup`

Request a wallet top-up (deposit).

**Request body:** `{ "amount": 500, "method": "GCash", "reference": "REF123" }`

**200:** `{ "status": "success", "data": { "request_id": 1, "status": "pending" } }`

#### `POST /users/wallet/withdraw`

Request a withdrawal.

**Request body:** `{ "amount": 200, "method": "GCash", "account_ref": "0917xxxxxxx" }`

**200:** `{ "status": "success", "data": { "request_id": 2, "status": "pending" } }`

#### `POST /users/wallet/pay-loan`

Pay a loan installment from wallet balance.

**Request body:** `{ "loan_id": 1, "amount": 1250.00 }`

**200:** `{ "status": "success", "data": { "payment_id": 1, "new_balance": 250.00 } }`

**Errors:** `400` insufficient balance, `404` loan not found.

---

### Loans

All endpoints require `Authorization: Bearer <token>`.

#### `GET /loans`

List current user's loans.

**200:** `{ "status": "success", "data": [{ "loan_id": 1, "loan_reference": "LN-...", "product_name": "Agapay Sari-Sari", "principal_amount": 5000, "balance_remaining": 3750, "status": "active", "next_due_date": "2026-06-01" }] }`

#### `POST /loans/apply`

Apply for a new loan.

**Request body:** `{ "product_id": 1, "amount": 5000, "term_months": 6, "repayment_frequency": "monthly", "purpose": "Small business capital", "guarantor_ids": [102, 103] }`

**200:** `{ "status": "success", "data": { "loan_id": 10, "reference": "LN-20260515-XXXXXX" } }`

#### `GET /loans/products`

List available loan products for the user's tenant.

**200:** `{ "status": "success", "data": [{ "product_id": 1, "name": "Agapay Sari-Sari", "min_amount": 2000, "max_amount": 5000, "interest_rate_percent": 5.0, "max_term_months": 12 }] }`

#### `GET /loans/{id}/schedule`

Get repayment schedule for a specific loan.

**200:** `{ "status": "success", "data": [{ "installment_number": 1, "due_date": "2026-06-01", "principal_amount": 833.33, "interest_amount": 208.33, "total_due": 1041.66, "status": "pending" }] }`

#### `POST /loans/{id}/pay`

Submit a payment for a loan installment.

**Request body:** `{ "amount": 1041.66, "method": "GCash", "reference": "PAY-REF-001" }`

**200:** `{ "status": "success", "data": { "payment_id": 5, "status": "pending_verification" } }`

---

### Community

#### `GET /community/conversations`

Get user's conversations with last message preview.

**Headers:** `Authorization: Bearer <token>`

**200:** `{ "status": "success", "data": [{ "id": "conv-uuid", "title": "Operator Chat", "type": "operator_room", "last_message": "Hello!", "last_message_at": "2026-05-15T...", "unread_count": 2 }] }`

#### `GET /community/messages?conversation_id=xxx&limit=50&before=timestamp`

Get paginated messages for a conversation.

**200:** `{ "status": "success", "data": [{ "id": "msg-uuid", "sender_id": 1, "sender_name": "Juan", "content": "Hello!", "created_at": "2026-05-15T...", "reactions": [{ "emoji": "👍", "count": 3 }] }] }`

#### `POST /community/messages`

Send a message.

**Request body:** `{ "conversation_id": "conv-uuid", "content": "Hello everyone!", "reply_to_id": "prev-msg-uuid" }`

**200:** `{ "status": "success", "data": { "id": "new-msg-uuid", "created_at": "..." } }`

---

### Support

#### `GET /support/tickets`

Get user's support tickets.

**Headers:** `Authorization: Bearer <token>`

**200:** `{ "status": "success", "data": [{ "id": 1, "ticket_number": "TKT-...", "category": "loan", "subject": "Payment issue", "status": "open", "created_at": "..." }] }`

#### `POST /support/tickets`

Create a support ticket.

**Request body:** `{ "subject": "Payment not reflecting", "description": "I paid via GCash but...", "category": "payment" }`

**200:** `{ "status": "success", "data": { "id": 2, "ticket_number": "TKT-20260515-XXXX" } }`

---

### Notifications

#### `GET /notifications`

Get user's notifications (last 50).

**Headers:** `Authorization: Bearer <token>`

**200:** `{ "status": "success", "data": { "notifications": [{ "id": "notif-uuid", "title": "Loan Approved", "body": "Your loan has been approved.", "is_read": false, "created_at": "..." }], "unread_count": 3 } }`

#### `POST /notifications/mark-read`

Mark notifications as read.

**Request body:** `{ "ids": ["notif-uuid-1", "notif-uuid-2"] }` or `{ "all": true }` to mark all as read.

**200:** `{ "status": "success", "data": { "marked": 5 } }`

---

## Error Reference

All error responses follow this shape:

```json
{
  "status": "error",
  "message": "Human-readable reason"
}
```

Validation errors (400) may include field-level breakdown:

```json
{
  "status": "error",
  "message": "Invalid fields.",
  "errors": { "email": ["Invalid email"], "phone": ["Min 10 characters"] }
}
```

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Invalid input / validation failure |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — account suspended |
| 404 | Resource not found |
| 409 | Conflict — duplicate email/username |
| 500 | Internal server error |

---

## Android Integration Guide

### Step 1 — Add Internet Permission

In `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

For local dev only, add to `<application>`:

```xml
android:usesCleartextTraffic="true"
```

> Remove `usesCleartextTraffic` for production builds.

---

### Step 2 — Create ApiClient

```java
// ApiClient.java
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class ApiClient {
    private static final String BASE_URL = "https://agapay-saas.vercel.app/api/v1/mobile";

    public static JSONObject request(String method, String endpoint, JSONObject payload, String token) throws Exception {
        URL url = new URL(BASE_URL + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setRequestProperty("Accept", "application/json");
        if (token != null) conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(method.equals("POST") || method.equals("PUT"));
        conn.setConnectTimeout(15_000);
        conn.setReadTimeout(15_000);

        if (payload != null) {
            byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) { os.write(body); }
        }

        int code = conn.getResponseCode();
        InputStream stream = (code >= 400) ? conn.getErrorStream() : conn.getInputStream();
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line; while ((line = br.readLine()) != null) sb.append(line);
        }
        JSONObject response = new JSONObject(sb.toString());
        response.put("_httpStatus", code);
        return response;
    }

    public static JSONObject get(String endpoint, String token) throws Exception {
        return request("GET", endpoint, null, token);
    }
    public static JSONObject post(String endpoint, JSONObject payload, String token) throws Exception {
        return request("POST", endpoint, payload, token);
    }
    public static JSONObject put(String endpoint, JSONObject payload, String token) throws Exception {
        return request("PUT", endpoint, payload, token);
    }
}
```

---

### Step 3 — Build Models

```java
// AgapayUser.java
public class AgapayUser {
    public int userId;
    public String username;
    public String email;
    public String role;
    public int tenantId;
    public String tenantSlug;
    public String memberCode;
    public String token;

    public static AgapayUser fromJson(JSONObject json) {
        AgapayUser u = new AgapayUser();
        u.userId     = json.getInt("user_id");
        u.username   = json.optString("username");
        u.email      = json.optString("email");
        u.role       = json.optString("role");
        u.tenantId   = json.optInt("tenant_id");
        u.tenantSlug = json.optString("tenant_slug");
        u.memberCode = json.optString("member_code");
        return u;
    }
}
```

---

### Step 4 — Login Example

```java
new Thread(() -> {
    try {
        JSONObject payload = new JSONObject();
        payload.put("username", "mariasantos");
        payload.put("password", "secret123");
        payload.put("tenantId", 60001);

        JSONObject res = ApiClient.post("/auth/login", payload, null);
        int status = res.getInt("_httpStatus");

        if (status == 200 && "success".equals(res.getString("status"))) {
            String token = res.getString("token");
            AgapayUser user = AgapayUser.fromJson(res.getJSONObject("user"));
            user.token = token;
            saveSession(user); // store in SharedPreferences
        }
    } catch (Exception e) { /* handle error */ }
}).start();
```

---

### Step 5 — Authenticated Requests

```java
String token = sessionManager.getToken(); // from SharedPreferences

// GET user profile
JSONObject profile = ApiClient.get("/users/profile", token);

// GET wallet balance
JSONObject wallet = ApiClient.get("/users/wallet", token);

// GET loans
JSONObject loans = ApiClient.get("/loans", token);

// POST loan payment
JSONObject payment = ApiClient.post("/loans/1/pay",
    new JSONObject().put("amount", 1041.66).put("method", "GCash"),
    token
);
```

---

### Step 6 — Persist Session

```java
// SessionManager.java
import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREFS = "agapay_session";
    private final SharedPreferences prefs;

    public SessionManager(Context ctx) { prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    public void save(AgapayUser u) {
        prefs.edit()
            .putInt("user_id", u.userId)
            .putString("username", u.username)
            .putString("token", u.token)
            .putInt("tenant_id", u.tenantId)
            .putString("tenant_slug", u.tenantSlug)
            .apply();
    }

    public String getToken() { return prefs.getString("token", null); }
    public boolean isLoggedIn() { return getToken() != null; }
    public void clear() { prefs.edit().clear().apply(); }
}
```

---

### Step 7 — Protect Screens

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    SessionManager session = new SessionManager(this);
    if (!session.isLoggedIn()) {
        startActivity(new Intent(this, LoginActivity.class));
        finish();
        return;
    }
    // session.getToken() available for API calls
}
```

---

## Changelog

### v1.1 — 2026-05-15
- Added token-based auth (`POST /auth/login` now returns `token`)
- `POST /auth/2fa/verify` — 2FA challenge flow
- `POST /auth/forgot-password`, `/auth/reset-password`
- `GET /auth/session` — token validation
- `GET /tenants`, `GET /tenants/{id}`, `GET /tenants/search`, `GET /tenants/regions`
- `GET /users/profile`, `PUT /users/profile`
- `GET /users/wallet`, `POST /users/wallet/topup`, `/withdraw`, `/pay-loan`
- `GET /loans`, `POST /loans/apply`, `GET /loans/products`, `GET /loans/{id}/schedule`, `POST /loans/{id}/pay`
- `GET /community/conversations`, `GET /community/messages`, `POST /community/messages`
- `GET /support/tickets`, `POST /support/tickets`
- `GET /notifications`, `POST /notifications/mark-read`

### v1.0 — 2026-05-14
- `POST /mobile/auth/login` — Password auth with 2FA detection
- `POST /mobile/auth/register` — Member registration
