"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface Stat {
  label: string;
  value: string;
  color: string;
  icon: string;
}

interface ReporteRow {
  id: number;
  proveedor: string;
  pais: string;
  total: number;
  completados: number;
  calificacion: number;
}

interface ReportePagedResponse {
  items: ReporteRow[];
  hasMore: boolean;
  nextCursor: number | null;
}

export default function ReportesPage() {
  const pageSize = 20;

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [stats, setStats] = useState<Stat[]>([]);
  const [reporte, setReporte] = useState<ReporteRow[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    void fetchStatsAndFirstPage();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || loadingInitial || loadingMore || !hasMore || cursor == null) return;

        setLoadingMore(true);
        try {
          const data = await api.getReportePaged({
            desde: desde || undefined,
            hasta: hasta || undefined,
            cursor,
            limit: pageSize,
          }) as ReportePagedResponse;

          setReporte((prev) => [...prev, ...data.items]);
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
  }, [cursor, desde, hasta, hasMore, loadingInitial, loadingMore]);

  const fetchStatsAndFirstPage = async (from?: string, to?: string) => {
    const requestId = ++requestIdRef.current;
    setLoadingStats(true);
    setLoadingInitial(true);

    try {
      const [statsData, reporteData] = await Promise.all([
        api.getStats(),
        api.getReportePaged({
          desde: from,
          hasta: to,
          limit: pageSize,
        }),
      ]);

      if (requestId !== requestIdRef.current) return;

      setStats([
        { label: "Total proveedores", value: String(statsData.totalProveedores), color: "text-blue-700", icon: "fa-solid fa-building" },
        { label: "Pedidos este mes", value: String(statsData.pedidosEsteMes), color: "text-slate-800", icon: "fa-solid fa-clipboard-list" },
        { label: "Calificacion promedio", value: String(statsData.calificacionPromedio), color: "text-amber-600", icon: "fa-solid fa-star" },
        { label: "Tasa de entrega", value: `${statsData.tasaEntrega}%`, color: "text-emerald-700", icon: "fa-solid fa-truck" },
      ]);

      const paged = reporteData as ReportePagedResponse;
      setReporte(paged.items);
      setCursor(paged.nextCursor);
      setHasMore(Boolean(paged.hasMore));
    } catch {
      if (requestId !== requestIdRef.current) return;
      setStats([]);
      setReporte([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoadingStats(false);
      setLoadingInitial(false);
    }
  };

  const handleFiltrar = () => {
    setReporte([]);
    setCursor(null);
    setHasMore(true);
    void fetchStatsAndFirstPage(desde || undefined, hasta || undefined);
  };

  const inputCls = "bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition w-full";

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Reportes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de actividad del directorio</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs text-slate-500 mb-1"><i className="fa-regular fa-calendar mr-1" />Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
        </div>
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs text-slate-500 mb-1"><i className="fa-regular fa-calendar mr-1" />Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
        </div>
        <button onClick={handleFiltrar} className="bg-[#002060] hover:bg-[#002060] text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2">
          <i className="fa-solid fa-filter" />
          Filtrar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {loadingStats ? (
          <div className="col-span-4 text-center text-slate-400 py-6">
            <i className="fa-solid fa-spinner fa-spin text-2xl" />
          </div>
        ) : stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 leading-tight">{stat.label}</p>
              <i className={`${stat.icon} ${stat.color} text-sm opacity-60`} />
            </div>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
              {stat.icon === "fa-solid fa-star" && <i className="fa-solid fa-star text-amber-400 text-lg ml-1" />}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-blue-400" />
            Rendimiento por proveedor
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pedidos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Completados</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tasa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Calificacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingInitial ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />
                    Cargando...
                  </td>
                </tr>
              ) : reporte.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No hay datos disponibles</td>
                </tr>
              ) : (
                reporte.map((row) => {
                  const tasa = row.total > 0 ? Math.round((row.completados / row.total) * 100) : 0;
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-5 py-3.5 text-slate-800 font-medium whitespace-nowrap">{row.proveedor}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{row.total}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{row.completados}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#002060] rounded-full" style={{ width: `${tasa}%` }} />
                          </div>
                          <span className="text-slate-500 text-xs">{tasa}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <i className="fa-solid fa-star text-amber-400 text-xs" />
                          <span className="text-slate-700 ml-0.5">{row.calificacion.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        ) : !loadingInitial && reporte.length > 0 && !hasMore ? (
          <span>Fin de la lista</span>
        ) : null}
      </div>
    </div>
  );
}
