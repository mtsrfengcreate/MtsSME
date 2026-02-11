
import React, { useState } from 'react';
import { Teacher } from '../types';
import { Plus, Trash2, Edit2, AlertCircle, X, GraduationCap, Download } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/export';

interface TeacherTabProps {
  teachers: Teacher[];
  onUpdate: (teachers: Teacher[]) => void;
}

const TeacherTab: React.FC<TeacherTabProps> = ({ teachers, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    dayOfWeek: 'Segunda-feira',
    shift: '1º Horário' as '1º Horário' | '2º Horário'
  });

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        subject: teacher.subject,
        dayOfWeek: teacher.dayOfWeek,
        shift: teacher.shift
      });
    } else {
      setEditingTeacher(null);
      setFormData({ name: '', subject: '', dayOfWeek: 'Segunda-feira', shift: '1º Horário' });
    }
    setIsModalOpen(true);
  };

  const isSlotTaken = (day: string, shift: string, currentId?: string) => {
    return teachers.some(t => t.dayOfWeek === day && t.shift === shift && t.id !== currentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSlotTaken(formData.dayOfWeek, formData.shift, editingTeacher?.id)) {
      alert(`O horário ${formData.dayOfWeek} (${formData.shift}) já está ocupado por outro docente.`);
      return;
    }
    if (editingTeacher) {
      onUpdate(teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t));
    } else {
      onUpdate([...teachers, { ...formData, id: crypto.randomUUID() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja remover esta atribuição do professor?')) {
      onUpdate(teachers.filter(t => t.id !== id));
    }
  };

  const handleExport = (type: 'excel' | 'pdf') => {
    const data = teachers.map(t => ({
      Nome: t.name,
      Materia: t.subject,
      Dia: t.dayOfWeek,
      Horario: t.shift
    }));
    if (type === 'excel') exportToExcel(data, 'Lista_Docentes_SME');
    else exportToPDF(data, 'Lista_Docentes_SME');
  };

  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  return (
    <div className="glass-card rounded-[2rem] p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Corpo Docente</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">SME Goianésia • Coordenação</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider border border-white/10"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#ef4c1c] text-white rounded-xl hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/20 font-black text-[11px] uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Novo Docente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white/5 rounded-2xl border-2 border-dashed border-white/5">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">Aguardando cadastro de professores.</p>
          </div>
        ) : (
          [...teachers].sort((a,b) => a.dayOfWeek.localeCompare(b.dayOfWeek)).map(teacher => (
            <div key={teacher.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#ef4c1c]/30 transition-all group relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between mb-4">
                  <div className="w-10 h-10 bg-[#ef4c1c]/10 rounded-xl flex items-center justify-center text-[#ef4c1c] font-black border border-[#ef4c1c]/20">
                    {teacher.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(teacher)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(teacher.id)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-white text-base truncate">{teacher.name}</h3>
                <p className="text-[#ef4c1c] font-black text-[9px] uppercase tracking-widest mt-1">{teacher.subject}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> {teacher.dayOfWeek}</span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> {teacher.shift}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 animate-scaleIn">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tight uppercase">{editingTeacher ? 'Editar' : 'Novo'} Docente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Nome Completo</label>
                <input required className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Disciplina</label>
                <input required className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Dia</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Horário</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white outline-none text-sm" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
                    <option value="1º Horário">1º Horário</option>
                    <option value="2º Horário">2º Horário</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-[#ef4c1c] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/20">
                Efetivar Cadastro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTab;
