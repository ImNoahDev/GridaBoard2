import { useState } from "react";

/**
 * usage:
 *    const forceUpdate = useForceUpdate();
 *    forceUpdate();
 *
 * @export
 * @return {*}
 */
export function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}
