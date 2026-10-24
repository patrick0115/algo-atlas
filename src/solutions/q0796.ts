import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const S = 'abcde'
const GOAL = 'cdeab'

function rotationFig(): FigStep[] {
  return [
    { note: '從 abcde 開始。每次把最左邊的字元移到尾端，才是一次合法的旋轉。', views: [arr([...S], { label: '目前字串', highlight: [0] })] },
    { note: '移動 a 後得到 bcdea，還不是目標；繼續移動最左邊的 b。', views: [arr([...'bcdea'], { label: '旋轉一次', highlight: [0] })] },
    { note: '移動 b 後得到 cdeab，和目標逐字相同，因此回傳 true。', views: [arr([...GOAL], { label: '旋轉兩次', done: [0, 1, 2, 3, 4] })] },
  ]
}

function doubledFig(): FigStep[] {
  return [
    { note: '把 s 接在自己後面，得到 abcdeabcde。旋轉後的字串一定會在其中連續出現。', views: [arr([...'abcdeabcde'], { label: 's + s' })] },
    { note: '從索引 1 開始的 bcdea 與目標第一個字元 c 不同，所以往後找。', views: [arr([...'abcdeabcde'], { label: '起點 1', dim: [0, 2, 3, 4, 5, 6, 7, 8, 9], highlight: [1] })] },
    { note: '從索引 2 起連續五個字元是 cdeab，剛好等於目標。', views: [arr([...'abcdeabcde'], { label: '起點 2', done: [2, 3, 4, 5, 6] })] },
  ]
}

export const q0796: Solution = {
  id: 796,
  plain: '把字串最前面的字母依序搬到最後面，看看能不能變成指定的字串。',
  statement: '給兩個字串 s 與 goal。一次操作會把 s 的第一個字元移到結尾；判斷做零次或多次後能否得到 goal。',
  examples: [
    { input: 's = "abcde", goal = "cdeab"', output: 'true' },
    { input: 's = "abcde", goal = "abced"', output: 'false' },
  ],
  constraints: ['兩個字串長度都在 1 到 100 之間；長度不同時不可能旋轉成功。'],
  insight: [
    '旋轉不會改變長度，也不會改變字元的環狀順序。',
    '可以直接試每個切點；也可以觀察每一種旋轉都藏在 s + s 的某個長度為 n 的片段裡。',
  ],
  approaches: [
    {
      name: '逐一嘗試旋轉',
      idea: '最多只有 n 個不同的旋轉位置；每次比較 n 個字元。',
      steps: ['先檢查長度是否相同。', '對每個起點 k，比較 s[(k + i) % n] 與 goal[i]。', '某個起點全部相同就回傳 true，否則回傳 false。'],
      figure: { title: 's = abcde，goal = cdeab', steps: rotationFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多比較 n 個起點，每個起點比較 n 個字元。' },
      verdict: '寫法直接，長度最多 100 時已經足夠。',
      code: {
        python: `def rotateString(s, goal):
    if len(s) != len(goal):
        return False
    n = len(s)
    for start in range(n):
        matched = True
        for i in range(n):
            if s[(start + i) % n] != goal[i]:
                matched = False       # 這個切點不合，試下一個
                break
        if matched:
            return True
    return False`,
        c: `bool rotateString(char *s, char *goal) {
    int n = strlen(s);
    if (n != (int)strlen(goal)) {
        return false;
    }
    for (int start = 0; start < n; start++) {
        bool matched = true;
        for (int i = 0; i < n; i++) {
            if (s[(start + i) % n] != goal[i]) {
                matched = false;
                break;
            }
        }
        if (matched) {
            return true;
        }
    }
    return false;
}`,
        cpp: `bool rotateString(string s, string goal) {
    if (s.size() != goal.size()) {
        return false;
    }
    int n = s.size();
    for (int start = 0; start < n; start++) {
        bool matched = true;
        for (int i = 0; i < n; i++) {
            if (s[(start + i) % n] != goal[i]) {
                matched = false;
                break;
            }
        }
        if (matched) {
            return true;
        }
    }
    return false;
}`,
        java: `boolean rotateString(String s, String goal) {
    if (s.length() != goal.length()) {
        return false;
    }
    int n = s.length();
    for (int start = 0; start < n; start++) {
        boolean matched = true;
        for (int i = 0; i < n; i++) {
            if (s.charAt((start + i) % n) != goal.charAt(i)) {
                matched = false;
                break;
            }
        }
        if (matched) {
            return true;
        }
    }
    return false;
}`,
        javascript: `function rotateString(s, goal) {
  if (s.length !== goal.length) {
    return false;
  }
  const n = s.length;
  for (let start = 0; start < n; start++) {
    let matched = true;
    for (let i = 0; i < n; i++) {
      if (s[(start + i) % n] !== goal[i]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return true;
    }
  }
  return false;
}`,
      },
    },
    {
      name: '雙倍字串搜尋',
      idea: '把 s 接成 s + s，所有旋轉都會成為其中一段連續字串。',
      steps: ['長度不同先回傳 false。', '將 s 與自己串接。', '檢查串接結果是否包含 goal。'],
      figure: { title: '在 abcdeabcde 尋找 cdeab', steps: doubledFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '建立雙倍字串要 O(n)；各語言內建子字串搜尋不保證線性最壞時間。' },
      verdict: '最簡潔的解法；若需要嚴格線性時間，可將子字串搜尋換成 KMP。',
      code: {
        python: `def rotateString(s, goal):
    if len(s) != len(goal):
        return False
    doubled = s + s             # 每個切點都會出現在這裡
    return goal in doubled`,
        c: `bool rotateString(char *s, char *goal) {
    int n = strlen(s);
    if (n != (int)strlen(goal)) {
        return false;
    }
    char *doubled = malloc(2 * n + 1);
    memcpy(doubled, s, n);
    memcpy(doubled + n, s, n);
    doubled[2 * n] = '\\0';
    bool found = strstr(doubled, goal) != NULL;
    free(doubled);
    return found;
}`,
        cpp: `bool rotateString(string s, string goal) {
    if (s.size() != goal.size()) {
        return false;
    }
    string doubled = s + s;
    return doubled.find(goal) != string::npos;
}`,
        java: `boolean rotateString(String s, String goal) {
    if (s.length() != goal.length()) {
        return false;
    }
    String doubled = s + s;
    return doubled.contains(goal);
}`,
        javascript: `function rotateString(s, goal) {
  if (s.length !== goal.length) {
    return false;
  }
  const doubled = s + s;
  return doubled.includes(goal);
}`,
      },
    },
  ],
  pitfalls: ['先比長度；較短的 goal 即使出現在 s + s 中，也不是合法旋轉。', 's 本身也是旋轉零次的結果。'],
  check: {
    kind: 'fn',
    fn: 'rotateString',
    cases: [
      { args: ['abcde', 'cdeab'], out: true },
      { args: ['abcde', 'abced'], out: false },
      { args: ['a', 'a'], out: true },
      { args: ['abc', 'ab'], out: false },
    ],
  },
}
