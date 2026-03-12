import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Download,
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Type,
  Layout,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";

export default function Informes() {
  const { activeProject } = useAuth();
  const [loadingIA, setLoadingIA] = useState(null);
  const [bgPortada, setBgPortada] = useState(
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1500&q=80",
  );

  // --- ESTADO INICIAL COMPLETO ---
  const [reportData, setReportData] = useState({
    introduccion: "",
    resumenEjecutivo: "",
    alcance: "",
    criteriosExito: "",
    resultados: [
      {
        id: Date.now(),
        nombrePrueba: "Nombre de la Prueba - Carga",
        muestras: "",
        duracionPrueba: "",
        promedioEscenario: "",
        errores: "",
        minServicio: "",
        maxServicio: "",
        promServicio: "",
        tps: "",
        p90: "",
        p95: "",
        p99: "",
        slaErroresLimite: 5,
        slaTiempoLimite: 1500,
        interpretacion: "",
        imgs: { global: null, jmeter: null, tps: null, percentiles: null },
      },
    ],
    cuellosBotella: [],
    recomendaciones: [],
    observabilidad: [],
  });

  // --- LÓGICA DE INTELIGENCIA ARTIFICIAL (CORREGIDA) ---
  const askAI = async (path, id = null, field = null) => {
    let textToRefine = "";

    // 1. Obtener el texto base
    if (id && field) {
      const targetList = reportData[path];
      const item = targetList.find((r) => r.id === id);
      textToRefine = item ? item[field] : "";
    } else {
      textToRefine = reportData[path];
    }

    if (!textToRefine || textToRefine.length < 5) {
      alert("Escribe una idea base para que la IA pueda trabajar.");
      return;
    }

    setLoadingIA(id ? `${path}-${id}` : path);

    try {
      // Petición al backend
      const res = await axios.post("ai/refine-text", {
        text: textToRefine,
        section: path,
      });

      // --- OJO AQUÍ: CORRECCIÓN DE LA PROPIEDAD ---
      // Si tu consola dice "improvedText": "...", debes usar res.data.improvedText
      const textFromAI = res.data.improvedText || res.data.text;

      if (!textFromAI) {
        console.error(
          "La IA respondió pero no se encontró el campo 'improvedText' o 'text'",
          res.data,
        );
        return;
      }

      // 2. Actualizar el estado (esto es lo que "pega" el texto en el cuadro)
      setReportData((prev) => {
        if (id && field) {
          // Caso para Resultados o Secciones Dinámicas (arrays)
          return {
            ...prev,
            [path]: prev[path].map((item) =>
              item.id === id ? { ...item, [field]: textFromAI } : item,
            ),
          };
        } else {
          // Caso para Introducción, Alcance, etc. (strings simples)
          return { ...prev, [path]: textFromAI };
        }
      });
    } catch (err) {
      console.error("Error conexión IA:", err);
      alert("Error al procesar con la IA");
    } finally {
      setLoadingIA(null);
    }
  };

  // --- MANEJO DE SECCIONES DINÁMICAS ---
  const addItem = (collection) => {
    const newItem = {
      id: Date.now(),
      titulo: "Nuevo Título",
      contenido: "",
      imagen: null,
    };
    setReportData((prev) => ({
      ...prev,
      [collection]: [...prev[collection], newItem],
    }));
  };

  const updateResult = (id, field, value) => {
    setReportData((prev) => ({
      ...prev,
      resultados: prev.resultados.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      ),
    }));
  };

  const updateResultImg = (id, imgKey, base64) => {
    setReportData((prev) => ({
      ...prev,
      resultados: prev.resultados.map((r) =>
        r.id === id ? { ...r, imgs: { ...r.imgs, [imgKey]: base64 } } : r,
      ),
    }));
  };

  // --- EXPORTACIÓN A WORD (ESTRUCTURA COMPACTA) ---
  // --- EXPORTACIÓN A WORD (ESTRUCTURA COMPLETA RESTAURADA) ---
  const exportToWord = async () => {
    const styles = `
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Calibri', sans-serif; line-height: 1.15; color: #333; }
        .portada { 
          display: block;
          width: 100%; 
          height: 100%; 
          text-align: center; 
          background-color: #004481;
        }
        h1 { color: #004481; font-size: 18pt; margin-top: 15pt; border-bottom: 1.5pt solid #004481; }
        h2 { color: #004481; font-size: 14pt; margin-top: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
        td { border: 1pt solid #004481; padding: 5pt; vertical-align: top; font-size: 10pt; }
        .img-center { text-align: center; margin: 10pt 0; }
        /* Ajuste para que las imágenes no se salgan del margen del Word */
        img { max-width: 100%; height: auto; }
        .sla-tag { padding: 8pt; margin: 5pt 0; font-weight: bold; border: 1pt solid #333; }
        .success { background-color: #dcfce7; color: #166534; }
        .fail { background-color: #fee2e2; color: #991b1b; }
      </style>
    `;

    const htmlString = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8">${styles}</head>
      <body>
        <div class="portada">
          ${bgPortada ? `<img src="${bgPortada}" style="width: 100%; height: auto; position: absolute; top: 0; left: 0;" />` : ""}
          <div style="position: relative; padding-top: 12cm; color: white;">
            <h1 style="font-size: 40pt; color: white; border: none;">INFORME PERFORMANCE</h1>
            <h2 style="font-size: 20pt; color: white;">${activeProject?.name || "SOLUCIÓN"}</h2>
          </div>
        </div>

        <div style="page-break-after: always;"></div>

        <h1>TABLA DE CONTENIDO</h1>
        <div style="line-height: 2;">
          <p>1. Introducción ..................................................................................... 2</p>
          <p>2. Resumen ejecutivo ........................................................................... 3</p>
          <p>3. Alcance ............................................................................................ 4</p>
          <p>4. Criterios de éxito .............................................................................. 5</p>
          <p>5. Resultados ....................................................................................... 6</p>
          ${reportData.resultados.map((r, i) => `<p style="padding-left: 20pt;">5.${i + 1} ${r.nombrePrueba}</p>`).join("")}
          <p>6. Cuellos de botella .............................................................................</p>
          <p>7. Recomendaciones ............................................................................</p>
          <p>8. Observabilidad ..................................................................................</p>
        </div>

        <div style="page-break-after: always;"></div>

        <h1>1. Introducción</h1><p>${reportData.introduccion || "N/A"}</p>
        <h1>2. Resumen ejecutivo</h1><p>${reportData.resumenEjecutivo || "N/A"}</p>
        <h1>3. Alcance</h1><p>${reportData.alcance || "N/A"}</p>
        <h1>4. Criterios de éxito</h1><p>${reportData.criteriosExito || "N/A"}</p>

        <div style="page-break-after: always;"></div>

        <h1>5. Resultados</h1>
        ${reportData.resultados
          .map((r, i) => {
            const errOk = parseFloat(r.errores) <= r.slaErroresLimite;
            const timeOk = parseFloat(r.promedioEscenario) <= r.slaTiempoLimite;
            return `
            <h2>5.${i + 1} ${r.nombrePrueba}</h2>
            <table>
              <tr style="background:#f3f4f6">
                <td><b>Muestras totales:</b> ${r.muestras}</td>
                <td><b>Tiempo duración:</b> ${r.duracionPrueba}</td>
              </tr>
              <tr>
                <td><b>Promedio escenario:</b> ${r.promedioEscenario} ms</td>
                <td><b>Errores:</b> ${r.errores}%</td>
              </tr>
            </table>

            <div class="img-center">
               <p><b>Imagen Resultado Global:</b></p>
               ${r.imgs.global ? `<img src="${r.imgs.global}" width="500">` : "<i>[No cargada]</i>"}
            </div>

            <table>
              <tr>
                <td><b>Mínimo:</b> ${r.minServicio} ms</td>
                <td><b>Máximo:</b> ${r.maxServicio} ms</td>
                <td><b>Promedio:</b> ${r.promServicio} ms</td>
              </tr>
            </table>

            <div class="img-center">
               <p><b>Evidencia JMeter:</b></p>
               ${r.imgs.jmeter ? `<img src="${r.imgs.jmeter}" width="500">` : "<i>[No cargada]</i>"}
            </div>

            <p><b>Transacciones por segundo (TPS):</b> ${r.tps}</p>
            <div class="img-center">
               ${r.imgs.tps ? `<img src="${r.imgs.tps}" width="500">` : "<i>[No cargada]</i>"}
            </div>

            <p><b>Percentiles:</b> P90: ${r.p90}ms | P95: ${r.p95}ms | P99: ${r.p99}ms</p>
            <div class="img-center">
               ${r.imgs.percentiles ? `<img src="${r.imgs.percentiles}" width="500">` : "<i>[No cargada]</i>"}
            </div>

            <div class="sla-tag ${errOk ? "success" : "fail"}">SLA errores (<= ${r.slaErroresLimite}%): ${errOk ? "CUMPLIDO" : "FALLIDO"}</div>
            <div class="sla-tag ${timeOk ? "success" : "fail"}">SLA tiempo (<= ${r.slaTiempoLimite}ms): ${timeOk ? "CUMPLIDO" : "FALLIDO"}</div>
            
            <p><b>Interpretación:</b> ${r.interpretacion}</p>
            <div style="page-break-after: always;"></div>
          `;
          })
          .join("")}

        <h1>6. Cuellos de botella</h1>
        ${reportData.cuellosBotella.map((item, i) => `<h2>6.${i + 1} ${item.titulo}</h2><p>${item.contenido}</p>`).join("")}

        <h1>7. Recomendaciones</h1>
        ${reportData.recomendaciones.map((item, i) => `<h2>7.${i + 1} ${item.titulo}</h2><p>${item.contenido}</p>`).join("")}

        <h1>8. Observabilidad y monitoreo</h1>
        ${reportData.observabilidad
          .map(
            (item, i) => `
          <h2>8.${i + 1} ${item.titulo}</h2>
          <p>${item.contenido}</p>
          <div class="img-center">
            ${item.imagen ? `<img src="${item.imagen}" width="500">` : ""}
          </div>
        `,
          )
          .join("")}
      </body>
      </html>
    `;

    try {
      // Generación del blob con la librería compatible
      const blob = await asBlob(htmlString, { orientation: "portrait" });
      saveAs(blob, `Informe_Performance_${activeProject?.name || "NTT"}.docx`);
    } catch (err) {
      console.error("Error al exportar:", err);
      alert(
        "Error al generar el documento. Si tienes muchas imágenes pesadas, intenta reducir su tamaño.",
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-14 bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen">
      {/* HEADER E IA GLOBAL */}
      <header className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-lg sticky top-4 z-50">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Performance Report
          </h1>
          <p className="text-indigo-600 font-semibold text-xs uppercase tracking-widest mt-1">
            Powered by NTT Data AI
          </p>
        </div>
        <div className="flex gap-3">
          <label className="bg-slate-100 p-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-all">
            <ImageIcon size={20} className="text-slate-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const reader = new FileReader();
                reader.onload = () => setBgPortada(reader.result);
                reader.readAsDataURL(e.target.files[0]);
              }}
            />
          </label>
          <button
            onClick={exportToWord}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Download size={20} /> EXPORTAR DOCX
          </button>
        </div>
      </header>

      {/* SECCIONES 1-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: "introduccion", label: "INTRODUCCIÓN" },
          { key: "resumenEjecutivo", label: "RESUMEN EJECUTIVO" },
          { key: "alcance", label: "ALCANCE" },
          { key: "criteriosExito", label: "CRITERIOS DE ÉXITO" },
        ].map((item) => (
          <SectionWithIA
            key={item.key}
            title={item.label}
            value={reportData[item.key]}
            onChange={(val) =>
              setReportData({ ...reportData, [item.key]: val })
            }
            onAi={() => askAI(item.key)}
            loading={loadingIA === item.key}
          />
        ))}
      </div>

      {/* SECCIÓN 5: RESULTADOS */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">
            5. RESULTADOS DE PRUEBAS
          </h2>
          <button
            onClick={() =>
              setReportData((prev) => ({
                ...prev,
                resultados: [
                  ...prev.resultados,
                  {
                    id: Date.now(),
                    nombrePrueba: "Nueva Prueba",
                    interpretacion: "",
                    imgs: {},
                  },
                ],
              }))
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            <PlusCircle size={18} /> AÑADIR ESCENARIO
          </button>
        </div>

        {reportData.resultados.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-3xl border border-slate-200 p-10 shadow-md hover:shadow-xl transition-all duration-300 space-y-8 relative"
          >
            <div className="flex justify-between items-center">
              <input
                className="text-xl font-black text-blue-600 border-b-2 border-slate-100 outline-none focus:border-blue-400 w-2/3"
                value={res.nombrePrueba}
                onChange={(e) =>
                  updateResult(res.id, "nombrePrueba", e.target.value)
                }
              />
              <button
                onClick={() =>
                  setReportData((p) => ({
                    ...p,
                    resultados: p.resultados.filter((r) => r.id !== res.id),
                  }))
                }
              >
                <Trash2 className="text-red-300 hover:text-red-600" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 focus-within:border-indigo-400 transition-all shadow-sm">
              <MetricInput
                label="Muestras"
                value={res.muestras}
                onChange={(v) => updateResult(res.id, "muestras", v)}
              />
              <MetricInput
                label="Duración"
                value={res.duracionPrueba}
                onChange={(v) => updateResult(res.id, "duracionPrueba", v)}
              />
              <MetricInput
                label="Promedio (ms)"
                value={res.promedioEscenario}
                onChange={(v) => updateResult(res.id, "promedioEscenario", v)}
              />
              <MetricInput
                label="Errores (%)"
                value={res.errores}
                onChange={(v) => updateResult(res.id, "errores", v)}
              />
            </div>

            <ImageUpload
              label="IMAGEN RESULTADO GLOBAL"
              value={res.imgs.global}
              onUpload={(v) => updateResultImg(res.id, "global", v)}
            />

            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl">
              <MetricInput
                label="MIN FLUJO"
                value={res.minServicio}
                onChange={(v) => updateResult(res.id, "minServicio", v)}
              />
              <MetricInput
                label="MAX FLUJO"
                value={res.maxServicio}
                onChange={(v) => updateResult(res.id, "maxServicio", v)}
              />
              <MetricInput
                label="PROM FLUJO"
                value={res.promServicio}
                onChange={(v) => updateResult(res.id, "promServicio", v)}
              />
            </div>

            <ImageUpload
              label="IMAGEN GENERAL JMETER"
              value={res.imgs.jmeter}
              onUpload={(v) => updateResultImg(res.id, "jmeter", v)}
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <MetricInput
                  label="TPS"
                  value={res.tps}
                  onChange={(v) => updateResult(res.id, "tps", v)}
                />
              </div>
              <div className="flex-1">
                <ImageUpload
                  label="IMAGEN TPS"
                  value={res.imgs.tps}
                  onUpload={(v) => updateResultImg(res.id, "tps", v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <MetricInput
                label="P90"
                value={res.p90}
                onChange={(v) => updateResult(res.id, "p90", v)}
              />
              <MetricInput
                label="P95"
                value={res.p95}
                onChange={(v) => updateResult(res.id, "p95", v)}
              />
              <MetricInput
                label="P99"
                value={res.p99}
                onChange={(v) => updateResult(res.id, "p99", v)}
              />
            </div>

            <ImageUpload
              label="IMAGEN PERCENTILES"
              value={res.imgs.percentiles}
              onUpload={(v) => updateResultImg(res.id, "percentiles", v)}
            />

            <div className="bg-blue-50/50 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-black text-xs text-blue-900 uppercase">
                  Interpretación con IA
                </label>
                <button
                  onClick={() => askAI("resultados", res.id, "interpretacion")}
                  className="text-purple-600 hover:scale-110 transition-all"
                >
                  {loadingIA === `resultados-${res.id}` ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </button>
              </div>
              <textarea
                className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-sm resize-none"
                value={res.interpretacion}
                onChange={(e) =>
                  updateResult(res.id, "interpretacion", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* SECCIONES DINÁMICAS 6, 7 Y 8 */}
      {["cuellosBotella", "recomendaciones", "observabilidad"].map(
        (col, cIdx) => (
          <div key={col} className="space-y-4">
            <div className="flex justify-between items-center border-b-4 border-slate-900 pb-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase">
                {cIdx + 6}. {col.replace(/([A-Z])/g, " $1")}
              </h2>
              <button
                onClick={() => addItem(col)}
                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <div className="grid gap-4">
              {reportData[col].map((item, iIdx) => (
                <div
                  key={item.id}
                  className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm space-y-4 relative"
                >
                  <button
                    onClick={() =>
                      setReportData((p) => ({
                        ...p,
                        [col]: p[col].filter((i) => i.id !== item.id),
                      }))
                    }
                    className="absolute top-6 right-6 text-red-300 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex gap-4 items-center">
                    <span className="font-black text-blue-600">
                      {cIdx + 6}.{iIdx + 1}
                    </span>
                    <input
                      className="bg-transparent font-semibold text-slate-800 text-sm outline-none w-full"
                      value={item.titulo}
                      onChange={(e) =>
                        setReportData((p) => ({
                          ...p,
                          [col]: p[col].map((i) =>
                            i.id === item.id
                              ? { ...i, titulo: e.target.value }
                              : i,
                          ),
                        }))
                      }
                    />
                    <button
                      onClick={() => askAI(col, item.id, "contenido")}
                      className="text-purple-500 hover:scale-110"
                    >
                      {loadingIA === `${col}-${item.id}` ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </button>
                  </div>
                  <textarea
                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-sm resize-none"
                    value={item.contenido}
                    onChange={(e) =>
                      setReportData((p) => ({
                        ...p,
                        [col]: p[col].map((i) =>
                          i.id === item.id
                            ? { ...i, contenido: e.target.value }
                            : i,
                        ),
                      }))
                    }
                  />
                  {col === "observabilidad" && (
                    <ImageUpload
                      label="Evidencia de Monitoreo"
                      value={item.imagen}
                      onUpload={(v) =>
                        setReportData((p) => ({
                          ...p,
                          [col]: p[col].map((i) =>
                            i.id === item.id ? { ...i, imagen: v } : i,
                          ),
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function SectionWithIA({ title, value, onChange, onAi, loading }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <label className="font-black text-slate-700 text-[11px] tracking-widest">
          {title}
        </label>
        <button
          onClick={onAi}
          className="text-purple-600 hover:scale-125 transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
        </button>
      </div>
      <textarea
        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-sm resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MetricInput({ label, value, onChange }) {
  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-tighter">
        {label}
      </label>
      <input
        className="bg-transparent font-bold text-slate-800 text-sm outline-none w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ImageUpload({ label, value, onUpload }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
        <ImageIcon size={14} /> {label}
      </label>
      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-4 min-h-[140px] flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden">
        {value ? (
          <div className="w-full flex flex-col items-center">
            <img
              src={value}
              className="max-h-48 rounded-xl shadow-lg border border-white"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpload(null);
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full py-8">
            <div className="bg-white p-4 rounded-full shadow-sm text-slate-300">
              <PlusCircle size={32} />
            </div>
            <span className="text-[10px] font-black text-slate-400">
              CLIC PARA SUBIR CAPTURA
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onUpload(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
