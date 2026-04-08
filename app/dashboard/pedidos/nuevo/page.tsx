"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Producto { id: number; nombre: string; cantidad: number; precio: number; }

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([{ id: 1, nombre: "", cantidad: 1, precio: 0 }]);

  const addProducto = () => setProductos((p) => [...p, { id: Date.now(), nombre: "", cantidad: 1, precio: 0 }]);
  const removeProducto = (id: number) => setProductos((p) => p.filter((x) => x.id !== id));
  const updateProducto = (id: number, field: keyof Producto, value: string | number) =>
    setProductos((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  const total = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard/pedidos"), 800);
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pedidos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nuevo pedido</h1>
          <p className="text-sm text-slate-500 mt-0.5">Registra un pedido al proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-clipboard-list text-blue-400" />
            Información del pedido
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Nro. de pedido <span className="text-red-500">*</span></label>
              <input type="text" placeholder="PED-0004" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Proveedor <span className="text-red-500">*</span></label>
              <select className={inputCls}>
                <option value="">Seleccionar proveedor</option>
                <option>Importaciones XYZ S.A.</option>
                <option>Distribuidora Global Ltda.</option>
                <option>Tech Supplies Inc.</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Fecha <span className="text-red-500">*</span></label>
              <input type="date" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Hora <span className="text-red-500">*</span></label>
              <input type="time" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-box text-blue-400" />
              Productos
            </h2>
            <button type="button" onClick={addProducto} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer flex items-center gap-1">
              <i className="fa-solid fa-plus" />
              Agregar producto
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-1">
              <span className="col-span-5 text-xs text-slate-400">Producto</span>
              <span className="col-span-3 text-xs text-slate-400">Cantidad</span>
              <span className="col-span-3 text-xs text-slate-400">Precio unit.</span>
              <span className="col-span-1" />
            </div>
            {productos.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
                <input className={`col-span-5 ${inputCls}`} placeholder="Nombre del producto" value={p.nombre} onChange={(e) => updateProducto(p.id, "nombre", e.target.value)} />
                <input type="number" min={1} className={`col-span-3 ${inputCls}`} value={p.cantidad} onChange={(e) => updateProducto(p.id, "cantidad", Number(e.target.value))} />
                <input type="number" min={0} step={0.01} className={`col-span-3 ${inputCls}`} value={p.precio} onChange={(e) => updateProducto(p.id, "precio", Number(e.target.value))} />
                <button type="button" onClick={() => removeProducto(p.id)} className="col-span-1 text-slate-300 hover:text-red-500 transition cursor-pointer flex justify-center">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <div className="text-sm text-slate-500">
              Importe total: <span className="text-slate-800 font-semibold ml-2">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/pedidos" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">Cancelar</Link>
          <button type="submit" disabled={loading} className="bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Guardar pedido</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";