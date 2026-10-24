import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 456. 132 Pattern

const A = [3, 1, 4, 2]

function stackFig(): FigStep[] {
  const st: number[] = []
  let k = -Infinity
  const out: FigStep[] = [{ note: '132 模式:找 i < j < k 使 nums[i] < nums[k] < nums[j](小、大、中)。從**右往左**掃,把 nums[j] 當「3」、維護一個單調遞減的堆疊;被彈出的最大值就是最好的「2」', views: [arr(A, { label: 'nums' }), arr([], { label: '堆疊(遞減)' }), arr(['−∞'], { label: '目前的「2」' })] }]
  for (let i = A.length - 1; i >= 0; i--) {
    const x = A[i]
    if (x < k) {
      out.push({ note: `nums[${i}] = ${x} < 「2」= ${k} → 找到「1」了!(${x}, 某個比 ${k} 大的「3」, ${k})→ true`, views: [arr(A, { label: 'nums', highlight: [i] }), arr([...st], { label: '堆疊' }), arr([k], { label: '目前的「2」', done: [0] })] })
      return out
    }
    const popped: number[] = []
    while (st.length && st[st.length - 1] < x) {
      k = st.pop()!
      popped.push(k)
    }
    st.push(x)
    out.push({ note: popped.length ? `nums[${i}] = ${x}:比堆疊頂大,彈出 ${popped.join('、')} → 它們都可以當「2」(左邊有更大的 ${x} 當「3」),「2」= ${k}` : `nums[${i}] = ${x}:push`, views: [arr(A, { label: 'nums', highlight: [i], done: Array.from({ length: A.length - 1 - i }, (_, t) => A.length - 1 - t) }), arr([...st], { label: '堆疊' }), arr([k === -Infinity ? '−∞' : k], { label: '目前的「2」' })] })
  }
  out.push({ note: '掃完沒找到 → false', views: [arr(A, { label: 'nums' })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:枚舉「3」的位置 j,左邊取最小值當「1」(前綴最小值),右邊找有沒有介於兩者之間的「2」', views: [arr(A, { label: 'nums', highlight: [2] }), arr([3, 1, 1, 1], { label: '前綴最小值' })] },
    { note: 'j = 2(4):左邊最小 1,右邊有 2 滿足 1 < 2 < 4 → true。每個 j 掃右邊 O(n),總共 O(n²)', views: [arr(A, { label: 'nums', highlight: [2], done: [1, 3] })] },
  ]
}

export const q0456: Solution = {
  id: 456,
  plain: '在一排數字裡,能不能找到三個(位置由左到右)形成「小、大、中」的關係?也就是第一個最小、第二個最大、第三個介於兩者之間,像 1、3、2 這樣。',
  statement: '給整數陣列 `nums`,判斷是否存在 `i < j < k` 使 `nums[i] < nums[k] < nums[j]`(稱為 132 模式)。',
  examples: [
    { input: 'nums = [1,2,3,4]', output: 'false' },
    { input: 'nums = [3,1,4,2]', output: 'true', note: '[1,4,2]' },
    { input: 'nums = [-1,3,2,0]', output: 'true' },
  ],
  constraints: ['n ≤ 2·10⁵ → O(n²) 太慢'],
  insight: ['固定「3」(nums[j])時:「1」越小越好(左邊的最小值),「2」要比「3」小但越大越好', '從右往左掃,用單調遞減堆疊:遇到更大的數時,彈出的數都比它小,而且在它右邊 → 都是合格的「2」,留最大的那個', '之後只要遇到比「2」還小的數,它就是「1」'],
  approaches: [
    {
      name: '從右往左 + 單調堆疊',
      idea: '`two = −∞`;從右往左:`x < two` → true;`while st and st[-1] < x`:`two = st.pop()`;`st.append(x)`。',
      steps: ['`st = []`、`two = −∞`', '`for x in reversed(nums)`:`x < two` → 回傳 true', '`while st and st[-1] < x`:`two = st.pop()`', '`st.append(x)`;掃完回傳 false'],
      figure: { title: `nums = [${A}]`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個元素進出堆疊各一次。' },
      verdict: '最推薦。[[p:monotonic-stack]]的精妙用法:被彈出的元素不是丟掉,而是成為最佳的「2」。',
      code: {
        python: `def find132pattern(nums):
    st, two = [], float('-inf')               # two:目前最好的「2」
    for x in reversed(nums):
        if x < two:
            return True                       # x 是「1」
        while st and st[-1] < x:
            two = st.pop()                    # 被 x(當「3」)壓過的,都能當「2」
        st.append(x)
    return False`,
        c: `bool find132pattern(int *nums, int numsSize) {
    int *st = malloc(numsSize * sizeof(int)), top = 0;
    long long two = LLONG_MIN;
    bool ans = false;
    for (int i = numsSize - 1; i >= 0 && !ans; i--) {
        if (nums[i] < two) { ans = true; break; }
        while (top && st[top - 1] < nums[i]) two = st[--top];
        st[top++] = nums[i];
    }
    free(st);
    return ans;
}`,
        cpp: `bool find132pattern(vector<int>& nums) {
    vector<int> st;
    long long two = LLONG_MIN;
    for (int i = nums.size() - 1; i >= 0; i--) {
        if (nums[i] < two) return true;
        while (!st.empty() && st.back() < nums[i]) { two = st.back(); st.pop_back(); }
        st.push_back(nums[i]);
    }
    return false;
}`,
        java: `boolean find132pattern(int[] nums) {
    Deque<Integer> st = new ArrayDeque<>();
    long two = Long.MIN_VALUE;
    for (int i = nums.length - 1; i >= 0; i--) {
        if (nums[i] < two) return true;
        while (!st.isEmpty() && st.peek() < nums[i]) two = st.pop();
        st.push(nums[i]);
    }
    return false;
}`,
        javascript: `function find132pattern(nums) {
  const st = [];
  let two = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] < two) return true;
    while (st.length && st[st.length - 1] < nums[i]) two = st.pop();
    st.push(nums[i]);
  }
  return false;
}`,
      },
    },
    {
      name: '枚舉「3」+ 前綴最小值',
      idea: '`mn[j]` = nums[0..j−1] 的最小值;對每個 j,往右找有沒有 `mn[j] < nums[k] < nums[j]`。',
      steps: ['用變數 lo 記目前為止的最小值', '`for j`:`lo = mn[j]`;`lo >= nums[j]` 就跳過', '`for k > j`:`lo < nums[k] < nums[j]` → true'],
      figure: { title: `nums = [${A}]`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '每個 j 往右掃。' },
      verdict: '「1 取左邊最小」這個貪心觀察是對的,但找「2」還是要掃;單調堆疊就是把這一步優化掉。',
      code: {
        python: `def find132pattern(nums):
    n = len(nums)
    lo = float('inf')
    for j in range(n):
        if lo < nums[j]:                      # 左邊最小的當「1」
            for k in range(j + 1, n):
                if lo < nums[k] < nums[j]:
                    return True
        lo = min(lo, nums[j])
    return False`,
        c: `bool find132pattern(int *nums, int numsSize) {
    long long lo = LLONG_MAX;
    for (int j = 0; j < numsSize; j++) {
        if (lo < nums[j])
            for (int k = j + 1; k < numsSize; k++)
                if (lo < nums[k] && nums[k] < nums[j]) return true;
        if (nums[j] < lo) lo = nums[j];
    }
    return false;
}`,
        cpp: `bool find132pattern(vector<int>& nums) {
    long long lo = LLONG_MAX;
    int n = nums.size();
    for (int j = 0; j < n; j++) {
        if (lo < nums[j])
            for (int k = j + 1; k < n; k++)
                if (lo < nums[k] && nums[k] < nums[j]) return true;
        lo = min(lo, (long long)nums[j]);
    }
    return false;
}`,
        java: `boolean find132pattern(int[] nums) {
    long lo = Long.MAX_VALUE;
    for (int j = 0; j < nums.length; j++) {
        if (lo < nums[j])
            for (int k = j + 1; k < nums.length; k++)
                if (lo < nums[k] && nums[k] < nums[j]) return true;
        lo = Math.min(lo, nums[j]);
    }
    return false;
}`,
        javascript: `function find132pattern(nums) {
  let lo = Infinity;
  for (let j = 0; j < nums.length; j++) {
    if (lo < nums[j]) for (let k = j + 1; k < nums.length; k++) if (lo < nums[k] && nums[k] < nums[j]) return true;
    lo = Math.min(lo, nums[j]);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['從左往右做單調堆疊:很難同時維護「1」和「2」,從右往左才自然', '「2」用 int 的最小值當初始值:nums 可能剛好是 −2³¹,改用更小的 64 位元值或 −∞'],
  check: {
    kind: 'fn',
    fn: 'find132pattern',
    cases: [
      { args: [[1, 2, 3, 4]], out: false },
      { args: [A], out: true },
      { args: [[-1, 3, 2, 0]], out: true },
      { args: [[1, 0, 1, -4, -3]], out: false },
      { args: [[3, 5, 0, 3, 4]], out: true },
    ],
  },
}
