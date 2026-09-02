import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';

const BADGE_COLORS = {
  'רעיון': 'bg-amber-100 text-amber-800',
  'בתהליך': 'bg-blue-100 text-blue-800',
  'הוגשם': 'bg-emerald-100 text-emerald-800',
  'מתוכנן': 'bg-slate-100 text-slate-600',
  'בוצע': 'bg-emerald-100 text-emerald-800',
  'הושלם': 'bg-emerald-100 text-emerald-800',
  'חשיבה': 'bg-violet-100 text-violet-800',
  'בנייה': 'bg-orange-100 text-orange-800',
  'משימה קבוצתית': 'bg-teal-100 text-teal-800',
  'פרטנית': 'bg-indigo-100 text-indigo-800',
  'קבוצתית': 'bg-cyan-100 text-cyan-800',
  'רצון': 'bg-rose-100 text-rose-800',
  'מחשבה': 'bg-violet-100 text-violet-800',
  'רגש': 'bg-pink-100 text-pink-800',
  'מעשה': 'bg-emerald-100 text-emerald-800',
  'מוזיאון': 'bg-indigo-100 text-indigo-800',
  'טבע': 'bg-green-100 text-green-800',
  'מורשת': 'bg-amber-100 text-amber-800',
  'עסקים מקומיים': 'bg-sky-100 text-sky-800',
};

function formatDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
}

function FieldInput({ field, value, onChange }) {
  if (field.type === 'textarea')
    return <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.label} rows={3} />;
  if (field.type === 'select')
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={field.label} /></SelectTrigger>
        <SelectContent>{field.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    );
  if (field.type === 'date')
    return <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (field.type === 'number')
    return <Input type="number" value={value || ''} onChange={e => onChange(e.target.value)} />;
  return <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.label} />;
}

export default function EntityManager({ entityName, title, fields, titleKey, subtitleKey, badgeKeys = [], emptyMessage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities[entityName].list('-created_date', 50)); }
    catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setFormData({}); setDialogOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormData({ ...item }); setDialogOpen(true); };
  const save = async () => {
    setSaving(true);
    try {
      if (editing) await base44.entities[entityName].update(editing.id, formData);
      else await base44.entities[entityName].create(formData);
      setDialogOpen(false); load();
    } catch (e) { console.error(e); }
    setSaving(false);
  };
  const remove = async (id) => { await base44.entities[entityName].delete(id); load(); };
  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const dateFields = fields.filter(f => f.type === 'date').map(f => f.key);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Button onClick={openAdd}><Plus className="w-4 h-4" />הוסף</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">{emptyMessage || 'אין פריטים עדיין'}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Card key={item.id} className="group relative hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-foreground leading-tight">{item[titleKey]}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-muted rounded-md"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-destructive/10 rounded-md"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
                {subtitleKey && item[subtitleKey] && <p className="text-sm text-muted-foreground mb-2">{item[subtitleKey]}</p>}
                {badgeKeys.some(k => item[k]) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {badgeKeys.map(k => item[k] && (
                      <span key={k} className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_COLORS[item[k]] || 'bg-muted text-muted-foreground'}`}>{item[k]}</span>
                    ))}
                  </div>
                )}
                {fields.filter(f => f.type === 'textarea').map(f => item[f.key] && (
                  <p key={f.key} className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">{item[f.key]}</p>
                ))}
                {dateFields.map(k => item[k] && (
                  <p key={k} className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(item[k])}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'עריכה' : 'הוספה'}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <FieldInput field={f} value={formData[f.key]} onChange={v => setField(f.key, v)} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'שומר...' : 'שמור'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}