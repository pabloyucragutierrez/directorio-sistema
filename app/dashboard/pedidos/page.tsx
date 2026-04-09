"use client";
import Link from "next/link";
import { useState } from "react";

const pedidos = [
  { id: 1, numero: "PED-0001", proveedor: "Importaciones XYZ S.A.", fecha: "2025-04-01", hora: "09:30", importe: 1500.00, estado: "Pendiente" },
  { id: 2, numero: "PED-0002", proveedor: "Distribuidora Global Ltda.", fecha: "2025-04-02", hora: "14:00", importe: 3200.50, estado: "Aceptado" },
  { id: 3, numero: "PED-0003", proveedor: "Tech Supplies Inc.", fecha: "2025-04-03", hora: "11:15", importe: 850.00, estado: "Rechazado" },
];

const estadoStyle: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700",
  Aceptado: "bg-emerald-50 text-emerald-700",
  Rechazado: "bg-red-50 text-red-600",
  Agotado: "bg-slate-100 text-slate-500",
};

const estadoIcon: Record<string, string> = {
  Pendiente: "fa-solid fa-clock",
  Aceptado: "fa-solid fa-circle-check",
  Rechazado: "fa-solid fa-circle-xmark",
  Agotado: "fa-solid fa-ban",
};

export default function PedidosPage() {
  const [search, setSearch] = useState("");
  const filtered = pedidos.filter((p) =>
    p.numero.toLowerCase().includes(search.toLowerCase()) ||
    p.proveedor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Pedidos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control de pedidos a proveedores</p>
        </div>
        <Link
          href="/dashboard/pedidos/nuevo"
          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition"
        >
          <i className="fa-solid fa-plus" />
          Nuevo pedido
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido o proveedor..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nro. Pedido</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Importe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-blue-50/50 transition">
                <td className="px-4 py-3.5 font-mono text-xs text-blue-700 font-semibold">{p.numero}</td>
                <td className="px-4 py-3.5 text-slate-700">{p.proveedor}</td>
                <td className="px-4 py-3.5 text-slate-500">
                  <i className="fa-regular fa-calendar mr-1.5 text-slate-300" />
                  {p.fecha} <span className="text-slate-300 ml-1">{p.hora}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-700 font-medium">S/ {p.importe.toFixed(2)}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${estadoStyle[p.estado] ?? ""}`}>
                    <i className={`${estadoIcon[p.estado]} text-[10px]`} />
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/dashboard/pedidos/${p.id}`} className="text-xs text-slate-400 hover:text-blue-600 transition font-medium inline-flex items-center gap-1">
                    Ver <i className="fa-solid fa-arrow-right text-[10px]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}