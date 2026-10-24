import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1209. Remove All Adjacent Duplicates in String II

const S = 'deeedbbcccbdaa'
const K = 3

function stackFig(): FigStep[] {
  const st: [string, number][] = []
  const out: FigStep[] = [{ note: `堆疊裡存 (字母, 連續幾個)。新字母和堆疊頂一樣就把計數 + 1;計數到 ${K} 就整個 pop 掉(消掉 ${K} 個)。消掉之後,兩邊的字自然就接起來了`, views: [arr(S.split(''), { label: 's' }), arr([], { label: '堆疊' })] }]
  S.split('').forEach((c, i) => {
    let note: string
    if (st.length && st[st.length - 1][0] === c) {
      st[st.length - 1][1]++
      if (st[st.length - 1][1] === K) {
        st.pop()
        note = `"${c}" 連續 ${K} 個了 → 整組消掉`
      } else note = `"${c}" 和堆疊頂一樣,計數變 ${st[st.length - 1][1]}`
    } else {
      st.push([c, 1])
      note = `"${c}" 是新的一組,push (${c}, 1)`
    }
    if ([3, 7, 10, 11, 13].includes(i)) out.push({ note, views: [arr(S.split(''), { label: 's', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr(st.map(([a, b]) => `${a}×${b}`), { label: '堆疊' })] })
  })
  const ans = st.map(([a, b]) => a.repeat(b)).join('')
  out.push({ note: `把堆疊展開 → "${ans}"`, views: [arr(ans.split(''), { label: '答案', done: ans.split('').map((_, i) => i) })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: `暴力:從頭掃,找到連續 ${K} 個一樣的就刪掉,然後從頭再掃一次,直到沒有可刪的`, views: [arr(S.split(''), { label: '第 1 輪', highlight: [1, 2, 3] })] },
    { note: '"deeedbbcccbdaa" → 刪 eee → "ddbbcccbdaa" → 刪 ccc → "ddbbbdaa" → 刪 bbb → "dddaa" → 刪 ddd → "aa"。每輪 O(n),最多 n/k 輪 → O(n²/k)', views: [arr(['a', 'a'], { label: '最後', done: [0, 1] })] },
  ]
}

export const q1209: Solution = {
  id: 1209,
  plain: '一串字裡,只要有 k 個一樣的字連在一起,就把它們消掉(像消消樂)。消掉之後兩邊接起來,可能又湊出新的 k 個,繼續消,直到不能再消。最後剩下什麼?',
  statement: '給字串 `s` 和整數 `k`。一次操作:選 k 個相鄰且相同的字元刪除,左右兩部分接起來。重複操作直到無法再刪,回傳最終字串(保證唯一)。',
  examples: [
    { input: 's = "abcd", k = 2', output: '"abcd"' },
    { input: 's = "deeedbbcccbdaa", k = 3', output: '"aa"' },
    { input: 's = "pbbcggttciiippooaais", k = 2', output: '"ps"' },
  ],
  constraints: ['長度 ≤ 10⁵,k ≤ 10⁴'],
  insight: ['消掉一段後,左右會接起來 → 要能「回頭看前面的」→ 堆疊', '堆疊裡不要存單一字元,存 (字元, 連續個數),比較時才不用往回數', '1047(k = 2)的推廣'],
  approaches: [
    {
      name: '堆疊存 (字元, 次數)',
      idea: '和頂端一樣 → 次數 + 1,到 k 就 pop;不一樣 → push (c, 1)。最後展開。',
      steps: ['`st = []`', '`for c in s`:`st and st[-1][0] == c` → `st[-1][1] += 1`,等於 k 就 pop', '否則 `st.append([c, 1])`', '回傳 `"".join(c * n for c, n in st)`'],
      figure: { title: `s = "${S}",k = ${K}`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元處理一次;堆疊最多 n 組。' },
      verdict: '最推薦。[[p:stack]]的「消除相鄰」模板,把次數一起存就能處理任意 k。',
      code: {
        python: `def removeDuplicates(s, k):
    st = []                                   # [字元, 連續個數]
    for c in s:
        if st and st[-1][0] == c:
            st[-1][1] += 1
            if st[-1][1] == k:
                st.pop()                      # 湊滿 k 個:消掉
        else:
            st.append([c, 1])
    return ''.join(c * n for c, n in st)`,
        c: `char *removeDuplicates(char *s, int k) {
    int n = strlen(s), top = 0;
    char *ch = malloc(n + 1);
    int *cnt = malloc((n + 1) * sizeof(int));
    for (int i = 0; i < n; i++) {
        if (top && ch[top - 1] == s[i]) {
            if (++cnt[top - 1] == k) top--;
        } else { ch[top] = s[i]; cnt[top++] = 1; }
    }
    char *res = malloc(n + 1);
    int p = 0;
    for (int t = 0; t < top; t++) for (int r = 0; r < cnt[t]; r++) res[p++] = ch[t];
    res[p] = '\\0';
    free(ch); free(cnt);
    return res;
}`,
        cpp: `string removeDuplicates(string s, int k) {
    vector<pair<char, int>> st;
    for (char c : s) {
        if (!st.empty() && st.back().first == c) {
            if (++st.back().second == k) st.pop_back();
        } else st.push_back({c, 1});
    }
    string res;
    for (auto &[c, n] : st) res.append(n, c);
    return res;
}`,
        java: `String removeDuplicates(String s, int k) {
    int n = s.length(), top = 0;
    char[] ch = new char[n];
    int[] cnt = new int[n];
    for (char c : s.toCharArray()) {
        if (top > 0 && ch[top - 1] == c) {
            if (++cnt[top - 1] == k) top--;
        } else { ch[top] = c; cnt[top++] = 1; }
    }
    StringBuilder sb = new StringBuilder();
    for (int t = 0; t < top; t++) sb.append(String.valueOf(ch[t]).repeat(cnt[t]));
    return sb.toString();
}`,
        javascript: `function removeDuplicates(s, k) {
  const st = [];
  for (const c of s) {
    if (st.length && st[st.length - 1][0] === c) {
      if (++st[st.length - 1][1] === k) st.pop();
    } else st.push([c, 1]);
  }
  return st.map(([c, n]) => c.repeat(n)).join('');
}`,
      },
    },
    {
      name: '暴力:反覆掃描刪除',
      idea: '掃一遍找第一段 k 個相同的,刪掉後重新開始;直到找不到。',
      steps: ['`changed = True`', '`while changed`:從頭掃,數連續相同的長度,到 k 就刪掉這段、`changed = True`、重新掃', '回傳 s'],
      figure: { title: `s = "${S}",k = ${K}`, steps: bruteFig() },
      complexity: { time: 'O(n² / k)', space: 'O(n)', why: '最多 n/k 輪,每輪 O(n)。' },
      verdict: '直接照題意模擬。n = 10⁵、k 很小時太慢,拿來驗證堆疊版。',
      code: {
        python: `def removeDuplicates(s, k):
    changed = True
    while changed:
        changed = False
        run = 1
        for i in range(1, len(s) + 1):
            if i < len(s) and s[i] == s[i - 1]:
                run += 1
                if run == k:                  # s[i−k+1 .. i] 是 k 個相同
                    s = s[:i - k + 1] + s[i + 1:]
                    changed = True
                    break
            else:
                run = 1
    return s`,
        c: `char *removeDuplicates(char *s, int k) {
    int n = strlen(s);
    char *a = malloc(n + 1);
    strcpy(a, s);
    bool changed = true;
    while (changed) {
        changed = false;
        int len = strlen(a);
        for (int i = 1, run = 1; i < len; i++) {
            run = a[i] == a[i - 1] ? run + 1 : 1;
            if (run == k) {
                memmove(a + i - k + 1, a + i + 1, len - i);   // 連同結尾的 \\0 一起搬
                changed = true;
                break;
            }
        }
    }
    return a;
}`,
        cpp: `string removeDuplicates(string s, int k) {
    bool changed = true;
    while (changed) {
        changed = false;
        for (int i = 1, run = 1; i < (int)s.size(); i++) {
            run = s[i] == s[i - 1] ? run + 1 : 1;
            if (run == k) { s.erase(i - k + 1, k); changed = true; break; }
        }
    }
    return s;
}`,
        java: `String removeDuplicates(String s, int k) {
    StringBuilder sb = new StringBuilder(s);
    boolean changed = true;
    while (changed) {
        changed = false;
        for (int i = 1, run = 1; i < sb.length(); i++) {
            run = sb.charAt(i) == sb.charAt(i - 1) ? run + 1 : 1;
            if (run == k) { sb.delete(i - k + 1, i + 1); changed = true; break; }
        }
    }
    return sb.toString();
}`,
        javascript: `function removeDuplicates(s, k) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 1, run = 1; i < s.length; i++) {
      run = s[i] === s[i - 1] ? run + 1 : 1;
      if (run === k) {
        s = s.slice(0, i - k + 1) + s.slice(i + 1);
        changed = true;
        break;
      }
    }
  }
  return s;
}`,
      },
    },
  ],
  pitfalls: ['堆疊只存字元、每次往回數 k 個:最壞 O(n·k)', '消掉之後忘了「兩邊會接起來」:只掃一遍會漏掉連鎖消除'],
  check: {
    kind: 'fn',
    fn: 'removeDuplicates',
    cases: [
      { args: ['abcd', 2], out: 'abcd' },
      { args: [S, K], out: 'aa' },
      { args: ['pbbcggttciiippooaais', 2], out: 'ps' },
      { args: ['aaaa', 2], out: '' },
      { args: ['abba', 2], out: '' },
    ],
  },
}
