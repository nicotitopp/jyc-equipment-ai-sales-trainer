import React, { useState } from 'react';
import { 
  BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, 
  Briefcase, Zap, Anchor, HeartPulse, ChevronRight, AlertTriangle, 
  CheckCircle2, Sparkles, PhoneForwarded, Target
} from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'plastics' | 'ports' | 'medical' | 'reference' | 'objections' | 'catalog'>('bypass');

  const tabs = [
    { id: 'bypass', label: 'Bypass & Apertura', tag: 'STAGE-01', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'qualify', label: '7 Preguntas Calificación', tag: 'STAGE-02', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'plastics', label: 'Plásticos & Inyección', tag: 'SECTOR-01', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'ports', label: 'Puertos & Reach Stackers', tag: 'SECTOR-02', icon: <Anchor className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'medical', label: 'Imagen Médica & MRI', tag: 'SECTOR-03', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'reference', label: 'Sin Equipo (Prospección)', tag: 'STAGE-03', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'objections', label: 'Matriz de Objeciones', tag: 'DEFENSE', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'catalog', label: 'Catálogo & Límites', tag: 'EQUIP-DB', icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-[#0A0F17] rounded-2xl p-4 sm:p-5 border border-[#1E293B] shadow-2xl h-full flex flex-col min-h-[420px] max-h-full overflow-hidden text-left relative">
      
      {/* Playbook Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#1E293B] shrink-0 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-slate-100 text-xs sm:text-sm tracking-wide uppercase">
                JYC Sales Playbook & Multi-Industry Protocol
              </h3>
              <span className="hidden sm:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                REV 2026.4
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Guiones oficiales de bypass telefónico, gancho, calificación de maquinaria pesada y cierre
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 self-end sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ESTÁNDAR CERTIFICADO</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E293B] mt-2.5 gap-1.5 overflow-x-auto shrink-0 pb-1.5 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-950/60 to-slate-900 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'border-[#1E293B] bg-[#0E1520] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="opacity-80">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[8px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>
                {tab.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 text-left space-y-4 text-xs leading-relaxed text-slate-300 font-sans custom-scrollbar">
        
        {/* TAB: BYPASS & APERTURA */}
        {activeTab === 'bypass' && (
          <div className="space-y-4">
            
            {/* Operator Script */}
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 font-mono font-bold text-[10px] text-cyan-300 uppercase border border-slate-700">
                  <PhoneForwarded className="w-3 h-3" />
                  01. Filtro con la Operadora / Conmutador (Gatekeeper Bypass)
                </span>
                <span className="text-[10px] font-mono text-slate-400">OBJETIVO: EVITAR DEPARTAMENTO DE VENTAS</span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase text-slate-400">Pitch en Inglés (USA / Canada):</p>
                <div className="p-3 bg-[#080C14] rounded-lg border border-[#1E293B] font-mono text-xs text-amber-200 font-medium">
                  "Good morning, could you please transfer me to the person in charge of plant operations or the used machinery, like your injection molding machines, forklifts, or loaders?"
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase text-slate-400">Traducción Oficial al Español:</p>
                <div className="p-2.5 bg-[#080C14]/60 rounded-lg border border-[#1E293B]/60 text-slate-300 text-[11px] italic">
                  "Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o la maquinaria usada como sus inyectoras de plástico, montacargas o cargadores?"
                </div>
              </div>
              
              <div className="bg-[#121B2A] border border-cyan-900/40 rounded-lg p-3 space-y-1.5">
                <p className="font-mono font-bold text-cyan-300 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Si la operadora pregunta: "¿De parte de quién y para qué asunto?" ("What is this in regards to?"):
                </p>
                <p className="text-slate-200 font-mono text-[11px]">
                  "This is [Name] with JYC Equipment. We are nationwide buyers of used heavy machinery and equipment. I wanted to check with the plant manager if you might have any surplus machines for sale or coming up for renewal this year. Is he available?"
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  En español: "Habla [Nombre] de JYC Equipment. Compramos maquinaria pesada usada a nivel nacional y quería consultar con el jefe de planta si tienen algún equipo sobrante o por renovar este año."
                </p>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3 text-[11px] text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono text-amber-300 uppercase">Regla de Oro Táctica:</strong> El prospecto <strong>NO es revendedor de maquinaria</strong>; es una planta industrial (plásticos, cantera, aserradero, terminal). Preguntar explícitamente por el <em>Jefe de Operaciones / Planta / Mantenimiento de Flota</em> evita que la telefonista te derive a su propio equipo de ventas comerciales.
                </div>
              </div>
            </div>

            {/* KP Script */}
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 font-mono font-bold text-[10px] text-cyan-300 uppercase border border-cyan-800">
                  <Target className="w-3 h-3" />
                  02. Apertura Directa con el Key Person (KP)
                </span>
                <span className="text-[10px] font-mono text-slate-400">OBJETIVO: GANCHO & DISPONIBILIDAD</span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase text-slate-400">Paso 1: Permiso de Conversación (Elimina Resistencia):</p>
                <div className="p-3 bg-[#080C14] rounded-lg border border-[#1E293B] font-mono text-xs text-amber-200">
                  "Hi [KP Name], this is [Name] with JYC Equipment. Did I catch you at a bad time?"
                </div>
                <p className="text-[10px] text-slate-400 italic">"Hola [Nombre], habla [Mi Nombre] de JYC Equipment. ¿Lo tomo en un mal momento?"</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase text-slate-400">Paso 2: Gancho Comercial Inmediato (Propuesta de Valor):</p>
                <div className="p-3 bg-[#080C14] rounded-lg border border-[#1E293B] font-mono text-xs text-cyan-200">
                  "I'm calling because we are nationwide buyers of used industrial machinery such as injection molding machines, forklifts, and loaders. I wanted to check with you if you might have anything for sale right now or maybe coming up this year?"
                </div>
                <p className="text-[10px] text-slate-400 italic">"Le llamo porque somos compradores a nivel nacional de maquinaria industrial y pesada como inyectoras de plástico, montacargas y cargadores. Quería consultar si tienen algún equipo disponible ahora o para renovar este año."</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB: QUALIFY */}
        {activeTab === 'qualify' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 font-mono font-bold text-[10px] text-emerald-300 uppercase border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Secuencia Rigurosa de Calificación (7 Preguntas en Orden)
                </span>
                <span className="text-[10px] font-mono text-slate-400">PROTOCOLO DE ADQUISICIÓN</span>
              </div>
              
              <p className="text-slate-300 text-xs">
                Cuando el prospecto confirme que tiene una o más máquinas para venta o renovación, formula <strong>estas 7 preguntas en estricto orden secuencial</strong> para determinar la viabilidad del activo:
              </p>
              
              <div className="space-y-2">
                {[
                  { n: '01', title: 'Tipo de Equipo (Equipment Type)', desc: 'And what type of equipment is it? Is it an injection molding machine, blow molder, extruder, reach stacker, or forklift?' },
                  { n: '02', title: 'Modelo Específico (Model)', desc: "What's the exact model designation on the machine nameplate?" },
                  { n: '03', title: 'Marca / Fabricante (Make)', desc: "What's the make? (Cincinnati Milacron, Krauss Maffei, Engel, Kalmar, Taylor, Komatsu, CAT, GE...)" },
                  { n: '04', title: 'Tonelaje o Capacidad (Tonnage / Rating)', desc: 'What is the tonnage or capacity? (e.g. 500 Ton, 1000 Ton, 2000 Ton, 45-Ton spreader, or 30k-80k lbs)' },
                  { n: '05', title: 'Año de Fabricación (Year)', desc: 'Do you know what year the unit was manufactured and approximate operating hours?' },
                  { n: '06', title: 'Condición Operativa & Averías (Condition)', desc: 'Is it currently powered and running, or does it need any major repairs / hydraulic overhaul?' },
                  { n: '07', title: 'Expectativa de Precio & Fotografías (Price & Assets)', desc: 'Do you have a target price in mind for it? / Could you send me pictures including the serial data plate, tonnage plate, and hours meter?' }
                ].map((q) => (
                  <div key={q.n} className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg flex items-start gap-3 hover:border-emerald-500/40 transition-colors">
                    <span className="w-7 h-7 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {q.n}
                    </span>
                    <div className="space-y-1">
                      <p className="font-mono font-bold text-slate-200 text-xs">{q.title}</p>
                      <p className="font-mono text-amber-200/90 text-[11px]">{q.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLASTICS */}
        {activeTab === 'plastics' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 font-mono font-bold text-[10px] text-emerald-300 uppercase border border-emerald-800">
                  <Zap className="w-3 h-3" />
                  Protocolo Oficial: Maquinaria de Plásticos & Inyección
                </span>
                <span className="text-[10px] font-mono text-emerald-400">JYC CORE SPECIALTY</span>
              </div>
              <p className="text-slate-300 text-xs">
                JYC compra maquinaria plástica completa, operativa o fuera de servicio a nivel nacional, asumiendo el 100% de los costos de <strong>Desmontaje Industrial Pesado (Rigging), Grúas de Izaje y Flete Especializado</strong>.
              </p>

              {/* Machinery cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-emerald-400 text-xs">01 // Inyectoras de Plástico (500-2000+ Toneladas)</p>
                  <p className="text-[11px] text-slate-300">Cincinnati Milacron, Krauss Maffei, Engel, Husky, Sumitomo, Nissei, Toshiba, Arburg, Battenfeld, UBE.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-emerald-400 text-xs">02 // Sopladoras & Extrusoras</p>
                  <p className="text-[11px] text-slate-300">Blow molders continúas y con acumulador, extrusoras mono y doble husillo para perfilería y tubería.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-emerald-400 text-xs">03 // Equipo Auxiliar de Planta</p>
                  <p className="text-[11px] text-slate-300">Chillers industriales, secadores de resina (dryers), molinos/trituradores de gran capacidad, termorreguladores (thermolators).</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-emerald-400 text-xs">04 // Montacargas de Molde</p>
                  <p className="text-[11px] text-slate-300">Toyota 5k-15k lbs gas LP, Crown C-5, Hyster, Yale, Doosan para maniobra de moldes pesados.</p>
                </div>
              </div>

              <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-2">
                <p className="font-mono font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Propuesta de Valor Irresistible en Plásticos:
                </p>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  Desmontar y extraer una inyectora de 1,000 Toneladas cuesta típicamente entre \$15,000 y \$40,000 USD y conlleva alto riesgo de daño a techos o fosas. <strong>JYC absorbe el 100% de la maniobra de rigging certificado, grúa móvil y transporte en camas bajas (lowboy / RGN)</strong> y liquida la compra en 24 horas vía transferencia bancaria por adelantado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PORTS */}
        {activeTab === 'ports' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/80 font-mono font-bold text-[10px] text-cyan-300 uppercase border border-cyan-800">
                  <Anchor className="w-3 h-3" />
                  Protocolo Oficial: Maquinaria Portuaria & Terminales Intermodales
                </span>
                <span className="text-[10px] font-mono text-cyan-400">HEAVY MARITIME ASSETS</span>
              </div>
              <p className="text-slate-300 text-xs">
                JYC es comprador nacional y exportador global de equipo portuario pesado, patios de maniobras y terminales intermodales.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-cyan-400 text-xs">01 // Reach Stackers (45 Toneladas)</p>
                  <p className="text-[11px] text-slate-300">Kalmar Gloria DRG450, Konecranes SMV 4531, Hyster RS45, Taylor TER-975, Sany, CVS Ferrari. (⚠️ NUNCA menciones Caterpillar para reach stackers).</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-cyan-400 text-xs">02 // Manipuladores de Contenedores</p>
                  <p className="text-[11px] text-slate-300">Contenedores vacíos y llenos (Empty/Loaded Handlers): Taylor TEC-950L, Kalmar DCF100, Hyster H550HD, Konecranes.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-cyan-400 text-xs">03 // Montacargas Portuarios (30k-90k+ lbs)</p>
                  <p className="text-[11px] text-slate-300">Taylor TX-300, TX-550, Hyster H360HD, H650HD, Kalmar, Svetruck para manejo de rollos y carga pesada.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-cyan-400 text-xs">04 // Tractocamiones de Patio (Terminal Tractors)</p>
                  <p className="text-[11px] text-slate-300">Ottawa T2 (4x2 / 6x4), Terberg YT182/YT222, Capacity TJ5000/TJ9000, TICO Pro-Spotter.</p>
                </div>
              </div>

              <div className="p-3 bg-[#111A29] border border-cyan-800/40 rounded-lg space-y-2 font-mono text-xs">
                <p className="font-bold text-cyan-300">Apertura con KP Portuario (Director de Operaciones / Flota):</p>
                <div className="p-2.5 bg-[#080C14] rounded border border-[#1E293B] text-amber-200">
                  "Hi [KP Name], this is [Name] with JYC Equipment. Did I catch you at a bad time?... We are nationwide buyers and global exporters of used port and terminal equipment—such as 45-ton reach stackers, container handlers, and yard tractors. Do you have any surplus units available or coming up for replacement in your fleet?"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEDICAL */}
        {activeTab === 'medical' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 font-mono font-bold text-[10px] text-rose-300 uppercase border border-rose-800">
                  <HeartPulse className="w-3 h-3" />
                  Protocolo Oficial: Diagnóstico por Imagen Médica (JYC Medical)
                </span>
                <span className="text-[10px] font-mono text-rose-400">CLINICAL ASSET DISPOSITION</span>
              </div>
              <p className="text-slate-300 text-xs">
                JYC Medical adquiere sistemas de imagen diagnóstica usados de redes hospitalarias y centros radiológicos, ejecutando el <strong>descenso criogénico (ramp-down), extracción mecánica y rigging especializado</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-rose-400 text-xs">01 // Resonancias Magnéticas (MRI 1.5T & 3.0T)</p>
                  <p className="text-[11px] text-slate-300">GE (Optima MR450w, Signa Explorer), Siemens (Magnetom Avanto, Aera, Skyra, Vida), Philips (Ingenia, Achieva).</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-rose-400 text-xs">02 // Tomógrafos CT (64/128/256 Cortes)</p>
                  <p className="text-[11px] text-slate-300">GE Revolution / Optima, Siemens Somatom Definition / Force, Canon/Toshiba Aquilion ONE, Philips.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-rose-400 text-xs">03 // Sistemas PET & PET-CT</p>
                  <p className="text-[11px] text-slate-300">GE Discovery MI/IQ, Siemens Biograph Horizon/Vision, Philips Vereos de medicina nuclear.</p>
                </div>
                <div className="p-3 bg-[#080C14] border border-[#1E293B] rounded-lg space-y-1">
                  <p className="font-mono font-bold text-rose-400 text-xs">04 // Rayos X Digitales & Salas de Hemodinamia (Cath Labs)</p>
                  <p className="text-[11px] text-slate-300">GE Innova, Siemens Artis zee, Philips Allura / Azurion, arcos en C móviles Ziehm.</p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-950/30 border border-rose-800/60 rounded-xl space-y-2">
                <p className="font-mono font-bold text-rose-300 text-xs">Puntos Críticos de Calificación Médica:</p>
                <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-200">
                  <li><strong>Nivel de Helio en MRIs:</strong> Debe superar el 70% para evitar costes de re-presurización criogénica.</li>
                  <li><strong>Contrato OEM Activo:</strong> Si el equipo tiene póliza de servicio vigente con GE, Siemens o Philips, su valor de reventa es significativamente superior.</li>
                  <li><strong>Ventana de Desinstalación:</strong> Coordinar la fecha límite antes de la llegada del equipo de reemplazo al hospital.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REFERENCE */}
        {activeTab === 'reference' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-violet-950/80 font-mono font-bold text-[10px] text-violet-300 uppercase border border-violet-800">
                  <FileText className="w-3 h-3" />
                  Protocolo de Futura Referencia (Cuando el Prospecto NO Vende Hoy)
                </span>
                <span className="text-[10px] font-mono text-slate-400">PERFILAMIENTO DE CUENTA</span>
              </div>
              <p className="text-slate-300 text-xs">
                Si el prospecto declara que no tiene equipo en venta en este momento, no cuelgues. Realiza las siguientes <strong>6 preguntas de perfilamiento</strong> para asegurar negocios futuros:
              </p>

              <div className="space-y-2">
                {[
                  { n: '1', title: 'Proceso de Venta de Excedentes', desc: 'How does the process look like when you do have surplus equipment for sale?' },
                  { n: '2', title: 'Compras de Usado vs Nuevo', desc: 'Do you buy used machinery as well, or do you only purchase brand new units from dealers?' },
                  { n: '3', title: 'Poder de Decisión', desc: 'Are you involved on both the sales and purchases of heavy equipment for the company?' },
                  { n: '4', title: 'Planes de Expansión / Compras', desc: 'Are you planning to buy any used injection molders, loaders, or forklifts anytime soon?' },
                  { n: '5', title: 'Multi-Ubicación / Otras Sucursales', desc: 'Do you manage equipment at multiple facilities/branches or only this specific plant?' },
                  { n: '6', title: 'Ventana de Seguimiento (Follow-up)', desc: 'When would be the best time to follow up with you—in 3, 6, or 12 months?' },
                ].map((item) => (
                  <div key={item.n} className="p-2.5 bg-[#080C14] border border-[#1E293B] rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded bg-violet-950/60 border border-violet-800 text-violet-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {item.n}
                    </span>
                    <div>
                      <p className="font-mono font-bold text-slate-200 text-xs">{item.title}</p>
                      <p className="font-mono text-amber-200/90 text-[11px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: OBJECTIONS */}
        {activeTab === 'objections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 font-mono font-bold text-[10px] text-amber-300 uppercase border border-amber-800">
                <ShieldAlert className="w-3 h-3" />
                Matriz Táctica de Manejo de Objeciones
              </span>
              <span className="text-[10px] font-mono text-slate-400">CONTRAMEDIDAS OFICIALES</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-[#0E1522] border border-[#1E293B] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-xs">Objeción 01: "Dame un precio primero / Hazme una oferta tú..."</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">PRESIÓN DE PRECIO</span>
                </div>
                <div className="p-3 bg-[#080C14] rounded-lg border border-[#1E293B] text-slate-200 font-mono text-xs">
                  "I can definitely send someone over to take pictures and inspect the unit, no problem. But before we do that, I don't want to waste your time... or ours if it's not something we buy. Could you tell me what make, model, tonnage, and year it is? Is it running or does it need repairs?"
                </div>
              </div>

              <div className="p-3.5 bg-[#0E1522] border border-[#1E293B] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-xs">Objeción 02: "Siempre enviamos las máquinas a subasta (Ritchie Bros, etc.)..."</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">CANAL SUBASTA</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pregunta si ya firmaron contrato de exclusividad. Recuerda que las casas de subasta cobran entre el 10% y el 15% de comisión al vendedor, el transporte corre a cargo de la planta y el pago tarda hasta 45 días. <strong>JYC paga neto de inmediato en 24 horas, sin comisión y con rigging incluido</strong>.
                </p>
              </div>

              <div className="p-3.5 bg-[#0E1522] border border-[#1E293B] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-xs">Objeción 03: "Se las entregamos al distribuidor como parte de pago (Trade-in)..."</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">DEALER TRADE-IN</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Los distribuidores castigan el valor de retoma para blindar su margen. JYC ofrece mayor efectivo neto porque exportamos globalmente. Tener el dinero en mano le da al cliente mayor poder de negociación para exigir descuentos en su compra de maquinaria nueva.
                </p>
              </div>

              <div className="p-3.5 bg-[#0E1522] border border-[#1E293B] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 text-xs">Objeción 04: "La maquinaria está bajo arrendamiento financiero (Lease)..."</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">LEASING BANCARIO</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  JYC compra activos al vencimiento del leasing directamente con la institución financiera en condición 'as-is', librando a la empresa de cargos por desgaste, inspecciones penalizadoras y costes de retorno.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="bg-[#0E1522] border border-[#1E293B] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 font-mono font-bold text-[10px] text-indigo-300 uppercase border border-indigo-800">
                  <Briefcase className="w-3 h-3" />
                  Catálogo de Activos Autorizados & Filtros de Exclusión
                </span>
                <span className="text-[10px] font-mono text-slate-400">JYC ACQUISITION SCOPE</span>
              </div>

              {/* What JYC Buys */}
              <div className="space-y-2">
                <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Equipos que JYC SÍ Compra (Prioridad A1):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#080C14] border border-emerald-900/50 rounded-lg">
                    <p className="font-mono font-bold text-slate-200">Plásticos & Moldeo</p>
                    <p className="text-[11px] text-slate-400">Inyectoras 500-2000T, extrusoras, blow molders, molinos, chillers, secadores.</p>
                  </div>
                  <div className="p-2.5 bg-[#080C14] border border-emerald-900/50 rounded-lg">
                    <p className="font-mono font-bold text-slate-200">Terminales Portuarias</p>
                    <p className="text-[11px] text-slate-400">Reach Stackers 45T, manipulación de contenedores, tractores Ottawa/Terberg.</p>
                  </div>
                  <div className="p-2.5 bg-[#080C14] border border-emerald-900/50 rounded-lg">
                    <p className="font-mono font-bold text-slate-200">Sistemas Médicos</p>
                    <p className="text-[11px] text-slate-400">Resonancias magnéticas 1.5T/3.0T, tomógrafos CT, PET/CT de GE, Siemens, Philips.</p>
                  </div>
                  <div className="p-2.5 bg-[#080C14] border border-emerald-900/50 rounded-lg">
                    <p className="font-mono font-bold text-slate-200">Montacargas Pesados & Cargadores</p>
                    <p className="text-[11px] text-slate-400">Taylor / Hyster 30k-90k lbs, cargadores frontales CAT 988, 966, 950.</p>
                  </div>
                </div>
              </div>

              {/* What JYC Rejects */}
              <div className="p-3.5 bg-red-950/20 border border-red-500/40 rounded-xl space-y-2">
                <span className="font-mono font-bold text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Equipos Excluidos — NO COMPRAMOS (Rechazo Cortés & Pivote):
                </span>
                <p className="text-slate-400 text-[11px]">
                  Si el prospecto ofrece cualquiera de estos rubros, declina amablemente y pivota hacia inyectoras, montacargas o cargadores:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Bombas de Concreto', 'Camiones Mezcladores (Ollas)', 'Barredoras Viales', 'Rodillos Compactadores', 'Moldes de Concreto', 'Grúas Montadas sobre Camión', 'Mezcladoras Continuas'].map((item) => (
                    <span key={item} className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 font-mono text-[10px]">
                      ✕ {item}
                    </span>
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