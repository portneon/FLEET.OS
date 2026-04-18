"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Navigation, Play, Plus, Loader2, X, Square, RefreshCw, Map } from 'lucide-react'
import { transitAPI, tripAPI, fleetAPI, staffAPI } from '@/lib/api'

interface Route { id: string; name: string; stops: { sequence: number; stop: { id: string; name: string; latitude: number; longitude: number } }[] }
interface Stop { id: string; name: string; latitude: number; longitude: number }
interface Trip { id: string; status: string; scheduledStart: string; routeId: string; vehicleId: string; driverId: string; route?: any; vehicle?: any; driver?: any }
interface Vehicle { id: string; vin: string; type: string; licensePlate: string }
interface Staff { id: string; name: string; role: string; driverProfile?: { id: string } }


const inputCls = "w-full bg-transparent border-b border-[#DCD7CB] py-3 text-[#1A1A1A] font-light text-sm placeholder:text-[#C4BFAF] focus:outline-none focus:border-[#1A1A1A] transition-colors rounded-none"
const labelCls = "text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D] mb-1 block"
const secHdrCls = "text-2xl font-['Playfair_Display',_serif] mb-8 pb-4 border-b border-[#DCD7CB] text-[#1A1A1A]"
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'border-[#DCD7CB] text-[#8C877D]',
  IN_PROGRESS: 'border-amber-700/30 text-amber-900 bg-amber-50',
  COMPLETED: 'border-[#14532d]/30 text-[#14532d] bg-[#f0fdf4]',
  CANCELLED: 'border-[#7f1d1d]/30 text-[#7f1d1d] bg-[#fef2f2]',
}

