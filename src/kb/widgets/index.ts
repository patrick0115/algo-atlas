// 互動圖的程式:每本書一個檔案(src/kb/widgets/<書>.ts),匯出 mount(頁面根元素)。
// 書頁或詞條頁畫好之後掛一次;回傳的函式在離開頁面時清掉計時器與事件。

export type Mount = (root: HTMLElement) => void | (() => void)

const mods = import.meta.glob<{ mount: Mount }>('./[A-Z].ts', { eager: true })

/** 書的 id → 掛載函式 */
export const MOUNTS: Record<string, Mount> = Object.fromEntries(
  Object.entries(mods).map(([path, m]) => [path.match(/([A-Z])\.ts$/)![1], m.mount]),
)
