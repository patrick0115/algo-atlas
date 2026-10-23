import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 93. Restore IP Addresses

const S = '25525511135'

function btFig(): FigStep[] {
  return [
    { note: `IP 位址是 4 段,每段 0–255、不能有前導零(「01」不行,「0」可以)。要在 "${S}" 裡插 3 個點`, views: [arr(S.split(''), { label: 's' })] },
    { note: '回溯:每一層決定下一段要切 1、2 或 3 個字元。切出來的段不合法(> 255 或有前導零)就不往下', views: [arr(['255', '255', '11', '135'], { label: '一種切法', done: [0, 1, 2, 3] })] },
    { note: '剪枝:剩下的字元數必須介於「剩下段數 × 1」和「剩下段數 × 3」之間,否則怎麼切都不夠或太多', views: [arr(['2', '5525511135'], { label: '第一段只切 "2" → 剩 10 個字給 3 段,最多 9 個 → 剪掉', dim: [1] })] },
    { note: '最後得到 "255.255.11.135" 和 "255.255.111.35"', views: [arr(['255.255.11.135', '255.255.111.35'], { label: '答案', done: [0, 1] })] },
  ]
}

function loopFig(): FigStep[] {
  return [
    { note: '既然只有 4 段、每段 1–3 個字,也可以直接三層迴圈枚舉前三段的長度 a、b、c,第四段的長度就是剩下的', views: [arr([3, 3, 2, 3], { label: '各段長度 a / b / c / d' })] },
    { note: '最多 3 × 3 × 3 = 27 種,每種檢查四段都合法就收下', views: [arr([3, 3, 3, 2], { label: '另一組長度', done: [0, 1, 2, 3] })] },
  ]
}

