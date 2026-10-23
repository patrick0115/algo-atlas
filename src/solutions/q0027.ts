import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 27. Remove Element

const A = [0, 1, 2, 2, 3, 0, 4, 2]
const VAL = 2

function keepFig(): FigStep[] {
  const a = [...A]
  let w = 0
  const out: FigStep[] = [{ note: `要刪掉所有 ${VAL}。w = 下一個「要留的數」放的位置。i 往右掃,不是 ${VAL} 就抄到 w`, views: [arr([...a], { label: 'nums', pointers: [{ name: 'w', index: 0 }] })] }]
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== VAL) {
      a[w] = a[i]
      if (i < 3 || i >= 5) out.push({ note: `nums[${i}] = ${a[w]} 要留 → 寫到 nums[${w}],w 變 ${w + 1}`, views: [arr([...a], { label: 'nums', highlight: [w], compare: [i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
      w++
    } else if (i === 2) {
      out.push({ note: `nums[${i}] = ${VAL} → 跳過,w 不動`, views: [arr([...a], { label: 'nums', dim: [i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
    }
  }
  out.push({ note: `回傳 k = ${w}:前 ${w} 個 [${a.slice(0, w)}] 就是留下的`, views: [arr(a, { label: 'nums', done: Array.from({ length: w }, (_, k) => k), dim: Array.from({ length: a.length - w }, (_, k) => w + k) })] })
  return out
}

function swapFig(): FigStep[] {
  const a = [...A]
  let i = 0
  let n = a.length
  const out: FigStep[] = [{ note: `另一個想法:看到 ${VAL} 就拿**最後一個**數來蓋掉它,陣列長度 n 減 1。要刪的很少時,寫入次數更少(題目不要求保持順序)`, views: [arr([...a], { label: 'nums', pointers: [{ name: 'i', index: 0 }, { name: 'n', index: n - 1, color: 'b' }] })] }]
  while (i < n) {
    if (a[i] === VAL) {
      a[i] = a[n - 1]
      n--
      out.push({ note: `nums[${i}] 是 ${VAL} → 用最後一個 nums[${n}] = ${a[i]} 蓋掉,n 變 ${n}(i 不動,換來的數還沒檢查)`, views: [arr([...a], { label: 'nums', highlight: [i], dim: Array.from({ length: a.length - n }, (_, k) => n + k), pointers: [{ name: 'i', index: i }, { name: 'n', index: Math.max(n - 1, 0), color: 'b' }] })] })
    } else i++
  }
  out.push({ note: `i 追上 n,回傳 ${n}:前 ${n} 個 [${a.slice(0, n)}] 都不是 ${VAL}(順序變了,但題目允許)`, views: [arr(a, { label: 'nums', done: Array.from({ length: n }, (_, k) => k), dim: Array.from({ length: a.length - n }, (_, k) => n + k) })] })
  return out
}

export const q0027: Solution = {
  id: 27,
  plain: '一排數字裡,把所有等於 val 的都拿掉,剩下的擠到最前面,告訴我剩幾個。後面剩什麼、剩下的順序都不用管。',
  statement: '給陣列 `nums` 和整數 `val`,**原地**移除所有等於 val 的元素(順序可以改變),回傳剩下的個數 k;nums 的前 k 個元素必須是不等於 val 的那些。',
  examples: [
    { input: 'nums = [3,2,2,3], val = 3', output: '2,前 2 個是 [2,2]' },
    { input: 'nums = [0,1,2,2,3,0,4,2], val = 2', output: '5,前 5 個是 0,1,3,0,4(順序不限)' },
  ],
  constraints: ['n ≤ 100', 'O(1) 額外空間'],
  insight: ['和 [26](#/q/26)、[283](#/q/283) 一樣的快慢指標:不是 val 的就留下', '因為順序不限,還可以「拿最後一個補洞」,要刪的很少時更省寫入'],
  approaches: [
    {
      name: '快慢指標(保留順序)',
      idea: '`w = 0`;`nums[i] != val` → `nums[w] = nums[i]`、`w += 1`。',
      steps: ['`w = 0`', '`for x in nums`:`x != val` → `nums[w] = x`、`w += 1`', '回傳 w'],
      figure: { title: `nums = [${A}],val = ${VAL}`, steps: keepFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最推薦,順便保持了順序。',
      code: {
        python: `def removeElement(nums, val):
    w = 0
    for x in nums:
        if x != val:
            nums[w] = x                       # 要留的依序往前放
            w += 1
    return w`,
        c: `int removeElement(int *nums, int numsSize, int val) {
    int w = 0;
    for (int i = 0; i < numsSize; i++)
        if (nums[i] != val) nums[w++] = nums[i];
    return w;
}`,
        cpp: `int removeElement(vector<int>& nums, int val) {
    int w = 0;
    for (int x : nums) if (x != val) nums[w++] = x;
    return w;
}`,
        java: `int removeElement(int[] nums, int val) {
    int w = 0;
    for (int x : nums) if (x != val) nums[w++] = x;
    return w;
}`,
        javascript: `function removeElement(nums, val) {
  let w = 0;
  for (const x of nums) if (x !== val) nums[w++] = x;
  return w;
}`,
      },
    },
    {
      name: '拿尾巴補洞',
      idea: '`i` 從頭、`n` 是目前長度;`nums[i] == val` 就 `nums[i] = nums[n−1]`、`n −= 1`(i 不動),否則 `i += 1`。',
      steps: ['`i, n = 0, len(nums)`', '`while i < n`:', '`nums[i] == val` → `nums[i] = nums[n − 1]`、`n -= 1`;否則 `i += 1`', '回傳 n'],
      figure: { title: `nums = [${A}],val = ${VAL}`, steps: swapFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每一步不是 i 前進就是 n 後退,總共 n 步。' },
      verdict: '寫入次數 = 要刪的個數,要刪的很少時最省。會打亂順序。',
      code: {
        python: `def removeElement(nums, val):
    i, n = 0, len(nums)
    while i < n:
        if nums[i] == val:
            nums[i] = nums[n - 1]             # 拿最後一個來補,長度減 1
            n -= 1                            # i 不動:換來的數還沒檢查
        else:
            i += 1
    return n`,
        c: `int removeElement(int *nums, int numsSize, int val) {
    int i = 0, n = numsSize;
    while (i < n) {
        if (nums[i] == val) nums[i] = nums[--n];
        else i++;
    }
    return n;
}`,
        cpp: `int removeElement(vector<int>& nums, int val) {
    int i = 0, n = nums.size();
    while (i < n) {
        if (nums[i] == val) nums[i] = nums[--n];
        else i++;
    }
    return n;
}`,
        java: `int removeElement(int[] nums, int val) {
    int i = 0, n = nums.length;
    while (i < n) {
        if (nums[i] == val) nums[i] = nums[--n];
        else i++;
    }
    return n;
}`,
        javascript: `function removeElement(nums, val) {
  let i = 0, n = nums.length;
  while (i < n) {
    if (nums[i] === val) nums[i] = nums[--n];
    else i++;
  }
  return n;
}`,
      },
    },
  ],
  pitfalls: ['補洞法換過來之後 i 就往前走:換來的那個數也可能是 val', '用 list.remove(val) 一個一個刪:每次 O(n)'],
  check: {
    kind: 'fn',
    fn: 'removeElement',
    cases: [
      { args: [[3, 2, 2, 3], 3], out: 2 },
      { args: [A, VAL], out: 5 },
      { args: [[1], 1], out: 0 },
      { args: [[], 0], out: 0 },
      { args: [[4, 5], 6], out: 2 },
    ],
  },
}
