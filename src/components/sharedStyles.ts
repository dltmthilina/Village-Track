import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 34,
    gap: 14
  },
  sectionTitle: {
    color: "#174536",
    fontSize: 22,
    fontWeight: "800"
  },
  fieldLabel: {
    color: "#31443c",
    fontSize: 13,
    fontWeight: "700"
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#28745a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800"
  }
});
