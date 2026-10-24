import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [4, 9, 5]
const B = [9, 4, 9, 8, 4]
const fig1: FigStep[] = [
  { note: '先把 nums1 加入集合，重複數值只留一次。', views: [arr(A, { label: 'nums1' })] },
  { note: '掃 nums2，第一個 9 在集合中，加入答案並刪除候選值。', views: [arr(B, { label: 'nums2', highlight: [0] }), arr([9], { label: '答案' })] },
  { note: '接著 4 也命中；後面的 9、4 已刪除，所以不再加入。', views: [arr(B, { label: 'nums2', done: [0, 1], dim: [2, 4] }), arr([9, 4], { label: '答案' })] },
  { note: '8 不在集合中；答案含 9、4 各一次。', views: [arr([9, 4], { label: '交集', done: [0, 1] })] },
]
const fig2: FigStep[] = [
  { note: '排序兩個陣列，讓相同數字排在一起。', views: [arr([4, 5, 9], { label: 'nums1' }), arr([4, 4, 8, 9, 9], { label: 'nums2' })] },
  { note: '兩邊都指向 4，記下 4，雙指標一起右移。', views: [arr([4, 5, 9], { label: 'nums1', highlight: [0] }), arr([4, 4, 8, 9, 9], { label: 'nums2', highlight: [0] })] },
  { note: '右側 4 小於左側 5，移右指標；接著 5 小於 8，移左指標。', views: [arr([4, 5, 9], { label: 'nums1', highlight: [2] }), arr([4, 4, 8, 9, 9], { label: 'nums2', highlight: [2] })] },
  { note: '右側 8 小於 9，移右指標；兩邊遇到 9，記下 9。', views: [arr([4, 9], { label: '交集', done: [0, 1] })] },
]
const wrap = {
  python: `

def intersectionCheck(nums1, nums2):
    return sorted(intersection(nums1, nums2))`,
  c: `

static int cmpCheck(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int *intersectionCheck(int *a, int an, int *b, int bn, int *rs) {
    int *out = intersection(a, an, b, bn, rs);
    qsort(out, *rs, sizeof(int), cmpCheck);
    return out;
}`,
  cpp: `

vector<int> intersectionCheck(vector<int> a, vector<int> b) {
    vector<int> out = intersection(a, b);
    sort(out.begin(), out.end());
    return out;
}`,
  java: `

int[] intersectionCheck(int[] a, int[] b) {
    int[] out = intersection(a, b);
    Arrays.sort(out);
    return out;
}`,
  javascript: `

function intersectionCheck(a, b) {
  return intersection(a, b).sort((x, y) => x - y);
}`,
}

