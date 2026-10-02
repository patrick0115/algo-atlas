import type { ArrayViewData, Frame, Pattern } from '../types'
import { arr, parseInt_, parseInts, randInt, randInts, range } from '../engine/helpers'

type Opt = Omit<ArrayViewData, 'kind' | 'values'>

// ===== 雙指標(167. Two Sum II) =====

function* twoPointersRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 14 })
  for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) throw new Error('nums 必須由小到大排好')
  const target = parseInt_(v.target, 'target')
  let l = 0
  let r = a.length - 1
  const f = (line: string, note: string, opt: Opt = {}, answer?: string): Frame => ({
    line,
    note,
    vars: { l, r, target, ...(answer !== undefined ? { answer } : {}) },
    views: [arr(a, { dim: [...range(0, l - 1), ...range(r + 1, a.length - 1)], pointers: l <= r ? [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }] : [], ...opt })],
  })
  yield f('init', `陣列已排序。l 放最左(最小)、r 放最右(最大),要找兩數和 = ${target}`)
  while (l < r) {
    const s = a[l] + a[r]
    yield f('sum', `${a[l]} + ${a[r]} = ${s}`, { compare: [l, r] })
    if (s === target) {
      yield f('found', `剛好等於 ${target},找到了!`, { highlight: [l, r] }, 'found')
      return
    }
    if (s < target) {
      yield f('left', `${s} < ${target},太小了。要變大只能讓 l 往右(換一個更大的數)。${a[l]} 和任何數配都不夠大,可以丟掉`, { compare: [l, r] })
      l++
    } else {
      yield f('right', `${s} > ${target},太大了。r 往左(換一個更小的數)。${a[r]} 和任何數配都太大,可以丟掉`, { compare: [l, r] })
      r--
    }
  }
  yield f('none', '兩個指標相遇了,沒有找到', {}, 'none')
}

export const twoPointers: Pattern = {
  id: 'two-pointers',
  summary: '用兩個指標在陣列上移動,每次根據目前的狀況決定移動哪一個,把 O(n²) 的「兩兩配對」降成 O(n)。最常見的兩種:頭尾往中間夾(對撞指標),以及一快一慢同方向走。',
  analogy: '在排好身高的隊伍裡找兩個人,身高加起來剛好 340 公分:一個從最矮的開始、一個從最高的開始。加起來太高就換掉最高那個,太矮就換掉最矮那個。',
  steps: ['先確認陣列已排序(沒排就先排)', 'l = 0,r = 最後一格', '算 a[l] + a[r]', '等於目標 → 找到;太小 → l 往右;太大 → r 往左', '直到 l 和 r 相遇'],
  watch: ['灰框的兩格是目前在相加的兩個數', '變淡的格子已經被「證明不可能」而丟掉', '每一步只會丟掉一格,所以最多走 n 步'],
  whenToUse: ['已排序陣列找兩數 / 三數之和', '回文判斷(頭尾比較)', '原地移除、去重(快慢指標:慢的寫、快的讀)', '兩邊往中間收縮求面積(Container With Most Water)'],
  pitfalls: ['對撞指標通常需要陣列有序', '3Sum 這類要去重時,三個位置都要跳過相同的值', 'while 條件是 l < r(同一個元素不能用兩次)'],
  complexity: { time: 'O(n)', space: 'O(1)', why: '每一步 l 右移或 r 左移,兩者距離每次減 1,最多 n 步。' },
  demo: {
    title: '在排好序的陣列中找兩個數,和等於 target(LeetCode 167)',
    inputs: [
      { key: 'nums', label: 'nums(已排序)', default: '1,3,4,6,8,11,15' },
      { key: 'target', label: 'target', default: '14' },
    ],
    run: twoPointersRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 14 })
      const t = Number(v.target)
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) return 'found'
      return 'none'
    },
    random: () => ({ nums: randInts(randInt(1, 10), -10, 20).sort((x, y) => x - y).join(','), target: String(randInt(-10, 30)) }),
    code: {
      python: `def two_sum(a, target):
    l, r = 0, len(a) - 1                        #@init
    while l < r:
        s = a[l] + a[r]                         #@sum
        if s == target: return [l, r]           #@found
        if s < target: l += 1                   #@left
        else:          r -= 1                   #@right
    return None                                 #@none`,
      c: `int two_sum(int a[], int n, int target, int *ri, int *rj) {
    int l = 0, r = n - 1;                       //@init
    while (l < r) {
        int s = a[l] + a[r];                    //@sum
        if (s == target) { *ri = l; *rj = r; return 1; }  //@found
        if (s < target) l++;                    //@left
        else            r--;                    //@right
    }
    return 0;                                   //@none
}`,
      cpp: `vector<int> twoSum(vector<int>& a, int target) {
    int l = 0, r = a.size() - 1;                //@init
    while (l < r) {
        int s = a[l] + a[r];                    //@sum
        if (s == target) return {l, r};         //@found
        if (s < target) l++;                    //@left
        else            r--;                    //@right
    }
    return {};                                  //@none
}`,
      java: `int[] twoSum(int[] a, int target) {
    int l = 0, r = a.length - 1;                //@init
    while (l < r) {
        int s = a[l] + a[r];                    //@sum
        if (s == target) return new int[]{l, r};    //@found
        if (s < target) l++;                    //@left
        else            r--;                    //@right
    }
    return null;                                //@none
}`,
      javascript: `function twoSum(a, target) {
  let l = 0, r = a.length - 1;                  //@init
  while (l < r) {
    const s = a[l] + a[r];                      //@sum
    if (s === target) return [l, r];            //@found
    if (s < target) l++;                        //@left
    else            r--;                        //@right
  }
  return null;                                  //@none
}`,
    },
  },
}
// ===== 前綴和 =====

function* prefixRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 12 })
  const l = parseInt_(v.l, 'l', 0, a.length - 1)
  const r = parseInt_(v.r, 'r', l, a.length - 1)
  const P: (number | string)[] = [0]
  const f = (line: string, note: string, aOpt: Opt = {}, pOpt: Opt = {}, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { l, r, answer } : { l, r },
    views: [arr(a, { label: 'nums', ...aOpt }), arr(P, { label: 'P(P[i] = 前 i 個數的總和)', ...pOpt })],
  })
  yield f('init', 'P[0] = 0:前 0 個數的總和是 0', {}, { highlight: [0] })
  for (let i = 0; i < a.length; i++) {
    P.push((P[i] as number) + a[i])
    yield f('build', `P[${i + 1}] = P[${i}] + nums[${i}] = ${P[i]} + ${a[i]} = ${P[i + 1]}`, { highlight: [i], range: [0, i] }, { highlight: [i + 1], compare: [i] })
  }
  const ans = (P[r + 1] as number) - (P[l] as number)
  yield f('query', `要算 nums[${l}..${r}] 的總和:前 ${r + 1} 個的總和 − 前 ${l} 個的總和`, { range: [l, r] }, { compare: [l, r + 1] })
  yield f('query', `P[${r + 1}] − P[${l}] = ${P[r + 1]} − ${P[l]} = ${ans},只要 O(1)!`, { range: [l, r], highlight: range(l, r) }, { highlight: [l, r + 1] }, ans)
}

