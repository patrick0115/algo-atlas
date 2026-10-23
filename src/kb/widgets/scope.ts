// 原講義的互動程式是寫給「一整頁」的:用 document.getElementById 找元素、用 setInterval 播動畫。
// 搬進百科後,一本書拆成書頁和好幾個詞條頁,所以每次只有部分元素在畫面上。
// scope() 給一個替身 document:只在頁面範圍裡找元素,找不到就回一個不掛在畫面上的空元素,
// 讓「這頁沒有的那段互動」安靜地什麼都不做;計時器在離開頁面時一起清掉。

export interface Scope {
  document: Pick<Document, 'getElementById' | 'querySelector' | 'querySelectorAll' | 'createElement' | 'createElementNS' | 'createTextNode' | 'createDocumentFragment'> & {
    body: HTMLElement
    documentElement: HTMLElement
    addEventListener: Document['addEventListener']
  }
  setInterval: typeof window.setInterval
  setTimeout: typeof window.setTimeout
  requestAnimationFrame: typeof window.requestAnimationFrame
  cleanup: () => void
}

export function scope(root: HTMLElement): Scope {
  const real = window.document
  const missing = new Map<string, HTMLElement>()
  // 還沒觸發的計時器與動畫影格;觸發後就移除,動畫一直跑也不會越積越多
  const intervals = new Set<number>()
  const timeouts = new Set<number>()
  const frames = new Set<number>()
  const listeners: [string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined][] = []

  const doc = {
    getElementById(id: string) {
      const el = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
      if (el) return el
      if (!missing.has(id)) {
        const stub = real.createElement('div')
        stub.id = id
        missing.set(id, stub)
      }
      return missing.get(id)!
    },
    querySelector: root.querySelector.bind(root),
    querySelectorAll: root.querySelectorAll.bind(root),
    createElement: real.createElement.bind(real),
    createElementNS: real.createElementNS.bind(real),
    createTextNode: real.createTextNode.bind(real),
    createDocumentFragment: real.createDocumentFragment.bind(real),
    body: root,
    documentElement: real.documentElement,
    addEventListener(type: string, fn: EventListenerOrEventListenerObject, opt?: boolean | AddEventListenerOptions) {
      listeners.push([type, fn, opt])
      real.addEventListener(type, fn, opt)
    },
  } as Scope['document']

  return {
    document: doc,
    setInterval: ((fn: TimerHandler, ms?: number, ...args: unknown[]) => {
      const id = window.setInterval(fn, ms, ...args)
      intervals.add(id)
      return id
    }) as typeof window.setInterval,
    setTimeout: ((fn: (...a: unknown[]) => void, ms?: number, ...args: unknown[]) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id)
        fn(...args)
      }, ms)
      timeouts.add(id)
      return id
    }) as typeof window.setTimeout,
    requestAnimationFrame: (fn: FrameRequestCallback) => {
      const id = window.requestAnimationFrame((t) => {
        frames.delete(id)
        fn(t)
      })
      frames.add(id)
      return id
    },
    cleanup() {
      intervals.forEach((t) => window.clearInterval(t))
      timeouts.forEach((t) => window.clearTimeout(t))
      frames.forEach((f) => window.cancelAnimationFrame(f))
      listeners.forEach(([t, fn, opt]) => real.removeEventListener(t, fn, opt))
    },
  }
}
