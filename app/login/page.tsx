"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      router.push("/dashboard/proveedores");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-blue-600 opacity-50" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-blue-800 opacity-60" />
        <div className="absolute top-1/2 right-[-40px] w-32 h-32 rounded-full bg-red-500 opacity-30" />
        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <Image src="/logo-sistema.jpeg" alt="Logo" width={80} height={80} className="object-cover" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-3">Directorio de Proveedores</h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Gestiona tus proveedores, pedidos y calificaciones desde un solo lugar.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {["Registro y seguimiento de proveedores", "Control de pedidos en tiempo real", "Reportes y calificaciones"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-white text-[10px]" />
                </div>
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex flex-col items-center mb-8 gap-3">
            <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center overflow-hidden">
              <Image src="/logo-sistema.jpeg" alt="Logo" width={64} height={64} className="object-cover" />
            </div>
            <span className="text-base font-semibold text-slate-700">Directorio de Proveedores</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Bienvenido</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <i className="fa-solid fa-circle-exclamation mr-2" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">Correo electrónico</label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com" required
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-all duration-150 mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin" />Ingresando...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket" />Ingresar</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}