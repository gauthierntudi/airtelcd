"use client";

import {
  ChevronDown,
  ChevronUp,
  Download,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  DEFAULT_EVENT_DAY_ID,
  EventDayMultiSelect,
} from "@/components/admin/EventDayMultiSelect";
import {
  GUEST_CSV_TEMPLATE,
  parseGuestCsv,
  type GuestImportRow,
} from "@/lib/parse-guest-csv";
import type { EventDayId } from "@/lib/event-days";
import { DEFAULT_INVITATION_TIME_RANGE } from "@/lib/invitation-time-range";
import { formatInvitedDaysShort } from "@/lib/event-days";
import { notify } from "@/lib/toast";

type Props = {
  onImported: (summary?: string) => void;
  headers: Record<string, string>;
  embedded?: boolean;
  onClose?: () => void;
};

type PreviewRow = GuestImportRow & { line: number };

export function GuestImportForm({ onImported, headers, embedded, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(embedded);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [parseErrors, setParseErrors] = useState<{ line: number; message: string }[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [eventDays, setEventDays] = useState<EventDayId[]>([DEFAULT_EVENT_DAY_ID]);
  const [invitationTimeRange, setInvitationTimeRange] = useState(
    DEFAULT_INVITATION_TIME_RANGE,
  );

  function downloadTemplate() {
    const blob = new Blob([GUEST_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-invites-golf2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|txt)$/i)) {
      notify.warning("Fichier .csv ou .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { rows, errors } = parseGuestCsv(text);
      setFileName(file.name);
      setParseErrors(errors);
      setPreview(
        rows.map((r, i) => ({
          ...r,
          line: i + 1,
        })),
      );
      if (rows.length === 0 && errors.length === 0) {
        notify.warning("Aucune ligne valide");
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function reset() {
    setPreview([]);
    setParseErrors([]);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/guests/import", {
        method: "POST",
        headers,
        body: JSON.stringify({
          eventDays,
          invitationTimeRange,
          guests: preview.map(({ fullName, email, phone }) => ({
            fullName: fullName?.trim() || null,
            email: email?.trim() || null,
            phone: phone?.trim() || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      const summary =
        data.failed > 0
          ? `${data.created} importés · ${data.failed} échecs`
          : `${data.created} importés`;
      reset();
      onImported(summary);
    } catch (err) {
      notify.error("Erreur");
    } finally {
      setImporting(false);
    }
  }

  const importBody = (
        <div className={`space-y-4 ${embedded ? "" : "mt-5 border-t border-vodacom-silver/20 pt-5"}`}>
          <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
            <p className="text-sm font-medium text-white">Jours d&apos;invitation pour cet import</p>
            <p className="mt-1 text-xs text-white/45">
              Appliqué à tous les invités du fichier — non lu depuis le CSV.
            </p>
            <div className="mt-3">
              <EventDayMultiSelect value={eventDays} onChange={setEventDays} />
            </div>
            <p className="mt-4 text-sm font-medium text-white">
              Horaire pour cet import
            </p>
            <p className="mt-1 text-xs text-white/45">
              Appliqué à tous les invités — variable horaire dans l&apos;email.
            </p>
            <input
              value={invitationTimeRange}
              onChange={(e) => setInvitationTimeRange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-[#2a2a2a] px-3 py-2 text-sm text-white outline-none focus:border-vodacom-red/50"
              placeholder={DEFAULT_INVITATION_TIME_RANGE}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#1f1f1f] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LucideIcon icon={Download} size={15} />
              Télécharger le modèle CSV
            </button>
          </div>

          <label className="block">
            <span className="sr-only">Fichier CSV</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.txt,text/csv"
              onChange={handleFile}
              className="block w-full text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-vodacom-red file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-vodacom-red-dark"
            />
          </label>

          <p className="text-xs text-white/45">
            Colonnes CSV : <code className="text-[11px]">nom_complet</code>,{" "}
            <code className="text-[11px]">email</code>,{" "}
            <code className="text-[11px]">telephone</code>. Virgule ou point-virgule.
          </p>

          {fileName && (
            <p className="text-sm text-white/70">
              Fichier : <strong>{fileName}</strong> — {preview.length} ligne(s) ·{" "}
              <strong>{formatInvitedDaysShort(eventDays)}</strong>
            </p>
          )}

          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-vodacom-red/30 bg-vodacom-red/10 px-3 py-2 text-sm text-white/90">
              <p className="font-medium">Lignes ignorées ({parseErrors.length})</p>
              <ul className="mt-1 list-inside list-disc text-xs">
                {parseErrors.slice(0, 5).map((e) => (
                  <li key={e.line}>
                    Ligne {e.line} : {e.message}
                  </li>
                ))}
                {parseErrors.length > 5 && (
                  <li>… et {parseErrors.length - 5} autre(s)</li>
                )}
              </ul>
            </div>
          )}

          {preview.length > 0 && (
            <div className="max-h-48 overflow-auto rounded-lg border border-white/10">
              <table className="w-full text-left text-xs text-white">
                <thead className="sticky top-0 bg-[#1f1f1f]">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-white/70">Nom complet</th>
                    <th className="px-3 py-2 font-semibold text-white/70">Email</th>
                    <th className="px-3 py-2 font-semibold text-white/70">Tél.</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 8).map((r) => (
                    <tr key={r.line} className="border-t border-white/10">
                      <td className="px-3 py-2">{r.fullName ?? "—"}</td>
                      <td className="px-3 py-2 text-white/55">{r.email ?? "—"}</td>
                      <td className="px-3 py-2 text-white/55">{r.phone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 8 && (
                <p className="border-t border-white/10 px-3 py-2 text-xs text-white/45">
                  + {preview.length - 8} autre(s)…
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {embedded && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10"
              >
                Fermer
              </button>
            )}
            {(preview.length > 0 || fileName) && !embedded && (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/10"
              >
                Réinitialiser
              </button>
            )}
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || preview.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-vodacom-red px-6 py-2.5 font-semibold text-white transition hover:bg-vodacom-red-dark disabled:opacity-50"
            >
              {importing ? (
                <LucideIcon icon={Loader2} size={18} className="animate-spin" />
              ) : (
                <LucideIcon icon={Upload} size={18} />
              )}
              {importing
                ? "Import en cours…"
                : `Importer ${preview.length} invité(s)`}
            </button>
          </div>
        </div>
  );

  if (embedded) {
    return (
      <>
        <p className="mb-4 text-sm text-white/55">
          Choisissez les jours d&apos;invitation, puis importez un CSV (prénom/nom facultatifs, email,
          téléphone). Les dates ne sont pas dans le fichier.
        </p>
        {importBody}
      </>
    );
  }

  return (
    <section className="rounded-2xl border border-vodacom-silver/30 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <LucideIcon icon={FileUp} size={22} className="mt-0.5 text-vodacom-red" />
          <div>
            <h2 className="text-lg font-bold text-vodacom-black">Importer des invités</h2>
            <p className="mt-1 text-sm text-vodacom-black/60">
              Jours choisis à l&apos;import · CSV : prénom, nom, email, téléphone
            </p>
          </div>
        </div>
        <LucideIcon
          icon={open ? ChevronUp : ChevronDown}
          size={20}
          className="text-vodacom-black/40"
        />
      </button>
      {open && importBody}
    </section>
  );
}
