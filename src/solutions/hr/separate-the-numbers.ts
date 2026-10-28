import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = '91011'

function buildFig(): FigStep[] {
  const out: FigStep[] = [{ note: `從最短的首段開始嘗試；${SAMPLE} 至少要切成兩個數字。`, views: [arr(SAMPLE.split(''), { label: '待切字串' }), kv([['長度', SAMPLE.length]])] }]
  for (let width = 1; width <= Math.floor(SAMPLE.length / 2); width++) {
    const first = SAMPLE.slice(0, width)
    let value = BigInt(first), made = ''
    while (made.length < SAMPLE.length) {
      made += value.toString()
      out.push({ note: `首段長度 ${width}，起始 ${first}；接上 ${value} 後得到 ${made}。${SAMPLE.startsWith(made) ? '仍和原字串前綴相同' : '已不同，此起點失敗'}。`, views: [arr(SAMPLE.split(''), { label: '原字串', highlight: Array.from({ length: Math.min(made.length, SAMPLE.length) }, (_, i) => i) }), arr(made.split(''), { label: '目前組合' }), kv([['起始值', first], ['目前數字', value.toString()]]) ] })
      if (!SAMPLE.startsWith(made)) break
      value++
    }
    if (made === SAMPLE && value > BigInt(first) + 1n) {
      out.push({ note: `候選字串 ${made} 與原字串完全相同，且有多段；最小起始值為 ${first}。`, views: [arr(made.split(''), { label: '完整連號', done: Array.from({ length: made.length }, (_, i) => i) }), kv([['答案', `YES ${first}`]])] })
      break
    }
  }
  return out
}

function scanFig(): FigStep[] {
  const out: FigStep[] = [{ note: `先看 ${SAMPLE} 的首段長度；後面每一段都必須剛好比前段大一。`, views: [arr(SAMPLE.split(''), { label: '待比對字串' })] }]
  for (let width = 1; width <= Math.floor(SAMPLE.length / 2); width++) {
    const first = SAMPLE.slice(0, width)
    let next = BigInt(first) + 1n, pos = width
    out.push({ note: `假定第一段是 ${first}，指標 pos=${pos}，下個必須是 ${next}。`, views: [arr(SAMPLE.split(''), { label: '原字串', done: Array.from({ length: pos }, (_, i) => i) }), kv([['pos', pos], ['下一個', next.toString()]])] })
    while (pos < SAMPLE.length) {
      const word = next.toString(), ok = SAMPLE.startsWith(word, pos)
      out.push({ note: `在位置 ${pos} 比對期望值 ${word}：${ok ? '相符，前進 ' + word.length + ' 格' : '不符，換起始長度'}。`, views: [arr(SAMPLE.split(''), { label: '目前比對', highlight: Array.from({ length: word.length }, (_, i) => pos + i).filter(i => i < SAMPLE.length), done: Array.from({ length: pos }, (_, i) => i) }), kv([['pos', pos], ['期望', word]])] })
      if (!ok) break
      pos += word.length
      next++
    }
    if (pos === SAMPLE.length) {
      out.push({ note: `指標剛好走到位置 ${pos}，等於字串長度；從 ${first} 起的連號成立。`, views: [arr(SAMPLE.split(''), { label: '全部符合', done: Array.from({ length: SAMPLE.length }, (_, i) => i) }), kv([['答案', `YES ${first}`]])] })
      break
    }
  }
  return out
}

