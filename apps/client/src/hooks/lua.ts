import { useEffect, useState } from "react";
import { LuaEngine, LuaFactory } from "wasmoon";

export function useLua(scriptUrl: string, onLoaded?: (lua: LuaEngine) => void) {
  const [lua, setLua] = useState<LuaEngine | null>(null);

  useEffect(() => {
    const factory = new LuaFactory();
    Promise.all([
      factory.createEngine(),
      fetch(scriptUrl).then((res) => res.text()),
    ]).then(([lua, script]) => {
      return lua.doString(script).then(() => {
        setLua(lua);
        onLoaded?.(lua);
      });
    });
  }, [scriptUrl, onLoaded]);

  return lua;
}
