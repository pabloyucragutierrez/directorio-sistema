"use client";
import { useState } from "react";
import Link from "next/link";

const pedido = {
  numero: "PED-0002", proveedor: "Distribuidora Global Ltda.", fecha: "2025-04-02", hora: "14:00",
  productos: [
    { nombre: "Camisas manga corta", cantidad: 50, precio: 35.00 },
    { nombre: "Pantalones drill", cantidad: 30, precio: 72.50 },
  ],
  importe: 3200.50,
};

export default function PedidoDetallePage() {
  const [estado, setEstado] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("");
  const [puntual, setPuntual] = useState("");
  const [pago, setPago] = useState("");
  const [importePagado, setImportePagado] = useState("");
  const [calidad, setCalidad] = useState(0);
  const [respuesta, setRespuesta] = useState(0);
  const [puntualidad, setPuntualidad] = useState(0);
  const [confianza, setConfianza] = useState(0);
  const [presentacion, setPresentacion] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const StarRow = ({ label, value, setValue }: { label: string; value: number; setValue: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} type="button" onClick={() => setValue(v)}
            className={`text-xl transition cursor-pointer ${v <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-200"}`}>
            <i className="fa-solid fa-star text-base" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pedidos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{pedido.numero}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            <i className="fa-solid fa-building mr-1" />
            {pedido.proveedor} ·
            <i className="fa-regular fa-calendar mx-1" />
            {pedido.fecha}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-box text-blue-400" />
              Productos
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-2 text-xs text-slate-400">Producto</th>
                <th className="text-right px-5 py-2 text-xs text-slate-400">Cant.</th>
                <th className="text-right px-5 py-2 text-xs text-slate-400">Precio</th>
                <th className="text-right px-5 py-2 text-xs text-slate-400">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedido.productos.map((p) => (
                <tr key={p.nombre}>
                  <td className="px-5 py-3 text-slate-700">{p.nombre}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{p.cantidad}</td>
                  <td className="px-5 py-3 text-right text-slate-500">S/ {p.precio.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-slate-700 font-medium">S/ {(p.cantidad * p.precio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={3} className="px-5 py-3 text-right text-sm text-slate-500">Total</td>
                <td className="px-5 py-3 text-right text-base font-semibold text-slate-800">S/ {pedido.importe.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-blue-400" />
            Actualización del pedido
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Estado", el: <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}><option value="">Seleccionar</option><option>Aceptado</option><option>Rechazado</option><option>Agotado</option></select> },
              { label: "Tipo de entrega", el: <select value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)} className={inputCls}><option value="">Seleccionar</option><option>Completa</option><option>Incompleta</option><option>No entregó</option></select> },
              { label: "Fecha de entrega", el: <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className={inputCls} /> },
              { label: "Hora de entrega", el: <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} className={inputCls} /> },
              { label: "Entrega puntual", el: <select value={puntual} onChange={(e) => setPuntual(e.target.value)} className={inputCls}><option value="">Seleccionar</option><option>Sí</option><option>No</option></select> },
              { label: "Pago realizado", el: <select value={pago} onChange={(e) => setPago(e.target.value)} className={inputCls}><option value="">Seleccionar</option><option>Sí</option><option>No</option></select> },
              { label: "Importe pagado", el: <input type="number" step={0.01} value={importePagado} onChange={(e) => setImportePagado(e.target.value)} placeholder="0.00" className={inputCls} /> },
            ].map(({ label, el }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                {el}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <i className="fa-solid fa-star text-blue-400" />
            Calificación del proveedor
          </h2>
          <div className="divide-y divide-slate-100">
            <StarRow label="Calidad" value={calidad} setValue={setCalidad} />
            <StarRow label="Respuesta" value={respuesta} setValue={setRespuesta} />
            <StarRow label="Puntualidad" value={puntualidad} setValue={setPuntualidad} />
            <StarRow label="Confianza" value={confianza} setValue={setConfianza} />
            <StarRow label="Presentación" value={presentacion} setValue={setPresentacion} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${saved ? "bg-emerald-600" : "bg-blue-700 hover:bg-blue-600"}`}
          >
            {saved ? (
              <><i className="fa-solid fa-circle-check" /> Guardado</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";