export const hrSeparateTheNumbers: HrSolution = {
  slug: 'separate-the-numbers',
  plain: '像一張把頁碼黏在一起的紙條：試著從開頭切出第一個頁碼，後面必須剛好是下一頁、再下一頁。',
  statement: '給一串數字字元 s，判斷能否切成至少兩個正整數，且每個都比前一個大 1、各段不得有前導零。若可行，印出 YES 與最小的可行起始數字；否則印出 NO。函式本身照 HackerRank 樣板負責輸出。',
  examples: [
    { input: 's = "91011"', output: 'YES 9', note: '切成 9、10、11，跨過位數變化仍連續。' },
    { input: 's = "101103"', output: 'NO', note: '101 之後應是 102，不是 103；其他切法也不成立。' },
  ],
  constraints: [
    's 長度至少 1 → 長度 1 不可能切成兩個數，直接 NO。',
    's 可長到 32 位字元 → 第一個數最多 16 位,C / C++ 的 long long、Java 的 long 裝得下;JavaScript 的 Number 只精確到 2^53,要用 BigInt。',
    '每段不得有前導零 → 首字元為 0 時任何起始長度都不合法。',
  ],
  insight: [
    '若知道第一段，後面數字就被「每次 +1」完全決定，不需枚舉所有切點。',
    '第一段最多佔總長一半，因為至少還要放下一個更大的數。由短到長試，第一個成功者就是最小起始值。',
    '可以先真的串接完整序列再比較；更省記憶體的方法是在原字串目前位置逐段比對，屬於 [[p:string-ops]]。',
  ],
  approaches: [
    {
      name: '建出整段候選序列',
      idea: '枚舉第一段長度，從起始值不斷加一、串接，與原字串比較。',
      steps: ['若 s 開頭是 0，回傳 NO。', '從長度 1 到 floor(n/2) 取第一段。', '從此數開始連續加一，將每個十進位表示接到候選字串，超長就停止。', '候選與 s 完全相同且至少兩段時，回傳 YES 與起始值；全部失敗回傳 NO。'],
      figure: { title: '91011：逐段建構', steps: buildFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 n/2 種首段長度，每種建立至多 n 字元的候選；暫存候選串。' },
      verdict: '易於直接驗證構造結果，會額外建立字串。',
      code: {
        python: `def sequenceAnswer(s):
    if s[0] == '0':
        return 'NO'
    for width in range(1, len(s) // 2 + 1):
        first = int(s[:width])
        value = first
        made = ''
        while len(made) < len(s):
            made += str(value)
            value += 1  # 下一段必須加一
        if made == s and value >= first + 2:
            return 'YES ' + str(first)
    return 'NO'

def separateNumbers(s):
    print(sequenceAnswer(s))`,
        c: `static void nextNumber(char* s) {
    int i = strlen(s) - 1;
    while (i >= 0 && s[i] == '9') s[i--] = '0';
    if (i >= 0) s[i]++;
    else {
        memmove(s + 1, s, strlen(s) + 1);
        s[0] = '1';
    }
}
char* sequenceAnswer(char* s) {
    int n = strlen(s);
    if (s[0] == '0') return "NO";
    for (int width = 1; width <= n / 2; width++) {
        char first[40], value[40], made[70] = "";
        memcpy(first, s, width);
        first[width] = '\\0';
        strcpy(value, first);
        int parts = 0;
        while ((int)strlen(made) < n) {
            strcat(made, value);
            parts++;
            nextNumber(value);
        }
        if (parts >= 2 && strcmp(made, s) == 0) {
            char* answer = malloc(width + 5);
            sprintf(answer, "YES %s", first);
            return answer;
        }
    }
    return "NO";
}
void separateNumbers(char* s) {
    puts(sequenceAnswer(s));
}`,
        cpp: `string sequenceAnswer(string s) {
    if (s[0] == '0') return "NO";
    for (int width = 1; width <= (int)s.size() / 2; width++) {
        string first = s.substr(0, width);
        string value = first, made;
        int parts = 0;
        while (made.size() < s.size()) {
            made += value;
            parts++;
            int i = (int)value.size() - 1;
            while (i >= 0 && value[i] == '9') value[i--] = '0';
            if (i >= 0) value[i]++;
            else value = "1" + value;
        }
        if (parts >= 2 && made == s) return "YES " + first;
    }
    return "NO";
}
void separateNumbers(string s) {
    cout << sequenceAnswer(s) << endl;
}`,
        java: `public static String sequenceAnswer(String s) {
    if (s.charAt(0) == '0') return "NO";
    for (int width = 1; width <= s.length() / 2; width++) {
        String first = s.substring(0, width);
        java.math.BigInteger value = new java.math.BigInteger(first);
        StringBuilder made = new StringBuilder();
        int parts = 0;
        while (made.length() < s.length()) {
            made.append(value);
            parts++;
            value = value.add(java.math.BigInteger.ONE);
        }
        if (parts >= 2 && made.toString().equals(s)) return "YES " + first;
    }
    return "NO";
}
public static void separateNumbers(String s) {
    System.out.println(sequenceAnswer(s));
}`,
        javascript: `function sequenceAnswer(s) {
  if (s[0] === '0') return 'NO';
  for (let width = 1; width <= Math.floor(s.length / 2); width++) {
    const first = s.slice(0, width);
    let value = BigInt(first), made = '', parts = 0;
    while (made.length < s.length) {
      made += value.toString();
      value++;
      parts++;
    }
    if (parts >= 2 && made === s) return 'YES ' + first;
  }
  return 'NO';
}
function separateNumbers(s) {
  console.log(sequenceAnswer(s));
}`,
      },
    },
    {
      name: '原字串上逐段比對',
      idea: '不建立完整候選，只在目前位置檢查下一個應有的數字。',
      steps: ['從短到長枚舉第一段；遇到前導零立即排除。', '令 pos 指向第一段後面，next 是起始值加一。', '把 next 轉成字串，只和 s 的 pos 起始處比較；相同才讓 pos 前進。', 'pos 剛好到達末尾即回傳 YES 與起始值，否則換下一種長度。'],
      figure: { title: '91011：原位比對', steps: scanFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 n/2 種起始長度，每次比對至多 n 字元；儲存大數十進位字串最多 n 格。' },
      verdict: '較省重複字串配置；大型整數仍須安全處理。',
      code: {
        python: `def sequenceAnswer(s):
    if s[0] == '0':
        return 'NO'
    for width in range(1, len(s) // 2 + 1):
        first = s[:width]
        next_value = int(first) + 1
        pos = width
        while pos < len(s):
            word = str(next_value)
            if not s.startswith(word, pos):
                break
            pos += len(word)  # 只前進已確認的字元
            next_value += 1
        if pos == len(s):
            return 'YES ' + first
    return 'NO'

def separateNumbers(s):
    print(sequenceAnswer(s))`,
        c: `static void nextNumber(char* s) {
    int i = strlen(s) - 1;
    while (i >= 0 && s[i] == '9') s[i--] = '0';
    if (i >= 0) s[i]++;
    else {
        memmove(s + 1, s, strlen(s) + 1);
        s[0] = '1';
    }
}
char* sequenceAnswer(char* s) {
    int n = strlen(s);
    if (s[0] == '0') return "NO";
    for (int width = 1; width <= n / 2; width++) {
        char first[40], value[40];
        memcpy(first, s, width);
        first[width] = '\\0';
        strcpy(value, first);
        nextNumber(value);
        int pos = width;
        while (pos < n) {
            int length = strlen(value);
            if (strncmp(s + pos, value, length) != 0) break;
            pos += length;
            nextNumber(value);
        }
        if (pos == n) {
            char* answer = malloc(width + 5);
            sprintf(answer, "YES %s", first);
            return answer;
        }
    }
    return "NO";
}
void separateNumbers(char* s) {
    puts(sequenceAnswer(s));
}`,
        cpp: `string sequenceAnswer(string s) {
    if (s[0] == '0') return "NO";
    for (int width = 1; width <= (int)s.size() / 2; width++) {
        string first = s.substr(0, width), value = first;
        int pos = width;
        while (pos < (int)s.size()) {
            int i = (int)value.size() - 1;
            while (i >= 0 && value[i] == '9') value[i--] = '0';
            if (i >= 0) value[i]++;
            else value = "1" + value;
            if (s.compare(pos, value.size(), value) != 0) break;
            pos += value.size();
        }
        if (pos == (int)s.size()) return "YES " + first;
    }
    return "NO";
}
void separateNumbers(string s) {
    cout << sequenceAnswer(s) << endl;
}`,
        java: `public static String sequenceAnswer(String s) {
    if (s.charAt(0) == '0') return "NO";
    for (int width = 1; width <= s.length() / 2; width++) {
        String first = s.substring(0, width);
        java.math.BigInteger value = new java.math.BigInteger(first);
        int pos = width;
        while (pos < s.length()) {
            value = value.add(java.math.BigInteger.ONE);
            String word = value.toString();
            if (!s.startsWith(word, pos)) break;
            pos += word.length();
        }
        if (pos == s.length()) return "YES " + first;
    }
    return "NO";
}
public static void separateNumbers(String s) {
    System.out.println(sequenceAnswer(s));
}`,
        javascript: `function sequenceAnswer(s) {
  if (s[0] === '0') return 'NO';
  for (let width = 1; width <= Math.floor(s.length / 2); width++) {
    const first = s.slice(0, width);
    let value = BigInt(first), pos = width;
    while (pos < s.length) {
      value++;
      const word = value.toString();
      if (!s.startsWith(word, pos)) break;
      pos += word.length;
    }
    if (pos === s.length) return 'YES ' + first;
  }
  return 'NO';
}
function separateNumbers(s) {
  console.log(sequenceAnswer(s));
}`,
      },
    },
  ],
  pitfalls: [
    '至少兩段；單個數字本身不能算連續序列。',
    '99 後面是 100，下一段長度可能變長。',
    '前導零不合法，不能把 01 當成 1。',
  ],
  check: {
    kind: 'fn',
    fn: 'sequenceAnswer',
    cases: [
      { args: ['91011'], out: 'YES 9' },
      { args: ['101103'], out: 'NO' },
      { args: ['12'], out: 'YES 1' },
      { args: ['1'], out: 'NO' },
      { args: ['01'], out: 'NO' },
      { args: ['9991000'], out: 'YES 999' },
      { args: ['9899'], out: 'YES 98' },
    ],
  },
}
