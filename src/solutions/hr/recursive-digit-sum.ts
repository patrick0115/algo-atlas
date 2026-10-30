import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

function repeatedFig(): FigStep[] {
  const n = '148', k = 3
  const out: FigStep[] = []
  let digits = n.repeat(k)
  out.push({ note: `先把 ${n} 接 ${k} 次，得到 ${digits}；長度是 ${digits.length}。`, views: [arr(digits.split(''), { label: '展開後的數字' }), kv([['重複次數', k], ['長度', digits.length]], '狀態')] })
  while (digits.length > 1) {
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += Number(digits[i])
      out.push({ note: `本輪讀到第 ${i + 1} 位 ${digits[i]}，位數總和暫時是 ${sum}。`, views: [arr(digits.split(''), { label: '目前數字', highlight: [i] }), kv([['位數和', sum]], '狀態')] })
    }
    digits = String(sum)
    out.push({ note: `本輪加完，縮成 ${digits}；若還不只一位就繼續。`, views: [arr(digits.split(''), { label: '縮短後' }), kv([['目前值', digits]], '狀態')] })
  }
  return out
}

function compressedFig(): FigStep[] {
  const n = '148', k = 3
  const out: FigStep[] = []
  let sum = 0
  for (let i = 0; i < n.length; i++) {
    sum += Number(n[i])
    out.push({ note: `原字串讀到 ${n[i]}；單份位數和 ${sum}，三份合起來將是 ${sum * k}。`, views: [arr(n.split(''), { label: '只讀原字串', highlight: [i] }), kv([['單份和', sum], ['總和', sum * k]], '狀態')] })
  }
  sum *= k
  while (sum >= 10) {
    let next = 0
    const before = sum
    while (sum > 0) {
      next += sum % 10
      sum = Math.floor(sum / 10)
    }
    sum = next
    out.push({ note: `${before} 的各位相加得 ${sum}；${sum < 10 ? '已剩一位' : '繼續縮短'}。`, views: [arr(String(before).split(''), { label: '本輪數字' }), kv([['位數和', sum]], '狀態')] })
  }
  return out
}

