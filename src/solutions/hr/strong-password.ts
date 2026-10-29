import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'Ab1', groups = ['digit', 'lower', 'upper', 'special'], found = [false, false, false, false], out: FigStep[] = []
  for (let i = 0; i <= groups.length; i++) {
    if (i < groups.length) {
      for (const ch of s) {
        if (i === 0 && ch >= '0' && ch <= '9' || i === 1 && ch >= 'a' && ch <= 'z' || i === 2 && ch >= 'A' && ch <= 'Z' || i === 3 && '!@#$%^&*()-+'.includes(ch)) found[i] = true
      }
    }
    const missing = found.filter((x, j) => j <= i && !x).length + Math.max(0, 3 - i)
    out.push({ note: `已檢查 ${Math.min(i + 1, 4)} 類；目前已知缺 ${found.filter((x, j) => j <= i && !x).length} 類。全部檢查後再與長度不足 ${Math.max(0, 6 - s.length)} 比較。`, views: [arr(s.split(''), { label: '密碼' }), arr(found.map(x => x ? 1 : 0), { label: '數字、小寫、大寫、特殊字元是否找到', highlight: i < 4 ? [i] : [] }), arr([missing], { label: '目前估計缺少類別' })] })
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'Ab1', found = [false, false, false, false], out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const kind = ch >= '0' && ch <= '9' ? 0 : ch >= 'a' && ch <= 'z' ? 1 : ch >= 'A' && ch <= 'Z' ? 2 : 3
    found[kind] = true
    const missing = found.filter(x => !x).length
    out.push({ note: `讀到 ${ch}，標記第 ${kind + 1} 類；目前缺 ${missing} 類，字串長度仍不足 ${6 - s.length}，最終至少補 ${Math.max(missing, 6 - s.length)} 字。`, views: [arr(s.split(''), { label: '密碼', highlight: [i] }), arr(found.map(x => x ? 1 : 0), { label: '四類是否找到', highlight: [kind] }), arr([missing, Math.max(0, 6 - s.length)], { label: '缺類數、缺長度' })] })
  }
  out.push({ note: `掃描完畢，缺 1 類、長度差 3，因此補 3 字即可同時滿足兩條件。`, views: [arr(found.map(x => x ? 1 : 0), { label: '四類是否找到' }), arr([1, 3, 3], { label: '缺類、缺長、答案' })] })
  return out
}

