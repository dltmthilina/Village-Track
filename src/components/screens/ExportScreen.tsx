import React from "react";
import { ScrollView, Text } from "react-native";
import { UtilityRow } from "../ui/UtilityRow";
import { sharedStyles } from "../sharedStyles";

export function ExportScreen(props: { onCsv: () => void; onBackup: () => void; onImport: () => void }) {
  return (
    <ScrollView contentContainerStyle={sharedStyles.page}>
      <Text style={sharedStyles.sectionTitle}>Export and restore</Text>
      <UtilityRow
        icon="document-text-outline"
        title="Download CSV"
        detail="Create a spreadsheet-ready file with every household and child row."
        onPress={props.onCsv}
      />
      <UtilityRow
        icon="archive-outline"
        title="Create backup"
        detail="Save a complete JSON backup that can be kept in Google Drive."
        onPress={props.onBackup}
      />
      <UtilityRow
        icon="folder-open-outline"
        title="Import backup"
        detail="Restore records from a previous VillageTrack JSON backup."
        onPress={props.onImport}
      />
    </ScrollView>
  );
}
