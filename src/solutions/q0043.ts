import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 43. Multiply Strings

const A = '123'
const B = '45'

function posFig(): FigStep[] {
  const m = A.length
  const n = B.length
  const pos = Array(m + n).fill(0)
  const out: FigStep[] = [{ note: `直式乘法的規律:num1[i] × num2[j] 的結果,會落在答案的第 i + j 和 i + j + 1 位(從左數)。${A} × ${B} 的答案最多 ${m} + ${n} = ${m + n} 位`, views: [arr(A.split(''), { label: 'num1' }), arr(B.split(''), { label: 'num2' }), arr([...pos], { label: 'pos' })] }]
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--) {
      const mul = +A[i] * +B[j]
      const sum = mul + pos[i + j + 1]
      pos[i + j + 1] = sum % 10
      pos[i + j] += Math.floor(sum / 10)
      out.push({
        note: `${A[i]} × ${B[j]} = ${mul},加上 pos[${i + j + 1}] 原本的值 → ${sum}:個位 ${sum % 10} 留在 pos[${i + j + 1}],十位 ${Math.floor(sum / 10)} 進到 pos[${i + j}]`,
        views: [arr(A.split(''), { label: 'num1', highlight: [i] }), arr(B.split(''), { label: 'num2', highlight: [j] }), arr([...pos], { label: 'pos', highlight: [i + j + 1], compare: [i + j] })],
      })
    }
  const s = pos.join('').replace(/^0+/, '') || '0'
  out.push({ note: `去掉開頭的 0 → "${s}"`, views: [arr(pos, { label: 'pos', done: range(pos.length - s.length, pos.length - 1), dim: range(0, pos.length - s.length - 1) })] })
  return out
}

