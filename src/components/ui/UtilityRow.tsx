import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function UtilityRow(props: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.utilityRow} onPress={props.onPress}>
      <View style={styles.utilityIcon}>
        <Ionicons name={props.icon} size={24} color="#28745a" />
      </View>
      <View style={styles.utilityText}>
        <Text style={styles.utilityTitle}>{props.title}</Text>
        <Text style={styles.utilityDetail}>{props.detail}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#738079" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  utilityRow: {
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe8e2",
    backgroundColor: "#ffffff",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  utilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#e7f3ed",
    alignItems: "center",
    justifyContent: "center"
  },
  utilityText: {
    flex: 1,
    gap: 3
  },
  utilityTitle: {
    color: "#174536",
    fontSize: 15,
    fontWeight: "800"
  },
  utilityDetail: {
    color: "#52635c",
    fontSize: 13,
    lineHeight: 18
  }
});
