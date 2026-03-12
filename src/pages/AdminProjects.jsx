import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  Settings,
  Box,
  Zap,
  X,
} from "lucide-react";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [newSolutionName, setNewSolutionName] = useState("");
  const [projectData, setProjectData] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    if (!confirm("¿Eliminar este proyecto y todo su contenido?")) return;
    try {
      await axios.delete(`/admin/projects/${id}`);
      fetchProjects();
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const handleEditProject = async (project) => {
    const newName = prompt("Nuevo nombre del proyecto:", project.name);
    if (!newName || newName === project.name) return;

    try {
      await axios.put(`/admin/projects/${project.id}`, { name: newName });
      fetchProjects();
    } catch (error) {
      console.error("Error al actualizar", error);
      alert("No se pudo actualizar el nombre");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/admin/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error al cargar proyectos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await axios.post("/admin/projects", { name: newProjectName });
      setNewProjectName("");
      fetchProjects();
    } catch (error) {
      alert("Error al crear el proyecto");
    }
  };

  const openNfrManager = async (project) => {
    setSelectedProject(project);
    try {
      const res = await axios.get(`/admin/projects/${project.id}/full-details`);
      setProjectData(res.data.solutions);
    } catch (e) {
      console.error("Error al obtener detalles", e);
    }
  };

  const handleAddSolution = async () => {
    if (!newSolutionName) return;

    try {
      await axios.post(`/admin/projects/${selectedProject.id}/solutions`, {
        name: newSolutionName,
      });

      setNewSolutionName("");
      openNfrManager(selectedProject);
    } catch (e) {
      alert("Error al crear solución");
    }
  };

  const handleAddKpi = async (solutionId) => {
    const metric = prompt("Nombre de la métrica (ej: TPS, Latencia, Error %)");
    const value = prompt("Valor objetivo (ej: 500, 200, 1)");
    const unit = prompt("Unidad (ej: req/s, ms, %)");

    if (!metric || !value || !unit) return;

    try {
      await axios.post(`/admin/solutions/${solutionId}/kpis`, {
        metric_name: metric,
        target_value: value,
        unit: unit,
      });

      openNfrManager(selectedProject);
    } catch (e) {
      alert("Error al crear KPI");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Gestión de Proyectos
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Administra clientes, soluciones y KPIs técnicos
          </p>
        </div>

        <form onSubmit={handleCreateProject} className="flex gap-3">
          <input
            type="text"
            placeholder="Nuevo proyecto..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
          />

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> Crear
          </button>
        </form>
      </div>

      {/* TABLA */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ID
              </th>

              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Proyecto
              </th>

              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Configuración
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-slate-50 transition-colors"
              >

                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  #{project.id}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
                  {project.name}
                </td>

                <td className="px-6 py-4">

                  <button
                    onClick={() => openNfrManager(project)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Settings size={14} />
                    Configurar
                  </button>

                </td>

                <td className="px-6 py-4 text-right">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>
        </table>

      </div>

      {/* MODAL */}
      {selectedProject && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh]">

            {/* HEADER MODAL */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">

              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {selectedProject.name}
                </h2>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  NFR Manager
                </p>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto space-y-6">

              {/* NUEVA SOLUCIÓN */}
              <div className="flex gap-3">

                <input
                  type="text"
                  placeholder="Nueva solución (API pagos, Gateway, etc)"
                  value={newSolutionName}
                  onChange={(e) => setNewSolutionName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={handleAddSolution}
                  className="bg-slate-900 text-white px-5 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all"
                >
                  Añadir
                </button>

              </div>

              {/* SOLUCIONES */}
              <div className="space-y-4">

                {projectData?.map((sol) => (

                  <div
                    key={sol.id}
                    className="border border-slate-100 rounded-2xl p-5 bg-slate-50"
                  >

                    <div className="flex justify-between items-center mb-3">

                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <Box size={16} className="text-indigo-500" />
                        {sol.name}
                      </span>

                      <button
                        onClick={() => handleAddKpi(sol.id)}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        + KPI
                      </button>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      {sol.kpis?.map((kpi) => (

                        <div
                          key={kpi.id}
                          className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm"
                        >

                          <Zap size={12} className="text-amber-500" />

                          <span className="text-[11px] font-semibold text-slate-600">
                            {kpi.metric_name}
                          </span>

                          <span className="text-[11px] font-black text-slate-900">
                            {kpi.target_value}{kpi.unit}
                          </span>

                        </div>

                      ))}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}