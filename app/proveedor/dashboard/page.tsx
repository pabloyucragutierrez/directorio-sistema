"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getCurrentProveedor, getProveedorToken, removeProveedorToken, removeCurrentProveedor } from "@/lib/api";

interface ProductoPedido {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  numero: string;
  fecha: string;
  estado: string;
  comentario?: string;
  productos: ProductoPedido[];
}

const estadoStyle: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  ACEPTADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  RECHAZADO: "bg-red-50 text-red-600 border-red-200",
  AGOTADO: "bg-slate-100 text-slate-500 border-slate-200",
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

export default function ProveedorDashboardPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [proveedor, setProveedor] = useState<{ razonSocial: string; usuarioAcceso: string } | null>(null);
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);

  useEffect(() => {
    const token = getProveedorToken();
    if (!token) { router.push("/proveedor/login"); return; }
    const p = getCurrentProveedor();
    setProveedor(p);
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await api.proveedorMisPedidos();
      setPedidos(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (id: number, accion: 'ACEPTADO' | 'RECHAZADO') => {
    setRespondiendo(id);
    try {
      await api.proveedorResponder(id, accion);
      setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: accion } : p));
    } catch {
      // silencioso
    } finally {
      setRespondiendo(null);
    }
  };

  const handleLogout = () => {
    removeProveedorToken();
    removeCurrentProveedor();
    router.push("/proveedor/login");
  };

  const pendientes = pedidos.filter((p) => p.estado === 'PENDIENTE');
  const respondidos = pedidos.filter((p) => p.estado !== 'PENDIENTE');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-blue-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{proveedor?.razonSocial ?? "Proveedor"}</p>
          <p className="text-blue-300 text-xs">{proveedor?.usuarioAcceso}</p>
        </div>
        <button onClick={handleLogout}
          className="text-blue-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-sm">
          <i className="fa-solid fa-right-from-bracket" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </header>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Mis pedidos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Revisa y responde los pedidos recibidos</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <i className="fa-solid fa-clipboard-list text-4xl mb-3 block" />
            <p className="text-sm">No tienes pedidos aún</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pendientes */}
            {pendientes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-clock text-amber-400" />
                  Pendientes de respuesta ({pendientes.length})
                </p>
                <div className="space-y-3">
                  {pendientes.map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      abierto={pedidoAbierto === pedido.id}
                      onToggle={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}
                      respondiendo={respondiendo === pedido.id}
                      onResponder={handleResponder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Respondidos */}
            {respondidos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-history text-slate-400" />
                  Historial ({respondidos.length})
                </p>
                <div className="space-y-3">
                  {respondidos.map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      abierto={pedidoAbierto === pedido.id}
                      onToggle={() => setPedidoAbierto(pedidoAbierto === pedido.id ? null : pedido.id)}
                      respondiendo={false}
                      onResponder={handleResponder}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PedidoCard({ pedido, abierto, onToggle, respondiendo, onResponder }: {
  pedido: Pedido;
  abierto: boolean;
  onToggle: () => void;
  respondiendo: boolean;
  onResponder: (id: number, accion: 'ACEPTADO' | 'RECHAZADO') => void;
}) {
  const total = pedido.productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <p className="text-sm font-semibold text-blue-700 font-mono">{pedido.numero}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              <i className="fa-regular fa-calendar mr-1" />
              {new Date(pedido.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${estadoStyle[pedido.estado] ?? ""}`}>
            <i className={`${estadoIcon[pedido.estado]} text-[10px]`} />
            {estadoLabel[pedido.estado] ?? pedido.estado}
          </span>
          <i className={`fa-solid fa-chevron-down text-slate-300 text-xs transition-transform ${abierto ? "rotate-180" : ""}`} />
        </div>
      </button>

      {abierto && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
          {/* Productos */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Productos</p>
            <div className="space-y-2">
              {pedido.productos.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 font-medium">{p.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <i className="fa-solid fa-hashtag text-[10px] mr-1" />
                      Cant: <span className="font-semibold text-slate-600">{p.cantidad}</span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                    S/ {(p.cantidad * p.precio).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-100">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-base font-semibold text-slate-800">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Comentario */}
          {pedido.comentario && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-comment-dots" />Comentario
              </p>
              <p className="text-sm text-amber-800">{pedido.comentario}</p>
            </div>
          )}

          {/* Botones de acción solo si está pendiente */}
          {pedido.estado === 'PENDIENTE' && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => onResponder(pedido.id, 'RECHAZADO')}
                disabled={respondiendo}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition cursor-pointer disabled:opacity-50"
              >
                {respondiendo ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-xmark" />}
                Rechazar
              </button>
              <button
                onClick={() => onResponder(pedido.id, 'ACEPTADO')}
                disabled={respondiendo}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition cursor-pointer disabled:opacity-50"
              >
                {respondiendo ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />}
                Aceptar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}