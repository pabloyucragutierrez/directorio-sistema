"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precioNacional?: number | null;
  precioDolar?: number | null;
  moneda?: string | null;
  fotoUrl?: string | null;
}

interface Proveedor {
  id: number;
  razonSocial: string;
  pais: string;
  ciudad?: string | null;
  direccion?: string | null;
  distrito?: string | null;
  codigoPostal?: string | null;
  referencia?: string | null;
  rubro?: string | null;
  subrubro?: string | null;
  entrega?: string | null;
  email?: string | null;
  ruc?: string | null;
  licencia?: string | null;
  copiaRucUrl?: string | null;
  copiaLicenciaUrl?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  representante?: string | null;
  dni?: string | null;
  telefonoRep?: string | null;
  copiaDniUrl?: string | null;
  formaPago?: string | null;
  datosPago?: string | null;
  comentarios?: string | null;
  activo: boolean;
}

const ENTREGA_LABEL: Record<string, string> = {
  incluye_delivery: "✅ Incluye delivery a domicilio",
  no_incluye_delivery: "❌ No incluye delivery a domicilio",
  consultar: "💬 Consultar disponibilidad",
};

const SIMBOLO: Record<string, string> = {
  PEN: "S/",
  USD: "$",
  COP: "$",
  CLP: "$",
  ARS: "$",
  BOB: "Bs",
  BRL: "R$",
  MXN: "$",
  EUR: "€",
};

const isPdfUrl = (url: string) => url.toLowerCase().includes(".pdf") || url.includes("/raw/");

const money = (value?: number | null) => {
  if (value == null) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
};

