import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, PencilLine, Eye, ArrowLeft, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTable } from "@/lib/useTable";
import { DOULA, FALLBACK_SECTIONS } from "@/lib/config";
import { Button } from "@/components/ui";
import { EditableBlock, AddBlockButton } from "@/components/Editable";
import { SectionIcon } from "@/components/icons";
import ContactForm from "@/components/ContactForm";
import Rich from "@/components/Rich";

export default function Landing() {
  const { isAdmin } = useAuth();
  const sections = useTable("landing_sections", { fallback: FALLBACK_SECTIONS });
  const [editMode, setEditMode] = useState(false);

  const byKind = (kind) => sections.items.filter((s) => s.kind === kind).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const hero = byKind("hero")[0];
  const about = byKind("about")[0];
  const nextOrder = (kind) => Math.max(0, ...byKind(kind).map((s) => s.sort_order ?? 0)) + 1;

  const blockProps = (item, list = null, idx = 0) => ({
    item,
    editMode,
    onSave: (data) => sections.update(item.id, data),
    onDelete: () => sections.remove(item.id),
    onMoveUp: list && idx > 0 ? () => sections.swapOrder(item, list[idx - 1]) : undefined,
    onMoveDown: list && idx < list.length - 1 ? () => sections.swapOrder(item, list[idx + 1]) : undefined,
  });

  return (
    <div>
      {isAdmin && (
        <div className="sticky top-16 z-30 bg-secondary text-secondary-foreground border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <span>{editMode ? "מצב עריכה – לחצי על העיפרון כדי לערוך, או על + כדי להוסיף תוכן." : "שלום רחל לאה, אפשר לערוך את תוכן הדף ישירות כאן."}</span>
            <Button size="sm" variant={editMode ? "primary" : "outline"} onClick={() => setEditMode((v) => !v)} disabled={Boolean(sections.error)}>
              {editMode ? <Eye className="w-4 h-4" aria-hidden="true" /> : <PencilLine className="w-4 h-4" aria-hidden="true" />}
              {editMode ? "סיום עריכה" : "עריכת הדף"}
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.15),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1 text-sm font-medium">{DOULA.name} · {DOULA.title}</p>
            {hero && (
              <EditableBlock {...blockProps(hero)} onDelete={undefined}>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{hero.title}</h1>
                <p className="mt-5 text-lg text-muted-foreground max-w-xl">{hero.body}</p>
              </EditableBlock>
            )}
            <div className="flex flex-wrap gap-3">
              <a href="#contact" className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90">לשיחת היכרות</a>
              <Link to="/register" className="rounded-full border border-primary text-primary px-6 py-3 font-medium hover:bg-primary/5">הרשמה לקורס הדיגיטלי</Link>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <a href={DOULA.phoneHref} className="inline-flex items-center gap-2 hover:text-foreground"><Phone className="w-4 h-4" aria-hidden="true" /><span dir="ltr">{DOULA.phone}</span></a>
              <a href={DOULA.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground"><MessageCircle className="w-4 h-4" aria-hidden="true" />וואטסאפ</a>
            </div>
          </div>
          <div className="hidden md:flex justify-center" aria-hidden="true">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full bg-primary/15" />
              <div className="absolute inset-8 rounded-full bg-accent/20" />
              <div className="absolute inset-16 rounded-full bg-card shadow-lg flex items-center justify-center">
                <SectionIcon name="baby" className="w-20 h-20 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="services" eyebrow="איך אני יכולה ללוות אותך" title="השירותים שלי">
        <div className="grid md:grid-cols-3 gap-5">
          {byKind("service").map((s, i, list) => (
            <EditableBlock key={s.id} {...blockProps(s, list, i)} fields={["title", "body", "icon"]}>
              <Card icon={s.icon} title={s.title} body={s.body} />
            </EditableBlock>
          ))}
          {editMode && <AddBlockButton label="הוספת שירות" fields={["title", "body", "icon"]} defaults={{ kind: "service", icon: "heart", sort_order: nextOrder("service") }} onCreate={sections.create} />}
        </div>
      </Section>

      {about && (
        <section className="bg-secondary/60">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <EditableBlock {...blockProps(about)} onDelete={undefined}>
              <h2 className="text-3xl font-bold mb-5">{about.title}</h2>
              <Rich className="text-lg text-foreground/85">{about.body}</Rich>
            </EditableBlock>
          </div>
        </section>
      )}

      <Section id="course" eyebrow="קורס הכנה ללידה" title="מה לומדים בקורס?">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {byKind("topic").map((s, i, list) => (
            <EditableBlock key={s.id} {...blockProps(s, list, i)} fields={["title", "body", "icon"]}>
              <Card icon={s.icon} title={s.title} body={s.body} subtle />
            </EditableBlock>
          ))}
          {editMode && <AddBlockButton label="הוספת נושא" fields={["title", "body", "icon"]} defaults={{ kind: "topic", icon: "sparkles", sort_order: nextOrder("topic") }} onCreate={sections.create} />}
        </div>
        <div className="mt-10 rounded-3xl bg-primary text-primary-foreground p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">כל התכנים זמינים לך גם באתר</h3>
            <p className="opacity-90 mt-2">נרשמים, משלמים בדף מאובטח ונכנסים עם מייל וסיסמה לאזור התכנים – מתי שנוח לך.</p>
          </div>
          <Link to="/register" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary-foreground text-primary px-6 py-3 font-semibold hover:opacity-90">
            להרשמה <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {(byKind("text").length > 0 || editMode) && (
        <Section>
          <div className="space-y-5 max-w-3xl mx-auto">
            {byKind("text").map((s, i, list) => (
              <EditableBlock key={s.id} {...blockProps(s, list, i)}>
                <article className="rounded-3xl bg-card border border-border p-6 md:p-8">
                  <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                  <Rich>{s.body}</Rich>
                </article>
              </EditableBlock>
            ))}
            {editMode && <AddBlockButton label="הוספת מקטע תוכן חופשי (טיפ, מאמר, עדכון)" fields={["title", "body"]} defaults={{ kind: "text", sort_order: nextOrder("text") }} onCreate={sections.create} className="w-full" />}
          </div>
        </Section>
      )}

      <Section id="faq" eyebrow="שאלות נפוצות" title="יש לך שאלה?">
        <div className="max-w-3xl mx-auto space-y-3">
          {byKind("faq").map((s, i, list) =>
            editMode ? (
              <EditableBlock key={s.id} {...blockProps(s, list, i)}>
                <div className="rounded-2xl bg-card border border-border p-5 pl-40">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-muted-foreground mt-2">{s.body}</p>
                </div>
              </EditableBlock>
            ) : (
              <details key={s.id} className="group rounded-2xl bg-card border border-border px-5">
                <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                  {s.title}
                  <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="pb-4 text-muted-foreground"><Rich>{s.body}</Rich></div>
              </details>
            ),
          )}
          {editMode && <AddBlockButton label="הוספת שאלה" fields={["title", "body"]} defaults={{ kind: "faq", sort_order: nextOrder("faq") }} onCreate={sections.create} className="w-full" />}
        </div>
      </Section>

      <section id="contact" className="bg-secondary/60 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-[1fr_1.3fr] gap-10 items-start">
          <div className="space-y-4">
            <p className="text-primary font-medium">בואי נדבר</p>
            <h2 className="text-3xl font-bold">רוצה לשמוע עוד?</h2>
            <p className="text-muted-foreground text-lg">לרכישת קורס, סגירת ליווי לידה או סתם התייעצות – השאירי פרטים ואחזור אלייך בהקדם.</p>
            <div className="space-y-2 pt-2">
              <a href={DOULA.phoneHref} className="flex items-center gap-3 font-medium"><span className="w-10 h-10 rounded-full bg-card flex items-center justify-center"><Phone className="w-5 h-5 text-primary" aria-hidden="true" /></span><span dir="ltr">{DOULA.phone}</span></a>
              <a href={DOULA.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-medium"><span className="w-10 h-10 rounded-full bg-card flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" /></span>שליחת הודעת וואטסאפ</a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}

function Section({ id = undefined, eyebrow = "", title = "", children }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
      {(eyebrow || title) && (
        <div className="text-center mb-10">
          {eyebrow && <p className="text-primary font-medium mb-2">{eyebrow}</p>}
          {title && <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

function Card({ icon, title, body, subtle = false }) {
  return (
    <div className={`h-full rounded-3xl p-6 border border-border ${subtle ? "bg-card/70" : "bg-card shadow-sm"}`}>
      <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <SectionIcon name={icon} className="w-6 h-6" />
      </span>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
