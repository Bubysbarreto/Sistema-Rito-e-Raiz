import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, MoreHorizontal, History } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from '../context/AppContext';

export function Inventory() {
  const { products, setProducts, materials, setMaterials, magicItems, setMagicItems, shoppingList, setShoppingList, inventoryTransactions, setInventoryTransactions } = useAppContext();
  const [search, setSearch] = useState('');
  
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'Clássicas', stock: 0, price: 0, weight: 0, dimensions: '', imageUrl: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', type: 'Ervas/Sais', stock: 0, unit: 'Kg', minStock: 0 });
  const [newMagicItem, setNewMagicItem] = useState({ name: '', type: 'Velas', stock: 0, unit: 'un', minStock: 0 });

  const [editProductContent, setEditProductContent] = useState<any>(null);
  const [editMaterialContent, setEditMaterialContent] = useState<any>(null);
  const [editMagicItemContent, setEditMagicItemContent] = useState<any>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null);

  const [isEditProductDialog, setIsEditProductDialog] = useState(false);
  const [isEditMaterialDialog, setIsEditMaterialDialog] = useState(false);
  const [isEditMagicItemDialog, setIsEditMagicItemDialog] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  const [buyDialog, setBuyDialog] = useState(false);
  const [buyItemData, setBuyItemData] = useState({ name: '', index: -1, quantity: 1, targetTab: 'magicItems', type: 'Velas', unit: 'un', minStock: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create object URL for local display
      const url = URL.createObjectURL(file);
      if (isEdit && editProductContent) {
        setEditProductContent({ ...editProductContent, imageUrl: url });
      } else {
        setNewProduct({ ...newProduct, imageUrl: url });
      }
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: Math.floor(10 + Math.random() * 90).toString(),
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      stock: newProduct.stock,
      maxStock: 100,
      price: newProduct.price,
      weight: newProduct.weight,
      dimensions: newProduct.dimensions,
      imageUrl: newProduct.imageUrl,
      status: newProduct.stock < 10 ? 'baixo' : 'normal'
    };
    setProducts([newEntry, ...products]);
    if (newProduct.stock > 0) {
      setInventoryTransactions((prev: any[]) => [{
        id: Math.random().toString(), date: new Date().toISOString(), itemName: newProduct.name, type: 'Entrada', quantity: newProduct.stock, reason: 'Cadastro Inicial'
      }, ...prev]);
    }
    setNewProduct({ name: '', sku: '', category: 'Clássicas', stock: 0, price: 0, weight: 0, dimensions: '', imageUrl: '' });
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const status = newMaterial.stock <= newMaterial.minStock ? 'baixo' : 'normal';
    const newEntry = {
      id: Math.floor(100 + Math.random() * 900).toString(),
      name: newMaterial.name,
      type: newMaterial.type,
      stock: newMaterial.stock,
      unit: newMaterial.unit,
      minStock: newMaterial.minStock,
      status: status
    };
    setMaterials([newEntry, ...materials]);
    if (newMaterial.stock > 0) {
      setInventoryTransactions((prev: any[]) => [{
        id: Math.random().toString(), date: new Date().toISOString(), itemName: newMaterial.name, type: 'Entrada', quantity: newMaterial.stock, reason: 'Cadastro Inicial'
      }, ...prev]);
    }
    setNewMaterial({ name: '', type: 'Ervas/Sais', stock: 0, unit: 'Kg', minStock: 0 });
  };

  const handleCreateMagicItem = (e: React.FormEvent) => {
    e.preventDefault();
    const status = newMagicItem.stock <= newMagicItem.minStock ? 'baixo' : 'normal';
    const newEntry = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      name: newMagicItem.name,
      type: newMagicItem.type,
      stock: newMagicItem.stock,
      unit: newMagicItem.unit,
      minStock: newMagicItem.minStock,
      status: status
    };
    setMagicItems([newEntry, ...magicItems]);
    if (newMagicItem.stock > 0) {
      setInventoryTransactions((prev: any[]) => [{
        id: Math.random().toString(), date: new Date().toISOString(), itemName: newMagicItem.name, type: 'Entrada', quantity: newMagicItem.stock, reason: 'Cadastro Inicial'
      }, ...prev]);
    }
    setNewMagicItem({ name: '', type: 'Velas', stock: 0, unit: 'un', minStock: 0 });
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProductContent) {
      const originalInfo = products.find((p: any) => p.id === editProductContent.id);
      if (originalInfo && originalInfo.stock !== editProductContent.stock) {
         const diff = editProductContent.stock - originalInfo.stock;
         setInventoryTransactions((prev: any[]) => [{
            id: Math.random().toString(), date: new Date().toISOString(), itemName: editProductContent.name, type: diff > 0 ? 'Entrada' : 'Saída', quantity: Math.abs(diff), reason: 'Ajuste Manual'
         }, ...prev]);
      }
      const status = editProductContent.stock === 0 ? 'esgotado' : editProductContent.stock <= 10 ? 'baixo' : 'normal';
      setProducts(products.map((p: any) => p.id === editProductContent.id ? { ...editProductContent, status } : p));
      setIsEditProductDialog(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p: any) => p.id !== id));
  };

  const handleEditMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMaterialContent) {
      const originalInfo = materials.find((m: any) => m.id === editMaterialContent.id);
      if (originalInfo && originalInfo.stock !== editMaterialContent.stock) {
         const diff = editMaterialContent.stock - originalInfo.stock;
         setInventoryTransactions((prev: any[]) => [{
            id: Math.random().toString(), date: new Date().toISOString(), itemName: editMaterialContent.name, type: diff > 0 ? 'Entrada' : 'Saída', quantity: Math.abs(diff), reason: 'Ajuste Manual'
         }, ...prev]);
      }
      const status = editMaterialContent.stock <= editMaterialContent.minStock ? 'baixo' : 'normal';
      setMaterials(materials.map((m: any) => m.id === editMaterialContent.id ? { ...editMaterialContent, status } : m));
      setIsEditMaterialDialog(false);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m: any) => m.id !== id));
  };

  const handleEditMagicItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMagicItemContent) {
      const originalInfo = magicItems.find((m: any) => m.id === editMagicItemContent.id);
      if (originalInfo && originalInfo.stock !== editMagicItemContent.stock) {
         const diff = editMagicItemContent.stock - originalInfo.stock;
         setInventoryTransactions((prev: any[]) => [{
            id: Math.random().toString(), date: new Date().toISOString(), itemName: editMagicItemContent.name, type: diff > 0 ? 'Entrada' : 'Saída', quantity: Math.abs(diff), reason: 'Ajuste Manual'
         }, ...prev]);
      }
      const status = editMagicItemContent.stock <= editMagicItemContent.minStock ? 'baixo' : 'normal';
      setMagicItems(magicItems.map((m: any) => m.id === editMagicItemContent.id ? { ...editMagicItemContent, status } : m));
      setIsEditMagicItemDialog(false);
    }
  };

  const handleBuyItem = (e: React.FormEvent) => {
     e.preventDefault();
     setShoppingList(shoppingList.filter((_, idx) => idx !== buyItemData.index));

     const status = buyItemData.quantity <= buyItemData.minStock ? 'baixo' : 'normal';

     if (buyItemData.targetTab === 'materials') {
        const newEntry = {
          id: Math.floor(100 + Math.random() * 900).toString(),
          name: buyItemData.name,
          type: buyItemData.type,
          stock: buyItemData.quantity,
          unit: buyItemData.unit,
          minStock: buyItemData.minStock,
          status: status
        };
        setMaterials([newEntry, ...materials]);
     } else if (buyItemData.targetTab === 'magicItems') {
        const newEntry = {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          name: buyItemData.name,
          type: buyItemData.type,
          stock: buyItemData.quantity,
          unit: buyItemData.unit,
          minStock: buyItemData.minStock,
          status: status
        };
        setMagicItems([newEntry, ...magicItems]);
     }

     setInventoryTransactions((prev: any[]) => [{
        id: Math.random().toString(),
        date: new Date().toISOString(),
        itemName: buyItemData.name,
        type: 'Entrada',
        quantity: buyItemData.quantity,
        reason: 'Compra (Lista de Compras)'
     }, ...prev]);
     
     setBuyDialog(false);
  };

  const handleDeleteMagicItem = (id: string) => {
    setMagicItems(magicItems.filter((m: any) => m.id !== id));
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Normal</Badge>;
      case 'baixo': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">Estoque Baixo</Badge>;
      case 'critico': return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Crítico</Badge>;
      case 'esgotado': return <Badge variant="destructive">Esgotado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">Armazenamento & Estoque</h2>
          <p className="text-muted-foreground">Gerencie seus produtos finalizados e matérias-primas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-[#0A0A0A]" onClick={() => setIsHistoryDialogOpen(true)}>
            <History className="w-4 h-4 mr-2" /> Histórico
          </Button>
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: 'outline', className: 'border-primary text-primary hover:bg-primary hover:text-[#0A0A0A]' })}>
              <Plus className="w-4 h-4 mr-2"/> Nova Matéria-prima
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Nova Matéria-prima</DialogTitle>
                <DialogDescription>
                  Adicione um novo insumo ao estoque.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMaterial} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input required placeholder="Ex: Cera de Palma" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newMaterial.type}
                      onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                    >
                      <option value="Cera">Cera</option>
                      <option value="Pavio">Pavio</option>
                      <option value="Essência">Essência</option>
                      <option value="Ervas/Sais">Ervas e Sais</option>
                      <option value="Embalagem">Embalagem</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unidade (ex: Kg, L, un)</label>
                    <Input required placeholder="Kg" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estoque Atual</label>
                    <Input required type="number" min="0" step="0.01" value={newMaterial.stock} onChange={e => setNewMaterial({...newMaterial, stock: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estoque Mínimo</label>
                    <Input required type="number" min="0" step="0.01" value={newMaterial.minStock} onChange={e => setNewMaterial({...newMaterial, minStock: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Matéria-prima</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger className={buttonVariants({ className: 'bg-primary text-[#0A0A0A] hover:bg-primary/80' })}>
              <Plus className="w-4 h-4 mr-2"/> Novo Produto
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Novo Produto</DialogTitle>
                <DialogDescription>
                  Adicione um novo produto finalizado ao estoque.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input required placeholder="Ex: Vela de Canela" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input required placeholder="VEL-CAN-005" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estoque (un)</label>
                    <Input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço (R$)</label>
                    <Input required type="number" min="0" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Peso (gramas) <span className="text-xs text-muted-foreground">(Opcional)</span></label>
                    <Input type="number" min="0" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medidas <span className="text-xs text-muted-foreground">(Opcional)</span></label>
                    <Input placeholder="Ex: 10x10" value={newProduct.dimensions} onChange={e => setNewProduct({...newProduct, dimensions: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto de Referência <span className="text-xs text-muted-foreground">(Opcional)</span></label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                  {newProduct.imageUrl && (
                    <div className="mt-2 w-full max-w-[150px] aspect-square rounded overflow-hidden border border-border">
                      <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-[#0A0A0A] hover:bg-primary/80">Salvar Produto</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: 'outline', className: 'border-[#7E7860] text-[#7E7860] hover:bg-[#7E7860] hover:text-white' })}>
              <Plus className="w-4 h-4 mr-2"/> Novo Item Mágico
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Novo Item Mágico</DialogTitle>
                <DialogDescription>
                  Adicione um novo recurso para as práticas mágicas.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMagicItem} className="space-y-4 my-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input required placeholder="Ex: Vela de 7 Dias Preta" value={newMagicItem.name} onChange={e => setNewMagicItem({...newMagicItem, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newMagicItem.type}
                      onChange={(e) => setNewMagicItem({...newMagicItem, type: e.target.value})}
                    >
                      <option value="Velas">Velas</option>
                      <option value="Cristais">Cristais</option>
                      <option value="Ervas/Especiarias">Ervas/Especiarias</option>
                      <option value="Oferendas">Oferendas (Moedas, etc)</option>
                      <option value="Insumos">Insumos (Carvão, Fitas)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unidade (ex: Kg, un, pct)</label>
                    <Input required placeholder="un" value={newMagicItem.unit} onChange={e => setNewMagicItem({...newMagicItem, unit: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estoque Atual</label>
                    <Input required type="number" min="0" step="1" value={newMagicItem.stock} onChange={e => setNewMagicItem({...newMagicItem, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estoque Mínimo</label>
                    <Input required type="number" min="0" step="1" value={newMagicItem.minStock} onChange={e => setNewMagicItem({...newMagicItem, minStock: parseInt(e.target.value)})} />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Salvar Item Mágico</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produtos Finais</TabsTrigger>
          <TabsTrigger value="materials">Matérias-Primas</TabsTrigger>
          <TabsTrigger value="magicItems">Itens de Magia</TabsTrigger>
          <TabsTrigger value="shoppingList">Lista de Compras</TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Pesquisar itens..." 
            className="md:w-[300px]" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <TabsContent value="products" className="m-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Catálogo de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome do Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        {product.stock} / {product.maxStock}
                        <div className="w-full bg-[#222] h-1.5 mt-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${product.status === 'baixo' ? 'bg-amber-500' : product.status === 'critico' ? 'bg-red-500' : product.status === 'esgotado' ? 'bg-transparent' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(100, (product.stock / product.maxStock) * 100)}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>R$ {product.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{renderStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditProductContent(product); setIsEditProductDialog(true); }} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="h-8 w-8 hover:text-destructive">
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
        </TabsContent>

        <TabsContent value="materials" className="m-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Insumos e Matérias-Primas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Material</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade Atual</TableHead>
                    <TableHead className="text-right">Estoque Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell className="font-medium">{mat.name}</TableCell>
                      <TableCell>{mat.type}</TableCell>
                      <TableCell className="text-right">{mat.stock} {mat.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{mat.minStock} {mat.unit}</TableCell>
                      <TableCell>{renderStatusBadge(mat.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditMaterialContent(mat); setIsEditMaterialDialog(true); }} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(mat.id)} className="h-8 w-8 hover:text-destructive">
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
        </TabsContent>

        <TabsContent value="magicItems" className="m-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Inventário Mágico</CardTitle>
              <CardDescription>Gerencie suas velas, cristais, insumos e recursos.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Recurso</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade Atual</TableHead>
                    <TableHead className="text-right">Estoque Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {magicItems.filter(mi => mi.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right">{item.stock} {item.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.minStock} {item.unit}</TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditMagicItemContent(item); setIsEditMagicItemDialog(true); }} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMagicItem(item.id)} className="h-8 w-8 hover:text-destructive">
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
        </TabsContent>

        <TabsContent value="shoppingList" className="m-0">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Lista de Compras</CardTitle>
              <CardDescription>Itens necessários para repor o estoque de magias.</CardDescription>
            </CardHeader>
            <CardContent>
              {shoppingList && shoppingList.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {shoppingList.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/20">
                      <span className="font-medium">{item}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          onClick={() => {
                             setBuyItemData({ name: item, index, quantity: 1, targetTab: 'magicItems', type: 'Velas', unit: 'un', minStock: 0 });
                             setBuyDialog(true);
                          }}
                        >
                          Adicionar Estoque
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setShoppingList(shoppingList.filter((_, i) => i !== index));
                          }}
                        >
                         <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Sua lista de compras está vazia.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      <Dialog open={isEditProductDialog} onOpenChange={setIsEditProductDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-primary">Editar Produto</DialogTitle>
          </DialogHeader>
          {editProductContent && (
            <form onSubmit={handleEditProduct} className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Produto</label>
                  <Input required value={editProductContent.name} onChange={e => setEditProductContent({...editProductContent, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU / Código</label>
                  <Input required value={editProductContent.sku} onChange={e => setEditProductContent({...editProductContent, sku: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={editProductContent.category}
                  onChange={(e) => setEditProductContent({...editProductContent, category: e.target.value})}
                >
                  <option value="Clássicas">Clássicas</option>
                  <option value="Aromáticas">Aromáticas</option>
                  <option value="Esotéricas">Esotéricas</option>
                  <option value="Kits">Kits e Cestas</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade em Estoque</label>
                  <Input required type="number" min="0" value={editProductContent.stock} onChange={e => setEditProductContent({...editProductContent, stock: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço (R$)</label>
                  <Input required type="number" min="0" step="0.01" value={editProductContent.price} onChange={e => setEditProductContent({...editProductContent, price: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Peso (gramas)</label>
                  <Input type="number" min="0" value={editProductContent.weight || 0} onChange={e => setEditProductContent({...editProductContent, weight: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medidas</label>
                  <Input placeholder="Ex: 10x10" value={editProductContent.dimensions || ''} onChange={e => setEditProductContent({...editProductContent, dimensions: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Anexar Nova Foto</label>
                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                {editProductContent.imageUrl && (
                  <div className="mt-2 w-full max-w-[150px] aspect-square rounded overflow-hidden border border-border">
                    <img src={editProductContent.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditProductDialog(false)}>Cancelar</Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMaterialDialog} onOpenChange={setIsEditMaterialDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-primary">Editar Matéria-prima</DialogTitle>
          </DialogHeader>
          {editMaterialContent && (
            <form onSubmit={handleEditMaterial} className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input required value={editMaterialContent.name} onChange={e => setEditMaterialContent({...editMaterialContent, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={editMaterialContent.type}
                    onChange={(e) => setEditMaterialContent({...editMaterialContent, type: e.target.value})}
                  >
                    <option value="Cera">Cera</option>
                    <option value="Pavio">Pavio</option>
                    <option value="Essência">Essência</option>
                    <option value="Ervas/Sais">Ervas e Sais</option>
                    <option value="Embalagem">Embalagem</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unidade (ex: Kg, L, un)</label>
                  <Input required value={editMaterialContent.unit} onChange={e => setEditMaterialContent({...editMaterialContent, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Atual</label>
                  <Input required type="number" min="0" step="0.01" value={editMaterialContent.stock} onChange={e => setEditMaterialContent({...editMaterialContent, stock: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Mínimo</label>
                  <Input required type="number" min="0" step="0.01" value={editMaterialContent.minStock} onChange={e => setEditMaterialContent({...editMaterialContent, minStock: parseFloat(e.target.value)})} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditMaterialDialog(false)}>Cancelar</Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditMagicItemDialog} onOpenChange={setIsEditMagicItemDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-primary">Editar Item Mágico</DialogTitle>
          </DialogHeader>
          {editMagicItemContent && (
            <form onSubmit={handleEditMagicItem} className="space-y-4 my-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input required value={editMagicItemContent.name} onChange={e => setEditMagicItemContent({...editMagicItemContent, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={editMagicItemContent.type}
                    onChange={(e) => setEditMagicItemContent({...editMagicItemContent, type: e.target.value})}
                  >
                    <option value="Velas">Velas</option>
                    <option value="Cristais">Cristais</option>
                    <option value="Ervas/Especiarias">Ervas/Especiarias</option>
                    <option value="Oferendas">Oferendas (Moedas, etc)</option>
                    <option value="Insumos">Insumos (Carvão, Fitas)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unidade (ex: Kg, un, pct)</label>
                  <Input required value={editMagicItemContent.unit} onChange={e => setEditMagicItemContent({...editMagicItemContent, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Atual</label>
                  <Input required type="number" min="0" step="1" value={editMagicItemContent.stock} onChange={e => setEditMagicItemContent({...editMagicItemContent, stock: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Mínimo</label>
                  <Input required type="number" min="0" step="1" value={editMagicItemContent.minStock} onChange={e => setEditMagicItemContent({...editMagicItemContent, minStock: parseInt(e.target.value)})} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditMagicItemDialog(false)}>Cancelar</Button>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-primary">Histórico de Estoque</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {inventoryTransactions && inventoryTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Motivo / Destino</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryTransactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">{tx.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'Entrada' ? 'default' : 'secondary'} className={tx.type === 'Entrada' ? 'bg-green-600' : ''}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada no histórico.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={buyDialog} onOpenChange={setBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-primary">Registrar Compra</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBuyItem} className="space-y-4 my-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Item</label>
              <Input required value={buyItemData.name} onChange={e => setBuyItemData({...buyItemData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade Comprada</label>
                <Input required type="number" min="0" value={buyItemData.quantity} onChange={e => setBuyItemData({...buyItemData, quantity: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destino</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={buyItemData.targetTab}
                  onChange={(e) => setBuyItemData({...buyItemData, targetTab: e.target.value})}
                >
                  <option value="materials">Matérias-Primas</option>
                  <option value="magicItems">Itens de Magia</option>
                </select>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setBuyDialog(false)}>Cancelar</Button>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Salvar Compra</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
