import { arr } from '../../engine/helpers'
import { count26 } from '../fig'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  const a = 'cde', b = 'abc'
  const out: FigStep[] = []
  for (let i = 0; i <= a.length; i++) {
    const left = new Array(26).fill(0), right = new Array(26).fill(0)
    for (let j = 0; j < i; j++) {
      left[a.charCodeAt(j) - 97]++
      right[b.charCodeAt(j) - 97]++
    }
    const common = left.reduce((sum, x, k) => sum + Math.min(x, right[k]), 0)
    out.push({ note: `已比較前 ${i} 個位置：可配對 ${common} 個；兩邊目前共有 ${2 * i} 個字元，未配對 ${2 * i - 2 * common} 個。`, views: [arr(a.split(''), { label: 'a', highlight: i ? [i - 1] : [] }), arr(b.split(''), { label: 'b', highlight: i ? [i - 1] : [] }), count26(left, 'a 的次數'), count26(right, 'b 的次數')] })
  }
  return out
}

function secondFig(): FigStep[] {
  const a = 'cde', b = 'abc', diff = new Array(26).fill(0)
  const out: FigStep[] = []
  for (let i = 0; i < a.length + b.length; i++) {
    const ch = i < a.length ? a[i] : b[i - a.length]
    const delta = i < a.length ? 1 : -1
    diff[ch.charCodeAt(0) - 97] += delta
    const need = diff.reduce((sum, x) => sum + Math.abs(x), 0)
    out.push({ note: `讀到 ${i < a.length ? 'a' : 'b'} 的 ${ch}，差額 ${delta > 0 ? '加一' : '減一'}；目前差值絕對值總和 ${need}。`, views: [arr((a + b).split(''), { label: '先 a 後 b', highlight: [i] }), count26(diff, 'a 次數減 b 次數', [ch.charCodeAt(0) - 97])] })
  }
  return out
}

