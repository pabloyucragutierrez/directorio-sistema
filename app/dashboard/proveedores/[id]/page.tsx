"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const proveedor = {
  id: 1,
  razonSocial: "Importaciones XYZ S.A.",
  pais: "Perú", ciudad: "Lima", direccion: "Av. Principal 123",
  distrito: "Miraflores", codigoPostal: "15074", referencia: "Cerca al parque Kennedy",
  rubro: "Alimentos y Bebidas", subrubro: "Abarrotes", entrega: "Sí",
  email: "contacto@xyz.com", ruc: "20512345678", licencia: "LIC-000456",
  copiaRuc: "copia_ruc.pdf", copiaLicencia: "licencia.pdf",
  telefono: "+51 1 234 5678", whatsapp: "+51 987 654 321",
  representante: "Juan Pérez", dni: "12345678", telefonoRep: "+51 987 000 111",
  formaPago: "Transferencia bancaria",
  datosPago: "Banco BCP - Cta: 194-123456789-0-25 - CCI: 00219400012345678025",
  activo: true,
};

export default function ProveedorDetallePage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/proveedores" className="text-slate-400 hover:text-slate-600 transition flex-shrink-0">
            <i className="fa-solid fa-chevron-left text-sm" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{proveedor.razonSocial}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              <i className="fa-solid fa-location-dot mr-1" />{proveedor.pais} · {proveedor.ciudad}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${proveedor.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          <i className={`fa-solid fa-circle text-[6px] ${proveedor.activo ? "text-emerald-500" : "text-slate-400"}`} />
          {proveedor.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="space-y-4">
        <DetailSection title="Datos generales" icon="fa-solid fa-building" rows={[
          ["Razón social", proveedor.razonSocial], ["País", proveedor.pais], ["Ciudad", proveedor.ciudad],
          ["Dirección", proveedor.direccion], ["Distrito / Zona", proveedor.distrito],
          ["Código postal", proveedor.codigoPostal], ["Referencia", proveedor.referencia],
          ["Rubro", proveedor.rubro], ["Subrubro", proveedor.subrubro],
          ["Entrega", proveedor.entrega], ["Email", proveedor.email],
        ]} />
        <DetailSection title="Datos fiscales" icon="fa-solid fa-file-invoice" rows={[
          ["RUC / NIT / RUT", proveedor.ruc], ["Licencia Nro.", proveedor.licencia],
          ["Copia RUC / NIT / RUT", proveedor.copiaRuc], ["Copia Licencia", proveedor.copiaLicencia],
          ["Forma de pago", proveedor.formaPago], ["Datos para pago", proveedor.datosPago],
        ]} />
        <DetailSection title="Contacto" icon="fa-solid fa-phone" rows={[
          ["Teléfono", proveedor.telefono], ["WhatsApp", proveedor.whatsapp],
        ]} />
        <DetailSection title="Representante legal" icon="fa-solid fa-user-tie" rows={[
          ["Nombre", proveedor.representante], ["DNI / CI / ID", proveedor.dni], ["Teléfono", proveedor.telefonoRep],
        ]} />
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={() => router.push(`/dashboard/proveedores/${proveedor.id}/editar`)}
          className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
          <i className="fa-solid fa-pen-to-square" />Editar proveedor
        </button>
      </div>
    </div>
  );
}

function DetailSection({ title, icon, rows }: { title: string; icon: string; rows: [string, string][] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className={`${icon} text-blue-400`} />{title}
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col sm:flex-row sm:items-start px-4 sm:px-5 py-3 gap-1 sm:gap-4">
            <span className="text-xs sm:text-sm text-slate-400 sm:w-44 sm:flex-shrink-0">{label}</span>
            <span className="text-sm text-slate-700 break-all">{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}