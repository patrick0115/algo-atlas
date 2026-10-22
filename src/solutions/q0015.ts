import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 15. 3Sum

const A = [-1, 0, 1, 2, -1, -4, 2]

function bruteFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const found = new Set<string>()
  const out: FigStep[] = [
    { note: '暴力:三層迴圈試每一組 (i, j, k)。為了去重,先排序,讓同一組數字永遠以相同順序出現,再丟進 set', views: [arr(A, { label: 'nums' })] },
    { note: '排序後', views: [arr(s, { label: '排序後' })] },
  ]
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j < s.length; j++)
      for (let k = j + 1; k < s.length; k++) {
        if (s[i] + s[j] + s[k] !== 0) continue
        const key = `${s[i]},${s[j]},${s[k]}`
        const dup = found.has(key)
        found.add(key)
        out.push({ note: `(${i},${j},${k}):${s[i]} + ${s[j]} + ${s[k]} = 0${dup ? ',但這組數字已經在 set 裡了 → 重複,不加' : ' → 加進 set'}`, views: [arr(s, { label: '排序後', highlight: [i, j, k] }), kv([...found].map((x) => [`[${x}]`, '✓']), '答案 set', [`[${key}]`])] })
      }
  return out
}

function hashFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const out: FigStep[] = [{ note: '排序後固定第一個數 s[i],剩下就是「在 i 右邊找兩數和為 −s[i]」,用 Hash Set 邊走邊查(就是 1. Two Sum)', views: [arr(s, { label: '排序後' })] }]
  const res: string[] = []
  for (let i = 0; i < s.length && s[i] <= 0; i++) {
    if (i > 0 && s[i] === s[i - 1]) {
      out.push({ note: `s[${i}] = ${s[i]} 和前一個一樣 → 跳過,不然會找到重複的三元組`, views: [arr(s, { label: '排序後', highlight: [i], dim: range(0, i - 1) })] })
      continue
    }
    const seen = new Set<number>()
    for (let j = i + 1; j < s.length; j++) {
      const need = -s[i] - s[j]
      if (seen.has(need)) {
        const key = `[${s[i]},${need},${s[j]}]`
        if (res.at(-1) !== key) {
          res.push(key)
          out.push({ note: `固定 ${s[i]},走到 s[${j}] = ${s[j]},需要 ${need},seen 裡有 → 找到 ${key}`, views: [arr(s, { label: '排序後', highlight: [i, j], dim: range(0, i - 1) }), kv([...seen].map((v) => [v, '✓']), 'seen', [need])] })
        }
        while (j + 1 < s.length && s[j + 1] === s[j]) j++
      }
      seen.add(s[j])
    }
  }
  out.push({ note: `答案:${res.join('、')}`, views: [arr(s, { label: '排序後' })] })
  return out
}

function twoPtrFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const res: string[] = []
  const view = (i: number, l: number, r: number, opt: Parameters<typeof arr>[1] = {}) =>
    arr(s, { label: '排序後', dim: range(0, i - 1), pointers: [{ name: 'i', index: i, color: 'c' }, { name: 'L', index: l }, { name: 'R', index: r, color: 'b' }], ...opt })
  const out: FigStep[] = [{ note: '排序後固定 i,在 (i, n) 用左右雙指針找和為 −s[i] 的兩數(就是 167. Two Sum II)', views: [arr(s, { label: '排序後' })] }]
  for (let i = 0; i < s.length - 2; i++) {
    if (s[i] > 0) {
      out.push({ note: `s[${i}] = ${s[i]} > 0,後面的數都 ≥ 它,三個正數加起來不可能是 0 → 提早結束`, views: [arr(s, { label: '排序後', highlight: [i], dim: range(0, i - 1) })] })
      break
    }
    if (i > 0 && s[i] === s[i - 1]) {
      out.push({ note: `s[${i}] = ${s[i]} 和前一個一樣 → 跳過`, views: [arr(s, { label: '排序後', highlight: [i], dim: range(0, i - 1) })] })
      continue
    }
    let l = i + 1
    let r = s.length - 1
    while (l < r) {
      const sum = s[i] + s[l] + s[r]
      if (sum === 0) {
        res.push(`[${s[i]},${s[l]},${s[r]}]`)
        out.push({ note: `${s[i]} + ${s[l]} + ${s[r]} = 0 → 收下。L、R 都往內走,並跳過和剛剛一樣的值`, views: [view(i, l, r, { highlight: [i, l, r] })] })
        l++
        r--
        while (l < r && s[l] === s[l - 1]) l++
        while (l < r && s[r] === s[r + 1]) r--
      } else {
        out.push({ note: `${s[i]} + ${s[l]} + ${s[r]} = ${sum} ${sum < 0 ? '< 0 → 太小,L++' : '> 0 → 太大,R--'}`, views: [view(i, l, r, { compare: [l, r] })] })
        if (sum < 0) l++
        else r--
      }
    }
  }
  out.push({ note: `答案:${res.join('、')}`, views: [arr(s, { label: '排序後' })] })
  return out
}

