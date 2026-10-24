import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const figCount: FigStep[] = [
  { note: '要拼出 aa，雜誌 aab 至少要提供兩個 a。先統計雜誌字母數量。', views: [arr(['a', 'a', 'b'], { label: 'magazine' }), arr([2, 1], { label: 'a / b 庫存' })] },
  { note: '取出 ransomNote 的第一個 a，a 庫存由 2 減至 1。', views: [arr(['a', 'a'], { label: 'ransomNote', highlight: [0] }), arr([1, 1], { label: 'a / b 庫存' })] },
  { note: '取出第二個 a，a 庫存由 1 減至 0；沒有任何字母欠缺。', views: [arr(['a', 'a'], { label: 'ransomNote', done: [0, 1] }), arr([0, 1], { label: 'a / b 庫存' })] },
  { note: '所有需要的字母都有庫存，回傳 true；若任一庫存變成負數就應立即回傳 false。', views: [arr([1], { label: '可拼出（1 = true）', done: [0] })] },
]
const figSort: FigStep[] = [
  { note: '把兩個字串排序，讓同一字母排在一起。', views: [arr(['a', 'a'], { label: 'ransomNote' }), arr(['a', 'a', 'b'], { label: 'magazine' })] },
  { note: '兩邊的第一個 a 相同，雙指標都右移，表示消耗雜誌的一個 a。', views: [arr(['a', 'a'], { label: '需求', highlight: [0] }), arr(['a', 'a', 'b'], { label: '庫存', highlight: [0] })] },
  { note: '第二個 a 也匹配，需求指標走到末端。', views: [arr(['a', 'a'], { label: '需求', done: [0, 1] }), arr(['a', 'a', 'b'], { label: '庫存', done: [0, 1], dim: [2] })] },
  { note: '需求全部匹配即回傳 true；多出來的 b 不影響結果。', views: [arr([1], { label: '答案（1 = true）', done: [0] })] },
]

