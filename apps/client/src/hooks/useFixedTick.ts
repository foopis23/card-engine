import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function useFixedTick(
  updatesPerSecond: number,
  tick: Parameters<typeof useFrame>[0],
) {
  const frameTimeMS = (1 / updatesPerSecond) * 1000;
  const deltaTimeInSeconds = 1 / updatesPerSecond;
  const lastUpdate = useRef(Date.now());

  useFrame((...args) => {
    while (Date.now() - lastUpdate.current >= frameTimeMS) {
      const elapsedTime = Date.now() - lastUpdate.current;
      const overflow = Math.max(elapsedTime - frameTimeMS, 0);
      lastUpdate.current = Date.now() - overflow;

      tick(args[0], deltaTimeInSeconds, args[1]);
    }
  });
}
