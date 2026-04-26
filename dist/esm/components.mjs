import { getPortal } from "./portalState.mjs";
import { Fragment, jsx } from "react/jsx-runtime";
function NativePortal({
  hostName = "root",
  children
}) {
  const state = getPortal().state;
  if (state.type !== "teleport") return null;
  const {
    Portal
  } = globalThis.__gui_teleport;
  return /* @__PURE__ */jsx(Portal, {
    hostName,
    children
  });
}
function NativePortalHost({
  name
}) {
  const state = getPortal().state;
  if (state.type !== "teleport") return null;
  const {
    PortalHost
  } = globalThis.__gui_teleport;
  return /* @__PURE__ */jsx(PortalHost, {
    name
  });
}
function NativePortalProvider({
  children
}) {
  const state = getPortal().state;
  if (state.type !== "teleport") return /* @__PURE__ */jsx(Fragment, {
    children
  });
  const {
    PortalProvider
  } = globalThis.__gui_teleport;
  return /* @__PURE__ */jsx(PortalProvider, {
    children
  });
}
export { NativePortal, NativePortalHost, NativePortalProvider };
//# sourceMappingURL=components.mjs.map
