"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Países y ciudades ───────────────────────────────────────────────────────
const PAISES_CIUDADES: Record<string, string[]> = {
  Perú: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Piura", "Iquitos", "Huancayo", "Tacna", "Puno"],
  Colombia: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Manizales"],
  Chile: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Temuco", "Rancagua", "Talca", "Iquique", "Arica"],
  Argentina: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta", "Santa Fe"],
  Bolivia: ["La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad"],
  Brasil: ["São Paulo", "Río de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba"],
  Ecuador: ["Quito", "Guayaquil", "Cuenca", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato"],
  Paraguay: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora"],
  Uruguay: ["Montevideo", "Salto", "Paysandú", "Las Piedras", "Rivera", "Maldonado", "Tacuarembó"],
  Venezuela: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Maturín"],
  Guyana: ["Georgetown", "Linden", "New Amsterdam", "Anna Regina"],
  Surinam: ["Paramaribo", "Lelydorp", "Nieuw Nickerie", "Moengo"],
  "Guyana Francesa": ["Cayena", "Saint-Laurent-du-Maroni", "Kourou"],
  Guatemala: ["Ciudad de Guatemala", "Mixco", "Villa Nueva", "Quetzaltenango", "Huehuetenango", "Escuintla"],
  Honduras: ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Choluteca"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Mejicanos", "Soyapango", "Apopa"],
  Nicaragua: ["Managua", "León", "Masaya", "Matagalpa", "Chinandega", "Granada"],
  "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Liberia", "Pérez Zeledón"],
  Panamá: ["Ciudad de Panamá", "San Miguelito", "Tocumen", "La Chorrera", "Colón", "David"],
  Belice: ["Belmopán", "Ciudad de Belice", "San Ignacio", "Orange Walk", "Dangriga"],
  México: ["Ciudad de México", "Guadalajara", "Monterrey", "Cancún", "Puebla", "Tijuana", "León", "Mérida"],
};
const PAISES = Object.keys(PAISES_CIUDADES).sort();

// ── Rubros y subrubros ──────────────────────────────────────────────────────
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

// ── Formas de pago ──────────────────────────────────────────────────────────
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

// ── Estado inicial del formulario ───────────────────────────────────────────
const proveedorInicial = {
  id: 1,
  razonSocial: "Importaciones XYZ S.A.",
  pais: "Perú",
  ciudad: "Lima",
  direccion: "Av. Principal 123",
  distrito: "Miraflores",
  codigoPostal: "15074",
  referencia: "Cerca al parque Kennedy",
  rubro: "Alimentos y Bebidas",
  subrubro: "Abarrotes",
  entrega: "si",
  email: "contacto@xyz.com",
  ruc: "20512345678",
  licencia: "LIC-000456",
  formaPago: "transferencia",
  datosPago: "Banco BCP - Cta: 194-123456789-0-25 - CCI: 00219400012345678025",
  telefono: "+51 1 234 5678",
  whatsapp: "+51 987 654 321",
  representante: "Juan Pérez",
  dni: "12345678",
  telefonoRep: "+51 987 000 111",
  activo: true,
};

// ── Página ──────────────────────────────────────────────────────────────────
export default function EditarProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(proveedorInicial);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePaisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, pais: e.target.value, ciudad: "" }));
  };

  const handleRubroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, rubro: e.target.value, subrubro: "" }));
  };

  const ciudades = form.pais ? (PAISES_CIUDADES[form.pais] ?? []) : [];
  const subrubros = form.rubro ? (RUBROS[form.rubro] ?? []) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push(`/dashboard/proveedores/${proveedorInicial.id}`), 800);
  };

  return (
    <div className="p-4 sm:p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/proveedores/${proveedorInicial.id}`} className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Editar proveedor</h1>
          <p className="text-sm text-slate-500 mt-0.5">{form.razonSocial}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── DATOS GENERALES ── */}
        <Section title="Datos generales" icon="fa-solid fa-building">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Razón social" required>
              <input type="text" value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} className={inputCls} />
            </Field>

            <Field label="País" required>
              <select value={form.pais} onChange={handlePaisChange} className={inputCls}>
                <option value="">Seleccionar país</option>
                {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Ciudad" required>
              <select
                value={form.ciudad}
                onChange={(e) => set("ciudad", e.target.value)}
                disabled={!form.pais}
                className={inputCls}
              >
                <option value="">{form.pais ? "Seleccionar ciudad" : "Primero selecciona un país"}</option>
                {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Dirección">
              <input type="text" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Distrito / Zona / Barrio">
              <input type="text" value={form.distrito} onChange={(e) => set("distrito", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Código postal">
              <input type="text" value={form.codigoPostal} onChange={(e) => set("codigoPostal", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Referencia" className="sm:col-span-2">
              <input type="text" value={form.referencia} onChange={(e) => set("referencia", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Rubro" required>
              <select value={form.rubro} onChange={handleRubroChange} className={inputCls}>
                <option value="">Seleccionar rubro</option>
                {RUBROS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="Subrubro">
              <select
                value={form.subrubro}
                onChange={(e) => set("subrubro", e.target.value)}
                disabled={!form.rubro}
                className={inputCls}
              >
                <option value="">{form.rubro ? "Seleccionar subrubro" : "Primero selecciona un rubro"}</option>
                {subrubros.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Entrega">
              <select value={form.entrega} onChange={(e) => set("entrega", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Estado">
              <select value={form.activo ? "activo" : "inactivo"} onChange={(e) => set("activo", e.target.value === "activo")} className={inputCls}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ── DATOS FISCALES ── */}
        <Section title="Datos fiscales" icon="fa-solid fa-file-invoice">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="RUC / NIT / RUT" required>
              <input type="text" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Licencia Nro.">
              <input type="text" value={form.licencia} onChange={(e) => set("licencia", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Copia RUC / NIT / RUT">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} />
            </Field>
            <Field label="Copia Licencia">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} />
            </Field>
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

        {/* ── CONTACTO ── */}
        <Section title="Contacto" icon="fa-solid fa-phone">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ── REPRESENTANTE LEGAL ── */}
        <Section title="Representante legal" icon="fa-solid fa-user-tie">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required>
              <input type="text" value={form.representante} onChange={(e) => set("representante", e.target.value)} className={inputCls} />
            </Field>
            <Field label="DNI / CI / ID" required>
              <input type="text" value={form.dni} onChange={(e) => set("dni", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Teléfono">
              <input type="tel" value={form.telefonoRep} onChange={(e) => set("telefonoRep", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Copia DNI / CI / ID">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} />
            </Field>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/dashboard/proveedores/${proveedorInicial.id}`} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>
            )}
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
        <i className={`${icon} text-blue-400`} />
        {title}
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