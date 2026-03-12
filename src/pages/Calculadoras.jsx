import React, { useState } from 'react';
import { Calculator, Zap, Users, Target, Server, Cpu, TrendingUp, ArrowRight, Activity, AlertTriangle, Lightbulb } from 'lucide-react';

const Calculadoras = () => {
  const [activeTab, setActiveTab] = useState('planificacion');

  // --- ESTADOS COMPARTIDOS ---
  const [baseUsers, setBaseUsers] = useState(10);
  const [baseTps, setBaseTps] = useState(10);
  const [baseCpu, setBaseCpu] = useState(20);
  const [nodes, setNodes] = useState(1);
  const [targetTps, setTargetTps] = useState(50);

  // --- ESTADO ESPECÍFICO AMDAHL ---
  const [serialFraction, setSerialFraction] = useState(0.05);

  // --- LÓGICA DE CÁLCULO ---
  const tpsPerUser = baseUsers > 0 ? baseTps / baseUsers : 0;
  const requiredUsers = tpsPerUser > 0 ? Math.ceil(targetTps / tpsPerUser) : 0;
  const scaleFactor = baseTps > 0 ? targetTps / baseTps : 0;
  
  // Infraestructura
  const projectedCpuLoadTotal = (baseCpu * scaleFactor) / nodes;
  const requiredNodes = Math.ceil(projectedCpuLoadTotal / 70) || 1;
  const cpuPerNode = (projectedCpuLoadTotal / requiredNodes).toFixed(1);

  // Amdahl (Cura de Humildad)
  const calculateAmdahl = (n) => 1 / (serialFraction + (1 - serialFraction) / n);
  const amdahlFactor = calculateAmdahl(scaleFactor || 1);
  const realisticTps = (baseTps * amdahlFactor).toFixed(2);
  const lossPercentage = (((targetTps - realisticTps) / targetTps) * 100).toFixed(1);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Calculator size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Módulo de Calculadoras</h1>
            <p className="text-slate-500 text-sm">Ingeniería de Performance y Capacidad</p>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('planificacion')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'planificacion' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            PLANIFICACIÓN
          </button>
          <button 
            onClick={() => setActiveTab('degradacion')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'degradacion' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            DEGRADACIÓN (AMDAHL)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: INPUTS (Siempre visibles) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Referencia Baseline
            </div>
            <div className="space-y-4 mt-2">
              <InputField label="VUs en prueba" value={baseUsers} onChange={setBaseUsers} icon={<Users size={14}/>} />
              <InputField label="TPS obtenidos" value={baseTps} onChange={setBaseTps} icon={<Zap size={14}/>} />
              <InputField label="% CPU Actual" value={baseCpu} onChange={setBaseCpu} icon={<Cpu size={14}/>} />
              <InputField label="Nodos actuales" value={nodes} onChange={setNodes} icon={<Server size={14}/>} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
              <Target size={18} className="text-orange-500" /> Objetivo
            </h3>
            <InputField label="TPS Objetivo" value={targetTps} onChange={setTargetTps} color="orange" />
          </div>

          {activeTab === 'degradacion' && (
            <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4 animate-in slide-in-from-left-4 duration-300">
              <h3 className="font-bold text-indigo-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Activity size={18} /> Factor de Fricción
              </h3>
              <input 
                type="range" min="0.01" max="0.20" step="0.01" 
                value={serialFraction} onChange={(e) => setSerialFraction(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Optimizado (1%)</span>
                <span className="text-indigo-400 font-bold">{(serialFraction * 100).toFixed(0)}%</span>
                <span>Lento (20%)</span>
              </div>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: RESULTADOS DINÁMICOS */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'planificacion' ? (
            /* CONTENIDO: PLANIFICACIÓN */
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <TrendingUp size={200} />
                </div>
                <div className="text-center z-10 border-b md:border-b-0 md:border-r border-slate-800 pb-8 md:pb-0 md:pr-8">
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2">Concurrencia Requerida</p>
                  <h2 className="text-7xl font-black mb-1">{requiredUsers}</h2>
                  <p className="text-slate-500 text-sm font-medium">Usuarios Virtuales (VUs)</p>
                </div>
                <div className="text-center z-10">
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2">Nodos/Pods Requeridos</p>
                  <h2 className="text-7xl font-black mb-1">{requiredNodes}</h2>
                  <p className="text-slate-500 text-sm font-medium italic">Uso proyectado: {cpuPerNode}% CPU/Nodo</p>
                </div>
              </div>

              {/* Tus Notas de Planificación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                  <p className="text-indigo-900 font-bold text-sm mb-1 flex items-center gap-2"><Users size={16}/> Recomendación de Inyección</p>
                  <p className="text-indigo-700 text-xs leading-relaxed">Para manejar <strong>{requiredUsers} VUs</strong> de forma estable, te recomendamos usar al menos 2 inyectores (Load Generators) si usas herramientas como JMeter o K6 para evitar cuellos de botella en el inyector.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <p className="text-slate-700 font-bold text-sm mb-1 flex items-center gap-2"><TrendingUp size={16}/> Análisis de Curva</p>
                  <p className="text-slate-600 text-xs leading-relaxed">Recuerda que a mayor cantidad de VUs, el tiempo de respuesta tiende a degradarse. Si sube un 20%, necesitarás un 20% más de VUs para mantener los mismos TPS.</p>
                </div>
              </div>

              {/* Salud Infra */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Carga por Nodo Proyectada</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${Number(cpuPerNode) > 80 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{cpuPerNode}% CPU</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-700 ease-out ${Number(cpuPerNode) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(Number(cpuPerNode), 100)}%` }}></div>
                </div>
                <p className="mt-3 text-[11px] text-slate-400 italic text-center leading-tight">
                  * El cálculo busca mantener cada nodo debajo del 70% de utilización para absorber picos de latencia.
                </p>
              </div>
            </div>
          ) : (
            /* CONTENIDO: DEGRADACIÓN (AMDAHL) */
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                <div className="absolute top-0 right-0 p-10 opacity-5 text-indigo-500">
                  <Activity size={200} />
                </div>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4">Límite Real de Escalabilidad</p>
                <h2 className="text-9xl font-black mb-2 text-white">{realisticTps}</h2>
                <p className="text-slate-400 text-lg font-medium">TPS Máximos Alcanzables</p>
              </div>

              <div className={`p-6 rounded-2xl border flex gap-4 transition-colors ${Number(lossPercentage) > 20 ? 'bg-red-50 border-red-100 text-red-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                <AlertTriangle size={24} className={Number(lossPercentage) > 20 ? 'text-red-500' : 'text-blue-500'} />
                <div>
                  <p className="font-bold text-sm">Cura de Humildad (Análisis de Fricción)</p>
                  <p className="text-xs mt-1 leading-relaxed">
                    Debido a la fracción serial del <strong>{(serialFraction * 100).toFixed(0)}%</strong>, tu sistema tiene una pérdida de eficiencia del <strong>{lossPercentage}%</strong>. 
                    {Number(lossPercentage) > 30 ? " Es físicamente imposible alcanzar el objetivo sin refactorizar el código serial." : " El sistema tiene margen de crecimiento aceptable."}
                  </p>
                </div>
              </div>

              {/* BLOQUE DE SOLUCIONES (ESTRATEGIAS) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-slate-800 font-bold text-sm mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" /> Estrategias de Mitigación:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg h-fit text-slate-600 font-bold text-[10px]">01</div>
                      <p className="text-[11px] text-slate-600"><span className="font-bold text-slate-800 block">Asincronismo:</span> Mueve procesos pesados a colas (Kafka/RabbitMQ) para liberar el hilo principal.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg h-fit text-slate-600 font-bold text-[10px]">02</div>
                      <p className="text-[11px] text-slate-600"><span className="font-bold text-slate-800 block">Optimización de DB:</span> Revisa bloqueos (locks) y usa réplicas de lectura para reducir la contención serial.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg h-fit text-slate-600 font-bold text-[10px]">03</div>
                      <p className="text-[11px] text-slate-600"><span className="font-bold text-slate-800 block">Caching:</span> Implementa Redis para evitar que procesos repetitivos pasen por la capa lógica serial.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg h-fit text-slate-600 font-bold text-[10px]">04</div>
                      <p className="text-[11px] text-slate-600"><span className="font-bold text-slate-800 block">Sharding:</span> Divide la carga de trabajo en unidades independientes que no compartan recursos globales.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-slate-600">
                <p className="text-xs font-bold flex items-center gap-2 mb-2 uppercase tracking-wider"><Activity size={14}/> Fundamento Técnico</p>
                <p className="text-[11px] leading-relaxed opacity-90 italic">
                  La <strong>Ley de Amdahl</strong> predice el límite teórico de velocidad de un sistema. Si una pequeña parte de tu código no puede correr en paralelo (serial), añadir más hardware eventualmente dejará de dar beneficios. Es el "techo de cristal" de la arquitectura de software.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Auxiliar de Input
const InputField = ({ label, value, onChange, color = "indigo", icon }) => (
  <div>
    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-tight">
      {icon && <span className={`text-${color}-500`}>{icon}</span>}
      {label}
    </label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-${color}-500 font-mono text-slate-700 transition-all`}
    />
  </div>
);

export default Calculadoras;