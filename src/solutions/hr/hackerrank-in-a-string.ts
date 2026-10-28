import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const TARGET = 'hackerrank'
const SAMPLE = 'hereiamstackerrank'

function searchFig(): FigStep[] {
  const out: FigStep[] = []
  let answer = false
  for (let start = 0; start < SAMPLE.length; start++) {
    let j = 0
    const picked: number[] = []
    for (let i = start; i < SAMPLE.length; i++) {
      if (SAMPLE[i] === TARGET[j]) {
        picked.push(i)
        j++
      }
      if (start < 2 && (i < 6 || j === TARGET.length)) out.push({
        note: `從 ${start} 開始，讀到位置 ${i} 的 ${SAMPLE[i]}；已依序找到 ${j} 個字母。${j === TARGET.length ? '十個都找到，答案為 YES。' : '還須繼續。'}`,
        views: [arr(SAMPLE.split(''), { label: '原字串', highlight: [i], done: picked }), arr(TARGET.split(''), { label: '目標', done: Array.from({ length: j }, (_, k) => k), highlight: j < TARGET.length ? [j] : [] })],
      })
      if (j === TARGET.length) {
        answer = true
        break
      }
    }
    if (answer) break
  }
  return out
}

function pointerFig(): FigStep[] {
  const out: FigStep[] = []
  let j = 0
  const picked: number[] = []
  for (let i = 0; i < SAMPLE.length; i++) {
    const wanted = TARGET[j]
    const match = SAMPLE[i] === wanted
    if (match) {
      picked.push(i)
      j++
    }
    out.push({
      note: `i=${i} 看到 ${SAMPLE[i]}，需要 ${wanted}；${match ? `相符，目標指標前進到 ${j}` : `不相符，目標指標仍為 ${j}`}。`,
      views: [arr(SAMPLE.split(''), { label: '原字串', highlight: [i], done: picked }), arr(TARGET.split(''), { label: '已配對／下一個', done: Array.from({ length: j }, (_, k) => k), highlight: j < TARGET.length ? [j] : [] })],
    })
    if (j === TARGET.length) break
  }
  return out
}

