import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const ascending: FigStep[] = [
  { note: '孩子需求排成 [1,2,3]，餅乾尺寸排成 [1,1]；先照顧需求最小的孩子。', views: [arr([1, 2, 3], { label: '需求' }), arr([1, 1], { label: '餅乾' })] },
  { note: '第一塊尺寸 1 剛好滿足需求 1；孩子與餅乾都往下一位。', views: [arr([1, 2, 3], { label: '需求', done: [0] }), arr([1, 1], { label: '餅乾', done: [0] })] },
  { note: '第二塊尺寸 1 無法滿足需求 2，只丟掉這塊餅乾；它也不可能滿足需求更大的孩子。', views: [arr([1, 2, 3], { label: '需求', highlight: [1] }), arr([1, 1], { label: '餅乾', dim: [1] })] },
  { note: '餅乾用完，滿足了 1 個孩子。', views: [arr([1], { label: '答案', done: [0] })] },
]
const descending: FigStep[] = [
  { note: '需求從大到小看 [3,2,1]，餅乾從大到小看 [1,1]；先試最難滿足的孩子。', views: [arr([3, 2, 1], { label: '需求' }), arr([1, 1], { label: '餅乾' })] },
  { note: '最大餅乾 1 仍不夠給需求 3，這孩子不可能被滿足；換下一位孩子。', views: [arr([3, 2, 1], { label: '需求', dim: [0] }), arr([1, 1], { label: '餅乾', highlight: [0] })] },
  { note: '需求 2 也無法滿足。需求 1 可拿走一塊尺寸 1 的餅乾。', views: [arr([3, 2, 1], { label: '需求', dim: [0, 1], done: [2] }), arr([1, 1], { label: '餅乾', done: [0] })] },
  { note: '走完孩子，答案為 1。', views: [arr([1], { label: '答案', done: [0] })] },
]

