import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { VillageTrackBackup } from "../domain/household";

WebBrowser.maybeCompleteAuthSession();

const driveScope = "https://www.googleapis.com/auth/drive.appdata";
const backupFileName = "villagetrack-backup.json";

type DriveResult = {
  title: string;
  message: string;
  backup?: VillageTrackBackup;
};

type GoogleOAuthConfig = {
  expoClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
};

export async function tryDriveUpload(backup: VillageTrackBackup): Promise<DriveResult> {
  const token = await getAccessToken();
  if (!token) return notConfiguredResult();

  const existingFileId = await findBackupFile(token);
  const metadata = { name: backupFileName, parents: ["appDataFolder"] };
  const boundary = `villagetrack-${Date.now()}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: application/json",
    "",
    JSON.stringify(backup),
    `--${boundary}--`
  ].join("\r\n");

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

  const response = await fetch(url, {
    method: existingFileId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!response.ok) {
    return { title: "Drive upload failed", message: await response.text() };
  }

  return { title: "Drive backup saved", message: "The latest household backup was uploaded to Google Drive app data." };
}

export async function tryDriveDownload(): Promise<DriveResult> {
  const token = await getAccessToken();
  if (!token) return notConfiguredResult();

  const fileId = await findBackupFile(token);
  if (!fileId) {
    return { title: "No Drive backup found", message: "Upload a backup first, or restore a manually saved JSON file." };
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    return { title: "Drive download failed", message: await response.text() };
  }

  return {
    title: "Drive backup restored",
    message: "The backup from Google Drive was imported into this device.",
    backup: (await response.json()) as VillageTrackBackup
  };
}

async function getAccessToken() {
  const config = getConfig();
  if (!config.expoClientId && !config.iosClientId && !config.androidClientId && !config.webClientId) {
    return null;
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "villagetrack" });
  const request = new AuthSession.AuthRequest({
    clientId: selectClientId(config),
    scopes: [driveScope],
    redirectUri,
    responseType: AuthSession.ResponseType.Token
  });

  const result = await request.promptAsync({
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth"
  });

  if (result.type !== "success") return null;
  return result.authentication?.accessToken ?? null;
}

async function findBackupFile(token: string) {
  const query = encodeURIComponent(`name='${backupFileName}' and trashed=false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) return null;
  const payload = (await response.json()) as { files?: Array<{ id: string }> };
  return payload.files?.[0]?.id ?? null;
}

function getConfig(): GoogleOAuthConfig {
  const extra = Constants.expoConfig?.extra as { googleOAuth?: GoogleOAuthConfig } | undefined;
  return extra?.googleOAuth ?? {};
}

function selectClientId(config: GoogleOAuthConfig) {
  if (config.expoClientId) return config.expoClientId;
  if (config.iosClientId) return config.iosClientId;
  if (config.androidClientId) return config.androidClientId;
  if (config.webClientId) return config.webClientId;
  return "";
}

function notConfiguredResult(): DriveResult {
  return {
    title: "Google Drive not configured",
    message: "Add Google OAuth client IDs in app.json to enable automatic Drive sync. Until then, use Save via share sheet and Restore chosen file."
  };
}
