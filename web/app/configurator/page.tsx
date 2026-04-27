'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { MATERIALS, FINISHES, FINISH_LABELS, type Material, type Finish } from '@/lib/catalog'

type MobileTab = 'models' | 'colors'

const CARS = [
  { key: 'audi_rs5', label: 'Audi RS5', brand: 'Audi' },
  { key: 'bmw_1m', label: 'BMW 1M', brand: 'BMW' },
  { key: 'bmw_m4_csl', label: 'BMW M4 CSL', brand: 'BMW' },
  { key: 'bmw_m5_f90', label: 'BMW M5 F90', brand: 'BMW' },
  { key: 'bmw_x5_m', label: 'BMW X5 M', brand: 'BMW' },
  { key: 'bmw_x6_2020', label: 'BMW X6', brand: 'BMW' },
  { key: 'bmw_x7_m60i', label: 'BMW X7 M60i', brand: 'BMW' },
  { key: 'cadillac_escalade', label: 'Cadillac Escalade', brand: 'Cadillac' },
  { key: 'ferrari_599_gto', label: 'Ferrari 599 GTO', brand: 'Ferrari' },
  { key: 'ferrari_laferrari', label: 'Ferrari LaFerrari', brand: 'Ferrari' },
  { key: 'ferrari_p45_pininfarina', label: 'Ferrari P45 Pininfarina', brand: 'Ferrari' },
  { key: 'ferrari_purosangue_2023', label: 'Ferrari Purosangue', brand: 'Ferrari' },
  { key: 'lamborghini_aventador_sv', label: 'Lamborghini Aventador SV', brand: 'Lamborghini' },
  { key: 'lamborghini_centenario', label: 'Lamborghini Centenario', brand: 'Lamborghini' },
  { key: 'lamborghini_diablo_sv', label: 'Lamborghini Diablo SV', brand: 'Lamborghini' },
  { key: 'lamborghini_gallardo', label: 'Lamborghini Gallardo', brand: 'Lamborghini' },
  { key: 'lamborghini_huracan', label: 'Lamborghini Huracán', brand: 'Lamborghini' },
  { key: 'lamborghini_murcielago', label: 'Lamborghini Murciélago', brand: 'Lamborghini' },
  { key: 'lamborghini_revuelto', label: 'Lamborghini Revuelto', brand: 'Lamborghini' },
  { key: 'lamborghini_sian', label: 'Lamborghini Sián', brand: 'Lamborghini' },
  { key: 'lamborghini_urus', label: 'Lamborghini Urus', brand: 'Lamborghini' },
  { key: 'mercedes_amg_gt', label: 'Mercedes AMG GT', brand: 'Mercedes' },
  { key: 'mercedes_c_class_2020', label: 'Mercedes C-Class', brand: 'Mercedes' },
  { key: 'mercedes_eqe', label: 'Mercedes EQE', brand: 'Mercedes' },
  { key: 'mercedes_g_class', label: 'Mercedes G-Class', brand: 'Mercedes' },
  { key: 'mercedes_gls', label: 'Mercedes GLS', brand: 'Mercedes' },
  { key: 'mercedes_maybach_gls_600', label: 'Mercedes Maybach GLS 600', brand: 'Mercedes' },
  { key: 'mercedes_maybach_s_2022', label: 'Mercedes Maybach S', brand: 'Mercedes' },
  { key: 'mercedes_sl65_amg', label: 'Mercedes SL65 AMG', brand: 'Mercedes' },
  { key: 'mercedes_v_class', label: 'Mercedes V-Class', brand: 'Mercedes' },
  { key: 'porsche_911_carrera_4s', label: 'Porsche 911 Carrera 4S', brand: 'Porsche' },
  { key: 'porsche_cayenne_turbo_coupe_2020', label: 'Porsche Cayenne Coupe', brand: 'Porsche' },
  { key: 'porsche_cayenne_turbo_gt_2022', label: 'Porsche Cayenne GT', brand: 'Porsche' },
  { key: 'rolls_royce_boattail', label: 'Rolls-Royce Boat Tail', brand: 'Rolls-Royce' },
  { key: 'rolls_royce_cullinan_2026', label: 'Rolls-Royce Cullinan', brand: 'Rolls-Royce' },
  { key: 'rolls_royce_ghost', label: 'Rolls-Royce Ghost', brand: 'Rolls-Royce' },
]

