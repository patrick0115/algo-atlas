import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 535. Encode and Decode TinyURL

const URLS = ['https://leetcode.com/problems/design-tinyurl', 'https://example.com/a/very/long/path?x=1']
const BASE = 'http://tinyurl.com/'

function counterFig(): FigStep[] {
  return [
    { note: '最簡單的短網址:準備一個「流水號」和一張表。每來一個長網址,就給它下一個號碼,記下「號碼 → 長網址」', views: [kv([], '號碼 → 長網址')] },
    { note: `encode 第一個 → 號碼 0,短網址 "${BASE}0";encode 第二個 → 號碼 1`, views: [kv(URLS.map((u, i) => [i, u.slice(0, 28) + '…']), '號碼 → 長網址', [0, 1])] },
    { note: `decode("${BASE}1"):取出最後的號碼 1,查表得到原本的長網址`, views: [kv(URLS.map((u, i) => [i, u.slice(0, 28) + '…']), '號碼 → 長網址', [1])] },
  ]
}

function randomFig(): FigStep[] {
  return [
    { note: '流水號的缺點:別人可以猜出總共有幾個網址、也能一個一個試。改用**隨機 6 碼**(62 種字元 → 62⁶ ≈ 568 億種)當鍵', views: [arr(['a', 'Z', '3', 'k', '9', 'Q'], { label: '隨機產生的鍵' })] },
    { note: '產生後先查表,撞到已用過的就重抽。也可以加一張「長網址 → 鍵」的表,同一個網址重複 encode 時回傳同一個短網址', views: [kv([['aZ3k9Q', 'https://leetcode.com/…'], ['x8Lp2m', 'https://example.com/…']], '鍵 → 長網址')] },
  ]
}

