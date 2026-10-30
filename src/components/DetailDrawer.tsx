import React, { useState } from 'react';
import { CourierUnit, DispatchOrder, TelemetryLog } from '../types/dispatch';
import { StatusBadge } from './StatusBadge';
import { soundFx } from '../utils/audio';
import {
  X,
  Radio,
  Phone,
  Thermometer,
  Battery,
  Gauge,
  Wifi,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Send,
  FileCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface DetailDrawerProps {
  courier: CourierUnit | null;
  order: DispatchOrder | null;
  telemetryLogs: TelemetryLog[];
  onClose: () => void;
  onOpenRerouteModal: (order: DispatchOrder) => void;
  onTriggerSos: (courierId: string) => void;
  onSendCommsMessage: (courierId: string, message: string) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  courier,
  order,
  telemetryLogs,
  onClose,
  onOpenRerouteModal,
  onTriggerSos,
  onSendCommsMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'ROUTE' | 'TELEMETRY' | 'COMMS'>('ROUTE');
  const [commsInput, setCommsInput] = useState<string>('');
  const [commsFeedback, setCommsFeedback] = useState<string | null>(null);

  if (!courier) {
    return (
      <aside className="w-80 md:w-96 bg-[#111827] border-l border-[#334155] flex flex-col items-center justify-center p-8 text-center select-none text-[#64748B] font-mono text-[12px]">
        <Radio className="w-8 h-8 mb-3 opacity-40" />
        <p>SELECT A COURIER OR ORDER TO INSPECT MISSION TELEMETRY</p>
      </aside>
    );
  }

  const handleSendComms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commsInput.trim()) return;
    soundFx.telemetryPing();
    onSendCommsMessage(courier.id, commsInput);
    setCommsFeedback(`DISPATCH ACK: "${commsInput}" sent to ${courier.callsign}`);
    setCommsInput('');
    setTimeout(() => setCommsFeedback(null), 4000);
  };

  const handleSosClick = () => {
    soundFx.criticalAlarm();
    onTriggerSos(courier.id);
  };

  return (
    <aside className="w-80 md:w-[380px] bg-[#111827] border-l border-[#334155] flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Top Header: Unit ID, Callsign & GPS Coordinates */}
      <div className="p-3 border-b border-[#334155] bg-[#0B0F17]/80 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[14px] font-bold text-[#F8FAFC]">
              {courier.id} // {courier.callsign}
            </span>
            <StatusBadge status={courier.status} />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8]">
            <MapPin className="w-3 h-3 text-[#06B6D4]" />
            <span>
              {courier.coords[0].toFixed(4)}°N, {Math.abs(courier.coords[1]).toFixed(4)}°W
            </span>
            <span>•</span>
            <span className="text-[#10B981]">HEADING {courier.heading}°</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.click();
            onClose();
          }}
          className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-[4px] hover:bg-[#1E293B] transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Driver Profile Bar */}
      <div className="p-3 border-b border-[#334155] bg-[#111827] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={courier.avatar}
            alt={courier.name}
            className="w-10 h-10 rounded-[4px] object-cover border border-[#334155]"
          />
          <div>
            <div className="text-[13px] font-bold text-[#F8FAFC]">{courier.name}</div>
            <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <span>{courier.vehicleType}</span>
              <span>•</span>
              <span className="text-[#64748B]">{courier.plate}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end font-mono">
          <span className="text-[9px] uppercase text-[#94A3B8]">SLA ACCURACY</span>
          <span className="text-[13px] font-bold text-[#10B981]">{courier.slaAdherence}%</span>
          <span className="text-[10px] text-[#94A3B8]">{courier.completedDropsToday} drops</span>
        </div>
      </div>

      {/* Detail Tab Navigation: ROUTE / TELEMETRY / COMMS */}
      <div className="flex border-b border-[#334155] bg-[#0B0F17] text-[11px] font-mono">
        <button
          onClick={() => {
            soundFx.click();
            setActiveTab('ROUTE');
          }}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'ROUTE'
              ? 'text-[#10B981] font-bold border-b-2 border-b-[#10B981] bg-[#111827]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          ROUTE // STOPS
        </button>
        <button
          onClick={() => {
            soundFx.click();
            setActiveTab('TELEMETRY');
          }}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'TELEMETRY'
              ? 'text-[#06B6D4] font-bold border-b-2 border-b-[#06B6D4] bg-[#111827]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          TELEMETRY SENSORS
        </button>
        <button
          onClick={() => {
            soundFx.click();
            setActiveTab('COMMS');
          }}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'COMMS'
              ? 'text-[#c0c1ff] font-bold border-b-2 border-b-[#c0c1ff] bg-[#111827]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          COMMS RELAY
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'ROUTE' && (
          <>
            {/* Active Order Card */}
            {order ? (
              <div className="bg-[#0B0F17] border border-[#334155] rounded-[4px] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-bold text-[#06B6D4]">
                    {order.id} // {order.trackingCode}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#1E293B] text-[#F8FAFC] border border-[#475569]">
                    {order.cargoType}
                  </span>
                </div>

                <div className="text-[12px] font-semibold text-[#F8FAFC]">{order.title}</div>

                {/* SLA Clock & Cargo Specs */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#334155]/60 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] block">SLA DEADLINE</span>
                    <span
                      className={`font-bold ${
                        order.timeRemainingSec <= 300 ? 'text-[#EF4444]' : 'text-[#10B981]'
                      }`}
                    >
                      {Math.floor(Math.abs(order.timeRemainingSec) / 60)}m{' '}
                      {Math.abs(order.timeRemainingSec) % 60}s {order.timeRemainingSec <= 0 ? 'OVERDUE' : 'LEFT'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#94A3B8] block">PAYLOAD MASS</span>
                    <span className="font-bold text-[#F8FAFC]">{order.cargoWeightKg} kg</span>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="p-2 bg-[#1E293B]/60 rounded-[3px] border border-[#334155]/80 text-[11px] text-[#94A3B8]">
                    <span className="text-[#06B6D4] font-mono font-semibold">INSTRUCTION: </span>
                    {order.specialInstructions}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#0B0F17] border border-[#334155] rounded-[4px] text-center text-[#94A3B8] text-[11px] font-mono">
                No active order sequence assigned.
              </div>
            )}

            {/* Stop Sequence Progression */}
            {order && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="uppercase font-semibold text-[#94A3B8]">WAYPOINT SEQUENCE</span>
                  <span className="text-[#10B981]">
                    {order.stops.filter((s) => s.status === 'COMPLETED').length}/{order.stops.length} COMPLETE
                  </span>
                </div>

                <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#334155]">
                  {order.stops.map((stop, idx) => {
                    const isCompleted = stop.status === 'COMPLETED';
                    const isCurrent = stop.status === 'CURRENT';

                    return (
                      <div key={stop.id} className="relative group">
                        {/* Status Icon Marker */}
                        <div
                          className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-mono border ${
                            isCompleted
                              ? 'bg-[#10B981] border-[#10B981] text-[#0B0F17]'
                              : isCurrent
                              ? 'bg-[#0B0F17] border-[#06B6D4] text-[#06B6D4] ring-2 ring-[#06B6D4]/30'
                              : 'bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        {/* Stop Details Card */}
                        <div
                          className={`p-2.5 rounded-[4px] border transition-colors ${
                            isCurrent
                              ? 'bg-[#1E293B] border-[#06B6D4]'
                              : isCompleted
                              ? 'bg-[#0B0F17]/60 border-[#334155]/60 opacity-80'
                              : 'bg-[#0B0F17] border-[#334155]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span
                              className={`font-mono font-bold ${
                                isCurrent ? 'text-[#06B6D4]' : 'text-[#F8FAFC]'
                              }`}
                            >
                              {stop.label}
                            </span>
                            <span className="font-mono text-[10px] text-[#94A3B8]">{stop.eta}</span>
                          </div>

                          <div className="text-[11px] text-[#F8FAFC] font-medium">{stop.client}</div>
                          <div className="text-[10px] text-[#94A3B8] truncate">{stop.address}</div>

                          {stop.signatureRequired && (
                            <div className="mt-1.5 flex items-center gap-1 text-[9px] font-mono text-[#F59E0B]">
                              <FileCheck className="w-3 h-3" />
                              <span>BIOMETRIC / POD SIGNATURE MANDATORY</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'TELEMETRY' && (
          <div className="space-y-3 font-mono">
            {/* Live Telemetry Sensors Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Speedometer */}
              <div className="p-2.5 bg-[#0B0F17] border border-[#334155] rounded-[4px]">
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1">
                  <span>VELOCITY</span>
                  <Gauge className="w-3 h-3 text-[#06B6D4]" />
                </div>
                <div className="text-[18px] font-bold text-[#F8FAFC]">
                  {courier.speed.toFixed(1)} <span className="text-[10px] font-normal text-[#94A3B8]">km/h</span>
                </div>
                <div className="w-full bg-[#1E293B] h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#06B6D4] h-full transition-all"
                    style={{ width: `${Math.min(100, (courier.speed / 80) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Battery */}
              <div className="p-2.5 bg-[#0B0F17] border border-[#334155] rounded-[4px]">
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1">
                  <span>BATTERY SOC</span>
                  <Battery className="w-3 h-3 text-[#10B981]" />
                </div>
                <div
                  className={`text-[18px] font-bold ${
                    courier.battery < 20
                      ? 'text-[#EF4444]'
                      : courier.battery < 50
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                  }`}
                >
                  {courier.battery}%
                </div>
                <div className="w-full bg-[#1E293B] h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      courier.battery < 20 ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                    }`}
                    style={{ width: `${courier.battery}%` }}
                  ></div>
                </div>
              </div>

              {/* Cargo Bay Temp */}
              <div className="p-2.5 bg-[#0B0F17] border border-[#334155] rounded-[4px]">
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1">
                  <span>BAY TEMP</span>
                  <Thermometer className="w-3 h-3 text-[#06B6D4]" />
                </div>
                <div
                  className={`text-[18px] font-bold ${
                    courier.cargoBayTemp > 6.0 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
                  }`}
                >
                  {courier.cargoBayTemp.toFixed(1)}°C
                </div>
                <div className="text-[9px] text-[#94A3B8] mt-1">
                  Target: {courier.cargoBayTargetTemp.toFixed(1)}°C (Cold Chain)
                </div>
              </div>

              {/* RF & Latency */}
              <div className="p-2.5 bg-[#0B0F17] border border-[#334155] rounded-[4px]">
                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1">
                  <span>NETWORK PING</span>
                  <Wifi className="w-3 h-3 text-[#6366F1]" />
                </div>
                <div className="text-[18px] font-bold text-[#F8FAFC]">
                  {courier.latencyMs} <span className="text-[10px] font-normal text-[#94A3B8]">ms</span>
                </div>
                <div className="text-[9px] text-[#94A3B8] mt-1">
                  RSSI: {courier.signalDbm} dBm (5G NR)
                </div>
              </div>
            </div>

            {/* Live Packet Log Stream */}
            <div className="border border-[#334155] rounded-[4px] bg-[#0B0F17] p-2 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pb-1 border-b border-[#334155]/60">
                <span className="uppercase">STREAMING TELEMETRY LOGS</span>
                <span className="flex items-center gap-1 text-[#10B981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  LIVE
                </span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto text-[10px]">
                {telemetryLogs
                  .filter((l) => l.courierId === courier.id || l.courierId === 'ALL')
                  .slice(0, 8)
                  .map((log) => (
                    <div key={log.id} className="text-[#94A3B8] font-mono flex items-start gap-1">
                      <span className="text-[#64748B] shrink-0">{log.timestamp}</span>
                      <span
                        className={`shrink-0 font-bold ${
                          log.type === 'WARN'
                            ? 'text-[#EF4444]'
                            : log.type === 'HEARTBEAT'
                            ? 'text-[#10B981]'
                            : 'text-[#06B6D4]'
                        }`}
                      >
                        [{log.type}]
                      </span>
                      <span className="text-[#F8FAFC] truncate">{log.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'COMMS' && (
          <div className="space-y-3 font-sans">
            <div className="bg-[#0B0F17] border border-[#334155] rounded-[4px] p-3 text-[12px] space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#94A3B8]">
                <span>ENCRYPTED RADIO CHANNEL</span>
                <span className="text-[#10B981]">AES-256 GCM</span>
              </div>
              <div className="text-[#F8FAFC]">
                Direct priority voice & digital dispatch uplink to{' '}
                <span className="font-semibold text-[#06B6D4]">{courier.name}</span> ({courier.phone}).
              </div>
            </div>

            {commsFeedback && (
              <div className="p-2 bg-[#10B981]/15 border border-[#10B981] rounded-[4px] text-[11px] font-mono text-[#10B981] animate-in fade-in">
                {commsFeedback}
              </div>
            )}

            <form onSubmit={handleSendComms} className="space-y-2">
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block">
                PRIORITY DISPATCH MESSAGE
              </label>
              <textarea
                value={commsInput}
                onChange={(e) => setCommsInput(e.target.value)}
                placeholder="Type priority dispatch notice or corridor detour instruction..."
                rows={3}
                className="w-full bg-[#0B0F17] border border-[#334155] focus:border-[#06B6D4] text-[#F8FAFC] text-[12px] p-2 rounded-[4px] outline-none placeholder:text-[#64748B]"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[12px] font-mono font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>TRANSMIT DISPATCH PACKET</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Persistent Tactical Action Footer */}
      <div className="p-3 border-t border-[#334155] bg-[#0B0F17] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Primary Action: Re-Route */}
          {order && (
            <button
              onClick={() => {
                soundFx.click();
                onOpenRerouteModal(order);
              }}
              className="flex items-center justify-center gap-1.5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] font-bold text-[12px] rounded-[4px] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>RE-ROUTE CORRIDOR</span>
            </button>
          )}

          {/* Secondary Action: Comms Relay */}
          <button
            onClick={() => {
              soundFx.telemetryPing();
              setActiveTab('COMMS');
            }}
            className="flex items-center justify-center gap-1.5 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] text-[12px] font-medium rounded-[4px] transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>DIRECT COMMS</span>
          </button>
        </div>

        {/* Destructive / SOS Override Button */}
        <button
          onClick={handleSosClick}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-[12px] rounded-[4px] transition-colors shadow-[0_0_12px_rgba(239,68,68,0.3)]"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SOS EMERGENCY OVERRIDE</span>
        </button>
      </div>
    </aside>
  );
};
