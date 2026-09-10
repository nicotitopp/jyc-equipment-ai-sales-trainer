import React, { useState } from 'react';
import { BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, Briefcase, Zap, Anchor, HeartPulse } from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'plastics' | 'ports' | 'medical' | 'reference' | 'objections' | 'catalog'>('bypass');

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 h-full flex flex-col min-h-[400px] max-h-full overflow-hidden">
      
      {/* Playbook Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 shrink-0">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800 text-sm">JYC Sales Playbook & Multi-Industry Script</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mt-2 gap-1 overflow-x-auto shrink-0 no-scrollbar">
        {[
          { id: 'bypass', label: 'Bypass & Opening', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'qualify', label: 'Qualification', icon: <ClipboardList className="w-3.5 h-3.5" /> },
          { id: 'plastics', label: '🧪 Plastics Script', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" /> },
          { id: 'ports', label: '🚢 Ports Script', icon: <Anchor className="w-3.5 h-3.5 text-blue-600" /> },
          { id: 'medical', label: '🏥 Medical Script', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> },
          { id: 'reference', label: 'Future Reference', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'objections', label: 'Objections', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'catalog', label: 'Industries & Catalog', icon: <Briefcase className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/30 font-bold'
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
              <p className="font-semibold text-slate-800 italic">"Good morning, could you please transfer me to the person in charge of plant operations or the used machinery, like your injection molding machines, forklifts, or loaders?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o la maquinaria usada como sus inyectoras de plástico, montacargas o cargadores?"</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-slate-700">If they ask "What is this in regards to?":</p>
                <p className="italic text-slate-600">"This is [Name] with JYC Equipment. We are nationwide buyers of used heavy machinery and equipment. I wanted to check with the plant manager if you might have any surplus machines for sale or coming up for renewal this year. Is he available?"</p>
                <p className="text-[11px] text-slate-500 italic">En español: "Habla [Nombre] de JYC Equipment. Compramos maquinaria pesada usada a nivel nacional y quería consultar con el jefe de planta si tienen algún equipo sobrante o por renovar este año."</p>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 text-[11px] text-amber-800">
                <strong>⚠️ Regla de Oro:</strong> El prospecto <strong>NO es comerciante de maquinaria</strong>; es una empresa industrial (plásticos, cantera, aserradero, planta). Preguntar por el <em>Jefe de Operaciones / Planta / Flota</em> evita que la operadora te transfiera por error a su propio departamento de ventas.
              </div>
            </div>

            {/* KP Script */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 font-bold text-[10px] text-blue-700 uppercase">2. Opening with the Key Person (KP)</span>
              <p className="font-semibold text-slate-800 italic">"Hi [KP Name], this is [Name] with JYC Equipment. Did I catch you at a bad time?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Hola [Nombre], habla [Mi Nombre] de JYC Equipment. ¿Lo tomo en un mal momento?"</p>
              <p className="text-slate-500 mt-1">Wait for response. If they cooperate, present the hook:</p>
              <p className="font-semibold text-slate-800 italic">"I'm calling because we are nationwide buyers of used industrial machinery such as injection molding machines, forklifts, and loaders. I wanted to check with you if you might have anything for sale right now or maybe coming up this year?"</p>
              <p className="text-[11px] text-slate-500 italic">En español: "Le llamo porque somos compradores a nivel nacional de maquinaria industrial y pesada como inyectoras de plástico, montacargas y cargadores. Quería consultar si tienen algún equipo disponible ahora o para renovar este año."</p>
            </div>

          </div>
        )}

        {activeTab === 'qualify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-[10px] text-emerald-700 uppercase">7 Qualification Questions (In Exact Order)</span>
              <p className="text-slate-500">If the prospect confirms they have a machine unit available for sale, qualify the machine by asking the following questions in order:</p>
              
              <ul className="space-y-2 bg-emerald-50/20 border border-emerald-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span><strong>Equipment Type:</strong> And what type of equipment is it? Is it an injection molding machine, blow molder, extruder, or forklift?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">2.</span>
                  <span><strong>Model:</strong> What's the model?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">3.</span>
                  <span><strong>Make:</strong> What's the make? (Cincinnati Milacron, Krauss Maffei, Engel, Komatsu, Taylor, Toyota...)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">4.</span>
                  <span><strong>Tonnage / Capacity:</strong> What is the tonnage or capacity? (e.g. 500 Ton, 1000 Ton, 2000 Ton, or 30k lbs)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">5.</span>
                  <span><strong>Year:</strong> Do you know what year it is?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">6.</span>
                  <span><strong>Condition & Repairs:</strong> Is it running or does it need any major repairs?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">7.</span>
                  <span><strong>Price & Photos:</strong> Do you have a price in mind for it? / Could you please send me some pictures including the data plate, shot size/tonnage plate, and control panel?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'plastics' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">Official Plastic Machinery Sales Script</span>
              <p className="text-slate-600 text-xs">JYC buys complete running and non-running plastic machinery nationwide and takes care of all heavy <strong>Rigging (dismantling) and Freight</strong>.</p>
            </div>

            {/* Core Target Machinery in Plastics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-emerald-900">🔹 Injection Molding Machines</p>
                <p className="text-[10px] text-slate-600">500 Ton, 1000 Ton, 2000 Ton units (Cincinnati Milacron, Krauss Maffei, Engel, Husky, Sumitomo, Nissei, Toshiba, Arburg, Battenfeld).</p>
              </div>
              <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-emerald-900">🔹 Blow Molders & Extruders</p>
                <p className="text-[10px] text-slate-600">Continuous and accumulator head blow molders, single/twin screw plastic extruders.</p>
              </div>
              <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-emerald-900">🔹 Auxiliary Equipment</p>
                <p className="text-[10px] text-slate-600">Dryers, Chillers, Granulators/Grinders, Mold Temperature Controllers (Thermolators), Hopper loaders.</p>
              </div>
              <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-emerald-900">🔹 Mold-Handling Forklifts</p>
                <p className="text-[10px] text-slate-600">Toyota 5k-6k lbs propane, Crown C-5, Yale, Doosan counterbalance forklifts.</p>
              </div>
            </div>

            {/* Plastics Script Highlights */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="font-bold text-slate-800 text-[11px]">Plastics Operator Pitch:</p>
              <p className="italic text-slate-700 text-[11px]">"Good morning, could you please transfer me to the person in charge of the used plastic injection molding machines and equipment?"</p>
              <p className="font-bold text-slate-800 text-[11px] mt-2">Plastics KP Pitch:</p>
              <p className="italic text-slate-700 text-[11px]">"Hi [Name], this is [My Name] with JYC Equipment. Did I catch you at a bad time? ... We are nationwide buyers of used plastic injection molding machines and equipment. I wanted to check if you might have any surplus machines for sale or coming up this year?"</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
              <p className="font-bold">⭐ JYC's Biggest Value Proposition in Plastics:</p>
              <p>Rigging and extracting large 500-2000 Ton injection machines from a factory is extremely expensive and complex. <strong>JYC covers 100% of rigging (heavy dismantling/crane loading) and freight logistics</strong> and pays in full in 24 hours.</p>
            </div>
          </div>
        )}

        {activeTab === 'ports' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">Official Ports & Terminals Sales Script</span>
              <p className="text-slate-600 text-xs">JYC is a leading nationwide buyer and global exporter of heavy maritime port equipment, intermodal machinery, and terminal fleets. We handle 100% of <strong>heavy rigging, boom dismantling, and multi-axle freight logistics</strong>.</p>
            </div>

            {/* Target Machinery in Ports */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-blue-900">🚢 Reach Stackers (45-Ton)</p>
                <p className="text-[10px] text-slate-600">Kalmar Gloria DRG450, Konecranes SMV 4531/4532, Hyster RS45, Taylor TER-975, Sany, CVS Ferrari. (⚠️ NEVER mention Caterpillar for reach stackers).</p>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-blue-900">📦 Container Handlers</p>
                <p className="text-[10px] text-slate-600">Loaded & Empty container handlers: Taylor TEC-950L, Taylor TXLC, Kalmar DCF100/DRF, Hyster H550HD, Konecranes.</p>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-blue-900">🚜 Port Forklifts (30k-90k+ lbs)</p>
                <p className="text-[10px] text-slate-600">Taylor (TX-300, TX-550), Hyster (H360HD, H650HD), Kalmar, Konecranes, Svetruck heavy-duty forklifts.</p>
              </div>
              <div className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-blue-900">🚛 Terminal Tractors & Spotters</p>
                <p className="text-[10px] text-slate-600">Ottawa (T2 4x2 / 6x4), Terberg (YT182, YT222, RT223), Capacity (TJ5000, TJ9000), TICO Pro-Spotter.</p>
              </div>
            </div>

            {/* Ports Script Highlights */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="font-bold text-slate-800 text-[11px]">Ports Operator Pitch (Gatekeeper Bypass):</p>
              <p className="italic text-slate-700 text-[11px]">"Good morning, could you please transfer me to the person in charge of terminal operations, fleet maintenance, or the heavy equipment like your reach stackers, container handlers, or yard trucks?"</p>
              <p className="text-[10px] text-slate-500 italic">En español: "Buenos días, ¿me podría comunicar con el encargado de operaciones de terminal, mantenimiento de flota o la maquinaria pesada como sus reach stackers, manipuladores de contenedores o tractocamiones de patio?"</p>
              
              <p className="font-bold text-slate-800 text-[11px] mt-2">Ports KP Opening & Pitch:</p>
              <p className="italic text-slate-700 text-[11px]">"Hi [KP Name], this is [My Name] with JYC Equipment. Did I catch you at a bad time?... I'm calling because we are nationwide buyers and global exporters of used port and terminal equipment—such as 45-ton reach stackers, container handlers, heavy forklifts, and yard tractors. I wanted to check if you might have any surplus units for sale or coming up for renewal in your fleet?"</p>
              <p className="text-[10px] text-slate-500 italic">En español: "Hola [Nombre], habla [Mi Nombre] de JYC Equipment. ¿Lo tomo en un mal momento?... Le llamo porque compramos a nivel nacional y exportamos equipo portuario usado—como reach stackers de 45T, manipuladores de contenedores, montacargas pesados y tractores de patio. ¿Tienen algún equipo disponible o por renovar este año?"</p>
            </div>

            {/* Ports Qualification Checklist */}
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
              <p className="font-bold text-blue-900 text-[11px]">📋 Ports Qualification Checklist (Ask in order):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                <li><strong>Equipment Type:</strong> Reach Stacker 45T, Empty/Loaded Handler, Heavy Port Forklift (30k-80k lbs), or Terminal Tractor?</li>
                <li><strong>Make & Model:</strong> Kalmar Gloria DRG450, Konecranes SMV 4531, Taylor TEC-950L, Hyster RS45, Ottawa T2?</li>
                <li><strong>Capacity & Spreader:</strong> 45-Ton rating? Spreader 20'-40' telescopic? 5-high or 6-high stacking?</li>
                <li><strong>Year & Operating Hours:</strong> What year is the unit and approximate engine / mast hours?</li>
                <li><strong>Condition:</strong> Is it currently active in terminal ops? Any hydraulic leaks, boom issues, or transmission repairs needed?</li>
                <li><strong>Price & Data Plates:</strong> Do you have an asking price in mind? / Can you share photos of the unit, hour meter, and data plate?</li>
              </ol>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
              <p className="font-bold">⭐ JYC's Value Proposition for Ports & Terminals:</p>
              <p>Moving a 45-Ton reach stacker requires boom disassembly, multi-axle RGN transport, and strict port TWIC/safety clearances. <strong>JYC coordinates 100% of rigging, logistics, and port permits, wire transferring payment in full in 24 hours.</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">Official JYC Medical Diagnostic Imaging Script</span>
              <p className="text-slate-600 text-xs">JYC Medical purchases pre-owned MRIs, CT Scanners, PET/CTs, and digital X-ray systems from hospital networks and imaging centers nationwide, providing <strong>turnkey de-installation, ramping down, and rigging</strong>.</p>
            </div>

            {/* Target Systems in Medical */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-rose-900">🧲 MRIs (1.5 Tesla & 3.0 Tesla)</p>
                <p className="text-[10px] text-slate-600">GE (Optima MR450w, Signa Explorer), Siemens (Magnetom Avanto, Aera, Skyra, Vida), Philips (Ingenia, Achieva).</p>
              </div>
              <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-rose-900">☢️ CT Scanners (64/128/256-Slice)</p>
                <p className="text-[10px] text-slate-600">GE (Revolution, Optima CT660), Siemens (Somatom Definition, Force, go.Top), Toshiba/Canon (Aquilion ONE/PRIME), Philips.</p>
              </div>
              <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-rose-900">🔬 PET & PET-CT Systems</p>
                <p className="text-[10px] text-slate-600">GE Discovery MI/IQ, Siemens Biograph Horizon/Vision, Philips Vereos molecular imaging systems.</p>
              </div>
              <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1">
                <p className="font-bold text-slate-800 text-[11px] text-rose-900">🩺 Digital X-Rays & C-Arms / Cath Labs</p>
                <p className="text-[10px] text-slate-600">GE Innova, Siemens Artis zee / Cios, Philips Allura / Azurion cath labs, Ziehm mobile C-arms.</p>
              </div>
            </div>

            {/* Medical Script Highlights */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="font-bold text-slate-800 text-[11px]">Medical Operator Pitch (Hospital / Imaging Center):</p>
              <p className="italic text-slate-700 text-[11px]">"Good morning, could you please transfer me to the Director of Imaging, Radiology, or the person in charge of surplus and retired diagnostic imaging equipment like your MRIs, CT scanners, or PET/CTs?"</p>
              <p className="text-[10px] text-slate-500 italic">En español: "Buenos días, ¿me podría comunicar con el Director de Imagenología, Radiología o el encargado del equipo de diagnóstico médico usado como sus resonancias magnéticas, tomógrafos CT o PET/CT?"</p>
              
              <p className="font-bold text-slate-800 text-[11px] mt-2">Medical KP Opening & Pitch:</p>
              <p className="italic text-slate-700 text-[11px]">"Hi [KP Name], this is [My Name] with JYC Medical. Did I catch you at a bad time?... I'm calling because we purchase diagnostic imaging systems nationwide—including MRIs (1.5T and 3.0T), CT scanners, and PET/CTs from GE, Siemens, Toshiba/Canon, and Philips. I wanted to see if your facility has any imaging systems scheduled for de-installation, replacement, or asset disposition this year?"</p>
              <p className="text-[10px] text-slate-500 italic">En español: "Hola [Nombre], habla [Mi Nombre] de JYC Medical. ¿Lo tomo en un mal momento?... Le llamo porque compramos sistemas de imagenología médica a nivel nacional (resonancias 1.5T/3.0T, tomógrafos CT, PET/CTs de GE, Siemens, Toshiba/Canon, Philips). ¿Tienen algún equipo programado para desinstalación o renovación este año?"</p>
            </div>

            {/* Medical Qualification Workflow (From Script) */}
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1.5">
              <p className="font-bold text-rose-900 text-[11px]">📋 Official Medical Qualification Sequence (Step-by-Step):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                <li><strong>System Type:</strong> MRI (1.5T / 3.0T), PET, PET-CT, CT Scanner (64/128 slice), Cath Lab, or Digital X-Ray?</li>
                <li><strong>Make / Brand:</strong> GE Healthcare, Siemens Healthineers, Toshiba / Canon Medical Systems, or Philips Healthcare?</li>
                <li><strong>Quantity:</strong> How many units are available (1 unit, 5 units, 10-20 units across network)?</li>
                <li><strong>Model & Year:</strong> What is the specific model and manufacture year (e.g. 2017 Siemens Magnetom Aera 1.5T)?</li>
                <li><strong>Operational Status & Maintenance:</strong> Is it currently operational under OEM service contract? Helium level &gt;70% (for MRIs)? Tube mAs / exposure count (for CTs)?</li>
                <li><strong>Price, Coil Packages & Removal Window:</strong> What is your target price? What coils/software packages are included? What is the scheduled de-installation date?</li>
              </ol>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
              <p className="font-bold">⭐ JYC Medical's Turnkey Value Proposition:</p>
              <p>De-installing medical imaging equipment requires cryogenic ramping down, hospital wall/window rigging, and strict health safety compliance. <strong>JYC Medical handles 100% of cryogenic ramp-down, professional mechanical de-installation, crane rigging, and nationwide logistics, paying in full before de-installation begins.</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'reference' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 font-bold text-[10px] text-violet-700 uppercase">6 Questions When NO Equipment is Available</span>
              <p className="text-slate-500">If the prospect states they have no surplus machinery for sale today, ask these 6 reference questions to profile the account:</p>
              
              <ul className="space-y-2 bg-violet-50/20 border border-violet-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">1.</span>
                  <span><strong>Surplus Process:</strong> How does the process look like when you do have surplus equipment for sale?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">2.</span>
                  <span><strong>Used vs New:</strong> Do you buy used equipment as well? Or do you only go for brand new units?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">3.</span>
                  <span><strong>Authority:</strong> Are you involved on both the sales and purchases of the equipment?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">4.</span>
                  <span><strong>Future Purchases:</strong> Are you planning to buy any used injection molding machines, loaders, or forklifts anytime soon?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">5.</span>
                  <span><strong>Multi-Location:</strong> Do you take care of the equipment sales at several locations or branches, or only your plant?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">6.</span>
                  <span><strong>Follow-up Window:</strong> When would be the best time to follow up with you—in 3, 6, or 12 months?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'objections' && (
          <div className="space-y-3">
            <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 font-bold text-[10px] text-rose-700 uppercase">Objection Handling Guidelines</span>
            
            {/* Price First */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Give me a price first / Make me an offer first..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> "I can definitely send someone over to take pictures and inspect the unit, no problem. But before we do that, I don't want to waste your time... or ours if it's not something we would buy. Could you tell me a bit more first—what make, model, tonnage, and year is it? Is it running, or does it need any repairs?"</p>
            </div>

            {/* Auction */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"We always send our surplus machines to auction..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> Ask if they already signed the contract. Explain auction houses charge heavy seller commissions (10-15%) and the seller pays transport. JYC pays in 24 hours, charges 0% commission, and handles all rigging and freight.</p>
            </div>

            {/* Trade-in */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"We just trade them in with the dealer..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> Dealers offer low trade-in values to protect their margins. JYC pays higher net cash because we export units globally, giving you immediate cash and more leverage to negotiate a discount on the new purchase.</p>
            </div>

            {/* Leasing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Our equipment is on lease with the bank..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebuttal:</strong> JYC buys end-of-lease units directly from the bank as-is, saving you from bank wear-and-tear inspection penalties, expensive repair requests, and return rigging/shipping.</p>
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
                  <p className="font-bold text-slate-800 text-[10px]">🧪 Plastics & Injection</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Injection molders (500-2000T), extruders, blow molders, chillers, dryers.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">🏗️ Concrete & Precast</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Ready-mix, aggregates, quarries, concrete block plants.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">🪵 Lumber & Sawmills</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Sawmills, lumber yards, plywood & wood processing plants.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">⚙️ Steel & Metal</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Steel mills, steel pipe plants, tube & coil manufacturing.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">🚢 Ports & Terminals</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Container terminals, shipping ports, cargo handling, logistics hubs.</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-bold text-slate-800 text-[10px]">🏥 Medical & Healthcare</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">Hospital networks, diagnostic imaging centers, radiology clinics (MRI, CT, PET).</p>
                </div>
              </div>
            </div>

            {/* What JYC Buys */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-[10px] text-emerald-700 uppercase">2. Equipment We Buy</span>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-emerald-50/20 border border-emerald-50 rounded-xl">
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Plastics:</strong> Cincinnati Milacron, Krauss Maffei, Engel, Husky (500-2000T), extruders, chillers, dryers.</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Ports & Terminals:</strong> 45-Ton Reach Stackers (Kalmar, Konecranes, Hyster, Taylor), Container Handlers, Yard Tractors (Ottawa, Terberg).</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Medical Systems:</strong> MRIs 1.5T & 3.0T, CT Scanners (64/128-slice), PET/CTs (GE, Siemens, Toshiba/Canon, Philips).</span>
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Heavy Forklifts & Loaders:</strong> CAT Wheel Loaders (988, 966), Taylor & Hyster 30k-90k lbs forklifts, Volvo, Komatsu.</span>
                </li>
              </ul>
            </div>

            {/* What JYC Rejects */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 font-bold text-[10px] text-red-700 uppercase">3. We DO NOT Buy (Declines/Pivots)</span>
              <div className="p-3 bg-red-50/10 border border-red-50 rounded-xl space-y-2">
                <p className="text-slate-500 text-[10px]">Politely decline if offered any of these, then pivot back to injection molders, forklifts, or loaders:</p>
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
