import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 929. Unique Email Addresses

const E = ['test.email+alex@leetcode.com', 'test.e.mail+bob.cathy@leetcode.com', 'testemail+david@lee.tcode.com']

function norm(e: string): string {
  const [local, domain] = e.split('@')
  return local.split('+')[0].replace(/\./g, '') + '@' + domain
}

function splitFig(): FigStep[] {
  const out: FigStep[] = [{ note: '本地名稱(@ 前面)有兩條規則:「+」之後全部忽略、「.」直接刪掉。網域(@ 後面)完全不動。把每個地址轉成「真正會收到信的地址」,再放進集合去重', views: [arr(E, { label: 'emails' })] }]
  E.forEach((e, i) => {
    const [local, domain] = e.split('@')
    const cut = local.split('+')[0]
    out.push({ note: `"${local}" → 砍掉 + 之後:"${cut}" → 刪掉點:"${cut.replace(/\./g, '')}",接上 @${domain}`, views: [arr([norm(e)], { label: `第 ${i + 1} 個轉換後`, highlight: [0] })] })
  })
  const u = [...new Set(E.map(norm))]
  out.push({ note: `集合裡有 ${u.length} 個不同的地址 → 答案 ${u.length}`, views: [arr(u, { label: '集合', done: u.map((_, i) => i) })] })
  return out
}

function scanFig(): FigStep[] {
  return [
    { note: '不用 split:一個字一個字掃。在 @ 之前,遇到 "." 跳過、遇到 "+" 就停止收集本地名稱,直接跳到 @', views: [arr('a.b+c@x.com'.split(''), { label: '掃描', dim: [1, 3, 4], highlight: [5] })] },
    { note: '@ 之後原封不動接上 → "ab@x.com"。每個字元只看一次', views: [arr('ab@x.com'.split(''), { label: '結果', done: [0, 1, 2, 3, 4, 5, 6, 7] })] },
  ]
}

