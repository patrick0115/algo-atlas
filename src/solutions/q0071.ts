import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 71. Simplify Path

const P = '/home//foo/../bar/./baz/'

function stackFig(): FigStep[] {
  const parts = P.split('/')
  const st: string[] = []
  const out: FigStep[] = [{ note: '用 "/" 切開。空字串(連續的 //)和 "." 都代表「原地不動」,跳過;".." 代表回上一層 → pop;其他名字就 push(進入這個資料夾)', views: [arr(parts.map((x) => (x === '' ? '∅' : x)), { label: '切開後(∅ = 空字串)' })] }]
  parts.forEach((p, i) => {
    let note = ''
    if (p === '' || p === '.') return
    if (p === '..') {
      const x = st.pop()
      note = `".." → 回上一層,pop "${x}"`
    } else {
      st.push(p)
      note = `"${p}" → 進入,push`
    }
    out.push({ note, views: [arr(parts.map((x) => (x === '' ? '∅' : x)), { label: '切開後', highlight: [i], dim: parts.map((x, k) => (x === '' || x === '.' ? k : -1)).filter((k) => k >= 0) }), arr([...st], { label: '堆疊(目前的路徑)' })] })
  })
  out.push({ note: `用 "/" 接起來,前面加 "/" → "/${st.join('/')}"`, views: [arr(st, { label: '答案的每一層', done: st.map((_, i) => i) })] })
  return out
}

function scanFig(): FigStep[] {
  return [
    { note: '不用 split:手動掃字串,跳過連續的 "/",再讀出到下一個 "/" 為止的名字', views: [arr(P.split(''), { label: 'path', range: [1, 4] })] },
    { note: '讀到的名字照同樣規則處理(. 略過、.. pop、其他 push)。在不方便 split 的語言(像 C)比較自然', views: [arr(['home', 'bar', 'baz'], { label: '堆疊', done: [0, 1, 2] })] },
  ]
}