export const hrRecursiveDigitSum: HrSolution = {
  slug: 'recursive-digit-sum',
  plain: '像把一張數字紙條影印好幾份接起來，反覆把上面的數字相加，直到只剩一位。',
  statement: '輸入數字字串 n 與重複次數 k。想像將 n 連接 k 次形成一個大整數；把它的每一位相加，若仍有多位就重複相加，回傳最後的一位數。',
  examples: [
    { input: 'n = "148", k = 3', output: '3', note: '單份位數和為 13，三份是 39，接著 3+9=12、1+2=3。' },
    { input: 'n = "9875", k = 4', output: '8', note: '單份和 29，總和 116，再縮成 8。' },
  ],
  constraints: [
    'n 可長達 10⁵ 位 → 不適合轉成一般整數。',
    'k 可達 10⁵ → 實際串接 n 共 k 份會耗用過多記憶體。',
    '只在乎各位的和 → 可先計算單份 n 的位數和，再乘 k。',
  ],
  insight: [
    '照題目操作，可以先造出整個重複字串，再逐輪求位數和；但長度會是 |n|×k。',
    '各份 n 完全相同，第一輪總和等於「一份的位數和 × k」，無須真的接起來。',
    '總和之後已是短整數，再反覆求位數和即可。若再用數位根公式，還能縮成模 9 的計算；本解法保留容易看懂的逐輪步驟。',
  ],
  approaches: [
    {
      name: '實際串接並逐輪相加',
      idea: '完整模擬題目描述的每次數字縮減。',
      steps: ['將 n 重複 k 次接成字串。', '若字串長度大於 1，就逐字讀取並求和。', '把和轉回字串，重複直到只剩一位。'],
      figure: { title: 'n = "148", k = 3', steps: repeatedFig() },
      complexity: { time: 'O(|n|k)', space: 'O(|n|k)', why: '首輪必須建立並掃描長達 |n|k 的字串；後續位數迅速縮短。C 版不真的串接，而是把 n 的位數重複加 k 次，空間只要 O(1)，時間一樣 O(|n|k)。' },
      verdict: '最貼近定義，只適合小輸入；|n| 與 k 都到 10⁵ 時要處理 10¹⁰ 個字元，會超時或記憶體不夠，正式提交用下面的解法。',
      code: {
        python: `def superDigit(n, k):
    current = n * k
    while len(current) > 1:
        total = sum(int(ch) for ch in current)  # 一輪各位相加
        current = str(total)
    return int(current)`,
        c: `int superDigit(char* n, int k) {
    long long total = 0;
    for (int copy = 0; copy < k; copy++) {
        for (int i = 0; n[i] != 0; i++) {
            total += n[i] - '0';
        }
    }
    while (total >= 10) {
        long long next = 0;
        while (total > 0) {
            next += total % 10;
            total /= 10;
        }
        total = next;
    }
    return (int)total;
}`,
        cpp: `int superDigit(string n, int k) {
    string current;
    for (int i = 0; i < k; i++) current += n;
    while (current.size() > 1) {
        long long sum = 0;
        for (char ch : current) sum += ch - '0';
        current = to_string(sum);
    }
    return current[0] - '0';
}`,
        java: `public static int superDigit(String n, int k) {
    StringBuilder text = new StringBuilder();
    for (int i = 0; i < k; i++) text.append(n);
    String current = text.toString();
    while (current.length() > 1) {
        long sum = 0;
        for (int i = 0; i < current.length(); i++) sum += current.charAt(i) - '0';
        current = Long.toString(sum);
    }
    return current.charAt(0) - '0';
}`,
        javascript: `function superDigit(n, k) {
    let current = n.repeat(k);
    while (current.length > 1) {
        let sum = 0;
        for (const ch of current) sum += Number(ch);
        current = String(sum);
    }
    return Number(current);
}`,
      },
    },
    {
      name: '先合併重複份數',
      idea: '只讀一份 n，將位數和乘上 k 後再縮減。',
      steps: ['逐字掃描 n 並累加數字。', '將單份位數和乘 k，代表展開後的首輪總和。', '只要總和還有多位，就取各位數字重新求和。', '回傳最後一位。'],
      figure: { title: 'n = "148", k = 3', steps: compressedFig() },
      complexity: { time: 'O(|n| + log(|n|k))', space: 'O(1)', why: '只掃描 n 一次；後續處理的整數位數遠小於原字串，未建立重複字串。' },
      verdict: '能處理很大的 k；保留明確的位數求和流程。',
      code: {
        python: `def superDigit(n, k):
    total = sum(int(ch) for ch in n) * k  # 重複 k 份等於位數和乘 k
    while total >= 10:
        total = sum(int(ch) for ch in str(total))
    return total`,
        c: `int superDigit(char* n, int k) {
    long long total = 0;
    for (int i = 0; n[i] != 0; i++) total += n[i] - '0';
    total *= k;
    while (total >= 10) {
        long long next = 0;
        while (total > 0) {
            next += total % 10;
            total /= 10;
        }
        total = next;
    }
    return (int)total;
}`,
        cpp: `int superDigit(string n, int k) {
    long long total = 0;
    for (char ch : n) total += ch - '0';
    total *= k;
    while (total >= 10) {
        long long next = 0;
        while (total > 0) {
            next += total % 10;
            total /= 10;
        }
        total = next;
    }
    return (int)total;
}`,
        java: `public static int superDigit(String n, int k) {
    long total = 0;
    for (int i = 0; i < n.length(); i++) total += n.charAt(i) - '0';
    total *= k;
    while (total >= 10) {
        long next = 0;
        while (total > 0) {
            next += total % 10;
            total /= 10;
        }
        total = next;
    }
    return (int)total;
}`,
        javascript: `function superDigit(n, k) {
    let total = 0;
    for (const ch of n) total += Number(ch);
    total *= k;
    while (total >= 10) {
        let next = 0;
        while (total > 0) {
            next += total % 10;
            total = Math.floor(total / 10);
        }
        total = next;
    }
    return total;
}`,
      },
    },
  ],
  pitfalls: [
    '不要先將超長的 n 轉成整數；只需逐字讀取。',
    '不要在最佳解中實際建造 n.repeat(k)。',
    '初始和可能超過 32 位整數，C/C++/Java 中間值用 64 位。',
  ],
  check: {
    kind: 'fn', fn: 'superDigit',
    cases: [
      { args: ['148', 3], out: 3 },
      { args: ['9875', 4], out: 8 },
      { args: ['1', 1], out: 1 },
      { args: ['9', 9], out: 9 },
      { args: ['0', 100], out: 0 },
      { args: ['123', 2], out: 3 },
    ],
  },
}