export default function TransitOperations() {

  const [routes, setRoutes] = useState<Route[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Staff[]>([])

  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [tripError, setTripError] = useState('')
  const [showDispatch, setShowDispatch] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [tripDetailsLoading, setTripDetailsLoading] = useState(false)


  const [dispatchForm, setDispatchForm] = useState({ routeId: '', vehicleId: '', driverId: '', scheduledStart: '' })


  const [planRoute, setPlanRoute] = useState({
    name: '',
    stops: [
      { name: '', latitude: '', longitude: '' },
      { name: '', latitude: '', longitude: '' }
    ]
  })
  const [planError, setPlanError] = useState('')

  const fetchRoutes = useCallback(async () => {
    setLoadingRoutes(true)
    const routesRes = await transitAPI.getRoutes()
    if (!routesRes.error && routesRes.data) setRoutes(routesRes.data.reverse())
    setLoadingRoutes(false)
  }, [])

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true)
    const [tripsRes, vehiclesRes, staffRes] = await Promise.all([
      tripAPI.getAll(),
      fleetAPI.getAll(),
      staffAPI.getAll(),
    ])
    if (!tripsRes.error && tripsRes.data) setTrips(tripsRes.data.reverse())
    if (!vehiclesRes.error && vehiclesRes.data) setVehicles(vehiclesRes.data)
    if (!staffRes.error && staffRes.data) setDrivers(staffRes.data.filter((s: Staff) => s.role === 'DRIVER' && s.driverProfile))
    setLoadingTrips(false)
  }, [])

  useEffect(() => { fetchRoutes(); fetchTrips() }, [fetchRoutes, fetchTrips])


  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault(); setPlanError('')
    if (!planRoute.name.trim()) { setPlanError('Route name is required'); return }

    const formattedStops = planRoute.stops.map(s => ({
      name: s.name.trim(),
      latitude: parseFloat(s.latitude),
      longitude: parseFloat(s.longitude)
    }))

    if (formattedStops.some(s => !s.name || isNaN(s.latitude) || isNaN(s.longitude))) {
      setPlanError('All stop names, latitudes, and longitudes are required.'); return
    }

    const res = await transitAPI.planRoute({ name: planRoute.name.trim(), stops: formattedStops })
    if (res.error) { setPlanError(res.error); return }

    setPlanRoute({
      name: '',
      stops: [
        { name: '', latitude: '', longitude: '' },
        { name: '', latitude: '', longitude: '' }
      ]
    })
    fetchRoutes()
  }

  const addWaypoint = () => {
    setPlanRoute(prev => ({
      ...prev,
      stops: [
        ...prev.stops.slice(0, -1),
        { name: '', latitude: '', longitude: '' },
        prev.stops[prev.stops.length - 1]
      ]
    }))
  }

  const updatePlanStop = (idx: number, field: string, val: string) => {
    const nextStops = [...planRoute.stops]
    nextStops[idx] = { ...nextStops[idx], [field]: val }
    setPlanRoute(prev => ({ ...prev, stops: nextStops }))
  }

  const removeWaypoint = (idx: number) => {
    if (planRoute.stops.length <= 2) return
    const nextStops = planRoute.stops.filter((_, i) => i !== idx)
    setPlanRoute(prev => ({ ...prev, stops: nextStops }))
  }

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

  const doTripAction = async (tripId: string, action: 'start' | 'end' | 'cancel') => {
    setActionLoading(prev => ({ ...prev, [tripId]: true }))
    const fn = action === 'start' ? tripAPI.start : action === 'end' ? tripAPI.end : tripAPI.cancel
    await fn(tripId)
    await fetchTrips()
    if (selectedTrip && selectedTrip.id === tripId) {
      // Re-fetch the detailed trip 
      await openTripProfile(tripId)
    }
    setActionLoading(prev => ({ ...prev, [tripId]: false }))
  }

  const openTripProfile = async (tripId: string) => {
    setTripDetailsLoading(true)
    // we set it to a shell just to open the screen instantly
    setSelectedTrip({ id: tripId }) 
    try {
      const res = await tripAPI.getById(tripId);
      if (!res.error && res.data) {
        setSelectedTrip(res.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTripDetailsLoading(false)
    }
  }

  const closeTripProfile = () => {
    setSelectedTrip(null)
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#1A1A1A] font-sans p-6 md:p-12 lg:p-16">

      <div className="mb-16">
        <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8C877D] mb-4">Operations Console</h3>
        <h1 className="text-5xl font-['Playfair_Display',_serif] tracking-tight">Transit &amp; Dispatch.</h1>
      </div>

      {selectedTrip ? (
        <div className="animate-in fade-in duration-500">
          <button
            onClick={closeTripProfile}
            className="mb-8 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-colors rounded-none text-[10px] tracking-[0.2em] uppercase px-6 py-4"
          >
            ← Back to Dispatch Board
          </button>

          <div className="bg-[#FFFFFF] border border-[#DCD7CB] p-8 md:p-12 mb-8 relative">
            
            {tripDetailsLoading && !selectedTrip.status ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" strokeWidth={1} />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-10 border-b border-[#DCD7CB] pb-8">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8C877D] font-semibold mb-2">
                      Mission Control
                    </h3>
                    <h2 className="text-4xl font-['Playfair_Display',_serif] text-[#1A1A1A] tracking-wide mb-4">
                      {selectedTrip.route?.name || 'Unassigned Route'}
                    </h2>
                    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 font-bold border ${STATUS_COLORS[selectedTrip.status] || 'border-[#DCD7CB] text-[#8C877D]'}`}>
                      {selectedTrip.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Trip ID</p>
                    <p className="text-sm font-mono text-[#1A1A1A]">{selectedTrip.id?.toUpperCase()}</p>
                    <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1 mt-4">Scheduled Start</p>
                    <p className="text-sm text-[#1A1A1A]">{new Date(selectedTrip.scheduledStart).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-b border-[#DCD7CB] pb-12">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#8C877D] font-semibold mb-6">Assigned Fleet & Crew</h4>
                    <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB] mb-4">
                      <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Operator / Driver</p>
                      <p className="text-lg font-light text-[#1A1A1A]">{selectedTrip.driver?.user?.name || 'N/A'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#8C877D] mt-1">{selectedTrip.driver?.licenseNumber}</p>
                    </div>
                    <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB]">
                      <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Vehicle Details</p>
                      <p className="text-lg font-light text-[#1A1A1A]">{selectedTrip.vehicle?.type || 'N/A'} — {selectedTrip.vehicle?.licensePlate}</p>
                      <p className="text-[10px] uppercase tracking-widest font-mono text-[#8C877D] mt-1">VIN: {selectedTrip.vehicle?.vin}</p>
                    </div>
                  </div>

                  {/* Financial & Time Metrics */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#8C877D] font-semibold mb-6">Operations Telemetry</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB]">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-2">Total Yield (Revenue)</p>
                        <p className="text-2xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                          ₹{selectedTrip.bookings?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0}
                        </p>
                      </div>
                      <div className="bg-[#F9F8F4] p-6 border border-[#DCD7CB]">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-2">Total Passengers</p>
                        <p className="text-2xl font-light font-['Playfair_Display',_serif] text-[#1A1A1A]">
                          {selectedTrip.bookings?.length || 0} PAX
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-[#DCD7CB] p-6">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Actual Start</p>
                        <p className="text-xs text-[#1A1A1A]">{selectedTrip.actualStart ? new Date(selectedTrip.actualStart).toLocaleTimeString() : '--:--'}</p>
                      </div>
                      <div className="border border-[#DCD7CB] p-6">
                        <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mb-1">Actual End</p>
                        <p className="text-xs text-[#1A1A1A]">{selectedTrip.actualEnd ? new Date(selectedTrip.actualEnd).toLocaleTimeString() : '--:--'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Route stops visually displayed */}
                {selectedTrip.route?.stops && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#8C877D] font-semibold mb-6">Manifest & Route Details</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {selectedTrip.route.stops.map((rs: any, idx: number) => (
                        <div key={idx} className="min-w-[200px] border border-[#DCD7CB] p-4 bg-[#F9F8F4] relative">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-[#8C877D] mb-2 border-b border-[#DCD7CB] pb-2">Halt #{rs.sequence}</p>
                          <p className="font-['Playfair_Display',_serif] text-[#1A1A1A] text-lg">{rs.stop?.name}</p>
                          <p className="text-[9px] text-[#8C877D] font-mono mt-2">{rs.stop?.latitude?.toFixed(4)}, {rs.stop?.longitude?.toFixed(4)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Trip Controls if In Progress */}
                {(selectedTrip.status === 'SCHEDULED' || selectedTrip.status === 'IN_PROGRESS') && (
                  <div className="mt-12 flex justify-end gap-4 border-t border-[#DCD7CB] pt-8">
                     {selectedTrip.status === 'SCHEDULED' && (
                        <>
                          <button disabled={actionLoading[selectedTrip.id]} onClick={() => doTripAction(selectedTrip.id, 'start')}
                            className="flex items-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-all disabled:opacity-50 rounded-none">
                            {actionLoading[selectedTrip.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
                            Commence Start
                          </button>
                        </>
                      )}
                      {selectedTrip.status === 'IN_PROGRESS' && (
                        <button disabled={actionLoading[selectedTrip.id]} onClick={() => doTripAction(selectedTrip.id, 'end')}
                          className="flex items-center gap-2 border border-amber-600 text-amber-700 bg-amber-50 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-amber-100 transition-all disabled:opacity-50 rounded-none">
                          {actionLoading[selectedTrip.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" strokeWidth={1.5} />}
                          Finalize Trip End
                        </button>
                      )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">


        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-16">

          <section className="bg-[#FDFCF9] border border-[#DCD7CB] p-8">
            <h2 className={secHdrCls}>
              <Navigation className="inline-block w-5 h-5 mr-3 mb-1 text-[#1A1A1A]" strokeWidth={1} />
              Route Planner
            </h2>

            <form onSubmit={handlePlanRoute} className="flex flex-col gap-8">
              {planError && <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] bg-[#fef2f2] border border-[#7f1d1d]/20 px-4 py-3 font-semibold">{planError}</p>}

              <div>
                <label className={labelCls}>Global Trip Name</label>
                <input type="text" required placeholder="e.g., Downtown-Airport Express"
                  value={planRoute.name} onChange={e => setPlanRoute({ ...planRoute, name: e.target.value })}
                  className={inputCls} />
              </div>

              <div className="flex flex-col gap-10">
                {planRoute.stops.map((stop, idx) => (
                  <div key={idx} className="relative pl-6 border-l border-dashed border-[#DCD7CB]">

                    <div className={`absolute -left-[5px] top-4 w-2 h-2 rounded-full border border-[#F9F8F4] ${idx === 0 ? 'bg-[#1A1A1A]' : idx === planRoute.stops.length - 1 ? 'bg-[#8C877D]' : 'bg-[#DCD7CB]'}`} />

                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">
                        {idx === 0 ? 'Origin Hub' : idx === planRoute.stops.length - 1 ? 'Destination Hub' : `Waypoint ${idx}`}
                      </h4>
                      {idx > 0 && idx < planRoute.stops.length - 1 && (
                        <button type="button" onClick={() => removeWaypoint(idx)} className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors">
                          <X className="w-4 h-4" strokeWidth={1} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <input type="text" placeholder="Location Nomenclature" required
                          value={stop.name} onChange={e => updatePlanStop(idx, 'name', e.target.value)}
                          className={inputCls} />
                      </div>
                      <input type="number" step="any" placeholder="Latitude" required
                        value={stop.latitude} onChange={e => updatePlanStop(idx, 'latitude', e.target.value)}
                        className={inputCls} />
                      <input type="number" step="any" placeholder="Longitude" required
                        value={stop.longitude} onChange={e => updatePlanStop(idx, 'longitude', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <button type="button" onClick={addWaypoint}
                  className="w-full border border-dashed border-[#DCD7CB] text-[#8C877D] hover:border-[#1A1A1A] hover:text-[#1A1A1A] py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2 rounded-none">
                  <Plus className="w-3 h-3" strokeWidth={1.5} /> Add Midway Stop
                </button>
                <button type="submit" className="w-full bg-[#1A1A1A] text-[#F9F8F4] py-5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#333333] transition-colors rounded-none flex items-center justify-center gap-3">
                  <Play className="w-3 h-3" strokeWidth={1.5} /> Complete Route Initialization
                </button>
              </div>
            </form>
          </section>


          <section>
            <h2 className="text-xl font-['Playfair_Display',_serif] mb-6 flex items-center gap-3 text-[#1A1A1A]">
              <Map className="w-5 h-5 text-[#8C877D]" strokeWidth={1} />
              Established Routes
            </h2>
            {loadingRoutes ? (
              <div className="flex items-center gap-2 text-[#1A1A1A]"><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /><span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C877D]">Loading routes…</span></div>
            ) : routes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {routes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 border border-[#DCD7CB] bg-[#FDFCF9] hover:border-[#1A1A1A] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{r.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mt-1">{r.stops.length} Stop{r.stops.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => transitAPI.deleteRoute(r.id).then(fetchRoutes)}
                      className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors p-2">
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8C877D] font-light italic">No routes have been planned yet.</p>
            )}
          </section>
        </div>

        <div className="lg:col-span-12 xl:col-span-7 bg-[#FDFCF9] border border-[#DCD7CB] p-8 md:p-12">

          <div className="flex justify-between items-end mb-12 border-b border-[#DCD7CB] pb-6">
            <h2 className="text-3xl font-['Playfair_Display',_serif]">
              <Navigation className="inline-block w-6 h-6 mr-3 mb-1 text-[#1A1A1A]" strokeWidth={1} />
              Active Dispatch
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={fetchTrips} className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors p-2">
                <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button onClick={() => setShowDispatch(true)}
                className="bg-[#1A1A1A] text-[#F9F8F4] px-6 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#333333] transition-colors flex items-center gap-2 rounded-none">
                <Plus className="w-3 h-3" strokeWidth={1.5} /> New Trip
              </button>
            </div>
          </div>

          {showDispatch && (
            <div className="mb-10 p-8 border border-[#DCD7CB] bg-[#F9F8F4]">
              <div className="flex justify-between items-center mb-8 border-b border-[#DCD7CB] pb-4">
                <h3 className="font-['Playfair_Display',_serif] text-xl text-[#1A1A1A]">Schedule New Trip</h3>
                <button onClick={() => setShowDispatch(false)} className="text-[#8C877D] hover:text-[#1A1A1A] transition-colors p-1"><X className="w-5 h-5" strokeWidth={1} /></button>
              </div>
              <form onSubmit={handleDispatch} className="flex flex-col gap-6">
                {tripError && <p className="text-[10px] uppercase tracking-widest text-[#7f1d1d] bg-[#fef2f2] border border-[#7f1d1d]/20 px-4 py-3 font-semibold">{tripError}</p>}

                <div className="relative">
                  <label className={labelCls}>Route</label>
                  <select value={dispatchForm.routeId} onChange={e => setDispatchForm(p => ({ ...p, routeId: e.target.value }))}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="">Select a route…</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                <div className="relative">
                  <label className={labelCls}>Vehicle</label>
                  <select value={dispatchForm.vehicleId} onChange={e => setDispatchForm(p => ({ ...p, vehicleId: e.target.value }))}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="">Select a vehicle…</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.type} — {v.licensePlate}</option>)}
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                <div className="relative">
                  <label className={labelCls}>Driver</label>
                  <select value={dispatchForm.driverId} onChange={e => setDispatchForm(p => ({ ...p, driverId: e.target.value }))}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="">Select a driver…</option>
                    {drivers.map(d => <option key={d.driverProfile!.id} value={d.driverProfile!.id}>{d.name}</option>)}
                  </select>
                  <div className="absolute right-0 bottom-4 pointer-events-none text-[#8C877D]">↓</div>
                </div>

                <div>
                  <label className={labelCls}>Scheduled Departure</label>
                  <input type="datetime-local" required
                    value={dispatchForm.scheduledStart} onChange={e => setDispatchForm(p => ({ ...p, scheduledStart: e.target.value }))}
                    className={inputCls} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-[#1A1A1A] text-[#F9F8F4] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#333333] transition-colors rounded-none">
                    Dispatch Trip
                  </button>
                  <button type="button" onClick={() => setShowDispatch(false)}
                    className="px-8 border border-[#DCD7CB] text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-bold hover:border-[#1A1A1A] transition-colors rounded-none">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}


          {loadingTrips ? (
            <div className="flex items-center gap-2 text-[#1A1A1A]"><Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /><span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C877D]">Loading trips…</span></div>
          ) : trips.length === 0 ? (
            <p className="text-sm text-[#8C877D] font-light italic">No trips logged in the ledger.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {trips.map(trip => {
                const isLoading = actionLoading[trip.id]
                return (
                  <div key={trip.id} 
                       onClick={(e) => { 
                         // prevent firing if we clicked an action button
                         if ((e.target as HTMLElement).closest('button')) return;
                         openTripProfile(trip.id);
                       }}
                       className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-[#DCD7CB] bg-[#F9F8F4] hover:border-[#1A1A1A] transition-colors cursor-pointer">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">{trip.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[8px] uppercase tracking-wider px-2 py-1 border ${STATUS_COLORS[trip.status] || 'border-[#DCD7CB] text-[#8C877D]'}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xl font-['Playfair_Display',_serif] text-[#1A1A1A]">
                        {routes.find(r => r.id === trip.routeId)?.name || 'Unknown Route'}
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
                            className="flex items-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#1A1A1A] hover:text-[#F9F8F4] transition-all disabled:opacity-50 rounded-none">
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" strokeWidth={1.5} />}
                            Start
                          </button>
                          <button disabled={isLoading} onClick={() => doTripAction(trip.id, 'cancel')}
                            className="flex items-center gap-2 border border-[#DCD7CB] text-[#8C877D] px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all disabled:opacity-50 rounded-none">
                            <X className="w-3 h-3" strokeWidth={1.5} /> Cancel
                          </button>
                        </>
                      )}
                      {trip.status === 'IN_PROGRESS' && (
                        <button disabled={isLoading} onClick={() => doTripAction(trip.id, 'end')}
                          className="flex items-center gap-2 border border-amber-600 text-amber-700 bg-amber-50 px-5 py-3 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-amber-100 transition-all disabled:opacity-50 rounded-none">
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" strokeWidth={1.5} />}
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
      )}
    </div>
  )
}