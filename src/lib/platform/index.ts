/**
 * Platform detection shim.
 *
 * On web, `isNative` is always false and no Capacitor plugin code is loaded.
 * Native-only behavior must be gated behind `isNative` and use dynamic imports
 * so the web bundle stays unchanged.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
export const isIOS = platform === 'ios';
