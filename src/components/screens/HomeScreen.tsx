import React from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Household } from "../../domain/household";
import { Stat } from "../ui/Stat";
import { Badge } from "../ui/Badge";
import { ActionButton } from "../ui/ActionButton";
import { sharedStyles } from "../sharedStyles";
import { ChildRecord } from "../../domain/household";

function isChild(c: ChildRecord): boolean {
  const age = parseInt(c.age);
  return !Number.isFinite(age) || age <= 18;
}

export function HomeScreen(props: {
  households: Household[];
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
  onOpen: (household: Household) => void;
  onDelete: (household: Household) => void;
  onExport: () => void;
  onDrive: () => void;
}) {
  const totalChildren = props.households.reduce(
    (sum, item) => sum + item.children.filter(isChild).length,
    0
  );
  const totalPersons = props.households.reduce((sum, item) => {
    let count = item.children.length;
    if (item.fatherName.trim() && item.fatherAlive) count++;
    if (item.motherName.trim() && item.motherAlive) count++;
    if (item.guardianName.trim()) count++;
    return sum + count;
  }, 0);
  const assistanceCount = props.households.filter((item) => item.assistanceNeeded.length > 0).length;

  return (
    <ScrollView contentContainerStyle={sharedStyles.page}>
      <View style={styles.statsRow}>
        <Stat label="Families" value={String(props.households.length)} />
        <Stat label="Persons" value={String(totalPersons)} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Children" value={String(totalChildren)} />
        <Stat label="Need aid" value={String(assistanceCount)} />
      </View>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={19} color="#52635c" />
        <TextInput
          value={props.query}
          onChangeText={props.onQueryChange}
          placeholder="Search code, name, address or phone"
          style={styles.searchInput}
        />
      </View>
      <View style={styles.actionRow}>
        <ActionButton icon="download-outline" label="Export" onPress={props.onExport} />
        <ActionButton icon="cloud-upload-outline" label="Drive sync" onPress={props.onDrive} />
      </View>
      {props.households.length === 0 ? (
        <View style={styles.emptyPanel}>
          <Ionicons name="clipboard-outline" size={40} color="#28745a" />
          <Text style={styles.emptyTitle}>No family records yet</Text>
          <Text style={styles.emptyText}>Add the first household to start collecting village data offline.</Text>
          <Pressable style={sharedStyles.primaryButton} onPress={props.onCreate}>
            <Text style={sharedStyles.primaryButtonText}>Add household</Text>
          </Pressable>
        </View>
      ) : (
        props.households.map((household) => (
          <Pressable key={household.id} style={styles.householdCard} onPress={() => props.onOpen(household)}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.familyCode}>{household.familyCode}</Text>
                <Text style={styles.address}>{household.address}</Text>
              </View>
              <Pressable style={styles.deleteButton} onPress={() => props.onDelete(household)}>
                <Ionicons name="trash-outline" size={19} color="#a13c3c" />
              </Pressable>
            </View>
            <Text style={styles.cardLine}>Father: {household.fatherName || "Not recorded"}</Text>
            <Text style={styles.cardLine}>Mother: {household.motherName || "Not recorded"}</Text>
            <View style={styles.badgeRow}>
              <Badge label={`${household.children.filter(isChild).length} children`} />
              {household.permanentDisabilityDetails ? <Badge label="Disability" tone="warning" /> : null}
              {household.assistanceNeeded.map((item) => (
                <Badge key={item} label={item} tone="success" />
              ))}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 10
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe8e2",
    paddingHorizontal: 12,
    minHeight: 48
  },
  searchInput: {
    flex: 1,
    color: "#1f2c27",
    fontSize: 15
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  householdCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe8e2",
    padding: 14,
    gap: 8
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  cardTitleGroup: {
    flex: 1
  },
  familyCode: {
    color: "#174536",
    fontSize: 18,
    fontWeight: "800"
  },
  address: {
    color: "#52635c",
    fontSize: 13,
    marginTop: 2
  },
  cardLine: {
    color: "#2f3f38",
    fontSize: 14
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#fff2f2"
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2
  },
  emptyPanel: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: "#dfe8e2"
  },
  emptyTitle: {
    color: "#174536",
    fontSize: 18,
    fontWeight: "800"
  },
  emptyText: {
    color: "#52635c",
    textAlign: "center"
  }
});
