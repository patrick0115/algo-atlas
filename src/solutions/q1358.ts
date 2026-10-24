import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const S = 'abcabc'
const windowFig: FigStep[] = [
  { note: '右界走到索引 2，視窗 "abc" 首次含 a、b、c；以索引 2 為右端的合法左界只有 0，答案加 1。', views: [arr(S.split(''), { label: 's', highlight: [0, 1, 2] })] },
  { note: '右界到索引 3，視窗 "abca" 仍合格；左界可往右移一次，到 "bca" 仍合格，因此答案加 2。', views: [arr(S.split(''), { label: 's', highlight: [1, 2, 3], done: [0] })] },
  { note: '右界到索引 4 時，合法左界有 0、1、2 共 3 個；到索引 5 時有 0、1、2、3 共 4 個。', views: [arr(S.split(''), { label: 's', highlight: [2, 3, 4, 5] })] },
  { note: '右界從索引 2 到 5，依序新增 1、2、3、4 個；總數 10。', views: [arr([1, 2, 3, 4, 10], { label: '各步新增 / 總數', done: [4] })] },
]
const lastFig: FigStep[] = [
  { note: '讀到索引 2 的 c，最近出現位置為 a:0、b:1、c:2；最早位置 0，所以有 1 個合法起點。', views: [arr([0, 1, 2], { label: 'a/b/c 最近位置' })] },
  { note: '讀到索引 3 的 a，最近位置變 [3,1,2]；最早是 1，可用起點 0 或 1，共 2 個。', views: [arr([3, 1, 2], { label: '最近位置', highlight: [0] })] },
  { note: '讀到索引 4 的 b，最近位置 [3,4,2]；最早是 2，新增 3 個。', views: [arr([3, 4, 2], { label: '最近位置', highlight: [1] })] },
  { note: '讀到索引 5 的 c，最近位置 [3,4,5]，新增 4 個；累計 10。', views: [arr([3, 4, 5], { label: '最近位置', done: [0, 1, 2] }), arr([10], { label: '答案' })] },
]

