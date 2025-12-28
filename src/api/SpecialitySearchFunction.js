import { useEffect, useRef, useState } from "react";
import api from "./api";

export function useSpecialitySuggestions(token) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef();

  useEffect(() => {
    // cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();

    const trimmed = q.trim();

    // Don't search until 3+ chars
    if (trimmed.length < 3) {
      setItems([]);
      return;
    }

    // Don't hit backend without a token → would trigger AnonymousAuthenticationFilter → 401
    if (!token) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const urlPath = `/specialities/search?q=${encodeURIComponent(trimmed)}&limit=10`;
        const headers = token ? { Authorization: token } : undefined;

        // Useful for matching against backend logs
        console.log("Fetching URL:", `${api.defaults.baseURL}${urlPath}`);

        const { data } = await api.get(urlPath, { headers, signal: controller.signal });
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") console.warn("suggestion error", e);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q, token]);

  return { q, setQ, items, loading };
}