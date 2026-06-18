import React, { useState } from "react";
import axios from "axios";
import {
  Settings,
  Copy,
  Check,
  FileCode,
  Globe,
  Download,
  Edit3,
  Sparkles,
  Loader2,
} from "lucide-react";

const Generadores = () => {
  const [tool, setTool] = useState("k6");
  const [modoEjecucion, setModoEjecucion] = useState("local"); // NUEVO ESTADO
  const [url, setUrl] = useState("https://api.ejemplo.com/v1/resource");
  const [duration, setDuration] = useState(30);
  const [copied, setCopied] = useState(false);

  // Estado para K6 (Simple)
  const [k6Vus, setK6Vus] = useState(10);

  // --- IA: generación de script desde historias de usuario ---
  const [metodoGen, setMetodoGen] = useState("manual"); // "manual" | "ia"
  const [historias, setHistorias] = useState("");
  const [iaScript, setIaScript] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [iaError, setIaError] = useState(null);

  // Estado para JMeter (Detallado)
  const [jmeterConfig, setJmeterConfig] = useState({
    samplerName: "Petición Principal",
    basicThreads: 1,
    baselineThreads: 5,
    loadThreads: 20,
    stressThreads: 50,
  });

  const updateJmeterConfig = (field, value) => {
    setJmeterConfig((prev) => ({ ...prev, [field]: value }));
  };

  // --- Helper para inyección de variables Jenkins ---
  const getVal = (varName, localValue) => {
    return modoEjecucion === "jenkins"
      ? `\${__P(${varName}, ${localValue})}`
      : localValue;
  };

  const getProjectName = () => {
    try {
      const urlStr = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(urlStr);
      const domain = urlObj.hostname;
      const parts = domain.split(".");
      let name = parts.length > 1 ? parts[parts.length - 2] : domain;
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch (e) {
      return "Proyecto";
    }
  };

  // --- Lógica K6 ---
  const generateK6 = () => {
    // En modo Jenkins, k6 lee los valores inyectados por el pipeline (-e VUS, -e DURATION).
    // El valor de la UI queda como respaldo si no llega la variable de entorno.
    const vusExpr =
      modoEjecucion === "jenkins" ? `Number(__ENV.VUS) || ${k6Vus}` : `${k6Vus}`;
    const durExpr =
      modoEjecucion === "jenkins"
        ? `(__ENV.DURATION || '${duration}') + 's'`
        : `'${duration}s'`;

    return `import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: ${vusExpr},
  duration: ${durExpr},
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('${url}');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}`;
  };

  // --- Lógica JMeter ---
  const generateJMeter = () => {
    let protocol = "https";
    let domain = "localhost";
    let path = "/";
    let projectName = "Proyecto";

    try {
      const urlStr = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(urlStr);
      protocol = urlObj.protocol.replace(":", "");
      domain = urlObj.hostname;
      path = urlObj.pathname;
      const parts = domain.split(".");
      projectName = parts.length > 1 ? parts[parts.length - 2] : domain;
      projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
    } catch (e) {
      console.error("Error parseando URL", e);
    }

    const httpSamplerBlock = `
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${jmeterConfig.samplerName}">
          <stringProp name="HTTPSampler.domain">${domain}</stringProp>
          <stringProp name="HTTPSampler.protocol">${protocol}</stringProp>
          <stringProp name="HTTPSampler.path">${path}</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.postBodyRaw">false</boolProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="Variables definidas por el Usuario">
            <collectionProp name="Arguments.arguments"/>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree/>`;

    const extraConfigBlock = `
      <CookieManager guiclass="CookiePanel" testclass="CookieManager" testname="HTTP Cookie Manager">
        <collectionProp name="CookieManager.cookies"/>
        <boolProp name="CookieManager.clearEachIteration">false</boolProp>
        <boolProp name="CookieManager.controlledByThreadGroup">false</boolProp>
      </CookieManager>
      <hashTree/>
      <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager">
        <collectionProp name="HeaderManager.headers">
          <elementProp name="User-Agent" elementType="Header">
            <stringProp name="Header.name">User-Agent</stringProp>
            <stringProp name="Header.value">Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:48.0) Gecko/20100101 Firefox/48.0</stringProp>
          </elementProp>
          <elementProp name="Accept" elementType="Header">
            <stringProp name="Header.name">Accept</stringProp>
            <stringProp name="Header.value">text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8</stringProp>
          </elementProp>
          <elementProp name="Accept-Language" elementType="Header">
            <stringProp name="Header.name">Accept-Language</stringProp>
            <stringProp name="Header.value">fr,en-US;q=0.7,en;q=0.3</stringProp>
          </elementProp>
          <elementProp name="Accept-Encoding" elementType="Header">
            <stringProp name="Header.name">Accept-Encoding</stringProp>
            <stringProp name="Header.value">gzip, deflate</stringProp>
          </elementProp>
        </collectionProp>
      </HeaderManager>
      <hashTree/>
      <CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="Configuración del CSV Data Set" enabled="false">
        <stringProp name="delimiter">,</stringProp>
        <stringProp name="fileEncoding"/>
        <stringProp name="filename"/>
        <boolProp name="ignoreFirstLine">false</boolProp>
        <boolProp name="quotedData">false</boolProp>
        <boolProp name="recycle">true</boolProp>
        <stringProp name="shareMode">shareMode.all</stringProp>
        <boolProp name="stopThread">false</boolProp>
        <stringProp name="variableNames"/>
      </CSVDataSet>
      <hashTree/>
      <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>false</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="TestPlan.comments">For scripting only</stringProp>
        <stringProp name="filename"/>
      </ResultCollector>
      <hashTree/>
      <ResultCollector guiclass="SummaryReport" testclass="ResultCollector" testname="Reporte resumen">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename"/>
      </ResultCollector>
      <hashTree/>
      <kg.apc.jmeter.vizualizers.CorrectedResultCollector guiclass="kg.apc.jmeter.vizualizers.TransactionsPerSecondGui" testclass="kg.apc.jmeter.vizualizers.CorrectedResultCollector" testname="jp@gc - Transactions per Second">
        <boolProp name="ResultCollector.error_logging">false</boolProp>
        <objProp>
          <name>saveConfig</name>
          <value class="SampleSaveConfiguration">
            <time>true</time>
            <latency>true</latency>
            <timestamp>true</timestamp>
            <success>true</success>
            <label>true</label>
            <code>true</code>
            <message>true</message>
            <threadName>true</threadName>
            <dataType>true</dataType>
            <encoding>false</encoding>
            <assertions>true</assertions>
            <subresults>true</subresults>
            <responseData>false</responseData>
            <samplerData>false</samplerData>
            <xml>false</xml>
            <fieldNames>true</fieldNames>
            <responseHeaders>false</responseHeaders>
            <requestHeaders>false</requestHeaders>
            <responseDataOnError>false</responseDataOnError>
            <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
            <assertionsResultsToSave>0</assertionsResultsToSave>
            <bytes>true</bytes>
            <sentBytes>true</sentBytes>
            <url>true</url>
            <threadCounts>true</threadCounts>
            <idleTime>true</idleTime>
            <connectTime>true</connectTime>
          </value>
        </objProp>
        <stringProp name="filename"/>
        <longProp name="interval_grouping">1000</longProp>
        <boolProp name="graph_aggregated">false</boolProp>
        <stringProp name="include_sample_labels"/>
        <stringProp name="exclude_sample_labels"/>
        <stringProp name="start_offset"/>
        <stringProp name="end_offset"/>
        <boolProp name="include_checkbox_state">false</boolProp>
        <boolProp name="exclude_checkbox_state">false</boolProp>
      </kg.apc.jmeter.vizualizers.CorrectedResultCollector>
      <hashTree/>`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${projectName}">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
    </TestPlan>
    <hashTree>
      
      ${extraConfigBlock}

      <com.blazemeter.jmeter.threads.concurrency.ConcurrencyThreadGroup
        guiclass="com.blazemeter.jmeter.threads.concurrency.ConcurrencyThreadGroupGui"
        testclass="com.blazemeter.jmeter.threads.concurrency.ConcurrencyThreadGroup"
        testname="GH_Carga_${projectName}">
        
        <stringProp name="TargetLevel">${getVal("p_hilos", jmeterConfig.loadThreads)}</stringProp>
        <stringProp name="RampUp">${getVal("p_rampup", Math.round(duration / 2))}</stringProp>
        <stringProp name="Steps">${getVal("p_steps", 5)}</stringProp>
        <stringProp name="Hold">${getVal("p_duration", duration)}</stringProp>
        <stringProp name="LogFilename"></stringProp>
        <stringProp name="Iterations"></stringProp>
        <stringProp name="Unit">S</stringProp>

      </com.blazemeter.jmeter.threads.concurrency.ConcurrencyThreadGroup>

      <hashTree>
        ${httpSamplerBlock}
      </hashTree>

    </hashTree>
  </hashTree>
</jmeterTestPlan>`;
  };

  // Código que se muestra / copia / descarga según el método activo.
  const getCurrentCode = () => {
    if (metodoGen === "ia") return iaScript;
    return tool === "k6" ? generateK6() : generateJMeter();
  };

  // Pide a la IA que genere un script de k6 a partir de las historias de usuario.
  const generarConIA = async () => {
    if (!historias || historias.trim().length < 10) {
      setIaError(
        "Escribe al menos una historia de usuario para que la IA pueda trabajar.",
      );
      return;
    }
    setLoadingIA(true);
    setIaError(null);
    try {
      const res = await axios.post("ai/generar-script", {
        historias,
        baseUrl: url,
        tool: "k6",
        vus: k6Vus,
        duration,
      });
      if (res.data.script) {
        setIaScript(res.data.script);
      } else {
        setIaError(res.data.error || "La IA no devolvió un script.");
      }
    } catch (err) {
      console.error("Error generando script con IA:", err);
      setIaError(
        "No se pudo conectar con la IA. Verifica que el backend esté arriba.",
      );
    } finally {
      setLoadingIA(false);
    }
  };

  const handleCopy = () => {
    const code = getCurrentCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getCurrentCode();
    if (!code) return;

    // Obtenemos el nombre limpio
    const projectName = getProjectName();

    // En modo IA siempre es k6 (.js); en manual depende de la herramienta.
    const esK6 = metodoGen === "ia" || tool === "k6";
    const fileName = esK6
      ? `script_${projectName}.js`
      : `test_plan_${projectName}.jmx`;

    const mimeType = esK6 ? "text/javascript" : "application/xml";

    const blob = new Blob([code], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-20">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
            <FileCode size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Script Generator
            </h1>
            <p className="text-slate-500 text-sm italic">
              Crea y descarga tus archivos de inyección
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Método de generación: Manual (plantilla) vs IA (historias de usuario) */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMetodoGen("manual")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${metodoGen === "manual" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
            >
              MANUAL
            </button>
            <button
              onClick={() => setMetodoGen("ia")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${metodoGen === "ia" ? "bg-white text-purple-600 shadow-sm" : "text-slate-400"}`}
            >
              <Sparkles size={12} /> CON IA
            </button>
          </div>

          {metodoGen === "manual" ? (
            <>
              <div className="flex bg-slate-100 p-1 rounded-xl scale-90 origin-right">
                <button
                  onClick={() => setTool("k6")}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${tool === "k6" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400"}`}
                >
                  K6 (JS)
                </button>
                <button
                  onClick={() => setTool("jmeter")}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${tool === "jmeter" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
                >
                  JMETER (JMX)
                </button>
              </div>

              {/* Toggle: Local vs Jenkins (aplica a k6 y JMeter) */}
              <div className="flex bg-slate-100 p-1 rounded-xl scale-90 origin-right">
                <button
                  onClick={() => setModoEjecucion("local")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${modoEjecucion === "local" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}
                >
                  MODO LOCAL
                </button>
                <button
                  onClick={() => setModoEjecucion("jenkins")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${modoEjecucion === "jenkins" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
                >
                  PARA JENKINS
                </button>
              </div>
            </>
          ) : (
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-purple-100">
              <Sparkles size={12} /> Genera k6 listo para Jenkins
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {metodoGen === "manual" ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
              <Settings size={16} className="text-emerald-500" /> Parámetros
              Generales
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Endpoint URL
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-3 top-3 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Duración (seg)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="w-full border-t border-slate-100 my-2"></div>

              {tool === "k6" ? (
                <div className="space-y-1 animate-in slide-in-from-left-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Usuarios Virtuales (VUs)
                  </label>
                  <input
                    type="number"
                    value={k6Vus}
                    onChange={(e) => setK6Vus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                      <Edit3 size={10} /> Nombre Sampler
                    </label>
                    <input
                      type="text"
                      value={jmeterConfig.samplerName}
                      onChange={(e) =>
                        updateJmeterConfig("samplerName", e.target.value)
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Ej: Home Page"
                    />
                  </div>

                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2">
                    Configuración Hilos {modoEjecucion === 'jenkins' && '(Valores por defecto)'}
                  </h4>
                  
                  {/* Mensaje visual si está en modo Jenkins */}
                  {modoEjecucion === 'jenkins' && (
                    <div className="text-[10px] bg-blue-50 text-blue-600 p-2 rounded-lg mb-2">
                       En modo Jenkins, estos valores se inyectarán como variables <b>${`{__P()}`}</b>.
                    </div>
                  )}

                  <div className={`grid grid-cols-2 gap-3 ${modoEjecucion === 'jenkins' ? 'opacity-70' : ''}`}>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Básico
                      </label>
                      <input
                        type="number"
                        value={jmeterConfig.basicThreads}
                        onChange={(e) =>
                          updateJmeterConfig("basicThreads", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Línea Base
                      </label>
                      <input
                        type="number"
                        value={jmeterConfig.baselineThreads}
                        onChange={(e) =>
                          updateJmeterConfig("baselineThreads", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Carga
                      </label>
                      <input
                        type="number"
                        value={jmeterConfig.loadThreads}
                        onChange={(e) =>
                          updateJmeterConfig("loadThreads", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Estrés
                      </label>
                      <input
                        type="number"
                        value={jmeterConfig.stressThreads}
                        onChange={(e) =>
                          updateJmeterConfig("stressThreads", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-1 text-sm uppercase tracking-wider">
              <Sparkles size={16} className="text-purple-500" /> Historias de
              Usuario
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Describe los flujos en lenguaje natural. La IA generará un script
              de k6 listo para ejecutar en Jenkins.
            </p>

            <textarea
              value={historias}
              onChange={(e) => setHistorias(e.target.value)}
              rows={8}
              placeholder={
                "Ej:\n- Como usuario quiero iniciar sesión con email y contraseña.\n- Como usuario quiero consultar el listado de productos.\n- Como usuario quiero agregar un producto al carrito."
              }
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono resize-none leading-relaxed"
            />

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                URL Base
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-3 text-slate-300"
                  size={16}
                />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  VUs
                </label>
                <input
                  type="number"
                  value={k6Vus}
                  onChange={(e) => setK6Vus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  Duración (seg)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            {iaError && (
              <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg">
                {iaError}
              </div>
            )}

            <button
              onClick={generarConIA}
              disabled={loadingIA}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-500 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingIA ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generar con IA
                </>
              )}
            </button>
          </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    metodoGen === "ia"
                      ? "bg-purple-500"
                      : tool === "k6"
                        ? "bg-orange-500"
                        : "bg-indigo-500"
                  }`}
                ></span>
                {metodoGen === "ia"
                  ? "script_ia.js"
                  : tool === "k6"
                    ? "script.js"
                    : "test_plan.jmx"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${copied ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Download size={14} /> Descargar
                </button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto h-[500px]">
              {loadingIA ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Loader2 size={32} className="animate-spin text-purple-400" />
                  <p className="text-xs font-mono uppercase tracking-widest">
                    La IA está escribiendo tu script...
                  </p>
                </div>
              ) : metodoGen === "ia" && !iaScript ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 text-center px-8">
                  <Sparkles size={32} className="text-slate-700" />
                  <p className="text-xs font-mono uppercase tracking-widest leading-relaxed">
                    Escribe tus historias de usuario
                    <br />y pulsa "Generar con IA"
                  </p>
                </div>
              ) : (
                <pre className="font-mono text-xs leading-relaxed text-emerald-400">
                  <code>{getCurrentCode()}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generadores;