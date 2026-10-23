import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2622. Cache With Time Limit
export const q2622: Solution = {
  id: 2622,
  languages: ['javascript'],
  plain: '像有保存期限的置物櫃：每個 key 放一個值，過期就拿不到；重新放入會刷新期限。',
  statement: '實作 TimeLimitedCache。set(key,value,duration) 寫入並回報寫入前是否有未過期項目；get 取得未過期值，否則 -1；count 回報尚未過期的項目數。',
  examples: [{ input: 't=0 set(1,42,100)，t=50 get(1)，t=150 get(1)', output: '[false,42,-1]' }, { input: 't=0 set(1,42,50)，t=40 set(1,50,100)，t=120 get(1)', output: '[false,true,50]' }],
  constraints: ['key、value 是非負整數；duration 為 0 至 1000 毫秒。', '同一 key 重設時要覆寫值與期限。', '恰好到期時已失效。'],
  insight: ['每個 key 除了值，還要記錄到期時間。', '是否存在必須同時檢查現在是否早於到期時間。', '重設舊 key 時，舊的到期排程不能刪除新值。'],
  approaches: [
    {
      name: '記到期時間，讀取時清理',
      idea: 'Map 保存 value 與 expires；count 時掃描並移除所有過期項。',
      steps: ['set 先檢查舊項是否仍有效，再寫入新到期時間', 'get 檢查目前時間，過期則刪除並回傳 -1', 'count 遍歷 Map，刪除過期項後回傳大小'],
      figure: { title: '重設會延長有效期', steps: [
        { note: 't=0 設定有效期限到 50ms。', views: [arr(['0', '50', '140'], { label: '時間', highlight: [0] })] },
        { note: 't=40 重設，有效期限改到 140ms。', views: [arr(['0', '50', '140'], { label: '時間', highlight: [2] })] },
      ] },
      complexity: { time: 'set/get O(1)，count O(k)', space: 'O(k)', why: 'k 是已存 key 數；count 需要逐項清理。' },
      verdict: '沒有計時器競態，實作最穩定。',
      code: { javascript: `var TimeLimitedCache = function() {
  this.data = new Map();
};

TimeLimitedCache.prototype.set = function(key, value, duration) {
  const now = Date.now();
  const old = this.data.get(key);
  const existed = old !== undefined && old.expires > now;
  this.data.set(key, { value, expires: now + duration });
  return existed;
};

TimeLimitedCache.prototype.get = function(key) {
  const item = this.data.get(key);
  if (item === undefined) return -1;
  if (item.expires <= Date.now()) {
    this.data.delete(key);
    return -1;
  }
  return item.value;
};

TimeLimitedCache.prototype.count = function() {
  const now = Date.now();
  for (const [key, item] of this.data) {
    if (item.expires <= now) this.data.delete(key);
  }
  return this.data.size;
};` },
    },
    {
      name: '計時器自動移除',
      idea: '每次 set 取消舊計時器並安排新計時器，Map 保持有效項目。',
      steps: ['set 前先讀取舊項，判斷它是否仍在期限內', '若有舊計時器先取消', '寫入新值並安排到期刪除', 'get 再檢查時間邊界；count 清理極少數已到期但回呼未執行的項目'],
      figure: { title: '取消舊的到期提醒', steps: [
        { note: '舊提醒原本會在 t=50 觸發。', views: [arr(['0', '50', '140'], { label: '時間', highlight: [1] })] },
        { note: 't=40 重設後取消舊提醒，改排到 t=140。', views: [arr(['0', '50', '140'], { label: '時間', done: [2], dim: [1] })] },
      ] },
      complexity: { time: 'set/get O(1)，count 最差 O(k)', space: 'O(k)', why: '通常到期回呼會刪項；count 仍需處理回呼尚未執行的時間邊界。' },
      verdict: '適合希望到期後自動釋放記憶體的情境。',
      code: { javascript: `var TimeLimitedCache = function() {
  this.data = new Map();
};

TimeLimitedCache.prototype.set = function(key, value, duration) {
  const now = Date.now();
  const old = this.data.get(key);
  const existed = old !== undefined && old.expires > now;
  if (old !== undefined) clearTimeout(old.timer);
  const item = { value, expires: now + duration, timer: null };
  this.data.set(key, item);
  item.timer = setTimeout(() => {
    if (this.data.get(key) === item) this.data.delete(key);
  }, duration);
  return existed;
};

TimeLimitedCache.prototype.get = function(key) {
  const item = this.data.get(key);
  if (item === undefined) return -1;
  if (item.expires <= Date.now()) {
    clearTimeout(item.timer);
    this.data.delete(key);
    return -1;
  }
  return item.value;
};

TimeLimitedCache.prototype.count = function() {
  const now = Date.now();
  for (const [key, item] of this.data) {
    if (item.expires <= now) {
      clearTimeout(item.timer);
      this.data.delete(key);
    }
  }
  return this.data.size;
};` },
    },
  ],
  pitfalls: ['`set` 的布林結果看覆寫前的項目是否仍有效。', '到期判斷是 `expires <= Date.now()`。', '重設同一 key 時，不可讓舊計時器誤刪新值。'],
  check: { kind: 'script', cases: [
    { run: 'const c = new TimeLimitedCache(); return [c.set(1,42,30), c.get(1), c.count()]', out: [false, 42, 1] },
    { run: 'const c = new TimeLimitedCache(); c.set(1,42,10); await new Promise(r => setTimeout(r,20)); return [c.get(1), c.count()]', out: [-1, 0] },
    { run: 'const c = new TimeLimitedCache(); c.set(1,42,15); const old = c.set(1,50,200); await new Promise(r => setTimeout(r,30)); return [old,c.get(1),c.count()]', out: [true, 50, 1] },
    { run: 'const c = new TimeLimitedCache(); return [c.set(1,0,0), c.set(1,2,10), c.get(1)]', out: [false, false, 2] },
  ] },
}
