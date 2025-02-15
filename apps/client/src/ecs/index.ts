import { Schedule } from "directed";
import { createActions, createWorld, World, type Entity } from "koota";
import { flipSystem, holdSystem } from "./systems";
import { Flippable, Holdable, Hoverable, NetworkAuthority } from "./traits";
import { Quaternion, Vector3 } from "three";

export const world = createWorld();

export const schedule = new Schedule<{ world: World; delta: number }>();
schedule.add(flipSystem);
schedule.add(holdSystem);
schedule.build();

export const actions = createActions((world) => ({
  spawnCard: (init: {
    networkAuthority: { user: string };
    transform?: { position?: Vector3; rotation?: Quaternion };
  }) => {
    const { networkAuthority: owner, transform } = init;

    return world.spawn(
      NetworkAuthority(owner),
      Flippable({
        flipped: false,
      }),
      Holdable({
        held: false,
        user: "",
      }),
      Hoverable({
        hovered: false,
      }),
    );
  },
  destroyCard: (entity: Entity) => {
    entity.destroy();
  },
  toggleGrabEntity: (entity: Entity, user: string) => {
    if (!entity.has(Holdable)) {
      return;
    }

    entity.set(Holdable, (prev) => {
      return {
        held: !prev.held,
        user: user,
      };
    });
  },
  flipEntity: (entity: Entity) => {
    if (!entity.has(Flippable)) {
      return;
    }

    entity.set(Flippable, (prev) => {
      return {
        flipped: !prev.flipped,
      };
    });
  },
}));
