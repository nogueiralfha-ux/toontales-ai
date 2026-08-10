import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const VeggieCup3DField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [lastAction, setLastAction] = useState<string>('Arena pronta! Faça seu chute inicial!');

  const ballRef = useRef<THREE.Mesh | null>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  
  // Constantes Físicas do Jogo
  const GRAVITY = -9.8; 
  const FRICTION = 0.98; 
  const RESTITUTION = 0.72; 
  const BALL_RADIUS = 0.5;

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. CENA & CONFIGURAÇÃO DE CÂMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0d10');

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 0, 0);

    // 2. RENDERIZADOR
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 3. ILUMINAÇÃO: Refletores do Estádio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Luz de Refletor 1 (Branco Quente)
    const spotlight1 = new THREE.SpotLight(0xffffff, 1.2);
    spotlight1.position.set(15, 18, 15);
    spotlight1.angle = Math.PI / 4;
    spotlight1.penumbra = 0.3;
    spotlight1.castShadow = true;
    scene.add(spotlight1);

    // Luz de Refletor 2 (Azul Ciano Esportivo)
    const spotlight2 = new THREE.SpotLight(0x00f5ff, 0.8);
    spotlight2.position.set(-15, 18, -15);
    spotlight2.angle = Math.PI / 4;
    spotlight2.penumbra = 0.3;
    scene.add(spotlight2);

    // 4. GRAMADO DO ESTÁDIO (Pitch)
    const pitchGeo = new THREE.PlaneGeometry(30, 20);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: '#1e3f20', // Verde escuro profissional
      roughness: 0.9,
      metalness: 0.1
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Linhas de Cal
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const centerLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.01, -10),
      new THREE.Vector3(0, 0.01, 10)
    ]);
    const centerLine = new THREE.Line(centerLineGeo, lineMat);
    scene.add(centerLine);

    const circleGeo = new THREE.RingGeometry(3.5, 3.6, 32);
    const circle = new THREE.Mesh(circleGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.01;
    scene.add(circle);

    // Linhas Laterais
    const borderGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-15, 0.01, -10),
      new THREE.Vector3(15, 0.01, -10),
      new THREE.Vector3(15, 0.01, 10),
      new THREE.Vector3(-15, 0.01, 10),
      new THREE.Vector3(-15, 0.01, -10)
    ]);
    const border = new THREE.Line(borderGeo, lineMat);
    scene.add(border);

    // 5. POSTES DE REFLETORES 3D (CANTOS DO CAMPO)
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 12, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const positions = [
      [-16, 6, -11],
      [16, 6, -11],
      [-16, 6, 11],
      [16, 6, 11]
    ];
    positions.forEach(pos => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos[0], pos[1], pos[2]);
      scene.add(pole);

      // Caixa de refletores no topo
      const boxGeo = new THREE.BoxGeometry(1.5, 0.8, 1);
      const boxMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      const lightBox = new THREE.Mesh(boxGeo, boxMat);
      lightBox.position.set(pos[0], pos[1] + 6, pos[2]);
      scene.add(lightBox);
    });

    // 6. MAQUETE DA ARQUIBANCADA (Torcida Volumétrica 3D)
    // Criamos anéis de blocos simulando a torcida (Verde/Laranja) nas arquibancadas
    const crowdGeo = new THREE.BoxGeometry(1, 0.6, 1);
    const orangeMat = new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.5 });
    const greenMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.5 });

    // Arquibancadas de fundo e laterais
    for (let x = -18; x <= 18; x += 3) {
      // Arquibancada Superior Norte (z = -12)
      const seatN = new THREE.Mesh(crowdGeo, Math.random() > 0.5 ? orangeMat : greenMat);
      seatN.position.set(x, 1, -12);
      scene.add(seatN);

      // Arquibancada Superior Sul (z = 12)
      const seatS = new THREE.Mesh(crowdGeo, Math.random() > 0.5 ? orangeMat : greenMat);
      seatS.position.set(x, 1, 12);
      scene.add(seatS);
    }

    // 7. TRAVES E REDE (GOL 3D)
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 });
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8);
    
    // Poste Esquerdo do Gol da Esquerda
    const leftPostL = new THREE.Mesh(postGeo, postMat);
    leftPostL.position.set(-15, 1.75, -2.5);
    scene.add(leftPostL);

    // Poste Direito do Gol da Esquerda
    const leftPostR = new THREE.Mesh(postGeo, postMat);
    leftPostR.position.set(-15, 1.75, 2.5);
    scene.add(leftPostR);

    // Travessão do Gol da Esquerda
    const crossbarGeo = new THREE.CylinderGeometry(0.12, 0.12, 5, 8);
    const leftCrossbar = new THREE.Mesh(crossbarGeo, postMat);
    leftCrossbar.rotation.z = Math.PI / 2;
    leftCrossbar.position.set(-15, 3.5, 0);
    scene.add(leftCrossbar);

    // 8. BOLA DE FUTEBOL COM FÍSICA
    const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, BALL_RADIUS, 0);
    ball.castShadow = true;
    scene.add(ball);
    ballRef.current = ball;

    // 9. ANIMATION LOOP & PHYSICS
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = Math.min(0.03, clock.getDelta());

      if (ball) {
        if (ball.position.y > BALL_RADIUS) {
          velocityRef.current.y += GRAVITY * delta;
        }

        // Aplica velocidade à posição
        ball.position.addScaledVector(velocityRef.current, delta);

        // Físicas de colisão no solo
        if (ball.position.y <= BALL_RADIUS) {
          ball.position.y = BALL_RADIUS;
          if (Math.abs(velocityRef.current.y) > 0.2) {
            velocityRef.current.y = -velocityRef.current.y * RESTITUTION;
          } else {
            velocityRef.current.y = 0;
          }

          // Fricção de arrasto horizontal do gramado
          velocityRef.current.x *= FRICTION;
          velocityRef.current.z *= FRICTION;
        }

        // Colisões com traves e limites
        if (ball.position.x >= 15) {
          ball.position.x = 15;
          velocityRef.current.x = -velocityRef.current.x * RESTITUTION;
        }
        if (ball.position.x <= -15) {
          // Checagem de Gol! (entre as traves z: -2.5 a 2.5 e altura menor que 3.5)
          if (ball.position.z >= -2.5 && ball.position.z <= 2.5 && ball.position.y < 3.5) {
            setLastAction('⚽ GOOOOOL! A bola estufou as redes da maquete 3D!');
            ball.position.set(0, 5, 0); // Spawna no alto
            velocityRef.current.set(0, 0, 0);
          } else {
            ball.position.x = -15;
            velocityRef.current.x = -velocityRef.current.x * RESTITUTION;
          }
        }
        if (ball.position.z >= 10) {
          ball.position.z = 10;
          velocityRef.current.z = -velocityRef.current.z * RESTITUTION;
        }
        if (ball.position.z <= -10) {
          ball.position.z = -10;
          velocityRef.current.z = -velocityRef.current.z * RESTITUTION;
        }

        // Rotação visual real
        ball.rotation.z -= (velocityRef.current.x * delta) / BALL_RADIUS;
        ball.rotation.x += (velocityRef.current.z * delta) / BALL_RADIUS;

        setBallVelocity({
          x: parseFloat(velocityRef.current.x.toFixed(2)),
          y: parseFloat(velocityRef.current.y.toFixed(2)),
          z: parseFloat(velocityRef.current.z.toFixed(2))
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  const handleKickBomba = () => {
    velocityRef.current.set(
      -20 - Math.random() * 5, 
      7 + Math.random() * 3,   
      (Math.random() - 0.5) * 8 
    );
    setLastAction('🚀 CHUTE BOMBA! O atleta soltou uma paulada rumo ao travessão!');
  };

  const handlePassEfeito = () => {
    velocityRef.current.set(
      -12 - Math.random() * 3,
      9 + Math.random() * 2,
      (Math.random() - 0.5) * 14 
    );
    setLastAction('📐 CURVA/CRUZAMENTO! Bola alçada na grande área com efeito.');
  };

  const handleResetBall = () => {
    if (ballRef.current) {
      ballRef.current.position.set(0, BALL_RADIUS, 0);
      velocityRef.current.set(0, 0, 0);
      setLastAction('🔄 BOLA REINICIADA no centro do gramado da Veggie Arena!');
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* 3D RENDERER CONTAINER */}
      <div 
        ref={containerRef} 
        className="w-full h-[400px] bg-slate-950 rounded-3xl border-2 border-emerald-500/20 overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl max-w-sm backdrop-blur">
          <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">VEGGIE 3D ARENA (V1.1)</div>
          <div className="text-xs text-yellow-400 font-bold mt-1 font-mono">{lastAction}</div>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl backdrop-blur font-mono text-[10px] text-slate-300">
          <div>VEL_X: <span className="text-emerald-400 font-bold">{ballVelocity.x} m/s</span></div>
          <div>VEL_Y: <span className="text-emerald-400 font-bold">{ballVelocity.y} m/s</span></div>
          <div>VEL_Z: <span className="text-emerald-400 font-bold">{ballVelocity.z} m/s</span></div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleKickBomba}
          className="py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          💥 CHUTAR (Bomba no Ângulo)
        </button>

        <button
          onClick={handlePassEfeito}
          className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          📐 PASSAR (Cruzamento Elevado)
        </button>

        <button
          onClick={handleResetBall}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all active:scale-95"
        >
          🔄 CENTRALIZAR BOLA
        </button>
      </div>

    </div>
  );
};
export default VeggieCup3DField;
