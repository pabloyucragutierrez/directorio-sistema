"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Proveedor {
  id: number;
  razonSocial: string;
  pais: string;
  ciudad: string;
  ruc: string;
  email: string;
  activo: boolean;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => fetchProveedores(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProveedores = async (q?: string) => {
    try {
      setLoading(true);
      const data = await api.getProveedores(q);
      setProveedores(data);
    } catch {
      setError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p: Proveedor) => {
    if (!confirm(`¿Estás seguro de eliminar a "${p.razonSocial}"? Se eliminarán también sus productos. Esta acción no se puede deshacer.`)) return;
    setDeletingId(p.id);
    setError("");
    try {
      await api.deleteProveedor(p.id);
      setProveedores((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar proveedor";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Proveedores</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona el directorio de proveedores</p>
        </div>
        <Link href="/dashboard/proveedores/nuevo"
          className="flex items-center gap-1.5 bg-[#002060] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition whitespace-nowrap">
          <i className="fa-solid fa-plus" />
          <span className="hidden sm:inline">Nuevo proveedor</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, país, RUC..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />{error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Razón social</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">País / Ciudad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">RUC / NIT / RUT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />Cargando...
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-box-open text-2xl mb-2 block" />No se encontraron proveedores
                  </td>
                </tr>
              ) : (
                proveedores.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">{p.razonSocial}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.pais} <span className="text-slate-300">·</span> {p.ciudad}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-xs whitespace-nowrap">{p.ruc}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${p.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <i className={`fa-solid fa-circle text-[6px] ${p.activo ? "text-emerald-500" : "text-slate-400"}`} />
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/dashboard/proveedores/${p.id}`} className="text-slate-400 hover:text-blue-600 transition font-medium inline-flex items-center gap-1 text-xs">
                          Ver <i className="fa-solid fa-arrow-right text-[10px]" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-40"
                          title="Eliminar proveedor"
                        >
                          {deletingId === p.id
                            ? <i className="fa-solid fa-spinner fa-spin text-sm" />
                            : <i className="fa-solid fa-trash text-sm" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
