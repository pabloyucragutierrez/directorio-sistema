"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { removeToken, getToken, getCurrentUser, removeCurrentUser, getRole, removeRole, removeCurrentProveedor } from "@/lib/api";

const navItems = [
  { label: "Proveedores", href: "/dashboard/proveedores", icon: <i className="fa-solid fa-building w-4 text-center" /> },
  { label: "Pedidos", href: "/dashboard/pedidos", icon: <i className="fa-solid fa-clipboard-list w-4 text-center" /> },
  { label: "Consultas", href: "/dashboard/consultas", icon: <i className="fa-solid fa-magnifying-glass w-4 text-center" /> },
  { label: "Reportes", href: "/dashboard/reportes", icon: <i className="fa-solid fa-chart-bar w-4 text-center" /> },
  { label: "Usuarios", href: "/dashboard/usuarios", icon: <i className="fa-solid fa-users w-4 text-center" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; email: string } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    const role = getRole();
    if (role === 'proveedor') { router.replace("/proveedor/dashboard"); return; }
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    removeToken();
    removeRole();
    removeCurrentUser();
    removeCurrentProveedor();
    router.push("/login");
  };

  const initials = currentUser?.nombre
    ? currentUser.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`bg-[#172a5c] flex flex-col h-full ${mobile ? "w-64" : collapsed ? "w-16" : "w-56"} ${mobile ? "" : "flex-shrink-0 transition-all duration-300"}`}>
      <div className="px-3 py-4 border-b border-blue-700 flex items-center justify-between min-h-[60px]">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src="/logo-sistema-white.jfif" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight leading-tight whitespace-nowrap">
              Directorio<br />
              <span className="text-blue-300 font-normal text-xs">Proveedores</span>
            </span>
          </div>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden mx-auto">
            <Image src="/logo-sistema-white.jfif" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
          </div>
        )}
        {!mobile && !collapsed && (
          <button onClick={() => setCollapsed(true)} className="text-blue-300 hover:text-white hover:bg-white/10 rounded-md p-1.5 transition-all duration-150 cursor-pointer flex-shrink-0 ml-auto">
            <i className="fa-solid fa-angles-left text-xs" />
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="text-blue-300 hover:text-white hover:bg-white/10 rounded-md p-1.5 transition-all duration-150 cursor-pointer flex-shrink-0 ml-auto">
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest px-2 mb-2">Módulos</p>
        )}
        {collapsed && !mobile && (
          <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center p-2 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer mb-2">
            <i className="fa-solid fa-angles-right text-xs" />
          </button>
        )}
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150
                ${collapsed && !mobile ? "justify-center" : ""}
                ${active ? "bg-white/10 text-white font-medium" : "text-blue-200 hover:text-white hover:bg-white/10"}`}
              title={collapsed && !mobile ? item.label : undefined}
            >
              <span className={`text-sm flex-shrink-0 ${active ? "text-white" : "text-blue-300"}`}>{item.icon}</span>
              {(!collapsed || mobile) && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-blue-700">
        {collapsed && !mobile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <button onClick={handleLogout} className="text-blue-300 hover:text-white transition cursor-pointer">
              <i className="fa-solid fa-right-from-bracket text-sm" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser?.nombre ?? "Usuario"}</p>
              <p className="text-[10px] text-blue-300 truncate">{currentUser?.email ?? ""}</p>
            </div>
            <button onClick={handleLogout} className="text-blue-300 hover:text-white transition cursor-pointer">
              <i className="fa-solid fa-right-from-bracket text-sm" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <div className="hidden md:flex">
        <SidebarContent />
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex h-full">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#002060] border-b border-blue-700 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-blue-200 hover:text-white transition cursor-pointer p-1">
            <i className="fa-solid fa-bars text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center overflow-hidden">
              <Image src="/logo-sistema-white.jfif" alt="Logo" width={24} height={24} className="object-cover w-full h-full" />
            </div>
            <span className="text-sm font-semibold text-white">Directorio</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
