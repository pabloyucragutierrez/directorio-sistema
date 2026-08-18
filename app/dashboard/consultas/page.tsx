"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Proveedor {
  id: number;
  razonSocial: string;
  pais: string;
  rubro?: string | null;
  ciudad?: string | null;
  subrubro?: string | null;
  activo: boolean;
  pedidos?: {
    calidad?: number;
    respuesta?: number;
    puntualidad?: number;
    confianza?: number;
    presentacion?: number;
  }[];
}

interface ConsultasPagedResponse {
  items: Proveedor[];
  hasMore: boolean;
  nextCursor: number | null;
  total: number;
}

export default function ConsultasPage() {
  const pageSize = 20;

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState("");
  const [rubro, setRubro] = useState<string>("");
  const [ciudad, setCiudad] = useState("");
  const [subrubro, setSubrubro] = useState("");
  const [rubros, setRubros] = useState<string[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    api
      .getRubros()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setRubros(data.filter((x) => typeof x === "string") as string[]);
      })
      .catch(() => {
        if (!mounted) return;
        setRubros([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoadingInitial(true);

      try {
        const data = await api.getConsultasPaged({
          search: search.trim() || undefined,
          rubro: rubro || undefined,
          ciudad: ciudad.trim() || undefined,
          subrubro: subrubro.trim() || undefined,
          limit: pageSize,
        }) as ConsultasPagedResponse;

        if (requestId !== requestIdRef.current) return;

        setProveedores(data.items);
        setCursor(data.nextCursor);
        setHasMore(Boolean(data.hasMore));
        setTotal(Number.isFinite(data.total) ? data.total : null);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setProveedores([]);
        setCursor(null);
        setHasMore(false);
        setTotal(null);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoadingInitial(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [ciudad, rubro, search, subrubro]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || loadingInitial || loadingMore || !hasMore || cursor == null) return;

        setLoadingMore(true);
        try {
          const data = await api.getConsultasPaged({
            search: search.trim() || undefined,
            rubro: rubro || undefined,
            ciudad: ciudad.trim() || undefined,
            subrubro: subrubro.trim() || undefined,
            cursor,
            limit: pageSize,
          }) as ConsultasPagedResponse;

          setProveedores((prev) => [...prev, ...data.items]);
          setCursor(data.nextCursor);
          setHasMore(Boolean(data.hasMore));
        } catch {
          setHasMore(false);
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [ciudad, cursor, hasMore, loadingInitial, loadingMore, rubro, search, subrubro]);

  const calcCalificacion = (proveedor: Proveedor) => {
    if (!proveedor.pedidos || proveedor.pedidos.length === 0) return 0;
    const calificaciones = proveedor.pedidos.filter((pedido) => pedido.calidad);
    if (calificaciones.length === 0) return 0;

    const suma = calificaciones.reduce(
      (acc, pedido) =>
        acc +
        ((pedido.calidad ?? 0) +
          (pedido.respuesta ?? 0) +
          (pedido.puntualidad ?? 0) +
          (pedido.confianza ?? 0) +
          (pedido.presentacion ?? 0)) / 5,
      0,
    );

    return Math.round((suma / calificaciones.length) * 10) / 10;
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Consultas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Busca y consulta proveedores y pedidos</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, rubro o pais..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <select
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">Todos los rubros</option>
              {rubros.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <input
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Buscar por ciudad"
            className="w-full sm:w-52 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />

          <input
            value={subrubro}
            onChange={(e) => setSubrubro(e.target.value)}
            placeholder="Buscar por subrubro"
            className="w-full sm:w-52 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
            <i className="fa-solid fa-database text-slate-400" />
            <span>Total:</span>
            <span className="font-semibold text-slate-800">{total ?? (loadingInitial ? "…" : 0)}</span>
          </div>
        </div>
      </div>

      <div className="sm:hidden mb-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 w-fit">
        <i className="fa-solid fa-database text-slate-400" />
        <span>Total:</span>
        <span className="font-semibold text-slate-800">{total ?? (loadingInitial ? "…" : 0)}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rubro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pais</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pedidos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Calificacion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingInitial ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />
                    Cargando...
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-box-open text-2xl mb-2 block" />
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">{proveedor.razonSocial}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{proveedor.rubro ?? "-"}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      <i className="fa-solid fa-location-dot mr-1.5 text-slate-300" />
                      {proveedor.pais}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      <i className="fa-solid fa-clipboard-list mr-1.5 text-slate-300" />
                      {proveedor.pedidos?.length ?? 0}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-star text-amber-400 text-xs" />
                        <span className="text-slate-700 text-sm">{calcCalificacion(proveedor).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${proveedor.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <i className={`fa-solid fa-circle text-[6px] ${proveedor.activo ? "text-emerald-500" : "text-slate-400"}`} />
                        {proveedor.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/consultas/${proveedor.id}`}
                        className="text-slate-400 hover:text-blue-600 transition font-medium inline-flex items-center gap-1 text-xs"
                      >
                        Ver <i className="fa-solid fa-arrow-right text-[10px]" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={sentinelRef} className="py-6 text-center text-sm text-slate-400">
        {loadingMore ? (
          <span className="inline-flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin" />
            Cargando mas...
          </span>
        ) : !loadingInitial && proveedores.length > 0 && !hasMore ? (
          <span>Fin de la lista</span>
        ) : null}
      </div>
    </div>
  );
}