export const prefixSum: Pattern = {
  id: 'prefix-sum',
  summary: '先花 O(n) 算出「前 i 個數的總和」P[i],之後任何一段 nums[l..r] 的總和都只要 P[r+1] − P[l],O(1) 就能回答。',
  analogy: '像存摺的「累計餘額」欄:想知道 3 月到 6 月總共存了多少,不用一筆筆加,拿 6 月底的餘額減 2 月底的餘額就好。',
  steps: ['P[0] = 0', 'P[i+1] = P[i] + nums[i],一路累加', '區間 [l, r] 的和 = P[r+1] − P[l]'],
  watch: ['下面那排 P 比 nums 多一格(P[0] = 0)', '查詢時只用到 P 的兩格,和區間多長無關'],
  whenToUse: [
    '大量「區間和」查詢',
    '「和為 k 的子陣列有幾個」:前綴和 + Hash Map 記錄每個前綴和出現次數',
    '二維矩陣的子矩形和(二維前綴和)',
    '乘積版本:除了自己以外的乘積(左前綴積 × 右後綴積)',
  ],
  pitfalls: ['P 的長度是 n+1,索引容易差一', '陣列會被修改時前綴和要重算 → 改用樹狀陣列 / 線段樹', '注意總和可能溢位'],
  complexity: { time: '建表 O(n),每次查詢 O(1)', space: 'O(n)', why: '建表時每個數加一次;查詢只做一次減法。' },
  demo: {
    title: '建前綴和陣列,然後 O(1) 算出一段區間的和',
    inputs: [
      { key: 'nums', label: 'nums', default: '3,1,4,1,5,9,2,6' },
      { key: 'l', label: '查詢 l', default: '2' },
      { key: 'r', label: '查詢 r', default: '5' },
    ],
    run: prefixRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 12 })
      return a.slice(Number(v.l), Number(v.r) + 1).reduce((x, y) => x + y, 0)
    },
    random: () => {
      const n = randInt(1, 10)
      const l = randInt(0, n - 1)
      return { nums: randInts(n, -9, 9).join(','), l: String(l), r: String(randInt(l, n - 1)) }
    },
    code: {
      python: `def build(nums):
    P = [0]                                     #@init
    for x in nums:
        P.append(P[-1] + x)                     #@build
    return P

def range_sum(P, l, r):
    return P[r + 1] - P[l]                      #@query`,
      c: `// P 的長度要 n + 1
void build(int nums[], int n, int P[]) {
    P[0] = 0;                                   //@init
    for (int i = 0; i < n; i++)
        P[i + 1] = P[i] + nums[i];              //@build
}
int range_sum(int P[], int l, int r) {
    return P[r + 1] - P[l];                     //@query
}`,
      cpp: `vector<int> build(const vector<int>& nums) {
    vector<int> P(nums.size() + 1, 0);          //@init
    for (int i = 0; i < (int)nums.size(); i++)
        P[i + 1] = P[i] + nums[i];              //@build
    return P;
}
int rangeSum(const vector<int>& P, int l, int r) {
    return P[r + 1] - P[l];                     //@query
}`,
      java: `int[] build(int[] nums) {
    int[] P = new int[nums.length + 1];         //@init
    for (int i = 0; i < nums.length; i++)
        P[i + 1] = P[i] + nums[i];              //@build
    return P;
}
int rangeSum(int[] P, int l, int r) {
    return P[r + 1] - P[l];                     //@query
}`,
      javascript: `function build(nums) {
  const P = [0];                                //@init
  for (const x of nums)
    P.push(P[P.length - 1] + x);                //@build
  return P;
}
const rangeSum = (P, l, r) => P[r + 1] - P[l];  //@query`,
    },
  },
}

// ===== 差分陣列 =====

function parseOps(s: string, n: number): [number, number, number][] {
  const ops: [number, number, number][] = []
  for (const part of s.split(/[,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)\s*:\s*([+-]?\d+)$/)
    if (!m) throw new Error(`看不懂「${part}」,請寫成 1-3:+2(第 1 到 3 格加 2)`)
    const [l, r, x] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (l > r || r >= n) throw new Error(`「${part}」的範圍要在 0 ~ ${n - 1} 且左 <= 右`)
    ops.push([l, r, x])
  }
  if (ops.length > 8) throw new Error('示範用,最多 8 次操作')
  return ops
}

function* diffRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 12)
  const ops = parseOps(v.ops, n)
  const d = new Array(n + 1).fill(0)
  const out: number[] = []
  const f = (line: string, note: string, dOpt: Opt = {}, oOpt: Opt = {}, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [arr(d, { label: 'diff(差分陣列,多一格放「結束」標記)', ...dOpt }), arr(out, { label: '結果(diff 的前綴和)', ...oOpt })],
  })
  yield f('init', `長度 ${n} 的陣列一開始全是 0。要做 ${ops.length} 次「區間加值」`)
  for (const [l, r, x] of ops) {
    d[l] += x
    d[r + 1] -= x
    yield f('update', `區間 [${l}..${r}] 加 ${x}:只要 diff[${l}] += ${x}、diff[${r + 1}] −= ${x},兩格就搞定`, { highlight: [l, r + 1], range: [l, r] })
  }
  let run = 0
  for (let i = 0; i < n; i++) {
    run += d[i]
    out.push(run)
    yield f('restore', `結果[${i}] = 前面所有 diff 的和 = ${run}`, { range: [0, i], highlight: [i] }, { highlight: [i] })
  }
  yield f('done', '所有區間加值都完成了', {}, {}, out.join(','))
}

