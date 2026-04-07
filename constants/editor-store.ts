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
  meshNames: string[]
  partsConfig: Record<string, PartConfig>
  windowsConfig: Record<string, WindowConfig>
  selectedStudioId: string | null
  selectedStudioHashtag: string | null

  setCarId: (id: string, glbUrl: string | null) => void
  selectMesh: (meshName: string | null) => void
  setMeshNames: (names: string[]) => void
  applyMaterial: (meshName: string, config: PartConfig) => void
  applyTint: (meshName: string, tintPercent: number) => void
  resetAll: () => void
  selectStudio: (studioId: string, hashtag: string) => void
  clearStudio: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  carId: null,
  glbUrl: null,
  selectedMesh: null,
  meshNames: [],
  partsConfig: {},
  windowsConfig: {},
  selectedStudioId: null,
  selectedStudioHashtag: null,

  setCarId: (id, glbUrl) => set(s => s.carId === id
    ? { glbUrl }
    : { carId: id, glbUrl, partsConfig: {}, windowsConfig: {}, selectedMesh: null, meshNames: [] }
  ),
  selectMesh: (meshName) => set({ selectedMesh: meshName }),
  setMeshNames: (names) => set({ meshNames: names }),
  applyMaterial: (meshName, config) =>
    set(s => ({ partsConfig: { ...s.partsConfig, [meshName]: config } })),
  applyTint: (meshName, tintPercent) =>
    set(s => ({ windowsConfig: { ...s.windowsConfig, [meshName]: { tintPercent } } })),
  resetAll: () => set({ partsConfig: {}, windowsConfig: {}, selectedMesh: null }),
  selectStudio: (studioId, hashtag) => set({ selectedStudioId: studioId, selectedStudioHashtag: hashtag }),
  clearStudio: () => set({ selectedStudioId: null, selectedStudioHashtag: null }),
}))
