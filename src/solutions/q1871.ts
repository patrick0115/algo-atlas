import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1871. Jump Game VII

const S = '011010'
const MINJ = 2
const MAXJ = 3

function winFig(): FigStep[] {
  const n = S.length
  const ok = Array(n).fill(false)
  ok[0] = true
  let cnt = 0
  const out: FigStep[] = [{ note: `從 0 出發,每次往右跳 ${MINJ}..${MAXJ} 格,只能落在 "0" 上。位置 i 能到 ⇔ [i − ${MAXJ}, i − ${MINJ}] 裡至少有一個能到的位置`, views: [arr(S.split(''), { label: 's' })] }]
  for (let i = 1; i < n; i++) {
    if (i - MINJ >= 0 && ok[i - MINJ]) cnt++
    if (i - MAXJ - 1 >= 0 && ok[i - MAXJ - 1]) cnt--
    ok[i] = S[i] === '0' && cnt > 0
    const lo = Math.max(0, i - MAXJ)
    const hi = i - MINJ
    out.push({ note: `i = ${i}:視窗 [${lo}, ${Math.max(hi, lo - 1)}] 裡能到的有 ${cnt} 個${S[i] === '1' ? ',但 s[i] 是 "1",不能站' : cnt > 0 ? ' → 能到' : ' → 到不了'}`, views: [arr(S.split(''), { label: 's', range: [lo, hi], highlight: [i], done: ok.map((v, k) => (v && k < i ? k : -1)).filter((k) => k >= 0) })] })
  }
  out.push({ note: `終點 ${n - 1} ${ok[n - 1] ? '能到 → true' : '到不了 → false'}。「視窗裡有幾個能到」用加一個、減一個維護,O(1)`, views: [arr(S.split(''), { label: 's', done: ok.map((v, k) => (v ? k : -1)).filter((k) => k >= 0) })] })
  return out
}

function bfsFig(): FigStep[] {
  return [
    { note: 'BFS 版:從能到的位置 i 出發,把 [i + minJump, i + maxJump] 裡的 "0" 都加進佇列。直接做會重複檢查很多格', views: [arr(S.split(''), { label: 's', highlight: [0], range: [2, 3] })] },
    { note: '用 far 記「已經檢查到哪裡」:每次只檢查 [max(i + minJump, far + 1), i + maxJump],每格最多檢查一次 → O(n)', views: [arr(S.split(''), { label: 's', done: [0, 3, 5] })] },
  ]
}

