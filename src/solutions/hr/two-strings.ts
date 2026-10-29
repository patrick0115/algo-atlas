import { arr } from '../../engine/helpers'
import { count26 } from '../fig'
import type { FigStep, HrSolution } from '../types'

function pairFig(): FigStep[] {
  const a = 'be', b = 'cat', out: FigStep[] = []
  let found = false
  for (let i = 0; i < a.length && !found; i++) {
    for (let j = 0; j < b.length; j++) {
      const same = a[i] === b[j]
      out.push({
        note: `比較 s1[${i}] = ${a[i]} 與 s2[${j}] = ${b[j]}：${same ? '相同，單一字母就是共同子字串，回答 YES' : '不同，繼續找下一對'}`,
        views: [arr(a.split(''), { label: 's1', highlight: [i] }), arr(b.split(''), { label: 's2', highlight: [j] }), arr([same ? 1 : 0], { label: '目前找到共同字母？' })],
      })
      if (same) { found = true; break }
    }
  }
  return out
}

function setFig(): FigStep[] {
  const a = 'and', b = 'art', seen = Array(26).fill(0), out: FigStep[] = []
  for (let i = 0; i < a.length; i++) {
    seen[a.charCodeAt(i) - 97] = 1
    out.push({ note: `讀 s1[${i}] = ${a[i]}，把這個字母記在 26 格表中；目前已記 ${seen.reduce((x, y) => x + y, 0)} 種`, views: [arr(a.split(''), { label: 's1', highlight: [i] }), count26(seen, 's1 出現過')] })
  }
  for (let j = 0; j < b.length; j++) {
    const hit = seen[b.charCodeAt(j) - 97] === 1
    out.push({ note: `查 s2[${j}] = ${b[j]}：表中${hit ? '已有，立刻回傳 YES' : '沒有，往下一字母'}`, views: [arr(b.split(''), { label: 's2', highlight: [j] }), count26(seen, 's1 出現過'), arr([hit ? 1 : 0], { label: '命中？' })] })
    if (hit) break
  }
  return out
}

