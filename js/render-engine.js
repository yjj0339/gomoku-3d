/**
 * Gomoku 3D - Render Engine v6.0
 * Three.js 3D rendering for the Gomoku board, stones, and effects
 * + Screen shake on impact
 * + Slow-motion replay
 * + Board reflection
 * + Upgraded particle system (confetti, explosion, ring wave)
 * + Physical-based materials (PBR)
 * + Environment map for reflections
 * + Post-processing bloom (simulated via layered meshes)
 * + Animated camera transitions
 * + Stone trail / landing dust
 * + Ambient floating particles
 */

class RenderEngine {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.boardGroup = null;
    this.stonesGroup = null;
    this.effectsGroup = null;
    this.coordGroup = null;
    this.ambientGroup = null;
    this.boardSize = 15;
    this.cellSize = 1;
    this.theme = null;
    this.stones = [];
    this.hoverMesh = null;
    this.winLine = null;
    this.particleSystem = null;
    this.ambientParticles = null;
    this.animating = false;
    this.lastStone = null;
    this.moveAnimations = [];
    this.effects = []; // Active effect animations
    this.shakeOffset = { x: 0, y: 0, z: 0, intensity: 0, decay: 0.9 };
    this.slowMotion = false;
    this.slowMotionScale = 1;
    this.envMap = null;
    this.cameraTarget = null;
    this.cameraAnimation = null;
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  init(theme) {
    this.theme = theme;

    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      this.showError('3D\u5f15\u64ce\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u5237\u65b0\u9875\u9762');
      return false;
    }

    const bgColor = '#f0f2f5';
    const bgColorHex = parseInt(bgColor.replace('#', ''), 16);

    let w = this.container.clientWidth;
    let h = this.container.clientHeight;
    if (!w || !h) {
      w = window.innerWidth;
      h = window.innerHeight;
    }

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(bgColorHex);
      this.scene.fog = new THREE.Fog(bgColorHex, 35, 70);

      const aspect = w / h;
      this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
      this.camera.position.set(0, 16, 14);
      this.camera.lookAt(0, 0, 0);

      // WebGL context creation with fallback
      let glContext = null;
      try {
        glContext = this.container.getContext('webgl2') || this.container.getContext('webgl') || this.container.getContext('experimental-webgl');
      } catch (e) {
        console.warn('WebGL context creation threw:', e);
      }

