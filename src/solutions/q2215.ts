import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2215. Find the Difference of Two Arrays

const A = [1, 2, 3, 3]
const B = [1, 1, 2, 2, 4]

function setFig(): FigStep[] {
  const sa = [...new Set(A)]
  const sb = [...new Set(B)]
  const onlyA = sa.filter((x) => !sb.includes(x))
  const onlyB = sb.filter((x) => !sa.includes(x))
  return [
    { note: '先把兩個陣列各自變成集合:重複的數只留一個,而且之後問「x 在不在裡面」是 O(1)', views: [arr(A, { label: 'nums1' }), arr(sa, { label: 'set1' }), arr(B, { label: 'nums2' }), arr(sb, { label: 'set2' })] },
    { note: `set1 裡每個數去 set2 查:${sa.map((x) => `${x}${sb.includes(x) ? ' 在' : ' 不在'}`).join('、')} → 只在 nums1 的是 [${onlyA}]`, views: [arr(sa, { label: 'set1', highlight: sa.map((x, i) => (onlyA.includes(x) ? i : -1)).filter((i) => i >= 0), dim: sa.map((x, i) => (onlyA.includes(x) ? -1 : i)).filter((i) => i >= 0) }), arr(sb, { label: 'set2' })] },
    { note: `反過來 set2 每個數去 set1 查 → 只在 nums2 的是 [${onlyB}]。答案 [[${onlyA}], [${onlyB}]]`, views: [arr(sa, { label: 'set1' }), arr(sb, { label: 'set2', highlight: sb.map((x, i) => (onlyB.includes(x) ? i : -1)).filter((i) => i >= 0), dim: sb.map((x, i) => (onlyB.includes(x) ? -1 : i)).filter((i) => i >= 0) })] },
  ]
}

function markFig(): FigStep[] {
  // 值域 -1000..1000,這裡只畫 0..4
  const has = [0, 0, 0, 0, 0]
  A.forEach((x) => (has[x] |= 1))
  const s1 = [...has]
  B.forEach((x) => (has[x] |= 2))
  return [
    { note: '值域只有 −1000..1000,可以開一個表 `seen[v]`(用位元:1 表示在 nums1 出現,2 表示在 nums2 出現)。先掃 nums1', views: [arr(s1, { label: 'seen[0..4]', highlight: [1, 2, 3] })] },
    { note: '再掃 nums2,把 2 那一位也標上。seen = 3 表示兩邊都有', views: [arr(has, { label: 'seen[0..4]', highlight: [1, 2, 4] })] },
    { note: 'seen == 1 的(只在 nums1):[3];seen == 2 的(只在 nums2):[4]', views: [arr(has, { label: 'seen[0..4]', done: [3, 4], dim: [0, 1, 2] })] },
  ]
}

