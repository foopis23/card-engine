import { useEffect } from "react";
import Table from "./entities/Table";
import { ACTIONS } from "./input/Actions";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useActions, useQuery } from "koota/react";
import { actions, schedule, world } from "./ecs";
import { getUserId } from "./util/userId";
import {
  MainCamera,
  NetworkAuthority,
  Pointer,
} from "./ecs/traits";
import { Card2 } from "./entities/Card/Card2";

export default function Game() {
  const [onKeyboardEvent] = useKeyboardControls<ACTIONS>();

  const { camera, pointer } = useThree();
  const { spawnCard } = useActions(actions);

  useEffect(() => {
    world.add(Pointer({ pos: pointer }));
  }, []);

  useEffect(() => {
    world.add(MainCamera({ camera: camera }));

    return () => {
      world.remove(MainCamera);
    };
  }, [camera]);

  useEffect(
    () =>
      onKeyboardEvent(
        (state) => state.spawn,
        (pressed) => {
          if (pressed) {
            spawnCard({
              networkAuthority: { user: getUserId() },
            });
          }
        },
      ),
    [onKeyboardEvent],
  );

  useFrame((_root, delta) => {
    const worldPointer = world.get(Pointer);
    if (worldPointer) {
      worldPointer.pos = pointer;
    }
    schedule.run({ world: world, delta: delta });
  });

  const cards = useQuery(NetworkAuthority);

  return (
    <>
      {cards.map((card) => (
        <Card2 key={card.id().toString()} entity={card} />
      ))}
      <Table position={[0, -1, 0]} size={[40, 1, 40]} />
    </>
  );
}
