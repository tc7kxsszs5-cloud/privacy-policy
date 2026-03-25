# CarWrap App — Plan 2: 3D Editor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3D car editor where users tap a car part, pick a wrap material/color, see it applied in real time, then save or share their configuration.

**Architecture:** Three.js runs inside a `react-native-webview` WebView, loading a GLB model from URL. React Native owns all UI (tabs, bottom sheets, state). The two sides communicate via a typed `postMessage` bridge defined in the spec. Zustand holds editor state in RN; WebView is a pure renderer that reflects that state.

**Tech Stack:** react-native-webview, Three.js (CDN via WebView HTML), GLTFLoader, OrbitControls, Raycaster, @gorhom/bottom-sheet, Zustand, Supabase JS v2, Expo SDK 55

---

## Project Location

`/Users/mac/dev/carwrap/`

---

## File Map

```
app/
  editor/
    [carId].tsx              # Main editor screen — tabs, state wiring, save/share

components/
  CarViewer/
    index.tsx                # WebView wrapper — loads viewer.html, posts messages
    bridge.ts                # postMessage type definitions (RN→WebView, WebView→RN)
    viewer.html.ts           # Three.js HTML/JS as exported string constant

  editor/
    MaterialSheet.tsx        # Bottom sheet: finish picker + color picker
    TintSheet.tsx            # Bottom sheet: per-window tint sliders
    EditorTabs.tsx           # Bottom tab bar: Parts / Glass / Summary

constants/
  materials-data.ts          # Hardcoded material presets for MVP
  editor-store.ts            # Zustand store: selectedMesh, parts config, windows config
```

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via bun install)

- [ ] **Step 1: Install react-native-webview and bottom sheet**
```bash
cd /Users/mac/dev/carwrap
bunx expo install react-native-webview
bun add @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated
```

- [ ] **Step 2: Add reanimated plugin to app.json**

Edit `app.json` — add `react-native-reanimated/plugin` to plugins array:
```json
{
  "expo": {
    "name": "CarWrap",
    "slug": "carwrap",
    "version": "1.0.0",
    "scheme": "carwrap",
    "web": { "bundler": "metro" },
    "plugins": [
      "expo-router",
      "react-native-reanimated"
    ]
  }
}
```

- [ ] **Step 3: Add reanimated babel plugin to babel.config.js**

Create `babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  }
}
```

- [ ] **Step 4: Verify install**
```bash
cd /Users/mac/dev/carwrap
bun run start --clear
# Expected: starts without module-not-found errors, press Ctrl+C after 5s
```

- [ ] **Step 5: Commit**
```bash
cd /Users/mac/dev/carwrap
git add .
git commit -m "feat: install react-native-webview, bottom-sheet, reanimated"
```

---

## Task 2: Bridge types

**Files:**
- Create: `components/CarViewer/bridge.ts`

- [ ] **Step 1: Create bridge.ts**

Create `components/CarViewer/bridge.ts`:
```typescript
// Messages sent FROM React Native TO WebView
export type RNtoWebView =
  | { type: 'load_model'; glbUrl: string }
  | { type: 'apply_material'; meshName: string; colorHex: string; finish: MaterialFinish }
  | { type: 'apply_tint'; meshName: string; tintPercent: number }
  | { type: 'reset_all' }

// Messages sent FROM WebView TO React Native
export type WebViewToRN =
  | { type: 'mesh_tapped'; meshName: string }
  | { type: 'model_loaded' }
  | { type: 'model_error'; message: string }

export type MaterialFinish = 'gloss' | 'matte' | 'carbon' | 'chrome' | 'satin'

export function postToWebView(ref: React.RefObject<any>, msg: RNtoWebView) {
  ref.current?.injectJavaScript(`
    window.dispatchEvent(new MessageEvent('message', {
      data: ${JSON.stringify(JSON.stringify(msg))}
    }));
    true;
  `)
}
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/CarViewer/bridge.ts
git commit -m "feat: add WebView bridge type definitions"
```

