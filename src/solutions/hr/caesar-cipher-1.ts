import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'abc-Z', result: string[] = [], out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    let ch = s[i]
    if (ch >= 'a' && ch <= 'z') ch = ch === 'z' ? 'a' : String.fromCharCode(ch.charCodeAt(0) + 1)
    else if (ch >= 'A' && ch <= 'Z') ch = ch === 'Z' ? 'A' : String.fromCharCode(ch.charCodeAt(0) + 1)
    result.push(ch)
    out.push({ note: `逐格旋轉第 ${i} 字 ${s[i]}：${s[i] === '-' ? '標點不變' : s[i] === 'Z' ? '越過 Z 要回到 A' : '向後一格'}，目前為 ${result.join('')}。`, views: [arr(s.split(''), { label: '原字串', highlight: [i] }), arr([...result], { label: '已轉換的前綴' })] })
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'abc-Z', k = 1, result: string[] = [], out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i), base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : -1
    const offset = base < 0 ? -1 : (code - base + k % 26) % 26
    result.push(base < 0 ? s[i] : String.fromCharCode(base + offset))
    out.push({ note: `第 ${i} 字 ${s[i]}：${base < 0 ? '不是字母，直接保留' : `基準 ${base}、新偏移 ${offset}`}；結果前綴 ${result.join('')}。`, views: [arr(s.split(''), { label: '原字串', highlight: [i] }), arr([...result], { label: '已編碼前綴' })] })
  }
  return out
}

