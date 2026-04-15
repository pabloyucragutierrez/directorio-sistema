"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const PAISES_CIUDADES: Record<string, string[]> = {
  Argentina: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta", "Santa Fe"],
  Bolivia: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija", "Trinidad"],
  Brasil: ["São Paulo", "Río de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba"],
  Chile: ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Temuco", "Rancagua", "Talca", "Iquique", "Arica"],
  Colombia: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Manizales"],
  "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Limón", "Puntarenas"],
  Ecuador: ["Quito", "Guayaquil", "Cuenca", "Machala", "Durán", "Manta", "Portoviejo", "Loja", "Ambato"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Santa Tecla"],
  Guatemala: ["Ciudad de Guatemala", "Quetzaltenango", "Escuintla", "Huehuetenango", "Antigua Guatemala"],
  Guyana: ["Georgetown", "Linden", "New Amsterdam", "Anna Regina"],
  Honduras: ["Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choluteca", "Comayagua"],
  Nicaragua: ["Managua", "León", "Granada", "Masaya", "Chinandega", "Matagalpa"],
  México: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Querétaro", "Mérida", "Cancún"],
  Panamá: ["Ciudad de Panamá", "San Miguelito", "David", "Colón", "Santiago"],
  Paraguay: ["Asunción", "Ciudad del Este", "Encarnación", "San Lorenzo", "Luque"],
  Perú: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Piura", "Iquitos", "Huancayo", "Tacna", "Puno"],
  Surinam: ["Paramaribo", "Lelydorp", "Nieuw Nickerie", "Moengo"],
  Uruguay: ["Montevideo", "Salto", "Paysandú", "Maldonado", "Rivera"],
  Venezuela: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana"],
  Belice: ["Belice City", "Belmopán", "San Ignacio", "Orange Walk", "Corozal"],
};
const PAISES = Object.keys(PAISES_CIUDADES).sort();

const RUBROS: Record<string, string[]> = {
  "ACCESORIOS DAMAS": ["Joyas", "Perfumes", "Carteras"],
  "ACCESORIOS VARONES": ["Joyas", "Perfumes", "Otros"],
  "BEBIDAS ALCOHÓLICAS": ["Toda bebida que contenga alcohol"],
  "BEBIDAS EN GENERAL": ["Café", "Jugos", "Otros sin alcohol"],
  "DESAYUNO": ["Desayunos especiales"],
  "EVENTOS": ["Grupos musicales", "Arreglos", "Diversión"],
  "FLORES": ["Flores para todo tipo de acontecimiento"],
  "CUMPLEAÑOS/ANIVERSARIO": ["Regalos para cumpleaños", "Flores", "Tortas"],
  "NAVIDEÑAS": ["Regalos exclusivos para Navidades"],
  "PASTELERÍA / TORTAS": ["Tortas", "Pasteles", "Panes"],
  "POSTRES": ["Postres en general"],
  "PLATOS A LA CARTA": ["Variedad de comida"],
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
  comentarios: string;
}

function FileField({ label, name, currentUrl, onChange }: {
  label: string; name: string; currentUrl?: string; onChange: (f: File | null) => void;
}) {
  const isCurrentImage = currentUrl && !currentUrl.toLowerCase().includes('.pdf') && !currentUrl.includes('/raw/');
  const [preview, setPreview] = useState<string | null>(isCurrentImage ? currentUrl ?? null : null);
  const [fileName, setFileName] = useState<string | null>(currentUrl && !isCurrentImage ? "Archivo actual" : null);
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
    }
  };

  const inputId = `file-${name}`;

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
      <input id={inputId} type="file" name={name} accept=".pdf,.jpg,.jpeg,.png" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      {currentUrl && !preview && fileName === "Archivo actual" && (
        <a href={currentUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-500 hover:text-blue-700 transition">
          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />Ver archivo actual
        </a>
      )}
    </div>
  );
}