---

## Task 3: Three.js viewer HTML

**Files:**
- Create: `components/CarViewer/viewer.html.ts`

- [ ] **Step 1: Create viewer.html.ts**

Create `components/CarViewer/viewer.html.ts`:
```typescript
export const VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f0f0f; overflow: hidden; width: 100vw; height: 100vh; }
    canvas { display: block; width: 100% !important; height: 100% !important; }
    #loading {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      color: #e63946; font-family: sans-serif; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="loading">Загрузка...</div>
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
    }
  }
  </script>
  <script type="module">
    import * as THREE from 'three'
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
    import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

    // --- Scene setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    document.body.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f0f0f)

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(3, 1.5, 3)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 8
    controls.maxPolarAngle = Math.PI / 2 + 0.2

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 8, 5)
    dirLight.castShadow = true
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-5, 2, -5)
    scene.add(fillLight)

    // Ground plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // --- State ---
    let carModel = null
    const meshMaterials = {} // meshName → THREE.MeshStandardMaterial

    // --- Loaders ---
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/')
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    function loadModel(url) {
      if (carModel) { scene.remove(carModel); carModel = null }
      document.getElementById('loading').style.display = 'block'

      gltfLoader.load(url,
        (gltf) => {
          carModel = gltf.scene
          // Center and scale model
          const box = new THREE.Box3().setFromObject(carModel)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 4 / maxDim
          carModel.scale.setScalar(scale)
          carModel.position.sub(center.multiplyScalar(scale))
          carModel.position.y = 0

          // Store original materials
          carModel.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              if (!meshMaterials[child.name]) {
                meshMaterials[child.name] = child.material.clone()
              }
            }
          })

          scene.add(carModel)
          document.getElementById('loading').style.display = 'none'
          sendToRN({ type: 'model_loaded' })
        },
        undefined,
        (err) => {
          document.getElementById('loading').textContent = 'Ошибка загрузки'
          sendToRN({ type: 'model_error', message: err.message || 'load failed' })
        }
      )
    }

    // --- Material application ---
    const FINISH_ROUGHNESS = {
      gloss: 0.05, matte: 0.9, carbon: 0.3, chrome: 0.0, satin: 0.4
    }
    const FINISH_METALNESS = {
      gloss: 0.1, matte: 0.0, carbon: 0.3, chrome: 1.0, satin: 0.15
    }

    function applyMaterial(meshName, colorHex, finish) {
      if (!carModel) return
      const color = new THREE.Color(colorHex)
      carModel.traverse(child => {
        if (child.isMesh && child.name === meshName) {
          const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: FINISH_ROUGHNESS[finish] ?? 0.5,
            metalness: FINISH_METALNESS[finish] ?? 0.1,
          })
          if (finish === 'chrome') {
            mat.envMapIntensity = 2.0
          }
          child.material = mat
        }
      })
    }

    function applyTint(meshName, tintPercent) {
      if (!carModel) return
      carModel.traverse(child => {
        if (child.isMesh && child.name === meshName) {
          const opacity = 1 - (tintPercent / 100) * 0.95
          child.material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            transparent: true,
            opacity,
            roughness: 0.0,
            metalness: 0.0,
          })
        }
      })
    }

    function resetAll() {
      if (!carModel) return
      carModel.traverse(child => {
        if (child.isMesh && meshMaterials[child.name]) {
          child.material = meshMaterials[child.name].clone()
        }
      })
    }

    // --- Raycaster (tap to select mesh) ---
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let tapStart = null

    renderer.domElement.addEventListener('pointerdown', e => {
      tapStart = { x: e.clientX, y: e.clientY, time: Date.now() }
    })
    renderer.domElement.addEventListener('pointerup', e => {
      if (!tapStart) return
      const dx = Math.abs(e.clientX - tapStart.x)
      const dy = Math.abs(e.clientY - tapStart.y)
      const dt = Date.now() - tapStart.time
      tapStart = null
      if (dx > 10 || dy > 10 || dt > 300) return // was a drag, not a tap

      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      if (!carModel) return
      const meshes = []
      carModel.traverse(c => { if (c.isMesh) meshes.push(c) })
      const hits = raycaster.intersectObjects(meshes, false)
      if (hits.length > 0) {
        sendToRN({ type: 'mesh_tapped', meshName: hits[0].object.name })
      }
    })

    // --- postMessage bridge ---
    function sendToRN(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg))
      }
    }

    window.addEventListener('message', e => {
      let msg
      try { msg = JSON.parse(e.data) } catch { return }
      if (msg.type === 'load_model') loadModel(msg.glbUrl)
      else if (msg.type === 'apply_material') applyMaterial(msg.meshName, msg.colorHex, msg.finish)
      else if (msg.type === 'apply_tint') applyTint(msg.meshName, msg.tintPercent)
      else if (msg.type === 'reset_all') resetAll()
    })

    // --- Resize ---
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // --- Render loop ---
    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  </script>
</body>
</html>`
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/CarViewer/viewer.html.ts
git commit -m "feat: add Three.js viewer HTML with GLB loader, orbit controls, raycaster"
```

---

## Task 4: CarViewer WebView component

**Files:**
- Create: `components/CarViewer/index.tsx`

- [ ] **Step 1: Create CarViewer component**

Create `components/CarViewer/index.tsx`:
```typescript
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'
import { VIEWER_HTML } from './viewer.html'
import { postToWebView, RNtoWebView, WebViewToRN } from './bridge'

