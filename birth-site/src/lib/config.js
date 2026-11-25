export const DOULA = {
  name: "רחל לאה סגל",
  title: "דולה ומדריכת הכנה ללידה",
  phone: "053-2778770",
  phoneHref: "tel:+972532778770",
  whatsappHref:
    "https://wa.me/972532778770?text=" + encodeURIComponent("היי רחל לאה, הגעתי מהאתר ואשמח לשמוע פרטים"),
};

export const INTEREST_OPTIONS = [
  { value: "course", label: "קורס הכנה ללידה" },
  { value: "doula", label: "ליווי לידה (דולה)" },
  { value: "consultation", label: "התייעצות" },
  { value: "other", label: "אחר" },
];

export const ICONS = ["heart", "baby", "users", "sparkles", "wind", "moon", "flower", "shield", "message", "book"];

export const PHONE_RE = /^0\d{8,9}$/;
export const isValidPhone = (v) => PHONE_RE.test(String(v || "").replace(/[\s-]/g, ""));

// Fallback shown only if the database can't be reached. The real content
// lives in the landing_sections table (seeded from supabase/seed.sql).
export const FALLBACK_SECTIONS = [
  { kind: "hero", title: "להגיע ללידה רגועה, בטוחה ומוכנה", body: "קורס הכנה ללידה וליווי דולה אישי – ידע מעשי, כלים להתמודדות וחיבוק תומך, מההריון ועד אחרי הלידה.", sort_order: 0 },
  { kind: "about", title: "נעים להכיר, רחל לאה סגל", body: "אני דולה ומדריכת הכנה ללידה. אני מאמינה שכל יולדת ראויה להגיע ללידה עם ידע, ביטחון ותמיכה – כדי שתוכל לבחור, להרגיש ולהיות נוכחת בחוויה שלה.\n\nבקורס ובליווי אני משלבת מידע מבוסס, תרגול מעשי של נשימות ותנוחות, הכנה של בן/בת הזוג, ותשומת לב אישית לצרכים ולחששות של כל אחת.", sort_order: 1 },
  { kind: "service", icon: "book", title: "קורס הכנה ללידה", body: "מפגשים מעשיים (פרונטלי או דיגיטלי) + גישה מלאה לאזור התכנים באתר: שיעורים, סרטונים ודפי עבודה.", sort_order: 10 },
  { kind: "service", icon: "heart", title: "ליווי לידה – דולה", body: "פגישות הכנה אישיות, זמינות טלפונית מסביב לשעון מהשבוע ה-38 ונוכחות רציפה לצידך בלידה עצמה.", sort_order: 11 },
  { kind: "service", icon: "message", title: "התייעצות אישית", body: "שיחה ממוקדת לשאלות, חששות, בניית תכנית לידה או עיבוד לידה קודמת.", sort_order: 12 },
  { kind: "topic", icon: "sparkles", title: "שלבי הלידה", body: "מה קורה בגוף בכל שלב, מתי לנסוע לבית החולים ומה מצפה לך בחדר הלידה.", sort_order: 20 },
  { kind: "topic", icon: "wind", title: "נשימות והרפיה", body: "טכניקות נשימה, מגע ודמיון מודרך להתמודדות עם צירים.", sort_order: 21 },
  { kind: "topic", icon: "flower", title: "תנוחות ותנועה", body: "תנוחות שמקדמות את הלידה ומקלות על הכאב, עם ובלי כדור פיזיו.", sort_order: 22 },
  { kind: "topic", icon: "shield", title: "שיכוך כאבים", body: "אפידורל, גז צחוק ושיטות טבעיות – יתרונות, חסרונות ואיך לבחור.", sort_order: 23 },
  { kind: "topic", icon: "users", title: "תפקיד המלווה", body: "איך בן/בת הזוג יכולים לתמוך באמת – בבית ובחדר הלידה.", sort_order: 24 },
  { kind: "topic", icon: "baby", title: "אחרי הלידה", body: "השעות הראשונות, הנקה, התאוששות ושבועות ראשונים בבית.", sort_order: 25 },
  { kind: "faq", title: "מתי כדאי להתחיל קורס הכנה ללידה?", body: "הזמן המומלץ הוא בין השבוע ה-28 לשבוע ה-34, כך שהחומר טרי ועדיין יש זמן לתרגל.", sort_order: 30 },
  { kind: "faq", title: "האם בן/בת הזוג יכולים להשתתף?", body: "בהחלט, ואף מומלץ. חלק מהמפגשים מוקדשים במיוחד לתפקיד המלווה.", sort_order: 31 },
  { kind: "faq", title: "מה ההבדל בין דולה למיילדת?", body: "המיילדת אחראית על ההיבט הרפואי של הלידה. הדולה מעניקה תמיכה רגשית ופיזית רציפה, ואינה מבצעת פעולות רפואיות.", sort_order: 32 },
  { kind: "faq", title: "איך ניגשים לתכנים באתר?", body: "נרשמים באזור ההרשמה, משלמים בדף תשלום מאובטח, ומאותו רגע נכנסים עם המייל והסיסמה לאזור התכנים.", sort_order: 33 },
].map((s, i) => ({ ...s, id: `fallback-${i}` }));
