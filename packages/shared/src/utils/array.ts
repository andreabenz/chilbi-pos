/**
 * Zips multiple arrays together into an array of tuples.
 * Truncates to the length of the shortest array.
 */
export function zip<T1>(arr1: T1[]): [T1][];
export function zip<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][];
export function zip<T1, T2, T3>(arr1: T1[], arr2: T2[], arr3: T3[]): [T1, T2, T3][];
export function zip<T1, T2, T3, T4>(
  arr1: T1[],
  arr2: T2[],
  arr3: T3[],
  arr4: T4[]
): [T1, T2, T3, T4][];
export function zip<T1, T2, T3, T4, T5>(
  arr1: T1[],
  arr2: T2[],
  arr3: T3[],
  arr4: T4[],
  arr5: T5[]
): [T1, T2, T3, T4, T5][];
export function zip<T1, T2, T3, T4, T5, T6>(
  arr1: T1[],
  arr2: T2[],
  arr3: T3[],
  arr4: T4[],
  arr5: T5[],
  arr6: T6[]
): [T1, T2, T3, T4, T5, T6][];
export function zip<T>(...arrays: T[][]): T[][]; // Fallback for >6 args or uniform types

// Implementation
export function zip(...arrays: any[][]): any[][] {
  if (arrays.length === 0) return [];
  const minLength = Math.min(...arrays.map(arr => arr.length));
  return Array.from({ length: minLength }, (_, i) => arrays.map(arr => arr[i]));
}
