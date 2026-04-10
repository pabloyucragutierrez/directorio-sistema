"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const PAISES_CIUDADES: Record<string, string[]> = {
  Perú: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Piura", "Iquitos", "Huancayo", "Tacna", "Puno"],
  Colombia: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Manizales"],
  Chile: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Temuco", "Rancagua", "Talca", "Iquique", "Arica"],
  Argentina: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta", "Santa Fe"],
  Bolivia: ["La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad"],
  Brasil: ["São Paulo", "Río de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba"],
  Ecuador: ["Quito", "Guayaquil", "Cuenca", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato"],
  México: ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún", "Puebla", "Tijuana", "León", "Mérida"],
};
const PAISES = Object.keys(PAISES_CIUDADES).sort();

const RUBROS: Record<string, string[]> = {
  "Agropecuario": ["Semillas y fertilizantes", "Maquinaria agrícola", "Ganadería"],
  "Alimentos y Bebidas": ["Abarrotes", "Bebidas alcohólicas", "Bebidas no alcohólicas", "Lácteos", "Carnes y embutidos"],
  "Tecnología": ["Hardware", "Software", "Electrónica de consumo", "Telecomunicaciones"],
  "Textil y Confección": ["Ropa casual", "Ropa deportiva", "Calzado", "Accesorios de moda"],
  "Construcción": ["Materiales de construcción", "Herramientas", "Electricidad e iluminación"],
  "Salud y Farmacia": ["Medicamentos", "Dispositivos médicos", "Suplementos nutricionales"],
  "Otro": ["Otro"],
};
const RUBROS_LIST = Object.keys(RUBROS);

const FORMAS_PAGO = [
  { value: "", label: "Seleccionar" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "deposito", label: "Depósito bancario" },
  { value: "efectivo", label: "Efectivo" },
  { value: "cheque", label: "Cheque" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "tarjeta_debito", label: "Tarjeta de débito" },
  { value: "visa", label: "Visa / Mastercard" },
  { value: "paypal", label: "PayPal" },
];

interface FormState {
  razonSocial: string; pais: string; ciudad: string; direccion: string;
  distrito: string; codigoPostal: string; referencia: string; rubro: string;
  subrubro: string; entrega: string; email: string; ruc: string; licencia: string;
  telefono: string; whatsapp: string; formaPago: string; datosPago: string;
  representante: string; dni: string; telefonoRep: string; activo: boolean;
}