export const hrHackerrankInAString: HrSolution = {
  slug: 'hackerrank-in-a-string',
  plain: '像在人群中依序找十位朋友：中間可以遇到別人，但朋友出現的先後順序不能亂。',
  statement: '給一個小寫英文字串 s，判斷能否依原本順序挑出字母，拼成 hackerrank。挑選的字母不必相鄰；成功回傳 YES，否則回傳 NO。',
  examples: [
    { input: 's = "hereiamstackerrank"', output: 'YES', note: '可依序挑出 h、a、c、k、e、r、r、a、n、k，其餘字母跳過。' },
    { input: 's = "hackerworld"', output: 'NO', note: '前半段雖有 hacker，後面湊不出剩下的 rank。' },
  ],
  constraints: [
    's 至少 1 個字母 → 比對過程可直接從索引 0 開始。',
    's 最多 10^4 個字母 → 逐字掃描 O(n) 足夠快，重複搜尋會徒增成本。',
    '字元皆為小寫英文字母 → 可直接用字元相等比較，不必處理大小寫轉換。',
  ],
  insight: [
    '先照定義想：從原字串挑位置，要求位置嚴格遞增；把所有可能起點都試一次，容易寫但重做許多掃描。',
    '若當前需要字母 a，遇到較早的 a 就拿它；較早配對只會留下更多字元給後續，沒有壞處。',
    '所以只需一個指標記錄目標串目前需要哪個字母，形成 [[p:two-pointers]]；這也和 [392](#/q/392) 的子序列判斷相同。',
  ],
  approaches: [
    {
      name: '逐一嘗試起點',
      idea: '每個位置都當作第一個候選字母，從該處重新尋找完整的目標順序。',
      steps: [
        '建立固定目標字串 hackerrank。',
        '依序選每個 start 作起點，將目標索引 j 重設為 0。',
        '從 start 往右掃；遇到目標目前需要的字母就讓 j 加一。',
        '若 j 到達 10，立即回傳 YES；所有起點失敗才回傳 NO。',
      ],
      figure: { title: 'hereiamstackerrank：重新嘗試起點', steps: searchFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多 n 個起點，每個起點最多往右看 n 個字元；只存索引。' },
      verdict: '容易直接對照子序列定義，但重複掃描。',
      code: {
        python: `def hackerrankInString(s):
    target = 'hackerrank'
    for start in range(len(s)):
        j = 0
        for i in range(start, len(s)):
            if j < len(target) and s[i] == target[j]:
                j += 1  # 找到目前需要的字母
            if j == len(target):
                return 'YES'
    return 'NO'`,
        c: `char* hackerrankInString(char* s) {
    const char* target = "hackerrank";
    int n = strlen(s);
    for (int start = 0; start < n; start++) {
        int j = 0;
        for (int i = start; i < n; i++) {
            if (j < 10 && s[i] == target[j]) j++;
            if (j == 10) return "YES";
        }
    }
    return "NO";
}`,
        cpp: `string hackerrankInString(string s) {
    string target = "hackerrank";
    for (int start = 0; start < (int)s.size(); start++) {
        int j = 0;
        for (int i = start; i < (int)s.size(); i++) {
            if (j < 10 && s[i] == target[j]) j++;
            if (j == 10) return "YES";
        }
    }
    return "NO";
}`,
        java: `public static String hackerrankInString(String s) {
    String target = "hackerrank";
    for (int start = 0; start < s.length(); start++) {
        int j = 0;
        for (int i = start; i < s.length(); i++) {
            if (j < 10 && s.charAt(i) == target.charAt(j)) j++;
            if (j == 10) return "YES";
        }
    }
    return "NO";
}`,
        javascript: `function hackerrankInString(s) {
  const target = 'hackerrank';
  for (let start = 0; start < s.length; start++) {
    let j = 0;
    for (let i = start; i < s.length; i++) {
      if (j < target.length && s[i] === target[j]) j++;
      if (j === target.length) return 'YES';
    }
  }
  return 'NO';
}`,
      },
    },
    {
      name: '一次掃描雙指標',
      idea: '原字串指標往右走，目標指標只在成功配對時前進。',
      steps: [
        '令 j=0，表示下一個需要目標字串的第 0 個字母 h。',
        '逐字讀取 s，若當前字母等於 target[j]，就讓 j 前進。',
        '一旦 j 等於目標長度，已找到完整子序列，回傳 YES。',
        '掃描結束仍未完成，就回傳 NO。',
      ],
      figure: { title: 'hereiamstackerrank：雙指標', steps: pointerFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 's 每個字元最多檢查一次，目標只有固定十個字母。' },
      verdict: '最佳解；當字串很長時仍只掃一次。',
      code: {
        python: `def hackerrankInString(s):
    target = 'hackerrank'
    j = 0
    for ch in s:
        if ch == target[j]:
            j += 1  # 保留最早可配對的位置
            if j == len(target):
                return 'YES'
    return 'NO'`,
        c: `char* hackerrankInString(char* s) {
    const char* target = "hackerrank";
    int j = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == target[j]) j++;
        if (j == 10) return "YES";
    }
    return "NO";
}`,
        cpp: `string hackerrankInString(string s) {
    string target = "hackerrank";
    int j = 0;
    for (char ch : s) {
        if (ch == target[j]) j++;
        if (j == 10) return "YES";
    }
    return "NO";
}`,
        java: `public static String hackerrankInString(String s) {
    String target = "hackerrank";
    int j = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) == target.charAt(j)) j++;
        if (j == 10) return "YES";
    }
    return "NO";
}`,
        javascript: `function hackerrankInString(s) {
  const target = 'hackerrank';
  let j = 0;
  for (const ch of s) {
    if (ch === target[j]) j++;
    if (j === target.length) return 'YES';
  }
  return 'NO';
}`,
      },
    },
  ],
  pitfalls: [
    '子序列允許中間跳字母，但順序不能改；不能用字母出現次數判斷。',
    'j 到達 10 後要立刻回傳，避免繼續讀 target[10]。',
    '重複字母 r 必須配對兩次，不是找到一個 r 就夠。',
  ],
  check: {
    kind: 'fn',
    fn: 'hackerrankInString',
    cases: [
      { args: ['hereiamstackerrank'], out: 'YES' },
      { args: ['hackerworld'], out: 'NO' },
      { args: ['hackerrank'], out: 'YES' },
      { args: ['h'], out: 'NO' },
      { args: ['hhhaacckkeerrrraannkk'], out: 'YES' },
      { args: ['hackerrakn'], out: 'NO' },
    ],
  },
}