export const q0015: Solution = {
  id: 15,
  plain: '在一堆數字裡,找出**所有三個加起來是 0** 的組合,而且同樣的組合只能算一次。就像找三個人分帳,有人多付、有人少付,三人加起來剛好打平。',
  statement:
    '給一個整數陣列 `nums`,找出所有**不重複**的三元組 `[a, b, c]`,三個數來自不同位置,且 `a + b + c = 0`。「不重複」是指數字組合不同:`[-1, 0, 1]` 和 `[0, 1, -1]` 算同一組。',
  examples: [
    { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', note: '兩個 -1 在不同位置,所以 [-1,-1,2] 可以' },
    { input: 'nums = [0,1,1]', output: '[]' },
    { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
  ],
  constraints: [
    '`3 ≤ nums.length ≤ 3000` → O(n³) 是 270 億次,太慢;O(n²) 是 900 萬,剛好',
    '答案要**去重** → 這題最難的部分不是找,而是不要重複',
  ],
  insight: [
    '暴力:三層迴圈 O(n³),還要用 set 去重',
    '降一層:固定第一個數 `a`,剩下就是「找兩數和為 −a」—— 這就是 Two Sum。用 Hash 或雙指針都是 O(n),總共 O(n²)',
    '**先排序**一次解決兩件事:① 可以用雙指針([167](#/q/167))② 相同的數會相鄰,去重只要「跳過和前一個一樣的」',
    '三個位置都要去重:`i` 跳過和前一個相同的值;找到答案後 `L`、`R` 也要跳過相同的值',
  ],
  approaches: [
    {
      name: '暴力 + set 去重',
      idea: '排序後三層迴圈,和為 0 就把 `(a, b, c)` 放進 set(排序過所以同一組數字的順序一定相同)。',
      steps: ['排序', '三層迴圈 `i < j < k`', '`nums[i] + nums[j] + nums[k] == 0` → 把 tuple 加進 set', '回傳 set 裡的所有組合'],
      figure: { title: 'nums = [-1,0,1,2,-1,-4,2]', steps: bruteFig() },
      complexity: { time: 'O(n³)', space: 'O(k)', why: 'C(n, 3) 組,每組 O(1)。k 是答案的數量。' },
      verdict: 'n = 3000 會超時。用來確認自己懂題意:去重靠「排序 + set」。',
      code: {
        python: `def threeSum(nums):
    nums.sort()
    n, res = len(nums), set()
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    res.add((nums[i], nums[j], nums[k]))
    return [list(t) for t in res]`,
        c: `int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int **threeSum(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    int cap = 16, n = 0;
    int **res = malloc(cap * sizeof(int *));
    for (int i = 0; i < numsSize; i++)
        for (int j = i + 1; j < numsSize; j++)
            for (int k = j + 1; k < numsSize; k++) {
                if (nums[i] + nums[j] + nums[k] != 0) continue;
                bool dup = false;                 // 已排序:同一組數字一定長得一樣
                for (int t = 0; t < n && !dup; t++)
                    dup = res[t][0] == nums[i] && res[t][1] == nums[j];
                if (dup) continue;
                if (n == cap) res = realloc(res, (cap *= 2) * sizeof(int *));
                res[n] = malloc(3 * sizeof(int));
                res[n][0] = nums[i]; res[n][1] = nums[j]; res[n][2] = nums[k];
                n++;
            }
    *returnSize = n;
    *returnColumnSizes = malloc((n ? n : 1) * sizeof(int));
    for (int t = 0; t < n; t++) (*returnColumnSizes)[t] = 3;
    return res;
}`,
        cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    set<vector<int>> res;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++)
                if (nums[i] + nums[j] + nums[k] == 0) res.insert({nums[i], nums[j], nums[k]});
    return vector<vector<int>>(res.begin(), res.end());
}`,
        java: `List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length;
    Set<List<Integer>> res = new HashSet<>();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            for (int k = j + 1; k < n; k++)
                if (nums[i] + nums[j] + nums[k] == 0) res.add(List.of(nums[i], nums[j], nums[k]));
    return new ArrayList<>(res);
}`,
        javascript: `function threeSum(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length, res = new Map();
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++)
        if (s[i] + s[j] + s[k] === 0) res.set(\`\${s[i]},\${s[j]},\${s[k]}\`, [s[i], s[j], s[k]]);
  return [...res.values()];
}`,
      },
    },
    {
      name: '排序 + 固定一個 + Hash Set 找另外兩個',
      idea: '排序後固定 `nums[i]`,在它右邊用 Hash Set 邊走邊查 `−nums[i] − nums[j]` 有沒有看過。',
      steps: ['排序', '`i` 跳過和前一個相同的值(`nums[i] > 0` 可以直接結束)', '`seen = 空 set`,`j` 從 `i+1` 往右', '`need = −nums[i] − nums[j]` 在 `seen` → 收下 `[nums[i], need, nums[j]]`,然後讓 `j` 跳過相同的值', '把 `nums[j]` 加進 `seen`'],
      figure: { title: 'nums = [-1,0,1,2,-1,-4,2]', steps: hashFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n 個 i,每個走一次 j 是 O(n)。每輪的 seen 最多 n 個數。' },
      verdict: '達到 O(n²),但多用 O(n) 空間,去重的細節也比雙指針容易寫錯。',
      code: {
        python: `def threeSum(nums):
    nums.sort()
    n, res = len(nums), []
    for i in range(n):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        seen = set()
        j = i + 1
        while j < n:
            need = -nums[i] - nums[j]
            if need in seen:
                res.append([nums[i], need, nums[j]])
                while j + 1 < n and nums[j + 1] == nums[j]:
                    j += 1                # 同一個 nums[j] 不要再配一次
            seen.add(nums[j])
            j += 1
    return res`,
        c: `int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

typedef struct { int key; UT_hash_handle hh; } Item;

int **threeSum(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    int cap = 16, n = 0;
    int **res = malloc(cap * sizeof(int *));
    for (int i = 0; i < numsSize && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        Item *seen = NULL, *it, *tmp;
        for (int j = i + 1; j < numsSize; j++) {
            int need = -nums[i] - nums[j];
            HASH_FIND_INT(seen, &need, it);
            if (it) {
                if (n == cap) res = realloc(res, (cap *= 2) * sizeof(int *));
                res[n] = malloc(3 * sizeof(int));
                res[n][0] = nums[i]; res[n][1] = need; res[n][2] = nums[j];
                n++;
                while (j + 1 < numsSize && nums[j + 1] == nums[j]) j++;
            }
            HASH_FIND_INT(seen, &nums[j], it);
            if (!it) {
                it = malloc(sizeof(Item));
                it->key = nums[j];
                HASH_ADD_INT(seen, key, it);
            }
        }
        HASH_ITER(hh, seen, it, tmp) { HASH_DEL(seen, it); free(it); }
    }
    *returnSize = n;
    *returnColumnSizes = malloc((n ? n : 1) * sizeof(int));
    for (int t = 0; t < n; t++) (*returnColumnSizes)[t] = 3;
    return res;
}`,
        cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> res;
    for (int i = 0; i < n && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        unordered_set<int> seen;
        for (int j = i + 1; j < n; j++) {
            int need = -nums[i] - nums[j];
            if (seen.count(need)) {
                res.push_back({nums[i], need, nums[j]});
                while (j + 1 < n && nums[j + 1] == nums[j]) j++;
            }
            seen.insert(nums[j]);
        }
    }
    return res;
}`,
        java: `List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length;
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < n && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        Set<Integer> seen = new HashSet<>();
        for (int j = i + 1; j < n; j++) {
            int need = -nums[i] - nums[j];
            if (seen.contains(need)) {
                res.add(List.of(nums[i], need, nums[j]));
                while (j + 1 < n && nums[j + 1] == nums[j]) j++;
            }
            seen.add(nums[j]);
        }
    }
    return res;
}`,
        javascript: `function threeSum(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length, res = [];
  for (let i = 0; i < n && s[i] <= 0; i++) {
    if (i > 0 && s[i] === s[i - 1]) continue;
    const seen = new Set();
    for (let j = i + 1; j < n; j++) {
      const need = -s[i] - s[j];
      if (seen.has(need)) {
        res.push([s[i], need, s[j]]);
        while (j + 1 < n && s[j + 1] === s[j]) j++;
      }
      seen.add(s[j]);
    }
  }
  return res;
}`,
      },
    },
    {
      name: '排序 + 固定一個 + 左右雙指針',
      idea: '排序後固定 `nums[i]`,在 `(i, n)` 用左右雙指針找和為 `−nums[i]` 的兩數。三個位置都跳過相同的值來去重。',
      steps: ['排序', '`i` 從 0 到 n−3:`nums[i] > 0` 就結束;和前一個相同就跳過', '`L = i+1`、`R = n−1`,`sum = nums[i] + nums[L] + nums[R]`', '`sum < 0` → `L++`;`sum > 0` → `R--`', '`sum == 0` → 收下,`L++`、`R--`,再讓 `L`、`R` 跳過和剛剛相同的值'],
      figure: { title: 'nums = [-1,0,1,2,-1,-4,2]', steps: twoPtrFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '排序 O(n log n);n 個 i,每個雙指針 O(n)。除了答案和排序本身,只用幾個指標。' },
      verdict: '標準解。這個「排序 + 固定一個 + 雙指針」的骨架可以直接推到 16. 3Sum Closest、18. 4Sum(再多固定一個)。',
      code: {
        python: `def threeSum(nums):
    nums.sort()
    n, res = len(nums), []
    for i in range(n - 2):
        if nums[i] > 0:
            break                         # 後面都 >= nums[i] > 0,不可能和為 0
        if i > 0 and nums[i] == nums[i - 1]:
            continue                      # 去重:同一個值只當一次第一個數
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1                # 去重:跳過相同的第二個數
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1                # 去重:跳過相同的第三個數
    return res`,
        c: `int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int **threeSum(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    int cap = 16, n = 0;
    int **res = malloc(cap * sizeof(int *));
    for (int i = 0; i < numsSize - 2 && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = numsSize - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                if (n == cap) res = realloc(res, (cap *= 2) * sizeof(int *));
                res[n] = malloc(3 * sizeof(int));
                res[n][0] = nums[i]; res[n][1] = nums[l]; res[n][2] = nums[r];
                n++;
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
                while (l < r && nums[r] == nums[r + 1]) r--;
            }
        }
    }
    *returnSize = n;
    *returnColumnSizes = malloc((n ? n : 1) * sizeof(int));
    for (int t = 0; t < n; t++) (*returnColumnSizes)[t] = 3;
    return res;
}`,
        cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> res;
    for (int i = 0; i < n - 2 && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                res.push_back({nums[i], nums[l], nums[r]});
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
                while (l < r && nums[r] == nums[r + 1]) r--;
            }
        }
    }
    return res;
}`,
        java: `List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length;
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < n - 2 && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                res.add(List.of(nums[i], nums[l], nums[r]));
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
                while (l < r && nums[r] == nums[r + 1]) r--;
            }
        }
    }
    return res;
}`,
        javascript: `function threeSum(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const n = s.length, res = [];
  for (let i = 0; i < n - 2 && s[i] <= 0; i++) {
    if (i > 0 && s[i] === s[i - 1]) continue;
    let l = i + 1, r = n - 1;
    while (l < r) {
      const sum = s[i] + s[l] + s[r];
      if (sum < 0) l++;
      else if (sum > 0) r--;
      else {
        res.push([s[i], s[l], s[r]]);
        l++;
        r--;
        while (l < r && s[l] === s[l - 1]) l++;
        while (l < r && s[r] === s[r + 1]) r--;
      }
    }
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '`i` 的去重要和**前一個**比(`nums[i] == nums[i−1]`),不是和下一個比:和下一個比會把 `[-1,-1,2]` 這種需要兩個相同數的答案漏掉',
    '找到一組之後忘了移動 `L`、`R`,會無窮迴圈;移動後還要跳過相同的值,不然會收到重複的答案',
    '`nums[i] > 0` 可以提早結束,但條件是 `> 0` 不是 `>= 0`,`[0,0,0]` 是合法答案',
    'JavaScript 一定要寫 `sort((a, b) => a - b)`,預設的字串排序會把 `-1` 排在 `-4` 前面',
  ],
  followUp: [
    { q: '4Sum 怎麼做?', a: '18. 4Sum:排序後固定兩個數(兩層迴圈,各自去重),剩下兩個用雙指針,O(n³)。可以推廣成 k-Sum 的遞迴。' },
    { q: '找最接近 target 的三數和?', a: '16. 3Sum Closest:一樣的雙指針,每一步更新「和 target 的差」最小的那個,不需要去重。' },
  ],
  check: {
    kind: 'fn',
    fn: 'threeSum',
    compare: 'groups',
    cases: [
      { args: [[-1, 0, 1, 2, -1, -4]], out: [[-1, -1, 2], [-1, 0, 1]] },
      { args: [[0, 1, 1]], out: [] },
      { args: [[0, 0, 0]], out: [[0, 0, 0]] },
      { args: [[0, 0, 0, 0]], out: [[0, 0, 0]] },
      { args: [A], out: [[-4, 2, 2], [-1, -1, 2], [-1, 0, 1]] },
      { args: [[-2, 0, 1, 1, 2]], out: [[-2, 0, 2], [-2, 1, 1]] },
      { args: [[3, 0, -2, -1, 1, 2]], out: [[-2, -1, 3], [-2, 0, 2], [-1, 0, 1]] },
    ],
  },
}
