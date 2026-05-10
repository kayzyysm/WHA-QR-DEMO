import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';

const SceneManager = ({ viewMode }) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (viewMode === 'focus') {
      // ซูมเข้าไปที่จุดศูนย์กลาง [0, 3, 0]
      gsap.to(camera.position, { x: 5, y: 6, z: 5, duration: 1.5, ease: "power2.inOut" });
      if (controls) {
        gsap.to(controls.target, { x: 0, y: 3, z: 0, duration: 1.5, onUpdate: () => controls.update() });
      }
    } else {
      // กลับไปที่มุมมองกว้าง
      gsap.to(camera.position, { x: 8, y: 20, z: 8, duration: 1.5, ease: "power2.inOut" });
      if (controls) {
        gsap.to(controls.target, { x: 0, y: 3, z: 0, duration: 1.5, onUpdate: () => controls.update() });
      }
    }
  }, [viewMode, camera, controls]);

  return null;
};

export default SceneManager;