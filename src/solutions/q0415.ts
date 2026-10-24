import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const backward: FigStep[] = [
  { note: '從最右位開始：6+7=13，寫下 3，進位 1。', views: [arr(['4', '5', '6'], { label: 'num1', highlight: [2] }), arr(['7', '7'], { label: 'num2', highlight: [1] }), arr([3, 1], { label: '目前位 / 進位' })] },
  { note: '下一位 5+7+1=13，再寫下 3，進位仍是 1。結果暫時從低位往高位存成 [3,3]。', views: [arr([3, 3], { label: '倒序結果', done: [0, 1] })] },
  { note: '最高位只剩 4，加進位 1 得 5；倒序結果成 [3,3,5]。', views: [arr([3, 3, 5], { label: '倒序結果', highlight: [2] })] },
  { note: '反轉後是字串 "533"。全程只處理字元，不把長數字轉成整數。', views: [arr(['5', '3', '3'], { label: '答案', done: [0, 1, 2] })] },
]
const bufferFig: FigStep[] = [
  { note: '先準備最多 4 位的緩衝區，寫入指標從最右端開始。', views: [arr(['·', '·', '·', '·'], { label: '緩衝區', highlight: [3] })] },
  { note: '6+7=13，把 3 直接寫在最後一格，保留進位 1。', views: [arr(['·', '·', '·', '3'], { label: '緩衝區', done: [3] })] },
  { note: '5+7+1=13，下一格寫 3；4+1=5，再往左寫 5。', views: [arr(['·', '5', '3', '3'], { label: '緩衝區', done: [1, 2, 3] })] },
  { note: '跳過沒用到的最左一格，直接取得 "533"。', views: [arr(['5', '3', '3'], { label: '答案', done: [0, 1, 2] })] },
]

