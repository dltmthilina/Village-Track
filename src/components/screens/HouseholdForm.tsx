import React from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AssistanceType, ChildRecord, Household, HouseholdDraft } from "../../domain/household";
import { FormSection } from "../ui/FormSection";
import { FormInput } from "../ui/FormInput";
import { ToggleRow } from "../ui/ToggleRow";
import { SegmentedControl } from "../ui/SegmentedControl";
import { ActionButton } from "../ui/ActionButton";
import { sharedStyles } from "../sharedStyles";

const assistanceTypes: AssistanceType[] = ["Medical", "Financial", "Legal", "Education", "Housing", "Other"];

export function HouseholdForm(props: {
  draft: HouseholdDraft;
  setDraft: React.Dispatch<React.SetStateAction<HouseholdDraft>>;
  onSave: () => void;
  editing: Household | null;
}) {
  const setField = <K extends keyof HouseholdDraft>(
    key: K,
    value: HouseholdDraft[K],
  ) => {
    props.setDraft((current) => ({ ...current, [key]: value }));
  };

  const familyMembers: string[] = [
    props.draft.fatherAlive && props.draft.fatherName.trim()
      ? props.draft.fatherName.trim()
      : "",
    props.draft.motherAlive && props.draft.motherName.trim()
      ? props.draft.motherName.trim()
      : "",
    ...props.draft.children.map((c) => c.name.trim()),
  ].filter(Boolean) as string[];

  const updateChild = (index: number, patch: Partial<ChildRecord>) => {
    props.setDraft((current) => ({
      ...current,
      children: current.children.map((child, childIndex) =>
        childIndex === index ? { ...child, ...patch } : child,
      ),
    }));
  };

  const addChild = () => {
    props.setDraft((current) => ({
      ...current,
      children: [
        ...current.children,
        {
          name: "",
          age: "",
          schoolingStatus: "Schooling",
          grade: "",
          employmentStatus: "Studying",
          married: false,
        },
      ],
    }));
  };

  const removeChild = (index: number) => {
    props.setDraft((current) => ({
      ...current,
      children: current.children.filter(
        (_, childIndex) => childIndex !== index,
      ),
    }));
  };

  const toggleAssistance = (value: AssistanceType) => {
    props.setDraft((current) => ({
      ...current,
      assistanceNeeded: current.assistanceNeeded.includes(value)
        ? current.assistanceNeeded.filter((item) => item !== value)
        : [...current.assistanceNeeded, value],
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.formShell}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={sharedStyles.page}>
        <Text style={sharedStyles.sectionTitle}>
          {props.editing ? "Edit household" : "New household"}
        </Text>

        <FormSection title="Household">
          <FormInput
            label="Family code"
            value={props.draft.familyCode}
            onChangeText={(value) => setField("familyCode", value)}
          />
          <FormInput
            label="Address"
            value={props.draft.address}
            onChangeText={(value) => setField("address", value)}
            multiline
          />
          <FormInput
            label="Phone number"
            value={props.draft.phoneNumber}
            onChangeText={(value) => setField("phoneNumber", value)}
            keyboardType="phone-pad"
          />
          <FormInput
            label="GN division"
            value={props.draft.gramaNiladhariDivision}
            onChangeText={(value) => setField("gramaNiladhariDivision", value)}
          />
        </FormSection>

        <FormSection title="Parents and guardian">
          <FormInput
            label="Father's name"
            value={props.draft.fatherName}
            onChangeText={(value) => setField("fatherName", value)}
          />
          <ToggleRow
            label="Father alive"
            value={props.draft.fatherAlive}
            onChange={(value) => setField("fatherAlive", value)}
          />
          <FormInput
            label="Father occupation"
            value={props.draft.fatherOccupation}
            onChangeText={(value) => setField("fatherOccupation", value)}
          />
          <FormInput
            label="Father expected monthly salary"
            value={props.draft.fatherMonthlyIncome}
            onChangeText={(value) => setField("fatherMonthlyIncome", value)}
            keyboardType="numeric"
          />
          <FormInput
            label="Mother's name"
            value={props.draft.motherName}
            onChangeText={(value) => setField("motherName", value)}
          />
          <ToggleRow
            label="Mother alive"
            value={props.draft.motherAlive}
            onChange={(value) => setField("motherAlive", value)}
          />
          <FormInput
            label="Mother occupation"
            value={props.draft.motherOccupation}
            onChangeText={(value) => setField("motherOccupation", value)}
          />
          <FormInput
            label="Mother expected monthly salary"
            value={props.draft.motherMonthlyIncome}
            onChangeText={(value) => setField("motherMonthlyIncome", value)}
            keyboardType="numeric"
          />
        </FormSection>

        <FormSection title="Children">
          {props.draft.children.map((child, index) => (
            <View key={index} style={styles.childPanel}>
              <View style={styles.childHeader}>
                <Text style={styles.childTitle}>Child {index + 1}</Text>
                <Pressable onPress={() => removeChild(index)}>
                  <Ionicons
                    name="close-circle-outline"
                    size={23}
                    color="#a13c3c"
                  />
                </Pressable>
              </View>
              <FormInput
                label="Name"
                value={child.name}
                onChangeText={(value) => updateChild(index, { name: value })}
              />
              <FormInput
                label="Age"
                value={child.age}
                onChangeText={(value) => updateChild(index, { age: value })}
                keyboardType="numeric"
              />
              <SegmentedControl
                label="Schooling"
                value={child.schoolingStatus}
                options={["Schooling", "Not schooling", "Completed"]}
                onChange={(value) =>
                  updateChild(index, {
                    schoolingStatus: value as ChildRecord["schoolingStatus"],
                  })
                }
              />
              <FormInput
                label="Grade or course"
                value={child.grade}
                onChangeText={(value) => updateChild(index, { grade: value })}
              />
              <SegmentedControl
                label="Work status"
                value={child.employmentStatus}
                options={["Studying", "Employed", "Unemployed"]}
                onChange={(value) =>
                  updateChild(index, {
                    employmentStatus: value as ChildRecord["employmentStatus"],
                  })
                }
              />
              <ToggleRow
                label="Married"
                value={child.married}
                onChange={(value) => updateChild(index, { married: value })}
              />
            </View>
          ))}
          <ActionButton
            icon="add-outline"
            label="Add child"
            onPress={addChild}
          />
        </FormSection>

        <FormSection title="Head of household">
          {familyMembers.length === 0 ? (
            <Text style={styles.hintText}>
              Fill in family member names above to select the head of household.
            </Text>
          ) : (
            <View style={styles.optionWrap}>
              {familyMembers.map((name) => {
                const selected = props.draft.headOfHousehold === name;
                return (
                  <Pressable
                    key={name}
                    style={[
                      styles.optionPill,
                      selected && styles.optionPillActive,
                    ]}
                    onPress={() =>
                      setField("headOfHousehold", selected ? "" : name)
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextActive,
                      ]}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </FormSection>

        <FormSection title="Income, property and support">
          <FormInput
            label="Other income sources"
            value={props.draft.otherIncomeSources}
            onChangeText={(value) => setField("otherIncomeSources", value)}
            multiline
          />
          <FormInput
            label="Land details"
            value={props.draft.landDetails}
            onChangeText={(value) => setField("landDetails", value)}
            multiline
          />
          <FormInput
            label="Property details"
            value={props.draft.propertyDetails}
            onChangeText={(value) => setField("propertyDetails", value)}
            multiline
          />
          <FormInput
            label="Permanent disability details"
            value={props.draft.permanentDisabilityDetails}
            onChangeText={(value) =>
              setField("permanentDisabilityDetails", value)
            }
            multiline
          />
          <Text style={sharedStyles.fieldLabel}>Assistance needed</Text>
          <View style={styles.optionWrap}>
            {assistanceTypes.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionPill,
                  props.draft.assistanceNeeded.includes(item) &&
                    styles.optionPillActive,
                ]}
                onPress={() => toggleAssistance(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    props.draft.assistanceNeeded.includes(item) &&
                      styles.optionTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <FormInput
            label="Notes"
            value={props.draft.notes}
            onChangeText={(value) => setField("notes", value)}
            multiline
          />
        </FormSection>

        <Pressable style={sharedStyles.primaryButton} onPress={props.onSave}>
          <Ionicons name="save-outline" size={20} color="#ffffff" />
          <Text style={sharedStyles.primaryButtonText}>Save household</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formShell: {
    flex: 1,
  },
  childPanel: {
    borderWidth: 1,
    borderColor: "#dfe8e2",
    borderRadius: 8,
    padding: 12,
    gap: 10,
    backgroundColor: "#fbfdfb",
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  childTitle: {
    color: "#174536",
    fontSize: 15,
    fontWeight: "800",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionPill: {
    borderWidth: 1,
    borderColor: "#cfdad4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#ffffff",
  },
  optionPillActive: {
    borderColor: "#28745a",
    backgroundColor: "#dff3e9",
  },
  optionText: {
    color: "#52635c",
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#174536",
  },
  hintText: {
    color: "#52635c",
    fontSize: 14,
  },
});
