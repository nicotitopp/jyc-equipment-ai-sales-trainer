import React, { useState } from 'react';
import { BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, HelpCircle } from 'lucide-react';

export default function Playbook() {
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'reference' | 'objections'>('bypass');

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
          { id: 'bypass', label: 'Bypass & Apertura', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'qualify', label: 'Calificación', icon: <ClipboardList className="w-3.5 h-3.5" /> },
          { id: 'reference', label: 'Preguntas Referencia', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'objections', label: 'Objeciones', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
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
      <div className="flex-1 overflow-y-auto pt-4 text-left space-y-4 text-xs leading-relaxed text-slate-600">
        
        {activeTab === 'bypass' && (
          <div className="space-y-4">
            
            {/* Operator Script */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700 uppercase">1. Con la Operadora (Filtro)</span>
              <p className="font-semibold text-slate-800 italic">"Buenos días, ¿me podría comunicar con la persona encargada de la venta de sus equipos pesados usados, como sus montacargas o cargadores?"</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-slate-700">Si preguntan "¿De qué se trata?":</p>
                <p className="italic text-slate-600">"Habla [Nombre] de JYC Equipment. Somos compradores nacionales de maquinaria pesada usada. Quería verificar si tienen algún excedente para venta en este momento o planificado para este año."</p>
              </div>
            </div>

            {/* KP Script */}
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 font-bold text-[10px] text-blue-700 uppercase">2. Apertura con la Persona Clave (KP)</span>
              <p className="font-semibold text-slate-800 italic">"Hola [Nombre]. Habla [Nombre] de JYC Equipment. ¿Le tomo en un mal momento?"</p>
              <p className="text-slate-500">Espera respuesta. Si cooperan, presenta el gancho de compra:</p>
              <p className="font-semibold text-slate-800 italic">"Le llamo porque somos compradores a nivel nacional de equipos pesados usados, como cargadores y montacargas. Quería validar si tienen algo disponible para venta en este momento o planificado para este año."</p>
            </div>

          </div>
        )}

        {activeTab === 'qualify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 font-bold text-[10px] text-emerald-700 uppercase">Calificación de Maquinaria Disponible</span>
              <p className="text-slate-500">Si el cliente confirma que **sí** tiene un equipo para vender, debes calificarlo realizando las siguientes preguntas en orden:</p>
              
              <ul className="space-y-2 bg-emerald-50/20 border border-emerald-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">1.</span>
                  <span><strong>Tipo de equipo:</strong> ¿Qué tipo de maquinaria es? ¿Montacargas, cargador, excavadora?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">2.</span>
                  <span><strong>Marca & Modelo:</strong> ¿Qué marca y modelo exacto es?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">3.</span>
                  <span><strong>Año:</strong> ¿Sabes de qué año es la máquina?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">4.</span>
                  <span><strong>Estado:</strong> ¿El equipo está operativo (corriendo) o necesita alguna reparación mayor?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">5.</span>
                  <span><strong>Precio pretendido:</strong> ¿Tienen algún precio objetivo en mente?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">6.</span>
                  <span><strong>Fotos y Placas:</strong> ¿Me podría enviar fotos generales del equipo, incluyendo la placa de datos y el horómetro?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reference' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2 py-0.5 rounded-md bg-violet-50 font-bold text-[10px] text-violet-700 uppercase">Si NO tienen Equipos Disponibles</span>
              <p className="text-slate-500">Si el cliente dice que **no** tiene maquinaria para vender hoy, debes perfilar la compañía y dejar la puerta abierta a futuro con estas preguntas:</p>
              
              <ul className="space-y-2 bg-violet-50/20 border border-violet-50 p-3 rounded-xl">
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Proceso de venta:</strong> ¿Cómo manejan habitualmente su proceso cuando tienen excedentes o deciden desincorporar maquinaria usada?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Compras:</strong> ¿Ustedes también compran maquinaria usada para su operación o siempre van por unidades nuevas?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Sucursales:</strong> ¿Usted se encarga de las ventas de maquinaria en varias plantas/sedes o solo de esta locación?</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Preferencia:</strong> En su operación diaria, ¿usan más Cargadores o Montacargas?</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'objections' && (
          <div className="space-y-3">
            <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 font-bold text-[10px] text-rose-700 uppercase">Manejo de Objeciones del Script</span>
            
            {/* Auction */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Todo lo enviamos a Subastas..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebatir:</strong> Explica que en subasta pierden del 10% al 15% en comisiones del subastador, además del costo de transporte. JYC paga de inmediato en 24 horas y nosotros nos encargamos del flete a nivel nacional sin comisiones.</p>
            </div>

            {/* Trade-in */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Hacemos Trade-in (toma a cuenta) con el distribuidor..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebatir:</strong> Los distribuidores castigan el precio de las máquinas viejas. JYC puede pagarles un valor neto superior, lo cual les dará más dinero en efectivo y mayor poder de negociación para comprar su unidad nueva con cualquier marca.</p>
            </div>

            {/* Leasing */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">"Los equipos están bajo Arrendamiento (Lease)..."</p>
              <p className="text-slate-600"><strong className="text-blue-600">Rebatir:</strong> Explica que JYC compra unidades al fin de sus contratos de leasing directamente al banco. Esto le evita a su empresa pagar penalizaciones por desgaste, reparaciones y gastos de retorno al banco.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
