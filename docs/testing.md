# Testing

This project has two complementary test suites: unit tests for services and controllers, and visual/interaction tests for every Storybook story.

---

## Unit Tests

Services and controllers are tested with [Vitest](https://vitest.dev/) in a Node environment.

### Run

```bash
npm test
```

### Location

Tests mirror the `src/` directory structure under `tests/`:

```
tests/
  services/
    GithubService.test.ts
  controllers/
    PageController.test.ts
```

### Approach

**Services** (`GithubService`)
- `fetch` is stubbed globally with `vi.stubGlobal`
- Each function is tested for the correct URL, `Authorization` header, and return value
- `getGithubUserData` is tested to confirm both calls are made concurrently

**Controllers** (`PageController`)
- `getServerSession`, `getGithubUserData`, and `next/navigation`'s `redirect` are mocked with `vi.mock`
- `redirect` is mocked to **throw** (`NEXT_REDIRECT:<url>`) which matches real Next.js behaviour — this ensures tests correctly model the control flow that stops execution after a redirect
- Each guard condition (no session, no `githubLogin`) is tested independently

### Adding Tests

Place new test files anywhere under `tests/` with a `.test.ts` extension. The vitest `unit` project picks them up automatically via the `tests/**/*.test.ts` glob.

---

## Storybook Visual Tests

Every component in the library has a Storybook story. The `@storybook/addon-vitest` plugin runs these stories as visual and interaction tests using Playwright/Chromium.

### Run via Storybook UI

```bash
npm run storybook
```

Open the **Tests** panel in the Storybook sidebar to run and inspect results.

### Run via CLI

```bash
npm run test:storybook
```

### Story Coverage

| Level | Stories |
|-------|---------|
| Atoms | `SectionHeading`, `AvatarImage`, `ExternalLink` |
| Molecules | `NavLink` |
| Organisms | `Header` (LoggedOut / LoggedIn / LoggedInWithGithub), `HeroSection`, `GithubProfile`, `GithubEventTable` |
| Templates | `PageTemplate` |
| Pages | `HomePage`, `GithubPage` |

### Adding Stories

Create a `ComponentName.stories.ts` (or `.tsx` if JSX is needed for `children`) anywhere under `src/`. The Storybook config picks up all files matching `src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.

Place stories in `src/stories/` and follow the existing `title` convention:

```
Components/Atoms/ComponentName
Components/Molecules/ComponentName
Components/Organisms/ComponentName
Components/Templates/ComponentName
Components/Pages/ComponentName
```
