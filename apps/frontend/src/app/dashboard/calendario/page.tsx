'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar as CalendarIcon, Plus, Video, MapPin, Users, Clock, ChevronLeft, ChevronRight, ExternalLink, Trash2, Edit3 } from 'lucide-react';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'call' | 'reminder';
  location?: string;
  attendees?: string[];
  link?: string;
  color: string;
  source: 'google' | 'outlook' | 'manual';
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { 
      id: 'google', 
      name: 'Google Calendar', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg', 
      color: 'from-red-500 to-orange-500', 
      connected: false 
    },
    { 
      id: 'outlook', 
      name: 'Outlook Calendar', 
      icon: '/logos/outlook.png', 
      color: 'from-blue-400 to-cyan-500', 
      connected: false 
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting' as 'meeting' | 'call' | 'reminder',
    location: '',
    link: ''
  });

  useEffect(() => {
    loadEvents();
    loadIntegrations();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const response = await api.get('/calendar/events', {
        params: {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        }
      });
      
      setEvents(response.data.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      })));
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]);
    }
  };

  const loadIntegrations = async () => {
    try {
      const response = await api.get('/integrations/calendar/status');
      setIntegrations(prev => prev.map(int => ({
        ...int,
        connected: response.data[int.id] === 'connected'
      })));
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    }
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        date: new Date(year, month, i), 
        isCurrentMonth: true 
      });
    }
    
    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => 
      event.start.toDateString() === date.toDateString()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.start || !newEvent.end) {
        alert('Preencha título, data/hora inicial e final');
        return;
      }

      await api.post('/calendar/events', newEvent);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        type: 'meeting',
        location: '',
        link: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento');
    }
  };

  const handleConnectCalendar = async (integrationId: string) => {
    try {
      const response = await api.post(`/integrations/${integrationId}-calendar/connect`);
      if (response.data.authUrl) {
        window.open(response.data.authUrl, '_blank', 'width=600,height=700');
      }
    } catch (error) {
      console.error(`Erro ao conectar ${integrationId}:`, error);
    }
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calendário</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus compromissos e reuniões</p>
          </div>
          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Evento
          </button>
        </div>

        {/* Integrações */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Integrações de Calendário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  integration.connected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-dark-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-dark-700 flex items-center justify-center p-2 border border-gray-200 dark:border-dark-600">
                      <Image
                        src={integration.icon}
                        alt={integration.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.connected ? 'Conectado' : 'Não conectado'}
                      </p>
                    </div>
                  </div>
                  {integration.connected ? (
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectCalendar(integration.id)}
                      className={`px-4 py-2 bg-gradient-to-r ${integration.color} text-white rounded-lg hover:shadow-lg transition-all text-sm`}
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles do Calendário */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex gap-2">
              {['month', 'week', 'day'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === v
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-2">
            {/* Cabeçalho dos dias */}
            {dayNames.map((day) => (
              <div key={day} className="text-center py-2 font-semibold text-gray-600 dark:text-gray-400 text-sm">
                {day}
              </div>
            ))}

            {/* Dias do mês */}
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayEvents = day.date ? getEventsForDay(day.date) : [];
              const isToday = day.date?.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  onClick={() => day.date && setSelectedDate(day.date)}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer ${
                    day.isCurrentMonth
                      ? 'bg-white dark:bg-dark-700 border-gray-200 dark:border-dark-600 hover:border-blue-500 dark:hover:border-blue-500'
                      : 'bg-gray-50 dark:bg-dark-800/50 border-transparent'
                  } ${
                    isToday ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {day.date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded bg-${event.color}-100 dark:bg-${event.color}-900/30 text-${event.color}-700 dark:text-${event.color}-400 truncate`}
                          >
                            {event.start.getHours()}:{String(event.start.getMinutes()).padStart(2, '0')} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Próximos Eventos */}
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Próximos Eventos</h3>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg bg-${event.color}-100 dark:bg-${event.color}-900/30 flex items-center justify-center`}>
                      {event.type === 'meeting' && <Users size={20} className={`text-${event.color}-600`} />}
                      {event.type === 'call' && <Video size={20} className={`text-${event.color}-600`} />}
                      {event.type === 'reminder' && <Clock size={20} className={`text-${event.color}-600`} />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {event.start.toLocaleString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </span>
                        )}
                        {event.link && (
                          <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink size={14} />
                            Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors">
                      <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Criar Evento */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-200 dark:border-dark-700 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Criar Novo Evento</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Reunião com cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalhes do evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Data/Hora Inicial *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Data/Hora Final *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meeting">Reunião</option>
                    <option value="call">Chamada/Vídeo</option>
                    <option value="reminder">Lembrete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Sala de Reuniões 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Link (Meet, Zoom, etc.)
                  </label>
                  <input
                    type="url"
                    value={newEvent.link}
                    onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Criar Evento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
