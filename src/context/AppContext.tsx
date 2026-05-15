import React, { createContext, useContext, useState, useEffect } from 'react';

function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export const initialCustomers = [
  { id: '1', name: 'Amanda Silva', email: 'amanda.silva@email.com', phone: '(11) 99999-1111', totalOrders: 5, totalSpent: 650.00, status: 'ativo', lastOrder: '05/05/2026' },
  { id: '2', name: 'Carlos Oliveira', email: 'carlos.o@email.com', phone: '(11) 98888-2222', totalOrders: 1, totalSpent: 89.90, status: 'ativo', lastOrder: '04/05/2026' },
  { id: '3', name: 'Beatriz Santos', email: 'bia.santos@email.com', phone: '(21) 97777-3333', totalOrders: 12, totalSpent: 1450.00, status: 'vip', lastOrder: '04/05/2026' },
];

export const initialProducts = [
  { id: '1', sku: 'VEL-LAV-001', name: 'Vela Aromática de Lavanda', category: 'Velas', stock: 45, maxStock: 100, price: 45.00, status: 'normal' },
  { id: '2', sku: 'BAN-DES-001', name: 'Banho de Descarrego (7 Ervas)', category: 'Banhos', stock: 12, maxStock: 60, price: 35.00, status: 'baixo' },
  { id: '3', sku: 'ESC-REL-002', name: 'Escalda Pés Relaxante', category: 'Escalda Pés', stock: 5, maxStock: 20, price: 30.00, status: 'critico' },
  { id: '4', sku: 'IMG-SJG-001', name: 'Imagem São Jorge (15cm)', category: 'Imagens', stock: 3, maxStock: 10, price: 120.00, status: 'critico' },
];

export const initialMaterials = [
  { id: '1', name: 'Cera de Coco (Kg)', type: 'Cera', stock: 25, unit: 'Kg', minStock: 10, status: 'normal' },
  { id: '2', name: 'Pavio de Algodão (m)', type: 'Pavio', stock: 5, unit: 'm', minStock: 20, status: 'critico' },
  { id: '3', name: 'Mistura 7 Ervas (Kg)', type: 'Ervas/Sais', stock: 8, unit: 'Kg', minStock: 10, status: 'baixo' },
  { id: '4', name: 'Sal Grosso (Kg)', type: 'Ervas/Sais', stock: 15, unit: 'Kg', minStock: 5, status: 'normal' },
];

export const initialMagicItems = [
  { id: '1', name: 'Vela de 7 Dias Branca', type: 'Velas', stock: 15, unit: 'un', minStock: 5, status: 'normal' },
  { id: '2', name: 'Vela de 7 Dias Vermelha', type: 'Velas', stock: 3, unit: 'un', minStock: 5, status: 'baixo' },
  { id: '3', name: 'Vela de 7 Dias Preta', type: 'Velas', stock: 2, unit: 'un', minStock: 5, status: 'critico' },
  { id: '4', name: 'Moedas Douradas', type: 'Oferendas', stock: 50, unit: 'un', minStock: 21, status: 'normal' },
  { id: '5', name: 'Carvão em Brasa (Pacote)', type: 'Insumos', stock: 2, unit: 'un', minStock: 5, status: 'critico' },
  { id: '6', name: 'Cristal Ágata de Fogo', type: 'Cristais', stock: 3, unit: 'un', minStock: 2, status: 'normal' },
  { id: '7', name: 'Canela em Pó (g)', type: 'Ervas/Especiarias', stock: 500, unit: 'g', minStock: 200, status: 'normal' },
  { id: '8', name: 'Pétalas de Rosa Cor-de-rosa (Pacote)', type: 'Ervas/Especiarias', stock: 1, unit: 'pct', minStock: 3, status: 'baixo' },
];

export const initialShipments = [
  { id: '1024', customerId: '1', date: '05/05/2026', method: 'Correios - PAC', status: 'preparando', tracking: '', total: 145.00 },
  { id: '1023', customerId: '2', date: '04/05/2026', method: 'Jadlog', status: 'enviado', tracking: 'JAD123456789BR', total: 89.90 },
];

export const initialEvents = [
  { id: '1', date: new Date(), title: 'Produção Lote: Lavanda', type: 'producao', time: '09:00', attendance: 'none' },
  { id: '2', date: new Date(new Date().setDate(new Date().getDate() + 2)), title: 'Feira Criativa', type: 'evento', time: '10:00 - 18:00', location: 'Praça Central', attendance: 'none' },
];

