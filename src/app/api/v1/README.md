# Agapay Mobile REST API — v1

> Secure, multi-tenant REST endpoints for the **Agapay Pintig** native Android client.

Base URL (production):
```
https://agapay-saas.vercel.app/api/v1
```

Base URL (local dev):
```
http://10.0.2.2:3000/api/v1
```

> ⚠️ Android emulators map `localhost` to the emulator itself. Use `10.0.2.2` to reach your host machine.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [POST /mobile/auth/register](#post-mobileauthregister)
   - [POST /mobile/auth/login](#post-mobileauthlogin)
3. [Error Reference](#error-reference)
4. [Android Integration Guide](#android-integration-guide)
   - [Step 1 — Add Internet Permission](#step-1--add-internet-permission)
   - [Step 2 — Create an ApiClient helper](#step-2--create-an-apiclient-helper)
   - [Step 3 — Build models](#step-3--build-models)
   - [Step 4 — Call Login](#step-4--call-login)
   - [Step 5 — Call Register](#step-5--call-register)
   - [Step 6 — Persist the session](#step-6--persist-the-session)
   - [Step 7 — Protect screens](#step-7--protect-screens)

---

## Authentication

These endpoints are **public** (no token required). They are the entry point for the app; all subsequent authenticated actions should use the `user_id` and `tenant_id` returned here.

> **Multi-tenancy note** — every request *must* include a `tenantId` in the body. This uniquely scopes the user to their cooperative. The same email may exist in multiple tenants; they are treated as entirely separate accounts.

---

## Endpoints

### POST /mobile/auth/register

Register a new member within a specific tenant cooperative.

**Request body** — `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `tenantId` | `number` | ✅ | Cooperative's numeric ID |
| `email` | `string` | ✅ | Valid email address |
| `username` | `string` | ✅ | Min 3 characters |
| `password` | `string` | ✅ | Min 6 characters |
| `firstName` | `string` | ✅ | Legal first name |
| `lastName` | `string` | ✅ | Legal last name |
| `middleName` | `string` | — | Optional |
| `phone` | `string` | ✅ | Min 10 digits |
| `maritalStatus` | `string` | ✅ | e.g. `"single"`, `"married"` |
| `birthdate` | `string` | ✅ | ISO format: `"YYYY-MM-DD"` |
| `gender` | `string` | ✅ | e.g. `"male"`, `"female"` |
| `region` | `string` | ✅ | e.g. `"NCR"` |
| `province` | `string` | ✅ | e.g. `"Metro Manila"` |
| `city` | `string` | ✅ | e.g. `"Quezon City"` |
| `barangay` | `string` | ✅ | e.g. `"Commonwealth"` |
| `streetAddress` | `string` | ✅ | Full street address |
| `idPicture` | `string` | ✅ | URL of uploaded valid ID |
| `businessName` | `string` | — | Optional |
| `placeOfBirth` | `string` | — | Optional |
| `tin` | `string` | — | Optional TIN number |
| `brgyCertUrl` | `string` | — | URL of barangay certificate |
| `businessPermitUrl` | `string` | — | URL of business permit |

**Example request**

```json
{
  "tenantId": 60001,
  "email": "maria.santos@example.com",
  "username": "mariasantos",
  "password": "secret123",
  "firstName": "Maria",
  "lastName": "Santos",
  "phone": "09171234567",
  "maritalStatus": "single",
  "birthdate": "1995-06-15",
  "gender": "female",
  "region": "NCR",
  "province": "Metro Manila",
  "city": "Quezon City",
  "barangay": "Commonwealth",
  "streetAddress": "123 Rizal St",
  "idPicture": "https://example.com/uploads/id.jpg"
}
```

**201 — Success**

```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email.",
  "user": {
    "user_id": 60118,
    "username": "mariasantos",
    "email": "maria.santos@example.com",
    "member_code": "MALOLOS M 060118",
    "tenant_id": 60001
  }
}
```

**Error responses**

| Status | Reason |
|---|---|
| `400` | Missing or invalid fields |
| `404` | `tenantId` does not exist |
| `409` | Email or username already used in this tenant |
| `500` | Internal server error |

---

### POST /mobile/auth/login

Authenticate a member within a specific tenant cooperative.

**Request body** — `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `tenantId` | `number` | ✅ | Cooperative's numeric ID |
| `username` | `string` | ✅ | Username **or** email address |
| `password` | `string` | ✅ | Account password |

**Example request**

```json
{
  "tenantId": 60001,
  "username": "mariasantos",
  "password": "secret123"
}
```

**200 — Success**

```json
{
  "status": "success",
  "user": {
    "user_id": 60118,
    "username": "mariasantos",
    "email": "maria.santos@example.com",
    "role": "member",
    "tenant_id": 60001,
    "tenant_slug": "malolos",
    "member_code": "MALOLOS M 060118"
  }
}
```

**200 — 2FA Required** (do not proceed; prompt the OTP screen)

```json
{
  "status": "success",
  "requires_2fa": true,
  "user": {
    "user_id": 60118,
    "username": "mariasantos",
    "email": "maria.santos@example.com",
    "role": "member",
    "tenant_id": 60001
  }
}
```

**Error responses**

| Status | Reason |
|---|---|
| `400` | Missing or invalid fields |
| `401` | User not found in this tenant, or wrong password |
| `403` | Account is suspended |
| `500` | Internal server error |

---

## Error Reference

All error responses follow this shape:

```json
{
  "status": "error",
  "message": "Human-readable reason"
}
```

Validation errors (400) may also include a field-level breakdown:

```json
{
  "status": "error",
  "message": "Invalid fields.",
  "errors": {
    "email": ["Invalid email"],
    "phone": ["String must contain at least 10 character(s)"]
  }
}
```

---

## Android Integration Guide

This guide uses **native Android (Java/Kotlin)** with only the standard library — no Retrofit required.

### Step 1 — Add Internet Permission

In `AndroidManifest.xml`, inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

For cleartext (local dev only), inside `<application>`:

```xml
android:usesCleartextTraffic="true"
```

> Remove `usesCleartextTraffic` before deploying to production. Production uses HTTPS.

---

### Step 2 — Create an ApiClient helper

Create `ApiClient.java` (or `.kt`) to handle all HTTP JSON calls.

```java
// ApiClient.java
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class ApiClient {

    // Change this to the production URL before release
    private static final String BASE_URL = "http://10.0.2.2:3000/api/v1";

    /**
     * Sends a POST request with a JSON body.
     *
     * @param endpoint  e.g. "/mobile/auth/login"
     * @param payload   JSONObject to send as the request body
     * @return          Parsed JSONObject response
     * @throws Exception on network or I/O error
     */
    public static JSONObject post(String endpoint, JSONObject payload) throws Exception {
        URL url = new URL(BASE_URL + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setRequestProperty("Accept", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(15_000);

        byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body);
        }

        int code = conn.getResponseCode();
        InputStream stream = (code >= 400) ? conn.getErrorStream() : conn.getInputStream();

        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
        }

        JSONObject response = new JSONObject(sb.toString());
        response.put("_httpStatus", code); // attach HTTP status for caller inspection
        return response;
    }
}
```

---

### Step 3 — Build models

Create a simple `AgapayUser.java` to hold the authenticated session:

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

    public static AgapayUser fromJson(org.json.JSONObject json) throws Exception {
        AgapayUser u = new AgapayUser();
        u.userId     = json.getInt("user_id");
        u.username   = json.getString("username");
        u.email      = json.getString("email");
        u.role       = json.getString("role");
        u.tenantId   = json.getInt("tenant_id");
        u.tenantSlug = json.optString("tenant_slug", "");
        u.memberCode = json.optString("member_code", "");
        return u;
    }
}
```

---

### Step 4 — Call Login

Network calls must run off the main thread. Use `AsyncTask` or `Thread` for simplicity:

```java
// In your LoginActivity.java

private void performLogin(String username, String password, int tenantId) {
    new Thread(() -> {
        try {
            JSONObject payload = new JSONObject();
            payload.put("username", username);
            payload.put("password", password);
            payload.put("tenantId", tenantId);

            JSONObject response = ApiClient.post("/mobile/auth/login", payload);
            int httpStatus = response.getInt("_httpStatus");

            runOnUiThread(() -> {
                try {
                    if (httpStatus == 200 && "success".equals(response.getString("status"))) {

                        if (response.optBoolean("requires_2fa", false)) {
                            // TODO: navigate to OTP / 2FA screen
                            return;
                        }

                        AgapayUser user = AgapayUser.fromJson(response.getJSONObject("user"));
                        saveSession(user);       // see Step 6
                        navigateToDashboard();   // your navigation call

                    } else {
                        String message = response.optString("message", "Login failed.");
                        showError(message);
                    }
                } catch (Exception e) {
                    showError("Unexpected error. Try again.");
                }
            });

        } catch (Exception e) {
            runOnUiThread(() -> showError("Network error. Check your connection."));
        }
    }).start();
}
```

---

### Step 5 — Call Register

```java
// In your RegisterActivity.java

private void performRegister(/* pass form fields */) {
    new Thread(() -> {
        try {
            JSONObject payload = new JSONObject();
            payload.put("tenantId",      selectedTenantId);  // from tenant picker
            payload.put("email",         emailField.getText().toString().trim());
            payload.put("username",      usernameField.getText().toString().trim());
            payload.put("password",      passwordField.getText().toString());
            payload.put("firstName",     firstNameField.getText().toString().trim());
            payload.put("lastName",      lastNameField.getText().toString().trim());
            payload.put("phone",         phoneField.getText().toString().trim());
            payload.put("maritalStatus", selectedMaritalStatus);
            payload.put("birthdate",     selectedBirthdate);   // "YYYY-MM-DD"
            payload.put("gender",        selectedGender);
            payload.put("region",        regionField.getText().toString().trim());
            payload.put("province",      provinceField.getText().toString().trim());
            payload.put("city",          cityField.getText().toString().trim());
            payload.put("barangay",      barangayField.getText().toString().trim());
            payload.put("streetAddress", addressField.getText().toString().trim());
            payload.put("idPicture",     uploadedIdUrl);       // URL from your file upload step

            JSONObject response = ApiClient.post("/mobile/auth/register", payload);
            int httpStatus = response.getInt("_httpStatus");

            runOnUiThread(() -> {
                try {
                    if (httpStatus == 201 && "success".equals(response.getString("status"))) {
                        showSuccess("Account created! Please verify your email.");
                        navigateToLogin();

                    } else if (httpStatus == 409) {
                        showError("Email or username already used in this cooperative.");

                    } else if (httpStatus == 400) {
                        showError("Check your inputs and try again.");

                    } else {
                        showError(response.optString("message", "Registration failed."));
                    }
                } catch (Exception e) {
                    showError("Unexpected error.");
                }
            });

        } catch (Exception e) {
            runOnUiThread(() -> showError("Network error. Check your connection."));
        }
    }).start();
}
```

---

### Step 6 — Persist the session

Use `SharedPreferences` to keep the user logged in across app restarts:

```java
// SessionManager.java
import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME    = "agapay_session";
    private static final String KEY_USER_ID  = "user_id";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_EMAIL    = "email";
    private static final String KEY_ROLE     = "role";
    private static final String KEY_TENANT   = "tenant_id";
    private static final String KEY_SLUG     = "tenant_slug";
    private static final String KEY_CODE     = "member_code";

    private final SharedPreferences prefs;

    public SessionManager(Context ctx) {
        prefs = ctx.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void save(AgapayUser user) {
        prefs.edit()
            .putInt(KEY_USER_ID,  user.userId)
            .putString(KEY_USERNAME, user.username)
            .putString(KEY_EMAIL,    user.email)
            .putString(KEY_ROLE,     user.role)
            .putInt(KEY_TENANT,      user.tenantId)
            .putString(KEY_SLUG,     user.tenantSlug)
            .putString(KEY_CODE,     user.memberCode)
            .apply();
    }

    public boolean isLoggedIn() {
        return prefs.getInt(KEY_USER_ID, -1) != -1;
    }

    public AgapayUser getUser() {
        AgapayUser u  = new AgapayUser();
        u.userId      = prefs.getInt(KEY_USER_ID, -1);
        u.username    = prefs.getString(KEY_USERNAME, "");
        u.email       = prefs.getString(KEY_EMAIL, "");
        u.role        = prefs.getString(KEY_ROLE, "");
        u.tenantId    = prefs.getInt(KEY_TENANT, -1);
        u.tenantSlug  = prefs.getString(KEY_SLUG, "");
        u.memberCode  = prefs.getString(KEY_CODE, "");
        return u;
    }

    public void clear() {
        prefs.edit().clear().apply();
    }
}
```

---

### Step 7 — Protect screens

In every protected `Activity.onCreate`, redirect unauthenticated users to `LoginActivity`:

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

    AgapayUser currentUser = session.getUser();
    // currentUser.tenantId, currentUser.role etc. are available here
}
```

---

## Tenants Reference

To let users select their cooperative at the login/register screen, you can hard-code the seed list or fetch it from a future `GET /mobile/tenants` endpoint.

| `tenantId` | Name | `slug` |
|---|---|---|
| `60001` | Malolos Market Vendors Cooperative | `malolos` |
| `60002` | San Jose Rural Workers Coop | `san-jose` |
| `60003` | Quezon City Vendors Trust | `qc-vendors` |
| `60004` | Makati Business Sari-Sari Coop | `makati-business` |
| `60005` | Calamba Agricultural Cooperative | `calamba-agri` |

> IDs are subject to change after a database re-seed. Fetch from `/mobile/tenants` for a production app.

---

## Changelog

### v1.0 — 2026-05-14
- `POST /mobile/auth/register` — Member registration with tenant isolation
- `POST /mobile/auth/login` — Password auth with 2FA detection
