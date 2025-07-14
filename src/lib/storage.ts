
"use client";

export function setItem<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
}

export function getItem<T>(key: string): T | null {
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
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}
