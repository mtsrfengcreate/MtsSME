
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { AlertCircle, TrendingDown, Users, BookOpen, GraduationCap, Clock, Save, Upload, ShieldCheck, Database, Globe, Check } from 'lucide-react';

const Dashboard: React.FC<{ state: AppState, onStateUpdate: (newState: AppState) => void }> = ({ state, onStateUpdate }) => {
  const { students, teachers, grades, attendances, portalUrl } = state;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tempUrl, setTempUrl] = useState(portalUrl || '');
  const [urlSaved, setUrlSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Total de Alunos', value: students.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Docentes Ativos', value: teachers.length, icon: GraduationCap, color: 'text-[#ef4c1c]', bg: 'bg-[#ef4c1c]/10' },
    { label: 'Aulas Registradas', value: new Set(attendances.map(a => a.lessonPlanId)).size, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const atRiskStudents = students.map(student => {
    const sGrades = grades.filter(g => g.studentId === student.id);
    const avg = sGrades.length > 0 ? sGrades.reduce((a, b) => a + b.value, 0) / sGrades.length : 0;
    const sAtt = attendances.filter(a => a.studentId === student.id);
    const rate = sAtt.length > 0 ? (sAtt.filter(a => a.status === 'P').length / sAtt.length) * 100 : 100;
    return { name: student.name, avg, rate, risk: avg < 5 || rate < 75 };
  }).filter(s => s.risk);

  const handleSaveUrl = () => {
    onStateUpdate({ ...state, portalUrl: tempUrl });
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  const downloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_sme_coord_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (confirm('Atenção: Restaurar backup irá sobrescrever todos os dados atuais. Prosseguir?')) {
            onStateUpdate(json);
            alert('Backup restaurado com sucesso!');
          }
        } catch (err) {
          alert('Erro ao processar arquivo de backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/5 bg-slate-900/40">
           <div className="flex items-center gap-6">
              <div className="bg-[#ef4c1c] p-4 rounded-2xl shadow-xl shadow-[#ef4c1c]/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white leading-none tracking-tight">{currentTime.toLocaleTimeString('pt-BR')}</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                  {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
           </div>
           <div className="flex gap-3">
              <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleUploadBackup} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-all">
                <Upload className="w-4 h-4" /> Importar
              </button>
              <button onClick={downloadBackup} className="flex items-center gap-2 px-5 py-3 bg-[#ef4c1c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/20">
                <Save className="w-4 h-4" /> Backup
              </button>
           </div>
        </div>
        
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 flex flex-col gap-4">
           <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#ef4c1c]" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuração de Domínio</p>
           </div>
           <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ex: portal-sme.netlify.app"
                className="flex-1 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-[11px] text-white outline-none focus:border-[#ef4c1c]/50 transition-all"
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
              />
              <button 
                onClick={handleSaveUrl}
                className={`p-2 rounded-xl transition-all ${urlSaved ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                {urlSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </button>
           </div>
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">* Defina o link onde você hospedou o portal para que ele apareça no rodapé.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl flex flex-col gap-4 transition-all hover:bg-white/5 border border-white/5">
            <div className={`${s.bg} ${s.color} w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5`}>
               <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-4xl font-black text-white leading-none tracking-tighter">{s.value.toString().padStart(2, '0')}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col bg-slate-900/20">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
               <AlertCircle className="text-[#ef4c1c] w-6 h-6" />
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Monitor de Desempenho</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-[300px]">
            {atRiskStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                 <Database className="w-12 h-12 mb-4" />
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Nenhum alerta pendente</p>
              </div>
            ) : (
              atRiskStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 group">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500">{(i+1).toString()}</div>
                     <span className="text-sm font-bold text-slate-100">{s.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-xl border bg-red-500/10 text-red-500 border-red-500/20">MÉDIA {s.avg.toFixed(1)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col bg-slate-950/40 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Resumo de Presença</h3>
          </div>
          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Presente', value: attendances.filter(a => a.status === 'P').length || 1 },
                    { name: 'Falta', value: attendances.filter(a => a.status === 'F').length || 0 }
                  ]}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4c1c" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="font-bold text-slate-400">Presenças</span>
                <span className="font-black text-emerald-400">{attendances.filter(a => a.status === 'P').length}</span>
             </div>
             <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-[#ef4c1c]/5 border border-[#ef4c1c]/10">
                <span className="font-bold text-slate-400">Faltas</span>
                <span className="font-black text-[#ef4c1c]">{attendances.filter(a => a.status === 'F').length}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
