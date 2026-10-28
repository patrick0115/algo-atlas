import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = 'AABAAB'

function firstFig(): FigStep[] {
  const out: FigStep[] = []
  let deletions = 0
  for (let i = 1; i < SAMPLE.length; i++) {
    const same = SAMPLE[i] === SAMPLE[i - 1]
    if (same) deletions++
    out.push({ note: `比較索引 ${i - 1}、${i} 的 ${SAMPLE[i - 1]}${SAMPLE[i]}；${same ? '相同，至少刪一個' : '相異，已交替'}。目前累計 ${deletions} 次。`, views: [arr(SAMPLE.split(''), { label: '相鄰字元', highlight: [i - 1, i] }), arr([deletions], { label: '累計刪除數' })] })
  }
  return out
}

function secondFig(): FigStep[] {
  const out: FigStep[] = []
  let last = '', deletions = 0
  const kept: string[] = []
  for (let i = 0; i < SAMPLE.length; i++) {
    const remove = SAMPLE[i] === last
    if (remove) deletions++
    else { last = SAMPLE[i]; kept.push(last) }
    out.push({ note: `讀到 ${SAMPLE[i]}；${remove ? `與最後保留的 ${last} 相同，刪掉` : `保留它，新的 last = ${last}`}。保留串 ${kept.join('')}，刪除 ${deletions}。`, views: [arr(SAMPLE.split(''), { label: '原字串', highlight: [i] }), arr([...kept], { label: '已保留字元' }), arr([deletions], { label: '刪除數' })] })
  }
  return out
}

export const hrAlternatingCharacters: HrSolution = {
  slug: 'alternating-characters',
  plain: '像把排隊的 A、B 排成交錯隊形；同字母連成一排時，每段只留一人，其餘要請出隊伍。',
  statement: '字串只含 A 與 B。可以刪除字元，求讓相鄰兩字元都不同所需的最少刪除次數。',
  examples: [
    { input: 's = "AAAA"', output: '3', note: '四個 A 只能保留一個。' },
    { input: 's = "ABABABAB"', output: '0', note: '原本就交錯。' },
    { input: 's = "AABAAB"', output: '2', note: '兩段 AA 各刪一個。' },
  ],
  constraints: [
    '字串長度可達 10^5 → 需要線性掃描，避免真的反覆刪除字串。',
    '只有 A、B 兩種字母 → 判斷相鄰是否相同就足夠。',
  ],
  insight: [
    '先看一段連續的 A：若有 k 個，只能留一個，至少刪 k−1 個。',
    '各段互不干擾，因此每對相同的相鄰字元貢獻一次刪除。',
    '可以逐一比較相鄰字元，也可以一路維持目前保留的最後一個字元；兩者都屬 [[p:string-ops]]。',
  ],
  approaches: [
    {
      name: '逐對比較', idea: '把每一對相鄰字元看一遍，相同就累加一次。',
      steps: [
        '設答案為 0，從第二個字元開始。',
        '比較目前字元與原字串的前一個字元。',
        '相同就把答案加一，直到字串結尾。',
      ],
      figure: { title: 's = "AABAAB"', steps: firstFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個相鄰位置只比較一次，僅保存計數器。' },
      verdict: '寫法直接；即使刪掉前面的重複字元，連續段的每條相同邊仍剛好算一次。',
      code: {
        python: `def alternatingCharacters(s):
    deletions = 0
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:  # 相同的一對必須刪一個
            deletions += 1
    return deletions`,
        c: `int alternatingCharacters(char* s) {
    int deletions = 0;
    for (int i = 1; s[i] != '\\0'; i++) {
        if (s[i] == s[i - 1]) {
            deletions++;
        }
    }
    return deletions;
}`,
        cpp: `int alternatingCharacters(string s) {
    int deletions = 0;
    for (int i = 1; i < (int)s.size(); i++) {
        if (s[i] == s[i - 1]) {
            deletions++;
        }
    }
    return deletions;
}`,
        java: `public static int alternatingCharacters(String s) {
    int deletions = 0;
    for (int i = 1; i < s.length(); i++) {
        if (s.charAt(i) == s.charAt(i - 1)) {
            deletions++;
        }
    }
    return deletions;
}`,
        javascript: `function alternatingCharacters(s) {
  let deletions = 0;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      deletions++;
    }
  }
  return deletions;
}`,
      },
    },
    {
      name: '保留每段第一個字元', idea: '記住最後保留的字元；相同就刪除目前字元。',
      steps: [
        '令 last 為尚未選字元，答案為 0。',
        '從左到右讀字元；若等於 last，增加刪除數。',
        '否則更新 last，表示保留此字元。',
        '掃完回傳刪除數。',
      ],
      figure: { title: 's = "AABAAB"', steps: secondFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每字處理一次，除兩個變數外沒有額外儲存。' },
      verdict: '適合邊讀輸入邊算答案，也清楚表達「每段留一個」的貪心選擇。',
      code: {
        python: `def alternatingCharacters(s):
    last = None
    deletions = 0
    for ch in s:
        if ch == last:  # 此段已經留過同樣的字
            deletions += 1
        else:
            last = ch
    return deletions`,
        c: `int alternatingCharacters(char* s) {
    char last = '\\0';
    int deletions = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == last) {
            deletions++;
        } else {
            last = s[i];
        }
    }
    return deletions;
}`,
        cpp: `int alternatingCharacters(string s) {
    char last = '\\0';
    int deletions = 0;
    for (char ch : s) {
        if (ch == last) {
            deletions++;
        } else {
            last = ch;
        }
    }
    return deletions;
}`,
        java: `public static int alternatingCharacters(String s) {
    char last = '\\0';
    int deletions = 0;
    for (char ch : s.toCharArray()) {
        if (ch == last) {
            deletions++;
        } else {
            last = ch;
        }
    }
    return deletions;
}`,
        javascript: `function alternatingCharacters(s) {
  let last = null;
  let deletions = 0;
  for (const ch of s) {
    if (ch === last) {
      deletions++;
    } else {
      last = ch;
    }
  }
  return deletions;
}`,
      },
    },
  ],
  pitfalls: [
    '不要真的刪除字元後再把索引往前移；那樣容易漏檢且可能變慢。',
    '答案為 0 的交錯字串也要保留。',
    '一段連續相同字元若長度為 k，只刪 k−1 個；不能把整段都刪掉。',
  ],
  followUp: [
    {
      q: '若還要輸出刪除後的字串呢？',
      a: '在第二種解法每次更新 last 時把字元加入結果；相同就跳過。結果長度等於原長度減刪除數。',
    },
    {
      q: '若字串不只含 A、B，方法還能用嗎？',
      a: '可以。判斷只依賴相鄰字元是否相同，字元種類增加也不影響證明或複雜度。',
    },
  ],
  check: { kind: 'fn', fn: 'alternatingCharacters', cases: [
    { args: ['AAAA'], out: 3 },
    { args: ['BBBBB'], out: 4 },
    { args: ['ABABABAB'], out: 0 },
    { args: ['BABABA'], out: 0 },
    { args: ['AAABBB'], out: 4 },
    { args: ['AABAAB'], out: 2 },
    { args: ['A'], out: 0 },
  ] },
}
