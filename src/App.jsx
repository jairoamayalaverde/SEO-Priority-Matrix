import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Download, RefreshCw } from 'lucide-react';

export default function SEOPriorityCalculator() {
  // Estado inicial con carga desde LocalStorage
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('seoMatrixTasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Optimizar meta titles home', impact: 8, effort: 2 },
      { id: 2, name: 'Crear estrategia de backlinks', impact: 9, effort: 9 },
      { id: 3, name: 'Corregir enlaces rotos', impact: 6, effort: 3 },
    ];
  });
  
  const [newTask, setNewTask] = useState({ name: '', impact: 5, effort: 5 });

  // Auto-Guardado
  useEffect(() => {
    localStorage.setItem('seoMatrixTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Auto-Resize para integración con Elementor
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'seo-audit-resize', height }, '*');
    };
    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [tasks]);

  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ name: '', impact: 5, effort: 5 });
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const resetMatrix = () => {
    if(confirm('¿Borrar todas las tareas y empezar de cero?')) {
        setTasks([]);
    }
  };

  const calculatePriority = (impact, effort) => {
    return ((impact / effort) * 10).toFixed(1);
  };

  const getPriorityLevel = (score) => {
    if (score >= 20) return { label: 'CRÍTICO', color: 'bg-red-500', textColor: 'text-red-600' };
    if (score >= 10) return { label: 'ALTA', color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (score >= 5) return { label: 'MEDIA', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { label: 'BAJA', color: 'bg-blue-500', textColor: 'text-blue-600' };
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const scoreA = (a.impact / a.effort);
    const scoreB = (b.impact / b.effort);
    return scoreB - scoreA;
  });

  const getQuadrant = (impact, effort) => {
    if (impact >= 7 && effort <= 5) return 'quick-wins';
    if (impact >= 7 && effort > 5) return 'major-projects';
    if (impact < 7 && effort <= 5) return 'fill-ins';
    return 'time-wasters';
  };

  const quadrantData = {
    'quick-wins': { label: 'Quick Wins (Hacer YA)', color: 'bg-green-100 border-green-400', icon: '🚀' },
    'major-projects': { label: 'Proyectos Estratégicos', color: 'bg-blue-100 border-blue-400', icon: '📅' },
    'fill-ins': { label: 'Tareas de Relleno', color: 'bg-yellow-100 border-yellow-400', icon: '☕' },
    'time-wasters': { label: 'Descartar / Posponer', color: 'bg-red-100 border-red-400', icon: '🗑️' }
  };

  const exportToCSV = () => {
    const headers = 'Tarea,Impacto (1-10),Esfuerzo (1-10),Score,Cuadrante\n';
    const rows = sortedTasks.map(task => {
      const score = calculatePriority(task.impact, task.effort);
      const quad = quadrantData[getQuadrant(task.impact, task.effort)].label;
      return `"${task.name}",${task.impact},${task.effort},${score},${quad}`;
    }).join('\n');
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriz-seo-jairo-amaya-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-black text-center uppercase tracking-tighter leading-none" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>
            <span className="text-white">Matriz de</span> <br />
            <span style={{
              background: 'linear-gradient(90deg, #db2777 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 15px rgba(219,39,119,0.4))'
            }}>
              Prioridad SEO
            </span>
          </h1>
          <p className="text-slate-300 text-lg">
            Prioriza tus acciones SEO basándote en impacto vs esfuerzo
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel Izquierdo: Formulario */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold font-heading text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="text-purple-600" /> Nueva Tarea
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ¿Qué acción SEO vas a evaluar?
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  placeholder="Ej: Comprimir imágenes del home"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                    Impacto en Negocio
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                        type="range" min="1" max="10"
                        value={newTask.impact}
                        onChange={(e) => setNewTask({...newTask, impact: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-xl font-bold text-purple-600 w-8">{newTask.impact}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                    Esfuerzo Técnico
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                        type="range" min="1" max="10"
                        value={newTask.effort}
                        onChange={(e) => setNewTask({...newTask, effort: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <span className="text-xl font-bold text-orange-500 w-8">{newTask.effort}</span>
                    </div>
                </div>
              </div>

              <button
                onClick={addTask}
                className="w-full bg-slate-900 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Agregar a la Matriz
              </button>
            </div>

            <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold font-heading text-slate-700 mb-3 text-sm uppercase tracking-wide">Leyenda de Cuadrantes</h3>
              <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                {Object.entries(quadrantData).map(([key, data]) => (
                  <div key={key} className={`p-2 rounded border flex items-center gap-2 ${data.color.replace('bg-', 'bg-opacity-50 ')}`}>
                    <span className="text-lg">{data.icon}</span>
                    <span className="font-medium text-slate-700">{data.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Derecho: Lista Priorizada */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-800">📋 Lista Priorizada</h2>
              
              <div className="flex gap-2">
                {tasks.length > 0 && (
                    <button
                    onClick={resetMatrix}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Borrar todo"
                    >
                    <Trash2 size={20} />
                    </button>
                )}
                {tasks.length > 0 && (
                    <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-bold shadow-md"
                    >
                    <Download size={18} />
                    CSV
                    </button>
                )}
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" style={{maxHeight: '600px'}}>
              {sortedTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-8">
                  <RefreshCw size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Tu matriz está vacía</p>
                </div>
              ) : (
                sortedTasks.map((task, index) => {
                  const score = calculatePriority(task.impact, task.effort);
                  const priority = getPriorityLevel(score);
                  const quadrant = getQuadrant(task.impact, task.effort);
                  const quadrantInfo = quadrantData[quadrant];

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border-l-4 bg-white shadow-sm hover:shadow-md transition-all relative group ${quadrantInfo.color.split(' ')[1].replace('border-', 'border-l-')}`}
                    >
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl pt-1">{quadrantInfo.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                <h3 className="font-bold text-slate-800 leading-tight">{task.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${priority.color.replace('bg-', 'bg-opacity-20 ')} ${priority.textColor}`}>
                                  Score: {score}
                                </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
                                {quadrantInfo.label}
                            </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pl-10">
                        <div className="flex flex-col">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                              <span>Impacto</span>
                              <span>{task.impact}/10</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-purple-500" style={{width: `${task.impact * 10}%`}}></div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                              <span>Esfuerzo</span>
                              <span>{task.effort}/10</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-orange-500" style={{width: `${task.effort * 10}%`}}></div>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer simple */}
        <div className="mt-8 text-center text-slate-400 text-sm pb-4">
          <p>Herramienta creada por <span className="text-white font-semibold">Jairo Amaya</span> | Full Stack Marketer</p>
        </div>
      </div>
    </div>
  );
}
