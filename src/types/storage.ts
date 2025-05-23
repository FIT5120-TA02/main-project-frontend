import { ChildProfile } from './profile';
import { FoodItem } from './notes';
import { NutrientGapResponse, type ActivityResult } from '@/api/types';
import { ChildEnergyRequirementsResponse } from '@/api/types';
import { ActivityEntry } from '@/api/types';
import { NutritionalNote } from './notes';
import { SeasonalFood } from './seasonal';

/**
 * Centralized definition of all storage keys used in the application
 */
export const STORAGE_KEYS = {
  // Profile related keys
  CHILDREN_PROFILES: 'user_children',

  // Food and ingredient related keys
  SELECTED_INGREDIENT_IDS: 'selectedIngredientIds',
  SCANNED_FOODS: 'scannedFoods',
  RECOMMENDED_FOOD_IDS: 'recommendedFoodIds',

  // Nutrition analysis related keys
  NUTRIPEEK_GAP_RESULTS: 'nutripeekGapResults',
  ENERGY_REQUIREMENTS: 'energyRequirements',

  // Activity related keys
  ACTIVITY_RESULT: 'activityResult',
  ACTIVITY_PAL: 'activityPAL',
  SELECTED_ACTIVITIES: 'selectedActivities',

  // Note related keys
  NUTRI_NOTES: 'nutriNotes',
  ACTIVE_NOTE_ID: 'activeNoteId',

  // Authentication related keys
  AUTHENTICATED: 'authenticated',
  
  // UI state persistence 
  BANNER_DISMISSED_PREFIX: 'banner_dismissed',

  // Seasonal food related keys
  PINNED_SEASONAL_FOODS: 'pinnedSeasonalFoods',
  SELECTED_REGION: 'selectedRegion',
} as const;

// Type for storage key values (makes the keys type-safe)
export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Type definitions for all data stored in local storage
 * This provides type safety when retrieving data from storage
 */
export interface StorageSchema {
  // Profile data
  [STORAGE_KEYS.CHILDREN_PROFILES]: ChildProfile[];

  // Food and ingredient related data
  [STORAGE_KEYS.SELECTED_INGREDIENT_IDS]: string[];
  [STORAGE_KEYS.SCANNED_FOODS]: FoodItem[];
  [STORAGE_KEYS.RECOMMENDED_FOOD_IDS]: string[];

  // Nutrition analysis data
  [STORAGE_KEYS.NUTRIPEEK_GAP_RESULTS]: NutrientGapResponse;
  [STORAGE_KEYS.ENERGY_REQUIREMENTS]: ChildEnergyRequirementsResponse;

  // Activity related data
  [STORAGE_KEYS.ACTIVITY_RESULT]: ActivityResult | null;
  [STORAGE_KEYS.ACTIVITY_PAL]: number;
  [STORAGE_KEYS.SELECTED_ACTIVITIES]: ActivityEntry[];

  // Note related data
  [STORAGE_KEYS.NUTRI_NOTES]: NutritionalNote[];
  [STORAGE_KEYS.ACTIVE_NOTE_ID]: string | null;

  // Authentication related data
  [STORAGE_KEYS.AUTHENTICATED]: boolean;
  
  // UI state persistence
  [STORAGE_KEYS.BANNER_DISMISSED_PREFIX]: Record<string, boolean>;

  // Seasonal food data
  [STORAGE_KEYS.PINNED_SEASONAL_FOODS]: SeasonalFood[];
  [STORAGE_KEYS.SELECTED_REGION]: string | null;
}

/**
 * Type to get the expected return type for a given storage key
 * This provides proper typing when retrieving items from storage
 * 
 * Example usage:
 * const value = storageService.getLocalItem<StorageValueType<typeof STORAGE_KEYS.CHILDREN_PROFILES>>({
 *   key: STORAGE_KEYS.CHILDREN_PROFILES,
 *   defaultValue: []
 * });
 */
export type StorageValueType<K extends StorageKeyType> = K extends keyof StorageSchema 
  ? StorageSchema[K] 
  : never;

/**
 * Default values for storage items
 * This ensures consistency when retrieving items that might not exist in storage
 */
export const STORAGE_DEFAULTS: {
  [K in keyof StorageSchema]?: StorageSchema[K]
} = {
  [STORAGE_KEYS.CHILDREN_PROFILES]: [],
  [STORAGE_KEYS.SELECTED_INGREDIENT_IDS]: [],
  [STORAGE_KEYS.SCANNED_FOODS]: [],
  [STORAGE_KEYS.RECOMMENDED_FOOD_IDS]: [],
  [STORAGE_KEYS.NUTRI_NOTES]: [],
  [STORAGE_KEYS.ACTIVE_NOTE_ID]: null,
  [STORAGE_KEYS.SELECTED_ACTIVITIES]: [],
  [STORAGE_KEYS.ACTIVITY_RESULT]: null,
  [STORAGE_KEYS.ACTIVITY_PAL]: 0,
  [STORAGE_KEYS.AUTHENTICATED]: false,
  [STORAGE_KEYS.BANNER_DISMISSED_PREFIX]: {},
  [STORAGE_KEYS.PINNED_SEASONAL_FOODS]: [],
  [STORAGE_KEYS.SELECTED_REGION]: null,
}; 