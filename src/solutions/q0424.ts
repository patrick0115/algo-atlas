import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 424. Longest Repeating Character Replacement

const S = 'AABABBA'
const K = 1

function windowFig(lazy: boolean): FigStep[] {
  const cnt = new Map<string, number>()
  const chars = [...S]
  let l = 0
  let best = 0
  let maxf = 0
  const cntView = (hl: string[] = []) => kv([...cnt].filter(([, v]) => v > 0).sort(), 'count(視窗裡每個字母的次數)', hl)
  const view = (r: number, opt: Parameters<typeof arr>[1] = {}) => arr(chars, { label: 's', range: [l, r], pointers: [{ name: 'l', index: l }, { name: 'r', index: r, color: 'b' }], ...opt })
  const out: FigStep[] = [
    {
      note: `視窗 [l, r] 合法的條件:把「不是最多的那個字母」全部換掉,需要換的次數 = 視窗長度 − 最多字母的次數 ≤ k = ${K}`,
      views: [arr(chars, { label: 's' }), cntView()],
    },
  ]
  for (let r = 0; r < chars.length; r++) {
    cnt.set(chars[r], (cnt.get(chars[r]) ?? 0) + 1)
    maxf = lazy ? Math.max(maxf, cnt.get(chars[r])!) : Math.max(...cnt.values())
    const len = r - l + 1
    if (len - maxf > K) {
      out.push({ note: `加入 ${chars[r]}:長度 ${len} − ${lazy ? 'maxFreq' : '最多次數'} ${maxf} = ${len - maxf} > ${K},要換的太多了 → 左邊 ${chars[l]} 移出,l++`, views: [view(r, { compare: [r] }), cntView([chars[r]])] })
      cnt.set(chars[l], cnt.get(chars[l])! - 1)
      l++
      if (!lazy) maxf = Math.max(...cnt.values())
    }
    best = Math.max(best, r - l + 1)
    out.push({
      note: `視窗 [${l}, ${r}] = "${S.slice(l, r + 1)}",長度 ${r - l + 1},${lazy ? `maxFreq = ${maxf}` : `最多的字母出現 ${maxf} 次`},${!lazy && r - l + 1 - maxf > K ? `要換 ${r - l + 1 - maxf} 個 > ${K},視窗仍不合法,但長度沒超過目前最長,只是平移,答案不受影響` : `要換 ${r - l + 1 - maxf} 個 ≤ ${K} ✓`},最長 ${best}`,
      views: [view(r, { highlight: [r] }), cntView([chars[r]])],
    })
  }
  if (lazy) out.push({ note: `答案 = ${best}。maxFreq 從來沒有變小過 —— 這不影響答案,因為只有出現「更大的 maxFreq」時,答案才可能變長`, views: [arr(chars, { label: 's' })] })
  else out.push({ note: `答案 = ${best}`, views: [arr(chars, { label: 's' })] })
  return out
}

function bruteFig(): FigStep[] {
  const chars = [...S]
  const out: FigStep[] = [{ note: '暴力:試每一個子字串,看「長度 − 最多字母次數 ≤ k」成不成立', views: [arr(chars, { label: 's' })] }]
  let best = 0
  for (let i = 0; i < S.length; i++) {
    const cnt = new Map<string, number>()
    let maxf = 0
    for (let j = i; j < S.length; j++) {
      cnt.set(S[j], (cnt.get(S[j]) ?? 0) + 1)
      maxf = Math.max(maxf, cnt.get(S[j])!)
      const ok = j - i + 1 - maxf <= K
      if (ok && j - i + 1 > best) {
        best = j - i + 1
        out.push({ note: `"${S.slice(i, j + 1)}":長度 ${j - i + 1} − 最多次數 ${maxf} = ${j - i + 1 - maxf} ≤ ${K} ✓ → 目前最長 ${best}`, views: [arr(chars, { label: 's', range: [i, j] })] })
      }
    }
  }
  out.push({ note: `全部子字串試完,最長 ${best}`, views: [arr(chars, { label: 's' })] })
  return out
}

