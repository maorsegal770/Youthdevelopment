import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

const READONLY = ["id", "created_at", "updated_at"];
const strip = (data) => Object.fromEntries(Object.entries(data).filter(([k]) => !READONLY.includes(k)));

/** Loads a table ordered by sort_order and exposes CRUD helpers. */
export function useTable(table, { fallback = [], enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { data, error: err } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
    if (err) {
      setError(err);
      setItems(fallback);
    } else {
      setError(null);
      setItems(data);
    }
    setLoading(false);
  }, [table, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (query) => {
    const { error: err } = await query;
    if (err) throw err;
    await load();
  };

  return {
    items,
    loading,
    error,
    reload: load,
    create: (data) => run(supabase.from(table).insert(strip(data))),
    update: (id, data) => run(supabase.from(table).update(strip(data)).eq("id", id)),
    remove: (id) => run(supabase.from(table).delete().eq("id", id)),
    swapOrder: async (a, b) => {
      const ao = a.sort_order ?? 0;
      const bo = b.sort_order ?? 0;
      const [r1, r2] = await Promise.all([
        supabase.from(table).update({ sort_order: bo === ao ? ao + 1 : bo }).eq("id", a.id),
        supabase.from(table).update({ sort_order: ao }).eq("id", b.id),
      ]);
      if (r1.error || r2.error) throw r1.error || r2.error;
      await load();
    },
  };
}