export const q0093: Solution = {
  id: 93,
  plain: '給一串數字,在中間插入 3 個點,變成合法的 IP 位址(4 段、每段 0 到 255、不能有多餘的 0 開頭)。列出所有可能。',
  statement: '給只含數字的字串 `s`,回傳所有能由 s 插入 3 個點組成的**有效 IP 位址**。每段為 0–255 的整數且不能有前導零。不能重排或刪除數字。',
  examples: [
    { input: 's = "25525511135"', output: '["255.255.11.135","255.255.111.35"]' },
    { input: 's = "0000"', output: '["0.0.0.0"]' },
    { input: 's = "101023"', output: '["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]' },
  ],
  constraints: ['1 ≤ s.length ≤ 20'],
  insight: ['切 4 段,每段 1–3 個字元 → [[p:backtracking]],每層最多 3 個分支', '合法的段:長度 1;或首字不是 0 且數值 ≤ 255', '長度超過 12 或少於 4 直接無解'],
  approaches: [
    {
      name: '回溯切段',
      idea: '`dfs(start, parts)`:4 段都切好且用完字串 → 收下;否則試長度 1..3,合法就遞迴。',
      steps: ['`len(parts) == 4` → `start == n` 才收下', '剩下字元數不在 `[剩段數, 3 × 剩段數]` → 剪掉', '`for L in 1..3`:`seg = s[start:start+L]`,合法就 push、遞迴、pop', '合法:`seg == "0"` 或(首字非 0 且 `int(seg) <= 255`)'],
      figure: { title: `s = "${S}"`, steps: btFig() },
      complexity: { time: 'O(3⁴)', space: 'O(1)', why: '最多 4 層、每層 3 個分支,與 n 無關(n > 12 直接無解)。' },
      verdict: '最推薦,回溯切字串的標準題,和 [131](#/q/131) 很像。',
      code: {
        python: `def restoreIpAddresses(s):
    n, res, parts = len(s), [], []

    def ok(seg):
        return seg == '0' or (seg[0] != '0' and int(seg) <= 255)

    def dfs(start):
        if len(parts) == 4:
            if start == n:
                res.append('.'.join(parts))
            return
        left = 4 - len(parts)
        if not left <= n - start <= 3 * left:
            return                            # 剩下的字太多或太少
        for L in range(1, 4):
            seg = s[start:start + L]
            if len(seg) == L and ok(seg):
                parts.append(seg)
                dfs(start + L)
                parts.pop()

    dfs(0)
    return res`,
        c: `static char **res, *S, cur[20];
static int cnt, n, pos[4];

static bool ok(int st, int L) {
    if (st + L > n) return false;
    if (L > 1 && S[st] == '0') return false;
    int v = 0;
    for (int i = st; i < st + L; i++) v = v * 10 + S[i] - '0';
    return v <= 255;
}

static void dfs(int start, int k) {
    if (k == 4) {
        if (start != n) return;
        int p = 0;
        for (int i = 0; i < n; i++) {
            if (i && (i == pos[1] || i == pos[2] || i == pos[3])) cur[p++] = '.';
            cur[p++] = S[i];
        }
        cur[p] = '\\0';
        res[cnt++] = strdup(cur);
        return;
    }
    int left = 4 - k;
    if (n - start < left || n - start > 3 * left) return;
    for (int L = 1; L <= 3; L++) {
        if (!ok(start, L)) continue;
        pos[k] = start;
        dfs(start + L, k + 1);
    }
}

char **restoreIpAddresses(char *s, int *returnSize) {
    S = s; n = strlen(s); cnt = 0;
    res = malloc(81 * sizeof(char *));
    dfs(0, 0);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> restoreIpAddresses(string s) {
    int n = s.size();
    vector<string> res, parts;
    auto ok = [](const string &seg) { return seg == "0" || (seg[0] != '0' && stoi(seg) <= 255); };
    function<void(int)> dfs = [&](int start) {
        if (parts.size() == 4) {
            if (start == n) res.push_back(parts[0] + "." + parts[1] + "." + parts[2] + "." + parts[3]);
            return;
        }
        int left = 4 - parts.size();
        if (n - start < left || n - start > 3 * left) return;
        for (int L = 1; L <= 3 && start + L <= n; L++) {
            string seg = s.substr(start, L);
            if (!ok(seg)) continue;
            parts.push_back(seg);
            dfs(start + L);
            parts.pop_back();
        }
    };
    dfs(0);
    return res;
}`,
        java: `List<String> restoreIpAddresses(String s) {
    List<String> res = new ArrayList<>();
    dfs(s, 0, new ArrayList<>(), res);
    return res;
}

void dfs(String s, int start, List<String> parts, List<String> res) {
    int n = s.length();
    if (parts.size() == 4) {
        if (start == n) res.add(String.join(".", parts));
        return;
    }
    int left = 4 - parts.size();
    if (n - start < left || n - start > 3 * left) return;
    for (int L = 1; L <= 3 && start + L <= n; L++) {
        String seg = s.substring(start, start + L);
        if (!seg.equals("0") && (seg.charAt(0) == '0' || Integer.parseInt(seg) > 255)) continue;
        parts.add(seg);
        dfs(s, start + L, parts, res);
        parts.remove(parts.size() - 1);
    }
}`,
        javascript: `function restoreIpAddresses(s) {
  const n = s.length, res = [], parts = [];
  const ok = (seg) => seg === '0' || (seg[0] !== '0' && Number(seg) <= 255);
  const dfs = (start) => {
    if (parts.length === 4) {
      if (start === n) res.push(parts.join('.'));
      return;
    }
    const left = 4 - parts.length;
    if (n - start < left || n - start > 3 * left) return;
    for (let L = 1; L <= 3 && start + L <= n; L++) {
      const seg = s.slice(start, start + L);
      if (!ok(seg)) continue;
      parts.push(seg);
      dfs(start + L);
      parts.pop();
    }
  };
  dfs(0);
  return res;
}`,
      },
    },
    {
      name: '三層迴圈枚舉長度',
      idea: '枚舉前三段長度 a, b, c ∈ {1,2,3},第四段長度 d = n − a − b − c 也要在 1..3;四段都合法就收下。',
      steps: ['`for a, b, c in 1..3`', '`d = n − a − b − c`,不在 1..3 跳過', '切出四段,全部合法 → 用點連起來收下'],
      figure: { title: `s = "${S}"`, steps: loopFig() },
      complexity: { time: 'O(27)', space: 'O(1)', why: '固定 27 種長度組合。' },
      verdict: '段數固定時,迴圈比遞迴更直白。',
      code: {
        python: `def restoreIpAddresses(s):
    n, res = len(s), []

    def ok(seg):
        return seg == '0' or (seg[0] != '0' and int(seg) <= 255)

    for a in range(1, 4):
        for b in range(1, 4):
            for c in range(1, 4):
                d = n - a - b - c
                if not 1 <= d <= 3:
                    continue
                segs = [s[:a], s[a:a + b], s[a + b:a + b + c], s[a + b + c:]]
                if all(ok(x) for x in segs):
                    res.append('.'.join(segs))
    return res`,
        c: `static bool ok(char *s, int st, int L) {
    if (L > 1 && s[st] == '0') return false;
    int v = 0;
    for (int i = st; i < st + L; i++) v = v * 10 + s[i] - '0';
    return v <= 255;
}

char **restoreIpAddresses(char *s, int *returnSize) {
    int n = strlen(s), cnt = 0;
    char **res = malloc(27 * sizeof(char *));
    for (int a = 1; a <= 3; a++)
        for (int b = 1; b <= 3; b++)
            for (int c = 1; c <= 3; c++) {
                int d = n - a - b - c;
                if (d < 1 || d > 3) continue;
                if (!ok(s, 0, a) || !ok(s, a, b) || !ok(s, a + b, c) || !ok(s, a + b + c, d)) continue;
                char *t = malloc(n + 4);
                sprintf(t, "%.*s.%.*s.%.*s.%.*s", a, s, b, s + a, c, s + a + b, d, s + a + b + c);
                res[cnt++] = t;
            }
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> restoreIpAddresses(string s) {
    int n = s.size();
    vector<string> res;
    auto ok = [](const string &seg) { return seg == "0" || (seg[0] != '0' && stoi(seg) <= 255); };
    for (int a = 1; a <= 3; a++)
        for (int b = 1; b <= 3; b++)
            for (int c = 1; c <= 3; c++) {
                int d = n - a - b - c;
                if (d < 1 || d > 3) continue;
                string w = s.substr(0, a), x = s.substr(a, b), y = s.substr(a + b, c), z = s.substr(a + b + c);
                if (ok(w) && ok(x) && ok(y) && ok(z)) res.push_back(w + "." + x + "." + y + "." + z);
            }
    return res;
}`,
        java: `List<String> restoreIpAddresses(String s) {
    int n = s.length();
    List<String> res = new ArrayList<>();
    for (int a = 1; a <= 3; a++)
        for (int b = 1; b <= 3; b++)
            for (int c = 1; c <= 3; c++) {
                int d = n - a - b - c;
                if (d < 1 || d > 3) continue;
                String[] seg = {s.substring(0, a), s.substring(a, a + b), s.substring(a + b, a + b + c), s.substring(a + b + c)};
                boolean good = true;
                for (String x : seg) if (!x.equals("0") && (x.charAt(0) == '0' || Integer.parseInt(x) > 255)) good = false;
                if (good) res.add(String.join(".", seg));
            }
    return res;
}`,
        javascript: `function restoreIpAddresses(s) {
  const n = s.length, res = [];
  const ok = (seg) => seg === '0' || (seg[0] !== '0' && Number(seg) <= 255);
  for (let a = 1; a <= 3; a++)
    for (let b = 1; b <= 3; b++)
      for (let c = 1; c <= 3; c++) {
        const d = n - a - b - c;
        if (d < 1 || d > 3) continue;
        const seg = [s.slice(0, a), s.slice(a, a + b), s.slice(a + b, a + b + c), s.slice(a + b + c)];
        if (seg.every(ok)) res.push(seg.join('.'));
      }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['"0" 是合法的段,"00"、"01" 不是', '最後一段沒檢查是否用完整個字串', '`int(seg)` 前沒限制長度:超長字串轉整數會溢位(C/Java)'],
  check: {
    kind: 'fn',
    fn: 'restoreIpAddresses',
    compare: 'sorted',
    cases: [
      { args: [S], out: ['255.255.11.135', '255.255.111.35'] },
      { args: ['0000'], out: ['0.0.0.0'] },
      { args: ['101023'], out: ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3'] },
      { args: ['1111111111111'], out: [] },
      { args: ['010010'], out: ['0.10.0.10', '0.100.1.0'] },
    ],
  },
}
