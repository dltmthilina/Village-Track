import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import {
  createHousehold,
  deleteHousehold,
  exportBackup,
  exportHouseholdsCsv,
  getHouseholds,
  importBackup,
  initDatabase,
  updateHousehold
} from "./src/data/database";
import {
  Household,
  HouseholdDraft,
  emptyHouseholdDraft
} from "./src/domain/household";
import { tryDriveDownload, tryDriveUpload } from "./src/services/googleDrive";
import { IconButton } from "./src/components/ui/IconButton";
import { HomeScreen } from "./src/components/screens/HomeScreen";
import { HouseholdForm } from "./src/components/screens/HouseholdForm";
import { ExportScreen } from "./src/components/screens/ExportScreen";
import { DriveScreen } from "./src/components/screens/DriveScreen";

type Screen = "home" | "form" | "export" | "drive";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [loading, setLoading] = useState(true);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Household | null>(null);
  const [draft, setDraft] = useState<HouseholdDraft>(emptyHouseholdDraft());

  const loadHouseholds = useCallback(async () => {
    const rows = await getHouseholds();
    setHouseholds(rows);
  }, []);

  useEffect(() => {
    initDatabase()
      .then(loadHouseholds)
      .catch((error) => Alert.alert("Database error", String(error)))
      .finally(() => setLoading(false));
  }, [loadHouseholds]);

  const filteredHouseholds = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return households;
    return households.filter((item) => {
      const haystack = [
        item.familyCode,
        item.address,
        item.fatherName,
        item.motherName,
        item.headOfHousehold,
        item.phoneNumber,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [households, query]);

  const openNewHousehold = () => {
    setEditing(null);
    setDraft(emptyHouseholdDraft());
    setScreen("form");
  };

  const openExistingHousehold = (household: Household) => {
    setEditing(household);
    setDraft({
      familyCode: household.familyCode,
      address: household.address,
      phoneNumber: household.phoneNumber,
      gramaNiladhariDivision: household.gramaNiladhariDivision,
      fatherName: household.fatherName,
      fatherAlive: household.fatherAlive,
      fatherOccupation: household.fatherOccupation,
      fatherMonthlyIncome: String(household.fatherMonthlyIncome || ""),
      motherName: household.motherName,
      motherAlive: household.motherAlive,
      motherOccupation: household.motherOccupation,
      motherMonthlyIncome: String(household.motherMonthlyIncome || ""),
      headOfHousehold: household.headOfHousehold,
      otherIncomeSources: household.otherIncomeSources,
      landDetails: household.landDetails,
      propertyDetails: household.propertyDetails,
      permanentDisabilityDetails: household.permanentDisabilityDetails,
      assistanceNeeded: household.assistanceNeeded,
      notes: household.notes,
      children: household.children,
    });
    setScreen("form");
  };

  const saveDraft = async () => {
    if (!draft.familyCode.trim()) {
      Alert.alert("Missing family code", "Enter a unique family or household code.");
      return;
    }
    if (!draft.address.trim()) {
      Alert.alert("Missing address", "Enter the family's village address.");
      return;
    }

    if (editing) {
      await updateHousehold(editing.id, draft);
    } else {
      await createHousehold(draft);
    }

    await loadHouseholds();
    setScreen("home");
  };

  const confirmDelete = (household: Household) => {
    Alert.alert("Delete household", `Remove ${household.familyCode}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHousehold(household.id);
          await loadHouseholds();
        }
      }
    ]);
  };

  const shareCsv = async () => {
    const csv = await exportHouseholdsCsv();
    const uri = `${FileSystem.cacheDirectory}villagetrack-households.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Share household CSV" });
    } else {
      Alert.alert("CSV created", uri);
    }
  };

  const shareBackup = async () => {
    const json = JSON.stringify(await exportBackup(), null, 2);
    const uri = `${FileSystem.cacheDirectory}villagetrack-backup.json`;
    await FileSystem.writeAsStringAsync(uri, json, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Save backup to Google Drive" });
  };

  const importBackupFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
    await importBackup(JSON.parse(content));
    await loadHouseholds();
    Alert.alert("Import complete", "Household records were restored from the backup file.");
  };

  const uploadDrive = async () => {
    const backup = await exportBackup();
    const response = await tryDriveUpload(backup);
    Alert.alert(response.title, response.message);
  };

  const downloadDrive = async () => {
    const response = await tryDriveDownload();
    if (response.backup) {
      await importBackup(response.backup);
      await loadHouseholds();
    }
    Alert.alert(response.title, response.message);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#28745a" />
          <Text style={styles.loadingText}>Preparing village records</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appShell}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>VillageTrack</Text>
            <Text style={styles.appSubtitle}>Family registry for village officers</Text>
          </View>
          {screen !== "home" ? (
            <IconButton icon="home-outline" label="Home" onPress={() => setScreen("home")} />
          ) : (
            <IconButton icon="person-add-outline" label="Add" onPress={openNewHousehold} />
          )}
        </View>

        {screen === "home" && (
          <HomeScreen
            households={filteredHouseholds}
            query={query}
            onQueryChange={setQuery}
            onCreate={openNewHousehold}
            onOpen={openExistingHousehold}
            onDelete={confirmDelete}
            onExport={() => setScreen("export")}
            onDrive={() => setScreen("drive")}
          />
        )}

        {screen === "form" && <HouseholdForm draft={draft} setDraft={setDraft} onSave={saveDraft} editing={editing} />}

        {screen === "export" && <ExportScreen onCsv={shareCsv} onBackup={shareBackup} onImport={importBackupFile} />}

        {screen === "drive" && (
          <DriveScreen onUpload={uploadDrive} onDownload={downloadDrive} onManualBackup={shareBackup} onManualImport={importBackupFile} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: "#f7faf7"
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7faf7"
  },
  loadingText: {
    marginTop: 12,
    color: "#52635c",
    fontSize: 15
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#dfe8e2",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  appTitle: {
    color: "#174536",
    fontSize: 25,
    fontWeight: "800"
  },
  appSubtitle: {
    color: "#52635c",
    fontSize: 13,
    marginTop: 2
  }
});

