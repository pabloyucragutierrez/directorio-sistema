"use client";
import { useState } from "react";

const data = [
  { proveedor: "Importaciones XYZ S.A.", pais: "Perú", pedidos: 12, calificacion: 4.5, activo: true },
  { proveedor: "Distribuidora Global Ltda.", pais: "Colombia", pedidos: 8, calificacion: 3.8, activo: true },
  { proveedor: "Tech Supplies Inc.", pais: "Chile", pedidos: 5, calificacion: 2.9, activo: false },
  { proveedor: "Comercial Andina S.R.L.", pais: "Bolivia", pedidos: 3, calificacion: 4.1, activo: true },
];

export default function ConsultasPage() {
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) =>
    d.proveedor.toLowerCase().includes(search.toLowerCase()) ||
    d.pais.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Consultas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Busca y consulta proveedores y pedidos</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o país..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
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
              {filtered.map((d) => (
                <tr key={d.proveedor} className="hover:bg-blue-50/50 transition">
                  <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">{d.proveedor}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    <i className="fa-solid fa-location-dot mr-1.5 text-slate-300" />{d.pais}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    <i className="fa-solid fa-clipboard-list mr-1.5 text-slate-300" />{d.pedidos}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-star text-amber-400 text-xs" />
                      <span className="text-slate-700 text-sm">{d.calificacion.toFixed(1)}</span>
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