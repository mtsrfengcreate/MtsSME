
import React, { useState, useMemo } from 'react';
import { Student, LessonPlan, Teacher, Attendance } from '../types';
import { Check, X, Search, Filter, Download, CalendarDays, PieChart } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/export';

interface AttendanceTabProps {
  students: Student[];
  plans: LessonPlan[];
  teachers: Teacher[];
  attendances: Attendance[];
  onUpdate: (attendances: Attendance[]) => void;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ students, plans, teachers, attendances, onUpdate }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportView, setReportView] = useState<'daily' | 'general'>('daily');

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);
  const teacher = useMemo(() => teachers.find(t => t?.id === selectedPlan?.teacherId), [teachers, selectedPlan]);

  const studentAttendanceStats = useMemo(() => {
    return students.map(student => {
      const studentAtts = attendances.filter(a => a.studentId === student.id);
      const total = studentAtts.length;
      const present = studentAtts.filter(a => a.status === 'P').length;
      const rate = total > 0 ? (present / total) * 100 : 100;
      return { id: student.id, name: student.name, total, present, absent: total - present, rate };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, attendances]);

  const filteredStudents = useMemo(() => {
    return students
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  const handleExport = (type: 'excel' | 'pdf') => {
    const data = studentAttendanceStats.map(s => ({
      Nome: s.name,
      Presencas: s.present,
      Faltas: s.absent,
      Taxa_Frequencia: s.rate.toFixed(1) + '%'
    }));
    if (type === 'excel') exportToExcel(data, 'Frequencia_Geral_SME');
    else exportToPDF(data, 'Frequencia_Geral_SME');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-5 rounded-2xl border border-white/5 gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Registro de Presença</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acompanhamento de Assiduidade</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setReportView(reportView === 'daily' ? 'general' : 'daily')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider border border-white/10"
          >
            {reportView === 'daily' ? <PieChart className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            {reportView === 'daily' ? 'Ver Frequência Geral' : 'Realizar Chamada'}
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-[11px] font-black uppercase tracking-wider border border-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Exportar Relatório
          </button>
        </div>
      </div>

      {reportView === 'general' ? (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo Consolidado</h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="p-4">Estudante</th>
                  <th className="p-4 text-center">Presenças</th>
                  <th className="p-4 text-center">Faltas</th>
                  <th className="p-4 text-right">Frequência (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {studentAttendanceStats.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-slate-200 text-sm">{s.name}</td>
                    <td className="p-4 text-center font-black text-emerald-400 text-xs">{s.present}</td>
                    <td className="p-4 text-center font-black text-[#ef4c1c] text-xs">{s.absent}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-black px-3 py-1 rounded-lg ${s.rate < 75 ? 'bg-[#ef4c1c]/10 text-[#ef4c1c]' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {s.rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-end border border-white/5">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Filtro de Aula</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm"
                value={selectedPlanId}
                onChange={e => setSelectedPlanId(e.target.value)}
              >
                <option value="">Selecione a aula para chamada...</option>
                {plans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => {
                  const t = teachers.find(teach => teach.id === p.teacherId);
                  return (
                    <option key={p.id} value={p.id}>
                      {new Date(p.date + 'T00:00:00').toLocaleDateString('pt-BR')} - {t?.subject} ({p.shift})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex-1 w-full">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar aluno..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
          </div>

          {!selectedPlanId ? (
            <div className="bg-white/5 border border-white/5 p-20 text-center rounded-3xl text-slate-600">
               <Filter className="w-10 h-10 mx-auto mb-4 opacity-20" />
               <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Escolha um diário para iniciar a lista de presença.</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none">{teacher?.subject}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">{new Date(selectedPlan!.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {selectedPlan?.shift}</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-xs font-black text-emerald-400">{attendances.filter(a => a.lessonPlanId === selectedPlanId && a.status === 'P').length} P</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-[#ef4c1c]/10 border border-[#ef4c1c]/20 text-center">
                    <span className="text-xs font-black text-[#ef4c1c]">{attendances.filter(a => a.lessonPlanId === selectedPlanId && a.status === 'F').length} F</span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredStudents.map((student, idx) => {
                  const att = attendances.find(a => a.studentId === student.id && a.lessonPlanId === selectedPlanId);
                  const isPresent = att?.status === 'P';
                  const isAbsent = att?.status === 'F';
                  
                  return (
                    <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-[9px] font-black text-slate-600 w-5">{(idx+1).toString().padStart(2, '0')}</span>
                        <span className="font-bold text-slate-200 text-sm truncate">{student.name}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => {
                            const other = attendances.filter(a => !(a.studentId === student.id && a.lessonPlanId === selectedPlanId));
                            onUpdate([...other, { studentId: student.id, lessonPlanId: selectedPlanId, status: 'P' }]);
                          }}
                          className={`p-2 rounded-lg transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                           onClick={() => {
                             const other = attendances.filter(a => !(a.studentId === student.id && a.lessonPlanId === selectedPlanId));
                             onUpdate([...other, { studentId: student.id, lessonPlanId: selectedPlanId, status: 'F' }]);
                           }}
                          className={`p-2 rounded-lg transition-all ${isAbsent ? 'bg-[#ef4c1c] text-white shadow-lg shadow-[#ef4c1c]/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceTab;
