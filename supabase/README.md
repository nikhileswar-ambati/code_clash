# Code Clash Supabase Setup

Run `schema.sql` in the Supabase SQL Editor for the project used by `REACT_APP_SUPABASE_URL`.

The schema creates the lowercase tables used by the app, including `problems`, `profiles`, `invite_links`, `clash_matches`, `clash_participants`, `clash_submissions`, `clash_results`, and `clash_history`.

After running it:

1. Confirm Realtime is enabled for `clash_matches`, `clash_participants`, and `clash_submissions`.
2. Confirm authentication is enabled in Supabase.
3. Add the Supabase URL and anon/publishable key to `client/.env`.
4. Restart the React dev server so environment variables are reloaded.

If Create Clash reports a missing `public.problems` table, the schema has not been run against the Supabase project currently configured in `client/.env`.