export const q1358: Solution = {
  id: 1358,
  plain: '字串只由 a、b、c 組成，數一數有多少段連續片段三種字母都出現。',
  statement: '給只含 a、b、c 的字串 s，回傳同時含三種字母的非空子字串數量。',
  examples: [{ input: 's = "abcabc"', output: '10' }, { input: 's = "aaacb"', output: '3' }, { input: 's = "abc"', output: '1' }],
  constraints: ['字串長度至多 50000。', '同一右端可能對應很多合法左端，應一次計算它們的數量。'],
  insight: ['固定右端時，只要找到最靠右的合法左端，就能一次數出所有更靠左的起點。', '可用 [[p:sliding-window]] 縮小到剛好缺一種字元，也可記三種字母的最近位置。'],
  approaches: [
    {
      name: '滑動視窗數左端點', idea: '右界擴張後，反覆移動左界直到視窗缺少一種字元；此時左界數值就是合法起點個數。',
      steps: ['維持 a、b、c 的次數。', '加入右端字元。', '三種字元都在視窗時，移除左端並右移。', '把左界加到答案。'],
      figure: { title: 's = abcabc', steps: windowFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '左右指標都只向右走，計數表固定三格。' },
      verdict: '推薦解法，能直接看見合法起點如何累積。',
      code: {
        python: `def numberOfSubstrings(s):
    counts = [0] * 3
    left = 0
    answer = 0
    for right, ch in enumerate(s):
        counts[ord(ch) - 97] += 1
        while min(counts) > 0:
            counts[ord(s[left]) - 97] -= 1
            left += 1  # 移到第一個不合法的左界
        answer += left  # 0..left-1 都是合法起點
    return answer`,
        c: `int numberOfSubstrings(char *s) {
    int counts[3] = {0};
    int left = 0;
    int answer = 0;
    for (int right = 0; s[right] != '\\0'; right++) {
        counts[s[right] - 'a']++;
        while (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            counts[s[left] - 'a']--;
            left++;
        }
        answer += left;
    }
    return answer;
}`,
        cpp: `int numberOfSubstrings(string s) {
    int counts[3] = {0};
    int left = 0;
    int answer = 0;
    for (char ch : s) {
        counts[ch - 'a']++;
        while (counts[0] && counts[1] && counts[2]) {
            counts[s[left] - 'a']--;
            left++;
        }
        answer += left;
    }
    return answer;
}`,
        java: `int numberOfSubstrings(String s) {
    int[] counts = new int[3];
    int left = 0;
    int answer = 0;
    for (int right = 0; right < s.length(); right++) {
        counts[s.charAt(right) - 'a']++;
        while (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
            counts[s.charAt(left) - 'a']--;
            left++;
        }
        answer += left;
    }
    return answer;
}`,
        javascript: `function numberOfSubstrings(s) {
  const counts = [0, 0, 0];
  let left = 0;
  let answer = 0;
  for (const ch of s) {
    counts[ch.charCodeAt(0) - 97]++;
    while (counts[0] > 0 && counts[1] > 0 && counts[2] > 0) {
      counts[s.charCodeAt(left) - 97]--;
      left++;
    }
    answer += left;
  }
  return answer;
}`,
      },
    },
    {
      name: '記住三種字母最近位置', idea: '最近位置中最小的那個決定最靠右的合法左界；其左側起點全部有效。',
      steps: ['last 初始為 [-1,-1,-1]。', '讀到字元時更新它的最近位置。', '每個右端新增 min(last)+1 個合法子字串。'],
      figure: { title: 's = abcabc', steps: lastFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每字元更新一格並比較固定三個位置。' },
      verdict: '程式更短，適合字元種類固定很少的題目。',
      code: {
        python: `def numberOfSubstrings(s):
    last = [-1, -1, -1]
    answer = 0
    for i, ch in enumerate(s):
        last[ord(ch) - 97] = i
        answer += min(last) + 1  # 最早的最近位置限制合法起點
    return answer`,
        c: `int numberOfSubstrings(char *s) {
    int last[3] = {-1, -1, -1};
    int answer = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        last[s[i] - 'a'] = i;
        int earliest = last[0];
        if (last[1] < earliest) {
            earliest = last[1];
        }
        if (last[2] < earliest) {
            earliest = last[2];
        }
        answer += earliest + 1;
    }
    return answer;
}`,
        cpp: `int numberOfSubstrings(string s) {
    array<int, 3> last = {-1, -1, -1};
    int answer = 0;
    for (int i = 0; i < (int) s.size(); i++) {
        last[s[i] - 'a'] = i;
        answer += min({last[0], last[1], last[2]}) + 1;
    }
    return answer;
}`,
        java: `int numberOfSubstrings(String s) {
    int[] last = {-1, -1, -1};
    int answer = 0;
    for (int i = 0; i < s.length(); i++) {
        last[s.charAt(i) - 'a'] = i;
        answer += Math.min(last[0], Math.min(last[1], last[2])) + 1;
    }
    return answer;
}`,
        javascript: `function numberOfSubstrings(s) {
  const last = [-1, -1, -1];
  let answer = 0;
  for (let i = 0; i < s.length; i++) {
    last[s.charCodeAt(i) - 97] = i;
    answer += Math.min(last[0], last[1], last[2]) + 1;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['三種字母尚未全部出現時，min(last) 是 -1，新增數量自然是 0。', '縮窗後的 left 是第一個不合法左界；合法起點數是 left。'],
  check: { kind: 'fn', fn: 'numberOfSubstrings', cases: [
    { args: ['abcabc'], out: 10 },
    { args: ['aaacb'], out: 3 },
    { args: ['abc'], out: 1 },
    { args: ['aaa'], out: 0 },
  ] },
}
