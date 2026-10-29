import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const S = 'aba', N = 10

function simulateFig(): FigStep[] {
  const out: FigStep[] = []
  const prefix = [0]
  for (let i = 0; i < S.length; i++) {
    prefix.push(prefix[i] + Number(S[i] === 'a'))
    out.push({ note: `讀單塊第 ${i} 字 ${S[i]}；前 ${i + 1} 字有 ${prefix[i + 1]} 個 a。`, views: [arr(S.split(''), { label: '原字串', highlight: [i] }), arr(prefix, { label: '前綴 a 數量', highlight: [i + 1] })] })
  }
  const full = Math.floor(N / S.length), remain = N % S.length
  out.push({ note: `${N} 字分成 ${full} 塊與 ${remain} 字尾段；前綴表直接給出尾段 ${prefix[remain]} 個 a。`, views: [arr(prefix, { label: '前綴表', highlight: [remain, S.length] }), kv([['完整塊', full], ['尾段長', remain]])] })
  out.push({ note: `答案 ${full}×${prefix[S.length]}＋${prefix[remain]}＝${full * prefix[S.length] + prefix[remain]}。`, views: [kv([['單塊 a', prefix[S.length]], ['尾段 a', prefix[remain]], ['答案', full * prefix[S.length] + prefix[remain]]])] })
  return out
}

function blockFig(): FigStep[] {
  const out: FigStep[] = []
  let inBlock = 0
  for (let i = 0; i < S.length; i++) {
    if (S[i] === 'a') inBlock++
    out.push({ note: `原字串位置 ${i} 是 ${S[i]}，單塊 a 計數成為 ${inBlock}。`, views: [arr(S.split(''), { label: '一個完整區塊', highlight: [i] }), kv([['單塊 a 數量', inBlock]])] })
  }
  const full = Math.floor(N / S.length), remain = N % S.length
  out.push({ note: `${N} ÷ ${S.length} = ${full} 個完整區塊、餘 ${remain} 字；完整區塊貢獻 ${full}×${inBlock}=${full * inBlock}。`, views: [arr(Array(full).fill(S), { label: '完整區塊' }), kv([['完整塊', full], ['餘長', remain], ['目前 a', full * inBlock]])] })
  let answer = full * inBlock
  for (let i = 0; i < remain; i++) {
    if (S[i] === 'a') answer++
    out.push({ note: `餘段位置 ${i} 是 ${S[i]}，${S[i] === 'a' ? '再加一' : '不增加'}；答案 ${answer}。`, views: [arr(S.slice(0, remain).split(''), { label: '餘段', highlight: [i] }), kv([['總 a', answer]])] })
  }
  return out
}

