import type { Demo, Frame } from '../types'

export const MAX_FRAMES = 2000

/**
 * 跑完 generator 收集所有快照。
 * 每個 Frame 都深拷貝:generator 常把同一個陣列(例如 dp 表)放進多個 Frame,
 * 不拷貝的話之後的修改會回頭改到前面的畫面。
 */
export function collectFrames(demo: Demo, values: Record<string, string>): { frames: Frame[]; error?: string } {
  try {
    const frames: Frame[] = []
    for (const f of demo.run(values)) {
      frames.push(structuredClone(f))
      if (frames.length >= MAX_FRAMES) break
    }
    return { frames }
  } catch (e) {
    return { frames: [], error: e instanceof Error ? e.message : String(e) }
  }
}
