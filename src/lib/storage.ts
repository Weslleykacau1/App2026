
"use client";

function isServer(): boolean {
  return typeof window === 'undefined';
}

export function setItem<T>(key: string, value: T): void {
  if (isServer()) return;
  try {
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

export function getItem<T>(key: string): T | null {
  if (isServer()) return null;
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

export function removeItem(key: string): void {
  if (isServer()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}
