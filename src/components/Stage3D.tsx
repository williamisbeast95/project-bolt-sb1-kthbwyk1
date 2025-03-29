import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface MovingHeadProps {
  position: [number, number, number];
  active: boolean;
  color: string;
  strobe?: boolean;
}

interface LaserProps {
  position: [number, number, number];
  active: boolean;
  color: string;
  pattern: 'sweep' | 'circle' | 'starburst';
}

interface Stage3DProps {
  movingHeads: MovingHeadProps[];
  strobes: any[];
  lasers: LaserProps[];
  blinders: any[];
  co2Jets: any[];
  ledBars: any[];
  bpm: number;
}

const MovingHead = ({ position, active, color, strobe }: MovingHeadProps) => {
  const headRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (headRef.current && beamRef.current && active) {
      const time = clock.getElapsedTime();
      headRef.current.rotation.y = time * 2;
      beamRef.current.rotation.y = time * 2;
      if (strobe) {
        const material = beamRef.current.material as THREE.MeshStandardMaterial;
        material.opacity = Math.sin(time * 50) * 0.5 + 0.5;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={headRef}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={active ? color : 'gray'} />
      </mesh>
      {active && (
        <mesh ref={beamRef} position={[0, -2, 0]}>
          <coneGeometry args={[1, 4, 32]} />
          <meshStandardMaterial 
            color={color} 
            transparent={true} 
            opacity={0.3} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  );
};

const Laser = ({ position, active, color, pattern }: LaserProps) => {
  const laserRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (laserRef.current && active) {
      const time = clock.getElapsedTime();
      switch (pattern) {
        case 'sweep':
          laserRef.current.rotation.y = Math.sin(time * 2) * Math.PI;
          break;
        case 'circle':
          laserRef.current.rotation.z = time * 2;
          break;
        case 'starburst':
          laserRef.current.rotation.z = Math.sin(time * 10) * Math.PI / 4;
          break;
      }
    }
  });

  return active ? (
    <mesh ref={laserRef} position={position}>
      <cylinderGeometry args={[0.01, 0.01, 10, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2} 
      />
    </mesh>
  ) : null;
};

const Stage = ({ movingHeads, lasers }: Stage3DProps) => {
  return (
    <>
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {movingHeads.map((head, i) => (
        <MovingHead 
          key={i} 
          position={[-3 + (i * 2), 2, -2]} 
          active={head.active} 
          color={head.color} 
          strobe={head.strobe} 
        />
      ))}

      {lasers.map((laser, i) => (
        <Laser 
          key={i} 
          position={[-2 + (i * 4), 1.5, -2.5]} 
          active={laser.active} 
          color={laser.color} 
          pattern={laser.pattern} 
        />
      ))}

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 4, 0]} intensity={0.5} />
    </>
  );
};

const Stage3D: React.FC<Stage3DProps> = (props) => {
  return (
    <div className="w-full h-[400px] bg-black rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 3, 5]} 
        />
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Stage {...props} />
      </Canvas>
    </div>
  );
};

export default Stage3D;