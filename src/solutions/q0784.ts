import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const branchFig: FigStep[] = [
  { note: '從 "a1b2" 開始，第一個 a 可保持小寫或改大寫，形成兩條分支。', views: [arr(['a1b2', 'A1b2'], { label: 'a 的兩種選法' })] },
  { note: '數字 1 不變，直接走到下一個位置。', views: [arr(['a1b2', 'A1b2'], { label: '處理到數字 1', done: [0, 1] })] },
  { note: '第二個字母 b 再各分成小寫與大寫，得到四條分支。', views: [arr(['a1b2', 'a1B2', 'A1b2', 'A1B2'], { label: '所有分支' })] },
  { note: '數字 2 不變，走到字串結尾後收集四個答案。', views: [arr(['a1b2', 'a1B2', 'A1b2', 'A1B2'], { label: '答案', done: [0, 1, 2, 3] })] },
]
const maskFig: FigStep[] = [
  { note: '字母只在索引 0 與 2，分別由遮罩的第 0、1 個位元決定大小寫。', views: [arr(['a', '1', 'b', '2'], { label: '字串', highlight: [0, 2] })] },
  { note: '遮罩 00：兩個字母都保持小寫，得到 "a1b2"。', views: [arr(['a1b2'], { label: '00 的結果' })] },
  { note: '遮罩 01：a 變大寫，得到 "A1b2"；遮罩 10：b 變大寫，得到 "a1B2"。', views: [arr(['A1b2', 'a1B2'], { label: '01 / 10 的結果' })] },
  { note: '遮罩 11：兩個都變大寫，得到 "A1B2"；共 2²=4 種。', views: [arr(['a1b2', 'A1b2', 'a1B2', 'A1B2'], { label: '答案', done: [0, 1, 2, 3] })] },
]

