import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { Solution } from './types'

// 692. Top K Frequent Words
const W = ['i', 'love', 'leetcode', 'i', 'love', 'coding']

export const q0692: Solution = {
  id: 692,
  plain: '找出最常出現的 k 個單字；次數相同時，字典序比較小的排前面。',
  statement: '給單字陣列 words 與正整數 k，依「出現次數遞減、同次數字典序遞增」回傳前 k 個不同單字。',
  examples: [{ input: 'words = ["i","love","leetcode","i","love","coding"], k = 2', output: '["i","love"]' }, { input: 'words = ["the","day","is","sunny","the","the","the","sunny","is","is"], k = 4', output: '["the","is","sunny","day"]' }],
  constraints: ['1 ≤ words.length ≤ 500；1 ≤ k ≤ 不同單字數。', '同次數時按字典序，不按首次出現順序。'],
  insight: ['先算每個字的次數，再定義雙重排序規則。', '直接排序所有不同單字最簡單；也可維持只有 k 個候選的榜單。', '計數是 [[p:hash-map]]，保留前 k 名也可用 [[p:heap]]。'],
  approaches: [
    {
      name: '計數後排序所有單字',
      idea: '每個不同單字統計次數後，依次數高到低、字典序小到大排序。',
      steps: ['統計每個單字的頻率。', '對不同單字依雙重規則排序。', '取前 k 個。'],
      figure: { title: 'words = [i,love,leetcode,i,love,coding], k = 2', steps: [
        { note: '讀完全部單字，i 和 love 各出現兩次，其餘各一次。', views: [kv([['i', 2], ['love', 2], ['leetcode', 1], ['coding', 1]], '頻率')] },
        { note: '先依次數排序，兩次的 i、love 排在一次的字前面。', views: [arr(['i', 'love', 'coding', 'leetcode'], { label: '排序後' })] },
        { note: 'i 與 love 同次數；字典序 i 比 love 小，所以 i 在前。', views: [arr(['i', 'love'], { label: '同次數排序', highlight: [0, 1] })] },
        { note: '只取前 k=2 個，得到 [i,love]。', views: [arr(['i', 'love'], { label: '結果', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n + u log u)', space: 'O(u)', why: 'n 個單字計數，u 個不同單字排序。' },
      verdict: '資料量不大時最清楚可靠。',
      code: {
        python: `from collections import Counter

def topKFrequent(words, k):
    count = Counter(words)
    ordered = sorted(count, key=lambda word: (-count[word], word))
    return ordered[:k]                  # 同次數依字典序`,
        c: `typedef struct { char *word; int count; } Entry692;

static int lex692(const void *a, const void *b) {
    return strcmp(*(char *const *)a, *(char *const *)b);
}

static int rank692(const void *a, const void *b) {
    const Entry692 *x = a;
    const Entry692 *y = b;
    if (x->count != y->count) {
        return y->count - x->count;
    }
    return strcmp(x->word, y->word);
}

char **topKFrequent(char **words, int wordsSize, int k, int *returnSize) {
    qsort(words, wordsSize, sizeof(char *), lex692);
    Entry692 *entries = malloc(wordsSize * sizeof(Entry692));
    int unique = 0;
    for (int i = 0; i < wordsSize; i++) {
        if (unique > 0 && strcmp(entries[unique - 1].word, words[i]) == 0) {
            entries[unique - 1].count++;
        } else {
            entries[unique++] = (Entry692){words[i], 1};
        }
    }
    qsort(entries, unique, sizeof(Entry692), rank692);
    char **answer = malloc(k * sizeof(char *));
    for (int i = 0; i < k; i++) {
        answer[i] = entries[i].word;
    }
    free(entries);
    *returnSize = k;
    return answer;
}`,
        cpp: `vector<string> topKFrequent(vector<string>& words, int k) {
    unordered_map<string, int> count;
    for (const string& word : words) {
        count[word]++;
    }
    vector<string> ordered;
    for (const auto& item : count) {
        ordered.push_back(item.first);
    }
    sort(ordered.begin(), ordered.end(), [&](const string& a, const string& b) {
        if (count[a] != count[b]) {
            return count[a] > count[b];
        }
        return a < b;
    });
    ordered.resize(k);
    return ordered;
}`,
        java: `List<String> topKFrequent(String[] words, int k) {
    Map<String, Integer> count = new HashMap<>();
    for (String word : words) {
        count.put(word, count.getOrDefault(word, 0) + 1);
    }
    List<String> ordered = new ArrayList<>(count.keySet());
    ordered.sort((a, b) -> {
        int byCount = Integer.compare(count.get(b), count.get(a));
        return byCount != 0 ? byCount : a.compareTo(b);
    });
    return ordered.subList(0, k);
}`,
        javascript: `function topKFrequent(words, k) {
  const count = new Map();
  for (const word of words) {
    count.set(word, (count.get(word) || 0) + 1);
  }
  const ordered = [...count.keys()];
  ordered.sort((a, b) => count.get(b) - count.get(a) || a.localeCompare(b));
  return ordered.slice(0, k);
}`,
      },
    },
    {
      name: '維持 k 名候選榜',
      idea: '逐個檢視不同單字，將新候選放入依規則排序的榜單，超過 k 名就移走最後一名。',
      steps: ['統計頻率。', '每遇一個不同字，加入榜單並依規則排序。', '榜單超過 k 個就刪最後一個，最後回傳榜單。'],
      figure: { title: 'words = [i,love,leetcode,i,love,coding], k = 2', steps: [
        { note: '次數表已建好；先放 i（兩次），榜單只有 i。', views: [arr(['i'], { label: '前 2 名', highlight: [0] })] },
        { note: '加入 love（兩次），依字典序排成 [i,love]。', views: [arr(['i', 'love'], { label: '前 2 名', highlight: [0, 1] })] },
        { note: '加入一次的 leetcode，排序後落在第三名，刪掉它。', views: [arr(['i', 'love', 'leetcode'], { label: '比較後', dim: [2] })] },
        { note: 'coding 也只有一次，仍進不了前二；結果 [i,love]。', views: [arr(['i', 'love'], { label: '結果', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n + u k log k)', space: 'O(u + k)', why: '計數後，每個不同單字最多排序 k+1 個候選。' },
      verdict: '當 k 遠小於不同單字數時只保留少量候選；可再改用堆積優化。',
      code: {
        python: `from collections import Counter

def topKFrequent(words, k):
    count = Counter(words)
    leaders = []
    for word in count:
        leaders.append(word)
        leaders.sort(key=lambda item: (-count[item], item))
        if len(leaders) > k:
            leaders.pop()               # 移掉目前最差的候選
    return leaders`,
        c: `typedef struct { char *word; int count; } Entry692;

static int lex692(const void *a, const void *b) {
    return strcmp(*(char *const *)a, *(char *const *)b);
}

static int rank692(const void *a, const void *b) {
    const Entry692 *x = a;
    const Entry692 *y = b;
    if (x->count != y->count) {
        return y->count - x->count;
    }
    return strcmp(x->word, y->word);
}

char **topKFrequent(char **words, int wordsSize, int k, int *returnSize) {
    qsort(words, wordsSize, sizeof(char *), lex692);
    Entry692 *entries = malloc(wordsSize * sizeof(Entry692));
    int unique = 0;
    for (int i = 0; i < wordsSize; i++) {
        if (unique > 0 && strcmp(entries[unique - 1].word, words[i]) == 0) {
            entries[unique - 1].count++;
        } else {
            entries[unique++] = (Entry692){words[i], 1};
        }
    }
    Entry692 *leaders = malloc((k + 1) * sizeof(Entry692));
    int size = 0;
    for (int i = 0; i < unique; i++) {
        leaders[size++] = entries[i];
        qsort(leaders, size, sizeof(Entry692), rank692);
        if (size > k) {
            size--;
        }
    }
    char **answer = malloc(k * sizeof(char *));
    for (int i = 0; i < k; i++) {
        answer[i] = leaders[i].word;
    }
    free(leaders);
    free(entries);
    *returnSize = k;
    return answer;
}`,
        cpp: `vector<string> topKFrequent(vector<string>& words, int k) {
    unordered_map<string, int> count;
    for (const string& word : words) {
        count[word]++;
    }
    vector<string> leaders;
    for (const auto& item : count) {
        leaders.push_back(item.first);
        sort(leaders.begin(), leaders.end(), [&](const string& a, const string& b) {
            if (count[a] != count[b]) {
                return count[a] > count[b];
            }
            return a < b;
        });
        if ((int)leaders.size() > k) {
            leaders.pop_back();
        }
    }
    return leaders;
}`,
        java: `List<String> topKFrequent(String[] words, int k) {
    Map<String, Integer> count = new HashMap<>();
    for (String word : words) {
        count.put(word, count.getOrDefault(word, 0) + 1);
    }
    List<String> leaders = new ArrayList<>();
    for (String word : count.keySet()) {
        leaders.add(word);
        leaders.sort((a, b) -> {
            int byCount = Integer.compare(count.get(b), count.get(a));
            return byCount != 0 ? byCount : a.compareTo(b);
        });
        if (leaders.size() > k) {
            leaders.remove(leaders.size() - 1);
        }
    }
    return leaders;
}`,
        javascript: `function topKFrequent(words, k) {
  const count = new Map();
  for (const word of words) {
    count.set(word, (count.get(word) || 0) + 1);
  }
  const leaders = [];
  for (const word of count.keys()) {
    leaders.push(word);
    leaders.sort((a, b) => count.get(b) - count.get(a) || a.localeCompare(b));
    if (leaders.length > k) {
      leaders.pop();
    }
  }
  return leaders;
}`,
      },
    },
  ],
  pitfalls: ['同次數時字典序較小者排前，不能只按頻率排序。', '取的是不同單字；頻率高的字只在答案出現一次。'],
  check: { kind: 'fn', fn: 'topKFrequent', cases: [
    { args: [W, 2], out: ['i', 'love'] }, { args: [['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4], out: ['the', 'is', 'sunny', 'day'] }, { args: [['a'], 1], out: ['a'] },
  ] },
}
