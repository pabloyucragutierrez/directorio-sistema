"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    label: "Proveedores",
    href: "/dashboard/proveedores",
    icon: <i className="fa-solid fa-building w-4 text-center" />,
  },
  {
    label: "Pedidos",
    href: "/dashboard/pedidos",
    icon: <i className="fa-solid fa-clipboard-list w-4 text-center" />,
  },
  {
    label: "Consultas",
    href: "/dashboard/consultas",
    icon: <i className="fa-solid fa-magnifying-glass w-4 text-center" />,
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    icon: <i className="fa-solid fa-chart-bar w-4 text-center" />,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-blue-800 flex flex-col">
        <div className="px-4 py-4 border-b border-blue-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image src="/logo-sistema-white.jpeg" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight leading-tight">
              Directorio<br />
              <span className="text-blue-300 font-normal text-xs">Proveedores</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest px-2 mb-2">Módulos</p>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active ? "bg-white/10 text-white font-medium" : "text-blue-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className={`text-sm ${active ? "text-white" : "text-blue-300"}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-blue-700">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Administrador</p>
              <p className="text-[10px] text-blue-300 truncate">admin@empresa.com</p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="text-blue-300 hover:text-white transition cursor-pointer"
              title="Cerrar sesión"
            >
              <i className="fa-solid fa-right-from-bracket text-sm" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}