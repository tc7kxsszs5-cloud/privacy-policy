import { create } from 'zustand'
import type { MaterialFinish } from '@/components/CarViewer/bridge'

type PartConfig = {
  materialId: string
  colorHex: string
  finish: MaterialFinish
}

type WindowConfig = {
  tintPercent: number
}

type EditorStore = {
  carId: string | null
  glbUrl: string | null
  selectedMesh: string | null
  partsConfig: Record<string, PartConfig>
  windowsConfig: Record<string, WindowConfig>

  setCarId: (id: string, glbUrl: string | null) => void
  selectMesh: (meshName: string | null) => void
  applyMaterial: (meshName: string, config: PartConfig) => void
  applyTint: (meshName: string, tintPercent: number) => void
  resetAll: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  carId: null,
  glbUrl: null,
  selectedMesh: null,
  partsConfig: {},
  windowsConfig: {},

  setCarId: (id, glbUrl) => set({ carId: id, glbUrl, partsConfig: {}, windowsConfig: {}, selectedMesh: null }),
  selectMesh: (meshName) => set({ selectedMesh: meshName }),
  applyMaterial: (meshName, config) =>
    set(s => ({ partsConfig: { ...s.partsConfig, [meshName]: config } })),
  applyTint: (meshName, tintPercent) =>
    set(s => ({ windowsConfig: { ...s.windowsConfig, [meshName]: { tintPercent } } })),
  resetAll: () => set({ partsConfig: {}, windowsConfig: {}, selectedMesh: null }),
}))
