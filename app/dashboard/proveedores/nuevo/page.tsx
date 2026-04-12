"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  "Agropecuario": ["Semillas y fertilizantes", "Maquinaria agrícola", "Ganadería", "Acuicultura", "Productos veterinarios"],
  "Alimentos y Bebidas": ["Abarrotes", "Bebidas alcohólicas", "Bebidas no alcohólicas", "Panadería y repostería", "Lácteos", "Carnes y embutidos", "Frutas y verduras", "Snacks y confitería"],
  "Automotriz": ["Vehículos", "Repuestos y accesorios", "Lubricantes", "Llantas", "Equipos de taller"],
  "Construcción": ["Materiales de construcción", "Acabados y pisos", "Sanitarios y griferías", "Pinturas y adhesivos", "Herramientas", "Electricidad e iluminación"],
  "Educación": ["Libros y útiles", "Mobiliario escolar", "Plataformas educativas", "Uniformes", "Equipos de laboratorio"],
  "Hogar y Decoración": ["Muebles", "Electrodomésticos", "Iluminación decorativa", "Textiles para el hogar", "Artículos de cocina"],
  "Logística y Transporte": ["Carga terrestre", "Carga aérea", "Carga marítima", "Almacenaje", "Courier y mensajería"],
  "Salud y Farmacia": ["Medicamentos", "Dispositivos médicos", "Productos de higiene", "Suplementos nutricionales", "Equipos hospitalarios"],
  "Servicios Profesionales": ["Consultoría", "Legal y notarial", "Contabilidad y finanzas", "Marketing y publicidad", "Diseño y creatividad"],
  "Tecnología": ["Hardware", "Software", "Electrónica de consumo", "Telecomunicaciones", "Cómputo y accesorios", "Seguridad electrónica"],
  "Textil y Confección": ["Ropa casual", "Ropa deportiva", "Ropa interior", "Calzado", "Accesorios de moda", "Telas e insumos"],
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

