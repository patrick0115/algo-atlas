import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 792. Number of Matching Subsequences
const S = 'abcde'
const W = ['a', 'bb', 'acd', 'ace']

export const q0792: Solution = {
  id: 792,
  plain: '每個單字都要按原順序，在長字串中找到它的字母；中間可以跳過字元。數出能找到的單字個數。',
  statement: '給字串 s 與 words；若某個 word 可刪除 s 的若干字元而得到，它就是 s 的子序列。回傳符合的 word 數量，重複單字也各自計算。',
  examples: [
    { input: 's = "abcde", words = ["a","bb","acd","ace"]', output: '3' },
    { input: 's = "dsahjpjauf", words = ["ahjpjau","ja","ahbwzgqnuk","tnmlanowax"]', output: '2' },
  ],
  constraints: ['1 ≤ s.length ≤ 5×10⁴；words 最多 5000 個，每字長度最多 50；全為小寫英文字母。'],
  insight: ['判斷一個單字時，雙指標從左到右找每個字母即可。', '當單字很多時，可以先替 s 的每個位置預算「下一個某字母在哪裡」，讓每個單字只走自己的長度。'],
  approaches: [
    {
      name: '每個單字各掃一次 s',
      idea: '固定一個 word，掃過 s，遇到下一個需要的字母就前進單字指標。',
      steps: ['對每個 word，把其索引 j 設為 0。', '從左到右掃 s，若目前字元等於 word[j]，j 加一。', 'j 到達 word 長度就將答案加一。'],
      figure: { title: 's = abcde，words = [a,bb,acd,ace]', steps: [
        { note: '單字 a 在 s 的第一格就找到了，符合數變 1。', views: [arr(S.split(''), { highlight: [0] })] },
        { note: 'bb 只能在索引 1 找到第一個 b，後面沒有第二個 b，因此不符合。', views: [arr(S.split(''), { highlight: [1], dim: [0, 2, 3, 4] })] },
        { note: 'acd 可依序選索引 0、2、3，跳過中間的 b。', views: [arr(S.split(''), { done: [0, 2, 3], dim: [1, 4] })] },
        { note: 'ace 可依序選索引 0、2、4；共 3 個單字符合。', views: [arr(S.split(''), { done: [0, 2, 4], dim: [1, 3] }), arr(W, { label: '待測單字', done: [0, 2, 3], dim: [1] })] },
      ] },
      complexity: { time: 'O(|s|×words數)', space: 'O(1)', why: '每個單字都重新掃描 s。' },
      verdict: '最簡單；單字很多時，s 會被重掃多次。',
      code: {
        python: `def numMatchingSubseq(s, words):
    answer = 0
    for word in words:
        j = 0
        for ch in s:
            if j < len(word) and ch == word[j]:
                j += 1  # 找到下一個需要的字母
        if j == len(word):
            answer += 1
    return answer`,
        c: `int numMatchingSubseq(char *s, char **words, int wordsSize) {
    int answer = 0;
    for (int i = 0; i < wordsSize; i++) {
        int j = 0;
        int length = strlen(words[i]);
        for (int p = 0; s[p] != '\\0'; p++) {
            if (j < length && s[p] == words[i][j]) {
                j++;
            }
        }
        if (j == length) {
            answer++;
        }
    }
    return answer;
}`,
        cpp: `int numMatchingSubseq(string s, vector<string>& words) {
    int answer = 0;
    for (const string& word : words) {
        int j = 0;
        for (char ch : s) {
            if (j < (int)word.size() && ch == word[j]) {
                j++;
            }
        }
        if (j == (int)word.size()) {
            answer++;
        }
    }
    return answer;
}`,
        java: `int numMatchingSubseq(String s, String[] words) {
    int answer = 0;
    for (String word : words) {
        int j = 0;
        for (int p = 0; p < s.length(); p++) {
            if (j < word.length() && s.charAt(p) == word.charAt(j)) {
                j++;
            }
        }
        if (j == word.length()) {
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function numMatchingSubseq(s, words) {
  let answer = 0;
  for (const word of words) {
    let j = 0;
    for (const ch of s) {
      if (j < word.length && ch === word[j]) {
        j++;
      }
    }
    if (j === word.length) {
      answer++;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '下一個字元位置表',
      idea: 'next[pos][c] 記從 pos 開始往右第一個字母 c 的索引；找不到就記 n。',
      steps: ['設 next[n] 的 26 個位置都為 n。', '從 s 的最後一格往前，複製下一列，再把當前字母的索引改為自己。', '對每個 word 從 pos=0 開始查下一個字母；查到後跳到該索引加一。', '若任何一字母查不到則失敗，否則計入答案。'],
      figure: { title: 's = abcde，words = [a,bb,acd,ace]', steps: [
        { note: '從後往前建立表：位置 0 查 a、b、c、d、e，分別找到索引 0、1、2、3、4。', views: [arr([0, 1, 2, 3, 4], { label: 'next[0] 的 a..e' })] },
        { note: '查 bb：從位置 0 找 b 得索引 1；改從位置 2 找 b，結果是 n=5，失敗。', views: [arr(S.split(''), { highlight: [1], dim: [0, 2, 3, 4] })] },
        { note: '查 acd：依序跳到 0、2、3；三個字母都找到。', views: [arr(S.split(''), { done: [0, 2, 3] })] },
        { note: '查 ace：依序跳到 0、2、4；連同 a 與 acd，共有 3 個符合。', views: [arr(S.split(''), { done: [0, 2, 4] }), arr([1, 0, 1, 1], { label: 'a / bb / acd / ace 是否符合', done: [0, 2, 3] })] },
      ] },
      complexity: { time: 'O(26|s| + 所有 word 長度總和)', space: 'O(26|s|)', why: '每個位置複製 26 個字母的下一位置，再逐字查表。' },
      verdict: '單字多時有效；空間換取快速查找。',
      code: {
        python: `def numMatchingSubseq(s, words):
    n = len(s)
    nxt = [[n] * 26 for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        nxt[i] = nxt[i + 1][:]
        nxt[i][ord(s[i]) - 97] = i  # 此字母從 i 開始就能找到
    answer = 0
    for word in words:
        pos = 0
        for ch in word:
            found = nxt[pos][ord(ch) - 97]
            if found == n:
                break
            pos = found + 1
        else:
            answer += 1
    return answer`,
        c: `int numMatchingSubseq(char *s, char **words, int wordsSize) {
    int n = strlen(s);
    int *next = malloc((n + 1) * 26 * sizeof(int));
    for (int c = 0; c < 26; c++) {
        next[n * 26 + c] = n;
    }
    for (int i = n - 1; i >= 0; i--) {
        memcpy(next + i * 26, next + (i + 1) * 26, 26 * sizeof(int));
        next[i * 26 + s[i] - 'a'] = i;
    }
    int answer = 0;
    for (int i = 0; i < wordsSize; i++) {
        int pos = 0;
        bool good = true;
        for (int j = 0; words[i][j] != '\\0'; j++) {
            int found = next[pos * 26 + words[i][j] - 'a'];
            if (found == n) {
                good = false;
                break;
            }
            pos = found + 1;
        }
        if (good) {
            answer++;
        }
    }
    free(next);
    return answer;
}`,
        cpp: `int numMatchingSubseq(string s, vector<string>& words) {
    int n = s.size();
    vector<array<int, 26>> next(n + 1);
    next[n].fill(n);
    for (int i = n - 1; i >= 0; i--) {
        next[i] = next[i + 1];
        next[i][s[i] - 'a'] = i;
    }
    int answer = 0;
    for (const string& word : words) {
        int pos = 0;
        bool good = true;
        for (char ch : word) {
            int found = next[pos][ch - 'a'];
            if (found == n) {
                good = false;
                break;
            }
            pos = found + 1;
        }
        if (good) {
            answer++;
        }
    }
    return answer;
}`,
        java: `int numMatchingSubseq(String s, String[] words) {
    int n = s.length();
    int[][] next = new int[n + 1][26];
    Arrays.fill(next[n], n);
    for (int i = n - 1; i >= 0; i--) {
        next[i] = next[i + 1].clone();
        next[i][s.charAt(i) - 'a'] = i;
    }
    int answer = 0;
    for (String word : words) {
        int pos = 0;
        boolean good = true;
        for (int j = 0; j < word.length(); j++) {
            int found = next[pos][word.charAt(j) - 'a'];
            if (found == n) {
                good = false;
                break;
            }
            pos = found + 1;
        }
        if (good) {
            answer++;
        }
    }
    return answer;
}`,
        javascript: `function numMatchingSubseq(s, words) {
  const n = s.length;
  const next = Array.from({ length: n + 1 }, () => new Array(26).fill(n));
  for (let i = n - 1; i >= 0; i--) {
    next[i] = next[i + 1].slice();
    next[i][s.charCodeAt(i) - 97] = i;
  }
  let answer = 0;
  for (const word of words) {
    let pos = 0;
    let good = true;
    for (const ch of word) {
      const found = next[pos][ch.charCodeAt(0) - 97];
      if (found === n) {
        good = false;
        break;
      }
      pos = found + 1;
    }
    if (good) {
      answer++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['子序列保留順序，字元不要求相鄰。', '重複的 word 要各算一次。', '查到字元後，下一次搜尋須從 found+1 開始，不能重用同一位置。'],
  check: { kind: 'fn', fn: 'numMatchingSubseq', cases: [
    { args: [S, W], out: 3 },
    { args: ['dsahjpjauf', ['ahjpjau', 'ja', 'ahbwzgqnuk', 'tnmlanowax']], out: 2 },
    { args: ['a', ['a', 'a', 'b']], out: 2 },
  ] },
}
