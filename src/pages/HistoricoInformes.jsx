import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Upload, FileUp, Folder, FolderOpen } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function HistoricoInformes() {
  const { activeProject } = useAuth();

  const [reportes, setReportes] = useState([]);
  const [file, setFile] = useState(null);
  const [data, setData] = useState({ solution_id: "" });
  const [soluciones, setSoluciones] = useState([]);

  useEffect(() => {
    if (activeProject) {
      axios
        .get(`/admin/projects/${activeProject.id}/solutions`)
        .then((res) => setSoluciones(res.data))
        .catch((err) => console.error(err));

      fetchReportes(activeProject.id);
    }
  }, [activeProject]);

  const fetchReportes = async (projectId) => {
    try {
      const res = await axios.get(`/admin/reports?project_id=${projectId}`);
      setReportes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!activeProject || !data.solution_id) {
      alert("Selecciona una solución");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", activeProject.id);
    formData.append("solution_id", data.solution_id);

    try {
      await axios.post("/admin/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchReportes(activeProject.id);
      alert("Informe subido correctamente");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Error subiendo informe");
    }
  };

  const grouped = reportes.reduce((acc, r) => {
    const p = r.project?.name || "Sin Proyecto";
    const s = r.solution?.name || "Sin Solución";

    if (!acc[p]) acc[p] = {};
    if (!acc[p][s]) acc[p][s] = [];

    acc[p][s].push(r);

    return acc;
  }, {});

  return (
    <div className="p-10 bg-slate-100 min-h-screen space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-800">
          Histórico de Informes
        </h1>
        <p className="text-slate-500">
          Gestiona y descarga los reportes de performance
        </p>
      </div>

      {/* SUBIR INFORME */}
      <form
        onSubmit={handleUpload}
        className="bg-white shadow-lg rounded-3xl p-8 space-y-6 border"
      >
        <div className="flex items-center gap-3 text-slate-700 font-bold text-lg">
          <Upload size={20} />
          Subir nuevo informe
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={data.solution_id}
            onChange={(e) =>
              setData({ ...data, solution_id: e.target.value })
            }
            className="border rounded-xl p-3 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona Solución</option>
            {soluciones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition">
            <FileUp size={18} className="mr-2 text-slate-500" />
            {file ? file.name : "Seleccionar archivo"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Upload size={16} />
          Subir Informe
        </button>
      </form>

      {/* EXPLORADOR DE INFORMES */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([proj, solutions]) => (
          <div
            key={proj}
            className="bg-white shadow-md rounded-3xl p-6 border"
          >
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">{proj}</h2>
            </div>

            {Object.entries(solutions).map(([sol, files]) => (
              <div key={sol} className="ml-6 border-l pl-6 mb-4">
                <div className="flex items-center gap-2 text-slate-600 font-semibold mb-2">
                  <Folder size={16} />
                  {sol}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {files.map((f) => (
                    <a
                      key={f.id}
                      href={`/storage/${f.file_path}`}
                      download
                      className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 border rounded-xl p-3 transition"
                    >
                      <Download size={16} className="text-blue-600" />
                      <span className="text-sm text-slate-700 truncate">
                        {f.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}