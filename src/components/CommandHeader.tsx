import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  AlertTriangle,
  Zap,
  MapPin,
  ListFilter,
  Grid,
  ShieldAlert,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export type ActiveScreen = 'matrix' | 'fleet' | 'incidents' | 'sectors';

interface CommandHeaderProps {
  activeScreen: ActiveScreen;
  onScreenChange: (screen: ActiveScreen) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  onOpenNewDispatch: () => void;
  onTriggerSimEvent: () => void;
  activeAlertCount: number;
  totalCouriers: number;
  onlineCouriers: number;
  globalSla: number;
  activeOrdersCount: number;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  activeScreen,
  onScreenChange,
  isSimulating,
  onToggleSimulation,
  simSpeed,
  onChangeSimSpeed,
  onOpenNewDispatch,
  onTriggerSimEvent,
  activeAlertCount,
  totalCouriers,
  onlineCouriers,
  globalSla,
  activeOrdersCount,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
    if (!next) soundFx.click();
  };

  const handleNavClick = (screen: ActiveScreen) => {
    soundFx.click();
    onScreenChange(screen);
  };

  return (
    <header className="h-14 bg-[#111827] border-b border-[#334155] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand & Telemetry Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 bg-[#0B0F17] border border-[#334155] rounded-[4px]">
            <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#111827]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold tracking-wider text-[#F8FAFC] uppercase font-sans">
                Telemetry Dispatch Matrix
              </span>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-[2px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                v4.8 LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-signal"></span>
              <span className="font-mono tracking-tight">RTK LOCK // ALL CHANNELS NOMINAL</span>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-[#334155] hidden lg:block"></div>

        {/* Global Operational Metrics Bar */}
        <div className="hidden xl:flex items-center gap-5 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] tracking-wider">GLOBAL SLA</span>
            <span className="font-mono font-semibold text-[#10B981] text-[13px]">
              {globalSla.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] tracking-wider">ACTIVE UNITS</span>
            <span className="font-mono font-semibold text-[#F8FAFC] text-[13px]">
              {onlineCouriers}/{totalCouriers} <span className="text-[10px] text-[#94A3B8] font-normal">ONLINE</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] tracking-wider">EN ROUTE</span>
            <span className="font-mono font-semibold text-[#06B6D4] text-[13px]">
              {activeOrdersCount} <span className="text-[10px] text-[#94A3B8] font-normal">ORDERS</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] tracking-wider">ALERT QUEUE</span>
            <span className={`font-mono font-semibold text-[13px] ${activeAlertCount > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
              {activeAlertCount} {activeAlertCount > 0 ? 'ACTIVE' : 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Main Screen Switcher */}
      <nav className="flex items-center gap-1 bg-[#0B0F17] p-1 border border-[#334155] rounded-[4px]">
        <button
          onClick={() => handleNavClick('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
            activeScreen === 'matrix'
              ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
          title="Mission Control Split-Screen Console"
        >
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span>[1] LIVE MATRIX</span>
        </button>

        <button
          onClick={() => handleNavClick('fleet')}
          className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
            activeScreen === 'fleet'
              ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
          title="High-Density Courier Data Table"
        >
          <Grid className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>[2] FLEET GRID</span>
        </button>

        <button
          onClick={() => handleNavClick('incidents')}
          className={`relative flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
            activeScreen === 'incidents'
              ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
          title="Incident Triage & SLA Command"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>[3] INCIDENT / SLA</span>
          {activeAlertCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#EF4444] text-[10px] font-mono text-white font-bold leading-none animate-pulse">
              {activeAlertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavClick('sectors')}
          className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
            activeScreen === 'sectors'
              ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] shadow-sm'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827]'
          }`}
          title="Sector Geofences & Capacity Corridor"
        >
          <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>[4] SECTORS</span>
        </button>
      </nav>

      {/* Right: Simulation Controls & Action Triggers */}
      <div className="flex items-center gap-2">
        {/* UTC Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0F17] border border-[#334155] rounded-[4px] text-xs font-mono text-[#F8FAFC]">
          <Clock className="w-3 h-3 text-[#06B6D4]" />
          <span>{utcTime || '10:30:00 UTC'}</span>
        </div>

        {/* Audio Mute */}
        <button
          onClick={handleMuteToggle}
          className="p-1.5 bg-[#0B0F17] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-[4px] transition-colors"
          title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#EF4444]" /> : <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />}
        </button>

        {/* Simulation Play / Pause & Speed */}
        <div className="flex items-center bg-[#0B0F17] border border-[#334155] rounded-[4px] p-0.5">
          <button
            onClick={() => {
              soundFx.click();
              onToggleSimulation();
            }}
            className={`p-1 rounded-[3px] transition-colors ${
              isSimulating
                ? 'bg-[#10B981]/20 text-[#10B981]'
                : 'bg-transparent text-[#94A3B8] hover:text-white'
            }`}
            title={isSimulating ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-0.5 px-1 font-mono text-[11px] text-[#94A3B8]">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  soundFx.click();
                  onChangeSimSpeed(speed);
                }}
                className={`px-1 py-0.5 rounded-[2px] transition-colors ${
                  simSpeed === speed ? 'bg-[#1E293B] text-[#10B981] font-semibold' : 'hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Quick Simulation Trigger: Test Incident */}
        <button
          onClick={() => {
            soundFx.warning();
            onTriggerSimEvent();
          }}
          className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[11px] font-mono transition-colors"
          title="Inject real-time telemetry warning / SLA anomaly for testing"
        >
          <Zap className="w-3 h-3 text-[#F59E0B]" />
          <span>INJECT EVENT</span>
        </button>

        {/* Primary Action: + NEW DISPATCH */}
        <button
          onClick={() => {
            soundFx.dispatchConfirmed();
            onOpenNewDispatch();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0B0F17] font-semibold rounded-[4px] text-[12px] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="font-bold">NEW DISPATCH</span>
        </button>
      </div>
    </header>
  );
};
