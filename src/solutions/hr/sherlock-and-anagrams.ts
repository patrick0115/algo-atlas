import { arr } from '../../engine/helpers'
import { count26, kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

function compareFig(): FigStep[] {
  const s = 'mom', out: FigStep[] = []
  let pairs = 0
  for (let len = 1; len < s.length; len++) {
    for (let i = 0; i + len <= s.length; i++) {
      for (let j = i + 1; j + len <= s.length; j++) {
        const a = s.slice(i, i + len), b = s.slice(j, j + len)
        const same = [...a].sort().join('') === [...b].sort().join('')
        if (same) pairs++
        out.push({ note: `長 ${len} 的片段 ${a} 與 ${b}：排序後${same ? '相同，是重排配對' : '不同'}；目前 ${pairs} 對。`, views: [arr(s.split(''), { label: '字串', highlight: [...Array(len)].map((_, k) => i + k), done: [...Array(len)].map((_, k) => j + k) }), arr([len, i, j, pairs], { label: '長度 / 左起點 / 右起點 / 總對數' })] })
      }
    }
  }
  return out
}

function signatureFig(): FigStep[] {
  const s = 'mom', seen = new Map<string, number>(), out: FigStep[] = []
  let pairs = 0
  for (let i = 0; i < s.length; i++) {
    const count = Array(26).fill(0)
    for (let j = i; j < s.length; j++) {
      count[s.charCodeAt(j) - 97]++
      const key = count.join(',')
      const old = seen.get(key) ?? 0
      pairs += old
      seen.set(key, old + 1)
      out.push({ note: `片段 [${i},${j}] = ${s.slice(i, j + 1)}：這個字母次數簽名先前出現 ${old} 次，因此新增 ${old} 對；累計 ${pairs}。`, views: [arr(s.split(''), { label: '目前片段', highlight: Array.from({ length: j - i + 1 }, (_, k) => i + k) }), count26(count, '目前字母次數'), kv([...seen.entries()].map(([k, v]) => [k.split(',').flatMap((x, c) => Number(x) ? `${'abcdefghijklmnopqrstuvwxyz'[c]}:${x}` : []).join(' '), v] as [string, number]), '簽名出現次數'), arr([pairs], { label: '答案' })] })
    }
  }
  return out
}

export const hrSherlockAndAnagrams: HrSolution = {
  slug: 'sherlock-and-anagrams',
  plain: '把每段字母當成一袋拼字積木：袋內順序不重要，只要各字母數量一樣，兩袋就能拼成同樣的字。',
  statement: '輸入小寫字串 s，選出兩個起點不同、長度相同的連續子字串。若其中一段重排後可變成另一段，算一組無序配對；回傳全部配對數。',
  examples: [
    { input: 's = "mom"', output: '2', note: '兩個 m 互配；mo 與 om 也互配。' },
    { input: 's = "abba"', output: '4', note: '單字母 a、b 各一對，長度二的 ab 與 ba 一對，長度三的 abb 與 bba 一對。' },
  ],
  constraints: [
    '2 ≤ |s| ≤ 100 → O(n²) 枚舉片段可行，但再兩兩比較全部片段會膨脹。',
    '字母只在 a 到 z → 26 格次數可當成固定長簽名。',
    '配對無順序且可重疊 → 每個新片段只與先前同簽名片段配對，避免雙算。',
  ],
  insight: [
    '先枚舉同長的兩個片段，排序各自字母後比較；正確但同一片段會被重複處理。',
    '字母重排是否相同，等價於 26 個字母的出現次數是否逐格相同。',
    '掃描每個起點並逐步擴張終點；一邊更新次數簽名，一邊查 [[p:hash-map]] 中相同簽名已出現幾次。',
  ],
  approaches: [
    {
      name: '兩兩片段排序比較',
      idea: '枚舉同長片段對，將字母排序後檢查是否相同。',
      steps: ['由長度 1 到 n−1 枚舉。', '選第一段起點 i，再選較右邊的起點 j。', '取出兩段，排序字母後比較；相同就把答案加一。'],
      figure: { title: 's = mom', steps: compareFig() },
      complexity: { time: 'O(n⁴ log n)', space: 'O(n)', why: '長度與兩起點有 O(n³) 組，每組排序長度最多 n 的片段。' },
      verdict: '定義直觀，可用於短字串驗證最佳解。',
      code: {
        python: `def sherlockAndAnagrams(s):
    answer = 0
    for length in range(1, len(s)):
        for i in range(len(s) - length + 1):
            for j in range(i + 1, len(s) - length + 1):
                a = sorted(s[i:i + length])
                b = sorted(s[j:j + length])
                if a == b:  # 排序後相同就是重排字
                    answer += 1
    return answer`,
        c: `int sameLetters(char* s, int i, int j, int length) {
    int count[26] = {0};
    for (int k = 0; k < length; k++) {
        count[s[i + k] - 'a']++;
        count[s[j + k] - 'a']--;
    }
    for (int k = 0; k < 26; k++) if (count[k] != 0) return 0;
    return 1;
}

int sherlockAndAnagrams(char* s) {
    int n = strlen(s), answer = 0;
    for (int length = 1; length < n; length++) {
        for (int i = 0; i + length <= n; i++) {
            for (int j = i + 1; j + length <= n; j++) {
                answer += sameLetters(s, i, j, length);
            }
        }
    }
    return answer;
}`,
        cpp: `int sherlockAndAnagrams(string s) {
    int answer = 0, n = s.size();
    for (int length = 1; length < n; length++) {
        for (int i = 0; i + length <= n; i++) {
            for (int j = i + 1; j + length <= n; j++) {
                string a = s.substr(i, length), b = s.substr(j, length);
                sort(a.begin(), a.end());
                sort(b.begin(), b.end());
                if (a == b) answer++;
            }
        }
    }
    return answer;
}`,
        java: `public static int sherlockAndAnagrams(String s) {
    int answer = 0, n = s.length();
    for (int length = 1; length < n; length++) {
        for (int i = 0; i + length <= n; i++) {
            for (int j = i + 1; j + length <= n; j++) {
                char[] a = s.substring(i, i + length).toCharArray();
                char[] b = s.substring(j, j + length).toCharArray();
                Arrays.sort(a);
                Arrays.sort(b);
                if (Arrays.equals(a, b)) answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function sherlockAndAnagrams(s) {
  let answer = 0;
  for (let length = 1; length < s.length; length++) {
    for (let i = 0; i + length <= s.length; i++) {
      for (let j = i + 1; j + length <= s.length; j++) {
        const a = [...s.slice(i, i + length)].sort().join('');
        const b = [...s.slice(j, j + length)].sort().join('');
        if (a === b) answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '字母次數簽名計數',
      idea: '相同簽名的新片段，能與每個舊片段各組成一對。',
      steps: ['建立簽名到已見次數的表，答案從 0 開始。', '枚舉起點 i，建立 26 格零次數。', '逐步延伸終點 j，把 s[j] 的次數加一。', '用目前 26 格組成簽名，答案加上此簽名舊次數，再把次數加一。'],
      figure: { title: 's = mom', steps: signatureFig() },
      complexity: { time: 'O(26n²)', space: 'O(26n²)', why: 'O(n²) 段各建立 26 格簽名;最多也有 O(n²) 種簽名。這是用雜湊表分組的版本;C 版改用排序分組、C++ 用有序 map,時間會多一個 log n。' },
      verdict: '每段只處理一次，兼顧重複字母與無序配對。',
      code: {
        python: `def sherlockAndAnagrams(s):
    seen = {}
    answer = 0
    for i in range(len(s)):
        count = [0] * 26
        for j in range(i, len(s)):
            count[ord(s[j]) - ord('a')] += 1
            key = tuple(count)  # 字母數量就是重排簽名
            answer += seen.get(key, 0)
            seen[key] = seen.get(key, 0) + 1
    return answer`,
        c: `typedef struct { unsigned char count[26]; } Signature;

int compareSignature(const void* a, const void* b) {
    return memcmp(((const Signature*)a)->count, ((const Signature*)b)->count, 26);
}

int sherlockAndAnagrams(char* s) {
    int n = strlen(s), size = n * (n + 1) / 2, used = 0;
    Signature* signatures = malloc(sizeof(Signature) * size);
    for (int i = 0; i < n; i++) {
        unsigned char count[26] = {0};
        for (int j = i; j < n; j++) {
            count[s[j] - 'a']++;
            memcpy(signatures[used++].count, count, 26);
        }
    }
    qsort(signatures, used, sizeof(Signature), compareSignature);
    int answer = 0, run = 1;
    for (int i = 1; i <= used; i++) {
        if (i < used && compareSignature(&signatures[i - 1], &signatures[i]) == 0) run++;
        else { answer += run * (run - 1) / 2; run = 1; }
    }
    free(signatures);
    return answer;
}`,
        cpp: `int sherlockAndAnagrams(string s) {
    map<array<int, 26>, int> seen;
    int answer = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        array<int, 26> count{};
        for (int j = i; j < (int)s.size(); j++) {
            count[s[j] - 'a']++;
            answer += seen[count];
            seen[count]++;
        }
    }
    return answer;
}`,
        java: `public static int sherlockAndAnagrams(String s) {
    Map<String, Integer> seen = new HashMap<>();
    int answer = 0;
    for (int i = 0; i < s.length(); i++) {
        int[] count = new int[26];
        for (int j = i; j < s.length(); j++) {
            count[s.charAt(j) - 'a']++;
            String key = Arrays.toString(count);
            int old = seen.getOrDefault(key, 0);
            answer += old;
            seen.put(key, old + 1);
        }
    }
    return answer;
}`,
        javascript: `function sherlockAndAnagrams(s) {
  const seen = new Map();
  let answer = 0;
  for (let i = 0; i < s.length; i++) {
    const count = Array(26).fill(0);
    for (let j = i; j < s.length; j++) {
      count[s.charCodeAt(j) - 97]++;
      const key = count.join(',');
      const old = seen.get(key) || 0;
      answer += old;
      seen.set(key, old + 1);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '同長片段才可能互為重排；簽名本身已含長度資訊。',
    '配對是無序的，掃描時只與先前片段配對即可，不能再除以二。',
    '相同字母重複出現要記次數，單純 Set 無法區分 aab 與 abb。',
  ],
  check: {
    kind: 'fn', fn: 'sherlockAndAnagrams',
    cases: [
      { args: ['mom'], out: 2 },
      { args: ['abba'], out: 4 },
      { args: ['ab'], out: 0 },
      { args: ['aa'], out: 1 },
      { args: ['abcd'], out: 0 },
      { args: ['kkkk'], out: 10 },
    ],
  },
}
