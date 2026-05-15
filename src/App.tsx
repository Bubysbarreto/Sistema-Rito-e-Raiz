/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, Package, Calendar, Truck, Settings, Users, Sparkles, DollarSign, LogOut, ShoppingCart } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { CalendarView } from './components/CalendarView';
import { Shipping } from './components/Shipping';
import { CRM } from './components/CRM';
import { SpellsCatalog } from './components/SpellsCatalog';
import { Sales } from './components/Sales';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { ConfigCentral } from './components/ConfigCentral';
import { POS } from './components/POS';

function MainLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Painel', icon: LayoutDashboard },
    { id: 'pos', name: 'Caixa / PDV', icon: ShoppingCart },
    { id: 'sales', name: 'Vendas', icon: DollarSign },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'spells', name: 'Magias', icon: Sparkles },
    { id: 'inventory', name: 'Estoque', icon: Package },
    { id: 'calendar', name: 'Calendário', icon: Calendar },
    { id: 'shipping', name: 'Envios', icon: Truck },
    { id: 'config', name: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'sales': return <Sales />;
      case 'crm': return <CRM />;
      case 'spells': return <SpellsCatalog />;
      case 'inventory': return <Inventory />;
      case 'calendar': return <CalendarView />;
      case 'shipping': return <Shipping />;
      case 'config': return <ConfigCentral />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <header className="h-20 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-primary drop-shadow-[0_0_8px_rgba(164,66,42,0.3)]">
              <polygon points="50,0 52,38 85,15 62,48 100,50 62,52 85,85 52,62 50,100 48,62 15,85 38,52 0,50 38,48 15,15 48,38" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-serif tracking-widest text-primary uppercase">Rito e Raiz</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Gestão Mística & Artesanal</p>
          </div>
        </div>
        <nav className="flex gap-8 items-center">
          {navigation.map((item) => {
            const hasAccess = user.role === 'admin' || user.permissions.includes(item.id);
            if (!hasAccess) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs uppercase tracking-widest transition-colors pb-1 flex items-center gap-1 ${
                  activeTab === item.id 
                    ? 'text-primary border-b border-primary font-bold' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            );
          })}
          <div className="w-px h-6 bg-border mx-2"></div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{user.role === 'admin' ? 'Administrador' : 'Atendente'}</p>
            </div>
            <button 
              onClick={logout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-[10px] tracking-widest uppercase"
            >
              <LogOut className="w-3 h-3" /> Sair
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
