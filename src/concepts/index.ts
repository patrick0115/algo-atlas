import type { Concept, Unit } from './types'
import { START } from './start'
import { COMPLEXITY } from './complexity'
import { LANGUAGE } from './language'
import { TOOLBOX } from './toolbox'
import { STRUCTURES } from './structures'
import { THINKING } from './thinking'

// 基礎篇的路線:由上往下讀。新增觀念章:寫進對應單元的檔案,先修只能指向排在前面的章。
export const UNITS: Unit[] = [
  {
    id: 'start',
    name: '開始刷題',
    desc: 'LeetCode 的題目長什麼樣、判題怎麼運作、拿到一題該照什麼順序想。',
    concepts: START,
  },
  {
    id: 'complexity',
    name: '複雜度',
    desc: '用 Big O 衡量一個解法夠不夠快,並且從題目的資料範圍反推該用什麼等級的演算法。',
    concepts: COMPLEXITY,
  },
  {
    id: 'language',
    name: '程式語言基礎',
    desc: '記憶體與參考、指標、陣列與字串、整數溢位、遞迴與呼叫堆疊、類別與比較函式 —— 每種語言都適用的底層觀念。',
    concepts: LANGUAGE,
  },
  {
    id: 'toolbox',
    name: '各語言工具箱',
    desc: 'C 的函式簽名與記憶體配置、C++ STL,以及五種語言的容器與 API 對照 —— 選定一種語言後,寫題時隨手查。',
    concepts: TOOLBOX,
  },
  {
    id: 'structures',
    name: '資料結構總覽',
    desc: '每種資料結構擅長什麼、各操作多快;雜湊表為什麼是 O(1);樹和圖在題目裡怎麼表示。',
    concepts: STRUCTURES,
  },
  {
    id: 'thinking',
    name: '解題思維',
    desc: '從暴力解一步步優化的固定套路,以及各大演算法家族之間的關係 —— 讀完就可以進入演算法章。',
    concepts: THINKING,
  },
]

export const CONCEPT_ORDER: Concept[] = UNITS.flatMap((u) => u.concepts)
export const CONCEPTS: Record<string, Concept> = Object.fromEntries(CONCEPT_ORDER.map((c) => [c.id, c]))

export function unitOf(id: string): Unit | undefined {
  return UNITS.find((u) => u.concepts.some((c) => c.id === id))
}

/** 演算法頁要列出的「基礎觀念」:哪些觀念章把這個演算法列在 next 裡 */
export function conceptsFor(patternId: string): Concept[] {
  return CONCEPT_ORDER.filter((c) => c.next.includes(patternId))
}