export const differenceArray: Pattern = {
  id: 'difference-array',
  summary: '要對很多個區間「整段加上 x」時,不用一格一格加,只要在起點 +x、終點的下一格 −x。最後做一次前綴和,就得到每一格的真正數值。',
  analogy: '公車上下車:不用記每一站車上有誰,只要記「這站上車幾人、下車幾人」。從頭累加,就知道每一站車上有多少人。',
  steps: ['開一個長度 n+1 的 diff 陣列,全是 0', '每次區間 [l, r] 加 x:diff[l] += x、diff[r+1] −= x', '全部操作做完後,對 diff 做前綴和,就是答案'],
  watch: ['每次操作只會動到 diff 的兩格(黑色)', '最後一路累加,+x 的效果會一直延續,直到遇到 −x 才抵消'],
  whenToUse: ['很多次「區間加值」,最後才問結果(Car Pooling、航班預訂)', '時間軸上的「開始 +1、結束 −1」(會議室需要幾間、人口最多的年份)'],
  pitfalls: ['diff 要開 n+1 格,否則 r = n−1 時 r+1 會越界', '中途要查詢某一格就不適合 → 改用樹狀陣列'],
  complexity: { time: 'O(n + 操作數)', space: 'O(n)', why: '每次操作 O(1),最後還原一次 O(n)。' },
  demo: {
    title: '對多個區間加值,最後一次還原(差分 + 前綴和)',
    inputs: [
      { key: 'n', label: '陣列長度 n', default: '8' },
      { key: 'ops', label: '操作(l-r:加值)', default: '1-4:+2, 3-6:+3, 0-2:-1' },
    ],
    run: diffRun,
    reference: (v) => {
      const n = Number(v.n)
      const a = new Array(n).fill(0)
      for (const [l, r, x] of parseOps(v.ops, n)) for (let i = l; i <= r; i++) a[i] += x
      return a.join(',')
    },
    random: () => {
      const n = randInt(1, 10)
      const ops = Array.from({ length: randInt(1, 5) }, () => {
        const l = randInt(0, n - 1)
        return `${l}-${randInt(l, n - 1)}:${randInt(-5, 5)}`
      })
      return { n: String(n), ops: ops.join(',') }
    },
    code: {
      python: `def apply(n, ops):
    diff = [0] * (n + 1)                        #@init
    for l, r, x in ops:
        diff[l] += x                            #@update
        diff[r + 1] -= x                        #@update
    res, run = [], 0
    for i in range(n):
        run += diff[i]                          #@restore
        res.append(run)                         #@restore
    return res                                  #@done`,
      c: `// ops[k] = {l, r, x};結果寫進 res
void apply(int n, int ops[][3], int m, int res[]) {
    int *diff = calloc(n + 1, sizeof(int));     //@init
    for (int k = 0; k < m; k++) {
        diff[ops[k][0]] += ops[k][2];           //@update
        diff[ops[k][1] + 1] -= ops[k][2];       //@update
    }
    int run = 0;
    for (int i = 0; i < n; i++) {
        run += diff[i];                         //@restore
        res[i] = run;                           //@restore
    }
    free(diff);                                 //@done
}`,
      cpp: `vector<int> apply(int n, vector<array<int,3>>& ops) {
    vector<int> diff(n + 1, 0), res(n);         //@init
    for (auto [l, r, x] : ops) {
        diff[l] += x;                           //@update
        diff[r + 1] -= x;                       //@update
    }
    int run = 0;
    for (int i = 0; i < n; i++) {
        run += diff[i];                         //@restore
        res[i] = run;                           //@restore
    }
    return res;                                 //@done
}`,
      java: `int[] apply(int n, int[][] ops) {
    int[] diff = new int[n + 1], res = new int[n];  //@init
    for (int[] op : ops) {
        diff[op[0]] += op[2];                   //@update
        diff[op[1] + 1] -= op[2];               //@update
    }
    int run = 0;
    for (int i = 0; i < n; i++) {
        run += diff[i];                         //@restore
        res[i] = run;                           //@restore
    }
    return res;                                 //@done
}`,
      javascript: `function apply(n, ops) {
  const diff = new Array(n + 1).fill(0);        //@init
  for (const [l, r, x] of ops) {
    diff[l] += x;                               //@update
    diff[r + 1] -= x;                           //@update
  }
  const res = []; let run = 0;
  for (let i = 0; i < n; i++) {
    run += diff[i];                             //@restore
    res.push(run);                              //@restore
  }
  return res;                                   //@done
}`,
    },
  },
}

// ===== 二分搜尋 =====

function* binaryRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 16 })
  for (let i = 1; i < a.length; i++) if (a[i] <= a[i - 1]) throw new Error('nums 必須嚴格遞增(由小到大、不重複)')
  const t = parseInt_(v.target, 'target')
  let lo = 0
  let hi = a.length - 1
  const f = (line: string, note: string, opt: Opt = {}, extra: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars: { lo, hi, target: t, ...extra },
    views: [
      arr(a, {
        dim: [...range(0, lo - 1), ...range(hi + 1, a.length - 1)],
        range: [lo, hi],
        ...opt,
      }),
    ],
  })
  yield f('init', `要在排好的陣列中找 ${t}。搜尋範圍一開始是整個陣列 [${lo}..${hi}]`)
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const ptr = { pointers: [{ name: 'lo', index: lo }, { name: 'mid', index: mid, color: 'b' as const }, { name: 'hi', index: hi, color: 'c' as const }] }
    yield f('mid', `看正中間:mid = (${lo} + ${hi}) / 2 = ${mid},a[mid] = ${a[mid]}`, { ...ptr, compare: [mid] }, { mid })
    if (a[mid] === t) {
      yield f('found', `${a[mid]} 就是 ${t},找到了,在第 ${mid} 格`, { ...ptr, highlight: [mid] }, { mid, answer: mid })
      return
    }
    if (a[mid] < t) {
      yield f('right', `${a[mid]} < ${t}:答案只可能在右半邊,左半邊(含 mid)全部丟掉`, { ...ptr, compare: [mid] }, { mid })
      lo = mid + 1
    } else {
      yield f('left', `${a[mid]} > ${t}:答案只可能在左半邊,右半邊(含 mid)全部丟掉`, { ...ptr, compare: [mid] }, { mid })
      hi = mid - 1
    }
  }
  yield f('none', `範圍空了(lo > hi),${t} 不在陣列裡`, { range: [1, 0] }, { answer: -1 })
}

