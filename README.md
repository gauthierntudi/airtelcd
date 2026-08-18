# Airtel RSVP

Plateforme Next.js pour l'événement : invitations, expériences Vodacom RDC, jeux enfants.

**Base de données :** PostgreSQL (Docker) + Prisma. Neon reste possible hors Docker / sur Vercel.

## Démarrage (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Accueil : http://localhost:3000
- Admin : http://localhost:3000/admin
- Postgres : `localhost:5432` (user/password/db : `golf` / `golf` / `airteldb`)

Les migrations Prisma s’appliquent au démarrage du conteneur `app`. Hot reload : le code de l’hôte est monté dans le conteneur.

```bash
docker compose down          # arrêter
docker compose down -v       # arrêter + supprimer les volumes (données Postgres)
docker compose -f docker-compose.prod.yml up --build -d   # image standalone
```

## Configuration Neon (sans Docker)

1. Créer un projet sur [console.neon.tech](https://console.neon.tech).
2. Dans **Connect**, copier :
   - **Pooled connection** → `DATABASE_URL` (hostname avec `-pooler`)
   - **Direct connection** → `DIRECT_URL` (sans `-pooler`, pour les migrations)
3. Coller les valeurs dans `.env` (voir `.env.example`).

```bash
cp .env.example .env
# Éditer .env avec vos URLs Neon + ADMIN_SECRET
```

## Icônes UI

[Lucide](https://lucide.dev) via `lucide-react` — import tree-shakable par icône.

## Assets (logo & icônes)

Fichiers servis depuis `public/img/` :

| Fichier | Usage |
|---------|--------|
| `logo-white.png` | Fond sombre (header, admin) |
| `logo-black.png` | Fond clair (login, pages claires) |
| `logo-light.png` | Variante claire |
| `icon.png` | Icône PWA / Apple (`src/app/icon.png`) |
| `favicon.png` | Favicon navigateur |

Le dossier racine `img/` peut servir de source ; les fichiers actifs sont dans `public/img/`.

## Démarrage (sans Docker)

```bash
npm install
npm run db:migrate
npm run dev
```

- Accueil : http://localhost:3000
- Admin : http://localhost:3000/admin
- Invitation : http://localhost:3000/api/confirm/action=aBcD1234 (ajuster `NEXT_PUBLIC_APP_URL`)

En développement, l'admin est accessible sans secret si `ADMIN_SECRET` vaut encore la valeur par défaut. En production (Vercel), définir `ADMIN_SECRET` dans les variables d'environnement.

## Envoi des invitations (Brevo + Twilio)

| Canal | Priorité | Variables `.env` |
|-------|----------|------------------|
| **Email** | Si l'invité a un email | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` |
| **WhatsApp** | Sinon, si téléphone E.164 | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` |

### Brevo

1. [app.brevo.com](https://app.brevo.com) → **SMTP & API** → créer une clé API.
2. **Senders** → vérifier l'adresse expéditrice (`BREVO_SENDER_EMAIL`).

### Twilio WhatsApp

1. [console.twilio.com](https://console.twilio.com) → Account SID + Auth Token.
2. **Messaging** → WhatsApp Sandbox (dev) ou numéro Business (prod).
3. `TWILIO_WHATSAPP_FROM` = ex. `whatsapp:+14155238886` (sandbox US).
4. Le destinataire doit avoir rejoint le sandbox (code `join …`) en dev.

Dans l'admin : bouton **Envoyer** par invité, ou **Envoyer (N)** pour la liste filtrée.

## Déploiement Vercel

Variables d'environnement à configurer :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL **pooled** Neon |
| `DIRECT_URL` | URL **directe** Neon (migrations au build) |
| `ADMIN_SECRET` | Secret accès admin |
| `NEXT_PUBLIC_APP_URL` | URL publique (liens d'invitation) |
| `BREVO_*` | Envoi email |
| `TWILIO_*` | Envoi WhatsApp |

Le script `npm run build` exécute `prisma migrate deploy` avant le build Next.js.

## Suivi d'implémentation

Voir [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run docker:dev` | Stack Docker (Postgres + Next, hot reload) |
| `npm run docker:prod` | Stack Docker production (détachée) |
| `npm run docker:down` | Arrêter Compose |
| `npm run dev` | Serveur de développement (hôte) |
| `npm run build` | Migrations + build production |
| `npm run db:migrate` | Appliquer migrations (prod / CI) |
| `npm run db:migrate:dev` | Créer/appliquer migrations en dev |
| `npm run db:studio` | Prisma Studio |
