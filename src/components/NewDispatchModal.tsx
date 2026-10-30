import React, { useState } from 'react';
import { CourierUnit, DispatchOrder, PriorityLevel, CargoType } from '../types/dispatch';
import { soundFx } from '../utils/audio';
import { X, Plus, Shield, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface NewDispatchModalProps {
  couriers: CourierUnit[];
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (newOrder: DispatchOrder) => void;
}

export const NewDispatchModal: React.FC<NewDispatchModalProps> = ({
  couriers,
  isOpen,
  onClose,
  onCreateOrder,
}) => {
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('P0 - CRITICAL');
  const [cargoType, setCargoType] = useState<CargoType>('COLD CHAIN');
  const [cargoWeight, setCargoWeight] = useState<number>(12.5);
  const [originName, setOriginName] = useState<string>('Bay Central Life Sciences');
  const [destinationName, setDestinationName] = useState<string>('St. Luke Memorial ER');
  const [destAddress, setDestAddress] = useState<string>('3555 Cesar Chavez St, Bay 1');
  const [sector, setSector] = useState<string>('Sector A // Financial & Waterfront');
  const [slaMinutes, setSlaMinutes] = useState<number>(20);
  const [assignedCourierId, setAssignedCourierId] = useState<string>(
    couriers.find((c) => c.status === 'IDLE')?.id || couriers[0]?.id || 'CR-804'
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>(
    'Maintain strict cold chain 2°C–6°C. Hand delivery with biometrics.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundFx.dispatchConfirmed();

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `TRK-${Math.floor(100 + Math.random() * 900)}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    const newOrder: DispatchOrder = {
      id: orderId,
      trackingCode,
      title: title.trim(),
      priority,
      status: 'ON TIME',
      courierId: assignedCourierId,
      sector,
      originName,
      destinationName,
      destAddress,
      slaDeadline: new Date(Date.now() + slaMinutes * 60 * 1000).toISOString(),
      timeRemainingSec: slaMinutes * 60,
      cargoType,
      cargoWeightKg: cargoWeight,
      progressPct: 15,
      specialInstructions,
      createdAt: new Date().toISOString().substring(11, 19) + ' UTC',
      trajectory: [
        [37.788, -122.405],
        [37.791, -122.402],
        [37.794, -122.399],
        [37.796, -122.397],
      ],
      stops: [
        {
          id: `ST-${Date.now()}-1`,
          type: 'PICKUP',
          label: 'Stop 1: Origin Terminal',
          address: originName,
          client: 'Client Central Operations',
          eta: '10:35 UTC',
          status: 'COMPLETED',
          signatureRequired: true,
          coords: [37.788, -122.405],
        },
        {
          id: `ST-${Date.now()}-2`,
          type: 'DROP',
          label: 'Stop 2: Final Delivery Point',
          address: destAddress,
          client: destinationName,
          eta: `10:${35 + slaMinutes} UTC`,
          status: 'CURRENT',
          signatureRequired: true,
          coords: [37.796, -122.397],
        },
      ],
    };

    onCreateOrder(newOrder);
    onClose();
  };

  const selectedCourier = couriers.find((c) => c.id === assignedCourierId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-[#111827] border border-[#475569] rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-3 bg-[#0B0F17] border-b border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]">
              TACTICAL DISPATCH
            </span>
            <h2 className="text-[13px] font-bold text-[#F8FAFC] tracking-wider uppercase font-sans">
              INITIATE NEW PHYSICAL MISSION DISPATCH
            </h2>
          </div>
          <button
            onClick={() => {
              soundFx.click();
              onClose();
            }}
            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-[2px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Manifest Title */}
          <div>
            <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
              MANIFEST / MISSION TITLE
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Critical Organ Transport / Stem Cell Batch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#334155] focus:border-[#06B6D4] text-[#F8FAFC] text-[13px] px-3 py-1.5 rounded-[4px] outline-none"
            />
          </div>

          {/* Grid: Priority, Cargo Type, Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                PRIORITY TIER
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-2.5 py-1.5 rounded-[4px] outline-none font-mono"
              >
                <option value="P0 - CRITICAL">P0 - CRITICAL (Top SLA)</option>
                <option value="P1 - HIGH">P1 - HIGH (Urgent)</option>
                <option value="P2 - STANDARD">P2 - STANDARD</option>
                <option value="P3 - LOW">P3 - LOW (Bulk)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                CARGO CATEGORY
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value as CargoType)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-2.5 py-1.5 rounded-[4px] outline-none font-mono"
              >
                <option value="COLD CHAIN">COLD CHAIN (2°C–6°C)</option>
                <option value="MEDICAL">MEDICAL / SURGICAL</option>
                <option value="HIGH VALUE">HIGH VALUE / SECURE</option>
                <option value="HAZARDOUS">HAZARDOUS (Class 9)</option>
                <option value="STANDARD">STANDARD PACK</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                PAYLOAD MASS (KG)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-2.5 py-1.5 rounded-[4px] outline-none font-mono"
              />
            </div>
          </div>

          {/* Grid: Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                ORIGIN FACILITY
              </label>
              <input
                type="text"
                required
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-3 py-1.5 rounded-[4px] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                DESTINATION FACILITY
              </label>
              <input
                type="text"
                required
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-3 py-1.5 rounded-[4px] outline-none"
              />
            </div>
          </div>

          {/* Destination Address */}
          <div>
            <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
              PHYSICAL WAYPOINT DROP ADDRESS
            </label>
            <input
              type="text"
              required
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-3 py-1.5 rounded-[4px] outline-none"
            />
          </div>

          {/* SLA Window & Courier Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                SLA DELIVERY WINDOW
              </label>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {[15, 20, 30, 45, 60].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => {
                      soundFx.click();
                      setSlaMinutes(mins);
                    }}
                    className={`flex-1 py-1 rounded-[3px] transition-colors border ${
                      slaMinutes === mins
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981] font-bold'
                        : 'bg-[#0B0F17] text-[#94A3B8] border-[#334155] hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-[#94A3B8] font-mono block mb-1">
                ALLOCATE COURIER UNIT
              </label>
              <select
                value={assignedCourierId}
                onChange={(e) => setAssignedCourierId(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#334155] text-[#F8FAFC] text-[12px] px-2.5 py-1.5 rounded-[4px] outline-none font-mono"
              >
                {couriers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} // {c.callsign} ({c.vehicleType} • {c.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Courier Mini-Profile */}
          {selectedCourier && (
            <div className="p-2.5 bg-[#0B0F17] border border-[#334155] rounded-[4px] flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <img
                  src={selectedCourier.avatar}
                  alt=""
                  className="w-7 h-7 rounded-[3px] object-cover border border-[#334155]"
                />
                <div>
                  <span className="text-[#06B6D4] font-bold">{selectedCourier.name}</span>
                  <span className="text-[#94A3B8] block text-[10px]">
                    Batt: {selectedCourier.battery}% • SLA: {selectedCourier.slaAdherence}%
                  </span>
                </div>
              </div>
              <span className="text-[#10B981] font-semibold">OPTIMAL DISPATCH LOCK</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[12px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] font-bold rounded-[4px] text-[12px] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>COMMIT DISPATCH MISSION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
