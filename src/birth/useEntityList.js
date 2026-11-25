import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads all records of an entity sorted by `order`, with CRUD helpers.
 * Falls back to `defaults` (not persisted) while the collection is empty.
 */
export function useEntityList(entityName, defaults = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDefaults, setUsingDefaults] = useState(false);

  const entity = base44.entities[entityName];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await entity.list("order", 500);
      if (rows.length === 0 && defaults.length) {
        setItems(defaults.map((d, i) => ({ ...d, id: `default-${i}` })));
        setUsingDefaults(true);
      } else {
        setItems(rows);
        setUsingDefaults(false);
      }
    } catch (e) {
      setError(e);
      if (defaults.length) {
        setItems(defaults.map((d, i) => ({ ...d, id: `default-${i}` })));
        setUsingDefaults(true);
      }
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  useEffect(() => {
    load();
  }, [load]);

  /** Persists the defaults so they become editable records. */
  const seed = useCallback(async () => {
    if (!usingDefaults) return;
    await entity.bulkCreate(defaults);
    await load();
  }, [usingDefaults, defaults, entity, load]);

  const create = async (data) => {
    await entity.create(data);
    await load();
  };
  const update = async (id, data) => {
    // eslint-disable-next-line no-unused-vars
    const { id: _id, created_date, updated_date, created_by, created_by_id, ...rest } = data;
    await entity.update(id, rest);
    await load();
  };
  const remove = async (id) => {
    await entity.delete(id);
    await load();
  };
  const swapOrder = async (a, b) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    await Promise.all([entity.update(a.id, { order: bo === ao ? ao + 1 : bo }), entity.update(b.id, { order: ao })]);
    await load();
  };

  return { items, loading, error, usingDefaults, reload: load, seed, create, update, remove, swapOrder };
}
