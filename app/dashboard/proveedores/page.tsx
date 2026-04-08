"use client";
import Link from "next/link";
import { useState } from "react";

const proveedores = [
  { id: 1, razonSocial: "Importaciones XYZ S.A.", pais: "Perú", ciudad: "Lima", ruc: "20512345678", email: "contacto@xyz.com", activo: true },
  { id: 2, razonSocial: "Distribuidora Global Ltda.", pais: "Colombia", ciudad: "Bogotá", ruc: "900123456-1", email: "info@global.co", activo: true },
  { id: 3, razonSocial: "Tech Supplies Inc.", pais: "Chile", ciudad: "Santiago", ruc: "76543210-9", email: "ventas@tech.cl", activo: false },
  { id: 4, razonSocial: "Comercial Andina S.R.L.", pais: "Bolivia", ciudad: "La Paz", ruc: "1023456789", email: "andina@gmail.com", activo: true },
];

export default function ProveedoresPage() {
  const [search, setSearch] = useState("");

  const filtered = proveedores.filter((p) =>
    p.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
    p.pais.toLowerCase().includes(search.toLowerCase()) ||
    p.ruc.includes(search)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Proveedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona el directorio de proveedores</p>
        </div>
        <Link
          href="/dashboard/proveedores/nuevo"
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition"
        >
          <i className="fa-solid fa-plus" />
          Nuevo proveedor
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, país, RUC..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Razón social</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">País / Ciudad</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">RUC / NIT / RUT</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/50 transition">
                <td className="px-4 py-3.5 font-medium text-slate-800">{p.razonSocial}</td>
                <td className="px-4 py-3.5 text-slate-500">
                  {p.pais} <span className="text-slate-300">·</span> {p.ciudad}
                </td>
                <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{p.ruc}</td>
                <td className="px-4 py-3.5 text-slate-500">{p.email}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${
                    p.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    <i className={`fa-solid fa-circle text-[6px] ${p.activo ? "text-emerald-500" : "text-slate-400"}`} />
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/dashboard/proveedores/${p.id}`} className="text-xs text-slate-400 hover:text-blue-600 transition font-medium inline-flex items-center gap-1">
                    Ver <i className="fa-solid fa-arrow-right text-[10px]" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  <i className="fa-solid fa-box-open text-2xl mb-2 block" />
                  No se encontraron proveedores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}