export type CarViewerHandle = {
  send: (msg: RNtoWebView) => void
}

type Props = {
  onMessage: (msg: WebViewToRN) => void
}

export const CarViewer = forwardRef<CarViewerHandle, Props>(({ onMessage }, ref) => {
  const webViewRef = useRef<WebView>(null)

  useImperativeHandle(ref, () => ({
    send: (msg) => postToWebView(webViewRef, msg),
  }))

  function handleMessage(event: { nativeEvent: { data: string } }) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as WebViewToRN
      onMessage(msg)
    } catch {}
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: VIEWER_HTML }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#0f0f0f' },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/CarViewer/index.tsx
git commit -m "feat: add CarViewer WebView component with message bridge"
```

---

## Task 5: Materials data + Editor Zustand store

**Files:**
- Create: `constants/materials-data.ts`
- Create: `constants/editor-store.ts`

- [ ] **Step 1: Create materials data**

Create `constants/materials-data.ts`:
```typescript
import type { MaterialFinish } from '@/components/CarViewer/bridge'

export type MaterialPreset = {
  id: string
  name: string
  finish: MaterialFinish
  colorHex: string
  brand?: string
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  // Gloss
  { id: 'gloss-black',   name: 'Чёрный глянец',   finish: 'gloss', colorHex: '#0a0a0a' },
  { id: 'gloss-white',   name: 'Белый глянец',     finish: 'gloss', colorHex: '#f5f5f5' },
  { id: 'gloss-red',     name: 'Красный глянец',   finish: 'gloss', colorHex: '#cc0000' },
  { id: 'gloss-blue',    name: 'Синий глянец',     finish: 'gloss', colorHex: '#1a3a8f' },
  { id: 'gloss-silver',  name: 'Серебро глянец',   finish: 'gloss', colorHex: '#c0c0c0' },
  { id: 'gloss-gold',    name: 'Золото глянец',    finish: 'gloss', colorHex: '#d4a017' },
  // Matte
  { id: 'matte-black',   name: 'Чёрный мат',       finish: 'matte', colorHex: '#1a1a1a' },
  { id: 'matte-white',   name: 'Белый мат',        finish: 'matte', colorHex: '#e8e8e8' },
  { id: 'matte-grey',    name: 'Серый мат',        finish: 'matte', colorHex: '#666666' },
  { id: 'matte-green',   name: 'Зелёный мат',      finish: 'matte', colorHex: '#2d5a27' },
  { id: 'matte-blue',    name: 'Синий мат',        finish: 'matte', colorHex: '#1e3a5f' },
  { id: 'matte-beige',   name: 'Бежевый мат',      finish: 'matte', colorHex: '#c9b99a' },
  // Satin
  { id: 'satin-black',   name: 'Чёрный сатин',     finish: 'satin', colorHex: '#111111' },
  { id: 'satin-silver',  name: 'Серебро сатин',    finish: 'satin', colorHex: '#a8a8a8' },
  { id: 'satin-white',   name: 'Белый сатин',      finish: 'satin', colorHex: '#eeeeee' },
  // Carbon
  { id: 'carbon-black',  name: 'Карбон чёрный',    finish: 'carbon', colorHex: '#1c1c1c' },
  { id: 'carbon-grey',   name: 'Карбон серый',     finish: 'carbon', colorHex: '#3a3a3a' },
  // Chrome
  { id: 'chrome-silver', name: 'Хром серебро',     finish: 'chrome', colorHex: '#d8d8d8' },
  { id: 'chrome-black',  name: 'Хром чёрный',      finish: 'chrome', colorHex: '#222222' },
  { id: 'chrome-gold',   name: 'Хром золото',      finish: 'chrome', colorHex: '#c8a800' },
]

