import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Truck, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function Dashboard() {
  const { sales, shipments, events, products } = useAppContext();

  const metrics = useMemo(() => {
    let receita = 0;
    let despesa = 0;
    let vendasCount = 0;
    
    sales.forEach(sale => {
      if (sale.type === 'entrada') {
        receita += Number(sale.amount);
        vendasCount++;
      } else {
        despesa += Number(sale.amount);
      }
    });

    const pendingShipments = shipments.filter(s => s.status === 'preparando' || s.status === 'pendente').length;
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

    // Build a simple 6-month chart based on real sales data, assuming the current month is the last one
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Group sales by month
    const salesByMonth = new Map();
    
    // Initialize last 6 months
    const today = new Date();
    for(let i=5; i>=0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        salesByMonth.set(key, { name: monthNames[d.getMonth()], vendas: 0, despesas: 0 });
    }

    sales.forEach(sale => {
        // Parse date DD/MM/YYYY
        if (!sale.date) return;
        const parts = sale.date.split('/');
        if (parts.length !== 3) return;
        const saleDate = new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
        const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
        
        if (salesByMonth.has(key)) {
            const data = salesByMonth.get(key);
            if (sale.type === 'entrada') data.vendas += Number(sale.amount);
            else data.despesas += Number(sale.amount);
        }
    });

    const chartData = Array.from(salesByMonth.values());

    return {
      receita,
      despesa,
      vendasCount,
      pendingShipments,
      upcomingEvents,
      chartData
    };
  }, [sales, shipments, events]);

  const bestSellers = useMemo(() => {
    // Combine products with some mock sales data for now if actual sales don't attach product IDs
    return products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        sales: Math.floor(Math.random() * 50) + 10 // Mock sales count since we don't track itemized lines yet
    })).sort((a,b) => b.sales - a.sales);
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif italic tracking-wide text-primary">Visão Geral</h2>
        <p className="text-muted-foreground">Aqui você acompanha os resultados do atelier baseados nos dados lançados no sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Global</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.receita)}
            </div>
            <p className="text-xs text-muted-foreground">Total de entradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vendasCount}</div>
            <p className="text-xs text-muted-foreground">Registradas nos fluxos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingShipments}</div>
            <p className="text-xs text-muted-foreground">Na aba envios (pendente/preparando)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Pendentes no calendário</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Evolução de Entradas (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#E0E0E0', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#C5A059' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2A2A" />
                  <Area type="monotone" dataKey="vendas" name="Entradas" stroke="#C5A059" fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Produtos em Destaque</CardTitle>
            <CardDescription>
              Acompanhamento de estoque dos principais itens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              {bestSellers.map(product => (
                <div key={product.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    {/* <p className="text-xs text-muted-foreground">{product.sales} estimadas</p> */}
                  </div>
                  <div className="ml-auto flex items-center gap-2 font-medium">
                    {product.stock < 10 ? (
                      <span className="text-amber-400 text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">Baixo ({product.stock})</span>
                    ) : (
                      <span className="text-emerald-400 text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">OK ({product.stock})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

