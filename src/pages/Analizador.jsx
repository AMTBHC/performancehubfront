import React, { useState } from 'react';
import { BarChart3, Upload, Activity, AlertCircle, CheckCircle2, TrendingDown, Gauge, Zap } from 'lucide-react';

const Analizador = () => {
  const [p95, setP95] = useState(250);
  const [tps, setTps] = useState(100);
  const [errorRate, setErrorRate] = useState(0.5);

  // Lógica de Diagnóstico Automático
  const getHealthStatus = () => {
    if (p95 > 1000 || errorRate > 5) return { label: 'CRÍTICO', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle /> };
    if (p95 > 500 || errorRate > 1) return { label: 'EN RIESGO', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Activity /> };
    return { label: 'SALUDABLE', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 /> };
  };

  const status = getHealthStatus();

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analizador de Métricas</h1>
            <p className="text-slate-500 text-sm italic">Convierte números en decisiones de arquitectura</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
          <Upload size={16} /> Subir CSV/JSON
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Entrada de Datos */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
              <Gauge size={16} className="text-indigo-500" /> Input de Métricas
            </h3>
            <div className="space-y-4">
              <InputMetric label="Latencia P95 (ms)" value={p95} onChange={setP95} step={10} min={1} />
              <InputMetric label="Throughput (TPS)" value={tps} onChange={setTps} step={50} min={1} />
              <InputMetric label="Tasa de Error (%)" value={errorRate} onChange={setErrorRate} step={0.1} min={0} />
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Zap size={120} />
            </div>
            <p className="text-indigo-300 text-[10px] font-bold uppercase mb-2">Resumen Operativo</p>
            <p className="text-xs leading-relaxed opacity-90">
              El <strong>Percentil 95 (P95)</strong> es la métrica reina. Te dice que el 95% de tus usuarios experimentan un tiempo de respuesta igual o menor a {p95}ms. No te fíes del promedio, el promedio oculta a los usuarios que sufren.
            </p>
          </div>
        </div>

        {/* Panel de Diagnóstico */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-8 rounded-3xl border ${status.border} ${status.bg} transition-all duration-500`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado del Componente</p>
                <h2 className={`text-5xl font-black ${status.color} flex items-center gap-3`}>
                  {status.label} {status.icon}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-bold uppercase">Efficiency Score</p>
                <p className="text-3xl font-black text-slate-700">{100 - (errorRate * 5 + p95 / 50).toFixed(0)}%</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                <h4 className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-2">
                   <TrendingDown size={14} className="text-red-400" /> Observaciones Técnicas
                </h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc ml-4">
                  {p95 > 500 && <li>La latencia está por encima del umbral de UX (500ms).</li>}
                  {errorRate > 1 && <li>La tasa de error impacta la fiabilidad del negocio.</li>}
                  {tps < 50 && <li>El rendimiento es bajo para un entorno productivo.</li>}
                  {p95 <= 500 && errorRate <= 1 && <li>El sistema se comporta de manera óptima bajo carga.</li>}
                </ul>
              </div>
              
              <div className="bg-white/50 p-4 rounded-2xl border border-white/60">
                <h4 className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-2">
                   <Zap size={14} className="text-indigo-400" /> Recomendación
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {status.label === 'SALUDABLE' 
                    ? "Mantén el monitoreo preventivo. No se requieren cambios inmediatos."
                    : "Se recomienda revisar el 'Garbage Collector' de la JVM o optimizar los índices de la base de datos para bajar la latencia."}
                </p>
              </div>
            </div>
          </div>
          
          {/* Visualización de la Campana de Gauss (Conceptual) */}
          <div className="bg-slate-900 p-8 rounded-3xl text-white">
             <div className="flex justify-between items-end mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2"><BarChart3 size={16} /> Distribución de Latencia</h3>
                <span className="text-[10px] text-slate-500 uppercase">Percentil vs Tiempo</span>
             </div>
             
             
             
             <div className="grid grid-cols-4 gap-4 mt-6">
                <PercentileItem label="P50" value={`${(p95 * 0.6).toFixed(0)}ms`} color="bg-slate-700" />
                <PercentileItem label="P90" value={`${(p95 * 0.9).toFixed(0)}ms`} color="bg-indigo-700" />
                <PercentileItem label="P95" value={`${p95}ms`} color="bg-indigo-500" />
                <PercentileItem label="P99" value={`${(p95 * 1.5).toFixed(0)}ms`} color="bg-red-500" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentes Auxiliares
const InputMetric = ({ label, value, onChange, step, min }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
      <span className="text-xs font-mono font-bold text-indigo-600">{value}</span>
    </div>
    <input 
      type="range" min={min} max={label.includes('Error') ? 10 : 2000} step={step}
      value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

const PercentileItem = ({ label, value, color }) => (
  <div className="text-center">
    <div className={`h-1 w-full rounded-full mb-2 ${color}`} />
    <p className="text-[10px] text-slate-500 font-bold">{label}</p>
    <p className="text-sm font-black">{value}</p>
  </div>
);

export default Analizador;