export const FINISH_LABELS: Record<MaterialFinish, string> = {
  gloss: 'Глянец', matte: 'Мат', satin: 'Сатин', carbon: 'Карбон', chrome: 'Хром'
}

export const GLASS_MESHES = [
  { meshName: 'glass_windshield', label: 'Лобовое' },
  { meshName: 'glass_rear',       label: 'Заднее' },
  { meshName: 'glass_side_fl',    label: 'Перед лево' },
  { meshName: 'glass_side_fr',    label: 'Перед право' },
  { meshName: 'glass_side_rl',    label: 'Зад лево' },
  { meshName: 'glass_side_rr',    label: 'Зад право' },
]
```

- [ ] **Step 2: Create editor Zustand store**

Create `constants/editor-store.ts`:
```typescript
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
  partsConfig: Record<string, PartConfig>    // meshName → config
  windowsConfig: Record<string, WindowConfig> // meshName → tint

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
```

- [ ] **Step 3: Commit**
```bash
cd /Users/mac/dev/carwrap
git add constants/materials-data.ts constants/editor-store.ts
git commit -m "feat: add materials presets and editor Zustand store"
```

---

## Task 6: MaterialSheet component

**Files:**
- Create: `components/editor/MaterialSheet.tsx`

- [ ] **Step 1: Create MaterialSheet**

Create `components/editor/MaterialSheet.tsx`:
```typescript
import { forwardRef, useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { MATERIAL_PRESETS, FINISH_LABELS } from '@/constants/materials-data'
import type { MaterialFinish } from '@/components/CarViewer/bridge'

type Props = {
  meshName: string | null
  onSelect: (materialId: string, colorHex: string, finish: MaterialFinish) => void
  onClose: () => void
}

const FINISHES: MaterialFinish[] = ['gloss', 'matte', 'satin', 'carbon', 'chrome']

export const MaterialSheet = forwardRef<BottomSheet, Props>(({ meshName, onSelect, onClose }, ref) => {
  const [activeFinish, setActiveFinish] = useState<MaterialFinish>('gloss')
  const snapPoints = useMemo(() => ['50%'], [])

  const filtered = MATERIAL_PRESETS.filter(m => m.finish === activeFinish)

  const handleClose = useCallback(() => onClose(), [onClose])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>
          {meshName ? `Деталь: ${meshName}` : 'Выберите материал'}
        </Text>

        {/* Finish tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {FINISHES.map(f => (
            <TouchableOpacity key={f} style={[styles.tab, activeFinish === f && styles.tabActive]}
              onPress={() => setActiveFinish(f)}>
              <Text style={[styles.tabText, activeFinish === f && styles.tabTextActive]}>
                {FINISH_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Color grid */}
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          numColumns={5}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.swatch, { backgroundColor: item.colorHex }]}
              onPress={() => onSelect(item.id, item.colorHex, item.finish)}
            >
              <Text style={styles.swatchLabel} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.grid}
        />
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#1a1a1a' },
  handle: { backgroundColor: '#444' },
  container: { flex: 1, padding: 16 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  tabs: { flexGrow: 0, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
         borderWidth: 1, borderColor: '#333', marginRight: 8 },
  tabActive: { borderColor: '#e63946', backgroundColor: '#1a0507' },
  tabText: { color: '#888', fontSize: 13 },
  tabTextActive: { color: '#e63946' },
  grid: { paddingBottom: 24 },
  swatch: { width: '18%', aspectRatio: 1, borderRadius: 10, margin: '1%',
            justifyContent: 'flex-end', padding: 4, borderWidth: 1, borderColor: '#333' },
  swatchLabel: { color: '#fff', fontSize: 9, textShadowColor: '#000',
                 textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/editor/MaterialSheet.tsx
git commit -m "feat: add MaterialSheet bottom sheet with finish tabs and color swatches"
```

---

## Task 7: TintSheet component

**Files:**
- Create: `components/editor/TintSheet.tsx`

- [ ] **Step 1: Create TintSheet**

Create `components/editor/TintSheet.tsx`:
```typescript
import { forwardRef, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Slider from '@react-native-community/slider'
import { GLASS_MESHES } from '@/constants/materials-data'

type Props = {
  windowsConfig: Record<string, { tintPercent: number }>
  onTintChange: (meshName: string, tintPercent: number) => void
  onClose: () => void
}

export const TintSheet = forwardRef<BottomSheet, Props>(({ windowsConfig, onTintChange, onClose }, ref) => {
  const snapPoints = useMemo(() => ['45%'], [])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Тонировка стёкол</Text>
        {GLASS_MESHES.map(g => {
          const tint = windowsConfig[g.meshName]?.tintPercent ?? 0
          return (
            <View key={g.meshName} style={styles.row}>
              <View style={styles.rowLabel}>
                <Text style={styles.glassName}>{g.label}</Text>
                <Text style={styles.tintValue}>{tint}%</Text>
              </View>
              <View style={[styles.tintPreview, { opacity: 1 - (tint / 100) * 0.9 }]} />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={95}
                step={5}
                value={tint}
                onValueChange={v => onTintChange(g.meshName, Math.round(v))}
                minimumTrackTintColor="#e63946"
                maximumTrackTintColor="#333"
                thumbTintColor="#e63946"
              />
            </View>
          )
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#1a1a1a' },
  handle: { backgroundColor: '#444' },
  container: { padding: 16, paddingBottom: 32 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { marginBottom: 16 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  glassName: { color: '#ccc', fontSize: 14 },
  tintValue: { color: '#e63946', fontSize: 14, fontWeight: '600' },
  tintPreview: { height: 20, backgroundColor: '#111', borderRadius: 4, marginBottom: 4 },
  slider: { width: '100%', height: 32 },
})
```

- [ ] **Step 2: Install slider**
```bash
cd /Users/mac/dev/carwrap
bunx expo install @react-native-community/slider
```

- [ ] **Step 3: Commit**
```bash
cd /Users/mac/dev/carwrap
git add components/editor/TintSheet.tsx
git commit -m "feat: add TintSheet with per-window tint sliders"
```

---

## Task 8: Editor screen

**Files:**
- Create: `app/editor/[carId].tsx`

- [ ] **Step 1: Create editor screen**

Create `app/editor/[carId].tsx`:
```typescript
import { useRef, useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from '@gorhom/bottom-sheet'
import { CarViewer, CarViewerHandle } from '@/components/CarViewer'
import { MaterialSheet } from '@/components/editor/MaterialSheet'
import { TintSheet } from '@/components/editor/TintSheet'
import { useEditorStore } from '@/constants/editor-store'
import { WebViewToRN } from '@/components/CarViewer/bridge'
import { supabase } from '@/constants/supabase'
import { useAuth } from '@/constants/AuthContext'

const DEMO_GLB = 'https://threejs.org/examples/models/gltf/ferrari.glb'

export default function EditorScreen() {
  const { carId, glbUrl } = useLocalSearchParams<{ carId: string; glbUrl?: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const viewerRef = useRef<CarViewerHandle>(null)
  const materialSheetRef = useRef<BottomSheet>(null)
  const tintSheetRef = useRef<BottomSheet>(null)

  const {
    selectedMesh, partsConfig, windowsConfig,
    setCarId, selectMesh, applyMaterial, applyTint, resetAll
  } = useEditorStore()

  const modelUrl = glbUrl || DEMO_GLB

  useEffect(() => {
    setCarId(carId, modelUrl)
  }, [carId])

  // When model loads, send load command
  const handleViewerMessage = useCallback((msg: WebViewToRN) => {
    if (msg.type === 'model_loaded') {
      // Re-apply any saved state
    } else if (msg.type === 'mesh_tapped') {
      const isGlass = msg.meshName.startsWith('glass_')
      selectMesh(msg.meshName)
      if (isGlass) {
        materialSheetRef.current?.close()
        tintSheetRef.current?.expand()
      } else {
        tintSheetRef.current?.close()
        materialSheetRef.current?.expand()
      }
    } else if (msg.type === 'model_error') {
      Alert.alert('Ошибка', 'Не удалось загрузить модель')
    }
  }, [selectMesh])

  // Load model on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      viewerRef.current?.send({ type: 'load_model', glbUrl: modelUrl })
    }, 500)
    return () => clearTimeout(timer)
  }, [modelUrl])

  const handleMaterialSelect = useCallback((materialId: string, colorHex: string, finish: any) => {
    if (!selectedMesh) return
    applyMaterial(selectedMesh, { materialId, colorHex, finish })
    viewerRef.current?.send({ type: 'apply_material', meshName: selectedMesh, colorHex, finish })
    materialSheetRef.current?.close()
    selectMesh(null)
  }, [selectedMesh, applyMaterial, selectMesh])

  const handleTintChange = useCallback((meshName: string, tintPercent: number) => {
    applyTint(meshName, tintPercent)
    viewerRef.current?.send({ type: 'apply_tint', meshName, tintPercent })
  }, [applyTint])

  const handleReset = useCallback(() => {
    resetAll()
    viewerRef.current?.send({ type: 'reset_all' })
  }, [resetAll])

  const handleSave = useCallback(async () => {
    if (!user) return Alert.alert('Войдите чтобы сохранить')
    const { data, error } = await supabase.from('configs').insert({
      user_id: user.id,
      car_id: carId,
      parts_config: Object.entries(partsConfig).map(([part_id, v]) => ({ part_id, ...v })),
      windows_config: Object.entries(windowsConfig).map(([window_id, v]) => ({ window_id, ...v })),
    }).select().single()

    if (error) return Alert.alert('Ошибка', error.message)
    Alert.alert('Сохранено!', `ID: ${data.id}`)
  }, [user, carId, partsConfig, windowsConfig])

  const handleShare = useCallback(async () => {
    await Share.share({ message: `CarWrap конфигурация машины — carwrap://editor/${carId}` })
  }, [carId])

  const partsCount = Object.keys(partsConfig).length
  const tintCount = Object.keys(windowsConfig).filter(k => windowsConfig[k].tintPercent > 0).length

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Сбросить</Text>
        </TouchableOpacity>
      </View>

      {/* 3D Viewer */}
      <CarViewer ref={viewerRef} onMessage={handleViewerMessage} />

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <View style={styles.stats}>
          {partsCount > 0 && <Text style={styles.stat}>{partsCount} деталей</Text>}
          {tintCount > 0 && <Text style={styles.stat}>{tintCount} стёкол</Text>}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
            <Text style={styles.btnSecondaryText}>Поделиться</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
            <Text style={styles.btnPrimaryText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hint */}
      {partsCount === 0 && tintCount === 0 && (
        <View style={styles.hint} pointerEvents="none">
          <Text style={styles.hintText}>Нажми на деталь машины чтобы изменить цвет</Text>
        </View>
      )}

      {/* Sheets */}
      <MaterialSheet
        ref={materialSheetRef}
        meshName={selectedMesh}
        onSelect={handleMaterialSelect}
        onClose={() => selectMesh(null)}
      />
      <TintSheet
        ref={tintSheetRef}
        windowsConfig={windowsConfig}
        onTintChange={handleTintChange}
        onClose={() => selectMesh(null)}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(15,15,15,0.8)',
  },
  backBtn: { padding: 4 },
  backText: { color: '#fff', fontSize: 16 },
  resetText: { color: '#e63946', fontSize: 14 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15,15,15,0.95)',
    padding: 16, paddingBottom: 32,
  },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stat: { color: '#888', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  btnSecondary: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: '#333', alignItems: 'center',
  },
  btnSecondaryText: { color: '#fff', fontWeight: '600' },
  btnPrimary: {
    flex: 1, padding: 14, borderRadius: 12,
    backgroundColor: '#e63946', alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  hint: {
    position: 'absolute', top: '50%', left: 24, right: 24,
    alignItems: 'center', pointerEvents: 'none',
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12,
  },
})
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/editor/
git commit -m "feat: add 3D editor screen with CarViewer, material sheet, tint sheet"
```

---

## Task 9: Wire catalog → editor navigation

**Files:**
- Modify: `app/catalog/[brand]/[model].tsx`

- [ ] **Step 1: Update generations screen to navigate to editor**

In `app/catalog/[brand]/[model].tsx`, replace the `Alert.alert` onPress with navigation to editor.

Find this line:
```typescript
onPress={() => Alert.alert('Готово!', `Выбрано: ${item.generation_name ?? item.year_from}\n\n3D-редактор будет в Плане 2`)}>
```

Replace with:
```typescript
onPress={() => {
  const params = new URLSearchParams({ glbUrl: item.glb_url ?? '' })
  router.push(`/editor/${item.id}?${params.toString()}`)
}}>
```

Also add `useRouter` import if not present:
```typescript
import { useLocalSearchParams, useRouter } from 'expo-router'
```

And add `router` inside the component:
```typescript
const router = useRouter()
```

- [ ] **Step 2: Commit**
```bash
cd /Users/mac/dev/carwrap
git add app/catalog/
git commit -m "feat: wire catalog generations to 3D editor screen"
```

---

## Plan 2 Complete ✅

**What's working after Plan 2:**
- Select car in catalog → opens 3D editor
- Three.js loads GLB model (demo: Ferrari from Three.js examples)
- 360° rotation with OrbitControls
- Tap any mesh → opens material bottom sheet
- Select finish + color → applied in real time to 3D mesh
- Tap glass mesh → opens tint sliders
- Per-window tint 0–95%
- Save configuration to Supabase
- Share via native share sheet

**Note on 3D models:** The demo uses `https://threejs.org/examples/models/gltf/ferrari.glb`. Real models with proper mesh naming (hood, door_fl, etc.) must be purchased and uploaded to Cloudflare R2, then `glb_url` updated in the `cars` table.

**Next:** Plan 3 — Studio flow, orders, PPF risk zones
