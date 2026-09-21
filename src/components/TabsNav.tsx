import React from 'react';
import { ActiveTab } from '../types';

interface TabsNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'contacto' as ActiveTab,
      label: 'Contacto',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'marcas' as ActiveTab,
      label: 'Marcas',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      id: 'grupo' as ActiveTab,
      label: 'Grupo',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      id="main-tabs-navigation"
      className="flex p-1 rounded-2xl bg-[#07151b]/90 border border-white/[0.08] mb-3.5 shadow-inner"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-150 ${
              isActive
                ? 'bg-cyan-500/20 text-white border border-cyan-500/35 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={isActive ? 'text-cyan-300' : 'text-slate-500'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
