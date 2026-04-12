"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

const MONEDAS = [
  { value: "PEN", label: "S/ — Sol peruano" },
  { value: "USD", label: "$ — Dólar estadounidense" },
  { value: "COP", label: "$ — Peso colombiano" },
  { value: "CLP", label: "$ — Peso chileno" },
  { value: "ARS", label: "$ — Peso argentino" },
  { value: "BOB", label: "Bs — Boliviano" },
  { value: "BRL", label: "R$ — Real brasileño" },
  { value: "MXN", label: "$ — Peso mexicano" },
  { value: "EUR", label: "€ — Euro" },
];

const SIMBOLO: Record<string, string> = {
  PEN: "S/", USD: "$", COP: "$", CLP: "$", ARS: "$", BOB: "Bs", BRL: "R$", MXN: "$", EUR: "€",
};

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioNacional?: number;
  precioDolar?: number;
  moneda?: string;
  fotoUrl?: string;
}

interface Proveedor {
  id: number; razonSocial: string; pais: string; ciudad: string;
  direccion?: string; distrito?: string; codigoPostal?: string; referencia?: string;
  rubro?: string; subrubro?: string; entrega?: string; email?: string; ruc?: string;
  licencia?: string; copiaRucUrl?: string; copiaLicenciaUrl?: string;
  telefono?: string; whatsapp?: string; representante?: string; dni?: string;
  telefonoRep?: string; copiaDniUrl?: string; formaPago?: string; datosPago?: string;
  activo: boolean; usuarioAcceso?: string;
  pedidos?: { calidad?: number; respuesta?: number; puntualidad?: number; confianza?: number; presentacion?: number }[];
}

const ENTREGA_LABEL: Record<string, string> = {
  incluye_delivery: "✅ Incluye delivery a domicilio",
  no_incluye_delivery: "❌ No incluye delivery a domicilio",
  consultar: "💬 Consultar disponibilidad",
};

function FilePreview({ url, label }: { url?: string; label: string }) {
  if (!url) return <span className="text-sm text-slate-400">—</span>;
  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('/raw/');
  return (
    <div className="flex items-center gap-2">
      {isPdf ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition">
          <i className="fa-solid fa-file-pdf text-red-500" />{label}
          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={label} className="h-16 w-auto rounded-lg border border-slate-200 object-cover hover:opacity-80 transition" />
        </a>
      )}
    </div>
  );
}

function calcCalificacionPromedio(pedidos?: Proveedor['pedidos']) {
  if (!pedidos || pedidos.length === 0) return null;
  const conCal = pedidos.filter((p) => p.calidad);
  if (conCal.length === 0) return null;
  const suma = conCal.reduce((acc, p) =>
    acc + ((p.calidad ?? 0) + (p.respuesta ?? 0) + (p.puntualidad ?? 0) + (p.confianza ?? 0) + (p.presentacion ?? 0)) / 5, 0);
  return Math.round((suma / conCal.length) * 10) / 10;
}