export default function ConfiguratorPage() {
  const [selectedCar, setSelectedCar] = useState(CARS.find(c => c.key === 'bmw_m4_csl') ?? CARS[0])
  const [selectedColor, setSelectedColor] = useState<Material>(MATERIALS[0])
  const [activeFinish, setActiveFinish] = useState<Finish>('gloss')
  const [loaded, setLoaded] = useState(false)
  const [meshNames, setMeshNames] = useState<string[]>([])
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('models')
  const [isMobile, setIsMobile] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pendingColorRef = useRef<Material | null>(null)
  const loadedRef = useRef(false)
  const readyReceivedRef = useRef(false)
  const selectedCarRef = useRef(CARS.find(c => c.key === 'bmw_m4_csl') ?? CARS[0])
  const meshNamesRef = useRef<string[]>([])
  const bodyMeshNamesRef = useRef<string[]>([])
  const selectedColorRef = useRef<Material>(MATERIALS[0])
  const selectedMeshRef = useRef<string | null>(null)

  function sendToViewer(msg: object) {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }

  function loadCar(car: typeof CARS[0]) {
    setSelectedCar(car)
    selectedCarRef.current = car
    setLoaded(false)
    loadedRef.current = false
    readyReceivedRef.current = false
    setMeshNames([])
    meshNamesRef.current = []
    bodyMeshNamesRef.current = []
    setSelectedMesh(null)
    selectedMeshRef.current = null
  }

  function applyColorToAll(color: Material, names: string[]) {
    for (const meshName of names) {
      sendToViewer({ type: 'apply_material', meshName, colorHex: color.colorHex, finish: color.finish })
    }
  }

  function applyColor(color: Material) {
    setSelectedColor(color)
    selectedColorRef.current = color
    const bodyNames = bodyMeshNamesRef.current
    if (bodyNames.length === 0 && meshNamesRef.current.length === 0) {
      pendingColorRef.current = color
      return
    }
    const mesh = selectedMeshRef.current
    if (mesh) {
      sendToViewer({ type: 'apply_material', meshName: mesh, colorHex: color.colorHex, finish: color.finish })
    } else {
      applyColorToAll(color, bodyNames.length > 0 ? bodyNames : meshNamesRef.current)
    }
  }

  function selectMesh(meshName: string | null) {
    setSelectedMesh(meshName)
    selectedMeshRef.current = meshName
    sendToViewer({ type: 'highlight_mesh', meshName: meshName ?? '' })
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    function onModelLoaded(data: { meshNames: string[], bodyMeshNames: string[] }) {
      const names: string[] = data.meshNames ?? []
      const bodyNames: string[] = data.bodyMeshNames ?? names
      setMeshNames(names)
      meshNamesRef.current = names
      bodyMeshNamesRef.current = bodyNames
      setLoaded(true)
      loadedRef.current = true
      if (pendingColorRef.current) {
        applyColorToAll(pendingColorRef.current, bodyNames)
        pendingColorRef.current = null
      }
    }
    ;(window as any).__cwModelLoaded = onModelLoaded
    return () => { delete (window as any).__cwModelLoaded }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleMsg(e: MessageEvent) {
      const msg = e.data
      if (msg?.type === 'ready') {
        readyReceivedRef.current = true
        const url = `https://svicokgjtmaukzhapzrr.supabase.co/storage/v1/object/public/models/${selectedCarRef.current.key}.glb`
        sendToViewer({ type: 'load_model', glbUrl: url })
      } else if (msg?.type === 'model_loaded') {
        const names: string[] = msg.meshNames ?? []
        const bodyNames: string[] = msg.bodyMeshNames ?? names
        setMeshNames(names)
        meshNamesRef.current = names
        bodyMeshNamesRef.current = bodyNames
        setLoaded(true)
        loadedRef.current = true
        if (pendingColorRef.current) {
          applyColorToAll(pendingColorRef.current, bodyNames)
          pendingColorRef.current = null
        }
      } else if (msg?.type === 'model_error') {
        setLoaded(true)
        loadedRef.current = true
      } else if (msg?.type === 'mesh_tapped') {
        const name: string = msg.meshName
        if (!name) return
        const next = selectedMeshRef.current === name ? null : name
        selectMesh(next)
        if (next) {
          sendToViewer({
            type: 'apply_material',
            meshName: next,
            colorHex: selectedColorRef.current.colorHex,
            finish: selectedColorRef.current.finish,
          })
        }
      }
    }
    window.addEventListener('message', handleMsg)
    return () => window.removeEventListener('message', handleMsg)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const brands = [...new Set(CARS.map(c => c.brand))]

  const carListContent = (
    <div className="p-4">
      <p className="text-[#555] text-xs font-semibold tracking-widest uppercase mb-4">Модели</p>
      {brands.map(brand => (
        <div key={brand} className="mb-4">
          <p className="text-[#444] text-[10px] uppercase tracking-wider mb-2">{brand}</p>
          {CARS.filter(c => c.brand === brand).map(car => (
            <button
              key={car.key}
              onClick={() => loadCar(car)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 transition-colors ${
                selectedCar.key === car.key
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-medium'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {car.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )

  const colorPanelContent = (
    <>
      <div className="px-4 pt-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl shrink-0 border border-white/10" style={{ backgroundColor: selectedColor.colorHex }} />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{selectedColor.name}</p>
            <p className="text-[#555] text-[11px]">{FINISH_LABELS[selectedColor.finish]} · {selectedColor.brand}</p>
          </div>
        </div>
        {selectedMesh && (
          <p className="text-[#C9A84C]/70 text-[10px] mt-2 truncate">Деталь: {selectedMesh}</p>
        )}
      </div>
      <div className="flex gap-1 px-3 pt-3 pb-2 flex-wrap">
        {FINISHES.map(f => (
          <button
            key={f}
            onClick={() => setActiveFinish(f)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              activeFinish === f
                ? 'bg-[#C9A84C] text-black'
                : 'bg-[#151515] text-[#666] hover:text-[#aaa]'
            }`}
          >
            {FINISH_LABELS[f]}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-4 gap-1.5">
          {MATERIALS.filter(m => m.finish === activeFinish).map(color => (
            <button
              key={color.id}
              title={`${color.name} · ${color.brand} ${color.sku}`}
              onClick={() => applyColor(color)}
              className={`aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                selectedColor.id === color.id
                  ? 'border-[#C9A84C] scale-110'
                  : 'border-transparent hover:border-[#444]'
              }`}
              style={{ backgroundColor: color.colorHex }}
            />
          ))}
        </div>
        {/* Buttons after color grid — visible after scrolling */}
        <div className="mt-4 space-y-2">
          <a
            href="tel:+74954111003"
            className="block w-full text-center bg-[#C9A84C] text-black font-bold py-3 rounded-xl text-sm"
          >
            Записаться
          </a>
          <Link
            href="/ai-wrap"
            className="block w-full text-center border border-[#C9A84C]/30 text-[#C9A84C] font-semibold py-3 rounded-xl text-sm"
          >
            AI примерка ✦
          </Link>
        </div>
      </div>
    </>
  )

  const viewerBlock = (
    <div className="relative w-full h-full bg-[#666]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#aaa] text-sm">Загрузка модели...</p>
          </div>
        </div>
      )}
      {loaded && selectedMesh && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-[#C9A84C] text-xs font-semibold truncate max-w-[160px]">{selectedMesh}</span>
          <button onClick={() => selectMesh(null)} className="text-[#888] hover:text-white text-xs leading-none">✕</button>
        </div>
      )}
      {loaded && !selectedMesh && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-white/30 text-xs">Нажмите на деталь для выбора</span>
        </div>
      )}
      <iframe
        key={selectedCar.key}
        ref={iframeRef}
        src={`/viewer.html?model=${selectedCar.key}`}
        className="w-full h-full border-0"
        onLoad={() => {
          // Always send load_model from onLoad — don't rely on 'ready' message.
          // 'ready' fires before React's useEffect registers the listener (race condition).
          readyReceivedRef.current = true
          const url = `https://svicokgjtmaukzhapzrr.supabase.co/storage/v1/object/public/models/${selectedCarRef.current.key}.glb`
          sendToViewer({ type: 'load_model', glbUrl: url })
        }}
      />
    </div>
  )

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Navbar active={undefined} />

      {isMobile ? (
        /* Mobile layout */
        <div className="flex flex-col flex-1 overflow-hidden pt-16">
          <div className="h-[40vh] shrink-0">
            {viewerBlock}
          </div>
          <div className="flex border-t border-b border-[#1a1a1a] bg-[#0d0d0d] shrink-0">
            <button
              onClick={() => setMobileTab('models')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileTab === 'models' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-[#555]'
              }`}
            >
              Модели
            </button>
            <button
              onClick={() => setMobileTab('colors')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileTab === 'colors' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-[#555]'
              }`}
            >
              Цвета
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-[#0d0d0d] flex flex-col">
            {mobileTab === 'models' ? (
              <div className="flex-1 overflow-y-auto">{carListContent}</div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">{colorPanelContent}</div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop layout */
        <div className="flex flex-1 overflow-hidden pt-16">
          <div className="w-56 shrink-0 bg-[#0d0d0d] border-r border-[#1a1a1a] overflow-y-auto">
            {carListContent}
          </div>
          <div className="flex-1 relative">
            {viewerBlock}
          </div>
          <div className="w-64 shrink-0 bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col">
            {colorPanelContent}
          </div>
        </div>
      )}
    </main>
  )
}
