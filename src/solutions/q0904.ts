import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 904. Fruit Into Baskets

const F = [1, 2, 3, 2, 2]

function winFig(): FigStep[] {
  const cnt = new Map<number, number>()
  let l = 0
  let best = 0
  const out: FigStep[] = [{ note: '只有兩個籃子、每個籃子只能放一種水果,從某棵樹開始往右一路摘 → 找「最多只有 2 種數字」的最長連續子陣列', views: [arr(F, { label: 'fruits' })] }]
  for (let r = 0; r < F.length; r++) {
    cnt.set(F[r], (cnt.get(F[r]) ?? 0) + 1)
    const shrink: number[] = []
    while (cnt.size > 2) {
      const x = F[l]
      cnt.set(x, cnt.get(x)! - 1)
      if (cnt.get(x) === 0) cnt.delete(x)
      shrink.push(l)
      l++
    }
    best = Math.max(best, r - l + 1)
    out.push({ note: `加入 ${F[r]}${shrink.length ? `:變成 3 種了,縮左端(去掉索引 ${shrink.join('、')})直到剩 2 種` : ''}。視窗 [${l}, ${r}] 長度 ${r - l + 1},最長 ${best}`, views: [arr(F, { label: 'fruits', range: [l, r], dim: shrink }), kv([...cnt.entries()], '視窗裡每種的數量')] })
  }
  return out
}

function lastFig(): FigStep[] {
  return [
    { note: 'O(1) 空間的寫法:只記「最後兩種水果」a、b,目前視窗長度 cur,和「最後一種水果連續出現了幾個」run', views: [arr(F, { label: 'fruits', highlight: [3, 4] }), arr(['a = 3', 'b = 2', 'run = 2'], { label: '狀態' })] },
    { note: '遇到第三種水果 c 時,新的視窗 = 「最後那一段連續的 b」+ c → cur = run + 1。不用回頭縮', views: [arr(['cur = run + 1'], { label: '遇到新種類' })] },
  ]
}