function ProductoModal({ proveedorId, editando, onClose, onSaved }: {
  proveedorId: number; editando: Producto | null; onClose: () => void; onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(editando?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? "");
  const [moneda, setMoneda] = useState(editando?.moneda ?? "PEN");
  const [precioNacional, setPrecioNacional] = useState(editando?.precioNacional?.toString() ?? "");
  const [precioDolar, setPrecioDolar] = useState(editando?.precioDolar?.toString() ?? "");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(editando?.fotoUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFoto = (file: File | null) => {
    setFoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!nombre) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("nombre", nombre);
      if (descripcion.trim()) fd.append("descripcion", descripcion.trim());
      if (moneda) fd.append("moneda", moneda);
      if (precioNacional) fd.append("precioNacional", precioNacional);
      if (precioDolar) fd.append("precioDolar", precioDolar);
      if (foto) fd.append("foto", foto);
      if (editando) {
        await api.updateProducto(proveedorId, editando.id, fd);
      } else {
        await api.createProducto(proveedorId, fd);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const simbolo = SIMBOLO[moneda] ?? moneda;
  const inputId = "foto-producto-modal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-800">
            {editando ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <i className="fa-solid fa-circle-exclamation mr-2" />{error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del producto..." rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={inputCls}>
              {MONEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Precio nacional
                <span className="text-slate-400 font-normal ml-1">({simbolo})</span>
              </label>
              <input type="number" min={0} step={0.01} value={precioNacional}
                onChange={(e) => setPrecioNacional(e.target.value)}
                placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Precio dólar
                <span className="text-slate-400 font-normal ml-1">($)</span>
              </label>
              <input type="number" min={0} step={0.01} value={precioDolar}
                onChange={(e) => setPrecioDolar(e.target.value)}
                placeholder="0.00" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Foto</label>
            <label
              htmlFor={inputId}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFoto(e.dataTransfer.files?.[0] ?? null); }}
              className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden
                ${isDragging ? "border-blue-400 bg-blue-50" : preview ? "border-slate-200" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition">
                    <i className="fa-solid fa-arrow-up-from-bracket text-white text-xl mb-1" />
                    <span className="text-white text-xs font-medium">Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <i className="fa-solid fa-cloud-arrow-up text-slate-300 text-2xl" />
                  <span className="text-xs text-slate-400">Arrastra o haz clic para subir</span>
                </div>
              )}
            </label>
            <input id={inputId} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
              onChange={(e) => handleFoto(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#002060] hover:bg-[#002060] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : <><i className="fa-solid fa-floppy-disk" /> Guardar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductosTab({ proveedorId }: { proveedorId: number }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await api.getProductosProveedor(proveedorId);
      setProductos(data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchProductos(); }, [proveedorId]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setDeletingId(id);
    try {
      await api.deleteProducto(proveedorId, id);
      setProductos((p) => p.filter((x) => x.id !== id));
    } catch { } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{productos.length} producto{productos.length !== 1 ? "s" : ""} en el catálogo</p>
        <button onClick={() => { setEditando(null); setShowModal(true); }}
          className="flex items-center gap-1.5 bg-[#002060] hover:bg-[#002060] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition cursor-pointer">
          <i className="fa-solid fa-plus" /> Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl" /></div>
      ) : productos.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <i className="fa-solid fa-box-open text-3xl mb-3 block" />
          <p className="text-sm">Este proveedor no tiene productos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productos.map((p) => {
            const sim = SIMBOLO[p.moneda ?? "PEN"] ?? p.moneda ?? "S/";
            return (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                {p.fotoUrl ? (
                  <img src={p.fotoUrl} alt={p.nombre} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                    <i className="fa-solid fa-image text-2xl text-slate-300" />
                  </div>
                )}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.nombre}</p>
                      {p.descripcion && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{p.descripcion}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.precioNacional != null && (
                          <span className="text-xs font-semibold text-blue-700">
                            {sim} {Number(p.precioNacional).toFixed(2)}
                          </span>
                        )}
                        {p.precioNacional != null && p.precioDolar != null && (
                          <span className="text-slate-300 text-xs">·</span>
                        )}
                        {p.precioDolar != null && (
                          <span className="text-xs font-semibold text-emerald-700">
                            $ {Number(p.precioDolar).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      <button onClick={() => { setEditando(p); setShowModal(true); }}
                        className="text-slate-400 hover:text-blue-600 transition cursor-pointer">
                        <i className="fa-solid fa-pen-to-square text-sm" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-40">
                        <i className="fa-solid fa-trash text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductoModal
          proveedorId={proveedorId}
          editando={editando}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProductos(); }}
        />
      )}
    </div>
  );
}

export default function ProveedorDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"info" | "productos">("info");

  useEffect(() => {
    api.getProveedor(id)
      .then(setProveedor)
      .catch(() => setError("Error al cargar el proveedor"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleActivo = async () => {
    if (!proveedor) return;
    setToggling(true);
    try {
      const formData = new FormData();
      formData.append("activo", String(!proveedor.activo));
      await api.updateProveedor(id, formData);
      setProveedor((p) => p ? { ...p, activo: !p.activo } : p);
    } catch {
      setError("Error al cambiar estado");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl" /></div>;
  if (error || !proveedor) return <div className="p-6 text-center text-red-500">{error || "Proveedor no encontrado"}</div>;

  const calificacion = calcCalificacionPromedio(proveedor.pedidos);

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/proveedores" className="text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <i className="fa-solid fa-chevron-left text-sm" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-slate-800">{proveedor.razonSocial}</h1>
              {calificacion !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md text-xs font-medium text-amber-700">
                  <i className="fa-solid fa-star text-amber-400 text-[10px]" />{calificacion.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              <i className="fa-solid fa-location-dot mr-1" />{proveedor.pais} · {proveedor.ciudad}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${proveedor.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            <i className={`fa-solid fa-circle text-[6px] ${proveedor.activo ? "text-emerald-500" : "text-slate-400"}`} />
            {proveedor.activo ? "Activo" : "Inactivo"}
          </span>
          <button onClick={handleToggleActivo} disabled={toggling}
            className={`text-xs font-medium px-2.5 py-1 rounded-md transition cursor-pointer disabled:opacity-60 ${proveedor.activo ? "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"}`}>
            {toggling ? <i className="fa-solid fa-spinner fa-spin" /> : proveedor.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-slate-200">
        {([["info", "fa-solid fa-building", "Información"], ["productos", "fa-solid fa-box", "Productos"]] as const).map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition cursor-pointer
              ${tab === key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <i className={icon} />{label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="space-y-4">
          <DetailSection title="Datos generales" icon="fa-solid fa-building">
            <Row label="Razón social" value={proveedor.razonSocial} />
            <Row label="País" value={proveedor.pais} />
            <Row label="Ciudad" value={proveedor.ciudad} />
            <Row label="Dirección" value={proveedor.direccion} />
            <Row label="Distrito / Zona" value={proveedor.distrito} />
            <Row label="Código postal" value={proveedor.codigoPostal} />
            <Row label="Referencia" value={proveedor.referencia} />
            <Row label="Rubro" value={proveedor.rubro} />
            <Row label="Subrubro" value={proveedor.subrubro} />
            <Row label="Delivery" value={proveedor.entrega ? ENTREGA_LABEL[proveedor.entrega] ?? proveedor.entrega : undefined} />
            <Row label="Email" value={proveedor.email} />
          </DetailSection>

          <DetailSection title="Datos fiscales" icon="fa-solid fa-file-invoice">
            <Row label="RUC / NIT / RUT" value={proveedor.ruc} />
            <Row label="Licencia Nro." value={proveedor.licencia} />
            <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4 border-b border-slate-100 last:border-0">
              <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia RUC / NIT</span>
              <FilePreview url={proveedor.copiaRucUrl} label="Ver documento" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4 border-b border-slate-100 last:border-0">
              <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia Licencia</span>
              <FilePreview url={proveedor.copiaLicenciaUrl} label="Ver documento" />
            </div>
            <Row label="Forma de pago" value={proveedor.formaPago} />
            <Row label="Datos para pago" value={proveedor.datosPago} />
          </DetailSection>

          <DetailSection title="Contacto" icon="fa-solid fa-phone">
            <Row label="Teléfono" value={proveedor.telefono} />
            <Row label="WhatsApp" value={proveedor.whatsapp} />
          </DetailSection>

          <DetailSection title="Representante legal" icon="fa-solid fa-user-tie">
            <Row label="Nombre" value={proveedor.representante} />
            <Row label="DNI / CI / ID" value={proveedor.dni} />
            <Row label="Teléfono" value={proveedor.telefonoRep} />
            <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia DNI / CI / ID</span>
              <FilePreview url={proveedor.copiaDniUrl} label="Ver documento" />
            </div>
          </DetailSection>

          <DetailSection title="Acceso al portal" icon="fa-solid fa-key">
            <Row label="Usuario" value={proveedor.usuarioAcceso} />
            <div className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-5 py-3 gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Contraseña</span>
              <span className="text-sm text-slate-400 italic">Oculta por seguridad</span>
            </div>
          </DetailSection>

          {calificacion !== null && (
            <DetailSection title="Calificación promedio" icon="fa-solid fa-star">
              <div className="px-4 sm:px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <i key={v} className={`fa-solid fa-star text-lg ${v <= Math.round(calificacion) ? "text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <span className="text-2xl font-semibold text-slate-800">{calificacion.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">/ 5.0</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Promedio basado en {proveedor.pedidos?.filter(p => p.calidad).length} pedido(s) calificado(s)</p>
              </div>
            </DetailSection>
          )}

          <div className="flex justify-end mt-6">
            <button onClick={() => router.push(`/dashboard/proveedores/${proveedor.id}/editar`)}
              className="bg-[#002060] hover:bg-[#002060] text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square" />Editar proveedor
            </button>
          </div>
        </div>
      )}

      {tab === "productos" && <ProductosTab proveedorId={proveedor.id} />}
    </div>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className={`${icon} text-blue-400`} />{title}
        </h2>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4">
      <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-700 break-all">{value || "—"}</span>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";