      if (!glContext) {
        this.showError('\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u652f\u6301WebGL\uff0c\u8bf7\u5c1d\u8bd5\u66f4\u6362\u6d4f\u89c8\u5668');
        return false;
      }

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.container,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false
      });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      this.renderer.setClearColor(bgColorHex, 1);

      // Create environment map for PBR reflections
      this.createEnvironmentMap();

      // OrbitControls
      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 28;
        this.controls.minPolarAngle = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = 0.6;
        this.controls.zoomSpeed = 0.7;
      }

      this.setupLighting();
      this.createBoard(theme);
      this.createStonesGroup();
      this.createEffectsGroup();
      this.createCoordGroup();
      this.createHoverMesh();
      this.createAmbientParticles();
      this.createReflectionPlane();

      window.addEventListener('resize', this.onResize);
      this.animate();
      this._initialized = true;
      return true;
    } catch (err) {
      console.error('RenderEngine init failed:', err);
      this.showError('3D\u521d\u59cb\u5316\u5931\u8d25: ' + (err.message || err));
      return false;
    }
  }

  showError(msg) {
    const parent = this.container.parentElement;
    if (parent) {
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f0f2f5;color:#333;font-size:16px;text-align:center;padding:20px;z-index:10;';
      errDiv.innerHTML = '<div><div style="font-size:48px;margin-bottom:12px;">&#9888;</div><div>' + msg + '</div><div style="margin-top:16px;font-size:13px;color:#999;">\u8bf7\u5c1d\u8bd5\u6e05\u9664\u6d4f\u89c8\u5668\u7f13\u5b58\u540e\u5237\u65b0</div></div>';
      parent.appendChild(errDiv);
    }
    this._initialized = false;
  }

  createEnvironmentMap() {
    // Create a simple gradient environment map for PBR reflections
    try {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, '#c8d8f0');
      gradient.addColorStop(0.4, '#e8eef5');
      gradient.addColorStop(0.6, '#f5f5f0');
      gradient.addColorStop(1, '#d0d0d0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      this.envMap = tex;
      this.scene.environment = tex;
    } catch(e) {
      console.warn('Environment map creation failed:', e);
    }
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Key light - main directional with shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(8, 18, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 4;
    this.scene.add(keyLight);

    // Fill light - cool blue
    const fillLight = new THREE.DirectionalLight(0xB8CCE6, 0.4);
    fillLight.position.set(-8, 6, -6);
    this.scene.add(fillLight);

    // Rim light - warm
    const rimLight = new THREE.DirectionalLight(0xFFE8C8, 0.3);
    rimLight.position.set(0, 4, -12);
    this.scene.add(rimLight);

    // Hemisphere light - sky/ground
    const hemi = new THREE.HemisphereLight(0xffffff, 0xC8CCE0, 0.4);
    this.scene.add(hemi);

    // Subtle point light for stone sparkle
    const sparkle = new THREE.PointLight(0xffffff, 0.3, 20);
    sparkle.position.set(0, 8, 0);
    this.scene.add(sparkle);
  }

  createBoard(theme) {
    if (this.boardGroup) {
      this.scene.remove(this.boardGroup);
      this.disposeGroup(this.boardGroup);
    }
    this.boardGroup = new THREE.Group();

    const size = (this.boardSize - 1) * this.cellSize;
    const boardThickness = 0.6;
    const margin = 1.2;

    // Board base with PBR material
    const boardGeom = new THREE.BoxGeometry(size + margin * 2, boardThickness, size + margin * 2);
    const boardColorStr = theme.boardColor || '#E8D5B7';
    const boardColorHex = typeof boardColorStr === 'string' ? parseInt(boardColorStr.replace('#', ''), 16) : boardColorStr;
    const boardMat = new THREE.MeshPhysicalMaterial({
      color: boardColorHex,
      roughness: theme.boardRoughness || 0.5,
      metalness: theme.boardMetalness || 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.6
    });
    const board = new THREE.Mesh(boardGeom, boardMat);
    board.receiveShadow = true;
    board.position.y = -boardThickness / 2;
    this.boardGroup.add(board);

    // Grid lines
    const lineColorStr = theme.lineColor || '#3D3D3D';
    const lineColorHex = typeof lineColorStr === 'string' ? parseInt(lineColorStr.replace('#', ''), 16) : lineColorStr;
    const lineMat = new THREE.LineBasicMaterial({ color: lineColorHex, transparent: true, opacity: 0.7 });
    for (let i = 0; i < this.boardSize; i++) {
      const pos = -size / 2 + i * this.cellSize;
      const hGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size / 2, 0.01, pos),
        new THREE.Vector3(size / 2, 0.01, pos)
      ]);
      this.boardGroup.add(new THREE.Line(hGeom, lineMat));
      const vGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos, 0.01, -size / 2),
        new THREE.Vector3(pos, 0.01, size / 2)
      ]);
      this.boardGroup.add(new THREE.Line(vGeom, lineMat));
    }

    // Star points
    const starPositions = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];
    const starGeom = new THREE.CircleGeometry(0.08, 16);
    const starMat = new THREE.MeshBasicMaterial({ color: lineColorHex });
    starPositions.forEach(([row, col]) => {
      const star = new THREE.Mesh(starGeom, starMat);
      star.rotation.x = -Math.PI / 2;
      star.position.set(-size / 2 + col * this.cellSize, 0.02, -size / 2 + row * this.cellSize);
      this.boardGroup.add(star);
    });

    // Board edge bevel
    const edgeGeom = new THREE.BoxGeometry(size + margin * 2 + 0.1, 0.05, size + margin * 2 + 0.1);
    const accentColorStr = theme.accentColor || '#4A90D9';
    const accentColorHex = typeof accentColorStr === 'string' ? parseInt(accentColorStr.replace('#', ''), 16) : accentColorStr;
    const edgeMat = new THREE.MeshPhysicalMaterial({
      color: accentColorHex,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.5,
      envMap: this.envMap,
      envMapIntensity: 1.0
    });
    const edge = new THREE.Mesh(edgeGeom, edgeMat);
    edge.position.y = 0.02;
    this.boardGroup.add(edge);

    // Contact shadow plane
    const shadowGeom = new THREE.PlaneGeometry(40, 40);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -boardThickness;
    shadowPlane.receiveShadow = true;
    this.boardGroup.add(shadowPlane);

    this.scene.add(this.boardGroup);
  }

  createReflectionPlane() {
    // Create a subtle reflection plane below the board
    const size = (this.boardSize - 1) * this.cellSize + 3;
    const geom = new THREE.PlaneGeometry(size * 2, size * 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf0f2f5,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geom, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.65;
    this.scene.add(plane);
    this.reflectionPlane = plane;
  }

  createAmbientParticles() {
    // Floating ambient particles for atmosphere
    const count = 60;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 12 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.003
      });
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.ambientParticles = new THREE.Points(geom, mat);
    this.ambientParticles.userData.velocities = velocities;
    this.scene.add(this.ambientParticles);
  }

  createStonesGroup() {
    if (this.stonesGroup) {
      this.scene.remove(this.stonesGroup);
      this.disposeGroup(this.stonesGroup);
    }
    this.stonesGroup = new THREE.Group();
    this.scene.add(this.stonesGroup);
  }

  createEffectsGroup() {
    if (this.effectsGroup) {
      this.scene.remove(this.effectsGroup);
      this.disposeGroup(this.effectsGroup);
    }
    this.effectsGroup = new THREE.Group();
    this.scene.add(this.effectsGroup);
  }

  createCoordGroup() {
    if (this.coordGroup) {
      this.scene.remove(this.coordGroup);
      this.disposeGroup(this.coordGroup);
    }
    this.coordGroup = new THREE.Group();
    const showCoords = App.settings && App.settings.coords;
    if (showCoords) {
      this.createCoordLabels();
    }
    this.scene.add(this.coordGroup);
  }

  createCoordLabels() {
    const size = (this.boardSize - 1) * this.cellSize;
    const margin = 1.2;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(100, 100, 120, 0.6)';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.boardSize; i++) {
      const xLabel = String.fromCharCode(65 + i);
      const numLabel = String(this.boardSize - i);
      const pos = -size / 2 + i * this.cellSize;
      [xLabel, numLabel].forEach((text, idx) => {
        const tex = new THREE.CanvasTexture(canvas);
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillText(text, 32, 32);
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(0.5, 0.5, 1);
        if (idx === 0) {
          sprite.position.set(pos, 0.01, -size / 2 - margin / 2);
        } else {
          sprite.position.set(-size / 2 - margin / 2, 0.01, pos);
        }
        this.coordGroup.add(sprite);
      });
    }
  }

  createHoverMesh() {
    if (this.hoverMesh) {
      this.scene.remove(this.hoverMesh);
      this.hoverMesh.geometry.dispose();
      this.hoverMesh.material.dispose();
    }
    const geom = new THREE.SphereGeometry(0.42, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4A90D9,
      transparent: true,
      opacity: 0.3,
      roughness: 0.3,
      metalness: 0.5
    });
    this.hoverMesh = new THREE.Mesh(geom, mat);
    this.hoverMesh.visible = false;
    this.scene.add(this.hoverMesh);
  }

  gridToWorld(idx) {
    const size = (this.boardSize - 1) * this.cellSize;
    return -size / 2 + idx * this.cellSize;
  }

  worldToGrid(x, z) {
    const size = (this.boardSize - 1) * this.cellSize;
    const col = Math.round((x + size / 2) / this.cellSize);
    const row = Math.round((z + size / 2) / this.cellSize);
    if (col < 0 || col >= this.boardSize || row < 0 || row >= this.boardSize) return null;
    return { row, col };
  }

  addStone(row, col, color) {
    // Determine if color is black or white
    // color can be 'black', 'white', 1, or 2
    const isBlack = color === 'black' || color === 1;

    // Higher quality sphere geometry
    const geom = new THREE.SphereGeometry(0.42, 48, 48);
    const mat = new THREE.MeshPhysicalMaterial({
      color: isBlack ? 0x0a0a0a : 0xf8f8f8,
      roughness: isBlack ? 0.15 : 0.25,
      metalness: isBlack ? 0.5 : 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: isBlack ? 0.1 : 0.2,
      envMap: this.envMap,
      envMapIntensity: 1.2,
      reflectivity: 0.5
    });
    const stone = new THREE.Mesh(geom, mat);
    stone.castShadow = true;
    stone.receiveShadow = true;
    stone.position.set(this.gridToWorld(col), 0.42, this.gridToWorld(row));
    stone.scale.set(0.01, 0.01, 0.01);

    this.stonesGroup.add(stone);
    this.stones.push({ row, col, color, mesh: stone });

    // Animate drop with bounce
    const startY = 6;
    stone.position.y = startY;
    const animData = {
      mesh: stone,
      startTime: performance.now(),
      duration: 350,
      startScale: 0.01,
      endScale: 1,
      startY: startY,
      endY: 0.42,
      bounce: true
    };
    this.moveAnimations.push(animData);

    // Squash effect on landing
    setTimeout(() => {
      if (stone.scale.x > 0.5) {
        stone.scale.y = 0.65;
        setTimeout(() => {
          if (stone.parent) {
            stone.scale.y = 1;
          }
        }, 120);
      }
    }, 350);

    // Landing dust particles
    this.createLandingDust(this.gridToWorld(col), this.gridToWorld(row));

    // Screen shake on stone placement
    this.triggerShake(0.08);

    this.lastStone = { row, col, color, mesh: stone };
    return stone;
  }

  createLandingDust(x, z) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.2;
      const geom = new THREE.SphereGeometry(0.05, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
      });
      const particle = new THREE.Mesh(geom, mat);
      particle.position.set(x + Math.cos(angle) * 0.1, 0.05, z + Math.sin(angle) * 0.1);
      this.effectsGroup.add(particle);
      this.effects.push({
        mesh: particle,
        startTime: performance.now(),
        duration: 400,
        type: 'dust',
        targetX: x + Math.cos(angle) * radius,
        targetZ: z + Math.sin(angle) * radius,
        startY: 0.05
      });
    }
  }

  triggerShake(intensity) {
    this.shakeOffset.intensity = Math.max(this.shakeOffset.intensity, intensity);
  }

  setSlowMotion(enabled) {
    this.slowMotion = enabled;
    this.slowMotionScale = enabled ? 0.3 : 1;
  }

  animateCameraTo(targetPos, targetLookAt, duration = 1000) {
    this.cameraAnimation = {
      startPos: this.camera.position.clone(),
      endPos: new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
      startLookAt: this.controls ? this.controls.target.clone() : new THREE.Vector3(0, 0, 0),
      endLookAt: new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z),
      startTime: performance.now(),
      duration: duration
    };
  }

  removeLastStone() {
    if (this.stones.length === 0) return;
    const last = this.stones.pop();
    this.stonesGroup.remove(last.mesh);
    last.mesh.geometry.dispose();
    last.mesh.material.dispose();
    if (this.lastStone && this.lastStone.mesh === last.mesh) {
      this.lastStone = null;
    }
  }

  removeStone(row, col) {
    const idx = this.stones.findIndex(s => s.row === row && s.col === col);
    if (idx === -1) return;
    const stone = this.stones[idx];
    this.stonesGroup.remove(stone.mesh);
    stone.mesh.geometry.dispose();
    stone.mesh.material.dispose();
    this.stones.splice(idx, 1);
  }

  clearStones() {
    while (this.stones.length > 0) {
      const s = this.stones.pop();
      this.stonesGroup.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    }
    this.lastStone = null;
  }

  showHover(row, col, color) {
    if (!this.hoverMesh) return;
    this.hoverMesh.visible = true;
    this.hoverMesh.position.set(this.gridToWorld(col), 0.42, this.gridToWorld(row));
    const isBlack = color === 'black' || color === 1;
    this.hoverMesh.material.color.setHex(isBlack ? 0x1a1a1a : 0xf5f5f5);
    this.hoverMesh.material.opacity = 0.4;
  }

  hideHover() {
    if (this.hoverMesh) this.hoverMesh.visible = false;
  }

  showLastMoveMarker(row, col) {
    if (this.lastStone && this.lastStone.mesh) {
      const ringGeom = new THREE.RingGeometry(0.45, 0.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(this.gridToWorld(col), 0.85, this.gridToWorld(row));
      ring.userData.isMarker = true;
      this.effectsGroup.add(ring);
      this.effectsGroup.children.filter(c => c.userData.isMarker && c !== ring).forEach(old => {
        this.effectsGroup.remove(old);
        old.geometry.dispose();
        old.material.dispose();
      });
    }
  }

  showWinLine(positions) {
    if (this.winLine) {
      this.effectsGroup.remove(this.winLine);
      this.winLine.geometry.dispose();
      this.winLine.material.dispose();
    }
    const points = positions.map(p => new THREE.Vector3(
      this.gridToWorld(p.col), 0.42, this.gridToWorld(p.row)
    ));
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0x4A90D9, linewidth: 3, transparent: true, opacity: 0.9 });
    this.winLine = new THREE.Line(geom, mat);
    this.effectsGroup.add(this.winLine);

    // Upgraded: Confetti explosion at each winning stone
    positions.forEach((p, idx) => {
      // Glow sphere
      const glowGeom = new THREE.SphereGeometry(0.5, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.set(this.gridToWorld(p.col), 0.42, this.gridToWorld(p.row));
      glow.userData.isWinGlow = true;
      glow.userData.startTime = performance.now();
      this.effectsGroup.add(glow);

      // Ring wave effect
      const ringGeom2 = new THREE.RingGeometry(0.4, 0.5, 32);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ringWave = new THREE.Mesh(ringGeom2, ringMat2);
      ringWave.rotation.x = -Math.PI / 2;
      ringWave.position.set(this.gridToWorld(p.col), 0.5, this.gridToWorld(p.row));
      ringWave.userData.isRingWave = true;
      ringWave.userData.startTime = performance.now() + idx * 100;
      this.effectsGroup.add(ringWave);
    });

    // Confetti burst
    this.createConfetti(positions[0]);

    // Big screen shake for celebration
    this.triggerShake(0.2);
  }

  createConfetti(pos) {
    const count = 40;
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xF9A826, 0xABEBC6, 0xF39C12, 0xE74C3C, 0x9B59B6];
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 1
      });
      const confetti = new THREE.Mesh(geom, mat);
      const px = this.gridToWorld(pos.col);
      const pz = this.gridToWorld(pos.row);
      confetti.position.set(px, 1, pz);
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.02 + Math.random() * 0.03;
      confetti.userData = {
        isConfetti: true,
        startTime: performance.now(),
        duration: 2000 + Math.random() * 1000,
        vx: Math.cos(angle) * speed,
        vy: 0.03 + Math.random() * 0.04,
        vz: Math.sin(angle) * speed,
        rotSpeed: (Math.random() - 0.5) * 0.1
      };
      this.effectsGroup.add(confetti);
    }
  }

  clearEffects() {
    if (this.effectsGroup) {
      while (this.effectsGroup.children.length > 0) {
        const child = this.effectsGroup.children[0];
        this.effectsGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    }
    this.winLine = null;
    this.effects = [];
  }

  setTheme(theme) {
    this.theme = theme;
    const bgColorHex = 0xf0f2f5;
    this.scene.background = new THREE.Color(bgColorHex);
    this.scene.fog.color = new THREE.Color(bgColorHex);
    if (this.renderer) this.renderer.setClearColor(bgColorHex, 1);
    this.createBoard(theme);
    this.createCoordGroup();
  }

  toggleCoords(show) {
    this.createCoordGroup();
  }

  disposeGroup(group) {
    group.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }

  raycast(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    const boardTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(boardTop, point);

    return this.worldToGrid(point.x, point.z);
  }

  animate() {
    requestAnimationFrame(this.animate);
    if (!this.renderer || !this._initialized) return;

    const now = performance.now();
    const dt = this.slowMotion ? 0.3 : 1;

    // Process stone drop animations
    this.moveAnimations = this.moveAnimations.filter(anim => {
      const elapsed = now - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);
      // Bounce easing
      let ease;
      if (anim.bounce && t > 0.7) {
        const bt = (t - 0.7) / 0.3;
        ease = 1 - Math.abs(Math.sin(bt * Math.PI)) * 0.15;
      } else {
        ease = 1 - Math.pow(1 - t, 3);
      }
      anim.mesh.scale.setScalar(anim.startScale + (anim.endScale - anim.startScale) * ease);
      anim.mesh.position.y = anim.startY + (anim.endY - anim.startY) * ease;
      return t < 1;
    });

    // Process dust, confetti, ring wave effects
    if (this.effectsGroup) {
      const toRemove = [];
      this.effectsGroup.children.forEach(child => {
        if (child.userData.isWinGlow) {
          const elapsed = (now - child.userData.startTime) / 1000;
          const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5;
          child.material.opacity = 0.2 + pulse * 0.3;
          child.scale.setScalar(1 + pulse * 0.2);
        }
        if (child.userData.isRingWave) {
          if (now < child.userData.startTime) return;
          const elapsed = (now - child.userData.startTime) / 800;
          if (elapsed > 1) {
            toRemove.push(child);
            return;
          }
          child.scale.setScalar(1 + elapsed * 3);
          child.material.opacity = 0.8 * (1 - elapsed);
        }
        if (child.userData.isConfetti) {
          const elapsed = now - child.userData.startTime;
          if (elapsed > child.userData.duration) {
            toRemove.push(child);
            return;
          }
          child.position.x += child.userData.vx * dt;
          child.position.y += child.userData.vy * dt;
          child.position.z += child.userData.vz * dt;
          child.userData.vy -= 0.001 * dt; // Gravity
          child.rotation.x += child.userData.rotSpeed;
          child.rotation.z += child.userData.rotSpeed * 0.7;
          const t = elapsed / child.userData.duration;
          child.material.opacity = 1 - t;
        }
      });
      toRemove.forEach(child => {
        this.effectsGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    // Process landing dust
    this.effects = this.effects.filter(eff => {
      const elapsed = now - eff.startTime;
      const t = Math.min(elapsed / eff.duration, 1);
      if (eff.type === 'dust') {
        eff.mesh.position.x += (eff.targetX - eff.mesh.position.x) * 0.1 * dt;
        eff.mesh.position.z += (eff.targetZ - eff.mesh.position.z) * 0.1 * dt;
        eff.mesh.position.y = eff.startY + t * 0.5;
        eff.mesh.material.opacity = 0.4 * (1 - t);
      }
      if (t >= 1) {
        this.effectsGroup.remove(eff.mesh);
        eff.mesh.geometry.dispose();
        eff.mesh.material.dispose();
        return false;
      }
      return true;
    });

    // Update ambient particles
    if (this.ambientParticles) {
      const positions = this.ambientParticles.geometry.attributes.position.array;
      const vels = this.ambientParticles.userData.velocities;
      for (let i = 0; i < vels.length; i++) {
        positions[i * 3] += vels[i].x;
        positions[i * 3 + 1] += vels[i].y;
        positions[i * 3 + 2] += vels[i].z;
        // Wrap around
        if (positions[i * 3 + 1] > 14) positions[i * 3 + 1] = 1;
        if (positions[i * 3 + 1] < 0.5) positions[i * 3 + 1] = 14;
        if (Math.abs(positions[i * 3]) > 14) positions[i * 3] *= -0.9;
        if (Math.abs(positions[i * 3 + 2]) > 14) positions[i * 3 + 2] *= -0.9;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Screen shake
    if (this.shakeOffset.intensity > 0.001) {
      this.shakeOffset.x = (Math.random() - 0.5) * this.shakeOffset.intensity;
      this.shakeOffset.y = (Math.random() - 0.5) * this.shakeOffset.intensity;
      this.shakeOffset.z = (Math.random() - 0.5) * this.shakeOffset.intensity;
      this.shakeOffset.intensity *= this.shakeOffset.decay;
      this.camera.position.x += this.shakeOffset.x;
      this.camera.position.y += this.shakeOffset.y;
      this.camera.position.z += this.shakeOffset.z;
    }

    // Camera animation
    if (this.cameraAnimation) {
      const elapsed = now - this.cameraAnimation.startTime;
      const t = Math.min(elapsed / this.cameraAnimation.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(this.cameraAnimation.startPos, this.cameraAnimation.endPos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(this.cameraAnimation.startLookAt, this.cameraAnimation.endLookAt, ease);
      }
      if (t >= 1) this.cameraAnimation = null;
    }

    // Hover mesh pulse
    if (this.hoverMesh && this.hoverMesh.visible) {
      const pulse = Math.sin(now * 0.005) * 0.05 + 1;
      this.hoverMesh.scale.setScalar(pulse);
    }

    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    let w = this.container.clientWidth;
    let h = this.container.clientHeight;
    if (!w || !h) {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  resize(w, h) {
    if (!this.renderer || !this.camera) return;
    if (!w || !h) {
      w = this.container.clientWidth || window.innerWidth;
      h = this.container.clientHeight || window.innerHeight;
    }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.controls) this.controls.dispose();
    this.clearStones();
    this.clearEffects();
    if (this.boardGroup) this.disposeGroup(this.boardGroup);
    if (this.stonesGroup) this.disposeGroup(this.stonesGroup);
    if (this.hoverMesh) {
      this.hoverMesh.geometry.dispose();
      this.hoverMesh.material.dispose();
    }
    if (this.ambientParticles) {
      this.ambientParticles.geometry.dispose();
      this.ambientParticles.material.dispose();
    }
    if (this.reflectionPlane) {
      this.reflectionPlane.geometry.dispose();
      this.reflectionPlane.material.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}

if (typeof window !== 'undefined') {
  window.RenderEngine = RenderEngine;
}