export const q0071: Solution = {
  id: 71,
  plain: '把一個 Unix 檔案路徑整理成最簡潔的樣子。"." 代表目前資料夾(可以刪掉)、".." 代表回上一層、連續的 "//" 當成一個 "/"、結尾不要多餘的 "/"。',
  statement: '給 Unix 風格的絕對路徑 `path`,回傳其**簡化的標準路徑**:以 `/` 開頭、資料夾間只有一個 `/`、不以 `/` 結尾(根目錄除外)、不含 `.` 或 `..`。在根目錄執行 `..` 仍停在根目錄。像 `...` 這種是合法的資料夾名稱。',
  examples: [
    { input: 'path = "/home/"', output: '"/home"' },
    { input: 'path = "/home//foo/"', output: '"/home/foo"' },
    { input: 'path = "/home/user/Documents/../Pictures"', output: '"/home/user/Pictures"' },
    { input: 'path = "/../"', output: '"/"' },
    { input: 'path = "/.../a/../b/c/../d/./"', output: '"/.../b/d"' },
  ],
  constraints: ['長度 ≤ 3000'],
  insight: ['路徑就是一層一層的資料夾 → 堆疊記目前所在的位置', '".." = pop(堆疊空的時候什麼都不做),"." 和空字串 = 略過,其他 = push', '最後用 "/" 接起來;堆疊空的話答案是 "/"'],
  approaches: [
    {
      name: 'split + 堆疊',
      idea: '`for p in path.split("/")`:`".."` → pop(非空時);`""` 或 `"."` → 略過;否則 push。',
      steps: ['`st = []`', '`for p in path.split("/")`:', '`p == ".."` → `if st: st.pop()`;`p in ("", ".")` → 略過;否則 `st.append(p)`', '回傳 `"/" + "/".join(st)`'],
      figure: { title: `path = "${P}"`, steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '切字串、每段處理一次。' },
      verdict: '最推薦,[[p:stack]]的直接應用,四種情況各一行。',
      code: {
        python: `def simplifyPath(path):
    st = []
    for p in path.split('/'):
        if p == '..':
            if st:
                st.pop()                      # 回上一層(根目錄就不動)
        elif p and p != '.':
            st.append(p)                      # 進入資料夾;空字串和 . 都略過
    return '/' + '/'.join(st)`,
        c: `char *simplifyPath(char *path) {
    int n = strlen(path), top = 0;
    char **st = malloc((n + 1) * sizeof(char *));
    char *buf = strdup(path);
    for (char *p = strtok(buf, "/"); p; p = strtok(NULL, "/")) {   // strtok 會跳過連續的 /
        if (!strcmp(p, "..")) { if (top) top--; }
        else if (strcmp(p, ".")) st[top++] = p;
    }
    char *res = malloc(n + 2);
    int k = 0;
    for (int i = 0; i < top; i++) { res[k++] = '/'; int L = strlen(st[i]); memcpy(res + k, st[i], L); k += L; }
    if (k == 0) res[k++] = '/';
    res[k] = '\\0';
    free(buf); free(st);
    return res;
}`,
        cpp: `string simplifyPath(string path) {
    vector<string> st;
    stringstream ss(path);
    string p;
    while (getline(ss, p, '/')) {
        if (p == "..") { if (!st.empty()) st.pop_back(); }
        else if (!p.empty() && p != ".") st.push_back(p);
    }
    string res;
    for (auto &x : st) res += "/" + x;
    return res.empty() ? "/" : res;
}`,
        java: `String simplifyPath(String path) {
    Deque<String> st = new ArrayDeque<>();
    for (String p : path.split("/")) {
        if (p.equals("..")) { if (!st.isEmpty()) st.pollLast(); }
        else if (!p.isEmpty() && !p.equals(".")) st.addLast(p);
    }
    return "/" + String.join("/", st);
}`,
        javascript: `function simplifyPath(path) {
  const st = [];
  for (const p of path.split('/')) {
    if (p === '..') st.pop();
    else if (p && p !== '.') st.push(p);
  }
  return '/' + st.join('/');
}`,
      },
    },
    {
      name: '手動掃描 + 堆疊',
      idea: '`i` 跳過連續的 "/",`j` 找到下一個 "/",`path[i:j]` 就是一段名字,照同樣規則處理。',
      steps: ['`i = 0`', '`while i < n`:跳過 "/";`j = i`,往右到 "/" 或結尾', '`name = path[i:j]`:照規則 push / pop / 略過', '`i = j`'],
      figure: { title: `path = "${P}"`, steps: scanFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元看一次。' },
      verdict: '不依賴 split 的行為(各語言對連續分隔符的處理不同),邏輯完全自己掌控。',
      code: {
        python: `def simplifyPath(path):
    st, i, n = [], 0, len(path)
    while i < n:
        while i < n and path[i] == '/':
            i += 1                            # 跳過連續的 /
        j = i
        while j < n and path[j] != '/':
            j += 1
        name = path[i:j]
        if name == '..':
            if st:
                st.pop()
        elif name and name != '.':
            st.append(name)
        i = j
    return '/' + '/'.join(st)`,
        c: `char *simplifyPath(char *path) {
    int n = strlen(path), top = 0;
    int *start = malloc((n + 1) * sizeof(int)), *len = malloc((n + 1) * sizeof(int));
    for (int i = 0; i < n;) {
        while (i < n && path[i] == '/') i++;
        int j = i;
        while (j < n && path[j] != '/') j++;
        int L = j - i;
        if (L == 2 && path[i] == '.' && path[i + 1] == '.') { if (top) top--; }
        else if (L > 0 && !(L == 1 && path[i] == '.')) { start[top] = i; len[top++] = L; }
        i = j;
    }
    char *res = malloc(n + 2);
    int k = 0;
    for (int t = 0; t < top; t++) { res[k++] = '/'; memcpy(res + k, path + start[t], len[t]); k += len[t]; }
    if (k == 0) res[k++] = '/';
    res[k] = '\\0';
    free(start); free(len);
    return res;
}`,
        cpp: `string simplifyPath(string path) {
    vector<string> st;
    int n = path.size();
    for (int i = 0; i < n;) {
        while (i < n && path[i] == '/') i++;
        int j = i;
        while (j < n && path[j] != '/') j++;
        string name = path.substr(i, j - i);
        if (name == "..") { if (!st.empty()) st.pop_back(); }
        else if (!name.empty() && name != ".") st.push_back(name);
        i = j;
    }
    string res;
    for (auto &x : st) res += "/" + x;
    return res.empty() ? "/" : res;
}`,
        java: `String simplifyPath(String path) {
    Deque<String> st = new ArrayDeque<>();
    int n = path.length();
    for (int i = 0; i < n;) {
        while (i < n && path.charAt(i) == '/') i++;
        int j = i;
        while (j < n && path.charAt(j) != '/') j++;
        String name = path.substring(i, j);
        if (name.equals("..")) { if (!st.isEmpty()) st.pollLast(); }
        else if (!name.isEmpty() && !name.equals(".")) st.addLast(name);
        i = j;
    }
    return "/" + String.join("/", st);
}`,
        javascript: `function simplifyPath(path) {
  const st = [], n = path.length;
  for (let i = 0; i < n; ) {
    while (i < n && path[i] === '/') i++;
    let j = i;
    while (j < n && path[j] !== '/') j++;
    const name = path.slice(i, j);
    if (name === '..') st.pop();
    else if (name && name !== '.') st.push(name);
    i = j;
  }
  return '/' + st.join('/');
}`,
      },
    },
  ],
  pitfalls: ['把 "..." 當成特殊符號:只有剛好 "." 和 ".." 是特殊的', '在根目錄 pop 空堆疊(Python、C 會出錯)', '堆疊空時忘了回傳 "/"'],
  check: {
    kind: 'fn',
    fn: 'simplifyPath',
    cases: [
      { args: ['/home/'], out: '/home' },
      { args: ['/home//foo/'], out: '/home/foo' },
      { args: ['/home/user/Documents/../Pictures'], out: '/home/user/Pictures' },
      { args: ['/../'], out: '/' },
      { args: ['/.../a/../b/c/../d/./'], out: '/.../b/d' },
      { args: [P], out: '/home/bar/baz' },
    ],
  },
}
