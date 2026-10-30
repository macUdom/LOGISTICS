import React, { useState, useRef, useEffect } from 'react';
import {
  CourierUnit,
  DispatchOrder,
  SectorZone,
  RouteStop,
} from '../types/dispatch';
import { soundFx } from '../utils/audio';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Radio,
  Truck,
  Bike,
  Bot,
  Plane,
  Eye,
  Crosshair,
  Thermometer,
  Battery,
  Gauge,
  X,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface TacticalMapProps {
  couriers: CourierUnit[];
  orders: DispatchOrder[];
  sectors: SectorZone[];
  selectedCourierId: string | null;
  onSelectCourier: (id: string) => void;
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  onOpenRerouteModal?: (order: DispatchOrder) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  couriers,
  orders,
  sectors,
  selectedCourierId,
  onSelectCourier,
  selectedOrderId,
  onSelectOrder,
  onOpenRerouteModal,
}) => {
  // Map viewport pan & zoom state
  const [zoom, setZoom] = useState<number>(1.1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer toggles
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showStopPins, setShowStopPins] = useState<boolean>(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(true);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);

  // Floating inspection card for clicked unit on map
  const [inspectedCourierId, setInspectedCourierId] = useState<string | null>(null);

  // Sync inspection with selected courier if set
  useEffect(() => {
    if (selectedCourierId) {
      setInspectedCourierId(selectedCourierId);
    }
  }, [selectedCourierId]);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Coordinate projection math
  // SF Bounds: Lat 37.740 to 37.815, Lng -122.455 to -122.380
  const latMin = 37.740;
  const latMax = 37.815;
  const lngMin = -122.455;
  const lngMax = -122.380;

  const projectCoords = (lat: number, lng: number, width = 1000, height = 800) => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * width;
    const y = ((latMax - lat) / (latMax - latMin)) * height;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background, not controls
    if ((e.target as HTMLElement).closest('.map-control-overlay')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    soundFx.click();
    setZoom((prev) => Math.max(0.7, Math.min(2.5, prev + delta)));
  };

  const handleResetView = () => {
    soundFx.click();
    setZoom(1.1);
    setPan({ x: 0, y: 0 });
    setInspectedCourierId(null);
  };

  const inspectedCourier = couriers.find((c) => c.id === inspectedCourierId);
  const inspectedOrder = orders.find((o) => o.courierId === inspectedCourierId);

  // Vehicle icon renderer
  const renderVehicleIcon = (type: string, className = 'w-3.5 h-3.5') => {
    switch (type) {
      case 'Rapid Moto':
        return <Bike className={className} />;
      case 'Heavy Transit':
        return <Truck className={className} />;
      case 'Autonomous Pod':
        return <Bot className={className} />;
      case 'Drone Wing':
        return <Plane className={className} />;
      case 'E-Cargo Van':
      default:
        return <Navigation className={className} />;
    }
  };

  return (
    <div
      ref={mapContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full bg-[#0B0F17] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* Tactical Map SVG Viewport */}
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
            <circle cx="0" cy="0" r="1" fill="#334155" opacity="0.6" />
          </pattern>

          {/* Sub-grid fine pattern */}
          <pattern id="tactical-subgrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#18202F" strokeWidth="0.25" strokeOpacity="0.3" />
          </pattern>

          {/* Radar Sweep Gradient */}
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#10B981" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="crimson-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Grid Background */}
        <rect width="1000" height="800" fill="#0B0F17" />
        <rect width="1000" height="800" fill="url(#tactical-subgrid)" />
        <rect width="1000" height="800" fill="url(#tactical-grid)" />

        {/* Coastline & Bay Water Body Vector */}
        <path
          d="M 680 0 L 720 180 Q 750 260 840 320 T 960 480 L 1000 520 L 1000 0 Z"
          fill="#08101C"
          stroke="#1E293B"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />
        <text x="860" y="140" fill="#334155" fontSize="12" fontFamily="JetBrains Mono" letterSpacing="3">
          SAN FRANCISCO BAY
        </text>

        {/* Major Transit Corridors & Road Network */}
        <g stroke="#1E293B" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          {/* Embarcadero Waterfront */}
          <path d="M 540 120 Q 640 220 720 380 T 810 650" fill="none" stroke="#283548" strokeWidth="2.5" />
          {/* Market Street Arterial (Diagonal) */}
          <path d="M 280 620 L 710 210" fill="none" stroke="#334155" strokeWidth="3" />
          <text x="490" y="420" fill="#475569" fontSize="10" fontFamily="JetBrains Mono" transform="rotate(-43 490 420)">
            MARKET ST ARTERIAL // CORRIDOR 01
          </text>
          {/* Highway 101 / I-80 Bridge Transit */}
          <path d="M 120 760 L 460 520 L 760 380 L 980 340" fill="none" stroke="#334155" strokeWidth="3.5" />
          {/* Mission Street */}
          <path d="M 220 720 L 650 280" fill="none" stroke="#222F43" strokeWidth="2" />
          {/* Van Ness Corridor (North-South) */}
          <path d="M 390 100 L 390 700" fill="none" stroke="#222F43" strokeWidth="2" />
          {/* Geary Blvd (East-West) */}
          <path d="M 80 280 L 680 280" fill="none" stroke="#222F43" strokeWidth="2" />
          {/* Central Expressway */}
          <path d="M 150 460 L 850 460" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>

        {/* Sectors / Geofence Polygons */}
        {showGeofences && (
          <g>
            {sectors.map((sector) => {
              const pointsStr = sector.polygon
                .map((p) => {
                  const pt = projectCoords(p[0], p[1]);
                  return `${pt.x},${pt.y}`;
                })
                .join(' ');

              const centerPt = projectCoords(sector.center[0], sector.center[1]);

              return (
                <g key={sector.id}>
                  {/* Polygon fill & border */}
                  <polygon
                    points={pointsStr}
                    fill={sector.color}
                    fillOpacity="0.05"
                    stroke={sector.color}
                    strokeWidth="1.2"
                    strokeDasharray="6,4"
                    strokeOpacity="0.6"
                  />
                  {/* Sector Label */}
                  <g transform={`translate(${centerPt.x - 60}, ${centerPt.y - 15})`}>
                    <rect
                      width="120"
                      height="24"
                      fill="#0B0F17"
                      fillOpacity="0.85"
                      stroke={sector.color}
                      strokeWidth="1"
                      rx="3"
                    />
                    <text
                      x="60"
                      y="16"
                      fill={sector.color}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {sector.code} // {sector.activeCouriers}/{sector.capacityLimit} UNITS
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* Trajectory Paths for Active Orders */}
        {showTrajectories && (
          <g>
            {orders.map((order) => {
              if (!order.trajectory || order.trajectory.length < 2) return null;
              const pathData = order.trajectory.reduce((acc, coord, idx) => {
                const pt = projectCoords(coord[0], coord[1]);
                return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
              }, '');

              const isSelected = order.id === selectedOrderId || order.courierId === selectedCourierId;
              const strokeColor =
                order.status === 'CRITICAL'
                  ? '#EF4444'
                  : order.status === 'SLA RISK'
                  ? '#F59E0B'
                  : '#06B6D4';

              return (
                <g key={order.id} opacity={isSelected ? 1 : 0.65}>
                  {/* Underlay glow path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '5' : '3'}
                    strokeOpacity={isSelected ? '0.35' : '0.15'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Active animated vector line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray={isSelected ? '6,3' : '4,4'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Courier Breadcrumbs */}
        {showBreadcrumbs && (
          <g>
            {couriers.map((c) =>
              c.breadcrumbs.map((pt, i) => {
                const coords = projectCoords(pt[0], pt[1]);
                return (
                  <circle
                    key={`${c.id}-crumb-${i}`}
                    cx={coords.x}
                    cy={coords.y}
                    r={1.8}
                    fill="#06B6D4"
                    opacity={0.3 + (i / c.breadcrumbs.length) * 0.4}
                  />
                );
              })
            )}
          </g>
        )}

        {/* Route Stops / Waypoints */}
        {showStopPins && (
          <g>
            {orders.map((order) =>
              order.stops.map((stop) => {
                const pt = projectCoords(stop.coords[0], stop.coords[1]);
                const isPickup = stop.type === 'PICKUP';
                const isCurrent = stop.status === 'CURRENT';

                return (
                  <g
                    key={stop.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onClick={() => {
                      soundFx.click();
                      onSelectOrder(order.id);
                      onSelectCourier(order.courierId);
                    }}
                  >
                    {isPickup ? (
                      // Pickup Square Pin
                      <>
                        <rect
                          x="-6"
                          y="-6"
                          width="12"
                          height="12"
                          fill="#0B0F17"
                          stroke="#06B6D4"
                          strokeWidth="1.5"
                          rx="2"
                        />
                        <text
                          x="0"
                          y="3"
                          fill="#06B6D4"
                          fontSize="8"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          P
                        </text>
                      </>
                    ) : (
                      // Delivery Target Pin
                      <>
                        {isCurrent && (
                          <circle cx="0" cy="0" r="10" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.6">
                            <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle cx="0" cy="0" r="6" fill="#0B0F17" stroke="#10B981" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="#10B981" />
                      </>
                    )}
                  </g>
                );
              })
            )}
          </g>
        )}

        {/* Courier Units on Map */}
        <g>
          {couriers.map((courier) => {
            const pt = projectCoords(courier.coords[0], courier.coords[1]);
            const isSelected = courier.id === selectedCourierId || courier.id === inspectedCourierId;
            const statusColor =
              courier.status === 'CRITICAL'
                ? '#EF4444'
                : courier.status === 'SLA RISK' || courier.status === 'DELAYED'
                ? '#F59E0B'
                : courier.status === 'IDLE'
                ? '#64748B'
                : '#10B981';

            return (
              <g
                key={courier.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.click();
                  setInspectedCourierId(courier.id);
                  onSelectCourier(courier.id);
                  if (courier.activeOrderId) {
                    onSelectOrder(courier.activeOrderId);
                  }
                }}
              >
                {/* Radar Pulse beacon */}
                {courier.status !== 'IDLE' && (
                  <circle cx="0" cy="0" r="14" fill="none" stroke={statusColor} strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" values="8;24;8" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Selection ring if active */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="16"
                    fill="none"
                    stroke="#4CD7F6"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '6s' }}
                  />
                )}

                {/* Unit Central Circle Node */}
                <circle
                  cx="0"
                  cy="0"
                  r="9"
                  fill="#111827"
                  stroke={statusColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter={courier.status === 'CRITICAL' ? 'url(#crimson-glow)' : undefined}
                />

                {/* Direction Heading Pointer Vector */}
                <g transform={`rotate(${courier.heading})`}>
                  <polygon points="0,-14 -3,-9 3,-9" fill={statusColor} />
                </g>

                {/* Center dot / icon indicator */}
                <circle cx="0" cy="0" r="3" fill={statusColor} />

                {/* Hover / Persistent Callout Badge */}
                <g transform="translate(12, -10)">
                  <rect
                    width="62"
                    height="17"
                    fill="#0B0F17"
                    fillOpacity="0.92"
                    stroke="#334155"
                    strokeWidth="1"
                    rx="2"
                  />
                  <text
                    x="5"
                    y="11"
                    fill="#F8FAFC"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    {courier.id}
                  </text>
                  <text
                    x="36"
                    y="11"
                    fill={statusColor}
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                  >
                    {Math.round(courier.speed)}k
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating HUD Top Bar: Fleet Telemetry Cluster */}
      <div className="map-control-overlay absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-[#111827]/95 backdrop-blur-[8px] border border-[#334155] rounded-[4px] px-3 py-1.5 pointer-events-auto shadow-md">
          <div className="flex items-center gap-1.5 text-xs">
            <Gauge className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] font-sans">AVG SPEED</span>
            <span className="font-mono text-[12px] font-semibold text-[#F8FAFC]">41.8 KM/H</span>
          </div>

          <div className="h-3 w-[1px] bg-[#334155]"></div>

          <div className="flex items-center gap-1.5 text-xs">
            <Battery className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] font-sans">FLEET BATT</span>
            <span className="font-mono text-[12px] font-semibold text-[#10B981]">74.2%</span>
          </div>

          <div className="h-3 w-[1px] bg-[#334155]"></div>

          <div className="flex items-center gap-1.5 text-xs">
            <Radio className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] font-sans">LATENCY</span>
            <span className="font-mono text-[12px] font-semibold text-[#F8FAFC]">14 MS</span>
          </div>

          <div className="h-3 w-[1px] bg-[#334155] hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] font-sans">RTK FIX</span>
            <span className="font-mono text-[12px] font-semibold text-[#10B981]">±0.04M</span>
          </div>
        </div>

        {/* Map View Mode / Layer Quick Toggle */}
        <div className="flex items-center gap-1 bg-[#111827]/95 backdrop-blur-[8px] border border-[#334155] rounded-[4px] p-1 pointer-events-auto shadow-md">
          <button
            onClick={() => {
              soundFx.click();
              setShowGeofences(!showGeofences);
            }}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-mono tracking-tight transition-colors ${
              showGeofences ? 'bg-[#1E293B] text-[#10B981] font-semibold' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Sector Geofence Boundaries"
          >
            GEOFENCES
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setShowTrajectories(!showTrajectories);
            }}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-mono tracking-tight transition-colors ${
              showTrajectories ? 'bg-[#1E293B] text-[#06B6D4] font-semibold' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Active Route Trajectory Vectors"
          >
            TRAJECTORY
          </button>
          <button
            onClick={() => {
              soundFx.click();
              setShowBreadcrumbs(!showBreadcrumbs);
            }}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-mono tracking-tight transition-colors ${
              showBreadcrumbs ? 'bg-[#1E293B] text-[#c0c1ff] font-semibold' : 'text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Historical GPS Breadcrumb Trails"
          >
            TRAILS
          </button>
        </div>
      </div>

      {/* Floating Inspector HUD Card for Clicked Courier / Order */}
      {inspectedCourier && (
        <div className="map-control-overlay absolute bottom-4 left-4 z-20 w-80 bg-[#111827]/95 backdrop-blur-[8px] border border-[#334155] rounded-[4px] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.65)] pointer-events-auto animate-in fade-in duration-200">
          <div className="flex items-start justify-between border-b border-[#334155] pb-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[14px] text-[#F8FAFC]">
                  {inspectedCourier.id} // {inspectedCourier.callsign}
                </span>
                <StatusBadge status={inspectedCourier.status} />
              </div>
              <div className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                {renderVehicleIcon(inspectedCourier.vehicleType, 'w-3 h-3 text-[#06B6D4]')}
                <span>{inspectedCourier.vehicleType}</span>
                <span>•</span>
                <span className="font-mono text-[#F8FAFC]">{inspectedCourier.name}</span>
              </div>
            </div>
            <button
              onClick={() => setInspectedCourierId(null)}
              className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-[2px]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real-time Telemetry Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3 bg-[#0B0F17] p-2 rounded-[4px] border border-[#334155]">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-semibold text-[#94A3B8] font-sans">SPEED</span>
              <span className="font-mono text-[13px] font-bold text-[#F8FAFC]">
                {inspectedCourier.speed.toFixed(1)} <span className="text-[9px] font-normal text-[#94A3B8]">km/h</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-semibold text-[#94A3B8] font-sans">BATTERY</span>
              <span
                className={`font-mono text-[13px] font-bold ${
                  inspectedCourier.battery < 20
                    ? 'text-[#EF4444]'
                    : inspectedCourier.battery < 50
                    ? 'text-[#F59E0B]'
                    : 'text-[#10B981]'
                }`}
              >
                {inspectedCourier.battery}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-semibold text-[#94A3B8] font-sans">CARGO TEMP</span>
              <span
                className={`font-mono text-[13px] font-bold ${
                  inspectedCourier.cargoBayTemp > 6.0 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
                }`}
              >
                {inspectedCourier.cargoBayTemp.toFixed(1)}°C
              </span>
            </div>
          </div>

          {/* Active Order Context */}
          {inspectedOrder ? (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-mono font-semibold text-[#06B6D4]">{inspectedOrder.id}</span>
                <span className="font-mono text-[#F8FAFC]">
                  {Math.floor(inspectedOrder.timeRemainingSec / 60)}m {inspectedOrder.timeRemainingSec % 60}s SLA
                </span>
              </div>
              <div className="text-[12px] text-[#F8FAFC] font-medium truncate mb-1">
                {inspectedOrder.title}
              </div>
              <div className="w-full bg-[#0B0F17] h-1.5 rounded-full overflow-hidden border border-[#334155]/60">
                <div
                  className="bg-[#10B981] h-full transition-all duration-300"
                  style={{ width: `${inspectedOrder.progressPct}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#94A3B8] mb-3 italic">
              No active order assigned • Staged at Hub
            </div>
          )}

          {/* Action triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.click();
                onSelectCourier(inspectedCourier.id);
                if (inspectedCourier.activeOrderId) {
                  onSelectOrder(inspectedCourier.activeOrderId);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] rounded-[4px] text-[11px] font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-[#10B981]" />
              <span>Inspect in Drawer</span>
            </button>

            {inspectedOrder && onOpenRerouteModal && (
              <button
                onClick={() => {
                  soundFx.click();
                  onOpenRerouteModal(inspectedOrder);
                }}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/40 rounded-[4px] text-[11px] font-mono transition-colors"
                title="Calculate dynamic corridor re-routing"
              >
                <span>Re-Route</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Right Map Navigation & Zoom Controls */}
      <div className="map-control-overlay absolute bottom-4 right-4 flex flex-col gap-1 z-20 pointer-events-auto">
        <button
          onClick={() => handleZoom(0.2)}
          className="w-8 h-8 flex items-center justify-center bg-[#111827]/95 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-[4px] shadow-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-0.2)}
          className="w-8 h-8 flex items-center justify-center bg-[#111827]/95 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-[4px] shadow-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetView}
          className="w-8 h-8 flex items-center justify-center bg-[#111827]/95 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] rounded-[4px] shadow-md transition-colors"
          title="Reset Centering"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lat/Long Telemetry Watermark Corner */}
      <div className="absolute bottom-1 left-2 text-[9px] font-mono text-[#334155] pointer-events-none select-none z-10">
        GRID REF: 37°46'38"N 122°24'08"W • EPSG:3857 METRIC WGS84
      </div>
    </div>
  );
};
