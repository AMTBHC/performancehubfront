import React, { useState } from 'react';
import { 
  Search, 
  BarChart, 
  Terminal, 
  Globe, 
  ChevronRight, 
  Info, 
  Book, 
  Cpu, 
  Shield, 
  Zap, 
  X, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle // <--- Esta es la pieza que faltaba
} from 'lucide-react';

const Wiki = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);

  const toolsData = [
    {
      id: 'jmeter',
      title: 'Apache JMeter™',
      icon: <BarChart className="text-indigo-500" />,
      tags: ['Open Source', 'Java', 'Standard'],
      description: 'Aplicación de código abierto, 100% Java puro, diseñada para cargar y probar el comportamiento funcional y medir el rendimiento.',
      fullDoc: {
        overview: "Originalmente diseñado para probar aplicaciones web, pero se ha expandido a otras funciones de prueba. Se utiliza para simular una carga pesada en un servidor, grupo de servidores, red u objeto para probar su resistencia o analizar el rendimiento general bajo diferentes tipos de carga.",
        capabilities: [
          "Web - HTTP, HTTPS (Java, NodeJS, PHP, ASP.NET, ...)",
          "Servicios Web SOAP / REST",
          "Bases de datos vía JDBC",
          "LDAP y Middleware orientado a mensajes (MOM) vía JMS",
          "Correo - SMTP(S), POP3(S) e IMAP(S)",
          "Comandos nativos o scripts de shell",
          "TCP y Objetos Java"
        ],
        features: [
          "IDE de prueba completo para grabación, construcción y depuración.",
          "Modo CLI (Command-line) para pruebas desde cualquier OS compatible con Java.",
          "Reporte HTML dinámico listo para presentar.",
          "Extracción fácil de datos (HTML, JSON, XML o cualquier formato de texto).",
          "Portabilidad completa y pureza 100% Java.",
          "Marco multi-threading completo que permite el muestreo concurrente."
        ],
        importantNote: "JMeter no es un navegador. Funciona a nivel de protocolo. No ejecuta el Javascript que se encuentra en las páginas HTML ni renderiza las páginas como lo hace un navegador."
      }
    },
    {
      id: 'k6',
      title: 'k6 (Grafana Labs)',
      icon: <Terminal className="text-orange-500" />,
      tags: ['Cloud Native', 'Go/JS', 'CI/CD'],
      description: 'Herramienta moderna de pruebas de carga y monitoreo para equipos de ingeniería, centrada en el desarrollador.',
      fullDoc: {
        overview: "k6 es una herramienta de prueba de carga de código abierto, gratuita y extensible. Facilita la creación de pruebas de rendimiento automatizadas y resilientes para equipos de ingeniería. k6 está escrito en Go y los scripts de prueba se escriben en JavaScript.",
        capabilities: [
          "Protocolos: HTTP/1.1, HTTP/2, WebSockets, gRPC",
          "Manejo de cookies y sesiones",
          "Soporte para TLS/SSL",
          "Integración nativa con Grafana, InfluxDB, Prometheus",
          "Extensiones vía xk6 (Kafka, SQL, Redis, Browser)"
        ],
        features: [
          "CLI tool con APIs amigables para el desarrollador.",
          "Scripting en JavaScript ES6 (con soporte para módulos).",
          "Checks y Thresholds (Umbrales) para automatización de SLOs en CI/CD.",
          "Bajo consumo de recursos (1 VU != 1 Thread), usa el modelo de Event Loop.",
          "k6 Browser para pruebas híbridas (Protocolo + Browser rendering)."
        ],
        importantNote: "k6 no renderiza páginas web de forma predeterminada para ahorrar recursos, aunque su extensión 'k6-browser' permite automatizar acciones a nivel de navegador si es necesario."
      }
    }
  ];

  const filteredTools = toolsData.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Base de Conocimiento</h1>
          <p className="text-slate-500 font-medium">Documentación técnica oficial y guías de herramientas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar herramienta..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE HERRAMIENTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div 
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                {tool.icon}
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{tool.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
              {tool.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE DOCUMENTACIÓN DETALLADA */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header del Modal */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {selectedTool.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedTool.title}</h2>
                  <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Documentación Técnica</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTool(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Contenido del Modal (Scrollable) */}
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Overview */}
              <section>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={16} className="text-indigo-500" /> Descripción General
                </h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedTool.fullDoc.overview}
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Protocolos/Capacidades */}
                <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe size={16} className="text-emerald-500" /> Protocolos Soportados
                  </h4>
                  <ul className="space-y-2">
                    {selectedTool.fullDoc.capabilities.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 font-medium leading-tight">
                        <div className="mt-1"><CheckCircle size={14} className="text-emerald-400" /></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Características */}
                <section className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-50">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-indigo-500" /> Características Clave
                  </h4>
                  <ul className="space-y-2">
                    {selectedTool.fullDoc.features.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600 font-medium leading-tight text-pretty">
                        <div className="mt-1"><Shield size={14} className="text-indigo-400" /></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Nota de Arquitectura */}
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 border-l-4 border-l-amber-400">
                <h4 className="text-amber-800 font-black text-xs uppercase mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} /> Nota Importante de Arquitectura
                </h4>
                <p className="text-amber-900 text-sm font-medium leading-relaxed italic">
                  {selectedTool.fullDoc.importantNote}
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
              <a 
                href={selectedTool.id === 'jmeter' ? 'https://jmeter.apache.org/usermanual/index.html' : 'https://grafana.com/docs/k6/latest/using-k6/'} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
              >
                Visitar sitio oficial de {selectedTool.title} <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wiki;