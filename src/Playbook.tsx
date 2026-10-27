import React, { useState } from 'react';
import { 
  BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, 
  Briefcase, Zap, Anchor, HeartPulse, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'plastics' | 'ports' | 'medical' | 'reference' | 'objections' | 'catalog'>('bypass');

  const tabs = [
    { id: 'bypass', label: 'Reception & Opening', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'qualify', label: '7 Qualifying Questions', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'plastics', label: 'Plastics', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'ports', label: 'Ports & Terminals', icon: <Anchor className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'medical', label: 'Medical Imaging', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> },
    { id: 'reference', label: 'If Not Selling Today', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'objections', label: 'Objections', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'catalog', label: 'What We Buy', icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs h-full flex flex-col min-h-[420px] max-h-full overflow-hidden text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm">
              Sales Playbook & Industry Guides
            </h3>
            <p className="text-xs text-slate-500">
              Step-by-step structure to bypass reception, qualify machinery, and overcome objections
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mt-2 gap-1 overflow-x-auto shrink-0 pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 text-left space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700">
        
        {/* TAB: BYPASS & APERTURA */}
        {activeTab === 'bypass' && (
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-display font-bold text-slate-900 text-sm">
                1. How to Bypass Reception (Gatekeeper)
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">English verbatim script:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Good morning, could you please transfer me to the person in charge of plant operations or the used machinery, like your injection molding machines, forklifts, or loaders?"
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Spanish version:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 italic">
                  "Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o la maquinaria usada como sus inyectoras de plástico, montacargas o cargadores?"
                </p>
              </div>
              
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-lg space-y-1 text-xs">
                <p className="font-semibold text-blue-950">
                  If they ask "Who is calling or what is this regarding?":
                </p>
                <p className="text-slate-800 italic">
                  "This is [Name] with JYC Equipment. We are nationwide buyers of used heavy machinery and equipment. I wanted to check with the plant manager if you might have any surplus machines for sale or coming up for renewal this year. Is he available?"
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Key Rule:</strong> The client is an industrial operating plant (plastics, quarry, sawmill, port), not a machinery dealer. Always ask for the <strong>Head of Operations, Plant, or Fleet Manager</strong> so reception does not mistakenly transfer you to their sales department.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-display font-bold text-slate-900 text-sm">
                2. Key Person Opening
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Initial greeting:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Hi [Name], this is [My Name] with JYC Equipment. Did I catch you at a bad time?"
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Reason for calling:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "I'm calling because we are nationwide buyers of used industrial machinery such as injection molding machines, forklifts, and loaders. I wanted to check with you if you might have anything for sale right now or maybe coming up this year?"
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB: QUALIFY */}
        {activeTab === 'qualify' && (
          <div className="space-y-3">
            <p className="text-slate-600 text-xs sm:text-sm">
              When the prospect confirms they have available machinery, ask these <strong>7 questions in order</strong>:
            </p>
            
            <div className="space-y-2">
              {[
                { n: '1', title: 'Equipment type', desc: 'And what type of equipment is it? Is it an injection molding machine, blow molder, reach stacker, or forklift?' },
                { n: '2', title: 'Exact model', desc: "What's the model?" },
                { n: '3', title: 'Make / manufacturer', desc: "What's the make? (Engel, Krauss Maffei, Husky, Cincinnati Milacron, Arburg, JSW, Nissei, Sumitomo, UBE, Toshiba, Kalmar, Taylor, CAT...)" },
                { n: '4', title: 'Tonnage, capacity, shot size & screw size', desc: 'What is the tonnage or capacity? (e.g. 500–2000 Ton; for injection molders also ask Shot Size in oz: 20 oz, 50 oz, 100 oz and Screw Diameter in mm: 50 mm, 70 mm, 135 mm)' },
                { n: '5', title: 'Year of manufacture & hours', desc: 'Do you know what year it is and approximate hours?' },
                { n: '6', title: 'Condition & repairs', desc: 'Is it currently running or does it need any major repairs?' },
                { n: '7', title: 'Photo request & 24h appraisal', desc: 'Could you send me pictures of the data plate and hour meter? Do you have an internal asking price, or would you prefer our formal cash offer within 24 hours?' }
              ].map((q) => (
                <div key={q.n} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {q.n}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">{q.title}</p>
                    <p className="text-slate-600 text-xs italic">{q.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PLASTICS */}
        {activeTab === 'plastics' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="font-display font-bold text-emerald-950 text-sm">
                Key Value Proposition: Turnkey Rigging & Freight Included
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Extracting a 500 to 2,000 ton injection molding machine is expensive and logistically demanding. <strong>JYC covers 100% of the heavy rigging, cranes, and specialized transport</strong>, wire-transferring payment within 24 hours.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Injection Molding Brands (500–2,000T)</p>
                <p className="text-slate-600">Engel, Krauss Maffei, Husky, Cincinnati Milacron, Arburg, JSW, Nissei, Sumitomo, UBE, Toshiba.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Shot Size & Screw Diameter Specs</p>
                <p className="text-slate-600">
                  <strong>Shot Size (OZ):</strong> 20 oz, 50 oz, 100 oz · <strong>Screw Size (mm):</strong> 50 mm, 70 mm, 135 mm.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Blow Molders & Auxiliary</p>
                <p className="text-slate-600">Blow molders, extruders, chillers, desiccant dryers, granulators, and temperature controllers.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Plant Forklifts</p>
                <p className="text-slate-600">Toyota, Crown, Hyster, and Yale from 5,000 to 15,000 lbs for mold handling.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PORTS */}
        {activeTab === 'ports' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="font-display font-bold text-blue-950 text-sm">
                Key Value Proposition: Port Logistics & Boom Disassembly
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Moving a 45-ton Reach Stacker requires boom breakdown, RGN lowboy transport, and port security clearances. <strong>JYC coordinates all breakdown, rigging, and logistics</strong> with immediate payment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Reach Stackers (45-Ton)</p>
                <p className="text-slate-600">Kalmar Gloria DRG450, Konecranes SMV 4531, Hyster RS45, Taylor TER-975. (Never mention Caterpillar for reach stackers).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Empty Container Handlers</p>
                <p className="text-slate-600">Taylor TEC-950L, Kalmar DCF100, Hyster H550HD, Konecranes.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Heavy Forklifts (30k–90k lbs)</p>
                <p className="text-slate-600">Taylor TX-300/TX-550, Hyster H360HD/H650HD, Kalmar, Svetruck.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Terminal Tractors (Spotters)</p>
                <p className="text-slate-600">Ottawa T2, Terberg YT182/YT222, Capacity TJ5000/TJ9000, TICO.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEDICAL */}
        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
              <div className="font-display font-bold text-rose-950 text-sm">
                Key Value Proposition: Turnkey Cryogenic Ramp-Down & De-installation
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Decommissioning an MRI or CT scanner in a live clinical environment requires precise cryogenic ramp-down and rigging. <strong>JYC Medical handles the entire technical de-installation and extraction</strong>, paying upfront before work begins.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">MRI Scanners (1.5T & 3.0T)</p>
                <p className="text-slate-600">GE (Optima, Signa), Siemens (Magnetom Avanto, Aera, Skyra, Vida), Philips (Ingenia).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">CT Scanners (64/128/256 Slices)</p>
                <p className="text-slate-600">GE Revolution/Optima, Siemens Somatom, Canon/Toshiba Aquilion, Philips.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REFERENCE */}
        {activeTab === 'reference' && (
          <div className="space-y-3">
            <p className="text-slate-600 text-xs sm:text-sm">
              If the prospect mentions they have no equipment for sale today, use the opportunity to profile the account with these <strong>6 future reference questions</strong>:
            </p>

            <div className="space-y-2">
              {[
                { n: '1', title: 'Surplus process', desc: 'How does the process look like when you do have surplus equipment for sale?' },
                { n: '2', title: 'Used vs. brand new', desc: 'Do you buy used equipment as well, or do you only go for brand new units?' },
                { n: '3', title: 'Role scope', desc: 'Are you involved on both the sales and purchases of the equipment?' },
                { n: '4', title: 'Upcoming acquisitions', desc: 'Are you planning to buy any used injection molding machines, loaders, or forklifts anytime soon?' },
                { n: '5', title: 'Other locations or facilities', desc: 'Do you take care of equipment sales at several locations, or only your plant?' },
                { n: '6', title: 'Next contact timeframe', desc: 'When would be the best time to follow up with you—in 3, 6, or 12 months?' },
              ].map((item) => (
                <div key={item.n} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {item.n}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">{item.title}</p>
                    <p className="text-slate-600 text-xs italic">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OBJECTIONS */}
        {activeTab === 'objections' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Tell me your offer first / Give me a ballpark"</p>
              <p className="text-slate-600 text-xs">
                "We never guess or throw out numbers without seeing the data plate and machine hours, because we don't want to mislead you. If you can snap 2 quick photos of the data plate and hour meter, our purchasing team will deliver a formal, guaranteed cash offer within 24 hours."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"We always send our machines to auction"</p>
              <p className="text-slate-600 text-xs">
                Ask if they have already signed a contract. Remind them auction houses take 10% to 15% in seller commissions and the seller bears freight risk. JYC pays in 24 hours, zero commissions, and assumes all rigging and transport.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"We trade them in with the dealer (Trade-in)"</p>
              <p className="text-slate-600 text-xs">
                Dealers offer lower trade-in allowances to protect their margins. JYC pays higher cash upfront because we export worldwide, giving the plant immediate liquid capital to negotiate a bigger cash discount on their new machine.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"The equipment is leased through the bank"</p>
              <p className="text-slate-600 text-xs">
                JYC buys equipment at lease end directly from the bank in as-is condition, sparing the plant wear-and-tear penalties, required refurbishment, and return freight costs.
              </p>
            </div>
          </div>
        )}

        {/* TAB: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-semibold text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Equipment JYC Buys</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Plastics & Molding</p>
                  <p className="text-slate-600 mt-0.5">Injection molders (500–2,000T), extruders, blow molders, chillers, and dryers.</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Port Equipment</p>
                  <p className="text-slate-600 mt-0.5">45-Ton Reach Stackers, empty container handlers, and yard spotters.</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Diagnostic Medical Imaging</p>
                  <p className="text-slate-600 mt-0.5">MRI 1.5T/3.0T, CT scanners 64-slice+, and PET/CT (GE, Siemens, Philips).</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Heavy Handling & Loading</p>
                  <p className="text-slate-600 mt-0.5">CAT Loaders (988, 966) and heavy forklifts Taylor / Hyster (30k–90k lbs).</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
              <div className="font-semibold text-red-900 text-xs sm:text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Equipment We Do NOT Buy (Politely decline and redirect)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Concrete boom pumps', 'Ready-mix concrete trucks', 'Street sweepers', 'Asphalt rollers', 'Concrete forms/molds', 'Truck-mounted cranes'].map((item) => (
                  <span key={item} className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 font-medium text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
