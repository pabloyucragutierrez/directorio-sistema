"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export type ProveedorOption = {
  id: number;
  razonSocial: string;
  email?: string | null;
};

type PagedResponse = {
  items: ProveedorOption[];
  hasMore: boolean;
  nextCursor: number | null;
};

export default function ProveedorAsyncSelect(props: {
  selected: ProveedorOption | null;
  onSelect: (proveedor: ProveedorOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  inputClassName: string;
}) {
  const { selected, onSelect, placeholder, disabled, inputClassName } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ProveedorOption[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setLoadingMore(false);

      try {
        const data = (await api.getProveedoresPaged({
          search: query.trim() || undefined,
          limit: 20,
        })) as PagedResponse;

        if (requestId !== requestIdRef.current) return;

        setItems(data.items);
        setCursor(data.nextCursor);
        setHasMore(Boolean(data.hasMore));
      } catch {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setCursor(null);
        setHasMore(false);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loading || loadingMore || !hasMore) return;
        if (cursor == null) return;

        setLoadingMore(true);
        try {
          const data = (await api.getProveedoresPaged({
            search: query.trim() || undefined,
            cursor,
            limit: 20,
          })) as PagedResponse;

          setItems((prev) => [...prev, ...data.items]);
          setCursor(data.nextCursor);
          setHasMore(Boolean(data.hasMore));
        } catch {
          setHasMore(false);
        } finally {
          setLoadingMore(false);
        }
      },
      { root, rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading, loadingMore, open, query]);

  const showValue = open ? query : selected?.razonSocial ?? "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          disabled={disabled}
          value={showValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            if (!open) setOpen(true);
            setQuery(e.target.value);
          }}
          placeholder={placeholder ?? "Buscar proveedor..."}
          className={`${inputClassName} pl-9 pr-9`}
        />
        {selected && !open && !disabled && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            title="Limpiar"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <i className="fa-solid fa-spinner fa-spin text-lg mb-2 block" />
                Cargando...
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">Sin resultados</div>
            ) : (
              <div className="py-1">
                {items.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50/60 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <span className="text-slate-700 truncate">{p.razonSocial}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">#{p.id}</span>
                  </button>
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="py-2 text-center text-xs text-slate-400">
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin" />
                  Cargando mas...
                </span>
              ) : !loading && items.length > 0 && !hasMore ? (
                <span>Fin</span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

