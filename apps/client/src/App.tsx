import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import Controls from "./input/Controls";
import Game from "./Game";
import { WorldProvider } from "koota/react";
import { world } from "./ecs";

function App() {
  return (
    <div id="canvas-container" className="h-full w-full flex">
      <WorldProvider world={world}>
        <Controls>
          <Canvas
            camera={{ position: [0, 10, 10], rotation: [-Math.PI / 4, 0, 0] }}
          >
            <Suspense>
              <Physics>
                <Game />
              </Physics>
            </Suspense>
          </Canvas>
        </Controls>
      </WorldProvider>
    </div>
  );
}

export default App;
