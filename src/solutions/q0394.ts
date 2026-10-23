import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 394. Decode String

const S = '3[a2[c]]'

function stackFig(): FigStep[] {
  return [
    { note: '規則 k[內容] = 內容重複 k 次,而且可以一層包一層。遇到 "[" 代表要進入新的一層:把「目前累積的字串」和「重複次數」先存到堆疊,重新開始累積', views: [arr(S.split(''), { label: 's' }), arr([], { label: '堆疊(之前的字串, 次數)' })] },
    { note: '讀到 "3[":存 ("", 3),cur 清空。讀 "a" → cur = "a"。讀到 "2[":存 ("a", 2),cur 清空', views: [arr(S.split(''), { label: 's', done: [0, 1, 2, 3, 4] }), arr(['("", 3)', '("a", 2)'], { label: '堆疊' }), arr([''], { label: 'cur' })] },
    { note: '讀 "c" → cur = "c"。讀到第一個 "]":pop ("a", 2) → cur = "a" + "c" × 2 = "acc"', views: [arr(S.split(''), { label: 's', done: [0, 1, 2, 3, 4, 5, 6] }), arr(['("", 3)'], { label: '堆疊' }), arr(['acc'], { label: 'cur' })] },
    { note: '讀到第二個 "]":pop ("", 3) → cur = "" + "acc" × 3 = "accaccacc"', views: [arr([], { label: '堆疊' }), arr(['accaccacc'], { label: 'cur(答案)', done: [0] })] },
  ]
}

function recFig(): FigStep[] {
  return [
    { note: '遞迴版:decode(i) 從位置 i 開始解析,遇到 "]" 或字串結尾就回傳「解出來的字串, 下一個位置」。遇到數字 k 和 "[",就遞迴解析括號裡面', views: [arr(S.split(''), { label: 's', range: [2, 6] })] },
    { note: '括號裡的 "a2[c]" 又遞迴一次:裡面的 "c" 回傳給外層,外層組出 "acc",再被最外層重複 3 次。結構跟巢狀括號一模一樣', views: [arr(['decode("3[…]")', '→ decode("a2[…]")', '→ decode("c")'], { label: '遞迴往下' })] },
  ]
}

