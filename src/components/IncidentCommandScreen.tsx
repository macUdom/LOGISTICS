import React, { useState } from 'react';
import { IncidentAlert, CourierUnit, DispatchOrder } from '../types/dispatch';
import { soundFx } from '../utils/audio';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  ArrowRight,
  RotateCw,
  Truck,
  ExternalLink,
  Flame,
  Check,
  Search,
} from 'lucide-react';

interface IncidentCommandScreenProps {
  alerts: IncidentAlert[];
  couriers: CourierUnit[];
  orders: DispatchOrder[];
  onAcknowledgeAlert: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onSelectCourier: (id: string) => void;
  onSelectOrder: (id: string) => void;
  onOpenRerouteModal: (order: DispatchOrder) => void;
}

export const IncidentCommandScreen: React.FC<IncidentCommandScreenProps> = ({
  alerts,
  couriers,
  orders,
  onAcknowledgeAlert,
  onResolveAlert,
  onSelectCourier,
  onSelectOrder,
  onOpenRerouteModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  const filteredList = alerts.filter((alert) => {
    if (filterSeverity === 'RESOLVED') return alert.resolved;
    if (filterSeverity === 'CRITICAL') return !alert.resolved && alert.severity === 'CRITICAL';
    if (filterSeverity === 'WARNING') return !alert.resolved && alert.severity === 'WARNING';
    if (filterSeverity === 'ALL') return !alert.resolved;
    return true;
  }).filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.courierId.toLowerCase().includes(q)
    );
  });

  const handleAck = (id: string) => {
    soundFx.telemetryPing();
    onAcknowledgeAlert(id);
    setActionSuccessMsg(`Incident ${id} acknowledged. Ops channel notified.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleResolve = (id: string) => {
    soundFx.dispatchConfirmed();
    onResolveAlert(id);
    setActionSuccessMsg(`Incident ${id} marked RESOLVED. Telemetry restored.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F17] overflow-hidden select-none p-4 space-y-4">
      {/* Top Banner & KPI Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Active Alarms */}
        <div className="p-3 bg-[#111827] border border-[#EF4444] rounded-[4px] shadow-[0_0_12px_rgba(239,68,68,0.2)]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#EF4444] mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              CRITICAL ALARMS
            </span>
            <span className="bg-[#EF4444]/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {alerts.filter((a) => !a.resolved && a.severity === 'CRITICAL').length} PENDING
            </span>
          </div>
          <div className="text-[22px] font-mono font-bold text-[#F8FAFC]">
            {alerts.filter((a) => !a.resolved && a.severity === 'CRITICAL').length}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Immediate physical or SLA failure risk</div>
        </div>

        {/* Warnings */}
        <div className="p-3 bg-[#111827] border border-[#F59E0B] rounded-[4px]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#F59E0B] mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              CORRIDOR WARNINGS
            </span>
            <span className="bg-[#F59E0B]/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {alerts.filter((a) => !a.resolved && a.severity === 'WARNING').length}
            </span>
          </div>
          <div className="text-[22px] font-mono font-bold text-[#F8FAFC]">
            {alerts.filter((a) => !a.resolved && a.severity === 'WARNING').length}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Geofence shifts, bottlenecks & lag</div>
        </div>

        {/* SLA Health Projection */}
        <div className="p-3 bg-[#111827] border border-[#334155] rounded-[4px]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1">
            <span className="font-bold">HOURLY SLA ADHERENCE</span>
            <span className="text-[#10B981] font-semibold">TARGET 98.0%</span>
          </div>
          <div className="text-[22px] font-mono font-bold text-[#10B981]">96.4%</div>
          <div className="text-[10px] text-[#94A3B8]">Estimated breach loss: -1.6%</div>
        </div>

        {/* Resolved Today */}
        <div className="p-3 bg-[#111827] border border-[#334155] rounded-[4px]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] mb-1">
            <span className="font-bold">RESOLVED TODAY</span>
            <span className="text-[#06B6D4]">14h SHIFT</span>
          </div>
          <div className="text-[22px] font-mono font-bold text-[#F8FAFC]">
            {resolvedAlerts.length + 18}
          </div>
          <div className="text-[10px] text-[#94A3B8]">Mean triage response time: 2m 14s</div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-2.5 bg-[#10B981]/15 border border-[#10B981] rounded-[4px] text-[12px] font-mono text-[#10B981] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Filter & Action Bar */}
      <div className="flex items-center justify-between bg-[#111827] border border-[#334155] p-3 rounded-[4px]">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search code, unit, incident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#334155] focus:border-[#06B6D4] text-[#F8FAFC] text-[12px] pl-8 pr-3 py-1.5 rounded-[4px] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            {(['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  soundFx.click();
                  setFilterSeverity(sev);
                }}
                className={`px-3 py-1 rounded-[3px] transition-colors ${
                  filterSeverity === sev
                    ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#94A3B8]">
          SHOWING {filteredList.length} INCIDENT ALARMS
        </div>
      </div>

      {/* Incident Cards Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] font-mono text-[12px] bg-[#111827] border border-[#334155] rounded-[4px]">
            No matching incidents in current filter view
          </div>
        ) : (
          filteredList.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const courier = couriers.find((c) => c.id === alert.courierId);
            const order = orders.find((o) => o.id === alert.orderId);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-[4px] bg-[#111827] transition-all ${
                  alert.resolved
                    ? 'border border-[#334155] opacity-70'
                    : isCritical
                    ? 'border border-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : 'border border-[#F59E0B]'
                }`}
              >
                {/* Header: Code, Timestamp, Severity, Unit */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#334155]/60 pb-2 mb-2.5">
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[11px] font-bold ${
                        isCritical
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]'
                      }`}
                    >
                      {alert.code}
                    </span>

                    <span className="text-[13px] font-bold text-[#F8FAFC]">
                      {alert.title}
                    </span>

                    {alert.acknowledged && !alert.resolved && (
                      <span className="text-[10px] bg-[#06B6D4]/15 text-[#06B6D4] px-1.5 py-0.2 rounded border border-[#06B6D4]/40">
                        ACKNOWLEDGED
                      </span>
                    )}

                    {alert.resolved && (
                      <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.2 rounded border border-[#10B981]/40">
                        RESOLVED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
                    <span>SECTOR: {alert.sector.split(' // ')[0]}</span>
                    <span>•</span>
                    <span className="text-[#F8FAFC]">{alert.timestamp}</span>
                  </div>
                </div>

                {/* Body Message */}
                <p className="text-[13px] text-[#F8FAFC] mb-3 leading-relaxed">
                  {alert.message}
                </p>

                {/* Target Unit & Order Telemetry Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0B0F17] rounded-[4px] border border-[#334155] mb-3 text-[11px] font-mono">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[#94A3B8] block text-[9px]">TARGET COURIER</span>
                      <button
                        onClick={() => onSelectCourier(alert.courierId)}
                        className="text-[#06B6D4] font-bold hover:underline"
                      >
                        {alert.courierId} // {courier?.callsign || 'N/A'}
                      </button>
                    </div>

                    {order && (
                      <div>
                        <span className="text-[#94A3B8] block text-[9px]">AFFECTED ORDER</span>
                        <button
                          onClick={() => {
                            onSelectOrder(order.id);
                            onSelectCourier(alert.courierId);
                          }}
                          className="text-[#F8FAFC] font-bold hover:underline"
                        >
                          {order.id} ({order.cargoType})
                        </button>
                      </div>
                    )}

                    {courier && (
                      <div>
                        <span className="text-[#94A3B8] block text-[9px]">CURRENT TELEMETRY</span>
                        <span className="text-[#F8FAFC]">
                          Speed: {courier.speed.toFixed(1)} km/h • Batt: {courier.battery}% • Temp: {courier.cargoBayTemp.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[#94A3B8] block text-[9px]">RECOMMENDED RESOLUTION</span>
                    <span className="text-[#10B981] font-semibold">{alert.recommendedAction}</span>
                  </div>
                </div>

                {/* Action Trigger Buttons */}
                {!alert.resolved && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAck(alert.id)}
                        className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[11px] font-mono transition-colors"
                      >
                        Acknowledge Incident
                      </button>
                    )}

                    {order && (
                      <button
                        onClick={() => {
                          soundFx.click();
                          onOpenRerouteModal(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06B6D4]/20 hover:bg-[#06B6D4]/30 text-[#06B6D4] border border-[#06B6D4]/50 rounded-[4px] text-[11px] font-mono transition-colors"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Authorize Detour / Re-Route</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] font-bold rounded-[4px] text-[11px] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Resolve & Clear Alert</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
