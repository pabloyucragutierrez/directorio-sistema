"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

interface Pedido {
  id: number;
  numero: string;
  proveedor: { razonSocial: string };
  fecha: string;
  estado: string;
  productos: { cantidad: number; precio: number }[];
}

interface PedidosPagedResponse {
  items: Pedido[];
  hasMore: boolean;
  nextCursor: number | null;
}

const estadoStyle: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700",
  ACEPTADO: "bg-emerald-50 text-emerald-700",
  RECHAZADO: "bg-red-50 text-red-600",
  AGOTADO: "bg-slate-100 text-slate-500",
};

const estadoIcon: Record<string, string> = {
  PENDIENTE: "fa-solid fa-clock",
  ACEPTADO: "fa-solid fa-circle-check",
  RECHAZADO: "fa-solid fa-circle-xmark",
  AGOTADO: "fa-solid fa-ban",
};

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADO: "Aceptado",
  RECHAZADO: "Rechazado",
  AGOTADO: "Agotado",
};

export default function PedidosPage() {
  const pageSize = 20;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoadingInitial(true);
      setError("");

      try {
        const data = await api.getPedidosPaged({
          search: search.trim() || undefined,
          limit: pageSize,
        }) as PedidosPagedResponse;

        if (requestId !== requestIdRef.current) return;

        setPedidos(data.items);
        setCursor(data.nextCursor);
        setHasMore(Boolean(data.hasMore));
      } catch {
        if (requestId !== requestIdRef.current) return;
        setPedidos([]);
        setCursor(null);
        setHasMore(false);
        setError("Error al cargar pedidos");
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoadingInitial(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || loadingInitial || loadingMore || !hasMore || cursor == null) return;

        setLoadingMore(true);
        try {
          const data = await api.getPedidosPaged({
            search: search.trim() || undefined,
            cursor,
            limit: pageSize,
          }) as PedidosPagedResponse;

          setPedidos((prev) => [...prev, ...data.items]);
          setCursor(data.nextCursor);
          setHasMore(Boolean(data.hasMore));
        } catch {
          setError("Error al cargar mas pedidos");
          setHasMore(false);
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, hasMore, loadingInitial, loadingMore, search]);

  const calcImporte = (productos: { cantidad: number; precio: number }[]) =>
    productos.reduce((acc, producto) => acc + producto.cantidad * producto.precio, 0);

  const handleDelete = async (pedido: Pedido) => {
    if (!confirm(`Estas seguro de eliminar el pedido "${pedido.numero}"? Esta accion no se puede deshacer.`)) return;
    setDeletingId(pedido.id);
    setError("");

    try {
      await api.deletePedido(pedido.id);
      setPedidos((prev) => prev.filter((item) => item.id !== pedido.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar pedido");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Pedidos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control de pedidos a proveedores</p>
        </div>
        <Link
          href="/dashboard/pedidos/nuevo"
          className="flex items-center gap-1.5 bg-[#002060] hover:bg-[#002060] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition whitespace-nowrap"
        >
          <i className="fa-solid fa-plus" />
          <span className="hidden sm:inline">Nuevo pedido</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido o proveedor..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nro. Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Importe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingInitial ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />
                    Cargando...
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    <i className="fa-solid fa-box-open text-2xl mb-2 block" />
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-3.5 font-mono text-xs text-blue-700 font-semibold whitespace-nowrap">{pedido.numero}</td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{pedido.proveedor.razonSocial}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      <i className="fa-regular fa-calendar mr-1.5 text-slate-300" />
                      {new Date(pedido.fecha).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">S/ {calcImporte(pedido.productos).toFixed(2)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${estadoStyle[pedido.estado] ?? ""}`}>
                        <i className={`${estadoIcon[pedido.estado]} text-[10px]`} />
                        {estadoLabel[pedido.estado] ?? pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/dashboard/pedidos/${pedido.id}`} className="text-xs text-slate-400 hover:text-blue-600 transition font-medium inline-flex items-center gap-1">
                          Ver <i className="fa-solid fa-arrow-right text-[10px]" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pedido)}
                          disabled={deletingId === pedido.id}
                          className="text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-40"
                          title="Eliminar pedido"
                        >
                          {deletingId === pedido.id ? <i className="fa-solid fa-spinner fa-spin text-sm" /> : <i className="fa-solid fa-trash text-sm" />}
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

      <div ref={sentinelRef} className="py-6 text-center text-sm text-slate-400">
        {loadingMore ? (
          <span className="inline-flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin" />
            Cargando mas...
          </span>
        ) : !loadingInitial && pedidos.length > 0 && !hasMore ? (
          <span>Fin de la lista</span>
        ) : null}
      </div>
    </div>
  );
}
