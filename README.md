# Ledger — multi-user, permanent hosting

Anyone can now sign up with their own email/password and see only their own
entries, budget, and accounts. Hosted for free, permanently, on Vercel.

## 1. Supabase — database + login (you may have already done this)

1. supabase.com → free account → "New Project"
2. Once created, go to the **SQL Editor** → New query → paste everything from
   `schema.sql` in this folder → Run. This creates the tables and makes sure
   each person can only see their own data.
3. Go to **Project Settings → API**. Copy:
   - Project URL
   - anon public key
   - service_role key (keep this one secret — never put it in the frontend)

## 2. Fill in the frontend

Open `index.html`, near the top of the `<script>` section, replace:
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY';
```
with your actual Supabase URL, anon key, and this VAPID public key (reuse the
one generated earlier, no need to make a new one):
```
BDnc1_-XGVqu9qH2RAPaY9UlpO8mmlFD5TkSiG9MdFYZ2Yu4nLuGnE19MxWbsxGSf_M4p0SrHfls_6uy4_J_HhQ
```

## 3. Push this to GitHub

Same as before — create a new repo (or reuse the old one) and push this
folder's contents.

## 4. Deploy to Vercel (free, no card)

1. vercel.com → sign up with GitHub
2. "Add New" → "Project" → import your repo
3. Before deploying, add Environment Variables:
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the secret one from step 1
   - `VAPID_PUBLIC_KEY` — same key as above
   - `VAPID_PRIVATE_KEY` — `1HLWts1d6WmcsEy0IQEfty4IuGWkjSALHKWAA0zZmNM`
   - `CRON_SECRET` — make up any random password, e.g. `ledger-secret-92x`
4. Deploy. You'll get a permanent URL like `https://ledger-yourname.vercel.app`

## 5. Schedule the daily reminders (free, no card)

Vercel's free cron only fires once a day, so instead we use a free external
pinger to call the reminder endpoint 3 times a day:

1. Go to cron-job.org → free account
2. Create 3 cron jobs (9am, 2pm, 8pm — pick your own times), each hitting:
   ```
   https://your-app.vercel.app/api/send-reminders?secret=ledger-secret-92x
   ```
   (use the same value you set for `CRON_SECRET`)
3. Save. Test it once by opening that URL directly in your browser — you
   should get `{"ok":true,"sent":...}` back, and anyone who's enabled
   notifications on their phone will get a reminder.

## 6. Try it

- Visit your Vercel URL, tap "Sign up", create an account
- Add to home screen on your phone, open the installed app, tap the bell to
  enable notifications
- Anyone else can visit the same URL and create their own separate account —
  their data and reminders stay completely separate from yours

## Turning this into an .apk later

Once the site is live at its permanent Vercel URL, go to pwabuilder.com,
paste that URL, and generate an Android package — same as before.
