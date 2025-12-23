// src/components/AuthStatus.tsx
import { LogIn, User } from 'lucide-react';

interface AuthStatusProps {
  session: any;
  handleLogin: () => void;
  handleLogout: () => void;
}

export const AuthStatus = ({ session, handleLogin, handleLogout }: AuthStatusProps) => {
  if (!session) {
    return (
      <button 
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed dark:border-zinc-800 border-slate-200 dark:text-zinc-400 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all text-xs font-bold uppercase"
      >
        <LogIn size={14} /> Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg dark:bg-zinc-900 bg-slate-50 border dark:border-zinc-800 border-slate-200">
      <div className="flex items-center gap-3">
        <img src={session.user.image || ''} className="w-8 h-8 rounded-full border dark:border-zinc-700" alt="avatar" />
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold dark:text-zinc-200 text-slate-700 truncate w-24">{session.user.name}</span>
          <button onClick={handleLogout} className="text-[9px] text-red-500 font-bold uppercase hover:underline">Sign Out</button>
        </div>
      </div>
      <User size={14} className="text-zinc-600" />
    </div>
  );
};