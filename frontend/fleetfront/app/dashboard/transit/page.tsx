"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Map, MapPin, Navigation, Play, Plus, Loader2, X, Square, RefreshCw } from 'lucide-react'
import { transitAPI, tripAPI, fleetAPI, staffAPI } from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────
interface Route { id: string; name: string; stops: { sequence: number; stop: { id: string; name: string; latitude: number; longitude: number } }[] }
interface Stop { id: string; name: string; latitude: number; longitude: number }
interface Trip { id: string; status: string; scheduledStart: string; routeId: string; vehicleId: string; driverId: string; route?: any; vehicle?: any; driver?: any }
interface Vehicle { id: string; vin: string; type: string; licensePlate: string }
interface Staff { id: string; name: string; role: string; driverProfile?: { id: string } }

// ─── Helper Styles ───────────────────────────────────────────────────
const inputCls = "w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light text-sm placeholder:text-[#C4BFAF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
const labelCls = "text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block"
const secHdrCls = "text-2xl font-['Playfair_Display',_serif] mb-8 pb-4 border-b border-[#1A1A1A]"
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:   'border-[#DCD7CB] text-[#8C877D]',
  IN_PROGRESS: 'border-amber-400 text-amber-700 bg-amber-50',
  COMPLETED:   'border-green-400 text-green-700 bg-green-50',
  CANCELLED:   'border-red-300 text-red-600 bg-red-50',
}

