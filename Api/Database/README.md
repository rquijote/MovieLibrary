---
title: Local MySQL Lists
description: Configure private local movie-list storage with MySQL and .NET User Secrets.
---

## Scope

Custom movie lists now use MySQL through Dapper and MySqlConnector. Existing
list routes and response shapes are preserved, including `/api/Account/lists`.
Every list belongs to its creator's authenticated TMDB account ID. Other accounts
receive 404 for all ID-based reads, membership checks, updates, and deletes.
TMDB still supplies movie details when adding a movie; a JSON snapshot is stored
with the item so reading lists does not require TMDB. Snapshots are refreshed
when the same movie is added again. Favorites and watchlists still use TMDB.
Existing TMDB lists are not imported, and local list IDs are independent of TMDB IDs.
TV items are not supported by the current movie-list contract.

## Set Up MySQL

1. Install and start MySQL Server 8.4 locally. MySQL Workbench is an optional GUI;
   it does not replace the server.
2. As a database administrator, execute `schema.sql` in this directory using
   Workbench or the MySQL client. The script creates the `movielibrary` database
   and two tables. Repeat execution preserves existing tables and data; this is
   an initial schema script; upgrade existing databases using the migration below.
3. Create a dedicated local application user. Run the following in your local
   SQL session, replacing the password placeholder with a unique password.
   Do not save the populated script in the repository.

```sql
CREATE USER 'movielibrary_app'@'localhost' IDENTIFIED BY '<your-local-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON movielibrary.* TO 'movielibrary_app'@'localhost';
```

The API account does not need schema administration privileges.

### Upgrade Existing Shared Lists

Back up the database and stop the API before migrating. Retain the **existing**
configured `ACCOUNT_ID`: all legacy lists become private to that account, not to
the next person who signs in. Never substitute the currently signing-in user's ID.
The migration reads this server configuration only; no account value is hardcoded
or printed. `SESSION_ID` is never used.

