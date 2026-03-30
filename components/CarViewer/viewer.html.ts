export const VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a1a; overflow: hidden; width: 100vw; height: 100vh; touch-action: none; }
    canvas { display: block; width: 100% !important; height: 100% !important; }
    #loading {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      color: #C9A84C; font-family: -apple-system, sans-serif; font-size: 15px;
      letter-spacing: 0.05em;
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

    // ─── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.outputColorSpace = THREE.SRGBColorSpace
    document.body.appendChild(renderer.domElement)

    // ─── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)

    // ─── Camera ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.05, 100)
    camera.position.set(4, 1.8, 4)

    // ─── Controls — smooth, no drift ─────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06        // smooth deceleration
    controls.rotateSpeed = 0.65          // comfortable touch speed
    controls.zoomSpeed = 0.9
    controls.minDistance = 1.5
    controls.maxDistance = 12
    controls.maxPolarAngle = Math.PI / 2 + 0.15   // can't go below ground
    controls.minPolarAngle = 0.05                  // can't go fully top-down
    controls.enablePan = false
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }

    // ─── Studio Lighting ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
    keyLight.position.set(-4, 8, 4)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 0.1
    keyLight.shadow.camera.far = 30
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.bias = -0.001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.6)
    fillLight.position.set(5, 4, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4)
    rimLight.position.set(0, 3, -6)
    scene.add(rimLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 1.0)
    topLight.position.set(0, 10, 0)
    scene.add(topLight)

    // Ground — subtle reflection plane
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.001
    ground.receiveShadow = true
    scene.add(ground)

    // ─── Protected meshes — cannot be colored ────────────────────────────────
    const PROTECTED = [
      'light', 'Light', 'lamp', 'Lamp', 'headlight', 'Headlight',
      'taillight', 'TailLight', 'tail_light', 'DRL', 'drl',
      'turn', 'Turn', 'LED', 'led', 'lens', 'Lens',
      'interior', 'Interior', 'seat', 'Seat', 'dashboard', 'Dashboard',
      'cabin', 'Cabin', 'steering', 'Steering', 'brake', 'Brake',
      'carpet', 'Carpet', 'trim_int', 'console', 'Console',
    ]
    function isProtected(name) {
      if (!name) return true
      return PROTECTED.some(p => name.toLowerCase().includes(p.toLowerCase()))
    }

    // Glass patterns → tint only
    const GLASS = ['glass', 'window', 'windshield', 'windscreen', 'backlite']
    function isGlass(name) {
      if (!name) return false
      const n = name.toLowerCase()
      return GLASS.some(p => n.includes(p))
    }

    // ─── State ───────────────────────────────────────────────────────────────
    let carModel = null
    const meshMaterials = {}        // original materials keyed by mesh uuid
    const meshByName = {}           // mesh objects keyed by name
    let highlightedMesh = null
    let highlightSavedEmissive = null
    let highlightSavedIntensity = 0

    // ─── Loaders ─────────────────────────────────────────────────────────────
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/')
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    // ─── Load model ──────────────────────────────────────────────────────────
    function loadModel(url) {
      if (carModel) { scene.remove(carModel); carModel = null }
      // Clear state
      Object.keys(meshMaterials).forEach(k => delete meshMaterials[k])
      Object.keys(meshByName).forEach(k => delete meshByName[k])
      highlightedMesh = null
      highlightSavedEmissive = null
      document.getElementById('loading').style.display = 'block'

      gltfLoader.load(url, (gltf) => {
        carModel = gltf.scene

        // Center and scale to fit scene
        const box = new THREE.Box3().setFromObject(carModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 4.5 / maxDim
        carModel.scale.setScalar(scale)
        center.multiplyScalar(scale)
        carModel.position.set(-center.x, -box.min.y * scale, -center.z)

        // Reset camera to good angle
        const dist = Math.max(size.x, size.z) * scale * 1.4
        camera.position.set(dist, dist * 0.4, dist)
        controls.target.set(0, size.y * scale * 0.35, 0)
        controls.update()

        const meshNames = []
        carModel.traverse(child => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true

          // Save original material (handle array materials)
          const key = child.uuid
          if (Array.isArray(child.material)) {
            meshMaterials[key] = child.material.map(m => m.clone())
          } else if (child.material) {
            meshMaterials[key] = child.material.clone()
          }

          // Register by name
          if (child.name) {
            meshByName[child.name] = child
            if (!isProtected(child.name)) meshNames.push(child.name)
          }
        })

        scene.add(carModel)
        document.getElementById('loading').style.display = 'none'
        sendToRN({ type: 'model_loaded', meshNames })
      },
      undefined,
      (err) => {
        document.getElementById('loading').textContent = 'Ошибка загрузки'
        sendToRN({ type: 'model_error', message: err.message || 'load failed' })
      })
    }

    // ─── Material presets ────────────────────────────────────────────────────
    const ROUGHNESS = { gloss: 0.05, matte: 0.85, carbon: 0.35, chrome: 0.0, satin: 0.45 }
    const METALNESS = { gloss: 0.15, matte: 0.0,  carbon: 0.4,  chrome: 1.0, satin: 0.2  }

    function applyMaterial(meshName, colorHex, finish) {
      if (!carModel || !meshName || isProtected(meshName)) return
      const mesh = meshByName[meshName]
      if (!mesh) return

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: ROUGHNESS[finish] ?? 0.5,
        metalness: METALNESS[finish] ?? 0.1,
        envMapIntensity: finish === 'chrome' ? 2.5 : 1.0,
      })

      // If this mesh is highlighted, carry over emissive
      if (highlightedMesh === mesh) {
        mat.emissive = new THREE.Color(0xC9A84C)
        mat.emissiveIntensity = 0.5
        highlightSavedEmissive = new THREE.Color(0x000000)
      }
      mesh.material = mat
    }

    function applyTint(meshName, tintPercent) {
      if (!carModel || !meshName) return
      const mesh = meshByName[meshName]
      if (!mesh) return
      const opacity = 1 - (tintPercent / 100) * 0.9
      mesh.material = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a0a,
        transparent: true,
        opacity,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.1,
      })
    }

    // ─── Highlight ───────────────────────────────────────────────────────────
    function highlightMesh(meshName) {
      // Restore previous highlight
      if (highlightedMesh && highlightedMesh.material && !Array.isArray(highlightedMesh.material)) {
        if (highlightSavedEmissive) {
          highlightedMesh.material.emissive.copy(highlightSavedEmissive)
        }
        highlightedMesh.material.emissiveIntensity = highlightSavedIntensity
      }
      highlightedMesh = null
      highlightSavedEmissive = null

      if (!meshName || !carModel) return
      const mesh = meshByName[meshName]
      if (!mesh || !mesh.material || Array.isArray(mesh.material)) return

      if (mesh.material.emissive !== undefined) {
        highlightSavedEmissive = mesh.material.emissive.clone()
        highlightSavedIntensity = mesh.material.emissiveIntensity || 0
        mesh.material.emissive = new THREE.Color(0xC9A84C)
        mesh.material.emissiveIntensity = 0.6
        highlightedMesh = mesh
      }
    }

    // ─── Reset all ───────────────────────────────────────────────────────────
    function resetAll() {
      if (!carModel) return
      highlightedMesh = null
      highlightSavedEmissive = null
      carModel.traverse(child => {
        if (!child.isMesh) return
        const orig = meshMaterials[child.uuid]
        if (!orig) return
        child.material = Array.isArray(orig) ? orig.map(m => m.clone()) : orig.clone()
      })
    }

    // ─── Raycasting — multi-sample for thin parts ────────────────────────────
    const raycaster = new THREE.Raycaster()
    raycaster.params.Mesh = {}   // default precision for mesh

    // Sample offsets in NDC to catch thin parts (moldings, spoilers, window trims)
    const SAMPLE_OFFSETS = [
      [0, 0], [0.012, 0], [-0.012, 0], [0, 0.012], [0, -0.012],
      [0.009, 0.009], [-0.009, 0.009], [0.009, -0.009], [-0.009, -0.009]
    ]

    function getBestHit(ndcX, ndcY) {
      if (!carModel) return null
      const meshes = []
      carModel.traverse(c => { if (c.isMesh && c.name) meshes.push(c) })

      const seen = new Set()
      const candidates = []

      for (const [ox, oy] of SAMPLE_OFFSETS) {
        raycaster.setFromCamera(
          new THREE.Vector2(ndcX + ox, ndcY + oy),
          camera
        )
        const hits = raycaster.intersectObjects(meshes, false)
        for (const hit of hits) {
          const name = hit.object.name
          if (!name || seen.has(name) || isProtected(name)) continue
          seen.add(name)
          candidates.push({ name, dist: hit.distance })
          break  // only take closest per sample
        }
      }

      if (candidates.length === 0) return null
      // Return the closest candidate across all samples
      candidates.sort((a, b) => a.dist - b.dist)
      return candidates[0].name
    }

    // ─── Tap detection ───────────────────────────────────────────────────────
    let tapStart = null
    const TAP_MOVE_THRESHOLD = 15   // px — slightly generous for mobile
    const TAP_TIME_THRESHOLD = 280  // ms

    renderer.domElement.addEventListener('pointerdown', e => {
      tapStart = { x: e.clientX, y: e.clientY, time: Date.now() }
    })

    renderer.domElement.addEventListener('pointerup', e => {
      if (!tapStart) return
      const dx = Math.abs(e.clientX - tapStart.x)
      const dy = Math.abs(e.clientY - tapStart.y)
      const dt = Date.now() - tapStart.time
      tapStart = null
      if (dx > TAP_MOVE_THRESHOLD || dy > TAP_MOVE_THRESHOLD || dt > TAP_TIME_THRESHOLD) return

      const ndcX = (e.clientX / window.innerWidth) * 2 - 1
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1
      const meshName = getBestHit(ndcX, ndcY)
      if (meshName) {
        sendToRN({ type: 'mesh_tapped', meshName })
      }
    })

    // ─── Message bridge ───────────────────────────────────────────────────────
    function sendToRN(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg))
      }
    }

    window.addEventListener('message', e => {
      let msg
      try { msg = JSON.parse(e.data) } catch { return }
      if      (msg.type === 'load_model')     loadModel(msg.glbUrl)
      else if (msg.type === 'apply_material') applyMaterial(msg.meshName, msg.colorHex, msg.finish)
      else if (msg.type === 'apply_tint')     applyTint(msg.meshName, msg.tintPercent)
      else if (msg.type === 'reset_all')      resetAll()
      else if (msg.type === 'highlight_mesh') highlightMesh(msg.meshName)
    })

    // ─── Resize ───────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // ─── Render loop ──────────────────────────────────────────────────────────
    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    sendToRN({ type: 'ready' })
  </script>
</body>
</html>\`
`
