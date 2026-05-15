import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAppContext } from '../context/AppContext';

export function Sales() {
  const { 
    sales, setSales, 
    customers, setCustomers, 
    products, setProducts, 
    spells, 
    materials, setMaterials, 
    magicItems, setMagicItems,
    events, setEvents,
    shipments, setShipments,
    inventoryTransactions, setInventoryTransactions
  } = useAppContext();
  
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [transactionMode, setTransactionMode] = useState('venda_produto'); // venda_produto, venda_servico, entrada_avulsa, saida
  
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomerData, setNewCustomerData] = useState({ name: '', email: '', phone: '' });
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  const [editSaleId, setEditSaleId] = useState<string | null>(null);

  const [deliveryMode, setDeliveryMode] = useState('balcao');
  
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, paymentMethod: 'PIX', date: new Date().toISOString().split('T')[0] });

  const handleItemSelect = (id: string, mode: string) => {
    setSelectedItemId(id);
    if (!id) return;
    
    if (mode === 'venda_produto') {
      const prod = products.find(p => p.id === id);
      if (prod) {
        setNewTransaction({...newTransaction, amount: prod.price, description: `Venda: ${prod.name}`});
      }
    } else if (mode === 'venda_servico') {
      const spell = spells.find(s => s.id === id);
      if (spell) {
        setNewTransaction({...newTransaction, amount: spell.price, description: `Serviço/Magia: ${spell.name}`});
      }
    }
  };

  const handleEditSale = (sale: any) => {
    setEditSaleId(sale.id);
    setNewTransaction({
      description: sale.description,
      amount: sale.amount,
      paymentMethod: sale.paymentMethod || 'PIX',
      date: sale.date.split('/').reverse().join('-')
    });
    setTransactionMode(sale.type);
    setIsDialogOpen(true);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalCustomerId = customerId;
    let createdSaleDescription = newTransaction.description;

    // 1. Handle Customer
    if ((transactionMode === 'venda_produto' || transactionMode === 'venda_servico') && customerId === 'new') {
      const newCust = {
        id: Math.floor(100 + Math.random() * 900).toString(),
        name: newCustomerData.name,
        email: newCustomerData.email,
        phone: newCustomerData.phone,
        totalOrders: 1,
        totalSpent: newTransaction.amount,
        status: 'ativo',
        lastOrder: new Date().toLocaleDateString('pt-BR'),
        records: []
      };
      setCustomers([newCust, ...customers]);
      finalCustomerId = newCust.id;
    } else if ((transactionMode === 'venda_produto' || transactionMode === 'venda_servico') && customerId !== '') {
      setCustomers(customers.map(c => c.id === customerId ? {
        ...c,
        totalOrders: (c.totalOrders || 0) + 1,
        totalSpent: (c.totalSpent || 0) + newTransaction.amount,
        lastOrder: new Date().toLocaleDateString('pt-BR')
      } : c));
    }

    // 2. Handle Stock Deduction & Scheduling depending on mode
    if (transactionMode === 'venda_produto') {
      if (selectedItemId) {
        setProducts(products.map(p => p.id === selectedItemId ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
        
        const soldProduct = products.find(p => p.id === selectedItemId);
        if (soldProduct) {
          const invTx = {
            id: Math.random().toString(),
            date: new Date().toISOString(),
            itemName: soldProduct.name,
            type: 'Saída',
            quantity: 1,
            reason: `Venda - Pedido ${finalCustomerId ? 'Cliente ' + finalCustomerId : 'Balcão'}`
          };
          setInventoryTransactions(prev => [invTx, ...prev]);
        }
      }
      
      if (deliveryMode === 'envio' && finalCustomerId) {
        const newShipment = {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          customerId: finalCustomerId,
          date: new Date().toLocaleDateString('pt-BR'),
          method: 'A combinar',
          status: 'preparando',
          tracking: '',
          total: newTransaction.amount
        };
        setShipments(prev => [newShipment, ...prev]);
      }
      
    } else if (transactionMode === 'venda_servico') {
      if (selectedItemId) {
        const spell = spells.find(s => s.id === selectedItemId);
        if (spell && spell.requiredItems) {
          const reqItemsNorm = spell.requiredItems.map((i: string) => i.toLowerCase().trim());
          
          const matchItem = (name: string) => {
            const normName = name.toLowerCase().trim();
            if (reqItemsNorm.includes(normName)) return true;
            return reqItemsNorm.some(req => req.includes(normName) || normName.includes(req));
          };

          let consumedItems: string[] = [];
          
          setMaterials(prev => prev.map(m => {
            if (matchItem(m.name) && m.stock > 0) {
              consumedItems.push(m.name);
              return { ...m, stock: Math.max(0, m.stock - 1) };
            }
            return m;
          }));
          
          setMagicItems(prev => prev.map(mi => {
            if (matchItem(mi.name) && mi.stock > 0) {
              consumedItems.push(mi.name);
              return { ...mi, stock: Math.max(0, mi.stock - 1) };
            }
            return mi;
          }));
          
          if (consumedItems.length > 0) {
            const newInvTxs = consumedItems.map(itemName => ({
              id: Math.random().toString(),
              date: new Date().toISOString(),
              itemName: itemName,
              type: 'Saída',
              quantity: 1,
              reason: `Consumo - ${spell.name} ${finalCustomerId ? '(Cliente ' + finalCustomerId + ')' : ''}`
            }));
            setInventoryTransactions(prev => [...newInvTxs, ...prev]);
          }
        }
        
        // Scheduling
        let evDate = new Date();
        let evTime = `${evDate.getHours().toString().padStart(2, '0')}:${evDate.getMinutes().toString().padStart(2, '0')}`;
        
        if (isScheduled && scheduleDate && scheduleTime) {
          evDate = new Date(scheduleDate + 'T' + scheduleTime);
          evTime = scheduleTime;
        }
        
        const newEvent = {
          id: Math.floor(10 + Math.random() * 90).toString(),
          date: evDate,
          title: spell?.name || 'Serviço Reservado',
          type: 'magia',
          time: evTime,
          customerId: finalCustomerId,
          spellId: selectedItemId,
          attendance: 'none'
        };
        setEvents([...events, newEvent]);
      }
      
      if (deliveryMode === 'envio' && finalCustomerId) {
        const newShipment = {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          customerId: finalCustomerId,
          date: new Date().toLocaleDateString('pt-BR'),
          method: 'A combinar',
          status: 'preparando',
          tracking: '',
          total: newTransaction.amount
        };
        setShipments([newShipment, ...shipments]);
      }
    }
    
    // Determine the type
    const transactionType = transactionMode === 'saida' ? 'saida' : 'entrada';
    
    if (editSaleId) {
      setSales(sales.map(s => s.id === editSaleId ? {
        ...s,
        date: new Date(newTransaction.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        description: createdSaleDescription,
        type: transactionType,
        amount: newTransaction.amount,
        paymentMethod: newTransaction.paymentMethod,
      } : s));
    } else {
      const newEntry = {
        id: Math.floor(100 + Math.random() * 900).toString(),
        date: new Date(newTransaction.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        description: createdSaleDescription,
        type: transactionType,
        amount: newTransaction.amount,
        paymentMethod: newTransaction.paymentMethod,
      };
      setSales([newEntry, ...sales]);
    }
    
    resetForm();
    setIsDialogOpen(false);
    setEditSaleId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja apagar esta transação?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setTransactionMode('venda_produto');
    setSelectedItemId('');
    setCustomerId('');
    setNewCustomerData({ name: '', email: '', phone: '' });
    setIsScheduled(false);
    setScheduleDate('');
    setScheduleTime('');
    setDeliveryMode('balcao');
    setNewTransaction({ description: '', amount: 0, paymentMethod: 'PIX', date: new Date().toISOString().split('T')[0] });
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const totalEntradas = sales.filter(s => s.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSaidas = sales.filter(s => s.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">Financeiro & Vendas</h2>
          <p className="text-muted-foreground">Gerencie as entradas e saídas de produtos e serviços.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-[#0A0A0A] hover:bg-primary/80" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2"/> Nova Transação Real
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Nova Transação / Venda</DialogTitle>
                <DialogDescription>
                  Registre uma nova venda de produto/serviço ou lance uma entrada/saída avulsa.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTransaction} className="space-y-6 my-2">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Transação</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={transactionMode}
                    onChange={(e) => {
                      setTransactionMode(e.target.value);
                      setSelectedItemId('');
                      setNewTransaction({ ...newTransaction, description: '', amount: 0 });
                    }}
                  >
                    <option value="venda_produto">Venda de Produto</option>
                    <option value="venda_servico">Venda de Serviço / Magia</option>
                    <option value="entrada_avulsa">Entrada Avulsa (Ex: Doação, ajuste)</option>
                    <option value="saida">Saída (Despesa, compra de insumo)</option>
                  </select>
                </div>

                {/* PRODUTO / SERVIÇO SELETOR */}
                {(transactionMode === 'venda_produto' || transactionMode === 'venda_servico') && (
                  <div className="p-4 bg-muted/20 border border-border rounded-md space-y-4">
                    <h3 className="font-serif italic text-primary">Detalhes da Venda</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">O que foi vendido?</label>
                      <select 
                        required
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={selectedItemId}
                        onChange={(e) => handleItemSelect(e.target.value, transactionMode)}
                      >
                        <option value="" disabled>Selecione o item...</option>
                        {transactionMode === 'venda_produto' && products?.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - R$ {p.price?.toFixed(2)} ({p.stock} em estoque)</option>
                        ))}
                        {transactionMode === 'venda_servico' && spells?.map(s => (
                          <option key={s.id} value={s.id}>{s.name} - R$ {s.price?.toFixed(2)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente</label>
                      <select 
                        required
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                      >
                        <option value="" disabled>Selecione o cliente...</option>
                        <option value="new">+ Cadastrar Novo Cliente</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {customerId === 'new' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <Input required placeholder="Nome do Cliente" value={newCustomerData.name} onChange={e => setNewCustomerData({...newCustomerData, name: e.target.value})} />
                        <Input required type="email" placeholder="Email" value={newCustomerData.email} onChange={e => setNewCustomerData({...newCustomerData, email: e.target.value})} />
                        <Input placeholder="Telefone" value={newCustomerData.phone} onChange={e => setNewCustomerData({...newCustomerData, phone: e.target.value})} />
                      </div>
                    )}

                    {transactionMode === 'venda_servico' && (
                      <div className="pt-2 border-t border-border mt-4">
                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                          <span>Agendar horário no Calendário?</span>
                        </label>
                        {isScheduled && (
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <Input required type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                            <Input required type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                          </div>
                        )}
                        {!isScheduled && (
                          <p className="text-xs text-muted-foreground mt-2">Sem agendamento, será gerado um registro para a data e hora atual.</p>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-border mt-4">
                      <label className="text-sm font-medium mb-3 block">Método de Entrega / Execução</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="button" variant={deliveryMode === 'balcao' ? 'default' : 'outline'} className={`flex-1 h-auto min-h-[44px] whitespace-normal ${deliveryMode === 'balcao' ? 'bg-primary text-[#0A0A0A]' : ''}`} onClick={() => setDeliveryMode('balcao')}>
                          Presencial / Balcão
                        </Button>
                        <Button type="button" variant={deliveryMode === 'envio' ? 'default' : 'outline'} className={`flex-1 h-auto min-h-[44px] whitespace-normal ${deliveryMode === 'envio' ? 'bg-primary text-[#0A0A0A]' : ''}`} onClick={() => setDeliveryMode('envio')}>
                          Via Envio (Correios/Transp.)
                        </Button>
                      </div>
                      {deliveryMode === 'envio' && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">Um pedido de envio será criado na aba Envios.</p>
                      )}
                    </div>
                  </div>
                )}


                {/* CAMPOS COMUNS DE VALOR, DATA E PGTO */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data do Registro</label>
                    <Input required type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input required type="number" min="0" step="0.01" value={newTransaction.amount === 0 ? '' : newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição da Transação</label>
                  <Input required placeholder="Ex: Venda, Doação, Material..." value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction({...newTransaction, paymentMethod: e.target.value})}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Boleto">Boleto / Outros</option>
                  </select>
                </div>

                <DialogFooter className="mt-4 border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="w-full sm:w-auto bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Registro</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">R$ {totalEntradas.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">R$ {totalSaidas.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Saldo (Mês)</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {totalBalance.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Consulte o fluxo de caixa.</CardDescription>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="w-full sm:w-[300px]" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Forma Pgto.</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.filter(s => s.description.toLowerCase().includes(search.toLowerCase())).map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="whitespace-nowrap">{sale.date}</TableCell>
                  <TableCell className="font-medium max-w-[250px]">
                    <div className="line-clamp-3 leading-tight">{sale.description}</div>
                  </TableCell>
                  <TableCell>
                    {sale.type === 'entrada' ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Entrada</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Saída</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {sale.paymentMethod || '-'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {sale.type === 'entrada' ? '+ ' : '- '}
                    R$ {Number(sale.amount || 0).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSale(sale)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="h-8 w-8 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

