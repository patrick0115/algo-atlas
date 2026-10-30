import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const source = 'daBcd', goal = 'ABC'

function searchFig(): FigStep[] {
  const out: FigStep[] = []
  function visit(i: number, j: number): boolean {
    out.push({ note: `看 a 的位置 ${i}、b 的位置 ${j}：已處理前綴「${source.slice(0, i)}」與「${goal.slice(0, j)}」；${i === source.length ? (j === goal.length ? '兩邊都完成，成功。' : 'a 用完而 b 未完，失敗。') : `目前字元 ${source[i]}。`}`, views: [arr(source.split(''), { label: 'a', highlight: i < source.length ? [i] : [] }), arr(goal.split(''), { label: 'b', highlight: j < goal.length ? [j] : [] }), arr([i, j], { label: 'a、b 指標' })] })
    if (i === source.length) return j === goal.length
    const ch = source[i]
    if (ch.toLowerCase() === ch && visit(i + 1, j)) return true
    return j < goal.length && ch.toUpperCase() === goal[j] && visit(i + 1, j + 1)
  }
  visit(0, 0)
  return out
}

function dpFig(): FigStep[] {
  const out: FigStep[] = []
  const dp = Array.from({ length: source.length + 1 }, () => Array(goal.length + 1).fill(false) as boolean[])
  dp[0][0] = true
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j <= goal.length; j++) {
      if (!dp[i][j]) continue
      const ch = source[i]
      if (ch.toLowerCase() === ch) dp[i + 1][j] = true
      if (j < goal.length && ch.toUpperCase() === goal[j]) dp[i + 1][j + 1] = true
      out.push({ note: `從 (${i},${j}) 可達：${ch.toLowerCase() === ch ? `可刪 ${ch}` : `${ch} 是大寫不可刪`}${j < goal.length && ch.toUpperCase() === goal[j] ? `；亦可匹配 ${goal[j]}` : '；無法匹配目標目前字元'}。`, views: [arr(source.split(''), { label: '來源', highlight: [i] }), arr(goal.split(''), { label: '目標', highlight: j < goal.length ? [j] : [] }), { kind: 'grid', label: 'dp 可達狀態（1=可）', cells: dp.map(row => row.map(Number)), marks: { hl: [[i, j]] } }] })
    }
  }
  return out
}

