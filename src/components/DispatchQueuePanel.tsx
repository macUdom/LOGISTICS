import React, { useState } from 'react';
import { DispatchOrder, IncidentAlert, OperationalStatus, CourierUnit } from '../types/dispatch';
import { StatusBadge } from './StatusBadge';
import { soundFx } from '../utils/audio';
import {
  Search,
  Filter,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldAlert,
  Navigation,
  Thermometer,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface DispatchQueuePanelProps {
  orders: DispatchOrder[];
  couriers: CourierUnit[];
  alerts: IncidentAlert[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  onSelectCourier: (id: string) => void;
  onOpenNewDispatch: () => void;
  onOpenRerouteModal: (order: DispatchOrder) => void;
}

export const DispatchQueuePanel: React.FC<DispatchQueuePanelProps> = ({
  orders,
  couriers,
  alerts,
  selectedOrderId,
  onSelectOrder,
  onSelectCourier,
  onOpenNewDispatch,
  onOpenRerouteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'SLA RISK' | 'ON TIME' | 'DELAYED'>('ALL');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const courier = couriers.find((c) => c.id === order.courierId);
      const courierMatch = courier ? courier.name.toLowerCase().includes(q) || courier.id.toLowerCase().includes(q) : false;
      return (
        order.id.toLowerCase().includes(q) ||
        order.trackingCode.toLowerCase().includes(q) ||
        order.title.toLowerCase().includes(q) ||
        order.destinationName.toLowerCase().includes(q) ||
        courierMatch
      );
    }
    return true;
  });

  // Critical alerts that need attention
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  // Format seconds to HH:MM:SS countdown
  const formatSlaClock = (seconds: number) => {
    if (seconds <= 0) {
      const positiveSec = Math.abs(seconds);
      const m = Math.floor(positiveSec / 60);
      const s = positiveSec % 60;
      return `-${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} BREACH`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority.startsWith('P0')) return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
    if (priority.startsWith('P1')) return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
    if (priority.startsWith('P2')) return 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/40';
    return 'bg-[#64748B]/20 text-[#94A3B8] border-[#64748B]/40';
  };

  return (
    <aside className="w-80 md:w-[350px] bg-[#111827] border-r border-[#334155] flex flex-col h-full shrink-0 select-none">
      {/* Top Header & Search Bar */}
      <div className="p-3 border-b border-[#334155] bg-[#0B0F17]/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-bold text-[#F8FAFC] tracking-wider uppercase font-sans">
              DISPATCH QUEUE
            </h2>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#1E293B] text-[#10B981] font-semibold border border-[#334155]">
              {orders.length} ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-[#94A3B8]">
            <span>SLA:</span>
            <span className="text-[#10B981] font-semibold">96.4%</span>
          </div>
        </div>

        {/* Input Field: Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search Order ID, Courier, Waypoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#334155] focus:border-[#06B6D4] text-[#F8FAFC] text-[12px] pl-8 pr-3 py-1.5 rounded-[4px] outline-none placeholder:text-[#64748B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-[10px] font-mono text-[#94A3B8] hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
          {(['ALL', 'CRITICAL', 'SLA RISK', 'ON TIME', 'DELAYED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.click();
                setStatusFilter(tab);
              }}
              className={`px-2 py-0.5 rounded-[3px] shrink-0 transition-colors ${
                statusFilter === tab
                  ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B0F17]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Critical SLA Alerts Stack (if any alerts are active) */}
      {unresolvedAlerts.length > 0 && (
        <div className="p-2 bg-[#EF4444]/10 border-b border-[#EF4444]/30 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[#EF4444]">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>SLA ESCALATION GATE ({unresolvedAlerts.length})</span>
            </div>
            <span className="text-[10px] text-[#EF4444]/80">ACTION REQUIRED</span>
          </div>

          {unresolvedAlerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                soundFx.click();
                onSelectCourier(alert.courierId);
                if (alert.orderId) onSelectOrder(alert.orderId);
              }}
              className="p-2 bg-[#0B0F17] border border-[#EF4444] rounded-[4px] cursor-pointer hover:bg-[#1E293B] transition-colors shadow-[0_0_8px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-[#EF4444] font-bold">{alert.code}</span>
                <span className="text-[#94A3B8]">{alert.courierId}</span>
              </div>
              <div className="text-[11px] text-[#F8FAFC] line-clamp-1">{alert.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#334155]/50">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[#64748B] font-mono">
            No matching dispatches found
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = order.id === selectedOrderId;
            const courier = couriers.find((c) => c.id === order.courierId);
            const isUrgent = order.timeRemainingSec <= 300; // < 5 mins
            const isOverdue = order.timeRemainingSec <= 0;

            return (
              <div
                key={order.id}
                onClick={() => {
                  soundFx.click();
                  onSelectOrder(order.id);
                  onSelectCourier(order.courierId);
                }}
                className={`p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1E293B] border-l-2 border-l-[#10B981]'
                    : 'bg-[#111827] hover:bg-[#18202F]'
                }`}
              >
                {/* Header: ID, Priority, Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[12px] font-bold text-[#F8FAFC]">
                      {order.id}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded-[2px] border ${getPriorityBadgeClass(
                        order.priority
                      )}`}
                    >
                      {order.priority.split(' - ')[0]}
                    </span>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                {/* Title */}
                <h3 className="text-[12px] font-medium text-[#F8FAFC] truncate mb-1">
                  {order.title}
                </h3>

                {/* Destination & Sector */}
                <div className="text-[11px] text-[#94A3B8] truncate mb-2">
                  <span className="text-[#64748B]">DEST:</span> {order.destinationName}
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>PROGRESS: {order.progressPct}%</span>
                    <span>
                      {order.stops.filter((s) => s.status === 'COMPLETED').length}/{order.stops.length} STOPS
                    </span>
                  </div>
                  <div className="w-full bg-[#0B0F17] h-1.5 rounded-full overflow-hidden border border-[#334155]/50">
                    <div
                      className={`h-full transition-all duration-300 ${
                        order.status === 'CRITICAL'
                          ? 'bg-[#EF4444]'
                          : order.status === 'SLA RISK'
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${order.progressPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Info: Courier, SLA Clock, Cargo Tag */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#334155]/40 font-mono">
                  {/* Courier info */}
                  <div className="flex items-center gap-1.5 text-[#94A3B8]">
                    <span className="text-[#06B6D4] font-semibold">{order.courierId}</span>
                    <span className="text-[#64748B]">•</span>
                    <span className="truncate max-w-[90px]">{courier ? courier.callsign : 'Unassigned'}</span>
                  </div>

                  {/* SLA Countdown Timer */}
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      isOverdue
                        ? 'text-[#EF4444] animate-pulse'
                        : isUrgent
                        ? 'text-[#F59E0B] animate-pulse'
                        : 'text-[#10B981]'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatSlaClock(order.timeRemainingSec)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Action: Rapid Dispatch Creator */}
      <div className="p-2 border-t border-[#334155] bg-[#0B0F17]">
        <button
          onClick={() => {
            soundFx.dispatchConfirmed();
            onOpenNewDispatch();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] text-[12px] font-bold rounded-[4px] transition-colors shadow-sm"
        >
          <span>+ INITIATE DISPATCH</span>
        </button>
      </div>
    </aside>
  );
};