export const binarySearch: Pattern = {
  id: 'binary-search',
  summary: '在「排好序」的資料裡找東西:每次看正中間那個,判斷答案在左半還是右半,把另一半整個丟掉。每一步範圍減半,所以很快。',
  analogy: '猜數字遊戲 1~100:猜 50,對方說「太大」,你就知道 50~100 全部不用猜了,下一次猜 25。最多 7 次就一定猜中。',
  steps: ['lo = 0,hi = n−1(閉區間)', 'while lo <= hi:mid = (lo + hi) / 2', 'a[mid] == target → 找到', 'a[mid] < target → 答案在右邊,lo = mid + 1', 'a[mid] > target → 答案在左邊,hi = mid − 1', '迴圈結束還沒找到 → 不存在'],
  watch: ['淡色底框是「還可能有答案」的範圍,每一步都砍掉一半', '變淡的格子已經被排除'],
  whenToUse: [
    '陣列有序,要找某個值 / 第一個 >= x 的位置(lower_bound)',
    '旋轉過的有序陣列(先判斷哪一半是有序的)',
    '「有單調性」的判斷:左邊都不行、右邊都行 → 二分找分界點',
    '要找「最小的可行值」→ 見「對答案二分」',
  ],
  pitfalls: ['區間寫法要一致:閉區間 [lo, hi] 搭配 lo <= hi、hi = mid − 1', 'lo = mid(不加一)很容易無窮迴圈', 'C/Java 中 (lo + hi) 可能溢位,寫成 lo + (hi − lo) / 2'],
  complexity: { time: 'O(log n)', space: 'O(1)', why: '每一步範圍減半,n 個數最多減半 log₂n 次就只剩 1 個。' },
  demo: {
    title: '在嚴格遞增的陣列中找 target 的位置(LeetCode 704)',
    inputs: [
      { key: 'nums', label: 'nums(遞增)', default: '2,5,8,12,16,23,38,56,72,91' },
      { key: 'target', label: 'target', default: '23' },
    ],
    run: binaryRun,
    reference: (v) => parseInts(v.nums, 'nums', { maxLen: 16 }).indexOf(Number(v.target)),
    random: () => {
      const s = [...new Set(randInts(randInt(1, 14), -30, 30))].sort((x, y) => x - y)
      return { nums: s.join(','), target: String(randInt(-32, 32)) }
    },
    code: {
      python: `def search(a, target):
    lo, hi = 0, len(a) - 1                      #@init
    while lo <= hi:
        mid = (lo + hi) // 2                    #@mid
        if a[mid] == target: return mid         #@found
        if a[mid] < target: lo = mid + 1        #@right
        else:               hi = mid - 1        #@left
    return -1                                   #@none`,
      c: `int search(int a[], int n, int target) {
    int lo = 0, hi = n - 1;                     //@init
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;           //@mid
        if (a[mid] == target) return mid;       //@found
        if (a[mid] < target) lo = mid + 1;      //@right
        else                 hi = mid - 1;      //@left
    }
    return -1;                                  //@none
}`,
      cpp: `int search(vector<int>& a, int target) {
    int lo = 0, hi = a.size() - 1;              //@init
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;           //@mid
        if (a[mid] == target) return mid;       //@found
        if (a[mid] < target) lo = mid + 1;      //@right
        else                 hi = mid - 1;      //@left
    }
    return -1;                                  //@none
}`,
      java: `int search(int[] a, int target) {
    int lo = 0, hi = a.length - 1;              //@init
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;           //@mid
        if (a[mid] == target) return mid;       //@found
        if (a[mid] < target) lo = mid + 1;      //@right
        else                 hi = mid - 1;      //@left
    }
    return -1;                                  //@none
}`,
      javascript: `function search(a, target) {
  let lo = 0, hi = a.length - 1;                //@init
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;                 //@mid
    if (a[mid] === target) return mid;          //@found
    if (a[mid] < target) lo = mid + 1;          //@right
    else                 hi = mid - 1;          //@left
  }
  return -1;                                    //@none
}`,
    },
  },
}

// ===== 對答案二分(875. Koko) =====

function* answerRun(v: Record<string, string>): Generator<Frame> {
  const piles = parseInts(v.piles, 'piles', { min: 1, max: 20, maxLen: 8 })
  const h = parseInt_(v.h, 'h', piles.length, 200)
  const maxP = Math.max(...piles)
  const speeds = range(1, maxP)
  let lo = 1
  let hi = maxP
  const verdict: (string | number)[] = speeds.map(() => '?')
  const f = (line: string, note: string, opt: Opt = {}, extra: Frame['vars'] = {}): Frame => ({
    line,
    note,
    vars: { lo, hi, h, ...extra },
    views: [
      arr(piles, { label: '每堆香蕉數 piles' }),
      arr(speeds, { label: '候選速度 k(每小時吃幾根)', range: [lo - 1, hi - 1], dim: [...range(0, lo - 2), ...range(hi, maxP - 1)], ...opt }),
      arr(verdict, { label: '這個速度來得及嗎?(✓ 可以 / ✗ 不行)' }),
    ],
  })
  yield f('init', `答案(速度)一定在 1 ~ ${maxP} 之間。而且速度越快越來得及 → 左邊一段 ✗、右邊一段 ✓,要找第一個 ✓`)
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0)
    const ok = hours <= h
    yield f('mid', `試速度 k = ${mid}:每堆要 ⌈堆/k⌉ 小時,總共 ${piles.map((p) => Math.ceil(p / mid)).join(' + ')} = ${hours} 小時`, { compare: [mid - 1], pointers: [{ name: 'mid', index: mid - 1 }] }, { mid, 花費: hours })
    verdict[mid - 1] = ok ? '✓' : '✗'
    if (ok) {
      yield f('ok', `${hours} <= ${h},來得及!答案可能就是 ${mid} 或更慢 → hi = ${mid}`, { highlight: [mid - 1] }, { mid })
      hi = mid
    } else {
      yield f('fail', `${hours} > ${h},來不及 → 一定要比 ${mid} 更快,lo = ${mid + 1}`, { compare: [mid - 1] }, { mid })
      lo = mid + 1
    }
  }
  yield f('done', `lo == hi == ${lo}:最慢但來得及的速度`, { highlight: [lo - 1] }, { answer: lo })
}