function rowFig(): FigStep[] {
  return [
    { note: '小學的直式乘法:num1 分別乘上 num2 的每一位,每往左一位就多補一個 0', views: [arr(['123 × 5 = 615', '123 × 4 = 492 → 4920'], { label: '部分積' })] },
    { note: '再把部分積用「字串加法」加起來:615 + 4920 = 5535', views: [arr(['5', '5', '3', '5'], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

export const q0043: Solution = {
  id: 43,
  plain: '兩個用字串表示的大數字(可能有兩百位),算它們相乘的結果,也用字串回傳。不能直接轉成整數 —— 要自己模擬小學的直式乘法。',
  statement: '給兩個以字串表示的非負整數 `num1`、`num2`,回傳它們的乘積(也以字串表示)。不可以使用內建的大數函式庫,也不能直接把輸入轉成整數。',
  examples: [
    { input: 'num1 = "2", num2 = "3"', output: '"6"' },
    { input: 'num1 = "123", num2 = "456"', output: '"56088"' },
  ],
  constraints: ['長度 ≤ 200,只含數字,除了 "0" 本身之外沒有前導 0'],
  insight: [
    'm 位數 × n 位數的結果最多 m + n 位',
    '直式乘法的位置關係:`num1[i] × num2[j]` 會加到答案的第 `i + j + 1` 位,進位到第 `i + j` 位(索引從左邊、從 0 算)',
    '所以開一個長度 m + n 的陣列,兩層迴圈把每一對數字的乘積「累加到對的位置」就好',
    '最後去掉開頭的 0;全部是 0 時要回傳 "0"',
  ],
  approaches: [
    {
      name: '部分積 + 字串加法',
      idea: 'num1 乘上 num2 的每一位(單一位數乘法很簡單),後面補對應個數的 0,再一個一個用字串加法加起來。',
      steps: ['`for j` 從 num2 的最後一位往前:`part = num1 × num2[j]` 後面補 0', '`res = addStrings(res, part)`', '回傳 res'],
      figure: { title: `"${A}" × "${B}"`, steps: rowFig() },
      complexity: { time: 'O(n · (m + n))', space: 'O(m + n)', why: 'n 個部分積,每個要做一次長度 O(m + n) 的加法。' },
      verdict: '最接近手算,但要寫兩個輔助函式(單位數乘法、字串加法),比較囉嗦。',
      code: {
        python: `def multiply(num1, num2):
    if num1 == '0' or num2 == '0':
        return '0'

    def add(a, b):                            # 字串加法
        i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
        while i >= 0 or j >= 0 or carry:
            s = carry + (int(a[i]) if i >= 0 else 0) + (int(b[j]) if j >= 0 else 0)
            out.append(str(s % 10))
            carry = s // 10
            i, j = i - 1, j - 1
        return ''.join(reversed(out))

    res = '0'
    for k, d in enumerate(reversed(num2)):
        carry, part = 0, []
        for c in reversed(num1):              # num1 × 單一位數
            s = int(c) * int(d) + carry
            part.append(str(s % 10))
            carry = s // 10
        if carry:
            part.append(str(carry))
        res = add(res, ''.join(reversed(part)) + '0' * k)
    return res`,
        c: `static void addInto(int *acc, int len, const int *part) {   // acc += part(低位在前)
    int carry = 0;
    for (int i = 0; i < len; i++) {
        int s = acc[i] + part[i] + carry;
        acc[i] = s % 10;
        carry = s / 10;
    }
}

char *multiply(char *num1, char *num2) {
    int m = strlen(num1), n = strlen(num2), len = m + n;
    int *acc = calloc(len, sizeof(int)), *part = malloc(len * sizeof(int));
    for (int k = 0; k < n; k++) {
        int d = num2[n - 1 - k] - '0', carry = 0;
        memset(part, 0, len * sizeof(int));
        for (int i = 0; i < m; i++) {
            int s = (num1[m - 1 - i] - '0') * d + carry;
            part[i + k] = s % 10;
            carry = s / 10;
        }
        part[m + k] = carry;
        addInto(acc, len, part);
    }
    int top = len - 1;
    while (top > 0 && acc[top] == 0) top--;
    char *res = malloc(top + 2);
    for (int i = 0; i <= top; i++) res[i] = acc[top - i] + '0';
    res[top + 1] = '\\0';
    free(acc); free(part);
    return res;
}`,
        cpp: `string addStr(const string& a, const string& b) {
    string out;
    int i = a.size() - 1, j = b.size() - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int s = carry + (i >= 0 ? a[i--] - '0' : 0) + (j >= 0 ? b[j--] - '0' : 0);
        out.push_back('0' + s % 10);
        carry = s / 10;
    }
    reverse(out.begin(), out.end());
    return out;
}

string multiply(string num1, string num2) {
    if (num1 == "0" || num2 == "0") return "0";
    string res = "0";
    int n = num2.size();
    for (int k = 0; k < n; k++) {
        int d = num2[n - 1 - k] - '0', carry = 0;
        string part;
        for (int i = num1.size() - 1; i >= 0; i--) {
            int s = (num1[i] - '0') * d + carry;
            part.push_back('0' + s % 10);
            carry = s / 10;
        }
        if (carry) part.push_back('0' + carry);
        reverse(part.begin(), part.end());
        res = addStr(res, part + string(k, '0'));
    }
    return res;
}`,
        java: `String multiply(String num1, String num2) {
    if (num1.equals("0") || num2.equals("0")) return "0";
    String res = "0";
    int n = num2.length();
    for (int k = 0; k < n; k++) {
        int d = num2.charAt(n - 1 - k) - '0', carry = 0;
        StringBuilder part = new StringBuilder();
        for (int i = num1.length() - 1; i >= 0; i--) {
            int s = (num1.charAt(i) - '0') * d + carry;
            part.append(s % 10);
            carry = s / 10;
        }
        if (carry > 0) part.append(carry);
        part.reverse();
        for (int z = 0; z < k; z++) part.append('0');
        res = add(res, part.toString());
    }
    return res;
}

private String add(String a, String b) {
    StringBuilder out = new StringBuilder();
    int i = a.length() - 1, j = b.length() - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry > 0) {
        int s = carry + (i >= 0 ? a.charAt(i--) - '0' : 0) + (j >= 0 ? b.charAt(j--) - '0' : 0);
        out.append(s % 10);
        carry = s / 10;
    }
    return out.reverse().toString();
}`,
        javascript: `function multiply(num1, num2) {
  if (num1 === '0' || num2 === '0') return '0';
  const add = (a, b) => {
    let i = a.length - 1, j = b.length - 1, carry = 0, out = '';
    while (i >= 0 || j >= 0 || carry) {
      const s = carry + (i >= 0 ? +a[i--] : 0) + (j >= 0 ? +b[j--] : 0);
      out = (s % 10) + out;
      carry = Math.floor(s / 10);
    }
    return out;
  };
  let res = '0';
  for (let k = 0; k < num2.length; k++) {
    const d = +num2[num2.length - 1 - k];
    let carry = 0, part = '';
    for (let i = num1.length - 1; i >= 0; i--) {
      const s = +num1[i] * d + carry;
      part = (s % 10) + part;
      carry = Math.floor(s / 10);
    }
    if (carry) part = carry + part;
    res = add(res, part + '0'.repeat(k));
  }
  return res;
}`,
      },
    },
    {
      name: '位置陣列(i + j 規律)',
      idea: '`pos` 長度 m + n。`num1[i] × num2[j]` 加上 `pos[i+j+1]`,個位留在 `pos[i+j+1]`,十位加到 `pos[i+j]`。最後去掉前導 0。',
      steps: ['`pos = [0] * (m + n)`', '`for i` 由右往左、`for j` 由右往左:`s = d1 × d2 + pos[i+j+1]`', '`pos[i+j+1] = s % 10`、`pos[i+j] += s // 10`', '拼起來、去掉開頭的 0(全空就回傳 "0")'],
      figure: { title: `"${A}" × "${B}"`, steps: posFig() },
      complexity: { time: 'O(m · n)', space: 'O(m + n)', why: '每對數字乘一次。' },
      verdict: '最推薦:一個陣列、兩層迴圈,不用寫字串加法。',
      code: {
        python: `def multiply(num1, num2):
    m, n = len(num1), len(num2)
    pos = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            s = int(num1[i]) * int(num2[j]) + pos[i + j + 1]
            pos[i + j + 1] = s % 10           # 個位留在 i+j+1
            pos[i + j] += s // 10             # 進位加到 i+j
    res = ''.join(map(str, pos)).lstrip('0')
    return res or '0'`,
        c: `char *multiply(char *num1, char *num2) {
    int m = strlen(num1), n = strlen(num2);
    int *pos = calloc(m + n, sizeof(int));
    for (int i = m - 1; i >= 0; i--)
        for (int j = n - 1; j >= 0; j--) {
            int s = (num1[i] - '0') * (num2[j] - '0') + pos[i + j + 1];
            pos[i + j + 1] = s % 10;
            pos[i + j] += s / 10;
        }
    int k = 0;
    while (k < m + n - 1 && pos[k] == 0) k++;
    char *res = malloc(m + n - k + 1);
    for (int i = k; i < m + n; i++) res[i - k] = pos[i] + '0';
    res[m + n - k] = '\\0';
    free(pos);
    return res;
}`,
        cpp: `string multiply(string num1, string num2) {
    int m = num1.size(), n = num2.size();
    vector<int> pos(m + n, 0);
    for (int i = m - 1; i >= 0; i--)
        for (int j = n - 1; j >= 0; j--) {
            int s = (num1[i] - '0') * (num2[j] - '0') + pos[i + j + 1];
            pos[i + j + 1] = s % 10;
            pos[i + j] += s / 10;
        }
    string res;
    for (int d : pos)
        if (!(res.empty() && d == 0)) res.push_back('0' + d);
    return res.empty() ? "0" : res;
}`,
        java: `String multiply(String num1, String num2) {
    int m = num1.length(), n = num2.length();
    int[] pos = new int[m + n];
    for (int i = m - 1; i >= 0; i--)
        for (int j = n - 1; j >= 0; j--) {
            int s = (num1.charAt(i) - '0') * (num2.charAt(j) - '0') + pos[i + j + 1];
            pos[i + j + 1] = s % 10;
            pos[i + j] += s / 10;
        }
    StringBuilder sb = new StringBuilder();
    for (int d : pos)
        if (!(sb.length() == 0 && d == 0)) sb.append(d);
    return sb.length() == 0 ? "0" : sb.toString();
}`,
        javascript: `function multiply(num1, num2) {
  const m = num1.length, n = num2.length, pos = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--) {
      const s = +num1[i] * +num2[j] + pos[i + j + 1];
      pos[i + j + 1] = s % 10;
      pos[i + j] += Math.floor(s / 10);
    }
  const res = pos.join('').replace(/^0+/, '');
  return res || '0';
}`,
      },
    },
  ],
  pitfalls: [
    '直接 `int(num1) * int(num2)`:題目禁止,而且在 C/Java 會溢位',
    '去前導 0 時把答案 "0" 也去掉,回傳空字串',
    '`pos[i+j]` 只寫入不累加:同一格會收到好幾對數字的進位,要用 `+=`',
  ],
  followUp: [{ q: '更快?', a: '長度上萬時可以用 Karatsuba(O(n^1.58))或 FFT(O(n log n)),面試不會要求。' }],
  check: {
    kind: 'fn',
    fn: 'multiply',
    cases: [
      { args: ['2', '3'], out: '6' },
      { args: ['123', '456'], out: '56088' },
      { args: [A, B], out: '5535' },
      { args: ['0', '9999'], out: '0' },
      { args: ['999', '999'], out: '998001' },
      { args: ['123456789', '987654321'], out: '121932631112635269' },
    ],
  },
}
