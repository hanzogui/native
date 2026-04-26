import { getSafeArea } from "./safeAreaState.mjs";
function setup() {
  if (true) {
    return;
  }
  const g = globalThis;
  if (g.__gui_native_safe_area_setup_complete) {
    return;
  }
  g.__gui_native_safe_area_setup_complete = true;
  try {
    const safeAreaContext = require("react-native-safe-area-context");
    const {
      useSafeAreaInsets,
      useSafeAreaFrame,
      initialWindowMetrics
    } = safeAreaContext;
    if (useSafeAreaInsets) {
      getSafeArea().set({
        enabled: true,
        useSafeAreaInsets,
        useSafeAreaFrame: useSafeAreaFrame || null,
        initialMetrics: initialWindowMetrics || null
      });
    }
  } catch {}
}
setup();
//# sourceMappingURL=setup-safe-area.mjs.map
