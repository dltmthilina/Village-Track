import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe8e2",
    padding: 14,
    gap: 12
  },
  formSectionTitle: {
    color: "#174536",
    fontSize: 17,
    fontWeight: "800"
  }
});
