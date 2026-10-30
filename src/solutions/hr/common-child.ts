import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const A = 'HARRY', B = 'SALLY'

function subsequenceFig(): FigStep[] {
  const out: FigStep[] = []
  let best = 0
  for (let mask = 1; mask < 1 << A.length; mask++) {
    let word = ''
    for (let i = 0; i < A.length; i++) if (mask & (1 << i)) word += A[i]
    let j = 0
    for (const ch of B) if (ch === word[j]) j++
    const valid = j === word.length
    if (valid) best = Math.max(best, word.length)
    if (mask <= 5 || valid) out.push({
      note: `選取遮罩 ${mask} 得到「${word}」；在 SALLY 中依序找到 ${j}/${word.length} 字，${valid ? `可行，目前最長 ${best}` : '順序不完整'}。`,
      views: [arr(A.split(''), { label: '從 HARRY 選字', highlight: Array.from({ length: A.length }, (_, i) => i).filter(i => !!(mask & (1 << i))) }), arr(B.split(''), { label: '在 SALLY 核對' }), arr([best], { label: '目前最長' })],
    })
  }
  return out
}

function dpFig(): FigStep[] {
  const dp = Array.from({ length: A.length + 1 }, () => Array<number>(B.length + 1).fill(0))
  const out: FigStep[] = []
  for (let i = 1; i <= A.length; i++) {
    for (let j = 1; j <= B.length; j++) {
      dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
      if (j === B.length || A[i - 1] === B[j - 1]) out.push({
        note: `比較 ${A[i - 1]} 與 ${B[j - 1]}：${A[i - 1] === B[j - 1] ? `相同，左上角加一得 ${dp[i][j]}` : `不同，取上方與左方較大值 ${dp[i][j]}`}。`,
        views: [arr(A.split(''), { label: 's1', highlight: [i - 1] }), arr(B.split(''), { label: 's2', highlight: [j - 1] }), { kind: 'grid', label: '已填的 LCS 長度表', cells: dp.map(row => row.slice()), marks: { hl: [[i, j]] } }],
      })
    }
  }
  return out
}

