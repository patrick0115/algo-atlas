import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = '092282', LIMIT = 3

function chooseFig(): FigStep[] {
  const out: FigStep[] = []
  const result = SAMPLE.split('')
  let leftBudget = LIMIT
  out.push({ note: `原字串 ${SAMPLE}，最多改 ${LIMIT} 位；先看所有對稱位置，至少需要 ${[0, 1, 2].filter(i => SAMPLE[i] !== SAMPLE[5 - i]).length} 次。`, views: [arr(result, { label: '數字' }), kv([['剩餘修改', leftBudget]])] })
  for (let i = 0; i < SAMPLE.length / 2; i++) {
    let minimumRest = 0
    for (let j = i + 1; j < SAMPLE.length / 2; j++) {
      if (SAMPLE[j] !== SAMPLE[SAMPLE.length - 1 - j]) minimumRest++
    }
    for (let digit = 9; digit >= 0; digit--) {
      const word = String(digit)
      const cost = Number(SAMPLE[i] !== word) + Number(SAMPLE[SAMPLE.length - 1 - i] !== word)
      if (digit === 9 || cost + minimumRest <= leftBudget) out.push({ note: `第 ${i} 對試 ${digit}：目前需改 ${cost} 位，後面至少還需 ${minimumRest} 位，剩 ${leftBudget}；${cost + minimumRest <= leftBudget ? '可選' : '不可選'}。`, views: [arr(result, { label: '正在處理的對稱位置', highlight: [i, SAMPLE.length - 1 - i] }), kv([['候選數字', digit], ['本對成本', cost], ['後段最低成本', minimumRest], ['剩餘', leftBudget]])] })
      if (cost + minimumRest <= leftBudget) {
        result[i] = result[SAMPLE.length - 1 - i] = word
        leftBudget -= cost
        break
      }
    }
  }
  return out
}

function twoPassFig(): FigStep[] {
  const out: FigStep[] = []
  const result = SAMPLE.split(''), changed = Array(SAMPLE.length).fill(false)
  let left = LIMIT
  for (let i = 0; i < SAMPLE.length / 2; i++) {
    const j = SAMPLE.length - 1 - i
    if (result[i] !== result[j]) {
      result[i] = result[j] = result[i] > result[j] ? result[i] : result[j]
      changed[i] = true
      left--
    }
    out.push({ note: `修回文第 ${i}/${j} 位：${changed[i] ? `改小的那位，這對變成 ${result[i]}，剩 ${left} 次` : `本來相等，不花次數，仍剩 ${left} 次`}。`, views: [arr(result, { label: '先修成回文', highlight: [i, j] }), kv([['剩餘修改', left], ['這對已改過', changed[i] ? '是' : '否']])] })
  }
  for (let i = 0; i < SAMPLE.length / 2; i++) {
    const j = SAMPLE.length - 1 - i, cost = changed[i] ? 1 : 2
    if (result[i] !== '9' && left >= cost) {
      result[i] = result[j] = '9'
      left -= cost
    }
    out.push({ note: `從左側第 ${i} 對往右：升為 9 要 ${cost} 次；${result[i] === '9' ? `現在是 9，剩 ${left} 次` : `預算不足，保留 ${result[i]}`}。`, views: [arr(result, { label: '升級後的回文', highlight: [i, j] }), kv([['升級成本', cost], ['剩餘修改', left]])] })
  }
  return out
}

