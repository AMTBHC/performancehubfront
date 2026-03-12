import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Github,
  Upload,
  FileCode,
  Database,
  Clock,
  Settings2,
  Zap,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const Historico = () => {
  const { activeProject } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState("upload");
  const [uploadFile, setUploadFile] = useState(null);
  const [archivosRepo, setArchivosRepo] = useState([]);
  const [ejecuciones, setEjecuciones] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
const [selectedReport, setSelectedReport] = useState(null); // Para el iframe
const [analysisData, setAnalysisData] = useState(null);     // Para el texto de la IA
const [isAnalyzing, setIsAnalyzing] = useState(false);      // Para el estado de carga

  // --- NUEVOS ESTADOS PARA PARÁMETROS DE CARGA ---
  const [configuracion, setConfiguracion] = useState({
    escenario: "GH_LineaBase", // NUEVO: Valor por defecto
    hilos: 10,
    rampup: 60,
    steps: 5,
    duration: 300,
  });

  const projectName = activeProject?.name;

  const handleIAAnalysis = async (buildId) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/performance/analizar?project=${projectName}&build=${buildId}`,
      );
      const data = await response.json();
      if (data.analisis) {
        setAnalysisData(data.analisis);
      } else {
        alert("Error: " + (data.error || "No se pudo obtener análisis"));
      }
    } catch (err) {
      console.error("Error conectando con IA:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ... (Efectos de carga de archivos y logs se mantienen igual) ... */
  useEffect(() => {
    if (activeSubTab !== "launcher") return;
    if (!projectName) return;
    const loadFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/performance/history/${projectName}`,
        );
        const data = await response.json();
        setArchivosRepo(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando scripts:", err);
        setArchivosRepo([]);
      }
    };
    loadFiles();
  }, [projectName, activeSubTab]);

  const [jenkinsError, setJenkinsError] = useState(null);

  // --- EFECTO PARA CARGAR LOGS POR PROYECTO ---
  useEffect(() => {
    if (activeSubTab !== "logs") return;
    if (!projectName) return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      setJenkinsError(null); // Limpiamos errores previos al intentar conectar

      try {
        const response = await fetch(
          `http://localhost:8000/api/performance/logs?project=${encodeURIComponent(projectName)}`,
        );

        const data = await response.json();

        // Verificamos si el backend reportó que el servidor está apagado
        if (data.error === "server_offline") {
          setJenkinsError("offline");
          setEjecuciones([]);
        } else if (response.ok) {
          setEjecuciones(Array.isArray(data) ? data : []);
          setJenkinsError(null);
        } else {
          setJenkinsError("generic");
        }
      } catch (err) {
        console.error("Error cargando logs:", err);
        setJenkinsError("offline"); // Si ni siquiera hay respuesta de Laravel/Red, suele ser servidor caído
        setEjecuciones([]);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [activeSubTab, projectName]);

  const handleUploadToGit = async () => {
    if (!uploadFile || !projectName) return alert("Faltan datos");
    const formData = new FormData();
    formData.append("project", projectName);
    formData.append("file", uploadFile);
    try {
      const response = await fetch(
        "http://localhost:8000/api/performance/save",
        { method: "POST", body: formData },
      );
      if (response.ok) {
        alert("✅ Subido");
        setUploadFile(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /*
  ================================
  LANZAR EJECUCIÓN EN JENKINS (ACTUALIZADO)
  ================================
  */
  const runScript = async (file) => {
    if (!projectName) return alert("No hay proyecto activo");

    try {
      const tool = file.name.includes(".js") ? "k6" : "jmeter";

      const response = await fetch(
        "http://localhost:8000/api/performance/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project: projectName,
            path: file.path,
            tool: tool,
            // Enviamos todos los parámetros incluyendo el nuevo Escenario
            escenario: configuracion.escenario,
            hilos: configuracion.hilos,
            rampup: configuracion.rampup,
            steps: configuracion.steps,
            duration: configuracion.duration,
          }),
        },
      );

      const data = await response.json();
      if (data.status === "triggered") {
        alert("🚀 Pipeline lanzado correctamente.");
        setActiveSubTab("logs");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* HEADER (Igual al tuyo) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Centro de Operaciones
              </h1>
              <p className="text-slate-500 text-sm">
                Proyecto:{" "}
                <span className="text-indigo-600 font-bold">
                  {projectName || "Sin proyecto"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {["upload", "launcher", "logs"].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
              >
                {idx + 1}.{" "}
                {tab === "upload"
                  ? "Subir Script"
                  : tab === "launcher"
                    ? "Lanzar Jenkins"
                    : "Histórico Logs"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeSubTab === "upload" && (
          <div className="p-8 max-w-2xl mx-auto space-y-6">
            {/* Contenido pestaña 1 (Igual al tuyo) */}
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Upload size={18} className="text-indigo-500" /> Subir Script
            </h3>
            <input
              type="file"
              accept=".jmx,.js"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
            <button
              onClick={handleUploadToGit}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Github size={18} /> Subir
            </button>
          </div>
        )}

        {activeSubTab === "launcher" && (
          <div className="p-0">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 size={16} className="text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Configuración de Carga
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* NUEVOS SELECTOR DE ESCENARIO */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Escenario
                  </label>
                  <select
                    value={configuracion.escenario}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        escenario: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600 outline-none"
                  >
                    <option value="GH_LineaBase">Línea Base</option>
                    <option value="GH_Carga">Prueba Carga</option>
                    <option value="GH_Estres">Prueba Estrés</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Hilos
                  </label>
                  <input
                    type="number"
                    value={configuracion.hilos}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        hilos: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Ramp-up
                  </label>
                  <input
                    type="number"
                    value={configuracion.rampup}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        rampup: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Pasos
                  </label>
                  <input
                    type="number"
                    value={configuracion.steps}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        steps: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Duración
                  </label>
                  <input
                    type="number"
                    value={configuracion.duration}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        duration: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-600"
                  />
                </div>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Versión en GitHub</th>
                  <th className="px-6 py-4">Herramienta</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {archivosRepo.map((file) => (
                  <tr key={file.sha} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 flex items-center gap-2 font-medium text-slate-700">
                      <FileCode size={16} className="text-slate-400" />{" "}
                      {file.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">
                      {file.name.includes(".js") ? "K6" : "JMeter"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => runScript(file)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto hover:bg-indigo-500 shadow-md shadow-indigo-100"
                      >
                        <PlayCircle size={14} /> Ejecutar con Carga
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 3: LOGS */}
        {activeSubTab === "logs" && (
          <div className="p-0">
            {/* CASO 1: EL SERVIDOR ESTÁ APAGADO */}
            {jenkinsError === "offline" ? (
              <div className="m-8 p-10 border-2 border-dashed border-red-200 rounded-3xl bg-red-50/50 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 animate-bounce text-red-500 border border-red-100">
                  <XCircle size={40} />
                </div>
                <h3 className="text-red-900 font-black text-xl tracking-tight">
                  Servidor Inactivo
                </h3>
                <p className="text-red-600/80 text-sm max-w-sm mt-2 font-medium">
                  No se pudo establecer conexión con Jenkins. <br />
                  Por favor, **activa el contenedor de Docker** para ver el
                  historial.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  REINTENTAR CONEXIÓN
                </button>
              </div>
            ) : (
              /* CASO 2: TODO OK - MOSTRAR TABLA */
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Nombre de Ejecución</th>
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingLogs ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-slate-400 animate-pulse"
                      >
                        Cargando registros...
                      </td>
                    </tr>
                  ) : ejecuciones.length > 0 ? (
                    ejecuciones.map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full w-fit ${run.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                          >
                            {run.status === "success" ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {run.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                          {run.displayName
                            ? run.displayName
                            : `Build #${run.id}`}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {run.timestamp}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          {/* Botón de Reporte (Abre el iframe) */}
                          <button
                            onClick={() => setSelectedReport(run.reportUrl)}
                            className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"
                          >
                            Reporte <ExternalLink size={14} />
                          </button>

                          {/* Botón de IA (Llama a la API) */}
                          <button
                            onClick={() => handleIAAnalysis(run.id)}
                            disabled={isAnalyzing}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-black text-[10px] hover:bg-purple-200 transition-all flex items-center gap-1"
                          >
                            {isAnalyzing ? (
                              "..."
                            ) : (
                              <>
                                <Zap size={12} /> IA
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-slate-400 text-sm"
                      >
                        No hay ejecuciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            
          </div>
        )}
      </div>
      {/* Modal de IA */}
{analysisData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl">
      <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Zap className="text-indigo-500" /> Diagnóstico IA</h3>
      <p className="whitespace-pre-line text-slate-600 max-h-[60vh] overflow-y-auto">{analysisData}</p>
      <button onClick={() => setAnalysisData(null)} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold">Cerrar</button>
    </div>
  </div>
)}

{/* Modal de Reporte HTML */}
{selectedReport && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white w-full max-w-6xl h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
      <div className="p-4 flex justify-between items-center bg-slate-50 border-b">
        <span className="font-bold text-slate-700">Reporte de Ejecución</span>
        <button onClick={() => setSelectedReport(null)} className="text-slate-500 hover:text-slate-800 font-bold">CERRAR</button>
      </div>
      <iframe src={selectedReport} className="w-full h-full border-none" title="Reporte" />
    </div>
  </div>
)}
    </div>
  );
};

export default Historico;
