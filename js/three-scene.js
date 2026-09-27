/**
 * RescuRoute AI - Fullscreen Pure 3D Image Engine
 * Scales the user's exact 3D background image plane to cover 100% of the viewport
 * edge-to-edge on any screen resolution, with interactive 3D motion.
 * Last Updated: 2026-09-27 (Twilio REST API & Auto-SOS Dispatch Grid)
 */

class ThreeSceneEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Scene & Renderer Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe0f2fe);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 50);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    // 3D Image Mesh Plane
    this.imageMesh = null;
    this.texture = null;
    this.clock = new THREE.Clock();

    // Camera target positions for 3D modes
    this.cameraMode = "CHASE";
    this.targetRotX = 0;
    this.targetRotY = 0;

    // Load exact image
    this.init3DImagePlane();

    // Mouse Interaction
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("resize", () => this.onWindowResize());

    // Start Animation Loop
    this.animate();
  }

  init3DImagePlane() {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load('assets/background_hd.png', (texture) => {
      this.texture = texture;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Base geometry plane
      const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
      
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      this.imageMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.imageMesh);

      // Fit plane to cover 100% of screen view
      this.fitPlaneToScreen();
    });
  }

  fitPlaneToScreen() {
    if (!this.imageMesh || !this.texture) return;

    // Calculate exact camera frustum size at z = 0
    const distance = this.camera.position.z;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
    const visibleWidth = visibleHeight * this.camera.aspect;

    const imgAspect = this.texture.image.width / this.texture.image.height;
    const screenAspect = this.width / this.height;

    let scaleX, scaleY;

    // "cover" math: fill entire viewport without leaving blank borders
    if (screenAspect > imgAspect) {
      scaleX = visibleWidth;
      scaleY = visibleWidth / imgAspect;
    } else {
      scaleY = visibleHeight;
      scaleX = visibleHeight * imgAspect;
    }

    // Over-scale slightly (1.06) to allow smooth 3D tilt without showing screen edges
    this.imageMesh.scale.set(scaleX * 1.06, scaleY * 1.06, 1);
  }

  onMouseMove(e) {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    this.targetRotY = mouseX * 0.12;
    this.targetRotX = -mouseY * 0.10;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.imageMesh) {
      this.imageMesh.rotation.y += (this.targetRotY - this.imageMesh.rotation.y) * 0.08;
      this.imageMesh.rotation.x += (this.targetRotX - this.imageMesh.rotation.x) * 0.08;
      this.imageMesh.position.z = Math.sin(time * 0.8) * 0.3;
    }

    if (this.cameraMode === "CHASE") {
      this.camera.position.lerp(new THREE.Vector3(0, 0, 50), 0.05);
    } else if (this.cameraMode === "OVERHEAD") {
      this.camera.position.lerp(new THREE.Vector3(0, 3, 55), 0.05);
    } else if (this.cameraMode === "ORBIT") {
      this.camera.position.lerp(new THREE.Vector3(Math.sin(time * 0.5) * 6, Math.cos(time * 0.5) * 3, 45), 0.05);
    }

    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  }

  setCameraMode(mode) { this.cameraMode = mode; }

  startDriving() {}
  pauseDriving() {}
  resetAmbulance() {}
  setRouteColor() {}
  dispatchTowTruckAnimation() {}
  clearObstructionAnimation() {}

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.fitPlaneToScreen();
  }
}
