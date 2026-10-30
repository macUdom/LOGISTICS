import React, { useState } from 'react';
import { CourierUnit, DispatchOrder } from '../types/dispatch';
import { StatusBadge } from './StatusBadge';
import { soundFx } from '../utils/audio';
import {
  Search,
  Filter,
  Download,
  Radio,
  ArrowUpDown,
  CheckSquare,
  Square,
  Gauge,
  Battery,
  ExternalLink,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';

interface FleetGridScreenProps {
  couriers: CourierUnit[];
  orders: DispatchOrder[];
  onSelectCourier: (id: string) => void;
  onSelectOrder: (id: string) => void;
}

export const FleetGridScreen: React.FC<FleetGridScreenProps> = ({
  couriers,
  orders,
  onSelectCourier,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof CourierUnit>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // Sorting handler
  const handleSort = (field: keyof CourierUnit) => {
    soundFx.click();
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & sort couriers
  const filteredCouriers = couriers
    .filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.callsign.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.currentSector.toLowerCase().includes(q) ||
          c.vehicleType.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const toggleSelectAll = () => {
    soundFx.click();
    if (selectedIds.length === filteredCouriers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCouriers.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    soundFx.click();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    soundFx.telemetryPing();
    setBulkNotice(`Bulk execution completed: ${action} applied to ${selectedIds.length} units.`);
    setTimeout(() => setBulkNotice(null), 3500);
  };

  const exportTelemetryCsv = () => {
    soundFx.click();
    const rows = [
      ['Unit ID', 'Callsign', 'Operator', 'Vehicle Type', 'Status', 'Speed (km/h)', 'Battery (%)', 'Temp (°C)', 'SLA %', 'Sector', 'Active Order'],
      ...filteredCouriers.map((c) => [
        c.id,
        c.callsign,
        c.name,
        c.vehicleType,
        c.status,
        c.speed,
        c.battery,
        c.cargoBayTemp,
        c.slaAdherence,
        c.currentSector,
        c.activeOrderId || 'NONE',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleet_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0F17] overflow-hidden select-none p-4 space-y-3">
      {/* Top Filter & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827] border border-[#334155] p-3 rounded-[4px]">
        {/* Search & Status Filters */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by ID, Callsign, Operator, Sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#334155] focus:border-[#06B6D4] text-[#F8FAFC] text-[12px] pl-8 pr-3 py-1.5 rounded-[4px] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            {['ALL', 'ON TIME', 'SLA RISK', 'DELAYED', 'CRITICAL', 'IDLE'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  soundFx.click();
                  setStatusFilter(s);
                }}
                className={`px-2 py-1 rounded-[3px] transition-colors ${
                  statusFilter === s
                    ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#475569] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Right Tools: Density toggle, Export, Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0B0F17] px-2 py-1 border border-[#334155] rounded-[4px] text-[11px] font-mono">
              <span className="text-[#06B6D4] font-bold">{selectedIds.length} SELECTED:</span>
              <button
                onClick={() => handleBulkAction('Ping Telemetry Beacon')}
                className="hover:text-[#10B981] px-1"
              >
                MASS PING
              </button>
              <span>•</span>
              <button
                onClick={() => handleBulkAction('Stationary Hold')}
                className="hover:text-[#F59E0B] px-1"
              >
                HOLD
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`px-2.5 py-1.5 rounded-[4px] border border-[#334155] text-[11px] font-mono transition-colors ${
              isCompact ? 'bg-[#1E293B] text-[#10B981]' : 'bg-[#0B0F17] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
            title="Toggle compact 32px row density"
          >
            {isCompact ? 'COMPACT (32px)' : 'COMFORT (40px)'}
          </button>

          <button
            onClick={exportTelemetryCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[11px] font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {bulkNotice && (
        <div className="p-2 bg-[#10B981]/15 border border-[#10B981] rounded-[4px] text-[11px] font-mono text-[#10B981] animate-in fade-in">
          {bulkNotice}
        </div>
      )}

      {/* High-Density Data Table Container */}
      <div className="flex-1 overflow-auto bg-[#111827] border border-[#334155] rounded-[4px] shadow-sm">
        <table className="w-full text-left border-collapse">
          {/* Header Row: 32px, #0B0F17 */}
          <thead className="sticky top-0 bg-[#0B0F17] border-b border-[#334155] z-10">
            <tr className="h-8 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase font-sans">
              <th className="w-10 px-3 text-center">
                <button onClick={toggleSelectAll} className="align-middle">
                  {selectedIds.length === filteredCouriers.length && filteredCouriers.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#64748B]" />
                  )}
                </button>
              </th>

              <th
                onClick={() => handleSort('id')}
                className="px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>UNIT ID</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th
                onClick={() => handleSort('name')}
                className="px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>OPERATOR</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th className="px-3">STATUS</th>

              <th className="px-3">VEHICLE TYPE</th>

              <th className="px-3">SECTOR</th>

              <th className="px-3">ACTIVE ORDER</th>

              <th
                onClick={() => handleSort('speed')}
                className="px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SPEED</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th
                onClick={() => handleSort('battery')}
                className="px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>BATTERY</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th
                onClick={() => handleSort('cargoBayTemp')}
                className="px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>TEMP</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th
                onClick={() => handleSort('slaAdherence')}
                className="px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>SLA %</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
                </div>
              </th>

              <th className="px-3 text-right">ACTION</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#334155]/50">
            {filteredCouriers.map((courier) => {
              const isSelected = selectedIds.includes(courier.id);
              const activeOrder = orders.find((o) => o.courierId === courier.id);

              return (
                <tr
                  key={courier.id}
                  className={`${
                    isCompact ? 'h-8' : 'h-10'
                  } hover:bg-[#1E293B] transition-colors ${
                    isSelected ? 'bg-[#1E293B]/70' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-3 text-center">
                    <button onClick={() => toggleSelectOne(courier.id)} className="align-middle">
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#475569]" />
                      )}
                    </button>
                  </td>

                  {/* Unit ID */}
                  <td className="px-3 font-mono font-bold text-[12px] text-[#F8FAFC]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#06B6D4]">{courier.id}</span>
                      <span className="text-[10px] text-[#94A3B8] font-normal font-sans">
                        // {courier.callsign}
                      </span>
                    </div>
                  </td>

                  {/* Operator */}
                  <td className="px-3 text-[12px] text-[#F8FAFC]">
                    <div className="flex items-center gap-2">
                      <img
                        src={courier.avatar}
                        alt=""
                        className="w-5 h-5 rounded-[2px] object-cover border border-[#334155]"
                      />
                      <span className="font-medium">{courier.name}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3">
                    <StatusBadge status={courier.status} />
                  </td>

                  {/* Vehicle Type */}
                  <td className="px-3 text-[11px] text-[#94A3B8] font-mono">
                    {courier.vehicleType}
                  </td>

                  {/* Sector */}
                  <td className="px-3 text-[11px] text-[#F8FAFC]">
                    <span className="truncate max-w-[140px] block">
                      {courier.currentSector.split(' // ')[0]}
                    </span>
                  </td>

                  {/* Active Order */}
                  <td className="px-3 text-[11px] font-mono">
                    {activeOrder ? (
                      <button
                        onClick={() => {
                          soundFx.click();
                          onSelectOrder(activeOrder.id);
                          onSelectCourier(courier.id);
                        }}
                        className="text-[#06B6D4] hover:underline"
                      >
                        {activeOrder.id} ({activeOrder.cargoType})
                      </button>
                    ) : (
                      <span className="text-[#64748B]">STANDBY</span>
                    )}
                  </td>

                  {/* Speed (Right aligned in JetBrains Mono) */}
                  <td className="px-3 text-right font-mono text-[12px] text-[#F8FAFC]">
                    {courier.speed.toFixed(1)} <span className="text-[10px] text-[#94A3B8]">km/h</span>
                  </td>

                  {/* Battery (Right aligned in JetBrains Mono) */}
                  <td className="px-3 text-right font-mono text-[12px]">
                    <span
                      className={`font-semibold ${
                        courier.battery < 20
                          ? 'text-[#EF4444]'
                          : courier.battery < 50
                          ? 'text-[#F59E0B]'
                          : 'text-[#10B981]'
                      }`}
                    >
                      {courier.battery}%
                    </span>
                  </td>

                  {/* Cargo Temp (Right aligned in JetBrains Mono) */}
                  <td className="px-3 text-right font-mono text-[12px]">
                    <span
                      className={
                        courier.cargoBayTemp > 6.0 ? 'text-[#EF4444] font-bold' : 'text-[#06B6D4]'
                      }
                    >
                      {courier.cargoBayTemp.toFixed(1)}°C
                    </span>
                  </td>

                  {/* SLA % (Right aligned in JetBrains Mono) */}
                  <td className="px-3 text-right font-mono text-[12px] font-semibold text-[#10B981]">
                    {courier.slaAdherence.toFixed(1)}%
                  </td>

                  {/* Action */}
                  <td className="px-3 text-right">
                    <button
                      onClick={() => {
                        soundFx.click();
                        onSelectCourier(courier.id);
                        if (courier.activeOrderId) onSelectOrder(courier.activeOrderId);
                      }}
                      className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[3px] text-[10px] font-mono transition-colors"
                    >
                      INSPECT
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-2">
        <div>
          SHOWING {filteredCouriers.length} OF {couriers.length} ACTIVE OPERATIONAL UNITS
        </div>
        <div className="flex items-center gap-4">
          <span>
            AVG SPEED: <strong className="text-[#F8FAFC]">41.8 km/h</strong>
          </span>
          <span>
            AVG BATT: <strong className="text-[#10B981]">74.2%</strong>
          </span>
          <span>
            AVG SLA: <strong className="text-[#10B981]">96.4%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
