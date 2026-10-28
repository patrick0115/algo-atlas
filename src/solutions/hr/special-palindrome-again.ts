import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const s = 'asasd', out: FigStep[] = []
  let answer = 0
  for (let left = 0; left < s.length; left++) {
    for (let right = left; right < s.length; right++) {
      const mid = Math.floor((left + right) / 2)
      const same = [...s.slice(left, right + 1)].every(ch => ch === s[left])
      const special = (right - left) % 2 === 0 && s[mid] !== s[left] && [...s.slice(left, right + 1)].every((ch, k) => left + k === mid || ch === s[left])
      if (same || special) answer++
      out.push({ note: `檢查 [${left}, ${right}] 的 ${s.slice(left, right + 1)}：${same ? '全相同' : special ? '只有中央不同' : '不合格'}，目前共 ${answer} 段。`, views: [arr(s.split(''), { label: '原字串', highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k) }), arr([answer], { label: '累計特殊子字串' })] })
    }
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'asasd', runs: { ch: string; len: number }[] = [], out: FigStep[] = []
  let answer = 0
  for (let i = 0; i < s.length; i++) {
    if (runs.length && runs[runs.length - 1].ch === s[i]) runs[runs.length - 1].len++
    else runs.push({ ch: s[i], len: 1 })
    answer = runs.reduce((sum, r) => sum + r.len * (r.len + 1) / 2, 0)
    for (let j = 1; j + 1 < runs.length; j++) if (runs[j].len === 1 && runs[j - 1].ch === runs[j + 1].ch) answer += Math.min(runs[j - 1].len, runs[j + 1].len)
    out.push({ note: `讀入 ${s[i]}；段為 ${runs.map(r => `${r.ch}×${r.len}`).join('、')}。同字段加中央異字段，前綴合計 ${answer}。`, views: [arr(s.split(''), { label: '原字串', highlight: [i] }), arr(runs.map(r => `${r.ch}:${r.len}`), { label: '連續同字段' }), arr([answer], { label: '前綴答案' })] })
  }
  return out
}

