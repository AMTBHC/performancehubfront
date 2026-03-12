import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Trash2,
  Box,
  CheckCircle2,
  Pencil,
} from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [solutionsByProject, setSolutionsByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    project_ids: [],
    solution_ids: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [uRes, pRes] = await Promise.all([
      axios.get("/admin/users"),
      axios.get("/admin/projects"),
    ]);

    setUsers(uRes.data);
    setProjects(pRes.data);
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;

    try {
      await axios.delete(`/admin/users/${id}`);
      fetchData();
    } catch {
      alert("Error al eliminar usuario");
    }
  };

  const startEdit = async (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      project_ids: user.projects.map((p) => p.id),
      solution_ids: user.solutions.map((s) => s.id),
    });

    for (const project of user.projects) {
      try {
        const res = await axios.get(`/admin/projects/${project.id}/full-details`);

        setSolutionsByProject((prev) => ({
          ...prev,
          [project.id]: res.data.solutions,
        }));
      } catch {
        console.error("Error cargando soluciones");
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleProject = async (projectId) => {
    let newProjectIds = [...formData.project_ids];
    let newSolutionIds = [...formData.solution_ids];

    if (newProjectIds.includes(projectId)) {
      newProjectIds = newProjectIds.filter((id) => id !== projectId);
    } else {
      newProjectIds.push(projectId);

      if (!solutionsByProject[projectId]) {
        const res = await axios.get(`/admin/projects/${projectId}/full-details`);

        setSolutionsByProject((prev) => ({
          ...prev,
          [projectId]: res.data.solutions,
        }));
      }
    }

    setFormData({
      ...formData,
      project_ids: newProjectIds,
      solution_ids: newSolutionIds,
    });
  };

  const toggleSolution = (solutionId) => {
    const ids = formData.solution_ids.includes(solutionId)
      ? formData.solution_ids.filter((id) => id !== solutionId)
      : [...formData.solution_ids, solutionId];

    setFormData({ ...formData, solution_ids: ids });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await axios.put(`/admin/users/${editingUser.id}`, formData);
      } else {
        await axios.post("/admin/users", formData);
      }

      setEditingUser(null);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        project_ids: [],
        solution_ids: [],
      });

      fetchData();
    } catch (error) {
      alert("Error guardando usuario");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in">

      {/* FORM */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="text-indigo-600" />
            Gestión de Usuarios
          </h2>

          {editingUser && (
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">
              Editando Usuario
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* INPUTS */}
          <div className="grid md:grid-cols-4 gap-4">

            <input
              className="input-style"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              className="input-style"
              placeholder="Email corporativo"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              className="input-style"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <select
              className="input-style font-semibold"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">Consultor</option>
              <option value="admin">Administrador</option>
            </select>

          </div>

          {/* PROYECTOS */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">

            <p className="text-xs font-bold uppercase text-slate-400 mb-3">
              Proyectos
            </p>

            <div className="flex flex-wrap gap-2">

              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProject(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
                  ${
                    formData.project_ids.includes(p.id)
                      ? "bg-indigo-600 text-white border-indigo-600 shadow"
                      : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                  }`}
                >
                  {p.name}
                </button>
              ))}

            </div>

          </div>

          {/* SOLUCIONES */}
          <div className="space-y-4">

            {formData.project_ids.map((pId) => {

              const projectName = projects.find((p) => p.id === pId)?.name;
              const solutions = solutionsByProject[pId] || [];

              return (
                <div
                  key={pId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >

                  <p className="text-xs font-bold text-slate-700 mb-3 uppercase">
                    Módulos de {projectName}
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {solutions.map((sol) => (

                      <button
                        key={sol.id}
                        type="button"
                        onClick={() => toggleSolution(sol.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all
                        ${
                          formData.solution_ids.includes(sol.id)
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >

                        {formData.solution_ids.includes(sol.id)
                          ? <CheckCircle2 size={14}/>
                          : <Box size={14}/>
                        }

                        {sol.name}

                      </button>

                    ))}

                  </div>

                </div>
              );
            })}

          </div>

          {/* BUTTONS */}
          <div className="flex gap-4">

            <button
              type="submit"
              className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all
              ${
                editingUser
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-slate-900 text-white hover:bg-indigo-600"
              }`}
            >
              {editingUser
                ? "Actualizar Usuario"
                : "Crear Usuario"}
            </button>

            {editingUser && (
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "user",
                    project_ids: [],
                    solution_ids: [],
                  });
                }}
                className="bg-slate-200 px-6 rounded-2xl font-bold text-sm hover:bg-slate-300"
              >
                Cancelar
              </button>
            )}

          </div>

        </form>

      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4 text-left">Usuario</th>
              <th className="px-6 py-4 text-left">Accesos</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {users.map((u) => (

              <tr key={u.id} className="hover:bg-slate-50">

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold
                    ${u.role === "admin"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {u.name[0]}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>

                  </div>

                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {u.projects?.map((p) => p.name).join(", ")}
                </td>

                <td className="px-6 py-4 text-right">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => startEdit(u)}
                      className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Pencil size={18}/>
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={18}/>
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <style>{`
        .input-style{
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:12px;
          font-size:14px;
          width:100%;
          transition:all .2s;
        }

        .input-style:focus{
          border-color:#6366f1;
          box-shadow:0 0 0 3px rgba(99,102,241,0.15);
          outline:none;
        }
      `}</style>

    </div>
  );
}