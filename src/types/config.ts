import type { ItemType } from "./common.js";

export interface UserConfig {
  registryUrl?: string;
  cacheTtl?: number;
  defaultType?: ItemType;
}

export interface InstalledItemRecord {
  name: string;
  type: ItemType;
  version: string;
  installedAt: string;
  files: string[];
  checksum?: string;
}

export interface RigTracking {
  version: number;
  installedAt: string;
  installed: Record<string, InstalledItemRecord>;
}