export const hrStrongPassword: HrSolution = {
  slug: "strong-password",
  plain: "像替密碼蓋四種印章，再量長度是否至少六格；新增一個字元可同時補章和補長度。",
  statement: "給目前的密碼，求至少新增多少字元，才能同時有數字、小寫字母、大寫字母、指定特殊符號，且總長度不少於 6。",
  examples: [
    { input: "n = 3, password = \"Ab1\"", output: "3", note: "還缺特殊符號，但長度也少三個。" },
    { input: "n = 11, password = \"#HackerRank\"", output: "1", note: "只缺數字。" },
  ],
  constraints: [
    "原密碼至少有一字 → 逐字判別四類即可；新增字元可同時補類別與長度。",
    "特殊符號只限 !@#$%^&*()-+ → 判斷時不能把任意標點都算進去。",
  ],
  insight: [
    "先列出四種必要類別，計算還缺幾類。",
    "另一條獨立限制是長度至少 6，至少要補 6−n 個。",
    "每新增一個字元能同時改善兩條限制，因此答案是兩個缺口的最大值。",
  ],
  approaches: [
    {
      name: "分類後逐項檢查",
      idea: "將出現過的四種類別記在集合中，再計算缺少種類。",
      steps: ["逐字判斷所屬類別並加入集合。","用 4 減去集合大小，得到缺少的類別數。","算出長度缺口 max(0, 6−n)。","回傳兩個缺口中的較大值。"],
      figure: { title: "password = \"Ab1\"", steps: firstFig() },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        why: "逐字分類一次；集合最多只有四種標記。",
      },
      verdict: "分類概念清楚，適合日後增減密碼規則。",
      code: {
        python: `def minimumNumber(n, password):
    kinds = set()
    for ch in password:
        if ch.isdigit():
            kinds.add('digit')
        elif ch.islower():
            kinds.add('lower')
        elif ch.isupper():
            kinds.add('upper')
        elif ch in '!@#$%^&*()-+':
            kinds.add('special')
    return max(4 - len(kinds), 6 - n)  # 新字可同時補種類與長度`,
        c: `int minimumNumber(int n, char* password) {
    int seen[4] = {0};
    for (int i = 0; i < n; i++) {
        char ch = password[i];
        if (ch >= '0' && ch <= '9') seen[0] = 1;
        else if (ch >= 'a' && ch <= 'z') seen[1] = 1;
        else if (ch >= 'A' && ch <= 'Z') seen[2] = 1;
        else if (strchr("!@#$%^&*()-+", ch)) seen[3] = 1;
    }
    int missing = 4 - seen[0] - seen[1] - seen[2] - seen[3];
    return missing > 6 - n ? missing : 6 - n;
}`,
        cpp: `int minimumNumber(int n, string password) {
    set<int> kinds;
    for (char ch : password) {
        if (isdigit(ch)) kinds.insert(0);
        else if (islower(ch)) kinds.insert(1);
        else if (isupper(ch)) kinds.insert(2);
        else if (string("!@#$%^&*()-+").find(ch) != string::npos) kinds.insert(3);
    }
    return max(4 - (int)kinds.size(), 6 - n);
}`,
        java: `public static int minimumNumber(int n, String password) {
    Set<Integer> kinds = new HashSet<>();
    for (char ch : password.toCharArray()) {
        if (ch >= '0' && ch <= '9') kinds.add(0);
        else if (ch >= 'a' && ch <= 'z') kinds.add(1);
        else if (ch >= 'A' && ch <= 'Z') kinds.add(2);
        else if ("!@#$%^&*()-+".indexOf(ch) >= 0) kinds.add(3);
    }
    return Math.max(4 - kinds.size(), 6 - n);
}`,
        javascript: `function minimumNumber(n, password) {
  const kinds = new Set();
  for (const ch of password) {
    if (ch >= '0' && ch <= '9') kinds.add('digit');
    else if (ch >= 'a' && ch <= 'z') kinds.add('lower');
    else if (ch >= 'A' && ch <= 'Z') kinds.add('upper');
    else if ('!@#$%^&*()-+'.includes(ch)) kinds.add('special');
  }
  return Math.max(4 - kinds.size, 6 - n);
}`,
      },
    },
    {
      name: "四個布林旗標",
      idea: "用四個固定旗標掃過密碼，再取種類與長度缺口的最大值。",
      steps: ["設 digit、lower、upper、special 都為 false。","逐字把對應的旗標改為 true。","將 false 旗標個數相加，得到 missing。","答案為 max(missing, 6−n)。"],
      figure: { title: "password = \"Ab1\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        why: "每字只分類一次，額外使用固定四個旗標。",
      },
      verdict: "沒有集合配置，所需狀態完全固定。",
      code: {
        python: `def minimumNumber(n, password):
    digit = lower = upper = special = False
    for ch in password:
        digit |= '0' <= ch <= '9'
        lower |= 'a' <= ch <= 'z'
        upper |= 'A' <= ch <= 'Z'
        special |= ch in '!@#$%^&*()-+'
    missing = 4 - sum((digit, lower, upper, special))  # 尚缺的種類數
    return max(missing, 6 - n)`,
        c: `int minimumNumber(int n, char* password) {
    int digit = 0, lower = 0, upper = 0, special = 0;
    for (int i = 0; i < n; i++) {
        char ch = password[i];
        if (ch >= '0' && ch <= '9') digit = 1;
        if (ch >= 'a' && ch <= 'z') lower = 1;
        if (ch >= 'A' && ch <= 'Z') upper = 1;
        if (strchr("!@#$%^&*()-+", ch)) special = 1;
    }
    int missing = 4 - digit - lower - upper - special;
    return missing > 6 - n ? missing : 6 - n;
}`,
        cpp: `int minimumNumber(int n, string password) {
    bool digit = false, lower = false, upper = false, special = false;
    for (char ch : password) {
        digit |= ch >= '0' && ch <= '9';
        lower |= ch >= 'a' && ch <= 'z';
        upper |= ch >= 'A' && ch <= 'Z';
        special |= string("!@#$%^&*()-+").find(ch) != string::npos;
    }
    int missing = 4 - digit - lower - upper - special;
    return max(missing, 6 - n);
}`,
        java: `public static int minimumNumber(int n, String password) {
    boolean digit = false, lower = false, upper = false, special = false;
    for (char ch : password.toCharArray()) {
        digit |= ch >= '0' && ch <= '9';
        lower |= ch >= 'a' && ch <= 'z';
        upper |= ch >= 'A' && ch <= 'Z';
        special |= "!@#$%^&*()-+".indexOf(ch) >= 0;
    }
    int missing = 4 - (digit ? 1 : 0) - (lower ? 1 : 0)
        - (upper ? 1 : 0) - (special ? 1 : 0);
    return Math.max(missing, 6 - n);
}`,
        javascript: `function minimumNumber(n, password) {
  let digit = false, lower = false, upper = false, special = false;
  for (const ch of password) {
    digit ||= ch >= '0' && ch <= '9';
    lower ||= ch >= 'a' && ch <= 'z';
    upper ||= ch >= 'A' && ch <= 'Z';
    special ||= '!@#$%^&*()-+'.includes(ch);
  }
  const missing = 4 - Number(digit) - Number(lower) - Number(upper) - Number(special);
  return Math.max(missing, 6 - n);
}`,
      },
    },
  ],
  pitfalls: [
    "不要把「缺的類別數」與「缺的長度」直接相加；同一新字能同時滿足兩者。",
    "特殊符號只能用指定的集合判斷。",
  ],
  check: {
    kind: 'fn',
    fn: "minimumNumber",
    cases: [
      { args: [3, "Ab1"], out: 3 },
      { args: [11, "#HackerRank"], out: 1 },
      { args: [6, "Ab1!xy"], out: 0 },
      { args: [1, "a"], out: 5 },
      { args: [5, "A1!ab"], out: 1 },
      { args: [6, "abcdef"], out: 3 },
    ],
  },
}