export const initialSpells = [
  { id: '1', category: 'Magia', name: 'Abertura de Caminhos', type: 'Magia Branca', description: 'Trabalho para abrir novas oportunidades e quebrar bloqueios.', price: 150.00, requiredItems: ['Vela de 7 Dias Branca', 'Chave de Metal', 'Mel'] },
  { id: '2', category: 'Magia', name: 'Limpeza Espiritual Profunda', type: 'Descarrego', description: 'Remoção de energias densas, inveja e mal olhado (carvão em brasa, arruda).', price: 200.00, requiredItems: ['Sal Grosso', 'Arruda', 'Carvão', 'Azeite de Dendê'] },
  { id: '3', category: 'Magia', name: 'Adoçamento Amoroso', type: 'Magia de Amor', description: 'Suavizar relações em conflito e trazer harmonia sentimental.', price: 350.00, requiredItems: ['Vela Rosa', 'Mel', 'Pétalas de Rosa'] },
  { id: '4', category: 'Magia', name: 'Atrair Dinheiro (Gnomos)', type: 'Prosperidade', description: 'Trabalho com elementais da terra para atrair ganhos financeiros.', price: 280.00, requiredItems: ['Abacaxi', '21 Moedas', 'Mel', 'Vela Amarela'] },
  { id: '5', category: 'Magia', name: 'Cura Emocional (Ondinas)', type: 'Cura', description: 'Limpeza emocional com as águas, lavando tristezas e medos.', price: 180.00, requiredItems: ['Água de Chuva', 'Água do Mar', 'Água Mineral', 'Vela Azul Clara'] },
  { id: '6', category: 'Magia', name: 'Encantamento Pessoal (Salamandras)', type: 'Poder Pessoal', description: 'Ativação de magnetismo, autoestima e força de atração.', price: 250.00, requiredItems: ['Cristal Ágata de Fogo', '7 Velas Vermelhas'] },
  { id: '7', category: 'Magia', name: 'Corte de Laços Emocionais (3 Bruxas)', type: 'Descarrego', description: 'Quebra de amarras com relacionamentos e sentimentos passados.', price: 250.00, requiredItems: ['7 Tesouras', '7m Barbante', 'Caldeirão', 'Espada de São Jorge'] },
  { id: '8', category: 'Magia', name: 'Mente e Pensamentos (Silfos)', type: 'Abertura de Caminhos', description: 'Potencialização cognitiva, foco e concentração.', price: 200.00, requiredItems: ['Gengibre', 'Salsinha', 'Lavanda', 'Fita Branca'] },
  { id: '9', category: 'Magia', name: 'Levante Depressão (Dragão)', type: 'Magia Branca', description: 'Levante energético e queima de memórias obscuras.', price: 350.00, requiredItems: ['Batata Doce', 'Pimenta', 'Alho e Cebola', '7 Ovos Brancos'] },
  { id: '10', category: 'Magia', name: 'Atrair Boa Sorte (Pó Mágico)', type: 'Prosperidade', description: 'Pó confeccionado no liquidificador e soprado na casa.', price: 150.00, requiredItems: ['Folha de Pitangueira', 'Canela', 'Cravo', 'Cânfora'] },
  { id: '11', category: 'Magia', name: 'Questões Judiciais', type: 'Magia de Amor', description: 'Defumação e atuação espiritual em processos judiciais.', price: 300.00, requiredItems: ['Estrela de Davi', 'Giz', 'Athame', 'Resina', 'Orégano'] },
  { id: '12', category: 'Magia', name: 'Mineral para Coragem e Vitalidade', type: 'Poder Pessoal', description: 'Mandala de cristais para recuperar força vital.', price: 450.00, requiredItems: ['Olho de Tigre', 'Pirita', 'Esmeralda', 'Hematita', 'Pó de Café'] },
  { id: '13', category: 'Magia', name: 'Coração de Quartzo (Amor)', type: 'Magia de Amor', description: 'Preparação do cálice e coração de cristal para relacionamento.', price: 320.00, requiredItems: ['Cristal Coração', 'Pétalas de Rosa', 'Caldeirão', '7 Girassóis'] },
  { id: '14', category: 'Magia', name: 'Glamour, Brilho e Encanto', type: 'Poder Pessoal', description: 'Água das três bruxas para atração e sorte.', price: 350.00, requiredItems: ['Amazonita', 'Pó Dourado', 'Água Morna', 'Perfumes'] },
  { id: '15', category: 'Magia', name: 'Fechar Caminhos / Vodu', type: 'Magia Negra', description: 'Trabalho com boneco vodu e terra de cemitério/esgoto.', price: 450.00, requiredItems: ['Terra de Formigueiro', 'Boneco Vodu', 'Alfinetes', 'Velas Pretas'] },
  { id: '16', category: 'Serviço Holístico', name: 'Leitura de Baralho Cigano', type: 'Oráculo', description: 'Consulta completa focada em orientações sobre caminhos profissionais, amorosos e espirituais através das cartas da tradição cigana.', price: 150.00, requiredItems: ['Baralho Cigano', 'Toalha ritualística', 'Cristal de quartzo branco', 'Vela branca'], wordsOfPower: 'Pela luz do povo cigano, que a verdade se revele e os caminhos se abram com clareza e sabedoria.' },
  { id: '17', category: 'Magia', name: 'Ritual de Limpeza com Ervas e Defumação', type: 'Descarrego', description: 'Limpeza energética profunda de ambientes ou pessoas utilizando o poder das ervas e tinturas herbais para transmutar energias negativas.', price: 80.00, requiredItems: ['Caldeirão ou recipiente resistente ao calor', 'Carvão vegetal', 'Ervas secas (arruda, guiné, sálvia)', 'Almofariz e pistilo'], wordsOfPower: 'Ervas sagradas que do solo brotaram, limpem as sombras e o mal que se instalou. Que o fogo transmute e o ar leve o que não é luz.' },
  { id: '18', category: 'Serviço Holístico', name: 'Consulta com Runas Nórdicas', type: 'Oráculo', description: 'Leitura oracular baseada no alfabeto rúnico para aconselhamento estratégico e autoconhecimento.', price: 120.00, requiredItems: ['Jogo de Runas (pedra ou madeira)', 'Saquinho de tecido', 'Toalha de lançamento'], wordsOfPower: 'Pelo sopro de Odin e a força das Nornas, que os símbolos falem o que o destino reserva.' },
  { id: '19', category: 'Serviço Holístico', name: 'Harmonização de Chakras com Cristais', type: 'Terapia de Energia', description: 'Alinhamento dos centros energéticos através da vibração de pedras e cristais específicos para cada ponto do corpo.', price: 180.00, requiredItems: ['Kit de cristais (Ametista, Quartzo Rosa, Citrino, etc.)', 'Incenso de sândalo', 'Música relaxante'], wordsOfPower: 'Equilíbrio estabelecido, luz que flui. Do topo à raiz, meu ser se harmoniza na frequência da cura.' },
  { id: '20', category: 'Serviço Holístico', name: 'Workshop de Culinária Mística', type: 'Outros', description: 'Prática guiada de preparo de alimentos, como massas e pães fermentados, com a consagração de intenções durante o manuseio dos ingredientes.', price: 250.00, requiredItems: ['Farinha de trigo', 'Água', 'Fermento natural', 'Sal', 'Ervas aromáticas', 'Tigela de cerâmica'], wordsOfPower: 'Neste alimento deposito minha intenção. Que cada fibra nutra o corpo e a alma de quem o partilhar.' },
];