export const hrRichieRich: HrSolution = {
  slug: 'richie-rich',
  plain: '像修一面左右對稱的數字招牌：先花最少次數把兩側修成相同，再把靠左的數字盡量換成 9。',
  statement: '給十進位數字字串 s、其長度 n 與最多可改動的字元數 k。每改一個位置花一次。必須讓最後字串左右對稱，在不超過 k 次的前提下選數值最大的結果；無法完成就回傳 -1。前導零也屬於字串的一部分。',
  examples: [
    { input: 's = "092282", n = 6, k = 3', output: '992299', note: '先用兩次修好兩組不相等的數字，再用一次把最左邊那對升為 9。' },
    { input: 's = "0011", n = 4, k = 1', output: '-1', note: '兩組對稱位置都不同，至少得改兩次。' },
  ],
  constraints: [
    'n 最多 10^5 → 不能枚舉所有改法或反覆重算後段需求。',
    '0 ≤ k ≤ 10^5，k 可能比 n 大 → 先算最低修復成本，超過 k 就可立即判定失敗。',
    '字串可能以 0 開頭 → 不能轉整數後處理，必須保留每個位置。',
  ],
  insight: [
    '最左側的數字比右側更影響大小，因此可由外往內，優先選能負擔的最大數字。',
    '要保證後段仍能修成回文，選當前數字時需保留後面不相等對數的最低修改成本；反覆重算會慢。',
    '先做一遍最低成本修復，再從左到右用剩餘次數升到 9：已修過的對只需再多花 1 次預算(原本就改過一位),未修過的對要多花 2 次，形成 [[p:greedy]]。',
  ],
  approaches: [
    {
      name: '逐對試最大可行數字',
      idea: '每組對稱位由 9 往下試，保留足夠次數修復後面的不相等位置。',
      steps: ['先算所有不相等對數；若大於 k 回傳 -1。', '從外到內處理每組對稱位置，重算後面仍需幾次最低修復。', '候選數字由 9 往下試，計算目前兩格改成候選數字的成本。', '選第一個滿足「目前成本＋後段最低成本≤剩餘次數」的候選；奇數長度中央若有餘額就改成 9。'],
      figure: { title: '092282：逐對試數字', steps: chooseFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每一對都可能重新掃描後面的對；答案字元陣列佔 n 格。' },
      verdict: '直接體現字典序最大化與預算保留，但長字串過慢。',
      code: {
        python: `def highestValuePalindrome(s, n, k):
    if sum(s[i] != s[n - 1 - i] for i in range(n // 2)) > k:
        return '-1'
    result = list(s)
    for i in range(n // 2):
        j = n - 1 - i
        reserve = sum(s[t] != s[n - 1 - t] for t in range(i + 1, n // 2))
        for digit in '9876543210':
            cost = (s[i] != digit) + (s[j] != digit)
            if cost + reserve <= k:
                result[i] = result[j] = digit  # 選最大可行數字
                k -= cost
                break
    if n % 2 and k:
        result[n // 2] = '9'
    return ''.join(result)`,
        c: `char* highestValuePalindrome(char* s, int n, int k) {
    int mismatch = 0;
    for (int i = 0; i < n / 2; i++) mismatch += s[i] != s[n - 1 - i];
    if (mismatch > k) return "-1";
    char* result = malloc(n + 1);
    strcpy(result, s);
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, reserve = 0;
        for (int t = i + 1; t < n / 2; t++) reserve += s[t] != s[n - 1 - t];
        for (char digit = '9'; digit >= '0'; digit--) {
            int cost = (s[i] != digit) + (s[j] != digit);
            if (cost + reserve <= k) {
                result[i] = result[j] = digit;
                k -= cost;
                break;
            }
        }
    }
    if (n % 2 && k > 0) result[n / 2] = '9';
    return result;
}`,
        cpp: `string highestValuePalindrome(string s, int n, int k) {
    int mismatch = 0;
    for (int i = 0; i < n / 2; i++) mismatch += s[i] != s[n - 1 - i];
    if (mismatch > k) return "-1";
    string result = s;
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, reserve = 0;
        for (int t = i + 1; t < n / 2; t++) reserve += s[t] != s[n - 1 - t];
        for (char digit = '9'; digit >= '0'; digit--) {
            int cost = (s[i] != digit) + (s[j] != digit);
            if (cost + reserve <= k) {
                result[i] = result[j] = digit;
                k -= cost;
                break;
            }
        }
    }
    if (n % 2 && k) result[n / 2] = '9';
    return result;
}`,
        java: `public static String highestValuePalindrome(String s, int n, int k) {
    int mismatch = 0;
    for (int i = 0; i < n / 2; i++) if (s.charAt(i) != s.charAt(n - 1 - i)) mismatch++;
    if (mismatch > k) return "-1";
    char[] result = s.toCharArray();
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, reserve = 0;
        for (int t = i + 1; t < n / 2; t++) if (s.charAt(t) != s.charAt(n - 1 - t)) reserve++;
        for (char digit = '9'; digit >= '0'; digit--) {
            int cost = (s.charAt(i) != digit ? 1 : 0) + (s.charAt(j) != digit ? 1 : 0);
            if (cost + reserve <= k) {
                result[i] = result[j] = digit;
                k -= cost;
                break;
            }
        }
    }
    if (n % 2 == 1 && k > 0) result[n / 2] = '9';
    return new String(result);
}`,
        javascript: `function highestValuePalindrome(s, n, k) {
  let mismatch = 0;
  for (let i = 0; i < n / 2; i++) if (s[i] !== s[n - 1 - i]) mismatch++;
  if (mismatch > k) return '-1';
  const result = [...s];
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;
    let reserve = 0;
    for (let t = i + 1; t < Math.floor(n / 2); t++) if (s[t] !== s[n - 1 - t]) reserve++;
    for (let digit = 9; digit >= 0; digit--) {
      const word = String(digit);
      const cost = Number(s[i] !== word) + Number(s[j] !== word);
      if (cost + reserve <= k) {
        result[i] = result[j] = word;
        k -= cost;
        break;
      }
    }
  }
  if (n % 2 && k > 0) result[Math.floor(n / 2)] = '9';
  return result.join('');
}`,
      },
    },
    {
      name: '先修回文再升級',
      idea: '第一遍用最低成本修對稱，第二遍把靠左的對稱數字盡可能換成 9。',
      steps: ['算不相等的對數，若超過 k，回傳 -1。', '第一遍將不相等的一對都改成較大的數字，記錄該對已使用一次。', '第二遍由左往右，若非 9，已修過的一對再升級花 1，未修過的一對花 2；預算足夠才升級。', '奇數長度若仍有預算，把中央數字升為 9。'],
      figure: { title: '092282：兩遍貪心', steps: twoPassFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次走過對稱位置；可變字元陣列與已修改標記各佔 n 格。' },
      verdict: '最佳解；先確保可行，再優先提升高位。',
      code: {
        python: `def highestValuePalindrome(s, n, k):
    result = list(s)
    changed = [False] * (n // 2)
    for i in range(n // 2):
        j = n - 1 - i
        if result[i] != result[j]:
            result[i] = result[j] = max(result[i], result[j])
            changed[i] = True  # 這一對已花一次
            k -= 1
    if k < 0:
        return '-1'
    for i in range(n // 2):
        j = n - 1 - i
        cost = 1 if changed[i] else 2
        if result[i] != '9' and k >= cost:
            result[i] = result[j] = '9'
            k -= cost
    if n % 2 and k > 0:
        result[n // 2] = '9'
    return ''.join(result)`,
        c: `char* highestValuePalindrome(char* s, int n, int k) {
    char* result = malloc(n + 1);
    strcpy(result, s);
    char* changed = calloc(n / 2 + 1, 1);
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i;
        if (result[i] != result[j]) {
            char larger = result[i] > result[j] ? result[i] : result[j];
            result[i] = result[j] = larger;
            changed[i] = 1;
            k--;
        }
    }
    if (k < 0) {
        free(changed);
        free(result);
        return "-1";
    }
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, cost = changed[i] ? 1 : 2;
        if (result[i] != '9' && k >= cost) {
            result[i] = result[j] = '9';
            k -= cost;
        }
    }
    if (n % 2 && k > 0) result[n / 2] = '9';
    free(changed);
    return result;
}`,
        cpp: `string highestValuePalindrome(string s, int n, int k) {
    vector<bool> changed(n / 2, false);
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i;
        if (s[i] != s[j]) {
            s[i] = s[j] = max(s[i], s[j]);
            changed[i] = true;
            k--;
        }
    }
    if (k < 0) return "-1";
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, cost = changed[i] ? 1 : 2;
        if (s[i] != '9' && k >= cost) {
            s[i] = s[j] = '9';
            k -= cost;
        }
    }
    if (n % 2 && k) s[n / 2] = '9';
    return s;
}`,
        java: `public static String highestValuePalindrome(String s, int n, int k) {
    char[] result = s.toCharArray();
    boolean[] changed = new boolean[n / 2];
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i;
        if (result[i] != result[j]) {
            result[i] = result[j] = (char)Math.max(result[i], result[j]);
            changed[i] = true;
            k--;
        }
    }
    if (k < 0) return "-1";
    for (int i = 0; i < n / 2; i++) {
        int j = n - 1 - i, cost = changed[i] ? 1 : 2;
        if (result[i] != '9' && k >= cost) {
            result[i] = result[j] = '9';
            k -= cost;
        }
    }
    if (n % 2 == 1 && k > 0) result[n / 2] = '9';
    return new String(result);
}`,
        javascript: `function highestValuePalindrome(s, n, k) {
  const result = [...s];
  const changed = Array(Math.floor(n / 2)).fill(false);
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;
    if (result[i] !== result[j]) {
      result[i] = result[j] = result[i] > result[j] ? result[i] : result[j];
      changed[i] = true;
      k--;
    }
  }
  if (k < 0) return '-1';
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i;
    const cost = changed[i] ? 1 : 2;
    if (result[i] !== '9' && k >= cost) {
      result[i] = result[j] = '9';
      k -= cost;
    }
  }
  if (n % 2 && k > 0) result[Math.floor(n / 2)] = '9';
  return result.join('');
}`,
      },
    },
  ],
  pitfalls: [
    '先確認最低修復次數，否則可能花光預算後仍不對稱。',
    '已修過的一對升成 9 只要再多花 1 次預算(兩格都會寫成 9,但其中一格本來就算在修復次數裡);未修過的一對要多花 2 次。',
    '奇數長度中央只有一格，升成 9 只花一次。',
  ],
  check: {
    kind: 'fn',
    fn: 'highestValuePalindrome',
    cases: [
      { args: ['092282', 6, 3], out: '992299' },
      { args: ['0011', 4, 1], out: '-1' },
      { args: ['3943', 4, 1], out: '3993' },
      { args: ['5', 1, 1], out: '9' },
      { args: ['5', 1, 0], out: '5' },
      { args: ['1111', 4, 4], out: '9999' },
      { args: ['12321', 5, 1], out: '12921' },
    ],
  },
}
