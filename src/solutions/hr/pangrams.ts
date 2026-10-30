import { arr } from '../../engine/helpers'
import { count26 } from '../fig'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'The quick brown fox jumps over the lazy dog', lower = s.toLowerCase(), out: FigStep[] = []
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  for (let k = 0; k < 26; k++) {
    const at = lower.indexOf(letters[k])
    out.push({ note: `搜尋字母 ${letters[k]}：${at >= 0 ? `在索引 ${at} 找到，換下一個字母` : '整句都找不到，回傳 not pangram'}${k === 25 && at >= 0 ? '；26 個字母都找到，所以是 pangram' : ''}。`, views: [arr(s.split(''), { label: '句子', highlight: at >= 0 ? [at] : [] }), arr(letters, { label: '要找的字母', highlight: [k], done: Array.from({ length: k }, (_, j) => j) })] })
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'The quick brown fox jumps over the lazy dog', used = new Array(26).fill(0), out: FigStep[] = []
  let kinds = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i].toLowerCase(), k = ch.charCodeAt(0) - 97
    if (k >= 0 && k < 26 && used[k] === 0) { used[k] = 1; kinds++ }
    if (i < 5 || i % 5 === 4 || i === s.length - 1) out.push({ note: `讀到 ${s[i]}；${k >= 0 && k < 26 ? `對應第 ${k + 1} 格` : '非英文字母，不計入'}，目前已有 ${kinds}/26 種。`, views: [arr(s.split(''), { label: '句子', highlight: [i] }), count26(used, '26 格是否出現', k >= 0 && k < 26 ? [k] : [])] })
  }
  return out
}

