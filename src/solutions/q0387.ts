import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 387. First Unique Character in a String
const S = 'loveleetcode'
const bruteFig = [
  { note: '先把索引 0 的 l 當候選，重新掃完整串後發現 l 出現兩次，因此不能回傳 0。', views: [arr(S.split(''), { label: '檢查 l', highlight: [0,4] })] },
  { note: '改查索引 1 的 o，同樣重新掃完整串；o 在索引 9 又出現一次，所以繼續往右。', views: [arr(S.split(''), { label: '檢查 o', highlight: [1,9] })] },
  { note: '索引 2 的 v 在整串只出現一次，它是第一個通過檢查的候選，因此回傳 2。', views: [arr(S.split(''), { label: '找到 v', done: [0,1], highlight: [2] })] },
]

export const q0387: Solution = {
  id: 387,
  plain: '找字串裡最早出現、而且整個字串只出現一次的字母，回傳它的位置。',
  statement: '給只含小寫英文字母的 s，回傳第一個不重複字元的索引；若沒有，回傳 -1。',
  examples: [{ input: 's = "leetcode"', output: '0' }, { input: 's = "loveleetcode"', output: '2' }, { input: 's = "aabb"', output: '-1' }],
  constraints: ['1 ≤ s.length ≤ 10⁵；只含 a..z。', '「第一個」是原字串中的最小索引。'],
  insight: ['對每個字元往後數它是否只出現一次，最直觀但有重複掃描。', '字母只有 26 種，可先算每字母次數，再從左到右找次數為 1 的字元。', '與 [[p:hash-map]] 的頻率統計相同概念，也可用固定長度陣列。'],
  approaches: [
    { name: '逐位置重新計數', idea: '從左往右試每個字元，掃整串數它出現幾次。', steps: ['依序選候選索引 i。先確定每個候選字元是否真的只出現一次。', '掃描整串計算 s[i] 次數。照原字串順序檢查，才能選到索引最小的唯一字元。', '第一次遇到次數 1 就回傳 i；都沒有則 -1。找到第一個頻率為 1 的位置就回傳；若都沒有則回傳 −1。'], figure: { title: `s = "${S}"`, steps: bruteFig }, complexity: { time: 'O(n²)', space: 'O(1)', why: '每個位置都可能重掃整串。' }, verdict: '易懂但長字串效率較差。', code: {
      python: `def firstUniqChar(s):
    for i, ch in enumerate(s):  # 先統計字母次數，再依原順序尋找答案。
        if s.count(ch) == 1:  # 次數恰好是 1 才能回傳目前索引。
            return i
    return -1`,
      c: `int firstUniqChar(char *s) {
    int n = strlen(s);
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++)
            cnt += s[j] == s[i];
        if (cnt == 1)
            return i;
    }
    return - 1;
}`,
      cpp: `int firstUniqChar(string s) {
    for (int i = 0; i < (int)s.size(); i++) {
        int cnt = 0;
        for (char x : s)
            cnt += x == s[i];
        if (cnt == 1)
            return i;
    }
    return - 1;
}`,
      java: `int firstUniqChar(String s) {
    for (int i = 0; i < s.length(); i++) {
        int cnt = 0;
        for (int j = 0; j < s.length(); j++)
            if (s.charAt(j) == s.charAt(i))
                cnt++;
        if (cnt == 1)
            return i;
    }
    return - 1;
}`,
      javascript: `function firstUniqChar(s) {
    for (let i = 0; i < s.length; i++) {
        let cnt = 0;
        for (const ch of s)
            if (ch === s[i])
                cnt++;
        if (cnt === 1)
            return i;
    }
    return - 1;
}`,
    } },
    { name: '26 格頻率表', idea: '第一次掃描計次，第二次依原順序找次數等於 1 的字元。', steps: ['freq[26] 歸零。先確定每個候選字元是否真的只出現一次。', '掃 s，freq[字母−a]++。照原字串順序檢查，才能選到索引最小的唯一字元。', '再從左向右掃，第一個 freq=1 的位置就是答案。找到第一個頻率為 1 的位置就回傳；若都沒有則回傳 −1。'], figure: { title: `s = "${S}"`, steps: [{ note: '先掃完整個字串建立 26 格頻率表，l、o 各出現兩次，而 v 只出現一次。', views: [arr(['l:2','o:2','v:1','e:4'], { label: '部分頻率', highlight: [2] })] }, { note: '第二輪回到索引 0，l 的頻率是 2，接著索引 1 的 o 也是 2，兩個都跳過。', views: [arr(S.split(''), { label: '第二輪掃描', done: [0,1] })] }, { note: '索引 2 的 v 頻率是 1，它是第一個符合條件的字元，因此回傳 2。', views: [arr(S.split(''), { label: '答案索引 2', highlight: [2], dim: [0,1] })] }] }, complexity: { time: 'O(n)', space: 'O(1)', why: '兩次線性掃描；26 格陣列是固定大小。' }, verdict: '本題推薦方法。', code: {
      python: `def firstUniqChar(s):
    cnt = [0] * 26
    for ch in s:  # 先統計字母次數，再依原順序尋找答案。
        cnt[ord(ch) - 97] += 1
    for i, ch in enumerate(s):
        if cnt[ord(ch) - 97] == 1:  # 次數恰好是 1 才能回傳目前索引。
            return i
    return -1`,
      c: `int firstUniqChar(char *s) {
    int cnt[26] = {0};
    for (int i = 0; s[i]; i++)
        cnt[s[i] - 'a']++;
    for (int i = 0; s[i]; i++)
        if (cnt[s[i] - 'a'] == 1)
            return i;
    return - 1;
}`,
      cpp: `int firstUniqChar(string s) {
    int cnt[26] = {
    };
    for (char ch : s)
        cnt[ch - 'a']++;
    for (int i = 0; i < (int)s.size(); i++)
        if (cnt[s[i] - 'a'] == 1)
            return i;
    return - 1;
}`,
      java: `int firstUniqChar(String s) {
    int[] cnt = new int[26];
    for (int i = 0; i < s.length(); i++)
        cnt[s.charAt(i) - 'a']++;
    for (int i = 0; i < s.length(); i++)
        if (cnt[s.charAt(i) - 'a'] == 1)
            return i;
    return - 1;
}`,
      javascript: `function firstUniqChar(s) {
    const cnt = Array(26).fill(0);
    for (const ch of s)
        cnt[ch.charCodeAt(0) - 97]++;
    for (let i = 0; i < s.length; i++)
        if (cnt[s.charCodeAt(i) - 97] === 1)
            return i;
    return - 1;
}`,
    } },
  ],
  pitfalls: ['要依原字串順序找最先的，不是依字母順序。', '沒有唯一字元時回傳 -1。'],
  check: { kind: 'fn', fn: 'firstUniqChar', cases: [{ args: ['leetcode'], out: 0 }, { args: [S], out: 2 }, { args: ['aabb'], out: -1 }, { args: ['z'], out: 0 }] },
}
