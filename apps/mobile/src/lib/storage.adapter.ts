import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage } from "zustand/middleware";

/**
 * Web'in LocalStorage'ının RN karşılığı — tüm persist edilen store'lar
 * (rulesProfile, preferences, plan, shopping, pantry, ratings) bu adaptörü
 * paylaşır. F9.5: SDD §1.7 "storage.adapter.ts — Zustand persist için
 * AsyncStorage/MMKV".
 */
export const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);
