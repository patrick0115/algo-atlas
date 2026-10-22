import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 152. Maximum Product Subarray

const A = [2, 3, -2, 4, -1]

function dpFig(): FigStep[] {
  let mx = A[0]
  let mn = A[0]
  let best = A[0]
  const MX: (number | string)[] = A.map(() => '')
  const MN: (number | string)[] = A.map(() => '')
  MX[0] = mx
  MN[0] = mn
  const out: FigStep[] = [{ note: '和最大子陣列和(53)不同,乘法有「負負得正」:一個很小的負數,乘上下一個負數可能變成最大。所以同時記住「以這格結尾的最大積」和「最小積」', views: [arr(A, { label: 'nums', highlight: [0] }), arr(MX, { label: 'max(以這格結尾)', highlight: [0] }), arr(MN, { label: 'min(以這格結尾)', highlight: [0] })] }]
  for (let i = 1; i < A.length; i++) {
    const x = A[i]
    const cands = [x, mx * x, mn * x]
    mx = Math.max(...cands)
    mn = Math.min(...cands)
    MX[i] = mx
    MN[i] = mn
    best = Math.max(best, mx)
    out.push({ note: `nums[${i}] = ${x}:三個候選 = 自己 ${x}、前一格的 max × ${x} = ${cands[1]}、前一格的 min × ${x} = ${cands[2]} → 新的 max ${mx}、min ${mn}。最大 ${best}${x < 0 ? '(遇到負數,max 和 min 互換角色)' : ''}`, views: [arr(A, { label: 'nums', highlight: [i] }), arr(MX, { label: 'max', highlight: [i] }), arr(MN, { label: 'min', highlight: [i] })] })
  }
  out.push({ note: `答案 = 所有 max 裡最大的 ${best}`, views: [arr(MX, { label: 'max', done: [MX.indexOf(best)] })] })
  return out
}

function prefixFig(): FigStep[] {
  const pre: number[] = []
  const suf: number[] = []
  let p = 1
  let s = 1
  for (let i = 0; i < A.length; i++) {
    p = (p === 0 ? 1 : p) * A[i]
    pre.push(p)
    s = (s === 0 ? 1 : s) * A[A.length - 1 - i]
    suf.unshift(s)
  }
  return [
    { note: '另一個觀察:沒有 0 的時候,負數個數是偶數 → 整段乘起來最大;是奇數 → 答案一定是「去掉最左邊那個負數(和它左邊)」或「去掉最右邊那個負數(和它右邊)」。也就是某個前綴積或後綴積', views: [arr(A, { label: 'nums' })] },
    { note: '所以從左邊累乘一次、從右邊累乘一次,所有出現過的值取最大。遇到 0 就重新從 1 開始乘(0 把陣列切成獨立的段)', views: [arr(pre, { label: '前綴積(從左乘)' }), arr(suf, { label: '後綴積(從右乘)' })] },
    { note: `答案 = max(所有前綴積, 所有後綴積) = ${Math.max(...pre, ...suf)}`, views: [arr(pre, { label: '前綴積', highlight: [pre.indexOf(Math.max(...pre))] }), arr(suf, { label: '後綴積', highlight: [suf.indexOf(Math.max(...suf))] })] },
  ]
}

function bruteFig(): FigStep[] {
  let best = -Infinity
  const out: FigStep[] = [{ note: '暴力:每個起點往右延伸,邊乘邊更新最大值', views: [arr(A, { label: 'nums' })] }]
  for (let i = 0; i < A.length; i++) {
    let p = 1
    for (let j = i; j < A.length; j++) {
      p *= A[j]
      if (p > best) {
        best = p
        out.push({ note: `[${i}, ${j}] 的乘積 = ${p},目前最大`, views: [arr(A, { label: 'nums', range: [i, j] })] })
      }
    }
  }
  return out
}

