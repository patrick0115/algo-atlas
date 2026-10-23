import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 448. Find All Numbers Disappeared in an Array

const A = [4, 3, 2, 7, 8, 2, 3, 1]

function setFig(): FigStep[] {
  const n = A.length
  const seen = Array.from({ length: n }, (_, i) => (A.includes(i + 1) ? '✓' : ''))
  return [
    { note: `開一個長度 n = ${n} 的表,掃一遍 nums,出現過的數打勾`, views: [arr(A, { label: 'nums' }), arr(seen, { label: '1..8 有沒有出現' })] },
    { note: '沒打勾的就是缺的:5 和 6', views: [arr(seen, { label: '1..8 有沒有出現', highlight: [4, 5] })] },
  ]
}

function negFig(): FigStep[] {
  const a = [...A]
  const out: FigStep[] = [{ note: '不想多開表?把 nums 自己當表:看到值 v,就把**索引 v−1** 的數改成負的,當作「v 出現過」的記號。值本身用絕對值讀,所以改成負的不會弄丟資訊', views: [arr(a, { label: 'nums' })] }]
  for (let i = 0; i < a.length; i++) {
    const v = Math.abs(a[i])
    const j = v - 1
    const was = a[j]
    a[j] = -Math.abs(a[j])
    if (i < 3 || i === 5 || i === a.length - 1) out.push({ note: `|nums[${i}]| = ${v} → 把 nums[${j}] 變負${was < 0 ? '(已經是負的,維持)' : ''}`, views: [arr(a, { label: 'nums', highlight: [j], compare: [i] })] })
  }
  const pos = a.map((x, i) => (x > 0 ? i : -1)).filter((i) => i >= 0)
  out.push({ note: `還是正數的位置 ${pos.join('、')} → 沒人來標記過 → 缺的是 ${pos.map((i) => i + 1).join('、')}`, views: [arr(a, { label: 'nums', done: pos })] })
  return out
}

