import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, ContactShadows, Decal } from '@react-three/drei'
import * as THREE from 'three'
import './Customize.css'

/* ─── 25 shirt colours ─── */
const SHIRT_COLORS = [
  { name: 'White',        hex: '#FFFFFF' },
  { name: 'Off White',    hex: '#F5F0E8' },
  { name: 'Cream',        hex: '#EDE0CC' },
  { name: 'Light Grey',   hex: '#CACACA' },
  { name: 'Mid Grey',     hex: '#9E9E9E' },
  { name: 'Charcoal',     hex: '#555555' },
  { name: 'Dark Grey',    hex: '#2D2D2D' },
  { name: 'Jet Black',    hex: '#0A0A0A' },
  { name: 'Baby Blue',    hex: '#BBDEFB' },
  { name: 'Sky Blue',     hex: '#42A5F5' },
  { name: 'Royal Blue',   hex: '#1976D2' },
  { name: 'Navy',         hex: '#1A237E' },
  { name: 'Midnight',     hex: '#0D1B4B' },
  { name: 'Blush Pink',   hex: '#F8BBD0' },
  { name: 'Rose',         hex: '#E91E63' },
  { name: 'Coral Red',    hex: '#E53935' },
  { name: 'Crimson',      hex: '#B71C1C' },
  { name: 'Burgundy',     hex: '#4A0010' },
  { name: 'Mint Green',   hex: '#80CBC4' },
  { name: 'Sage',         hex: '#7CB09E' },
  { name: 'Forest Green', hex: '#2E7D32' },
  { name: 'Olive',        hex: '#5D6A1E' },
  { name: 'Mustard',      hex: '#F9A825' },
  { name: 'Orange',       hex: '#E64A19' },
  { name: 'Purple',       hex: '#6A1B9A' },
]

const DESIGNS = [
  { id: 'none',       label: 'Blank',          src: null },
  { id: 'propaganda', label: 'Propaganda',     src: '/designs/propaganda.jpg' },
  { id: 'skull',      label: 'Skull & Roses',  src: '/designs/skull.svg' },
  { id: 'wolf',       label: 'Lone Wolf',      src: '/designs/wolf.svg' },
  { id: 'eagle',      label: 'Freedom Eagle',  src: '/designs/eagle.svg' },
  { id: 'tiger',      label: 'Tiger',          src: '/designs/tiger.svg' },
  { id: 'dragon',     label: 'Dragon',         src: '/designs/dragon.svg' },
  { id: 'anchor',     label: 'Anchor',         src: '/designs/anchor.svg' },
  { id: 'geometric',  label: 'All-Seeing Eye', src: '/designs/geometric.svg' },
]

const PRINT_METHODS = [
  { id: 'dtg',        name: 'DTG Print',    desc: 'Full-colour, photo-quality.' },
  { id: 'screen',     name: 'Screen Print', desc: 'Bold ink, up to 4 colours.' },
  { id: 'embroidery', name: 'Embroidery',   desc: 'Stitched, premium texture.' },
  { id: 'vinyl',      name: 'Vinyl / HTV',  desc: 'Sharp edges, solid colours.' },
]

const FONTS = [
  { id: 'barlow',  name: 'BARLOW',  css: "'Barlow Condensed',sans-serif" },
  { id: 'mono',    name: 'MONO',    css: "'Courier New',monospace" },
  { id: 'grotesk', name: 'Grotesk', css: "'Space Grotesk',sans-serif" },
  { id: 'serif',   name: 'Classic', css: 'Georgia,serif' },
]

const INK = ['#000000','#ffffff','#e8ff00','#ff3333','#3388ff','#33cc77','#ff8800','#cc44ff','#aaaaaa']

/* ─── default per-side state ─── */
const mkSide = () => ({
  designId:  'none',
  uploadSrc: null,
  text: '', textFont: 'barlow', textSize: 20,
  textColor: '#000000',
  posX:  0, posY:  0,    // 3-D decal position offset (world units)
  scale: 0.32,           // decal world-unit size (0.08 – 0.55)
  angle: 0,              // rotation in degrees
  flipH: false,
  flipV: false,
})

