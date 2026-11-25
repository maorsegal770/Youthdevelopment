export const DOULA = {
  name: "רחל לאה סגל",
  title: "דולה ומדריכת הכנה ללידה",
  phone: "053-2778770",
  phoneHref: "tel:+972532778770",
  whatsappHref:
    "https://wa.me/972532778770?text=" +
    encodeURIComponent("היי רחל לאה, הגעתי מהאתר ואשמח לשמוע פרטים"),
};

export const INTEREST_OPTIONS = [
  { value: "course", label: "קורס הכנה ללידה" },
  { value: "doula", label: "ליווי לידה (דולה)" },
  { value: "consultation", label: "התייעצות" },
  { value: "other", label: "אחר" },
];

export const ICONS = ["heart", "baby", "users", "sparkles", "wind", "moon", "flower", "shield", "message", "book"];

// Default landing content. Shown until Rachel saves her own version, and used
// to seed the database the first time she turns on edit mode.
export const DEFAULT_SECTIONS = [
  {
    kind: "hero",
    title: "להגיע ללידה רגועה, בטוחה ומוכנה",
    body: "קורס הכנה ללידה וליווי דולה אישי – ידע מעשי, כלים להתמודדות וחיבוק תומך, מההריון ועד אחרי הלידה.",
    order: 0,
  },
  {
    kind: "about",
    title: "נעים להכיר, רחל לאה סגל",
    body:
      "אני דולה ומדריכת הכנה ללידה. אני מאמינה שכל יולדת ראויה להגיע ללידה עם ידע, ביטחון ותמיכה – כדי שתוכל לבחור, להרגיש ולהיות נוכחת בחוויה שלה.\n\nבקורס ובליווי אני משלבת מידע מבוסס, תרגול מעשי של נשימות ותנוחות, הכנה של בן/בת הזוג, ותשומת לב אישית לצרכים ולחששות של כל אחת.",
    order: 1,
  },
  { kind: "service", icon: "book", title: "קורס הכנה ללידה", body: "מפגשים מעשיים (פרונטלי או דיגיטלי) + גישה מלאה לאזור התכנים באתר: שיעורים, סרטונים ודפי עבודה.", order: 10 },
  { kind: "service", icon: "heart", title: "ליווי לידה – דולה", body: "פגישות הכנה אישיות, זמינות טלפונית מסביב לשעון מהשבוע ה-38 ונוכחות רציפה לצידך בלידה עצמה.", order: 11 },
  { kind: "service", icon: "message", title: "התייעצות אישית", body: "שיחה ממוקדת לשאלות, חששות, בניית תכנית לידה או עיבוד לידה קודמת.", order: 12 },
  { kind: "topic", icon: "sparkles", title: "שלבי הלידה", body: "מה קורה בגוף בכל שלב, מתי לנסוע לבית החולים ומה מצפה לך בחדר הלידה.", order: 20 },
  { kind: "topic", icon: "wind", title: "נשימות והרפיה", body: "טכניקות נשימה, מגע ודמיון מודרך להתמודדות עם צירים.", order: 21 },
  { kind: "topic", icon: "flower", title: "תנוחות ותנועה", body: "תנוחות שמקדמות את הלידה ומקלות על הכאב, עם ובלי כדור פיזיו.", order: 22 },
  { kind: "topic", icon: "shield", title: "שיכוך כאבים", body: "אפידורל, גז צחוק ושיטות טבעיות – יתרונות, חסרונות ואיך לבחור.", order: 23 },
  { kind: "topic", icon: "users", title: "תפקיד המלווה", body: "איך בן/בת הזוג יכולים לתמוך באמת – בבית ובחדר הלידה.", order: 24 },
  { kind: "topic", icon: "baby", title: "אחרי הלידה", body: "השעות הראשונות, הנקה, התאוששות ושבועות ראשונים בבית.", order: 25 },
  { kind: "faq", title: "מתי כדאי להתחיל קורס הכנה ללידה?", body: "הזמן המומלץ הוא בין השבוע ה-28 לשבוע ה-34, כך שהחומר טרי ועדיין יש זמן לתרגל.", order: 30 },
  { kind: "faq", title: "האם בן/בת הזוג יכולים להשתתף?", body: "בהחלט, ואף מומלץ. חלק מהמפגשים מוקדשים במיוחד לתפקיד המלווה.", order: 31 },
  { kind: "faq", title: "מה ההבדל בין דולה למיילדת?", body: "המיילדת אחראית על ההיבט הרפואי של הלידה. הדולה מעניקה תמיכה רגשית ופיזית רציפה, ואינה מבצעת פעולות רפואיות.", order: 32 },
  { kind: "faq", title: "איך ניגשים לתכנים באתר?", body: "נרשמים באזור ההרשמה, משלמים בדף תשלום מאובטח, ומאותו רגע נכנסים עם המייל והסיסמה לאזור התכנים.", order: 33 },
];

export const DEFAULT_LESSONS = [
  { module: "פרק 1 – לקראת הלידה", title: "ברוכה הבאה לקורס", summary: "איך הקורס בנוי ואיך להפיק ממנו את המרב.", body: "## ברוכה הבאה!\n\nבקורס הזה נלמד יחד...", order: 1, published: true },
  { module: "פרק 1 – לקראת הלידה", title: "סימנים לתחילת לידה", summary: "צירים מוקדמים, ירידת מים ומתי לנסוע.", body: "", order: 2, published: true },
  { module: "פרק 2 – התמודדות עם צירים", title: "נשימות לכל שלב", summary: "תרגול מודרך של שלוש טכניקות נשימה.", body: "", order: 3, published: true },
  { module: "פרק 2 – התמודדות עם צירים", title: "תנוחות ותנועה", summary: "תנוחות שמקלות על הכאב ומקדמות את הלידה.", body: "", order: 4, published: true },
  { module: "פרק 3 – אחרי הלידה", title: "השעה הראשונה והנקה", summary: "מגע עור לעור, הנקה ראשונה והתאוששות.", body: "", order: 5, published: true },
];
