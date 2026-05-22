import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" }) {
  return (
    <View style={[styles.badge, tone === "success" && styles.badgeSuccess, tone === "warning" && styles.badgeWarning]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#eef2ef",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  badgeSuccess: {
    backgroundColor: "#dff3e9"
  },
  badgeWarning: {
    backgroundColor: "#fff0c8"
  },
  badgeText: {
    color: "#31443c",
    fontSize: 12,
    fontWeight: "700"
  }
});
