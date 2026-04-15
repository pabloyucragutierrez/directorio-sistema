"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Pedido {
  id: number;
  numero: string;
  proveedor: { razonSocial: string };
  fecha: string;
  estado: string;
  tipoEntrega?: string;
  fechaEntrega?: string;
  entregaPuntual?: boolean;
  pagoRealizado?: boolean;
  importePagado?: number;
  calidad?: number;
  respuesta?: number;
  puntualidad?: number;
  confianza?: number;
  presentacion?: number;
  productos: { nombre: string; cantidad: number; precio: number }[];
}

export default function PedidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [estado, setEstado] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [puntual, setPuntual] = useState("");
  const [pago, setPago] = useState("");
  const [importePagado, setImportePagado] = useState("");
  const [calidad, setCalidad] = useState(0);
  const [respuesta, setRespuesta] = useState(0);
  const [puntualidad, setPuntualidad] = useState(0);
  const [confianza, setConfianza] = useState(0);
  const [presentacion, setPresentacion] = useState(0);

  useEffect(() => {
    api.getPedido(id).then((data) => {
      setPedido(data);
      setEstado(data.estado ?? "");
      setTipoEntrega(data.tipoEntrega ?? "");
      setFechaEntrega(data.fechaEntrega ? data.fechaEntrega.split("T")[0] : "");
      setHoraEntrega(data.fechaEntrega ? data.fechaEntrega.split("T")[1]?.slice(0, 5) : "");
      setPuntual(data.entregaPuntual === true ? "Sí" : data.entregaPuntual === false ? "No" : "");
      setPago(data.pagoRealizado === true ? "Sí" : data.pagoRealizado === false ? "No" : "");
      setImportePagado(data.importePagado?.toString() ?? "");
      setCalidad(data.calidad ?? 0);
      setRespuesta(data.respuesta ?? 0);
      setPuntualidad(data.puntualidad ?? 0);
      setConfianza(data.confianza ?? 0);
      setPresentacion(data.presentacion ?? 0);
    }).catch(() => setError("Error al cargar el pedido"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const fechaEntregaISO = fechaEntrega
        ? new Date(`${fechaEntrega}T${horaEntrega || "00:00"}:00`).toISOString()
        : undefined;

      await api.updatePedido(id, {
        estado: estado || undefined,
        tipoEntrega: tipoEntrega || undefined,
        fechaEntrega: fechaEntregaISO,
        entregaPuntual: puntual === "Sí" ? true : puntual === "No" ? false : undefined,
        pagoRealizado: pago === "Sí" ? true : pago === "No" ? false : undefined,
        importePagado: importePagado ? Number(importePagado) : undefined,
        calidad: calidad || undefined,
        respuesta: respuesta || undefined,
        puntualidad: puntualidad || undefined,
        confianza: confianza || undefined,
        presentacion: presentacion || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pedido) return;
    if (!confirm(`¿Estás seguro de eliminar el pedido "${pedido.numero}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setError("");
    try {
      await api.deletePedido(id);
      router.push("/dashboard/pedidos");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) return <div className="p-6 text-center text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl" /></div>;
  if (!pedido) return <div className="p-6 text-center text-red-500">{error || "Pedido no encontrado"}</div>;

  const total = pedido.productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/pedidos" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{pedido.numero}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            <i className="fa-solid fa-building mr-1" />{pedido.proveedor.razonSocial} ·
            <i className="fa-regular fa-calendar mx-1" />{new Date(pedido.fecha).toLocaleDateString("es-PE")}
          </p>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 disabled:opacity-60 text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
            title="Eliminar pedido"
          >
            {deleting ? <><i className="fa-solid fa-spinner fa-spin" /> Eliminando...</> : <><i className="fa-solid fa-trash" /> Eliminar</>}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"><i className="fa-solid fa-circle-exclamation mr-2" />{error}</div>}

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-box text-blue-400" />Productos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2 text-xs text-slate-400 whitespace-nowrap">Producto</th>
                  <th className="text-right px-5 py-2 text-xs text-slate-400 whitespace-nowrap">Cant.</th>
                  <th className="text-right px-5 py-2 text-xs text-slate-400 whitespace-nowrap">Precio</th>
                  <th className="text-right px-5 py-2 text-xs text-slate-400 whitespace-nowrap">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedido.productos.map((p, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{p.nombre}</td>
                    <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{p.cantidad}</td>
                    <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">S/ {p.precio.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-slate-700 font-medium whitespace-nowrap">S/ {(p.cantidad * p.precio).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={3} className="px-5 py-3 text-right text-sm text-slate-500">Total</td>
                  <td className="px-5 py-3 text-right text-base font-semibold text-slate-800 whitespace-nowrap">S/ {total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-blue-400" />Actualización del pedido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Estado", el: <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}><option value="">Seleccionar</option><option value="ACEPTADO">Aceptado</option><option value="RECHAZADO">Rechazado</option><option value="AGOTADO">Agotado</option></select> },
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

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <i className="fa-solid fa-star text-blue-400" />Calificación del proveedor
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
          <button onClick={handleSave} disabled={saving}
            className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-60 ${saved ? "bg-emerald-600" : "bg-[#002060] hover:bg-[#002060]"}`}>
            {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : saved ? <><i className="fa-solid fa-circle-check" /> Guardado</> : <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";
