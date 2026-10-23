import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2621. Sleep
export const q2621: Solution = {
  id: 2621,
  languages: ['javascript'],
  plain: '設定一個鬧鐘，等指定毫秒後才讓 Promise 完成。等待時 JavaScript 仍能處理其他工作。',
  statement: '給正整數 millis，寫一個非同步函式，回傳會在約 millis 毫秒後完成的 Promise。完成值不限。',
  examples: [{ input: 'await sleep(100)', output: '約 100 毫秒後繼續' }, { input: 'await sleep(200)', output: '約 200 毫秒後繼續' }],
  constraints: ['1 ≤ millis ≤ 1000。', '計時器可能有少許延遲；不要求精確到同一毫秒。'],
  insight: ['setTimeout 只安排稍後執行，自己不會產生可 await 的 Promise。', '在計時器回呼裡呼叫 resolve，才會讓等待 sleep 的程式繼續。'],
  approaches: [
    {
      name: '直接回傳 Promise',
      idea: '建立 Promise，讓計時器在期限到時呼叫 resolve。',
      steps: ['回傳 new Promise', '在建構函式中用 setTimeout 排程', '時間到時呼叫 resolve'],
      figure: { title: '等待 100 毫秒', steps: [
        { note: '建立 Promise，計時器開始計時。', views: [arr(['0ms', '100ms'], { label: '時間', highlight: [0] })] },
        { note: '到達約 100ms 時呼叫 resolve，await 後面的程式繼續。', views: [arr(['0ms', '100ms'], { label: '時間', done: [1] })] },
      ] },
      complexity: { time: 'O(1) 建立；等待 millis 毫秒', space: 'O(1)', why: '只建立一個 Promise 和一個計時器。' },
      verdict: '最精簡，直接呈現計時器與 Promise 的連接。',
      code: { javascript: `function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}` },
    },
    {
      name: 'async 函式中等待',
      idea: '先把計時器包成 Promise，再在 async 函式內 await 它。',
      steps: ['宣告 async function', '建立到期後 resolve 的 Promise', 'await 該 Promise；函式完成時自然回傳 Promise'],
      figure: { title: 'async 與 await 的關係', steps: [
        { note: 'sleep() 立即回傳待完成的 Promise。', views: [arr(['呼叫', '計時中', '完成'], { label: '狀態', highlight: [1] })] },
        { note: 'await 暫停這個函式；計時器到期才轉成完成。', views: [arr(['呼叫', '計時中', '完成'], { label: '狀態', done: [2] })] },
      ] },
      complexity: { time: 'O(1) 建立；等待 millis 毫秒', space: 'O(1)', why: '非同步等待不會持續佔用呼叫堆疊。' },
      verdict: '適合已使用 async/await 的程式。',
      code: { javascript: `async function sleep(millis) {
  await new Promise(resolve => setTimeout(resolve, millis));
}` },
    },
  ],
  pitfalls: ['只呼叫 setTimeout 卻不回傳 Promise，呼叫端無法 await。', '不要用忙碌迴圈等待；它會阻塞事件迴圈。'],
  check: { kind: 'script', cases: [
    { run: 'const t = Date.now(); const p = sleep(15); if (!(p instanceof Promise)) return false; await p; return Date.now() - t >= 10', out: true },
    { run: 'const t = Date.now(); await sleep(1); return Date.now() - t >= 0', out: true },
  ] },
}
