import { useEffect, useMemo, useState } from "react";
import { estimateReadTime } from "../../shared/lib/format";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { searchPosts } from "./api";

export function usePostSearch(query, posts, categoryFilter) {
  const debouncedQuery = useDebounce(query.trim(), 200);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(null);
      return;
    }

    let active = true;

    searchPosts(debouncedQuery).then((data) => {
      if (active && data) {
        setSearchResults(data);
      }
    });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  return useMemo(() => {
    const base = searchResults ?? posts;
    return base.filter((post) => !categoryFilter || post.category === categoryFilter);
  }, [categoryFilter, posts, searchResults]);
}

export function useReadTime(content) {
  return useMemo(() => estimateReadTime(content), [content]);
}
