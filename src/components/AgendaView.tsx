import React, { useState, useMemo } from 'react';
import { CalendarEvent, PriorityLevel } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  AlertCircle,
  Search,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Share2,
  Filter,
} from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  onCreateEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('important');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Conflict Detection Engine (Spec item 10)
  const conflicts = useMemo(() => {
    const conflictMap = new Map<string, string>(); // eventId -> message
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];
        if (e1.date === e2.date && e1.time === e2.time) {
          conflictMap.set(e1.id, `Conflito de horário com "${e2.title}"`);
          conflictMap.set(e2.id, `Conflito de horário com "${e1.title}"`);
        }
      }
    }
    return conflictMap;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (viewMode === 'daily') {
        return matchSearch && e.date === selectedDate;
      }
      return matchSearch;
    });
  }, [events, searchTerm, viewMode, selectedDate]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDate(selectedDate);
    setTime('10:00');
    setDurationMinutes(60);
    setLocation('');
    setPriority('important');
    setRecurrence('none');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: CalendarEvent) => {
    setEditingId(evt.id);
    setTitle(evt.title);
    setDescription(evt.description || '');
    setDate(evt.date);
    setTime(evt.time);
    setDurationMinutes(evt.durationMinutes);
    setLocation(evt.location || '');
    setPriority(evt.priority || 'normal');
    setRecurrence(evt.recurrence || 'none');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      onUpdateEvent(editingId, {
        title,
        description,
        date,
        time,
        durationMinutes,
        location,
        priority,
        recurrence,
      });
    } else {
      onCreateEvent({
        title,
        description,
        date,
        time,
        durationMinutes,
        location,
        priority,
        recurrence,
        reminderMinutes: 30,
      });
    }
    setIsModalOpen(false);
  };

  // Export iCal architecture standard
  const handleExportICal = () => {
    const icsContent =
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Orbi AI//Agenda//PT\n' +
      events
        .map(
          (ev) =>
            `BEGIN:VEVENT\nSUMMARY:${ev.title}\nDESCRIPTION:${ev.description || ''}\nLOCATION:${ev.location || ''}\nEND:VEVENT`
        )
        .join('\n') +
      '\nEND:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orbi-agenda.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-sky-400" /> Agenda & Calendário
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão inteligente de tempo, rotina e detecção de conflitos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportICal}
            title="Sincronizar / Exportar iCal"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:border-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            Exportar iCal
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if any conflicts exist */}
      {conflicts.size > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">
              Detecção Inteligente: Você possui compromissos com choque de horário!
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-200">
            Atenção Necessária
          </span>
        </div>
      )}

      {/* Filter & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {[
            { id: 'daily', label: 'Diário' },
            { id: 'weekly', label: 'Semanal' },
            { id: 'monthly', label: 'Todos os Eventos' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === mode.id
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {viewMode === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
            />
          )}

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar evento ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">Nenhum compromisso encontrado para a data selecionada.</p>
            <button
              onClick={handleOpenCreate}
              className="text-xs font-semibold text-sky-400 hover:underline"
            >
              + Adicionar primeiro compromisso
            </button>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const hasConflict = conflicts.has(evt.id);
            return (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hasConflict
                    ? 'border-rose-500/50 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/20">
                        {evt.time}
                      </span>
                      <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">({evt.durationMinutes} min)</span>
                      {evt.date !== selectedDate && (
                        <span className="text-[10px] text-indigo-300 font-mono">[{evt.date}]</span>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-xs text-slate-300">{evt.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      {evt.location && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      {evt.recurrence && evt.recurrence !== 'none' && (
                        <div className="flex items-center gap-1 text-indigo-400">
                          <RefreshCw className="w-3 h-3" />
                          <span className="capitalize">Recorrência: {evt.recurrence}</span>
                        </div>
                      )}
                    </div>

                    {hasConflict && (
                      <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {conflicts.get(evt.id)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar evento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create/Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingId ? 'Editar Evento' : 'Novo Evento na Agenda'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião de Alinhamento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="urgent">🔴 Urgente</option>
                    <option value="important">🟠 Importante</option>
                    <option value="attention">🟡 Atenção</option>
                    <option value="normal">🟢 Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Localização (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Paulista, 1000 ou Google Meet"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição / Pauta</label>
                <textarea
                  rows={2}
                  placeholder="Anotações e detalhes do compromisso..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  {editingId ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