export default function EditarProveedorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copiaRucUrl, setCopiaRucUrl] = useState<string | undefined>();
  const [copiaLicenciaUrl, setCopiaLicenciaUrl] = useState<string | undefined>();
  const [copiaDniUrl, setCopiaDniUrl] = useState<string | undefined>();
  const [copiaRuc, setCopiaRuc] = useState<File | null>(null);
  const [copiaLicencia, setCopiaLicencia] = useState<File | null>(null);
  const [copiaDni, setCopiaDni] = useState<File | null>(null);
	  const [form, setForm] = useState<FormState>({
	    razonSocial: "", pais: "", ciudad: "", direccion: "", distrito: "",
	    codigoPostal: "", referencia: "", rubro: "", subrubro: "", entrega: "",
	    email: "", ruc: "", licencia: "", telefono: "", whatsapp: "",
	    formaPago: "", datosPago: "", representante: "", dni: "", telefonoRep: "",
	    activo: true,
	    comentarios: "",
	  });

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
        entrega: data.entrega === true ? "si" : data.entrega === false ? "no" : "",
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
	        comentarios: data.comentarios ?? "",
	      });
      setCopiaRucUrl(data.copiaRucUrl);
      setCopiaLicenciaUrl(data.copiaLicenciaUrl);
      setCopiaDniUrl(data.copiaDniUrl);
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
      formData.append("razonSocial", form.razonSocial);
      formData.append("pais", form.pais);
      formData.append("ciudad", form.ciudad);
      if (form.direccion) formData.append("direccion", form.direccion);
      if (form.distrito) formData.append("distrito", form.distrito);
      if (form.codigoPostal) formData.append("codigoPostal", form.codigoPostal);
      if (form.referencia) formData.append("referencia", form.referencia);
      if (form.rubro) formData.append("rubro", form.rubro);
      if (form.subrubro) formData.append("subrubro", form.subrubro);
      if (form.entrega) formData.append("entrega", form.entrega === "si" ? "true" : "false");
      if (form.email) formData.append("email", form.email);
      if (form.ruc) formData.append("ruc", form.ruc);
      if (form.licencia) formData.append("licencia", form.licencia);
      if (form.telefono) formData.append("telefono", form.telefono);
	      if (form.whatsapp) formData.append("whatsapp", form.whatsapp);
	      if (form.formaPago) formData.append("formaPago", form.formaPago);
	      if (form.datosPago) formData.append("datosPago", form.datosPago);
	      if (form.representante) formData.append("representante", form.representante);
	      if (form.dni) formData.append("dni", form.dni);
	      if (form.telefonoRep) formData.append("telefonoRep", form.telefonoRep);
	      if (form.comentarios.trim()) formData.append("comentarios", form.comentarios.trim());
	      if (copiaRuc) formData.append("copiaRuc", copiaRuc);
	      if (copiaLicencia) formData.append("copiaLicencia", copiaLicencia);
	      if (copiaDni) formData.append("copiaDni", copiaDni);

      await api.updateProveedor(id, formData);
      router.push(`/dashboard/proveedores/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const ciudades = form.pais ? (PAISES_CIUDADES[form.pais] ?? []) : [];
  const subrubroOptions = form.rubro ? (RUBROS[form.rubro] ?? []) : [];

  if (fetching) return (
    <div className="p-6 text-center text-slate-400">
      <i className="fa-solid fa-spinner fa-spin text-2xl" />
    </div>
  );

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
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation flex-shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Datos generales" icon="fa-solid fa-building">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Razón social" required>
              <input type="text" value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} className={inputCls} />
            </Field>
            <Field label="País" required>
              <select value={form.pais} onChange={(e) => { set("pais", e.target.value); set("ciudad", ""); }} className={inputCls}>
                <option value="">Seleccionar País</option>
                {PAISES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Ciudad" required>
              <select value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} disabled={!form.pais} className={inputCls}>
                <option value="">{form.pais ? "Seleccionar ciudad" : "Primero selecciona un País"}</option>
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
            <Field label="Rubro">
              <select value={form.rubro} onChange={(e) => { set("rubro", e.target.value); set("subrubro", ""); }} className={inputCls}>
                <option value="">Seleccionar rubro</option>
                {RUBROS_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Subrubro">
              <select value={form.subrubro} onChange={(e) => set("subrubro", e.target.value)} disabled={!form.rubro} className={inputCls}>
                <option value="">{form.rubro ? "Seleccionar subrubro" : "Primero selecciona un rubro"}</option>
                {subrubroOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Entrega (incluye delivery)">
              <select value={form.entrega} onChange={(e) => set("entrega", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Datos fiscales" icon="fa-solid fa-file-invoice">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="RUC / NIT / RUT">
              <input type="text" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Licencia Nro.">
              <input type="text" value={form.licencia} onChange={(e) => set("licencia", e.target.value)} className={inputCls} />
            </Field>
            <FileField label="Copia RUC / NIT / RUT" name="copiaRuc" currentUrl={copiaRucUrl} onChange={setCopiaRuc} />
            <FileField label="Copia Licencia" name="copiaLicencia" currentUrl={copiaLicenciaUrl} onChange={setCopiaLicencia} />
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
            <Field label="Teléfono">
              <input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className={inputCls} />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

	        <Section title="Representante legal" icon="fa-solid fa-user-tie">
	          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
	            <Field label="Nombre completo">
	              <input type="text" value={form.representante} onChange={(e) => set("representante", e.target.value)} className={inputCls} />
	            </Field>
	            <Field label="DNI / CI / ID">
	              <input type="text" value={form.dni} onChange={(e) => set("dni", e.target.value)} className={inputCls} />
	            </Field>
	            <Field label="Teléfono">
	              <input type="tel" value={form.telefonoRep} onChange={(e) => set("telefonoRep", e.target.value)} className={inputCls} />
	            </Field>
	            <FileField label="Copia DNI / CI / ID" name="copiaDni" currentUrl={copiaDniUrl} onChange={setCopiaDni} />
	          </div>
	        </Section>

	        <Section title="Comentarios" icon="fa-solid fa-comment-dots">
	          <div className="grid grid-cols-1 gap-4">
	            <Field label="Comentarios">
	              <textarea rows={3} value={form.comentarios} onChange={(e) => set("comentarios", e.target.value)} className={`${inputCls} resize-none`} />
	            </Field>
	          </div>
	        </Section>

	        <div className="flex items-center justify-end gap-3 pt-2">
	          <Link href={`/dashboard/proveedores/${id}`} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">
	            Cancelar
	          </Link>
          <button type="submit" disabled={loading}
            className="bg-[#002060] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</>
              : <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>}
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
