import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Sparkles, MoreHorizontal, Edit, Trash2, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from '../context/AppContext';

export function SpellsCatalog() {
  const { spells, setSpells, magicItems, shoppingList, setShoppingList } = useAppContext();
  const [search, setSearch] = useState('');
  
  const [newSpell, setNewSpell] = useState({ name: '', category: 'Magia', type: 'Magia Branca', customType: '', description: '', price: 0, requiredItems: '', wordsOfPower: '' });
  const [editSpellId, setEditSpellId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<any | null>(null);

  const handleCreateSpell = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = newSpell.type === 'Outros' && newSpell.customType ? newSpell.customType : newSpell.type;
    const newEntry = {
      id: Math.floor(10 + Math.random() * 90).toString(),
      name: newSpell.name,
      category: newSpell.category,
      type: finalType,
      description: newSpell.description,
      price: newSpell.price,
      requiredItems: newSpell.requiredItems ? newSpell.requiredItems.split(',').map(i => i.trim()) : [],
      wordsOfPower: newSpell.wordsOfPower,
    };
    setSpells([newEntry, ...spells]);
    setNewSpell({ name: '', category: 'Magia', type: 'Magia Branca', customType: '', description: '', price: 0, requiredItems: '', wordsOfPower: '' });
  };

  const handleEditSpell = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSpellId) {
      const finalType = newSpell.type === 'Outros' && newSpell.customType ? newSpell.customType : newSpell.type;
      setSpells(spells.map(s => s.id === editSpellId ? {
        ...s,
        name: newSpell.name,
        category: newSpell.category,
        type: finalType,
        description: newSpell.description,
        price: newSpell.price,
        requiredItems: newSpell.requiredItems ? newSpell.requiredItems.split(',').map(i => i.trim()) : [],
        wordsOfPower: newSpell.wordsOfPower,
      } : s));
      setIsEditDialogOpen(false);
      setNewSpell({ name: '', category: 'Magia', type: 'Magia Branca', customType: '', description: '', price: 0, requiredItems: '', wordsOfPower: '' });
    }
  };

  const openEditDialog = (e: React.MouseEvent, spell: any) => {
    e.stopPropagation();
    setEditSpellId(spell.id);
    setNewSpell({
      name: spell.name,
      category: spell.category || 'Magia',
      type: spell.type,
      description: spell.description,
      price: spell.price,
      requiredItems: spell.requiredItems ? spell.requiredItems.join(', ') : '',
      wordsOfPower: spell.wordsOfPower || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (spell: any) => {
    setSelectedSpell(spell);
  };

  const checkInventoryStatus = (itemName: string) => {
    const norm = itemName.toLowerCase().trim();
    let match = magicItems.find(mi => mi.name.toLowerCase().includes(norm) || norm.includes(mi.name.toLowerCase()));
    
    if (!match) {
      const words = norm.split(' ').filter(w => w.length >= 4); // match words like vela, moedas
      if (words.length > 0) {
        match = magicItems.find(mi => words.some(w => mi.name.toLowerCase().includes(w)));
      }
    }

    if (match) {
      return match.stock > 0 ? { status: 'estoque', item: match } : { status: 'falta', item: match };
    }
    return { status: 'comprar', item: null };
  };

  const handleAddToShoppingList = (itemName: string) => {
    if (!shoppingList.includes(itemName)) {
      setShoppingList([...shoppingList, itemName]);
    }
  };

  const renderMagicTable = (categoryFilter: string) => {
    const list = spells.filter(s => 
      (s.category === categoryFilter || (!s.category && categoryFilter === 'Magia')) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()))
    );

    const isMagia = categoryFilter === 'Magia';

    return (
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Itens / Materiais</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((spell) => (
              <TableRow key={spell.id} onClick={() => openDetailsDialog(spell)} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium max-w-[200px]">
                  {spell.name}
                  <div className="text-xs text-muted-foreground line-clamp-3 whitespace-normal mt-1">{spell.description}</div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="font-normal">{spell.type}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                  <div className="line-clamp-3 whitespace-normal">
                    {spell.requiredItems ? spell.requiredItems.join(', ') : '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">R$ {spell.price.toFixed(2).replace('.', ',')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSpells(spells.filter(s => s.id !== spell.id)); }} className="h-8 w-8 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">Catálogo de Magias e Serviços</h2>
          <p className="text-muted-foreground">Registre os trabalhos místicos, oráculos e serviços holísticos.</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger className={buttonVariants({ className: 'bg-primary text-[#0A0A0A] hover:bg-primary/80' })}>
              <Sparkles className="w-4 h-4 mr-2"/> Novo Serviço
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Serviço ou Magia</DialogTitle>
                <DialogDescription>
                  Adicione um novo trabalho místico ou serviço holístico.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSpell} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Trabalho/Serviço</label>
                  <Input required placeholder="Ex: Adoçamento Amoroso / Leitura de Tarot" value={newSpell.name} onChange={e => setNewSpell({...newSpell, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newSpell.category}
                      onChange={(e) => setNewSpell({...newSpell, category: e.target.value, type: e.target.value === 'Serviço Holístico' ? 'Oráculo' : 'Magia Branca'})}
                    >
                      <option value="Magia">Magia / Trabalho</option>
                      <option value="Serviço Holístico">Serviço Holístico / Oráculo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newSpell.type}
                      onChange={(e) => setNewSpell({...newSpell, type: e.target.value})}
                    >
                      {newSpell.category === 'Magia' ? (
                        <>
                          <option value="Magia Branca">Magia Branca</option>
                          <option value="Magia de Amor">Magia de Amor</option>
                          <option value="Descarrego">Descarrego</option>
                          <option value="Abertura de Caminhos">Abertura de Caminhos</option>
                          <option value="Magia Negra">Magia Negra</option>
                          <option value="Outros">Outros</option>
                        </>
                      ) : (
                        <>
                          <option value="Oráculo">Oráculo (Tarot, Baralho, Runas)</option>
                          <option value="Terapia de Energia">Terapia de Energia (Reiki, Passes)</option>
                          <option value="Terapia Holística">Terapia Holística</option>
                          <option value="Outros">Outros</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                {newSpell.type === 'Outros' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium border-l-2 border-primary pl-2">Especificar Tipo</label>
                    <Input required placeholder="Ex: Magia Elemental" value={newSpell.customType} onChange={e => setNewSpell({...newSpell, customType: e.target.value})} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input required type="number" min="0" step="0.01" value={newSpell.price} onChange={e => setNewSpell({...newSpell, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea required placeholder="Breve descrição" value={newSpell.description} onChange={e => setNewSpell({...newSpell, description: e.target.value})} />
                </div>
                
                {newSpell.category === 'Magia' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Itens Necessários (separados por vírgula)</label>
                      <Input placeholder="Ex: Vela 7 Dias, Mel, Rosas" value={newSpell.requiredItems} onChange={e => setNewSpell({...newSpell, requiredItems: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-amber-500 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Palavras de Poder / Encantamento</label>
                      <Textarea placeholder="Insira o texto do encantamento ou palavras de poder para este rito..." className="font-serif italic border-amber-500/20 bg-amber-500/5 focus-visible:ring-amber-500/30" value={newSpell.wordsOfPower} onChange={e => setNewSpell({...newSpell, wordsOfPower: e.target.value})} />
                    </div>
                  </>
                )}

                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Serviço</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="magias" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="magias">Magias & Ritos</TabsTrigger>
            <TabsTrigger value="holisticos">Serviços Holísticos & Oráculos</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 w-[250px] sm:w-[300px]">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="w-full" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="magias" className="mt-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Grimório de Magias</CardTitle>
              <CardDescription>Trabalhos práticos, ritos, banhos e feitiços cadastrados.</CardDescription>
            </CardHeader>
            {renderMagicTable('Magia')}
          </Card>
        </TabsContent>

        <TabsContent value="holisticos" className="mt-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Terapias e Oráculos</CardTitle>
              <CardDescription>Catálogo de consultas de Tarot, Reiki, e terapias holísticas oferecidas ao público.</CardDescription>
            </CardHeader>
            {renderMagicTable('Serviço Holístico')}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedSpell} onOpenChange={(open) => !open && setSelectedSpell(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic">{selectedSpell?.name}</DialogTitle>
            <DialogDescription>{selectedSpell?.description}</DialogDescription>
          </DialogHeader>
          {selectedSpell && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo de Serviço:</span>
                <Badge variant="outline">{selectedSpell.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor Cobrado:</span>
                <span className="font-semibold text-primary">R$ {selectedSpell.price.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {selectedSpell.requiredItems && selectedSpell.requiredItems.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-sm mb-3">Itens Necessários (Estoque)</h4>
                  <ul className="space-y-3">
                    {selectedSpell.requiredItems.map((reqItem: string, idx: number) => {
                      const inv = checkInventoryStatus(reqItem);
                      return (
                        <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                          <span className="font-medium">{reqItem}</span>
                          {inv.status === 'estoque' && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Em Estoque ({inv.item?.stock} {inv.item?.unit})
                            </Badge>
                          )}
                          {inv.status === 'falta' && (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Faltando ({inv.item?.stock} no estoque)
                            </Badge>
                          )}
                          {inv.status === 'comprar' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Comprar
                              </Badge>
                              {shoppingList.includes(reqItem) ? (
                                <Button size="sm" variant="secondary" className="h-6 text-xs px-2 pointer-events-none text-muted-foreground" disabled>
                                  Adicionado
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleAddToShoppingList(reqItem)}>
                                  <ShoppingCart className="w-3 h-3 mr-1" /> Lista
                                </Button>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {selectedSpell.wordsOfPower && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-sm mb-3 text-amber-500 flex items-center gap-1"><Sparkles className="w-4 h-4"/> Palavras de Poder</h4>
                  <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 text-foreground font-serif italic whitespace-pre-wrap">
                    "{selectedSpell.wordsOfPower}"
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            {selectedSpell?.category === 'Magia' && (
              <Button variant="outline" onClick={(e) => { setSelectedSpell(null); openEditDialog(e as any, selectedSpell); }} className="w-full sm:w-1/2">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            )}
            <Button onClick={() => setSelectedSpell(null)} className={`w-full ${selectedSpell?.category === 'Magia' ? 'sm:w-1/2' : ''} bg-primary text-[#0A0A0A] hover:bg-primary/80`}>
              Fechar Detalhes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Serviço / Magia</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do trabalho ou serviço.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSpell} className="space-y-4 my-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Trabalho/Serviço</label>
              <Input required placeholder="Ex: Adoçamento Amoroso" value={newSpell.name} onChange={e => setNewSpell({...newSpell, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={newSpell.category}
                  onChange={(e) => setNewSpell({...newSpell, category: e.target.value, type: e.target.value === 'Serviço Holístico' ? 'Oráculo' : 'Magia Branca'})}
                >
                  <option value="Magia">Magia / Trabalho</option>
                  <option value="Serviço Holístico">Serviço Holístico / Oráculo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={newSpell.type}
                  onChange={(e) => setNewSpell({...newSpell, type: e.target.value})}
                >
                  {newSpell.category === 'Magia' ? (
                    <>
                      <option value="Magia Branca">Magia Branca</option>
                      <option value="Magia de Amor">Magia de Amor</option>
                      <option value="Descarrego">Descarrego</option>
                      <option value="Abertura de Caminhos">Abertura de Caminhos</option>
                      <option value="Magia Negra">Magia Negra</option>
                      <option value="Outros">Outros</option>
                    </>
                  ) : (
                    <>
                      <option value="Oráculo">Oráculo (Tarot, Baralho, Runas)</option>
                      <option value="Terapia de Energia">Terapia de Energia (Reiki, Passes)</option>
                      <option value="Terapia Holística">Terapia Holística</option>
                      <option value="Outros">Outros</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            {newSpell.type === 'Outros' && (
              <div className="space-y-2">
                <label className="text-sm font-medium border-l-2 border-primary pl-2">Especificar Tipo</label>
                <Input required placeholder="Ex: Magia Elemental" value={newSpell.customType} onChange={e => setNewSpell({...newSpell, customType: e.target.value})} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input required type="number" min="0" step="0.01" value={newSpell.price} onChange={e => setNewSpell({...newSpell, price: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea required placeholder="Breve descrição" value={newSpell.description} onChange={e => setNewSpell({...newSpell, description: e.target.value})} />
            </div>
            
            {newSpell.category === 'Magia' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Itens Necessários (separados por vírgula)</label>
                  <Input placeholder="Ex: Vela 7 Dias, Mel, Rosas" value={newSpell.requiredItems} onChange={e => setNewSpell({...newSpell, requiredItems: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-500 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Palavras de Poder / Encantamento</label>
                  <Textarea placeholder="Insira o texto do encantamento..." className="font-serif italic border-amber-500/20 bg-amber-500/5 focus-visible:ring-amber-500/30" value={newSpell.wordsOfPower} onChange={e => setNewSpell({...newSpell, wordsOfPower: e.target.value})} />
                </div>
              </>
            )}

            <DialogFooter className="mt-4">
              <DialogClose onClick={() => setIsEditDialogOpen(false)} className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
              <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