export const q0535: Solution = {
  id: 535,
  plain: '設計一個「短網址服務」:把很長的網址變成一個短短的網址(encode),之後拿短網址回來,要能還原成原本的長網址(decode)。怎麼產生短碼由你決定,只要能還原就好。',
  statement: '設計類別 `Codec`:`encode(longUrl)` 回傳一個短網址;`decode(shortUrl)` 回傳原本的長網址。保證 decode 收到的一定是這個物件 encode 出來的。(這裡用 `roundTrip(urls)` 把每個網址 encode 再 decode,檢查能否還原。)',
  examples: [
    { input: 'url = "https://leetcode.com/problems/design-tinyurl"', output: '"https://leetcode.com/problems/design-tinyurl"', note: 'decode(encode(url)) 要等於 url' },
  ],
  constraints: ['網址長度 ≤ 10⁴'],
  insight: ['短網址只是一把「鑰匙」,真正的資料存在伺服器的表裡', '鑰匙可以是流水號(簡單)或隨機碼(不容易被猜)', 'decode 只要從短網址取出鑰匙、查表'],
  approaches: [
    {
      name: '流水號 + 陣列',
      idea: '`urls` 陣列存長網址;encode 回傳 `BASE + str(index)`;decode 取出最後的數字當索引。',
      steps: ['`urls = []`', 'encode:`urls.append(longUrl)`,回傳 `BASE + str(len(urls) − 1)`', 'decode:`id = int(shortUrl[len(BASE):])`,回傳 `urls[id]`'],
      figure: { title: '依序 encode 兩個網址', steps: counterFig() },
      complexity: { time: 'O(L)(L = 網址長度,複製字串)', space: 'O(總長度)', why: '每個網址存一份;查表 O(1)。' },
      verdict: '最好寫。缺點是短碼可被猜、同一網址重複 encode 會得到不同短網址。',
      code: {
        python: `class Codec:
    BASE = 'http://tinyurl.com/'

    def __init__(self):
        self.urls = []

    def encode(self, longUrl):
        self.urls.append(longUrl)
        return self.BASE + str(len(self.urls) - 1)     # 流水號就是鑰匙

    def decode(self, shortUrl):
        return self.urls[int(shortUrl[len(self.BASE):])]

def roundTrip(urls):
    c = Codec()
    shorts = [c.encode(u) for u in urls]
    return [c.decode(s) for s in shorts]`,
        c: `#define BASE "http://tinyurl.com/"
static char *urls_[10000];
static int cnt_ = 0;

char *encode(char *longUrl) {
    urls_[cnt_] = strdup(longUrl);
    char *s = malloc(64);
    sprintf(s, BASE "%d", cnt_++);
    return s;
}

char *decode(char *shortUrl) {
    return urls_[atoi(shortUrl + strlen(BASE))];
}

char **roundTrip(char **urls, int urlsSize, int *returnSize) {
    char **shorts = malloc(urlsSize * sizeof(char *)), **res = malloc(urlsSize * sizeof(char *));
    for (int i = 0; i < urlsSize; i++) shorts[i] = encode(urls[i]);
    for (int i = 0; i < urlsSize; i++) res[i] = decode(shorts[i]);
    *returnSize = urlsSize;
    return res;
}`,
        cpp: `class Codec {
    vector<string> urls;
    const string BASE = "http://tinyurl.com/";
public:
    string encode(string longUrl) {
        urls.push_back(longUrl);
        return BASE + to_string(urls.size() - 1);
    }
    string decode(string shortUrl) {
        return urls[stoi(shortUrl.substr(BASE.size()))];
    }
};

vector<string> roundTrip(vector<string>& urls) {
    Codec c;
    vector<string> shorts, res;
    for (auto &u : urls) shorts.push_back(c.encode(u));
    for (auto &s : shorts) res.push_back(c.decode(s));
    return res;
}`,
        java: `class Codec {
    private final List<String> urls = new ArrayList<>();
    private static final String BASE = "http://tinyurl.com/";

    public String encode(String longUrl) {
        urls.add(longUrl);
        return BASE + (urls.size() - 1);
    }

    public String decode(String shortUrl) {
        return urls.get(Integer.parseInt(shortUrl.substring(BASE.length())));
    }
}

List<String> roundTrip(String[] urls) {
    Codec c = new Codec();
    List<String> shorts = new ArrayList<>(), res = new ArrayList<>();
    for (String u : urls) shorts.add(c.encode(u));
    for (String s : shorts) res.add(c.decode(s));
    return res;
}`,
        javascript: `class Codec {
  constructor() {
    this.urls = [];
  }
  encode(longUrl) {
    this.urls.push(longUrl);
    return 'http://tinyurl.com/' + (this.urls.length - 1);
  }
  decode(shortUrl) {
    return this.urls[Number(shortUrl.slice('http://tinyurl.com/'.length))];
  }
}

function roundTrip(urls) {
  const c = new Codec();
  const shorts = urls.map((u) => c.encode(u));
  return shorts.map((s) => c.decode(s));
}`,
      },
    },
    {
      name: '隨機 6 碼 + Hash 表',
      idea: '隨機產生 6 個字元(a–z、A–Z、0–9)當鍵,撞到就重抽;`code2url[鍵] = 長網址`,另存 `url2code` 讓同一網址回傳同一短碼。',
      steps: ['encode:已經編過 → 回傳舊的短網址', '否則重複抽 6 碼直到沒用過;兩張表都記下', 'decode:取出最後 6 碼查 `code2url`'],
      figure: { title: '隨機鍵', steps: randomFig() },
      complexity: { time: '平均 O(L)', space: 'O(總長度)', why: '撞號機率極低,平均抽一次就成功。' },
      verdict: '實務上比較像真的短網址服務:不可預測、同網址同短碼。',
      code: {
        python: `import random
import string

class Codec:
    BASE = 'http://tinyurl.com/'
    CHARS = string.ascii_letters + string.digits

    def __init__(self):
        self.code2url, self.url2code = {}, {}

    def encode(self, longUrl):
        if longUrl in self.url2code:
            return self.BASE + self.url2code[longUrl]  # 同一網址回傳同一短碼
        while True:
            code = ''.join(random.choice(self.CHARS) for _ in range(6))
            if code not in self.code2url:     # 撞到就重抽
                break
        self.code2url[code], self.url2code[longUrl] = longUrl, code
        return self.BASE + code

    def decode(self, shortUrl):
        return self.code2url[shortUrl[-6:]]

def roundTrip(urls):
    c = Codec()
    shorts = [c.encode(u) for u in urls]
    return [c.decode(s) for s in shorts]`,
        c: `#define BASE "http://tinyurl.com/"
typedef struct { char code[7]; char *url; UT_hash_handle hh; } Entry;
static Entry *tab_ = NULL;
static const char *CH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

char *encode(char *longUrl) {
    Entry *e;
    char code[7];
    do {                                      // 抽到沒用過的 6 碼為止
        for (int i = 0; i < 6; i++) code[i] = CH[rand() % 62];
        code[6] = '\\0';
        HASH_FIND_STR(tab_, code, e);
    } while (e);
    e = malloc(sizeof(Entry));
    strcpy(e->code, code);
    e->url = strdup(longUrl);
    HASH_ADD_STR(tab_, code, e);
    char *s = malloc(strlen(BASE) + 7);
    strcpy(s, BASE); strcat(s, code);
    return s;
}

char *decode(char *shortUrl) {
    Entry *e;
    HASH_FIND_STR(tab_, shortUrl + strlen(shortUrl) - 6, e);
    return e ? e->url : NULL;
}

char **roundTrip(char **urls, int urlsSize, int *returnSize) {
    char **shorts = malloc(urlsSize * sizeof(char *)), **res = malloc(urlsSize * sizeof(char *));
    for (int i = 0; i < urlsSize; i++) shorts[i] = encode(urls[i]);
    for (int i = 0; i < urlsSize; i++) res[i] = decode(shorts[i]);
    *returnSize = urlsSize;
    return res;
}`,
        cpp: `class Codec {
    unordered_map<string, string> code2url, url2code;
    const string BASE = "http://tinyurl.com/";
    const string CH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    mt19937 rng{12345};
public:
    string encode(string longUrl) {
        if (url2code.count(longUrl)) return BASE + url2code[longUrl];
        string code;
        do {
            code.clear();
            for (int i = 0; i < 6; i++) code += CH[rng() % 62];
        } while (code2url.count(code));
        code2url[code] = longUrl;
        url2code[longUrl] = code;
        return BASE + code;
    }
    string decode(string shortUrl) { return code2url[shortUrl.substr(shortUrl.size() - 6)]; }
};

vector<string> roundTrip(vector<string>& urls) {
    Codec c;
    vector<string> shorts, res;
    for (auto &u : urls) shorts.push_back(c.encode(u));
    for (auto &s : shorts) res.push_back(c.decode(s));
    return res;
}`,
        java: `class Codec {
    private final Map<String, String> code2url = new HashMap<>(), url2code = new HashMap<>();
    private static final String BASE = "http://tinyurl.com/";
    private static final String CH = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final Random rnd = new Random();

    public String encode(String longUrl) {
        if (url2code.containsKey(longUrl)) return BASE + url2code.get(longUrl);
        String code;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++) sb.append(CH.charAt(rnd.nextInt(62)));
            code = sb.toString();
        } while (code2url.containsKey(code));
        code2url.put(code, longUrl);
        url2code.put(longUrl, code);
        return BASE + code;
    }

    public String decode(String shortUrl) {
        return code2url.get(shortUrl.substring(shortUrl.length() - 6));
    }
}

List<String> roundTrip(String[] urls) {
    Codec c = new Codec();
    List<String> shorts = new ArrayList<>(), res = new ArrayList<>();
    for (String u : urls) shorts.add(c.encode(u));
    for (String s : shorts) res.add(c.decode(s));
    return res;
}`,
        javascript: `class Codec {
  constructor() {
    this.code2url = new Map();
    this.url2code = new Map();
  }
  encode(longUrl) {
    const BASE = 'http://tinyurl.com/';
    const CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    if (this.url2code.has(longUrl)) return BASE + this.url2code.get(longUrl);
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) code += CH[Math.floor(Math.random() * 62)];
    } while (this.code2url.has(code));
    this.code2url.set(code, longUrl);
    this.url2code.set(longUrl, code);
    return BASE + code;
  }
  decode(shortUrl) {
    return this.code2url.get(shortUrl.slice(-6));
  }
}

function roundTrip(urls) {
  const c = new Codec();
  const shorts = urls.map((u) => c.encode(u));
  return shorts.map((s) => c.decode(s));
}`,
      },
    },
  ],
  pitfalls: ['用長網址的 Hash 值當短碼:不同網址可能撞在一起,而且沒辦法反推', '隨機碼沒檢查是否已經用過'],
  check: {
    kind: 'fn',
    fn: 'roundTrip',
    cases: [
      { args: [URLS], out: URLS },
      { args: [['https://a.com']], out: ['https://a.com'] },
      { args: [['https://x.com/1', 'https://x.com/2', 'https://x.com/1']], out: ['https://x.com/1', 'https://x.com/2', 'https://x.com/1'] },
    ],
  },
}
