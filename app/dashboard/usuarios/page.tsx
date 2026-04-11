"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  createdAt: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const openCrear = () => {
    setEditando(null);
    setForm({ nombre: "", email: "", password: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, password: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.nombre || !form.email) { setFormError("Nombre y email son obligatorios"); return; }
    if (!editando && !form.password) { setFormError("La contraseña es obligatoria"); return; }
    setSaving(true);
    try {
      if (editando) {
        const data: Record<string, string> = { nombre: form.nombre, email: form.email };
        if (form.password) data.password = form.password;
        await api.updateUsuario(editando.id, data);
      } else {
        await api.createUsuario(form);
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u: Usuario) => {
    try {
      await api.updateUsuario(u.id, { activo: !u.activo });
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: !x.activo } : x));
    } catch {
      setError("Error al cambiar estado");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona los usuarios del sistema</p>
        </div>
        <button onClick={openCrear}
          className="flex items-center gap-1.5 bg-[#002060] hover:bg-[#002060] text-white text-sm font-medium px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer">
          <i className="fa-solid fa-plus" />
          <span className="hidden sm:inline">Nuevo usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation mr-2" />{error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400"><i className="fa-solid fa-spinner fa-spin text-2xl mb-2 block" />Cargando...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400"><i className="fa-solid fa-users text-2xl mb-2 block" />No hay usuarios</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#002060] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">{u.nombre.charAt(0).toUpperCase()}</span>
                        </div>
                        {u.nombre}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${u.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        <i className={`fa-solid fa-circle text-[6px] ${u.activo ? "text-emerald-500" : "text-slate-400"}`} />
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditar(u)}
                          className="text-xs text-slate-400 hover:text-blue-600 transition font-medium cursor-pointer">
                          <i className="fa-solid fa-pen-to-square" />
                        </button>
                        <button onClick={() => handleToggle(u)}
                          className={`text-xs font-medium px-2 py-0.5 rounded transition cursor-pointer ${u.activo ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">
                {editando ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <i className="fa-solid fa-circle-exclamation mr-2" />{formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                <input type="text" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Administrador" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@empresa.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Contraseña {!editando && <span className="text-red-500">*</span>}
                  {editando && <span className="text-slate-400 font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••" className={inputCls} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="bg-[#002060] hover:bg-[#002060] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2">
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : <><i className="fa-solid fa-floppy-disk" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";