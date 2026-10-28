import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const SAMPLE = 'abbcccdddd'
const QUERIES = [1, 7, 5, 4, 15]

function bruteFig(): FigStep[] {
  const out: FigStep[] = []
  for (const query of QUERIES) {
    let found = false
    for (let l = 0; l < SAMPLE.length && !found; l++) {
      let weight = 0
      for (let r = l; r < SAMPLE.length && SAMPLE[r] === SAMPLE[l]; r++) {
        weight += SAMPLE.charCodeAt(r) - 96
        if (out.length < 12 || weight === query) out.push({ note: `查 ${query}：看連續區間 [${l},${r}]，每個 ${SAMPLE[l]} 重量 ${SAMPLE.charCodeAt(l) - 96}，總重 ${weight}；${weight === query ? '找到！' : '繼續找。'}`, views: [arr(SAMPLE.split(''), { label: '同字母區間', highlight: Array.from({ length: r - l + 1 }, (_, i) => l + i) }), kv([['查詢', query], ['目前總重', weight], ['找到', weight === query ? '是' : '否']]) ] })
        if (weight === query) found = true
      }
    }
  }
  return out
}

function runFig(): FigStep[] {
  const out: FigStep[] = []
  const weights = new Set<number>()
  let run = 0
  for (let i = 0; i < SAMPLE.length; i++) {
    run = i > 0 && SAMPLE[i] === SAMPLE[i - 1] ? run + SAMPLE.charCodeAt(i) - 96 : SAMPLE.charCodeAt(i) - 96
    weights.add(run)
    out.push({ note: `讀到 ${i} 的 ${SAMPLE[i]}；${i > 0 && SAMPLE[i] === SAMPLE[i - 1] ? '延長同字母區間' : '開始新區間'}，連續重量 ${run}；已收集 ${[...weights].join('、')}。`, views: [arr(SAMPLE.split(''), { label: '掃描位置', highlight: [i] }), kv([...weights].map(x => [x, '可達']), '已知重量', [run])] })
  }
  for (const q of QUERIES) out.push({ note: `查詢重量 ${q}：集合${weights.has(q) ? '包含' : '沒有'}它，輸出 ${weights.has(q) ? 'Yes' : 'No'}。`, views: [arr(QUERIES, { label: '查詢', highlight: [QUERIES.indexOf(q)] }), kv([...weights].map(x => [x, '可達']), '已知重量', [q])] })
  return out
}

