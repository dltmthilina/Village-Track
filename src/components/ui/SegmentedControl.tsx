import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { sharedStyles } from "../sharedStyles";

export function SegmentedControl({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={sharedStyles.fieldLabel}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={[styles.segment, value === option && styles.segmentActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.segmentText, value === option && styles.segmentTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#eef2ef",
    borderRadius: 8,
    padding: 3,
    gap: 3
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 6
  },
  segmentActive: {
    backgroundColor: "#ffffff"
  },
  segmentText: {
    color: "#52635c",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  segmentTextActive: {
    color: "#174536"
  }
});
