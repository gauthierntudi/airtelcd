import { normalizePhone } from "@/lib/phone";

export type GuestImportRow = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type ParseResult = {
  rows: GuestImportRow[];
  errors: { line: number; message: string }[];
};

const HEADER_MAP: Record<string, keyof GuestImportRow> = {
  prenom: "firstName",
  prénom: "firstName",
  firstname: "firstName",
  first_name: "firstName",
  "first name": "firstName",
  nom: "lastName",
  lastname: "lastName",
  last_name: "lastName",
  "last name": "lastName",
  name: "lastName",
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
  const hasFirst = [...map.values()].includes("firstName");
  if (!hasFirst) return null;
  return map;
}

/** Détecte en-têtes ; sinon colonnes fixes : prénom, nom, email, téléphone. */
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
      [0, "firstName"],
      [1, "lastName"],
      [2, "email"],
      [3, "phone"],
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

    const firstName = draft.firstName?.trim();
    const lastName = draft.lastName?.trim();
    if (!firstName) {
      errors.push({
        line: lineNum,
        message: "Prénom requis",
      });
      continue;
    }

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
      firstName,
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phoneE164 && { phone: phoneE164 }),
    });
  }

  return { rows, errors };
}

export const GUEST_CSV_TEMPLATE =
  "prenom,nom,email,telephone\nJean,Dupont,jean.dupont@exemple.com,+243810000001\nMarie,Kabila,,0810000002\n";