export const hrCaesarCipher1: HrSolution = {
  slug: "caesar-cipher-1",
  plain: "像轉動兩個各有 26 格的字母輪盤；大小寫各轉 k 格，標點留在原位。",
  statement: "給字串與位移量 k，對大小寫英文字母各自做循環位移；走過 z 或 Z 就回到 a 或 A。數字、標點與空白不變。",
  examples: [
    { input: "s = \"middle-Outz\", k = 2", output: "okffng-Qwvb", note: "每個字母後移兩格，連字號保留，z 會繞回 b。" },
    { input: "s = \"abc-Z\", k = 1", output: "bcd-A", note: "Z 後移一格回到 A，其他字母照常後移。" },
  ],
  constraints: [
    "位移量可能超過 26 → 先取 k % 26，避免逐格旋轉耗時。",
    "大小寫字母分開循環，其他字元不動 → 要先判斷所屬範圍。",
  ],
  insight: [
    "字母表首尾相連，位移後的位置可用餘數求得。",
    "一個字母相對 a 或 A 的索引是 0 到 25；新索引為 (舊索引 + k) % 26。",
    "初學可先逐格往後走，然後用公式一次求出；這是 [[p:string-ops]] 的字元映射。",
  ],
  approaches: [
    {
      name: "逐格旋轉",
      idea: "對每個字母重複往後移一格，共移 k % 26 次。",
      steps: ["將 k 化成 0 到 25。","逐字檢查是否為英文字母。","字母重複往後走 k 次；到 z 或 Z 就繞回首字母。","非字母直接加入答案，最後回傳新字串。"],
      figure: { title: "s = \"abc-Z\", k = 1", steps: firstFig() },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        why: "每個字元都要看一次；字母最多再做 25 次單格位移，25 是常數，所以整體是 O(n)。輸出需 n 字元。",
      },
      verdict: "容易理解循環位移，但每個字元重複做相同步數。",
      code: {
        python: `def caesarCipher(s, k):
    out = []
    for ch in s:
        if ch.isalpha():
            base = ord('A') if ch.isupper() else ord('a')
            for _ in range(k % 26):
                ch = chr(base + (ord(ch) - base + 1) % 26)  # 走過尾端就繞回
        out.append(ch)
    return ''.join(out)`,
        c: `char* caesarCipher(char* s, int k) {
    int n = strlen(s);
    char* out = malloc(n + 1);
    for (int i = 0; i < n; i++) {
        char ch = s[i];
        int base = ch >= 'A' && ch <= 'Z' ? 'A' : ch >= 'a' && ch <= 'z' ? 'a' : 0;
        if (base) {
            for (int j = 0; j < k % 26; j++) {
                ch = base + (ch - base + 1) % 26;
            }
        }
        out[i] = ch;
    }
    out[n] = '\\0';
    return out;
}`,
        cpp: `string caesarCipher(string s, int k) {
    string out = s;
    for (char& ch : out) {
        int base = ch >= 'A' && ch <= 'Z' ? 'A' : ch >= 'a' && ch <= 'z' ? 'a' : 0;
        if (base) {
            for (int j = 0; j < k % 26; j++) {
                ch = base + (ch - base + 1) % 26;
            }
        }
    }
    return out;
}`,
        java: `public static String caesarCipher(String s, int k) {
    StringBuilder out = new StringBuilder();
    for (char raw : s.toCharArray()) {
        char ch = raw;
        int base = ch >= 'A' && ch <= 'Z' ? 'A' : ch >= 'a' && ch <= 'z' ? 'a' : 0;
        if (base != 0) {
            for (int j = 0; j < k % 26; j++) {
                ch = (char)(base + (ch - base + 1) % 26);
            }
        }
        out.append(ch);
    }
    return out.toString();
}`,
        javascript: `function caesarCipher(s, k) {
  let out = '';
  for (let ch of s) {
    const base = ch >= 'A' && ch <= 'Z' ? 65 : ch >= 'a' && ch <= 'z' ? 97 : 0;
    if (base) {
      for (let j = 0; j < k % 26; j++) {
        ch = String.fromCharCode(base + (ch.charCodeAt(0) - base + 1) % 26);
      }
    }
    out += ch;
  }
  return out;
}`,
      },
    },
    {
      name: "用餘數直接計算",
      idea: "把字母視為 0 到 25 的索引，一次算出移動後的位置。",
      steps: ["先算 shift = k % 26。","每字判斷是大寫、小寫或其他。","字母用 (字元碼 − 基底 + shift) % 26 求新索引。","加回基底後加入答案；其他字元原樣加入。"],
      figure: { title: "s = \"abc-Z\", k = 1", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        why: "每字只做固定次數的運算，輸出字串長度為 n。",
      },
      verdict: "單次線性掃描，位移量再大也只需一次計算。",
      code: {
        python: `def caesarCipher(s, k):
    shift = k % 26
    out = []
    for ch in s:
        if 'a' <= ch <= 'z':
            out.append(chr(ord('a') + (ord(ch) - ord('a') + shift) % 26))  # 小寫繞回
        elif 'A' <= ch <= 'Z':
            out.append(chr(ord('A') + (ord(ch) - ord('A') + shift) % 26))
        else:
            out.append(ch)
    return ''.join(out)`,
        c: `char* caesarCipher(char* s, int k) {
    int n = strlen(s);
    char* out = malloc(n + 1);
    int shift = k % 26;
    for (int i = 0; i < n; i++) {
        char ch = s[i];
        if (ch >= 'a' && ch <= 'z') {
            ch = 'a' + (ch - 'a' + shift) % 26;
        } else if (ch >= 'A' && ch <= 'Z') {
            ch = 'A' + (ch - 'A' + shift) % 26;
        }
        out[i] = ch;
    }
    out[n] = '\\0';
    return out;
}`,
        cpp: `string caesarCipher(string s, int k) {
    int shift = k % 26;
    for (char& ch : s) {
        if (ch >= 'a' && ch <= 'z') {
            ch = 'a' + (ch - 'a' + shift) % 26;
        } else if (ch >= 'A' && ch <= 'Z') {
            ch = 'A' + (ch - 'A' + shift) % 26;
        }
    }
    return s;
}`,
        java: `public static String caesarCipher(String s, int k) {
    StringBuilder out = new StringBuilder();
    int shift = k % 26;
    for (char ch : s.toCharArray()) {
        if (ch >= 'a' && ch <= 'z') {
            ch = (char)('a' + (ch - 'a' + shift) % 26);
        } else if (ch >= 'A' && ch <= 'Z') {
            ch = (char)('A' + (ch - 'A' + shift) % 26);
        }
        out.append(ch);
    }
    return out.toString();
}`,
        javascript: `function caesarCipher(s, k) {
  const shift = k % 26;
  let out = '';
  for (const ch of s) {
    const base = ch >= 'a' && ch <= 'z' ? 97 : ch >= 'A' && ch <= 'Z' ? 65 : 0;
    out += base
      ? String.fromCharCode(base + (ch.charCodeAt(0) - base + shift) % 26)
      : ch;
  }
  return out;
}`,
      },
    },
  ],
  pitfalls: [
    "z 與 Z 的繞回位置不同。",
    "連字號、數字和空白原樣保留。",
    "k 可能遠大於 26，要先取餘數。",
    "位移 26 格必須回到原字元。",
  ],
  check: {
    kind: 'fn',
    fn: "caesarCipher",
    cases: [
      { args: ["middle-Outz", 2], out: "okffng-Qwvb" },
      { args: ["abc-Z", 1], out: "bcd-A" },
      { args: ["Zz", 1], out: "Aa" },
      { args: ["a", 0], out: "a" },
      { args: ["a", 26], out: "a" },
      { args: ["9-!", 5], out: "9-!" },
    ],
  },
}