export const q0415: Solution = {
  id: 415,
  plain: '兩個整數長到不能安全轉成一般數字，就像手算加法一樣，從個位數逐位相加。',
  statement: '給兩個只含數字的非負整數字串 num1、num2，回傳兩者相加的十進位字串。不可直接把整串轉成整數。',
  examples: [{ input: 'num1 = "11", num2 = "123"', output: '"134"' }, { input: 'num1 = "456", num2 = "77"', output: '"533"' }, { input: 'num1 = "0", num2 = "0"', output: '"0"' }],
  constraints: ['字串長度可達 10000；不可依賴固定寬度整數。', '最後可能多出一位進位，例如 99+1=100。'],
  insight: ['一位的結果只依賴兩個對齊的數字與前一位進位。', '從右往左處理，缺少的高位視為 0。', '結果可先倒序存再反轉，也可預留空間從右往左直接填。參考 [[p:string-ops]]。'],
  approaches: [
    {
      name: '倒序收集再反轉', idea: '逐位相加，先把個位數放進結果，最後把結果反轉。',
      steps: ['兩個指標從各字串最右端開始，carry=0。', '每輪取兩個數字與 carry，寫入和的個位。', '更新 carry 並左移指標。', '處理完最後進位，反轉結果。'],
      figure: { title: 'num1 = 456，num2 = 77', steps: backward },
      complexity: { time: 'O(n+m)', space: 'O(max(n,m))', why: '每位只處理一次；結果需要相同量級的空間。' },
      verdict: '推薦寫法，步驟最接近手算。',
      code: {
        python: `def addStrings(num1, num2):
    i, j = len(num1) - 1, len(num2) - 1
    carry = 0
    digits = []
    while i >= 0 or j >= 0 or carry:
        a = ord(num1[i]) - ord('0') if i >= 0 else 0
        b = ord(num2[j]) - ord('0') if j >= 0 else 0
        total = a + b + carry
        digits.append(str(total % 10))  # 先存低位
        carry = total // 10
        i -= 1
        j -= 1
    return ''.join(reversed(digits))`,
        c: `char *addStrings(char *num1, char *num2) {
    int n = strlen(num1);
    int m = strlen(num2);
    int capacity = (n > m ? n : m) + 2;
    char *result = malloc(capacity);
    int length = 0;
    int i = n - 1;
    int j = m - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int a = i >= 0 ? num1[i--] - '0' : 0;
        int b = j >= 0 ? num2[j--] - '0' : 0;
        int total = a + b + carry;
        result[length++] = '0' + total % 10;
        carry = total / 10;
    }
    for (int left = 0, right = length - 1; left < right; left++, right--) {
        char digit = result[left];
        result[left] = result[right];
        result[right] = digit;
    }
    result[length] = '\\0';
    return result;
}`,
        cpp: `string addStrings(string num1, string num2) {
    string result;
    int i = num1.size() - 1;
    int j = num2.size() - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int a = i >= 0 ? num1[i--] - '0' : 0;
        int b = j >= 0 ? num2[j--] - '0' : 0;
        int total = a + b + carry;
        result.push_back('0' + total % 10);
        carry = total / 10;
    }
    reverse(result.begin(), result.end());
    return result;
}`,
        java: `String addStrings(String num1, String num2) {
    StringBuilder result = new StringBuilder();
    int i = num1.length() - 1;
    int j = num2.length() - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry != 0) {
        int a = i >= 0 ? num1.charAt(i--) - '0' : 0;
        int b = j >= 0 ? num2.charAt(j--) - '0' : 0;
        int total = a + b + carry;
        result.append((char) ('0' + total % 10));
        carry = total / 10;
    }
    return result.reverse().toString();
}`,
        javascript: `function addStrings(num1, num2) {
  const digits = [];
  let i = num1.length - 1;
  let j = num2.length - 1;
  let carry = 0;
  while (i >= 0 || j >= 0 || carry) {
    const a = i >= 0 ? num1.charCodeAt(i--) - 48 : 0;
    const b = j >= 0 ? num2.charCodeAt(j--) - 48 : 0;
    const total = a + b + carry;
    digits.push(String(total % 10));
    carry = Math.floor(total / 10);
  }
  return digits.reverse().join('');
}`,
      },
    },
    {
      name: '預留緩衝區從右填', idea: '結果最長只會比較長的輸入多一位，先預留，再從最後一格往左寫。',
      steps: ['預留 max(n,m)+1 個字元。', '兩個輸入指標與輸出指標都從右邊開始。', '寫入每位的個位數並更新進位。', '回傳真正寫到的那段緩衝區。'],
      figure: { title: 'num1 = 456，num2 = 77', steps: bufferFig },
      complexity: { time: 'O(n+m)', space: 'O(max(n,m))', why: '直接填結果，省去反轉；仍需儲存輸出。' },
      verdict: '適合需要直接控制結果緩衝區的語言。',
      code: {
        python: `def addStrings(num1, num2):
    i, j = len(num1) - 1, len(num2) - 1
    result = ['0'] * (max(len(num1), len(num2)) + 1)
    write = len(result) - 1
    carry = 0
    while i >= 0 or j >= 0 or carry:
        a = ord(num1[i]) - 48 if i >= 0 else 0
        b = ord(num2[j]) - 48 if j >= 0 else 0
        total = a + b + carry
        result[write] = str(total % 10)  # 直接寫到正確位置
        carry = total // 10
        i -= 1
        j -= 1
        write -= 1
    return ''.join(result[write + 1:])`,
        c: `char *addStrings(char *num1, char *num2) {
    int n = strlen(num1);
    int m = strlen(num2);
    int width = (n > m ? n : m) + 1;
    char *buffer = malloc(width + 1);
    buffer[width] = '\\0';
    int write = width - 1;
    int i = n - 1;
    int j = m - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int a = i >= 0 ? num1[i--] - '0' : 0;
        int b = j >= 0 ? num2[j--] - '0' : 0;
        int total = a + b + carry;
        buffer[write--] = '0' + total % 10;
        carry = total / 10;
    }
    int start = write + 1;
    memmove(buffer, buffer + start, width - start + 1);
    return buffer;
}`,
        cpp: `string addStrings(string num1, string num2) {
    int width = max(num1.size(), num2.size()) + 1;
    string result(width, '0');
    int i = num1.size() - 1;
    int j = num2.size() - 1;
    int write = width - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int a = i >= 0 ? num1[i--] - '0' : 0;
        int b = j >= 0 ? num2[j--] - '0' : 0;
        int total = a + b + carry;
        result[write--] = '0' + total % 10;
        carry = total / 10;
    }
    return result.substr(write + 1);
}`,
        java: `String addStrings(String num1, String num2) {
    int width = Math.max(num1.length(), num2.length()) + 1;
    char[] result = new char[width];
    int i = num1.length() - 1;
    int j = num2.length() - 1;
    int write = width - 1;
    int carry = 0;
    while (i >= 0 || j >= 0 || carry != 0) {
        int a = i >= 0 ? num1.charAt(i--) - '0' : 0;
        int b = j >= 0 ? num2.charAt(j--) - '0' : 0;
        int total = a + b + carry;
        result[write--] = (char) ('0' + total % 10);
        carry = total / 10;
    }
    return new String(result, write + 1, width - write - 1);
}`,
        javascript: `function addStrings(num1, num2) {
  const width = Math.max(num1.length, num2.length) + 1;
  const result = new Array(width);
  let i = num1.length - 1;
  let j = num2.length - 1;
  let write = width - 1;
  let carry = 0;
  while (i >= 0 || j >= 0 || carry) {
    const a = i >= 0 ? num1.charCodeAt(i--) - 48 : 0;
    const b = j >= 0 ? num2.charCodeAt(j--) - 48 : 0;
    const total = a + b + carry;
    result[write--] = String(total % 10);
    carry = Math.floor(total / 10);
  }
  return result.slice(write + 1).join('');
}`,
      },
    },
  ],
  pitfalls: ['不要把整串字轉為 Number：長數字會失去精度。', '處理完兩串後還要檢查最後進位。'],
  check: { kind: 'fn', fn: 'addStrings', cases: [
    { args: ['11', '123'], out: '134' },
    { args: ['456', '77'], out: '533' },
    { args: ['0', '0'], out: '0' },
    { args: ['999', '1'], out: '1000' },
  ] },
}
