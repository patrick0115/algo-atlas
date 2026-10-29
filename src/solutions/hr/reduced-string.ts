import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function firstFig(): FigStep[] {
  let s = 'baab'
  const out: FigStep[] = [{ note: '起初是 baab，先找相鄰且相同的字元對；這時尚未刪除任何字。', views: [arr(s.split(''), { label: '待縮減字串' }), arr([], { label: '已消除字元' })] }]
  for (let round = 0; round < 4; round++) {
    let next = '', removed = false
    for (let i = 0; i < s.length; i++) {
      if (i + 1 < s.length && s[i] === s[i + 1]) { i++; removed = true }
      else next += s[i]
    }
    out.push({ note: `第 ${round + 1} 輪檢查 ${s || '空字串'}：${removed ? `刪掉相鄰對，剩下 ${next || '空字串'}` : '沒有相鄰對，可結束'}。`, views: [arr(s.split(''), { label: '本輪輸入' }), arr(next.split(''), { label: '本輪剩餘' })] })
    if (!removed) break
    s = next
  }
  return out
}

function secondFig(): FigStep[] {
  const s = 'baab', stack: string[] = [], out: FigStep[] = []
  for (let i = 0; i < s.length; i++) {
    const pop = stack.at(-1) === s[i]
    if (pop) stack.pop()
    else stack.push(s[i])
    out.push({ note: `讀到 ${s[i]}；${pop ? '與堆疊頂相同，兩字消掉' : '與頂端不同，放入堆疊'}；目前留下 ${stack.join('') || '空字串'}。`, views: [arr(s.split(''), { label: '原字串', highlight: [i] }), arr([...stack], { label: '未消除的堆疊' })] })
  }
  return out
}

