import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MoreHorizontal, Mail, Phone, Edit, Ban, FileText, Plus, Sparkles, Trash2, MessageCircle, ShoppingCart } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function CRM() {
  const { customers, setCustomers, spells, sales } = useAppContext();
  const [search, setSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', birthDate: '' });
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  const [selectedCustomerForRecord, setSelectedCustomerForRecord] = useState<any | null>(null);
  const [newRecordEntry, setNewRecordEntry] = useState({ serviceId: '', notes: '', date: new Date().toISOString().split('T')[0] });

  const [selectedCustomerForSales, setSelectedCustomerForSales] = useState<any | null>(null);

  const handleCreateOrUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomerId) {
      setCustomers(customers.map(c => 
        c.id === editingCustomerId ? { ...c, ...newCustomer } : c
      ));
    } else {
      const newEntry = {
        id: Math.floor(100 + Math.random() * 900).toString(),
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        birthDate: newCustomer.birthDate,
        totalOrders: 0,
        totalSpent: 0,
        status: 'ativo',
        lastOrder: '-',
        records: []
      };
      setCustomers([newEntry, ...customers]);
    }
    setNewCustomer({ name: '', email: '', phone: '', birthDate: '' });
    setEditingCustomerId(null);
    setIsCustomerDialogOpen(false);
  };

  const handleEditCustomer = (customer: any) => {
    setNewCustomer({ name: customer.name, email: customer.email, phone: customer.phone, birthDate: customer.birthDate || '' });
    setEditingCustomerId(customer.id);
    setIsCustomerDialogOpen(true);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForRecord || !newRecordEntry.notes) return;

    const selectedService = spells.find(s => s.id === newRecordEntry.serviceId);
    const updatedCustomer = {
      ...selectedCustomerForRecord,
      records: [
        {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          date: newRecordEntry.date,
          serviceName: selectedService ? selectedService.name : 'Atendimento Geral',
          serviceCategory: selectedService ? selectedService.category || 'Magia' : 'Geral',
          notes: newRecordEntry.notes,
        },
        ...(selectedCustomerForRecord.records || [])
      ]
    };

    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomerForRecord(updatedCustomer);
    setNewRecordEntry({ serviceId: '', notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!selectedCustomerForRecord) return;
    const updatedCustomer = {
      ...selectedCustomerForRecord,
      records: (selectedCustomerForRecord.records || []).filter((r: any) => r.id !== recordId)
    };
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomerForRecord(updatedCustomer);
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Ativo</Badge>;
      case 'vip': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">VIP</Badge>;
      case 'inativo': return <Badge variant="outline" className="bg-[#222] text-[#888] border-[#333]">Inativo</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">CRM & Clientes</h2>
          <p className="text-muted-foreground">Gerencie o relacionamento, histórico e dados dos clientes.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCustomerDialogOpen} onOpenChange={(open) => {
            setIsCustomerDialogOpen(open);
            if (!open) {
              setEditingCustomerId(null);
              setNewCustomer({ name: '', email: '', phone: '', birthDate: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-[#0A0A0A] hover:bg-primary/80" onClick={() => {
                setEditingCustomerId(null);
                setNewCustomer({ name: '', email: '', phone: '', birthDate: '' });
                setIsCustomerDialogOpen(true);
              }}>
                <UserPlus className="w-4 h-4 mr-2"/> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">{editingCustomerId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                <DialogDescription>
                  {editingCustomerId ? 'Altere as informações abaixo.' : 'Preencha os dados básicos do novo cliente.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdateCustomer} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input required placeholder="Ex: Maria Luiza" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input required type="email" placeholder="maria@email.com" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Nascimento</label>
                    <Input type="date" value={newCustomer.birthDate} onChange={e => setNewCustomer({...newCustomer, birthDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input required placeholder="(11) 99999-9999" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Cliente</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Base de Clientes</CardTitle>
            <CardDescription>Visualize o histórico de valor vitalício (LTV) e status.</CardDescription>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por nome ou email..." 
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
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                       {customer.name}
                       {customer.birthDate && new Date(customer.birthDate).getDate() === new Date().getDate() && new Date(customer.birthDate).getMonth() === new Date().getMonth() && (
                          <span title="Aniversariante do dia!" className="text-xl leading-none">🎂</span>
                       )}
                    </div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground"><Phone className="w-3 h-3 mr-1"/> {customer.phone}</div>
                    {customer.birthDate && (
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5 tracking-wider">
                         Nasc: {new Intl.DateTimeFormat('pt-BR').format(new Date(customer.birthDate + 'T00:00:00'))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{customer.totalOrders}</TableCell>
                  <TableCell className="text-right">R$ {customer.totalSpent.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{customer.lastOrder}</TableCell>
                  <TableCell>{renderStatusBadge(customer.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-secondary border-border text-foreground">
                          <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Ações</div>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setSelectedCustomerForRecord(customer), 150) }} className="focus:bg-border cursor-pointer"><FileText className="w-4 h-4 mr-2" /> Prontuário</DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => setSelectedCustomerForSales(customer), 150) }} className="focus:bg-border cursor-pointer text-blue-500"><ShoppingCart className="w-4 h-4 mr-2" /> Histórico de Compras</DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => handleEditCustomer(customer), 150) }} className="focus:bg-border cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Editar Dados</DropdownMenuItem>
                        
                        <DropdownMenuItem onSelect={() => window.open(`mailto:${customer.email}`, "_blank")} className="focus:bg-border cursor-pointer">
                          <Mail className="w-4 h-4 mr-2" /> Enviar Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, "_blank")} className="focus:bg-border cursor-pointer text-emerald-500">
                          <MessageCircle className="w-4 h-4 mr-2" /> Enviar WhatsApp
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-border" />
                        {customer.status !== 'vip' && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => handleStatusChange(customer.id, 'vip'), 150) }} className="focus:bg-border cursor-pointer"><UserPlus className="w-4 h-4 mr-2 text-primary" /> Marcar como VIP</DropdownMenuItem>}
                        {customer.status !== 'inativo' ? (
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => handleStatusChange(customer.id, 'inativo'), 150) }} className="focus:bg-border text-red-400 cursor-pointer"><Ban className="w-4 h-4 mr-2" /> Inativar Cliente</DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTimeout(() => handleStatusChange(customer.id, 'ativo'), 150) }} className="focus:bg-border text-emerald-400 cursor-pointer"><UserPlus className="w-4 h-4 mr-2" /> Reativar Cliente</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault();
                            setTimeout(() => {
                              if(confirm(`Tem certeza que deseja apagar ${customer.name}?`)) {
                                setCustomers(customers.filter(c => c.id !== customer.id));
                              }
                            }, 150);
                        }} className="focus:bg-destructive focus:text-destructive-foreground text-destructive cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir Cliente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prontuário Dialog */}
      <Dialog open={!!selectedCustomerForRecord} onOpenChange={(open) => !open && setSelectedCustomerForRecord(null)}>
        <DialogContent className="max-w-[900px] w-[90vw] max-h-[90vh] flex flex-col pt-6 pb-2">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-serif italic text-primary flex items-center gap-2">
              <FileText className="w-6 h-6" /> Prontuário: {selectedCustomerForRecord?.name}
            </DialogTitle>
            <DialogDescription>
              Histórico de atendimentos holísticos, terapêuticos e ritos místicos do paciente/cliente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6">
            <Card className="border-border">
              <CardHeader className="py-4 bg-muted/30">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Registrar Novo Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddRecord} className="flex gap-4 flex-col sm:flex-row items-end">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Data do Atendimento</label>
                      <Input type="date" required value={newRecordEntry.date} onChange={e => setNewRecordEntry({...newRecordEntry, date: e.target.value})} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Serviço / Terapia / Magia</label>
                      <select 
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={newRecordEntry.serviceId}
                        onChange={e => setNewRecordEntry({...newRecordEntry, serviceId: e.target.value})}
                      >
                        <option value="">-- Atendimento Geral --</option>
                        {spells.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.category === 'Serviço Holístico' ? 'Oráculo/Terapia' : 'Magia'})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium">Anotações do Prontuário</label>
                      <Textarea 
                        placeholder="Ex: O paciente apresentou ansiedade. Foi feito alinhamento de chakras, sugerido banho de lavanda e recomendada meditação."
                        value={newRecordEntry.notes}
                        onChange={e => setNewRecordEntry({...newRecordEntry, notes: e.target.value})}
                        className="min-h-[80px] text-sm resize-y"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="shrink-0 h-[80px] w-full sm:w-auto">
                    Salvar <br/> Registro
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Histórico Resumido</h3>
              
              {(!selectedCustomerForRecord?.records || selectedCustomerForRecord.records.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>Nenhum atendimento registrado no prontuário ainda.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-border ml-3 space-y-6 pb-4">
                  {selectedCustomerForRecord.records.map((record: any, idx: number) => (
                    <div key={record.id} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 shadow-[0_0_8px_rgba(164,66,42,0.8)]"></div>
                      <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs text-muted-foreground font-mono">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                            <h4 className="font-medium text-primary mt-1">{record.serviceName}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{record.serviceCategory}</Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive hover:bg-destructive/10" 
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{record.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setSelectedCustomerForRecord(null)}>Fechar Prontuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Ver Compras Dialog */}
      <Dialog open={!!selectedCustomerForSales} onOpenChange={(open) => !open && setSelectedCustomerForSales(null)}>
        <DialogContent className="max-w-[700px] w-[90vw] max-h-[90vh] flex flex-col pt-6 pb-2">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-serif italic text-primary flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" /> Histórico de Compras: {selectedCustomerForSales?.name}
            </DialogTitle>
            <DialogDescription>
              Historico completo de compras realizadas no PDV associado a este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
             {(() => {
                const customerSales = sales.filter(s => s.customerId === selectedCustomerForSales?.id);
                if (customerSales.length === 0) {
                   return (
                      <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>Nenhuma compra encontrada para este cliente.</p>
                      </div>
                   );
                }
                return (
                   <Table>
                      <TableHeader>
                         <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Pagamento</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {customerSales.map(sale => (
                            <TableRow key={sale.id}>
                               <TableCell>{sale.date}</TableCell>
                               <TableCell className="max-w-[200px]"><div className="line-clamp-2" title={sale.description}>{sale.description}</div></TableCell>
                               <TableCell>
                                  {sale.type === 'entrada' ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Compra</Badge> : <Badge variant="outline" className="bg-[#222] text-[#888] border-[#333]">Reembolso</Badge>}
                               </TableCell>
                               <TableCell><Badge variant="secondary">{sale.paymentMethod || sale.payment}</Badge></TableCell>
                               <TableCell className="text-right font-medium text-emerald-500">R$ {parseFloat(sale.amount).toFixed(2).replace('.', ',')}</TableCell>
                            </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                );
             })()}
          </div>
          <DialogFooter className="border-t border-border pt-4 mt-2">
             <Button variant="outline" onClick={() => setSelectedCustomerForSales(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