export const hrPangrams: HrSolution = {
  slug: "pangrams",
  plain: "像集滿 26 張字母卡；讀完一句話後，看 a 到 z 是否每張至少收過一張。",
  statement: "忽略大小寫和空白，若句子包含 26 種英文字母則回傳 pangram，否則回傳 not pangram。",
  examples: [
    { input: "s = \"We promptly judged antique ivory buckles for the next prize\"", output: "pangram", note: "忽略大小寫和空白後，26 個字母都有出現。" },
    { input: "s = \"We promptly judged antique ivory buckles for the prize\"", output: "not pangram", note: "少了 x。" },
  ],
  constraints: [
    "句子含英文字母及空白 → 空白不列入字母種類。",
    "英文字母只有 26 種 → 固定陣列或集合即可儲存出現狀態。",
  ],
  insight: [
    "題目問的是字母「有沒有出現」，重複幾次不重要。",
    "可以逐字母搜尋整句，但會重複掃描；改用 [[p:hash-map]] 的集合或 26 個布林值。",
    "最後確認每一格都曾被標記。",
  ],
  approaches: [
    {
      name: "對每個字母搜尋整句",
      idea: "逐一檢查 a 到 z 是否在轉小寫後的句子中。",
      steps: ["先把整句轉成小寫。","從 a 到 z 逐一搜尋。","若有任何字母找不到，立刻回傳 not pangram。","全部找到就回傳 pangram。"],
      figure: { title: "s = \"The quick brown fox jumps over the lazy dog\"", steps: firstFig() },
      complexity: {
        time: "O(26n)",
        space: "O(n)",
        why: "每種字母最多重新掃描 n 個字元；小寫副本需 n 空間。",
      },
      verdict: "容易想到；26 是固定常數，但句子會被反覆檢查。",
      code: {
        python: `def pangrams(s):
    lower = s.lower()
    for ch in 'abcdefghijklmnopqrstuvwxyz':
        if ch not in lower:  # 有一種字母缺席就失敗
            return 'not pangram'
    return 'pangram'`,
        c: `char* pangrams(char* s) {
    for (char target = 'a'; target <= 'z'; target++) {
        int found = 0;
        for (int i = 0; s[i] != '\\0'; i++) {
            char ch = s[i] >= 'A' && s[i] <= 'Z' ? s[i] + 32 : s[i];
            if (ch == target) {
                found = 1;
                break;
            }
        }
        if (!found) {
            return "not pangram";
        }
    }
    return "pangram";
}`,
        cpp: `string pangrams(string s) {
    for (char target = 'a'; target <= 'z'; target++) {
        bool found = false;
        for (char ch : s) {
            if (tolower(ch) == target) {
                found = true;
                break;
            }
        }
        if (!found) {
            return "not pangram";
        }
    }
    return "pangram";
}`,
        java: `public static String pangrams(String s) {
    String lower = s.toLowerCase();
    for (char ch = 'a'; ch <= 'z'; ch++) {
        if (lower.indexOf(ch) < 0) {
            return "not pangram";
        }
    }
    return "pangram";
}`,
        javascript: `function pangrams(s) {
  const lower = s.toLowerCase();
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
    if (!lower.includes(ch)) {
      return 'not pangram';
    }
  }
  return 'pangram';
}`,
      },
    },
    {
      name: "一次掃描記錄字母",
      idea: "用 26 格記下出現過的字母，達到 26 種即可成功。",
      steps: ["建立 26 格 false，seen = 0。","逐字轉成小寫；空白跳過。","若該字母尚未出現，標記並把 seen 加一。","seen 達 26 時回傳 pangram；掃完仍不足就回傳 not pangram。"],
      figure: { title: "s = \"The quick brown fox jumps over the lazy dog\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        why: "每字元處理一次；固定 26 格不隨句長增加。",
      },
      verdict: "長句只掃描一次；可在找到第 26 種字母時提前結束。",
      code: {
        python: `def pangrams(s):
    seen = set()
    for ch in s.lower():
        if 'a' <= ch <= 'z':
            seen.add(ch)  # 只記錄不同的字母
        if len(seen) == 26:
            return 'pangram'
    return 'not pangram'`,
        c: `char* pangrams(char* s) {
    int seen[26] = {0};
    int count = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        char ch = s[i] >= 'A' && s[i] <= 'Z' ? s[i] + 32 : s[i];
        if (ch >= 'a' && ch <= 'z' && !seen[ch - 'a']) {
            seen[ch - 'a'] = 1;
            count++;
        }
    }
    return count == 26 ? "pangram" : "not pangram";
}`,
        cpp: `string pangrams(string s) {
    bool seen[26] = {};
    int count = 0;
    for (char ch : s) {
        ch = tolower(ch);
        if (ch >= 'a' && ch <= 'z' && !seen[ch - 'a']) {
            seen[ch - 'a'] = true;
            count++;
        }
    }
    return count == 26 ? "pangram" : "not pangram";
}`,
        java: `public static String pangrams(String s) {
    boolean[] seen = new boolean[26];
    int count = 0;
    for (char ch : s.toLowerCase().toCharArray()) {
        if (ch >= 'a' && ch <= 'z' && !seen[ch - 'a']) {
            seen[ch - 'a'] = true;
            count++;
        }
    }
    return count == 26 ? "pangram" : "not pangram";
}`,
        javascript: `function pangrams(s) {
  const seen = new Array(26).fill(false);
  let count = 0;
  for (const raw of s.toLowerCase()) {
    const i = raw.charCodeAt(0) - 97;
    if (i >= 0 && i < 26 && !seen[i]) {
      seen[i] = true;
      count++;
    }
  }
  return count === 26 ? 'pangram' : 'not pangram';
}`,
      },
    },
  ],
  pitfalls: [
    "空白不能算成第 27 種字母。",
    "同一個字母的大寫與小寫只算一種。",
  ],
  check: {
    kind: 'fn',
    fn: "pangrams",
    cases: [
      { args: ["We promptly judged antique ivory buckles for the next prize"], out: "pangram" },
      { args: ["We promptly judged antique ivory buckles for the prize"], out: "not pangram" },
      { args: ["abcdefghijklmnopqrstuvwxyz"], out: "pangram" },
      { args: ["ABCDEFGHIJKLMNOPQRSTUVWXYZ"], out: "pangram" },
      { args: ["a"], out: "not pangram" },
      { args: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], out: "not pangram" },
    ],
  },
}
