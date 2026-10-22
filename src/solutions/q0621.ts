import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 621. Task Scheduler

const TASKS = ['A', 'A', 'A', 'B', 'B', 'C']
const N = 2

function simFig(): FigStep[] {
  const cnt = new Map<string, number>()
  for (const t of TASKS) cnt.set(t, (cnt.get(t) ?? 0) + 1)
  const ready = new Map<string, number>() // 任務 -> 最早可以再做的時間
  const timeline: string[] = []
  const out: FigStep[] = [{ note: `同一種任務之間至少要隔 ${N} 個單位時間。貪心:每個時間點,在「現在可以做的任務」裡挑**剩最多次**的那個;都不能做就待命(idle)`, views: [kv([...cnt], '剩下的次數')] }]
  for (let t = 0; [...cnt.values()].some((v) => v > 0); t++) {
    const can = [...cnt].filter(([k, v]) => v > 0 && (ready.get(k) ?? 0) <= t).sort((a, b) => b[1] - a[1])
    if (!can.length) {
      timeline.push('idle')
      out.push({ note: `時間 ${t}:剩下的任務都還在冷卻 → 待命`, views: [arr(timeline, { label: '時間軸', highlight: [t] }), kv([...cnt].filter(([, v]) => v > 0).map(([k, v]) => [k, `${v} 次,${ready.get(k)} 才能做`]), '剩下的')] })
      continue
    }
    const [k] = can[0]
    cnt.set(k, cnt.get(k)! - 1)
    ready.set(k, t + N + 1)
    timeline.push(k)
    out.push({ note: `時間 ${t}:可以做的有 ${can.map(([x, v]) => `${x}(剩 ${v})`).join('、')} → 挑剩最多的 ${k}`, views: [arr(timeline, { label: '時間軸', highlight: [t] }), kv([...cnt].filter(([, v]) => v > 0), '剩下的次數', [k])] })
  }
  out.push({ note: `全部做完,總共 ${timeline.length} 個單位時間`, views: [arr(timeline, { label: '時間軸' })] })
  return out
}

function frameGrid(rows: string[][], label: string): GridViewData {
  return { kind: 'grid', label, cells: rows, marks: { dim: rows.flatMap((r, i) => r.flatMap((v, j) => (v === 'idle' ? [[i, j] as [number, number]] : []))) } }
}

function mathFig(): FigStep[] {
  const cnt = new Map<string, number>()
  for (const t of TASKS) cnt.set(t, (cnt.get(t) ?? 0) + 1)
  const maxf = Math.max(...cnt.values())
  const ties = [...cnt.values()].filter((v) => v === maxf).length
  const rows: string[][] = Array.from({ length: maxf }, (_, i) => Array.from({ length: N + 1 }, (_, j) => (j === 0 ? 'A' : i < maxf - 1 ? 'idle' : '')))
  const filled = rows.map((r) => [...r])
  filled[0][1] = 'B'
  filled[1][1] = 'B'
  filled[0][2] = 'C'
  const lastRow = filled[maxf - 1].filter((v) => v)
  return [
    { note: `出現最多次的是 A(${maxf} 次)。把時間切成 ${maxf} 列、每列 n + 1 = ${N + 1} 格:A 放在每一列的開頭,兩個 A 之間剛好隔 ${N} 格`, views: [frameGrid(rows, '框架(每列 n + 1 格)')] },
    { note: '其他任務填進空格。只要填得下,總時間就由框架決定;填不下(任務很多)時,就不需要任何 idle,答案是任務總數', views: [frameGrid(filled, '填入其他任務')] },
    {
      note: `前 ${maxf - 1} 列每列都是 ${N + 1} 格;最後一列只放「和 A 一樣多次」的任務(${ties} 個)。答案 = max(任務總數, (${maxf} − 1) × (${N} + 1) + ${ties}) = max(${TASKS.length}, ${(maxf - 1) * (N + 1) + ties}) = ${Math.max(TASKS.length, (maxf - 1) * (N + 1) + ties)}`,
      views: [frameGrid([...filled.slice(0, maxf - 1), lastRow], '最後一列不用補滿')],
    },
  ]
}

