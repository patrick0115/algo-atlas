import { arr } from '../engine/helpers'
import type { Solution } from './types'

const W = ['bella', 'label', 'roller']

export const q1002: Solution = {
  id: 1002,
  plain: '找出每個單字都含有的字母；同一字母若每個單字都有兩個，就列兩次。',
  statement: '給小寫英文字串陣列 words，回傳所有單字的共同字母，含重複次數。輸出順序不限。',
  examples: [{ input: 'words = ["bella","label","roller"]', output: '["e","l","l"]' }, { input: 'words = ["cool","lock","cook"]', output: '["c","o"]' }],
  constraints: ['1 ≤ words.length ≤ 100；每個單字非空且只含 a 到 z。'],
  insight: ['某字母可輸出幾次，取決於它在所有單字中的最少出現次數。', '用 26 格計數表，逐字取最小值即可。'],
  approaches: [
    {
      name: '逐字母取最少次數',
      idea: '每處理一個單字，就用它的字母數量縮小目前的共同計數。',
      steps: ['共同計數先設為很大的值', '對每個單字建立 26 格局部計數', '逐字母把共同計數更新為較小值', '按共同計數輸出每個字母'],
      figure: { title: 'words = [bella,label,roller]', steps: [
        { note: 'bella 中 b、e、a 各一個，l 有兩個。', views: [arr(W, { label: '單字', highlight: [0] }), arr(['a:1', 'b:1', 'e:1', 'l:2'], { label: '目前共有' })] },
        { note: '加入 label，交集留下 a:1、b:1、e:1、l:2。', views: [arr(W, { label: '單字', highlight: [1] }), arr(['a:1', 'b:1', 'e:1', 'l:2'], { label: '目前共有' })] },
        { note: '加入 roller 後，a、b 消失；e 留一個、l 留兩個。', views: [arr(W, { label: '單字', highlight: [2] }), arr(['e:1', 'l:2'], { label: '最後交集' })] },
        { note: '依最少次數輸出 e、l、l。', views: [arr(['e', 'l', 'l'], { label: '答案', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(所有字元數 + 26w)', space: 'O(26)', why: '每個字元計數一次，每個單字再掃 26 格。' },
      verdict: '清楚呈現多重集合的交集。',
      code: {
        python: `def commonChars(words):
    common = [float('inf')] * 26
    for word in words:
        local = [0] * 26
        for ch in word:
            local[ord(ch) - 97] += 1
        for i in range(26):
            common[i] = min(common[i], local[i])  # 取每字最少次數
    answer = []
    for i in range(26):
        answer.extend([chr(97 + i)] * common[i])
    return answer`,
        c: `char **commonChars(char **words, int wordsSize, int *returnSize) {
    int common[26];
    for (int i = 0; i < 26; i++) {
        common[i] = INT_MAX;
    }
    for (int w = 0; w < wordsSize; w++) {
        int local[26] = {0};
        for (int j = 0; words[w][j] != '\\0'; j++) {
            local[words[w][j] - 'a']++;
        }
        for (int i = 0; i < 26; i++) {
            if (local[i] < common[i]) {
                common[i] = local[i];
            }
        }
    }
    *returnSize = 0;
    for (int i = 0; i < 26; i++) {
        *returnSize += common[i];
    }
    char **answer = malloc((*returnSize + 1) * sizeof(char *));
    int count = 0;
    for (int i = 0; i < 26; i++) {
        for (int j = 0; j < common[i]; j++) {
            answer[count] = malloc(2);
            answer[count][0] = 'a' + i;
            answer[count][1] = '\\0';
            count++;
        }
    }
    return answer;
}`,
        cpp: `vector<string> commonChars(vector<string>& words) {
    vector<int> common(26, INT_MAX);
    for (const string& word : words) {
        vector<int> local(26, 0);
        for (char ch : word) {
            local[ch - 'a']++;
        }
        for (int i = 0; i < 26; i++) {
            common[i] = min(common[i], local[i]);
        }
    }
    vector<string> answer;
    for (int i = 0; i < 26; i++) {
        for (int j = 0; j < common[i]; j++) {
            answer.push_back(string(1, 'a' + i));
        }
    }
    return answer;
}`,
        java: `List<String> commonChars(String[] words) {
    int[] common = new int[26];
    Arrays.fill(common, Integer.MAX_VALUE);
    for (String word : words) {
        int[] local = new int[26];
        for (char ch : word.toCharArray()) {
            local[ch - 'a']++;
        }
        for (int i = 0; i < 26; i++) {
            common[i] = Math.min(common[i], local[i]);
        }
    }
    List<String> answer = new ArrayList<>();
    for (int i = 0; i < 26; i++) {
        for (int j = 0; j < common[i]; j++) {
            answer.add(String.valueOf((char)('a' + i)));
        }
    }
    return answer;
}`,
        javascript: `function commonChars(words) {
  const common = new Array(26).fill(Infinity);
  for (const word of words) {
    const local = new Array(26).fill(0);
    for (const ch of word) {
      local[ch.charCodeAt(0) - 97]++;
    }
    for (let i = 0; i < 26; i++) {
      common[i] = Math.min(common[i], local[i]);
    }
  }
  const answer = [];
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < common[i]; j++) {
      answer.push(String.fromCharCode(97 + i));
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '逐字消耗候選字母',
      idea: '以第一個單字的字母為候選，對後續每個單字只保留能一一配到的字母。',
      steps: ['把第一個單字拆成字母候選清單', '對下一個單字建字母計數', '逐一查看候選字母；若尚有數量就保留並扣一', '對其餘單字重複'],
      figure: { title: 'words = [bella,label,roller]', steps: [
        { note: '第一個單字提供候選 b、e、l、l、a。', views: [arr(['b', 'e', 'l', 'l', 'a'], { label: '候選' })] },
        { note: 'label 有這五個字母，因此候選不變；每次匹配都扣掉該字母一次。', views: [arr(['b', 'e', 'l', 'l', 'a'], { label: '候選', done: [0, 1, 2, 3, 4] })] },
        { note: 'roller 沒有 b、a，只保留 e、l、l。', views: [arr(['e', 'l', 'l'], { label: '保留的候選', highlight: [0, 1, 2] })] },
        { note: '所有單字都比過，剩下的就是答案。', views: [arr(['e', 'l', 'l'], { label: '答案', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(所有字元數 + w×首字長)', space: 'O(首字長 + 26)', why: '每個單字計數，並掃當前候選。' },
      verdict: '候選清單會逐步變短，容易用實物配對理解。',
      code: {
        python: `def commonChars(words):
    candidates = list(words[0])
    for word in words[1:]:
        count = [0] * 26
        for ch in word:
            count[ord(ch) - 97] += 1
        kept = []
        for ch in candidates:
            index = ord(ch) - 97
            if count[index] > 0:
                kept.append(ch)
                count[index] -= 1  # 一個字母只能配一次
        candidates = kept
    return candidates`,
        c: `char **commonChars(char **words, int wordsSize, int *returnSize) {
    int length = strlen(words[0]);
    char *candidates = malloc(length + 1);
    strcpy(candidates, words[0]);
    for (int w = 1; w < wordsSize; w++) {
        int count[26] = {0};
        for (int i = 0; words[w][i] != '\\0'; i++) {
            count[words[w][i] - 'a']++;
        }
        int kept = 0;
        for (int i = 0; i < length; i++) {
            int index = candidates[i] - 'a';
            if (count[index] > 0) {
                candidates[kept++] = candidates[i];
                count[index]--;
            }
        }
        length = kept;
    }
    char **answer = malloc((length + 1) * sizeof(char *));
    for (int i = 0; i < length; i++) {
        answer[i] = malloc(2);
        answer[i][0] = candidates[i];
        answer[i][1] = '\\0';
    }
    free(candidates);
    *returnSize = length;
    return answer;
}`,
        cpp: `vector<string> commonChars(vector<string>& words) {
    string candidates = words[0];
    for (int w = 1; w < (int)words.size(); w++) {
        array<int, 26> count{};
        for (char ch : words[w]) {
            count[ch - 'a']++;
        }
        string kept;
        for (char ch : candidates) {
            if (count[ch - 'a'] > 0) {
                kept += ch;
                count[ch - 'a']--;
            }
        }
        candidates = kept;
    }
    vector<string> answer;
    for (char ch : candidates) {
        answer.push_back(string(1, ch));
    }
    return answer;
}`,
        java: `List<String> commonChars(String[] words) {
    List<String> candidates = new ArrayList<>();
    for (char ch : words[0].toCharArray()) {
        candidates.add(String.valueOf(ch));
    }
    for (int w = 1; w < words.length; w++) {
        int[] count = new int[26];
        for (char ch : words[w].toCharArray()) {
            count[ch - 'a']++;
        }
        List<String> kept = new ArrayList<>();
        for (String item : candidates) {
            int index = item.charAt(0) - 'a';
            if (count[index] > 0) {
                kept.add(item);
                count[index]--;
            }
        }
        candidates = kept;
    }
    return candidates;
}`,
        javascript: `function commonChars(words) {
  let candidates = [...words[0]];
  for (const word of words.slice(1)) {
    const count = new Array(26).fill(0);
    for (const ch of word) {
      count[ch.charCodeAt(0) - 97]++;
    }
    const kept = [];
    for (const ch of candidates) {
      const index = ch.charCodeAt(0) - 97;
      if (count[index] > 0) {
        kept.push(ch);
        count[index]--;
      }
    }
    candidates = kept;
  }
  return candidates;
}`,
      },
    },
  ],
  pitfalls: ['字母可能重複，要取最少出現次數，不能只看是否存在。', '答案順序不限；測試以排序後的陣列比較。'],
  check: { kind: 'fn', fn: 'commonChars', compare: 'sorted', cases: [
    { args: [W], out: ['e', 'l', 'l'] },
    { args: [['cool', 'lock', 'cook']], out: ['c', 'o'] },
    { args: [['aaa']], out: ['a', 'a', 'a'] },
  ] },
}