export const hrAbbr: HrSolution = {
  slug: 'abbr',
  plain: '像編輯一張名牌：小寫字可改成大寫或擦掉，原有大寫字卻必須原封不動地留下。',
  statement: '輸入來源字串 a 與全大寫目標 b。a 中的小寫字母可選擇轉成大寫或刪除；原本的大寫字母既不能刪，也不能改。字母相對順序不變。若能使 a 最終恰好等於 b，回傳 YES，否則 NO。',
  examples: [
    { input: 'a="daBcd", b="ABC"', output: 'YES', note: '刪掉 d，將 a、c 變成 A、C，保留 B。' },
    { input: 'a="AbcDE", b="AFDE"', output: 'NO', note: '來源沒有可變成 F 的字母。' },
  ],
  constraints: [
    '兩字串長度可達 1000 → 每個小寫字都分支的指數枚舉太慢。',
    'a 混合大小寫，b 全大寫 → 小寫有「刪或匹配」兩路，大寫只能匹配。',
    '每組字串獨立判斷 → 可用二維布林表記錄前綴是否可達。',
  ],
  insight: [
    '逐字做決定：小寫可刪或轉大寫匹配，大寫只能原樣匹配；深度搜尋自然得到所有可能。',
    '不同決策路徑會到相同的 (a 已處理長度, b 已匹配長度)，重複搜尋可合併。',
    '令 dp[i][j] 表示 a 前 i 字可變成 b 前 j 字，按字元轉移；這是 [[p:dp-general]] 中的字串前綴狀態。',
  ],
  approaches: [
    {
      name: '逐字分支搜尋',
      idea: '對小寫字嘗試刪掉與轉大寫匹配，對大寫字只嘗試匹配。',
      steps: ['設定 i、j 分別指向 a、b 的下一個字元。', '若 a 已走完，只有 b 也走完才成功。', 'a[i] 為小寫時，可遞迴刪除此字而保持 j。', '若 a[i] 的大寫形式等於 b[j]，也可兩個指標一起前進；任一分支成功即回傳 YES。'],
      figure: { title: 'a="daBcd", b="ABC"', steps: searchFig() },
      complexity: { time: 'O(2^|a|)', space: 'O(|a|)', why: '每個小寫位置最多分成兩路；遞迴深度為來源長度。' },
      verdict: '直接反映選擇規則，但重複狀態太多。',
      code: {
        python: `def abbreviation(a, b):
    def visit(i, j):
        if i == len(a):
            return j == len(b)
        ch = a[i]
        if ch.islower() and visit(i + 1, j):
            return True  # 小寫可以直接刪除
        return j < len(b) and ch.upper() == b[j] and visit(i + 1, j + 1)
    return 'YES' if visit(0, 0) else 'NO'`,
        c: `int canAbbreviate(char* a, char* b, int i, int j) {
    if (!a[i]) return !b[j];
    char ch = a[i];
    if (ch >= 'a' && ch <= 'z' && canAbbreviate(a, b, i + 1, j)) return 1;
    if (b[j] && (ch == b[j] || (ch >= 'a' && ch <= 'z' && ch - 'a' + 'A' == b[j]))) {
        return canAbbreviate(a, b, i + 1, j + 1);
    }
    return 0;
}
char* abbreviation(char* a, char* b) {
    return canAbbreviate(a, b, 0, 0) ? "YES" : "NO";
}`,
        cpp: `bool canAbbreviate(const string& a, const string& b, int i, int j) {
    if (i == (int)a.size()) return j == (int)b.size();
    if (islower(a[i]) && canAbbreviate(a, b, i + 1, j)) return true;
    return j < (int)b.size() && toupper(a[i]) == b[j] && canAbbreviate(a, b, i + 1, j + 1);
}
string abbreviation(string a, string b) {
    return canAbbreviate(a, b, 0, 0) ? "YES" : "NO";
}`,
        java: `public static boolean canAbbreviate(String a, String b, int i, int j) {
    if (i == a.length()) return j == b.length();
    char ch = a.charAt(i);
    if (Character.isLowerCase(ch) && canAbbreviate(a, b, i + 1, j)) return true;
    return j < b.length() && Character.toUpperCase(ch) == b.charAt(j) && canAbbreviate(a, b, i + 1, j + 1);
}
public static String abbreviation(String a, String b) {
    return canAbbreviate(a, b, 0, 0) ? "YES" : "NO";
}`,
        javascript: `function abbreviation(a, b) {
  function visit(i, j) {
    if (i === a.length) return j === b.length;
    const ch = a[i];
    if (ch === ch.toLowerCase() && visit(i + 1, j)) return true;
    return j < b.length && ch.toUpperCase() === b[j] && visit(i + 1, j + 1);
  }
  return visit(0, 0) ? 'YES' : 'NO';
}`,
      },
    },
    {
      name: '前綴可達動態規劃',
      idea: '記錄每個來源前綴能形成哪些目標前綴，避免重複搜尋。',
      steps: ['建立 (|a|+1)×(|b|+1) 布林表，令 dp[0][0]=true。', '掃描每個可達的 dp[i][j]。', '若 a[i] 是小寫，可刪掉它，設定 dp[i+1][j]。', '若其大寫形式等於 b[j]，可保留並設定 dp[i+1][j+1]。', '由 dp[|a|][|b|] 決定答案。'],
      figure: { title: 'a="daBcd", b="ABC"', steps: dpFig() },
      complexity: { time: 'O(|a||b|)', space: 'O(|a||b|)', why: '每個前綴配對狀態最多處理一次；布林表保存全部狀態。' },
      verdict: '可處理千字長字串；若只需結果，也能壓縮成一列。',
      code: {
        python: `def abbreviation(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    dp = [[False] * cols for _ in range(rows)]
    dp[0][0] = True
    for i, ch in enumerate(a):
        for j in range(cols):
            if not dp[i][j]:
                continue
            if ch.islower():
                dp[i + 1][j] = True  # 刪掉小寫字
            if j < len(b) and ch.upper() == b[j]:
                dp[i + 1][j + 1] = True  # 保留或轉大寫匹配
    return 'YES' if dp[-1][-1] else 'NO'`,
        c: `char* abbreviation(char* a, char* b) {
    int n = strlen(a), m = strlen(b);
    char* dp = calloc((n + 1) * (m + 1), 1);
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= m; j++) {
            if (!dp[i * (m + 1) + j]) continue;
            char ch = a[i];
            if (ch >= 'a' && ch <= 'z') dp[(i + 1) * (m + 1) + j] = 1;
            if (j < m && (ch == b[j] || (ch >= 'a' && ch <= 'z' && ch - 'a' + 'A' == b[j]))) {
                dp[(i + 1) * (m + 1) + j + 1] = 1;
            }
        }
    }
    int good = dp[n * (m + 1) + m];
    free(dp);
    return good ? "YES" : "NO";
}`,
        cpp: `string abbreviation(string a, string b) {
    int n = a.size(), m = b.size();
    vector<vector<char>> dp(n + 1, vector<char>(m + 1));
    dp[0][0] = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= m; j++) {
            if (!dp[i][j]) continue;
            if (islower(a[i])) dp[i + 1][j] = 1;
            if (j < m && toupper(a[i]) == b[j]) dp[i + 1][j + 1] = 1;
        }
    }
    return dp[n][m] ? "YES" : "NO";
}`,
        java: `public static String abbreviation(String a, String b) {
    int n = a.length(), m = b.length();
    boolean[][] dp = new boolean[n + 1][m + 1];
    dp[0][0] = true;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= m; j++) {
            if (!dp[i][j]) continue;
            char ch = a.charAt(i);
            if (Character.isLowerCase(ch)) dp[i + 1][j] = true;
            if (j < m && Character.toUpperCase(ch) == b.charAt(j)) dp[i + 1][j + 1] = true;
        }
    }
    return dp[n][m] ? "YES" : "NO";
}`,
        javascript: `function abbreviation(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(false));
  dp[0][0] = true;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j <= b.length; j++) {
      if (!dp[i][j]) continue;
      if (a[i] === a[i].toLowerCase()) dp[i + 1][j] = true;
      if (j < b.length && a[i].toUpperCase() === b[j]) dp[i + 1][j + 1] = true;
    }
  }
  return dp[a.length][b.length] ? 'YES' : 'NO';
}`,
      },
    },
  ],
  pitfalls: [
    '原本大寫字母不能刪除；即使目前無法匹配，也不能略過。',
    '小寫轉大寫後必須依原順序對上 b，不能任意重排。',
    'b 已匹配完時，a 剩下的小寫仍可刪，但大寫會使答案失敗。',
  ],
  check: {
    kind: 'fn', fn: 'abbreviation', cases: [
      { args: ['daBcd', 'ABC'], out: 'YES' },
      { args: ['AbcDE', 'AFDE'], out: 'NO' },
      { args: ['a', 'A'], out: 'YES' },
      { args: ['A', 'B'], out: 'NO' },
      { args: ['abc', 'ABC'], out: 'YES' },
      { args: ['Aa', 'A'], out: 'YES' },
    ],
  },
}