export const q1871: Solution = {
  id: 1871,
  plain: '一串 0 和 1,你站在第一格。每次可以往右跳 minJump 到 maxJump 格,但只能落在 "0" 上。能不能跳到最後一格?',
  statement: '給二進位字串 `s`(`s[0] == "0"`)和整數 `minJump`、`maxJump`。從索引 0 出發,可以從 i 跳到 j 若 `i + minJump ≤ j ≤ min(i + maxJump, n − 1)` 且 `s[j] == "0"`。回傳能否到達 `n − 1`。',
  examples: [
    { input: 's = "011010", minJump = 2, maxJump = 3', output: 'true', note: '0 → 3 → 5' },
    { input: 's = "01101110", minJump = 2, maxJump = 3', output: 'false' },
  ],
  constraints: ['n ≤ 10⁵ → 每格往前看 maxJump 格會 O(n²)'],
  insight: ['ok[i] = s[i] 是 "0" 而且 [i − maxJump, i − minJump] 裡有能到的位置', '「範圍裡有沒有」→ 數範圍裡能到的個數;範圍隨 i 往右滑 → 滑動視窗', '或 BFS:記住已經檢查過的最遠位置,避免重複'],
  approaches: [
    {
      name: 'DP + 滑動視窗計數',
      idea: '`cnt` = 視窗 [i − maxJump, i − minJump] 裡 `ok` 為真的個數;進入的 `ok[i − minJump]` 加進來,離開的 `ok[i − maxJump − 1]` 減掉。',
      steps: ['`ok[0] = True`、`cnt = 0`', '`for i in 1..n−1`:`i − minJump >= 0 and ok[i − minJump]` → `cnt += 1`', '`i − maxJump − 1 >= 0 and ok[i − maxJump − 1]` → `cnt -= 1`', '`ok[i] = s[i] == "0" and cnt > 0`'],
      figure: { title: `s = "${S}",minJump = ${MINJ},maxJump = ${MAXJ}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每格 O(1) 更新。' },
      verdict: '最推薦。「dp[i] 依賴前面一段連續的 dp」→ 用視窗計數(或前綴和)把區間查詢變 O(1)。',
      code: {
        python: `def canReach(s, minJump, maxJump):
    n = len(s)
    ok = [False] * n
    ok[0] = True
    cnt = 0                                   # 視窗 [i−maxJump, i−minJump] 裡能到的個數
    for i in range(1, n):
        if i - minJump >= 0 and ok[i - minJump]:
            cnt += 1                          # 進入視窗
        if i - maxJump - 1 >= 0 and ok[i - maxJump - 1]:
            cnt -= 1                          # 離開視窗
        ok[i] = s[i] == '0' and cnt > 0
    return ok[-1]`,
        c: `bool canReach(char *s, int minJump, int maxJump) {
    int n = strlen(s), cnt = 0;
    bool *ok = calloc(n, sizeof(bool));
    ok[0] = true;
    for (int i = 1; i < n; i++) {
        if (i - minJump >= 0 && ok[i - minJump]) cnt++;
        if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) cnt--;
        ok[i] = s[i] == '0' && cnt > 0;
    }
    bool ans = ok[n - 1];
    free(ok);
    return ans;
}`,
        cpp: `bool canReach(string s, int minJump, int maxJump) {
    int n = s.size(), cnt = 0;
    vector<bool> ok(n);
    ok[0] = true;
    for (int i = 1; i < n; i++) {
        if (i - minJump >= 0 && ok[i - minJump]) cnt++;
        if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) cnt--;
        ok[i] = s[i] == '0' && cnt > 0;
    }
    return ok[n - 1];
}`,
        java: `boolean canReach(String s, int minJump, int maxJump) {
    int n = s.length(), cnt = 0;
    boolean[] ok = new boolean[n];
    ok[0] = true;
    for (int i = 1; i < n; i++) {
        if (i - minJump >= 0 && ok[i - minJump]) cnt++;
        if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) cnt--;
        ok[i] = s.charAt(i) == '0' && cnt > 0;
    }
    return ok[n - 1];
}`,
        javascript: `function canReach(s, minJump, maxJump) {
  const n = s.length, ok = new Array(n).fill(false);
  ok[0] = true;
  let cnt = 0;
  for (let i = 1; i < n; i++) {
    if (i - minJump >= 0 && ok[i - minJump]) cnt++;
    if (i - maxJump - 1 >= 0 && ok[i - maxJump - 1]) cnt--;
    ok[i] = s[i] === '0' && cnt > 0;
  }
  return ok[n - 1];
}`,
      },
    },
    {
      name: 'BFS + 已檢查到的最遠位置',
      idea: '佇列放能到的位置;從 i 擴展時只檢查 `[max(i + minJump, far + 1), i + maxJump]`,檢查完更新 far。',
      steps: ['`q = [0]`、`far = 0`', 'pop i:`for j in max(i + minJump, far + 1) .. min(i + maxJump, n − 1)`', '`s[j] == "0"` → j 是終點就回傳 true,否則入隊', '`far = i + maxJump`'],
      figure: { title: `s = "${S}",minJump = ${MINJ},maxJump = ${MAXJ}`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每一格最多被檢查一次。' },
      verdict: '從「圖的走訪」角度出發,用 far 避免重複是關鍵,否則是 O(n · maxJump)。',
      code: {
        python: `from collections import deque

def canReach(s, minJump, maxJump):
    n = len(s)
    q, far = deque([0]), 0
    while q:
        i = q.popleft()
        for j in range(max(i + minJump, far + 1), min(i + maxJump, n - 1) + 1):
            if s[j] == '0':
                if j == n - 1:
                    return True
                q.append(j)
        far = max(far, i + maxJump)           # 這之前的格子都檢查過了
    return n == 1`,
        c: `bool canReach(char *s, int minJump, int maxJump) {
    int n = strlen(s);
    if (n == 1) return true;
    int *q = malloc(n * sizeof(int)), head = 0, tail = 0, far = 0;
    q[tail++] = 0;
    bool ans = false;
    while (head < tail && !ans) {
        int i = q[head++];
        int from = i + minJump > far + 1 ? i + minJump : far + 1;
        int to = i + maxJump < n - 1 ? i + maxJump : n - 1;
        for (int j = from; j <= to; j++)
            if (s[j] == '0') {
                if (j == n - 1) { ans = true; break; }
                q[tail++] = j;
            }
        if (i + maxJump > far) far = i + maxJump;
    }
    free(q);
    return ans;
}`,
        cpp: `bool canReach(string s, int minJump, int maxJump) {
    int n = s.size(), far = 0;
    if (n == 1) return true;
    queue<int> q;
    q.push(0);
    while (!q.empty()) {
        int i = q.front(); q.pop();
        for (int j = max(i + minJump, far + 1); j <= min(i + maxJump, n - 1); j++)
            if (s[j] == '0') {
                if (j == n - 1) return true;
                q.push(j);
            }
        far = max(far, i + maxJump);
    }
    return false;
}`,
        java: `boolean canReach(String s, int minJump, int maxJump) {
    int n = s.length(), far = 0;
    if (n == 1) return true;
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(0);
    while (!q.isEmpty()) {
        int i = q.poll();
        for (int j = Math.max(i + minJump, far + 1); j <= Math.min(i + maxJump, n - 1); j++)
            if (s.charAt(j) == '0') {
                if (j == n - 1) return true;
                q.offer(j);
            }
        far = Math.max(far, i + maxJump);
    }
    return false;
}`,
        javascript: `function canReach(s, minJump, maxJump) {
  const n = s.length;
  if (n === 1) return true;
  const q = [0];
  let far = 0;
  for (let h = 0; h < q.length; h++) {
    const i = q[h];
    for (let j = Math.max(i + minJump, far + 1); j <= Math.min(i + maxJump, n - 1); j++)
      if (s[j] === '0') {
        if (j === n - 1) return true;
        q.push(j);
      }
    far = Math.max(far, i + maxJump);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['每格都往回看 maxJump − minJump + 1 格:O(n²)', '最後一格是 "1" 時一定到不了'],
  check: {
    kind: 'fn',
    fn: 'canReach',
    cases: [
      { args: [S, MINJ, MAXJ], out: true },
      { args: ['01101110', 2, 3], out: false },
      { args: ['00', 1, 1], out: true },
      { args: ['0000000000', 8, 8], out: false },
      { args: ['00111010', 3, 5], out: false },
    ],
  },
}
