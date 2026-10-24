import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 402. Remove K Digits

const NUM = '1432219'
const K = 3

function stackFig(): FigStep[] {
  return [
    { note: `刪掉 ${K} 個數字讓結果最小。越前面的位數越重要:只要前一位比後一位大,刪掉前一位就能讓數字變小 → 單調遞增堆疊`, views: [arr(NUM.split(''), { label: 'num' })] },
    { note: '1 push;4 push;3 < 4 → 刪 4(k=2);2 < 3 → 刪 3(k=1);2 push;1 < 2 → 刪 2(k=0)', views: [arr(['1', '2', '1'], { label: '堆疊(刪完 3 個)' })] },
    { note: '剩下的 9 直接接上 → "1219"。最後還要去掉前導零;如果 k 還沒用完,從尾巴再刪(遞增的尾巴最大)', views: [arr('1219'.split(''), { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function greedyFig(): FigStep[] {
  return [
    { note: '暴力版的貪心:每一輪從左往右找第一個「比下一位大」的數字刪掉(找不到就刪最後一位),重複 k 輪', views: [arr(NUM.split(''), { label: '第 1 輪:4 > 3,刪 4', dim: [1] })] },
    { note: '"132219" → 刪 3 → "12219" → 刪第二個 2(2 > 1)→ "1219"。每輪 O(n),共 O(n · k)', views: [arr('1219'.split(''), { label: '結果' })] },
  ]
}

export const q0402: Solution = {
  id: 402,
  plain: '一個用字串表示的非負整數,刪掉其中 k 個數字(剩下的順序不變),讓剩下的數最小。',
  statement: '給表示非負整數的字串 `num` 和整數 k,從中刪除 k 個數字,使剩下的數字最小,回傳結果字串(去掉前導零;全部刪光則為 "0")。',
  examples: [
    { input: 'num = "1432219", k = 3', output: '"1219"' },
    { input: 'num = "10200", k = 1', output: '"200"', note: '刪掉 1 之後前導零要去掉' },
    { input: 'num = "10", k = 2', output: '"0"' },
  ],
  constraints: ['長度 ≤ 10⁵'],
  insight: ['高位比低位重要:讓前面的位數盡量小', '從左往右,如果前一位比目前這位大,刪掉前一位一定更好', '這正是單調遞增堆疊:新數字比頂端小就彈出(用掉一次刪除額度)'],
  approaches: [
    {
      name: '單調遞增堆疊',
      idea: '`for d in num`:`while k and st and st[-1] > d`:pop、`k −= 1`;push d。最後再從尾巴刪掉剩下的 k 個,去前導零。',
      steps: ['`st = []`', '每個 d:頂端比 d 大且還能刪 → 彈出、`k -= 1`', 'push d;結束後 `st = st[:len − k]`', '去前導零;空字串回傳 "0"'],
      figure: { title: `num = "${NUM}",k = ${K}`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數字進出堆疊各一次。' },
      verdict: '最推薦,[[p:monotonic-stack]]的貪心應用;別忘了收尾的兩件事(剩下的 k、前導零)。',
      code: {
        python: `def removeKdigits(num, k):
    st = []
    for d in num:
        while k and st and st[-1] > d:
            st.pop()                          # 前面比較大的刪掉,數字變小
            k -= 1
        st.append(d)
    st = st[:len(st) - k]                     # 還沒刪夠:尾巴是最大的
    return ''.join(st).lstrip('0') or '0'`,
        c: `char *removeKdigits(char *num, int k) {
    int n = strlen(num), top = 0;
    char *st = malloc(n + 1);
    for (int i = 0; i < n; i++) {
        while (k && top && st[top - 1] > num[i]) { top--; k--; }
        st[top++] = num[i];
    }
    top -= k;
    int s = 0;
    while (s < top && st[s] == '0') s++;      // 去前導零
    char *res = malloc(top - s + 2);
    if (s == top) strcpy(res, "0");
    else { memcpy(res, st + s, top - s); res[top - s] = '\\0'; }
    free(st);
    return res;
}`,
        cpp: `string removeKdigits(string num, int k) {
    string st;
    for (char d : num) {
        while (k && !st.empty() && st.back() > d) { st.pop_back(); k--; }
        st.push_back(d);
    }
    st.resize(st.size() - k);
    size_t s = st.find_first_not_of('0');
    return s == string::npos ? "0" : st.substr(s);
}`,
        java: `String removeKdigits(String num, int k) {
    StringBuilder st = new StringBuilder();
    for (char d : num.toCharArray()) {
        while (k > 0 && st.length() > 0 && st.charAt(st.length() - 1) > d) { st.deleteCharAt(st.length() - 1); k--; }
        st.append(d);
    }
    st.setLength(st.length() - k);
    int s = 0;
    while (s < st.length() && st.charAt(s) == '0') s++;
    return s == st.length() ? "0" : st.substring(s);
}`,
        javascript: `function removeKdigits(num, k) {
  const st = [];
  for (const d of num) {
    while (k && st.length && st[st.length - 1] > d) {
      st.pop();
      k--;
    }
    st.push(d);
  }
  st.length -= k;
  return st.join('').replace(/^0+/, '') || '0';
}`,
      },
    },
    {
      name: '每輪刪第一個「下坡」',
      idea: '重複 k 次:從左往右找第一個 `num[i] > num[i+1]` 的 i 刪掉;找不到就刪最後一個。',
      steps: ['重複 k 次', '找第一個比下一位大的位置 i(沒有就是最後一位)', '刪掉 num[i]', '最後去前導零'],
      figure: { title: `num = "${NUM}",k = ${K}`, steps: greedyFig() },
      complexity: { time: 'O(n · k)', space: 'O(n)', why: '每輪掃一次並重建字串。' },
      verdict: '貪心的道理一樣,只是每次都從頭找;堆疊版把「回頭找」省掉了。',
      code: {
        python: `def removeKdigits(num, k):
    for _ in range(k):
        i = 0
        while i + 1 < len(num) and num[i] <= num[i + 1]:
            i += 1                            # 第一個下坡(或最後一位)
        num = num[:i] + num[i + 1:]
    return num.lstrip('0') or '0'`,
        c: `char *removeKdigits(char *num, int k) {
    int n = strlen(num);
    char *s = malloc(n + 2);
    strcpy(s, num);
    while (k--) {
        int len = strlen(s), i = 0;
        while (i + 1 < len && s[i] <= s[i + 1]) i++;
        memmove(s + i, s + i + 1, len - i);
    }
    int p = 0;
    while (s[p] == '0') p++;
    if (!s[p]) { strcpy(s, "0"); return s; }
    memmove(s, s + p, strlen(s + p) + 1);
    return s;
}`,
        cpp: `string removeKdigits(string num, int k) {
    while (k--) {
        size_t i = 0;
        while (i + 1 < num.size() && num[i] <= num[i + 1]) i++;
        num.erase(i, 1);
    }
    size_t s = num.find_first_not_of('0');
    return s == string::npos ? "0" : num.substr(s);
}`,
        java: `String removeKdigits(String num, int k) {
    StringBuilder s = new StringBuilder(num);
    while (k-- > 0) {
        int i = 0;
        while (i + 1 < s.length() && s.charAt(i) <= s.charAt(i + 1)) i++;
        s.deleteCharAt(i);
    }
    int p = 0;
    while (p < s.length() && s.charAt(p) == '0') p++;
    return p == s.length() ? "0" : s.substring(p);
}`,
        javascript: `function removeKdigits(num, k) {
  while (k-- > 0) {
    let i = 0;
    while (i + 1 < num.length && num[i] <= num[i + 1]) i++;
    num = num.slice(0, i) + num.slice(i + 1);
  }
  return num.replace(/^0+/, '') || '0';
}`,
      },
    },
  ],
  pitfalls: ['掃完之後 k 還沒用完(例如 "12345"):要從尾巴繼續刪', '忘了去前導零,或全部刪光時回傳空字串而不是 "0"'],
  check: {
    kind: 'fn',
    fn: 'removeKdigits',
    cases: [
      { args: [NUM, K], out: '1219' },
      { args: ['10200', 1], out: '200' },
      { args: ['10', 2], out: '0' },
      { args: ['12345', 2], out: '123' },
      { args: ['112', 1], out: '11' },
      { args: ['10001', 4], out: '0' },
    ],
  },
}
