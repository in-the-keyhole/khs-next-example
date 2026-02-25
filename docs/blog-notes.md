# UI Development with Storybook and React — Article Outline
by Bob Palmer

Previous article: https://keyholesoftware.com/implementing-github-oauth-with-nextauthjs/
Companion repo: https://github.com/in-the-keyhole/khs-next-example

---

## 1. Introduction

- Recap the previous article: GitHub OAuth with NextAuth.js in Next.js
- Problem: UI is tightly coupled to auth/data — hard to iterate on components in isolation
- Solution: Storybook lets you develop, document, and test UI components without a running back end
- What the article covers: refactor → organize → install → style → stories → test
- Stack: Next.js 15, Tailwind CSS v3, NextAuth.js v4, **Storybook 10** (`@storybook/nextjs-vite`), Vitest 4

**References:**
- [Storybook — What is it?](https://storybook.js.org/docs/get-started/why-storybook)
- [Storybook for Next.js with Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)

---

## 2. Preparing Your React Project — Component Isolation

**Key principle:** Components that call services, read from context, or use hooks with external dependencies cannot render in Storybook without mocking infrastructure. Prefer props.

- Before: `Header` calls `useSession()` directly → requires `SessionProvider` to be in the tree
- After: `Header` accepts `session: Session | null` as a prop → `SessionProvider` is initialized with that value → `useSession()` still works internally, no mocking needed
- Pattern: push external state to props at the organism/page boundary; internal sub-components can still use hooks

**Code reference:** `src/lib/components/organisms/header.tsx:44`

```tsx
// The outer component accepts session as a prop
export const Header = ({ session }: { session: Session | null }) => (
  <SessionProvider session={session}>
    <UserBar />   {/* UserBar still calls useSession() internally */}
  </SessionProvider>
);
```

---

## 3. Creating a UI Component Library — Atomic Design

Move all UI to `src/lib/components/` to separate presentational code from routing, services, and controllers. Structure using **Atomic Design**:

| Layer | Folder | Examples in this project |
|-------|--------|--------------------------|
| Atoms | `src/lib/components/atoms/` | `SectionHeading`, `AvatarImage`, `ExternalLink` |
| Molecules | `src/lib/components/molecules/` | `NavLink` |
| Organisms | `src/lib/components/organisms/` | `Header`, `HeroSection`, `GithubProfile`, `GithubEventTable` |
| Templates | `src/lib/components/templates/` | `PageTemplate` |
| Pages | `src/lib/components/pages/` | `HomePage`, `GithubPage` |

- Move shared types to `src/lib/models/` — e.g., `GithubEvent`, `GithubPageProps` in `src/lib/models/pageProps.ts`
- Brad Frost: labels are a mental model, not a strict rule — what matters is composability and reuse

**References:**
- [Atomic Design Methodology — Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)
- [Atomic Design and Storybook — Brad Frost](https://bradfrost.com/blog/post/atomic-design-and-storybook/)

---

## 4. Storybook Installation

```bash
npm create storybook@latest
```

- Accept prompt to install `create-storybook@10.x`
- Auto-detects Next.js and selects `@storybook/nextjs-vite` (faster builds, better test support than Webpack)
- Boilerplate stories generated in `src/stories/` — delete and replace with real stories

**Generated config:**
- `.storybook/main.ts` — framework, addons, story glob (`../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`)
- `.storybook/preview.ts` — global parameters, decorators

**References:**
- [Storybook for Next.js with Vite — official docs](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)

---

## 5. Wiring Up Tailwind CSS

Two required changes — without them components render unstyled:

**a) Import `globals.css` in `.storybook/preview.ts`:**
```ts
import '../src/app/globals.css'
```

**b) Add lib and stories paths to `tailwind.config.ts`** so Tailwind scans component files during build:
```ts
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/lib/**/*.{js,ts,jsx,tsx,mdx}',      // component library
  './src/stories/**/*.{js,ts,jsx,tsx,mdx}',  // story files
]
```

> **Note:** This applies to **Tailwind CSS v3**. Tailwind v4 replaces `tailwind.config.ts` with a CSS-based configuration — the setup steps differ significantly if you're on v4.