type AppContextType = {
  customers: any[];
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  materials: any[];
  setMaterials: React.Dispatch<React.SetStateAction<any[]>>;
  shipments: any[];
  setShipments: React.Dispatch<React.SetStateAction<any[]>>;
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  spells: any[];
  setSpells: React.Dispatch<React.SetStateAction<any[]>>;
  sales: any[];
  setSales: React.Dispatch<React.SetStateAction<any[]>>;
  magicItems: any[];
  setMagicItems: React.Dispatch<React.SetStateAction<any[]>>;
  shoppingList: string[];
  setShoppingList: React.Dispatch<React.SetStateAction<string[]>>;
  inventoryTransactions: any[];
  setInventoryTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  coupons: any[];
  setCoupons: React.Dispatch<React.SetStateAction<any[]>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = usePersistedState('erp_customers', initialCustomers);
  const [products, setProducts] = usePersistedState('erp_products', initialProducts);
  const [materials, setMaterials] = usePersistedState('erp_materials', initialMaterials);
  const [shipments, setShipments] = usePersistedState('erp_shipments', initialShipments);
  const [events, setEvents] = usePersistedState('erp_events', initialEvents);
  const [spells, setSpells] = usePersistedState('erp_spells', initialSpells);
  const [magicItems, setMagicItems] = usePersistedState('erp_magic_items', initialMagicItems);
  const [inventoryTransactions, setInventoryTransactions] = usePersistedState<any[]>('erp_inventory_transactions', []);
  const [shoppingList, setShoppingList] = usePersistedState<string[]>('erp_shopping_list', []);
  const [coupons, setCoupons] = usePersistedState<any[]>('erp_coupons', []);
  const [sales, setSales] = usePersistedState('erp_sales', [
    { id: '1', date: '05/05/2026', description: 'Venda - Beatriz Santos (Kit Relaxamento)', type: 'entrada', amount: 120.00, paymentMethod: 'PIX' },
    { id: '2', date: '04/05/2026', description: 'Compra de Insumos (Cera de Coco)', type: 'saida', amount: 85.50, paymentMethod: 'Cartão de Crédito' },
    { id: '3', date: '04/05/2026', description: 'Trabalho - Abertura de Caminhos', type: 'entrada', amount: 150.00, paymentMethod: 'Dinheiro' },
  ]);

  return (
    <AppContext.Provider value={{ customers, setCustomers, products, setProducts, materials, setMaterials, shipments, setShipments, events, setEvents, spells, setSpells, sales, setSales, magicItems, setMagicItems, inventoryTransactions, setInventoryTransactions, shoppingList, setShoppingList, coupons, setCoupons }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
