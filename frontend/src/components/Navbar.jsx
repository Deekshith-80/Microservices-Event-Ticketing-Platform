import React from 'react';

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-zinc-200/80 sticky top-0 z-50 h-16 flex items-center px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-zinc-900 rounded-sm flex items-center justify-center font-black text-[10px] text-white">
            S
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-900">
            SHOW<span className="font-light text-zinc-400">TIME</span>
          </span>
        </div>
        
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-800 border border-zinc-200">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
            Vite Core 4.0
          </span>
        </div>
      </div>
    </header>
  );
}