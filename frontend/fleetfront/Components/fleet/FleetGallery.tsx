
"use client"

const FleetGallery = () => {
  const vehicles = [
    { id: "V-402", type: "BUS", plate: "MH-12-BJ-4402", capacity: 42, status: "IDLE" },
    { id: "V-405", type: "TRUCK", plate: "MH-12-CK-1192", capacity: null, status: "ACTIVE" }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {vehicles.map((v) => (
        <div key={v.id} className="bg-white border border-[#EBE6DD] p-8 flex flex-col justify-between hover:border-[#1A1A1A] transition-all group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-tighter font-bold text-[#8C877D] mb-1">{v.type}</p>
              <h4 className="text-2xl font-['Playfair_Display']">{v.plate}</h4>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#C4BFAF]">Asset ID</p>
              <p className="text-xs font-medium">{v.id}</p>
            </div>
            {v.capacity && (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[#C4BFAF]">Capacity</p>
                <p className="text-xs font-medium">{v.capacity} Seats</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}