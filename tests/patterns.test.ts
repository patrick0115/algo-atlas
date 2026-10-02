import { describe, expect, it } from 'vitest'
import { PATTERNS } from '../src/patterns'
import { findStub } from '../src/data/categories'
import { LANGS, type Frame } from '../src/types'

const TAG = /\s*(?:#|\/\/)@([\w-]+)\s*$/
const tagsOf = (src: string) => new Set(src.split('\n').map((l) => l.match(TAG)?.[1]).filter(Boolean))

function runAll(gen: Generator<Frame>): Frame[] {
  const out: Frame[] = []
  for (const f of gen) {
    out.push(f)
    if (out.length > 5000) throw new Error('超過 5000 步,可能無窮迴圈')
  }
  return out
}

for (const p of Object.values(PATTERNS)) {
  describe(p.id, () => {
    const defaults = Object.fromEntries(p.demo.inputs.map((i) => [i.key, i.default]))

    it('在 categories 有登記', () => expect(findStub(p.id)).toBeTruthy())

    it('講義欄位齊全', () => {
      expect(p.summary && p.analogy).toBeTruthy()
      for (const k of ['steps', 'watch', 'whenToUse', 'pitfalls'] as const) expect(p[k].length).toBeGreaterThan(0)
    })

    it('預設輸入跑得完,且有答案', () => {
      const frames = runAll(p.demo.run(defaults))
      expect(frames.length).toBeGreaterThan(2)
      expect(frames.length).toBeLessThan(400)
      expect(frames.at(-1)!.vars?.answer).toBeDefined()
    })

    it('每個 frame 的 line 在五種語言都找得到', () => {
      const used = new Set(runAll(p.demo.run(defaults)).map((f) => f.line))
      for (const { id } of LANGS) {
        const have = tagsOf(p.demo.code[id])
        const missing = [...used].filter((t) => !have.has(t))
        expect(missing, `${id} 缺少 tag`).toEqual([])
      }
    })

    if (p.demo.reference) {
      it('答案和參考解一致(預設 + 隨機 100 組)', () => {
        const cases = [defaults, ...(p.demo.random ? Array.from({ length: 100 }, p.demo.random) : [])]
        for (const c of cases) {
          const got = runAll(p.demo.run(c)).at(-1)!.vars!.answer
          expect(String(got), JSON.stringify(c)).toBe(String(p.demo.reference!(c)))
        }
      })
    }
  })
}
