import type { MaterialFinish } from '@/components/CarViewer/bridge'
import { FINISH_LABELS, MATERIAL_PRESETS, type MaterialPreset } from '@/constants/materials-data'

export type AiWrapMaterialPreset = MaterialPreset

// Separate duplicated palette for the photo/AI flow.
// 3D configurator keeps using constants/materials-data.ts directly.
export const AI_WRAP_MATERIAL_PRESETS: AiWrapMaterialPreset[] = MATERIAL_PRESETS.map((material) => ({
  ...material,
}))

export const AI_WRAP_FINISH_LABELS: Record<MaterialFinish, string> = {
  ...FINISH_LABELS,
}
