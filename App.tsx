
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  CalendarCheck,
  Menu,
  X,
  ShieldCheck,
  Database,
  CloudCheck,
  MonitorDown,
  Home,
  Link as LinkIcon,
  Copy,
  Check as CheckIcon,
  Globe
} from 'lucide-react';
import { loadState, saveState } from './utils/storage';
import { AppState } from './types';
import Dashboard from './components/Dashboard';
import StudentTab from './components/StudentTab';
import TeacherTab from './components/TeacherTab';
import LessonPlanTab from './components/LessonPlanTab';
import AttendanceTab from './components/AttendanceTab';
import GradeTab from './components/GradeTab';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'plans' | 'attendance' | 'grades'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    saveState(state);
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const copyToClipboard = () => {
    const url = state.portalUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const menuItems = [
    { id: 'dashboard', label: 'Coordenação', icon: LayoutDashboard },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'teachers', label: 'Professores', icon: GraduationCap },
    { id: 'plans', label: 'Planejamento', icon: BookOpen },
    { id: 'attendance', label: 'Presença', icon: CalendarCheck },
    { id: 'grades', label: 'Notas', icon: ClipboardList },
  ] as const;

  const displayUrl = state.portalUrl || "SME-COORDENACAO.GO.GOV.BR";

  return (
    <div className="flex h-screen brand-bg overflow-hidden text-slate-200">
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-slate-950/90 backdrop-blur-2xl border-r border-white/5 flex flex-col z-30`}
      >
        <div className="p-8 flex flex-col items-center gap-4">
          <div className="bg-[#ef4c1c] w-14 h-14 flex items-center justify-center brand-shape shadow-2xl shadow-[#ef4c1c]/20">
             <ShieldCheck className="text-white w-7 h-7" />
          </div>
          {isSidebarOpen && (
            <div className="text-center animate-fadeInUp">
              <span className="font-black text-2xl text-white tracking-tighter block">SME CURSO</span>
              <span className="text-[10px] font-bold text-[#ef4c1c] uppercase tracking-[0.3em] block mt-1">Goianésia • Coordenação</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-[#ef4c1c] text-white shadow-lg shadow-[#ef4c1c]/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isSidebarOpen && <span className="font-bold text-sm truncate">{item.label}</span>}
            </button>
          ))}

          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-4 p-3.5 rounded-2xl mt-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
            >
              <MonitorDown className="w-5 h-5 shrink-0 group-hover:bounce" />
              {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">Instalar no PC</span>}
            </button>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full py-2.5 flex items-center justify-center text-slate-500 hover:text-white bg-white/5 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-5">
             <div className="h-10 w-1.5 bg-[#ef4c1c] rounded-full shadow-[0_0_15px_rgba(239,76,28,0.3)]"></div>
             <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                   {activeTab === 'dashboard' ? 'Portal de Gestão' : 
                   activeTab === 'plans' ? 'Planejamento Pedagógico' : 
                   activeTab === 'grades' ? 'Controle de Notas' : 
                   activeTab === 'attendance' ? 'Diário de Presença' : 
                   activeTab === 'students' ? 'Base de Alunos' : 'Corpo Docente'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">SME Goianésia • Coordenação</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setActiveTab('dashboard')}
               className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-[#ef4c1c] transition-all"
             >
               <Home className="w-4 h-4" />
             </button>

             <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-4">
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Acesso</p>
                   <p className="text-[10px] font-bold text-white uppercase mt-1">SME Coordenação</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                   <Users className="w-4 h-4" />
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 p-8 w-full max-w-7xl mx-auto animate-fadeInUp">
          {activeTab === 'dashboard' && <Dashboard state={state} onStateUpdate={(ns) => setState(ns)} />}
          {activeTab === 'students' && <StudentTab students={state.students} onUpdate={(s) => updateState(st => ({...st, students: s}))} />}
          {activeTab === 'teachers' && <TeacherTab teachers={state.teachers} onUpdate={(t) => updateState(st => ({...st, teachers: t}))} />}
          {activeTab === 'plans' && <LessonPlanTab teachers={state.teachers} plans={state.lessonPlans} onUpdate={(p) => updateState(st => ({...st, lessonPlans: p}))} />}
          {activeTab === 'attendance' && <AttendanceTab students={state.students} plans={state.lessonPlans} teachers={state.teachers} attendances={state.attendances} onUpdate={(a) => updateState(st => ({...st, attendances: a}))} />}
          {activeTab === 'grades' && <GradeTab students={state.students} grades={state.grades} teachers={state.teachers} onUpdate={(g) => updateState(st => ({...st, grades: g}))} />}
        </div>

        <footer className="mt-auto py-10 px-8 border-t border-white/5 bg-slate-950/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#ef4c1c]" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Portal SME Coordenação</span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Secretaria Municipal de Educação • Goianésia</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Endereço do Portal</span>
              <div className="flex items-center gap-2">
                <a 
                  href={state.portalUrl ? (state.portalUrl.startsWith('http') ? state.portalUrl : `https://${state.portalUrl}`) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-mono text-slate-400 flex items-center gap-3 hover:border-[#ef4c1c]/50 hover:text-white transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-[#ef4c1c]" />
                  <span>{displayUrl}</span>
                </a>
                <button 
                  onClick={copyToClipboard}
                  className={`p-3 rounded-2xl transition-all border ${copied ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-[#ef4c1c]/50 hover:text-[#ef4c1c]'}`}
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Diário Digital</p>
              <p className="text-white text-xs font-black mt-1 uppercase tracking-wider">Gestão Unificada Goianésia</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