export const q0152: Solution = {
  id: 152,
  plain: '在一串有正有負的數字裡,找一段**連續**的數字,讓它們的**乘積**最大。難處是負數:兩個負數相乘會變正,所以「目前最小的」也可能下一步就變成最大的。',
  statement: '給整數陣列 `nums`,找出乘積最大的**連續**子陣列(至少一個元素),回傳該乘積。',
  examples: [
    { input: 'nums = [2,3,-2,4]', output: '6', note: '[2,3]' },
    { input: 'nums = [-2,0,-1]', output: '0' },
    { input: 'nums = [-2,3,-4]', output: '24', note: '整段:負負得正' },
  ],
  constraints: ['`1 ≤ n ≤ 2·10⁴`,值在 `[-10, 10]`', '答案保證在 32 位元整數內'],
  insight: [
    '直接套 [53](#/q/53) 的 Kadane(只記最大)會錯:`[-2, 3, -4]`,走到 3 時最大是 3,但答案要用到 −2 × 3 = −6 這個「最小值」再乘 −4',
    '所以同時記兩個:`mx` = 以這格結尾的最大積,`mn` = 最小積。新的 `mx` = max(x, mx·x, mn·x),`mn` 同理取 min',
    '0 會讓乘積歸零 —— 「從自己重新開始」(候選 x)自動處理了這件事',
    '另一個巧妙的觀察:答案一定是某個前綴積或後綴積(以 0 為分隔)',
  ],
  approaches: [
    {
      name: '暴力:每個起點往右乘',
      idea: '固定 i,j 往右延伸,累乘並更新最大值。',
      steps: ['`for i`:`p = 1`', '`for j in i..n−1`:`p *= nums[j]`、`best = max(best, p)`'],
      figure: { title: `nums = [${A.join(',')}](只畫出刷新最大值的那幾步)`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n(n+1)/2 個子陣列。n = 2·10⁴ 時是 2 億,勉強。' },
      verdict: '起點。',
      code: {
        python: `def maxProduct(nums):
    best = nums[0]
    for i in range(len(nums)):
        p = 1
        for j in range(i, len(nums)):
            p *= nums[j]
            best = max(best, p)
    return best`,
        c: `int maxProduct(int *nums, int numsSize) {
    long long best = nums[0];
    for (int i = 0; i < numsSize; i++) {
        long long p = 1;
        for (int j = i; j < numsSize; j++) {
            p *= nums[j];
            if (p > best) best = p;
            if (p == 0) break;                // 之後都是 0
        }
    }
    return (int)best;
}`,
        cpp: `int maxProduct(vector<int>& nums) {
    long long best = nums[0];
    for (size_t i = 0; i < nums.size(); i++) {
        long long p = 1;
        for (size_t j = i; j < nums.size(); j++) {
            p *= nums[j];
            best = max(best, p);
            if (p == 0) break;
        }
    }
    return (int)best;
}`,
        java: `int maxProduct(int[] nums) {
    long best = nums[0];
    for (int i = 0; i < nums.length; i++) {
        long p = 1;
        for (int j = i; j < nums.length; j++) {
            p *= nums[j];
            best = Math.max(best, p);
            if (p == 0) break;
        }
    }
    return (int) best;
}`,
        javascript: `function maxProduct(nums) {
  let best = nums[0];
  for (let i = 0; i < nums.length; i++) {
    let p = 1;
    for (let j = i; j < nums.length; j++) {
      p *= nums[j];
      best = Math.max(best, p);
      if (p === 0) break;
    }
  }
  return best;
}`,
      },
    },
    {
      name: '同時維護最大積與最小積',
      idea: '`mx`、`mn` = 以目前這格結尾的最大、最小乘積。新的值從三個候選取:`x`、`mx · x`、`mn · x`。',
      steps: ['`mx = mn = best = nums[0]`', '對之後每個 `x`:`cands = (x, mx·x, mn·x)`', '`mx = max(cands)`、`mn = min(cands)`(要用舊的 mx、mn 算)', '`best = max(best, mx)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走一遍,三個變數。' },
      verdict: '標準解,[[p:dp-1d]]。「一個狀態不夠就多記一個」(最大 + 最小)是 DP 很常見的擴充方式。',
      code: {
        python: `def maxProduct(nums):
    mx = mn = best = nums[0]
    for x in nums[1:]:
        cands = (x, mx * x, mn * x)       # 重新開始 / 接在最大後面 / 接在最小後面
        mx, mn = max(cands), min(cands)
        best = max(best, mx)
    return best`,
        c: `int maxProduct(int *nums, int numsSize) {
    int mx = nums[0], mn = nums[0], best = nums[0];
    for (int i = 1; i < numsSize; i++) {
        int x = nums[i], a = mx * x, b = mn * x;
        mx = x > a ? (x > b ? x : b) : (a > b ? a : b);
        mn = x < a ? (x < b ? x : b) : (a < b ? a : b);
        if (mx > best) best = mx;
    }
    return best;
}`,
        cpp: `int maxProduct(vector<int>& nums) {
    int mx = nums[0], mn = nums[0], best = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        int x = nums[i], a = mx * x, b = mn * x;
        mx = max({x, a, b});
        mn = min({x, a, b});
        best = max(best, mx);
    }
    return best;
}`,
        java: `int maxProduct(int[] nums) {
    int mx = nums[0], mn = nums[0], best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        int x = nums[i], a = mx * x, b = mn * x;
        mx = Math.max(x, Math.max(a, b));
        mn = Math.min(x, Math.min(a, b));
        best = Math.max(best, mx);
    }
    return best;
}`,
        javascript: `function maxProduct(nums) {
  let mx = nums[0], mn = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i], a = mx * x, b = mn * x;
    mx = Math.max(x, a, b);
    mn = Math.min(x, a, b);
    best = Math.max(best, mx);
  }
  return best;
}`,
      },
    },
    {
      name: '前綴積與後綴積',
      idea: '從左往右累乘、從右往左累乘(遇到 0 之後從 1 重新開始),所有出現過的值取最大。',
      steps: ['`pre = suf = 1`、`best = −∞`', '`for i`:`pre = (pre or 1) · nums[i]`、`suf = (suf or 1) · nums[n−1−i]`', '`best = max(best, pre, suf)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走一遍,兩個累乘值。' },
      verdict: '程式超短,但正確性要想一下(奇數個負數時,丟掉最左或最右那個負數的那一側)。面試當作補充很加分。',
      code: {
        python: `def maxProduct(nums):
    n = len(nums)
    pre = suf = 1
    best = float('-inf')
    for i in range(n):
        pre = (pre or 1) * nums[i]        # 碰到 0 就從 1 重新乘
        suf = (suf or 1) * nums[n - 1 - i]
        best = max(best, pre, suf)
    return best`,
        c: `int maxProduct(int *nums, int numsSize) {
    int n = numsSize, pre = 1, suf = 1, best = INT_MIN;
    for (int i = 0; i < n; i++) {
        pre = (pre == 0 ? 1 : pre) * nums[i];
        suf = (suf == 0 ? 1 : suf) * nums[n - 1 - i];
        if (pre > best) best = pre;
        if (suf > best) best = suf;
    }
    return best;
}`,
        cpp: `int maxProduct(vector<int>& nums) {
    int n = nums.size(), pre = 1, suf = 1, best = INT_MIN;
    for (int i = 0; i < n; i++) {
        pre = (pre == 0 ? 1 : pre) * nums[i];
        suf = (suf == 0 ? 1 : suf) * nums[n - 1 - i];
        best = max({best, pre, suf});
    }
    return best;
}`,
        java: `int maxProduct(int[] nums) {
    int n = nums.length, pre = 1, suf = 1, best = Integer.MIN_VALUE;
    for (int i = 0; i < n; i++) {
        pre = (pre == 0 ? 1 : pre) * nums[i];
        suf = (suf == 0 ? 1 : suf) * nums[n - 1 - i];
        best = Math.max(best, Math.max(pre, suf));
    }
    return best;
}`,
        javascript: `function maxProduct(nums) {
  const n = nums.length;
  let pre = 1, suf = 1, best = -Infinity;
  for (let i = 0; i < n; i++) {
    pre = (pre || 1) * nums[i];
    suf = (suf || 1) * nums[n - 1 - i];
    best = Math.max(best, pre, suf);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '只記最大值(照搬 Kadane):`[-2, 3, -4]` 會得到 3 而不是 24',
    '更新 mx 之後才用它算 mn:要用**舊的** mx、mn 一起算新的,先把候選存起來',
    '前後綴法遇到 0 沒有重新開始:之後的乘積會一直是 0',
  ],
  followUp: [{ q: '要乘積小於 k 的子陣列個數?', a: '713. Subarray Product Less Than K:全是正數時用滑動視窗。' }],
  check: {
    kind: 'fn',
    fn: 'maxProduct',
    cases: [
      { args: [[2, 3, -2, 4]], out: 6 },
      { args: [[-2, 0, -1]], out: 0 },
      { args: [[-2, 3, -4]], out: 24 },
      { args: [A], out: 48 },
      { args: [[-2]], out: -2 },
      { args: [[0, 2]], out: 2 },
      { args: [[-1, -1]], out: 1 },
    ],
  },
}
