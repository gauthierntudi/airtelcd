import { normalizePhone } from "@/lib/phone";

export type GuestImportRow = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export type ParseResult = {
  rows: GuestImportRow[];
  errors: { line: number; message: string }[];
};

const HEADER_MAP: Record<string, keyof GuestImportRow> = {
  nom_complet: "fullName",
  "nom complet": "fullName",
  nomcomplet: "fullName",
  fullname: "fullName",
  full_name: "fullName",
  "full name": "fullName",
  name: "fullName",
  nom: "fullName",
  prenom: "fullName",
  prénom: "fullName",
  firstname: "fullName",
  first_name: "fullName",
  "first name": "fullName",
  email: "email",
  mail: "email",
  courriel: "email",
  telephone: "phone",
  téléphone: "phone",
  tel: "phone",
  phone: "phone",
  mobile: "phone",
  gsm: "phone",
};

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/^\uFEFF/, "");
}

/** Parse une ligne CSV (guillemets simples). */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === "," || ch === ";") && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function mapHeaders(headerCells: string[]): Map<number, keyof GuestImportRow> | null {
  const map = new Map<number, keyof GuestImportRow>();
  for (let i = 0; i < headerCells.length; i++) {
    const key = HEADER_MAP[normalizeHeader(headerCells[i])];
    if (key) map.set(i, key);
  }
  const hasName = [...map.values()].includes("fullName");
  if (!hasName) return null;
  return map;
}

/** Détecte en-têtes ; sinon colonnes fixes : nom complet, email, téléphone. */
export function parseGuestCsv(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: GuestImportRow[] = [];
  const errors: { line: number; message: string }[] = [];

  if (lines.length === 0) {
    return { rows, errors: [{ line: 0, message: "Fichier vide" }] };
  }

  const firstCells = parseCsvLine(lines[0]);
  let columnMap = mapHeaders(firstCells);
  let startIndex = 1;

  if (!columnMap) {
    columnMap = new Map([
      [0, "fullName"],
      [1, "email"],
      [2, "phone"],
    ]);
    startIndex = 0;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const lineNum = i + 1;
    const cells = parseCsvLine(lines[i]);
    if (cells.every((c) => !c)) continue;

    const draft: Partial<GuestImportRow> = {};
    columnMap.forEach((field, colIndex) => {
      const val = cells[colIndex]?.trim();
      if (val) draft[field] = val;
    });

    const fullName = draft.fullName?.trim();
    const email = draft.email?.trim();
    const phoneRaw = draft.phone?.trim();
    let phoneE164: string | undefined;
    if (phoneRaw) {
      const normalized = normalizePhone(phoneRaw);
      if (!normalized.ok) {
        errors.push({ line: lineNum, message: normalized.error });
        continue;
      }
      if (normalized.e164) phoneE164 = normalized.e164;
    }
    rows.push({
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phoneE164 && { phone: phoneE164 }),
    });
  }

  return { rows, errors };
}

export const GUEST_CSV_TEMPLATE =
  "nom_complet,email,telephone\nJean Dupont,jean.dupont@exemple.com,+243810000001\nMarie Kabila,,0810000002\n";
