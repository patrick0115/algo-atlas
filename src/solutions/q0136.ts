import { arr, range } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 136. Single Number

const A = [4, 1, 2, 1, 2]

function xorFig(): FigStep[] {
  let x = 0
  const out: FigStep[] = [{ note: 'XOR(^)的兩個性質:a ^ a = 0(自己和自己抵消)、a ^ 0 = a。而且順序不重要。所以把全部 XOR 起來,成對的都會抵消,只剩落單的那個', views: [arr(A, { label: 'nums' }), arr([x.toString(2).padStart(3, '0')], { label: 'x(二進位)' })] }]
  A.forEach((v, i) => {
    const before = x
    x ^= v
    out.push({ note: `${before} ^ ${v} = ${x}(${before.toString(2).padStart(3, '0')} ^ ${v.toString(2).padStart(3, '0')} = ${x.toString(2).padStart(3, '0')})`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), arr([x.toString(2).padStart(3, '0')], { label: 'x(二進位)', highlight: [0] })] })
  })
  out.push({ note: `1 和 2 各出現兩次互相抵消,剩下 ${x}`, views: [arr([x], { label: '答案', done: [0] })] })
  return out
}

function hashFig(): FigStep[] {
  const cnt = new Map<number, number>()
  const out: FigStep[] = []
  A.forEach((v, i) => {
    cnt.set(v, (cnt.get(v) ?? 0) + 1)
    if (i === 0 || i === A.length - 1) out.push({ note: i === 0 ? '用雜湊表數每個數出現幾次' : '數完後,找次數是 1 的那個 → 4', views: [arr(A, { label: 'nums', highlight: [i] }), kv([...cnt.entries()], '次數', i === A.length - 1 ? [4] : [v])] })
  })
  return out
}

export const q0136: Solution = {
  id: 136,
  plain: '一串數字裡,每個數都剛好出現兩次,只有一個數只出現一次,把它找出來。要求不能用額外的空間 —— 答案是一個很漂亮的位元技巧:XOR。',
  statement: '給非空整數陣列 `nums`,除了某個元素只出現一次以外,其餘每個元素都出現兩次。找出那個只出現一次的元素。要求線性時間、常數額外空間。',
  examples: [
    { input: 'nums = [2,2,1]', output: '1' },
    { input: 'nums = [4,1,2,1,2]', output: '4' },
    { input: 'nums = [1]', output: '1' },
  ],
  constraints: ['`n ≤ 3·10⁴`', '要 O(n) 時間、O(1) 空間'],
  insight: [
    '雜湊表數次數很直接,但要 O(n) 空間',
    'XOR 的性質:`a ^ a = 0`、`a ^ 0 = a`、可以交換順序',
    '把所有數 XOR 起來:出現兩次的都會兩兩抵消成 0,最後只剩出現一次的那個',
  ],
  approaches: [
    {
      name: '雜湊表數次數',
      idea: '數每個數的出現次數,回傳次數為 1 的。',
      steps: ['`cnt = Counter(nums)`', '回傳 `cnt[x] == 1` 的 x'],
      figure: { title: `nums = [${A}]`, steps: hashFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '雜湊表最多 n/2 + 1 個 key。' },
      verdict: '可以過,但不符合 O(1) 空間的要求。',
      code: {
        python: `from collections import Counter

def singleNumber(nums):
    cnt = Counter(nums)
    for x, c in cnt.items():
        if c == 1:
            return x`,
        c: `typedef struct { int key, cnt; UT_hash_handle hh; } Entry;

int singleNumber(int *nums, int numsSize) {
    Entry *map = NULL, *e, *tmp;
    for (int i = 0; i < numsSize; i++) {
        HASH_FIND_INT(map, &nums[i], e);
        if (!e) { e = malloc(sizeof(Entry)); e->key = nums[i]; e->cnt = 0; HASH_ADD_INT(map, key, e); }
        e->cnt++;
    }
    int ans = 0;
    HASH_ITER(hh, map, e, tmp) {
        if (e->cnt == 1) ans = e->key;
        HASH_DEL(map, e);
        free(e);
    }
    return ans;
}`,
        cpp: `int singleNumber(vector<int>& nums) {
    unordered_map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    for (auto& [x, c] : cnt)
        if (c == 1) return x;
    return -1;
}`,
        java: `int singleNumber(int[] nums) {
    Map<Integer, Integer> cnt = new HashMap<>();
    for (int x : nums) cnt.merge(x, 1, Integer::sum);
    for (var e : cnt.entrySet())
        if (e.getValue() == 1) return e.getKey();
    return -1;
}`,
        javascript: `function singleNumber(nums) {
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  for (const [x, c] of cnt) if (c === 1) return x;
}`,
      },
    },
    {
      name: 'XOR 全部',
      idea: '`x = 0`;每個數 `x ^= num`。成對的抵消,剩下的就是答案。',
      steps: ['`x = 0`', '`for num in nums`:`x ^= num`', '回傳 x'],
      figure: { title: `nums = [${A}]`, steps: xorFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描、一個變數。' },
      verdict: '最推薦,[[p:bit-manipulation]]最經典的一題。負數也適用(XOR 是逐位元運算)。',
      code: {
        python: `def singleNumber(nums):
    x = 0
    for num in nums:
        x ^= num                              # 成對的會互相抵消
    return x`,
        c: `int singleNumber(int *nums, int numsSize) {
    int x = 0;
    for (int i = 0; i < numsSize; i++) x ^= nums[i];
    return x;
}`,
        cpp: `int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int num : nums) x ^= num;
    return x;
}`,
        java: `int singleNumber(int[] nums) {
    int x = 0;
    for (int num : nums) x ^= num;
    return x;
}`,
        javascript: `function singleNumber(nums) {
  let x = 0;
  for (const num of nums) x ^= num;
  return x;
}`,
      },
    },
  ],
  pitfalls: ['先排序再找:O(n log n),不符合要求', '用「總和 × 2 − 全部總和」:要先用集合去重,空間又變 O(n)'],
  followUp: [
    { q: '其他數出現三次?', a: '137:逐位元統計 1 的個數再 mod 3,或用兩個變數模擬三進位狀態機。' },
    { q: '有兩個數只出現一次?', a: '260:全部 XOR 得到 a ^ b,用它最低的 1 位元把數字分成兩組,各自 XOR。' },
  ],
  check: {
    kind: 'fn',
    fn: 'singleNumber',
    cases: [
      { args: [[2, 2, 1]], out: 1 },
      { args: [A], out: 4 },
      { args: [[1]], out: 1 },
      { args: [[-1, 3, 3]], out: -1 },
      { args: [[7, -5, 7, 9, 9]], out: -5 },
    ],
  },
}