export const hrSpecialPalindromeAgain: HrSolution = {
  slug: "special-palindrome-again",
  plain: "像數一串珠子裡的特殊連續片段：整段同色，或只有正中間一顆不同，都算一段。",
  statement: "給長度 n 的小寫字串，統計特殊回文子字串數量：一種是所有字元相同；另一種長度為奇數，只有中央字元不同，其餘都相同。單字元也算。",
  examples: [
    { input: "n = 5, s = \"asasd\"", output: "7", note: "五個單字元，再加 asa 與 sas。" },
    { input: "n = 4, s = \"aaaa\"", output: "10", note: "所有連續子字串都由 a 組成，共 4+3+2+1 段。" },
  ],
  constraints: [
    "n 可達 10^6 → 需要線性分段計數，答案使用 64 位整數。",
    "只計連續子字串 → 可按連續同字元段計算，不可任選兩側字元。",
  ],
  insight: [
    "先按定義枚舉小字串容易驗證，但重複掃描很多。",
    "觀察連續同字元的一段，長度 L 會貢獻 L(L+1)/2 個全相同子字串。",
    "若中間是一個獨立字元、兩側是相同字元段，會額外貢獻兩側段長較小者；因此將字串分段後可線性計數。",
  ],
  approaches: [
    {
      name: "枚舉並檢查每段",
      idea: "選出所有連續子字串，逐段確認是否符合兩種形狀。",
      steps: ["對每個起點與終點取出一段。","先檢查所有字元是否相同。","若不是，確認長度為奇數，且除正中央外都等於第一個字元、中央不同。","成立就把答案加一。"],
      figure: { title: "s = \"asasd\"", steps: firstFig() },
      complexity: {
        time: "O(n³)",
        space: "O(1)",
        why: "有 O(n²) 段，每段最壞再檢查 O(n) 個字元。",
      },
      verdict: "適合用來理解定義與檢查小測資；大輸入必須改用分段。",
      code: {
        python: `def substrCount(n, s):
    answer = 0
    for left in range(n):
        for right in range(left, n):
            middle = (left + right) // 2
            same = all(s[i] == s[left] for i in range(left, right + 1))
            special = (right - left) % 2 == 0 and s[middle] != s[left]
            if special:
                special = all(i == middle or s[i] == s[left] for i in range(left, right + 1))
            if same or special:  # 兩種合法形狀擇一
                answer += 1
    return answer`,
        c: `long long substrCount(int n, char* s) {
    long long answer = 0;
    for (int left = 0; left < n; left++) {
        for (int right = left; right < n; right++) {
            int middle = (left + right) / 2;
            int same = 1, special = (right - left) % 2 == 0 && s[middle] != s[left];
            for (int i = left; i <= right; i++) {
                if (s[i] != s[left]) same = 0;
                if (i != middle && s[i] != s[left]) special = 0;
            }
            if (same || special) answer++;
        }
    }
    return answer;
}`,
        cpp: `long long substrCount(int n, string s) {
    long long answer = 0;
    for (int left = 0; left < n; left++) {
        for (int right = left; right < n; right++) {
            int middle = (left + right) / 2;
            bool same = true;
            bool special = (right - left) % 2 == 0 && s[middle] != s[left];
            for (int i = left; i <= right; i++) {
                if (s[i] != s[left]) same = false;
                if (i != middle && s[i] != s[left]) special = false;
            }
            if (same || special) answer++;
        }
    }
    return answer;
}`,
        java: `public static long substrCount(int n, String s) {
    long answer = 0;
    for (int left = 0; left < n; left++) {
        for (int right = left; right < n; right++) {
            int middle = (left + right) / 2;
            boolean same = true;
            boolean special = (right - left) % 2 == 0 && s.charAt(middle) != s.charAt(left);
            for (int i = left; i <= right; i++) {
                if (s.charAt(i) != s.charAt(left)) same = false;
                if (i != middle && s.charAt(i) != s.charAt(left)) special = false;
            }
            if (same || special) answer++;
        }
    }
    return answer;
}`,
        javascript: `function substrCount(n, s) {
  let answer = 0;
  for (let left = 0; left < n; left++) {
    for (let right = left; right < n; right++) {
      const middle = Math.floor((left + right) / 2);
      let same = true;
      let special = (right - left) % 2 === 0 && s[middle] !== s[left];
      for (let i = left; i <= right; i++) {
        if (s[i] !== s[left]) same = false;
        if (i !== middle && s[i] !== s[left]) special = false;
      }
      if (same || special) answer++;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: "同字元分段計數",
      idea: "各同字元段先算全相同子字串，再檢查長度為一的中央段。",
      steps: ["從左到右把連續相同字元壓成 (字元, 長度) 段。","每段長 L，加入 L(L+1)/2。","對每個非頭尾且長度為 1 的段，檢查左右段字元是否相同。","若相同，再加入左右段長的較小值。"],
      figure: { title: "s = \"asasd\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        why: "分段掃一次，檢查各段一次；最壞交錯字串有 n 段。",
      },
      verdict: "大輸入可用；C、C++、Java 使用 64 位整數累加，避免全相同長字串溢位。",
      code: {
        python: `def substrCount(n, s):
    runs = []
    for ch in s:
        if runs and runs[-1][0] == ch:
            runs[-1][1] += 1
        else:
            runs.append([ch, 1])
    answer = sum(length * (length + 1) // 2 for _, length in runs)
    for i in range(1, len(runs) - 1):
        if runs[i][1] == 1 and runs[i - 1][0] == runs[i + 1][0]:
            answer += min(runs[i - 1][1], runs[i + 1][1])  # 兩側可成對延伸
    return answer`,
        c: `long long substrCount(int n, char* s) {
    char* letter = malloc(n);
    int* length = malloc(sizeof(int) * n);
    int groups = 0;
    for (int i = 0; i < n; i++) {
        if (groups && letter[groups - 1] == s[i]) {
            length[groups - 1]++;
        } else {
            letter[groups] = s[i];
            length[groups++] = 1;
        }
    }
    long long answer = 0;
    for (int i = 0; i < groups; i++) {
        answer += (long long)length[i] * (length[i] + 1) / 2;
    }
    for (int i = 1; i + 1 < groups; i++) {
        if (length[i] == 1 && letter[i - 1] == letter[i + 1]) {
            answer += length[i - 1] < length[i + 1] ? length[i - 1] : length[i + 1];
        }
    }
    free(letter);
    free(length);
    return answer;
}`,
        cpp: `long long substrCount(int n, string s) {
    vector<pair<char, int>> runs;
    for (char ch : s) {
        if (!runs.empty() && runs.back().first == ch) {
            runs.back().second++;
        } else {
            runs.push_back({ch, 1});
        }
    }
    long long answer = 0;
    for (auto run : runs) {
        answer += 1LL * run.second * (run.second + 1) / 2;
    }
    for (int i = 1; i + 1 < (int)runs.size(); i++) {
        if (runs[i].second == 1 && runs[i - 1].first == runs[i + 1].first) {
            answer += min(runs[i - 1].second, runs[i + 1].second);
        }
    }
    return answer;
}`,
        java: `public static long substrCount(int n, String s) {
    List<Character> letters = new ArrayList<>();
    List<Integer> lengths = new ArrayList<>();
    for (char ch : s.toCharArray()) {
        int last = letters.size() - 1;
        if (last >= 0 && letters.get(last) == ch) {
            lengths.set(last, lengths.get(last) + 1);
        } else {
            letters.add(ch);
            lengths.add(1);
        }
    }
    long answer = 0;
    for (int length : lengths) {
        answer += (long)length * (length + 1) / 2;
    }
    for (int i = 1; i + 1 < letters.size(); i++) {
        if (lengths.get(i) == 1 && letters.get(i - 1) == letters.get(i + 1)) {
            answer += Math.min(lengths.get(i - 1), lengths.get(i + 1));
        }
    }
    return answer;
}`,
        javascript: `function substrCount(n, s) {
  const runs = [];
  for (const ch of s) {
    if (runs.length && runs[runs.length - 1][0] === ch) {
      runs[runs.length - 1][1]++;
    } else {
      runs.push([ch, 1]);
    }
  }
  let answer = 0;
  for (const [, length] of runs) {
    answer += length * (length + 1) / 2;
  }
  for (let i = 1; i + 1 < runs.length; i++) {
    if (runs[i][1] === 1 && runs[i - 1][0] === runs[i + 1][0]) {
      answer += Math.min(runs[i - 1][1], runs[i + 1][1]);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    "不是所有回文都算特殊，例如 abccba 的外側字母不全相同。",
    "中央不同型態的中央段必須恰好一個字元。",
    "全相同段的計數可能超過 32 位整數。",
    "中央不同字元必須單獨成段；中央段長於一便不符合第二種形狀。",
  ],
  check: {
    kind: 'fn',
    fn: "substrCount",
    cases: [
      { args: [5, "asasd"], out: 7 },
      { args: [4, "aaaa"], out: 10 },
      { args: [1, "a"], out: 1 },
      { args: [3, "aba"], out: 4 },
      { args: [4, "abcd"], out: 4 },
      { args: [3, "aaa"], out: 6 },
    ],
  },
}
