import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'saveChanges', starts = [0], out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && s[i] >= 'A' && s[i] <= 'Z') starts.push(i)
    out.push({ note: `讀到索引 ${i} 的 ${s[i]}；${i === 0 ? '第一個單字從 0 開始' : s[i] >= 'A' && s[i] <= 'Z' ? '大寫字母開啟新單字' : '仍屬於目前單字'}，起點為 ${starts.join('、')}，共 ${starts.length} 字。`, views: [arr(s.split(''), { label: '駝峰字串', highlight: [i] }), arr([...starts], { label: '已記錄的單字起點' })] })
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'saveChanges', out: FigStep[] = []
  let count = 1
  for (let i = 0; i < s.length; i++) {
    const upper = s[i] >= 'A' && s[i] <= 'Z'
    if (upper) count++
    out.push({ note: `目前是 ${s[i]}；${upper ? '大寫，因此字數加一' : '小寫，因此字數不變'}，count = ${count}。`, views: [arr(s.split(''), { label: '駝峰字串', highlight: [i] }), arr([count], { label: '目前字數' })] })
  }
  return out
}

export const hrCamelcase: HrSolution = {
  slug: "camelcase",
  plain: "像沒有空格的英文便條，每個大寫字母都是下一個單字的路標；數路標再加上第一個單字。",
  statement: "輸入為駝峰式英文，第一個單字全小寫，後續單字首字母大寫。求共有幾個單字。",
  examples: [
    { input: "s = \"saveChangesInTheEditor\"", output: "5", note: "save、Changes、In、The、Editor。" },
    { input: "s = \"one\"", output: "1", note: "沒有大寫字母，所以只有第一個單字。" },
    { input: "s = \"aB\"", output: "2", note: "B 開啟第二個單字，最短的兩字輸入也遵守同一規則。" },
  ],
  constraints: [
    "字串非空，最長可達 10^5 → 逐字掃描可在時限內完成。",
    "第一個單字一定存在 → 計數器從 1 開始，不需尋找首字母。",
  ],
  insight: [
    "先確定第一個小寫字元已代表一個單字。",
    "每個後續大寫字母恰好開啟一個新單字，因此只需數大寫字母。",
    "也可以先切成字元陣列再過濾，最後改成單次掃描以節省中間陣列。",
  ],
  approaches: [
    {
      name: "收集單字起點",
      idea: "把索引 0 和所有大寫字母的索引收集起來，起點數就是單字數。",
      steps: [
        "建立 starts，先放入 0，表示第一個單字的起點。",
        "從索引 1 起逐字檢查是否為 A 到 Z。",
        "遇到大寫字母就記下其索引；小寫字母不新增起點。",
        "回傳 starts 的長度；起點數就是單字數。",
      ],
      figure: { title: "s = \"saveChanges\"", steps: firstFig() },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        why: "逐字檢查一次，最壞情況需記下每個字元的索引。",
      },
      verdict: "起點可拿來真的切出單字，但若只要個數，陣列有些多餘。",
      code: {
        python: `def camelcase(s):
    starts = [0]
    for i in range(1, len(s)):
        if s[i].isupper():  # 大寫字母就是新單字起點
            starts.append(i)
    return len(starts)`,
        c: `int camelcase(char* s) {
    int n = strlen(s);
    int *starts = malloc(sizeof(int) * n);
    int count = 1;
    starts[0] = 0;
    for (int i = 1; i < n; i++) {
        if (s[i] >= 'A' && s[i] <= 'Z') {
            starts[count++] = i;
        }
    }
    free(starts);
    return count;
}`,
        cpp: `int camelcase(string s) {
    vector<int> starts = {0};
    for (int i = 1; i < (int)s.size(); i++) {
        if (s[i] >= 'A' && s[i] <= 'Z') {
            starts.push_back(i);
        }
    }
    return starts.size();
}`,
        java: `public static int camelcase(String s) {
    List<Integer> starts = new ArrayList<>();
    starts.add(0);
    for (int i = 1; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (ch >= 'A' && ch <= 'Z') {
            starts.add(i);
        }
    }
    return starts.size();
}`,
        javascript: `function camelcase(s) {
  const starts = [0];
  for (let i = 1; i < s.length; i++) {
    if (s[i] >= 'A' && s[i] <= 'Z') {
      starts.push(i);
    }
  }
  return starts.length;
}`,
      },
    },
    {
      name: "只計數大寫字母",
      idea: "第一個單字先算一個；每看到一個大寫字母就再加一。",
      steps: [
        "令 count = 1，先計入第一個單字。",
        "從左到右掃描整個字串，並讀取目前字元。",
        "若目前字元在 A 到 Z 之間，count 加一。",
        "小寫字母不改變計數；掃完回傳 count。",
      ],
      figure: { title: "s = \"saveChanges\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        why: "只走訪一次字串，額外只用一個整數。",
      },
      verdict: "只需個數時最精簡，無須存放每個起點。",
      code: {
        python: `def camelcase(s):
    count = 1
    for ch in s:
        if 'A' <= ch <= 'Z':  # 大寫代表新單字
            count += 1
    return count`,
        c: `int camelcase(char* s) {
    int count = 1;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] >= 'A' && s[i] <= 'Z') {
            count++;
        }
    }
    return count;
}`,
        cpp: `int camelcase(string s) {
    int count = 1;
    for (char ch : s) {
        if (ch >= 'A' && ch <= 'Z') {
            count++;
        }
    }
    return count;
}`,
        java: `public static int camelcase(String s) {
    int count = 1;
    for (char ch : s.toCharArray()) {
        if (ch >= 'A' && ch <= 'Z') {
            count++;
        }
    }
    return count;
}`,
        javascript: `function camelcase(s) {
  let count = 1;
  for (const ch of s) {
    if (ch >= 'A' && ch <= 'Z') {
      count++;
    }
  }
  return count;
}`,
      },
    },
  ],
  pitfalls: [
    "不要把首字母重算一次；題目保證它是小寫。",
    "連續的大寫字母在此輸入規則下各算新單字。",
    "只數大寫首字母；不要把每個小寫字元也當成新單字。",
  ],
  followUp: [
    {
      q: '若要切出各個單字，而不只回傳個數呢？',
      a: '沿用第一種解法記下的起點，逐段用相鄰起點當作切片邊界；最後一段以字串長度為右界。',
    },
    {
      q: '若輸入可能是空字串呢？',
      a: '先檢查長度是否為零；空字串回傳 0，否則再從 1 開始計數。',
    },
  ],
  check: {
    kind: 'fn',
    fn: "camelcase",
    cases: [
      { args: ["saveChangesInTheEditor"], out: 5 },
      { args: ["one"], out: 1 },
      { args: ["iPhone"], out: 2 },
      { args: ["aB"], out: 2 },
      { args: ["abc"], out: 1 },
      { args: ["aBcDe"], out: 3 },
    ],
  },
}