export const q0621: Solution = {
  id: 621,
  plain: 'CPU 要做一堆任務(用字母表示),每個任務花 1 單位時間;同一種任務做完之後,要等至少 n 個單位時間才能再做一次(可以先做別的,沒事做就只能空等)。最少要多少時間才能全部做完?',
  statement: '`tasks` 是任務清單(大寫字母),每個任務 1 單位時間。兩個**相同**任務之間至少要隔 `n` 個單位時間(中間可以做別的任務或待命)。回傳完成所有任務的最少時間。',
  examples: [
    { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', note: 'A B idle A B idle A B' },
    { input: 'tasks = ["A","C","A","B","D","B"], n = 1', output: '6', note: '不需要待命' },
    { input: 'tasks = ["A","A","A","B","B","B"], n = 3', output: '10' },
  ],
  constraints: ['`1 ≤ tasks.length ≤ 10⁴`、`0 ≤ n ≤ 100`', '只有 26 種任務'],
  insight: [
    '瓶頸是**出現最多次**的任務:它的每兩次之間一定要隔 n 格,這些格子無論如何都要花掉',
    '模擬的貪心:每個時間點,在「冷卻好了」的任務裡挑剩最多次的做(讓最難排的先排),用 Heap 實作',
    '更進一步可以直接算:設最多次數是 `maxf`,有 `ties` 種任務都是這麼多次。框架是 `(maxf − 1)` 個長度 `n + 1` 的區塊,加上最後一列的 `ties` 個 → `(maxf − 1)(n + 1) + ties`。任務太多填滿框架時,答案就是任務總數',
  ],
  approaches: [
    {
      name: '模擬:最大堆 + 冷卻佇列',
      idea: '最大堆裡放「還沒做完的任務的剩餘次數」。每個時間點從堆裡拿最多的做,做完(還有剩)放進冷卻佇列,n 個單位時間後再放回堆裡。',
      steps: ['計數,把次數放進最大堆', '`time += 1`;堆不空 → 拿出最大的做一次,剩下的次數和「可以再做的時間 time + n」放進佇列', '佇列最前面的冷卻好了 → 放回堆', '堆和佇列都空了 → 回傳 time'],
      figure: { title: `tasks = [${TASKS.join(',')}], n = ${N}`, steps: simFig() },
      complexity: { time: 'O(T · log 26)', space: 'O(26)', why: 'T 是總時間(最多 tasks 長度 × (n+1))。堆和佇列最多 26 種任務。' },
      verdict: '直接模擬,邏輯清楚,也能印出實際的排程。',
      code: {
        python: `import heapq
from collections import Counter, deque

def leastInterval(tasks, n):
    h = [-c for c in Counter(tasks).values()]   # 最大堆(存負數)
    heapq.heapify(h)
    cool = deque()                        # (可以再做的時間, 剩餘次數)
    time = 0
    while h or cool:
        time += 1
        if h:
            c = heapq.heappop(h) + 1      # 做一次(負數 +1 = 次數 -1)
            if c:
                cool.append((time + n, c))
        if cool and cool[0][0] == time:
            heapq.heappush(h, cool.popleft()[1])
    return time`,
        c: `int leastInterval(char *tasks, int tasksSize, int n) {
    int cnt[26] = {0}, ready[26] = {0}, left = tasksSize, time = 0;
    for (int i = 0; i < tasksSize; i++) cnt[tasks[i] - 'A']++;
    while (left > 0) {
        // 在冷卻好的任務裡挑剩最多次的(只有 26 種,直接掃)
        int best = -1;
        for (int c = 0; c < 26; c++)
            if (cnt[c] > 0 && ready[c] <= time && (best < 0 || cnt[c] > cnt[best])) best = c;
        if (best >= 0) {
            cnt[best]--;
            left--;
            ready[best] = time + n + 1;
        }
        time++;
    }
    return time;
}`,
        cpp: `int leastInterval(vector<char>& tasks, int n) {
    int cnt[26] = {0};
    for (char t : tasks) cnt[t - 'A']++;
    priority_queue<int> pq;
    for (int c : cnt) if (c) pq.push(c);
    queue<pair<int, int>> cool;           // (可以再做的時間, 剩餘次數)
    int time = 0;
    while (!pq.empty() || !cool.empty()) {
        time++;
        if (!pq.empty()) {
            int c = pq.top() - 1; pq.pop();
            if (c) cool.push({time + n, c});
        }
        if (!cool.empty() && cool.front().first == time) {
            pq.push(cool.front().second);
            cool.pop();
        }
    }
    return time;
}`,
        java: `int leastInterval(char[] tasks, int n) {
    int[] cnt = new int[26];
    for (char t : tasks) cnt[t - 'A']++;
    PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
    for (int c : cnt) if (c > 0) pq.offer(c);
    Deque<int[]> cool = new ArrayDeque<>();   // {可以再做的時間, 剩餘次數}
    int time = 0;
    while (!pq.isEmpty() || !cool.isEmpty()) {
        time++;
        if (!pq.isEmpty()) {
            int c = pq.poll() - 1;
            if (c > 0) cool.offer(new int[]{time + n, c});
        }
        if (!cool.isEmpty() && cool.peek()[0] == time) pq.offer(cool.poll()[1]);
    }
    return time;
}`,
        javascript: `function leastInterval(tasks, n) {
  const cnt = new Array(26).fill(0);
  for (const t of tasks) cnt[t.charCodeAt(0) - 65]++;
  const ready = new Array(26).fill(0);
  let left = tasks.length, time = 0;
  while (left > 0) {
    let best = -1;                      // 冷卻好的任務裡,剩最多次的
    for (let c = 0; c < 26; c++)
      if (cnt[c] > 0 && ready[c] <= time && (best < 0 || cnt[c] > cnt[best])) best = c;
    if (best >= 0) {
      cnt[best]--;
      left--;
      ready[best] = time + n + 1;
    }
    time++;
  }
  return time;
}`,
      },
    },
    {
      name: '數學:用最多次的任務搭框架',
      idea: '`maxf` = 最多的次數,`ties` = 次數等於 maxf 的任務種類數。答案 = `max(len(tasks), (maxf − 1) × (n + 1) + ties)`。',
      steps: ['計數', '`maxf = max(count)`、`ties = count 等於 maxf 的種類數`', '回傳 `max(len(tasks), (maxf − 1)(n + 1) + ties)`'],
      figure: { title: `tasks = [${TASKS.join(',')}], n = ${N}`, steps: mathFig() },
      complexity: { time: 'O(n)', space: 'O(26)', why: '計數走一遍 tasks,其他都是常數。' },
      verdict: '最佳解,但要能解釋公式:框架由最多次的任務決定;其他任務填空格;填滿了就不需要 idle(答案 = 任務數)。',
      code: {
        python: `from collections import Counter

def leastInterval(tasks, n):
    cnt = Counter(tasks).values()
    maxf = max(cnt)
    ties = sum(1 for c in cnt if c == maxf)
    return max(len(tasks), (maxf - 1) * (n + 1) + ties)`,
        c: `int leastInterval(char *tasks, int tasksSize, int n) {
    int cnt[26] = {0}, maxf = 0, ties = 0;
    for (int i = 0; i < tasksSize; i++) cnt[tasks[i] - 'A']++;
    for (int c = 0; c < 26; c++) if (cnt[c] > maxf) maxf = cnt[c];
    for (int c = 0; c < 26; c++) if (cnt[c] == maxf) ties++;
    int frame = (maxf - 1) * (n + 1) + ties;
    return frame > tasksSize ? frame : tasksSize;
}`,
        cpp: `int leastInterval(vector<char>& tasks, int n) {
    int cnt[26] = {0};
    for (char t : tasks) cnt[t - 'A']++;
    int maxf = *max_element(cnt, cnt + 26);
    int ties = count(cnt, cnt + 26, maxf);
    return max((int)tasks.size(), (maxf - 1) * (n + 1) + ties);
}`,
        java: `int leastInterval(char[] tasks, int n) {
    int[] cnt = new int[26];
    for (char t : tasks) cnt[t - 'A']++;
    int maxf = 0, ties = 0;
    for (int c : cnt) maxf = Math.max(maxf, c);
    for (int c : cnt) if (c == maxf) ties++;
    return Math.max(tasks.length, (maxf - 1) * (n + 1) + ties);
}`,
        javascript: `function leastInterval(tasks, n) {
  const cnt = new Array(26).fill(0);
  for (const t of tasks) cnt[t.charCodeAt(0) - 65]++;
  const maxf = Math.max(...cnt);
  const ties = cnt.filter((c) => c === maxf).length;
  return Math.max(tasks.length, (maxf - 1) * (n + 1) + ties);
}`,
      },
    },
  ],
  pitfalls: [
    '公式忘了和 `len(tasks)` 取 max:任務種類多、n 小時,框架會填滿溢出,這時答案就是任務總數(不需要 idle)',
    '`ties` 算成 1:有好幾種任務都是最多次時,它們都要擠進最後一列',
    '模擬時只挑「剩最多次的」但沒檢查冷卻:剛做過的任務不能立刻再做',
  ],
  followUp: [{ q: '如果任務必須照原本的順序做?', a: '2365. Task Scheduler II:不能重排,只能記每種任務「最早可以再做的時間」,一路往後推。' }],
  check: {
    kind: 'fn',
    fn: 'leastInterval',
    cases: [
      { args: [['A', 'A', 'A', 'B', 'B', 'B'], 2], out: 8 },
      { args: [['A', 'C', 'A', 'B', 'D', 'B'], 1], out: 6 },
      { args: [['A', 'A', 'A', 'B', 'B', 'B'], 3], out: 10 },
      { args: [TASKS, N], out: 7 },
      { args: [['A', 'A', 'A', 'B', 'B', 'B'], 0], out: 6 },
      { args: [['A', 'B', 'C', 'D', 'E', 'A', 'B', 'C', 'D', 'E'], 4], out: 10 },
    ],
  },
}
