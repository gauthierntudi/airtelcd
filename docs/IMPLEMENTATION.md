# Vodacom Privilège Golf 2026 — Suivi d'implémentation

Plateforme événementielle : invitation, expériences produit Vodacom RDC, jeux enfants.

**Stack cible :** Next.js (App Router), TypeScript, Tailwind CSS, Prisma + **Neon PostgreSQL** (Vercel).

---

## Vue d'ensemble

| Module | Statut | Priorité |
|--------|--------|----------|
| Invitation (admin → client RSVP) | 🟡 MVP fonctionnel | P0 |
| Expériences simulation Vodacom | ⚪ À faire | P1 |
| Jeux enfants (3 jeux) | ⚪ À faire | P2 |

**Légende :** ✅ Terminé · 🟡 En cours · ⚪ À faire · 🔴 Bloqué

---

## 1. Invitation

Référence contenu : [`invitation-brief.txt`](./invitation-brief.txt)

### 1.1 Admin — envoi & gestion

| Tâche | Statut | Notes |
|-------|--------|-------|
| Notifications UI | ✅ | [react-toastify](https://fkhadra.github.io/react-toastify/introduction/) via `notify` (`src/lib/toast.ts`) |
| Modèle données `Guest` | ✅ | Prisma + Neon : prénom, nom, email, token, RSVP |
| API CRUD invités | ✅ | `POST/GET /api/guests` (+ auth `x-admin-secret`) |
| Dashboard admin liste invités | ✅ | Recherche, filtres RSVP, édition, suppression, export CSV |
| Génération lien unique par invité | ✅ | `/api/confirm/action=[token]` — ex. `https://vodacomprivilege.com/api/confirm/action=aBcD1234` (`NEXT_PUBLIC_APP_URL`) |
| Template email invitation | ✅ | `public/tamplate-email/email_template.html` + rendu `src/lib/messaging/email-template.ts` (Brevo) |
| Import CSV invités | ✅ | Modèle CSV, prévisualisation, `POST /api/guests/import` |
| Téléphone E.164 + canaux envoi | ✅ | Email prioritaire, sinon WhatsApp (`libphonenumber-js`) |
| Envoi invitation email (Brevo) | ✅ | `POST /api/guests/[id]/send`, bulk `/api/guests/send` |
| Envoi invitation WhatsApp (Twilio) | ✅ | Si pas d'email, numéro E.164 |

### 1.2 Client — page invitation & confirmation

| Page `/api/confirm/action=[token]` | ✅ | Hero Cloudinary, programme, RSVP sticky, QR, calendrier, GPS |

| Tâche | Statut | Notes |
|-------|--------|-------|
| Page invitation personnalisée | ✅ | Prénom/nom invité, contenu brief |
| Sections : accroche, programme, CTA | ✅ | Agenda 08h–17h, lieu Kinshasa |
| RSVP « Je confirme ma présence » | ✅ | `PATCH /api/rsvp` + refus optionnel |
| Refus / peut-être (optionnel) | ⚪ | Si besoin métier |
| Ajout calendrier (.ics) | ✅ | Google Calendar + téléchargement `.ics` |
| Lien GPS / plan | ✅ | Bouton itinéraire Google Maps |
| QR code (lien invitation) | ✅ | Même QR que l’email (lien d’invitation) |
| Pied de page RGPD / contacts | ✅ | Email, téléphone brief |

### 1.3 Technique invitation

| Tâche | Statut | Notes |
|-------|--------|-------|
| Projet Next.js initialisé | ✅ | Next 15, App Router, Tailwind 4 |
| Base Neon PostgreSQL + migrations | ✅ | `DATABASE_URL` (pooled), `DIRECT_URL`, `npm run db:migrate` |
| Variables d'environnement | ✅ | `.env.example` — Neon, `ADMIN_SECRET`, Vercel |
| Auth admin minimale | ✅ | Cookie session + header API ; dev sans secret |

---

## 2. Expériences simulation Vodacom RDC

| Tâche | Statut | Notes |
|-------|--------|-------|
| Architecture routes `/experiences` | ⚪ | Hub + sous-expériences |
| Définition des parcours produit/service | ⚪ | À valider avec le client |
| UI brand Vodacom | ⚪ | Tokens couleur, typo |
| Analytics / complétion parcours | ⚪ | Optionnel |

---

## 3. Jeux enfants

| Jeu | Statut | Notes |
|-----|--------|-------|
| Coloriage interactif | ⚪ | Canvas / zones cliquables |
| Quiz éducatif | ⚪ | Questions, score, feedback |
| Jeu de mémoire | ⚪ | Paires de cartes, timer optionnel |
| Hub `/kids` | ⚪ | Navigation entre les 3 jeux |

---

## Structure du dépôt (cible)

```
GOLF2026/
├── docs/
│   ├── IMPLEMENTATION.md      ← ce fichier
│   └── invitation-brief.txt
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Accueil plateforme
│   │   ├── invite/[token]/page.tsx  # Invitation client
│   │   ├── admin/page.tsx           # Gestion invités
│   │   └── api/
│   │       ├── guests/
│   │       └── rsvp/
│   ├── components/invitation/
│   └── lib/
└── package.json
```

---

## Journal des sessions

| Date | Travail effectué |
|------|------------------|
| 2026-06-04 | Suivi MD, Next.js 15, Prisma/Neon PostgreSQL, admin, invitation, API guests + RSVP |

---

## Prochaines étapes immédiates

1. Tester localement : `npm run dev` → `/admin` → créer invité → ouvrir lien → confirmer RSVP.
2. Assets branding (logo Vodacom, visuel golf) et `.ics` calendrier + QR code.
3. Envoi email invités (Resend) si souhaité.
4. Module expériences Vodacom ou jeux enfants.
