# הגדרות לפני עלייה לאוויר

## 1. Base44
1. **Visibility → Public** בהגדרות האפליקציה, כדי שדף הנחיתה יהיה פתוח לכולם.
2. להירשם לאפליקציה עם **rachellea.segal@gmail.com** ולתת למשתמשת זו role = `admin`
   (כך היא רואה את כפתורי העריכה, ו-SendEmail יכול לשלוח אליה – הוא שולח רק למשתמשים רשומים).
3. להפעיל התחברות Email + Password ב-Authentication.
4. לדחוף לגיט ולפרסם מהדשבורד (`base44 dashboard open`). הישויות והפונקציות שב-`base44/` עולות יחד עם הקוד.

## 2. Secrets (Dashboard → Settings → Secrets)
| שם | ערך |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (או `sk_test_…` לבדיקות) |
| `STRIPE_PRICE_ID` | `price_…` – מחיר הקורס שנוצר ב-Stripe → Products |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` – מסעיף 3 |
| `LEADS_NOTIFY_EMAIL` | (לא חובה) מייל חלופי לקבלת פניות |

## 3. Stripe Webhook
Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: כתובת הפונקציה `stripeWebhook` כפי שמוצגת ב-Base44 → Functions.
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`.
- להעתיק את ה-Signing secret ל-`STRIPE_WEBHOOK_SECRET`.

## 4. בדיקה
- טופס יצירת קשר → לוודא שהמייל הגיע.
- הרשמה עם מייל בדיקה וכרטיס הבדיקה של Stripe `4242 4242 4242 4242` → לוודא שהגישה נפתחה.
- להתחבר כרחל לאה → "עריכת הדף" (בפעם הראשונה התוכן ההתחלתי נשמר למסד ואז ניתן לעריכה).

## 5. דברים שכדאי להוסיף לפני השקה
- עמודי מדיניות פרטיות, תנאי שימוש והצהרת נגישות.
- תמונה אמיתית של רחל לאה (כרגע איור), והמלצות אמיתיות של לקוחות.
