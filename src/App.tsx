/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CourierUnit,
  DispatchOrder,
  IncidentAlert,
  SectorZone,
  TelemetryLog,
} from './types/dispatch';
import {
  INITIAL_COURIERS,
  INITIAL_ORDERS,
  INITIAL_SECTORS,
  INITIAL_ALERTS,
  INITIAL_LOGS,
} from './data/mockData';
import { CommandHeader, ActiveScreen } from './components/CommandHeader';
import { TacticalMap } from './components/TacticalMap';
import { DispatchQueuePanel } from './components/DispatchQueuePanel';
import { DetailDrawer } from './components/DetailDrawer';
import { FleetGridScreen } from './components/FleetGridScreen';
import { IncidentCommandScreen } from './components/IncidentCommandScreen';
import { SectorMatrixScreen } from './components/SectorMatrixScreen';
import { NewDispatchModal } from './components/NewDispatchModal';
import { RerouteModal } from './components/RerouteModal';
import { soundFx } from './utils/audio';

export default function App() {
  // Master State
  const [couriers, setCouriers] = useState<CourierUnit[]>(INITIAL_COURIERS);
  const [orders, setOrders] = useState<DispatchOrder[]>(INITIAL_ORDERS);
  const [sectors, setSectors] = useState<SectorZone[]>(INITIAL_SECTORS);
  const [alerts, setAlerts] = useState<IncidentAlert[]>(INITIAL_ALERTS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);

  // Selected Entities
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>('CR-804');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-9412');

  // Navigation & Modals
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('matrix');
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState<boolean>(false);
  const [rerouteOrder, setRerouteOrder] = useState<DispatchOrder | null>(null);

  // Simulation Controls
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Simulation Tick Effect
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(200, 1000 / simSpeed);

    const timer = setInterval(() => {
      // 1. Advance Orders Countdown & Progress
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          const nextSec = order.timeRemainingSec - 1;
          const nextProgress = Math.min(100, order.progressPct + (Math.random() * 0.15 + 0.05));
          let nextStatus = order.status;

          if (nextSec <= 0 && nextStatus !== 'CRITICAL') {
            nextStatus = 'DELAYED';
          } else if (nextSec <= 300 && nextStatus === 'ON TIME') {
            nextStatus = 'SLA RISK';
          }

          return {
            ...order,
            timeRemainingSec: nextSec,
            progressPct: Math.round(nextProgress * 10) / 10,
            status: nextStatus,
          };
        })
      );

      // 2. Advance Couriers Along Coordinates
      setCouriers((prevCouriers) =>
        prevCouriers.map((courier) => {
          if (courier.status === 'IDLE' || courier.speed === 0) return courier;

          // Subtle coordinate drift along current heading
          const rad = (courier.heading * Math.PI) / 180;
          const stepDist = 0.00008 * (courier.speed / 40);
          const nextLat = courier.coords[0] + Math.cos(rad) * stepDist;
          const nextLng = courier.coords[1] + Math.sin(rad) * stepDist;

          // Minor realistic speed fluctuation
          const speedDelta = (Math.random() - 0.5) * 1.5;
          const nextSpeed = Math.max(5, Math.min(80, courier.speed + speedDelta));

          // Battery trickle
          const nextBattery = Math.max(1, courier.battery - 0.002);

          // Update breadcrumbs periodically
          const breadcrumbs =
            Math.random() > 0.8
              ? [...courier.breadcrumbs.slice(-5), [nextLat, nextLng] as [number, number]]
              : courier.breadcrumbs;

          return {
            ...courier,
            coords: [nextLat, nextLng],
            speed: Math.round(nextSpeed * 10) / 10,
            battery: Math.round(nextBattery * 10) / 10,
            breadcrumbs,
          };
        })
      );

      // 3. Periodic Telemetry Stream Event Log
      if (Math.random() > 0.6) {
        const randomCourier = couriers[Math.floor(Math.random() * couriers.length)];
        const now = new Date();
        const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
          now.getUTCMinutes()
        ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(
          now.getUTCMilliseconds()
        ).padStart(3, '0')}`;

        const logTypes: Array<'PACKET' | 'EVENT' | 'HEARTBEAT'> = ['PACKET', 'EVENT', 'HEARTBEAT'];
        const type = logTypes[Math.floor(Math.random() * logTypes.length)];

        let msg = '';
        if (type === 'PACKET') {
          msg = `GPS RTK Fix Ack (${randomCourier.coords[0].toFixed(4)}N, ${Math.abs(
            randomCourier.coords[1]
          ).toFixed(4)}W) • Spd: ${randomCourier.speed}km/h`;
        } else if (type === 'HEARTBEAT') {
          msg = `Telemetry Stream Nominal • Batt: ${randomCourier.battery}% • Temp: ${randomCourier.cargoBayTemp}°C`;
        } else {
          msg = `Waypoint Telemetry Synced • Heading ${randomCourier.heading}°`;
        }

        const newLog: TelemetryLog = {
          id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          timestamp: timeStr,
          type,
          courierId: randomCourier.id,
          message: msg,
          latency: Math.floor(Math.random() * 20 + 8),
        };

        setTelemetryLogs((prev) => [newLog, ...prev.slice(0, 40)]);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, couriers]);

  // Handler: Select Courier & optionally select their active order
  const handleSelectCourier = (courierId: string) => {
    setSelectedCourierId(courierId);
    const courier = couriers.find((c) => c.id === courierId);
    if (courier && courier.activeOrderId) {
      setSelectedOrderId(courier.activeOrderId);
    }
  };

  // Handler: Select Order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order && order.courierId) {
      setSelectedCourierId(order.courierId);
    }
  };

  // Handler: Create New Dispatch
  const handleCreateOrder = (newOrder: DispatchOrder) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update assigned courier status & order linkage
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === newOrder.courierId
          ? {
              ...c,
              activeOrderId: newOrder.id,
              status: 'ON TIME',
              speed: c.speed === 0 ? 35 : c.speed,
            }
          : c
      )
    );

    // Switch to matrix view and focus
    setActiveScreen('matrix');
    setSelectedOrderId(newOrder.id);
    setSelectedCourierId(newOrder.courierId);

    // Add log
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
      now.getUTCMinutes()
    ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.000`;

    setTelemetryLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: timeStr,
        type: 'EVENT',
        courierId: newOrder.courierId,
        message: `DISPATCH CREATED: ${newOrder.id} (${newOrder.title}) assigned to ${newOrder.courierId}`,
        latency: 12,
      },
      ...prev,
    ]);
  };

  // Handler: Acknowledge Alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  // Handler: Resolve Alert
  const handleResolveAlert = (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;

    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true, acknowledged: true } : a))
    );

    // If courier was critical/delayed, restore to on time
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === alert.courierId
          ? {
              ...c,
              status: 'ON TIME',
              speed: c.speed === 0 ? 38 : c.speed,
              cargoBayTemp: c.cargoBayTargetTemp,
            }
          : c
      )
    );
  };

  // Handler: Dynamic Detour / Re-Route Order
  const handleConfirmReroute = (orderId: string, timeSavedMinutes: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              timeRemainingSec: o.timeRemainingSec + timeSavedMinutes * 60,
              status: 'ON TIME',
            }
          : o
      )
    );

    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
      now.getUTCMinutes()
    ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.100`;

    setTelemetryLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: timeStr,
        type: 'EVENT',
        courierId: 'ALL',
        message: `ROUTE RE-CALCULATED: ${orderId} corridor detour approved (-${timeSavedMinutes}m delta)`,
        latency: 10,
      },
      ...prev,
    ]);
  };

  // Handler: SOS Emergency Override Trigger
  const handleTriggerSos = (courierId: string) => {
    const courier = couriers.find((c) => c.id === courierId);
    if (!courier) return;

    const newAlert: IncidentAlert = {
      id: `ALT-SOS-${Date.now()}`,
      code: 'SOS-001',
      severity: 'CRITICAL',
      courierId: courier.id,
      orderId: courier.activeOrderId || undefined,
      title: `SOS EMERGENCY OVERRIDE // ${courier.callsign}`,
      message: `Emergency distress beacon triggered by dispatcher for ${courier.name}. Unit halted, local emergency response relay activated.`,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      acknowledged: false,
      resolved: false,
      sector: courier.currentSector,
      recommendedAction: 'Immediate high-priority escort dispatch and payload secure team deployment.',
    };

    setAlerts((prev) => [newAlert, ...prev]);

    setCouriers((prev) =>
      prev.map((c) => (c.id === courierId ? { ...c, status: 'CRITICAL', speed: 0 } : c))
    );
  };

  // Handler: Direct Comms Message Sent
  const handleSendCommsMessage = (courierId: string, message: string) => {
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(
      now.getUTCMinutes()
    ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.440`;

    setTelemetryLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: timeStr,
        type: 'EVENT',
        courierId,
        message: `DISPATCH RADIO TX [${courierId}]: "${message}"`,
        latency: 14,
      },
      ...prev,
    ]);
  };

  // Handler: Quick Trigger Test Incident
  const handleTriggerSimEvent = () => {
    const activeCouriersList = couriers.filter((c) => c.status === 'ON TIME');
    const targetCourier = activeCouriersList.length > 0 ? activeCouriersList[0] : couriers[0];

    const newAlert: IncidentAlert = {
      id: `ALT-INJECT-${Date.now()}`,
      code: 'GEOFENCE-CORRIDOR-DEV',
      severity: 'WARNING',
      courierId: targetCourier.id,
      orderId: targetCourier.activeOrderId || undefined,
      title: `Corridor Obstruction Spike // ${targetCourier.id}`,
      message: `Sudden arterial lane closure reported in ${targetCourier.currentSector.split(' // ')[0]}. Pacing degraded.`,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      acknowledged: false,
      resolved: false,
      sector: targetCourier.currentSector,
      recommendedAction: 'Recommend dynamic re-route via secondary freeway bypass.',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setCouriers((prev) =>
      prev.map((c) => (c.id === targetCourier.id ? { ...c, status: 'SLA RISK' } : c))
    );
  };

  // Selected Entities
  const selectedCourier = couriers.find((c) => c.id === selectedCourierId) || null;
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Global KPIs
  const unresolvedAlertCount = alerts.filter((a) => !a.resolved).length;
  const onlineCouriersCount = couriers.filter((c) => c.status !== 'IDLE').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELAYED').length;
  const globalSlaAdherence =
    couriers.reduce((acc, c) => acc + c.slaAdherence, 0) / couriers.length;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-[#F8FAFC] overflow-hidden select-none font-sans">
      {/* Top Telemetry Command Bar */}
      <CommandHeader
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        onOpenNewDispatch={() => setIsNewDispatchOpen(true)}
        onTriggerSimEvent={handleTriggerSimEvent}
        activeAlertCount={unresolvedAlertCount}
        totalCouriers={couriers.length}
        onlineCouriers={onlineCouriersCount}
        globalSla={globalSlaAdherence}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Screen 1: LIVE MATRIX (Default 3-Panel Console) */}
        {activeScreen === 'matrix' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left Panel: Dispatch Queue & Alerts Stack (320px–360px) */}
            <DispatchQueuePanel
              orders={orders}
              couriers={couriers}
              alerts={alerts}
              selectedOrderId={selectedOrderId}
              onSelectOrder={handleSelectOrder}
              onSelectCourier={handleSelectCourier}
              onOpenNewDispatch={() => setIsNewDispatchOpen(true)}
              onOpenRerouteModal={(order) => setRerouteOrder(order)}
            />

            {/* Center Viewport: Interactive Geospatial Vector Visualizer */}
            <div className="flex-1 h-full relative overflow-hidden bg-[#0B0F17]">
              <TacticalMap
                couriers={couriers}
                orders={orders}
                sectors={sectors}
                selectedCourierId={selectedCourierId}
                onSelectCourier={handleSelectCourier}
                selectedOrderId={selectedOrderId}
                onSelectOrder={handleSelectOrder}
                onOpenRerouteModal={(order) => setRerouteOrder(order)}
              />
            </div>

            {/* Right Drawer: Dynamic Courier & Telemetry Detail Pane */}
            <DetailDrawer
              courier={selectedCourier}
              order={selectedOrder}
              telemetryLogs={telemetryLogs}
              onClose={() => setSelectedCourierId(null)}
              onOpenRerouteModal={(order) => setRerouteOrder(order)}
              onTriggerSos={handleTriggerSos}
              onSendCommsMessage={handleSendCommsMessage}
            />
          </div>
        )}

        {/* Screen 2: FLEET GRID (High-Density 32px Data Table) */}
        {activeScreen === 'fleet' && (
          <FleetGridScreen
            couriers={couriers}
            orders={orders}
            onSelectCourier={(id) => {
              handleSelectCourier(id);
              setActiveScreen('matrix');
            }}
            onSelectOrder={(id) => {
              handleSelectOrder(id);
              setActiveScreen('matrix');
            }}
          />
        )}

        {/* Screen 3: INCIDENT & SLA COMMAND */}
        {activeScreen === 'incidents' && (
          <IncidentCommandScreen
            alerts={alerts}
            couriers={couriers}
            orders={orders}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onSelectCourier={(id) => {
              handleSelectCourier(id);
              setActiveScreen('matrix');
            }}
            onSelectOrder={(id) => {
              handleSelectOrder(id);
              setActiveScreen('matrix');
            }}
            onOpenRerouteModal={(order) => setRerouteOrder(order)}
          />
        )}

        {/* Screen 4: SECTORS & CORRIDORS MATRIX */}
        {activeScreen === 'sectors' && (
          <SectorMatrixScreen
            sectors={sectors}
            couriers={couriers}
            orders={orders}
            onSelectCourier={(id) => {
              handleSelectCourier(id);
              setActiveScreen('matrix');
            }}
            onSelectOrder={(id) => {
              handleSelectOrder(id);
              setActiveScreen('matrix');
            }}
          />
        )}
      </main>

      {/* New Dispatch Modal */}
      <NewDispatchModal
        couriers={couriers}
        isOpen={isNewDispatchOpen}
        onClose={() => setIsNewDispatchOpen(false)}
        onCreateOrder={handleCreateOrder}
      />

      {/* Re-Route Corridor Detour Modal */}
      <RerouteModal
        order={rerouteOrder}
        isOpen={Boolean(rerouteOrder)}
        onClose={() => setRerouteOrder(null)}
        onConfirmReroute={handleConfirmReroute}
      />
    </div>
  );
}
