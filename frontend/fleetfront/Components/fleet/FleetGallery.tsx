
"use client"

import { useEffect, useState } from "react"
import { fleetAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

const FleetGallery = () => {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        setLoading(true)
        const response = await fleetAPI.getAll()
        if (response.error) {
          setError(response.error)
          setVehicles([])
        } else {
          setVehicles(response.data || [])
          setError(null)
        }
      } catch (err) {
        setError("Failed to load fleet data")
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchFleet()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#EBE6DD] p-8 flex items-center justify-center h-48">
            <Loader2 className="w-4 h-4 animate-spin text-[#8C877D]" />
          </div>
        ))}
      </div>
    )
  }

  if (error || vehicles.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <div className="col-span-full bg-white border border-[#EBE6DD] p-8 text-center">
          <p className="text-[#8C877D] text-sm">
            {error || "No vehicles in fleet yet"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {vehicles.map((v) => (
        <div key={v.id} className="bg-white border border-[#EBE6DD] p-8 flex flex-col justify-between hover:border-[#1A1A1A] transition-all group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-tighter font-bold text-[#8C877D] mb-1">{v.type}</p>
              <h4 className="text-2xl font-['Playfair_Display']">{v.licensePlate}</h4>
            </div>
            <div className={`w-2 h-2 rounded-full ${v.status === 'IDLE' ? 'bg-yellow-500' : v.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} mt-2`} />
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#C4BFAF]">Asset ID</p>
              <p className="text-xs font-medium">{v.id}</p>
            </div>
            {v.seatingCapacity && (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[#C4BFAF]">Capacity</p>
                <p className="text-xs font-medium">{v.seatingCapacity} Seats</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FleetGallery