import React from 'react';
import { OperationalStatus } from '../types/dispatch';

interface StatusBadgeProps {
  status: OperationalStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'ON TIME':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium leading-[14px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981] tracking-tight ${className}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]"></span>
          </span>
          ON TIME
        </span>
      );

    case 'DELAYED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium leading-[14px] bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B] tracking-tight ${className}`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F59E0B]"></span>
          DELAYED
        </span>
      );

    case 'SLA RISK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium leading-[14px] bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B] animate-pulse tracking-tight ${className}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F59E0B]"></span>
          </span>
          SLA RISK
        </span>
      );

    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium leading-[14px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.3)] tracking-tight ${className}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-90"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EF4444]"></span>
          </span>
          CRITICAL
        </span>
      );

    case 'IDLE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-mono font-medium leading-[14px] bg-[#64748B]/15 text-[#94A3B8] border border-[#64748B]/40 tracking-tight ${className}`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#64748B]"></span>
          IDLE
        </span>
      );
  }
};