export const q0383: Solution = {
  id: 383,
  plain: '只用雜誌裡的字母，能不能拼出指定字串？每個字母只能使用一次。',
  statement: '給定小寫字串 ransomNote 和 magazine。若能用 magazine 的字母組成 ransomNote，回傳 true，否則回傳 false；每個位置的字母只能用一次。',
  examples: [
    { input: 'ransomNote = "a", magazine = "b"', output: 'false' },
    { input: 'ransomNote = "aa", magazine = "ab"', output: 'false' },
    { input: 'ransomNote = "aa", magazine = "aab"', output: 'true' },
  ],
  constraints: ['1 ≤ ransomNote.length, magazine.length ≤ 10⁵', '字元均為小寫英文字母'],
  insight: ['只判斷字母有沒有出現不夠，還要比較每個字母的數量。', '26 個小寫字母可用固定長度計數陣列。', '排序後也能逐一匹配需求與庫存。'],
  approaches: [
    {
      name: '26 格字母計數',
      idea: '統計 magazine 的字母，再逐一扣除 ransomNote 所需字母；若扣到負數就失敗。',
      steps: ['建立 26 格全零計數', '掃 magazine 增加庫存', '掃 ransomNote 逐字扣除', '任一計數小於零則 false，否則 true'],
      figure: { title: 'ransomNote = "aa", magazine = "aab"', steps: figCount },
      complexity: { time: 'O(m+n)', space: 'O(1)', why: '兩字串各掃一次；計數陣列固定 26 格。' },
      verdict: '最推薦的 [[p:counting-sort]] 計數想法；這裡只需計數，不必真的排序。',
      code: {
        python: `def canConstruct(ransomNote, magazine):
    count = [0] * 26
    for ch in magazine:
        count[ord(ch) - ord('a')] += 1   # 存入字母庫存
    for ch in ransomNote:
        idx = ord(ch) - ord('a')
        count[idx] -= 1                  # 消耗一個字母
        if count[idx] < 0:
            return False                # 庫存不足
    return True`,
        c: `bool canConstruct(char *ransomNote, char *magazine) {
    int count[26] = {0};
    for (int i = 0; magazine[i] != '\\0'; i++) {
        count[magazine[i] - 'a']++;
    }
    for (int i = 0; ransomNote[i] != '\\0'; i++) {
        int idx = ransomNote[i] - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return false;
        }
    }
    return true;
}`,
        cpp: `bool canConstruct(string ransomNote, string magazine) {
    int count[26] = {0};
    for (char ch : magazine) {
        count[ch - 'a']++;
    }
    for (char ch : ransomNote) {
        int idx = ch - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return false;
        }
    }
    return true;
}`,
        java: `boolean canConstruct(String ransomNote, String magazine) {
    int[] count = new int[26];
    for (char ch : magazine.toCharArray()) {
        count[ch - 'a']++;
    }
    for (char ch : ransomNote.toCharArray()) {
        int idx = ch - 'a';
        count[idx]--;
        if (count[idx] < 0) {
            return false;
        }
    }
    return true;
}`,
        javascript: `function canConstruct(ransomNote, magazine) {
  const count = Array(26).fill(0);
  for (const ch of magazine) {
    count[ch.charCodeAt(0) - 97]++;
  }
  for (const ch of ransomNote) {
    const idx = ch.charCodeAt(0) - 97;
    count[idx]--;
    if (count[idx] < 0) {
      return false;
    }
  }
  return true;
}`,
      },
    },
    {
      name: '排序與雙指標',
      idea: '排序後，需求字母必須依序在 magazine 的排序結果中找到。',
      steps: ['排序需求與雜誌字母', '兩指標從頭開始', '若相等兩邊前進；若庫存字母較小，只移庫存指標', '庫存用盡仍有需求就失敗'],
      figure: { title: 'ransomNote = "aa", magazine = "aab"', steps: figSort },
      complexity: { time: 'O(m log m + n log n)', space: 'O(m+n)', why: '排序與複製字串占主要成本。' },
      verdict: '可練習 [[p:two-pointers]]；此題字母範圍固定，計數法更省時。',
      code: {
        python: `def canConstruct(ransomNote, magazine):
    need = sorted(ransomNote)
    have = sorted(magazine)
    i = j = 0
    while i < len(need) and j < len(have):
        if need[i] == have[j]:
            i += 1                       # 匹配一個需求
            j += 1
        elif have[j] < need[i]:
            j += 1                       # 庫存字母太小，跳過
        else:
            return False                # 需求字母已不可能找到
    return i == len(need)`,
        c: `static int cmpChar(const void *a, const void *b) {
    return *(const char *)a - *(const char *)b;
}

bool canConstruct(char *ransomNote, char *magazine) {
    int n = strlen(ransomNote);
    int m = strlen(magazine);
    char *need = malloc(n + 1);
    char *have = malloc(m + 1);
    strcpy(need, ransomNote);
    strcpy(have, magazine);
    qsort(need, n, sizeof(char), cmpChar);
    qsort(have, m, sizeof(char), cmpChar);
    int i = 0;
    int j = 0;
    while (i < n && j < m) {
        if (need[i] == have[j]) {
            i++;
            j++;
        } else if (have[j] < need[i]) {
            j++;
        } else {
            break;
        }
    }
    bool ok = i == n;
    free(need);
    free(have);
    return ok;
}`,
        cpp: `bool canConstruct(string ransomNote, string magazine) {
    sort(ransomNote.begin(), ransomNote.end());
    sort(magazine.begin(), magazine.end());
    int i = 0;
    int j = 0;
    while (i < (int)ransomNote.size() && j < (int)magazine.size()) {
        if (ransomNote[i] == magazine[j]) {
            i++;
            j++;
        } else if (magazine[j] < ransomNote[i]) {
            j++;
        } else {
            break;
        }
    }
    return i == (int)ransomNote.size();
}`,
        java: `boolean canConstruct(String ransomNote, String magazine) {
    char[] need = ransomNote.toCharArray();
    char[] have = magazine.toCharArray();
    Arrays.sort(need);
    Arrays.sort(have);
    int i = 0;
    int j = 0;
    while (i < need.length && j < have.length) {
        if (need[i] == have[j]) {
            i++;
            j++;
        } else if (have[j] < need[i]) {
            j++;
        } else {
            break;
        }
    }
    return i == need.length;
}`,
        javascript: `function canConstruct(ransomNote, magazine) {
  const need = [...ransomNote].sort();
  const have = [...magazine].sort();
  let i = 0;
  let j = 0;
  while (i < need.length && j < have.length) {
    if (need[i] === have[j]) {
      i++;
      j++;
    } else if (have[j] < need[i]) {
      j++;
    } else {
      break;
    }
  }
  return i === need.length;
}`,
      },
    },
  ],
  pitfalls: ['同一雜誌字母不能重複使用。', '即使所有需求字母都出現過，也可能數量不足。', 'C 的字串結尾零字元在 TS 模板字串中要寫成雙反斜線。'],
  check: { kind: 'fn', fn: 'canConstruct', cases: [
    { args: ['a', 'b'], out: false },
    { args: ['aa', 'ab'], out: false },
    { args: ['aa', 'aab'], out: true },
    { args: ['abc', 'cba'], out: true },
    { args: ['zzz', 'zz'], out: false },
  ] },
}