export const q0424: Solution = {
  id: 424,
  plain: '一串大寫字母,最多可以改掉 k 個字母。改完之後,**同一個字母連在一起**最長能有多長?',
  statement: '給一個只有大寫英文字母的字串 `s` 和整數 `k`。你最多可以把 `k` 個字元換成任何大寫字母,換完之後,**由同一個字母組成的最長子字串**最長能多長?',
  examples: [
    { input: 's = "ABAB", k = 2', output: '4', note: '兩個 A 換成 B(或反過來)' },
    { input: 's = "AABABBA", k = 1', output: '4', note: '把中間的 A 換成 B → "AABBBBA",有 4 個 B' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → O(n²) 是 100 億,太慢', '只有 26 種大寫字母 → 計數用長度 26 的陣列', '`0 ≤ k ≤ n`'],
  insight: [
    '一個子字串「最多換 k 個就能全部一樣」⇔ **長度 − 出現最多的字母次數 ≤ k**(把其他字母都換成最多的那個)',
    '找「滿足條件的最長連續子字串」→ [[p:sliding-window]]:右端一直擴張,條件被破壞就縮左端',
    '單調性:視窗合法時,它的子視窗也合法;不合法時,往右擴只會更不合法。所以左端只需要往右走,不用回頭',
    '進階觀察:答案只會在「最多次數 maxFreq 變大」時變長,所以 maxFreq 縮窗時**不用往下修正**,省掉每次重算 26 格',
  ],
  approaches: [
    {
      name: '暴力:每個子字串都檢查',
      idea: '固定起點 `i`,往右延伸 `j`,邊延伸邊更新計數與最多次數,滿足條件就更新答案。',
      steps: ['對每個起點 `i`:`count` 清空、`maxf = 0`', '`j` 從 `i` 往右:`count[s[j]]++`,更新 `maxf`', '`(j − i + 1) − maxf ≤ k` → 更新答案'],
      figure: { title: `s = "${S}", k = ${K}(只畫出刷新最大值的那幾步)`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n(n+1)/2 個子字串,每延伸一格 O(1)。計數陣列固定 26 格。' },
      verdict: 'n = 10⁵ 會超時。用來確認「長度 − 最多次數 ≤ k」這個條件。',
      code: {
        python: `def characterReplacement(s, k):
    best = 0
    for i in range(len(s)):
        count = [0] * 26
        maxf = 0
        for j in range(i, len(s)):
            c = ord(s[j]) - ord('A')
            count[c] += 1
            maxf = max(maxf, count[c])
            if j - i + 1 - maxf <= k:
                best = max(best, j - i + 1)
    return best`,
        c: `int characterReplacement(char *s, int k) {
    int n = strlen(s), best = 0;
    for (int i = 0; i < n; i++) {
        int count[26] = {0}, maxf = 0;
        for (int j = i; j < n; j++) {
            int c = ++count[s[j] - 'A'];
            if (c > maxf) maxf = c;
            if (j - i + 1 - maxf <= k && j - i + 1 > best) best = j - i + 1;
        }
    }
    return best;
}`,
        cpp: `int characterReplacement(string s, int k) {
    int n = s.size(), best = 0;
    for (int i = 0; i < n; i++) {
        int count[26] = {0}, maxf = 0;
        for (int j = i; j < n; j++) {
            maxf = max(maxf, ++count[s[j] - 'A']);
            if (j - i + 1 - maxf <= k) best = max(best, j - i + 1);
        }
    }
    return best;
}`,
        java: `int characterReplacement(String s, int k) {
    int n = s.length(), best = 0;
    for (int i = 0; i < n; i++) {
        int[] count = new int[26];
        int maxf = 0;
        for (int j = i; j < n; j++) {
            maxf = Math.max(maxf, ++count[s.charAt(j) - 'A']);
            if (j - i + 1 - maxf <= k) best = Math.max(best, j - i + 1);
        }
    }
    return best;
}`,
        javascript: `function characterReplacement(s, k) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const count = new Array(26).fill(0);
    let maxf = 0;
    for (let j = i; j < s.length; j++) {
      maxf = Math.max(maxf, ++count[s.charCodeAt(j) - 65]);
      if (j - i + 1 - maxf <= k) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}`,
      },
    },
    {
      name: '滑動視窗,每步重算最多次數',
      idea: '右端 `r` 每次加入一個字元;視窗不合法(`長度 − max(count) > k`)就讓左端 `l` 前進一格。`max(count)` 每次都重新掃 26 格。',
      steps: ['`count = [0]*26`、`l = 0`', '對每個 `r`:`count[s[r]]++`', '`(r − l + 1) − max(count) > k` → `count[s[l]]--`、`l++`', '`best = max(best, r − l + 1)`'],
      figure: { title: `s = "${S}", k = ${K}`, steps: windowFig(false) },
      complexity: { time: 'O(26·n)', space: 'O(1)', why: '每個 r 做一次 O(26) 的 max。l 最多走 n 步。' },
      verdict: '直覺、正確,26 是常數所以也是 O(n)。只要不合法時縮一格(而不是縮到合法為止),視窗大小就永遠不會變小,這是下一個方法的伏筆。',
      code: {
        python: `def characterReplacement(s, k):
    count = [0] * 26
    l = best = 0
    for r, ch in enumerate(s):
        count[ord(ch) - ord('A')] += 1
        if (r - l + 1) - max(count) > k:  # 要換的超過 k 個
            count[ord(s[l]) - ord('A')] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
        c: `int characterReplacement(char *s, int k) {
    int count[26] = {0}, l = 0, best = 0, n = strlen(s);
    for (int r = 0; r < n; r++) {
        count[s[r] - 'A']++;
        int maxf = 0;
        for (int c = 0; c < 26; c++) if (count[c] > maxf) maxf = count[c];
        if (r - l + 1 - maxf > k) count[s[l++] - 'A']--;
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int characterReplacement(string s, int k) {
    int count[26] = {0}, l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        count[s[r] - 'A']++;
        int maxf = *max_element(count, count + 26);
        if (r - l + 1 - maxf > k) count[s[l++] - 'A']--;
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int characterReplacement(String s, int k) {
    int[] count = new int[26];
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        count[s.charAt(r) - 'A']++;
        int maxf = 0;
        for (int c : count) maxf = Math.max(maxf, c);
        if (r - l + 1 - maxf > k) count[s.charAt(l++) - 'A']--;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    count[s.charCodeAt(r) - 65]++;
    if (r - l + 1 - Math.max(...count) > k) count[s.charCodeAt(l++) - 65]--;
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
    {
      name: '滑動視窗 + 不回退的 maxFreq',
      idea: '同上,但 `maxFreq` 只在加入新字元時更新(取 max),縮窗時**不往下修**。它可能偏大,但只會讓視窗「不縮」而不會讓答案錯:答案要變長,一定要有更大的 maxFreq。',
      steps: ['`maxf = 0`', '對每個 `r`:`count[s[r]]++`、`maxf = max(maxf, count[s[r]])`', '`(r − l + 1) − maxf > k` → `count[s[l]]--`、`l++`(maxf 不動)', '`best = max(best, r − l + 1)`'],
      figure: { title: `s = "${S}", k = ${K}`, steps: windowFig(true) },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個 r 只做 O(1) 的事,l 最多走 n 步。' },
      verdict: '最佳解,但正確性要想一下:視窗長度 = maxf + k 時才會再長大;maxf 偏大的那段時間,視窗只是「平移」不變長,不會產生錯的答案。面試講得出這段就很加分。',
      code: {
        python: `def characterReplacement(s, k):
    count = [0] * 26
    l = best = maxf = 0
    for r, ch in enumerate(s):
        c = ord(ch) - ord('A')
        count[c] += 1
        maxf = max(maxf, count[c])        # 只增不減
        if (r - l + 1) - maxf > k:
            count[ord(s[l]) - ord('A')] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
        c: `int characterReplacement(char *s, int k) {
    int count[26] = {0}, l = 0, best = 0, maxf = 0, n = strlen(s);
    for (int r = 0; r < n; r++) {
        int c = ++count[s[r] - 'A'];
        if (c > maxf) maxf = c;               // 只增不減
        if (r - l + 1 - maxf > k) count[s[l++] - 'A']--;
        if (r - l + 1 > best) best = r - l + 1;
    }
    return best;
}`,
        cpp: `int characterReplacement(string s, int k) {
    int count[26] = {0}, l = 0, best = 0, maxf = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        maxf = max(maxf, ++count[s[r] - 'A']);
        if (r - l + 1 - maxf > k) count[s[l++] - 'A']--;
        best = max(best, r - l + 1);
    }
    return best;
}`,
        java: `int characterReplacement(String s, int k) {
    int[] count = new int[26];
    int l = 0, best = 0, maxf = 0;
    for (int r = 0; r < s.length(); r++) {
        maxf = Math.max(maxf, ++count[s.charAt(r) - 'A']);
        if (r - l + 1 - maxf > k) count[s.charAt(l++) - 'A']--;
        best = Math.max(best, r - l + 1);
    }
    return best;
}`,
        javascript: `function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let l = 0, best = 0, maxf = 0;
  for (let r = 0; r < s.length; r++) {
    maxf = Math.max(maxf, ++count[s.charCodeAt(r) - 65]);
    if (r - l + 1 - maxf > k) count[s.charCodeAt(l++) - 65]--;
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '條件寫成「不同字母的種類數 ≤ k」:要換的是**字元個數**,不是種類數',
    '縮窗用 `while` 一直縮到合法也對,但配合「maxf 不回退」時用 `if` 就夠了,因為每次最多只超出 1',
    '以為一定要換同一種字母:題目只問最後有多長,換成哪個字母不重要,換成最多的那個最划算',
  ],
  followUp: [
    { q: '同類型的滑動視窗題?', a: '1004. Max Consecutive Ones III(最多翻 k 個 0)是這題只有兩種字元的版本;[3. Longest Substring Without Repeating](#/q/3) 是條件換成「沒有重複」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'characterReplacement',
    cases: [
      { args: ['ABAB', 2], out: 4 },
      { args: ['AABABBA', 1], out: 4 },
      { args: ['A', 0], out: 1 },
      { args: ['ABCDE', 0], out: 1 },
      { args: ['AAAA', 2], out: 4 },
      { args: ['ABBB', 2], out: 4 },
      { args: ['BAAAB', 2], out: 5 },
    ],
  },
}