export const hrReducedString: HrSolution = {
  slug: "reduced-string",
  plain: "像玩連鎖消除遊戲；兩個相鄰同字母一起消失，空位合攏後還可能再消一次。",
  statement: "反覆移除字串中的相鄰相同字母對，回傳最後的字串；若全部消失則回傳 Empty String。",
  examples: [
    { input: "s = \"aaabccddd\"", output: "abd", note: "aa、cc、dd 依次消掉，剩下 abd。" },
    { input: "s = \"baab\"", output: "Empty String", note: "中間 aa 消失後，兩個 b 也相鄰。" },
  ],
  constraints: [
    "字串最長約 100 字元 → 反覆刪除可作直覺解，堆疊能線性處理更長輸入。",
    "刪除後兩側可能新相鄰 → 必須反覆檢查或用堆疊保留未消除字元。",
  ],
  insight: [
    "真正麻煩的是刪除後會形成新的相鄰對，例如 baab。",
    "直覺是每次刪一對後重新掃描；若記住尚未消掉的尾端，就能當場處理新配對。",
    "這正是 [[p:stack]]；也可對照 [1047](#/q/1047)。",
  ],
  approaches: [
    {
      name: "反覆掃描並刪除",
      idea: "只要字串仍有相鄰相同的一對，就刪掉它並從頭找。",
      steps: ["先保留一份可修改的字串。","從左找第一對相同的鄰居。","刪除這兩個字元，重新從開頭尋找。","找不到時回傳剩餘字串或 Empty String。"],
      figure: { title: "s = \"baab\"", steps: firstFig() },
      complexity: {
        time: "O(n²)",
        space: "O(n)",
        why: "最多刪 n/2 次，每次搜尋及重建字串可花 O(n)。",
      },
      verdict: "最貼近題目流程，但每次刪除後重新掃描有重複工作。",
      code: {
        python: `def superReducedString(s):
    while True:
        pair = next((i for i in range(len(s) - 1) if s[i] == s[i + 1]), -1)
        if pair < 0:
            return s if s else 'Empty String'
        s = s[:pair] + s[pair + 2:]  # 刪掉一對後重新找`,
        c: `char* superReducedString(char* s) {
    int n = strlen(s);
    char* result = malloc(n + 1);
    strcpy(result, s);
    while (1) {
        int pair = -1;
        for (int i = 0; i + 1 < n; i++) {
            if (result[i] == result[i + 1]) {
                pair = i;
                break;
            }
        }
        if (pair < 0) {
            return n ? result : "Empty String";
        }
        memmove(result + pair, result + pair + 2, n - pair - 1);
        n -= 2;
    }
}`,
        cpp: `string superReducedString(string s) {
    while (true) {
        int pair = -1;
        for (int i = 0; i + 1 < (int)s.size(); i++) {
            if (s[i] == s[i + 1]) {
                pair = i;
                break;
            }
        }
        if (pair < 0) {
            return s.empty() ? "Empty String" : s;
        }
        s.erase(pair, 2);
    }
}`,
        java: `public static String superReducedString(String s) {
    StringBuilder text = new StringBuilder(s);
    while (true) {
        int pair = -1;
        for (int i = 0; i + 1 < text.length(); i++) {
            if (text.charAt(i) == text.charAt(i + 1)) {
                pair = i;
                break;
            }
        }
        if (pair < 0) {
            return text.length() == 0 ? "Empty String" : text.toString();
        }
        text.delete(pair, pair + 2);
    }
}`,
        javascript: `function superReducedString(s) {
  while (true) {
    let pair = -1;
    for (let i = 0; i + 1 < s.length; i++) {
      if (s[i] === s[i + 1]) {
        pair = i;
        break;
      }
    }
    if (pair < 0) {
      return s || 'Empty String';
    }
    s = s.slice(0, pair) + s.slice(pair + 2);
  }
}`,
      },
    },
    {
      name: "堆疊保留未消除的字元",
      idea: "新字元只可能跟目前剩餘字串的最後一個字元配對。",
      steps: ["建立空堆疊。","逐字讀入，若堆疊頂端相同就彈出。","否則將字元放入堆疊。","最後串起堆疊；空的話回傳 Empty String。"],
      figure: { title: "s = \"baab\"", steps: secondFig() },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        why: "每個字元最多進堆疊一次、出堆疊一次；最多保存 n 個字。",
      },
      verdict: "一次掃描即可處理刪除後形成的新相鄰對。",
      code: {
        python: `def superReducedString(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()  # 新的一對相同，立即消除
        else:
            stack.append(ch)
    return ''.join(stack) if stack else 'Empty String'`,
        c: `char* superReducedString(char* s) {
    int n = strlen(s);
    char* stack = malloc(n + 1);
    int top = 0;
    for (int i = 0; i < n; i++) {
        if (top > 0 && stack[top - 1] == s[i]) {
            top--;
        } else {
            stack[top++] = s[i];
        }
    }
    if (top == 0) {
        free(stack);
        return "Empty String";
    }
    stack[top] = '\\0';
    return stack;
}`,
        cpp: `string superReducedString(string s) {
    string stack;
    for (char ch : s) {
        if (!stack.empty() && stack.back() == ch) {
            stack.pop_back();
        } else {
            stack.push_back(ch);
        }
    }
    return stack.empty() ? "Empty String" : stack;
}`,
        java: `public static String superReducedString(String s) {
    StringBuilder stack = new StringBuilder();
    for (char ch : s.toCharArray()) {
        int n = stack.length();
        if (n > 0 && stack.charAt(n - 1) == ch) {
            stack.deleteCharAt(n - 1);
        } else {
            stack.append(ch);
        }
    }
    return stack.length() == 0 ? "Empty String" : stack.toString();
}`,
        javascript: `function superReducedString(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  return stack.length ? stack.join('') : 'Empty String';
}`,
      },
    },
  ],
  pitfalls: [
    "空結果要回傳題目指定的字串 Empty String，不能回傳空字串。",
    "兩字消掉後可能形成新的相鄰同字對；只跑一輪會漏算連鎖消除。",
  ],
  check: {
    kind: 'fn',
    fn: "superReducedString",
    cases: [
      { args: ["aaabccddd"], out: "abd" },
      { args: ["baab"], out: "Empty String" },
      { args: ["aa"], out: "Empty String" },
      { args: ["a"], out: "a" },
      { args: ["abba"], out: "Empty String" },
      { args: ["abc"], out: "abc" },
    ],
  },
}