export const binarySearchAnswer: Pattern = {
  id: 'binary-search-answer',
  summary: '題目問「最小(或最大)的 X 是多少,才能做到某件事」,而且 X 越大越容易做到。那就不用直接算 X,而是對 X 的範圍做二分:每猜一個 X,檢查「做得到嗎?」',
  analogy: '要決定每天讀幾頁才能在期限前讀完一本書:不用解方程式,先猜每天 50 頁,讀得完就試少一點,讀不完就試多一點。',
  steps: ['確定答案的範圍 [lo, hi]', '寫一個 check(x):用 x 能不能做到?(通常是貪心模擬)', 'mid 做得到 → 答案可能更小,hi = mid', 'mid 做不到 → 答案一定更大,lo = mid + 1', 'lo == hi 時就是答案'],
  watch: ['中間那排是「答案的候選值」,不是原本的陣列', '最下面一排會慢慢出現 ✗✗✗✓✓✓ 的形狀 —— 這就是能二分的原因'],
  whenToUse: ['題目出現「最小的最大值」「最大的最小值」「至少要多少」', '直接算答案很難,但「給定答案,檢查行不行」很容易', 'Koko 吃香蕉、運輸包裹容量、分割陣列的最大和、花束天數'],
  pitfalls: ['確認單調性:x 可行時,x+1 一定也可行', 'lo、hi 的初始範圍要包含答案', '找最小可行值用 hi = mid;找最大可行值要用 lo = mid 並把 mid 取上整'],
  complexity: { time: 'O(n log M)', space: 'O(1)', why: 'M 是答案範圍大小,二分 log M 次,每次 check 掃一遍 n 個元素。' },
  demo: {
    title: '吃香蕉的最慢速度:h 小時內吃完所有堆(LeetCode 875)',
    inputs: [
      { key: 'piles', label: 'piles', default: '3,6,7,11' },
      { key: 'h', label: 'h 小時', default: '8' },
    ],
    run: answerRun,
    reference: (v) => {
      const piles = parseInts(v.piles, 'piles', { min: 1, max: 20, maxLen: 8 })
      for (let k = 1; ; k++) if (piles.reduce((s, p) => s + Math.ceil(p / k), 0) <= Number(v.h)) return k
    },
    random: () => {
      const p = randInts(randInt(1, 6), 1, 20)
      return { piles: p.join(','), h: String(randInt(p.length, 40)) }
    },
    code: {
      python: `def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)                      #@init
    while lo < hi:
        mid = (lo + hi) // 2
        hours = sum((p + mid - 1) // mid for p in piles)    #@mid
        if hours <= h: hi = mid                 #@ok
        else:          lo = mid + 1             #@fail
    return lo                                   #@done`,
      c: `int min_eating_speed(int piles[], int n, int h) {
    int lo = 1, hi = 0;                         //@init
    for (int i = 0; i < n; i++) if (piles[i] > hi) hi = piles[i];  //@init
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;                         //@mid
        for (int i = 0; i < n; i++) hours += (piles[i] + mid - 1) / mid;  //@mid
        if (hours <= h) hi = mid;               //@ok
        else            lo = mid + 1;           //@fail
    }
    return lo;                                  //@done
}`,
      cpp: `int minEatingSpeed(vector<int>& piles, int h) {
    int lo = 1, hi = *max_element(piles.begin(), piles.end());  //@init
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;                         //@mid
        for (int p : piles) hours += (p + mid - 1) / mid;   //@mid
        if (hours <= h) hi = mid;               //@ok
        else            lo = mid + 1;           //@fail
    }
    return lo;                                  //@done
}`,
      java: `int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = Arrays.stream(piles).max().getAsInt();     //@init
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;                         //@mid
        for (int p : piles) hours += (p + mid - 1) / mid;   //@mid
        if (hours <= h) hi = mid;               //@ok
        else            lo = mid + 1;           //@fail
    }
    return lo;                                  //@done
}`,
      javascript: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);          //@init
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hours = piles.reduce((s, p) => s + Math.ceil(p / mid), 0);  //@mid
    if (hours <= h) hi = mid;                   //@ok
    else            lo = mid + 1;               //@fail
  }
  return lo;                                    //@done
}`,
    },
  },
}

// ===== Hash Map(1. Two Sum) =====

function* hashRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 12 })
  const t = parseInt_(v.target, 'target')
  const seen = new Map<number, number>()
  const f = (line: string, note: string, opt: Opt = {}, hl: number[] = [], answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { target: t, answer } : { target: t },
    views: [arr(a, { label: 'nums', ...opt }), { kind: 'kv', label: 'seen:數值 → 位置(看過的數)', entries: [...seen.entries()], highlight: hl }],
  })
  yield f('init', `要找兩個數加起來 = ${t}。準備一本「看過的數」筆記本(Hash Map),查詢只要 O(1)`)
  for (let i = 0; i < a.length; i++) {
    const need = t - a[i]
    yield f('need', `走到 ${a[i]}:我需要的另一半是 ${t} − ${a[i]} = ${need}。筆記本裡有 ${need} 嗎?`, { highlight: [i], dim: range(i + 1, a.length - 1) }, seen.has(need) ? [need] : [])
    if (seen.has(need)) {
      const j = seen.get(need)!
      yield f('found', `有!${need} 在第 ${j} 格。答案是 [${j}, ${i}]`, { highlight: [j, i] }, [need], `${j},${i}`)
      return
    }
    seen.set(a[i], i)
    yield f('store', `沒有。把 ${a[i]} 記進筆記本(位置 ${i}),繼續往右`, { compare: [i], dim: range(i + 1, a.length - 1) }, [a[i]])
  }
  yield f('none', '走完了,沒有找到', {}, [], 'none')
}

export const hashMap: Pattern = {
  id: 'hash-map',
  summary: 'Hash Map(字典)可以用 O(1) 回答「這個東西出現過嗎?在哪?出現幾次?」。很多題目的暴力解要兩層迴圈去找,改成「邊走邊記、邊走邊查」就只要一層。',
  analogy: '像通訊錄:要找「小明」的電話不用從第一頁翻到最後,直接用名字查。Hash Map 就是讓程式也能「用名字直接查」。',
  steps: ['準備一個空的 map', '從左到右走過每個元素 x', '先查:map 裡有沒有我需要的東西(例如 target − x)?', '有 → 答案找到;沒有 → 把 x 記進 map,繼續'],
  watch: ['下面的方塊是筆記本裡記住的內容', '每一步都是「先查再記」,所以不會自己配到自己'],
  whenToUse: ['找配對:兩數之和、和為 k 的子陣列(配合前綴和)', '計數:字母異位詞、出現次數最多的元素', '分組:把「特徵」當 key(排序後的字串、計數陣列)', '記錄位置:最後一次出現在哪裡'],
  pitfalls: ['先查再存,避免同一個元素用兩次', 'key 要是不可變的(Python 用 tuple 不能用 list)', '只需要「有沒有」時用 Set 就好'],
  complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素查一次、存一次,平均都是 O(1)。' },
  demo: {
    title: '找兩個數加起來等於 target,回傳它們的位置(LeetCode 1)',
    inputs: [
      { key: 'nums', label: 'nums', default: '2,7,11,15,-3,4' },
      { key: 'target', label: 'target', default: '1' },
    ],
    run: hashRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 12 })
      const t = Number(v.target)
      for (let j = 0; j < a.length; j++) for (let i = j - 1; i >= 0; i--) if (a[i] + a[j] === t) return `${i},${j}`
      return 'none'
    },
    random: () => ({ nums: randInts(randInt(1, 10), -5, 9).join(','), target: String(randInt(-6, 14)) }),
    code: {
      python: `def two_sum(nums, target):
    seen = {}                                   #@init
    for i, x in enumerate(nums):
        need = target - x                       #@need
        if need in seen:                        #@need
            return [seen[need], i]              #@found
        seen[x] = i                             #@store
    return None                                 #@none`,
      c: `// C 沒有內建 Hash Map,這裡用 uthash(LeetCode 環境內建)
typedef struct { int key, idx; UT_hash_handle hh; } Item;
int* twoSum(int* nums, int n, int target, int* retSize) {
    Item *seen = NULL, *it;                     //@init
    for (int i = 0; i < n; i++) {
        int need = target - nums[i];            //@need
        HASH_FIND_INT(seen, &need, it);         //@need
        if (it) {
            int *r = malloc(2 * sizeof(int));   //@found
            r[0] = it->idx; r[1] = i; *retSize = 2;  //@found
            return r;                           //@found
        }
        it = malloc(sizeof(Item));              //@store
        it->key = nums[i]; it->idx = i;         //@store
        HASH_ADD_INT(seen, key, it);            //@store
    }
    *retSize = 0; return NULL;                  //@none
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;               //@init
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];            //@need
        auto it = seen.find(need);              //@need
        if (it != seen.end())
            return {it->second, i};             //@found
        seen[nums[i]] = i;                      //@store
    }
    return {};                                  //@none
}`,
      java: `int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();   //@init
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];            //@need
        if (seen.containsKey(need))             //@need
            return new int[]{seen.get(need), i};    //@found
        seen.put(nums[i], i);                   //@store
    }
    return null;                                //@none
}`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map();                       //@init
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];              //@need
    if (seen.has(need))                         //@need
      return [seen.get(need), i];               //@found
    seen.set(nums[i], i);                       //@store
  }
  return null;                                  //@none
}`,
    },
  },
}

// ===== 堆疊(20. Valid Parentheses) =====

const PAIR: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function* stackRun(v: Record<string, string>): Generator<Frame> {
  const s = v.s.trim()
  if (!/^[()[\]{}]{1,16}$/.test(s)) throw new Error('s 只能包含 ()[]{},長度 1~16')
  const chars = s.split('')
  const st: string[] = []
  const f = (line: string, note: string, opt: Opt = {}, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [arr(chars, { label: '字串 s', ...opt }), arr(st, { label: '堆疊(左邊是底、右邊是頂)', highlight: st.length ? [st.length - 1] : [] })],
  })
  yield f('init', '準備一個空堆疊。規則:左括號放進去;右括號要和「最上面」那個配對')
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (!PAIR[c]) {
      st.push(c)
      yield f('push', `${c} 是左括號,放到堆疊頂端,等待之後的右括號來配對`, { highlight: [i], dim: range(0, i - 1) })
      continue
    }
    const top = st.at(-1)
    yield f('check', `${c} 是右括號,看堆疊頂端:${top ?? '(空的)'}`, { highlight: [i], dim: range(0, i - 1) })
    if (top !== PAIR[c]) {
      yield f('fail', top ? `${top} 和 ${c} 配不起來 → 不合法` : '堆疊是空的,沒有左括號可以配 → 不合法', { highlight: [i] }, 'false')
      return
    }
    st.pop()
    yield f('pop', `${top}${c} 配對成功,把 ${top} 從頂端拿掉`, { dim: range(0, i) })
  }
  yield f('end', st.length ? `走完了,但堆疊裡還剩 ${st.join('')} 沒有配對 → 不合法` : '走完了,堆疊是空的 → 全部配對成功', { dim: range(0, chars.length - 1) }, st.length ? 'false' : 'true')
}

export const stack: Pattern = {
  id: 'stack',
  summary: '堆疊是「後進先出」的容器:最後放進去的,最先拿出來。凡是「最近的那個還沒處理完的東西」需要被配對或回頭處理時,就用堆疊。',
  analogy: '一疊盤子:新洗好的放最上面,要用時也從最上面拿。你永遠只能碰到最上面那一個。',
  steps: ['準備空堆疊', '遇到「開始」(左括號、數字、資料夾名)→ push 進去', '遇到「結束」(右括號、運算子、..)→ 看 / 拿頂端那個來處理', '最後檢查堆疊是否清空'],
  watch: ['下面那排是堆疊,最右邊(黑色)是頂端', '右括號永遠只和頂端配對 —— 這就是「最近一個未配對」'],
  whenToUse: ['括號配對、巢狀結構(Decode String、Simplify Path)', '運算式計算(逆波蘭、計算機)', '把遞迴改成迴圈(DFS、中序遍歷)', '需要「下一個更大 / 更小」→ 見單調堆疊'],
  pitfalls: ['pop 或看頂端前要先確認堆疊不是空的', '最後別忘了檢查堆疊是否清空'],
  complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元最多 push 一次、pop 一次。' },
  demo: {
    title: '括號是否正確配對(LeetCode 20)',
    inputs: [{ key: 's', label: 's', default: '{[()()]}(' }],
    run: stackRun,
    reference: (v) => {
      let s = v.s.trim()
      let prev = ''
      while (s !== prev) {
        prev = s
        s = s.replace(/\(\)|\[\]|\{\}/g, '')
      }
      return s === '' ? 'true' : 'false'
    },
    random: () => ({ s: Array.from({ length: randInt(1, 10) }, () => '()[]{}'[randInt(0, 5)]).join('') }),
    code: {
      python: `def is_valid(s):
    pair = {')': '(', ']': '[', '}': '{'}
    st = []                                     #@init
    for c in s:
        if c not in pair:
            st.append(c)                        #@push
        else:
            if not st or st[-1] != pair[c]:     #@check
                return False                    #@fail
            st.pop()                            #@pop
    return not st                               #@end`,
      c: `bool isValid(char *s) {
    int n = strlen(s), top = 0;
    char *st = malloc(n + 1);                   //@init
    for (int i = 0; i < n; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[top++] = c;                      //@push
        } else {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || st[top - 1] != want) {  //@check
                free(st); return false;         //@fail
            }
            top--;                              //@pop
        }
    }
    free(st);
    return top == 0;                            //@end
}`,
      cpp: `bool isValid(string s) {
    unordered_map<char, char> pair{{')','('}, {']','['}, {'}','{'}};
    stack<char> st;                             //@init
    for (char c : s) {
        if (!pair.count(c)) {
            st.push(c);                         //@push
        } else {
            if (st.empty() || st.top() != pair[c])  //@check
                return false;                   //@fail
            st.pop();                           //@pop
        }
    }
    return st.empty();                          //@end
}`,
      java: `boolean isValid(String s) {
    Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');
    Deque<Character> st = new ArrayDeque<>();   //@init
    for (char c : s.toCharArray()) {
        if (!pair.containsKey(c)) {
            st.push(c);                         //@push
        } else {
            if (st.isEmpty() || st.peek() != pair.get(c))   //@check
                return false;                   //@fail
            st.pop();                           //@pop
        }
    }
    return st.isEmpty();                        //@end
}`,
      javascript: `function isValid(s) {
  const pair = { ')': '(', ']': '[', '}': '{' };
  const st = [];                                //@init
  for (const c of s) {
    if (!(c in pair)) {
      st.push(c);                               //@push
    } else {
      if (!st.length || st[st.length - 1] !== pair[c])  //@check
        return false;                           //@fail
      st.pop();                                 //@pop
    }
  }
  return st.length === 0;                       //@end
}`,
    },
  },
}

