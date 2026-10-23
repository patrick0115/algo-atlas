import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 496. Next Greater Element I

const N1 = [4, 1, 2]
const N2 = [1, 3, 4, 2]

function stackFig(): FigStep[] {
  return [
    { note: '先替 nums2 的每個數找「右邊第一個比它大的」,存進 Hash 表;nums1 的答案直接查表。找下一個更大 → 單調遞減堆疊', views: [arr(N2, { label: 'nums2' })] },
    { note: '1 push;3 比 1 大 → 1 的答案是 3,pop;3 push;4 比 3 大 → 3 的答案是 4;4 push;2 比 4 小 → push', views: [arr(N2, { label: 'nums2', done: [0, 1] }), arr([4, 2], { label: '堆疊(剩下的都沒有更大的)' }), kv([[1, 3], [3, 4]], '下一個更大')] },
    { note: '掃完堆疊裡還剩的 4、2 → −1。nums1 = [4, 1, 2] 查表 → [−1, 3, −1]', views: [kv([[1, 3], [3, 4], [4, -1], [2, -1]], '下一個更大', [4, 1, 2]), arr([-1, 3, -1], { label: '答案' })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:對 nums1 的每個 x,在 nums2 找到 x 的位置,再往右找第一個比 x 大的', views: [arr(N2, { label: 'nums2', highlight: [0], compare: [1] })] },
    { note: 'x = 1:位置 0,往右第一個比 1 大的是 3。最壞 O(m · n)', views: [arr(N2, { label: 'nums2', done: [1] })] },
  ]
}

export const q0496: Solution = {
  id: 496,
  plain: 'nums1 是 nums2 的一部分。對 nums1 裡的每個數,到 nums2 裡找到它,再往右看:第一個比它大的數是誰?沒有就是 −1。',
  statement: '`nums1` 是 `nums2` 的子集(值互不相同)。對每個 `nums1[i]`,找出它在 nums2 中右邊第一個比它大的數;不存在則為 −1。Follow-up:O(nums1.length + nums2.length)。',
  examples: [
    { input: 'nums1 = [4,1,2], nums2 = [1,3,4,2]', output: '[-1,3,-1]' },
    { input: 'nums1 = [2,4], nums2 = [1,2,3,4]', output: '[3,-1]' },
  ],
  constraints: ['長度 ≤ 1000,值互不相同'],
  insight: ['先把 nums2 每個數的答案都算好,nums1 只要查表', '「右邊第一個比我大的」→ [[p:monotonic-stack]]:堆疊保持遞減,新來的比頂端大就是頂端的答案', '和 [739. Daily Temperatures](#/q/739) 同一個模板'],
  approaches: [
    {
      name: '單調堆疊 + Hash 表',
      idea: '掃 nums2:`while st and st[-1] < x`:`nxt[st.pop()] = x`;push x。nums1 查 nxt(預設 −1)。',
      steps: ['`nxt = {}`、`st = []`', '`for x in nums2`:頂端比 x 小就彈出並記答案 x', 'push x', '回傳 `[nxt.get(v, −1) for v in nums1]`'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}]`, steps: stackFig() },
      complexity: { time: 'O(m + n)', space: 'O(n)', why: '每個數進出堆疊各一次。' },
      verdict: '最推薦(Follow-up 的答案)。',
      code: {
        python: `def nextGreaterElement(nums1, nums2):
    nxt, st = {}, []
    for x in nums2:
        while st and st[-1] < x:
            nxt[st.pop()] = x                 # x 是它右邊第一個更大的
        st.append(x)
    return [nxt.get(v, -1) for v in nums1]`,
        c: `int *nextGreaterElement(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize) {
    int nxt[10001], st[1000], top = 0;              // 值 ≤ 10⁴,用陣列當 Hash 表
    for (int v = 0; v <= 10000; v++) nxt[v] = -1;
    for (int i = 0; i < nums2Size; i++) {
        while (top && st[top - 1] < nums2[i]) nxt[st[--top]] = nums2[i];
        st[top++] = nums2[i];
    }
    int *res = malloc(nums1Size * sizeof(int));
    for (int i = 0; i < nums1Size; i++) res[i] = nxt[nums1[i]];
    *returnSize = nums1Size;
    return res;
}`,
        cpp: `vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
    unordered_map<int, int> nxt;
    vector<int> st, res;
    for (int x : nums2) {
        while (!st.empty() && st.back() < x) { nxt[st.back()] = x; st.pop_back(); }
        st.push_back(x);
    }
    for (int v : nums1) res.push_back(nxt.count(v) ? nxt[v] : -1);
    return res;
}`,
        java: `int[] nextGreaterElement(int[] nums1, int[] nums2) {
    Map<Integer, Integer> nxt = new HashMap<>();
    Deque<Integer> st = new ArrayDeque<>();
    for (int x : nums2) {
        while (!st.isEmpty() && st.peek() < x) nxt.put(st.pop(), x);
        st.push(x);
    }
    int[] res = new int[nums1.length];
    for (int i = 0; i < nums1.length; i++) res[i] = nxt.getOrDefault(nums1[i], -1);
    return res;
}`,
        javascript: `function nextGreaterElement(nums1, nums2) {
  const nxt = new Map(), st = [];
  for (const x of nums2) {
    while (st.length && st[st.length - 1] < x) nxt.set(st.pop(), x);
    st.push(x);
  }
  return nums1.map((v) => nxt.get(v) ?? -1);
}`,
      },
    },
    {
      name: '暴力:找到位置再往右掃',
      idea: '對每個 nums1[i]:在 nums2 找到它的位置 j,往右找第一個比它大的。',
      steps: ['`pos[v]` = v 在 nums2 的索引', '`for v in nums1`:`for k in pos[v]+1..n−1`:第一個 `nums2[k] > v` 就是答案', '沒找到 → −1'],
      figure: { title: `nums1 = [${N1}],nums2 = [${N2}]`, steps: bruteFig() },
      complexity: { time: 'O(m · n)', space: 'O(n)', why: '每個 nums1 的數最壞掃完 nums2。' },
      verdict: '長度只有 1000 也能過;拿來對照單調堆疊省下的重複掃描。',
      code: {
        python: `def nextGreaterElement(nums1, nums2):
    pos = {v: i for i, v in enumerate(nums2)}
    res = []
    for v in nums1:
        ans = -1
        for k in range(pos[v] + 1, len(nums2)):
            if nums2[k] > v:
                ans = nums2[k]
                break
        res.append(ans)
    return res`,
        c: `int *nextGreaterElement(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize) {
    int *res = malloc(nums1Size * sizeof(int));
    for (int i = 0; i < nums1Size; i++) {
        int j = 0;
        while (nums2[j] != nums1[i]) j++;
        res[i] = -1;
        for (int k = j + 1; k < nums2Size; k++) if (nums2[k] > nums1[i]) { res[i] = nums2[k]; break; }
    }
    *returnSize = nums1Size;
    return res;
}`,
        cpp: `vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
    vector<int> res;
    for (int v : nums1) {
        int j = find(nums2.begin(), nums2.end(), v) - nums2.begin(), ans = -1;
        for (int k = j + 1; k < (int)nums2.size(); k++) if (nums2[k] > v) { ans = nums2[k]; break; }
        res.push_back(ans);
    }
    return res;
}`,
        java: `int[] nextGreaterElement(int[] nums1, int[] nums2) {
    int[] res = new int[nums1.length];
    for (int i = 0; i < nums1.length; i++) {
        int j = 0;
        while (nums2[j] != nums1[i]) j++;
        res[i] = -1;
        for (int k = j + 1; k < nums2.length; k++) if (nums2[k] > nums1[i]) { res[i] = nums2[k]; break; }
    }
    return res;
}`,
        javascript: `function nextGreaterElement(nums1, nums2) {
  return nums1.map((v) => {
    for (let k = nums2.indexOf(v) + 1; k < nums2.length; k++) if (nums2[k] > v) return nums2[k];
    return -1;
  });
}`,
      },
    },
  ],
  pitfalls: ['在 nums1 上做單調堆疊:要找的是 nums2 裡的「右邊」,順序以 nums2 為準', '堆疊保持遞增:那會找到「下一個更小的」'],
  check: {
    kind: 'fn',
    fn: 'nextGreaterElement',
    cases: [
      { args: [N1, N2], out: [-1, 3, -1] },
      { args: [[2, 4], [1, 2, 3, 4]], out: [3, -1] },
      { args: [[1], [1]], out: [-1] },
      { args: [[3, 1, 5], [6, 5, 4, 3, 2, 1, 7]], out: [7, 7, 7] },
    ],
  },
}
