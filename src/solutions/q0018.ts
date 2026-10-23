import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 18. 4Sum

const A = [1, 0, -1, 0, -2, 2]
const T = 0

function fig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const n = s.length
  const out: FigStep[] = [{ note: '排序後,用兩層迴圈固定前兩個數 a = s[i]、b = s[j],剩下兩個數用左右雙指標在 j 右邊找(就是 [15. 3Sum](#/q/15) 多一層)', views: [arr(s, { label: '排序後' })] }]
  const found: number[][] = []
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && s[i] === s[i - 1]) continue
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && s[j] === s[j - 1]) continue
      let l = j + 1
      let r = n - 1
      while (l < r) {
        const sum = s[i] + s[j] + s[l] + s[r]
        if (sum === T) {
          found.push([s[i], s[j], s[l], s[r]])
          if (found.length <= 3) out.push({ note: `i=${i}、j=${j}:${s[i]} + ${s[j]} + ${s[l]} + ${s[r]} = ${T} ✓ 找到 [${s[i]},${s[j]},${s[l]},${s[r]}]。L、R 各自跳過相同的值,避免重複`, views: [arr(s, { label: '排序後', highlight: [i, j], done: [l, r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
          while (l < r && s[l] === s[l + 1]) l++
          while (l < r && s[r] === s[r - 1]) r--
          l++
          r--
        } else if (sum < T) l++
        else r--
      }
    }
  }
  out.push({ note: `全部:${found.map((q) => `[${q}]`).join('、')}。i、j 遇到和前一個一樣的值也要跳過`, views: [arr(s, { label: '排序後', done: s.map((_, k) => k) })] })
  return out
}

function kFig(): FigStep[] {
  return [
    { note: '把「固定一個數,剩下的變成 (k−1)Sum」寫成遞迴:kSum(start, k, target)。k == 2 時用雙指標', views: [arr(['4Sum', '→ 3Sum', '→ 2Sum(雙指標)'], { label: '遞迴往下' })] },
    { note: '每層都在 start 之後挑一個數(跳過重複值),target 減掉它,再往下一層。同一份程式就能解 3Sum、4Sum、5Sum…', views: [arr([-2, -1, 0, 0, 1, 2], { label: '排序後', highlight: [0], range: [1, 5] })] },
  ]
}

export const q0018: Solution = {
  id: 18,
  plain: '從一堆數字裡挑四個(位置不同),加起來剛好等於 target。把所有「不重複」的組合都找出來。',
  statement: '給整數陣列 `nums` 和 `target`,回傳所有**不重複**的四元組 `[a, b, c, d]`(索引互不相同)使 `a + b + c + d == target`。順序不限。',
  examples: [
    { input: 'nums = [1,0,-1,0,-2,2], target = 0', output: '[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]' },
    { input: 'nums = [2,2,2,2,2], target = 8', output: '[[2,2,2,2]]' },
  ],
  constraints: ['n ≤ 200 → O(n³) 約 800 萬可以', '值與 target 在 ±10⁹ → 四個相加會超過 32 位元,要用 64 位元'],
  insight: ['[15. 3Sum](#/q/15) 的延伸:排序 + 固定前面的數 + 最後兩個用雙指標', '去重:每一層遇到和上一個一樣的值就跳過', '可以推廣成 kSum 遞迴'],
  approaches: [
    {
      name: '排序 + 兩層迴圈 + 雙指標',
      idea: '固定 i、j(跳過重複),在 `(j, n)` 用左右雙指標找和為 `target − s[i] − s[j]` 的兩個數。',
      steps: ['排序', '`for i`(跳過重複)→ `for j > i`(跳過重複)', '`l = j + 1`、`r = n − 1`:和太小 `l += 1`、太大 `r -= 1`、剛好就記錄並跳過重複', '回傳所有結果'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: fig() },
      complexity: { time: 'O(n³)', space: 'O(1)(不算輸出)', why: '兩層迴圈 n²,每次雙指標 O(n)。' },
      verdict: '最推薦。去重邏輯和 3Sum 完全一樣,只是多一層。',
      code: {
        python: `def fourSum(nums, target):
    nums.sort()
    n, res = len(nums), []
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                          # 第一個數不重複
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue                      # 第二個數不重複
            l, r = j + 1, n - 1
            while l < r:
                s = nums[i] + nums[j] + nums[l] + nums[r]
                if s < target:
                    l += 1
                elif s > target:
                    r -= 1
                else:
                    res.append([nums[i], nums[j], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]:
                        l += 1
                    while l < r and nums[r] == nums[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
    return res`,
        c: `static int cmp(const void *a, const void *b) { int x = *(int *)a, y = *(int *)b; return (x > y) - (x < y); }

int **fourSum(int *nums, int numsSize, int target, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int cap = 64, n = numsSize;
    int **res = malloc(cap * sizeof(int *));
    *returnSize = 0;
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int l = j + 1, r = n - 1;
            while (l < r) {
                long long s = (long long)nums[i] + nums[j] + nums[l] + nums[r];
                if (s < target) l++;
                else if (s > target) r--;
                else {
                    if (*returnSize == cap) res = realloc(res, (cap *= 2) * sizeof(int *));
                    int *q = malloc(4 * sizeof(int));
                    q[0] = nums[i]; q[1] = nums[j]; q[2] = nums[l]; q[3] = nums[r];
                    res[(*returnSize)++] = q;
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
    }
    *returnColumnSizes = malloc((*returnSize + 1) * sizeof(int));
    for (int k = 0; k < *returnSize; k++) (*returnColumnSizes)[k] = 4;
    return res;
}`,
        cpp: `vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> res;
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int l = j + 1, r = n - 1;
            while (l < r) {
                long long s = (long long)nums[i] + nums[j] + nums[l] + nums[r];
                if (s < target) l++;
                else if (s > target) r--;
                else {
                    res.push_back({nums[i], nums[j], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
    }
    return res;
}`,
        java: `List<List<Integer>> fourSum(int[] nums, int target) {
    Arrays.sort(nums);
    int n = nums.length;
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < n - 3; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n - 2; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int l = j + 1, r = n - 1;
            while (l < r) {
                long s = (long) nums[i] + nums[j] + nums[l] + nums[r];
                if (s < target) l++;
                else if (s > target) r--;
                else {
                    res.add(List.of(nums[i], nums[j], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
    }
    return res;
}`,
        javascript: `function fourSum(nums, target) {
  nums.sort((a, b) => a - b);
  const n = nums.length, res = [];
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let l = j + 1, r = n - 1;
      while (l < r) {
        const s = nums[i] + nums[j] + nums[l] + nums[r];
        if (s < target) l++;
        else if (s > target) r--;
        else {
          res.push([nums[i], nums[j], nums[l], nums[r]]);
          while (l < r && nums[l] === nums[l + 1]) l++;
          while (l < r && nums[r] === nums[r - 1]) r--;
          l++;
          r--;
        }
      }
    }
  }
  return res;
}`,
      },
    },
    {
      name: '通用 kSum 遞迴',
      idea: '`kSum(start, k, target)`:k == 2 用雙指標;否則對每個 i ≥ start(跳過重複)遞迴 `kSum(i+1, k−1, target − s[i])`,把 s[i] 接到前面。',
      steps: ['排序', '`kSum(start, k, t)`:`k == 2` → 雙指標回傳所有配對', '否則 `for i in start..`(跳過重複):對 `kSum(i + 1, k − 1, t − s[i])` 的每個結果前面接上 s[i]', '回傳 `kSum(0, 4, target)`'],
      figure: { title: `nums = [${A}],target = ${T}`, steps: kFig() },
      complexity: { time: 'O(n^(k−1))', space: 'O(k)(遞迴深度,不算輸出)', why: 'k = 4 時就是 O(n³)。' },
      verdict: '一份程式解所有 kSum,面試官追問「5Sum 呢?」時很好用。',
      code: {
        python: `def fourSum(nums, target):
    nums.sort()

    def k_sum(start, k, t):
        res = []
        if k == 2:                            # 最底層:左右雙指標
            l, r = start, len(nums) - 1
            while l < r:
                s = nums[l] + nums[r]
                if s < t:
                    l += 1
                elif s > t:
                    r -= 1
                else:
                    res.append([nums[l], nums[r]])
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
            return res
        for i in range(start, len(nums) - k + 1):
            if i > start and nums[i] == nums[i - 1]:
                continue
            for rest in k_sum(i + 1, k - 1, t - nums[i]):
                res.append([nums[i]] + rest)
        return res

    return k_sum(0, 4, target)`,
        c: `// C 版:用一個暫存陣列 path 記目前挑了哪些數
static int *A_, N_, **R_, RS_, CAP_, path_[4];

static void kSum(int start, int k, long long t, int depth) {
    if (k == 2) {
        int l = start, r = N_ - 1;
        while (l < r) {
            long long s = (long long)A_[l] + A_[r];
            if (s < t) l++;
            else if (s > t) r--;
            else {
                if (RS_ == CAP_) R_ = realloc(R_, (CAP_ *= 2) * sizeof(int *));
                int *q = malloc(4 * sizeof(int));
                for (int d = 0; d < depth; d++) q[d] = path_[d];
                q[depth] = A_[l]; q[depth + 1] = A_[r];
                R_[RS_++] = q;
                l++;
                while (l < r && A_[l] == A_[l - 1]) l++;
            }
        }
        return;
    }
    for (int i = start; i <= N_ - k; i++) {
        if (i > start && A_[i] == A_[i - 1]) continue;
        path_[depth] = A_[i];
        kSum(i + 1, k - 1, t - A_[i], depth + 1);
    }
}

static int cmp(const void *a, const void *b) { int x = *(int *)a, y = *(int *)b; return (x > y) - (x < y); }

int **fourSum(int *nums, int numsSize, int target, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmp);
    A_ = nums; N_ = numsSize; RS_ = 0; CAP_ = 64;
    R_ = malloc(CAP_ * sizeof(int *));
    kSum(0, 4, target, 0);
    *returnSize = RS_;
    *returnColumnSizes = malloc((RS_ + 1) * sizeof(int));
    for (int k = 0; k < RS_; k++) (*returnColumnSizes)[k] = 4;
    return R_;
}`,
        cpp: `vector<vector<int>> kSum(vector<int>& a, int start, int k, long long t) {
    vector<vector<int>> res;
    if (k == 2) {
        int l = start, r = a.size() - 1;
        while (l < r) {
            long long s = (long long)a[l] + a[r];
            if (s < t) l++;
            else if (s > t) r--;
            else {
                res.push_back({a[l], a[r]});
                l++;
                while (l < r && a[l] == a[l - 1]) l++;
            }
        }
        return res;
    }
    for (int i = start; i <= (int)a.size() - k; i++) {
        if (i > start && a[i] == a[i - 1]) continue;
        for (auto &rest : kSum(a, i + 1, k - 1, t - a[i])) {
            rest.insert(rest.begin(), a[i]);
            res.push_back(rest);
        }
    }
    return res;
}

vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    return kSum(nums, 0, 4, target);
}`,
        java: `List<List<Integer>> fourSum(int[] nums, int target) {
    Arrays.sort(nums);
    return kSum(nums, 0, 4, target);
}

private List<List<Integer>> kSum(int[] a, int start, int k, long t) {
    List<List<Integer>> res = new ArrayList<>();
    if (k == 2) {
        int l = start, r = a.length - 1;
        while (l < r) {
            long s = (long) a[l] + a[r];
            if (s < t) l++;
            else if (s > t) r--;
            else {
                res.add(new ArrayList<>(List.of(a[l], a[r])));
                l++;
                while (l < r && a[l] == a[l - 1]) l++;
            }
        }
        return res;
    }
    for (int i = start; i <= a.length - k; i++) {
        if (i > start && a[i] == a[i - 1]) continue;
        for (List<Integer> rest : kSum(a, i + 1, k - 1, t - a[i])) {
            rest.add(0, a[i]);
            res.add(rest);
        }
    }
    return res;
}`,
        javascript: `function fourSum(nums, target) {
  nums.sort((a, b) => a - b);
  const kSum = (start, k, t) => {
    const res = [];
    if (k === 2) {
      let l = start, r = nums.length - 1;
      while (l < r) {
        const s = nums[l] + nums[r];
        if (s < t) l++;
        else if (s > t) r--;
        else {
          res.push([nums[l], nums[r]]);
          l++;
          while (l < r && nums[l] === nums[l - 1]) l++;
        }
      }
      return res;
    }
    for (let i = start; i <= nums.length - k; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      for (const rest of kSum(i + 1, k - 1, t - nums[i])) res.push([nums[i], ...rest]);
    }
    return res;
  };
  return kSum(0, 4, target);
}`,
      },
    },
  ],
  pitfalls: ['四個 10⁹ 相加超過 int:C/C++/Java 要先轉 64 位元再加', 'j 的去重條件寫成 `j > 0`:會把 j = i + 1 也跳掉,漏掉像 [2,2,2,2] 的答案', '找到一組之後只移動一邊的指標'],
  check: {
    kind: 'fn',
    fn: 'fourSum',
    compare: 'groups',
    cases: [
      { args: [A, T], out: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] },
      { args: [[2, 2, 2, 2, 2], 8], out: [[2, 2, 2, 2]] },
      { args: [[1000000000, 1000000000, 1000000000, 1000000000], -294967296], out: [] },
      { args: [[0, 0, 0], 0], out: [] },
      { args: [[-3, -1, 0, 2, 4, 5], 2], out: [[-3, -1, 2, 4]] },
    ],
  },
}