export const q0448: Solution = {
  id: 448,
  plain: '有 n 個座位編號 1 到 n,來了 n 個人,每人拿著一張座位號碼的票,但有些票重複了。哪些座位沒有人坐?',
  statement: '給長度 n 的陣列 `nums`,每個值都在 `[1, n]`(可能重複)。回傳 `[1, n]` 中**沒出現**在 nums 的所有數。',
  examples: [
    { input: 'nums = [4,3,2,7,8,2,3,1]', output: '[5,6]' },
    { input: 'nums = [1,1]', output: '[2]' },
  ],
  constraints: ['n ≤ 10⁵', 'Follow-up:不用額外空間(回傳的陣列不算),O(n) 時間'],
  insight: ['值的範圍剛好是 1..n,和索引 0..n−1 一一對應', '所以可以拿陣列自己當「打勾表」:值 v 對應索引 v−1', '打勾的方式要能「還原」原本的值:改成負數(讀的時候取絕對值)'],
  approaches: [
    {
      name: '額外的標記表',
      idea: '`seen` 長度 n;掃 nums 標記;沒被標記的 i 就是缺的 i+1。',
      steps: ['`seen = [False] * n`', '`for v in nums`:`seen[v−1] = True`', '收集 `seen[i]` 為 False 的 `i + 1`'],
      figure: { title: `nums = [${A}]`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多開一個長度 n 的表。' },
      verdict: '最好懂,先寫這個再想怎麼省空間。',
      code: {
        python: `def findDisappearedNumbers(nums):
    n = len(nums)
    seen = [False] * (n + 1)
    for v in nums:
        seen[v] = True
    return [i for i in range(1, n + 1) if not seen[i]]`,
        c: `int *findDisappearedNumbers(int *nums, int numsSize, int *returnSize) {
    char *seen = calloc(numsSize + 1, 1);
    for (int i = 0; i < numsSize; i++) seen[nums[i]] = 1;
    int *res = malloc(numsSize * sizeof(int));
    *returnSize = 0;
    for (int v = 1; v <= numsSize; v++)
        if (!seen[v]) res[(*returnSize)++] = v;
    free(seen);
    return res;
}`,
        cpp: `vector<int> findDisappearedNumbers(vector<int>& nums) {
    int n = nums.size();
    vector<bool> seen(n + 1);
    for (int v : nums) seen[v] = true;
    vector<int> res;
    for (int v = 1; v <= n; v++) if (!seen[v]) res.push_back(v);
    return res;
}`,
        java: `List<Integer> findDisappearedNumbers(int[] nums) {
    int n = nums.length;
    boolean[] seen = new boolean[n + 1];
    for (int v : nums) seen[v] = true;
    List<Integer> res = new ArrayList<>();
    for (int v = 1; v <= n; v++) if (!seen[v]) res.add(v);
    return res;
}`,
        javascript: `function findDisappearedNumbers(nums) {
  const n = nums.length, seen = new Array(n + 1).fill(false);
  for (const v of nums) seen[v] = true;
  const res = [];
  for (let v = 1; v <= n; v++) if (!seen[v]) res.push(v);
  return res;
}`,
      },
    },
    {
      name: '原地用負號標記',
      idea: '看到 `|v|`,就把 `nums[|v|−1]` 變成負的;最後還是正數的位置 i,代表 i+1 沒出現過。',
      steps: ['`for x in nums`:`j = |x| − 1`,`nums[j] = −|nums[j]|`', '`for i`:`nums[i] > 0` → `i + 1` 缺了'],
      figure: { title: `nums = [${A}]`, steps: negFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只改原陣列的正負號,沒有額外的表。' },
      verdict: '最推薦(Follow-up 的答案)。「值域 = 索引範圍」時拿陣列自己當 Hash 表,[41](#/q/41)、[287](#/q/287) 也是這一招。',
      code: {
        python: `def findDisappearedNumbers(nums):
    for x in nums:
        j = abs(x) - 1                        # 值 |x| 對應的位置
        nums[j] = -abs(nums[j])               # 變負 = 「|x| 出現過」
    return [i + 1 for i, x in enumerate(nums) if x > 0]`,
        c: `int *findDisappearedNumbers(int *nums, int numsSize, int *returnSize) {
    for (int i = 0; i < numsSize; i++) {
        int j = abs(nums[i]) - 1;
        if (nums[j] > 0) nums[j] = -nums[j];
    }
    int *res = malloc(numsSize * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < numsSize; i++)
        if (nums[i] > 0) res[(*returnSize)++] = i + 1;
    return res;
}`,
        cpp: `vector<int> findDisappearedNumbers(vector<int>& nums) {
    for (int x : nums) {
        int j = abs(x) - 1;
        nums[j] = -abs(nums[j]);
    }
    vector<int> res;
    for (int i = 0; i < (int)nums.size(); i++) if (nums[i] > 0) res.push_back(i + 1);
    return res;
}`,
        java: `List<Integer> findDisappearedNumbers(int[] nums) {
    for (int x : nums) {
        int j = Math.abs(x) - 1;
        nums[j] = -Math.abs(nums[j]);
    }
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) if (nums[i] > 0) res.add(i + 1);
    return res;
}`,
        javascript: `function findDisappearedNumbers(nums) {
  for (const x of nums) {
    const j = Math.abs(x) - 1;
    nums[j] = -Math.abs(nums[j]);
  }
  const res = [];
  nums.forEach((x, i) => x > 0 && res.push(i + 1));
  return res;
}`,
      },
    },
  ],
  pitfalls: ['讀值時忘了取絕對值:那一格可能已經被別人改成負的', '直接 `nums[j] = -nums[j]`:重複的數會把它負負得正'],
  check: {
    kind: 'fn',
    fn: 'findDisappearedNumbers',
    cases: [
      { args: [A], out: [5, 6] },
      { args: [[1, 1]], out: [2] },
      { args: [[1]], out: [] },
      { args: [[2, 2, 2]], out: [1, 3] },
    ],
  },
}
