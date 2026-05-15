import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ptBR } from 'date-fns/locale';
import { Clock, Plus, Flame, Package, MapPin, Sparkles, MoreHorizontal, Edit, Trash2, ShoppingCart } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function CalendarView() {
  const { events, setEvents, customers, spells } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const [newEvent, setNewEvent] = useState({ title: '', time: '', type: 'producao', customerId: '', spellId: '' });
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [metricsMonth, setMetricsMonth] = useState(new Date().getMonth());
  const [metricsYear, setMetricsYear] = useState(new Date().getFullYear());
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);

  const calculateMetrics = () => {
    const periodEvents = events.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === metricsMonth && d.getFullYear() === metricsYear;
    });

    const counts = {
      producao: 0,
      envio: 0,
      evento: 0,
      magia: 0,
      compra: 0
    };

    periodEvents.forEach(e => {
      if (counts[e.type as keyof typeof counts] !== undefined) {
        counts[e.type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const metrics = calculateMetrics();

  const handleCreateOrEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newEvent.type === 'magia' && newEvent.spellId ? spells.find(s => s.id === newEvent.spellId)?.name || newEvent.title : newEvent.title;
    
    if (editEventId) {
      setEvents(events.map(ev => ev.id === editEventId ? { ...ev, title, time: newEvent.time, type: newEvent.type, customerId: newEvent.customerId, spellId: newEvent.spellId } : ev));
    } else {
      const newEntry = {
        id: Math.floor(10 + Math.random() * 90).toString(),
        date: date || new Date(),
        title,
        type: newEvent.type,
        time: newEvent.time,
        customerId: newEvent.type === 'magia' ? newEvent.customerId : undefined,
        spellId: newEvent.type === 'magia' ? newEvent.spellId : undefined,
        attendance: 'none'
      };
      setEvents([...events, newEntry]);
    }
    
    setIsDialogOpen(false);
    setNewEvent({ title: '', time: '', type: 'producao', customerId: '', spellId: '' });
    setEditEventId(null);
  };
  
  const handleAttendanceChange = (id: string, attendance: string) => {
    setTimeout(() => {
      setEvents(events.map(e => e.id === id ? { ...e, attendance } : e));
    }, 150);
  };
  
  const openEditDialog = (event: any) => {
    setTimeout(() => {
      setEditEventId(event.id);
      setNewEvent({
        title: event.title,
        time: event.time,
        type: event.type,
        customerId: event.customerId || '',
        spellId: event.spellId || ''
      });
      setIsDialogOpen(true);
    }, 150);
  };
  
  const handleDeleteEvent = (id: string) => {
    setTimeout(() => {
      setEvents(events.filter(e => e.id !== id));
    }, 150);
  };

  const getDayEvents = (selectedDate: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const selectedEvents = date ? getDayEvents(date) : [];

  const getNextDaysEvents = () => {
    if (!date) return [];
    const days = [];
    for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + i);
        days.push({
            date: nextDate,
            events: getDayEvents(nextDate)
        });
    }
    return days;
  };

  const renderEventItem = (event: any) => (
                    <div key={event.id} className="flex p-4 rounded-lg border bg-secondary hover:bg-secondary/80 transition-colors">
                      <div className="flex-none w-12 flex justify-center mt-1">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{event.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 gap-4 flex-wrap">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {event.time}</span>
                          {event.location && <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {event.location}</span>}
                          {event.customerId && <span className="flex items-center text-primary">Para: {getCustomerName(event.customerId)}</span>}
                          {event.attendance && event.attendance !== 'none' && (
                            <Badge variant="outline" className={
                              event.attendance === 'compareceu' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs px-1.5' :
                              event.attendance === 'faltou' ? 'text-red-500 border-red-500/30 bg-red-500/10 text-xs px-1.5' :
                              event.attendance === 'cancelou' ? 'text-gray-500 border-gray-500/30 bg-gray-500/10 text-xs px-1.5' :
                              'text-orange-500 border-orange-500/30 bg-orange-500/10 text-xs px-1.5'
                            }>
                              {event.attendance === 'compareceu' && '✅ Compareceu'}
                              {event.attendance === 'faltou' && '❌ Não Compareceu'}
                              {event.attendance === 'cancelou' && '🚫 Cancelou'}
                              {event.attendance === 'trocou' && '🔄 Reagendou'}
                            </Badge>
                          )}
                        </div>
                        {event.type === 'magia' && event.spellId && (() => {
                          const spell = spells.find(s => s.id === event.spellId);
                          if (spell && spell.requiredItems && spell.requiredItems.length > 0) {
                            return (
                              <div className="mt-2 text-xs text-muted-foreground bg-background border border-border rounded p-2">
                                <span className="font-semibold text-foreground">Itens Necessários para Magia/Trabalho:</span> {spell.requiredItems.join(', ')}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="flex items-center space-x-2">
                         <Badge variant="outline" className="capitalize text-primary border-primary bg-primary/10 mr-2">{event.type}</Badge>
                         <DropdownMenu>
                            <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0' })}>
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                              {event.customerId && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status do Cliente</div>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAttendanceChange(event.id, 'compareceu') }} className="focus:bg-muted cursor-pointer text-emerald-500">✅ Compareceu</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAttendanceChange(event.id, 'faltou') }} className="focus:bg-muted cursor-pointer text-red-500">❌ Não Compareceu</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAttendanceChange(event.id, 'cancelou') }} className="focus:bg-muted cursor-pointer text-gray-500">🚫 Cancelou</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAttendanceChange(event.id, 'trocou') }} className="focus:bg-muted cursor-pointer text-orange-500">🔄 Trocou / Reagendou</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAttendanceChange(event.id, 'none') }} className="focus:bg-muted cursor-pointer">➖ Limpar Status</DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-border" />
                                </>
                              )}
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEditDialog(event) }} className="focus:bg-muted cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Editar</DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDeleteEvent(event.id) }} className="focus:bg-muted cursor-pointer text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </div>
  );

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'producao': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'envio': return <Package className="w-4 h-4 text-blue-500" />;
      case 'evento': return <MapPin className="w-4 h-4 text-emerald-500" />;
      case 'magia': return <Sparkles className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-stone-500" />;
    }
  };

  const getCustomerName = (id?: string) => customers.find(c => c.id === id)?.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-5xl font-serif italic tracking-wide text-primary">Calendário</h2>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">Agende produções, envios e eventos da loja.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isMetricsDialogOpen} onOpenChange={setIsMetricsDialogOpen}>
            <DialogTrigger className={buttonVariants({ variant: 'outline', className: 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' })}>
              Ver Métricas
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif italic text-primary">Métricas do Período</DialogTitle>
                <DialogDescription>Tarefas e eventos realizados.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mês</label>
                    <select value={metricsMonth} onChange={(e) => setMetricsMonth(parseInt(e.target.value))} className="w-full rounded-md border p-2 text-sm bg-background">
                      {Array.from({length: 12}).map((_, i) => (
                        <option key={i} value={i}>{new Date(2000, i).toLocaleString('pt-BR', {month: 'long'})}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ano</label>
                    <Input type="number" value={metricsYear} onChange={(e) => setMetricsYear(parseInt(e.target.value))} className="w-full" />
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between items-center"><span className="flex items-center"><Flame className="w-4 h-4 mr-2 text-orange-500" /> Produção</span> <Badge>{metrics.producao}</Badge></div>
                  <div className="flex justify-between items-center"><span className="flex items-center"><Package className="w-4 h-4 mr-2 text-blue-500" /> Envios</span> <Badge>{metrics.envio}</Badge></div>
                  <div className="flex justify-between items-center"><span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-500" /> Magias/Trabalhos</span> <Badge>{metrics.magia}</Badge></div>
                  <div className="flex justify-between items-center"><span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-emerald-500" /> Eventos</span> <Badge>{metrics.evento}</Badge></div>
                  <div className="flex justify-between items-center"><span className="flex items-center"><ShoppingCart className="w-4 h-4 mr-2 text-stone-500" /> Compras</span> <Badge>{metrics.compra}</Badge></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMetricsDialogOpen(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditEventId(null);
              setNewEvent({ title: '', time: '', type: 'producao', customerId: '', spellId: '' });
            }
          }}>
            <DialogTrigger className={buttonVariants({ className: 'bg-primary text-primary-foreground hover:bg-primary/80' })}>
              <Plus className="w-4 h-4 mr-2"/> Novo Evento
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif italic text-primary">{editEventId ? 'Editar Evento' : `Novo Evento para ${date ? date.toLocaleDateString('pt-BR') : 'Hoje'}`}</DialogTitle>
              <DialogDescription>
                {editEventId ? 'Modifique os detalhes deste evento.' : 'Adicione um novo evento, produção ou compromisso ao calendário.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrEditEvent} className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option value="producao">Produção</option>
                    <option value="envio">Envio / Logística</option>
                    <option value="evento">Evento / Feira</option>
                    <option value="compra">Compra de Materiais</option>
                    <option value="magia">Trabalho Místico / Magia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horário</label>
                  <Input required placeholder="09:00" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                </div>
              </div>

              {newEvent.type === 'magia' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Magia / Trabalho</label>
                    <select 
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newEvent.spellId}
                      onChange={(e) => setNewEvent({...newEvent, spellId: e.target.value})}
                    >
                      <option value="" disabled>Selecione um trabalho...</option>
                      {spells.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente (Opcional)</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newEvent.customerId}
                      onChange={(e) => setNewEvent({...newEvent, customerId: e.target.value})}
                    >
                      <option value="">Nenhum cliente específico</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título do Evento</label>
                  <Input required placeholder="Ex: Produção Lote: Baunilha" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                </div>
              )}

              <DialogFooter className="mt-4">
                <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancelar</DialogClose>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80">Confirmar Evento</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        <Card className="md:col-span-3 lg:col-span-1 border-none shadow-sm bg-secondary">
          <CardHeader>
            <CardTitle>Selecione a data</CardTitle>
          </CardHeader>
          <CardContent className="p-4 w-full">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="rounded-md border border-border shadow bg-card mx-auto p-4 w-full h-auto max-w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-cell]:w-full"
              modifiers={{
                hasEvent: events.map(e => new Date(e.date))
              }}
              modifiersClassNames={{
                hasEvent: "font-bold bg-primary/20 text-primary-foreground border-2 border-primary in-data-[state=selected]:bg-primary"
              }}
              components={{
                 DayButton: CustomDayButton
              }}
            />
          </CardContent>
        </Card>

        <div className="md:col-span-4 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long'}).format(date) : 'Selecione uma data'}
              </CardTitle>
              <CardDescription>
                {selectedEvents.length} eventos programados para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
               {selectedEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                    <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p>Nenhum compromisso agendado para esta data.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                    {selectedEvents.map(event => renderEventItem(event))}
                  </div>
               )}
            </CardContent>
          </Card>

          {date && getNextDaysEvents().map((dayData, idx) => (
            <Card key={idx} className="bg-secondary/30">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">
                  {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'short'}).format(dayData.date)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayData.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Livre</p>
                ) : (
                  <div className="space-y-4">
                    {dayData.events.map(event => renderEventItem(event))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function getMoonPhase(date: Date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  if (month < 3) {
    year--;
    month += 12;
  }
  ++month;
  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  let b = parseInt(jd.toString());
  jd -= b;
  b = Math.round(jd * 8);
  if (b >= 8) b = 0;
  
  if (b === 0) return '🌑'; 
  if (b === 1 || b === 2 || b === 3) return '🌒'; 
  if (b === 4) return '🌕'; 
  if (b === 5 || b === 6 || b === 7) return '🌘'; 
  return '🌑';
}

const CustomDayButton = (props: any) => {
  const phase = getMoonPhase(props.day.date);
  return (
    <CalendarDayButton {...props}>
       <div className="flex flex-col items-center justify-center w-full h-full relative">
          <span className="font-medium text-xs sm:text-sm">{props.children}</span>
          <span className="absolute bottom-1 right-1 text-[10px] opacity-80 pointer-events-none leading-none">{phase}</span>
       </div>
    </CalendarDayButton>
  );
};
