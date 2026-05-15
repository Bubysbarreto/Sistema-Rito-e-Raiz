import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Printer, MoreHorizontal, Edit, Ban, CheckCircle, Plus, FileText, Tag } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
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

export function Shipping() {
  const { shipments, setShipments, customers, products, setProducts } = useAppContext();
  const [search, setSearch] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    customerId: '',
    productId: '',
    quantity: 1,
    method: 'Correios - PAC'
  });

  const getCustomerName = (id: string) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Desconhecido';
  };

  const filteredShipments = shipments.filter(s => 
    s.id.includes(search) || 
    getCustomerName(s.customerId).toLowerCase().includes(search.toLowerCase()) || 
    (s.tracking && s.tracking.toLowerCase().includes(search.toLowerCase()))
  );

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'preparando': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Preparando (Embalagem)</Badge>;
      case 'pronto': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Pronto para Retirada</Badge>;
      case 'enviado': return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Enviado</Badge>;
      case 'entregue': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Entregue</Badge>;
      case 'cancelado': return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Cancelado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setShipments(shipments.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handlePrintLabels = () => {
    window.print();
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.productId) {
      alert("Por favor, selecione um cliente e um produto.");
      return;
    }
    const selProduct = products.find(p => p.id === newOrder.productId);
    if (selProduct) {
      if (selProduct.stock < newOrder.quantity) {
        alert("Estoque insuficiente!");
        return;
      }
      setProducts(products.map(p => p.id === newOrder.productId ? { ...p, stock: p.stock - newOrder.quantity } : p));
      
      const newTotal = selProduct.price * newOrder.quantity;
      const order = {
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        customerId: newOrder.customerId,
        date: new Date().toLocaleDateString('pt-BR'),
        method: newOrder.method,
        status: 'preparando',
        tracking: '',
        total: newTotal
      };
      setShipments([order, ...shipments]);
      setNewOrder({ customerId: '', productId: '', quantity: 1, method: 'Correios - PAC' });
      alert("Pedido criado com sucesso!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">Logística & Envios</h2>
          <p className="text-muted-foreground">Controle de pacotes, códigos de rastreio e status de entregas.</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: 'outline', className: 'border-primary text-primary hover:bg-primary hover:text-[#0A0A0A]' })}>
              <FileText className="w-4 h-4 mr-2"/> Declaração
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Imprimir Declarações de Envio</DialogTitle>
                <DialogDescription>
                  Confirme a impressão das declarações de envio dos pacotes marcados como "pronto".
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 bg-muted/20 border border-border rounded-md my-4">
                <p className="text-sm text-center font-mono">
                  {shipments.filter(s => s.status === 'pronto').length} declaração(ões) pendente(s)
                </p>
              </div>
              <DialogFooter>
                <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                <Button onClick={handlePrintLabels} className="w-full sm:w-auto bg-primary text-[#0A0A0A]"><Printer className="w-4 h-4 mr-2"/> Confirmar Impressão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: 'outline', className: 'border-primary text-primary hover:bg-primary hover:text-[#0A0A0A]' })}>
              <Tag className="w-4 h-4 mr-2"/> Etiqueta
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Imprimir Etiquetas de Envio</DialogTitle>
                <DialogDescription>
                  Confirme a impressão das etiquetas de postagem térmica ou A4 para os pacotes prontos.
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 bg-muted/20 border border-border rounded-md my-4">
                <p className="text-sm text-center font-mono">
                  {shipments.filter(s => s.status === 'pronto').length} etiqueta(s) pendente(s)
                </p>
              </div>
              <DialogFooter>
                <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                <Button onClick={handlePrintLabels} className="w-full sm:w-auto bg-primary text-[#0A0A0A]"><Printer className="w-4 h-4 mr-2"/> Confirmar Impressão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger className={buttonVariants({ className: 'bg-primary text-[#0A0A0A] hover:bg-primary/80' })}>
              <Plus className="w-4 h-4 mr-2"/> Novo Pedido
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Novo Pedido</DialogTitle>
                <DialogDescription>
                  Crie um pedido e reserve no estoque.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { handleCreateOrder(e); }} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <select 
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value})}
                  >
                    <option value="" disabled>Selecione um cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produto</label>
                  <select 
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newOrder.productId}
                    onChange={(e) => setNewOrder({...newOrder, productId: e.target.value})}
                  >
                    <option value="" disabled>Selecione um produto...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)}) - [{p.stock} un]</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input 
                    required
                    type="number" min="1" 
                    value={newOrder.quantity} 
                    onChange={e => setNewOrder({...newOrder, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Envio</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newOrder.method}
                    onChange={(e) => setNewOrder({...newOrder, method: e.target.value})}
                  >
                    <option value="Correios - PAC">Correios - PAC</option>
                    <option value="Correios - Sedex">Correios - Sedex</option>
                    <option value="Jadlog">Jadlog</option>
                    <option value="Motoboy">Motoboy</option>
                    <option value="Retirada">Retirada</option>
                  </select>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Criar Pedido</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
          <div>
            <CardTitle>Histórico de Postagens</CardTitle>
            <CardDescription>Acompanhe todos os seus envios em um só lugar.</CardDescription>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar pedido ou rastreio..." 
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
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rastreio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">#{shipment.id}</TableCell>
                  <TableCell>{getCustomerName(shipment.customerId)}</TableCell>
                  <TableCell>{shipment.date}</TableCell>
                  <TableCell>{shipment.method}</TableCell>
                  <TableCell>{renderStatusBadge(shipment.status)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {shipment.tracking || 'Pendente'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
                        <span className="sr-only">Abrir pedido</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-secondary border-border text-foreground">
                        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Pedido #{shipment.id}</div>
                        <DropdownMenuItem className="focus:bg-border cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Editar Endereço/Rastreio</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.preventDefault(); setTimeout(() => window.print(), 100); }} className="focus:bg-border cursor-pointer"><FileText className="w-4 h-4 mr-2" /> Imprimir Declaração</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.preventDefault(); setTimeout(() => window.print(), 100); }} className="focus:bg-border cursor-pointer"><Tag className="w-4 h-4 mr-2" /> Imprimir Etiqueta</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {shipment.status === 'preparando' && <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'pronto')} className="focus:bg-border cursor-pointer"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Marcar Pronto p/ Envio</DropdownMenuItem>}
                        {shipment.status === 'pronto' && <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'enviado')} className="focus:bg-border cursor-pointer"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Marcar como Enviado</DropdownMenuItem>}
                        {shipment.status === 'enviado' && <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'entregue')} className="focus:bg-border cursor-pointer"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Marcar como Entregue</DropdownMenuItem>}
                        {shipment.status !== 'cancelado' && <DropdownMenuItem onClick={() => handleStatusChange(shipment.id, 'cancelado')} className="focus:bg-border text-red-400 cursor-pointer"><Ban className="w-4 h-4 mr-2" /> Cancelar Envio</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary border-none shadow-none">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg">Em Preparação</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-4xl font-light text-primary">{shipments.filter(s => s.status === 'preparando').length}</p>
             <p className="text-sm text-muted-foreground mt-2">Pedidos aguardando embalagem e etiqueta.</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-none shadow-none">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg">Pronto para Envio</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-4xl font-light text-primary">{shipments.filter(s => s.status === 'pronto').length}</p>
             <p className="text-sm text-muted-foreground mt-2">Prontos para despachar nos correios/transportadora.</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-none shadow-none">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg">Em Trânsito</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-4xl font-light text-primary">{shipments.filter(s => s.status === 'enviado').length}</p>
             <p className="text-sm text-muted-foreground mt-2">Aguardando entrega final ao cliente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