export default function EditarProveedorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    razonSocial: "", pais: "", ciudad: "", direccion: "", distrito: "",
    codigoPostal: "", referencia: "", rubro: "", subrubro: "", entrega: "",
    email: "", ruc: "", licencia: "", telefono: "", whatsapp: "",
    formaPago: "", datosPago: "", representante: "", dni: "", telefonoRep: "", activo: true,
  });
  const [copiaRuc, setCopiaRuc] = useState<File | null>(null);
  const [copiaLicencia, setCopiaLicencia] = useState<File | null>(null);
  const [copiaDni, setCopiaDni] = useState<File | null>(null);

  useEffect(() => {
    api.getProveedor(id).then((data) => {
      setForm({
        razonSocial: data.razonSocial ?? "",
        pais: data.pais ?? "",
        ciudad: data.ciudad ?? "",
        direccion: data.direccion ?? "",
        distrito: data.distrito ?? "",
        codigoPostal: data.codigoPostal ?? "",
        referencia: data.referencia ?? "",
        rubro: data.rubro ?? "",
        subrubro: data.subrubro ?? "",
        entrega: data.entrega ? "si" : "no",
        email: data.email ?? "",
        ruc: data.ruc ?? "",
        licencia: data.licencia ?? "",
        telefono: data.telefono ?? "",
        whatsapp: data.whatsapp ?? "",
        formaPago: data.formaPago ?? "",
        datosPago: data.datosPago ?? "",
        representante: data.representante ?? "",
        dni: data.dni ?? "",
        telefonoRep: data.telefonoRep ?? "",
        activo: data.activo,
      });
    }).catch(() => setError("Error al cargar el proveedor"))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "entrega") formData.append(key, value === "si" ? "true" : "false");
        else formData.append(key, String(value));
      });
      if (copiaRuc) formData.append("copiaRuc", copiaRuc);
      if (copiaLicencia) formData.append("copiaLicencia", copiaLicencia);
      if (copiaDni) formData.append("copiaDni", copiaDni);

      await api.updateProveedor(id, formData);
      router.push(`/dashboard/proveedores/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  const ciudades = form.pais ? (PAISES_CIUDADES[form.pais] ?? []) : [];
  const subrubros = form.rubro ? (RUBROS[form.rubro] ?? []) : [];

  if (fetching) return <div className="p-6 text-center text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl" /></div>;

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/proveedores/${id}`} className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Editar proveedor</h1>
          <p className="text-sm text-slate-500 mt-0.5">{form.razonSocial}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Datos generales" icon="fa-solid fa-building">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Razón social" required><input type="text" value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} className={inputCls} /></Field>
            <Field label="País" required>
              <select value={form.pais} onChange={(e) => { set("pais", e.target.value); set("ciudad", ""); }} className={inputCls}>
                <option value="">Seleccionar país</option>
                {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Ciudad" required>
              <select value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} disabled={!form.pais} className={inputCls}>
                <option value="">{form.pais ? "Seleccionar ciudad" : "Primero selecciona un país"}</option>
                {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Dirección"><input type="text" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} className={inputCls} /></Field>
            <Field label="Distrito / Zona / Barrio"><input type="text" value={form.distrito} onChange={(e) => set("distrito", e.target.value)} className={inputCls} /></Field>
            <Field label="Código postal"><input type="text" value={form.codigoPostal} onChange={(e) => set("codigoPostal", e.target.value)} className={inputCls} /></Field>
            <Field label="Referencia" className="sm:col-span-2"><input type="text" value={form.referencia} onChange={(e) => set("referencia", e.target.value)} className={inputCls} /></Field>
            <Field label="Rubro" required>
              <select value={form.rubro} onChange={(e) => { set("rubro", e.target.value); set("subrubro", ""); }} className={inputCls}>
                <option value="">Seleccionar rubro</option>
                {RUBROS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Subrubro">
              <select value={form.subrubro} onChange={(e) => set("subrubro", e.target.value)} disabled={!form.rubro} className={inputCls}>
                <option value="">{form.rubro ? "Seleccionar subrubro" : "Primero selecciona un rubro"}</option>
                {subrubros.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Entrega">
              <select value={form.entrega} onChange={(e) => set("entrega", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option><option value="si">Sí</option><option value="no">No</option>
              </select>
            </Field>
            <Field label="Email" required><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></Field>
            <Field label="Estado">
              <select value={form.activo ? "activo" : "inactivo"} onChange={(e) => set("activo", e.target.value === "activo")} className={inputCls}>
                <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Datos fiscales" icon="fa-solid fa-file-invoice">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="RUC / NIT / RUT" required><input type="text" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} className={inputCls} /></Field>
            <Field label="Licencia Nro."><input type="text" value={form.licencia} onChange={(e) => set("licencia", e.target.value)} className={inputCls} /></Field>
            <Field label="Copia RUC / NIT / RUT"><input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} onChange={(e) => setCopiaRuc(e.target.files?.[0] ?? null)} /></Field>
            <Field label="Copia Licencia"><input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} onChange={(e) => setCopiaLicencia(e.target.files?.[0] ?? null)} /></Field>
            <Field label="Forma de pago">
              <select value={form.formaPago} onChange={(e) => set("formaPago", e.target.value)} className={inputCls}>
                {FORMAS_PAGO.map((fp) => <option key={fp.value} value={fp.value}>{fp.label}</option>)}
              </select>
            </Field>
            <Field label="Datos para pago" className="sm:col-span-2">
              <textarea rows={2} value={form.datosPago} onChange={(e) => set("datosPago", e.target.value)} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </Section>

        <Section title="Contacto" icon="fa-solid fa-phone">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono"><input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className={inputCls} /></Field>
            <Field label="WhatsApp"><input type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} /></Field>
          </div>
        </Section>

        <Section title="Representante legal" icon="fa-solid fa-user-tie">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required><input type="text" value={form.representante} onChange={(e) => set("representante", e.target.value)} className={inputCls} /></Field>
            <Field label="DNI / CI / ID" required><input type="text" value={form.dni} onChange={(e) => set("dni", e.target.value)} className={inputCls} /></Field>
            <Field label="Teléfono"><input type="tel" value={form.telefonoRep} onChange={(e) => set("telefonoRep", e.target.value)} className={inputCls} /></Field>
            <Field label="Copia DNI / CI / ID"><input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} onChange={(e) => setCopiaDni(e.target.files?.[0] ?? null)} /></Field>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/dashboard/proveedores/${id}`} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">Cancelar</Link>
          <button type="submit" disabled={loading} className="bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";
const fileCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs hover:file:bg-blue-100 transition cursor-pointer";

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <i className={`${icon} text-blue-400`} />{title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}