"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard/proveedores"), 800);
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/proveedores" className="text-slate-400 hover:text-slate-600 transition">
          <i className="fa-solid fa-chevron-left text-sm" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nuevo proveedor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Completa los datos del proveedor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Datos generales" icon="fa-solid fa-building">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Razón social" required><input type="text" placeholder="Empresa S.A." className={inputCls} /></Field>
            <Field label="País" required><input type="text" placeholder="Perú" className={inputCls} /></Field>
            <Field label="Ciudad" required><input type="text" placeholder="Lima" className={inputCls} /></Field>
            <Field label="Dirección"><input type="text" placeholder="Av. Principal 123" className={inputCls} /></Field>
            <Field label="Distrito / Zona / Barrio"><input type="text" placeholder="Miraflores" className={inputCls} /></Field>
            <Field label="Código postal"><input type="text" placeholder="15074" className={inputCls} /></Field>
            <Field label="Referencia" className="col-span-2"><input type="text" placeholder="Cerca al parque..." className={inputCls} /></Field>
            <Field label="Entrega">
              <select className={inputCls}>
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Email" required><input type="email" placeholder="contacto@empresa.com" className={inputCls} /></Field>
          </div>
        </Section>

        <Section title="Datos fiscales" icon="fa-solid fa-file-invoice">
          <div className="grid grid-cols-2 gap-4">
            <Field label="RUC / NIT / RUT" required><input type="text" placeholder="20512345678" className={inputCls} /></Field>
            <Field label="Licencia Nro."><input type="text" placeholder="LIC-000123" className={inputCls} /></Field>
            <Field label="Copia RUC / NIT / RUT"><input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} /></Field>
            <Field label="Forma de pago"><input type="text" placeholder="Transferencia, efectivo..." className={inputCls} /></Field>
            <Field label="Datos para pago" className="col-span-2">
              <textarea rows={2} placeholder="Banco, cuenta, CCI..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </Section>

        <Section title="Contacto" icon="fa-solid fa-phone">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono"><input type="tel" placeholder="+51 1 234 5678" className={inputCls} /></Field>
            <Field label="WhatsApp"><input type="tel" placeholder="+51 987 654 321" className={inputCls} /></Field>
          </div>
        </Section>

        <Section title="Representante legal" icon="fa-solid fa-user-tie">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre completo" required><input type="text" placeholder="Juan Pérez" className={inputCls} /></Field>
            <Field label="DNI / CI / ID" required><input type="text" placeholder="12345678" className={inputCls} /></Field>
            <Field label="Teléfono"><input type="tel" placeholder="+51 987 000 000" className={inputCls} /></Field>
            <Field label="Copia DNI / CI / ID"><input type="file" accept=".pdf,.jpg,.jpeg,.png" className={fileCls} /></Field>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/proveedores" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition">
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
              <><i className="fa-solid fa-floppy-disk" /> Guardar proveedor</>
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
    <div className="bg-white border border-slate-200 rounded-xl p-5">
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