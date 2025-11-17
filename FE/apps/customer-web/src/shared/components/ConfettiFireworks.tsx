import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { CreateTypes } from 'canvas-confetti';

interface ConfettiFireworksProps {
  fireOnMount?: boolean;
}

export default function ConfettiFireworks({ fireOnMount = true }: ConfettiFireworksProps) {
  const animationInstance = useRef<CreateTypes | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!fireOnMount) return;

    // canvas-confetti 인스턴스 생성
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    animationInstance.current = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const makeShot = (particleRatio: number, opts: object) => {
      if (animationInstance.current) {
        animationInstance.current({
          ...opts,
          origin: { y: 0.6 }, // 0.8에서 0.6으로 변경 (더 위에서 발사)
          particleCount: Math.floor(200 * particleRatio),
        });
      }
    };

    const fire = () => {
      // 다양한 크기와 속도로 여러 번 발사하여 더 화려한 폭죽 효과
      makeShot(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      makeShot(0.2, {
        spread: 20,
      });

      makeShot(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      makeShot(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      makeShot(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    };

    // 마운트 시 자동으로 폭죽 발사 (여러 번 발사해서 더 강렬하게)
    // 즉시 한 번 발사
    fire();
    
    // 약간의 딜레이 후 추가 발사 (폭발 효과)
    // const timer1 = window.setTimeout(() => fire(), 100);
    // const timer2 = window.setTimeout(() => fire(), 200);
    // timersRef.current = [timer1, timer2];

    return () => {
      // 모든 타이머 정리
    //   timersRef.current.forEach(timer => clearTimeout(timer));
    //   timersRef.current = [];
      
      // canvas 정리
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
      animationInstance.current = null;
    };
  }, [fireOnMount]);

  return null;
}

