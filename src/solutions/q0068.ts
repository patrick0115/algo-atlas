import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 68. Text Justification

const WORDS = ['This', 'is', 'an', 'example', 'of', 'text', 'justification.']
const W = 16

function justify(words: string[], maxWidth: number): string[] {
  const res: string[] = []
  let i = 0
  while (i < words.length) {
    let j = i
    let len = 0
    while (j < words.length && len + words[j].length + (j - i) <= maxWidth) len += words[j++].length
    const gaps = j - i - 1
    if (j === words.length || gaps === 0) {
      const line = words.slice(i, j).join(' ')
      res.push(line + ' '.repeat(maxWidth - line.length))
    } else {
      const spaces = maxWidth - len
      const q = Math.floor(spaces / gaps)
      const r = spaces % gaps
      let line = ''
      for (let k = i; k < j - 1; k++) line += words[k] + ' '.repeat(q + (k - i < r ? 1 : 0))
      res.push(line + words[j - 1])
    }
    i = j
  }
  return res
}

function greedyFig(): FigStep[] {
  const lines = justify(WORDS, W)
  return [
    { note: `第一步:**貪心分行**。每行盡量多放單字,條件是「單字長度總和 + 單字之間至少一個空白」≤ ${W}`, views: [arr(WORDS, { label: 'words' })] },
    { note: '第 1 行:This(4)+ is(2)+ an(2)= 8,加 2 個空白 = 10 ≤ 16;再加 example 就變 8 + 7 + 3 = 18 > 16 → 這行放 3 個字', views: [arr(WORDS, { label: 'words', highlight: [0, 1, 2], dim: [3, 4, 5, 6] })] },
    { note: '第二步:**分配空白**。這行要補到 16,空白總數 = 16 − 8 = 8,有 2 個間隔 → 每個間隔 8 ÷ 2 = 4 個', views: [arr(lines[0].replace(/ /g, '·').split(''), { label: '第 1 行(· = 空白)' })] },
    { note: '第 2 行:example of text = 13 個字母,空白 3 個,2 個間隔 → 3 ÷ 2 = 1 餘 1:**餘數從左邊開始多分**一個 → 左邊 2 個、右邊 1 個', views: [arr(lines[1].replace(/ /g, '·').split(''), { label: '第 2 行' })] },
    { note: '最後一行(還有只有一個單字的行):靠左對齊,單字間一個空白,右邊補空白', views: lines.map((l, i) => arr(l.replace(/ /g, '·').split(''), { label: `第 ${i + 1} 行` })) },
  ]
}

function rrFig(): FigStep[] {
  return [
    { note: '分配空白的另一種寫法:先每個間隔放 1 個空白,剩下的空白「一個一個發」,從左邊的間隔開始輪流發(round-robin)', views: [arr(['example', '·', 'of', '·', 'text'], { label: '先各放 1 個,還剩 1 個' })] },
    { note: '剩下的 1 個發給第 1 個間隔 → "example··of·text"。發完一輪還有剩就再從左邊發一輪,效果和「除法 + 餘數」一樣', views: [arr(['example', '··', 'of', '·', 'text'], { label: '發完', highlight: [1] })] },
  ]
}

