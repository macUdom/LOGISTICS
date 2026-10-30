import React, { useState } from 'react';
import { DispatchOrder } from '../types/dispatch';
import { soundFx } from '../utils/audio';
import { X, RotateCw, CheckCircle2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface RerouteModalProps {
  order: DispatchOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReroute: (orderId: string, timeSavedMinutes: number) => void;
}

export const RerouteModal: React.FC<RerouteModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmReroute,
}) => {
  const [selectedCorridor, setSelectedCorridor] = useState<'A' | 'B'>('A');

  if (!isOpen || !order) return null;

  const handleExecute = () => {
    soundFx.dispatchConfirmed();
    onConfirmReroute(order.id, selectedCorridor === 'A' ? 6 : 9);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-[#111827] border border-[#475569] rounded-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3 bg-[#0B0F17] border-b border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#06B6D4]/20 text-[#06B6D4] font-bold border border-[#06B6D4]">
              DYNAMIC DETOUR
            </span>
            <h2 className="text-[13px] font-bold text-[#F8FAFC] tracking-wider uppercase font-sans">
              RE-ROUTE TRANSIT CORRIDOR // {order.id}
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

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="bg-[#0B0F17] p-3 rounded-[4px] border border-[#334155] text-[12px] space-y-1">
            <div className="font-semibold text-[#F8FAFC]">{order.title}</div>
            <div className="text-[11px] font-mono text-[#94A3B8]">
              Destination: {order.destinationName} • Current SLA: {Math.floor(order.timeRemainingSec / 60)}m left
            </div>
          </div>

          <div className="text-[11px] font-mono uppercase text-[#94A3B8]">
            SELECT COMPUTED OPTIMAL DETOUR CORRIDOR:
          </div>

          {/* Option A: Arterial Freeway Bypass */}
          <div
            onClick={() => {
              soundFx.click();
              setSelectedCorridor('A');
            }}
            className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
              selectedCorridor === 'A'
                ? 'bg-[#1E293B] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-[#0B0F17] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px] mb-1 font-mono">
              <span className="font-bold text-[#F8FAFC]">CORRIDOR ALPHA: I-80 ARTERIAL BYPASS</span>
              <span className="text-[#10B981] font-bold">-6 MINS ETA</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Bypasses surface traffic at 4th St. +0.8 km total distance, but recovers 6 minutes on delivery SLA window.
            </p>
          </div>

          {/* Option B: Port / Waterfront Tunnel Route */}
          <div
            onClick={() => {
              soundFx.click();
              setSelectedCorridor('B');
            }}
            className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
              selectedCorridor === 'B'
                ? 'bg-[#1E293B] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-[#0B0F17] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px] mb-1 font-mono">
              <span className="font-bold text-[#F8FAFC]">CORRIDOR BRAVO: WATERFRONT UNDERPASS</span>
              <span className="text-[#10B981] font-bold">-9 MINS ETA</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Fast low-friction arterial. High speed zone (60 km/h) permitted for this vehicle class.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#334155]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[12px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] font-bold rounded-[4px] text-[12px] transition-colors shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>TRANSMIT OVERWRITE ROUTE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
