/**
 * Gomoku 3D - Render Engine
 * Three.js 3D rendering for the Gomoku board, stones, and effects
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
    this.boardSize = 15;
    this.cellSize = 1;
    this.theme = null;
    this.stones = [];
    this.hoverMesh = null;
    this.winLine = null;
    this.particleSystem = null;
    this.animating = false;
    this.lastStone = null;
    this.moveAnimations = [];
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  init(theme) {
    this.theme = theme;

    // Use a light background for the 3D scene to match the white glass UI
    const bgColor = '#f0f2f5';
    const bgColorHex = parseInt(bgColor.replace('#', ''), 16);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(bgColorHex);
    this.scene.fog = new THREE.Fog(bgColorHex, 35, 70);

    // Ensure container has valid dimensions; use fallback if hidden
    let w = this.container.clientWidth;
    let h = this.container.clientHeight;
    if (!w || !h) {
      w = window.innerWidth;
      h = window.innerHeight;
    }

    const aspect = w / h;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.set(0, 16, 14);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setClearColor(bgColorHex, 1);

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

    this.setupLighting();
    this.createBoard(theme);
    this.createStonesGroup();
    this.createEffectsGroup();
    this.createCoordGroup();
    this.createHoverMesh();

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xB8CCE6, 0.4);
    fillLight.position.set(-8, 6, -6);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFFE8C8, 0.3);
    rimLight.position.set(0, 4, -12);
    this.scene.add(rimLight);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xC8CCE0, 0.4);
    this.scene.add(hemi);
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

    // Board base
    const boardGeom = new THREE.BoxGeometry(size + margin * 2, boardThickness, size + margin * 2);
    const boardColorStr = theme.boardColor || '#E8D5B7';
    const boardColorHex = typeof boardColorStr === 'string' ? parseInt(boardColorStr.replace('#', ''), 16) : boardColorStr;
    const boardMat = new THREE.MeshStandardMaterial({
      color: boardColorHex,
      roughness: theme.boardRoughness || 0.6,
      metalness: theme.boardMetalness || 0.05
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
      star.position.set(this.gridToWorld(col), 0.02, this.gridToWorld(row));
      this.boardGroup.add(star);
    });

    // Board edge bevel (decorative rim)
    const edgeGeom = new THREE.BoxGeometry(size + margin * 2 + 0.1, 0.05, size + margin * 2 + 0.1);
    const accentColorStr = theme.accentColor || '#4A90D9';
    const accentColorHex = typeof accentColorStr === 'string' ? parseInt(accentColorStr.replace('#', ''), 16) : accentColorStr;
    const edgeMat = new THREE.MeshStandardMaterial({
      color: accentColorHex,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.4
    });
    const edge = new THREE.Mesh(edgeGeom, edgeMat);
    edge.position.y = 0.02;
    this.boardGroup.add(edge);

    // Contact shadow plane
    const shadowGeom = new THREE.PlaneGeometry(40, 40);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -boardThickness;
    shadowPlane.receiveShadow = true;
    this.boardGroup.add(shadowPlane);

    this.scene.add(this.boardGroup);
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
    const geom = new THREE.SphereGeometry(0.42, 32, 32);
    const isBlack = color === 1;
    const mat = new THREE.MeshStandardMaterial({
      color: isBlack ? 0x1a1a1a : 0xf5f5f5,
      roughness: isBlack ? 0.25 : 0.35,
      metalness: isBlack ? 0.4 : 0.15,
      envMapIntensity: 1.0
    });
    const stone = new THREE.Mesh(geom, mat);
    stone.castShadow = true;
    stone.receiveShadow = true;
    stone.position.set(this.gridToWorld(col), 0.42, this.gridToWorld(row));
    stone.scale.set(0.01, 0.01, 0.01);

    this.stonesGroup.add(stone);
    this.stones.push({ row, col, color, mesh: stone });

    // Animate drop
    const startY = 5;
    stone.position.y = startY;
    const animData = {
      mesh: stone,
      startTime: performance.now(),
      duration: 300,
      startScale: 0.01,
      endScale: 1,
      startY: startY,
      endY: 0.42
    };
    this.moveAnimations.push(animData);

    // Squash effect
    setTimeout(() => {
      if (stone.scale.x > 0.5) {
        stone.scale.y = 0.7;
        setTimeout(() => {
          if (stone.parent) stone.scale.y = 1;
        }, 100);
      }
    }, 300);

    this.lastStone = { row, col, color, mesh: stone };
    return stone;
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
    const isBlack = color === 1;
    this.hoverMesh.material.color.setHex(isBlack ? 0x1a1a1a : 0xf5f5f5);
    this.hoverMesh.material.opacity = 0.4;
  }

  hideHover() {
    if (this.hoverMesh) this.hoverMesh.visible = false;
  }

  showLastMoveMarker(row, col) {
    // Hide previous marker
    if (this.lastStone && this.lastStone.mesh) {
      // Add a ring marker
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

      // Remove old markers
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

    // Add glow particles along the line
    positions.forEach(p => {
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
    });
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
  }

  setTheme(theme) {
    this.theme = theme;
    // Keep light 3D background to match white glass UI
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

    const size = (this.boardSize - 1) * this.cellSize;
    const margin = 1.2;
    const boardTop = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(boardTop, point);

    return this.worldToGrid(point.x, point.z);
  }

  animate() {
    requestAnimationFrame(this.animate);
    if (!this.renderer) return;

    const now = performance.now();

    // Process stone drop animations
    this.moveAnimations = this.moveAnimations.filter(anim => {
      const elapsed = now - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      anim.mesh.scale.setScalar(anim.startScale + (anim.endScale - anim.startScale) * ease);
      anim.mesh.position.y = anim.startY + (anim.endY - anim.startY) * ease;
      return t < 1;
    });

    // Animate win glows
    if (this.effectsGroup) {
      this.effectsGroup.children.forEach(child => {
        if (child.userData.isWinGlow) {
          const elapsed = (now - child.userData.startTime) / 1000;
          const pulse = Math.sin(elapsed * 3) * 0.5 + 0.5;
          child.material.opacity = 0.2 + pulse * 0.3;
          child.scale.setScalar(1 + pulse * 0.2);
        }
      });
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
    if (this.renderer) {
      this.renderer.dispose();
      // Canvas stays in DOM; just clean up GL context
      this.renderer.forceContextLoss();
    }
  }
}

if (typeof window !== 'undefined') {
  window.RenderEngine = RenderEngine;
}
