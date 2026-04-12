"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface ProductoCatalogo {
  id: number;
  nombre: string;
  precioNacional?: number;
  precioDolar?: number;
  moneda?: string;
  fotoUrl?: string;
}

interface LineaPedido {
  _key: number;
  productoId?: number;
  nombre: string;
  cantidad: number;
  precio: number;
  esCatalogo: boolean;
}

interface Proveedor {
  id: number;
  razonSocial: string;
}

const SIMBOLO: Record<string, string> = {
  PEN: "S/", USD: "$", COP: "$", CLP: "$", ARS: "$", BOB: "Bs", BRL: "R$", MXN: "$", EUR: "€",
};

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState("");
  const [catalogo, setCatalogo] = useState<ProductoCatalogo[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lineas, setLineas] = useState<LineaPedido[]>([]);

  useEffect(() => {
    api.getProveedores().then(setProveedores).catch(() => {});
  }, []);

  useEffect(() => {
    if (!proveedorId) { setCatalogo([]); return; }
    setLoadingCatalogo(true);
    api.getProductosProveedor(Number(proveedorId))
      .then(setCatalogo)
      .catch(() => setCatalogo([]))
      .finally(() => setLoadingCatalogo(false));
  }, [proveedorId]);

  const addLineaCatalogo = (producto: ProductoCatalogo) => {
    const precioDefault = producto.precioNacional ?? producto.precioDolar ?? 0;
    const existe = lineas.find((l) => l.productoId === producto.id);
    if (existe) {
      setLineas((l) => l.map((x) => x.productoId === producto.id ? { ...x, cantidad: x.cantidad + 1 } : x));
      return;
    }
    setLineas((l) => [...l, {
      _key: Date.now(),
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precio: precioDefault,
      esCatalogo: true,
    }]);
  };

  const updateLinea = (key: number, field: keyof LineaPedido, value: string | number | boolean) =>
    setLineas((l) => l.map((x) => x._key === key ? { ...x, [field]: value } : x));

  const total = lineas.reduce((acc, l) => acc + l.cantidad * l.precio, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineas.length === 0) { setError("Agrega al menos un producto desde el catálogo"); return; }
    setLoading(true);
    setError("");
    try {
      const fechaHora = fecha && hora
        ? new Date(`${fecha}T${hora}:00`).toISOString()
        : new Date().toISOString();
      await api.createPedido({
        numero,
        proveedorId: Number(proveedorId),
        fecha: fechaHora,
        productos: lineas.map(({ nombre, cantidad, precio }) => ({ nombre, cantidad, precio })),
      });
      router.push("/dashboard/pedidos");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pedidos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nuevo pedido</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registra un pedido al proveedor</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clipboard-list text-blue-400" />Información del pedido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Nro. de pedido <span className="text-red-500">*</span></label>
              <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)}
                placeholder="PED-0004" required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Proveedor <span className="text-red-500">*</span></label>
              <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required className={inputCls}>
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Fecha <span className="text-red-500">*</span></label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {proveedorId && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-store text-blue-400" />Catálogo del proveedor
              <span className="text-slate-300 font-normal normal-case">— haz clic para agregar al pedido</span>
            </h2>
            {loadingCatalogo ? (
              <div className="py-4 text-center text-slate-400 text-sm"><i className="fa-solid fa-spinner fa-spin mr-2" />Cargando catálogo...</div>
            ) : catalogo.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Este proveedor no tiene productos en su catálogo.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {catalogo.map((p) => {
                  const enPedido = lineas.find((l) => l.productoId === p.id);
                  const sim = SIMBOLO[p.moneda ?? "PEN"] ?? p.moneda ?? "S/";
                  return (
                    <button key={p.id} type="button" onClick={() => addLineaCatalogo(p)}
                      className={`relative text-left rounded-xl border overflow-hidden transition cursor-pointer group
                        ${enPedido ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"}`}>
                      {p.fotoUrl ? (
                        <img src={p.fotoUrl} alt={p.nombre} className="w-full h-24 object-cover" />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                          <i className="fa-solid fa-image text-slate-300 text-xl" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-slate-800 truncate">{p.nombre}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {p.precioNacional != null && (
                            <span className="text-xs text-blue-700 font-semibold">{sim} {Number(p.precioNacional).toFixed(2)}</span>
                          )}
                          {p.precioNacional != null && p.precioDolar != null && (
                            <span className="text-slate-300 text-xs">·</span>
                          )}
                          {p.precioDolar != null && (
                            <span className="text-xs text-emerald-700 font-semibold">$ {Number(p.precioDolar).toFixed(2)}</span>
                          )}
                          {p.precioNacional == null && p.precioDolar == null && (
                            <span className="text-xs text-slate-400">Sin precio</span>
                          )}
                        </div>
                      </div>
                      {enPedido && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#002060] rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{enPedido.cantidad}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {lineas.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-box text-blue-400" />Productos del pedido
            </h2>
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
                <span className="col-span-6 text-xs text-slate-400">Producto</span>
                <span className="col-span-3 text-xs text-slate-400">Cantidad</span>
                <span className="col-span-3 text-xs text-slate-400">Precio unit.</span>
              </div>
              {lineas.map((l) => (
                <div key={l._key} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className={`col-span-12 sm:col-span-6 ${inputCls} bg-blue-50/60`}
                    placeholder="Producto"
                    value={l.nombre}
                    readOnly
                  />
                  <input type="number" min={1}
                    className={`col-span-6 sm:col-span-3 ${inputCls}`}
                    value={l.cantidad}
                    onChange={(e) => updateLinea(l._key, "cantidad", Number(e.target.value))} />
                  <input type="number" min={0} step={0.01}
                    className={`col-span-6 sm:col-span-3 ${inputCls}`}
                    value={l.precio}
                    onChange={(e) => updateLinea(l._key, "precio", Number(e.target.value))} />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <div className="text-sm text-slate-500">
                Importe total: <span className="text-slate-800 font-semibold ml-2">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/pedidos" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">Cancelar</Link>
          <button type="submit" disabled={loading}
            className="bg-[#002060] hover:bg-[#002060] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : <><i className="fa-solid fa-floppy-disk" /> Guardar pedido</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";