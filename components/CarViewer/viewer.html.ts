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
    import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

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

    // ─── Environment map (reflections) ───────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer)
    const roomEnv = new RoomEnvironment()
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture
    scene.environment = envTexture
    roomEnv.dispose()
    pmrem.dispose()

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
      'light', 'lamp', 'headlight', 'taillight', 'tail_light', 'drl',
      'turn', 'led', 'lens',
      'interior', 'seat', 'dashboard',
      'cabin', 'steering', 'brake',
      'carpet', 'trim_int', 'console',
      // Helper/rig objects that appear as diamonds/octahedrons
      'bone', 'helper', 'armature', 'ik', 'ctrl', 'target',
      'pivot', 'null', 'empty', 'root', 'rig', 'joint',
      'locator', 'dummy', 'gizmo', 'handle', 'control',
    ]
    function isProtected(name) {
      if (!name) return true
      const tokens = name.toLowerCase().split(/[^a-z0-9]+/)
      return tokens.some(tok => PROTECTED.includes(tok))
    }

    // Filter out rig/helper geometry by vertex count — octahedron = 6 verts, box = 8
    // Real car parts always have hundreds+ vertices
    function isHelperGeometry(mesh) {
      const count = mesh.geometry?.attributes?.position?.count ?? 0
      return count > 0 && count <= 24  // any primitive with ≤24 verts is a helper shape
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
    let meshesArray = []            // flat array for raycasting — rebuilt on load
    let highlightedMesh = null
    let highlightSavedEmissive = null
    let highlightSavedIntensity = 0

    // ─── Chunk transfer state ─────────────────────────────────────────────
    let _chunks = null
    let _chunkTotal = 0

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
      meshesArray = []
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

          // Register by name — skip protected and rig helper meshes
          if (child.name) {
            meshByName[child.name] = child
            if (!isProtected(child.name) && !isHelperGeometry(child)) {
              meshesArray.push(child)
              meshNames.push(child.name)
            }
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

    // ─── Material presets — physically based values ──────────────────────────
    //
    //  finish   roughness  metalness  clearcoat  cc_rough   notes
    //  ───────  ─────────  ─────────  ─────────  ────────   ─────────────────────────────────────────
    //  gloss    0.04       0.1        0.95       0.05       automotive gloss paint — near-mirror lacquer
    //  matte    0.92       0.0        0.0        0.0        matte film — fully diffuse, no specular
    //  satin    0.40       0.1        0.25       0.25       semi-gloss, soft sheen, slight lacquer layer
    //  pearl    0.20       0.05       0.55       0.08       semi-gloss with iridescent sheen layer
    //  carbon   0.35       0.55       0.65       0.12       woven fibre — moderate metallic, strong lacquer
    //  chrome   0.0        1.0        0.0        0.0        mirror chrome — pure metallic, no lacquer
    //
    const ROUGHNESS  = { gloss: 0.04,  matte: 0.92, satin: 0.40, pearl: 0.20, carbon: 0.35, chrome: 0.0  }
    const METALNESS  = { gloss: 0.10,  matte: 0.0,  satin: 0.10, pearl: 0.05, carbon: 0.55, chrome: 1.0  }
    const CLEARCOAT  = { gloss: 0.95,  matte: 0.0,  satin: 0.25, pearl: 0.55, carbon: 0.65, chrome: 0.0  }
    const CLEARCOAT_R= { gloss: 0.05,  matte: 0.0,  satin: 0.25, pearl: 0.08, carbon: 0.12, chrome: 0.0  }

    function applyMaterial(meshName, colorHex, finish) {
      if (!carModel || !meshName || isProtected(meshName) || isGlass(meshName)) return
      const mesh = meshByName[meshName]
      if (!mesh || isHelperGeometry(mesh)) return

      const color = new THREE.Color(colorHex)

      // Carbon: procedural woven pattern via onBeforeCompile
      if (finish === 'carbon') {
        const mat = new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.4,
          metalness: 0.5,
          clearcoat: 0.6,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.2,
        })
        mat.onBeforeCompile = (shader) => {
          // Use world position — always available, no UV needed
          const inc = '#include'
          shader.vertexShader = shader.vertexShader.replace(
            inc + ' <worldpos_vertex>',
            inc + ' <worldpos_vertex>\n            vWorldPos = worldPosition.xyz;'
          )
          shader.vertexShader = 'varying vec3 vWorldPos;\n' + shader.vertexShader
          shader.fragmentShader = 'varying vec3 vWorldPos;\n' + shader.fragmentShader
          shader.fragmentShader = shader.fragmentShader.replace(
            inc + ' <color_fragment>',
            inc + ' <color_fragment>\n' +
            '            vec2 wp = vWorldPos.xz * 18.0;\n' +
            '            vec2 cell = floor(wp);\n' +
            '            vec2 f = fract(wp);\n' +
            '            float angle = mod(cell.x + cell.y, 2.0) * 0.7854;\n' +
            '            float s = sin(angle), c2 = cos(angle);\n' +
            '            vec2 rot = vec2(c2*(f.x-0.5) - s*(f.y-0.5), s*(f.x-0.5) + c2*(f.y-0.5));\n' +
            '            float fiber = smoothstep(0.28, 0.34, abs(rot.x)) * 0.4;\n' +
            '            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.35, fiber);'
          )
        }
        if (highlightedMesh === mesh) {
          mat.emissive = new THREE.Color(0xC9A84C)
          mat.emissiveIntensity = 0.5
          highlightSavedEmissive = new THREE.Color(0x000000)
        }
        mesh.material = mat
        return
      }

      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness:          ROUGHNESS[finish]   ?? 0.5,
        metalness:          METALNESS[finish]   ?? 0.1,
        clearcoat:          CLEARCOAT[finish]   ?? 0.0,
        clearcoatRoughness: CLEARCOAT_R[finish] ?? 0.1,
        envMapIntensity:    finish === 'chrome' ? 3.5 : 1.6,
        // Pearl: iridescent thin-film interference (mica flakes in paint)
        sheen:                    finish === 'pearl'  ? 0.5  : 0.0,
        sheenRoughness:           finish === 'pearl'  ? 0.4  : 1.0,
        sheenColor:               finish === 'pearl'  ? new THREE.Color(colorHex).offsetHSL(0.08, 0.3, 0.12) : new THREE.Color(0),
        iridescence:              finish === 'pearl'  ? 0.75 : 0.0,
        iridescenceIOR:           finish === 'pearl'  ? 1.56 : 1.3,   // mica IOR ≈ 1.56
        iridescenceThicknessRange:finish === 'pearl'  ? [180, 520]   // nm — full rainbow sweep
                                                      : [100, 400],
        // Chrome: high IOR for mirror-like surface
        ior:                finish === 'chrome' ? 2.5  : 1.5,
        reflectivity:       finish === 'chrome' ? 1.0  : 0.5,
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
        mesh.material.emissiveIntensity = 0.22
        highlightedMesh = mesh
      }
    }

    // ─── Studio mode (bright neutral lighting for palette selection) ─────────
    function setStudioMode(enabled) {
      if (enabled) {
        scene.background = new THREE.Color(0xf0f0f0)
        ambientLight.intensity = 3.5
        keyLight.intensity = 4.0
        fillLight.intensity = 3.0
        rimLight.intensity = 2.5
        topLight.intensity = 2.0
        renderer.toneMappingExposure = 1.8
      } else {
        scene.background = new THREE.Color(0x1a1a1a)
        ambientLight.intensity = 1.8
        keyLight.intensity = 2.8
        fillLight.intensity = 1.6
        rimLight.intensity = 1.4
        topLight.intensity = 1.0
        renderer.toneMappingExposure = 1.3
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

    // 5×5 grid at 0.01 NDC spacing — covers ~4px per step on 390px screen
    // Catches thin moldings, grille bars, spoiler lips, window trims
    const SAMPLE_OFFSETS = (() => {
      const offsets = []
      for (let i = -2; i <= 2; i++)
        for (let j = -2; j <= 2; j++)
          offsets.push([i * 0.01, j * 0.01])
      return offsets  // 25 samples
    })()

    function getBestHit(ndcX, ndcY) {
      if (!carModel || meshesArray.length === 0) return null

      const seen = new Set()
      const candidates = []

      for (const [ox, oy] of SAMPLE_OFFSETS) {
        raycaster.setFromCamera(
          new THREE.Vector2(ndcX + ox, ndcY + oy),
          camera
        )
        const hits = raycaster.intersectObjects(meshesArray, false)
        for (const hit of hits) {
          const name = hit.object.name
          if (!name || seen.has(name) || isProtected(name)) continue
          seen.add(name)
          candidates.push({ name, dist: hit.distance })
          break  // closest per sample
        }
      }

      if (candidates.length === 0) return null
      // Closest overall wins — detail parts (grille, moldings) are in front of body panels
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
        sendToRN({ type: 'mesh_tapped', meshName, isGlass: isGlass(meshName) })
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
      if      (msg.type === 'load_model')             loadModel(msg.glbUrl)
      else if (msg.type === 'load_model_chunk_start') { _chunks = []; _chunkTotal = msg.totalChunks }
      else if (msg.type === 'load_model_chunk')       { if (_chunks) _chunks[msg.index] = msg.data }
      else if (msg.type === 'load_model_chunk_end')   {
        if (_chunks && _chunks.length === _chunkTotal) {
          const url = 'data:model/gltf-binary;base64,' + _chunks.join('')
          _chunks = null; _chunkTotal = 0
          loadModel(url)
        }
      }
      else if (msg.type === 'apply_material') applyMaterial(msg.meshName, msg.colorHex, msg.finish)
      else if (msg.type === 'apply_tint')     applyTint(msg.meshName, msg.tintPercent)
      else if (msg.type === 'reset_all')      resetAll()
      else if (msg.type === 'highlight_mesh') highlightMesh(msg.meshName)
      else if (msg.type === 'studio_mode')    setStudioMode(msg.enabled)
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
