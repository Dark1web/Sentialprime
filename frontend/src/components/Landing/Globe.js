import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Globe = () => {
  const globeRef = useRef();
  const robotRef = useRef();
  const gltf = useLoader(GLTFLoader, '/robot/scene.gltf');

  useEffect(() => {
    if (gltf) {
      robotRef.current = gltf.scene;
      robotRef.current.scale.set(0.5, 0.5, 0.5);
      robotRef.current.position.set(2, 0, 0);
    }
  }, [gltf]);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <Sphere ref={globeRef} args={[2, 32, 32]}>
        <MeshDistortMaterial
          color="#0077ff"
          attach="material"
          distort={0.3}
          speed={1}
        />
      </Sphere>
      {robotRef.current && <primitive object={robotRef.current} />}
    </group>
  );
};

export default Globe;