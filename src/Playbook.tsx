import React, { useState } from 'react';
import { 
  BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, 
  Briefcase, Zap, Anchor, HeartPulse, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'plastics' | 'ports' | 'medical' | 'reference' | 'objections' | 'catalog'>('bypass');

  const tabs = [
    { id: 'bypass', label: 'Recepción y apertura', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'qualify', label: '7 preguntas de calificación', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'plastics', label: 'Plásticos', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'ports', label: 'Puertos', icon: <Anchor className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'medical', label: 'Imagen médica', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> },
    { id: 'reference', label: 'Si hoy no vende', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'objections', label: 'Objeciones', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'catalog', label: 'Qué compramos', icon: <Briefcase className="w-3.5 h-3.5" /> },
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
              Guion comercial y guía por sector
            </h3>
            <p className="text-xs text-slate-500">
              Estructura paso a paso para superar recepción, calificar equipos y responder objeciones
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
                1. Cómo superar recepción (Gatekeeper)
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">En inglés:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Good morning, could you please transfer me to the person in charge of plant operations or the used machinery, like your injection molding machines, forklifts, or loaders?"
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">En español:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 italic">
                  "Buenos días, ¿me podría comunicar con el encargado de planta, operaciones o la maquinaria usada como sus inyectoras de plástico, montacargas o cargadores?"
                </p>
              </div>
              
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-lg space-y-1 text-xs">
                <p className="font-semibold text-blue-950">
                  Si preguntan "¿De parte de quién o para qué asunto?":
                </p>
                <p className="text-slate-800 italic">
                  "This is [Name] with JYC Equipment. We are nationwide buyers of used heavy machinery and equipment. I wanted to check with the plant manager if you might have any surplus machines for sale or coming up for renewal this year. Is he available?"
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Regla clave:</strong> El cliente es una planta industrial (plásticos, cantera, aserradero, puerto), no un distribuidor. Pide siempre por el <strong>Jefe de Operaciones, Planta o Flota</strong> para evitar que recepción te envíe por error a su departamento de ventas.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="font-display font-bold text-slate-900 text-sm">
                2. Apertura con el responsable (Key Person)
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Saludo inicial:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "Hi [Name], this is [My Name] with JYC Equipment. Did I catch you at a bad time?"
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500">Motivo de la llamada:</p>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium italic">
                  "I'm calling because we are nationwide buyers of used industrial machinery such as injection molding machines, forklifts, and loaders. I wanted to check with you if you might have anything for sale right now or maybe coming up this year?"
                </p>
                <p className="text-xs text-slate-500 italic pt-1">
                  En español: "Le llamo porque somos compradores a nivel nacional de maquinaria industrial y pesada. Quería consultar si tienen algún equipo disponible ahora o para renovar este año."
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB: QUALIFY */}
        {activeTab === 'qualify' && (
          <div className="space-y-3">
            <p className="text-slate-600 text-xs sm:text-sm">
              Cuando el cliente confirme que tiene una máquina en venta, realiza estas <strong>7 preguntas en orden</strong>:
            </p>
            
            <div className="space-y-2">
              {[
                { n: '1', title: 'Tipo de equipo', desc: 'And what type of equipment is it? Is it an injection molding machine, blow molder, reach stacker, or forklift?' },
                { n: '2', title: 'Modelo', desc: "What's the model?" },
                { n: '3', title: 'Marca / fabricante', desc: "What's the make? (Cincinnati Milacron, Krauss Maffei, Engel, Kalmar, Taylor, CAT...)" },
                { n: '4', title: 'Tonelaje o capacidad', desc: 'What is the tonnage or capacity? (e.g. 500 Ton, 1000 Ton, 45-Ton, or 30k lbs)' },
                { n: '5', title: 'Año de fabricación', desc: 'Do you know what year it is and approximate hours?' },
                { n: '6', title: 'Condición y reparaciones', desc: 'Is it currently running or does it need any major repairs?' },
                { n: '7', title: 'Precio esperado y fotografías', desc: 'Do you have a price in mind for it? / Could you send me pictures including the data plate and control panel?' }
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
                Argumento clave en plásticos: Desmontaje (Rigging) y flete incluidos
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Extraer una inyectora de 500 a 2,000 toneladas de una planta es costoso y complejo. <strong>JYC cubre el 100% del desmontaje pesado (rigging), grúas y transporte</strong>, y liquida el pago en 24 horas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Inyectoras de plástico (500–2000T)</p>
                <p className="text-slate-600">Cincinnati Milacron, Krauss Maffei, Engel, Husky, Sumitomo, Nissei, Toshiba, Arburg.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Sopladoras y extrusoras</p>
                <p className="text-slate-600">Blow molders continuas o con acumulador, extrusoras de husillo simple o doble.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Equipo auxiliar</p>
                <p className="text-slate-600">Chillers, secadores (dryers), molinos granuladores y termorreguladores.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Montacargas de planta</p>
                <p className="text-slate-600">Toyota, Crown, Hyster y Yale de 5,000 a 15,000 lbs para manejo de moldes.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PORTS */}
        {activeTab === 'ports' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="font-display font-bold text-blue-950 text-sm">
                Argumento clave en puertos: Logística portuaria y desarmado de pluma
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Mover un Reach Stacker de 45 toneladas requiere desarmar la pluma, transporte especializado RGN y permisos portuarios. <strong>JYC coordina todo el desmontaje y logística</strong> con pago inmediato.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Reach Stackers (45 Toneladas)</p>
                <p className="text-slate-600">Kalmar Gloria DRG450, Konecranes SMV 4531, Hyster RS45, Taylor TER-975. (Nunca menciones Caterpillar para reach stackers).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Manipuladores de contenedores</p>
                <p className="text-slate-600">Taylor TEC-950L, Kalmar DCF100, Hyster H550HD, Konecranes.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Montacargas pesados (30k–90k lbs)</p>
                <p className="text-slate-600">Taylor TX-300/TX-550, Hyster H360HD/H650HD, Kalmar, Svetruck.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Tractores de patio (Spotters)</p>
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
                Argumento clave en JYC Medical: Desinstalación criogénica llave en mano
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Retirar un resonador magnético o tomógrafo de un hospital exige descenso criogénico (ramp-down) y extracción especializada. <strong>JYC Medical realiza toda la desinstalación técnica y logística</strong> pagando por adelantado.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Resonadores MRI (1.5T y 3.0T)</p>
                <p className="text-slate-600">GE (Optima, Signa), Siemens (Magnetom Avanto, Aera, Skyra, Vida), Philips (Ingenia).</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-semibold text-slate-900">Tomógrafos CT (64/128/256 cortes)</p>
                <p className="text-slate-600">GE Revolution/Optima, Siemens Somatom, Canon/Toshiba Aquilion, Philips.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REFERENCE */}
        {activeTab === 'reference' && (
          <div className="space-y-3">
            <p className="text-slate-600 text-xs sm:text-sm">
              Si el cliente indica que hoy no tiene maquinaria en venta, aprovecha la llamada para perfilar la cuenta con estas <strong>6 preguntas</strong>:
            </p>

            <div className="space-y-2">
              {[
                { n: '1', title: 'Proceso de venta', desc: 'How does the process look like when you do have surplus equipment for sale?' },
                { n: '2', title: 'Compra de usado vs. nuevo', desc: 'Do you buy used equipment as well, or do you only go for brand new units?' },
                { n: '3', title: 'Alcance de su puesto', desc: 'Are you involved on both the sales and purchases of the equipment?' },
                { n: '4', title: 'Próximas adquisiciones', desc: 'Are you planning to buy any used injection molding machines, loaders, or forklifts anytime soon?' },
                { n: '5', title: 'Otras plantas o sucursales', desc: 'Do you take care of equipment sales at several locations, or only your plant?' },
                { n: '6', title: 'Fecha de próximo contacto', desc: 'When would be the best time to follow up with you—in 3, 6, or 12 months?' },
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
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Dame un precio primero / Hazme una oferta tú"</p>
              <p className="text-slate-600 text-xs">
                "Con gusto podemos enviar a alguien a inspeccionar la unidad y presentar una oferta, pero para no hacerle perder tiempo si no es un modelo que compremos, ¿me podría confirmar primero qué marca, modelo, tonelaje y año es?"
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Siempre mandamos nuestras máquinas a subasta"</p>
              <p className="text-slate-600 text-xs">
                Pregunta si ya firmaron contrato. Recuérdales que las casas de subasta cobran del 10% al 15% de comisión y el cliente paga el flete. JYC paga en 24 horas, sin comisión, y asume todo el desmontaje y transporte.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"Las entregamos a cuenta al distribuidor (Trade-in)"</p>
              <p className="text-slate-600 text-xs">
                Los distribuidores ofrecen valores bajos de retoma para proteger su margen. JYC paga más en efectivo inmediato porque exportamos a nivel global, dándole liquidez para negociar un mejor descuento en su máquina nueva.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
              <p className="font-semibold text-slate-900 text-xs sm:text-sm">"El equipo está en arrendamiento (Leasing) con el banco"</p>
              <p className="text-slate-600 text-xs">
                JYC compra equipos al término del leasing directamente al banco en su estado actual (as-is), ahorrándole a la planta penalizaciones por desgaste, reparaciones exigidas y costos de devolución.
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
                <span>Equipos que JYC sí compra</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Plásticos y moldeo</p>
                  <p className="text-slate-600 mt-0.5">Inyectoras (500–2000T), extrusoras, sopladoras, chillers y secadores.</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Equipo portuario</p>
                  <p className="text-slate-600 mt-0.5">Reach Stackers 45T, manipuladores de contenedores y tractores de patio.</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Diagnóstico médico</p>
                  <p className="text-slate-600 mt-0.5">Resonadores MRI 1.5T/3.0T, tomógrafos CT y PET/CT (GE, Siemens, Philips).</p>
                </div>
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
                  <p className="font-semibold text-slate-900">Carga y movimiento</p>
                  <p className="text-slate-600 mt-0.5">Cargadores CAT (988, 966) y montacargas pesados Taylor / Hyster (30k–90k lbs).</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
              <div className="font-semibold text-red-900 text-xs sm:text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Equipos que NO compramos (declinar con cortesía y redirigir)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Bombas de concreto', 'Camiones mezcladores (ollas)', 'Barredoras', 'Rodillos compactadores', 'Moldes de concreto', 'Grúas sobre camión'].map((item) => (
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
