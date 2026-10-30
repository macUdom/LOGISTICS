import React, { useState } from 'react';
import { SectorZone, CourierUnit, DispatchOrder } from '../types/dispatch';
import { soundFx } from '../utils/audio';
import {
  MapPin,
  Shield,
  Gauge,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
} from 'lucide-react';

interface SectorMatrixScreenProps {
  sectors: SectorZone[];
  couriers: CourierUnit[];
  orders: DispatchOrder[];
  onSelectCourier: (id: string) => void;
  onSelectOrder: (id: string) => void;
}

export const SectorMatrixScreen: React.FC<SectorMatrixScreenProps> = ({
  sectors,
  couriers,
  orders,
  onSelectCourier,
  onSelectOrder,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || 'SEC-A');
  const [sectorConfigs, setSectorConfigs] = useState<Record<string, { speedLimit: number; strictGeofence: boolean }>>({
    'SEC-A': { speedLimit: 45, strictGeofence: true },
    'SEC-B': { speedLimit: 30, strictGeofence: false },
    'SEC-C': { speedLimit: 50, strictGeofence: true },
    'SEC-D': { speedLimit: 40, strictGeofence: true },
  });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const selectedSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];
  const sectorCouriers = couriers.filter((c) => c.currentSector.includes(selectedSector.code) || c.currentSector.includes(selectedSector.name.split(' // ')[0]));

  const toggleGeofence = (id: string) => {
    soundFx.click();
    setSectorConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        strictGeofence: !prev[id]?.strictGeofence,
      },
    }));
    setSaveNotice(`Sector ${id} geofence enforcement updated.`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSpeedLimitChange = (id: string, val: number) => {
    setSectorConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        speedLimit: val,
      },
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F17] overflow-hidden select-none p-4 space-y-4">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {sectors.map((sec) => {
          const config = sectorConfigs[sec.id] || { speedLimit: 40, strictGeofence: true };
          const isSelected = sec.id === selectedSectorId;
          const loadPct = Math.round((sec.activeCouriers / sec.capacityLimit) * 100);

          return (
            <div
              key={sec.id}
              onClick={() => {
                soundFx.click();
                setSelectedSectorId(sec.id);
              }}
              className={`p-3 bg-[#111827] rounded-[4px] cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'border border-[#334155] hover:border-[#475569]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[12px] font-bold text-[#F8FAFC]">
                  {sec.code}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: sec.color }}
                ></span>
              </div>

              <div className="text-[12px] font-semibold text-[#F8FAFC] truncate mb-2">
                {sec.name.split(' // ')[1]}
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                  <span>CAPACITY LOAD</span>
                  <span className="text-[#F8FAFC]">
                    {sec.activeCouriers}/{sec.capacityLimit} ({loadPct}%)
                  </span>
                </div>
                <div className="w-full bg-[#0B0F17] h-1.5 rounded-full overflow-hidden border border-[#334155]/60">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${loadPct}%`,
                      backgroundColor: loadPct > 80 ? '#EF4444' : loadPct > 60 ? '#F59E0B' : '#10B981',
                    }}
                  ></div>
                </div>
              </div>

              {/* Stats: Avg Speed & SLA */}
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono pt-2 border-t border-[#334155]/50">
                <div>
                  <span className="text-[9px] text-[#94A3B8] block">AVG VELOCITY</span>
                  <span className="text-[#06B6D4] font-bold">{sec.avgSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#94A3B8] block">SLA HEALTH</span>
                  <span className="text-[#10B981] font-bold">{sec.slaHealth}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {saveNotice && (
        <div className="p-2 bg-[#10B981]/15 border border-[#10B981] rounded-[4px] text-[11px] font-mono text-[#10B981] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Detail Inspector for Selected Sector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left 2 Cols: Active Units in this Sector */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#334155] rounded-[4px] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#334155] bg-[#0B0F17] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-[#F8FAFC]">
                {selectedSector.name}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#1E293B] text-[#10B981] border border-[#334155]">
                {sectorCouriers.length} UNITS PATROLLING
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#94A3B8]">
              CONGESTION INDEX: <strong className={selectedSector.congestionLevel === 'HIGH' ? 'text-[#EF4444]' : 'text-[#10B981]'}>{selectedSector.congestionLevel}</strong>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#334155]/40 p-1">
            {sectorCouriers.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] font-mono text-[12px]">
                No couriers currently inside this sector polygon
              </div>
            ) : (
              sectorCouriers.map((c) => {
                const activeOrder = orders.find((o) => o.courierId === c.id);

                return (
                  <div
                    key={c.id}
                    className="p-3 hover:bg-[#1E293B] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt=""
                        className="w-8 h-8 rounded-[4px] object-cover border border-[#334155]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-[#06B6D4]">
                            {c.id} // {c.callsign}
                          </span>
                          <span className="text-[12px] text-[#F8FAFC] font-medium">{c.name}</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-mono">
                          {c.vehicleType} • Speed: {c.speed.toFixed(1)} km/h • Batt: {c.battery}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeOrder && (
                        <div className="text-right font-mono text-[11px]">
                          <span className="text-[#10B981] font-bold">{activeOrder.id}</span>
                          <span className="text-[#94A3B8] block">{activeOrder.cargoType}</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          soundFx.click();
                          onSelectCourier(c.id);
                          if (c.activeOrderId) onSelectOrder(c.activeOrderId);
                        }}
                        className="px-2.5 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[11px] font-mono transition-colors"
                      >
                        FOCUS
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Geofence Corridor Rules & Controls */}
        <div className="bg-[#111827] border border-[#334155] rounded-[4px] p-4 flex flex-col space-y-4">
          <div className="border-b border-[#334155] pb-2">
            <h3 className="text-[13px] font-bold text-[#F8FAFC] uppercase font-sans">
              CORRIDOR POLICIES & GEOFENCES
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Configure perimeter bounding constraints and transit caps
            </p>
          </div>

          {/* Speed Limit Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#94A3B8]">SECTOR VELOCITY CEILING</span>
              <span className="text-[#F8FAFC] font-bold">
                {sectorConfigs[selectedSector.id]?.speedLimit || 45} km/h
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={sectorConfigs[selectedSector.id]?.speedLimit || 45}
              onChange={(e) =>
                handleSpeedLimitChange(selectedSector.id, parseInt(e.target.value))
              }
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-[#64748B]">
              <span>20 km/h (Dense Urban)</span>
              <span>70 km/h (Arterial Freeway)</span>
            </div>
          </div>

          {/* Strict Geofence Enforcement Toggle */}
          <div className="p-3 bg-[#0B0F17] border border-[#334155] rounded-[4px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#F8FAFC]">
                Strict Geofence Enforcement
              </span>
              <button
                onClick={() => toggleGeofence(selectedSector.id)}
                className={`p-1.5 rounded-[4px] border transition-colors ${
                  sectorConfigs[selectedSector.id]?.strictGeofence
                    ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]'
                    : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
                }`}
              >
                {sectorConfigs[selectedSector.id]?.strictGeofence ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              {sectorConfigs[selectedSector.id]?.strictGeofence
                ? 'Active: Deviations > 100m trigger immediate Level-1 dispatch alarms.'
                : 'Permissive: Automatic corridor rerouting authorized without controller sign-off.'}
            </p>
          </div>

          {/* Drone Aerial Ceiling */}
          <div className="p-3 bg-[#0B0F17] border border-[#334155] rounded-[4px] space-y-1 text-[11px] font-mono">
            <span className="text-[#94A3B8] block text-[9px]">UAV FLIGHT CORRIDOR</span>
            <div className="flex items-center justify-between text-[#F8FAFC]">
              <span>Altitude Band:</span>
              <strong className="text-[#06B6D4]">300ft - 400ft AGL</strong>
            </div>
            <div className="flex items-center justify-between text-[#F8FAFC]">
              <span>FAA Class B Airspace:</span>
              <span className="text-[#10B981]">WAIVER ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
