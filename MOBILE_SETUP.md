# Mobile App Setup Guide

## 1. EAS (Expo Application Services) Setup

### 1.1 Create an Expo account and initialize the project

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas init
```

After running `eas init`, copy the generated project ID into `apps/mobile/app.json`:

```json
"extra": {
  "eas": {
    "projectId": "<YOUR_GENERATED_PROJECT_ID>"
  }
}
```

### 1.2 Set the backend API URL

Update the `EXPO_PUBLIC_API_URL` values in `apps/mobile/eas.json` for each build profile:

| Profile     | URL                                    |
|-------------|----------------------------------------|
| development | `http://localhost:8000`                |
| preview     | `https://YOUR_BACKEND_LAMBDA_URL`      |
| production  | `https://YOUR_BACKEND_LAMBDA_URL`      |

---

## 2. Apple App Store (iOS)

### 2.1 Get your Team ID

1. Sign in to [Apple Developer Portal](https://developer.apple.com/account/).
2. Go to **Membership Details**.
3. Copy the **Team ID** (10-character alphanumeric string).

### 2.2 Update `backend/.well-known/apple-app-site-association`

Replace `TEAM_ID` with your actual Apple Team ID:

```json
{
  "applinks": {
    "details": [{ "appID": "ABCD1234EF.com.childevnote.mate", "paths": ["*"] }]
  },
  "webcredentials": {
    "apps": ["ABCD1234EF.com.childevnote.mate"]
  }
}
```

### 2.3 Update `apps/mobile/eas.json` submit section

```json
"ios": {
  "appleId": "your-developer@email.com",
  "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",  // Found in App Store Connect → App → General → App Information
  "appleTeamId": "ABCD1234EF"
}
```

---

## 3. Google Play Store (Android)

### 3.1 Get the SHA-256 fingerprint for `assetlinks.json`

**Development (debug key):**
```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

**Production:**  
Find the fingerprint in [Google Play Console](https://play.google.com/console) →
Your App → **Setup** → **App integrity** → **App signing key certificate** → SHA-256 certificate fingerprint.

### 3.2 Update `backend/.well-known/assetlinks.json`

Replace `REPLACE_WITH_ACTUAL_SHA256_FINGERPRINT`:

```json
"sha256_cert_fingerprints": ["AB:CD:EF:..."]
```

### 3.3 Create a service account key for `eas submit`

1. Go to [Google Play Console](https://play.google.com/console) → Setup → API access.
2. Create a service account with **Release Manager** role.
3. Download the JSON key file.
4. Place it at `apps/mobile/google-play-service-account.json` (gitignored).

---

## 4. Push Notifications

The backend sends push notifications via the [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/).

No additional API key is required — Expo Push Tokens are registered from the app automatically on first login (`apps/mobile/app/_layout.tsx`).

---

## 5. Passkey (WebAuthn) — Mobile Support

Mobile passkey authentication requires a platform-specific library:

```bash
cd apps/mobile
npx expo install react-native-passkey
```

Then replace the stub `TODO` comments in `apps/mobile/app/login.tsx` and `apps/mobile/app/signup.tsx` with actual `Passkey.authenticate()` / `Passkey.register()` calls.

The backend's `RP_ID` is configured via the `RP_ID` environment variable and defaults to `localhost`. For production:

| Environment | `RP_ID`                                  |
|-------------|------------------------------------------|
| Development | `localhost`                              |
| Production  | `main.d3tpdfp23uq4rz.amplifyapp.com`    |

---

## 6. GitHub Actions Secrets Required

| Secret         | Description                       |
|----------------|-----------------------------------|
| `EXPO_TOKEN`   | EAS access token (`eas whoami --raw` or Expo Dashboard → Account → Access tokens) |
