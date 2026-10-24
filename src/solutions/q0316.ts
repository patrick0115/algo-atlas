import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const S = 'cbacdcbc'

function choiceFig(): FigStep[] {
  return [
    { note: '從左找候選開頭：c、b 後面還會出現；掃到 a 時，前綴 cba 裡字典序最小是 a，選它。', views: [arr([...S], { label: 's', highlight: [0, 1, 2] })] },
    { note: '選 a 後只能用它右邊的 cdcbc；移除之後所有 a（這裡沒有），再選下一個字。', views: [arr([...'cdcbc'], { label: '剩餘字串', highlight: [0] })] },
    { note: 'cdcbc 的前綴到第一個只出現一次的 d 為止是 cd，選較小的 c；剩下 dcbc 移除 c 得 db。', views: [arr([...'cdcbc'], { label: '選 c', highlight: [0, 1] }), arr([...'db'], { label: '下一輪' })] },
    { note: '剩餘 db 依序選 d、b，答案 acdb。每次選字後都只看右側，保持子序列順序。', views: [arr([...'acdb'], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '先統計各字元後續出現次數。掃到 c 時入堆疊；掃到 b 時，c 比 b 大而且之後還有 c，彈出 c 再放 b。', views: [arr([...'cb'], { label: '已掃描', done: [0], highlight: [1] }), arr(['b'], { label: '堆疊' })] },
    { note: '掃到 a 時，b 之後還有，彈出 b；放入 a，讓結果盡量小。', views: [arr([...'cba'], { label: '已掃描', highlight: [2] }), arr(['a'], { label: '堆疊' })] },
    { note: '再掃 c、d，堆疊變成 a,c,d。雖然 d 比後面的 b 大，但 d 已沒有下一次，不能彈出。', views: [arr([...'acdb'], { label: '候選結果', done: [0, 1, 2], highlight: [3] })] },
    { note: '後面的 c、b 已在堆疊中就略過；最終 acdb，每個字元恰好一次。', views: [arr([...'acdb'], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

export const q0316: Solution = {
  id: 316,
  plain: '從字串刪掉多餘字元，每種字母恰好留一個，並讓剩下的子序列按字典序最小。',
  statement: '給小寫字母字串 s，移除重複字母，使每種字母恰好出現一次；在所有合法子序列中回傳字典序最小者。',
  examples: [{ input: 's = "bcabc"', output: '"abc"' }, { input: 's = "cbacdcbc"', output: '"acdb"' }],
  constraints: ['`1 ≤ s.length ≤ 10⁴`', 's 只含小寫英文字母。'],
  insight: ['答案第一個字必須在「某個字母最後一次出現之前」選定，否則會漏掉那種字母；在可選前綴中挑最小字母。', '[[p:monotonic-stack]] 把這個選擇改成一次掃描：較大的尾字母若以後還有，就先讓位給較小的新字母。'],
  approaches: [
    {
      name: '逐字選最小可行開頭',
      idea: '掃描到第一種即將沒有剩餘副本的字母，在這個前綴挑最小字母作為答案下一字，再遞迴處理其右側。',
      steps: ['統計目前字串各字元數量。', '掃描前綴，記住字典序最小字元的位置；遇到某字元最後一次就停止。', '選該最小字元，只取其右側並移除同字元。', '遞迴直到沒有字元。'],
      figure: { title: 's = "cbacdcbc"', steps: choiceFig() },
      complexity: { time: 'O(26n)', space: 'O(n)', why: '每輪移除一種字母，最多 26 輪；子字串與遞迴佔空間。' },
      verdict: '容易看出字典序選擇的理由，反覆掃描的常數較大。',
      code: {
        python: `from collections import Counter

def removeDuplicateLetters(s):
    if not s:
        return ''
    counts = Counter(s)
    best = 0
    for i, ch in enumerate(s):
        if ch < s[best]:
            best = i  # 可行前綴內最小的字母
        counts[ch] -= 1
        if counts[ch] == 0:
            break  # 再往右就會漏掉這種字母
    chosen = s[best]
    rest = s[best + 1:].replace(chosen, '')
    return chosen + removeDuplicateLetters(rest)`,
        c: `char *removeDuplicateLetters(char *s) {
    int n = strlen(s);
    if (n == 0) {
        char *empty = malloc(1);
        empty[0] = '\\0';
        return empty;
    }
    int counts[26] = {0};
    for (int i = 0; i < n; i++) {
        counts[s[i] - 'a']++;
    }
    int best = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] < s[best]) {
            best = i;
        }
        if (--counts[s[i] - 'a'] == 0) {
            break;
        }
    }
    char chosen = s[best];
    char *rest = malloc(n - best);
    int length = 0;
    for (int i = best + 1; i < n; i++) {
        if (s[i] != chosen) {
            rest[length++] = s[i];
        }
    }
    rest[length] = '\\0';
    char *suffix = removeDuplicateLetters(rest);
    free(rest);
    char *answer = malloc(strlen(suffix) + 2);
    answer[0] = chosen;
    strcpy(answer + 1, suffix);
    free(suffix);
    return answer;
}`,
        cpp: `string removeDuplicateLetters(string s) {
    if (s.empty()) {
        return "";
    }
    int counts[26] = {0};
    for (char ch : s) {
        counts[ch - 'a']++;
    }
    int best = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        if (s[i] < s[best]) {
            best = i;
        }
        if (--counts[s[i] - 'a'] == 0) {
            break;
        }
    }
    char chosen = s[best];
    string rest;
    for (int i = best + 1; i < (int)s.size(); i++) {
        if (s[i] != chosen) {
            rest += s[i];
        }
    }
    return chosen + removeDuplicateLetters(rest);
}`,
        java: `String removeDuplicateLetters(String s) {
    if (s.isEmpty()) {
        return "";
    }
    int[] counts = new int[26];
    for (char ch : s.toCharArray()) {
        counts[ch - 'a']++;
    }
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) < s.charAt(best)) {
            best = i;
        }
        if (--counts[s.charAt(i) - 'a'] == 0) {
            break;
        }
    }
    char chosen = s.charAt(best);
    String rest = s.substring(best + 1).replace(String.valueOf(chosen), "");
    return chosen + removeDuplicateLetters(rest);
}`,
        javascript: `function removeDuplicateLetters(s) {
  if (!s.length) {
    return '';
  }
  const counts = new Array(26).fill(0);
  for (const ch of s) {
    counts[ch.charCodeAt(0) - 97]++;
  }
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] < s[best]) {
      best = i;
    }
    if (--counts[s.charCodeAt(i) - 97] === 0) {
      break;
    }
  }
  const chosen = s[best];
  const rest = [...s.slice(best + 1)].filter(ch => ch !== chosen).join('');
  return chosen + removeDuplicateLetters(rest);
}`,
      },
    },
    {
      name: '單調堆疊貪心',
      idea: '新字元較小時，若堆疊尾端字元後面還會出現，就彈掉尾端；每種字元只保留一份。',
      steps: ['統計剩餘次數，建立堆疊與已入堆疊標記。', '每讀一字，先扣掉其剩餘次數；若已在堆疊則略過。', '尾端字元較大且之後還有副本時，持續彈出。', '把新字元入堆疊，最後連成字串。'],
      figure: { title: 's = "cbacdcbc"', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(26)', why: '每個字元最多入、出堆疊一次；堆疊最多放 26 種字母。' },
      verdict: '線性時間，適合長字串；「還會出現」是允許彈出的必要條件。',
      code: {
        python: `from collections import Counter

def removeDuplicateLetters(s):
    remaining = Counter(s)
    stack = []
    used = set()
    for ch in s:
        remaining[ch] -= 1
        if ch in used:
            continue
        while stack and stack[-1] > ch and remaining[stack[-1]] > 0:
            used.remove(stack.pop())  # 尾字較大且未來可補回
        stack.append(ch)
        used.add(ch)
    return ''.join(stack)`,
        c: `char *removeDuplicateLetters(char *s) {
    int remaining[26] = {0};
    bool used[26] = {false};
    int n = strlen(s);
    for (int i = 0; i < n; i++) {
        remaining[s[i] - 'a']++;
    }
    char *answer = malloc(27);
    int size = 0;
    for (int i = 0; i < n; i++) {
        char ch = s[i];
        remaining[ch - 'a']--;
        if (used[ch - 'a']) {
            continue;
        }
        while (size > 0 && answer[size - 1] > ch && remaining[answer[size - 1] - 'a'] > 0) {
            used[answer[--size] - 'a'] = false;
        }
        answer[size++] = ch;
        used[ch - 'a'] = true;
    }
    answer[size] = '\\0';
    return answer;
}`,
        cpp: `string removeDuplicateLetters(string s) {
    int remaining[26] = {0};
    bool used[26] = {false};
    for (char ch : s) {
        remaining[ch - 'a']++;
    }
    string answer;
    for (char ch : s) {
        remaining[ch - 'a']--;
        if (used[ch - 'a']) {
            continue;
        }
        while (!answer.empty() && answer.back() > ch && remaining[answer.back() - 'a'] > 0) {
            used[answer.back() - 'a'] = false;
            answer.pop_back();
        }
        answer += ch;
        used[ch - 'a'] = true;
    }
    return answer;
}`,
        java: `String removeDuplicateLetters(String s) {
    int[] remaining = new int[26];
    boolean[] used = new boolean[26];
    for (char ch : s.toCharArray()) {
        remaining[ch - 'a']++;
    }
    StringBuilder answer = new StringBuilder();
    for (char ch : s.toCharArray()) {
        remaining[ch - 'a']--;
        if (used[ch - 'a']) {
            continue;
        }
        while (answer.length() > 0 && answer.charAt(answer.length() - 1) > ch && remaining[answer.charAt(answer.length() - 1) - 'a'] > 0) {
            used[answer.charAt(answer.length() - 1) - 'a'] = false;
            answer.deleteCharAt(answer.length() - 1);
        }
        answer.append(ch);
        used[ch - 'a'] = true;
    }
    return answer.toString();
}`,
        javascript: `function removeDuplicateLetters(s) {
  const remaining = new Array(26).fill(0);
  const used = new Array(26).fill(false);
  for (const ch of s) {
    remaining[ch.charCodeAt(0) - 97]++;
  }
  const stack = [];
  for (const ch of s) {
    const index = ch.charCodeAt(0) - 97;
    remaining[index]--;
    if (used[index]) {
      continue;
    }
    while (stack.length && stack[stack.length - 1] > ch && remaining[stack[stack.length - 1].charCodeAt(0) - 97] > 0) {
      used[stack.pop().charCodeAt(0) - 97] = false;
    }
    stack.push(ch);
    used[index] = true;
  }
  return stack.join('');
}`,
      },
    },
  ],
  pitfalls: ['較大字元如果後面不再出現，絕不能彈出，否則答案會缺字。', '已在堆疊的字元直接略過，才能保證每種字母恰好一次。'],
  check: { kind: 'fn', fn: 'removeDuplicateLetters', cases: [{ args: ['bcabc'], out: 'abc' }, { args: [S], out: 'acdb' }, { args: ['bbcaac'], out: 'bac' }, { args: ['a'], out: 'a' }] },
}
