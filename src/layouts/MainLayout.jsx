import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Calculator,
  FileCode,
  BarChart3,
  BookOpen,
  History,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
  Users,
  FileText,
  Menu,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
      ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <Icon
        size={18}
        className={`transition ${
          active ? "text-white" : "text-slate-500 group-hover:text-white"
        }`}
      />
      {label}
    </Link>
  );
};

export default function MainLayout() {
  const {
    user,
    projects,
    activeProject,
    setActiveProject,
    logout,
    isAdmin,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 font-sans">

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-950 text-white flex flex-col border-r border-slate-800
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex`}
      >

        {/* LOGO */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-white p-1 rounded-lg w-9 h-9 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/performance.svg"
              alt="NTT"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Performance Hub
          </span>
        </div>

        {/* PROYECTO ACTIVO */}
        <div className="p-4 border-b border-slate-800/60">
          <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest ml-1">
            Proyecto Activo
          </label>

          <div className="relative mt-2">
            <select
              value={activeProject?.id || ""}
              onChange={(e) =>
                setActiveProject(
                  projects.find((p) => p.id === parseInt(e.target.value))
                )
              }
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 pr-8 appearance-none outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-200"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              ) : (
                <option value="">Sin proyectos</option>
              )}
            </select>

            <ChevronDown
              size={14}
              className="absolute right-2.5 top-3 text-slate-500 pointer-events-none"
            />
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
          <SidebarItem icon={Calculator} label="Calculadoras" to="/calculadoras" />
          <SidebarItem icon={FileCode} label="Generadores" to="/generadores" />
          <SidebarItem icon={BarChart3} label="Analizador" to="/analizador" />

          <div className="pt-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold px-2 tracking-widest">
              Reportes
            </p>

            <SidebarItem icon={History} label="Histórico" to="/history" />
            <SidebarItem icon={FileText} label="Informes" to="/informes" />
            <SidebarItem icon={History} label="Histórico Informes" to="/reports" />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <SidebarItem icon={BookOpen} label="Wiki / Guías" to="/knowledge" />
          </div>

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
              <p className="text-[10px] text-amber-500 uppercase font-bold px-2 tracking-widest">
                Admin Panel
              </p>

              <SidebarItem
                icon={Settings}
                label="Admin Proyectos"
                to="/admin/projects"
              />

              <SidebarItem
                icon={Users}
                label="Admin Usuarios"
                to="/admin/users"
              />
            </div>
          )}
        </nav>

        {/* USER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">

          <div className="flex items-center gap-2 truncate">
            <UserCircle
              size={20}
              className={isAdmin ? "text-amber-500" : "text-blue-400"}
            />

            <div className="flex flex-col truncate">
              <span className="text-xs font-bold truncate">
                {user?.name}
              </span>
              <span className="text-[9px] text-slate-500 uppercase font-black">
                Performance NTT
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-400 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 justify-between shadow-sm">

          <div className="flex items-center gap-3">

            {/* BOTON MOBILE */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">
                Hub de Performance
              </span>

              <span className="text-slate-300">/</span>

              <span className="text-blue-600 font-bold">
                {activeProject?.name || "Cargando..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>

            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Engine Online
            </span>
          </div>
        </header>

        {/* PAGE */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>

      </main>
    </div>
  );
}