/* ════════════════════════════════════════════════════
   BUILD DECAL CANVAS — 1024×1024 high-res texture
════════════════════════════════════════════════════ */
function buildDecalTexture(imgEl, text, fontCss, fontSize, textColor) {
  const SIZE = 1024
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, SIZE, SIZE)

  if (imgEl) {
    const ratio = imgEl.naturalWidth / imgEl.naturalHeight
    let w = SIZE * 0.78, h = w / ratio
    if (h > SIZE * 0.65) { h = SIZE * 0.65; w = h * ratio }
    const x = (SIZE - w) / 2
    const y = text ? SIZE * 0.06 : (SIZE - h) / 2
    ctx.drawImage(imgEl, x, y, w, h)
  }

  if (text) {
    const fSize = Math.round(fontSize * 4.2)
    ctx.font = `900 ${fSize}px ${fontCss}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const yPos = imgEl ? SIZE * 0.86 : SIZE * 0.5
    /* subtle outline for legibility on any shirt colour */
    ctx.lineWidth = fSize * 0.08
    ctx.strokeStyle = textColor === '#ffffff' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.25)'
    ctx.strokeText(text.toUpperCase(), SIZE / 2, yPos)
    ctx.fillStyle = textColor
    ctx.fillText(text.toUpperCase(), SIZE / 2, yPos)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function findExteriorMesh(root) {
  let fallbackMesh = null
  let fallbackVerts = -1
  let exteriorMesh = null
  let exteriorVerts = -1

  root.traverse(child => {
    if (!child.isMesh) return

    const verts = child.geometry?.attributes?.position?.count || 0
    if (verts > fallbackVerts) {
      fallbackMesh = child
      fallbackVerts = verts
    }

    let node = child
    let signature = ''
    while (node) {
      signature += ` ${node.name || ''}`.toLowerCase()
      node = node.parent
    }

    const looksExterior =
      signature.includes('exterieur') ||
      signature.includes('_ext') ||
      signature.includes(' exterior') ||
      signature.includes(' outer')

    if (looksExterior && verts > exteriorVerts) {
      exteriorMesh = child
      exteriorVerts = verts
    }
  })

  return exteriorMesh || fallbackMesh
}

/* ════════════════════════════════════════════════════
   PRINT-AREA GUIDE — dashed border on the shirt chest
════════════════════════════════════════════════════ */
function PrintAreaGuide({ position, rotation }) {
  const geo = useMemo(() => {
    const w = 0.44, h = 0.50
    const pts = [
      new THREE.Vector3(-w/2, -h/2, 0),
      new THREE.Vector3( w/2, -h/2, 0),
      new THREE.Vector3( w/2,  h/2, 0),
      new THREE.Vector3(-w/2,  h/2, 0),
      new THREE.Vector3(-w/2, -h/2, 0),
    ]
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    return g
  }, [])

  return (
    <line geometry={geo} position={position} rotation={rotation}>
      <lineBasicMaterial color="#e8ff00" transparent opacity={0.35} />
    </line>
  )
}

function ProjectedDecal({
  targetMesh,
  decalTexture,
  activeSide,
  chestY,
  surfaceZ,
  decalX,
  decalY,
  decalScale,
  decalAngle,
}) {
  const targetMeshRef = useMemo(() => ({ current: targetMesh }), [targetMesh])
  if (!targetMesh || !decalTexture) return null

  const worldWidth = decalScale || 0.32
  const worldDepth = Math.min(0.18, Math.max(0.09, worldWidth * 0.55))

  return (
    <Decal
      mesh={targetMeshRef}
      position={[decalX || 0, chestY + (decalY || 0), activeSide === 'front' ? surfaceZ : -surfaceZ]}
      rotation={[0, activeSide === 'front' ? 0 : Math.PI, (decalAngle || 0) * Math.PI / 180]}
      scale={[worldWidth, worldWidth, worldDepth]}
      renderOrder={2}
    >
      <meshStandardMaterial
        map={decalTexture}
        transparent
        alphaTest={0.02}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
        roughness={0.98}
        metalness={0}
      />
    </Decal>
  )
}

/* ════════════════════════════════════════════════════
   3-D T-SHIRT MODEL
   • Auto-centres via bounding box
   • Applies shirt colour
   • Projects artwork directly onto the outer shirt mesh
   • scale / angle / posX / posY all live here
════════════════════════════════════════════════════ */
function TShirtModel({
  shirtColor, decalTexture, activeSide, autoRotate,
  decalX, decalY, decalScale, decalAngle,
  showPrintArea,
}) {
  const { scene } = useGLTF('/oversized_t-shirt.glb')
  const groupRef  = useRef()
  const { clonedScene, decalTargetMesh, surfaceZ, chestY } = useMemo(() => {
    const nextScene = scene.clone(true)

    nextScene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(nextScene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    nextScene.position.sub(center)
    nextScene.updateMatrixWorld(true)

    const sourceMesh = findExteriorMesh(nextScene)
    let bakedTargetMesh = null

    if (sourceMesh) {
      const bakedGeometry = sourceMesh.geometry.clone()
      bakedGeometry.applyMatrix4(sourceMesh.matrixWorld)
      bakedGeometry.computeVertexNormals()
      bakedTargetMesh = new THREE.Mesh(bakedGeometry)
      bakedTargetMesh.updateMatrixWorld(true)
    }

    return {
      clonedScene: nextScene,
      decalTargetMesh: bakedTargetMesh,
      surfaceZ: (box.max.z - center.z) * 1.01,
      chestY: size.y * 0.12,
    }
  }, [scene])

  useEffect(() => () => {
    decalTargetMesh?.geometry?.dispose()
  }, [decalTargetMesh])

  /* Apply shirt colour */
  useEffect(() => {
    const col = new THREE.Color(shirtColor)
    clonedScene.traverse(child => {
      if (child.isMesh) {
        if (!child.userData._matCloned) {
          child.material = child.material.clone()
          child.userData._matCloned = true
        }
        child.material.color.set(col)
        child.material.needsUpdate = true
      }
    })
  }, [shirtColor, clonedScene])

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.45
  })

  const sz      = activeSide === 'front' ? surfaceZ  : -surfaceZ
  const baseRot = activeSide === 'front' ? [0, 0, 0] : [0, Math.PI, 0]

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {/* Print-area guide */}
      {showPrintArea && (
        <PrintAreaGuide position={[0, chestY, sz + 0.003]} rotation={baseRot} />
      )}

      <ProjectedDecal
        targetMesh={decalTargetMesh}
        decalTexture={decalTexture}
        activeSide={activeSide}
        chestY={chestY}
        surfaceZ={surfaceZ}
        decalX={decalX}
        decalY={decalY}
        decalScale={decalScale}
        decalAngle={decalAngle}
      />
    </group>
  )
}

/* Loading skeleton */
function ShirtLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.6, 0.8, 0.2]} />
      <meshStandardMaterial color="#222" wireframe />
    </mesh>
  )
}

/* OrbitControls wrapper */
function Controls({ enabled }) {
  return (
    <OrbitControls
      enabled={enabled}
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI * 0.28}
      maxPolarAngle={Math.PI * 0.72}
      target={[0, 0, 0]}
      rotateSpeed={0.65}
      dampingFactor={0.12}
      enableDamping
    />
  )
}
/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function Customize() {
  const [shirtColor,    setShirtColor]    = useState('#FFFFFF')
  const [printMethod,   setPrintMethod]   = useState('dtg')
  const [activeTab,     setActiveTab]     = useState('color')
  const [saved,         setSaved]         = useState(false)
  const [activeSide,    setActiveSide]    = useState('front')
  const [autoRotate,    setAutoRotate]    = useState(true)
  const [dragMode,      setDragMode]      = useState('rotate')   // 'rotate' | 'move'
  const [showPrintArea, setShowPrintArea] = useState(false)
  const canvasDrag = useRef({ active: false, lastX: 0, lastY: 0 })

  /* Per-side design + text state */
  const [sides, setSides] = useState({ front: mkSide(), back: mkSide() })

  const sideRef = useRef('front')
  useEffect(() => { sideRef.current = activeSide }, [activeSide])

  const cur = sides[activeSide]

  const patchCur = useCallback((patch) => {
    setSides(prev => {
      const v = sideRef.current
      const next = typeof patch === 'function' ? patch(prev[v]) : { ...prev[v], ...patch }
      return { ...prev, [v]: next }
    })
  }, [])

  const fileRef = useRef(null)

  /* ── Background removal ── */
  const removeBackground = (src) => new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const px = id.data
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i+1], b = px[i+2]
        if (px[i+3] === 0) continue
        if (r > 230 && g > 230 && b > 230) { px[i+3] = 0; continue }
        const br = (r+g+b)/3
        if (br > 190 && Math.abs(r-g)<22 && Math.abs(g-b)<22 && Math.abs(r-b)<22) { px[i+3] = 0; continue }
        if (px[i+3] < 30) px[i+3] = 0
      }
      ctx.putImageData(id, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(src)
    img.src = src
  })

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const capturedSide = sideRef.current
    const reader = new FileReader()
    reader.onload = async ev => {
      const cleaned = await removeBackground(ev.target.result)
      setSides(prev => ({ ...prev, [capturedSide]: { ...prev[capturedSide], uploadSrc: cleaned, designId: 'none' } }))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* Refresh texture when image actually loads */
  const [imgLoaded, setImgLoaded] = useState(0)
  useEffect(() => {
    const { uploadSrc, designId } = cur
    const src = uploadSrc || DESIGNS.find(d => d.id === designId)?.src
    if (!src) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImgLoaded(n => n + 1)
    img.src = src
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.uploadSrc, cur.designId])

  const finalDecalTexture = useMemo(() => {
    const { uploadSrc, designId, text, textFont, textSize, textColor } = cur
    const imgSrc = uploadSrc || DESIGNS.find(d => d.id === designId)?.src
    const fontCss = FONTS.find(f => f.id === textFont)?.css || 'sans-serif'
    if (!imgSrc && !text) return null

    if (imgSrc) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imgSrc
      if (img.complete && img.naturalWidth > 0) {
        return buildDecalTexture(img, text, fontCss, textSize, textColor)
      }
      return text ? buildDecalTexture(null, text, fontCss, textSize, textColor) : null
    }
    return buildDecalTexture(null, text, fontCss, textSize, textColor)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgLoaded, cur.uploadSrc, cur.designId, cur.text, cur.textFont, cur.textSize, cur.textColor])

  useEffect(() => () => {
    finalDecalTexture?.dispose()
  }, [finalDecalTexture])

  const projectedDecalTexture = useMemo(() => {
    if (!finalDecalTexture) return null

    const texture = finalDecalTexture.clone()
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(cur.flipH ? -1 : 1, cur.flipV ? -1 : 1)
    texture.offset.set(cur.flipH ? 1 : 0, cur.flipV ? 1 : 0)
    texture.needsUpdate = true
    return texture
  }, [finalDecalTexture, cur.flipH, cur.flipV])

  useEffect(() => () => {
    projectedDecalTexture?.dispose()
  }, [projectedDecalTexture])

  const shirtColorObj = SHIRT_COLORS.find(c => c.hex === shirtColor) || SHIRT_COLORS[0]

  const { text, textFont, textSize, textColor, designId, uploadSrc } = cur
  const hasDesign = uploadSrc || designId !== 'none' || text

  return (
    <div className="cs-page">

      {/* ── Topbar ── */}
      <header className="cs-topbar">
        <div className="cs-topbar__brand">
          <span className="cs-topbar__title">Design Studio</span>
          <span className="cs-topbar__method">{PRINT_METHODS.find(m=>m.id===printMethod)?.name}</span>
        </div>
        <div className="cs-topbar__actions">
          <div className="cs-spec"><span className="cs-spec__k">Colour</span><span className="cs-spec__v">{shirtColorObj.name}</span></div>
          <div className="cs-spec"><span className="cs-spec__k">Fabric</span><span className="cs-spec__v">180 GSM Cotton</span></div>
          <button className={`cs-cta${saved?' cs-cta--saved':''}`}
            onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)}}>
            {saved ? '✓ Saved!' : 'Add to Cart — ₹1,299'}
          </button>
        </div>
      </header>

      <div className="cs-layout">

        {/* ── 3D Viewer ── */}
        <div className="cs-canvas-wrap">

          {/* View controls row */}
          <div className="cs-view-toggle">
            {/* Front / Back */}
            <button className={`cs-view-btn${activeSide==='front'?' active':''}`}
              onClick={() => setActiveSide('front')}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                <circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/>
              </svg>
              Front
            </button>
            <button className={`cs-view-btn${activeSide==='back'?' active':''}`}
              onClick={() => setActiveSide('back')}>
              Back
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
                <circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/>
              </svg>
            </button>

            <div className="cs-view-divider" />

            {/* Rotate / Move modes */}
            <button
              className={`cs-view-btn cs-view-btn--mode${dragMode==='rotate'?' active':''}`}
              onClick={() => { setDragMode('rotate'); setAutoRotate(false) }}
              title="Drag to rotate shirt"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Rotate
            </button>
            <button
              className={`cs-view-btn cs-view-btn--mode${dragMode==='move'?' active':''}`}
              onClick={() => { setDragMode('move'); setAutoRotate(false) }}
              title="Drag to reposition design"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3"/><path d="M3 12h18M12 3v18" strokeWidth="1.5"/>
              </svg>
              Move
            </button>

            <div className="cs-view-divider" />

            {/* Auto-rotate */}
            <button
              className={`cs-view-btn${autoRotate?' active':''}`}
              onClick={() => setAutoRotate(v => !v)}
              title="Toggle auto-rotate"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              Auto
            </button>

            {/* Print-area guide toggle */}
            <button
              className={`cs-view-btn${showPrintArea?' active':''}`}
              onClick={() => setShowPrintArea(v => !v)}
              title="Show print area boundary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              Area
            </button>
          </div>

          {/* Three.js Canvas */}
          <div
            className={`cs-3d-canvas${dragMode==='move'?' cs-3d-canvas--move':''}`}
            onPointerDown={e => {
              if (dragMode === 'move') {
                canvasDrag.current = { active: true, lastX: e.clientX, lastY: e.clientY }
                e.currentTarget.setPointerCapture(e.pointerId)
              } else {
                setAutoRotate(false)
              }
            }}
            onPointerMove={e => {
              if (dragMode === 'move' && canvasDrag.current.active) {
                const dx =  (e.clientX - canvasDrag.current.lastX) * 0.0030
                const dy = -(e.clientY - canvasDrag.current.lastY) * 0.0030
                patchCur(prev => ({
                  ...prev,
                  posX: Math.max(-0.22, Math.min(0.22, (prev.posX || 0) + dx)),
                  posY: Math.max(-0.26, Math.min(0.26, (prev.posY || 0) + dy)),
                }))
                canvasDrag.current.lastX = e.clientX
                canvasDrag.current.lastY = e.clientY
              }
            }}
            onPointerUp={() => { canvasDrag.current.active = false }}
            onPointerLeave={() => { canvasDrag.current.active = false }}
          >
            <Canvas
              camera={{ position: [0, 0, 1.8], fov: 38 }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            >
              <ambientLight intensity={0.75} />
              <directionalLight position={[3, 5, 3]} intensity={1.15} castShadow />
              <directionalLight position={[-3, 2, -2]} intensity={0.4} />
              <Suspense fallback={<ShirtLoader />}>
                <TShirtModel
                  shirtColor={shirtColor}
                  decalTexture={projectedDecalTexture}
                  activeSide={activeSide}
                  autoRotate={autoRotate}
                  decalX={cur.posX || 0}
                  decalY={cur.posY || 0}
                  decalScale={cur.scale}
                  decalAngle={cur.angle}
                  showPrintArea={showPrintArea}
                />
                <ContactShadows
                  position={[0, -0.78, 0]}
                  opacity={0.3}
                  scale={3}
                  blur={2.5}
                />
                <Environment preset="studio" />
              </Suspense>
              <Controls enabled={dragMode === 'rotate'} />
            </Canvas>
          </div>

          {/* Status bar below canvas */}
          <div className="cs-status-bar">
            {dragMode === 'move' && hasDesign ? (
              <span className="cs-pos-readout">
                ✋ Move mode · X {(cur.posX||0).toFixed(2)} Y {(cur.posY||0).toFixed(2)}
                {' '}· <button className="cs-inline-reset" onClick={() => patchCur({ posX: 0, posY: 0 })}>Reset pos</button>
              </span>
            ) : (
              <span className="cs-hint-text">
                {autoRotate ? '⟳ Auto-rotating · Click Auto to stop' : '🔄 Drag to rotate · use Move to reposition print'}
              </span>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <aside className="cs-panel">

          {/* Side indicator */}
          <div className="cs-editing-side">
            <span className={`cs-side-dot${activeSide==='front'?' front':''}`}/>
            <span>Editing: <strong>{activeSide === 'front' ? 'FRONT PRINT' : 'BACK PRINT'}</strong></span>
            {(sides.front.uploadSrc || sides.front.designId !== 'none' || sides.front.text) && activeSide === 'back' && (
              <span className="cs-side-badge">Front ✓</span>
            )}
            {(sides.back.uploadSrc || sides.back.designId !== 'none' || sides.back.text) && activeSide === 'front' && (
              <span className="cs-side-badge">Back ✓</span>
            )}
          </div>

          {/* Tab bar */}
          <div className="cs-tabs">
            {[['color','Color'],['design','Design'],['text','Text'],['method','Print']].map(([id,lbl])=>(
              <button key={id} className={`cs-tab${activeTab===id?' active':''}`}
                onClick={()=>setActiveTab(id)}>{lbl}</button>
            ))}
          </div>

          {/* ── Color tab ── */}
          {activeTab==='color' && (
            <div className="cs-body">
              <p className="cs-section-label">25 Colours · Applies to Both Sides</p>
              <div className="cs-color-grid">
                {SHIRT_COLORS.map(c => (
                  <button key={c.hex}
                    className={`cs-color-swatch${shirtColor===c.hex?' active':''}`}
                    style={{ background: c.hex,
                      border: shirtColor===c.hex ? '3px solid #e8ff00'
                              : c.hex==='#FFFFFF' ? '1.5px solid #ccc'
                              : `2px solid ${c.hex}` }}
                    title={c.name}
                    onClick={() => setShirtColor(c.hex)}
                  />
                ))}
              </div>
              <div className="cs-color-name-row">
                <div className="cs-color-preview" style={{background: shirtColor, border: shirtColor==='#FFFFFF'?'1px solid #ddd':'none'}}/>
                <span className="cs-color-name">{shirtColorObj.name}</span>
              </div>
            </div>
          )}

          {/* ── Design tab ── */}
          {activeTab==='design' && (
            <div className="cs-body">
              <p className="cs-section-label">Upload Your Image — {activeSide === 'front' ? 'Front' : 'Back'}</p>

              {/* Upload area */}
              <button className="cs-upload-area" onClick={() => fileRef.current.click()}>
                {uploadSrc
                  ? <img src={uploadSrc} alt="uploaded" className="cs-upload-preview" />
                  : (
                    <div className="cs-upload-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Click to upload image</span>
                      <span className="cs-upload-hint">PNG, JPG, SVG · White bg auto-removed</span>
                    </div>
                  )
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleUpload}/>

              {uploadSrc && (
                <button className="cs-clear-btn" onClick={() => patchCur({ uploadSrc: null, designId: 'none' })}>
                  ✕ Remove Image
                </button>
              )}

              {/* ── Design transform controls ── */}
              {hasDesign && (
                <div className="cs-transform-panel">
                  <p className="cs-section-label" style={{marginTop:'1rem'}}>Design Size</p>
                  <div className="cs-slider-row">
                    <span>S</span>
                    <input type="range" min="0.08" max="0.55" step="0.01"
                      value={cur.scale} className="cs-slider"
                      onChange={e => patchCur({ scale: +e.target.value })} />
                    <span>L</span>
                    <span className="cs-slider-val">{Math.round((cur.scale / 0.55) * 100)}%</span>
                  </div>

                  <p className="cs-section-label" style={{marginTop:'0.85rem'}}>Rotation</p>
                  <div className="cs-slider-row">
                    <span style={{fontSize:'0.65rem'}}>-180°</span>
                    <input type="range" min="-180" max="180" step="1"
                      value={cur.angle} className="cs-slider"
                      onChange={e => patchCur({ angle: +e.target.value })} />
                    <span style={{fontSize:'0.65rem'}}>180°</span>
                    <span className="cs-slider-val">{cur.angle}°</span>
                  </div>

                  <p className="cs-section-label" style={{marginTop:'0.85rem'}}>Flip &amp; Position</p>
                  <div className="cs-flip-row">
                    <button
                      className={`cs-flip-btn${cur.flipH?' active':''}`}
                      onClick={() => patchCur({ flipH: !cur.flipH })}
                      title="Flip horizontally"
                    >↔ Flip H</button>
                    <button
                      className={`cs-flip-btn${cur.flipV?' active':''}`}
                      onClick={() => patchCur({ flipV: !cur.flipV })}
                      title="Flip vertically"
                    >↕ Flip V</button>
                    <button
                      className="cs-flip-btn"
                      onClick={() => patchCur({ posX: 0, posY: 0 })}
                      title="Reset position to centre"
                    >⊙ Centre</button>
                    <button
                      className="cs-flip-btn"
                      onClick={() => patchCur({ scale: 0.32, angle: 0, flipH: false, flipV: false, posX: 0, posY: 0 })}
                      title="Reset all transforms"
                    >↺ Reset all</button>
                  </div>
                </div>
              )}

              <p className="cs-section-label" style={{marginTop:'1.25rem'}}>Or pick a preset design</p>
              <div className="cs-design-grid">
                {DESIGNS.map(d => (
                  <button key={d.id}
                    className={`cs-design-cell${designId===d.id && !uploadSrc?' active':''}`}
                    onClick={()=>patchCur({ designId: d.id, uploadSrc: null })}>
                    <div className="cs-design-thumb">
                      {d.src
                        ? <img src={d.src} alt={d.label} loading="lazy"
                            onError={e=>e.target.style.display='none'}/>
                        : <span className="cs-blank-icon">∅</span>}
                    </div>
                    <span className="cs-design-name">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Text tab ── */}
          {activeTab==='text' && (
            <div className="cs-body">
              <p className="cs-section-label">Custom Text — {activeSide === 'front' ? 'Front' : 'Back'}</p>
              <input className="cs-text-inp" type="text" placeholder="YOUR TEXT HERE"
                value={text} onChange={e=>patchCur({ text: e.target.value })} maxLength={20}/>
              <div className="cs-char">{text.length}/20</div>

              <p className="cs-section-label" style={{marginTop:'1rem'}}>Font</p>
              <div className="cs-font-grid">
                {FONTS.map(f=>(
                  <button key={f.id} className={`cs-font-btn${textFont===f.id?' active':''}`}
                    style={{fontFamily:f.css}} onClick={()=>patchCur({ textFont: f.id })}>
                    {f.name}
                  </button>
                ))}
              </div>

              <p className="cs-section-label" style={{marginTop:'1rem'}}>Size</p>
              <div className="cs-slider-row">
                <span>S</span>
                <input type="range" min="12" max="36" value={textSize}
                  className="cs-slider" onChange={e=>patchCur({ textSize: +e.target.value })}/>
                <span>L</span>
                <span className="cs-slider-val">{textSize}px</span>
              </div>

              <p className="cs-section-label" style={{marginTop:'1rem'}}>Ink Colour</p>
              <div className="cs-ink-row">
                {INK.map(c=>(
                  <button key={c} className={`cs-ink${textColor===c?' active':''}`}
                    style={{ background:c,
                      border: textColor===c ? '2.5px solid #e8ff00'
                              : c==='#ffffff' ? '1.5px solid #ccc' : `2px solid ${c}` }}
                    onClick={()=>patchCur({ textColor: c })}/>
                ))}
                <input type="color" value={textColor}
                  onChange={e=>patchCur({ textColor: e.target.value })} className="cs-ink-custom"/>
              </div>

              {text && (
                <div className="cs-text-preview"
                  style={{ fontFamily: FONTS.find(f=>f.id===textFont)?.css, fontSize: textSize, color: textColor }}>
                  {text.toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* ── Print method tab ── */}
          {activeTab==='method' && (
            <div className="cs-body">
              <p className="cs-section-label">Print Method · Both Sides</p>
              {PRINT_METHODS.map(m=>(
                <button key={m.id}
                  className={`cs-method-item${printMethod===m.id?' active':''}`}
                  onClick={()=>setPrintMethod(m.id)}>
                  <div>
                    <div className="cs-method-name">{m.name}</div>
                    <div className="cs-method-desc">{m.desc}</div>
                  </div>
                  {printMethod===m.id && (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <polyline points="2 8 6 12 14 4"/>
                    </svg>
                  )}
                </button>
              ))}
              <div className="cs-method-note">Production: 3–5 business days · Min order: 1 pc</div>
            </div>
          )}

        </aside>
      </div>
    </div>
  )
}