export const q2215: Solution = {
  id: 2215,
  plain: '兩個人各有一袋數字。找出「只有甲有、乙沒有」的數字,和「只有乙有、甲沒有」的數字,重複的只算一次。就像比對兩份名單,看誰只出現在其中一份。',
  statement: '給兩個整數陣列 `nums1`、`nums2`,回傳 `[a, b]`:a 是出現在 nums1 但不在 nums2 的**不同**整數,b 是出現在 nums2 但不在 nums1 的不同整數。各自的順序不限。',
  examples: [
    { input: 'nums1 = [1,2,3], nums2 = [2,4,6]', output: '[[1,3],[4,6]]' },
    { input: 'nums1 = [1,2,3,3], nums2 = [1,1,2,2]', output: '[[3],[]]' },
  ],
  constraints: ['長度 ≤ 1000', '值在 −1000 ~ 1000 → 也可以直接開陣列當標記表'],
  insight: ['「x 在不在另一邊」→ 把另一邊放進集合,查詢 O(1)', '「不同的」→ 自己這邊也要去重,用集合剛好兩件事一起解決', '值域很小時,集合可以換成長度 2001 的陣列'],
  approaches: [
    {
      name: '兩個集合互查',
      idea: '`s1 = set(nums1)`、`s2 = set(nums2)`;答案是 `s1 − s2` 和 `s2 − s1`。',
      steps: ['把兩個陣列轉成集合', '`a` = s1 裡不在 s2 的;`b` = s2 裡不在 s1 的', '回傳 `[a, b]`'],
      figure: { title: `nums1 = [${A}],nums2 = [${B}]`, steps: setFig() },
      complexity: { time: 'O(n + m)', space: 'O(n + m)', why: '建集合各掃一次,查詢每次 O(1)。' },
      verdict: '最推薦,[[p:hash-map]]最基本的用法:用集合做「在不在」的查詢。',
      code: {
        python: `def findDifference(nums1, nums2):
    s1, s2 = set(nums1), set(nums2)
    # 依原陣列順序輸出(去重),答案順序不限,這樣寫只是讓結果固定
    a = [x for x in dict.fromkeys(nums1) if x not in s2]
    b = [x for x in dict.fromkeys(nums2) if x not in s1]
    return [a, b]`,
        c: `// 值域 -1000..1000,用陣列當集合
int **findDifference(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize, int **returnColumnSizes) {
    char in1[2001] = {0}, in2[2001] = {0};
    for (int i = 0; i < nums1Size; i++) in1[nums1[i] + 1000] = 1;
    for (int i = 0; i < nums2Size; i++) in2[nums2[i] + 1000] = 1;
    int **res = malloc(2 * sizeof(int *));
    *returnColumnSizes = calloc(2, sizeof(int));
    res[0] = malloc(nums1Size * sizeof(int) + 1);
    res[1] = malloc(nums2Size * sizeof(int) + 1);
    for (int i = 0; i < nums1Size; i++) {
        int k = nums1[i] + 1000;
        if (!in2[k] && in1[k] == 1) { res[0][(*returnColumnSizes)[0]++] = nums1[i]; in1[k] = 2; }  // 2 = 已輸出
    }
    for (int i = 0; i < nums2Size; i++) {
        int k = nums2[i] + 1000;
        if (!in1[k] && in2[k] == 1) { res[1][(*returnColumnSizes)[1]++] = nums2[i]; in2[k] = 2; }
    }
    *returnSize = 2;
    return res;
}`,
        cpp: `vector<vector<int>> findDifference(vector<int>& nums1, vector<int>& nums2) {
    unordered_set<int> s1(nums1.begin(), nums1.end()), s2(nums2.begin(), nums2.end());
    vector<vector<int>> res(2);
    unordered_set<int> out;
    for (int x : nums1) if (!s2.count(x) && out.insert(x).second) res[0].push_back(x);
    out.clear();
    for (int x : nums2) if (!s1.count(x) && out.insert(x).second) res[1].push_back(x);
    return res;
}`,
        java: `List<List<Integer>> findDifference(int[] nums1, int[] nums2) {
    Set<Integer> s1 = new LinkedHashSet<>(), s2 = new LinkedHashSet<>();
    for (int x : nums1) s1.add(x);
    for (int x : nums2) s2.add(x);
    List<Integer> a = new ArrayList<>(), b = new ArrayList<>();
    for (int x : s1) if (!s2.contains(x)) a.add(x);
    for (int x : s2) if (!s1.contains(x)) b.add(x);
    return List.of(a, b);
}`,
        javascript: `function findDifference(nums1, nums2) {
  const s1 = new Set(nums1), s2 = new Set(nums2);
  return [[...s1].filter((x) => !s2.has(x)), [...s2].filter((x) => !s1.has(x))];
}`,
      },
    },
    {
      name: '值域標記表(位元)',
      idea: '`seen[v + 1000]`:nums1 有就 `|= 1`,nums2 有就 `|= 2`。最後 seen == 1 的歸 a,== 2 的歸 b。',
      steps: ['開長度 2001 的陣列 seen', '掃 nums1:`seen[x] |= 1`;掃 nums2:`seen[x] |= 2`', '從小到大看每個值:1 → 放進 a;2 → 放進 b'],
      figure: { title: `nums1 = [${A}],nums2 = [${B}]`, steps: markFig() },
      complexity: { time: 'O(n + m + V)', space: 'O(V)', why: 'V = 2001 是值域大小,常數。' },
      verdict: '沒有雜湊的成本,輸出還自動由小到大。只有值域小的時候能用。',
      code: {
        python: `def findDifference(nums1, nums2):
    seen = [0] * 2001
    for x in nums1:
        seen[x + 1000] |= 1                   # 第 0 位:出現在 nums1
    for x in nums2:
        seen[x + 1000] |= 2                   # 第 1 位:出現在 nums2
    a = [v - 1000 for v in range(2001) if seen[v] == 1]
    b = [v - 1000 for v in range(2001) if seen[v] == 2]
    return [a, b]`,
        c: `int **findDifference(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize, int **returnColumnSizes) {
    char seen[2001] = {0};
    for (int i = 0; i < nums1Size; i++) seen[nums1[i] + 1000] |= 1;
    for (int i = 0; i < nums2Size; i++) seen[nums2[i] + 1000] |= 2;
    int **res = malloc(2 * sizeof(int *));
    *returnColumnSizes = calloc(2, sizeof(int));
    res[0] = malloc(nums1Size * sizeof(int) + 1);
    res[1] = malloc(nums2Size * sizeof(int) + 1);
    for (int v = 0; v < 2001; v++) {
        if (seen[v] == 1) res[0][(*returnColumnSizes)[0]++] = v - 1000;
        if (seen[v] == 2) res[1][(*returnColumnSizes)[1]++] = v - 1000;
    }
    *returnSize = 2;
    return res;
}`,
        cpp: `vector<vector<int>> findDifference(vector<int>& nums1, vector<int>& nums2) {
    vector<char> seen(2001, 0);
    for (int x : nums1) seen[x + 1000] |= 1;
    for (int x : nums2) seen[x + 1000] |= 2;
    vector<vector<int>> res(2);
    for (int v = 0; v < 2001; v++) {
        if (seen[v] == 1) res[0].push_back(v - 1000);
        if (seen[v] == 2) res[1].push_back(v - 1000);
    }
    return res;
}`,
        java: `List<List<Integer>> findDifference(int[] nums1, int[] nums2) {
    byte[] seen = new byte[2001];
    for (int x : nums1) seen[x + 1000] |= 1;
    for (int x : nums2) seen[x + 1000] |= 2;
    List<Integer> a = new ArrayList<>(), b = new ArrayList<>();
    for (int v = 0; v < 2001; v++) {
        if (seen[v] == 1) a.add(v - 1000);
        if (seen[v] == 2) b.add(v - 1000);
    }
    return List.of(a, b);
}`,
        javascript: `function findDifference(nums1, nums2) {
  const seen = new Uint8Array(2001);
  for (const x of nums1) seen[x + 1000] |= 1;
  for (const x of nums2) seen[x + 1000] |= 2;
  const a = [], b = [];
  for (let v = 0; v < 2001; v++) {
    if (seen[v] === 1) a.push(v - 1000);
    if (seen[v] === 2) b.push(v - 1000);
  }
  return [a, b];
}`,
      },
    },
  ],
  pitfalls: ['忘了去重:nums1 = [3,3] 時答案只放一個 3', '負數不能直接當陣列索引,要先加 1000'],
  check: {
    kind: 'fn',
    fn: 'findDifference',
    compare: 'exact',
    cases: [
      { args: [[1, 2, 3], [2, 4, 6]], out: [[1, 3], [4, 6]] },
      { args: [[1, 2, 3, 3], [1, 1, 2, 2]], out: [[3], []] },
      { args: [A, B], out: [[3], [4]] },
      { args: [[-5, 0, 7], [7, 8]], out: [[-5, 0], [8]] },
    ],
  },
}
