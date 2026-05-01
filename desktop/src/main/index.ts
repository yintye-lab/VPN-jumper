/**
 * ShieldVPN Electron Main Process
 *
 * Manages the application window, system tray, and WireGuard tunnel control.
 * This file is loaded by Electron as the main process entry point.
 */

// NOTE: This file requires Electron APIs and is run by the Electron main process.
// It will not run in a browser context. Build with electron-builder to package.

export interface ElectronMainConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  title: string;
  frame: boolean;
  transparent: boolean;
  webPreferences: {
    nodeIntegration: boolean;
    contextIsolation: boolean;
  };
}

export const defaultWindowConfig: ElectronMainConfig = {
  width: 420,
  height: 700,
  minWidth: 380,
  minHeight: 600,
  title: 'ShieldVPN',
  frame: false,
  transparent: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
  },
};

// Tray menu template
export const trayMenuTemplate = [
  { label: 'Show ShieldVPN', type: 'normal' as const },
  { type: 'separator' as const },
  { label: 'Quick Connect', type: 'normal' as const },
  { label: 'Disconnect', type: 'normal' as const },
  { type: 'separator' as const },
  { label: 'Quit', type: 'normal' as const },
];

/**
 * Main process initialization.
 * When running in Electron, import { app, BrowserWindow, Tray, Menu } from 'electron'
 * and use defaultWindowConfig to create the main window.
 */
export function getMainEntry(): string {
  if (process.env['NODE_ENV'] === 'development') {
    return 'http://localhost:5174';
  }
  return `file://${__dirname}/../renderer/index.html`;
}
