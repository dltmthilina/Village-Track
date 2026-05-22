import React from "react";
import { ScrollView, Text } from "react-native";
import { UtilityRow } from "../ui/UtilityRow";
import { sharedStyles } from "../sharedStyles";

export function DriveScreen(props: {
  onUpload: () => void;
  onDownload: () => void;
  onManualBackup: () => void;
  onManualImport: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={sharedStyles.page}>
      <Text style={sharedStyles.sectionTitle}>Google Drive sync</Text>
      <UtilityRow
        icon="cloud-upload-outline"
        title="Upload latest backup"
        detail="Uses Google Drive API when OAuth client IDs are configured."
        onPress={props.onUpload}
      />
      <UtilityRow
        icon="cloud-download-outline"
        title="Download Drive backup"
        detail="Restores the newest VillageTrack backup found in appDataFolder."
        onPress={props.onDownload}
      />
      <UtilityRow
        icon="share-social-outline"
        title="Save via share sheet"
        detail="Works now: send the backup file to the Google Drive app."
        onPress={props.onManualBackup}
      />
      <UtilityRow
        icon="folder-open-outline"
        title="Restore chosen file"
        detail="Pick a backup file downloaded from Google Drive."
        onPress={props.onManualImport}
      />
    </ScrollView>
  );
}
