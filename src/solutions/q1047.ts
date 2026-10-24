import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q1047: Solution = {
  id: 1047,
  plain: '相鄰的兩個相同字母會一起消失。一直消到不能再消，回傳剩下的字串。',
  statement: '給只含小寫字母的字串 s，每次可以刪除一對相鄰且相同的字母；重複操作後回傳結果。',
  examples: [{ input: 's = "abbaca"', output: '"ca"' }, { input: 's = "azxxzy"', output: '"ay"' }],
  constraints: ['`1 ≤ s.length ≤ 10⁵`，反覆從頭掃描可能太慢。'],
  insight: ['刪掉一對後，原本不相鄰的字母可能變成鄰居。', '堆疊頂端就是目前結果的最後一個字母；新字母只需和它比較。', '這是 [[p:stack]] 的典型用法。'],
  approaches: [
    {
      name: '反覆掃描',
      idea: '每輪找第一對相同的鄰居，刪掉後重新掃描。',
      steps: ['從左到右找 `s[i] == s[i+1]`', '找到就刪掉這兩個字母並重頭開始', '整輪找不到時回傳'],
      figure: { title: 'abbaca', steps: [
        { note: '先看到 bb，刪掉這對；兩側的 a 因而靠在一起。', views: [arr(['a', 'b', 'b', 'a', 'c', 'a'], { highlight: [1, 2] })] },
        { note: '剩下 aaca；接著刪掉新形成的 aa。', views: [arr(['a', 'a', 'c', 'a'], { highlight: [0, 1] })] },
        { note: '剩下 ca，已沒有相同鄰居，所以答案是 ca。', views: [arr(['c', 'a'], { done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多刪 n/2 輪，每輪都可能複製長度 O(n) 的字串。' },
      verdict: '容易理解，但長字串會反覆重掃。',
      code: {
        python: `def removeDuplicates(s):
    while True:
        for i in range(len(s) - 1):
            if s[i] == s[i + 1]:
                s = s[:i] + s[i + 2:]  # 刪掉一對後重新掃描
                break
        else:
            return s`,
        c: `char *removeDuplicates(char *s) {
    int n = strlen(s);
    char *out = malloc(n + 1);
    strcpy(out, s);
    for (;;) {
        int found = 0;
        for (int i = 0; i + 1 < n; i++) {
            if (out[i] == out[i + 1]) {
                memmove(out + i, out + i + 2, n - i - 1);
                n -= 2;
                found = 1;
                break;
            }
        }
        if (!found) return out;
    }
}`,
        cpp: `string removeDuplicates(string s) {
    for (;;) {
        bool found = false;
        for (int i = 0; i + 1 < (int)s.size(); i++) {
            if (s[i] == s[i + 1]) {
                s.erase(i, 2);
                found = true;
                break;
            }
        }
        if (!found) return s;
    }
}`,
        java: `String removeDuplicates(String s) {
    StringBuilder cur = new StringBuilder(s);
    for (;;) {
        boolean found = false;
        for (int i = 0; i + 1 < cur.length(); i++) {
            if (cur.charAt(i) == cur.charAt(i + 1)) {
                cur.delete(i, i + 2);
                found = true;
                break;
            }
        }
        if (!found) return cur.toString();
    }
}`,
        javascript: `function removeDuplicates(s) {
  for (;;) {
    let found = false;
    for (let i = 0; i + 1 < s.length; i++) {
      if (s[i] === s[i + 1]) {
        s = s.slice(0, i) + s.slice(i + 2);
        found = true;
        break;
      }
    }
    if (!found) return s;
  }
}`,
      },
    },
    {
      name: '堆疊一次掃描',
      idea: '新字母等於堆疊頂端就彈出，否則推入。',
      steps: ['建立空堆疊', '依序讀字母，相同則彈出，不同則推入', '把堆疊連成字串'],
      figure: { title: 'abbaca', steps: [
        { note: '讀 a、b，兩者不同，堆疊成 ab。', views: [arr(['a', 'b'], { label: '堆疊', done: [0, 1] })] },
        { note: '下一個 b 等於頂端 b，把頂端彈出；堆疊只剩 a。', views: [arr(['a'], { label: '堆疊', highlight: [0] })] },
        { note: '下一個 a 等於頂端 a，再彈出，堆疊變空。', views: [arr(['∅'], { label: '堆疊' })] },
        { note: '最後讀入 c、a，堆疊 ca 即答案。', views: [arr(['c', 'a'], { label: '堆疊', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字母最多入棧與出棧各一次。' },
      verdict: '推薦；每步只看堆疊頂端。',
      code: {
        python: `def removeDuplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()  # 這一對相同字母互相抵消
        else:
            stack.append(ch)
    return ''.join(stack)`,
        c: `char *removeDuplicates(char *s) {
    int n = strlen(s);
    char *out = malloc(n + 1);
    int top = 0;
    for (int i = 0; i < n; i++) {
        if (top > 0 && out[top - 1] == s[i]) {
            top--;
        } else {
            out[top++] = s[i];
        }
    }
    out[top] = '\\0';
    return out;
}`,
        cpp: `string removeDuplicates(string s) {
    string out;
    for (char ch : s) {
        if (!out.empty() && out.back() == ch) {
            out.pop_back();
        } else {
            out.push_back(ch);
        }
    }
    return out;
}`,
        java: `String removeDuplicates(String s) {
    StringBuilder out = new StringBuilder();
    for (char ch : s.toCharArray()) {
        int n = out.length();
        if (n > 0 && out.charAt(n - 1) == ch) {
            out.deleteCharAt(n - 1);
        } else {
            out.append(ch);
        }
    }
    return out.toString();
}`,
        javascript: `function removeDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  return stack.join('');
}`,
      },
    },
  ],
  pitfalls: ['只刪原字串中的相鄰對會漏掉刪除後新形成的相鄰對。'],
  check: { kind: 'fn', fn: 'removeDuplicates', cases: [
    { args: ['abbaca'], out: 'ca' },
    { args: ['azxxzy'], out: 'ay' },
    { args: ['a'], out: 'a' },
    { args: ['aaaa'], out: '' },
  ] },
}