**References:**
- [Tailwind CSS — Storybook recipes](https://storybook.js.org/recipes/tailwindcss)
- [Set up Storybook with Next.js and Tailwind — DEV Community](https://dev.to/lico/nextjs-using-tailwind-with-storybook-5aie)

---

## 6. Writing Stories — CSF3 Format

Every story file follows **Component Story Format 3 (CSF3)**:

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MyComponent } from '../lib/components/atoms/my-component';

const meta = {
  title: 'Components/Atoms/MyComponent',  // controls sidebar hierarchy
  component: MyComponent,
  tags: ['autodocs'],                      // auto-generates docs page
} satisfies Meta<typeof MyComponent>;     // full TS inference on args

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Hello' },
};
```

- `satisfies Meta<typeof MyComponent>` → TypeScript catches misspelled props immediately
- `title` path controls the Storybook sidebar tree
- `tags: ['autodocs']` → auto-generates a documentation page from props + stories

**References:**
- [Component Story Format (CSF) — Storybook docs](https://storybook.js.org/docs/api/csf)
- [Component Story Format 3.0 — Storybook blog](https://storybook.js.org/blog/component-story-format-3-0)

---

## 7. Stories at Each Level

### Atoms
Simple: vary the `children` content. Example: `SectionHeading.stories.ts`

### Molecules
Pass `href` and `children`. Example: `NavLink.stories.ts`

### Organisms — Multiple Visual States
Header has three distinct states; each gets its own named story:
- `LoggedOut` — `session: null`
- `LoggedIn` — session with user info but no `githubLogin`
- `LoggedInWithGithub` — session with `githubLogin` triggers the Github nav link

**Code reference:** `src/stories/Header.stories.ts`

### Templates — JSX Children in Args
Templates accept `children: ReactNode`. Use `.tsx` extension and pass JSX via `args`:

```tsx
export const WithContent: Story = {
  args: {
    children: <h2 className="p-2 text-2xl font-bold text-center">Page Content</h2>,
  },
};
```

> **Gotcha:** Using `render: () => (...)` without `args` triggers `TS2322: Property 'args' is missing` in CSF3. Always use the `args` pattern.

**Code reference:** `src/stories/PageTemplate.stories.tsx`

### Pages
Compose organisms with shared mock data (see §8). Example: `GithubPage.stories.ts` — `FullProfile`, `NoLocation`, `NoEvents` stories.

---

## 8. Shared Fixtures

Extract repeated mock data into a shared fixtures file:

```ts
// src/stories/fixtures.ts
export const mockProfile = { name: 'Jane Doe', login: 'janedoe', ... };
export const mockEvents: GithubEvent[] = [ ... ];
```

Import in any story that needs it:
```ts
import { mockProfile, mockEvents } from './fixtures';
```

Benefit: update once, all stories reflect the change.

**Code reference:** `src/stories/fixtures.ts`

---

## 9. Running Stories as Automated Tests with Vitest

`@storybook/addon-vitest` turns every story into a browser test running in real Chromium (via Playwright). Storybook recommends browser mode over JSDom/HappyDom for accuracy.

**`vitest.config.ts`** — two projects: unit tests (Node) + story tests (browser):

```ts
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright'; // separate package, not @playwright/test

// ...
test: {
  projects: [
    { extends: true, test: { name: 'unit', environment: 'node', include: ['tests/**/*.test.ts'] } },
    {
      extends: true,
      plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
      test: {
        name: 'storybook',
        browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: 'chromium' }] },
        setupFiles: ['.storybook/vitest.setup.ts'],
      },
    },
  ],
},
```

**`package.json` scripts:**
```json
"test": "vitest --project unit",
"test:storybook": "vitest --project storybook"
```

**Accessibility testing** via `@storybook/addon-a11y` — configure in `preview.ts`:
```ts
a11y: { test: 'todo' }   // 'todo' | 'error' (fail CI) | 'off'
```

**References:**
- [Vitest addon — Storybook docs](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)
- [Component Test with Storybook and Vitest — Storybook blog](https://storybook.js.org/blog/component-test-with-storybook-and-vitest/)

---

## 10. Conclusion

- Summary: isolate → decompose → install → style → write stories → test
- Storybook as a living component catalog the whole team can browse
- Link to companion repo
- Future topics: [Chromatic](https://www.chromatic.com/) for visual regression CI, MDX component docs
