import type { GridViewData, KVViewData } from '../types'

// 題解圖示的小工具。陣列用 engine/helpers 的 arr()。

export function kv(entries: Iterable<[string | number, string | number]>, label?: string, highlight: (string | number)[] = []): KVViewData {
  return { kind: 'kv', label, entries: [...entries], highlight }
}

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

/** 26 格計數陣列畫成一列表格,欄位標字母 */
export function count26(cnt: number[], label: string, hl: number[] = []): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: [cnt.slice()],
    colLabels: LETTERS,
    marks: { hl: hl.map((c) => [0, c] as [number, number]), dim: cnt.flatMap((v, c) => (v === 0 && !hl.includes(c) ? [[0, c] as [number, number]] : [])) },
  }
}

/** 字母 → 0..25 */
export const idx = (ch: string) => ch.charCodeAt(0) - 97
