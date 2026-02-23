# Architecture

## Overview

This project follows a layered architecture that separates concerns across Next.js route handlers, a component library, services, controllers, and data models.

## Layer Map

```
src/app/              — Next.js route entry points (thin wrappers only)
src/controllers/      — Auth guards, session checks, data assembly
src/services/         — External integrations (auth, GitHub API)
src/lib/models/       — Shared TypeScript interfaces and domain types
src/lib/components/   — Component library (Atomic Design hierarchy)
```

---

## src/app/

Thin Next.js route entry points only. Each `page.tsx` calls a controller to retrieve data and renders the corresponding page component. `layout.tsx` applies the shared `Header` to every route.

No UI logic lives here — it belongs in `src/lib/`.

---

## src/controllers/

Coordinate auth guards and data assembly. Controllers are server-side only and delegate all external calls to services.

| File | Exports |
|------|---------|
| `PageController.ts` | `getPublicPageProps`, `getPrivatePageProps`, `getGithubPageProps` |
| `ApiController.ts` | `baseHandler`, `authHandler` |

---

## src/services/

Own all external integration logic. Services receive plain arguments (no session objects), making them independently testable.

| File | Responsibility |
|------|----------------|
| `AuthService.ts` | NextAuth configuration, session retrieval |
| `GithubService.ts` | GitHub REST API — user profile and events |

---

## src/lib/models/

Shared TypeScript interfaces for page props and domain types, plus NextAuth session type extensions.

| File | Exports |
|------|---------|
| `pageProps.ts` | `PublicPageProps`, `PrivatePageProps`, `GithubPageProps`, `GithubEvent` |
| `next-auth.d.ts` | Extended `Session` interface (`githubLogin`, `auth`) |

---

## src/lib/components/

Organised using [Atomic Design](https://atomicdesign.bradfrost.com/). Dependencies flow strictly downward — pages use templates and organisms; organisms use molecules and atoms; molecules use atoms.

### Atoms
Smallest indivisible UI elements with no dependencies on other local components.

| Component | Description |
|-----------|-------------|
| `AvatarImage` | Circular `next/image` wrapper with configurable size |
| `ExternalLink` | Underlined anchor with `target="_blank"` and `rel="noopener noreferrer"` |
| `SectionHeading` | Styled `<h3>` used consistently across content sections |

### Molecules
Simple combinations of atoms that work together as a unit.

| Component | Description |
|-----------|-------------|
| `NavLink` | Navigation anchor with consistent padding, used in the header bar |

### Organisms
Complex, self-contained UI sections composed from atoms and molecules.

| Component | Description |
|-----------|-------------|
| `Header` | Fixed top bar with session-aware user info and navigation |
| `HeroSection` | Logo, welcome heading, and tagline for the home page |
| `GithubProfile` | User profile card (name, location, profile link) |
| `GithubEventTable` | Scrollable table of recent GitHub events |

### Templates
Page-level layout wrappers that provide structure and accept content as children.

| Component | Description |
|-----------|-------------|
| `PageTemplate` | Centred `<main>` container used by all page components |

### Pages
Full page compositions that wire a template together with the appropriate organisms.

| Component | Description |
|-----------|-------------|
| `HomePage` | `PageTemplate` + `HeroSection` |
| `GithubPage` | `PageTemplate` + `GithubProfile` + `GithubEventTable` |

---

## Data Flow

```
HTTP Request
  └─ src/app/[route]/page.tsx       route entry point
       └─ src/controllers/          auth guard + data assembly
            └─ src/services/        external API calls
  └─ src/lib/components/pages/      page component renders
       └─ src/lib/components/...    atom → molecule → organism → template tree
```