export default function ConsultaDetallePage() {
  const params = useParams<{ id: string }>();
  const proveedorId = useMemo(() => Number(params?.id), [params?.id]);

  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"info" | "productos">("info");

  useEffect(() => {
    if (!Number.isFinite(proveedorId) || proveedorId <= 0) return;

    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([api.getProveedor(proveedorId), api.getProductosProveedor(proveedorId)])
      .then(([p, prods]) => {
        if (!mounted) return;
        setProveedor(p as Proveedor);
        setProductos(Array.isArray(prods) ? (prods as Producto[]) : []);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Error al cargar el detalle";
        setError(msg);
        setProveedor(null);
        setProductos([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [proveedorId]);

  if (!Number.isFinite(proveedorId) || proveedorId <= 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">ID inválido</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/consultas" className="text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <i className="fa-solid fa-chevron-left text-sm" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-slate-800">{proveedor?.razonSocial ?? "Detalle de consulta"}</h1>
            </div>
            {proveedor ? (
              <p className="text-sm text-slate-500 mt-0.5">
                <i className="fa-solid fa-location-dot mr-1" />
                {proveedor.pais}
                {proveedor.ciudad ? ` · ${proveedor.ciudad}` : ""}
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-0.5">Solo lectura: proveedor y sus productos</p>
            )}
          </div>
        </div>

        {proveedor && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                proveedor.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              <i className={`fa-solid fa-circle text-[6px] ${proveedor.activo ? "text-emerald-500" : "text-slate-400"}`} />
              {proveedor.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
          <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />
          Cargando...
        </div>
      ) : !proveedor ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
          <i className="fa-solid fa-box-open text-2xl mb-2 block" />
          No se encontró el proveedor
        </div>
      ) : (
        <>
          <div className="flex gap-1 mb-5 border-b border-slate-200">
            {([["info", "fa-solid fa-building", "Información"], ["productos", "fa-solid fa-box", "Productos"]] as const).map(
              ([key, icon, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition cursor-pointer
                    ${tab === key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  <i className={icon} />
                  {label}
                </button>
              ),
            )}
          </div>

          {tab === "info" && (
            <div className="space-y-4">
              <DetailSection title="Datos generales" icon="fa-solid fa-building">
                <Row label="Razón social" value={proveedor.razonSocial} />
                <Row label="País" value={proveedor.pais} />
                <Row label="Ciudad" value={proveedor.ciudad ?? undefined} />
                <Row label="Dirección" value={proveedor.direccion ?? undefined} />
                <Row label="Distrito / Zona" value={proveedor.distrito ?? undefined} />
                <Row label="Código postal" value={proveedor.codigoPostal ?? undefined} />
                <Row label="Referencia" value={proveedor.referencia ?? undefined} />
                <Row label="Rubro" value={proveedor.rubro ?? undefined} />
                <Row label="Subrubro" value={proveedor.subrubro ?? undefined} />
                <Row
                  label="Delivery"
                  value={proveedor.entrega ? ENTREGA_LABEL[proveedor.entrega] ?? proveedor.entrega : undefined}
                />
                <Row label="Email" value={proveedor.email ?? undefined} />
              </DetailSection>

              <DetailSection title="Datos fiscales" icon="fa-solid fa-file-invoice">
                <Row label="RUC / NIT / RUT" value={proveedor.ruc ?? undefined} />
                <Row label="Licencia Nro." value={proveedor.licencia ?? undefined} />
                <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4 border-b border-slate-100 last:border-0">
                  <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia RUC / NIT</span>
                  <FilePreview url={proveedor.copiaRucUrl ?? undefined} label="Ver documento" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4 border-b border-slate-100 last:border-0">
                  <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia Licencia</span>
                  <FilePreview url={proveedor.copiaLicenciaUrl ?? undefined} label="Ver documento" />
                </div>
                <Row label="Forma de pago" value={proveedor.formaPago ?? undefined} />
                <Row label="Datos para pago" value={proveedor.datosPago ?? undefined} />
              </DetailSection>

              <DetailSection title="Contacto" icon="fa-solid fa-phone">
                <Row label="Teléfono" value={proveedor.telefono ?? undefined} />
                <Row label="WhatsApp" value={proveedor.whatsapp ?? undefined} />
              </DetailSection>

              <DetailSection title="Representante legal" icon="fa-solid fa-user-tie">
                <Row label="Nombre" value={proveedor.representante ?? undefined} />
                <Row label="DNI / CI / ID" value={proveedor.dni ?? undefined} />
                <Row label="Teléfono" value={proveedor.telefonoRep ?? undefined} />
                <div className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4">
                  <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">Copia DNI / CI / ID</span>
                  <FilePreview url={proveedor.copiaDniUrl ?? undefined} label="Ver documento" />
                </div>
              </DetailSection>

              {proveedor.comentarios ? (
                <DetailSection title="Comentarios" icon="fa-solid fa-comment-dots">
                  <Row label="Comentarios" value={proveedor.comentarios ?? undefined} />
                </DetailSection>
              ) : null}
            </div>
          )}

          {tab === "productos" && (
            <DetailSection title="Productos" icon="fa-solid fa-boxes-stacked">
              {productos.length === 0 ? (
                <div className="px-4 sm:px-5 py-6 text-sm text-slate-400 text-center">No hay productos registrados</div>
              ) : (
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productos.map((p) => {
                      const sim = SIMBOLO[p.moneda ?? "PEN"] ?? p.moneda ?? "S/";
                      return (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                          {p.fotoUrl ? (
                            isPdfUrl(p.fotoUrl) ? (
                              <a
                                href={p.fotoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-36 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-blue-700 transition"
                              >
                                <i className="fa-solid fa-file-pdf text-3xl text-red-500" />
                                <span className="text-xs mt-1">Ver PDF</span>
                              </a>
                            ) : (
                              <a href={p.fotoUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-36 overflow-hidden">
                                <img src={p.fotoUrl} alt={p.nombre} className="w-full h-full object-cover" />
                              </a>
                            )
                          ) : (
                            <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                              <i className="fa-solid fa-image text-2xl text-slate-300" />
                            </div>
                          )}

                          <div className="p-3 flex flex-col gap-1 flex-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">{p.nombre}</p>
                              {p.descripcion ? <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{p.descripcion}</p> : null}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {p.precioNacional != null && (
                                  <span className="text-xs font-semibold text-blue-700">
                                    {sim} {money(p.precioNacional)}
                                  </span>
                                )}
                                {p.precioNacional != null && p.precioDolar != null && <span className="text-slate-300 text-xs">·</span>}
                                {p.precioDolar != null && (
                                  <span className="text-xs font-semibold text-emerald-700">$ {money(p.precioDolar)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </DetailSection>
          )}
        </>
      )}
    </div>
  );
}

function FilePreview({ url, label }: { url?: string; label: string }) {
  if (!url) return <span className="text-sm text-slate-400">—</span>;
  const isPdf = isPdfUrl(url);
  return (
    <div className="flex items-center gap-2">
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
        >
          <i className="fa-solid fa-file-pdf text-red-500" />
          {label}
          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={label}
            className="h-16 w-auto rounded-lg border border-slate-200 object-cover hover:opacity-80 transition"
          />
        </a>
      )}
    </div>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className={`${icon} text-blue-400`} />
          {title}
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
