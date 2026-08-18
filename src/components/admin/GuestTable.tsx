"use client";

import { RsvpStatus } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GuestRowActions } from "@/components/admin/GuestRowActions";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { guestInitials } from "@/lib/event";
import { type GuestRow, RSVP_CONFIG } from "@/lib/guest-types";
import {
  GUEST_PAGE_SIZES,
  type GuestSortKey,
  type SortDir,
  sortGuests,
} from "@/lib/guest-table-utils";
import type { MessagingStatus } from "@/lib/messaging/config";
import {
  canSendGuestWithOptions,
  getGuestSendBlockReason,
  type SendInvitationOptions,
} from "@/lib/messaging/send-options";

type Props = {
  rows: GuestRow[];
  selectedIds: ReadonlySet<string>;
  messagingStatus: MessagingStatus;
  sendOptions: SendInvitationOptions;
  copiedId: string | null;
  sendingId: string | null;
  bulkSending: boolean;
  bulkDeleting: boolean;
  onToggleGuestSelected: (id: string, checked: boolean) => void;
  onTogglePageSelected: (pageIds: string[], checked: boolean) => void;
  onSend: (g: GuestRow) => void;
  onCopy: (url: string, id: string) => void;
  onDetails: (g: GuestRow) => void;
  onEdit: (g: GuestRow) => void;
  onDelete: (g: GuestRow) => void;
};

export function GuestTable({
  rows,
  selectedIds,
  messagingStatus,
  sendOptions,
  copiedId,
  sendingId,
  bulkSending,
  bulkDeleting,
  onToggleGuestSelected,
  onTogglePageSelected,
  onSend,
  onCopy,
  onDetails,
  onEdit,
  onDelete,
}: Props) {
  const [sortKey, setSortKey] = useState<GuestSortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const sorted = useMemo(
    () => sortGuests(rows, sortKey, sortDir),
    [rows, sortKey, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paginated = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, totalPages]);

  const pageIds = useMemo(() => paginated.map((g) => g.id), [paginated]);
  const pageSelectedCount = pageIds.filter((id) => selectedIds.has(id)).length;
  const allPageSelected =
    pageIds.length > 0 && pageSelectedCount === pageIds.length;
  const somePageSelected =
    pageSelectedCount > 0 && pageSelectedCount < pageIds.length;
  const rowBusy = bulkSending || bulkDeleting;

  function toggleSort(key: GuestSortKey) {
    setPage(1);
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-white">
              <th className="w-12 pl-4 pr-0">
                <PageSelectCheckbox
                  checked={allPageSelected}
                  indeterminate={somePageSelected}
                  disabled={rowBusy || pageIds.length === 0}
                  onChange={(checked) => onTogglePageSelected(pageIds, checked)}
                  label="Sélectionner la page"
                />
              </th>
              <SortHeader
                label="Invité"
                sortKey="name"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="min-w-[200px] pl-2"
              />
              <SortHeader
                label="RSVP"
                sortKey="rsvp"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="w-[120px]"
              />
              <SortHeader
                label="Invitation"
                sortKey="invitation"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden w-[120px] md:table-cell"
              />
              <SortHeader
                label="Confirmé le"
                sortKey="confirmed"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden lg:table-cell"
              />
              <SortHeader
                label="Ajouté le"
                sortKey="created"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden xl:table-cell"
              />
              <th className="w-[232px] pr-4 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginated.map((g) => {
              const isSelected = selectedIds.has(g.id);
              return (
              <tr
                key={g.id}
                className={`group transition-colors hover:bg-zinc-50 ${
                  isSelected ? "bg-vodacom-red/[0.07]" : "bg-white"
                }`}
              >
                <td className="py-4 pl-4 pr-0">
                  <RowSelectCheckbox
                    checked={isSelected}
                    disabled={rowBusy}
                    onChange={(checked) => onToggleGuestSelected(g.id, checked)}
                    label={`Sélectionner ${g.displayName}`}
                  />
                </td>
                <td className="py-4 pl-2 pr-4">
                  <GuestIdentity guest={g} />
                </td>
                <td className="py-4 pr-4">
                  <StatusBadge status={g.rsvpStatus} />
                </td>
                <td className="hidden py-4 pr-4 md:table-cell">
                  <InvitationCell guest={g} />
                </td>
                <td className="hidden py-4 pr-4 lg:table-cell">
                  <DateCell value={g.confirmedAt} emptyLabel="—" />
                </td>
                <td className="hidden py-4 pr-4 xl:table-cell">
                  <DateCell value={g.createdAt} />
                </td>
                <td className="py-4 pr-4">
                  <GuestRowActions
                    guest={g}
                    messagingStatus={messagingStatus}
                    sendOptions={sendOptions}
                    copied={copiedId === g.id}
                    sending={sendingId === g.id}
                    busy={rowBusy || (sendingId !== null && sendingId !== g.id)}
                    onSend={() => onSend(g)}
                    onCopy={() => onCopy(g.invitationUrl, g.id)}
                    onDetails={() => onDetails(g)}
                    onEdit={() => onEdit(g)}
                    onDelete={() => onDelete(g)}
                  />
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <TableFooter
        total={sorted.length}
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}

function PageSelectCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="h-4 w-4 rounded border-zinc-300 bg-white text-vodacom-red focus:ring-vodacom-red/30 disabled:opacity-40"
    />
  );
}