export default function TransitOperations() {
  // ── Data State ──
  const [routes,   setRoutes]   = useState<Route[]>([])
  const [stops,    setStops]    = useState<Stop[]>([])
  const [trips,    setTrips]    = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers,  setDrivers]  = useState<Staff[]>([])

  // ── UI State ──
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [loadingTrips,  setLoadingTrips]  = useState(true)
  const [routeError,    setRouteError]    = useState('')
  const [stopError,     setStopError]     = useState('')
  const [tripError,     setTripError]     = useState('')
  const [showDispatch,  setShowDispatch]  = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // ── Form State ──
  const [newRoute, setNewRoute] = useState({ name: '' })
  const [newStop,  setNewStop]  = useState({ name: '', latitude: '', longitude: '' })
  const [dispatchForm, setDispatchForm] = useState({ routeId: '', vehicleId: '', driverId: '', scheduledStart: '' })

  // ─── Fetch All Data ───────────────────────────────────────────────
  const fetchRoutes = useCallback(async () => {
    setLoadingRoutes(true)
    const [routesRes, stopsRes] = await Promise.all([transitAPI.getRoutes(), transitAPI.getStops()])
    if (!routesRes.error && routesRes.data) setRoutes(routesRes.data)
    if (!stopsRes.error && stopsRes.data)   setStops(stopsRes.data)
    setLoadingRoutes(false)
  }, [])

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true)
    const [tripsRes, vehiclesRes, staffRes] = await Promise.all([
      tripAPI.getAll(),
      fleetAPI.getAll(),
      staffAPI.getAll(),
    ])
    if (!tripsRes.error   && tripsRes.data)    setTrips(tripsRes.data)
    if (!vehiclesRes.error && vehiclesRes.data) setVehicles(vehiclesRes.data)
    if (!staffRes.error   && staffRes.data)     setDrivers(staffRes.data.filter((s: Staff) => s.role === 'DRIVER' && s.driverProfile))
    setLoadingTrips(false)
  }, [])

  useEffect(() => { fetchRoutes(); fetchTrips() }, [fetchRoutes, fetchTrips])

  // ─── Create Route ─────────────────────────────────────────────────
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault(); setRouteError('')
    if (!newRoute.name.trim()) return
    const res = await transitAPI.createRoute(newRoute.name.trim())
    if (res.error) { setRouteError(res.error); return }
    setNewRoute({ name: '' })
    fetchRoutes()
  }

  // ─── Create Stop ──────────────────────────────────────────────────
  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault(); setStopError('')
    const lat = parseFloat(newStop.latitude), lng = parseFloat(newStop.longitude)
    if (!newStop.name.trim() || isNaN(lat) || isNaN(lng)) {
      setStopError('Name, Latitude and Longitude are required.'); return
    }
    const res = await transitAPI.createStop({ name: newStop.name.trim(), latitude: lat, longitude: lng })
    if (res.error) { setStopError(res.error); return }
    setNewStop({ name: '', latitude: '', longitude: '' })
    fetchRoutes()
  }

  // ─── Schedule Trip ────────────────────────────────────────────────
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault(); setTripError('')
    const { routeId, vehicleId, driverId, scheduledStart } = dispatchForm
    if (!routeId || !vehicleId || !driverId || !scheduledStart) {
      setTripError('All fields are required to dispatch a trip.'); return
    }
    const res = await tripAPI.schedule({ routeId, vehicleId, driverId, scheduledStart: new Date(scheduledStart).toISOString() })
    if (res.error) { setTripError(res.error); return }
    setShowDispatch(false)
    setDispatchForm({ routeId: '', vehicleId: '', driverId: '', scheduledStart: '' })
    fetchTrips()
  }

  // ─── Trip Status Actions ──────────────────────────────────────────
  const doTripAction = async (tripId: string, action: 'start' | 'end' | 'cancel') => {
    setActionLoading(prev => ({ ...prev, [tripId]: true }))
    const fn = action === 'start' ? tripAPI.start : action === 'end' ? tripAPI.end : tripAPI.cancel
    await fn(tripId)
    await fetchTrips()
    setActionLoading(prev => ({ ...prev, [tripId]: false }))
  }

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1A1A1A] font-sans p-6 md:p-12 lg:p-16">

      {/* Page Header */}
      <div className="mb-16">
        <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8C877D] mb-4">Operations Console</h3>
        <h1 className="text-5xl font-['Playfair_Display',_serif] tracking-tight">Transit &amp; Dispatch.</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* ══════════════════════════════════════
            LEFT COLUMN — Routes & Stops
            ══════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col gap-16">

          {/* Create Route */}
          <section>
            <h2 className={secHdrCls}>
              <Map className="inline-block w-5 h-5 mr-3 mb-1" strokeWidth={1} />
              Route Architecture
            </h2>
            <form onSubmit={handleCreateRoute} className="flex flex-col gap-6">
              {routeError && <p className="text-[#8B3A3A] bg-[#FDF4F4] border border-[#F4DADA] px-4 py-2 text-xs uppercase tracking-widest">{routeError}</p>}
              <div>
                <label className={labelCls}>Route Designation</label>
                <input type="text" required placeholder="e.g., Northern Corridor"
                  value={newRoute.name} onChange={e => setNewRoute({ name: e.target.value })}
                  className={inputCls} />
              </div>
              <button type="submit" className="mt-2 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors flex items-center justify-center gap-2">
                <Plus className="w-3 h-3" strokeWidth={1.5} /> Establish Route
              </button>
            </form>

            {/* Routes List */}
            {loadingRoutes ? (
              <div className="flex items-center gap-2 mt-8 text-[#8C877D]"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs uppercase tracking-widest">Loading routes…</span></div>
            ) : routes.length > 0 && (
              <div className="mt-8 flex flex-col gap-3">
                {routes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 border border-[#DCD7CB] bg-[#FDFCF9]">
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mt-1">{r.stops.length} Stop{r.stops.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => transitAPI.deleteRoute(r.id).then(fetchRoutes)}
                      className="text-[#C4BFAF] hover:text-[#8B3A3A] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Create Stop */}
          <section>
            <h2 className={secHdrCls}>
              <MapPin className="inline-block w-5 h-5 mr-3 mb-1" strokeWidth={1} />
              Waypoint Mapping
            </h2>
            <form onSubmit={handleCreateStop} className="flex flex-col gap-6">
              {stopError && <p className="text-[#8B3A3A] bg-[#FDF4F4] border border-[#F4DADA] px-4 py-2 text-xs uppercase tracking-widest">{stopError}</p>}
              <div>
                <label className={labelCls}>Stop Name</label>
                <input type="text" required placeholder="e.g., Depot Alpha"
                  value={newStop.name} onChange={e => setNewStop({ ...newStop, name: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Latitude</label>
                  <input type="number" step="any" required placeholder="19.0760"
                    value={newStop.latitude} onChange={e => setNewStop({ ...newStop, latitude: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Longitude</label>
                  <input type="number" step="any" required placeholder="72.8777"
                    value={newStop.longitude} onChange={e => setNewStop({ ...newStop, longitude: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <button type="submit" className="mt-2 bg-[#FDFCF9] border border-[#DCD7CB] text-[#1A1A1A] hover:border-[#1A1A1A] py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors flex items-center justify-center gap-2">
                <Plus className="w-3 h-3" strokeWidth={1.5} /> Register Waypoint
              </button>
            </form>

            {/* Stops List */}
            {stops.length > 0 && (
              <div className="mt-8 flex flex-col gap-2">
                <p className={labelCls}>Registered Stops ({stops.length})</p>
                {stops.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 border border-[#DCD7CB] bg-[#FDFCF9]">
                    <p className="text-sm font-light">{s.name}</p>
                    <span className="text-[10px] font-mono text-[#C4BFAF]">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ══════════════════════════════════════
            RIGHT COLUMN — Dispatch Board
            ══════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-[#FDFCF9] border border-[#DCD7CB] p-8 md:p-12">

          <div className="flex justify-between items-end mb-12 border-b border-[#DCD7CB] pb-6">
            <h2 className="text-3xl font-['Playfair_Display',_serif]">
              <Navigation className="inline-block w-6 h-6 mr-3 mb-1 text-[#8C877D]" strokeWidth={1} />
              Active Dispatch Board
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={fetchTrips} className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDispatch(true)}
                className="bg-[#1A1A1A] text-[#F9F8F4] px-6 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#333] transition-colors flex items-center gap-2">
                <Plus className="w-3 h-3" strokeWidth={2} /> New Trip
              </button>
            </div>
          </div>

          {/* Dispatch Form Modal */}
          {showDispatch && (
            <div className="mb-10 p-6 border border-[#1A1A1A] bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-['Playfair_Display',_serif] text-xl">Schedule New Trip</h3>
                <button onClick={() => setShowDispatch(false)}><X className="w-4 h-4 text-[#8C877D]" /></button>
              </div>
              <form onSubmit={handleDispatch} className="flex flex-col gap-5">
                {tripError && <p className="text-[#8B3A3A] bg-[#FDF4F4] border border-[#F4DADA] px-4 py-2 text-xs uppercase tracking-widest">{tripError}</p>}

                <div>
                  <label className={labelCls}>Route</label>
                  <select value={dispatchForm.routeId} onChange={e => setDispatchForm(p => ({ ...p, routeId: e.target.value }))}
                    className="w-full border-b border-[#DCD7CB] py-3 text-sm bg-transparent focus:outline-none focus:border-[#1A1A1A]">
                    <option value="">Select a route…</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Vehicle</label>
                  <select value={dispatchForm.vehicleId} onChange={e => setDispatchForm(p => ({ ...p, vehicleId: e.target.value }))}
                    className="w-full border-b border-[#DCD7CB] py-3 text-sm bg-transparent focus:outline-none focus:border-[#1A1A1A]">
                    <option value="">Select a vehicle…</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.type} — {v.licensePlate}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Driver</label>
                  <select value={dispatchForm.driverId} onChange={e => setDispatchForm(p => ({ ...p, driverId: e.target.value }))}
                    className="w-full border-b border-[#DCD7CB] py-3 text-sm bg-transparent focus:outline-none focus:border-[#1A1A1A]">
                    <option value="">Select a driver…</option>
                    {drivers.map(d => <option key={d.driverProfile!.id} value={d.driverProfile!.id}>{d.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Scheduled Departure</label>
                  <input type="datetime-local" required
                    value={dispatchForm.scheduledStart} onChange={e => setDispatchForm(p => ({ ...p, scheduledStart: e.target.value }))}
                    className={inputCls} />
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 bg-[#1A1A1A] text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#333] transition-colors">
                    Dispatch Trip
                  </button>
                  <button type="button" onClick={() => setShowDispatch(false)}
                    className="px-8 border border-[#DCD7CB] text-[10px] uppercase tracking-[0.2em] font-bold hover:border-[#1A1A1A] transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Trip Cards */}
          {loadingTrips ? (
            <div className="flex items-center gap-2 text-[#8C877D]"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs uppercase tracking-widest">Loading trips…</span></div>
          ) : trips.length === 0 ? (
            <p className="text-sm text-[#8C877D] font-light italic">No trips logged in the ledger.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {trips.map(trip => {
                const isLoading = actionLoading[trip.id]
                return (
                  <div key={trip.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-[#DCD7CB] bg-[#F9F8F4] hover:border-[#1A1A1A] transition-colors">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">{trip.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[8px] uppercase tracking-wider px-2 py-1 border ${STATUS_COLORS[trip.status] || 'border-[#DCD7CB] text-[#8C877D]'}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-lg font-['Playfair_Display',_serif]">
                        {routes.find(r => r.id === trip.routeId)?.name || 'Route'}
                      </h4>
                      <p className="text-xs text-[#8C877D] font-light mt-1 uppercase tracking-wider">
                        Scheduled: {new Date(trip.scheduledStart).toLocaleString()}
                      </p>
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex gap-2">
                      {trip.status === 'SCHEDULED' && (
                        <>
                          <button disabled={isLoading} onClick={() => doTripAction(trip.id, 'start')}
                            className="flex items-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-all disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" strokeWidth={2} />}
                            Start
                          </button>
                          <button disabled={isLoading} onClick={() => doTripAction(trip.id, 'cancel')}
                            className="flex items-center gap-2 border border-[#DCD7CB] text-[#8C877D] px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:border-[#8B3A3A] hover:text-[#8B3A3A] transition-all disabled:opacity-50">
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </>
                      )}
                      {trip.status === 'IN_PROGRESS' && (
                        <button disabled={isLoading} onClick={() => doTripAction(trip.id, 'end')}
                          className="flex items-center gap-2 border border-amber-500 text-amber-700 bg-amber-50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-amber-100 transition-all disabled:opacity-50">
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" strokeWidth={2} />}
                          End Trip
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