export const q0784: Solution = {
  id: 784,
  plain: '保留字串裡的數字，讓每個英文字母自行選大寫或小寫，列出所有可能字串。',
  statement: '給含英文字母與數字的 s。每個字母可改成小寫或大寫，數字不變。回傳所有不同結果，順序不限。',
  examples: [{ input: 's = "a1b2"', output: '["a1b2","a1B2","A1b2","A1B2"]' }, { input: 's = "3z4"', output: '["3z4","3Z4"]' }],
  constraints: ['字串長度至多 12；若有 L 個字母，答案正好有 2ᴸ 個。', '回傳順序不限，測試會排序後比較。'],
  insight: ['數字只有一種選擇，字母有兩種；因此可用 [[p:backtracking]] 在字母處分支。', '也能把每個字母的大小寫選擇編成位元遮罩，枚舉 0..2ᴸ−1。'],
  approaches: [
    {
      name: '回溯逐字分支', idea: '遇字母便試小寫與大寫；遇數字原樣往下，走到結尾收集字串。',
      steps: ['維持目前組成的字元陣列。', '數字只有一條分支。', '字母分小寫、大寫兩條分支。', '走到字串結尾時複製結果。'],
      figure: { title: 's = a1b2', steps: branchFig },
      complexity: { time: 'O(n·2ᴸ)', space: 'O(n·2ᴸ)', why: '共 2ᴸ 答案，每個長度 n；輸出本身佔主要空間。' },
      verdict: '推薦解法，直接對應選擇樹。',
      code: {
        python: `def letterCasePermutation(s):
    answer = []
    path = list(s)

    def dfs(index):
        if index == len(s):
            answer.append(''.join(path))  # 完成一種大小寫組合
            return
        if s[index].isdigit():
            dfs(index + 1)
        else:
            path[index] = s[index].lower()
            dfs(index + 1)
            path[index] = s[index].upper()
            dfs(index + 1)

    dfs(0)
    return answer`,
        c: `static void dfs784(char *s, int index, int length, char *path, char **result, int *count) {
    if (index == length) {
        result[*count] = malloc(length + 1);
        memcpy(result[*count], path, length);
        result[*count][length] = '\\0';
        (*count)++;
        return;
    }
    if (s[index] >= '0' && s[index] <= '9') {
        path[index] = s[index];
        dfs784(s, index + 1, length, path, result, count);
    } else {
        path[index] = (char) tolower((unsigned char) s[index]);
        dfs784(s, index + 1, length, path, result, count);
        path[index] = (char) toupper((unsigned char) s[index]);
        dfs784(s, index + 1, length, path, result, count);
    }
}

char **letterCasePermutation(char *s, int *returnSize) {
    int length = strlen(s);
    int letters = 0;
    for (int i = 0; i < length; i++) {
        if (isalpha((unsigned char) s[i])) {
            letters++;
        }
    }
    char **result = malloc((1 << letters) * sizeof(char *));
    char *path = malloc(length + 1);
    *returnSize = 0;
    dfs784(s, 0, length, path, result, returnSize);
    free(path);
    return result;
}`,
        cpp: `vector<string> letterCasePermutation(string s) {
    vector<string> result;
    string path = s;
    function<void(int)> dfs = [&](int index) {
        if (index == (int) s.size()) {
            result.push_back(path);
            return;
        }
        if (isdigit((unsigned char) s[index])) {
            dfs(index + 1);
        } else {
            path[index] = tolower((unsigned char) s[index]);
            dfs(index + 1);
            path[index] = toupper((unsigned char) s[index]);
            dfs(index + 1);
        }
    };
    dfs(0);
    return result;
}`,
        java: `void dfs(char[] source, char[] path, int index, List<String> result) {
    if (index == source.length) {
        result.add(new String(path));
        return;
    }
    if (Character.isDigit(source[index])) {
        path[index] = source[index];
        dfs(source, path, index + 1, result);
    } else {
        path[index] = Character.toLowerCase(source[index]);
        dfs(source, path, index + 1, result);
        path[index] = Character.toUpperCase(source[index]);
        dfs(source, path, index + 1, result);
    }
}

List<String> letterCasePermutation(String s) {
    List<String> result = new ArrayList<>();
    char[] source = s.toCharArray();
    dfs(source, source.clone(), 0, result);
    return result;
}`,
        javascript: `function letterCasePermutation(s) {
  const result = [];
  const path = s.split('');
  function dfs(index) {
    if (index === s.length) {
      result.push(path.join(''));
      return;
    }
    if (s[index] >= '0' && s[index] <= '9') {
      dfs(index + 1);
    } else {
      path[index] = s[index].toLowerCase();
      dfs(index + 1);
      path[index] = s[index].toUpperCase();
      dfs(index + 1);
    }
  }
  dfs(0);
  return result;
}`,
      },
    },
    {
      name: '位元遮罩列舉選擇', idea: '給每個字母一個位元，0 選小寫、1 選大寫；列舉所有遮罩。',
      steps: ['先找出所有字母的位置。', '枚舉 0 到 2ᴸ−1 的遮罩。', '對每個字母按對應位元設定大小寫。', '把組成的字串加入答案。'],
      figure: { title: 's = a1b2', steps: maskFig },
      complexity: { time: 'O(n·2ᴸ)', space: 'O(n·2ᴸ)', why: '每個遮罩產生一個長度 n 的結果。' },
      verdict: '適合練習位元列舉固定數量的二選一。',
      code: {
        python: `def letterCasePermutation(s):
    positions = [i for i, ch in enumerate(s) if ch.isalpha()]
    answer = []
    for mask in range(1 << len(positions)):
        chars = list(s)
        for bit, index in enumerate(positions):
            chars[index] = s[index].upper() if mask & (1 << bit) else s[index].lower()
        answer.append(''.join(chars))  # 一個遮罩對應一種結果
    return answer`,
        c: `char **letterCasePermutation(char *s, int *returnSize) {
    int length = strlen(s);
    int positions[12];
    int letters = 0;
    for (int i = 0; i < length; i++) {
        if (isalpha((unsigned char) s[i])) {
            positions[letters++] = i;
        }
    }
    int count = 1 << letters;
    char **result = malloc(count * sizeof(char *));
    for (int mask = 0; mask < count; mask++) {
        result[mask] = malloc(length + 1);
        memcpy(result[mask], s, length + 1);
        for (int bit = 0; bit < letters; bit++) {
            int index = positions[bit];
            result[mask][index] = (mask & (1 << bit)) ? toupper((unsigned char) s[index]) : tolower((unsigned char) s[index]);
        }
    }
    *returnSize = count;
    return result;
}`,
        cpp: `vector<string> letterCasePermutation(string s) {
    vector<int> positions;
    for (int i = 0; i < (int) s.size(); i++) {
        if (isalpha((unsigned char) s[i])) {
            positions.push_back(i);
        }
    }
    vector<string> result;
    for (int mask = 0; mask < (1 << positions.size()); mask++) {
        string word = s;
        for (int bit = 0; bit < (int) positions.size(); bit++) {
            int index = positions[bit];
            word[index] = (mask & (1 << bit)) ? toupper((unsigned char) s[index]) : tolower((unsigned char) s[index]);
        }
        result.push_back(word);
    }
    return result;
}`,
        java: `List<String> letterCasePermutation(String s) {
    List<Integer> positions = new ArrayList<>();
    for (int i = 0; i < s.length(); i++) {
        if (Character.isLetter(s.charAt(i))) {
            positions.add(i);
        }
    }
    List<String> result = new ArrayList<>();
    for (int mask = 0; mask < (1 << positions.size()); mask++) {
        char[] word = s.toCharArray();
        for (int bit = 0; bit < positions.size(); bit++) {
            int index = positions.get(bit);
            word[index] = (mask & (1 << bit)) != 0 ? Character.toUpperCase(s.charAt(index)) : Character.toLowerCase(s.charAt(index));
        }
        result.add(new String(word));
    }
    return result;
}`,
        javascript: `function letterCasePermutation(s) {
  const positions = [];
  for (let i = 0; i < s.length; i++) {
    if (!(/[0-9]/).test(s[i])) {
      positions.push(i);
    }
  }
  const result = [];
  for (let mask = 0; mask < (1 << positions.length); mask++) {
    const word = s.split('');
    for (let bit = 0; bit < positions.length; bit++) {
      const index = positions[bit];
      word[index] = mask & (1 << bit) ? s[index].toUpperCase() : s[index].toLowerCase();
    }
    result.push(word.join(''));
  }
  return result;
}`,
      },
    },
  ],
  pitfalls: ['數字不能改動，也不占一個遮罩位元。', '輸出順序不限，但每種組合只能出現一次。'],
  check: { kind: 'fn', fn: 'letterCasePermutation', compare: 'sorted', cases: [
    { args: ['a1b2'], out: ['a1b2', 'a1B2', 'A1b2', 'A1B2'] },
    { args: ['3z4'], out: ['3z4', '3Z4'] },
    { args: ['123'], out: ['123'] },
  ] },
}
