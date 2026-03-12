import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import axios from "axios";

import MainLayout from "./layouts/MainLayout";
import Calculadoras from "./pages/Calculadoras";
import Wiki from "./pages/Wiki";
import Generadores from "./pages/Generadores";
import Analizador from "./pages/Analizador";
import Login from "./pages/Login";
import Informes from "./pages/Informes";
import Historys from "./pages/history";
import HistoricoInformes from "./pages/HistoricoInformes";
import AdminProjects from "./pages/AdminProjects";
import AdminUsers from "./pages/AdminUsers";

import { useAuth } from "./hooks/useAuth";

import {
  LayoutDashboard,
  Zap,
  BarChart3,
  BookOpen,
  History,
  Settings,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Box,
} from "lucide-react";


// ---------------- PROTECCIÓN DE RUTAS ----------------

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAdmin ? children : <Navigate to="/" />;
};


// ---------------- LOADING SCREEN ----------------

const LoadingScreen = () => (
  <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
      Iniciando Engine...
    </p>
  </div>
);


// ---------------- DASHBOARD ----------------

const Dashboard = () => {
  const { activeProject, isAdmin } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!activeProject?.id) return;

    const loadDashboard = async () => {
      try {

        setLoading(true);

        const { data } = await axios.get(
          `/projects/${activeProject.id}/dashboard`
        );

        setSolutions(data || []);

      } catch (error) {

        console.error("Error cargando dashboard:", error);
        setSolutions([]);

      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, [activeProject?.id]);



  if (loading)
    return (
      <div className="p-10 text-slate-400 animate-pulse font-bold flex items-center gap-3">
        <Activity className="animate-bounce" />
        Sincronizando KPIs...
      </div>
    );


  return (
    <div className="space-y-10">

      {/* HEADER */}
      <header className="flex justify-between items-end">

        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Performance Hub
          </h1>

          <p className="text-slate-500">
            Dashboard de {activeProject?.name || "Proyecto"}
          </p>
        </div>

        <div
          className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest
          ${isAdmin ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"}`}
        >
          {isAdmin ? "Admin Engine" : "Live Engine"}
        </div>

      </header>


      {/* KPIs */}
      {solutions.length === 0 ? (

        <EmptyState isAdmin={isAdmin} />

      ) : (

        solutions.map((sol) => (
          <div key={sol.id} className="space-y-4">

            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Solución · {sol.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {sol.kpis?.map((kpi) => {

                const name = kpi.metric_name.toLowerCase();

                const icon =
                  name.includes("error")
                    ? <AlertCircle className="text-red-500"/>
                    : name.includes("time") || name.includes("latencia")
                    ? <Activity className="text-emerald-500"/>
                    : <Zap className="text-amber-500"/>

                return (
                  <StatCard
                    key={kpi.id}
                    title={kpi.metric_name}
                    value={kpi.target_value}
                    unit={kpi.unit}
                    icon={icon}
                    isAlert={name.includes("error")}
                  />
                );
              })}

            </div>

          </div>
        ))

      )}



      {/* MODULOS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">

          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <LayoutDashboard size={20}/>
            Módulos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <ModuleLink
              to="/calculadoras"
              title="Capacity Planning"
              desc="Calcula escalabilidad y límites."
              icon={<Zap size={24}/>}
            />

            <ModuleLink
              to="/knowledge"
              title="Knowledge Base"
              desc="Documentación y guías."
              icon={<BookOpen size={24}/>}
            />

            <ModuleLink
              to="/generadores"
              title="Script Generator"
              desc="Genera scripts de pruebas."
              icon={<Settings size={24}/>}
            />

            <ModuleLink
              to="/analizador"
              title="Result Analyzer"
              desc="Analiza logs de pruebas."
              icon={<BarChart3 size={24}/>}
            />

          </div>

        </div>


        <RecentActivity project={activeProject?.name} />

      </section>

    </div>
  );
};


// ---------------- COMPONENTES AUX ----------------

const EmptyState = ({ isAdmin }) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">

    <Box className="mx-auto text-slate-200 mb-4" size={48}/>

    <p className="text-slate-400 font-medium">
      No hay KPIs configurados.
    </p>

    <p className="text-xs text-slate-300 mt-2 italic">
      {isAdmin
        ? "Ve a Admin Proyectos para configurarlos."
        : "Contacta a un administrador."}
    </p>

  </div>
);


const StatCard = ({ title, value, unit, icon, isAlert }) => (

  <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 transition">

    <div className="flex justify-between mb-4">
      {icon}

      <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase
        ${isAlert ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
        Target
      </span>

    </div>

    <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
      {title}
    </h3>

    <p className="text-2xl font-black text-slate-800 mt-1">
      {value} <span className="text-sm text-slate-400">{unit}</span>
    </p>

  </div>

);


const ModuleLink = ({ to, title, desc, icon }) => (

  <Link
    to={to}
    className="group p-6 bg-white border border-slate-200 rounded-3xl hover:shadow-xl transition"
  >

    <div className="mb-4 text-indigo-600">
      {icon}
    </div>

    <div className="flex justify-between items-center">

      <h3 className="font-bold text-slate-800">
        {title}
      </h3>

      <ArrowUpRight size={18}/>

    </div>

    <p className="text-slate-500 text-xs mt-2">
      {desc}
    </p>

  </Link>

);


const RecentActivity = ({ project }) => (

  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">

    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      <History size={18}/>
      Actividad
    </h2>

    <ActivityItem text={`Consultando ${project || "Proyecto"}`} time="Ahora"/>
    <ActivityItem text="Engine sincronizado con DB" time="Hace 1 min"/>

  </div>

);


const ActivityItem = ({ text, time }) => (

  <div className="flex gap-3">

    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1"/>

    <div>
      <p className="text-xs font-bold text-slate-700">
        {text}
      </p>

      <p className="text-[10px] text-slate-400 uppercase">
        {time}
      </p>
    </div>

  </div>

);


// ---------------- APP ----------------

export default function App() {

  const { token, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={!token ? <Login/> : <Navigate to="/"/>}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout/>
            </ProtectedRoute>
          }
        >

          <Route index element={<Dashboard/>}/>
          <Route path="calculadoras" element={<Calculadoras/>}/>
          <Route path="knowledge" element={<Wiki/>}/>
          <Route path="generadores" element={<Generadores/>}/>
          <Route path="analizador" element={<Analizador/>}/>
          <Route path="history" element={<Historys/>}/>
          <Route path="informes" element={<Informes/>}/>
          <Route path="reports" element={<HistoricoInformes/>}/>

          <Route
            path="admin/projects"
            element={
              <AdminRoute>
                <AdminProjects/>
              </AdminRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminUsers/>
              </AdminRoute>
            }
          />

        </Route>

        <Route path="*" element={<Navigate to="/"/>}/>

      </Routes>

    </BrowserRouter>
  );
}