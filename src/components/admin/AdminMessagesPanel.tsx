"use client";

import { Loader2, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { LucideIcon } from "@/components/ui/lucide-icon";
import {
  ADMIN_WHATSAPP_DAYS,
  ADMIN_WHATSAPP_TEMPLATES,
  type AdminWhatsAppDayId,
} from "@/lib/messaging/admin-whatsapp-templates";
import type { AdminWhatsAppRecipientsSummary } from "@/lib/messaging/send-admin-whatsapp";
import { formatInvitationDateTime } from "@/lib/format-invitation-date";
import { notify } from "@/lib/toast";

type IndividualSendConfirm = {
  guestId: string;
  displayName: string;
  phone: string;
};

type Props = {
  adminSecret: string;
  refreshKey: number;
  onLoadingChange: (loading: boolean) => void;
};

export function AdminMessagesPanel({
  adminSecret,
  refreshKey,
  onLoadingChange,
}: Props) {
  const [day, setDay] = useState<AdminWhatsAppDayId>(1);
  const [templateId, setTemplateId] = useState("1");
  const [summary, setSummary] = useState<AdminWhatsAppRecipientsSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);
  const [individualConfirm, setIndividualConfirm] =
    useState<IndividualSendConfirm | null>(null);

  const templates = ADMIN_WHATSAPP_TEMPLATES[day];
  const selectedTemplate = templates.find((t) => t.id === templateId);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-secret": adminSecret,
    }),
    [adminSecret],
  );

  const loadRecipients = useCallback(async () => {
    setLoading(true);
    onLoadingChange(true);
    try {
      const res = await fetch(`/api/admin/messages?day=${day}`, {
        headers: { "x-admin-secret": adminSecret },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setSummary(data as AdminWhatsAppRecipientsSummary);
    } catch (e) {
      setSummary(null);
      notify.error(e instanceof Error ? e.message : "Impossible de charger");
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }, [adminSecret, day, onLoadingChange]);

  useEffect(() => {
    void loadRecipients();
  }, [loadRecipients, refreshKey]);

  useEffect(() => {
    if (!templates.some((t) => t.id === templateId)) {
      setTemplateId(templates[0]?.id ?? "1");
    }
  }, [day, templateId, templates]);

  function reportSendResult(data: {
    sent?: { displayName: string }[];
    failed?: unknown[];
    skipped?: { reason: string }[];
  }) {
    const sent = data.sent?.length ?? 0;
    const failed = data.failed?.length ?? 0;
    const skipped = data.skipped?.length ?? 0;

    if (sent > 0) {
      const name = data.sent?.[0]?.displayName;
      notify.success(
        sent === 1 && name
          ? `Message envoyé à ${name}`
          : `${sent} message(s) WhatsApp envoyé(s)`,
      );
    }
    if (failed > 0) {
      notify.warning(`${failed} échec(s) d'envoi`);
    }
    if (skipped > 0 && sent === 0 && failed === 0) {
      notify.error(data.skipped?.[0]?.reason ?? "Envoi impossible");
    }
  }

  async function postMessage(body: { day: number; templateId: string; guestId?: string }) {
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erreur");
    return data;
  }

  async function handleSend() {
    if (!summary || summary.withPhone === 0) {
      notify.error("Aucun invité éligible pour cet envoi");
      return;
    }

    const dayLabel = ADMIN_WHATSAPP_DAYS.find((d) => d.id === day)?.label;
    const templateLabel = selectedTemplate?.label ?? templateId;
    const ok = window.confirm(
      `Envoyer « ${templateLabel} » (${dayLabel}) à ${summary.withPhone} invité(s) ayant fait leur check-in ce jour ?`,
    );
    if (!ok) return;

    setSending(true);
    try {
      const data = await postMessage({ day, templateId });
      reportSendResult(data);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  }

  async function confirmIndividualSend() {
    if (!individualConfirm) return;

    const { guestId } = individualConfirm;
    setSendingGuestId(guestId);
    try {
      const data = await postMessage({ day, templateId, guestId });
      reportSendResult(data);
      setIndividualConfirm(null);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Erreur d'envoi");
    } finally {
      setSendingGuestId(null);
    }
  }

  const dayLabel =
    ADMIN_WHATSAPP_DAYS.find((d) => d.id === day)?.label ?? `Jour ${day}`;
  const templateLabel = selectedTemplate?.label ?? `Template ${templateId}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <AdminPanel
        title="Envoi WhatsApp"
        description="Messages génériques sans variables — invités check-in du jour sélectionné"
        badge="Twilio"
      >
        <div className="space-y-6">
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Jour de l&apos;événement
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {ADMIN_WHATSAPP_DAYS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDay(d.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    day === d.id
                      ? "bg-vodacom-red text-white shadow-lg shadow-vodacom-red/25"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Template
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    templateId === t.id
                      ? "border-vodacom-red/50 bg-vodacom-red/10 text-zinc-900"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <p className="font-semibold">{t.label}</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-zinc-400">
                    {t.contentSid}
                  </p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <LucideIcon icon={Loader2} size={18} className="animate-spin" />
                Calcul des destinataires…
              </div>
            ) : summary ? (
              <div className="space-y-2 text-sm text-zinc-600">
                <p>
                  <span className="font-bold text-zinc-900">{summary.withPhone}</span>{" "}
                  invité(s) avec check-in le {summary.dayLabel.toLowerCase()} et
                  numéro WhatsApp
                </p>
                <p className="text-zinc-500">
                  {summary.totalCheckedIn} check-in(s) au total ce jour
                  {summary.totalCheckedIn > summary.withPhone
                    ? ` — ${summary.totalCheckedIn - summary.withPhone} sans mobile`
                    : ""}
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Aucune donnée</p>
            )}
          </div>

          <button
            type="button"
            disabled={
              loading ||
              sending ||
              sendingGuestId !== null ||
              !summary ||
              summary.withPhone === 0
            }
            onClick={() => void handleSend()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-vodacom-red py-3.5 font-bold text-white transition hover:bg-vodacom-red-dark disabled:opacity-50"
          >
            {sending ? (
              <LucideIcon icon={Loader2} size={20} className="animate-spin" />
            ) : (
              <LucideIcon icon={Send} size={20} />
            )}
            {sending
              ? "Envoi en cours…"
              : `Envoyer à ${summary?.withPhone ?? 0} invité(s)`}
          </button>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Destinataires"
        description="Invités ayant validé leur check-in pour le jour choisi"
        badge={summary ? String(summary.withPhone) : "—"}
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <LucideIcon icon={Loader2} size={32} className="animate-spin text-zinc-400" />
          </div>
        ) : !summary || summary.recipients.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <LucideIcon icon={MessageCircle} size={40} className="text-zinc-300" />
            <p className="text-sm text-zinc-500">
              Aucun invité check-in avec mobile pour ce jour
            </p>
          </div>
        ) : (
          <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {summary.recipients.map((guest) => {
              const isSending = sendingGuestId === guest.id;

              return (
                <li
                  key={guest.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">
                      {guest.displayName}
                    </p>
                    <p className="truncate font-mono text-xs text-zinc-500">
                      {guest.phone}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {formatInvitationDateTime(guest.checkedInAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={sending || isSending || individualConfirm !== null}
                    onClick={() =>
                      setIndividualConfirm({
                        guestId: guest.id,
                        displayName: guest.displayName,
                        phone: guest.phone,
                      })
                    }
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-vodacom-red/40 bg-vodacom-red/15 px-3 py-2 text-xs font-bold text-vodacom-red transition hover:bg-vodacom-red/25 disabled:opacity-50"
                    title={`Envoyer ${selectedTemplate?.label ?? "le template"}`}
                  >
                    {isSending ? (
                      <LucideIcon icon={Loader2} size={14} className="animate-spin" />
                    ) : (
                      <LucideIcon icon={Send} size={14} />
                    )}
                    Envoyer
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>

      {individualConfirm ? (
        <ConfirmDialog
          title="Envoyer le message WhatsApp"
          message={
            <div className="space-y-4">
              <p>
                Envoyer <strong>{templateLabel}</strong> à{" "}
                <strong>{individualConfirm.displayName}</strong> ?
              </p>
              <dl className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Jour</dt>
                  <dd className="text-right font-medium text-zinc-900">{dayLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Mobile</dt>
                  <dd className="font-mono text-right text-zinc-700">
                    {individualConfirm.phone}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Template</dt>
                  <dd className="text-right font-medium text-zinc-900">
                    {templateLabel}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-zinc-500">
                Message générique sans variables — envoyé via Twilio WhatsApp.
              </p>
            </div>
          }
          confirmLabel="Envoyer"
          loading={sendingGuestId === individualConfirm.guestId}
          onClose={() => {
            if (sendingGuestId !== individualConfirm.guestId) {
              setIndividualConfirm(null);
            }
          }}
          onConfirm={() => void confirmIndividualSend()}
        />
      ) : null}
    </div>
  );
}