export const q0068: Solution = {
  id: 68,
  plain: '把一串單字排成「左右對齊」的段落,每行剛好 maxWidth 個字元(像報紙排版)。每行盡量多放單字;單字之間的空白要平均分配,分不平均時左邊多一點。最後一行靠左就好。',
  statement: '給單字陣列 `words` 和 `maxWidth`,以**貪心**方式每行放入盡量多的單字,並讓每行剛好 maxWidth 個字元:空白平均分配在單字之間,無法平均時**左邊的間隔多**;只有一個單字的行與**最後一行**靠左對齊,單字之間一個空白,右邊補滿空白。',
  examples: [
    { input: 'words = ["This","is","an","example","of","text","justification."], maxWidth = 16', output: '["This    is    an","example  of text","justification.  "]' },
    { input: 'words = ["What","must","be","acknowledgment","shall","be"], maxWidth = 16', output: '["What   must   be","acknowledgment  ","shall be        "]' },
  ],
  constraints: ['單字長度 ≤ maxWidth ≤ 100,單字數 ≤ 300'],
  insight: ['分成兩步:① 決定每行放哪些單字(貪心)② 決定空白怎麼分', '一行有 g 個間隔、要補 s 個空白:每個間隔 `s // g` 個,前 `s % g` 個間隔再多 1 個', '特例:最後一行、只有一個單字的行 → 靠左'],
  approaches: [
    {
      name: '貪心分行 + 除法分配空白',
      idea: '找出這行的單字 `[i, j)`;一般行每個間隔 `q = spaces // gaps`,前 `r = spaces % gaps` 個多 1;特例靠左。',
      steps: ['`i = 0`;`while i < n`:', '往右加單字直到 `len + 單字長 + (單字數 − 1) > maxWidth`,得到 `[i, j)`', '最後一行或 `j − i == 1` → 用一個空白接起來,右邊補空白', '否則 `q, r = divmod(maxWidth − len, j − i − 1)`,第 k 個間隔放 `q + (k < r)` 個空白', '`i = j`'],
      figure: { title: `maxWidth = ${W}`, steps: greedyFig() },
      complexity: { time: 'O(總字元數)', space: 'O(總字元數)', why: '每個單字放一次,輸出長度 = 行數 × maxWidth。' },
      verdict: '最推薦。這題沒有演算法難點,考的是把規則拆清楚:分行、分空白、兩種特例。',
      code: {
        python: `def fullJustify(words, maxWidth):
    res, i, n = [], 0, len(words)
    while i < n:
        j, length = i, 0
        while j < n and length + len(words[j]) + (j - i) <= maxWidth:
            length += len(words[j])           # (j − i) = 目前至少需要的空白數
            j += 1
        gaps = j - i - 1
        if j == n or gaps == 0:               # 最後一行或只有一個字:靠左
            line = ' '.join(words[i:j])
            res.append(line + ' ' * (maxWidth - len(line)))
        else:
            q, r = divmod(maxWidth - length, gaps)
            line = ''
            for k in range(gaps):
                line += words[i + k] + ' ' * (q + (1 if k < r else 0))   # 左邊的間隔多分
            res.append(line + words[j - 1])
        i = j
    return res`,
        c: `char **fullJustify(char **words, int wordsSize, int maxWidth, int *returnSize) {
    char **res = malloc(wordsSize * sizeof(char *));
    *returnSize = 0;
    int i = 0;
    while (i < wordsSize) {
        int j = i, len = 0;
        while (j < wordsSize && len + (int)strlen(words[j]) + (j - i) <= maxWidth) len += strlen(words[j++]);
        int gaps = j - i - 1, p = 0;
        char *line = malloc(maxWidth + 1);
        if (j == wordsSize || gaps == 0) {
            for (int k = i; k < j; k++) {
                if (k > i) line[p++] = ' ';
                int L = strlen(words[k]); memcpy(line + p, words[k], L); p += L;
            }
            while (p < maxWidth) line[p++] = ' ';
        } else {
            int q = (maxWidth - len) / gaps, r = (maxWidth - len) % gaps;
            for (int k = i; k < j; k++) {
                int L = strlen(words[k]); memcpy(line + p, words[k], L); p += L;
                if (k < j - 1) for (int t = 0; t < q + (k - i < r); t++) line[p++] = ' ';
            }
        }
        line[maxWidth] = '\\0';
        res[(*returnSize)++] = line;
        i = j;
    }
    return res;
}`,
        cpp: `vector<string> fullJustify(vector<string>& words, int maxWidth) {
    vector<string> res;
    int n = words.size(), i = 0;
    while (i < n) {
        int j = i, len = 0;
        while (j < n && len + (int)words[j].size() + (j - i) <= maxWidth) len += words[j++].size();
        int gaps = j - i - 1;
        string line;
        if (j == n || gaps == 0) {
            for (int k = i; k < j; k++) line += (k > i ? " " : "") + words[k];
            line += string(maxWidth - line.size(), ' ');
        } else {
            int q = (maxWidth - len) / gaps, r = (maxWidth - len) % gaps;
            for (int k = i; k < j - 1; k++) line += words[k] + string(q + (k - i < r ? 1 : 0), ' ');
            line += words[j - 1];
        }
        res.push_back(line);
        i = j;
    }
    return res;
}`,
        java: `List<String> fullJustify(String[] words, int maxWidth) {
    List<String> res = new ArrayList<>();
    int n = words.length, i = 0;
    while (i < n) {
        int j = i, len = 0;
        while (j < n && len + words[j].length() + (j - i) <= maxWidth) len += words[j++].length();
        int gaps = j - i - 1;
        StringBuilder line = new StringBuilder();
        if (j == n || gaps == 0) {
            for (int k = i; k < j; k++) line.append(k > i ? " " : "").append(words[k]);
            while (line.length() < maxWidth) line.append(' ');
        } else {
            int q = (maxWidth - len) / gaps, r = (maxWidth - len) % gaps;
            for (int k = i; k < j - 1; k++) line.append(words[k]).append(" ".repeat(q + (k - i < r ? 1 : 0)));
            line.append(words[j - 1]);
        }
        res.add(line.toString());
        i = j;
    }
    return res;
}`,
        javascript: `function fullJustify(words, maxWidth) {
  const res = [], n = words.length;
  let i = 0;
  while (i < n) {
    let j = i, len = 0;
    while (j < n && len + words[j].length + (j - i) <= maxWidth) len += words[j++].length;
    const gaps = j - i - 1;
    if (j === n || gaps === 0) {
      const line = words.slice(i, j).join(' ');
      res.push(line + ' '.repeat(maxWidth - line.length));
    } else {
      const q = Math.floor((maxWidth - len) / gaps), r = (maxWidth - len) % gaps;
      let line = '';
      for (let k = i; k < j - 1; k++) line += words[k] + ' '.repeat(q + (k - i < r ? 1 : 0));
      res.push(line + words[j - 1]);
    }
    i = j;
  }
  return res;
}`,
      },
    },
    {
      name: '貪心分行 + 輪流發空白',
      idea: '每個間隔先放 1 個空白,剩下的空白從左邊的間隔開始一個一個輪流發。',
      steps: ['分行同上', '一般行:`gap = [1] * gaps`,`extra = maxWidth − 字母數 − gaps`', '`k = 0`;`while extra`:`gap[k % gaps] += 1`、`extra -= 1`、`k += 1`', '依 gap 把單字接起來'],
      figure: { title: '分配 "example of text" 的空白', steps: rrFig() },
      complexity: { time: 'O(總字元數)', space: 'O(總字元數)', why: '發空白的次數 ≤ maxWidth。' },
      verdict: '不用想除法和餘數,直接模擬「平均分、左邊多」的規則。結果和方法一完全一樣。',
      code: {
        python: `def fullJustify(words, maxWidth):
    res, i, n = [], 0, len(words)
    while i < n:
        j, length = i, 0
        while j < n and length + len(words[j]) + (j - i) <= maxWidth:
            length += len(words[j])
            j += 1
        gaps = j - i - 1
        if j == n or gaps == 0:
            line = ' '.join(words[i:j])
            res.append(line.ljust(maxWidth))
        else:
            gap = [1] * gaps
            extra = maxWidth - length - gaps
            k = 0
            while extra:                      # 剩下的空白從左邊輪流發
                gap[k % gaps] += 1
                extra -= 1
                k += 1
            line = ''.join(words[i + t] + ' ' * gap[t] for t in range(gaps)) + words[j - 1]
            res.append(line)
        i = j
    return res`,
        c: `char **fullJustify(char **words, int wordsSize, int maxWidth, int *returnSize) {
    char **res = malloc(wordsSize * sizeof(char *));
    *returnSize = 0;
    int i = 0, gap[300];
    while (i < wordsSize) {
        int j = i, len = 0;
        while (j < wordsSize && len + (int)strlen(words[j]) + (j - i) <= maxWidth) len += strlen(words[j++]);
        int gaps = j - i - 1, p = 0;
        char *line = malloc(maxWidth + 1);
        bool left = (j == wordsSize || gaps == 0);
        for (int t = 0; t < gaps; t++) gap[t] = 1;
        if (!left) for (int extra = maxWidth - len - gaps, k = 0; extra > 0; extra--, k++) gap[k % gaps]++;
        for (int k = i; k < j; k++) {
            int L = strlen(words[k]); memcpy(line + p, words[k], L); p += L;
            if (k < j - 1) for (int t = 0; t < gap[k - i]; t++) line[p++] = ' ';
        }
        while (p < maxWidth) line[p++] = ' ';
        line[maxWidth] = '\\0';
        res[(*returnSize)++] = line;
        i = j;
    }
    return res;
}`,
        cpp: `vector<string> fullJustify(vector<string>& words, int maxWidth) {
    vector<string> res;
    int n = words.size(), i = 0;
    while (i < n) {
        int j = i, len = 0;
        while (j < n && len + (int)words[j].size() + (j - i) <= maxWidth) len += words[j++].size();
        int gaps = j - i - 1;
        vector<int> gap(max(gaps, 0), 1);
        if (j < n && gaps > 0)
            for (int extra = maxWidth - len - gaps, k = 0; extra > 0; extra--, k++) gap[k % gaps]++;
        string line;
        for (int k = i; k < j; k++) {
            line += words[k];
            if (k < j - 1) line += string(gap[k - i], ' ');
        }
        line += string(maxWidth - line.size(), ' ');
        res.push_back(line);
        i = j;
    }
    return res;
}`,
        java: `List<String> fullJustify(String[] words, int maxWidth) {
    List<String> res = new ArrayList<>();
    int n = words.length, i = 0;
    while (i < n) {
        int j = i, len = 0;
        while (j < n && len + words[j].length() + (j - i) <= maxWidth) len += words[j++].length();
        int gaps = j - i - 1;
        int[] gap = new int[Math.max(gaps, 0)];
        Arrays.fill(gap, 1);
        if (j < n && gaps > 0)
            for (int extra = maxWidth - len - gaps, k = 0; extra > 0; extra--, k++) gap[k % gaps]++;
        StringBuilder line = new StringBuilder();
        for (int k = i; k < j; k++) {
            line.append(words[k]);
            if (k < j - 1) line.append(" ".repeat(gap[k - i]));
        }
        while (line.length() < maxWidth) line.append(' ');
        res.add(line.toString());
        i = j;
    }
    return res;
}`,
        javascript: `function fullJustify(words, maxWidth) {
  const res = [], n = words.length;
  let i = 0;
  while (i < n) {
    let j = i, len = 0;
    while (j < n && len + words[j].length + (j - i) <= maxWidth) len += words[j++].length;
    const gaps = j - i - 1;
    const gap = new Array(Math.max(gaps, 0)).fill(1);
    if (j < n && gaps > 0) for (let extra = maxWidth - len - gaps, k = 0; extra > 0; extra--, k++) gap[k % gaps]++;
    let line = '';
    for (let k = i; k < j; k++) {
      line += words[k];
      if (k < j - 1) line += ' '.repeat(gap[k - i]);
    }
    res.push(line.padEnd(maxWidth, ' '));
    i = j;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['分行條件忘了算單字之間至少一個空白', '餘數發給右邊的間隔:題目要左邊多', '只有一個單字的行要靠左(否則 gaps = 0 會除以 0)', '最後一行也要右邊補空白補到 maxWidth'],
  check: {
    kind: 'fn',
    fn: 'fullJustify',
    cases: [
      { args: [WORDS, W], out: ['This    is    an', 'example  of text', 'justification.  '] },
      { args: [['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], 16], out: ['What   must   be', 'acknowledgment  ', 'shall be        '] },
      { args: [['Science', 'is', 'what', 'we', 'understand', 'well', 'enough', 'to', 'explain', 'to', 'a', 'computer.', 'Art', 'is', 'everything', 'else', 'we', 'do'], 20], out: ['Science  is  what we', 'understand      well', 'enough to explain to', 'a  computer.  Art is', 'everything  else  we', 'do                  '] },
      { args: [['a'], 1], out: ['a'] },
    ],
  },
}