function FileInput({ label, onChange }: { label: string; onChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | null) => {
    onChange(file);
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFileName(null);
      setPreview(null);
    }
  };

  const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
        className={`relative flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition overflow-hidden
          ${isDragging ? "border-blue-400 bg-blue-50" : preview ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition">
              <i className="fa-solid fa-arrow-up-from-bracket text-white text-xl mb-1" />
              <span className="text-white text-xs font-medium">Cambiar imagen</span>
            </div>
          </>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <i className="fa-solid fa-file-pdf text-red-400 text-3xl" />
            <span className="text-xs text-slate-500 break-all line-clamp-2">{fileName}</span>
            <span className="text-xs text-blue-500">Clic para cambiar</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <i className="fa-solid fa-cloud-arrow-up text-slate-300 text-3xl" />
            <span className="text-xs text-slate-400">Arrastra o haz clic para subir</span>
            <span className="text-[10px] text-slate-300">JPG, PNG o PDF</span>
          </div>
        )}
      </label>
      <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
    </div>
  );
}

export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [rubro, setRubro] = useState("");
  const [subrubro, setSubrubro] = useState("");
  const [copiaRuc, setCopiaRuc] = useState<File | null>(null);
  const [copiaLicencia, setCopiaLicencia] = useState<File | null>(null);
  const [copiaDni, setCopiaDni] = useState<File | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const ciudades = pais ? (PAISES_CIUDADES[pais] ?? []) : [];
  const subrubros = rubro ? (RUBROS[rubro] ?? []) : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = e.currentTarget;
      const get = (name: string) =>
        (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? "";

      const formData = new FormData();
      formData.append("razonSocial", get("razonSocial"));
      formData.append("pais", pais);
      formData.append("ciudad", ciudad);
      if (get("direccion")) formData.append("direccion", get("direccion"));
      if (get("distrito")) formData.append("distrito", get("distrito"));
      if (get("codigoPostal")) formData.append("codigoPostal", get("codigoPostal"));
      if (get("referencia")) formData.append("referencia", get("referencia"));
      if (rubro) formData.append("rubro", rubro);
      if (subrubro) formData.append("subrubro", subrubro);
      formData.append("entrega", get("entrega") === "si" ? "true" : "false");
      if (get("email")) formData.append("email", get("email"));
      if (get("ruc")) formData.append("ruc", get("ruc"));
      if (get("licencia")) formData.append("licencia", get("licencia"));
      if (get("telefono")) formData.append("telefono", get("telefono"));
      if (get("whatsapp")) formData.append("whatsapp", get("whatsapp"));
      if (get("formaPago")) formData.append("formaPago", get("formaPago"));
      if (get("datosPago")) formData.append("datosPago", get("datosPago"));
      if (get("representante")) formData.append("representante", get("representante"));
      if (get("dni")) formData.append("dni", get("dni"));
      if (get("telefonoRep")) formData.append("telefonoRep", get("telefonoRep"));
      formData.append("usuarioAcceso", get("usuarioAcceso"));
      formData.append("passwordAcceso", get("passwordAcceso"));
      if (copiaRuc) formData.append("copiaRuc", copiaRuc);
      if (copiaLicencia) formData.append("copiaLicencia", copiaLicencia);
      if (copiaDni) formData.append("copiaDni", copiaDni);

      await api.createProveedor(formData);
      router.push("/dashboard/proveedores");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar proveedor");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/proveedores" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nuevo proveedor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Completa los datos del proveedor</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation flex-shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Datos generales" icon="fa-solid fa-building">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Razón social" required>
              <input name="razonSocial" type="text" placeholder="Empresa S.A." required className={inputCls} />
            </Field>
            <Field label="País" required>
              <select value={pais} onChange={(e) => { setPais(e.target.value); setCiudad(""); }} required className={inputCls}>
                <option value="">Seleccionar país</option>
                {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Ciudad" required>
              <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} disabled={!pais} required className={inputCls}>
                <option value="">{pais ? "Seleccionar ciudad" : "Primero selecciona un país"}</option>
                {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Dirección">
              <input name="direccion" type="text" placeholder="Av. Principal 123" className={inputCls} />
            </Field>
            <Field label="Distrito / Zona / Barrio">
              <input name="distrito" type="text" placeholder="Miraflores" className={inputCls} />
            </Field>
            <Field label="Código postal">
              <input name="codigoPostal" type="text" placeholder="15074" className={inputCls} />
            </Field>
            <Field label="Referencia" className="sm:col-span-2">
              <input name="referencia" type="text" placeholder="Cerca al parque..." className={inputCls} />
            </Field>
            <Field label="Rubro">
              <select value={rubro} onChange={(e) => { setRubro(e.target.value); setSubrubro(""); }} className={inputCls}>
                <option value="">Seleccionar rubro</option>
                {RUBROS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Subrubro">
              <select value={subrubro} onChange={(e) => setSubrubro(e.target.value)} disabled={!rubro} className={inputCls}>
                <option value="">{rubro ? "Seleccionar subrubro" : "Primero selecciona un rubro"}</option>
                {subrubros.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Entrega (incluye delivery)">
              <select name="entrega" className={inputCls}>
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Email">
              <input name="email" type="email" placeholder="contacto@empresa.com" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Datos fiscales" icon="fa-solid fa-file-invoice">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="RUC / NIT / RUT">
              <input name="ruc" type="text" placeholder="20512345678" className={inputCls} />
            </Field>
            <Field label="Licencia Nro.">
              <input name="licencia" type="text" placeholder="LIC-000123" className={inputCls} />
            </Field>
            <FileInput label="Copia RUC / NIT / RUT" onChange={setCopiaRuc} />
            <FileInput label="Copia Licencia" onChange={setCopiaLicencia} />
            <Field label="Forma de pago">
              <select name="formaPago" className={inputCls}>
                {FORMAS_PAGO.map((fp) => <option key={fp.value} value={fp.value}>{fp.label}</option>)}
              </select>
            </Field>
            <Field label="Datos para pago" className="sm:col-span-2">
              <textarea name="datosPago" rows={2} placeholder="Banco, cuenta, CCI, número Yape..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </Section>

        <Section title="Contacto" icon="fa-solid fa-phone">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input name="telefono" type="tel" placeholder="+51 1 234 5678" className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" type="tel" placeholder="+51 987 654 321" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Representante legal" icon="fa-solid fa-user-tie">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo">
              <input name="representante" type="text" placeholder="Juan Pérez" className={inputCls} />
            </Field>
            <Field label="DNI / CI / ID">
              <input name="dni" type="text" placeholder="12345678" className={inputCls} />
            </Field>
            <Field label="Teléfono">
              <input name="telefonoRep" type="tel" placeholder="+51 987 000 000" className={inputCls} />
            </Field>
            <FileInput label="Copia DNI / CI / ID" onChange={setCopiaDni} />
          </div>
        </Section>

        <Section title="Datos de acceso al portal" icon="fa-solid fa-key">
          {/* <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2.5">
            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Estas credenciales serán las que el proveedor usará para ingresar a su portal y ver sus pedidos.
              Compártelas con él una vez guardado el registro.
            </p>
          </div> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Usuario de acceso" required>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input name="usuarioAcceso" type="text" placeholder="ej: 123456" required className={`${inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="Contraseña de acceso" required>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  name="passwordAcceso"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className={`${inputCls} pl-9 pr-10`}
                />
                <button type="button" onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer">
                  <i className={`fa-solid ${mostrarPassword ? "fa-eye-slash" : "fa-eye"} text-sm`} />
                </button>
              </div>
            </Field>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/proveedores" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="bg-[#002060] hover:bg-[#002060] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</>
              : <><i className="fa-solid fa-floppy-disk" /> Guardar proveedor</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

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

function Field({ label, required, children, className }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}