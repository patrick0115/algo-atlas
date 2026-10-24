import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 151. Reverse Words in a String
export const q0151: Solution = {
  id: 151,
  plain: '把一句話的單字順序反過來，單字內部的字母順序不變，並整理多餘空白。',
  statement: '給字串 s，回傳單字順序相反的字串。單字由非空白字元組成；輸出只在相鄰單字間留一個空格。',
  examples: [{ input: 's = "the sky is blue"', output: '"blue is sky the"' }, { input: 's = "  hello world  "', output: '"world hello"' }],
  constraints: ['1 ≤ s.length ≤ 10⁴；保證至少有一個單字。'],
  insight: ['先切成單字，再逆序連接是最直接的 [[p:string-ops]]。', '也可以從右向左找每個單字，略過連續空白，直接按答案順序輸出。'],
  approaches: [
    {
      name: '切詞後反轉',
      idea: '把空白視為分隔符，取得單字陣列後反轉並用單一空格連接。',
      steps: ['略過開頭、結尾與連續空白，切出單字。', '反轉單字陣列。', '用單一空格連接。'],
      figure: { title: 's = "  hello   world  "', steps: [
        { note: '原字串開頭、結尾和中間都有多餘空白。', views: [arr([' ', ' ', 'hello', ' ', ' ', ' ', 'world', ' ', ' '], { label: '輸入' })] },
        { note: '切詞時略過空白，只留下 [hello, world]。', views: [arr(['hello', 'world'], { label: '單字' })] },
        { note: '反轉單字順序，得到 [world, hello]。', views: [arr(['world', 'hello'], { label: '逆序', highlight: [0, 1] })] },
        { note: '只用一個空格連接，得到「world hello」。', views: [arr(['world', 'hello'], { label: '輸出', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個字元讀寫常數次，另存單字與輸出。' },
      verdict: '最易讀；內建 split 行為要留意連續空白。',
      code: {
        python: `def reverseWords(s):
    words = s.split()                   # 自動略過連續空白
    words.reverse()
    return ' '.join(words)`,
        c: `char *reverseWords(char *s) {
    int n = strlen(s);
    char *copy = malloc(n + 1);
    strcpy(copy, s);
    char **words = malloc((n + 1) * sizeof(char *));
    int count = 0;
    char *word = strtok(copy, " ");
    while (word) {
        words[count++] = word;
        word = strtok(NULL, " ");
    }
    char *answer = malloc(n + 1);
    int size = 0;
    for (int i = count - 1; i >= 0; i--) {
        if (size > 0) {
            answer[size++] = ' ';
        }
        int length = strlen(words[i]);
        memcpy(answer + size, words[i], length);
        size += length;
    }
    answer[size] = 0;
    free(words);
    free(copy);
    return answer;
}`,
        cpp: `string reverseWords(string s) {
    istringstream input(s);
    vector<string> words;
    string word;
    while (input >> word) {
        words.push_back(word);
    }
    reverse(words.begin(), words.end());
    string answer;
    for (const string& part : words) {
        if (!answer.empty()) {
            answer += ' ';
        }
        answer += part;
    }
    return answer;
}`,
        java: `String reverseWords(String s) {
    String[] words = s.trim().split(" +");
    StringBuilder answer = new StringBuilder();
    for (int i = words.length - 1; i >= 0; i--) {
        if (answer.length() > 0) {
            answer.append(' ');
        }
        answer.append(words[i]);
    }
    return answer.toString();
}`,
        javascript: `function reverseWords(s) {
  const words = s.trim().split(/ +/);
  words.reverse();
  return words.join(' ');
}`,
      },
    },
    {
      name: '從右往左擷取單字',
      idea: '從尾端往前掃，找到的第一個單字就是輸出的第一個。',
      steps: ['指標從尾端出發，先跳過空白。', '記下單字結尾，向左走到空白，擷取該單字。', '重複到開頭，單字間加入一個空格。'],
      figure: { title: 's = "  hello   world  "', steps: [
        { note: '從尾端跳過兩個空白，先碰到 world 的 d。', views: [arr(['hello', 'world'], { label: '掃描方向', highlight: [1] })] },
        { note: '向左找到 world 的起點，把 world 放入結果。', views: [arr(['world'], { label: '目前結果', done: [0] })] },
        { note: '略過中間三個空白，再擷取 hello。', views: [arr(['world', 'hello'], { label: '已擷取單字', highlight: [1] })] },
        { note: '到達開頭後停止，以單一空格連接。', views: [arr(['world', 'hello'], { label: '結果', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '只掃一次，輸出最多 n 個字元。' },
      verdict: '不用另外反轉單字陣列，適合展示指標掃描。',
      code: {
        python: `def reverseWords(s):
    answer = []
    index = len(s) - 1
    while index >= 0:
        while index >= 0 and s[index] == ' ':
            index -= 1                    # 略過多餘空白
        end = index
        while index >= 0 and s[index] != ' ':
            index -= 1
        if end >= 0:
            answer.append(s[index + 1:end + 1])
    return ' '.join(answer)`,
        c: `char *reverseWords(char *s) {
    int n = strlen(s);
    char *answer = malloc(n + 1);
    int size = 0;
    int index = n - 1;
    while (index >= 0) {
        while (index >= 0 && s[index] == ' ') {
            index--;
        }
        int end = index;
        while (index >= 0 && s[index] != ' ') {
            index--;
        }
        if (end >= 0) {
            if (size > 0) {
                answer[size++] = ' ';
            }
            for (int j = index + 1; j <= end; j++) {
                answer[size++] = s[j];
            }
        }
    }
    answer[size] = 0;
    return answer;
}`,
        cpp: `string reverseWords(string s) {
    string answer;
    int index = (int)s.size() - 1;
    while (index >= 0) {
        while (index >= 0 && s[index] == ' ') {
            index--;
        }
        int end = index;
        while (index >= 0 && s[index] != ' ') {
            index--;
        }
        if (end >= 0) {
            if (!answer.empty()) {
                answer += ' ';
            }
            answer += s.substr(index + 1, end - index);
        }
    }
    return answer;
}`,
        java: `String reverseWords(String s) {
    StringBuilder answer = new StringBuilder();
    int index = s.length() - 1;
    while (index >= 0) {
        while (index >= 0 && s.charAt(index) == ' ') {
            index--;
        }
        int end = index;
        while (index >= 0 && s.charAt(index) != ' ') {
            index--;
        }
        if (end >= 0) {
            if (answer.length() > 0) {
                answer.append(' ');
            }
            answer.append(s, index + 1, end + 1);
        }
    }
    return answer.toString();
}`,
        javascript: `function reverseWords(s) {
  const answer = [];
  let index = s.length - 1;
  while (index >= 0) {
    while (index >= 0 && s[index] === ' ') {
      index--;
    }
    const end = index;
    while (index >= 0 && s[index] !== ' ') {
      index--;
    }
    if (end >= 0) {
      answer.push(s.slice(index + 1, end + 1));
    }
  }
  return answer.join(' ');
}`,
      },
    },
  ],
  pitfalls: ['輸出不可保留開頭、結尾或連續空白。', '反轉的是單字順序，不能反轉單字內的字母。'],
  check: { kind: 'fn', fn: 'reverseWords', cases: [
    { args: ['the sky is blue'], out: 'blue is sky the' }, { args: ['  hello world  '], out: 'world hello' }, { args: ['a good   example'], out: 'example good a' },
  ] },
}
