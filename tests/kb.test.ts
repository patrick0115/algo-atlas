import { describe, expect, it } from 'vitest'
import { BOOKS, ENTRIES, OVERVIEW, routeOfOld } from '../src/kb'
import { BOOK_META, VOLUMES } from '../src/kb/volumes'
import type { KbBlock } from '../src/kb/types'

const allBlocks = (): { book: string; b: KbBlock }[] =>
  Object.values(BOOKS).flatMap((bk) =>
    [...bk.front.flatMap((s) => s.blocks), ...bk.entries.flatMap((e) => e.blocks), ...bk.back.flatMap((s) => s.blocks)].map((b) => ({ book: bk.id, b })),
  )

describe('百科', () => {
  it('卷裡列的每一本書都有資料,詞條 id 全站唯一', () => {
    for (const v of VOLUMES) for (const b of v.books) expect(BOOKS[b.id], b.id).toBeDefined()
    const ids = Object.values(BOOKS).flatMap((b) => b.entries.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(Object.keys(ENTRIES).length).toBe(ids.length)
    expect(OVERVIEW).toBeDefined()
  })

  it('有互動圖的書都有互動程式', async () => {
    const mods = import.meta.glob('../src/kb/widgets/[A-Z].ts')
    const have = new Set(Object.keys(mods).map((p) => p.match(/([A-Z])\.ts$/)![1]))
    for (const { book, b } of allBlocks()) if (b.t === 'widget') expect(have.has(book), book).toBe(true)
  })

  it('講義裡指向其他講義的連結,都換得到存在的書或詞條', () => {
    const html = allBlocks()
      .map(({ b }) => ('html' in b ? b.html : ''))
      .join('\n')
    const files = new Set(Object.values(BOOKS).map((b) => b.file))
    for (const m of html.matchAll(/<a\b[^>]*?\shref="([A-Q]-[\w-]+\.html)(?:#([\w-]*))?"/g)) {
      expect(files.has(m[1]), m[1]).toBe(true)
      const to = routeOfOld(m[1], m[2])
      const id = to.match(/^#\/k\/([\w-]+)/)![1]
      expect(BOOKS[id] || ENTRIES[id], to).toBeTruthy()
    }
  })

  it('舊網址轉址:書、詞條、詞條裡的小節', () => {
    expect(routeOfOld('L-bus.html')).toBe('#/k/L')
    expect(routeOfOld('L-bus.html', 'l01')).toBe('#/k/L01')
    expect(routeOfOld('L-bus.html', 'l01-l2')).toBe('#/k/L01/l01-l2')
    expect(routeOfOld('K-firmware.html', 'k03-sim')).toBe('#/k/K03/k03-sim')
    expect(routeOfOld('L-bus.html', 'compare')).toBe('#/k/L/compare')
    expect(BOOK_META.L.vol).toBe('sys')
  })
})