// ===== 單調堆疊(739. Daily Temperatures) =====

function* monoStackRun(v: Record<string, string>): Generator<Frame> {
  const t = parseInts(v.temps, 'temps', { min: 0, max: 99, maxLen: 12 })
  const ans = new Array(t.length).fill(0)
  const st: number[] = []
  const f = (line: string, note: string, opt: Opt = {}, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      arr(t, { label: '每天氣溫', mode: 'bars', ...opt }),
      arr(st.map((i) => `${t[i]}`), { label: '堆疊(存「還在等更熱那天」的日子;由底到頂溫度遞減)' }),
      arr(ans, { label: 'answer:要等幾天才會更熱' }),
    ],
  })
  yield f('init', '目標:每一天要等幾天才會遇到更熱的一天。堆疊裡放「還沒等到答案的日子」')
  for (let i = 0; i < t.length; i++) {
    yield f('visit', `第 ${i} 天,${t[i]} 度`, { highlight: [i], compare: [...st] })
    while (st.length && t[st.at(-1)!] < t[i]) {
      const j = st.pop()!
      ans[j] = i - j
      yield f('pop', `${t[i]} 度 > 堆疊頂端第 ${j} 天的 ${t[j]} 度 → 第 ${j} 天終於等到了,答案 ${i} − ${j} = ${i - j}`, { highlight: [i], done: [j], compare: [...st] })
    }
    st.push(i)
    yield f('push', `第 ${i} 天自己也還在等更熱的日子,放進堆疊`, { highlight: [i], compare: [...st] })
  }
  yield f('end', `走完了,堆疊裡剩下的日子之後都沒有更熱的,答案維持 0`, {}, ans.join(','))
}

