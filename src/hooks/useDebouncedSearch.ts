import { useEffect, useState } from 'react';

export function useDebouncedSearch<T>(items: T[], query: string, predicate: (item: T) => boolean, delay = 250) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState(items);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(id);
  }, [query, delay]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(items);
    } else {
      setResults(items.filter(predicate));
    }
  }, [items, debouncedQuery, predicate]);

  return results;
}


