/* eslint-disable no-undef */
// Build stamp from vite.config.js. Prefer import.meta.env (reliable in dev),
// fall back to the define globals (prod builds), then "dev". The typeof guards
// keep this safe under tooling that skips both steps (eslint, tests).
const env = import.meta.env || {};
export const APP_VERSION =
  env.VITE_APP_VERSION ||
  (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev");
export const BUILD_TIME =
  env.VITE_BUILD_TIME ||
  (typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "");
// Human SemVer from package.json (see CHANGELOG.md). Falls back to "dev".
export const APP_SEMVER =
  env.VITE_APP_SEMVER ||
  (typeof __APP_SEMVER__ !== "undefined" ? __APP_SEMVER__ : "dev");
