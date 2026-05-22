import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dfe8e2"
  },
  statValue: {
    color: "#174536",
    fontSize: 24,
    fontWeight: "800"
  },
  statLabel: {
    color: "#52635c",
    fontSize: 12,
    marginTop: 3
  }
});
