
import React, { useState } from 'react';
import { Teacher, LessonPlan } from '../types';
import { Calendar, Plus, BookOpen, Trash2, AlertCircle, Download } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/export';

interface LessonPlanTabProps {
  teachers: Teacher[];
  plans: LessonPlan[];
  onUpdate: (plans: LessonPlan[]) => void;
}

const LessonPlanTab: React.FC<LessonPlanTabProps> = ({ teachers, plans, onUpdate }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    date: new Date().toISOString().split('T')[0],
    shift: '1º Horário' as '1º Horário' | '2º Horário',
    description: ''
  });

  const isPlanConflict = (date: string, shift: string) => {
    return plans.some(p => p.date === date && p.shift === shift);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId) return alert('Selecione um professor');
    if (isPlanConflict(formData.date, formData.shift)) {
      alert(`Já existe um planejamento lançado para esta data e horário.`);
      return;
    }
    const newPlan: LessonPlan = { ...formData, id: crypto.randomUUID() };
    onUpdate([newPlan, ...plans]);
    setFormData({ ...formData, description: '' });
  };

  const handleDelete = (id: string) => {
    if(confirm('Excluir este planejamento?')) {
      onUpdate(plans.filter(p => p.id !== id));
    }
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    const data = plans.map(p => {
      const t = teachers.find(teach => teach.id === p.teacherId);
      return {
        Data: p.date,
        Docente: t?.name || '-',
        Materia: t?.subject || '-',
        Turno: p.shift,
        Plano: p.description
      };
    });
    if (type === 'excel') exportToExcel(data, 'Planejamentos_SME');
    else exportToPDF(data, 'Planejamentos_SME');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="glass-card p-6 rounded-2xl border border-white/5 sticky top-24">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#ef4c1c]" />
            Novo Planejamento
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Docente / Disciplina</label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm"
                value={formData.teacherId}
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
              >
                <option value="">Selecione...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Data Aula</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Turno</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm"
                  value={formData.shift}
                  onChange={e => setFormData({...formData, shift: e.target.value as any})}
                >
                  <option value="1º Horário">1º Horário</option>
                  <option value="2º Horário">2º Horário</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Descrição</label>
              <textarea 
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm resize-none"
                placeholder="Ações pedagógicas..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-[#ef4c1c] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/20">
              Registrar Aula
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Linha do Tempo</h2>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest border border-white/10"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
        {plans.length === 0 ? (
          <div className="bg-white/5 p-20 text-center rounded-2xl border-2 border-dashed border-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Nenhum histórico disponível.
          </div>
        ) : (
          plans.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(plan => {
            const teacher = teachers.find(t => t.id === plan.teacherId);
            return (
              <div key={plan.id} className="glass-card p-5 rounded-2xl flex gap-4 border border-white/5 group hover:border-[#ef4c1c]/30">
                <div className="bg-[#ef4c1c]/10 p-3 rounded-xl h-fit text-[#ef4c1c] border border-[#ef4c1c]/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      {new Date(plan.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <button onClick={() => handleDelete(plan.id)} className="text-slate-600 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm">{teacher?.subject} • {teacher?.name}</h3>
                  <p className="text-slate-500 text-[10px] font-bold mt-1 bg-black/20 p-3 rounded-lg italic">
                    "{plan.description}"
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LessonPlanTab;
