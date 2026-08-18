import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Mail,
  MessageCircle,
  MinusCircle,
  Smartphone,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LucideIcon } from "@/components/ui/lucide-icon";
import type { SystemMessagingReport } from "@/lib/messaging/config";

type Props = {
  report: SystemMessagingReport;
};

const OVERALL_CONFIG = {
  ok: {
    label: "Opérationnel",
    description: "Email (Brevo) et WhatsApp (Twilio) sont configurés.",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  partial: {
    label: "Envoi partiel",
    description: "Un seul canal est actif. L'autre reste indisponible jusqu'à configuration du .env.",
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  offline: {
    label: "Envoi désactivé",
    description: "Aucun fournisseur configuré — les invitations ne peuvent pas être envoyées.",
    icon: XCircle,
    className: "border-vodacom-red/40 bg-vodacom-red/15 text-vodacom-red",
  },
} as const;

export function AdminSystemStatus({ report }: Props) {
  const overall = OVERALL_CONFIG[report.overall];

  return (
    <AdminLayout
      title="Statut système"
      subtitle="État des services d'envoi d'invitations (Brevo & Twilio)"
    >
      <div
        className={`mb-6 flex gap-4 rounded-2xl border px-5 py-4 ${overall.className}`}
        role="status"
      >
        <LucideIcon icon={overall.icon} size={28} className="shrink-0" />
        <div>
          <p className="text-lg font-bold text-zinc-900">{overall.label}</p>
          <p className="mt-1 text-sm text-zinc-600">{overall.description}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ProviderCard
          title="Email — Brevo"
          icon={Mail}
          configured={report.brevo.configured}
          checks={report.brevo.checks}
          extras={
            report.brevo.configured ? (
              <>
                <ExtraRow label="Expéditeur" value={report.brevo.senderEmail ?? "—"} />
                <ExtraRow label="Nom affiché" value={report.brevo.senderName} />
              </>
            ) : undefined
          }
        />
        <ProviderCard
          title="WhatsApp — Twilio"
          icon={MessageCircle}
          configured={report.twilioWhatsapp.configured}
          checks={report.twilioWhatsapp.checks}
          extras={
            report.twilioWhatsapp.configured && report.twilioWhatsapp.from ? (
              <ExtraRow label="Numéro from" value={report.twilioWhatsapp.from} mono />
            ) : undefined
          }
        />
        <ProviderCard
          title={
            report.twilioVerify.configured
              ? "OTP SMS — Twilio Verify"
              : "SMS — Twilio (OTP legacy)"
          }
          icon={Smartphone}
          configured={
            report.twilioVerify.configured || report.twilioSms.configured
          }
          checks={
            report.twilioVerify.configured
              ? report.twilioVerify.checks
              : report.twilioSms.checks
          }
          extras={
            report.twilioVerify.configured ? (
              <ExtraRow
                label="Service SID"
                value={report.twilioVerify.serviceSid ?? "—"}
                mono
              />
            ) : report.twilioSms.configured && report.twilioSms.from ? (
              <ExtraRow label="Numéro from" value={report.twilioSms.from} mono />
            ) : undefined
          }
        />
      </div>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <LucideIcon icon={Globe} size={18} className="text-zinc-500" />
          <h2 className="text-base font-bold text-zinc-900">Application</h2>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              NEXT_PUBLIC_APP_URL
            </dt>
            <dd className="mt-1 font-mono text-sm text-zinc-600">
              {report.appUrl ?? (
                <span className="text-vodacom-red">Non défini — liens d&apos;invitation incorrects</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Règle d&apos;envoi
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-zinc-500">{report.sendPriority}</dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-center text-xs text-zinc-400">
        Les secrets (clés API, tokens) ne sont jamais affichés — seule leur présence dans{" "}
        <code className="rounded bg-zinc-100 px-1">.env</code> est contrôlée.
      </p>
    </AdminLayout>
  );
}

function ProviderCard({
  title,
  icon,
  configured,
  checks,
  extras,
}: {
  title: string;
  icon: typeof Mail;
  configured: boolean;
  checks: SystemMessagingReport["brevo"]["checks"];
  extras?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              configured ? "bg-vodacom-red/20 text-vodacom-red" : "bg-zinc-100 text-zinc-400"
            }`}
          >
            <LucideIcon icon={icon} size={20} />
          </span>
          <h2 className="text-base font-bold text-zinc-900">{title}</h2>
        </div>
        <StatusPill ok={configured} />
      </div>

      <ul className="space-y-2">
        {checks.map((c) => (
          <li
            key={c.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm text-zinc-700">{c.label}</p>
              <p className="font-mono text-[10px] text-zinc-400">{c.name}</p>
            </div>
            <VarStatus ok={c.configured} />
          </li>
        ))}
      </ul>

      {extras && <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">{extras}</div>}
    </article>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
      }`}
    >
      {ok ? "Actif" : "Inactif"}
    </span>
  );
}

function VarStatus({ ok }: { ok: boolean }) {
  return ok ? (
    <LucideIcon icon={CheckCircle2} size={18} className="shrink-0 text-emerald-600" />
  ) : (
    <LucideIcon icon={MinusCircle} size={18} className="shrink-0 text-zinc-300" />
  );
}

function ExtraRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-0.5 text-sm text-zinc-600 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
