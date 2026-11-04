import React, { useState } from 'react';
import { 
  BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, 
  Briefcase, Zap, Anchor, HeartPulse, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'sell' | 'objections' | 'voicemail' | 'plastics' | 'ports' | 'medical' | 'catalog'>('bypass');

  const tabs = [
    { id: 'bypass', label: 'Reception (14 Scenarios)', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'qualify', label: 'Machine Specs (Qualify)', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'sell', label: 'When Prospect Buys (SELL!)', icon: <Briefcase className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'objections', label: 'Advanced Objections', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'voicemail', label: 'Voicemail Script', icon: <FileText className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'plastics', label: 'Plastics', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'ports', label: 'Ports & Terminals', icon: <Anchor className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'medical', label: 'Medical Imaging', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> },
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
        
        {/* TAB: BYPASS & APERTURA (14 SCENARIOS) */}
        {activeTab === 'bypass' && (
          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-display font-bold text-slate-900 text-sm">
                1. How to Bypass Reception (Gatekeeper)
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">English verbatim script:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Good morning, I am trying to reach the person who takes care of the sales of the surplus equipment such as: forklifts and wheel loaders?"
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Spanish version:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 italic">
                  "Buenos días, ¿me podría comunicar con el encargado de planta o con la persona a cargo de la venta de equipos excedentes como montacargas y cargadores frontales?"
                </p>
              </div>
              
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-lg space-y-1 text-xs">
                <p className="font-semibold text-blue-950">
                  If Operator asks "What is this in regards to?":
                </p>
                <p className="text-slate-800 italic">
                  "This is [Name] with JYC Equipment. I'm calling because we buy used heavy equipment, such as forklifts and wheel loaders. I wanted to check if you might have anything for sale right now or maybe coming up this year? Do you know who would be the person I need to talk to about it?"
                </p>
              </div>
            </div>

            {/* 14 Gatekeeper Rebuttal Scenarios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                  14 Operator Scenarios & Exact Word-for-Word Rebuttals:
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">JYC Training Standard</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { q: '1. "No idea who handles that"', a: 'Usually the Operations Manager or a Fleet Manager would know. Or somebody in maintenance?' },
                  { q: '2. "The person is not available at this time"', a: 'May I have his name please? Does he have an email address where I can send him my contact information? What would be the best number to reach him at?' },
                  { q: '3. "All our equipment is new"', a: 'When the time comes, do you know who would handle that type of sales in the future?' },
                  { q: '4. "We don\'t have any at this time"', a: 'Could you please tell me who would be the person I need to contact in the future?' },
                  { q: '5. "We don\'t have any / don\'t use"', a: 'Do you use forklifts or wheel loaders in operations? Could you please tell me who would be the person I need to contact in the future?' },
                  { q: '6. "We don\'t sell our equipment"', a: 'What do you usually do when the company no longer has a need of them? Do you trade them in or lease them?' },
                  { q: '7. "Our equipment is very old"', a: 'We buy equipment in any condition. We just need to know what\'s wrong with them. Could you please tell me who would be the person I need to contact in the future?' },
                  { q: '8. "We don\'t do that"', a: 'Ok, I understand you don\'t sell used equipment, however your company uses forklifts or wheel loaders in daily operations. When this equipment becomes surplus we could pay more than any other company since we export. Could you please tell me who is the person I need to contact?' },
                  { q: '9. "We are not interested"', a: 'We are not selling you anything, we are major buyers of used equipment, and we pay more than any other company since we export. I\'m sure the person who handles this will be very interested since your company will be getting more money for the equipment. Could you please tell me who is the person I need to contact?' },
                  { q: '10. "How do you work since Miami?"', a: 'We buy used equipment all over the United States and Canada. We just need some information and pictures on the equipment that you have and if we get to a price agreement, we will wire you the money within 24 hours. Once you have the money in your bank, we will pickup the equipment.' },
                  { q: '11. "We lease our equipment"', a: 'We also buy end of lease equipment. Do you know who handles those leasing contracts?' },
                  { q: '12. "We rent our equipment"', a: 'By rent do you mean you lease them or you rent them for a few days?' },
                  { q: '13. "We trade in our equipment"', a: 'We could pay you more than the trade in value of the machines since we export. Could you please tell me who is the person I need to talk to?' },
                  { q: '14. "We auction our equipment"', a: 'Do you know who can I talk to about the equipment that the company would auction soon?' },
                ].map((scen, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1 text-xs">
                    <p className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>{scen.q}</span>
                      <span className="text-[10px] text-amber-700 font-mono font-bold bg-amber-100/70 px-1.5 py-0.5 rounded">Operator</span>
                    </p>
                    <p className="text-slate-700 italic pl-2 border-l-2 border-amber-400">
                      <strong>You say:</strong> "{scen.a}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-display font-bold text-slate-900 text-sm">
                2. Key Person Opening & Bad Time Check
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Initial greeting:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Good morning, who am I speaking with? ... Hi Mark Johnson. This is [My Name] with JYC equipment. Did I catch you at a bad time?"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="font-semibold text-red-700 block">If YES (Bad time):</span>
                  <p className="text-slate-600 italic">"I understand. When would be a good time to call you again? This is regarding your forklifts and wheel loaders."</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <span className="font-semibold text-emerald-700 block">If NO (Go ahead):</span>
                  <p className="text-slate-600 italic">"I was given your name and number as the point of contact for [Company] as the person that handles disposals of surplus equipment. Let me ask you... How involved are you in the process of disposing your surplus forklifts when the time comes?"</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB: QUALIFY (COMPLETE SPECS & 6 PHOTO ANGLES) */}
        {activeTab === 'qualify' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-display font-bold text-slate-900 text-sm">
                Heavy Equipment & Forklift Qualification Checklist
              </div>
              <p className="text-slate-600 text-xs">
                When the prospect has equipment for sale, qualify all key technical parameters below:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { title: 'Make', question: 'Is it a Hyster, Taylor, Kalmar, or CAT?' },
                { title: 'Capacity', question: "What's the capacity? Is it 30,000 lbs, 50,000 lbs?" },
                { title: 'Year Model', question: "Do you know what's the year model?" },
                { title: 'Running Conditions', question: 'Is it in good running condition? Does it need any major repairs like engine or transmission?' },
                { title: 'Hours', question: 'How many hours does it have on the meter?' },
                { title: 'Serial Number', question: 'Do you have the serial number or model code?' },
                { title: 'Model', question: 'Do you have the exact model number?' },
                { title: 'Tires', question: 'Does it have cushion or pneumatic tires?' },
                { title: 'Fuel Type', question: 'Is it diesel, propane (LPG), or gasoline?' },
                { title: 'Mast Stages', question: 'Does it have a two-stage or three-stage mast?' },
                { title: 'Attachments (SS / FP)', question: 'Does it have a Side-Shift or a Fork-Positioner?' },
                { title: 'Leaks', question: 'Does it show any hydraulic or fluid leaks?' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="font-semibold text-slate-900 text-xs block">{item.title}</span>
                  <p className="text-slate-600 italic">"{item.question}"</p>
                </div>
              ))}
            </div>

            {/* Plastics & Medical Technical Reminders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-semibold text-emerald-950 block">Plastics Injection Molding Specs:</span>
                <p className="text-emerald-900">
                  Qualify Tonnage (500–2,000T), <strong>Shot Size in OZ</strong> (20 oz, 50 oz, 100 oz) and <strong>Screw Diameter in mm</strong> (50 mm, 70 mm, 135 mm).
                </p>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                <span className="font-semibold text-rose-950 block">Medical Imaging Specs:</span>
                <p className="text-rose-900">
                  Qualify MRI field strength (1.5T / 3.0T), CT slices (64/128/256), coil packages, tube count, and de-installation timeline.
                </p>
              </div>
            </div>

            {/* Price & 6 Mandatory Photo Angles */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
              <div className="font-display font-bold text-amber-950 text-sm">
                Pricing Strategy & 6 Mandatory Photo Angles
              </div>

              <div className="space-y-1.5 text-slate-800">
                <p><strong>Asking Price:</strong> "Do you have an asking price?"</p>
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1">
                  <p className="font-semibold text-slate-900">If they state a price ($xxx.xxx):</p>
                  <p className="italic text-slate-700">"Ok, so do you think it's possible to get some pictures taken of the machine in order for us to have a better idea of it? (front, sides, back, dataplate, hour meter, cab)."</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1">
                  <p className="font-semibold text-slate-900">If they ask: "How much are you giving me? / Make me an offer":</p>
                  <p className="italic text-slate-700">"In order for us to make you a good offer, we will need to get some pictures taken and more information of the unit. Do you think you could email them to me? (front, sides, back, dataplate, hour meter, cab)."</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5">
                <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
                  The 6 Required Photo Angles for JYC Valuation:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-slate-800 font-medium">
                  <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded">1. Front view</span>
                  <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded">2. Side views</span>
                  <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded">3. Rear / Back view</span>
                  <span className="px-2 py-1 bg-amber-100 border border-amber-300 rounded font-semibold text-amber-950">4. Data plate (placa)</span>
                  <span className="px-2 py-1 bg-amber-100 border border-amber-300 rounded font-semibold text-amber-950">5. Hour meter</span>
                  <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded">6. Cab / Operator seat</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-800 pt-1">
                <p><strong>Stakeholder discovery before hanging up:</strong></p>
                <p className="italic text-slate-700">"In addition to you, who else is involved in the surplus equipment sales process? Do you want me to copy somebody else on that email?"</p>
              </div>
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

        {/* TAB: SELL / CROSS-SELLING */}
        {activeTab === 'sell' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="font-display font-bold text-blue-950 text-sm">
                When the Client Has No Surplus Equipment But Uses Machinery
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                If they don't have machinery for sale today, ask: <em>"Do you use forklifts or wheel loaders in your daily operations?"</em>
              </p>
            </div>

            {/* Scenario A: They do NOT use that equipment */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">
                Branch A: If they DO NOT use that type of equipment (Local Referral Loop):
              </span>
              <p className="italic text-slate-700">
                "Do you know about any other company in your area that might be interested in buying or selling this type of equipment?"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 block">If No:</span>
                  <p className="text-slate-600">"Thank you very much for your time and information. Have a great day."</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-semibold text-slate-700 block">If Yes (Referral):</span>
                  <p className="text-slate-600">"Who should I ask for? Do you have the phone number?"</p>
                </div>
              </div>
            </div>

            {/* Scenario B: They DO use that equipment -> Pitch domestic inventory */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-emerald-950 block">
                Branch B: If they DO use that equipment (JYC Domestic Fleet Pitch):
              </span>
              <p className="italic text-emerald-900">
                "We have late model units with low hours in great conditions available for immediate delivery for the domestic market. We give out warranty, finance 100% and take care of the logistics. Are you looking to buy any forklifts or wheel loaders in the near future?"
              </p>
            </div>

            {/* Sub-branch B1: Yes, looking to buy -> SELL! */}
            <div className="p-4 bg-white border-2 border-blue-600 rounded-xl space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-blue-900 text-sm">
                  SELL! 8 Discovery Questions When Client is Looking to Buy:
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                  Opportunity
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { n: '1', q: 'What is it that you are looking to buy?' },
                  { n: '2', q: 'Do you have an specific make? Taylor, Hyster, etc.?' },
                  { n: '3', q: 'Any specific model, capacity or any other details required?' },
                  { n: '4', q: 'How soon are you looking to buy it?' },
                  { n: '5', q: 'Where do you need it delivered to?' },
                  { n: '6', q: 'What do you need it for exactly?' },
                  { n: '7', q: 'Do you have a budget in mind or a year range where you would like to be?' },
                  { n: '8', q: 'SELL! In addition to you, who else is involved in the purchase process?' },
                ].map(item => (
                  <div key={item.n} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {item.n}
                    </span>
                    <p className="font-medium text-slate-800">{item.q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-branch B2: No, not looking to buy right now */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <span className="font-semibold text-slate-800 block">If NOT looking to buy right now:</span>
              <p className="italic text-slate-700">
                "Do you have an email address where I could send you our information so you could keep us in mind if anything comes up in the future? When would be a good time to follow up with you in the future? 1 month? 2 months?"
              </p>
            </div>
          </div>
        )}

        {/* TAB: OBJECTIONS */}
        {activeTab === 'objections' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"How do you buy equipment from Miami? / Where are you located?"</p>
              <p className="text-slate-600 text-xs">
                "We are located in Miami FL but we buy equipment all over the United States and Canada. If we get to a price agreement for your equipment, we wire the money within 24 hours. After you have the confirmed money in your bank, we take care of all logistics, rigging, and pick-up."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Send somebody here to inspect it physically"</p>
              <p className="text-slate-600 text-xs">
                "It is a little hard for us to send someone over immediately since our central evaluation desk is located in Miami FL. However, if you can send us 6 quick photos of the machine, data plate, and hour meter, our acquisitions team will deliver a formal written cash offer in 24 hours. Once we agree on numbers, we can coordinate inspection and pickup."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"How did you get my phone number?"</p>
              <p className="text-slate-600 text-xs">
                "We are currently calling different companies in your area that might be using this type of equipment. You probably talked to one of my coworkers in the past as your company information was already on our industrial records. Let me ask you..."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Tell me your offer first / Give me a ballpark"</p>
              <p className="text-slate-600 text-xs">
                "In order for us to make you a good, realistic offer, we need photos of the unit (front, sides, back, data plate, hour meter, and cab). We don't want to throw out a fake number over the phone. Once you email those over, our purchasing team will issue a guaranteed cash offer within 24 hours."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"The equipment is leased through the bank (Buyout Option)"</p>
              <p className="text-slate-600 text-xs">
                "Do you have a buyout option at the end of the lease term? If you do... We also buy end of lease equipment, and we can pay more than the buyout option. Plus, you won't have to pay for any freight or repair costs since we buy the equipment as/is where/is. That way you make some money, we keep the machine and you can still get your new equipment."
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"We always send our machines to auction"</p>
              <p className="text-slate-600 text-xs">
                "We buy equipment in any condition for stock and we don't charge any commissions (saving you 10% to 15%). If we agree on a price we can pay within 24 hours and we take care of 100% of freight and rigging. Are you planning to auction any equipment anytime soon?"
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"We trade them in with the dealer (Trade-in)"</p>
              <p className="text-slate-600 text-xs">
                "Please keep us in mind next time. We pay more than the trade-in value of the machines since we export the units we buy, pay in 24 hours cash, and handle all rigging/freight. Do you have anything you are considering trading in?" <em>(Note: Matrix Plastics disposes of equipment for cash and never uses trade-in).</em>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Sell to another company / Quote request"</p>
              <p className="text-slate-600 text-xs">
                "Do you think you could quote us next time you have equipment available for sale? I'm pretty sure we can pay you more than the majority of companies since we export globally."
              </p>
            </div>
          </div>
        )}

        {/* TAB: VOICEMAIL SCRIPT */}
        {activeTab === 'voicemail' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="font-display font-bold text-emerald-950 text-sm">
                Official JYC Voicemail Protocol
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                When transferred to voicemail or when reaching an executive's answering machine, leave this structured message clearly and with confidence:
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs sm:text-sm">
              <span className="font-semibold text-slate-900 block">English Script:</span>
              <p className="p-4 bg-white rounded-xl border border-slate-200 text-slate-900 italic leading-relaxed">
                "Good afternoon [Contact Name], my name is [Your Name] and I am with JYC exports and imports. We're major buyers of used heavy equipment such as forklifts and wheel loaders and I would like to check if the company has any equipment for sale at this time or if you are expecting anything in the near future. We usually pay more than any other company for your used equipment since we export the units we buy. Please call me back. My phone number is <strong className="text-blue-700 not-italic">[Your Direct Callback Number / e.g. (786) 207-9119]</strong>, again <strong className="text-blue-700 not-italic">[Your Direct Callback Number / e.g. (786) 207-9119]</strong>. Thanks, and have a nice day."
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs sm:text-sm">
              <span className="font-semibold text-slate-900 block">Spanish Version:</span>
              <p className="p-4 bg-white rounded-xl border border-slate-200 text-slate-900 italic leading-relaxed">
                "Buenas tardes [Nombre del Contacto], mi nombre es [Tu Nombre] de JYC exports and imports. Somos compradores directos de maquinaria pesada usada como montacargas y cargadores frontales, y quería verificar si la empresa tiene algún equipo disponible para la venta en este momento o por renovar próximamente. Usualmente pagamos más que cualquier otra compañía porque exportamos las unidades. Por favor regrese mi llamada a mi número directo <strong className="text-blue-700 not-italic">[Tu Teléfono / ej. (786) 207-9119]</strong>, nuevamente <strong className="text-blue-700 not-italic">[Tu Teléfono / ej. (786) 207-9119]</strong>. Muchas gracias y que tenga buen día."
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <strong>Key Tip:</strong> Repeat the phone number twice slowly and clearly at the end so the decision-maker can write it down without having to replay the message.
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