export const q0904: Solution = {
  id: 904,
  plain: '一排果樹,每棵樹結一種水果(用數字表示種類)。你有兩個籃子,每個籃子只能裝同一種水果,數量不限。從任一棵樹開始往右一棵一棵摘,遇到第三種水果就得停。最多能摘幾顆?',
  statement: '給整數陣列 `fruits`(`fruits[i]` 是第 i 棵樹的水果種類)。從某棵樹開始往右,每棵樹摘一顆放進籃子;只有兩個籃子,每個籃子只能放一種水果。回傳最多能摘的數量。',
  examples: [
    { input: 'fruits = [1,2,1]', output: '3' },
    { input: 'fruits = [0,1,2,2]', output: '3', note: '[1,2,2]' },
    { input: 'fruits = [1,2,3,2,2]', output: '4', note: '[2,3,2,2]' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['換句話說:最長的、**最多包含 2 種不同數字**的連續子陣列', '可變長度視窗:右端一直擴,種類超過 2 就縮左端', '用 Hash 表記視窗內每種的數量,數量歸零就刪掉'],
  approaches: [
    {
      name: '滑動視窗 + 計數表',
      idea: '`cnt` 記視窗內每種水果的數量;`len(cnt) > 2` 時縮左端。',
      steps: ['`cnt = {}`、`l = 0`', '`for r`:`cnt[fruits[r]] += 1`', '`while len(cnt) > 2`:`cnt[fruits[l]] -= 1`,歸零就刪掉;`l += 1`', '`best = max(best, r − l + 1)`'],
      figure: { title: `fruits = [${F}]`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '表裡最多 3 種;l、r 各走 n 步。' },
      verdict: '最推薦,「最多 k 種」的通用視窗模板(把 2 換成 k 即可)。',
      code: {
        python: `def totalFruit(fruits):
    cnt, l, best = {}, 0, 0
    for r, x in enumerate(fruits):
        cnt[x] = cnt.get(x, 0) + 1
        while len(cnt) > 2:                   # 超過兩種:縮左端
            y = fruits[l]
            cnt[y] -= 1
            if cnt[y] == 0:
                del cnt[y]
            l += 1
        best = max(best, r - l + 1)
    return best`,
        c: `int totalFruit(int *fruits, int fruitsSize) {
    int *cnt = calloc(fruitsSize + 1, sizeof(int));   // 種類 < n
    int kinds = 0, l = 0, best = 0;
    for (int r = 0; r < fruitsSize; r++) {
        if (cnt[fruits[r]]++ == 0) kinds++;
        while (kinds > 2) if (--cnt[fruits[l++]] == 0) kinds--;
        if (r - l + 1 > best) best = r - l + 1;
    }
    free(cnt);
    return best;
}`,
        cpp: `int totalFruit(vector<int>& fruits) {
    unordered_map<int, int> cnt;
    int l = 0, best = 0;
    for (int r = 0; r < (int)fruits.size(); r++) {
        cnt[fruits[r]]++;
        while (cnt.size() > 2) {
            if (--cnt[fruits[l]] == 0) cnt.erase(fruits[l]);
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int totalFruit(int[] fruits) {
    Map<Integer, Integer> cnt = new HashMap<>();
    int l = 0, best = 0;
    for (int r = 0; r < fruits.length; r++) {
        cnt.merge(fruits[r], 1, Integer::sum);
        while (cnt.size() > 2) {
            if (cnt.merge(fruits[l], -1, Integer::sum) == 0) cnt.remove(fruits[l]);
            l++;
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function totalFruit(fruits) {
  const cnt = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < fruits.length; r++) {
    cnt.set(fruits[r], (cnt.get(fruits[r]) ?? 0) + 1);
    while (cnt.size > 2) {
      const y = fruits[l++];
      cnt.set(y, cnt.get(y) - 1);
      if (cnt.get(y) === 0) cnt.delete(y);
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
    {
      name: '只記最後兩種 + 最後一段長度',
      idea: '`a`、`b` = 最後兩種(b 是最近的);`run` = b 在結尾連續出現幾次;`cur` = 目前視窗長度。遇到新種類:`cur = run + 1`。',
      steps: ['`x == b`:`run += 1`、`cur += 1`', '`x == a`:`a, b = b, a`、`run = 1`、`cur += 1`', '新種類:`a, b = b, x`、`cur = run + 1`、`run = 1`', '`best = max(best, cur)`'],
      figure: { title: `fruits = [${F}]`, steps: lastFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,幾個變數。' },
      verdict: '不需要 Hash 表、也不用回頭縮,但只適用於「2 種」;k 種的話還是用計數表。',
      code: {
        python: `def totalFruit(fruits):
    a = b = -1
    run = cur = best = 0
    for x in fruits:
        if x == b:
            run += 1
            cur += 1
        elif x == a:
            a, b = b, a                       # x 變成「最近的那種」
            run = 1
            cur += 1
        else:
            a, b = b, x
            cur = run + 1                     # 新視窗 = 最後那段 b + x
            run = 1
        best = max(best, cur)
    return best`,
        c: `int totalFruit(int *fruits, int fruitsSize) {
    int a = -1, b = -1, run = 0, cur = 0, best = 0;
    for (int i = 0; i < fruitsSize; i++) {
        int x = fruits[i];
        if (x == b) { run++; cur++; }
        else if (x == a) { a = b; b = x; run = 1; cur++; }
        else { a = b; b = x; cur = run + 1; run = 1; }
        if (cur > best) best = cur;
    }
    return best;
}`,
        cpp: `int totalFruit(vector<int>& fruits) {
    int a = -1, b = -1, run = 0, cur = 0, best = 0;
    for (int x : fruits) {
        if (x == b) { run++; cur++; }
        else if (x == a) { a = b; b = x; run = 1; cur++; }
        else { a = b; b = x; cur = run + 1; run = 1; }
        best = max(best, cur);
    }
    return best;
}`,
        java: `int totalFruit(int[] fruits) {
    int a = -1, b = -1, run = 0, cur = 0, best = 0;
    for (int x : fruits) {
        if (x == b) { run++; cur++; }
        else if (x == a) { a = b; b = x; run = 1; cur++; }
        else { a = b; b = x; cur = run + 1; run = 1; }
        best = Math.max(best, cur);
    }
    return best;
}`,
        javascript: `function totalFruit(fruits) {
  let a = -1, b = -1, run = 0, cur = 0, best = 0;
  for (const x of fruits) {
    if (x === b) {
      run++;
      cur++;
    } else if (x === a) {
      [a, b] = [b, x];
      run = 1;
      cur++;
    } else {
      [a, b] = [b, x];
      cur = run + 1;
      run = 1;
    }
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['遇到第三種就直接把左端跳到 r − 1:中間可能還有一大段第二種水果', '數量歸零後沒從表裡刪掉:種類數會算錯'],
  check: {
    kind: 'fn',
    fn: 'totalFruit',
    cases: [
      { args: [[1, 2, 1]], out: 3 },
      { args: [[0, 1, 2, 2]], out: 3 },
      { args: [F], out: 4 },
      { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], out: 5 },
      { args: [[0]], out: 1 },
    ],
  },
}