export const hrCtciMakingAnagrams: HrSolution = {
  slug: "ctci-making-anagrams",
  plain: "像兩盒字母積木要拼成同一個詞；兩邊各留下能配對的積木，把其餘的拿走。",
  statement: "給兩個只含小寫英文字母的字串，可以從任一字串刪字。求讓兩邊成為字母組成完全相同的最少刪除數。",
  examples: [
    { input: "a = \"cde\", b = \"abc\"", output: "4", note: "兩邊只共用一個 c。" },
    { input: "a = \"showman\", b = \"woman\"", output: "2", note: "刪 s 與 h。" },
  ],
  constraints: [
    "字串長度可達 10^4 → 不能為每個字元反覆重掃另一字串；一次計數即可。",
    "字母只有 26 種 → 可用固定長度陣列，額外空間為 O(1)。",
  ],
  insight: [
    "重排不改變每種字母的數量，所以只需比較頻率。",
    "字母 x 若在兩邊分別出現 u、v 次，至少得刪掉 |u−v| 個。",
    "把 26 種差距加總即可；這與 [242](#/q/242) 的字母計數概念相同，也是 [[p:hash-map]]。",
  ],
  approaches: [
    {
      name: "分別計數後比較",
      idea: "各建一張 26 格字母表，最後把各格差距加起來。",
      steps: ["建立 countA 與 countB，全部設為 0。","掃描 a，對應字母格加一。","掃描 b，在另一張表加一。","逐格累加兩張表的絕對差。"],
      figure: { title: "a = \"cde\", b = \"abc\"", steps: firstFig() },
      complexity: {
        time: "O(|a|+|b|+26)",
        space: "O(1)",
        why: "兩字串各掃一次，再比較固定 26 格；兩張表大小固定。",
      },
      verdict: "兩邊頻率清楚可見，適合初學者檢查每種字母的差距。",
      code: {
        python: `def makeAnagram(a, b):
    left = [0] * 26
    right = [0] * 26
    for ch in a:
        left[ord(ch) - ord('a')] += 1
    for ch in b:
        right[ord(ch) - ord('a')] += 1
    return sum(abs(left[i] - right[i]) for i in range(26))  # 各字母多出的都要刪`,
        c: `int makeAnagram(char* a, char* b) {
    int left[26] = {0};
    int right[26] = {0};
    for (int i = 0; a[i] != '\\0'; i++) {
        left[a[i] - 'a']++;
    }
    for (int i = 0; b[i] != '\\0'; i++) {
        right[b[i] - 'a']++;
    }
    int answer = 0;
    for (int i = 0; i < 26; i++) {
        answer += abs(left[i] - right[i]);
    }
    return answer;
}`,
        cpp: `int makeAnagram(string a, string b) {
    vector<int> left(26), right(26);
    for (char ch : a) {
        left[ch - 'a']++;
    }
    for (char ch : b) {
        right[ch - 'a']++;
    }
    int answer = 0;
    for (int i = 0; i < 26; i++) {
        answer += abs(left[i] - right[i]);
    }
    return answer;
}`,
        java: `public static int makeAnagram(String a, String b) {
    int[] left = new int[26];
    int[] right = new int[26];
    for (char ch : a.toCharArray()) {
        left[ch - 'a']++;
    }
    for (char ch : b.toCharArray()) {
        right[ch - 'a']++;
    }
    int answer = 0;
    for (int i = 0; i < 26; i++) {
        answer += Math.abs(left[i] - right[i]);
    }
    return answer;
}`,
        javascript: `function makeAnagram(a, b) {
  const left = new Array(26).fill(0);
  const right = new Array(26).fill(0);
  for (const ch of a) {
    left[ch.charCodeAt(0) - 97]++;
  }
  for (const ch of b) {
    right[ch.charCodeAt(0) - 97]++;
  }
  let answer = 0;
  for (let i = 0; i < 26; i++) {
    answer += Math.abs(left[i] - right[i]);
  }
  return answer;
}`,
      },
    },
    {
      name: "一張差值表",
      idea: "掃 a 時加一、掃 b 時減一，最後加總各格的絕對值。",
      steps: ["建立 26 格 balance，全部為 0。","a 的每個字母讓對應格加一。","b 的每個字母讓對應格減一。","各格取絕對值後加總。"],
      figure: { title: "a = \"cde\", b = \"abc\"", steps: secondFig() },
      complexity: {
        time: "O(|a|+|b|+26)",
        space: "O(1)",
        why: "只掃兩字串與固定 26 格，且僅用一張定長表。",
      },
      verdict: "同樣線性時間，少一張表；加減抵銷直接表達共同字母無須刪除。",
      code: {
        python: `def makeAnagram(a, b):
    balance = [0] * 26
    for ch in a:
        balance[ord(ch) - ord('a')] += 1
    for ch in b:
        balance[ord(ch) - ord('a')] -= 1  # 共同字母會抵銷
    return sum(abs(value) for value in balance)`,
        c: `int makeAnagram(char* a, char* b) {
    int balance[26] = {0};
    for (int i = 0; a[i] != '\\0'; i++) {
        balance[a[i] - 'a']++;
    }
    for (int i = 0; b[i] != '\\0'; i++) {
        balance[b[i] - 'a']--;
    }
    int answer = 0;
    for (int i = 0; i < 26; i++) {
        answer += abs(balance[i]);
    }
    return answer;
}`,
        cpp: `int makeAnagram(string a, string b) {
    vector<int> balance(26);
    for (char ch : a) {
        balance[ch - 'a']++;
    }
    for (char ch : b) {
        balance[ch - 'a']--;
    }
    int answer = 0;
    for (int value : balance) {
        answer += abs(value);
    }
    return answer;
}`,
        java: `public static int makeAnagram(String a, String b) {
    int[] balance = new int[26];
    for (char ch : a.toCharArray()) {
        balance[ch - 'a']++;
    }
    for (char ch : b.toCharArray()) {
        balance[ch - 'a']--;
    }
    int answer = 0;
    for (int value : balance) {
        answer += Math.abs(value);
    }
    return answer;
}`,
        javascript: `function makeAnagram(a, b) {
  const balance = new Array(26).fill(0);
  for (const ch of a) {
    balance[ch.charCodeAt(0) - 97]++;
  }
  for (const ch of b) {
    balance[ch.charCodeAt(0) - 97]--;
  }
  return balance.reduce((sum, value) => sum + Math.abs(value), 0);
}`,
      },
    },
  ],
  pitfalls: [
    "不能只比較字母種類，重複次數也要相等。",
    "兩字串都可能有多餘字母，差值必須取絕對值。",
    "同一字母兩邊都出現時，先配對較少的次數，剩餘的才需要刪。",
  ],
  check: {
    kind: 'fn',
    fn: "makeAnagram",
    cases: [
      { args: ["cde", "abc"], out: 4 },
      { args: ["showman", "woman"], out: 2 },
      { args: ["a", "a"], out: 0 },
      { args: ["a", "b"], out: 2 },
      { args: ["abc", "abc"], out: 0 },
      { args: ["aaab", "abbb"], out: 4 },
    ],
  },
}
