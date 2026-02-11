
import React, { useState, useMemo } from 'react';
import { Student, SchoolingLevel } from '../types';
import { Plus, Trash2, Edit2, Search, Download, X } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/export';

interface StudentTabProps {
  students: Student[];
  onUpdate: (students: Student[]) => void;
}

const StudentTab: React.FC<StudentTabProps> = ({ students, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    dob: '',
    schooling: 'Fundamental I' as SchoolingLevel
  });

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        cpf: student.cpf,
        dob: student.dob,
        schooling: student.schooling
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', cpf: '', dob: '', schooling: 'Fundamental I' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdate(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
    } else {
      onUpdate([...students, { ...formData, id: crypto.randomUUID() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este aluno?')) {
      onUpdate(students.filter(s => s.id !== id));
    }
  };

  const sortedAndFilteredStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.cpf.includes(searchTerm)
      );
  }, [students, searchTerm]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar aluno por nome ou CPF..."
            className="w-full pl-12 pr-6 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:ring-2 focus:ring-[#ef4c1c] focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportToExcel(students, 'Lista_Alunos')}
            className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-2xl hover:bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-widest transition-all"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => exportToPDF(students, 'Lista_Alunos')}
            className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-2xl hover:bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-widest transition-all"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-8 py-3 bg-[#ef4c1c] text-white rounded-2xl hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/30 font-bold text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" /> Novo Aluno
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="pb-4 px-6 w-20">Nº</th>
              <th className="pb-4 px-6">Nome Completo</th>
              <th className="pb-4 px-6">CPF</th>
              <th className="pb-4 px-6">Nascimento</th>
              <th className="pb-4 px-6">Escolaridade</th>
              <th className="pb-4 px-6 text-right">Gerenciar</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {sortedAndFilteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-500 font-medium bg-slate-800/20 rounded-3xl">Nenhum registro encontrado na base de dados.</td>
              </tr>
            ) : (
              sortedAndFilteredStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-white/[0.03] group transition-all">
                  <td className="py-5 px-6 font-black text-[#ef4c1c] bg-[#ef4c1c]/5 rounded-l-2xl text-center w-20">
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="py-5 px-6 font-bold text-slate-100 group-hover:text-white transition-colors">{student.name}</td>
                  <td className="py-5 px-6 text-slate-400 font-mono text-sm tracking-tighter">{student.cpf}</td>
                  <td className="py-5 px-6 text-slate-400 font-medium">{new Date(student.dob + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="py-5 px-6">
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {student.schooling}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right rounded-r-2xl bg-white/[0.01]">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(student)}
                        className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-[#ef4c1c] hover:bg-[#ef4c1c]/10 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/10 animate-scaleIn">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {editingStudent ? 'Editar Registro' : 'Cadastrar Aluno'}
                </h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">SME Curso • Goianésia</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-slate-400 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  placeholder="Nome do aluno"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-800 border border-white/10 focus:ring-2 focus:ring-[#ef4c1c] focus:border-transparent outline-none text-white transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">CPF</label>
                  <input
                    required
                    type="text"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 border border-white/10 focus:ring-2 focus:ring-[#ef4c1c] focus:border-transparent outline-none text-white transition-all"
                    value={formData.cpf}
                    onChange={e => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nascimento</label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 border border-white/10 focus:ring-2 focus:ring-[#ef4c1c] focus:border-transparent outline-none text-white transition-all"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Escolaridade</label>
                <select
                  className="w-full px-6 py-4 rounded-2xl bg-slate-800 border border-white/10 focus:ring-2 focus:ring-[#ef4c1c] focus:border-transparent outline-none text-white appearance-none transition-all"
                  value={formData.schooling}
                  onChange={e => setFormData({ ...formData, schooling: e.target.value as SchoolingLevel })}
                >
                  <option value="Fundamental I">Fundamental I</option>
                  <option value="Fundamental II">Fundamental II</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Superior">Superior</option>
                </select>
              </div>
              <div className="pt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-slate-400 font-bold uppercase text-xs tracking-widest transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-[#ef4c1c] text-white rounded-2xl hover:bg-[#ff5d2e] transition-all shadow-xl shadow-[#ef4c1c]/30 font-bold uppercase text-xs tracking-widest"
                >
                  {editingStudent ? 'Atualizar Dados' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTab;
