import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 844. Backspace String Compare
export const q0844: Solution = {
  id: 844,
  plain: '兩人各自打字，# 代表按一次退格鍵；比較最後螢幕上的文字是否一樣。',
  statement: '給字串 s 與 t，其中 # 會刪掉前一個尚未被刪的字元。刪無可刪時不影響結果。判斷處理後的字串是否相同。',
  examples: [{ input: 's = "ab#c", t = "ad#c"', output: 'true' }, { input: 's = "a#c", t = "b"', output: 'false' }],
  constraints: ['1 ≤ s.length, t.length ≤ 200；字元是小寫字母或 #。'],
  insight: ['正向處理時，退格會刪除最後保留的字元，剛好是 [[p:stack]]。', '若從右往左看，# 表示接下來要跳過一個字元，可以用 [[p:two-pointers]] 且不配置結果字串。'],
  approaches: [
    {
      name: '堆疊模擬打字',
      idea: '字母推入堆疊，# 就從堆疊尾端刪一個。',
      steps: ['對 s、t 各建立空堆疊。', '遇字母加入；遇 # 且堆疊不空就彈出。', '比較兩個結果。'],
      figure: { title: 's = "ab#c", t = "ad#c"', steps: [
        { note: 's 先輸入 a、b，堆疊是 [a,b]。', views: [arr(['a', 'b'], { label: 's 的堆疊', highlight: [1] })] },
        { note: 's 遇 #，刪掉最後輸入的 b，剩 [a]。', views: [arr(['a'], { label: 's 的堆疊', done: [0] })] },
        { note: 's 最後輸入 c，得到 [a,c]；t 輸入 a、d 後也因 # 刪掉 d。', views: [arr(['a', 'c'], { label: 's 結果' }), arr(['a'], { label: 't 退格後' })] },
        { note: 't 最後也輸入 c，兩個結果都是 ac，回傳 true。', views: [arr(['a', 'c'], { label: 's', done: [0, 1] }), arr(['a', 'c'], { label: 't', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n+m)', space: 'O(n+m)', why: '每個字元處理一次，堆疊最長保留全部字母。' },
      verdict: '最貼近實際按鍵操作。',
      code: {
        python: `def backspaceCompare(s, t):
    def type_text(text):
        stack = []
        for char in text:
            if char == '#':
                if stack:
                    stack.pop()           # 刪掉最後保留的字元
            else:
                stack.append(char)
        return stack
    return type_text(s) == type_text(t)`,
        c: `static int type844(const char *text, char *result) {
    int size = 0;
    for (int i = 0; text[i]; i++) {
        if (text[i] == '#') {
            if (size > 0) {
                size--;
            }
        } else {
            result[size++] = text[i];
        }
    }
    return size;
}

bool backspaceCompare(char *s, char *t) {
    char *a = malloc(strlen(s) + 1);
    char *b = malloc(strlen(t) + 1);
    int na = type844(s, a);
    int nb = type844(t, b);
    bool equal = na == nb && memcmp(a, b, na) == 0;
    free(a);
    free(b);
    return equal;
}`,
        cpp: `bool backspaceCompare(string s, string t) {
    auto typeText = [](const string& text) {
        string result;
        for (char ch : text) {
            if (ch == '#') {
                if (!result.empty()) {
                    result.pop_back();
                }
            } else {
                result.push_back(ch);
            }
        }
        return result;
    };
    return typeText(s) == typeText(t);
}`,
        java: `boolean backspaceCompare(String s, String t) {
    return type844(s).equals(type844(t));
}

String type844(String text) {
    StringBuilder result = new StringBuilder();
    for (char ch : text.toCharArray()) {
        if (ch == '#') {
            if (result.length() > 0) {
                result.deleteCharAt(result.length() - 1);
            }
        } else {
            result.append(ch);
        }
    }
    return result.toString();
}`,
        javascript: `function backspaceCompare(s, t) {
  function typeText(text) {
    const stack = [];
    for (const char of text) {
      if (char === '#') {
        stack.pop();
      } else {
        stack.push(char);
      }
    }
    return stack.join('');
  }
  return typeText(s) === typeText(t);
}`,
      },
    },
    {
      name: '從右往左雙指標',
      idea: '倒著找下一個真正留下的字元；每遇到 #，就額外跳過一個字母。',
      steps: ['兩個指標各從字串末端出發。', '對每邊跳過 # 與它取消的字母。', '比較兩邊下一個留下的字元，直到都走完。'],
      figure: { title: 's = "ab#c", t = "ad#c"', steps: [
        { note: '從最右邊開始，兩邊第一個留下的字元都是 c。', views: [arr(['a', 'b', '#', 'c'], { label: 's', highlight: [3] }), arr(['a', 'd', '#', 'c'], { label: 't', highlight: [3] })] },
        { note: '往左遇到 #，代表還需跳過前面一個字母。', views: [arr(['a', 'b', '#', 'c'], { label: 's', highlight: [2] })] },
        { note: 's 跳過 b，t 跳過 d；這兩個字母都已被退格。', views: [arr(['a', 'b', '#', 'c'], { label: 's', dim: [1, 2] }), arr(['a', 'd', '#', 'c'], { label: 't', dim: [1, 2] })] },
        { note: '接著兩邊都讀到 a；再往左都已結束，所以相同。', views: [arr(['a'], { label: '留下的字元', done: [0] })] },
      ] },
      complexity: { time: 'O(n+m)', space: 'O(1)', why: '每個指標只往左走，僅保存退格次數。' },
      verdict: '追求常數空間時使用，注意一邊先走完的情況。',
      code: {
        python: `def backspaceCompare(s, t):
    def previous(text, index):
        skipped = 0
        while index >= 0:
            if text[index] == '#':
                skipped += 1
            elif skipped:
                skipped -= 1            # 字母被右側的 # 刪除
            else:
                break
            index -= 1
        return index
    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i = previous(s, i)
        j = previous(t, j)
        if i < 0 or j < 0:
            return i == j
        if s[i] != t[j]:
            return False
        i -= 1
        j -= 1
    return True`,
        c: `static int previous844(const char *text, int index) {
    int skipped = 0;
    while (index >= 0) {
        if (text[index] == '#') {
            skipped++;
        } else if (skipped > 0) {
            skipped--;
        } else {
            break;
        }
        index--;
    }
    return index;
}

bool backspaceCompare(char *s, char *t) {
    int i = (int)strlen(s) - 1;
    int j = (int)strlen(t) - 1;
    while (i >= 0 || j >= 0) {
        i = previous844(s, i);
        j = previous844(t, j);
        if (i < 0 || j < 0) {
            return i == j;
        }
        if (s[i] != t[j]) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}`,
        cpp: `bool backspaceCompare(string s, string t) {
    auto previous = [](const string& text, int index) {
        int skipped = 0;
        while (index >= 0) {
            if (text[index] == '#') {
                skipped++;
            } else if (skipped > 0) {
                skipped--;
            } else {
                break;
            }
            index--;
        }
        return index;
    };
    int i = (int)s.size() - 1;
    int j = (int)t.size() - 1;
    while (i >= 0 || j >= 0) {
        i = previous(s, i);
        j = previous(t, j);
        if (i < 0 || j < 0) {
            return i == j;
        }
        if (s[i] != t[j]) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}`,
        java: `boolean backspaceCompare(String s, String t) {
    int i = s.length() - 1;
    int j = t.length() - 1;
    while (i >= 0 || j >= 0) {
        i = previous844(s, i);
        j = previous844(t, j);
        if (i < 0 || j < 0) {
            return i == j;
        }
        if (s.charAt(i) != t.charAt(j)) {
            return false;
        }
        i--;
        j--;
    }
    return true;
}

int previous844(String text, int index) {
    int skipped = 0;
    while (index >= 0) {
        if (text.charAt(index) == '#') {
            skipped++;
        } else if (skipped > 0) {
            skipped--;
        } else {
            break;
        }
        index--;
    }
    return index;
}`,
        javascript: `function backspaceCompare(s, t) {
  function previous(text, index) {
    let skipped = 0;
    while (index >= 0) {
      if (text[index] === '#') {
        skipped++;
      } else if (skipped > 0) {
        skipped--;
      } else {
        break;
      }
      index--;
    }
    return index;
  }
  let i = s.length - 1;
  let j = t.length - 1;
  while (i >= 0 || j >= 0) {
    i = previous(s, i);
    j = previous(t, j);
    if (i < 0 || j < 0) {
      return i === j;
    }
    if (s[i] !== t[j]) {
      return false;
    }
    i--;
    j--;
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['堆疊已空時再按 # 不會刪除任何東西。', '倒著走時，連續 # 會累積要跳過的字母數。'],
  check: { kind: 'fn', fn: 'backspaceCompare', cases: [
    { args: ['ab#c', 'ad#c'], out: true }, { args: ['ab##', 'c#d#'], out: true }, { args: ['a#c', 'b'], out: false }, { args: ['###a', 'a'], out: true },
  ] },
}
