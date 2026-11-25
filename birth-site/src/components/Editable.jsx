import React, { useState } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, Check, X, Plus } from "lucide-react";
import { Input, Textarea, Button } from "./ui";
import { ICONS } from "@/lib/config";
import { SectionIcon } from "./icons";

/**
 * Wraps a content block. In edit mode shows edit/delete/reorder controls and
 * swaps the block for an inline form when editing.
 */
export function EditableBlock({ item, editMode, fields = ["title", "body"], onSave, onDelete, onMoveUp, onMoveDown, children, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return (
      <InlineForm
        className={className}
        initial={item}
        fields={fields}
        onCancel={() => setEditing(false)}
        onSubmit={async (data) => {
          await onSave(data);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className={`relative group ${editMode ? "ring-1 ring-dashed ring-primary/40 rounded-2xl" : ""} ${className}`}>
      {children}
      {editMode && (
        <div className="absolute top-2 left-2 flex gap-1 bg-card/95 border border-border rounded-full p-1 shadow-sm">
          {onMoveUp && <IconBtn label="הזזה למעלה" onClick={onMoveUp}><ChevronUp className="w-4 h-4" /></IconBtn>}
          {onMoveDown && <IconBtn label="הזזה למטה" onClick={onMoveDown}><ChevronDown className="w-4 h-4" /></IconBtn>}
          <IconBtn label="עריכה" onClick={() => setEditing(true)}><Pencil className="w-4 h-4" /></IconBtn>
          {onDelete && !confirming && (
            <IconBtn label="מחיקה" onClick={() => setConfirming(true)} danger>
              <Trash2 className="w-4 h-4" />
            </IconBtn>
          )}
          {onDelete && confirming && (
            <span className="flex items-center gap-1 px-2 text-xs">
              למחוק?
              <button type="button" className="font-semibold text-destructive px-1" onClick={() => { setConfirming(false); onDelete(); }}>כן</button>
              <button type="button" className="px-1" onClick={() => setConfirming(false)}>לא</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function AddBlockButton({ label = "הוספת פריט", fields, defaults = {}, onCreate, className = "" }) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <InlineForm
        className={className}
        initial={defaults}
        fields={fields}
        onCancel={() => setOpen(false)}
        onSubmit={async (data) => {
          await onCreate({ ...defaults, ...data });
          setOpen(false);
        }}
      />
    );
  }
  return (
    <button
      onClick={() => setOpen(true)}
      type="button"
      className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 text-primary p-6 hover:bg-primary/5 min-h-[120px] ${className}`}
    >
      <Plus className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
}

const FIELD_LABELS = {
  title: "כותרת",
  body: "תוכן",
  icon: "אייקון",
  module: "פרק",
  summary: "תקציר",
  video_url: "קישור לסרטון (YouTube / Vimeo)",
  attachment_url: "קישור לקובץ (PDF וכו')",
  duration_minutes: "משך בדקות",
};

function InlineForm({ initial, fields, onSubmit, onCancel, className }) {
  const [data, setData] = useState(() => Object.fromEntries(fields.map((f) => [f, initial?.[f] ?? ""])));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!String(data.title || "").trim()) return setErr("נא למלא כותרת");
    setSaving(true);
    setErr("");
    try {
      const out = { ...data };
      if ("duration_minutes" in out) out.duration_minutes = out.duration_minutes ? Number(out.duration_minutes) : undefined;
      await onSubmit(out);
    } catch (e2) {
      setErr(e2?.message || "השמירה נכשלה");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className={`rounded-2xl border border-primary/50 bg-card p-4 space-y-3 shadow-sm ${className}`}>
      {fields.map((f) => (
        <label key={f} className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">{FIELD_LABELS[f] || f}</span>
          {f === "body" ? (
            <Textarea rows={6} value={data[f]} onChange={(e) => set(f, e.target.value)} />
          ) : f === "icon" ? (
            <div className="flex flex-wrap gap-2">
              {ICONS.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => set("icon", name)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${data.icon === name ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                  aria-label={name}
                >
                  <SectionIcon name={name} className="w-4 h-4" />
                </button>
              ))}
            </div>
          ) : (
            <Input
              value={data[f]}
              type={f === "duration_minutes" ? "number" : "text"}
              dir={f.endsWith("_url") ? "ltr" : undefined}
              onChange={(e) => set(f, e.target.value)}
            />
          )}
        </label>
      ))}
      {fields.includes("body") && <p className="text-xs text-muted-foreground">טיפ: שורה ריקה יוצרת פסקה חדשה. ניתן להשתמש ב-Markdown (## כותרת, **הדגשה**, - רשימה).</p>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}><X className="w-4 h-4" aria-hidden="true" />ביטול</Button>
        <Button type="submit" size="sm" loading={saving}>
          {!saving && <Check className="w-4 h-4" aria-hidden="true" />}
          שמירה
        </Button>
      </div>
    </form>
  );
}

function IconBtn({ children, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-1.5 rounded-full hover:bg-muted ${danger ? "text-destructive" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
