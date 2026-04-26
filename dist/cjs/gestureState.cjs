var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, {
    get: all[name],
    enumerable: true
  });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", {
  value: true
}), mod);
var gestureState_exports = {};
__export(gestureState_exports, {
  claimExternalPressOwnership: () => claimExternalPressOwnership,
  getGestureHandler: () => getGestureHandler,
  releaseExternalPressOwnership: () => releaseExternalPressOwnership
});
module.exports = __toCommonJS(gestureState_exports);
var import_globalState = require("./globalState.cjs");
const state = (0, import_globalState.createGlobalState)(`gesture`, {
  enabled: false,
  Gesture: null,
  GestureDetector: null,
  ScrollView: null
});
let pressGestureDebugId = 0;
let externalPressDebugId = 0;
const pressState = {
  owner: null,
  ownerId: null,
  ownerSource: null,
  timestamp: 0
};
function resetPressOwner() {
  pressState.owner = null;
  pressState.ownerId = null;
  pressState.ownerSource = null;
  pressState.timestamp = 0;
}
function resetStaleOwner(now, debugName) {
  if (now - pressState.timestamp > 2e3) {
    resetPressOwner();
  }
}
function claimExternalPressOwnership(debugName) {
  const now = Date.now();
  resetStaleOwner(now, debugName);
  const token = {};
  const ownerId = ++externalPressDebugId;
  const previousOwnerId = pressState.ownerId;
  const previousOwnerSource = pressState.ownerSource;
  pressState.owner = token;
  pressState.ownerId = ownerId;
  pressState.ownerSource = "external";
  pressState.timestamp = now;
  return token;
}
function releaseExternalPressOwnership(token, debugName) {
  if (!token || pressState.owner !== token) {
    return;
  }
  resetPressOwner();
}
function getGestureHandler() {
  return {
    get isEnabled() {
      return state.get().enabled;
    },
    get state() {
      return state.get();
    },
    set(updates) {
      Object.assign(state.get(), updates);
    },
    disable() {
      state.get().enabled = false;
    },
    createPressGesture(config) {
      const {
        Gesture
      } = state.get();
      if (!Gesture) return null;
      const longPressDuration = config.delayLongPress ?? 500;
      const myToken = {};
      const myDebugId = ++pressGestureDebugId;
      const GRACE_PERIOD_MS = process.env.TAMAGUI_RNGH_PRESS_DELAY ? +process.env.TAMAGUI_RNGH_PRESS_DELAY : 24;
      const tryClaimOwnership = () => {
        const now = Date.now();
        resetStaleOwner(now, config.debugName);
        const withinGrace = now - pressState.timestamp < GRACE_PERIOD_MS;
        const previousOwnerId = pressState.ownerId;
        const previousOwnerSource = pressState.ownerSource;
        if (pressState.owner === null || withinGrace && pressState.ownerSource !== "external") {
          pressState.owner = myToken;
          pressState.ownerId = myDebugId;
          pressState.ownerSource = "internal";
          pressState.timestamp = now;
        }
        return pressState.owner === myToken;
      };
      const isOwner = () => pressState.owner === myToken;
      const releaseOwnership = () => {
        if (pressState.owner === myToken) {
          resetPressOwner();
        }
      };
      const tap = Gesture.Tap().runOnJS(true).maxDuration(1e4).onBegin(e => {
        tryClaimOwnership();
        setTimeout(() => {
          if (isOwner()) {
            config.onPressIn?.(e);
          }
        }, GRACE_PERIOD_MS + 1);
      }).onEnd(e => {
        if (isOwner()) {
          config.onPress?.(e);
        }
      }).onFinalize(e => {
        if (isOwner()) {
          config.onPressOut?.(e);
          releaseOwnership();
        }
      });
      if (config.hitSlop) tap.hitSlop(config.hitSlop);
      if (!config.onLongPress) return tap;
      const longPress = Gesture.LongPress().runOnJS(true).minDuration(longPressDuration).onBegin(e => {
        tryClaimOwnership();
        setTimeout(() => {
          if (isOwner()) {
            config.onPressIn?.(e);
          }
        }, GRACE_PERIOD_MS + 1);
      }).onStart(e => {
        if (isOwner()) {
          config.onLongPress?.(e);
        }
      }).onFinalize(e => {
        if (isOwner()) {
          config.onPressOut?.(e);
          releaseOwnership();
        }
      });
      if (config.hitSlop) longPress.hitSlop(config.hitSlop);
      return Gesture.Exclusive(longPress, tap);
    }
  };
}