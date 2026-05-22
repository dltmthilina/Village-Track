# VillageTrack

VillageTrack is an Expo React Native app for village officers to collect household and family details offline, export them as CSV, and back up records for Google Drive.

## Features

- Offline household registry using SQLite on the device.
- Parent, guardian, child, education, occupation, disability, income, land, property, and assistance fields.
- Search by household code, address, names, or phone number.
- CSV export for spreadsheet use.
- JSON backup export and import.
- Google Drive app-data sync service ready for OAuth client IDs.

## Run

```bash
npm install
npm run start
```

## Google Drive sync

Automatic Drive sync needs Google OAuth client IDs in `app.json`:

```json
"extra": {
  "googleOAuth": {
    "expoClientId": "YOUR_EXPO_CLIENT_ID",
    "iosClientId": "YOUR_IOS_CLIENT_ID",
    "androidClientId": "YOUR_ANDROID_CLIENT_ID",
    "webClientId": "YOUR_WEB_CLIENT_ID"
  }
}
```

Until those are configured, officers can use the backup share option to save the JSON backup through the Google Drive app, and restore it later with the import action.
