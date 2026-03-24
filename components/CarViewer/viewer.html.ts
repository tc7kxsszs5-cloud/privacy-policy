export const VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #dce0e8; overflow: hidden; width: 100vw; height: 100vh; }
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
    scene.background = new THREE.Color(0xdce0e8)

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(3.5, 1.8, 3.5)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 0.5
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI / 2 + 0.2
    controls.enablePan = false
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE
    }

    // Studio lighting — bright and even like a real detailing studio
    // Key light: large soft box top-left
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(-3, 6, 3)
    keyLight.castShadow = true
    scene.add(keyLight)

    // Fill light: right side, slightly cool
    const fillLight = new THREE.DirectionalLight(0xeef4ff, 2.0)
    fillLight.position.set(4, 5, 2)
    scene.add(fillLight)

    // Rim light: behind car, separates from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5)
    rimLight.position.set(0, 4, -5)
    scene.add(rimLight)

    // Top overhead: ceiling panel
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2)
    topLight.position.set(0, 8, 0)
    scene.add(topLight)

    // Front fill: subtle from camera direction
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8)
    frontLight.position.set(0, 2, 8)
    scene.add(frontLight)

    // Ambient: high so shadows aren't black
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    // Ground — light studio floor
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0xc8ccd4, roughness: 0.6 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // --- State ---
    let carModel = null
    const meshMaterials = {}

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
          const box = new THREE.Box3().setFromObject(carModel)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 4 / maxDim
          carModel.scale.setScalar(scale)
          carModel.position.sub(center.multiplyScalar(scale))
          carModel.position.y = 0

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
      if (dx > 10 || dy > 10 || dt > 300) return

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

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    function animate() {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  </script>
</body>
</html>\``
