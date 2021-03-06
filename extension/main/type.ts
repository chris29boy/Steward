import { PluginCommand, StewardApp } from "common/type";
import { KeyStatus } from "plugins/type";

export interface AppState {
  background: boolean;
  key: string;
  stage: string;
  str: string;
  cmd: string;
  query: string;
  delay: number;
  lastcmd: string;
  command: PluginCommand | null;
  workflowStack: string[];
  keyStatus: Partial<KeyStatus>;
  searchTimer?: number;
}

export interface CommandResultItem {
  key: string;
  id: string;
  icon: string;
  title: string;
  desc: string;
  weight: number;
}

export interface StewardReadyEventDetail {
  app: StewardApp,
}

export type StewardReadyEvent = CustomEvent<StewardReadyEventDetail>

export type WALLPAPER_ACTION_TYPE = 'save' | 'remove'
export interface WALLPAPER_ACTION {
  action: WALLPAPER_ACTION_TYPE;
  msg: string
}