import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Physics } from "@react-three/rapier";
import Controls from "./input/Controls";
import Game from "./Game";
import { WorldProvider } from "koota/react";
import { world } from "./ecs";
import { Button } from "./components/ui/button";
import { setHost, socket } from "./socket";

function App() {
  const [lobby, setLobby] = useState(false);

  function join() {
    setLobby(true);
    setHost(false);
    socket.emit("requestSyncState");
  }

  function host() {
    setLobby(true);
    setHost(true);
  }

  if (!lobby) {
    return (
      <div className="flex h-full w-full justify-center items-center">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl">Card Engine</h1>
          <Button onClick={host}>Host</Button>
          <Button onClick={join}>Join</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="canvas-container" className="flex h-full w-full">
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
    </>

  );
}

export default App;
