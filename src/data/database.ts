import * as SQLite from "expo-sqlite";

import { AssistanceType, ChildRecord, Household, HouseholdDraft, VillageTrackBackup, normalizeIncome } from "../domain/household";

type HouseholdRow = {
  id: number;
  family_code: string;
  address: string;
  phone_number: string;
  grama_niladhari_division: string;
  father_name: string;
  father_alive: number;
  father_occupation: string;
  father_monthly_income: number;
  mother_name: string;
  mother_alive: number;
  mother_occupation: string;
  mother_monthly_income: number;
  guardian_name: string;
  other_income_sources: string;
  land_details: string;
  property_details: string;
  permanent_disability_details: string;
  assistance_needed: string;
  notes: string;
  children: string;
  created_at: string;
  updated_at: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("villagetrack.db");
  }
  return databasePromise;
}

export async function initDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS households (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_code TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL,
      phone_number TEXT NOT NULL DEFAULT '',
      grama_niladhari_division TEXT NOT NULL DEFAULT '',
      father_name TEXT NOT NULL DEFAULT '',
      father_alive INTEGER NOT NULL DEFAULT 1,
      father_occupation TEXT NOT NULL DEFAULT '',
      father_monthly_income REAL NOT NULL DEFAULT 0,
      mother_name TEXT NOT NULL DEFAULT '',
      mother_alive INTEGER NOT NULL DEFAULT 1,
      mother_occupation TEXT NOT NULL DEFAULT '',
      mother_monthly_income REAL NOT NULL DEFAULT 0,
      guardian_name TEXT NOT NULL DEFAULT '',
      other_income_sources TEXT NOT NULL DEFAULT '',
      land_details TEXT NOT NULL DEFAULT '',
      property_details TEXT NOT NULL DEFAULT '',
      permanent_disability_details TEXT NOT NULL DEFAULT '',
      assistance_needed TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      children TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS households_family_code_idx ON households(family_code);
    CREATE INDEX IF NOT EXISTS households_updated_at_idx ON households(updated_at);
  `);
}

export async function getHouseholds(): Promise<Household[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HouseholdRow>("SELECT * FROM households ORDER BY updated_at DESC");
  return rows.map(rowToHousehold);
}

export async function createHousehold(draft: HouseholdDraft) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const values = draftToValues(draft, now);

  await db.runAsync(
    `INSERT INTO households (
      family_code, address, phone_number, grama_niladhari_division,
      father_name, father_alive, father_occupation, father_monthly_income,
      mother_name, mother_alive, mother_occupation, mother_monthly_income,
      guardian_name, other_income_sources, land_details, property_details,
      permanent_disability_details, assistance_needed, notes, children,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values.familyCode,
    values.address,
    values.phoneNumber,
    values.gramaNiladhariDivision,
    values.fatherName,
    values.fatherAlive,
    values.fatherOccupation,
    values.fatherMonthlyIncome,
    values.motherName,
    values.motherAlive,
    values.motherOccupation,
    values.motherMonthlyIncome,
    values.guardianName,
    values.otherIncomeSources,
    values.landDetails,
    values.propertyDetails,
    values.permanentDisabilityDetails,
    values.assistanceNeeded,
    values.notes,
    values.children,
    now,
    now
  );
}

export async function updateHousehold(id: number, draft: HouseholdDraft) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const values = draftToValues(draft, now);

  await db.runAsync(
    `UPDATE households SET
      family_code = ?, address = ?, phone_number = ?, grama_niladhari_division = ?,
      father_name = ?, father_alive = ?, father_occupation = ?, father_monthly_income = ?,
      mother_name = ?, mother_alive = ?, mother_occupation = ?, mother_monthly_income = ?,
      guardian_name = ?, other_income_sources = ?, land_details = ?, property_details = ?,
      permanent_disability_details = ?, assistance_needed = ?, notes = ?, children = ?,
      updated_at = ?
    WHERE id = ?`,
    values.familyCode,
    values.address,
    values.phoneNumber,
    values.gramaNiladhariDivision,
    values.fatherName,
    values.fatherAlive,
    values.fatherOccupation,
    values.fatherMonthlyIncome,
    values.motherName,
    values.motherAlive,
    values.motherOccupation,
    values.motherMonthlyIncome,
    values.guardianName,
    values.otherIncomeSources,
    values.landDetails,
    values.propertyDetails,
    values.permanentDisabilityDetails,
    values.assistanceNeeded,
    values.notes,
    values.children,
    now,
    id
  );
}

export async function deleteHousehold(id: number) {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM households WHERE id = ?", id);
}

export async function exportBackup(): Promise<VillageTrackBackup> {
  return {
    app: "VillageTrack",
    version: 1,
    exportedAt: new Date().toISOString(),
    households: await getHouseholds()
  };
}

export async function importBackup(backup: VillageTrackBackup) {
  if (backup.app !== "VillageTrack" || !Array.isArray(backup.households)) {
    throw new Error("This file is not a valid VillageTrack backup.");
  }

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const household of backup.households) {
      await upsertImportedHousehold(household);
    }
  });
}

