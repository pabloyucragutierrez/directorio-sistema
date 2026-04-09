"use client";
import { useState } from "react";

const stats = [
  { label: "Total proveedores", value: "24", color: "text-blue-700", icon: "fa-solid fa-building" },
  { label: "Pedidos este mes", value: "38", color: "text-slate-800", icon: "fa-solid fa-clipboard-list" },
  { label: "Calificación promedio", value: "4.1", color: "text-amber-600", icon: "fa-solid fa-star" },
  { label: "Tasa de entrega", value: "87%", color: "text-emerald-700", icon: "fa-solid fa-truck" },
];

const pedidos = [
  { proveedor: "Importaciones XYZ S.A.", total: 12, completados: 11, calificacion: 4.5 },
  { proveedor: "Distribuidora Global Ltda.", total: 8, completados: 6, calificacion: 3.8 },
  { proveedor: "Tech Supplies Inc.", total: 5, completados: 3, calificacion: 2.9 },
  { proveedor: "Comercial Andina S.R.L.", total: 3, completados: 3, calificacion: 4.1 },
];

export default function ReportesPage() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const inputCls = "bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition w-full";

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Reportes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de actividad del directorio</p>
      </div>

      {/* Filtros — apilados en móvil */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs text-slate-500 mb-1">
            <i className="fa-regular fa-calendar mr-1" />Desde
          </label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputCls} />
        </div>
        <div className="flex-1 sm:flex-none">
          <label className="block text-xs text-slate-500 mb-1">
            <i className="fa-regular fa-calendar mr-1" />Hasta
          </label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputCls} />
        </div>
        <button className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2">
          <i className="fa-solid fa-filter" />Filtrar
        </button>
      </div>

      {/* Stats — 2 cols en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 leading-tight">{s.label}</p>
              <i className={`${s.icon} ${s.color} text-sm opacity-60`} />
            </div>
            <p className={`text-2xl font-semibold ${s.color}`}>
              {s.value}{s.icon === "fa-solid fa-star" && <i className="fa-solid fa-star text-amber-400 text-lg ml-1" />}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-chart-bar text-blue-400" />Rendimiento por proveedor
          </h2>
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer flex items-center gap-1">
            <i className="fa-solid fa-download text-[10px]" />Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pedidos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Completados</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tasa</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Calificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.map((p) => {
                const tasa = Math.round((p.completados / p.total) * 100);
                return (
                  <tr key={p.proveedor} className="hover:bg-blue-50/50 transition">
                    <td className="px-5 py-3.5 text-slate-800 font-medium whitespace-nowrap">{p.proveedor}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{p.total}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{p.completados}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${tasa}%` }} />
                        </div>
                        <span className="text-slate-500 text-xs">{tasa}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-star text-amber-400 text-xs" />
                        <span className="text-slate-700 ml-0.5">{p.calificacion.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}