export const hrWeightedUniformString: HrSolution = {
  slug: 'weighted-uniform-string',
  plain: '像把一段同款積木接起來：a 每塊值 1、b 每塊值 2；只問某個總值能否由連續同款積木組成。',
  statement: '小寫字母 a 到 z 的單字重量依序為 1 到 26。只選原字串中連續且字母相同的一段，總重量為字母重量乘段長。對每個查詢值，依原順序回答 Yes 或 No。',
  examples: [
    { input: 's = "abbcccdddd", queries = [1, 7, 5, 4, 15]', output: '["Yes", "No", "No", "Yes", "No"]', note: 'a 的重量為 1；bb 為 4。7、5、15 都無法由同字母連續段得到。' },
    { input: 's = "aaab", queries = [1, 2, 3, 4]', output: '["Yes", "Yes", "Yes", "No"]', note: 'a、aa、aaa 分別提供 1、2、3；單個 b 只提供 2。' },
  ],
  constraints: [
    's 最多 10^5 字元 → 每筆查詢都重掃子字串的做法不合適。',
    '查詢最多 10^5 筆 → 先預處理所有可能重量，再做 O(1) 平均查詢。',
    '只含 a 到 z → 字元重量 = 字碼減去 a 的字碼再加 1(a = 1、z = 26)。',
  ],
  insight: [
    '照定義先列舉每一個起點，再向右延長到不同字母為止，能得到所有重量。',
    '同一字母連續段內，新的重量等於上一個重量加上此字母重量；不必重新加總。',
    '把每一步重量放入集合，查詢直接測有無；這是 [[p:hash-map]] 的典型預處理思路。',
  ],
  approaches: [
    {
      name: '每筆查詢重列舉',
      idea: '對每個查詢，枚舉所有同字母連續子字串，直到找到重量。',
      steps: ['取出一筆查詢 q。', '選每個 l 為起點，從 l 向右走到字母改變。', '每延長一格就累加字母重量，若等於 q 就標記找到。', '依找到與否加入 Yes 或 No。'],
      figure: { title: 'abbcccdddd：逐筆查詢', steps: bruteFig() },
      complexity: { time: 'O(qn²)', space: 'O(q)', why: 'q 筆查詢各枚舉最多 O(n²) 個同字母區間；輸出需要 q 格。' },
      verdict: '直接對照定義，但重複查相同區間。',
      code: {
        python: `def weightedUniformStrings(s, queries):
    answer = []
    for query in queries:
        found = False
        for left in range(len(s)):
            weight = 0
            for right in range(left, len(s)):
                if s[right] != s[left]:
                    break
                weight += ord(s[right]) - ord('a') + 1
                if weight == query:  # 找到這筆查詢的重量
                    found = True
        answer.append('Yes' if found else 'No')
    return answer`,
        c: `char** weightedUniformStrings(char* s, int queries_count, int* queries, int* result_count) {
    int n = strlen(s);
    char** answer = malloc(sizeof(char*) * queries_count);
    *result_count = queries_count;
    for (int k = 0; k < queries_count; k++) {
        int found = 0;
        for (int l = 0; l < n; l++) {
            int weight = 0;
            for (int r = l; r < n && s[r] == s[l]; r++) {
                weight += s[r] - 'a' + 1;
                if (weight == queries[k]) found = 1;
            }
        }
        answer[k] = found ? "Yes" : "No";
    }
    return answer;
}`,
        cpp: `vector<string> weightedUniformStrings(string s, vector<int> queries) {
    vector<string> answer;
    for (int q : queries) {
        bool found = false;
        for (int l = 0; l < (int)s.size(); l++) {
            int weight = 0;
            for (int r = l; r < (int)s.size() && s[r] == s[l]; r++) {
                weight += s[r] - 'a' + 1;
                if (weight == q) found = true;
            }
        }
        answer.push_back(found ? "Yes" : "No");
    }
    return answer;
}`,
        java: `public static List<String> weightedUniformStrings(String s, List<Integer> queries) {
    List<String> answer = new ArrayList<>();
    for (int q : queries) {
        boolean found = false;
        for (int l = 0; l < s.length(); l++) {
            int weight = 0;
            for (int r = l; r < s.length() && s.charAt(r) == s.charAt(l); r++) {
                weight += s.charAt(r) - 'a' + 1;
                if (weight == q) found = true;
            }
        }
        answer.add(found ? "Yes" : "No");
    }
    return answer;
}`,
        javascript: `function weightedUniformStrings(s, queries) {
  const answer = [];
  for (const query of queries) {
    let found = false;
    for (let l = 0; l < s.length; l++) {
      let weight = 0;
      for (let r = l; r < s.length && s[r] === s[l]; r++) {
        weight += s.charCodeAt(r) - 96;
        if (weight === query) found = true;
      }
    }
    answer.push(found ? 'Yes' : 'No');
  }
  return answer;
}`,
      },
    },
    {
      name: '一次預處理重量集合',
      idea: '單次掃描記錄每個位置結尾的同字母連續重量，再查集合。',
      steps: ['準備集合 weights，並令 run=0。', '若目前字母和前一個相同，run 加上字母重量；否則 run 重設為字母重量。', '把 run 加入集合；掃完整個 s。', '每筆查詢測試集合是否包含該值。'],
      figure: { title: 'abbcccdddd：累積重量', steps: runFig() },
      complexity: { time: 'O(n+q)', space: 'O(n+q)', why: 'n 個字元各加入集合一次，q 筆查詢各查一次；集合與答案最多各線性大小。' },
      verdict: '最佳解；先算一次就能回答大量查詢。',
      code: {
        python: `def weightedUniformStrings(s, queries):
    weights = set()
    run = 0
    for i, ch in enumerate(s):
        value = ord(ch) - ord('a') + 1
        run = run + value if i and ch == s[i - 1] else value
        weights.add(run)  # 目前連續段的重量
    return ['Yes' if q in weights else 'No' for q in queries]`,
        c: `char** weightedUniformStrings(char* s, int queries_count, int* queries, int* result_count) {
    int maxWeight = 26 * strlen(s);
    char* seen = calloc(maxWeight + 1, 1);
    char** answer = malloc(sizeof(char*) * queries_count);
    int run = 0;
    for (int i = 0; s[i] != '\\0'; i++) {
        int value = s[i] - 'a' + 1;
        run = i > 0 && s[i] == s[i - 1] ? run + value : value;
        seen[run] = 1;
    }
    *result_count = queries_count;
    for (int i = 0; i < queries_count; i++) {
        int q = queries[i];
        answer[i] = q >= 0 && q <= maxWeight && seen[q] ? "Yes" : "No";
    }
    free(seen);
    return answer;
}`,
        cpp: `vector<string> weightedUniformStrings(string s, vector<int> queries) {
    unordered_set<int> seen;
    int run = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        int value = s[i] - 'a' + 1;
        run = i > 0 && s[i] == s[i - 1] ? run + value : value;
        seen.insert(run);
    }
    vector<string> answer;
    for (int q : queries) answer.push_back(seen.count(q) ? "Yes" : "No");
    return answer;
}`,
        java: `public static List<String> weightedUniformStrings(String s, List<Integer> queries) {
    Set<Integer> seen = new HashSet<>();
    int run = 0;
    for (int i = 0; i < s.length(); i++) {
        int value = s.charAt(i) - 'a' + 1;
        run = i > 0 && s.charAt(i) == s.charAt(i - 1) ? run + value : value;
        seen.add(run);
    }
    List<String> answer = new ArrayList<>();
    for (int q : queries) answer.add(seen.contains(q) ? "Yes" : "No");
    return answer;
}`,
        javascript: `function weightedUniformStrings(s, queries) {
  const seen = new Set();
  let run = 0;
  for (let i = 0; i < s.length; i++) {
    const value = s.charCodeAt(i) - 96;
    run = i > 0 && s[i] === s[i - 1] ? run + value : value;
    seen.add(run);
  }
  return queries.map(q => seen.has(q) ? 'Yes' : 'No');
}`,
      },
    },
  ],
  pitfalls: [
    '只能選連續且同字母的子字串，不能跨過不同字母。',
    '字母改變時 run 必須重設，不能沿用上一段重量。',
    '答案大小寫必須是 Yes 與 No，並維持查詢順序。',
  ],
  check: {
    kind: 'fn',
    fn: 'weightedUniformStrings',
    cases: [
      { args: ['abbcccdddd', [1, 7, 5, 4, 15]], out: ['Yes', 'No', 'No', 'Yes', 'No'] },
      { args: ['aaab', [1, 2, 3, 4]], out: ['Yes', 'Yes', 'Yes', 'No'] },
      { args: ['a', [1, 2]], out: ['Yes', 'No'] },
      { args: ['zzz', [26, 52, 78, 79]], out: ['Yes', 'Yes', 'Yes', 'No'] },
      { args: ['abc', [1, 2, 3, 4]], out: ['Yes', 'Yes', 'Yes', 'No'] },
      { args: ['bbbbb', [0, 2, 10, 12]], out: ['No', 'Yes', 'Yes', 'No'] },
    ],
  },
}