export const hrTwoStrings: HrSolution = {
  slug: 'two-strings',
  plain: '像比對兩盒字母積木：只要兩盒各有一塊相同字母，就能共同拼出長度為一的片段，不必真的拼長字。',
  statement: '輸入兩個只含小寫英文字母的字串 s1、s2。判斷它們是否至少有一個內容相同的連續片段；有則回傳大寫 YES，否則回傳大寫 NO。長度一也算片段。',
  examples: [
    { input: 's1 = "and", s2 = "art"', output: 'YES', note: '兩者都有 a，因此單字母片段已符合。' },
    { input: 's1 = "be", s2 = "cat"', output: 'NO', note: 'b、e 都不在第二個字串裡。' },
  ],
  constraints: [
    '兩字串長度各為 1 到 10^5 → 逐一比對所有字元對在大輸入會太慢。',
    '字元只在 a 到 z → 可以用固定 26 格表記錄，空間不隨字串長度增加。',
  ],
  insight: [
    '先想到枚舉兩字串的所有連續片段，但片段長度一已經合法。',
    '因此問題縮成：兩字串是否有任一相同字母。直覺可兩層迴圈逐對比。',
    '重複比對同一個字母浪費時間；先記下 s1 的字母，再掃 s2 查表即可，與 [[p:hash-map]] 相同。',
  ],
  approaches: [
    {
      name: '逐對比較字母',
      idea: '每個 s1 字母與每個 s2 字母比較，碰到相同的立刻返回。',
      steps: ['逐一取出 s1 的字母。', '對這個字母，從頭到尾掃 s2。', '相同就回傳 YES；全部比完仍無相同則回傳 NO。'],
      figure: { title: 's1 = be，s2 = cat', steps: pairFig() },
      complexity: { time: 'O(|s1| × |s2|)', space: 'O(1)', why: '最壞情況要比較每一對字母；只用指標。' },
      verdict: '推理最直接，但兩字串都很長時比較次數過多。',
      code: {
        python: `def twoStrings(s1, s2):
    for a in s1:
        for b in s2:
            if a == b:  # 一個共同字母已是共同子字串
                return 'YES'
    return 'NO'`,
        c: `char* twoStrings(char* s1, char* s2) {
    for (int i = 0; s1[i] != '\\0'; i++) {
        for (int j = 0; s2[j] != '\\0'; j++) {
            if (s1[i] == s2[j]) return "YES";
        }
    }
    return "NO";
}`,
        cpp: `string twoStrings(string s1, string s2) {
    for (char a : s1) {
        for (char b : s2) {
            if (a == b) return "YES";
        }
    }
    return "NO";
}`,
        java: `public static String twoStrings(String s1, String s2) {
    for (int i = 0; i < s1.length(); i++) {
        for (int j = 0; j < s2.length(); j++) {
            if (s1.charAt(i) == s2.charAt(j)) return "YES";
        }
    }
    return "NO";
}`,
        javascript: `function twoStrings(s1, s2) {
  for (const a of s1) {
    for (const b of s2) {
      if (a === b) return 'YES';
    }
  }
  return 'NO';
}`,
      },
    },
    {
      name: '26 格出現表',
      idea: '先記錄 s1 出現過的字母，再逐字查 s2。',
      steps: ['建立 26 格全為 false 的表，索引 0 對應 a。', '掃 s1，把每個字母的格子標成 true。', '掃 s2，遇到已標記的格子就回傳 YES；掃完回傳 NO。'],
      figure: { title: 's1 = and，s2 = art', steps: setFig() },
      complexity: { time: 'O(|s1| + |s2|)', space: 'O(1)', why: '兩字串各掃一次；出現表固定 26 格。' },
      verdict: '適合長字串，且不需要建立任何實際子字串。',
      code: {
        python: `def twoStrings(s1, s2):
    seen = [False] * 26
    for ch in s1:
        seen[ord(ch) - ord('a')] = True  # 記下第一串的字母
    for ch in s2:
        if seen[ord(ch) - ord('a')]:  # 第二串命中即可
            return 'YES'
    return 'NO'`,
        c: `char* twoStrings(char* s1, char* s2) {
    int seen[26] = {0};
    for (int i = 0; s1[i] != '\\0'; i++) {
        seen[s1[i] - 'a'] = 1;
    }
    for (int i = 0; s2[i] != '\\0'; i++) {
        if (seen[s2[i] - 'a']) return "YES";
    }
    return "NO";
}`,
        cpp: `string twoStrings(string s1, string s2) {
    vector<bool> seen(26, false);
    for (char ch : s1) seen[ch - 'a'] = true;
    for (char ch : s2) {
        if (seen[ch - 'a']) return "YES";
    }
    return "NO";
}`,
        java: `public static String twoStrings(String s1, String s2) {
    boolean[] seen = new boolean[26];
    for (int i = 0; i < s1.length(); i++) {
        seen[s1.charAt(i) - 'a'] = true;
    }
    for (int i = 0; i < s2.length(); i++) {
        if (seen[s2.charAt(i) - 'a']) return "YES";
    }
    return "NO";
}`,
        javascript: `function twoStrings(s1, s2) {
  const seen = Array(26).fill(false);
  for (const ch of s1) seen[ch.charCodeAt(0) - 97] = true;
  for (const ch of s2) {
    if (seen[ch.charCodeAt(0) - 97]) return 'YES';
  }
  return 'NO';
}`,
      },
    },
  ],
  pitfalls: [
    '共同子字串允許長度一，不必搜尋長片段。',
    '回傳值必須是大寫 YES 或 NO，不是布林值。',
    '若任一字母重複很多次，出現表仍只記有無，不必計數。',
  ],
  followUp: [
    {
      q: '若題目改成共同子字串至少長 2 呢？',
      a: '單字母交集已不夠；可枚舉 s1 的相鄰字母對並存入集合，再掃 s2 的相鄰對查集合。',
    },
    {
      q: '若字母不限小寫英文字母呢？',
      a: '把 26 格陣列改成字元集合，演算法仍是先記錄 s1，再查 s2。',
    },
  ],
  check: {
    kind: 'fn', fn: 'twoStrings',
    cases: [
      { args: ['and', 'art'], out: 'YES' },
      { args: ['be', 'cat'], out: 'NO' },
      { args: ['a', 'a'], out: 'YES' },
      { args: ['a', 'b'], out: 'NO' },
      { args: ['aaa', 'aaa'], out: 'YES' },
      { args: ['xyz', 'zyx'], out: 'YES' },
    ],
  },
}