function RowSelectCheckbox({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="h-4 w-4 rounded border-zinc-300 bg-white text-vodacom-red focus:ring-vodacom-red/30 disabled:opacity-40"
    />
  );
}

function GuestIdentity({ guest }: { guest: GuestRow }) {
  const initials = guestInitials(guest.fullName);

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-900 ring-1 ring-zinc-200"
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-900">{guest.displayName}</p>
        <p className="mt-0.5 font-mono text-[11px] tracking-wide text-zinc-400">
          {guest.token}
        </p>
      </div>
    </div>
  );
}

function InvitationCell({ guest }: { guest: GuestRow }) {
  if (!guest.invitationSentAt) {
    return (
      <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-400">
        Non envoyée
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-vodacom-red/15 px-2 py-1 text-[11px] font-semibold text-vodacom-red ring-1 ring-vodacom-red/25">
      <LucideIcon icon={Send} size={11} />
      Envoyée
    </span>
  );
}

function DateCell({ value, emptyLabel = "—" }: { value: string | null; emptyLabel?: string }) {
  if (!value) {
    return <span className="text-xs text-zinc-300">{emptyLabel}</span>;
  }
  const d = new Date(value);
  const short = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <p className="text-xs font-medium text-zinc-600">{short}</p>
      <p className="text-[11px] text-zinc-400">{time}</p>
    </div>
  );
}

function TableFooter({
  total,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: {
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4 border-t border-zinc-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        {total === 0 ? (
          "Aucun invité"
        ) : (
          <>
            Affichage <span className="font-medium text-zinc-600">{from}–{to}</span> sur{" "}
            <span className="font-medium text-zinc-600">{total}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          Lignes
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-900 outline-none focus:border-vodacom-red/40"
          >
            {GUEST_PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <PaginationBtn onClick={onPrev} disabled={page <= 1} label="Page précédente">
            <LucideIcon icon={ChevronLeft} size={16} />
          </PaginationBtn>
          <span className="min-w-[4.5rem] px-2 text-center text-xs font-medium tabular-nums text-zinc-600">
            {page} / {totalPages}
          </span>
          <PaginationBtn onClick={onNext} disabled={page >= totalPages} label="Page suivante">
            <LucideIcon icon={ChevronRight} size={16} />
          </PaginationBtn>
        </div>
      </div>
    </div>
  );
}

function PaginationBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: GuestSortKey;
  active: GuestSortKey;
  dir: SortDir;
  onSort: (k: GuestSortKey) => void;
  className?: string;
}) {
  const isActive = active === sortKey;
  const Icon = !isActive ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={`px-4 py-3.5 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
          isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
        }`}
      >
        {label}
        <LucideIcon
          icon={Icon}
          size={12}
          className={isActive ? "text-vodacom-red" : "text-zinc-400"}
        />
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: RsvpStatus }) {
  const cfg = RSVP_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