export const monotonicStack: Pattern = {
  id: 'monotonic-stack',
  summary: '堆疊裡的元素保持「單調遞增」或「單調遞減」。新元素進來前,把破壞單調性的元素彈出 —— 被彈出的那一刻,就找到了它的「下一個更大(或更小)元素」。',
  analogy: '排隊看遊行:矮的人站在高的人後面會被擋住。每來一個高個子,前面比他矮、還在等「誰比我高」的人,就都知道答案了,可以離開隊伍。',
  steps: ['堆疊存「索引」(還沒找到答案的元素)', '對每個新元素 x:', '　當堆疊頂端比 x 小 → 頂端找到答案了(就是 x),彈出並記錄', '　重複直到頂端 >= x 或堆疊空', '把 x 推入堆疊'],
  watch: ['灰框的長條是目前在堆疊裡、還在等答案的日子', '每來一個比較熱的日子,會一口氣「解決」好幾個', '淺色底的長條是已經找到答案的日子'],
  whenToUse: ['「下一個更大 / 更小的元素」「往左 / 往右第一個比我大的」', '柱狀圖最大矩形、接雨水', '以每個元素為最小值的子陣列範圍(Sum of Subarray Minimums)', '移除 k 個數字讓結果最小(Remove K Digits)'],
  pitfalls: ['堆疊通常存索引而不是值,才算得出距離', '想清楚要「嚴格」還是「非嚴格」單調(< 還是 <=)', '迴圈結束時堆疊裡剩下的元素,代表「找不到」'],
  complexity: { time: 'O(n)', space: 'O(n)', why: '雖然有 while,但每個元素只會被 push 一次、pop 一次。' },
  demo: {
    title: '每天要等幾天才會更熱(LeetCode 739)',
    inputs: [{ key: 'temps', label: '每天氣溫', default: '73,74,75,71,69,72,76,73' }],
    run: monoStackRun,
    reference: (v) => {
      const t = parseInts(v.temps, 'temps', { min: 0, max: 99, maxLen: 12 })
      return t.map((x, i) => {
        for (let j = i + 1; j < t.length; j++) if (t[j] > x) return j - i
        return 0
      }).join(',')
    },
    random: () => ({ temps: randInts(randInt(1, 10), 60, 80).join(',') }),
    code: {
      python: `def daily_temperatures(t):
    ans = [0] * len(t)
    st = []                                     #@init
    for i, x in enumerate(t):                   #@visit
        while st and t[st[-1]] < x:
            j = st.pop()                        #@pop
            ans[j] = i - j                      #@pop
        st.append(i)                            #@push
    return ans                                  #@end`,
      c: `int* dailyTemperatures(int* t, int n, int* retSize) {
    int *ans = calloc(n, sizeof(int)), *st = malloc(n * sizeof(int)), top = 0;  //@init
    for (int i = 0; i < n; i++) {               //@visit
        while (top > 0 && t[st[top - 1]] < t[i]) {
            int j = st[--top];                  //@pop
            ans[j] = i - j;                     //@pop
        }
        st[top++] = i;                          //@push
    }
    free(st); *retSize = n;
    return ans;                                 //@end
}`,
      cpp: `vector<int> dailyTemperatures(vector<int>& t) {
    vector<int> ans(t.size(), 0);
    stack<int> st;                              //@init
    for (int i = 0; i < (int)t.size(); i++) {   //@visit
        while (!st.empty() && t[st.top()] < t[i]) {
            int j = st.top(); st.pop();         //@pop
            ans[j] = i - j;                     //@pop
        }
        st.push(i);                             //@push
    }
    return ans;                                 //@end
}`,
      java: `int[] dailyTemperatures(int[] t) {
    int[] ans = new int[t.length];
    Deque<Integer> st = new ArrayDeque<>();     //@init
    for (int i = 0; i < t.length; i++) {        //@visit
        while (!st.isEmpty() && t[st.peek()] < t[i]) {
            int j = st.pop();                   //@pop
            ans[j] = i - j;                     //@pop
        }
        st.push(i);                             //@push
    }
    return ans;                                 //@end
}`,
      javascript: `function dailyTemperatures(t) {
  const ans = new Array(t.length).fill(0);
  const st = [];                                //@init
  for (let i = 0; i < t.length; i++) {          //@visit
    while (st.length && t[st[st.length - 1]] < t[i]) {
      const j = st.pop();                       //@pop
      ans[j] = i - j;                           //@pop
    }
    st.push(i);                                 //@push
  }
  return ans;                                   //@end
}`,
    },
  },
}

