"use strict";

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
var import_globalState = require("./globalState.native.js");
var state = (0, import_globalState.createGlobalState)(`gesture`, {
  enabled: false,
  Gesture: null,
  GestureDetector: null,
  ScrollView: null
});
var pressGestureDebugId = 0;
var externalPressDebugId = 0;
var pressState = {
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
  var now = Date.now();
  resetStaleOwner(now, debugName);
  var token = {};
  var ownerId = ++externalPressDebugId;
  var previousOwnerId = pressState.ownerId;
  var previousOwnerSource = pressState.ownerSource;
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
      var {
        Gesture
      } = state.get();
      if (!Gesture) return null;
      var _config_delayLongPress;
      var longPressDuration = (_config_delayLongPress = config.delayLongPress) !== null && _config_delayLongPress !== void 0 ? _config_delayLongPress : 500;
      var myToken = {};
      var myDebugId = ++pressGestureDebugId;
      var GRACE_PERIOD_MS = process.env.TAMAGUI_RNGH_PRESS_DELAY ? +process.env.TAMAGUI_RNGH_PRESS_DELAY : 24;
      var tryClaimOwnership = function () {
        var now = Date.now();
        resetStaleOwner(now, config.debugName);
        var withinGrace = now - pressState.timestamp < GRACE_PERIOD_MS;
        var previousOwnerId = pressState.ownerId;
        var previousOwnerSource = pressState.ownerSource;
        if (pressState.owner === null || withinGrace && pressState.ownerSource !== "external") {
          pressState.owner = myToken;
          pressState.ownerId = myDebugId;
          pressState.ownerSource = "internal";
          pressState.timestamp = now;
        }
        return pressState.owner === myToken;
      };
      var isOwner = function () {
        return pressState.owner === myToken;
      };
      var releaseOwnership = function () {
        if (pressState.owner === myToken) {
          resetPressOwner();
        }
      };
      var tap = Gesture.Tap().runOnJS(true).maxDuration(1e4).onBegin(function (e) {
        tryClaimOwnership();
        setTimeout(function () {
          if (isOwner()) {
            var _config_onPressIn;
            (_config_onPressIn = config.onPressIn) === null || _config_onPressIn === void 0 ? void 0 : _config_onPressIn.call(config, e);
          }
        }, GRACE_PERIOD_MS + 1);
      }).onEnd(function (e) {
        if (isOwner()) {
          var _config_onPress;
          (_config_onPress = config.onPress) === null || _config_onPress === void 0 ? void 0 : _config_onPress.call(config, e);
        }
      }).onFinalize(function (e) {
        if (isOwner()) {
          var _config_onPressOut;
          (_config_onPressOut = config.onPressOut) === null || _config_onPressOut === void 0 ? void 0 : _config_onPressOut.call(config, e);
          releaseOwnership();
        }
      });
      if (config.hitSlop) tap.hitSlop(config.hitSlop);
      if (!config.onLongPress) return tap;
      var longPress = Gesture.LongPress().runOnJS(true).minDuration(longPressDuration).onBegin(function (e) {
        tryClaimOwnership();
        setTimeout(function () {
          if (isOwner()) {
            var _config_onPressIn;
            (_config_onPressIn = config.onPressIn) === null || _config_onPressIn === void 0 ? void 0 : _config_onPressIn.call(config, e);
          }
        }, GRACE_PERIOD_MS + 1);
      }).onStart(function (e) {
        if (isOwner()) {
          var _config_onLongPress;
          (_config_onLongPress = config.onLongPress) === null || _config_onLongPress === void 0 ? void 0 : _config_onLongPress.call(config, e);
        }
      }).onFinalize(function (e) {
        if (isOwner()) {
          var _config_onPressOut;
          (_config_onPressOut = config.onPressOut) === null || _config_onPressOut === void 0 ? void 0 : _config_onPressOut.call(config, e);
          releaseOwnership();
        }
      });
      if (config.hitSlop) longPress.hitSlop(config.hitSlop);
      return Gesture.Exclusive(longPress, tap);
    }
  };
}
//# sourceMappingURL=gestureState.native.js.map
