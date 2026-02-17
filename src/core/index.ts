export { install } from "./installer.js";
export type { InstallOptions } from "./installer.js";
export { uninstall } from "./uninstaller.js";
export {
  getTracking,
  recordInstall,
  recordRemoval,
  isInstalled,
  getInstalled,
  getInstalledRecord,
} from "./tracker.js";
export { createBackup, listBackups, restoreBackup } from "./backup.js";
export {
  mergeSettings,
  removeSettings,
  mergeMcp,
  removeMcp,
  appendClaudeMd,
  removeClaudeMdSection,
} from "./merger.js";
export { detectConflicts } from "./conflict.js";
