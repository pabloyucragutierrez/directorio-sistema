"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Proveedor {
  id: number;
  razonSocial: string;
  pais: string;
  activo: boolean;
  pedidos?: { calidad?: number; respuesta?: number; puntualidad?: number; confianza?: number; presentacion?: number }[];
}

export default function ConsultasPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.getConsultas(search)
        .then(setProveedores)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const calcCalificacion = (p: Proveedor) => {
    if (!p.pedidos || p.pedidos.length === 0) return 0;
    const cals = p.pedidos.filter((ped) => ped.calidad);
    if (cals.length === 0) return 0;
    const suma = cals.reduce((acc, ped) =>
      acc + ((ped.calidad ?? 0) + (ped.respuesta ?? 0) + (ped.puntualidad ?? 0) + (ped.confianza ?? 0) + (ped.presentacion ?? 0)) / 5, 0);
    return Math.round((suma / cals.length) * 10) / 10;
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Consultas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Busca y consulta proveedores y pedidos</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o país..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">País</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pedidos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Calificación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />Cargando...</td></tr>
              ) : proveedores.map((d) => (
                <tr key={d.id} className="hover:bg-blue-50/50 transition">
                  <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">{d.razonSocial}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    <i className="fa-solid fa-location-dot mr-1.5 text-slate-300" />{d.pais}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    <i className="fa-solid fa-clipboard-list mr-1.5 text-slate-300" />{d.pedidos?.length ?? 0}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-star text-amber-400 text-xs" />
                      <span className="text-slate-700 text-sm">{calcCalificacion(d).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${d.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      <i className={`fa-solid fa-circle text-[6px] ${d.activo ? "text-emerald-500" : "text-slate-400"}`} />
                      {d.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}