export const q0349: Solution = {
  id: 349,
  plain: '找出兩個陣列共同出現的數字，每個數字只保留一次。',
  statement: '給定整數陣列 nums1、nums2，回傳它們的交集；結果不能重複，順序不限。',
  examples: [
    { input: 'nums1 = [1,2,2,1], nums2 = [2,2]', output: '[2]' },
    { input: 'nums1 = [4,9,5], nums2 = [9,4,9,8,4]', output: '[9,4]', note: '[4,9] 也正確。' },
  ],
  constraints: ['1 ≤ nums1.length, nums2.length ≤ 1000', '0 ≤ nums1[i], nums2[i] ≤ 1000'],
  insight: ['集合可快速判斷某值是否出現在另一個陣列。', '找到後刪除候選值，能保證每個結果只輸出一次。', '也能排序後用兩個指標比較。'],
  approaches: [
    {
      name: '雜湊集合',
      idea: '把 nums1 放入集合；掃 nums2，找到交集就加入結果並刪除候選值。',
      steps: ['建立 nums1 的集合', '依序掃 nums2', '命中集合就輸出目前值', '刪除已輸出的值'],
      figure: { title: 'nums1 = [4,9,5], nums2 = [9,4,9,8,4]', steps: fig1 },
      complexity: { time: '平均 O(n+m)', space: 'O(n)', why: '集合查詢、刪除平均為常數時間。' },
      verdict: '最直接的 [[p:hash-map]] 寫法。',
      code: {
        python: `def intersection(nums1, nums2):
    remaining = set(nums1)
    out = []
    for x in nums2:
        if x in remaining:
            out.append(x)               # 首次出現在兩邊
            remaining.remove(x)          # 避免重複輸出
    return out${wrap.python}`,
        c: `int *intersection(int *a, int an, int *b, int bn, int *rs) {
    bool seen[1001] = {false};
    int limit = an < bn ? an : bn;
    int *out = malloc(limit * sizeof(int));
    *rs = 0;
    for (int i = 0; i < an; i++) {
        seen[a[i]] = true;
    }
    for (int i = 0; i < bn; i++) {
        if (seen[b[i]]) {
            out[(*rs)++] = b[i];
            seen[b[i]] = false;
        }
    }
    return out;
}${wrap.c}`,
        cpp: `vector<int> intersection(vector<int>& a, vector<int>& b) {
    unordered_set<int> remaining(a.begin(), a.end());
    vector<int> out;
    for (int x : b) {
        if (remaining.erase(x)) {
            out.push_back(x);
        }
    }
    return out;
}${wrap.cpp}`,
        java: `int[] intersection(int[] a, int[] b) {
    Set<Integer> remaining = new HashSet<>();
    for (int x : a) {
        remaining.add(x);
    }
    List<Integer> out = new ArrayList<>();
    for (int x : b) {
        if (remaining.remove(x)) {
            out.add(x);
        }
    }
    int[] answer = new int[out.size()];
    for (int i = 0; i < out.size(); i++) {
        answer[i] = out.get(i);
    }
    return answer;
}${wrap.java}`,
        javascript: `function intersection(a, b) {
  const remaining = new Set(a);
  const out = [];
  for (const x of b) {
    if (remaining.has(x)) {
      out.push(x);
      remaining.delete(x);
    }
  }
  return out;
}${wrap.javascript}`,
      },
    },
    {
      name: '排序後雙指標',
      idea: '小的一側前進；相同時才加入結果，並與上個輸出比較以去重。',
      steps: ['排序兩個陣列', '兩指標各從開頭出發', '較小值的指標前進；相等時可輸出', '相等時雙指標一起前進，直到任一側用完'],
      figure: { title: '排序後比較', steps: fig2 },
      complexity: { time: 'O(n log n + m log m)', space: 'O(n+m)', why: '排序占主要時間；此版本先複製輸入。' },
      verdict: '已排序資料可直接用 [[p:two-pointers]]，時間降為 O(n+m)。',
      code: {
        python: `def intersection(nums1, nums2):
    a, b = sorted(nums1), sorted(nums2)
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] < b[j]:
            i += 1
        elif a[i] > b[j]:
            j += 1
        else:
            if not out or out[-1] != a[i]:
                out.append(a[i])         # 重複值只收一次
            i += 1
            j += 1
    return out${wrap.python}`,
        c: `static int cmpNum(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int *intersection(int *a, int an, int *b, int bn, int *rs) {
    qsort(a, an, sizeof(int), cmpNum);
    qsort(b, bn, sizeof(int), cmpNum);
    int limit = an < bn ? an : bn;
    int *out = malloc(limit * sizeof(int));
    int i = 0;
    int j = 0;
    *rs = 0;
    while (i < an && j < bn) {
        if (a[i] < b[j]) {
            i++;
        } else if (a[i] > b[j]) {
            j++;
        } else {
            if (*rs == 0 || out[*rs - 1] != a[i]) {
                out[(*rs)++] = a[i];
            }
            i++;
            j++;
        }
    }
    return out;
}${wrap.c}`,
        cpp: `vector<int> intersection(vector<int>& a, vector<int>& b) {
    vector<int> x = a;
    vector<int> y = b;
    sort(x.begin(), x.end());
    sort(y.begin(), y.end());
    vector<int> out;
    int i = 0;
    int j = 0;
    while (i < (int)x.size() && j < (int)y.size()) {
        if (x[i] < y[j]) {
            i++;
        } else if (x[i] > y[j]) {
            j++;
        } else {
            if (out.empty() || out.back() != x[i]) {
                out.push_back(x[i]);
            }
            i++;
            j++;
        }
    }
    return out;
}${wrap.cpp}`,
        java: `int[] intersection(int[] a, int[] b) {
    int[] x = a.clone();
    int[] y = b.clone();
    Arrays.sort(x);
    Arrays.sort(y);
    List<Integer> out = new ArrayList<>();
    int i = 0;
    int j = 0;
    while (i < x.length && j < y.length) {
        if (x[i] < y[j]) {
            i++;
        } else if (x[i] > y[j]) {
            j++;
        } else {
            if (out.isEmpty() || out.get(out.size() - 1) != x[i]) {
                out.add(x[i]);
            }
            i++;
            j++;
        }
    }
    int[] answer = new int[out.size()];
    for (int p = 0; p < out.size(); p++) {
        answer[p] = out.get(p);
    }
    return answer;
}${wrap.java}`,
        javascript: `function intersection(a, b) {
  const x = [...a].sort((u, v) => u - v);
  const y = [...b].sort((u, v) => u - v);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] < y[j]) {
      i++;
    } else if (x[i] > y[j]) {
      j++;
    } else {
      if (out.length === 0 || out[out.length - 1] !== x[i]) {
        out.push(x[i]);
      }
      i++;
      j++;
    }
  }
  return out;
}${wrap.javascript}`,
      },
    },
  ],
  pitfalls: ['結果不能有重複值。', '順序不限，所以檢查函式會排序結果。', '排序前先複製陣列，避免改動呼叫者資料。'],
  check: { kind: 'fn', fn: 'intersectionCheck', cases: [
    { args: [[1, 2, 2, 1], [2, 2]], out: [2] },
    { args: [A, B], out: [4, 9] },
    { args: [[1], [2]], out: [] },
    { args: [[0, 0, 1], [0, 1, 1]], out: [0, 1] },
  ] },
}
