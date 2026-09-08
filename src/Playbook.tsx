import React, { useState } from 'react';
import { BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, Briefcase } from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'reference' | 'objections' | 'catalog'>('bypass');

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 h-full flex flex-col min-h-[400px] max-h-full overflow-hidden">
      
      {/* Playbook Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 shrink-0">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800 text-sm">JYC Sales Playbook & Script</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mt-2 gap-1 overflow-x-auto shrink-0 no-scrollbar">
        {[
          { id: 'bypass', label: 'Bypass & Opening', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'qualify', label: 'Qualification', icon: <ClipboardList className="w-3.5 h-3.5" /> },
          { id: 'reference', label: 'Future Reference', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'objections', label: 'Objections', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'catalog', label: 'Industries & Catalog', icon: <Briefcase className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 text-left space-y-4 text-xs leading-relaxed text-slate-600 font-sans">
        
        {activeTab === 'bypass' && (
          <div className="space-y-4">
            
            {/* Operator Script */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700 uppercase">1. With the Operator (Gatekeeper Bypass)</span>
              <p className="font-semibold text-slate-800 italic">"Good morning, could you please transfer me to the person in charge of plant operations or the used machinery fleet, like your forklifts and wheel loaders?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o flota de maquinaria como montacargas y cargadores?"</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-slate-700">If they ask "What is this in regards to?":</p>
                <p className="italic text-slate-600">"This is [Name] with JYC Equipment. We are nationwide buyers of used heavy equipment. I wanted to check with the plant manager if you might have any surplus equipment for sale or coming up for renewal this year. Is he available?"</p>
                <p className="text-[11px] text-slate-500 italic">En español: "Habla [Nombre] de JYC Equipment. Compramos maquinaria pesada usada y quería consultar con el jefe de planta si tienen algún equipo sobrante o por renovar este año."</p>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-800">
                <strong>⚠️ Regla de Oro:</strong> El prospecto <strong>NO es comerciante de maquinaria</strong>; es una empresa industrial (cantera, aserradero, planta). Preguntar por el <em>Jefe de Operaciones / Planta / Flota</em> evita que la operadora te transfiera por error a su propio departamento de ventas.
              </div>
            </div>

            {/* KP Script */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 font-bold text-[10px] text-blue-700 uppercase">2. Opening with the Key Person (KP)</span>
              <p className="font-semibold text-slate-800 italic">"Hi [KP Name], this is [Name] with JYC Equipment. Did I catch you at a bad time?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Hola [Nombre], habla [Mi Nombre] de JYC Equipment. ¿Lo tomo en un mal momento?"</p>
              <p className="text-slate-500 mt-1">Wait for response. If they cooperate, present the hook:</p>
              <p className="font-semibold text-slate-800 italic">"I'm calling because we are nationwide buyers of used heavy equipment such as forklifts and loaders. I wanted to check with you if you might have anything for sale right now or maybe coming up this year?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Le llamo porque somos compradores a nivel nacional de maquinaria pesada usada como montacargas y cargadores. Quería consultar si tienen algún equipo para la venta ahora o pensado para renovar este año."</p>
            </div>

          </div>
        )}

        {activeTab === 'qualify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-[10px] text-emerald-700 uppercase">Qualification of Available Machinery</span>
              <p className="text-slate-500">If the prospect confirms they have an equipment unit available for sale, qualify the machine by asking the following questions in order:</p>
              
              <ul className="space-y-2 bg-emerald-50/20 border border-emerald-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span><strong>Equipment Type:</strong> And what type of equipment is it? Is it a forklift or a loader?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">2.</span>
                  <span><strong>Make & Model:</strong> What's the make? What's the model?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">3.</span>
                  <span><strong>Year:</strong> Do you know what year it is?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">4.</span>
                  <span><strong>Condition:</strong> Is it running or does it need any major repairs?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">5.</span>
                  <span><strong>Target Price:</strong> Do you have a price in mind for it?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">6.</span>
                  <span><strong>Photos & Data:</strong> Could you please send me some pictures of it including the data plate and the hour meter?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reference' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 font-bold text-[10px] text-violet-700 uppercase">If They DO NOT Have Equipment Available</span>
              <p className="text-slate-500">If the prospect states they have no surplus machinery for sale today, ask these reference questions to profile the account and open future leads:</p>
              
              <ul className="space-y-2 bg-violet-50/20 border border-violet-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Surplus Process:</strong> How does the process look like when you do have a surplus equipment for sale?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Purchases:</strong> Do you buy used equipment as well? Or do you only go for brand new units?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Scope:</strong> Do you take care of the equipment sales at several locations or branches, or only your plant?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Preference:</strong> In your daily operations, do you use mostly Loaders or Forklifts?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'objections' && (
          <div className="space-y-3">
            <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 font-bold text-[10px] text-rose-700 uppercase">Objection Handling Guidelines</span>
            
            {/* Auction */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"We always send our surplus machines to auction..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> Explain that auction houses charge heavy seller commissions (often 10-15%) and the seller has to pay for freight to transport it there. JYC pays in full in 24 hours, charges 0% commissions, and handles all freight logistics directly from their plant.</p>
            </div>

            {/* Trade-in */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"We just trade them in with the dealer..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> Dealers offer low trade-in values to protect their margins. JYC pays higher net cash value than dealer valuations, giving them immediate cash flow and more leverage to negotiate a discount on the new machinery purchase.</p>
            </div>

            {/* Leasing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Our equipment is on lease with the bank..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> Explain JYC regularly buys out equipment at the end of leases. We pay bank residual values directly, saving the client from bank wear-and-tear inspection penalties, repair requests, and return shipping costs.</p>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-4">
            
            {/* Target Industries */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 font-bold text-[10px] text-indigo-700 uppercase">1. Target Industries</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Concrete & Precast</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Ready-mix, aggregates, quarries, concrete block plants.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Lumber & Sawmills</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Sawmills, lumber yards, plywood & wood processing plants.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Steel & Metal</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Steel mills, steel pipe plants, tube & coil manufacturing.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Ports & Terminals</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Container terminals, shipping ports, cargo handling, logistics hubs.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Plastic Industry</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Injection molding, extrusion, recycling, compounding plants.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">Medical & Pharma</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Medical device manufacturers, pharma labs, cleanroom logistics.</p>
                </div>
              </div>
            </div>

            {/* What JYC Buys */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-[10px] text-emerald-700 uppercase">2. Equipment We Buy</span>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-emerald-50/20 border border-emerald-50 rounded-xl">
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Wheel Loaders:</strong> CAT (988, 966), Volvo, JD, Komatsu.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Forklifts & Port:</strong> Taylor, Hyster (High Capacity & Reach Stackers), Kalmar, Toyota, Crown.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Electric & Clean:</strong> Toyota, Crown, Jungheinrich, Raymond electric/pallet trucks.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Others:</strong> Genie/JLG manlifts, Excavators, Skid steers, Backhoes.</span>
                </li>
              </ul>
            </div>

            {/* What JYC Rejects */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 font-bold text-[10px] text-red-700 uppercase">3. We DO NOT Buy (Declines/Pivots)</span>
              <div className="p-3 bg-red-50/10 border border-red-50 rounded-xl space-y-2">
                <p className="text-slate-500 text-[10px]">Politely decline if offered any of these, then pivot back to forklifts/loaders:</p>
                <div className="flex flex-wrap gap-2">
                  {['Concrete Pumps', 'Mixer Trucks', 'Sweepers', 'Rollers', 'Concrete Molds', 'Truck Cranes', 'Mixers'].map((item) => (
                    <span key={item} className="px-2 py-1 rounded bg-red-50 text-red-700 font-semibold text-[10px]">{item}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