// ===== 單調佇列(239. Sliding Window Maximum) =====

function* monoQueueRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 12 })
  const k = parseInt_(v.k, 'k', 1, a.length)
  const dq: number[] = []
  const out: number[] = []
  const f = (line: string, note: string, opt: Opt = {}, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { k, answer } : { k },
    views: [
      arr(a, { label: 'nums', ...opt }),
      arr(dq.map((i) => a[i]), { label: 'deque(存索引,值由前往後遞減;最前面就是視窗最大值)', highlight: dq.length ? [0] : [] }),
      arr(out, { label: '每個視窗的最大值' }),
    ],
  })
  yield f('init', `視窗大小 k = ${k}。用一個雙端佇列 deque,讓它的值永遠由大到小排`)
  for (let i = 0; i < a.length; i++) {
    const win: [number, number] = [Math.max(0, i - k + 1), i]
    if (dq.length && dq[0] <= i - k) {
      const old = dq.shift()!
      yield f('expire', `第 ${old} 格已經滑出視窗了,從 deque 前面移除`, { range: win, dim: [old] })
    }
    while (dq.length && a[dq.at(-1)!] <= a[i]) {
      const j = dq.pop()!
      yield f('pop', `新來的 ${a[i]} >= deque 尾端的 ${a[j]}:${a[j]} 比新人舊又比新人小,永遠不可能當最大值了,從尾端踢掉`, { range: win, highlight: [i], dim: [j] })
    }
    dq.push(i)
    yield f('push', `${a[i]} 從尾端加入 deque`, { range: win, highlight: [i], compare: [...dq] })
    if (i >= k - 1) {
      out.push(a[dq[0]])
      yield f('record', `視窗 [${i - k + 1}..${i}] 已滿,最大值就是 deque 最前面的 ${a[dq[0]]}`, { range: win, highlight: [dq[0]] })
    }
  }
  yield f('end', '全部視窗處理完畢', {}, out.join(','))
}

export const monotonicQueue: Pattern = {
  id: 'monotonic-queue',
  summary: '用雙端佇列(deque)維護一個滑動視窗,讓裡面的值保持單調遞減。最前面永遠是視窗的最大值;新元素從尾端進來前,先把比它小的都踢掉。',
  analogy: '選班長:新同學轉進來,如果他比某些老同學更強又更「新」(待得更久),那些老同學就再也不可能當選了,直接退出候選名單。最強的老同學畢業(滑出視窗)時才換人。',
  steps: ['deque 存索引,值由前往後遞減', '新元素 x 進來:先把前面已經滑出視窗的索引移除', '從尾端踢掉所有 <= x 的元素', 'x 加到尾端', '視窗滿了,deque 最前面就是最大值'],
  watch: ['中間那排是 deque,最前面(黑色)是目前最大值', '注意被踢掉的元素:它們「又舊又小」,永遠不會再成為答案'],
  whenToUse: ['滑動視窗的最大值 / 最小值', 'DP 轉移是「前 k 個狀態中的最大值」(Jump Game VI)', '有負數的「和至少為 K 的最短子陣列」(前綴和 + 單調佇列)'],
  pitfalls: ['要存索引,才能判斷是否滑出視窗', '過期檢查用的是 deque 最前面,踢小的是從尾端'],
  complexity: { time: 'O(n)', space: 'O(k)', why: '每個索引最多進 deque 一次、出 deque 一次。' },
  demo: {
    title: '每個長度為 k 的視窗的最大值(LeetCode 239)',
    inputs: [
      { key: 'nums', label: 'nums', default: '1,3,-1,-3,5,3,6,7' },
      { key: 'k', label: 'k', default: '3' },
    ],
    run: monoQueueRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { maxLen: 12 })
      const k = Number(v.k)
      return range(0, a.length - k).map((i) => Math.max(...a.slice(i, i + k))).join(',')
    },
    random: () => {
      const n = randInt(1, 10)
      return { nums: randInts(n, -9, 9).join(','), k: String(randInt(1, n)) }
    },
    code: {
      python: `from collections import deque
def max_sliding_window(nums, k):
    dq, out = deque(), []                       #@init
    for i, x in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()                        #@expire
        while dq and nums[dq[-1]] <= x:
            dq.pop()                            #@pop
        dq.append(i)                            #@push
        if i >= k - 1:
            out.append(nums[dq[0]])             #@record
    return out                                  #@end`,
      c: `int* maxSlidingWindow(int* nums, int n, int k, int* retSize) {
    int *dq = malloc(n * sizeof(int)), head = 0, tail = 0;  //@init
    int *out = malloc(n * sizeof(int)); *retSize = 0;       //@init
    for (int i = 0; i < n; i++) {
        if (head < tail && dq[head] <= i - k) head++;       //@expire
        while (head < tail && nums[dq[tail - 1]] <= nums[i]) tail--;  //@pop
        dq[tail++] = i;                         //@push
        if (i >= k - 1) out[(*retSize)++] = nums[dq[head]]; //@record
    }
    free(dq);
    return out;                                 //@end
}`,
      cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; vector<int> out;             //@init
    for (int i = 0; i < (int)nums.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();   //@expire
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();  //@pop
        dq.push_back(i);                        //@push
        if (i >= k - 1) out.push_back(nums[dq.front()]);  //@record
    }
    return out;                                 //@end
}`,
      java: `int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();     //@init
    int[] out = new int[nums.length - k + 1];   //@init
    for (int i = 0; i < nums.length; i++) {
        if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();     //@expire
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();  //@pop
        dq.offerLast(i);                        //@push
        if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];  //@record
    }
    return out;                                 //@end
}`,
      javascript: `function maxSlidingWindow(nums, k) {
  const dq = [], out = [];                      //@init
  for (let i = 0; i < nums.length; i++) {
    if (dq.length && dq[0] <= i - k) dq.shift();            //@expire
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();  //@pop
    dq.push(i);                                 //@push
    if (i >= k - 1) out.push(nums[dq[0]]);      //@record
  }
  return out;                                   //@end
}`,
    },
  },
}

export const ARRAYS = [twoPointers, prefixSum, differenceArray, binarySearch, binarySearchAnswer, hashMap, stack, monotonicStack, monotonicQueue]
