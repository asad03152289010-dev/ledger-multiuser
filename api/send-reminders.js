const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const REMINDERS = [
  "Bhai, budget hai to sirf zaroorat ke liye — fuzool kharcha aage jaake khud hi problem banega.",
  "Paisa khatam ho gaya to udhaar maangna padega — abhi sambhal lo.",
  "Jitna aaj bachaoge, utna kal ka sukoon hoga. Sochke kharch karo.",
  "Kaam karo to paisa aayega — bethe bethe kharch karne se sirf jaib khali hogi.",
  "Yeh chhota sa kharcha bhi mahine ke end mein bada farak dalta hai — zara ruk ke socho.",
  "Aaj ka spending check kiya? Kahin budget se zyada to nahi ho gaya.",
  "Mehnat se kamaya paisa hai — sochke lagao, na ke jaldi mein ura do.",
  "Agar abhi control nahi kiya, to mahine ke aakhri hafte mein tang aa jaogi.",
  "Zaroorat aur khwahish mein farak yaad rakho — har kharcha zaroori nahi hota.",
  "Bachat aaj ki, azaadi kal ki — thoda ruk ke faisla lo.",
  "Paisa kamana mushkil hai, ura dena aasan — dono mein farak samajh lo.",
  "Ek chhota sa reminder: aaj kitna kharch ho chuka hai, ek nazar daal lo.",
  "Jo bachaoge wahi kaam aayega — jab zaroorat padegi, tab yeh paisa saath dega.",
  "Budget banaya hai to usko follow bhi karo, sirf likhne se kuch nahi hota.",
  "Kal ki fikar aaj hi kar lo — spending thoda control mein rakho.",
  "Agar paisa khatam hua to sirf tumhe hi dikkat hogi — abhi se hoshiyar raho.",
  "Har rupya kamaane mein waqt lagta hai — kharch karne se pehle do baar socho.",
  "Aaj thoda ruk gaye to kal thoda azaad rahoge — faisla tumhara hai."
];

module.exports = async (req, res) => {
  // Simple shared-secret check so random people can't trigger your sends
  const secret = req.query.secret || (req.headers['x-cron-secret']);
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  webpush.setVapidDetails(
    'mailto:you@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: subs, error } = await supabase.from('push_subscriptions').select('id, subscription');
  if (error) return res.status(500).json({ error: error.message });

  const message = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
  const payload = JSON.stringify({ title: 'Ledger reminder', body: message });

  let sent = 0, removed = 0;
  for (const row of subs || []) {
    try {
      await webpush.sendNotification(row.subscription, payload);
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase.from('push_subscriptions').delete().eq('id', row.id);
        removed++;
      }
    }
  }

  res.status(200).json({ ok: true, sent, removed, total: (subs || []).length });
};
