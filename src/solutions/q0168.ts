import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 168. Excel Sheet Column Title

const N = 701

function loopFig(): FigStep[] {
  let n = N
  const res: string[] = []
  const out: FigStep[] = [{ note: 'Excel 欄名像 26 進位,但沒有 0:A = 1 … Z = 26,接著 AA = 27。訣竅是每次先把 n 減 1,讓它變成 0 起算的 26 進位(A = 0 … Z = 25)', views: [arr([N], { label: 'n' })] }]
  while (n > 0) {
    n--
    const r = n % 26
    res.push(String.fromCharCode(65 + r))
    out.push({ note: `n − 1 = ${n},除以 26 的餘數 ${r} → "${String.fromCharCode(65 + r)}"(寫在最前面);n = ${n} ÷ 26 = ${Math.floor(n / 26)}`, views: [arr([...res].reverse(), { label: '目前的欄名', highlight: [0] })] })
    n = Math.floor(n / 26)
  }
  out.push({ note: `n 變成 0,結束 → "${[...res].reverse().join('')}"`, views: [arr([...res].reverse(), { label: '答案', done: res.map((_, i) => i) })] })
  return out
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴:title(n) = title((n − 1) ÷ 26) + 最後一個字母 chr(A + (n − 1) % 26)', views: [arr(['title(701)', '= title(26) + "Y"'], { label: '展開' })] },
    { note: 'title(26) = title(0) + "Z" = "Z";所以 title(701) = "ZY"', views: [arr(['Z', 'Y'], { label: '答案', done: [0, 1] })] },
  ]
}

export const q0168: Solution = {
  id: 168,
  plain: 'Excel 的欄位名稱是 A、B…Z、AA、AB…AZ、BA…ZZ、AAA…。給一個欄位編號(從 1 開始),回傳它的名稱。',
  statement: '給正整數 `columnNumber`,回傳它在 Excel 工作表中對應的欄位名稱(1 → A、26 → Z、27 → AA、28 → AB …)。',
  examples: [
    { input: 'columnNumber = 1', output: '"A"' },
    { input: 'columnNumber = 28', output: '"AB"' },
    { input: 'columnNumber = 701', output: '"ZY"' },
  ],
  constraints: ['1 ≤ columnNumber ≤ 2³¹ − 1'],
  insight: ['看起來是 26 進位,但字母是 1..26 沒有 0(Z 不是「進位成 10」)', '每一輪先 `n −= 1`,就變成正常的 0..25 對應 A..Z', '然後和一般進位轉換一樣:取餘數得最後一個字母,再除以 26'],
  approaches: [
    {
      name: '迴圈:先減 1 再取餘數',
      idea: '`while n`:`n −= 1`、字母 = `chr(65 + n % 26)`、`n //= 26`;最後反轉。',
      steps: ['`res = []`', '`while n > 0`:`n -= 1`', '`res.append(chr(ord("A") + n % 26))`、`n //= 26`', '回傳反轉後的字串'],
      figure: { title: `columnNumber = ${N}`, steps: loopFig() },
      complexity: { time: 'O(log₂₆ n)', space: 'O(log₂₆ n)', why: '每輪除以 26。' },
      verdict: '最推薦。「沒有 0 的進位制」都用先減 1 這招,[171](#/q/171) 是反過來的題目。',
      code: {
        python: `def convertToTitle(columnNumber):
    n, res = columnNumber, []
    while n > 0:
        n -= 1                                # 換成 0 起算:A=0 … Z=25
        res.append(chr(ord('A') + n % 26))
        n //= 26
    return ''.join(reversed(res))`,
        c: `char *convertToTitle(int columnNumber) {
    char buf[16];
    int k = 0;
    long long n = columnNumber;
    while (n > 0) {
        n--;
        buf[k++] = 'A' + n % 26;
        n /= 26;
    }
    char *res = malloc(k + 1);
    for (int i = 0; i < k; i++) res[i] = buf[k - 1 - i];   // 反轉
    res[k] = '\\0';
    return res;
}`,
        cpp: `string convertToTitle(int columnNumber) {
    string res;
    long long n = columnNumber;
    while (n > 0) {
        n--;
        res += char('A' + n % 26);
        n /= 26;
    }
    reverse(res.begin(), res.end());
    return res;
}`,
        java: `String convertToTitle(int columnNumber) {
    StringBuilder sb = new StringBuilder();
    int n = columnNumber;
    while (n > 0) {
        n--;
        sb.append((char) ('A' + n % 26));
        n /= 26;
    }
    return sb.reverse().toString();
}`,
        javascript: `function convertToTitle(columnNumber) {
  let n = columnNumber, res = '';
  while (n > 0) {
    n--;
    res = String.fromCharCode(65 + (n % 26)) + res;
    n = Math.floor(n / 26);
  }
  return res;
}`,
      },
    },
    {
      name: '遞迴',
      idea: '`title(n) = title((n − 1) // 26) + chr(65 + (n − 1) % 26)`,`title(0) = ""`。',
      steps: ['`n == 0` → ""', '回傳 `title((n − 1) // 26) + chr(65 + (n − 1) % 26)`'],
      figure: { title: `columnNumber = ${N}`, steps: recFig() },
      complexity: { time: 'O(log₂₆ n)', space: 'O(log₂₆ n)', why: '遞迴深度最多 7。' },
      verdict: '一行寫完,高位在前自然就不用反轉。',
      code: {
        python: `def convertToTitle(columnNumber):
    n = columnNumber
    if n == 0:
        return ''
    return convertToTitle((n - 1) // 26) + chr(ord('A') + (n - 1) % 26)`,
        c: `static void build(long long n, char *out, int *k) {
    if (n == 0) return;
    build((n - 1) / 26, out, k);              // 先寫高位
    out[(*k)++] = 'A' + (n - 1) % 26;
}

char *convertToTitle(int columnNumber) {
    char *res = malloc(16);
    int k = 0;
    build(columnNumber, res, &k);
    res[k] = '\\0';
    return res;
}`,
        cpp: `string convertToTitle(int columnNumber) {
    long long n = columnNumber;
    if (n == 0) return "";
    return convertToTitle((n - 1) / 26) + char('A' + (n - 1) % 26);
}`,
        java: `String convertToTitle(int columnNumber) {
    if (columnNumber == 0) return "";
    return convertToTitle((columnNumber - 1) / 26) + (char) ('A' + (columnNumber - 1) % 26);
}`,
        javascript: `function convertToTitle(columnNumber) {
  if (columnNumber === 0) return '';
  return convertToTitle(Math.floor((columnNumber - 1) / 26)) + String.fromCharCode(65 + ((columnNumber - 1) % 26));
}`,
      },
    },
  ],
  pitfalls: ['直接 `n % 26`:26 的餘數是 0,會變成 "A@" 之類的錯誤;要先減 1', '先除再減:順序錯了,AA(27)會算錯'],
  check: {
    kind: 'fn',
    fn: 'convertToTitle',
    cases: [
      { args: [1], out: 'A' },
      { args: [28], out: 'AB' },
      { args: [N], out: 'ZY' },
      { args: [26], out: 'Z' },
      { args: [52], out: 'AZ' },
      { args: [2147483647], out: 'FXSHRXW' },
    ],
  },
}
