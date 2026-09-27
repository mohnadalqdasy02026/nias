import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

/**
 * Loads a single record for an admin edit screen.
 * `id` of null/undefined means "create", so nothing is fetched.
 * `url` overrides the default `${path}/${id}` when the endpoint has another
 * shape (e.g. `/admin/roles/5/record`).
 * `fallbackFetch` covers the entities that have no GET /:id endpoint: it loads
 * the collection and picks the row out of it.
 */
export function useAdminRecord({ id, path, url, fallbackFetch, onNotFound }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setRecord(null);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    (fallbackFetch
      ? api.get(fallbackFetch).then((rows) => {
          const list = Array.isArray(rows) ? rows : rows?.items ?? [];
          const found = list.find((r) => String(r.id) === String(id));
          if (!found) throw new Error('العنصر غير موجود');
          return found;
        })
      : api.get(url ?? `${path}/${id}`)
    )
      .then((data) => {
        if (alive) setRecord(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        onNotFound?.(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, path, url, fallbackFetch]);

  return { record, loading, error };
}
