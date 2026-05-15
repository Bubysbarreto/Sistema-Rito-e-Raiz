import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, KeyRound, Edit, Database, Download, Ticket, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'Painel Geral' },
  { id: 'sales', label: 'Vendas' },
  { id: 'crm', label: 'CRM / Clientes' },
  { id: 'spells', label: 'Magias & Tratamentos' },
  { id: 'inventory', label: 'Estoque' },
  { id: 'calendar', label: 'Calendário' },
  { id: 'shipping', label: 'Envios' },
];

function CouponManager() {
  const { coupons, setCoupons, customers } = useAppContext();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', type: 'percent', value: 0, 
    startDate: '', endDate: '', isLifetime: false, customerId: '' 
  });

  const handleOpenEdit = (coupon: any) => {
    setEditingCouponId(coupon.id);
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      startDate: coupon.startDate || '',
      endDate: coupon.endDate || '',
      isLifetime: coupon.isLifetime || false,
      customerId: coupon.customerId || ''
    });
    setIsAddOpen(true);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCoupon.code && newCoupon.value > 0) {
      if (editingCouponId) {
        setCoupons(coupons.map((c: any) => c.id === editingCouponId ? {
          ...c,
          code: newCoupon.code.toUpperCase(), 
          type: newCoupon.type, 
          value: newCoupon.value, 
          startDate: newCoupon.startDate,
          endDate: newCoupon.isLifetime ? null : newCoupon.endDate,
          isLifetime: newCoupon.isLifetime,
          customerId: newCoupon.customerId || null
        } : c));
      } else {
        setCoupons([...coupons, { 
          id: Math.random().toString(), 
          code: newCoupon.code.toUpperCase(), 
          type: newCoupon.type, 
          value: newCoupon.value, 
          active: true,
          startDate: newCoupon.startDate,
          endDate: newCoupon.isLifetime ? null : newCoupon.endDate,
          isLifetime: newCoupon.isLifetime,
          customerId: newCoupon.customerId || null
        }]);
      }
      setNewCoupon({ code: '', type: 'percent', value: 0, startDate: '', endDate: '', isLifetime: false, customerId: '' });
      setIsAddOpen(false);
      setEditingCouponId(null);
    }
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c: any) => c.id !== id));
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map((c: any) => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5" /> Cupons de Desconto</CardTitle>
          <CardDescription>Cadastre cupons para uso no Caixa/PDV.</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingCouponId(null);
            setNewCoupon({ code: '', type: 'percent', value: 0, startDate: '', endDate: '', isLifetime: false, customerId: '' });
          }
        }}>
          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="w-4 h-4 mr-2" /> Novo
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCouponId ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCoupon} className="space-y-4">
               <div>
                  <label className="text-sm font-medium">Código do Cupom</label>
                  <Input required placeholder="Ex: PRIMAVEIRA20" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})}>
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor</label>
                    <Input required type="number" min="0" step="0.01" value={newCoupon.value || ''} onChange={(e) => setNewCoupon({...newCoupon, value: parseFloat(e.target.value) || 0})} />
                  </div>
               </div>

               <div className="flex items-center space-x-2">
                 <input type="checkbox" id="isLifetime" checked={newCoupon.isLifetime} onChange={e => setNewCoupon({...newCoupon, isLifetime: e.target.checked})} className="rounded border-gray-300" />
                 <label htmlFor="isLifetime" className="text-sm font-medium">Cupom Vitalício (Sem validade)</label>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Início</label>
                    <Input required={!newCoupon.isLifetime} type="date" value={newCoupon.startDate || ''} onChange={e => setNewCoupon({...newCoupon, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fim</label>
                    <Input required={!newCoupon.isLifetime} disabled={newCoupon.isLifetime} type="date" value={newCoupon.endDate || ''} onChange={e => setNewCoupon({...newCoupon, endDate: e.target.value})} />
                  </div>
               </div>

               <div>
                 <label className="text-sm font-medium">Vincular a um Cliente Específico (Opcional, Ex: Cartão Presente)</label>
                 <select className="flex h-10 w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newCoupon.customerId || ''} onChange={e => setNewCoupon({...newCoupon, customerId: e.target.value})}>
                    <option value="">Qualquer Cliente</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
               </div>

               <DialogFooter>
                 <Button variant="outline" type="button" onClick={() => {
                   setIsAddOpen(false);
                   setEditingCouponId(null);
                   setNewCoupon({ code: '', type: 'percent', value: 0, startDate: '', endDate: '', isLifetime: false, customerId: '' });
                 }}>Cancelar</Button>
                 <Button type="submit">{editingCouponId ? 'Atualizar' : 'Salvar'} Cupom</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {coupons?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-primary">{c.code}</TableCell>
                  <TableCell>{c.type === 'percent' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {c.isLifetime ? (
                      <span className="text-emerald-600 font-medium tracking-wide">Vitalício</span>
                    ) : (
                      `${c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '-'} até ${c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '-'}`
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.customerId ? customers.find(cust => cust.id === c.customerId)?.name || 'Cliente excluído' : 'Todos'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "secondary"} className={`cursor-pointer ${c.active ? 'bg-emerald-500' : ''}`} onClick={() => toggleCouponStatus(c.id)}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenEdit(c)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteCoupon(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum cupom cadastrado.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ConfigCentral() {
  const { user, usersList, createUser, deleteUser, updateUser } = useAuth();
  const { customers, sales } = useAppContext();
  
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', username: '', role: 'user', permissions: ['dashboard'] as string[] });
  const [isNewUserDialog, setIsNewUserDialog] = useState(false);

  const [editingUser, setEditingUser] = useState<any | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length > 0 && user) {
      updateUser(user.id, { password: newPassword });
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.username) {
      createUser(newUser.name, newUser.username, newUser.role, newUser.permissions);
      setIsNewUserDialog(false);
      setNewUser({ name: '', username: '', role: 'user', permissions: ['dashboard'] });
    }
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: editingUser.name,
        username: editingUser.username,
        role: editingUser.role,
        permissions: editingUser.permissions,
        password: editingUser.password
      });
      setEditingUser(null);
    }
  };

  const togglePermission = (permId: string, stateObj: any, setStateFn: any) => {
    if (stateObj.permissions.includes(permId)) {
      setStateFn({ ...stateObj, permissions: stateObj.permissions.filter((p: string) => p !== permId) });
    } else {
      setStateFn({ ...stateObj, permissions: [...stateObj.permissions, permId] });
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, val) => val === undefined ? '' : val)).join(';'))
    ].join('\n');

    // Add BOM (Byte Order Mark) for UTF-8 so Excel recognizes accents correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFullBackup = () => {
    const backupData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('erp_')) {
            backupData[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_sistema_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            for (const key in data) {
                if (key.startsWith('erp_')) {
                    localStorage.setItem(key, data[key]);
                }
            }
            alert('Backup restaurado com sucesso! O sistema será recarregado.');
            window.location.reload();
        } catch (error) {
            alert('Erro ao importar o arquivo. Verifique se é um arquivo de backup válido.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-serif text-primary">Central de Configuração</h2>
        <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema e credenciais de acesso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" /> Banco de Dados & Uso Offline</CardTitle>
            <CardDescription>
              O sistema roda de forma <strong>offline</strong> na sua máquina através do navegador.
              Ele guarda as informações no "cache" (localStorage). Se você acessar usando o mesmo navegador, os dados estarão lá.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="pb-4">
              <h3 className="font-semibold text-sm mb-2 text-primary">Migrar de PC (Backup JSON)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Vai trocar de máquina ou limpar o cache? Baixe o backup completo para não perder nada e depois importe no outro computador.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={exportFullBackup} className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Baixar Backup
                </Button>
                <div className="relative w-full">
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportBackup} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="import-backup"
                  />
                  <Button variant="outline" className="w-full pointer-events-none border-primary text-primary">
                    <UserPlus className="w-4 h-4 mr-2" /> Importar Backup
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="font-semibold text-sm mb-2">Exportar para o Excel (CSV)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="w-full justify-start text-left text-xs" onClick={() => exportToCSV(customers, 'clientes_base')}>
                  <Download className="w-4 h-4 mr-2" /> Pacientes
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-xs" onClick={() => exportToCSV(sales, 'vendas_fluxo_caixa')}>
                  <Download className="w-4 h-4 mr-2" /> Caixa Mensal
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> Alterar Minha Senha</CardTitle>
            <CardDescription>Esta senha é usada para o seu acesso pessoal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Nova Senha" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Atualizar Minha Senha</Button>
              {passwordSuccess && (
                <p className="text-sm text-emerald-500 text-center">Senha atualizada com sucesso!</p>
              )}
            </form>
          </CardContent>
        </Card>

        <CouponManager />


        {user?.role === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Usuários</CardTitle>
                <CardDescription>Gerencie quem tem acesso ao sistema (exclusivo para Admin).</CardDescription>
              </div>
              
              <Dialog open={isNewUserDialog} onOpenChange={setIsNewUserDialog}>
                <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <UserPlus className="w-4 h-4 mr-2" /> Novo Usuário
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4 my-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ex: Ana Souza" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome de Usuário (Login)</label>
                      <Input required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="Ex: ana.souza" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nível de Acesso (Papel)</label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                      >
                        <option value="admin">Administrador (Total)</option>
                        <option value="user">Atendente (Limitado)</option>
                      </select>
                    </div>
                    {newUser.role === 'user' && (
                      <div className="space-y-2 border p-3 rounded-md">
                        <label className="text-sm font-medium mb-2 block">Permissões de Acesso</label>
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_PERMISSIONS.map(perm => (
                            <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                checked={newUser.permissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id, newUser, setNewUser)}
                              />
                              {perm.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <DialogFooter className="mt-4">
                      <DialogClose type="button" className={buttonVariants({ variant: "outline" })}>
                        Cancelar
                      </DialogClose>
                      <Button type="submit">Criar Usuário (Senha Padrão: 123)</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{u.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={u.role === 'admin' ? 'border-primary text-primary' : 'text-muted-foreground'}>
                          {u.role === 'admin' ? 'Admin' : 'Atendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingUser({ ...u })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteUser(u.id)}
                          disabled={usersList.length <= 1 || u.id === user?.id} // Don't delete themselves or last user
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Modifique perfil e permissões</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input required value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome de Usuário (Login)</label>
                <Input required value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Redefinir Senha</label>
                <Input type="text" placeholder="Deixe em branco para não alterar" onChange={e => {
                  if(e.target.value) setEditingUser({...editingUser, password: e.target.value})
                  else {
                    const {password, ...rest} = editingUser;
                    setEditingUser(rest);
                  }
                }} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Acesso (Papel)</label>
                <select 
                  disabled={editingUser.id === user?.id}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                  value={editingUser.role}
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="admin">Administrador (Total)</option>
                  <option value="user">Atendente (Limitado)</option>
                </select>
              </div>
              {editingUser.role === 'user' && (
                <div className="space-y-2 border p-3 rounded-md">
                  <label className="text-sm font-medium mb-2 block">Permissões de Acesso</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                          checked={editingUser.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id, editingUser, setEditingUser)}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter className="mt-4">
                <DialogClose type="button" className={buttonVariants({ variant: "outline" })}>Cancelar</DialogClose>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
