import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { sharedStyles } from "../sharedStyles";

export function FormInput(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={sharedStyles.fieldLabel}>{props.label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#8b9992"
        style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfdad4",
    backgroundColor: "#fbfdfb",
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 46,
    color: "#1f2c27",
    fontSize: 15
  },
  inputMultiline: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: "top"
  }
});