export const hrRepeatedString: HrSolution = {
  slug: 'repeated-string',
  plain: '像反覆蓋同一款印章，問蓋出來的前 n 個字母裡有多少個 a；整塊直接乘，最後零頭再數。',
  statement: '將非空小寫字串 s 無限重複。只看這個無限字串的前 n 個字元，回傳其中字母 a 的出現次數。n 可以遠大於 s 的長度。',
  examples: [
    { input: 's = "aba", n = 10', output: '7', note: '三個完整 aba 各有兩個 a，餘下一個 a，總共七個。' },
    { input: 's = "a", n = 1000000000000', output: '1000000000000', note: '每個位置都是 a。' },
  ],
  constraints: [
    's 長度至少 1 → 取餘數時不會除以零。',
    'n 可達 10^12 → 不能真的展開或逐字掃到 n。',
    '字串只含小寫英文字母 → 只需比較是否等於 a。',
  ],
  insight: [
    '最直接是把無限字串逐字數到 n，但 n 極大做不到；可以先把原字串每個前綴的 a 數存起來。',
    '每個完整 s 區塊的 a 數量相同；可先數單塊，再乘上完整塊數。',
    '用整除與餘數把 n 分為完整塊和短尾巴，這是 [[p:math]] 的週期拆分。',
  ],
  approaches: [
    {
      name: '前綴計數表',
      idea: '先記下原字串每個前綴的 a 數量，再組合完整塊和尾段。',
      steps: ['建立 prefix，prefix[0]=0。', '逐字掃 s，prefix[i+1] 記錄前 i+1 字的 a 數量。', '把 n 分成完整塊 full 與餘長 remain。', '回傳 full×prefix[|s|]＋prefix[remain]。'],
      figure: { title: 'aba 的前綴計數', steps: simulateFig() },
      complexity: { time: 'O(|s|)', space: 'O(|s|)', why: '逐字建立一張長度 |s|+1 的前綴表。' },
      verdict: '容易回答各種尾段長度，但只問一次時前綴表稍嫌多餘。',
      code: {
        python: `def repeatedString(s, n):
    prefix = [0]
    for ch in s:
        prefix.append(prefix[-1] + (ch == 'a'))  # 記錄每個前綴
    full, remain = divmod(n, len(s))
    return full * prefix[-1] + prefix[remain]`,
        c: `long long repeatedString(char* s, long long n) {
    int length = strlen(s);
    int* prefix = malloc(sizeof(int) * (length + 1));
    prefix[0] = 0;
    for (int i = 0; i < length; i++) prefix[i + 1] = prefix[i] + (s[i] == 'a');
    long long answer = (n / length) * prefix[length] + prefix[n % length];
    free(prefix);
    return answer;
}`,
        cpp: `long long repeatedString(string s, long long n) {
    vector<int> prefix(s.size() + 1, 0);
    for (int i = 0; i < (int)s.size(); i++) {
        prefix[i + 1] = prefix[i] + (s[i] == 'a');
    }
    return (n / s.size()) * prefix.back() + prefix[n % s.size()];
}`,
        java: `public static long repeatedString(String s, long n) {
    int[] prefix = new int[s.length() + 1];
    for (int i = 0; i < s.length(); i++) {
        prefix[i + 1] = prefix[i] + (s.charAt(i) == 'a' ? 1 : 0);
    }
    return (n / s.length()) * prefix[s.length()] + prefix[(int)(n % s.length())];
}`,
        javascript: `function repeatedString(s, n) {
  const prefix = [0];
  for (const ch of s) {
    prefix.push(prefix[prefix.length - 1] + Number(ch === 'a'));
  }
  const full = Math.floor(n / s.length);
  return full * prefix[s.length] + prefix[n % s.length];
}`,
      },
    },
    {
      name: '完整區塊加尾段',
      idea: '完整複本的貢獻用乘法，剩下不足一塊的前綴再數。',
      steps: ['掃一遍 s，求單塊內 a 數量 inBlock。', '計算 full=floor(n/|s|) 和 remain=n mod |s|。', 'answer=full×inBlock。', '只掃 s 的前 remain 個字元，把其中的 a 加到 answer。'],
      figure: { title: 'aba 與 n=10 的區塊分解', steps: blockFig() },
      complexity: { time: 'O(|s|)', space: 'O(1)', why: '掃一遍完整 s，再掃至多 |s|-1 個尾段字元；只保留數字。' },
      verdict: '最佳解；執行時間不依賴巨大 n。',
      code: {
        python: `def repeatedString(s, n):
    full, remain = divmod(n, len(s))
    answer = full * s.count('a')  # 完整區塊直接相乘
    answer += s[:remain].count('a')
    return answer`,
        c: `long long repeatedString(char* s, long long n) {
    int length = strlen(s);
    long long inBlock = 0, answer = 0;
    for (int i = 0; i < length; i++) {
        if (s[i] == 'a') inBlock++;
    }
    answer = (n / length) * inBlock;
    for (int i = 0; i < n % length; i++) {
        if (s[i] == 'a') answer++;
    }
    return answer;
}`,
        cpp: `long long repeatedString(string s, long long n) {
    long long inBlock = 0;
    for (char ch : s) {
        if (ch == 'a') inBlock++;
    }
    long long answer = (n / s.size()) * inBlock;
    for (int i = 0; i < n % s.size(); i++) {
        if (s[i] == 'a') answer++;
    }
    return answer;
}`,
        java: `public static long repeatedString(String s, long n) {
    long inBlock = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) == 'a') inBlock++;
    }
    long answer = (n / s.length()) * inBlock;
    for (int i = 0; i < n % s.length(); i++) {
        if (s.charAt(i) == 'a') answer++;
    }
    return answer;
}`,
        javascript: `function repeatedString(s, n) {
  let inBlock = 0;
  for (const ch of s) {
    if (ch === 'a') inBlock++;
  }
  let answer = Math.floor(n / s.length) * inBlock;
  for (let i = 0; i < n % s.length; i++) {
    if (s[i] === 'a') answer++;
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: [
    '只算完整塊會漏掉尾段。',
    'n 大到 10^12，C 與 C++ 必須用 64 位元整數做運算。',
    '尾段是 s 的前 remain 個字元，不是末尾 remain 個。',
  ],
  check: {
    kind: 'fn',
    fn: 'repeatedString',
    cases: [
      { args: ['aba', 10], out: 7 },
      { args: ['a', 1000000000000], out: 1000000000000 },
      { args: ['b', 1], out: 0 },
      { args: ['abc', 3], out: 1 },
      { args: ['abc', 4], out: 2 },
      { args: ['aaa', 7], out: 7 },
    ],
  },
}