export async function exportHouseholdsCsv(): Promise<string> {
  const households = await getHouseholds();
  const header = [
    "family_code",
    "address",
    "phone_number",
    "gn_division",
    "father_name",
    "father_alive",
    "father_occupation",
    "father_monthly_income",
    "mother_name",
    "mother_alive",
    "mother_occupation",
    "mother_monthly_income",
    "head_of_household",
    "other_income_sources",
    "land_details",
    "property_details",
    "permanent_disability_details",
    "assistance_needed",
    "child_name",
    "child_age",
    "child_schooling_status",
    "child_grade",
    "child_employment_status",
    "child_married",
    "notes",
    "updated_at",
  ];

  const rows = households.flatMap((household) => {
    const childRows = household.children.length > 0 ? household.children : [null];
    return childRows.map((child) => [
      household.familyCode,
      household.address,
      household.phoneNumber,
      household.gramaNiladhariDivision,
      household.fatherName,
      household.fatherAlive ? "yes" : "no",
      household.fatherOccupation,
      household.fatherMonthlyIncome,
      household.motherName,
      household.motherAlive ? "yes" : "no",
      household.motherOccupation,
      household.motherMonthlyIncome,
      household.headOfHousehold,
      household.otherIncomeSources,
      household.landDetails,
      household.propertyDetails,
      household.permanentDisabilityDetails,
      household.assistanceNeeded.join("; "),
      child?.name ?? "",
      child?.age ?? "",
      child?.schoolingStatus ?? "",
      child?.grade ?? "",
      child?.employmentStatus ?? "",
      child ? (child.married ? "yes" : "no") : "",
      household.notes,
      household.updatedAt,
    ]);
  });

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

async function upsertImportedHousehold(household: Household) {
  const existing = (await getDatabase()).getFirstAsync<{ id: number }>("SELECT id FROM households WHERE family_code = ?", household.familyCode);
  const draft: HouseholdDraft = {
    familyCode: household.familyCode,
    address: household.address,
    phoneNumber: household.phoneNumber,
    gramaNiladhariDivision: household.gramaNiladhariDivision,
    fatherName: household.fatherName,
    fatherAlive: household.fatherAlive,
    fatherOccupation: household.fatherOccupation,
    fatherMonthlyIncome: String(household.fatherMonthlyIncome),
    motherName: household.motherName,
    motherAlive: household.motherAlive,
    motherOccupation: household.motherOccupation,
    motherMonthlyIncome: String(household.motherMonthlyIncome),
    headOfHousehold: household.headOfHousehold,
    otherIncomeSources: household.otherIncomeSources,
    landDetails: household.landDetails,
    propertyDetails: household.propertyDetails,
    permanentDisabilityDetails: household.permanentDisabilityDetails,
    assistanceNeeded: household.assistanceNeeded,
    notes: household.notes,
    children: household.children,
  };

  const row = await existing;
  if (row) {
    await updateHousehold(row.id, draft);
  } else {
    await createHousehold(draft);
  }
}

function draftToValues(draft: HouseholdDraft, _timestamp: string) {
  return {
    familyCode: draft.familyCode.trim(),
    address: draft.address.trim(),
    phoneNumber: draft.phoneNumber.trim(),
    gramaNiladhariDivision: draft.gramaNiladhariDivision.trim(),
    fatherName: draft.fatherName.trim(),
    fatherAlive: draft.fatherAlive ? 1 : 0,
    fatherOccupation: draft.fatherOccupation.trim(),
    fatherMonthlyIncome: normalizeIncome(draft.fatherMonthlyIncome),
    motherName: draft.motherName.trim(),
    motherAlive: draft.motherAlive ? 1 : 0,
    motherOccupation: draft.motherOccupation.trim(),
    motherMonthlyIncome: normalizeIncome(draft.motherMonthlyIncome),
    guardianName: draft.headOfHousehold.trim(),
    otherIncomeSources: draft.otherIncomeSources.trim(),
    landDetails: draft.landDetails.trim(),
    propertyDetails: draft.propertyDetails.trim(),
    permanentDisabilityDetails: draft.permanentDisabilityDetails.trim(),
    assistanceNeeded: JSON.stringify(draft.assistanceNeeded),
    notes: draft.notes.trim(),
    children: JSON.stringify(draft.children),
  };
}

function rowToHousehold(row: HouseholdRow): Household {
  return {
    id: row.id,
    familyCode: row.family_code,
    address: row.address,
    phoneNumber: row.phone_number,
    gramaNiladhariDivision: row.grama_niladhari_division,
    fatherName: row.father_name,
    fatherAlive: Boolean(row.father_alive),
    fatherOccupation: row.father_occupation,
    fatherMonthlyIncome: row.father_monthly_income,
    motherName: row.mother_name,
    motherAlive: Boolean(row.mother_alive),
    motherOccupation: row.mother_occupation,
    motherMonthlyIncome: row.mother_monthly_income,
    headOfHousehold: row.guardian_name,
    otherIncomeSources: row.other_income_sources,
    landDetails: row.land_details,
    propertyDetails: row.property_details,
    permanentDisabilityDetails: row.permanent_disability_details,
    assistanceNeeded: parseJson<AssistanceType[]>(row.assistance_needed, []),
    notes: row.notes,
    children: parseJson<ChildRecord[]>(row.children, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
