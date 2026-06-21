import { useEffect, useRef, useState, useCallback } from 'react';

export default function HeroScene() {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const handleResize = useCallback(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const camera = el._camera;
    const renderer = el._renderer;
    if (!camera || !renderer) return;
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  }, []);

  useEffect(() => {
    let frame;
    let mounted = true;

    async function init() {
      const THREE = await import('three');
      const gsapModule = await import('gsap');
      const gsap = gsapModule.default || gsapModule;

      const container = containerRef.current;
      const canvasCont = canvasContainerRef.current;
      if (!container || !canvasCont) return;

      // Fake loader animation via GSAP
      const progressObj = { value: 0 };
      gsap.to(progressObj, {
        value: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (!mounted) return;
          setProgress(Math.round(progressObj.value));
        },
        onComplete: () => {
          if (!mounted) return;
          const tl = gsap.timeline();
          tl.to('#loader-bar', { width: '100%', duration: 0.5, ease: 'power3.inOut' }, '-=2')
            .to('#preloader', { y: '-100%', duration: 1.2, ease: 'expo.inOut' })
            .to('.main-title', { y: '0%', duration: 1.5, stagger: 0.1, ease: 'expo.out' }, '-=0.6')
            .to('.ui-element', { opacity: 1, duration: 1.5, stagger: 0.1, ease: 'power3.out' }, '-=1')
            .call(() => setLoaded(true));
        },
      });

      // Three.js scene (from the user's HTML)
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#030712');
      scene.fog = new THREE.FogExp2('#030712', 0.015);

      const camera = new THREE.PerspectiveCamera(50, canvasCont.clientWidth / canvasCont.clientHeight, 0.1, 1000);
      camera.position.set(0, 10, 45);

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(canvasCont.clientWidth, canvasCont.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasCont.appendChild(renderer.domElement);
      canvasCont._camera = camera;
      canvasCont._renderer = renderer;

      scene.add(new THREE.AmbientLight('#030712', 2));
      const dirLight = new THREE.DirectionalLight('#ffffff', 2);
      dirLight.position.set(20, 40, 20);
      scene.add(dirLight);

      // Terrain noise
      function getRidgeNoise(x, z) {
        let y = 0;
        const amplitude = 4.0;
        const frequency = 0.05;
        const noise1 = Math.sin(x * frequency) * Math.cos(z * frequency);
        y += Math.abs(noise1) * amplitude;
        const noise2 = Math.sin(x * frequency * 2.5 + z * frequency * 2) * 0.5;
        y += Math.abs(noise2) * (amplitude * 0.5);
        return -y + 6;
      }

      const geometry = new THREE.PlaneGeometry(160, 160, 100, 100);
      geometry.rotateX(-Math.PI / 2);
      const posAttribute = geometry.attributes.position;
      const vertexData = [];
      for (let i = 0; i < posAttribute.count; i++) {
        vertexData.push({ x: posAttribute.getX(i), z: posAttribute.getZ(i) });
      }

      const terrainMaterial = new THREE.MeshStandardMaterial({
        color: '#030712',
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true,
      });
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });

      const terrain = new THREE.Mesh(geometry, terrainMaterial);
      const wireframe = new THREE.Mesh(geometry, wireMaterial);
      wireframe.position.y = 0.05;
      terrain.add(wireframe);
      terrain.rotation.x = 0.1;
      scene.add(terrain);

      // Particles
      const pGeo = new THREE.BufferGeometry();
      const pCount = 600;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 100;
        pPos[i + 1] = Math.random() * 30;
        pPos[i + 2] = (Math.random() - 0.5) * 100;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.1,
        color: '#ffffff',
        transparent: true,
        opacity: 0.4,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      window.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) * 0.0002;
        targetY = (e.clientY - window.innerHeight / 2) * 0.0002;
      });

      function animate() {
        if (!mounted) return;
        frame = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;
        camera.position.x = mouseX * 15;
        camera.position.y = 10 - mouseY * 15;
        camera.lookAt(0, 2, 0);

        for (let i = 0; i < posAttribute.count; i++) {
          const data = vertexData[i];
          const zOffset = data.z - time * 4;
          let y = getRidgeNoise(data.x, zOffset);
          const dist = Math.sqrt(data.x * data.x + data.z * data.z);
          if (dist < 15) {
            y *= dist / 15;
          }
          posAttribute.setY(i, y);
        }
        posAttribute.needsUpdate = true;
        geometry.computeVertexNormals();

        particles.position.y = Math.sin(time * 0.2) * 2;
        particles.rotation.y = time * 0.03;

        renderer.render(scene, camera);
      }
      animate();
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#030712]">
      {/* WebGL Canvas */}
      <div ref={canvasContainerRef} id="webgl-canvas" className="absolute inset-0" />

      {/* Vignette */}
      <div className="vignette absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 20%, #030712 120%)',
      }} />

      {/* Preloader */}
      {!loaded && (
        <div id="preloader" className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]">
          <div className="overflow-hidden">
            <div id="loader-text" className="text-6xl font-bold tracking-tighter text-white">{progress}%</div>
          </div>
          <div className="mt-6 h-[1px] w-48 bg-white/20 relative overflow-hidden">
            <div id="loader-bar" className="absolute top-0 left-0 h-full w-0 bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-screen px-4 text-center pointer-events-none transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="overflow-hidden mb-2">
          <span className="main-title translate-y-full block text-[10px] md:text-xs uppercase tracking-[0.6em] text-gray-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            Engineering the Future
          </span>
        </div>
        <div className="overflow-hidden">
          <h1 className="main-title translate-y-full text-7xl md:text-[10rem] font-bold tracking-tighter uppercase leading-[0.85]" style={{ mixBlendMode: 'difference', color: '#ffffff' }}>
            ELEVATE
          </h1>
        </div>
        <div className="overflow-hidden mt-8 max-w-lg">
          <p className="main-title translate-y-full text-xs md:text-sm text-gray-400 leading-relaxed font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
            We craft digital experiences that transcend boundaries. Merging stark #030712 aesthetics with mathematical precision.
          </p>
        </div>
        <div className="mt-12 pointer-events-auto ui-element opacity-0">
          <button className="relative px-8 py-3 bg-white text-[#030712] text-[10px] uppercase font-bold tracking-[0.2em] overflow-hidden group" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Initialize</span>
            <div className="absolute inset-0 bg-[#030712] border border-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="ui-element opacity-0 absolute top-0 left-0 w-full z-20 flex justify-between items-center px-8 py-8 pointer-events-auto" style={{ mixBlendMode: 'difference' }}>
        <div className="text-sm font-bold tracking-[0.3em] uppercase">Studio.X</div>
        <div className="text-xs uppercase tracking-[0.2em] font-medium hover:text-gray-400 cursor-pointer transition-colors">Contact</div>
      </header>

      {/* Sidebar links */}
      <aside className="ui-element opacity-0 absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-6 text-[10px] tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', mixBlendMode: 'difference' }}>
        <span className="hover:text-gray-400 transition-colors cursor-pointer">Twitter</span>
        <span className="hover:text-gray-400 transition-colors cursor-pointer">GitHub</span>
      </aside>

      {/* Scroll indicator */}
      <div className="ui-element opacity-0 absolute bottom-8 right-8 z-20 flex items-center gap-4" style={{ mixBlendMode: 'difference' }}>
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll down</span>
        <div className="w-12 h-[1px] bg-white/30 relative overflow-hidden">
          <div className="scroll-anim absolute top-0 left-0 w-full h-full bg-white" />
        </div>
      </div>

      {/* CSS for scroll animation */}
      <style>{`
        @keyframes scrollLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .scroll-anim {
          animation: scrollLine 1.5s ease-in-out infinite;
        }
        .main-title {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}