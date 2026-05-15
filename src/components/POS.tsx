import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, Banknote, Percent, DollarSign, Ticket } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface CartItem {
  cartId: string;
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'magicItem' | 'spell';
}

export function POS() {
  const { 
    products, setProducts, 
    spells, 
    magicItems, setMagicItems,
    customers, setCustomers,
    sales, setSales,
    inventoryTransactions, setInventoryTransactions,
    coupons
  } = useAppContext();
  
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'product' | 'magicItem' | 'spell'>('product');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [discount, setDiscount] = useState<number>(0);

  // Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | 'coupon'>('percent');
  const [discountInput, setDiscountInput] = useState<string>('');

  // New Customer Modal State
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  
  // Filtered items
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMagicItems = magicItems.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSpells = spells.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (item: any, type: 'product' | 'magicItem' | 'spell') => {
    // Check if it exists in cart, if so, increase quantity, otherwise add new
    const existingIndex = cart.findIndex(c => c.id === item.id && c.type === type);
    
    // For products and magic items, check max stock
    if (type === 'product' && existingIndex !== -1 && cart[existingIndex].quantity >= item.stock) return;
    if (type === 'magicItem' && existingIndex !== -1 && cart[existingIndex].quantity >= item.stock) return;
    if (type === 'product' && item.stock <= 0) return;
    if (type === 'magicItem' && item.stock <= 0) return;

    if (existingIndex !== -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartId: Math.random().toString(),
        id: item.id,
        name: item.name,
        price: item.price || 0, // MagicItems might not have price in standard setup if it's inventory only... wait, magicItems might not be sold directly?
        // Wait, magicItems don't have a price field in default setup. We should default to 0 and let user change if needed?
        // Let's check `initialMagicItems` in context to see if they have price.
        quantity: 1,
        type: type
      }]);
    }
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const itemIndex = cart.findIndex(c => c.cartId === cartId);
    if (itemIndex === -1) return;
    
    const newCart = [...cart];
    newCart[itemIndex].quantity += delta;
    
    if (newCart[itemIndex].quantity <= 0) {
      newCart.splice(itemIndex, 1);
    }
    setCart(newCart);
  };
  
  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(c => c.cartId !== cartId));
  };
  
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  const [couponError, setCouponError] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  let effectiveDiscount = discount;
  if (appliedCouponCode) {
    const foundCoupon = (coupons || []).find((c: any) => c.code === appliedCouponCode && c.active);
    let isStillValid = true;
    if (!foundCoupon) isStillValid = false;
    else {
        if (foundCoupon.customerId && foundCoupon.customerId !== customerId) isStillValid = false;
        if (customerId) {
           const pastSales = sales.filter((s:any) => s.customerId === customerId);
           if (pastSales.some((s:any) => s.couponCode === foundCoupon.code)) isStillValid = false;
        }
        if (!foundCoupon.isLifetime) {
           const today = new Date(); today.setHours(0,0,0,0);
           const start = new Date(foundCoupon.startDate); start.setHours(0,0,0,0);
           const end = new Date(foundCoupon.endDate); end.setHours(0,0,0,0);
           if (today < start || today > end) isStillValid = false;
        }
    }
    if (isStillValid && foundCoupon) {
        effectiveDiscount = foundCoupon.type === 'percent' ? (subtotal * foundCoupon.value) / 100 : foundCoupon.value;
    } else {
        effectiveDiscount = 0; // invalidated
    }
  }

  const total = Math.max(0, subtotal - effectiveDiscount);

  let tempDiscountAmount = 0;
  if (discountType === 'percent') {
    tempDiscountAmount = (subtotal * (parseFloat(discountInput) || 0)) / 100;
  } else if (discountType === 'fixed') {
    tempDiscountAmount = parseFloat(discountInput) || 0;
  } else if (discountType === 'coupon') {
    const foundCoupon = (coupons || []).find((c: any) => c.code === discountInput.toUpperCase() && c.active);
    if (foundCoupon) {
       let isValid = true;
       if (foundCoupon.customerId && foundCoupon.customerId !== customerId) isValid = false;
       if (customerId) {
           const pastSales = sales.filter((s:any) => s.customerId === customerId);
           if (pastSales.some((s:any) => s.couponCode === foundCoupon.code)) isValid = false;
       }
       if (!foundCoupon.isLifetime) {
           const today = new Date(); today.setHours(0,0,0,0);
           const start = new Date(foundCoupon.startDate); start.setHours(0,0,0,0);
           const end = new Date(foundCoupon.endDate); end.setHours(0,0,0,0);
           if (today < start || today > end) isValid = false;
       }
       if (isValid) {
         tempDiscountAmount = foundCoupon.type === 'percent' ? (subtotal * foundCoupon.value) / 100 : foundCoupon.value;
       }
    }
  }
  const tempTotal = Math.max(0, subtotal - tempDiscountAmount);

  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);
  
  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (total < 0) return;
    
    const checkoutId = Math.floor(100 + Math.random() * 900).toString();
    const customerName = customerId && customerId !== 'balcao' ? customers.find(c => c.id === customerId)?.name || 'Não informado' : 'Não informado';

    // Process Sale
    const newSale = {
      id: checkoutId,
      date: new Date().toLocaleDateString('pt-BR'),
      description: `Venda PDV: ${cart.map(c => `${c.quantity}x ${c.name}`).join(', ')}`,
      type: 'entrada',
      amount: total,
      paymentMethod: paymentMethod,
      customerId: customerId,
      couponCode: effectiveDiscount > 0 && appliedCouponCode ? appliedCouponCode : undefined
    };
    
    setSales([newSale, ...sales]);
    
    // Process Inventory Deductions
    cart.forEach(item => {
      if (item.type === 'product') {
        const prod = products.find(p => p.id === item.id);
        if (prod) {
          setProducts(prev => prev.map(p => p.id === item.id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p));
          setInventoryTransactions(prev => [{
            id: Math.random().toString(), date: new Date().toISOString(), itemName: item.name, type: 'Saída', quantity: item.quantity, reason: `Venda Caixa/PDV #${checkoutId}`
          }, ...prev]);
        }
      } else if (item.type === 'magicItem') {
        const mItem = magicItems.find(m => m.id === item.id);
        if (mItem) {
          setMagicItems(prev => prev.map(m => m.id === item.id ? { ...m, stock: Math.max(0, m.stock - item.quantity) } : m));
          setInventoryTransactions(prev => [{
            id: Math.random().toString(), date: new Date().toISOString(), itemName: item.name, type: 'Saída', quantity: item.quantity, reason: `Venda Caixa/PDV #${checkoutId}`
          }, ...prev]);
        }
      }
    });

    // Handle CRM
    if (customerId && customerId !== 'balcao') {
      setCustomers(customers.map(c => c.id === customerId ? {
        ...c,
        totalOrders: (c.totalOrders || 0) + 1,
        totalSpent: (c.totalSpent || 0) + total,
        lastOrder: new Date().toLocaleDateString('pt-BR')
      } : c));
    }

    setLastOrderDetails({
       id: checkoutId,
       date: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
       customer: customerName,
       items: [...cart],
       subtotal,
       discount: effectiveDiscount,
       couponCode: effectiveDiscount > 0 ? appliedCouponCode : undefined,
       total,
       paymentMethod
    });
    
    // Reset Cart
    setCart([]);
    setDiscount(0);
    setCustomerId('');
    setPaymentMethod('PIX');
    setAppliedCouponCode('');
    setIsReceiptModalOpen(true);
  };

  const getReceiptText = () => {
    if (!lastOrderDetails) return '';
    let text = `Olá, enviamos seu recibo de compra em Rito & Raiz\n`;
    text += `📦 Pedido #${lastOrderDetails.id}\n`;
    text += `Data: ${lastOrderDetails.date}\n`;
    text += `Cliente: ${lastOrderDetails.customer}\n`;
    text += `Caixa: Rito & Raiz\n`;
    text += `Vendedor: Não informado\n`;
    text += `____________\n`;
    text += `🛍️ Produtos\n`;
    lastOrderDetails.items.forEach((item: any) => {
      text += `${item.name} | ${item.quantity} x R$ ${item.price.toFixed(2)}\n`;
    });
    text += `____________\n`;
    const totalQty = lastOrderDetails.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    text += `Subtotal (${totalQty} produto${totalQty > 1 ? 's' : ''}): R$ ${lastOrderDetails.subtotal.toFixed(2)}\n`;
    if (lastOrderDetails.discount > 0) {
      if (lastOrderDetails.couponCode) {
        text += `Desconto (Cupom: ${lastOrderDetails.couponCode}): - R$ ${lastOrderDetails.discount.toFixed(2)}\n`;
      } else {
        text += `Desconto: - R$ ${lastOrderDetails.discount.toFixed(2)}\n`;
      }
    }
    text += `____________\n`;
    text += `💵 Forma de pagamento\n`;
    text += `${lastOrderDetails.paymentMethod}: R$ ${lastOrderDetails.total.toFixed(2)}\n\n`;
    text += `Obrigado!`;
    return text;
  };

  const handleSendWhatsApp = () => {
     const phone = customers.find(c => c.id === customerId)?.phone || '';
     const encoded = encodeURIComponent(getReceiptText());
     window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  const handleSendEmail = () => {
     const email = customers.find(c => c.id === customerId)?.email || '';
     const encodedBody = encodeURIComponent(getReceiptText());
     window.open(`mailto:${email}?subject=Recibo Rito & Raiz - Pedido #${lastOrderDetails?.id}&body=${encodedBody}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Esquerda: Itens */}
      <div className="flex-1 flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-serif italic tracking-wide text-primary">Caixa / PDV</h2>
          <p className="text-muted-foreground">Sistema rápido para atendimento de balcão.</p>
        </div>
        
        <div className="bg-card border-border border rounded-md flex p-1 space-x-1 shrink-0">
          <Button variant={activeTab === 'product' ? 'default' : 'ghost'} className="flex-1" onClick={() => setActiveTab('product')}>Produtos</Button>
          <Button variant={activeTab === 'magicItem' ? 'default' : 'ghost'} className="flex-1" onClick={() => setActiveTab('magicItem')}>Misturas/Velas</Button>
          <Button variant={activeTab === 'spell' ? 'default' : 'ghost'} className="flex-1" onClick={() => setActiveTab('spell')}>Serviços/Magias</Button>
        </div>
        
        <div className="relative shrink-0">
          <Search className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Buscar por nome..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-2">
            {activeTab === 'product' && filteredProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p, 'product')}
                className={`p-4 border rounded-md cursor-pointer transition-all hover:border-primary hover:bg-primary/5 flex flex-col justify-between ${p.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div>
                  <h4 className="font-medium line-clamp-2">{p.name}</h4>
                  <p className="text-sm text-muted-foreground">{p.stock} unid.</p>
                </div>
                <div className="mt-2 text-primary font-bold">R$ {p.price?.toFixed(2)}</div>
              </div>
            ))}

            {activeTab === 'magicItem' && filteredMagicItems.map(m => (
              <div 
                key={m.id} 
                onClick={() => addToCart({...m, price: 0}, 'magicItem')}
                className={`p-4 border rounded-md cursor-pointer transition-all hover:border-primary hover:bg-primary/5 flex flex-col justify-between ${m.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div>
                  <h4 className="font-medium line-clamp-2">{m.name}</h4>
                  <p className="text-sm text-muted-foreground">{m.stock} {m.unit}</p>
                </div>
                <div className="mt-2 text-primary font-bold">Valor Aberto</div>
              </div>
            ))}

            {activeTab === 'spell' && filteredSpells.map(s => (
              <div 
                key={s.id} 
                onClick={() => addToCart(s, 'spell')}
                className={`p-4 border rounded-md cursor-pointer transition-all hover:border-primary hover:bg-primary/5 flex flex-col justify-between`}
              >
                <div>
                  <h4 className="font-medium line-clamp-2">{s.name}</h4>
                  <p className="text-sm text-muted-foreground">Serviço/Magia</p>
                </div>
                <div className="mt-2 text-primary font-bold">R$ {s.price?.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direita: Carrinho */}
      <Card className="w-full lg:w-[400px] xl:w-[450px] flex flex-col h-full shadow-lg border-primary/20 shrink-0">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> 
            Carrinho Atual
          </CardTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">Vincular Cliente</label>
              <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={() => setIsNewCustomerModalOpen(true)}>
                <Plus className="w-3 h-3 mr-1" /> Novo Cliente
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <select 
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="balcao">Cliente Balcão (Anônimo)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          {cart.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>O carrinho está vazio.</p>
              <p className="text-sm mt-2">Clique nos itens à esquerda para adicionar.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.cartId} className="p-4 flex gap-3 hover:bg-muted/10 transition-colors">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm leading-tight">{item.name}</h5>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                      {item.type === 'magicItem' ? (
                        <div className="flex items-center space-x-1">
                           <span>R$</span>
                           <Input 
                             type="number" 
                             className="h-6 w-20 text-xs px-1 py-0 bg-background" 
                             value={item.price || ''}
                             onChange={(e) => {
                               const newCart = [...cart];
                               const idx = newCart.findIndex(c => c.cartId === item.cartId);
                               if(idx !== -1) {
                                 newCart[idx].price = parseFloat(e.target.value) || 0;
                                 setCart(newCart);
                               }
                             }}
                             step="0.01"
                           />
                        </div>
                      ) : (
                        <span>R$ {item.price.toFixed(2)}</span>
                      )}
                      
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-l-md" onClick={() => updateQuantity(item.cartId, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none rounded-r-md" onClick={() => updateQuantity(item.cartId, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10 -mr-1" onClick={() => removeFromCart(item.cartId)}>
                         <Trash2 className="w-3 h-3" />
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        <div className="p-4 bg-muted/30 border-t space-y-3 shrink-0">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Desconto:</span>
            <Button 
               variant="ghost" 
               className={`h-auto py-1 px-2 text-sm flex flex-col items-end ${effectiveDiscount > 0 ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700' : 'text-blue-600 hover:bg-blue-50'}`} 
               onClick={() => {
                 setDiscountInput(effectiveDiscount > 0 ? (discountType === 'percent' ? ((effectiveDiscount / subtotal) * 100).toFixed(0) : effectiveDiscount.toString()) : '');
                 setIsDiscountModalOpen(true);
               }}
            >
              {effectiveDiscount > 0 ? (
                 <>
                   <span>- R$ {effectiveDiscount.toFixed(2)}</span>
                   {appliedCouponCode && <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 leading-none mt-0.5">{appliedCouponCode}</span>}
                 </>
              ) : 'Adicionar Desconto'}
            </Button>
          </div>
          {appliedCouponCode && effectiveDiscount === 0 && (
             <div className="flex justify-between items-center text-xs text-red-500 font-medium">
               <span>Cupom {appliedCouponCode}</span>
               <span>Inválido para esta compra</span>
             </div>
          )}
          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <CardFooter className="p-4 pt-0 bg-muted/30 gap-2 flex flex-col shrink-0">
          <div className="grid grid-cols-2 gap-2 w-full mb-2">
            <Button 
               variant={paymentMethod === 'PIX' ? 'default' : 'outline'} 
               className={paymentMethod === 'PIX' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' : ''}
               onClick={() => setPaymentMethod('PIX')}
            >
              PIX
            </Button>
            <Button 
               variant={paymentMethod === 'Cartão de Crédito' ? 'default' : 'outline'} 
               onClick={() => setPaymentMethod('Cartão de Crédito')}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Crédito
            </Button>
            <Button 
               variant={paymentMethod === 'Cartão de Débito' ? 'default' : 'outline'} 
               onClick={() => setPaymentMethod('Cartão de Débito')}
            >
              <CreditCard className="w-4 h-4 mr-2" /> Débito
            </Button>
            <Button 
               variant={paymentMethod === 'Dinheiro' ? 'default' : 'outline'} 
               onClick={() => setPaymentMethod('Dinheiro')}
            >
              <Banknote className="w-4 h-4 mr-2" /> Dinheiro
            </Button>
          </div>

          <Button 
            className="w-full h-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-serif italic tracking-wide" 
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Finalizar Venda (R$ {total.toFixed(2)})
          </Button>
        </CardFooter>
      </Card>

      {/* Modal Novo Cliente */}
      <Dialog open={isNewCustomerModalOpen} onOpenChange={setIsNewCustomerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input placeholder="Nome completo" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (Opcional - Newsletter)</label>
              <Input type="email" placeholder="email@exemplo.com" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone (Whatsapp)</label>
              <Input placeholder="(11) 99999-9999" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCustomerModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if(!newCustomer.name) return;
              const newId = Math.random().toString();
              const cust = {
                id: newId,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                status: 'ativo',
                totalOrders: 0,
                totalSpent: 0
              };
              setCustomers([...customers, cust]);
              setCustomerId(newId);
              setNewCustomer({ name: '', email: '', phone: '' });
              setIsNewCustomerModalOpen(false);
            }}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Desconto */}
      <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Desconto</DialogTitle>
          </DialogHeader>
          <div className="my-4 space-y-6">
             <div className="flex space-x-2">
                <Button 
                   variant="outline"
                   className={`flex-1 flex flex-col items-center justify-center py-6 h-auto ${discountType === 'percent' ? 'border-blue-300 ring-1 ring-blue-300 bg-blue-50' : ''}`}
                   onClick={() => setDiscountType('percent')}
                >
                   <div className={`p-1.5 rounded-sm mb-1 line-height-none ${discountType === 'percent' ? 'bg-blue-400 text-white' : 'bg-muted'}`}>
                     <Percent className="w-4 h-4" />
                   </div>
                   <span className="text-sm font-normal">Percentagem</span>
                </Button>
                <Button 
                   variant="outline"
                   className={`flex-1 flex flex-col items-center justify-center py-6 h-auto ${discountType === 'fixed' ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}`}
                   onClick={() => setDiscountType('fixed')}
                >
                   <div className={`p-1.5 rounded-sm mb-1 line-height-none ${discountType === 'fixed' ? 'bg-primary text-white' : 'bg-muted'}`}>
                     <DollarSign className="w-4 h-4" />
                   </div>
                   <span className="text-sm font-normal">Valor fixo</span>
                </Button>
                <Button 
                   variant="outline"
                   className={`flex-1 flex flex-col items-center justify-center py-6 h-auto ${discountType === 'coupon' ? 'border-primary ring-1 ring-primary bg-primary/5' : ''}`}
                   onClick={() => setDiscountType('coupon')}
                >
                   <div className={`p-1.5 rounded-sm mb-1 line-height-none ${discountType === 'coupon' ? 'bg-primary text-white' : 'bg-muted'}`}>
                     <Ticket className="w-4 h-4" />
                   </div>
                   <span className="text-sm font-normal">Cupom</span>
                </Button>
             </div>

             <div className="space-y-3">
                <label className="text-sm text-muted-foreground">
                  {discountType === 'percent' ? 'Porcentagem a ser aplicada' : discountType === 'fixed' ? 'Valor a ser descontado' : 'Código do Cupom'}
                </label>
                <div className="flex space-x-2 items-center">
                   <div className="relative flex-1">
                      {discountType === 'fixed' && (
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">R$</span>
                      )}
                      <Input 
                        value={discountInput}
                        onChange={(e) => { setCouponError(''); setDiscountInput(e.target.value); }}
                        placeholder={discountType === 'percent' ? '0' : discountType === 'fixed' ? '0,00' : 'CÓDIGO'}
                        className={`${discountType === 'percent' ? 'border-blue-400 ring-1 ring-blue-400 pr-8' : discountType === 'fixed' ? 'pl-8' : ''}`}
                      />
                      {discountType === 'percent' && (
                        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm font-medium">%</span>
                      )}
                   </div>
                   {discountType === 'percent' && (
                      <div className="flex space-x-2 ml-2">
                         <Button variant="outline" className="px-3 min-w-[3rem]" onClick={() => setDiscountInput('5')}>5%</Button>
                         <Button variant="outline" className="px-3 min-w-[3rem]" onClick={() => setDiscountInput('10')}>10%</Button>
                         <Button variant="outline" className="px-3 min-w-[3rem]" onClick={() => setDiscountInput('15')}>15%</Button>
                         <Button variant="outline" className="px-3 min-w-[3rem]" onClick={() => setDiscountInput('20')}>20%</Button>
                      </div>
                   )}
                </div>
                {couponError && <p className="text-red-500 text-xs font-medium">{couponError}</p>}
                
                {discountType === 'coupon' && coupons && coupons.filter((c: any) => c.active).length > 0 && (
                   <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Cupons Ativos Disponíveis:</p>
                      <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                         {coupons.filter((c: any) => c.active).map((c: any) => (
                            <div 
                               key={c.code} 
                               className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                               onClick={() => { setDiscountInput(c.code); setCouponError(''); }}
                            >
                               <div className="flex flex-col">
                                  <span className="font-bold text-sm text-primary">{c.code}</span>
                                  <span className="text-xs text-muted-foreground">
                                     {c.type === 'percent' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`}
                                     {c.customerId && <span className="ml-1 text-orange-500 flex items-center inline-flex"><User className="w-3 h-3 mx-1" />Restrito</span>}
                                  </span>
                               </div>
                               <Button variant="ghost" size="sm" className="h-6 text-xs px-2 border border-primary/20 hover:bg-primary/10">Usar</Button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             <div className="flex justify-between items-center font-bold text-lg pt-6">
               <span>Total a cobrar:</span>
               <span>R$ {tempTotal.toFixed(2)}</span>
             </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2 border-t pt-4">
             <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>Cancelar</Button>
             <Button className="bg-primary/10 text-primary hover:bg-primary/20 border-0" onClick={() => {
                if (discountType === 'coupon') {
                   const foundCoupon = (coupons || []).find((c: any) => c.code === discountInput.toUpperCase() && c.active);
                   if (!foundCoupon) {
                      setCouponError('Cupom inválido ou não encontrado.');
                      return;
                   }
                   
                   // Validations
                   if (foundCoupon.customerId && foundCoupon.customerId !== customerId) {
                      setCouponError('Este cupom é restrito a outro cliente.');
                      return;
                   }

                   if (customerId) {
                      const pastSales = sales.filter((s:any) => s.customerId === customerId);
                      if (pastSales.some((s:any) => s.couponCode === foundCoupon.code)) {
                          setCouponError('Este cliente já utilizou este cupom.');
                          return;
                      }
                   }

                   if (!foundCoupon.isLifetime) {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const start = new Date(foundCoupon.startDate); start.setHours(0,0,0,0);
                      const end = new Date(foundCoupon.endDate); end.setHours(0,0,0,0);
                      
                      if (today < start) {
                        setCouponError('O cupom ainda não está válido.');
                        return;
                      }
                      if (today > end) {
                        setCouponError('O cupom já expirou.');
                        return;
                      }
                   }

                   setAppliedCouponCode(foundCoupon.code);
                } else {
                   setAppliedCouponCode('');
                }
                setDiscount(tempDiscountAmount);
                setIsDiscountModalOpen(false);
             }}>Aplicar desconto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Recibo */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center font-serif text-primary">Venda Finalizada! 🎉</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center my-4 space-y-4">
             <p className="text-sm text-center text-muted-foreground">O que você gostaria de fazer com o recibo do cliente?</p>
             <div className="flex flex-col w-full gap-3">
                <Button variant="outline" className="h-12 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleSendEmail}>
                  <User className="w-5 h-5 mr-2" /> Enviar via E-mail
                </Button>
                <Button variant="outline" className="h-12 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={handleSendWhatsApp}>
                  <Banknote className="w-5 h-5 mr-2" /> Enviar via WhatsApp
                </Button>
             </div>
          </div>
          <DialogFooter className="sm:justify-center border-t pt-4">
             <Button variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>Pular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
