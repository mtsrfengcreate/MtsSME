
import React, { useState, useMemo } from 'react';
import { Student, Teacher, Grade } from '../types';
import { Plus, Trash2, Star, X, Download, Filter, BarChart3 } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/export';

interface GradeTabProps {
  students: Student[];
  teachers: Teacher[];
  grades: Grade[];
  onUpdate: (grades: Grade[]) => void;
}

const GradeTab: React.FC<GradeTabProps> = ({ students, teachers, grades, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'report'>('list');
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    description: '',
    value: 0
  });

  const subjects = Array.from(new Set(teachers.map(t => t.subject)));

  const getGradeStyle = (val: number) => {
    if (val < 5) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (val <= 7.4) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (val === 10) return 'bg-emerald-500/20 text-emerald-400 border-emerald-400 ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const studentAverages = useMemo(() => {
    return students.map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const subjectAverages = subjects.map(subject => {
        const subjectGrades = studentGrades.filter(g => g.subject === subject);
        const avg = subjectGrades.length > 0 
          ? subjectGrades.reduce((acc, curr) => acc + curr.value, 0) / subjectGrades.length 
          : null;
        return { subject, avg };
      });
      const totalAvg = studentGrades.length > 0
        ? studentGrades.reduce((acc, curr) => acc + curr.value, 0) / studentGrades.length
        : 0;
      return { id: student.id, name: student.name, subjectAverages, totalAvg };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, grades, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subject) return alert('Preencha todos os campos');
    onUpdate([...grades, { ...formData, id: crypto.randomUUID() }]);
    setIsModalOpen(false);
    setFormData(prev => ({ ...prev, studentId: '', value: 0 }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover esta nota?')) {
      onUpdate(grades.filter(g => g.id !== id));
    }
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    const exportData = studentAverages.map(s => ({
      Nome: s.name,
      ...Object.fromEntries(s.subjectAverages.map(sa => [sa.subject, sa.avg?.toFixed(2) || '-'])),
      Média_Geral: s.totalAvg.toFixed(2)
    }));
    if (type === 'excel') exportToExcel(exportData, 'Relatorio_Notas_SME');
    else exportToPDF(exportData, 'Relatorio_Notas_SME');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-5 rounded-2xl border border-white/5 gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Gestão de Avaliações</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal SME Coordenação</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'report' : 'list')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider border border-white/10"
          >
            {viewMode === 'list' ? <BarChart3 className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {viewMode === 'list' ? 'Ver Relatório' : 'Ver Lançamentos'}
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-[11px] font-black uppercase tracking-wider border border-emerald-500/20"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ef4c1c] text-white rounded-xl hover:bg-[#ff5d2e] transition-all shadow-lg shadow-[#ef4c1c]/20 text-[11px] font-black uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Novo Registro
          </button>
        </div>
      </div>

      {viewMode === 'report' ? (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="p-4 border-b border-white/5">Estudante</th>
                  {subjects.map(s => <th key={s} className="p-4 border-b border-white/5 text-center">{s}</th>)}
                  <th className="p-4 border-b border-white/5 text-right">Média Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {studentAverages.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-slate-200 text-sm">{s.name}</td>
                    {s.subjectAverages.map((sa, i) => (
                      <td key={i} className="p-4 text-center">
                        <span className={`text-xs font-black px-2 py-0.5 rounded border ${sa.avg === null ? 'text-slate-600 border-transparent' : getGradeStyle(sa.avg)}`}>
                          {sa.avg?.toFixed(1) || '-'}
                        </span>
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <span className={`text-sm font-black px-3 py-1 rounded-lg border ${getGradeStyle(s.totalAvg)}`}>
                        {s.totalAvg.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {grades.length === 0 ? (
            <div className="bg-white/5 p-16 text-center rounded-2xl border-2 border-dashed border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
              Nenhuma nota lançada no sistema.
            </div>
          ) : (
            [...grades].reverse().map(grade => {
              const student = students.find(s => s.id === grade.studentId);
              return (
                <div key={grade.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#ef4c1c]/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border ${getGradeStyle(grade.value)}`}>
                      {grade.value.toFixed(1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{student?.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{grade.subject} • {grade.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(grade.id)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-lg font-black text-white tracking-tight uppercase">Novo Lançamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Estudante</label>
                <select required className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm outline-none" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">Selecione...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Matéria</label>
                  <select required className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Selecione...</option>
                    {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Nota</label>
                  <input required type="number" step="0.1" min="0" max="10" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm outline-none text-center font-black" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">Descrição</label>
                <input required type="text" placeholder="Ex: Prova Mensal" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 bg-[#ef4c1c] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/20 mt-2">
                Salvar Nota
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeTab;
