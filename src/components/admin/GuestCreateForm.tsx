"use client";

import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { modalInputClass } from "@/components/admin/AdminModal";
import {
  DEFAULT_EVENT_DAY_ID,
  EventDayMultiSelect,
} from "@/components/admin/EventDayMultiSelect";
import type { EventDayId } from "@/lib/event-days";
import {
  DEFAULT_INVITATION_TIME_RANGE,
  invitationTimeRangeForEventDays,
} from "@/lib/invitation-time-range";
import { AdminPhoneInput } from "@/components/admin/AdminPhoneInput";
import { notify } from "@/lib/toast";

type Props = {
  onCreated: () => void;
  headers: Record<string, string>;
  /** Contenu pour modal (sans carte pleine page) */
  embedded?: boolean;
  onClose?: () => void;
};

export function GuestCreateForm({ onCreated, headers, embedded, onClose }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDays, setEventDays] = useState<EventDayId[]>([DEFAULT_EVENT_DAY_ID]);
  const [invitationTimeRange, setInvitationTimeRange] = useState(() =>
    invitationTimeRangeForEventDays([DEFAULT_EVENT_DAY_ID]),
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setInvitationTimeRange(invitationTimeRangeForEventDays(eventDays));
  }, [eventDays]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers,
        body: JSON.stringify({
          fullName: fullName.trim() || null,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          eventDays,
          invitationTimeRange,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Impossible de créer l'invité");
      }

      try {
        await navigator.clipboard.writeText(data.invitationUrl);
        if (!embedded) notify.success("Invité créé — lien copié");
      } catch {
        if (!embedded) {
          notify.success("Invité créé (copie du lien indisponible sur ce navigateur)");
        }
      }

      setFullName("");
      setEmail("");
      setPhone("");
      setEventDays([DEFAULT_EVENT_DAY_ID]);
      setInvitationTimeRange(invitationTimeRangeForEventDays([DEFAULT_EVENT_DAY_ID]));
      onCreated();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Nom complet" id="fullName" hint="facultatif">
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={embedded ? modalInputClass : inputClass}
          placeholder="Jean Dupont (optionnel)"
          autoComplete="name"
        />
      </Field>
      <Field label="Email" id="email" hint="Optionnel">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
              className={embedded ? modalInputClass : inputClass}
          placeholder="jean.dupont@exemple.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Téléphone" id="phone" hint="WhatsApp si pas d’email">
        <AdminPhoneInput
          id="phone"
          value={phone}
          onChange={setPhone}
          inputClass={embedded ? modalInputClass : inputClass}
        />
      </Field>
      <Field label="Jours d'invitation *" id="eventDays" hint="1 à 3 jours">
        <EventDayMultiSelect value={eventDays} onChange={setEventDays} />
      </Field>
      <Field
        label="Horaire d'invitation"
        id="invitationTimeRange"
        hint="email & page invité"
      >
        <input
          id="invitationTimeRange"
          value={invitationTimeRange}
          onChange={(e) => setInvitationTimeRange(e.target.value)}
          className={embedded ? modalInputClass : inputClass}
          placeholder={DEFAULT_INVITATION_TIME_RANGE}
        />
      </Field>
      <div className={`flex gap-2 ${embedded ? "justify-end pt-2" : ""}`}>
        {embedded && onClose && (
          <button
            type="button"
            onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-vodacom-red px-6 py-2.5 font-semibold text-white transition hover:bg-vodacom-red-dark disabled:opacity-60"
        >
          <LucideIcon icon={UserPlus} size={18} />
          {creating ? "Création…" : "Créer l'invité"}
        </button>
      </div>
    </form>
  );

  if (embedded) {
    return (
      <>
        <p className="mb-4 text-sm text-white/55">
          Le nom complet est facultatif — l&apos;invité le saisira à la
          confirmation si besoin. Le lien unique est généré à la création.
        </p>
        {form}
      </>
    );
  }

  return (
    <section className="rounded-2xl border border-vodacom-silver/30 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-vodacom-black">Nouvel invité</h2>
      <p className="mt-1 text-sm text-vodacom-black/60">
        Nom complet facultatif — demandé à la confirmation si absent.
      </p>
      <div className="mt-5">{form}</div>
    </section>
  );
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-white">{label}</span>
      {hint && <span className="ml-1 text-xs text-white/45">({hint})</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-vodacom-silver/50 bg-vodacom-cream/30 px-3 py-2.5 text-vodacom-black outline-none transition focus:border-vodacom-red/50 focus:ring-2 focus:ring-vodacom-red/10";
