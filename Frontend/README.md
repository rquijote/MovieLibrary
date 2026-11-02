---
title: React + TypeScript + Vite
description: Frontend setup and offline caching behavior for Movie Library
---

## Expanded media lists

Use genre and release year (first-air year for TV) to filter expanded lists.
Drag either year-range handle or type a four-digit year into the min/max boxes.
Leave either box empty for an open boundary. The range is inclusive; the minimum
cannot exceed the maximum. Older single-year links still select that exact year.
Select **Apply filters** to return to page 1, or **Clear filters** to remove them.
Discovery filters apply across all results while preserving category date and
rating limits. With filters active, other feeds (including Trending, watchlist,
and favorites) scan all available pages up to TMDB's 500-page limit before
displaying results. A progress indicator tracks the scan, with at most four
requests in flight. Changing filters or leaving the page stops further batches.
Failed scans display an error instead of an incomplete result count.

Matching titles are deduplicated and grouped into pages of 20, preserving feed
order. Only the last page may contain fewer titles. The page count reflects
these matching titles, not the original feed. A completed scan is reused while
you stay on the expanded page, so jumping pages does not rescan the feed.

Use the plain-text **Jump to page** box and **Go** to open a page directly. The available range is
1 through the smaller of the feed's page count and TMDB's 500-page limit.
Filters and page numbers are saved in the URL for refresh and browser navigation.

## Offline content and edits

Successful API reads are saved in IndexedDB, scoped to the configured API URL.
Requests try the network first, with an eight-second timeout. If disconnected,
timed out, or receiving a server error, the app shows the saved response when one
exists. Unvisited content and new searches still require a connection. HTTP 4xx
errors are not replaced with cached content.

The production build includes a service worker that saves the app shell and up
to 150 previously loaded TMDB images. Visit the app online once and let the
service worker finish installing before disconnecting. Offline refreshes and
direct route navigation require HTTPS or localhost. The Vite development server
does not install a service worker.

Ratings, favourites, watchlist changes, and list operations are saved in a
persistent queue before being sent. Pending changes appear in saved content and
are clearly labelled as local, not server-confirmed. New lists use temporary
negative IDs, replaced by server IDs during synchronization. The queue resumes
when the app opens, reconnects, or checks again every 30 seconds while open.
Keep a tab open to synchronize; this does not use background sync after closing
the app. Pending edits replay in order, and local values are applied to the
server at replay time rather than merged with edits from other devices.

Editing a list preserves its ID: metadata updates and added/removed movies are
queued together in one local storage transaction instead of deleting and
recreating the list. If the batch exceeds the queue limit, none of it is queued.
The server still receives individual operations in order, not a server-side
transaction. Rejected edits remain visible in the sync banner but are not
projected onto cached content as if they had succeeded.

After a known API outage, the queue checks the API's `/health` endpoint before
sending edits. Setting favourites, watchlist entries, ratings, or list membership
is idempotent and can be replayed automatically after an interrupted send.
Temporary server errors also leave these operations pending for automatic retry.

If list creation or deletion was interrupted after sending, the app cannot know
whether the server applied it. Automatic replay stops. Check the server before using
**Retry synchronization**, especially for list creation, where retrying can
create a duplicate. Rejected edits also stop the queue and display the server
error. You can discard all pending edits after confirmation; this does not
undo edits already applied on the server.

The cache holds up to 200 API responses and the queue holds up to 100 edits.
Older snapshots may be evicted; browser storage quotas and eviction still apply.
Storage failures are displayed, and edits are not reported as queued unless
they were saved successfully. Web Locks prevent competing tabs from replaying
the same queue concurrently.

Saved library data belongs to this browser profile and the server's currently
configured account. Do not share that profile for private libraries. Synchronize
or discard pending changes, then clear this site's browser data before changing
the server account or API configuration.

### Try offline behavior

1. Run `npm run build`, then `npm run preview`.
2. Visit content, details, and your library while connected.
3. In browser developer tools, enable offline mode and reload a previously
   visited route.
4. Change a rating, favourite, watchlist, or list and confirm the pending banner.
5. Reconnect and confirm that the queue clears, then refresh server content.

Run `npm test` for persistence, cache fallback, and queue replay tests.

## TMDB details and discovery

Movie and TV show pages group the poster and title in a responsive card, with
proportional columns and a stacked layout on small screens. Trailers and videos
sit directly beneath the overview, alongside key facts on desktop.
Official website and IMDb links share a wrapping row below the facts.
Recommendations and similar titles use homepage-style rows with
paginated expanded views. Cast appears near the bottom. Overview cards fit their
content, and budget and revenue each occupy a separate row.
Reviews, crew credits, artwork, keywords, external IDs, release certifications, and translations remain
available in the API but are not displayed on these pages. Movie collection
pages show the titles in a franchise. TV show pages link to season and episode
details, and people pages show biographies and combined filmographies.

Search includes people and keywords. Selecting a person opens their filmography;
selecting a keyword browses matching movies and TV shows. Movie and TV search
results offer From/To year fields and sliders for filtering the loaded results.
Slider limits come from the earliest and latest dated titles in the available
results, not a fixed calendar range. Titles without dates do not set the limits.
Filter actions occupy a separate row in search and expanded lists.
Filters apply automatically after releasing a year slider or pausing for
400 ms after entering a valid year. Genre selections apply immediately.
Clear filters resets the selection.
Extended details are
fetched online. Offline snapshots keep core title and person details
without storing the larger appended responses.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