export const hrCommonChild: HrSolution = {
  slug: 'common-child',
  plain: '兩個人各有一串字母卡，只能丟卡、不能交換順序；找出兩人都能留下的最長卡片序列。',
  statement: '輸入兩個等長大寫英文字串。各自可刪除任意字元，但剩下字元的相對順序不能改變。回傳兩者都能留下的最長相同序列長度。',
  examples: [
    { input: 's1 = "HARRY", s2 = "SALLY"', output: '2', note: '兩邊都能依序留下 AY。' },
    { input: 's1 = "SHINCHAN", s2 = "NOHARAAA"', output: '3', note: '例如 NHA 可依序從兩個字串取得。' },
  ],
  constraints: [
    '兩字串等長且可達數千字元 → 列舉 2ⁿ 個子序列不可行。',
    '只能刪除不能調換順序 → 單純比較字母計數會高估答案。',
    '狀態只取決於兩字串目前考慮到的前綴 → 適合二維 [[p:lcs]] 動態規劃。',
  ],
  insight: [
    '直覺上可枚舉第一個字串所有子序列，再確認第二個字串是否能依序找到它。',
    '大量候選會反覆詢問同一對前綴。把「兩個前綴的最佳長度」記下來，就不用重做。',
    '末尾字母相同時可讓兩邊一起延長一位；不同時至少捨棄其中一邊的末尾，取兩種較佳值。這與 [1143](#/q/1143) 同型。',
  ],
  approaches: [
    {
      name: '列舉子序列',
      idea: '選出第一字串的每種保留方案，檢查能否在第二字串依序找到。',
      steps: ['用位元遮罩代表第一字串哪些位置要留下。', '依原順序組出候選字串。', '用一個指標掃第二字串，檢查能否依序匹配。', '若能匹配，更新最長長度。'],
      figure: { title: 'HARRY 與 SALLY', steps: subsequenceFig() },
      complexity: { time: 'O(n·2ⁿ)', space: 'O(n)', why: '每個遮罩都需建立候選並掃第二字串；候選字串最多長 n。' },
      verdict: '只適合十幾個字元的小字串，用來理解「子序列」；原題最長 5000 字元，2⁵⁰⁰⁰ 種遮罩跑不完，位元遮罩也放不下，正式提交用下面的 DP。',
      code: {
        python: `def commonChild(s1, s2):
    best = 0
    n = len(s1)
    for mask in range(1 << n):
        word = ''.join(s1[i] for i in range(n) if mask & (1 << i))
        pos = 0
        for ch in s2:
            if pos < len(word) and ch == word[pos]:
                pos += 1  # 依順序配對候選字
        if pos == len(word):
            best = max(best, len(word))
    return best`,
        c: `int commonChild(char* s1, char* s2) {
    int n = strlen(s1), m = strlen(s2), best = 0;
    char* word = malloc(n + 1);
    for (long long mask = 0; mask < (1LL << n); mask++) {
        int len = 0;
        for (int i = 0; i < n; i++) if (mask & (1LL << i)) word[len++] = s1[i];
        int pos = 0;
        for (int j = 0; j < m; j++) if (pos < len && s2[j] == word[pos]) pos++;
        if (pos == len && len > best) best = len;
    }
    free(word);
    return best;
}`,
        cpp: `int commonChild(string s1, string s2) {
    int best = 0, n = s1.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        string word;
        for (int i = 0; i < n; i++) if (mask & (1 << i)) word += s1[i];
        int pos = 0;
        for (char ch : s2) if (pos < (int)word.size() && ch == word[pos]) pos++;
        if (pos == (int)word.size()) best = max(best, pos);
    }
    return best;
}`,
        java: `public static int commonChild(String s1, String s2) {
    int best = 0, n = s1.length();
    for (int mask = 0; mask < (1 << n); mask++) {
        StringBuilder word = new StringBuilder();
        for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) word.append(s1.charAt(i));
        int pos = 0;
        for (int j = 0; j < s2.length(); j++) {
            if (pos < word.length() && s2.charAt(j) == word.charAt(pos)) pos++;
        }
        if (pos == word.length()) best = Math.max(best, pos);
    }
    return best;
}`,
        javascript: `function commonChild(s1, s2) {
    let best = 0;
    for (let mask = 0; mask < 2 ** s1.length; mask++) {
        let word = '';
        for (let i = 0; i < s1.length; i++) {
            if (Math.floor(mask / 2 ** i) % 2) word += s1[i];
        }
        let pos = 0;
        for (const ch of s2) {
            if (pos < word.length && ch === word[pos]) pos++;
        }
        if (pos === word.length) best = Math.max(best, pos);
    }
    return best;
}`,
      },
    },
    {
      name: '最長共同子序列 DP',
      idea: '每個格子保存兩個前綴能形成的最長共同子序列長度。',
      steps: ['建立 (n+1)×(m+1) 的 0 表，空前綴答案是 0。', '逐一比較 s1[i-1] 與 s2[j-1]。', '相同填左上加一；不同填上方與左方的最大值。', '回傳右下角。'],
      figure: { title: 'HARRY 與 SALLY 的前綴表', steps: dpFig() },
      complexity: { time: 'O(nm)', space: 'O(m)', why: '每個前綴配對只計算一次；每一列只用到上一列，程式只留兩列（圖示畫整張表方便看）。' },
      verdict: '能處理正式限制；只求長度，所以程式把表格壓成兩列。',
      code: {
        python: `def commonChild(s1, s2):
    m = len(s2)
    previous = [0] * (m + 1)
    for left in s1:
        current = [0] * (m + 1)
        for j, right in enumerate(s2, 1):
            if left == right:
                current[j] = previous[j - 1] + 1  # 相同字延長共同序列
            else:
                current[j] = max(previous[j], current[j - 1])
        previous = current
    return previous[m]`,
        c: `int commonChild(char* s1, char* s2) {
    int m = strlen(s2);
    int* previous = calloc(m + 1, sizeof(int));
    int* current = calloc(m + 1, sizeof(int));
    for (int i = 0; s1[i]; i++) {
        current[0] = 0;
        for (int j = 1; j <= m; j++) {
            current[j] = s1[i] == s2[j - 1] ? previous[j - 1] + 1 : (previous[j] > current[j - 1] ? previous[j] : current[j - 1]);
        }
        int* temp = previous;
        previous = current;
        current = temp;
    }
    int answer = previous[m];
    free(previous);
    free(current);
    return answer;
}`,
        cpp: `int commonChild(string s1, string s2) {
    int m = s2.size();
    vector<int> previous(m + 1), current(m + 1);
    for (char left : s1) {
        current[0] = 0;
        for (int j = 1; j <= m; j++) {
            current[j] = left == s2[j - 1] ? previous[j - 1] + 1 : max(previous[j], current[j - 1]);
        }
        swap(previous, current);
    }
    return previous[m];
}`,
        java: `public static int commonChild(String s1, String s2) {
    int m = s2.length();
    int[] previous = new int[m + 1];
    for (int i = 0; i < s1.length(); i++) {
        int[] current = new int[m + 1];
        for (int j = 1; j <= m; j++) {
            if (s1.charAt(i) == s2.charAt(j - 1)) current[j] = previous[j - 1] + 1;
            else current[j] = Math.max(previous[j], current[j - 1]);
        }
        previous = current;
    }
    return previous[m];
}`,
        javascript: `function commonChild(s1, s2) {
    let previous = Array(s2.length + 1).fill(0);
    for (const left of s1) {
        const current = Array(s2.length + 1).fill(0);
        for (let j = 1; j <= s2.length; j++) {
            current[j] = left === s2[j - 1]
                ? previous[j - 1] + 1
                : Math.max(previous[j], current[j - 1]);
        }
        previous = current;
    }
    return previous[s2.length];
}`,
      },
    },
  ],
  pitfalls: [
    '共同子序列不要求連續，但必須維持各自的原有順序。',
    '僅計算共同字母數量會忽略順序。',
    'DP 表多留第 0 列與第 0 欄，避免處理負索引。',
  ],
  check: {
    kind: 'fn', fn: 'commonChild',
    cases: [
      { args: ['HARRY', 'SALLY'], out: 2 },
      { args: ['SHINCHAN', 'NOHARAAA'], out: 3 },
      { args: ['AA', 'BB'], out: 0 },
      { args: ['A', 'A'], out: 1 },
      { args: ['ABC', 'ABC'], out: 3 },
      { args: ['ABC', 'CBA'], out: 1 },
    ],
  },
}
