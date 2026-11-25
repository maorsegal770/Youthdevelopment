# מדריך הקמה – אתר הכנה ללידה

זמן משוער: כשעה. כל השירותים חינמיים בשלב ההתחלתי (חוץ מעמלות סליקה).
מומלץ לפתוח את כל החשבונות עם **rachellea.segal@gmail.com**.

---

## שלב 1 – Supabase (מסד נתונים והתחברות)

1. להירשם ב-[supabase.com](https://supabase.com) וללחוץ **New project**.
   - Region: **Central EU (Frankfurt)** – הכי קרוב לישראל.
   - לשמור את סיסמת מסד הנתונים במקום בטוח.
2. **SQL Editor → New query**: להדביק את כל התוכן של
   `supabase/migrations/20261125000000_init.sql` וללחוץ **Run**.
3. שאילתה חדשה: להדביק את `supabase/seed.sql` וללחוץ **Run** (התוכן ההתחלתי של הדף והשיעורים).
4. **Authentication → Sign In / Providers → Email**: לוודא ש-Email מופעל ו-**Confirm email** מסומן.
5. **Authentication → Emails → Confirm signup**: להחליף את התבנית בתוכן של
   `supabase/templates/confirmation.html` (נושא: "קוד האימות שלך").
   חשוב: התבנית חייבת לכלול `{{ .Token }}` – זה הקוד שהיולדת מקלידה באתר.
6. **Project Settings → API**: להעתיק את **Project URL** ואת **anon / publishable key** – נצטרך אותם בשלב 4.

## שלב 2 – Resend (שליחת הפניות למייל)

1. להירשם ב-[resend.com](https://resend.com) **עם rachellea.segal@gmail.com**.
   (בלי דומיין משלכם, Resend שולח רק לכתובת של בעלת החשבון – וזה בדיוק מה שצריך.)
2. **API Keys → Create API Key** ולהעתיק אותו.

## שלב 3 – Stripe (תשלום מאובטח)

> אם Stripe לא מאשר את העסק, או שרוצים Bit / תשלומים / חשבונית אוטומטית – אפשר לעבור ל-Grow (משולם) או Cardcom. ראו סעיף 5 ב-PRD.

1. להירשם ב-[stripe.com](https://stripe.com) ולהשלים את פרטי העסק.
2. **Product catalog → Add product**: "קורס הכנה ללידה – גישה לתכנים", מחיר חד-פעמי ב-ILS.
   להעתיק את ה-**Price ID** (מתחיל ב-`price_`).
3. **Developers → API keys**: להעתיק את ה-**Secret key** (`sk_test_…` לבדיקות, `sk_live_…` לאמת).
4. את ה-Webhook נגדיר בשלב 5, אחרי שהפונקציות יעלו.

## שלב 4 – Netlify (העלאת האתר)

1. להירשם ב-[netlify.com](https://netlify.com) עם GitHub.
2. **Add new site → Import from Git** → לבחור את הריפו.
   - **Branch**: הענף שבו נמצא האתר.
   - **Base directory**: `birth-site`
   - Build command ו-Publish directory נקראים אוטומטית מ-`netlify.toml`.
3. **Site configuration → Environment variables**:
   | שם | ערך |
   |---|---|
   | `VITE_SUPABASE_URL` | ה-Project URL משלב 1 |
   | `VITE_SUPABASE_ANON_KEY` | ה-anon key משלב 1 |
4. **Deploy**. לרשום את כתובת האתר (למשל `https://rachel-lea.netlify.app`). אפשר לחבר דומיין משלכם ב-**Domain management**.
5. בחזרה ב-Supabase: **Authentication → URL Configuration**
   - Site URL: כתובת האתר
   - Redirect URLs: `https://כתובת-האתר/**`

## שלב 5 – פונקציות השרת

מהמחשב, בתיקייה `birth-site` (צריך Node.js מותקן):

```bash
npx supabase login
npx supabase link --project-ref <PROJECT-REF>     # מופיע בכתובת ה-Project URL

npx supabase secrets set \
  RESEND_API_KEY=re_xxx \
  STRIPE_SECRET_KEY=sk_test_xxx \
  STRIPE_PRICE_ID=price_xxx \
  SITE_URL=https://כתובת-האתר

npx supabase functions deploy submit-lead
npx supabase functions deploy create-checkout
npx supabase functions deploy verify-checkout
npx supabase functions deploy stripe-webhook
```

ואז ב-Stripe: **Developers → Webhooks → Add endpoint**
- URL: `https://<PROJECT-REF>.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- להעתיק את ה-**Signing secret** ולהריץ:
  ```bash
  npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
  ```

## שלב 6 – הפיכת רחל לאה למנהלת

1. להירשם באתר דרך "הרשמה לקורס" עם rachellea.segal@gmail.com (אפשר לעצור בשלב התשלום).
2. ב-Supabase → **SQL Editor**:
   ```sql
   update public.profiles
   set role = 'admin', subscription_status = 'active'
   where email = 'rachellea.segal@gmail.com';
   ```
3. להתנתק ולהתחבר מחדש – יופיע הכפתור "עריכת הדף", ובתפריט "פניות".

## שלב 7 – בדיקה לפני השקה

- [ ] טופס יצירת קשר → המייל הגיע ל-rachellea.segal@gmail.com, והפנייה מופיעה ב"פניות".
- [ ] הרשמה עם מייל אחר → הגיע קוד אימות → תשלום בכרטיס הבדיקה `4242 4242 4242 4242` (תוקף עתידי כלשהו, CVC כלשהו) → הגישה לשיעורים נפתחה.
- [ ] ביטול בדף התשלום → חזרה לאתר, הגישה נשארת סגורה.
- [ ] "שכחתי סיסמה" → הגיע מייל → בחירת סיסמה חדשה עובדת.
- [ ] רחל לאה: עריכת טקסט בדף, הוספת שאלה, הוספת שיעור עם קישור YouTube.
- [ ] בדיקה בנייד.
- [ ] מעבר ב-Stripe ממצב Test ל-Live, והחלפת `STRIPE_SECRET_KEY` ו-`STRIPE_WEBHOOK_SECRET` למפתחות ה-Live.

## לפני השקה – תוכן משפטי
- מדיניות פרטיות, תנאי שימוש והצהרת נגישות (חובה בישראל לעסק שנותן שירות לציבור).
- תמונה אמיתית של רחל לאה והמלצות אמיתיות של לקוחות.

## כשמגיעים להרבה נרשמות
- מגבלת המיילים המובנית של Supabase נמוכה (כמה בשעה). כדאי לחבר את Resend כ-SMTP:
  Supabase → **Authentication → Emails → SMTP Settings** (host `smtp.resend.com`, port 465, user `resend`, password = ה-API key). זה דורש דומיין מאומת ב-Resend.
- פרויקט Supabase חינמי "נרדם" אחרי שבוע בלי שום פעילות. אם זה קורה, משדרגים ל-Pro.