export const q0929: Solution = {
  id: 929,
  plain: '郵件地址有兩個小把戲:@ 前面的「.」會被忽略(a.b 和 ab 是同一個人),「+」後面到 @ 之間的字也會被忽略(ab+xyz 還是 ab)。給一串地址,實際上會寄到幾個不同的信箱?',
  statement: '每個 email 由本地名稱和網域名稱組成(以 @ 分隔)。本地名稱中的 `.` 會被忽略;第一個 `+` 之後到 @ 之前的內容也會被忽略。這些規則**不適用**於網域名稱。回傳實際收到信的不同地址數。',
  examples: [
    { input: 'emails = ["test.email+alex@leetcode.com","test.e.mail+bob.cathy@leetcode.com","testemail+david@lee.tcode.com"]', output: '2' },
    { input: 'emails = ["a@leetcode.com","b@leetcode.com","c@leetcode.com"]', output: '3' },
  ],
  constraints: ['最多 100 個,每個長度 ≤ 100'],
  insight: ['把每個地址「正規化」成真正的收件地址', '只處理 @ 前面:先砍掉 + 之後,再刪掉點', '正規化後放進集合,集合大小就是答案'],
  approaches: [
    {
      name: '切字串 + 集合',
      idea: '`local, domain = e.split("@")`;`local = local.split("+")[0].replace(".", "")`;放進集合。',
      steps: ['`seen = set()`', '每個 e:用 @ 切成 local、domain', '`local` 取 + 之前、刪掉所有 .', '`seen.add(local + "@" + domain)`', '回傳 `len(seen)`'],
      figure: { title: '3 個地址', steps: splitFig() },
      complexity: { time: 'O(總字元數)', space: 'O(總字元數)', why: '每個字元處理常數次;集合存正規化後的地址。' },
      verdict: '最推薦,一行一個規則,好讀不易錯。',
      code: {
        python: `def numUniqueEmails(emails):
    seen = set()
    for e in emails:
        local, domain = e.split('@')
        local = local.split('+')[0].replace('.', '')   # + 之後不要、點刪掉
        seen.add(local + '@' + domain)                 # 網域不動
    return len(seen)`,
        c: `// 正規化後放進陣列,排序再數不同的(C 沒有內建集合)
static int cmp(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

int numUniqueEmails(char **emails, int emailsSize) {
    char **out = malloc(emailsSize * sizeof(char *));
    for (int i = 0; i < emailsSize; i++) {
        char *e = emails[i], *r = malloc(strlen(e) + 1);
        char *at = strchr(e, '@');
        int k = 0;
        for (char *p = e; p < at && *p != '+'; p++)
            if (*p != '.') r[k++] = *p;
        strcpy(r + k, at);                    // 從 @ 開始原封不動
        out[i] = r;
    }
    qsort(out, emailsSize, sizeof(char *), cmp);
    int cnt = 0;
    for (int i = 0; i < emailsSize; i++)
        if (i == 0 || strcmp(out[i], out[i - 1])) cnt++;
    for (int i = 0; i < emailsSize; i++) free(out[i]);
    free(out);
    return cnt;
}`,
        cpp: `int numUniqueEmails(vector<string>& emails) {
    unordered_set<string> seen;
    for (auto &e : emails) {
        size_t at = e.find('@');
        string local = e.substr(0, min(at, e.find('+')));
        local.erase(remove(local.begin(), local.end(), '.'), local.end());
        seen.insert(local + e.substr(at));
    }
    return seen.size();
}`,
        java: `int numUniqueEmails(String[] emails) {
    Set<String> seen = new HashSet<>();
    for (String e : emails) {
        int at = e.indexOf('@');
        String local = e.substring(0, at);
        int plus = local.indexOf('+');
        if (plus >= 0) local = local.substring(0, plus);
        seen.add(local.replace(".", "") + e.substring(at));
    }
    return seen.size();
}`,
        javascript: `function numUniqueEmails(emails) {
  const seen = new Set();
  for (const e of emails) {
    const [local, domain] = e.split('@');
    seen.add(local.split('+')[0].replaceAll('.', '') + '@' + domain);
  }
  return seen.size;
}`,
      },
    },
    {
      name: '逐字掃描',
      idea: '一個字一個字讀:@ 之前跳過 "."、遇到 "+" 就跳到 @;@ 之後全部照抄。',
      steps: ['每個 e:`i = 0`,建立結果字串', '`e[i] != "@"`:是 "+" → 跳到 @;是 "." → 跳過;否則加入', '把 @ 之後全部接上;放進集合'],
      figure: { title: '"a.b+c@x.com"', steps: scanFig() },
      complexity: { time: 'O(總字元數)', space: 'O(總字元數)', why: '每個字元看一次。' },
      verdict: '不產生中間字串,效率稍好;規則多的時候這種寫法比較容易擴充。',
      code: {
        python: `def numUniqueEmails(emails):
    seen = set()
    for e in emails:
        buf, i = [], 0
        while e[i] != '@':
            if e[i] == '+':
                i = e.index('@')              # 後面直到 @ 都忽略
                break
            if e[i] != '.':
                buf.append(e[i])
            i += 1
        seen.add(''.join(buf) + e[i:])        # e[i] 是 @
    return len(seen)`,
        c: `static int cmp(const void *a, const void *b) { return strcmp(*(char **)a, *(char **)b); }

int numUniqueEmails(char **emails, int emailsSize) {
    char **out = malloc(emailsSize * sizeof(char *));
    for (int i = 0; i < emailsSize; i++) {
        char *e = emails[i], *r = malloc(strlen(e) + 1);
        int k = 0, j = 0;
        while (e[j] != '@') {
            if (e[j] == '+') { while (e[j] != '@') j++; break; }
            if (e[j] != '.') r[k++] = e[j];
            j++;
        }
        strcpy(r + k, e + j);
        out[i] = r;
    }
    qsort(out, emailsSize, sizeof(char *), cmp);
    int cnt = 0;
    for (int i = 0; i < emailsSize; i++)
        if (i == 0 || strcmp(out[i], out[i - 1])) cnt++;
    for (int i = 0; i < emailsSize; i++) free(out[i]);
    free(out);
    return cnt;
}`,
        cpp: `int numUniqueEmails(vector<string>& emails) {
    unordered_set<string> seen;
    for (auto &e : emails) {
        string r;
        size_t i = 0;
        while (e[i] != '@') {
            if (e[i] == '+') { i = e.find('@'); break; }
            if (e[i] != '.') r += e[i];
            i++;
        }
        seen.insert(r + e.substr(i));
    }
    return seen.size();
}`,
        java: `int numUniqueEmails(String[] emails) {
    Set<String> seen = new HashSet<>();
    for (String e : emails) {
        StringBuilder r = new StringBuilder();
        int i = 0;
        while (e.charAt(i) != '@') {
            if (e.charAt(i) == '+') { i = e.indexOf('@'); break; }
            if (e.charAt(i) != '.') r.append(e.charAt(i));
            i++;
        }
        seen.add(r.append(e.substring(i)).toString());
    }
    return seen.size();
}`,
        javascript: `function numUniqueEmails(emails) {
  const seen = new Set();
  for (const e of emails) {
    let r = '', i = 0;
    while (e[i] !== '@') {
      if (e[i] === '+') {
        i = e.indexOf('@');
        break;
      }
      if (e[i] !== '.') r += e[i];
      i++;
    }
    seen.add(r + e.slice(i));
  }
  return seen.size;
}`,
      },
    },
  ],
  pitfalls: ['把網域裡的點也刪掉:"lee.tcode.com" 和 "leetcode.com" 是不同網域', '只刪第一個點(像 JavaScript 的 replace 只換第一個):要用 replaceAll 或正規表示式 /g'],
  check: {
    kind: 'fn',
    fn: 'numUniqueEmails',
    cases: [
      { args: [E], out: 2 },
      { args: [['a@leetcode.com', 'b@leetcode.com', 'c@leetcode.com']], out: 3 },
      { args: [['a.b.c@x.com', 'abc+zz@x.com', 'abc@y.com']], out: 2 },
      { args: [['+abc@x.com', '@x.com']], out: 1 },
    ],
  },
}