Using a migration-capable database identity with `ALTER`, `INDEX`, `SELECT`, and
`UPDATE` permissions, run from the repository root. Start in `Api` so the existing
DotNetEnv lookup uses the same working directory as normal API startup:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
Push-Location Api
try {
    dotnet run --project Api.csproj --no-launch-profile -- --migrate-list-owners
}
finally {
    Pop-Location
}
```

The API preserves its existing DotNetEnv loading behavior: an existing local
`.env` configuration continues to work, including the legacy `ACCOUNT_ID`.
.NET User Secrets or environment variables are recommended for new configuration;
there is no need to move an already working configuration to run the migration.
Never post credentials in chat or source control. The command adds
nullable `owner_account_id`, parameterizes the NULL-owner backfill from `ACCOUNT_ID`,
then makes ownership NOT NULL. Re-running it preserves all existing non-NULL owners.
It exits without starting the web server. A partial failure can be safely retried.
Afterward, restore the restricted runtime database identity and restart the API.
Do not grant migration privileges to the normal web process.

## Configure the API

From the repository root, run this locally with your own password. This writes
to .NET User Secrets outside the repository, not to tracked configuration.

```powershell
dotnet user-secrets set "ConnectionStrings:MovieLibrary" "Server=localhost;Port=3306;Database=movielibrary;User ID=movielibrary_app;Password=<your-local-password>" --project Api/Api.csproj
dotnet run --project Api/Api.csproj --environment Development
```

For a password containing connection-string delimiters such as semicolons,
quote the password value according to MySqlConnector connection-string rules.
Enter actual secrets directly in your terminal, not in chat.
.NET User Secrets is a development convenience, not an encrypted secret vault.

The equivalent environment variable is `ConnectionStrings__MovieLibrary`.
Configure `BEARER_TOKEN` server-side for public TMDB data and login exchanges.
No database credentials belong in the React app or any `VITE_*` variable.

## TMDB Browser Authentication

This application uses TMDB approval, not local passwords. TMDB's official
[session flow](https://developer.themoviedb.org/reference/authentication-how-do-i-generate-a-session-id)
creates a request token, navigates to TMDB approval, exchanges the approved token
at `authentication/session/new`, then retrieves `account?session_id=...`.
Logout uses [DELETE authentication/session](https://developer.themoviedb.org/reference/authentication-delete-session).

Use the frontend's same-origin `/api` proxy with cookie credentials:

- `GET /api/Auth/session` returns
  `{ authenticated, account?: { id, username, name, avatarPath }, csrfToken }`.
  It validates the cookie's session against TMDB on every request and fails closed
  if TMDB rejects the session or cannot verify it. Auth responses use `no-store`.
- `POST /api/Auth/login` returns `{ approvalUrl, completion }`. The URL necessarily
  contains TMDB's temporary approval token; no separate request token or session ID
  is exposed in JSON, logs, or browser storage.
  - `completion: "redirect"`: navigate the entire browser to `approvalUrl`; TMDB
    redirects back to `/api/Auth/callback`.
  - `completion: "manual"`: returned when the callback would be a loopback
    (`localhost`) URL and `TMDB_CALLBACK_URL` is not set, because TMDB's firewall
    blocks `redirect_to` values containing `localhost` (CloudFront 403). Open
    `approvalUrl` in a new tab, then call `POST /api/Auth/complete` after the user
    approves access.
- `GET /api/Auth/callback` accepts TMDB's `request_token` and `approved` query fields.
  An encrypted HttpOnly correlation cookie binds the token to its initiating browser
  for at most ten minutes. Uninitiated, denied, mismatched, or expired callbacks fail.
- `POST /api/Auth/complete` finishes a manual login using only the token in the
  encrypted correlation cookie. Returns 204 when signed in, 409 while TMDB approval
  is still pending, 400 when no valid login is in progress, and 502 on TMDB failure.
- `POST /api/Auth/logout` revokes the TMDB session and clears the local cookie.
  A 502 indicates the local cookie was cleared but remote revocation was unavailable.
  Treat this response as locally signed out and display a revocation warning;
  obtain a fresh anonymous CSRF token before starting another login.
  Logout validates the protected cookie and CSRF token without first calling TMDB
  account details, so an account-service outage cannot prevent the DELETE attempt.
- Every POST/PUT/PATCH/DELETE requires `X-CSRF-TOKEN` from the latest `/session`.
  Refresh that token after login/logout; it is bound to the authenticated identity.
  Cross-site origins are rejected. The only configured frontend origin is trusted.
- Every private request additionally requires `X-TMDB-Account-Id` equal to the
  cookie account ID. This includes `Account/*`, `Lists/*`, and movie/TV account-state
  and rating routes. Missing/mismatched identity headers return 403; unauthenticated
  requests return 401. Capture the header identity when queuing offline mutations:
  never replay one account's queued work with another account's header.

An explicit `FRONTEND_ORIGIN` permits exactly that trusted origin (HTTPS except
loopback). Without explicit configuration, Development permits only
`http://localhost:5173`, `http://localhost:5174`, `http://127.0.0.1:5173`, and
`http://127.0.0.1:5174`; other environments default to `http://localhost:5173`.
Login chooses its initiating browser Origin only from this fixed policy, binds it
inside the encrypted correlation cookie, and uses that same origin for its default
callback. No arbitrary Origin or Host header becomes a redirect.
Callback success redirects there with `?auth=success`;
failure uses `?auth_error=tmdb_login_failed` (falling back to the configured/default
origin when no valid correlation exists). `TMDB_CALLBACK_URL` optionally
specifies the fixed externally visible backend callback URL; by default it uses
the frontend origin's `/api/Auth/callback` proxy. Configure your reverse proxy to
forward this path without recording query strings. Never derive redirects from
user-supplied return URLs.

Authentication tickets are ASP.NET Data Protection encrypted, HttpOnly, SameSite=Lax
cookies; TMDB session IDs remain inside those protected tickets and server-to-server
requests only. Production cookies require HTTPS; HTTP is supported only in local
Development. Persist and protect the ASP.NET Data Protection key ring for deployed
instances; share it only across trusted replicas of this application. Configure
HTTPS termination appropriately. Do not enable HTTP request/query/body logging
for authentication callbacks or TMDB credential-bearing requests.

Public movie/TV detail routes remain anonymous and never append private
`account_states`. Account state/rating requests use the authenticated session;
favorites and watchlists use that session and its authenticated account ID.
Configured `ACCOUNT_ID` is used exclusively by the explicit legacy migration.

## Verify

```powershell
dotnet test Tests\Tests.csproj --filter "FullyQualifiedName~Tests.Unit.Auth|FullyQualifiedName~MySqlListsTests"
```

The focused tests exercise the real cookie/CSRF flow with a fake TMDB transport.
For actual MySQL ownership, CRUD, and idempotent legacy migration tests, set
`MOVIELIBRARY_TEST_MYSQL` to a **disposable test database**, then run:

```powershell
dotnet test Tests\Tests.csproj --filter FullyQualifiedName~ListOwnershipTests
```

Those tests replace the test database's `user_lists` and `user_list_items` tables.
Never point them at your application database. They skip if the variable is unset.
List endpoints now rely on verified account ownership, not loopback or Development
as identity. Missing storage configuration or unavailable storage returns 503
without connection details.

Keep MySQL bound to your local interface and do not expose port 3306 publicly.
Use the ignored `database-dumps/` directory for database exports. Never commit
populated connection strings, secrets, or database dumps. Ignore rules do not
remove previously tracked secrets; rotate any credential already published.