export const q0394: Solution = {
  id: 394,
  plain: '解碼一種壓縮字串:k[內容] 代表把內容重複 k 次,而且可以一層包一層。例如 3[a2[c]] = 3 次的 "acc" = "accaccacc"。',
  statement: '給一個編碼字串 `s`,規則為 `k[encoded_string]`:方括號內的字串重複 k 次(k 為正整數)。輸入保證合法(沒有多餘空白、括號成對、數字只用來表示重複次數)。回傳解碼後的字串。',
  examples: [
    { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
    { input: 's = "3[a2[c]]"', output: '"accaccacc"' },
    { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
  ],
  constraints: ['長度 ≤ 30,k ≤ 300(可能有多位數)', '輸出長度 ≤ 10⁵'],
  insight: ['巢狀的括號 → 「先處理最裡面的」→ 堆疊或遞迴', '遇到 "[":把目前的進度(已累積的字串、這層的次數)存起來,開新的一層', '遇到 "]":這層結束,把內容重複 k 次,接回上一層的字串後面', '數字可能有好幾位(例如 100[a])'],
  approaches: [
    {
      name: '堆疊存「上一層的進度」',
      idea: '`cur` 是這一層累積的字串、`k` 是正在讀的數字;"[" → push `(cur, k)`、重置;"]" → pop `(prev, t)`,`cur = prev + cur * t`。',
      steps: ['`st = []`、`cur = ""`、`k = 0`', '數字:`k = k * 10 + d`', '"[":`st.append((cur, k))`;`cur, k = "", 0`', '"]":`prev, t = st.pop()`;`cur = prev + cur * t`', '字母:`cur += c`;最後回傳 cur'],
      figure: { title: `s = "${S}"`, steps: stackFig() },
      complexity: { time: 'O(輸出長度)', space: 'O(輸出長度)', why: '每個輸出字元被建出來常數次(不算重複乘法的拷貝)。' },
      verdict: '最推薦。[[p:stack]]處理巢狀結構的標準作法:進入一層時存檔,離開時讀檔。',
      code: {
        python: `def decodeString(s):
    st, cur, k = [], '', 0
    for c in s:
        if c.isdigit():
            k = k * 10 + int(c)               # 數字可能有好幾位
        elif c == '[':
            st.append((cur, k))               # 存下這層開始前的進度
            cur, k = '', 0
        elif c == ']':
            prev, t = st.pop()
            cur = prev + cur * t              # 這層的內容重複 t 次,接回上一層
        else:
            cur += c
    return cur`,
        c: `// 每一層的字串用動態陣列存;堆疊存「上一層的字串」和次數
typedef struct { char *s; int len, cap; } Str;
static void app(Str *a, const char *p, int n) {
    if (a->len + n + 1 > a->cap) { while (a->len + n + 1 > a->cap) a->cap = a->cap * 2 + 16; a->s = realloc(a->s, a->cap); }
    memcpy(a->s + a->len, p, n); a->len += n; a->s[a->len] = '\\0';
}

char *decodeString(char *s) {
    Str st[32];
    int ks[32], top = 0, k = 0;
    Str cur = {0};
    app(&cur, "", 0);
    for (; *s; s++) {
        if (isdigit(*s)) k = k * 10 + (*s - '0');
        else if (*s == '[') { st[top] = cur; ks[top++] = k; cur = (Str){0}; app(&cur, "", 0); k = 0; }
        else if (*s == ']') {
            Str prev = st[--top];
            for (int t = 0; t < ks[top]; t++) app(&prev, cur.s, cur.len);
            free(cur.s);
            cur = prev;
        } else app(&cur, s, 1);
    }
    return cur.s;
}`,
        cpp: `string decodeString(string s) {
    vector<pair<string, int>> st;
    string cur;
    int k = 0;
    for (char c : s) {
        if (isdigit(c)) k = k * 10 + (c - '0');
        else if (c == '[') { st.push_back({cur, k}); cur.clear(); k = 0; }
        else if (c == ']') {
            auto [prev, t] = st.back();
            st.pop_back();
            string rep;
            while (t--) rep += cur;
            cur = prev + rep;
        } else cur += c;
    }
    return cur;
}`,
        java: `String decodeString(String s) {
    Deque<StringBuilder> strs = new ArrayDeque<>();
    Deque<Integer> nums = new ArrayDeque<>();
    StringBuilder cur = new StringBuilder();
    int k = 0;
    for (char c : s.toCharArray()) {
        if (Character.isDigit(c)) k = k * 10 + (c - '0');
        else if (c == '[') { strs.push(cur); nums.push(k); cur = new StringBuilder(); k = 0; }
        else if (c == ']') {
            StringBuilder prev = strs.pop();
            prev.append(cur.toString().repeat(nums.pop()));
            cur = prev;
        } else cur.append(c);
    }
    return cur.toString();
}`,
        javascript: `function decodeString(s) {
  const st = [];
  let cur = '', k = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') k = k * 10 + Number(c);
    else if (c === '[') {
      st.push([cur, k]);
      cur = '';
      k = 0;
    } else if (c === ']') {
      const [prev, t] = st.pop();
      cur = prev + cur.repeat(t);
    } else cur += c;
  }
  return cur;
}`,
      },
    },
    {
      name: '遞迴下降',
      idea: '`parse(i)` 解析到 "]" 或結尾,回傳 `(字串, 下一個位置)`;遇到 `k[` 就遞迴 `parse(i)` 拿到內容再重複 k 次。',
      steps: ['`parse(i)`:`res = ""`', '`while i < n and s[i] != "]"`:字母 → 接上;數字 → 讀完 k、跳過 "[",`(inner, i) = parse(i)`、跳過 "]",`res += inner * k`', '回傳 `(res, i)`;答案 `parse(0)[0]`'],
      figure: { title: `s = "${S}"`, steps: recFig() },
      complexity: { time: 'O(輸出長度)', space: 'O(輸出長度 + 巢狀深度)', why: '遞迴深度 = 括號層數。' },
      verdict: '遞迴直接對應文法「字串 = (字母 | 數字[字串])*」,適合更複雜的解析題(像計算機 224 題)。',
      code: {
        python: `def decodeString(s):
    def parse(i):
        res = ''
        while i < len(s) and s[i] != ']':
            if s[i].isdigit():
                k = 0
                while s[i].isdigit():
                    k = k * 10 + int(s[i])
                    i += 1
                inner, i = parse(i + 1)       # 跳過 '[',遞迴解析括號內
                res += inner * k
                i += 1                        # 跳過 ']'
            else:
                res += s[i]
                i += 1
        return res, i
    return parse(0)[0]`,
        c: `typedef struct { char *s; int len, cap; } Str;
static void app(Str *a, const char *p, int n) {
    if (a->len + n + 1 > a->cap) { while (a->len + n + 1 > a->cap) a->cap = a->cap * 2 + 16; a->s = realloc(a->s, a->cap); }
    memcpy(a->s + a->len, p, n); a->len += n; a->s[a->len] = '\\0';
}

static Str parse(const char *s, int *i) {
    Str res = {0};
    app(&res, "", 0);
    while (s[*i] && s[*i] != ']') {
        if (isdigit(s[*i])) {
            int k = 0;
            while (isdigit(s[*i])) k = k * 10 + (s[(*i)++] - '0');
            (*i)++;                               // '['
            Str inner = parse(s, i);
            (*i)++;                               // ']'
            for (int t = 0; t < k; t++) app(&res, inner.s, inner.len);
            free(inner.s);
        } else app(&res, s + (*i)++, 1);
    }
    return res;
}

char *decodeString(char *s) {
    int i = 0;
    return parse(s, &i).s;
}`,
        cpp: `string parse(const string &s, int &i) {
    string res;
    while (i < (int)s.size() && s[i] != ']') {
        if (isdigit(s[i])) {
            int k = 0;
            while (isdigit(s[i])) k = k * 10 + (s[i++] - '0');
            i++;
            string inner = parse(s, i);
            i++;
            while (k--) res += inner;
        } else res += s[i++];
    }
    return res;
}

string decodeString(string s) {
    int i = 0;
    return parse(s, i);
}`,
        java: `private int i;

String decodeString(String s) {
    i = 0;
    return parse(s);
}

private String parse(String s) {
    StringBuilder res = new StringBuilder();
    while (i < s.length() && s.charAt(i) != ']') {
        if (Character.isDigit(s.charAt(i))) {
            int k = 0;
            while (Character.isDigit(s.charAt(i))) k = k * 10 + (s.charAt(i++) - '0');
            i++;
            String inner = parse(s);
            i++;
            res.append(inner.repeat(k));
        } else res.append(s.charAt(i++));
    }
    return res.toString();
}`,
        javascript: `function decodeString(s) {
  let i = 0;
  const parse = () => {
    let res = '';
    while (i < s.length && s[i] !== ']') {
      if (s[i] >= '0' && s[i] <= '9') {
        let k = 0;
        while (s[i] >= '0' && s[i] <= '9') k = k * 10 + Number(s[i++]);
        i++;
        const inner = parse();
        i++;
        res += inner.repeat(k);
      } else res += s[i++];
    }
    return res;
  };
  return parse();
}`,
      },
    },
  ],
  pitfalls: ['數字只讀一位:"10[a]" 會變成 1 和 0', '"]" 時把內容接到錯的地方:要接在「上一層 [ 之前累積的字串」後面'],
  check: {
    kind: 'fn',
    fn: 'decodeString',
    cases: [
      { args: ['3[a]2[bc]'], out: 'aaabcbc' },
      { args: [S], out: 'accaccacc' },
      { args: ['2[abc]3[cd]ef'], out: 'abcabccdcdcdef' },
      { args: ['10[a]'], out: 'aaaaaaaaaa' },
      { args: ['abc'], out: 'abc' },
      { args: ['2[a2[b]c]'], out: 'abbcabbc' },
    ],
  },
}
