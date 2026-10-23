import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 989. Add to Array-Form of Integer
const NUM = [1, 2, 0, 0], K = 34
const carryFig: FigStep[] = [
  { note: 'num 的每個元素是一位十進位數字。從最右邊開始加,把 k 當成進位值一起處理。', views: [arr(NUM, { label: 'num' }), arr([K], { label: 'k' })] },
  { note: '1200 + 34:從右往左得到 4、3、2、1,最後反轉成 [1,2,3,4]。', views: [arr([4, 3, 2, 1], { label: '由低位到高位' }), arr([1, 2, 3, 4], { label: '答案', done: [0, 1, 2, 3] })] },
]
const digitFig: FigStep[] = [
  { note: '傳統直式加法:每輪取 num 的末位、k 的末位及舊進位,三者相加。', views: [arr([9, 9, 9], { label: 'num' }), arr([1], { label: 'k' })] },
  { note: '999 + 1 每一位都產生進位,最後還要補上最前面的 1。', views: [arr([1, 0, 0, 0], { label: '答案', done: [0] })] },
]

export const q0989: Solution = {
  id: 989,
  plain: '一個大整數被拆成一位一位的陣列,例如 [1,2,0,0] 代表 1200。把另一個整數加進去,仍以數字陣列回傳。',
  statement: '給十進位數字陣列 num(最高位在前)和非負整數 k,求 num 代表的數加 k 之後的數字陣列。num 可能長到不能放進一般整數型別。',
  examples: [
    { input: 'num = [1,2,0,0], k = 34', output: '[1,2,3,4]' },
    { input: 'num = [2,7,4], k = 181', output: '[4,5,5]' },
    { input: 'num = [9,9,9], k = 1', output: '[1,0,0,0]' },
  ],
  constraints: ['num 最多 10⁴ 位,不能先轉成固定寬度整數', 'k 為非負整數'],
  insight: ['和紙上直式加法一樣,從最低位開始。', '當前 num 的數字與 k 的最低位相加,多出的十位進到下一輪。', '輸出先得到低位,最後反轉即可。'],
  approaches: [
    {
      name: '把 k 當作整體進位',
      idea: '由右往左把 num 的數字加進 k;當前位取 k % 10,再令 k 整除 10。',
      steps: ['i 指向 num 最後一位,carry = k', '只要 i 尚未越界或 carry > 0,把 num[i] 加進 carry', '輸出 carry % 10,carry = floor(carry/10)', '反轉輸出陣列'],
      figure: { title: '1200 + 34', steps: carryFig },
      complexity: { time: 'O(n + log k)', space: 'O(n + log k)', why: '逐位處理並保存結果。' },
      verdict: '程式短,不需要分別拆 k 和傳統進位。',
      code: {
        python: `def addToArrayForm(num, k):
    result = []
    i = len(num) - 1
    while i >= 0 or k:
        if i >= 0:
            k += num[i]
            i -= 1
        result.append(k % 10)
        k //= 10
    return result[::-1]`,
        c: `int *addToArrayForm(int *num, int numSize, int k, int *returnSize) {
    int *result = malloc((numSize + 12) * sizeof(int));
    int length = 0, i = numSize - 1;
    while (i >= 0 || k) {
        if (i >= 0) k += num[i--];
        result[length++] = k % 10;
        k /= 10;
    }
    for (int l = 0, r = length - 1; l < r; l++, r--) {
        int t = result[l]; result[l] = result[r]; result[r] = t;
    }
    *returnSize = length;
    return result;
}`,
        cpp: `vector<int> addToArrayForm(vector<int>& num, int k) {
    vector<int> result;
    for (int i = num.size() - 1; i >= 0 || k; i--) {
        if (i >= 0) k += num[i];
        result.push_back(k % 10);
        k /= 10;
    }
    reverse(result.begin(), result.end());
    return result;
}`,
        java: `List<Integer> addToArrayForm(int[] num, int k) {
    List<Integer> result = new ArrayList<>();
    for (int i = num.length - 1; i >= 0 || k > 0; i--) {
        if (i >= 0) k += num[i];
        result.add(k % 10);
        k /= 10;
    }
    Collections.reverse(result);
    return result;
}`,
        javascript: `function addToArrayForm(num, k) {
  const result = [];
  for (let i = num.length - 1; i >= 0 || k; i--) {
    if (i >= 0) k += num[i];
    result.push(k % 10);
    k = Math.floor(k / 10);
  }
  return result.reverse();
}`,
      },
    },
    {
      name: '逐位直式加法',
      idea: '分別讀 num 和 k 的當前個位數,加上上一輪進位,更接近手算過程。',
      steps: ['i 指向 num 末位,carry = 0', '每輪取 num[i] 或 0,以及 k % 10', 'sum = 兩位數字 + carry;輸出 sum % 10,更新 carry = floor(sum/10)', '直到兩邊和進位都用完,反轉結果'],
      figure: { title: '999 + 1 的連續進位', steps: digitFig },
      complexity: { time: 'O(n + log k)', space: 'O(n + log k)', why: '每個十進位位數處理一次。' },
      verdict: '適合練習兩個大數的加法;換成另一個數字陣列時也能沿用。',
      code: {
        python: `def addToArrayForm(num, k):
    result, carry = [], 0
    i = len(num) - 1
    while i >= 0 or k or carry:
        a = num[i] if i >= 0 else 0
        b = k % 10
        k //= 10
        total = a + b + carry
        result.append(total % 10)
        carry = total // 10
        i -= 1
    return result[::-1]`,
        c: `int *addToArrayForm(int *num, int numSize, int k, int *returnSize) {
    int *result = malloc((numSize + 12) * sizeof(int));
    int length = 0, i = numSize - 1, carry = 0;
    while (i >= 0 || k || carry) {
        int a = i >= 0 ? num[i] : 0, b = k % 10;
        k /= 10;
        int total = a + b + carry;
        result[length++] = total % 10;
        carry = total / 10;
        i--;
    }
    for (int l = 0, r = length - 1; l < r; l++, r--) {
        int t = result[l]; result[l] = result[r]; result[r] = t;
    }
    *returnSize = length;
    return result;
}`,
        cpp: `vector<int> addToArrayForm(vector<int>& num, int k) {
    vector<int> result;
    int carry = 0;
    for (int i = num.size() - 1; i >= 0 || k || carry; i--) {
        int a = i >= 0 ? num[i] : 0, b = k % 10;
        k /= 10;
        int total = a + b + carry;
        result.push_back(total % 10);
        carry = total / 10;
    }
    reverse(result.begin(), result.end());
    return result;
}`,
        java: `List<Integer> addToArrayForm(int[] num, int k) {
    List<Integer> result = new ArrayList<>();
    int carry = 0;
    for (int i = num.length - 1; i >= 0 || k > 0 || carry > 0; i--) {
        int a = i >= 0 ? num[i] : 0, b = k % 10;
        k /= 10;
        int total = a + b + carry;
        result.add(total % 10);
        carry = total / 10;
    }
    Collections.reverse(result);
    return result;
}`,
        javascript: `function addToArrayForm(num, k) {
  const result = [];
  let carry = 0;
  for (let i = num.length - 1; i >= 0 || k || carry; i--) {
    const a = i >= 0 ? num[i] : 0, b = k % 10;
    k = Math.floor(k / 10);
    const total = a + b + carry;
    result.push(total % 10);
    carry = Math.floor(total / 10);
  }
  return result.reverse();
}`,
      },
    },
  ],
  pitfalls: ['num 可能有上萬位,不能把它先轉成一般整數。', '最高位可能因進位而多出一位,例如 999 + 1 = 1000。', '結果從低位收集時,回傳前要反轉。'],
  check: { kind: 'fn', fn: 'addToArrayForm', cases: [
    { args: [NUM, K], out: [1, 2, 3, 4] },
    { args: [[2, 7, 4], 181], out: [4, 5, 5] },
    { args: [[9, 9, 9], 1], out: [1, 0, 0, 0] },
    { args: [[0], 0], out: [0] },
  ] },
}
