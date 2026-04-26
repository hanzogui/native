"use strict";

var import_safeAreaState = require("./safeAreaState.native.js");
function setup() {
  if (false) {
    return;
  }
  var g = globalThis;
  if (g.__gui_native_safe_area_setup_complete) {
    return;
  }
  g.__gui_native_safe_area_setup_complete = true;
  try {
    var safeAreaContext = require("react-native-safe-area-context");
    var {
      useSafeAreaInsets,
      useSafeAreaFrame,
      initialWindowMetrics
    } = safeAreaContext;
    if (useSafeAreaInsets) {
      (0, import_safeAreaState.getSafeArea)().set({
        enabled: true,
        useSafeAreaInsets,
        useSafeAreaFrame: useSafeAreaFrame || null,
        initialMetrics: initialWindowMetrics || null
      });
    }
  } catch (e) {}
}
setup();
//# sourceMappingURL=setup-safe-area.native.js.map
