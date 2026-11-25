import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, PlayCircle, FileText, PencilLine, Eye, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useEntityList } from "@/birth/useEntityList";
import { DEFAULT_LESSONS } from "@/birth/config";
import { EditableBlock, AddBlockButton } from "@/birth/Editable";
import { errorMessage, startCheckout } from "@/birth/api";
import Rich from "@/birth/Rich";

const LESSON_FIELDS = ["module", "title", "summary", "body", "video_url", "attachment_url", "duration_minutes"];

export default function Lessons() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Always fetch fresh: membership may have just been activated.
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, [isAuthenticated]);

  if (!isLoadingAuth && !isAuthenticated) return <Navigate to="/birth/login" replace />;
  if (me === undefined) return <Spinner />;
  if (me === null) return <Navigate to="/birth/login" replace />;

  const isAdmin = me.role === "admin";
  if (!isAdmin && me.subscription_status !== "active") return <Paywall user={me} />;
  return <CourseArea user={me} isAdmin={isAdmin} />;
}

function CourseArea({ user, isAdmin }) {
  const lessons = useEntityList("CourseLesson", isAdmin ? DEFAULT_LESSONS : []);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(
    () => lessons.items.filter((l) => isAdmin || l.published !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [lessons.items, isAdmin],
  );
  const modules = useMemo(() => {
    const map = new Map();
    visible.forEach((l) => {
      const key = l.module || "כללי";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(l);
    });
    return [...map.entries()];
  }, [visible]);

  const selected = visible.find((l) => l.id === selectedId) || visible[0];
  const idx = visible.indexOf(selected);

  const toggleEdit = async () => {
    if (!editMode && lessons.usingDefaults) await lessons.seed();
    setEditMode((v) => !v);
  };

  if (lessons.loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-primary font-medium">אזור התכנים</p>
          <h1 className="text-3xl font-bold">שלום {user.display_name || user.full_name || ""} 🌸</h1>
        </div>
        {isAdmin && (
          <Button variant={editMode ? "default" : "outline"} onClick={toggleEdit}>
            {editMode ? <Eye className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />}
            {editMode ? "סיום עריכה" : "עריכת תכנים"}
          </Button>
        )}
      </div>

      {editMode ? (
        <div className="space-y-4">
          {visible.map((l, i) => (
            <EditableBlock
              key={l.id}
              item={l}
              editMode
              fields={LESSON_FIELDS}
              onSave={(d) => lessons.update(l.id, d)}
              onDelete={() => lessons.remove(l.id)}
              onMoveUp={i > 0 ? () => lessons.swapOrder(l, visible[i - 1]) : undefined}
              onMoveDown={i < visible.length - 1 ? () => lessons.swapOrder(l, visible[i + 1]) : undefined}
            >
              <div className="rounded-2xl bg-card border border-border p-5 pl-40">
                <p className="text-xs text-muted-foreground">{l.module}</p>
                <p className="font-semibold text-lg">{l.title}</p>
                {l.summary && <p className="text-muted-foreground text-sm mt-1">{l.summary}</p>}
                <label className="inline-flex items-center gap-2 text-sm mt-3">
                  <input type="checkbox" checked={l.published !== false} onChange={(e) => lessons.update(l.id, { published: e.target.checked })} />
                  מפורסם לתלמידות
                </label>
              </div>
            </EditableBlock>
          ))}
          <AddBlockButton
            label="הוספת שיעור חדש"
            fields={LESSON_FIELDS}
            defaults={{ module: visible.at(-1)?.module || "", order: (visible.at(-1)?.order ?? 0) + 1, published: true }}
            onCreate={lessons.create}
            className="w-full"
          />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">התכנים יעלו בקרוב 💛</p>
      ) : (
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
          <nav className="rounded-3xl bg-card border border-border p-4 lg:sticky lg:top-24 space-y-5" aria-label="רשימת שיעורים">
            {modules.map(([name, items]) => (
              <div key={name}>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">{name}</p>
                <ul className="space-y-1">
                  {items.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => { setSelectedId(l.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`w-full text-right rounded-xl px-3 py-2 text-sm flex items-center gap-2 ${selected?.id === l.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                      >
                        {l.video_url ? <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> : <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />}
                        <span className="truncate">{l.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {selected && (
            <article className="rounded-3xl bg-card border border-border p-6 md:p-10">
              <p className="text-sm text-muted-foreground">{selected.module}</p>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">{selected.title}</h2>
              {selected.duration_minutes ? <p className="text-sm text-muted-foreground mt-2 inline-flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />{selected.duration_minutes} דקות</p> : null}
              {selected.summary && <p className="text-lg text-muted-foreground mt-4">{selected.summary}</p>}
              {embedUrl(selected.video_url) && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-muted mt-6">
                  <iframe src={embedUrl(selected.video_url)} title={selected.title} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                </div>
              )}
              {selected.body && <Rich className="mt-6">{selected.body}</Rich>}
              {selected.attachment_url && (
                <a href={selected.attachment_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  <FileText className="w-4 h-4" aria-hidden="true" /> להורדת חומר מצורף
                </a>
              )}
              <div className="flex justify-between mt-10 pt-6 border-t border-border">
                <Button variant="ghost" disabled={idx <= 0} onClick={() => setSelectedId(visible[idx - 1]?.id)}>→ השיעור הקודם</Button>
                <Button variant="ghost" disabled={idx >= visible.length - 1} onClick={() => setSelectedId(visible[idx + 1]?.id)}>השיעור הבא ←</Button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}

function Paywall({ user }) {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("payment") === "canceled" ? "התשלום בוטל. אפשר לנסות שוב מתי שתרצי." : "");

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      await startCheckout();
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <span className="w-16 h-16 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center mb-5"><Lock className="w-7 h-7" aria-hidden="true" /></span>
      <h1 className="text-3xl font-bold">עוד צעד קטן, {user.display_name || ""}</h1>
      <p className="text-muted-foreground mt-3">החשבון שלך נוצר. כדי לפתוח את הגישה לכל תכני הקורס יש להשלים תשלום בדף הסליקה המאובטח.</p>
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
      <Button className="mt-8 h-12 px-8 rounded-full text-base" onClick={pay} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} להשלמת התשלום
      </Button>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
}

/** Converts YouTube / Vimeo links to embeddable URLs; returns null otherwise. */
function embedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed${u.pathname}`;
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
