---
title: Local MySQL Lists
description: Configure private local movie-list storage with MySQL and .NET User Secrets.
---

## Scope

Custom movie lists now use MySQL through Dapper and MySqlConnector. Existing
list routes and response shapes are preserved, including `/api/Account/lists`.
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
   an initial schema script, not an upgrade/migration system.
3. Create a dedicated local application user. Run the following in your local
   SQL session, replacing the password placeholder with a unique password.
   Do not save the populated script in the repository.

```sql
CREATE USER 'movielibrary_app'@'localhost' IDENTIFIED BY '<your-local-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON movielibrary.* TO 'movielibrary_app'@'localhost';
```

The API account does not need schema administration privileges.

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
Keep the existing server-side TMDB configuration for adding movies.
No database credentials belong in the React app or any `VITE_*` variable.

## Verify

Use the API's development Swagger page to create a list, add a movie, retrieve
details, and check `/api/Account/lists`. Restart the API and retrieve the list
again to confirm persistence. Duplicate movies occupy one row; deleting a list
cascades to its items. Updating a list through PUT preserves its items.

```powershell
dotnet test Tests/Tests.csproj --filter FullyQualifiedName~MySqlListsTests
```

These regression tests exercise configuration, validation, privacy guards, and
sanitized database failures. They do not exercise live MySQL CRUD operations.

## Privacy Limits

List routes accept loopback requests in Development only. Other environments
return 404 until authentication and per-user ownership are implemented.
Missing configuration or unavailable storage returns 503 without connection
details. Development mode must not be exposed publicly, including through a
reverse proxy. This guard is not a replacement for authentication.

Keep MySQL bound to your local interface and do not expose port 3306 publicly.
Use the ignored `database-dumps/` directory for database exports. Never commit
populated connection strings, secrets, or database dumps. Ignore rules do not
remove previously tracked secrets; rotate any credential already published.