export const q0455: Solution = {
  id: 455,
  plain: '每個孩子有最低餅乾尺寸需求，每塊餅乾只能給一人；想讓最多孩子滿意。',
  statement: 'g[i] 是第 i 個孩子的最低需求，s[j] 是第 j 塊餅乾尺寸。每人最多一塊、每塊只能用一次；回傳最多能滿足多少人。',
  examples: [{ input: 'g = [1,2,3], s = [1,1]', output: '1' }, { input: 'g = [1,2], s = [1,2,3]', output: '2' }],
  constraints: ['兩陣列可為空；空餅乾或空孩子的答案都是 0。', '排序需要 O(n log n + m log m) 時間。'],
  insight: ['讓小需求孩子先拿剛好夠用的餅乾，可保留大餅乾給難滿足的孩子。', '也可以反向想：最大餅乾都餵不了最大的孩子，那個孩子只能放棄。兩種都是 [[p:greedy]]。'],
  approaches: [
    {
      name: '從最小需求配最小餅乾', idea: '兩邊排序後，尺寸不足就換餅乾，足夠就一起前進。',
      steps: ['將需求與餅乾升序排序。', '比較目前最小未處理孩子與餅乾。', '足夠則配對並前進；不足則只換餅乾。'],
      figure: { title: 'g = [1,2,3]，s = [1,1]', steps: ascending },
      complexity: { time: 'O(n log n + m log m)', space: 'O(1) 額外空間', why: '排序後線性掃描；排序實作可能另用暫存空間。' },
      verdict: '推薦解法，容易記住「尺寸不夠就丟掉餅乾」。',
      code: {
        python: `def findContentChildren(g, s):
    g.sort()
    s.sort()
    child = 0
    for cookie in s:
        if child < len(g) and cookie >= g[child]:
            child += 1  # 這塊餅乾滿足目前最小需求
    return child`,
        c: `static int compare455(const void *a, const void *b) {
    int x = *(const int *) a;
    int y = *(const int *) b;
    return (x > y) - (x < y);
}

int findContentChildren(int *g, int gSize, int *s, int sSize) {
    qsort(g, gSize, sizeof(int), compare455);
    qsort(s, sSize, sizeof(int), compare455);
    int child = 0;
    for (int i = 0; i < sSize && child < gSize; i++) {
        if (s[i] >= g[child]) {
            child++;
        }
    }
    return child;
}`,
        cpp: `int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int child = 0;
    for (int cookie : s) {
        if (child < (int) g.size() && cookie >= g[child]) {
            child++;
        }
    }
    return child;
}`,
        java: `int findContentChildren(int[] g, int[] s) {
    Arrays.sort(g);
    Arrays.sort(s);
    int child = 0;
    for (int cookie : s) {
        if (child < g.length && cookie >= g[child]) {
            child++;
        }
    }
    return child;
}`,
        javascript: `function findContentChildren(g, s) {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  let child = 0;
  for (const cookie of s) {
    if (child < g.length && cookie >= g[child]) {
      child++;
    }
  }
  return child;
}`,
      },
    },
    {
      name: '從最大需求往下挑', idea: '先看最大的餅乾能否滿足需求最大的孩子；不能就放棄該孩子。',
      steps: ['兩邊升序排序，指標從尾端開始。', '餅乾夠大則配對，兩邊都左移。', '餅乾不夠則只將孩子指標左移。'],
      figure: { title: 'g = [1,2,3]，s = [1,1]', steps: descending },
      complexity: { time: 'O(n log n + m log m)', space: 'O(1) 額外空間', why: '排序後兩個指標各最多走完一遍。' },
      verdict: '與第一種同樣正確，可用來理解為何貪心選擇不會浪費資源。',
      code: {
        python: `def findContentChildren(g, s):
    g.sort()
    s.sort()
    child = len(g) - 1
    cookie = len(s) - 1
    answer = 0
    while child >= 0 and cookie >= 0:
        if s[cookie] >= g[child]:
            answer += 1  # 最大餅乾可滿足這位孩子
            cookie -= 1
        child -= 1  # 否則這位孩子已無法滿足
    return answer`,
        c: `static int compare455(const void *a, const void *b) {
    int x = *(const int *) a;
    int y = *(const int *) b;
    return (x > y) - (x < y);
}

int findContentChildren(int *g, int gSize, int *s, int sSize) {
    qsort(g, gSize, sizeof(int), compare455);
    qsort(s, sSize, sizeof(int), compare455);
    int child = gSize - 1;
    int cookie = sSize - 1;
    int answer = 0;
    while (child >= 0 && cookie >= 0) {
        if (s[cookie] >= g[child]) {
            answer++;
            cookie--;
        }
        child--;
    }
    return answer;
}`,
        cpp: `int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());
    int child = (int) g.size() - 1;
    int cookie = (int) s.size() - 1;
    int answer = 0;
    while (child >= 0 && cookie >= 0) {
        if (s[cookie] >= g[child]) {
            answer++;
            cookie--;
        }
        child--;
    }
    return answer;
}`,
        java: `int findContentChildren(int[] g, int[] s) {
    Arrays.sort(g);
    Arrays.sort(s);
    int child = g.length - 1;
    int cookie = s.length - 1;
    int answer = 0;
    while (child >= 0 && cookie >= 0) {
        if (s[cookie] >= g[child]) {
            answer++;
            cookie--;
        }
        child--;
    }
    return answer;
}`,
        javascript: `function findContentChildren(g, s) {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  let child = g.length - 1;
  let cookie = s.length - 1;
  let answer = 0;
  while (child >= 0 && cookie >= 0) {
    if (s[cookie] >= g[child]) {
      answer++;
      cookie--;
    }
    child--;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['比較大小前要做數值排序；JavaScript 預設字串排序會把 10 排在 2 前。', '餅乾不夠時，升序法丟餅乾；降序法放棄孩子。'],
  check: { kind: 'fn', fn: 'findContentChildren', cases: [
    { args: [[1, 2, 3], [1, 1]], out: 1 },
    { args: [[1, 2], [1, 2, 3]], out: 2 },
    { args: [[], [1]], out: 0 },
    { args: [[2], []], out: 0 },
  ] },
}
