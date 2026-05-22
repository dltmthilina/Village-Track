export type AssistanceType = "Medical" | "Financial" | "Legal" | "Education" | "Housing" | "Other";

export type ChildRecord = {
  name: string;
  age: string;
  schoolingStatus: "Schooling" | "Not schooling" | "Completed";
  grade: string;
  employmentStatus: "Studying" | "Employed" | "Unemployed";
  married: boolean;
};

export type HouseholdDraft = {
  familyCode: string;
  address: string;
  phoneNumber: string;
  gramaNiladhariDivision: string;
  fatherName: string;
  fatherAlive: boolean;
  fatherOccupation: string;
  fatherMonthlyIncome: string;
  motherName: string;
  motherAlive: boolean;
  motherOccupation: string;
  motherMonthlyIncome: string;
  guardianName: string;
  otherIncomeSources: string;
  landDetails: string;
  propertyDetails: string;
  permanentDisabilityDetails: string;
  assistanceNeeded: AssistanceType[];
  notes: string;
  children: ChildRecord[];
};

export type Household = Omit<HouseholdDraft, "fatherMonthlyIncome" | "motherMonthlyIncome"> & {
  id: number;
  fatherMonthlyIncome: number;
  motherMonthlyIncome: number;
  createdAt: string;
  updatedAt: string;
};

export type VillageTrackBackup = {
  app: "VillageTrack";
  version: 1;
  exportedAt: string;
  households: Household[];
};

export function emptyHouseholdDraft(): HouseholdDraft {
  return {
    familyCode: "",
    address: "",
    phoneNumber: "",
    gramaNiladhariDivision: "",
    fatherName: "",
    fatherAlive: true,
    fatherOccupation: "",
    fatherMonthlyIncome: "",
    motherName: "",
    motherAlive: true,
    motherOccupation: "",
    motherMonthlyIncome: "",
    guardianName: "",
    otherIncomeSources: "",
    landDetails: "",
    propertyDetails: "",
    permanentDisabilityDetails: "",
    assistanceNeeded: [],
    notes: "",
    children: []
  };
}

export function normalizeIncome(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}
