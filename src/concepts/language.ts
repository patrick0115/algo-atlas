import type { Concept } from './types'

// 單元三:程式語言基礎 —— 記憶體與參考、指標、陣列與字串、整數、遞迴、類別與比較。
// 每一章都用五種語言對照;C / C++ 的指標在這裡講,各語言的工具箱在 toolbox.ts。

const memoryModel: Concept = {
  id: 'memory-model',
  name: '變數、記憶體與參考',
  level: 1,
  prereq: ['leetcode-101'],
  lead:
    '很多 bug 都出在「我以為複製了一份,其實兩個變數指著同一份」。回溯題的答案全部變成一樣、二維陣列改一格整欄都變、' +
    '函式裡改了陣列呼叫端也跟著變 —— 都是同一件事。搞懂「值」和「參考」,這類 bug 會少掉一大半。',
  analogy:
    '「值」像影印一份文件給你:你在影本上塗改,不影響正本。「參考」像分享一個雲端文件的連結:你們打開的是同一份,誰改了大家都看得到。',
  sections: [
    {
      title: '記憶體是一排有編號的格子',
      blocks: [
        {
          t: 'p',
          text: '記憶體可以想成一長排格子,每格有一個編號,叫做**位址**(address)。變數就是幫某一格取的名字。程式執行時,記憶體大致分成兩區:',
        },
        {
          t: 'table',
          cols: ['區域', '放什麼', '什麼時候回收', '特性'],
          rows: [
            ['堆疊(stack)', '函式的參數、區域變數', '函式回傳時自動回收', '很快,但空間小(通常幾 MB);遞迴太深會用完'],
            ['堆積(heap)', '`new` / `malloc` 出來的東西;Python、Java、JS 的物件與陣列', 'C 要自己 `free`;C++ 自己 `delete`;其他語言由垃圾回收(GC)自動回收', '空間大,存活時間不受函式限制'],
          ],
          note: '這裡的「堆積」和資料結構的 [[p:heap]] 只是同名,沒有關係。',
        },
      ],
    },
    {
      title: '值與參考:每種語言不一樣',
      blocks: [
        {
          t: 'table',
          cols: ['語言', '直接存「值」', '存「參考」(指到另一個地方)'],
          rows: [
            ['C', '全部都是值,連 struct 都會整份複製', '沒有參考;要共用就自己傳**指標**,見 [[c:pointers]]'],
            ['C++', '預設是值 —— 連 `vector`、`string` 指派或傳參數都會**整份複製**', '加 `&` 變參考、加 `*` 變指標'],
            ['Java', '8 種基本型別:`int` `long` `double` `boolean` `char` 等', '其他全部:陣列、`String`、`ArrayList`、自訂物件'],
            ['JavaScript', 'number、string、boolean、`null`、`undefined`', '物件、陣列、`Map`、`Set`、函式'],
            ['Python', '(嚴格說沒有)', '一切都是參考:變數是貼在物件上的名字。`int`、`str`、`tuple` 不可變,所以用起來「像」值'],
          ],
        },
        {
          t: 'memory',
          title: 'Python:b = a 不是複製',
          lang: 'python',
          code: `a = [1, 2, 3]
b = a
b.append(4)
c = a[:]
c.append(5)
print(a, b, c)`,
          steps: [
            {
              line: 1,
              note: '建立一個串列物件,名字 `a` 指向它。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1', hl: true },
                { region: '物件', name: '串列#1', value: '[1, 2, 3]', hl: true },
              ],
            },
            {
              line: 2,
              note: '`b = a` 沒有建立新串列,只是讓 `b` 也指向**同一個**物件。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1' },
                { region: '名字', name: 'b', value: '', ref: '串列#1', hl: true },
                { region: '物件', name: '串列#1', value: '[1, 2, 3]' },
              ],
            },
            {
              line: 3,
              note: '透過 `b` 修改內容 —— 因為 `a` 指的是同一個物件,`a` 看到的也變了。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1' },
                { region: '名字', name: 'b', value: '', ref: '串列#1' },
                { region: '物件', name: '串列#1', value: '[1, 2, 3, 4]', hl: true },
              ],
            },
            {
              line: 4,
              note: '`a[:]` 切片會**複製**出一個新串列(淺拷貝),`c` 指向這個新的。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1' },
                { region: '名字', name: 'b', value: '', ref: '串列#1' },
                { region: '名字', name: 'c', value: '', ref: '串列#2', hl: true },
                { region: '物件', name: '串列#1', value: '[1, 2, 3, 4]' },
                { region: '物件', name: '串列#2', value: '[1, 2, 3, 4]', hl: true },
              ],
            },
            {
              line: 5,
              note: '改 `c` 只改到串列#2,`a` 和 `b` 不受影響。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1' },
                { region: '名字', name: 'b', value: '', ref: '串列#1' },
                { region: '名字', name: 'c', value: '', ref: '串列#2' },
                { region: '物件', name: '串列#1', value: '[1, 2, 3, 4]' },
                { region: '物件', name: '串列#2', value: '[1, 2, 3, 4, 5]', hl: true },
              ],
            },
            {
              line: 6,
              note: '印出 `[1, 2, 3, 4] [1, 2, 3, 4] [1, 2, 3, 4, 5]`。Java、JavaScript 的陣列和物件行為完全一樣。',
              cells: [
                { region: '名字', name: 'a', value: '', ref: '串列#1' },
                { region: '名字', name: 'b', value: '', ref: '串列#1' },
                { region: '名字', name: 'c', value: '', ref: '串列#2' },
                { region: '物件', name: '串列#1', value: '[1, 2, 3, 4]' },
                { region: '物件', name: '串列#2', value: '[1, 2, 3, 4, 5]' },
              ],
            },
          ],
        },
      ],
    },
    {
      title: '傳參數:改內容 vs 重新指派',
      blocks: [
        {
          t: 'p',
          text: 'Python、Java、JavaScript 傳物件給函式時,函式拿到的是「參考的副本」:**修改內容**呼叫端看得到;**讓參數指向別的東西**只改了函式自己的名字,呼叫端看不到。C++ 預設會複製整份,要加 `&` 才是同一份。',
        },
        {
          t: 'code',
          title: '函式裡改陣列,呼叫端看得到嗎?',
          code: {
            python: `def f(arr):
    arr.append(1)   # 改內容:呼叫端看得到
    arr = [9, 9]    # 重新指派:只改了區域名字 arr,呼叫端看不到

a = []
f(a)
print(a)            # [1]`,
            c: `void f(int *arr, int n) {   // C 傳的是「指標的副本」
    arr[0] = 1;              // 透過指標改內容:呼叫端看得到
    arr = NULL;              // 改指標本身:呼叫端看不到
}

int a[3] = {0};
f(a, 3);                     // a 變成 {1, 0, 0}`,
            cpp: `void byValue(vector<int> v) { v.push_back(1); }  // 改的是副本,而且複製要 O(n)
void byRef(vector<int>& v)  { v.push_back(1); }  // 改的就是呼叫端那份

vector<int> a;
byValue(a);   // a 還是 []
byRef(a);     // a 變成 [1]`,
            java: `void f(List<Integer> arr) {
    arr.add(1);             // 改內容:呼叫端看得到
    arr = new ArrayList<>(); // 重新指派:呼叫端看不到
}

List<Integer> a = new ArrayList<>();
f(a);                       // a 是 [1]`,
            javascript: `function f(arr) {
  arr.push(1);   // 改內容:呼叫端看得到
  arr = [9, 9];  // 重新指派:呼叫端看不到
}

const a = [];
f(a);            // a 是 [1]`,
          },
        },
      ],
    },
    {
      title: '淺拷貝、深拷貝與兩個經典 bug',
      blocks: [
        {
          t: 'p',
          text: '**經典 bug 一:回溯的答案全部一樣。**[[p:backtracking]] 用同一個 `path` 一路加加減減,如果把 `path` 本身放進答案,放進去的只是參考 —— 等回溯結束 `path` 被清空,答案裡的每一項都跟著變成空的。要放「當下的副本」:',
        },
        {
          t: 'code',
          title: '把目前的路徑存進答案',
          code: {
            python: `res.append(path[:])        # 或 list(path);寫 res.append(path) 會全部一樣`,
            c: `int *copy = malloc(len * sizeof(int));   // C 要自己配一塊新的記憶體
memcpy(copy, path, len * sizeof(int));
res[resSize] = copy;
colSizes[resSize++] = len;`,
            cpp: `res.push_back(path);       // C++ 的 vector 是值語意:push_back 本來就會複製一份`,
            java: `res.add(new ArrayList<>(path));   // 寫 res.add(path) 會全部一樣`,
            javascript: `res.push([...path]);       // 或 path.slice();寫 res.push(path) 會全部一樣`,
          },
        },
        {
          t: 'p',
          text: '**經典 bug 二:二維陣列改一格,整欄都變。**用「複製參考」的方式建二維陣列,每一列其實是同一個物件:',
        },
        {
          t: 'code',
          title: '建立 m × n 的二維陣列',
          code: {
            python: `grid = [[0] * n] * m              # ✗ m 列都是同一個串列
grid = [[0] * n for _ in range(m)] # ✓ 每列各自建立`,
            c: `int grid[m][n];                    // 小的可以放堆疊上(記得初始化)
int **g = malloc(m * sizeof(int *));  // 大的用 malloc,每列各自配置
for (int i = 0; i < m; i++) g[i] = calloc(n, sizeof(int));`,
            cpp: `vector<vector<int>> grid(m, vector<int>(n, 0));   // ✓ 每列是複製出來的獨立 vector`,
            java: `int[][] grid = new int[m][n];      // ✓ 預設全部是 0`,
            javascript: `const bad = new Array(m).fill(new Array(n).fill(0));      // ✗ fill 放的是同一個陣列
const grid = Array.from({ length: m }, () => new Array(n).fill(0)); // ✓`,
          },
        },
        {
          t: 'note',
          kind: 'key',
          title: '淺拷貝 vs 深拷貝',
          text: '`path[:]`、`[...arr]`、`new ArrayList<>(list)` 都是**淺拷貝**:只複製最外層,裡面如果還有陣列,內層仍然共用。二維陣列要整份獨立,要每一列也各自複製(Python `[row[:] for row in grid]`、`copy.deepcopy`)。',
        },
      ],
    },
    {
      title: '比較:內容相等 vs 同一個東西',
      blocks: [
        {
          t: 'table',
          cols: ['語言', '比內容', '比是不是同一個', '陷阱'],
          rows: [
            ['Python', '`==`', '`is`', '`is` 只用在 `None`:寫 `x is None`'],
            ['Java', '`.equals()`', '`==`(對物件)', '`Integer` 用 `==` 比:-128~127 會對(有快取),超過就錯。`String` 也要用 `.equals()`'],
            ['JavaScript', '自己逐項比 / `JSON.stringify`', '`===`(對物件、陣列)', '`[1] === [1]` 是 `false`;陣列當 `Map` 的鍵也是比參考'],
            ['C++', '`==`(vector、string 會比內容)', '比位址 `&a == &b`', '`char*` 用 `==` 比的是位址,要用 `strcmp`'],
            ['C', '`strcmp`、`memcmp`', '`==`(比指標)', '字串不能用 `==` 比'],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '回溯時把同一個 `path` 放進答案,最後答案全部一樣(或全空)。',
    'Python `[[0] * n] * m`、JS `fill(new Array(n))` 建出共用同一列的二維陣列。',
    'C++ 函式參數寫 `vector<int> v` 而不是 `vector<int>& v`:每次呼叫都 O(n) 複製,而且修改不會回到呼叫端。',
    'Java 用 `==` 比較兩個 `Integer` 或 `String`,小數字時碰巧對、大數字就錯。',
    '以為在函式裡寫 `arr = 新陣列` 能把結果帶回呼叫端:重新指派只改了區域名字。',
  ],
  quiz: [
    {
      q: 'Python:`a = [1, 2]; b = a; b.append(3)`,現在 `a` 是?',
      options: ['[1, 2]', '[1, 2, 3]', '報錯'],
      a: 1,
      why: '`b = a` 讓兩個名字指向同一個串列,透過 `b` 改內容,`a` 也看得到。',
    },
    {
      q: 'Python `grid = [[0] * 3] * 3` 之後執行 `grid[0][0] = 1`,結果是?',
      options: ['只有左上角是 1', '第一欄三格都變 1', '整個表都變 1'],
      a: 1,
      why: '三列是同一個串列物件,改 `grid[0][0]` 等於改了三列的第 0 格。',
    },
    {
      q: 'C++:`void f(vector<int> v) { v[0] = 9; }`,呼叫 `f(a)` 之後 `a[0]` 會變嗎?',
      options: ['會變成 9', '不會,f 改的是副本'],
      a: 1,
      why: 'C++ 預設傳值,整份 vector 被複製。要改到呼叫端,參數寫成 `vector<int>& v`。',
    },
    {
      q: 'Java 回溯:`res.add(path)` 之後繼續修改 `path`,最後答案會?',
      options: ['正確', '每一項都是 path 最後的樣子', '編譯錯誤'],
      a: 1,
      why: '加進去的是參考,所有項目都指向同一個 `path`。要寫 `res.add(new ArrayList<>(path))`。',
    },
  ],
  next: ['backtracking', 'linked-list'],
}

const pointers: Concept = {
  id: 'pointers',
  name: '指標與參考',
  level: 2,
  prereq: ['memory-model'],
  lead:
    '指標就是「存著另一個變數位址的變數」。C 和 C++ 直接讓你操作它;Python、Java、JavaScript 把它藏起來,叫做「參考」。' +
    '另外,演算法裡的「雙指標」「快慢指標」用的是同一個字,但通常只是**索引**或**節點參考** —— 這章兩層都講清楚。',
  analogy:
    '指標像一張寫著門牌號碼的紙條。紙條本身不是房子,但拿著它就能找到房子、進去改擺設(`*p = 20`);把紙條上的門牌改寫成另一戶(`p = &y`),就是改去指別的房子。',
  sections: [
    {
      title: '取位址 & 與取值 *',
      blocks: [
        {
          t: 'table',
          cols: ['寫法', '意思', '讀作'],
          rows: [
            ['`int *p;`', '宣告 p 是「指向 int 的指標」', 'p 是一張紙條,上面會寫某個 int 的門牌'],
            ['`&x`', '取 x 的位址', 'x 的門牌號碼'],
            ['`p = &x;`', '讓 p 存 x 的位址', '把 x 的門牌寫到紙條上'],
            ['`*p`', '解參考:p 指著的那一格', '照紙條找到的那間房子'],
            ['`*p = 20;`', '把 p 指著的那格改成 20', '進去那間房子改擺設 —— x 變成 20'],
            ['`NULL` / `nullptr`', '不指向任何地方的指標', '空白的紙條;照著它去找就會當掉'],
          ],
        },
        {
          t: 'memory',
          title: 'C:指標指向 x,再改去指向 y',
          lang: 'c',
          code: `int x = 10;
int *p = &x;
*p = 20;
int y = 5;
p = &y;
*p += 1;`,
          steps: [
            {
              line: 1,
              note: '在位址 `0x1000` 放一個 int,名字叫 x,值是 10。',
              cells: [{ region: 'main()', name: 'x', addr: '0x1000', value: '10', hl: true }],
            },
            {
              line: 2,
              note: '`p` 本身也是一個變數(在 `0x1008`),它存的值是 x 的位址 `0x1000` —— 我們說「p 指向 x」。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '10' },
                { region: 'main()', name: 'p', addr: '0x1008', value: '0x1000', ref: 'x', hl: true },
              ],
            },
            {
              line: 3,
              note: '`*p` 是「p 指著的那一格」,也就是 x。所以這行等於 `x = 20`。注意 p 自己的值沒變。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '20', hl: true },
                { region: 'main()', name: 'p', addr: '0x1008', value: '0x1000', ref: 'x' },
              ],
            },
            {
              line: 4,
              note: '再宣告一個 y。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '20' },
                { region: 'main()', name: 'p', addr: '0x1008', value: '0x1000', ref: 'x' },
                { region: 'main()', name: 'y', addr: '0x1010', value: '5', hl: true },
              ],
            },
            {
              line: 5,
              note: '沒有星號:改的是 **p 自己**。現在 p 存 y 的位址,改指向 y。x 完全沒被動到。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '20' },
                { region: 'main()', name: 'p', addr: '0x1008', value: '0x1010', ref: 'y', hl: true },
                { region: 'main()', name: 'y', addr: '0x1010', value: '5' },
              ],
            },
            {
              line: 6,
              note: '`*p += 1` 等於 `y += 1`。結論:**有星號改的是被指的東西,沒星號改的是指標自己。**',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '20' },
                { region: 'main()', name: 'p', addr: '0x1008', value: '0x1010', ref: 'y' },
                { region: 'main()', name: 'y', addr: '0x1010', value: '6', hl: true },
              ],
            },
          ],
        },
        {
          t: 'note',
          kind: 'warn',
          title: '宣告時的星號只跟著一個變數',
          text: '`int* a, b;` 宣告的是「a 是指標、b 是普通 int」。要兩個都是指標,寫 `int *a, *b;`。',
        },
      ],
    },
    {
      title: '為什麼需要指標:讓函式改到呼叫端的變數',
      blocks: [
        {
          t: 'p',
          text: 'C 傳參數一律是複製值。`void swap(int a, int b)` 交換的只是兩個副本,呼叫端的 x、y 完全不變。要讓函式改到呼叫端,就把「位址」傳進去:',
        },
        {
          t: 'memory',
          title: 'C:用指標寫 swap',
          lang: 'c',
          code: `void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("%d %d", x, y);   // 2 1
}`,
          steps: [
            {
              line: 8,
              note: 'main 的堆疊框裡有 x = 1、y = 2。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '1', hl: true },
                { region: 'main()', name: 'y', addr: '0x1004', value: '2', hl: true },
              ],
            },
            {
              line: 1,
              note: '呼叫 `swap(&x, &y)`:堆疊上多了 swap 的框。參數 a、b 拿到的是**位址的副本** —— 副本也指著同樣的地方。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '1' },
                { region: 'main()', name: 'y', addr: '0x1004', value: '2' },
                { region: 'swap()', name: 'a', addr: '0x0F00', value: '0x1000', ref: 'x', hl: true },
                { region: 'swap()', name: 'b', addr: '0x0F08', value: '0x1004', ref: 'y', hl: true },
              ],
            },
            {
              line: 2,
              note: '`t = *a`:照 a 去找,讀到 x 的值 1。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '1' },
                { region: 'main()', name: 'y', addr: '0x1004', value: '2' },
                { region: 'swap()', name: 'a', addr: '0x0F00', value: '0x1000', ref: 'x' },
                { region: 'swap()', name: 'b', addr: '0x0F08', value: '0x1004', ref: 'y' },
                { region: 'swap()', name: 't', addr: '0x0F10', value: '1', hl: true },
              ],
            },
            {
              line: 3,
              note: '`*a = *b`:把 y 的值寫進 x —— 改的是 **main 的 x**。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '2', hl: true },
                { region: 'main()', name: 'y', addr: '0x1004', value: '2' },
                { region: 'swap()', name: 'a', addr: '0x0F00', value: '0x1000', ref: 'x' },
                { region: 'swap()', name: 'b', addr: '0x0F08', value: '0x1004', ref: 'y' },
                { region: 'swap()', name: 't', addr: '0x0F10', value: '1' },
              ],
            },
            {
              line: 4,
              note: '`*b = t`:把 1 寫進 y。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '2' },
                { region: 'main()', name: 'y', addr: '0x1004', value: '1', hl: true },
                { region: 'swap()', name: 'a', addr: '0x0F00', value: '0x1000', ref: 'x' },
                { region: 'swap()', name: 'b', addr: '0x0F08', value: '0x1004', ref: 'y' },
                { region: 'swap()', name: 't', addr: '0x0F10', value: '1' },
              ],
            },
            {
              line: 10,
              note: 'swap 回傳,它的框整個消失;但 x、y 已經真的交換了,印出 `2 1`。',
              cells: [
                { region: 'main()', name: 'x', addr: '0x1000', value: '2' },
                { region: 'main()', name: 'y', addr: '0x1004', value: '1' },
              ],
            },
          ],
        },
        {
          t: 'code',
          title: '各語言怎麼「讓函式改到呼叫端」',
          code: {
            c: `void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }
swap(&x, &y);                  // 傳位址`,
            cpp: `void swap(int &a, int &b) { int t = a; a = b; b = t; }  // 參考:a 就是 x 的別名
swap(x, y);                    // 呼叫時不用寫 &(標準庫也有 std::swap)`,
            python: `# 不能讓函式改呼叫端的整數變數。兩種替代:
x, y = y, x                    # 1. 直接在原地交換
a[i], a[j] = a[j], a[i]        # 2. 交換陣列(可變物件)裡的元素`,
            java: `// 基本型別沒辦法透過參數改回去;交換陣列裡的兩格:
void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }`,
            javascript: `[x, y] = [y, x];               // 解構賦值,原地交換
[a[i], a[j]] = [a[j], a[i]];   // 交換陣列元素`,
          },
        },
      ],
    },
    {
      title: '指標與陣列',
      blocks: [
        {
          t: 'p',
          text: 'C 的陣列在記憶體裡是連續的。陣列名稱在大部分情況下會自動變成「指向第 0 個元素的指標」,所以 `a[i]` 其實就是 `*(a + i)`:從開頭往後數 i 個元素。指標加 1 不是位址加 1,而是加 `sizeof(元素)`。',
        },
        {
          t: 'code',
          title: '陣列、指標運算與長度',
          code: {
            c: `int a[5] = {10, 20, 30, 40, 50};
int *p = a;            // 等於 &a[0]
printf("%d", *(p + 2)); // 30,和 a[2] 一樣
p++;                   // 現在指向 a[1](位址 +4,因為 int 佔 4 bytes)

void f(int *arr) {
    // 傳進函式後只剩一個指標:sizeof(arr) 是指標大小(8),不是陣列大小!
    // 這就是為什麼 LeetCode 的 C 函式都會另外傳 numsSize
}`,
            cpp: `int a[5] = {10, 20, 30, 40, 50};
int *p = a;
cout << *(p + 2);      // 30

vector<int> v = {10, 20, 30};
int *q = v.data();     // vector 的底層也是連續陣列
// 實務上用 v.size() 和索引就好,很少需要指標運算`,
          },
        },
        {
          t: 'note',
          kind: 'key',
          title: '索引就是「陣列版的指標」',
          text: '在 Python、Java、JS 裡沒有指標運算,但用一個整數 `i` 表示「目前在 a[i]」,做的是一模一樣的事。演算法裡的雙指標,在 C 可以寫成兩個 `int*`,在其他語言就寫成兩個索引。',
        },
      ],
    },
    {
      title: '結構、箭頭 -> 與鏈結串列',
      blocks: [
        {
          t: 'p',
          text: '鏈結串列和樹的節點是用指標串起來的。C / C++ 用 `node->next` 取「指標指向的結構的欄位」,等於 `(*node).next`。其他語言一律用點 `.`,因為變數本來就是參考。',
        },
        {
          t: 'code',
          title: '走過一條鏈結串列',
          code: {
            c: `struct ListNode { int val; struct ListNode *next; };

int length(struct ListNode *head) {
    int n = 0;
    for (struct ListNode *cur = head; cur != NULL; cur = cur->next) n++;
    return n;
}`,
            cpp: `int length(ListNode* head) {
    int n = 0;
    for (ListNode* cur = head; cur; cur = cur->next) n++;   // nullptr 當成 false
    return n;
}`,
            python: `def length(head):
    n, cur = 0, head
    while cur:              # None 當成 False
        n += 1
        cur = cur.next
    return n`,
            java: `int length(ListNode head) {
    int n = 0;
    for (ListNode cur = head; cur != null; cur = cur.next) n++;
    return n;
}`,
            javascript: `function length(head) {
  let n = 0;
  for (let cur = head; cur !== null; cur = cur.next) n++;
  return n;
}`,
          },
        },
        {
          t: 'note',
          kind: 'warn',
          title: '空指標是 Runtime Error 的頭號來源',
          text: '對 `NULL` / `nullptr` / `null` / `None` 取欄位(`cur->next`、`cur.next`)會當掉。寫 `cur.next.next` 之前,要先確定 `cur` 和 `cur.next` 都不是空的 —— [[p:fast-slow]] 的迴圈條件 `while fast and fast.next` 就是在做這件事。',
        },
      ],
    },
    {
      title: '指標的指標',
      blocks: [
        {
          t: 'p',
          text: '`int **pp` 是「指向一個指標」的指標。刷題會在兩個地方遇到它:LeetCode C 的二維陣列(`int** grid` 是「一排指標,每個指向一列」)與 `returnColumnSizes`(見 [[c:c-lang]]);以及「讓函式改掉呼叫端的指標」,例如刪掉串列的頭節點。',
        },
        {
          t: 'code',
          title: '用指標的指標刪除節點:不必特別處理頭節點',
          code: {
            c: `// pp 指向「指向目前節點的那個指標」:一開始是 &head,之後是 &(前一個節點的 next)
struct ListNode* removeElements(struct ListNode* head, int val) {
    struct ListNode **pp = &head;
    while (*pp) {
        if ((*pp)->val == val) {
            struct ListNode *del = *pp;
            *pp = del->next;     // 把「指向它的那個指標」改成指向下一個
            free(del);
        } else {
            pp = &(*pp)->next;   // 往後走:改成指向下一個節點的 next 欄位
        }
    }
    return head;
}`,
            cpp: `ListNode* removeElements(ListNode* head, int val) {
    ListNode** pp = &head;
    while (*pp) {
        if ((*pp)->val == val) *pp = (*pp)->next;
        else pp = &(*pp)->next;
    }
    return head;
}`,
            python: `# 沒有指標的指標,用 dummy(虛擬頭節點)達到同樣效果:頭節點也有「前一個」
def removeElements(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`,
          },
        },
      ],
    },
    {
      title: 'C++ 的參考 &',
      blocks: [
        {
          t: 'p',
          text: 'C++ 的參考是「別名」:`int &r = x;` 之後,r 就是 x,對 r 做什麼就是對 x 做什麼。它比指標安全:一定要初始化、不會是空的、不能改去綁別的變數。刷題時最常用在三個地方:',
        },
        {
          t: 'code',
          title: '刷題最常見的三種 &',
          code: {
            cpp: `// 1. 參數:避免複製大物件(唯讀加 const)
int sum(const vector<int>& nums);

// 2. 參數:讓函式修改呼叫端的東西(回溯的 path、DFS 的 visited)
void dfs(int u, vector<bool>& visited, vector<int>& path);

// 3. range-for:要修改元素時加 &,否則改的是副本
for (auto& x : nums) x *= 2;      // ✓ 真的改到 nums
for (auto x : nums) x *= 2;       // ✗ 改的是複製出來的 x
for (const auto& s : words) ...   // 唯讀又不想複製字串`,
          },
        },
      ],
    },
    {
      title: '各語言對照',
      blocks: [
        {
          t: 'table',
          cols: ['概念', 'C', 'C++', 'Java', 'Python', 'JavaScript'],
          rows: [
            ['空值', '`NULL`', '`nullptr`', '`null`', '`None`', '`null` / `undefined`'],
            ['存取欄位', '`p->val`', '`p->val`', '`p.val`', '`p.val`', '`p.val`'],
            ['建立節點', '`malloc` + 設欄位', '`new ListNode(1)`', '`new ListNode(1)`', '`ListNode(1)`', '`new ListNode(1)`'],
            ['釋放', '`free`', '`delete`(LeetCode 上常省略)', '自動(GC)', '自動', '自動'],
            ['位址運算', '有', '有', '無', '無', '無'],
            ['讓函式改呼叫端', '傳指標', '傳參考 `&` 或指標', '改物件內容', '改物件內容', '改物件內容'],
          ],
        },
      ],
    },
    {
      title: '演算法裡的「指標」',
      blocks: [
        {
          t: 'p',
          text: '當題解說「左指標」「快指標」時,指的是「一個記住位置的變數」:在陣列上是**索引**,在串列上是**節點參考**。下面這些技巧都是同一個想法 —— 用幾個位置變數掃過資料,讓每個元素只被看常數次,把 O(n²) 降成 O(n):',
        },
        {
          t: 'table',
          cols: ['技巧', '指標是什麼', '怎麼移動', '代表題'],
          rows: [
            ['對撞雙指標', '兩個索引,一頭一尾', '往中間靠,每步丟掉一個不可能的答案', '[[p:two-pointers]]:Two Sum II(167)、Container With Most Water(11)'],
            ['同向讀寫指標', '讀指標 + 寫指標', '讀的每步走,寫的只在保留時走', 'Remove Duplicates(26)、Move Zeroes(283)'],
            ['滑動視窗', '左右邊界', '右邊擴張,不合法時左邊收縮', '[[p:sliding-window]]:Longest Substring Without Repeating(3)'],
            ['快慢指標', '兩個節點參考', '快的一次兩步、慢的一次一步', '[[p:fast-slow]]:Linked List Cycle(141)、Middle of the Linked List(876)'],
            ['兩個序列各一個', '各指一個序列', '比較後較小的那個前進', 'Merge Sorted Array(88)、[[p:merge-sort]] 的合併'],
            ['三指標', 'lo / mid / hi', '依值把元素丟到三區', 'Sort Colors(75,荷蘭國旗)'],
            ['串列改接', 'prev / cur / next', '改箭頭前先存下一個', '[[p:linked-list]]:Reverse Linked List(206)'],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '對空指標取欄位:`cur->next` 之前沒檢查 `cur`,`fast.next.next` 之前沒檢查 `fast.next`。',
    '回傳區域變數的位址:函式結束後那塊堆疊空間就失效了(懸空指標)。要回傳陣列就 `malloc`。',
    '宣告了指標卻沒初始化就使用(野指標),它指向一個隨機位址。',
    '在函式裡用 `sizeof(arr)` 想拿陣列長度:陣列傳進來已經變成指標,只會得到 8。',
    '改串列的 `next` 之前沒先存好原本的下一個,後半段就找不回來了。',
    '`int* a, b;` 以為 b 也是指標。',
  ],
  quiz: [
    {
      q: '`int x = 1; int *p = &x; *p = 5;` 之後 x 是?',
      options: ['1', '5', 'x 的位址'],
      a: 1,
      why: '`*p` 就是 p 指著的那格,也就是 x。',
    },
    {
      q: '`int x = 1, y = 2; int *p = &x; p = &y; *p = 9;` 之後 x 和 y 是?',
      options: ['x = 9, y = 2', 'x = 1, y = 9', 'x = 9, y = 9'],
      a: 1,
      why: '`p = &y`(沒有星號)讓 p 改指向 y,之後 `*p = 9` 改的是 y。',
    },
    {
      q: 'C 函式 `void f(int *a)` 裡寫 `sizeof(a) / sizeof(a[0])`,在 64 位元系統上得到?',
      options: ['陣列長度', '2(指標 8 bytes ÷ int 4 bytes)', '編譯錯誤'],
      a: 1,
      why: '陣列傳進函式就退化成指標,`sizeof(a)` 是指標的大小。所以 LeetCode 都另外傳 `numsSize`。',
    },
    {
      q: '「雙指標」解 Two Sum II(已排序陣列)時,Python 版本的「指標」是什麼?',
      options: ['記憶體位址', '兩個整數索引', '兩個串列節點'],
      a: 1,
      why: '演算法裡的指標是「記住位置的變數」。陣列上用索引,串列上才是節點參考。',
    },
    {
      q: 'C++ `for (auto x : nums) x = 0;` 執行後,nums 會變成全 0 嗎?',
      options: ['會', '不會,x 是副本'],
      a: 1,
      why: '要改到原本的元素得寫 `for (auto& x : nums)`。',
    },
  ],
  next: ['two-pointers', 'fast-slow', 'linked-list', 'sliding-window'],
}

const arraysStrings: Concept = {
  id: 'arrays-strings',
  name: '陣列與字串',
  level: 1,
  prereq: ['memory-model'],
  lead:
    '陣列是一排連續的格子,用索引可以 O(1) 直接跳到任何一格 —— 這是它最大的優點,也是 LeetCode 一半以上題目的輸入。' +
    '字串可以想成字元陣列,但在 Python、Java、JavaScript 裡它是**不可變**的,這會影響你該怎麼組字串。',
  sections: [
    {
      title: '為什麼索引是 O(1)',
      blocks: [
        {
          t: 'p',
          text: '因為格子連續、每格一樣大,第 i 格的位址可以直接算出來:`開頭位址 + i × 每格大小`。不用從頭數。反過來說,在中間插入一個元素,後面所有元素都要往後挪一格,所以是 O(n)。',
        },
        {
          t: 'table',
          cols: ['操作', '複雜度', '說明'],
          rows: [
            ['讀 / 寫 `a[i]`', 'O(1)', '直接算位址'],
            ['尾端加入(動態陣列)', '攤銷 O(1)', '偶爾要擴容搬家,見 [[c:complexity-analysis]]'],
            ['尾端刪除', 'O(1)', ''],
            ['開頭 / 中間插入或刪除', 'O(n)', '後面的元素都要挪'],
            ['找某個值(沒排序)', 'O(n)', '只能一個一個看'],
            ['找某個值(已排序)', 'O(log n)', '[[p:binary-search]]'],
          ],
        },
      ],
    },
    {
      title: '宣告與初始化',
      blocks: [
        {
          t: 'code',
          title: '一維與二維陣列',
          code: {
            python: `a = [0] * n                        # n 個 0
b = [-1] * n
grid = [[0] * cols for _ in range(rows)]   # 二維一定要這樣寫,見「變數、記憶體與參考」
a.append(5); a.pop()               # 尾端加入 / 刪除
n = len(a)`,
            c: `int a[100] = {0};                   // 固定大小,全 0(只有寫 {0} 才保證全 0)
int *b = malloc(n * sizeof(int));   // 執行時才知道大小:malloc,內容未初始化
int *c = calloc(n, sizeof(int));    // calloc 會全部設成 0
free(b); free(c);`,
            cpp: `vector<int> a(n);                   // n 個 0
vector<int> b(n, -1);               // n 個 -1
vector<vector<int>> grid(rows, vector<int>(cols, 0));
a.push_back(5); a.pop_back();
int len = a.size();                 // size() 回傳無號整數,存成 int 再運算比較安全`,
            java: `int[] a = new int[n];               // 固定長度,預設全 0
int[] b = new int[n]; Arrays.fill(b, -1);
int[][] grid = new int[rows][cols];
List<Integer> list = new ArrayList<>();  // 可變長度,只能放物件(Integer)
list.add(5); list.remove(list.size() - 1);`,
            javascript: `const a = new Array(n).fill(0);
const b = new Array(n).fill(-1);
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
a.push(5); a.pop();`,
          },
        },
      ],
    },
    {
      title: '索引技巧',
      blocks: [
        {
          t: 'list',
          items: [
            '**從 0 開始**:長度 n 的合法索引是 0 到 n−1。迴圈寫 `i < n`,不是 `i <= n`。',
            '**半開區間 [lo, hi)**:包含 lo、不含 hi,長度剛好是 `hi − lo`,空區間就是 `lo == hi`。很多語言的切片(`a[lo:hi]`、`subList`、`substring`)都是半開的。',
            '**Python 的負索引**:`a[-1]` 是最後一個。其他語言沒有這個功能,`a[-1]` 在 C/C++ 是越界、在 JS 是 `undefined`(JS 有 `a.at(-1)`)。',
            '**二維轉一維**:r 列 c 行的格子編號是 `r * cols + c`,反過來 `r = id / cols`、`c = id % cols`。[[p:union-find]] 處理網格時很常用。',
            '**方向陣列**:網格上下左右四個鄰居,寫成 `dirs = [(1,0),(-1,0),(0,1),(0,-1)]` 再用迴圈,比寫四段 if 不容易錯。',
          ],
        },
        {
          t: 'code',
          title: '網格的四個鄰居',
          code: {
            python: `for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    nr, nc = r + dr, c + dc
    if 0 <= nr < rows and 0 <= nc < cols:
        ...`,
            cpp: `int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
for (int k = 0; k < 4; k++) {
    int nr = r + dr[k], nc = c + dc[k];
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) { ... }
}`,
            java: `int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int[] d : dirs) {
    int nr = r + d[0], nc = c + d[1];
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) { ... }
}`,
          },
        },
      ],
    },
    {
      title: '字串:不可變與字元編碼',
      blocks: [
        {
          t: 'table',
          cols: ['語言', '字串可以改嗎', '要改的話'],
          rows: [
            ['C', '可以(就是 `char` 陣列,以 `\\0` 結尾)', '直接改 `s[i]`;注意長度要用 `strlen` 算'],
            ['C++', '可以(`std::string`)', '直接改 `s[i]`,`s += c` 攤銷 O(1)'],
            ['Java', '不行', '`StringBuilder`,或 `s.toCharArray()` 改完再 `new String(arr)`'],
            ['Python', '不行', '轉成 `list(s)`,改完 `"".join(lst)`'],
            ['JavaScript', '不行', '`s.split("")` 改完 `arr.join("")`'],
          ],
        },
        {
          t: 'p',
          text: '字元在電腦裡是一個整數(ASCII / Unicode 編碼)。小寫字母 `a`–`z` 是連續的 97–122,所以 `c - \'a\'` 會得到 0–25,可以拿來當大小 26 的計數陣列的索引 —— 比 Hash 表又快又省:',
        },
        {
          t: 'code',
          title: '統計每個小寫字母出現幾次',
          code: {
            python: `cnt = [0] * 26
for ch in s:
    cnt[ord(ch) - ord('a')] += 1     # ord 取編碼,chr 反過來`,
            c: `int cnt[26] = {0};
for (int i = 0; s[i]; i++) cnt[s[i] - 'a']++;   // char 本身就是小整數`,
            cpp: `int cnt[26] = {};
for (char ch : s) cnt[ch - 'a']++;`,
            java: `int[] cnt = new int[26];
for (char ch : s.toCharArray()) cnt[ch - 'a']++;`,
            javascript: `const cnt = new Array(26).fill(0);
for (const ch of s) cnt[ch.charCodeAt(0) - 97]++;   // 'a' 的編碼是 97`,
          },
        },
      ],
    },
    {
      title: '常用字串操作對照',
      blocks: [
        {
          t: 'table',
          cols: ['操作', 'Python', 'C++', 'Java', 'JavaScript'],
          rows: [
            ['長度', '`len(s)`', '`s.size()`', '`s.length()`', '`s.length`'],
            ['第 i 個字元', '`s[i]`', '`s[i]`', '`s.charAt(i)`', '`s[i]`'],
            ['子字串 [i, j)', '`s[i:j]`', '`s.substr(i, j - i)`', '`s.substring(i, j)`', '`s.slice(i, j)`'],
            ['用空白切開', '`s.split()`', '`stringstream` 逐一讀', '`s.split(" ")`', '`s.split(" ")`'],
            ['反轉', '`s[::-1]`', '`reverse(s.begin(), s.end())`', '`new StringBuilder(s).reverse()`', '`[...s].reverse().join("")`'],
            ['轉整數', '`int(s)`', '`stoi(s)`', '`Integer.parseInt(s)`', '`Number(s)` / `parseInt(s)`'],
            ['整數轉字串', '`str(x)`', '`to_string(x)`', '`String.valueOf(x)`', '`String(x)`'],
            ['是否字母 / 數字', '`ch.isalpha()` / `ch.isdigit()`', '`isalpha(ch)` / `isdigit(ch)`', '`Character.isLetter(ch)`', '`/[a-z]/i.test(ch)`'],
          ],
          note: 'C 的字串操作(`strlen`、`strcmp`、`strcpy`)見 [[c:c-lang]]。取子字串在 Python / Java / JS 都會複製,是 O(長度),寫在迴圈裡要小心。',
        },
      ],
    },
  ],
  pitfalls: [
    '迴圈寫 `i <= n` 越界一格(off-by-one)。',
    'Python / Java / JS 在迴圈裡用 `+=` 組長字串:每次都建新字串,可能變成 O(n²)。用 list + join 或 `StringBuilder`。',
    '在迴圈裡反覆取子字串來比較,每次都是 O(k) 的複製。',
    'C 的字串忘了留 `\\0` 的位置:長度 n 的字串要 `malloc(n + 1)`。',
    '用 Java `==` 比較字串內容。',
    'JS 的 `a[-1]` 不會報錯,只會得到 `undefined`,bug 很難發現。',
  ],
  quiz: [
    {
      q: '在長度 n 的動態陣列「開頭」插入一個元素,複雜度是?',
      options: ['O(1)', 'O(log n)', 'O(n)'],
      a: 2,
      why: '所有元素都要往後挪一格。需要兩端都快時用 deque。',
    },
    {
      q: '`s = "hello"`,想把第 0 個字元改成 `H`。在 Java / Python 裡?',
      options: ['直接寫 `s[0] = \'H\'`', '字串不可變,要轉成字元陣列或建新字串', '用指標修改'],
      a: 1,
      why: 'Java、Python、JS 的字串都不可變。C 和 C++ 才能直接改。',
    },
    {
      q: '`c - \'a\'` 在 c 是 `\'d\'` 時等於?',
      options: ['3', '4', '100'],
      a: 0,
      why: 'a b c d 分別是 0 1 2 3。字母編碼是連續的。',
    },
    {
      q: '半開區間 [3, 7) 包含幾個元素?',
      options: ['3', '4', '5'],
      a: 1,
      why: '3、4、5、6,共 7 − 3 = 4 個。半開區間的長度就是 hi − lo。',
    },
  ],
  next: ['two-pointers', 'prefix-sum', 'string-ops', 'simulation'],
}

const integers: Concept = {
  id: 'integers',
  name: '整數、溢位與取模',
  level: 2,
  prereq: ['arrays-strings'],
  lead:
    '電腦的整數有位數上限:32 位元的 `int` 最大約 21 億。超過就會「溢位」,在 C / C++ 裡可能變成負數、甚至是未定義行為。' +
    '刷題最常見的整數 bug 有四種:相加或相乘溢位、二分搜尋的 mid 溢位、負數的除法與取餘、以及「答案對 10⁹ + 7 取模」寫錯。',
  sections: [
    {
      title: '各語言的整數範圍',
      blocks: [
        {
          t: 'table',
          cols: ['型別', '大約範圍', '哪些語言'],
          rows: [
            ['32 位元有號', '±2.1 × 10⁹(`2³¹ − 1 = 2147483647`)', 'C / C++ `int`、Java `int`'],
            ['64 位元有號', '±9.2 × 10¹⁸', 'C / C++ `long long`、Java `long`'],
            ['任意大', '無上限(越大越慢)', 'Python `int`;JS `BigInt`(寫 `10n`)'],
            ['雙精度浮點', '整數精確到 2⁵³ − 1 ≈ 9 × 10¹⁵', 'JavaScript 的 `number`(JS 一般數字就是這個)'],
          ],
          note: '記法:2³¹ ≈ 2.1 × 10⁹、2⁶³ ≈ 9.2 × 10¹⁸。題目值的範圍到 10⁹,兩個數相加就可能超過 `int`。',
        },
      ],
    },
    {
      title: '溢位怎麼發生、怎麼防',
      blocks: [
        {
          t: 'code',
          title: '三個最常見的溢位點',
          code: {
            c: `int a = 2000000000, b = 2000000000;
long long s = a + b;              // ✗ a + b 先用 int 算,已經溢位了才轉 long long
long long s2 = (long long)a + b;  // ✓ 先轉型再加
long long p = 1LL * a * b;        // ✓ 乘法同理

int mid = (lo + hi) / 2;          // ✗ lo + hi 可能溢位
int mid2 = lo + (hi - lo) / 2;    // ✓ 二分搜尋的標準寫法`,
            cpp: `int a = 2e9, b = 2e9;
long long s = (long long)a + b;   // ✓
long long p = 1LL * a * b;        // ✓
int mid = lo + (hi - lo) / 2;     // ✓
long long total = accumulate(v.begin(), v.end(), 0LL);  // 起始值寫 0LL,不然用 int 累加`,
            java: `int a = 2_000_000_000, b = 2_000_000_000;
long s = (long) a + b;            // ✓
long p = (long) a * b;            // ✓
int mid = lo + (hi - lo) / 2;     // ✓(或 (lo + hi) >>> 1)
Math.addExact(a, b);              // 溢位時丟例外,除錯用`,
            python: `# Python 的 int 沒有上限,不會溢位。
# 但題目要求「模擬 32 位元」時(例如 Reverse Integer 7),要自己檢查範圍:
if not -2**31 <= x <= 2**31 - 1:
    return 0`,
            javascript: `// number 是浮點數,超過 2^53 就開始失去精度(不會變負數,但會不準)
const big = 2 ** 53 + 1;          // 實際上存成 2^53
const p = BigInt(a) * BigInt(b);  // 需要精確大數時用 BigInt
Math.floor((lo + hi) / 2);        // JS 的 / 是浮點除法,要自己取整`,
          },
        },
        {
          t: 'note',
          kind: 'warn',
          title: 'abs(INT_MIN) 也會溢位',
          text: '32 位元的範圍是 −2³¹ 到 2³¹ − 1,負的比正的多一個。所以 `-(-2147483648)` 放不進 `int`。處理負數的絕對值時先轉成 `long long` / `long`。',
        },
      ],
    },
    {
      title: '負數的除法與取餘',
      blocks: [
        {
          t: 'p',
          text: '這是跨語言最容易錯的地方:Python 的 `//` 是**向下取整**(往負無限大),C / C++ / Java 的整數除法是**向零取整**。取餘的正負號也跟著不同。',
        },
        {
          t: 'table',
          cols: ['運算', 'Python', 'C / C++ / Java', 'JavaScript'],
          rows: [
            ['7 / 2(整數除法)', '`7 // 2` = 3', '`7 / 2` = 3', '`Math.trunc(7 / 2)` = 3'],
            ['−7 / 2', '`-7 // 2` = **−4**', '`-7 / 2` = **−3**', '`Math.trunc(-7 / 2)` = −3;`Math.floor` = −4'],
            ['−7 % 3', '`-7 % 3` = **2**(和除數同號)', '`-7 % 3` = **−1**(和被除數同號)', '`-7 % 3` = −1'],
          ],
          note: '要一個保證非負的餘數(例如環狀陣列的索引):寫 `((a % m) + m) % m`,在每種語言都對。',
        },
        {
          t: 'p',
          text: '**無條件進位的整數除法**:`ceil(a / b)` 用浮點數算可能有誤差,整數寫法是 `(a + b - 1) / b`(a、b 為正)。Python 也可以寫 `-(-a // b)`。[[p:binary-search-answer]] 的 Koko Eating Bananas 就會用到。',
        },
      ],
    },
    {
      title: '對 10⁹ + 7 取模',
      blocks: [
        {
          t: 'p',
          text: '方法數類的題目答案成長極快,題目會要求回傳「答案 mod 1,000,000,007」。選這個數是因為它是質數,而且兩個小於它的數相加還放得進 `int`、相乘放得進 64 位元。規則是**每做一次加法或乘法就取一次模**,不要等到最後:',
        },
        {
          t: 'code',
          title: '取模的正確寫法',
          code: {
            python: `MOD = 10**9 + 7
total = (total + ways) % MOD
prod = prod * x % MOD
diff = (a - b) % MOD          # Python 的 % 結果一定非負`,
            cpp: `const int MOD = 1e9 + 7;
total = (total + ways) % MOD;             // 兩個 < MOD 的 int 相加不會溢位
prod = 1LL * prod * x % MOD;              // 相乘要先轉 long long
diff = ((a - b) % MOD + MOD) % MOD;       // 相減可能變負數`,
            java: `final int MOD = 1_000_000_007;
total = (total + ways) % MOD;
prod = (int) ((long) prod * x % MOD);
diff = ((a - b) % MOD + MOD) % MOD;`,
            javascript: `const MOD = 1e9 + 7;
total = (total + ways) % MOD;
// 兩個 ~1e9 的數相乘約 1e18,超過 2^53 會失準!要用 BigInt:
prod = Number((BigInt(prod) * BigInt(x)) % BigInt(MOD));`,
          },
        },
        {
          t: 'note',
          kind: 'tip',
          title: '除法不能直接取模',
          text: '`(a / b) % m` 不等於 `(a % m) / (b % m)`。要用「模反元素」:m 是質數時,除以 b 等於乘以 `pow(b, m - 2, m)`(費馬小定理)。組合數 C(n, k) 取模時會用到,見 [[p:math]]。',
        },
      ],
    },
    {
      title: '二進位與位元運算速覽',
      blocks: [
        {
          t: 'p',
          text: '整數在電腦裡是一串 0 和 1。負數用**二補數**表示:`-x` 等於「把 x 每一位反轉再加 1」(`~x + 1`)。所以 −1 的每一位都是 1。位元運算在刷題裡常用來表示集合(第 i 位是 1 代表選了第 i 個)。',
        },
        {
          t: 'table',
          cols: ['寫法', '意思', '用途'],
          rows: [
            ['`x & 1`', '最低位', '判斷奇偶(比 `% 2` 對負數更安全)'],
            ['`x >> 1`', '右移一位', '除以 2(向下取整)'],
            ['`1 << k`', '第 k 位是 1', '2ᵏ;集合裡只有第 k 個元素'],
            ['`x & (1 << k)`', '第 k 位是不是 1', '第 k 個元素有沒有選'],
            ['`x & (x - 1)`', '去掉最低的 1', '數 1 的個數、判斷是不是 2 的次方'],
            ['`x & -x`', '只留最低的 1', '[[p:segment-tree]] 的 BIT'],
            ['`a ^ b`', '互斥或', '`a ^ a = 0`:找唯一出現一次的數(Single Number 136)'],
          ],
          note: '更多技巧見 [[p:bit-manipulation]]。位元運算子的優先順序比 `==` 低,`x & 1 == 0` 會被解讀成 `x & (1 == 0)`,記得加括號。',
        },
      ],
    },
    {
      title: '浮點數:能不用就不用',
      blocks: [
        {
          t: 'list',
          items: [
            '`0.1 + 0.2 == 0.3` 在每種語言都是 `false`,浮點數有誤差。',
            '比較斜率、比例時,用**交叉相乘**改成整數比較:`a/b < c/d` 寫成 `a*d < c*b`(注意正負號與溢位)。',
            '開根號判斷完全平方數:`int(sqrt(n))` 可能差一,算完再用整數驗證 `r * r == n`。',
            '一定要用浮點時,比較寫成 `abs(a - b) < 1e-9`。',
          ],
        },
      ],
    },
  ],
  pitfalls: [
    '`long long x = a * b;` 以為結果是 64 位元:右邊先用 `int` 算完才轉型,早就溢位了。',
    '二分搜尋寫 `(lo + hi) / 2`,lo、hi 都接近 2³¹ 時溢位。',
    '在 Python 和 C++ / Java 之間翻譯程式碼時,負數的 `//`、`%` 結果不同。',
    '取模只在最後做一次,中間結果早就溢位;或相減後忘了加回 MOD 變成負數。',
    'JavaScript 兩個 10⁹ 等級的數相乘再取模,超過 2⁵³ 失去精度,答案錯但不會報錯。',
    '`x & 1 == 0` 少了括號。',
  ],
  quiz: [
    {
      q: 'C++:`int a = 1e9, b = 3; long long c = a * b;`,c 會是 3×10⁹ 嗎?',
      options: ['會', '不會,a * b 先以 int 計算就溢位了'],
      a: 1,
      why: '要寫 `1LL * a * b` 或 `(long long)a * b`,讓乘法本身用 64 位元做。',
    },
    {
      q: 'Python 的 `-7 // 2` 和 Java 的 `-7 / 2` 分別是?',
      options: ['−3 和 −3', '−4 和 −3', '−4 和 −4'],
      a: 1,
      why: 'Python 向下取整(往負無限大),Java 向零取整。',
    },
    {
      q: '環狀陣列往左走一步:`(i - 1) % n` 在 i = 0 時,在 Java 會得到?',
      options: ['n − 1', '−1', '0'],
      a: 1,
      why: 'Java 的 % 結果和被除數同號。要寫 `(i - 1 + n) % n`。',
    },
    {
      q: '題目答案要對 10⁹ + 7 取模,DP 每一步把兩個狀態相加。什麼時候取模?',
      options: ['只在最後回傳前', '每次相加之後', '不用取模'],
      a: 1,
      why: '每一步都取,中間值才不會溢位。Python 雖然不會溢位,但數字越大越慢,也應該每步取。',
    },
  ],
  next: ['bit-manipulation', 'math', 'binary-search'],
}

const recursion: Concept = {
  id: 'recursion',
  name: '遞迴與呼叫堆疊',
  level: 2,
  prereq: ['memory-model'],
  lead:
    '遞迴就是函式呼叫自己。要寫對遞迴,關鍵是**相信它**:只要終止條件對、而且每次都把問題變小,「用自己解比較小的自己」就成立。' +
    '樹、回溯、分治、記憶化搜尋全都建立在遞迴上,看懂呼叫堆疊,這些程式就不再神祕。',
  analogy:
    '電影院裡你想知道自己坐第幾排,但太暗看不到。你問前一排的人「你是第幾排?」,他也不知道,就再問他前面的人……一直問到第一排的人說「我是第 1 排」。答案再一路傳回來,每個人加 1。問的過程是「遞」,傳回來的過程是「迴」。',
  sections: [
    {
      title: '三個要素',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**終止條件(base case)**:最小的情況直接回答,不再呼叫自己。少了它就會無限遞迴。',
            '**把問題變小**:每次呼叫的輸入要更接近終止條件(n − 1、左子樹、剩下的陣列)。',
            '**組合答案**:假設小問題的答案已經拿到了,怎麼組成大問題的答案?',
          ],
        },
        {
          t: 'code',
          title: '階乘:n! = n × (n−1)!',
          code: {
            python: `def fact(n):
    if n <= 1:              # 1. 終止條件
        return 1
    return n * fact(n - 1)  # 2. 變小  3. 組合`,
            c: `long long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
            cpp: `long long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
            java: `long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}`,
            javascript: `function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}`,
          },
        },
      ],
    },
    {
      title: '呼叫堆疊:一步一步看',
      blocks: [
        {
          t: 'p',
          text: '每呼叫一次函式,就在呼叫堆疊上放一個新的「框」,裡面有這一次的參數和區域變數 —— 所以每一層都有**自己的 n**,互不干擾。函式回傳時框被拿掉,回到上一層繼續執行。',
        },
        {
          t: 'memory',
          title: 'Python:fact(3) 的呼叫堆疊',
          lang: 'python',
          code: `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

ans = fact(3)`,
          steps: [
            {
              line: 6,
              note: '呼叫 `fact(3)`:堆疊上放第一個框,n = 3。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3', hl: true },
              ],
            },
            {
              line: 2,
              note: 'n = 3 不是終止條件,往下走。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
              ],
            },
            {
              line: 4,
              note: '要算 `3 * fact(2)`,但 fact(2) 還不知道 —— 先暫停這一層,呼叫 fact(2),堆疊上多一個框。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
                { region: 'fact(3)', name: '等待', value: '3 * fact(2)' },
                { region: 'fact(2)', name: 'n', value: '2', hl: true },
              ],
            },
            {
              line: 4,
              note: 'fact(2) 同樣要等 fact(1)。現在堆疊有三層,每層都有自己的 n。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
                { region: 'fact(3)', name: '等待', value: '3 * fact(2)' },
                { region: 'fact(2)', name: 'n', value: '2' },
                { region: 'fact(2)', name: '等待', value: '2 * fact(1)' },
                { region: 'fact(1)', name: 'n', value: '1', hl: true },
              ],
            },
            {
              line: 3,
              note: 'n = 1 是終止條件,直接回傳 1。這是遞迴最深的地方 —— 堆疊最高就是這時候,所以空間是 O(深度)。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
                { region: 'fact(3)', name: '等待', value: '3 * fact(2)' },
                { region: 'fact(2)', name: 'n', value: '2' },
                { region: 'fact(2)', name: '等待', value: '2 * fact(1)' },
                { region: 'fact(1)', name: 'n', value: '1' },
                { region: 'fact(1)', name: '回傳', value: '1', hl: true },
              ],
            },
            {
              line: 4,
              note: 'fact(1) 的框被拿掉。回到 fact(2):`2 * 1 = 2`,回傳 2。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
                { region: 'fact(3)', name: '等待', value: '3 * fact(2)' },
                { region: 'fact(2)', name: 'n', value: '2' },
                { region: 'fact(2)', name: '回傳', value: '2 * 1 = 2', hl: true },
              ],
            },
            {
              line: 4,
              note: '回到 fact(3):`3 * 2 = 6`,回傳 6。',
              cells: [
                { region: '全域', name: 'ans', value: '(還沒算出)' },
                { region: 'fact(3)', name: 'n', value: '3' },
                { region: 'fact(3)', name: '回傳', value: '3 * 2 = 6', hl: true },
              ],
            },
            {
              line: 6,
              note: '所有框都拿掉了,`ans = 6`。往下呼叫的過程是「遞」,一路回傳的過程是「迴」。',
              cells: [{ region: '全域', name: 'ans', value: '6', hl: true }],
            },
          ],
        },
      ],
    },
    {
      title: '信任遞迴:先定義函式的意思',
      blocks: [
        {
          t: 'p',
          text: '寫遞迴時不要試著在腦中展開每一層 —— 那只會越想越亂。改成先用一句話定義「這個函式回傳什麼」,然後**假設**它對比較小的輸入已經是對的,只思考這一層怎麼用它。以「二元樹的最大深度」為例:',
        },
        {
          t: 'code',
          title: 'depth(node) = 以 node 為根的子樹有幾層',
          code: {
            python: `def maxDepth(root):
    if root is None:                 # 空樹 0 層
        return 0
    # 相信 maxDepth 對左右子樹都是對的,這一層只要 +1
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
            c: `int maxDepth(struct TreeNode* root) {
    if (root == NULL) return 0;
    int l = maxDepth(root->left), r = maxDepth(root->right);
    return 1 + (l > r ? l : r);
}`,
            cpp: `int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}`,
            java: `int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
            javascript: `function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
          },
        },
      ],
    },
    {
      title: '遞迴改成迭代',
      blocks: [
        {
          t: 'p',
          text: '任何遞迴都能改成「自己管理一個堆疊」的迴圈 —— 系統的呼叫堆疊做的就是這件事。需要改的時機:遞迴深度可能很大(Python 預設上限約 1000 層;C++ / Java 幾萬到幾十萬層也可能堆疊溢位),或面試官要求。',
        },
        {
          t: 'code',
          title: '用自己的堆疊做 DFS(前序走訪)',
          code: {
            python: `def preorder(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)   # 先放右邊,才會先處理左邊
        if node.left: stack.append(node.left)
    return out

# 或者提高上限(只在確定深度可控時):
import sys; sys.setrecursionlimit(10**6)`,
            cpp: `vector<int> preorder(TreeNode* root) {
    vector<int> out;
    stack<TreeNode*> st;
    if (root) st.push(root);
    while (!st.empty()) {
        TreeNode* node = st.top(); st.pop();
        out.push_back(node->val);
        if (node->right) st.push(node->right);
        if (node->left) st.push(node->left);
    }
    return out;
}`,
          },
        },
      ],
    },
    {
      title: '遞迴長出來的演算法家族',
      blocks: [
        {
          t: 'table',
          cols: ['家族', '遞迴怎麼用', '本站章節'],
          rows: [
            ['樹的走訪', '對左右子樹各遞迴一次,組合結果', '[[p:tree-dfs]]、[[p:bst]]、[[p:lca]]'],
            ['分治', '切成不重疊的幾塊,各自遞迴,再合併', '[[p:merge-sort]]、[[p:quick-sort]]'],
            ['回溯', '做一個選擇 → 遞迴 → **撤銷**選擇,列舉所有可能', '[[p:backtracking]]'],
            ['記憶化搜尋 / DP', '子問題會重複出現,算過就存起來', '[[p:dp-general]]'],
            ['圖的 DFS', '走到鄰居再遞迴,用 visited 避免繞圈', '[[p:graph-traversal]]'],
          ],
          note: '它們之間的關係與怎麼選,見 [[c:paradigms]]。',
        },
      ],
    },
  ],
  pitfalls: [
    '沒有終止條件,或終止條件永遠到不了(例如 n 每次減 2,卻只判斷 `n == 0`)→ 無限遞迴、堆疊溢位。',
    'Python 忘了寫 `return`:遞迴呼叫的結果沒有傳回去,上一層拿到的是 `None`。',
    '同一個子問題被算很多次(沒有記憶化的費氏數列)→ 指數時間。',
    '回溯時改了共用的狀態(path、visited)卻忘了在回來時撤銷。',
    '輸入可能是一條長鏈(10⁵ 個節點的歪斜樹、長串列),遞迴深度超過語言上限。',
  ],
  quiz: [
    {
      q: '遞迴 fact(n) 計算 n!,同一時間堆疊上最多有幾個框?',
      options: ['1', '約 n 個', '約 2ⁿ 個'],
      a: 1,
      why: '每層都在等下一層回傳,最深時 fact(n)、fact(n−1)…fact(1) 同時在堆疊上。所以空間是 O(n)。',
    },
    {
      q: 'Python 寫 `def f(n): if n == 0: return 0; f(n - 1) + 1`(最後一行沒寫 return),f(3) 回傳?',
      options: ['3', 'None', '0'],
      a: 1,
      why: '最後一行算完沒有回傳,Python 函式沒寫 return 就回傳 None。',
    },
    {
      q: '樹有 10⁵ 個節點,而且是一條直線。Python 遞迴 DFS 會?',
      options: ['正常', '超過遞迴上限,RecursionError', '變成 O(n²)'],
      a: 1,
      why: '深度 10⁵ 遠超過預設的約 1000 層。改用自己的堆疊,或提高上限。',
    },
  ],
  next: ['tree-dfs', 'backtracking', 'merge-sort', 'dp-general'],
}

const classes: Concept = {
  id: 'classes',
  name: '類別、節點與自訂比較',
  level: 2,
  prereq: ['pointers'],
  lead:
    'LeetCode 有三個地方需要你懂「自訂型別」:題目給的 `ListNode` / `TreeNode`、要你實作一整個類別的「設計題」,' +
    '以及排序或 heap 要照自己的規則時寫的**比較函式**。這章把五種語言的寫法放在一起。',
  sections: [
    {
      title: '題目給的節點定義',
      blocks: [
        {
          t: 'p',
          text: '串列和樹的題目,LeetCode 會在註解裡附上節點的定義。你不用寫,但要看得懂,也要會建立新節點:',
        },
        {
          t: 'code',
          title: 'ListNode 與 TreeNode',
          code: {
            python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

node = ListNode(5)`,
            c: `struct ListNode {
    int val;
    struct ListNode *next;
};

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct ListNode *node = malloc(sizeof(struct ListNode));
node->val = 5;
node->next = NULL;     // malloc 不會幫你初始化,一定要自己設`,
            cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* node = new ListNode(5);
ListNode dummy(0);            // 也可以直接放在堆疊上當 dummy,用 dummy.next`,
            java: `public class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

ListNode node = new ListNode(5);`,
            javascript: `function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

const node = new ListNode(5);`,
          },
        },
      ],
    },
    {
      title: '設計題:成員變數 + 方法',
      blocks: [
        {
          t: 'p',
          text: '設計題(Min Stack 155、LRU Cache 146、Implement Trie 208…)要你實作一個類別。判題機會先呼叫建構子,再依序呼叫各個方法。重點是:**狀態存在成員變數裡**,每個方法都能讀寫它。以 Min Stack 為例 —— 要求 push、pop、top、getMin 都是 O(1):',
        },
        {
          t: 'code',
          title: 'Min Stack(155):多存一個「到目前為止的最小值」',
          code: {
            python: `class MinStack:
    def __init__(self):
        self.st = []          # 每格存 (值, 包含這格在內的最小值)

    def push(self, val: int) -> None:
        m = min(val, self.st[-1][1]) if self.st else val
        self.st.append((val, m))

    def pop(self) -> None:
        self.st.pop()

    def top(self) -> int:
        return self.st[-1][0]

    def getMin(self) -> int:
        return self.st[-1][1]`,
            c: `typedef struct {
    int *val, *mn;   // 兩個平行陣列
    int top, cap;
} MinStack;

MinStack* minStackCreate() {
    MinStack *s = malloc(sizeof(MinStack));
    s->cap = 30000;                       // 題目最多 3×10⁴ 次操作
    s->val = malloc(s->cap * sizeof(int));
    s->mn = malloc(s->cap * sizeof(int));
    s->top = 0;
    return s;
}

void minStackPush(MinStack* obj, int val) {
    int m = (obj->top && obj->mn[obj->top - 1] < val) ? obj->mn[obj->top - 1] : val;
    obj->val[obj->top] = val;
    obj->mn[obj->top++] = m;
}

void minStackPop(MinStack* obj) { obj->top--; }
int minStackTop(MinStack* obj) { return obj->val[obj->top - 1]; }
int minStackGetMin(MinStack* obj) { return obj->mn[obj->top - 1]; }

void minStackFree(MinStack* obj) {
    free(obj->val); free(obj->mn); free(obj);
}`,
            cpp: `class MinStack {
    vector<pair<int, int>> st;   // (值, 到這格為止的最小值)
public:
    MinStack() {}
    void push(int val) {
        int m = st.empty() ? val : min(val, st.back().second);
        st.push_back({val, m});
    }
    void pop() { st.pop_back(); }
    int top() { return st.back().first; }
    int getMin() { return st.back().second; }
};`,
            java: `class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();   // {值, 最小值}

    public MinStack() {}

    public void push(int val) {
        int m = st.isEmpty() ? val : Math.min(val, st.peek()[1]);
        st.push(new int[]{val, m});
    }
    public void pop() { st.pop(); }
    public int top() { return st.peek()[0]; }
    public int getMin() { return st.peek()[1]; }
}`,
            javascript: `class MinStack {
  constructor() {
    this.st = [];             // [值, 最小值]
  }
  push(val) {
    const m = this.st.length ? Math.min(val, this.st[this.st.length - 1][1]) : val;
    this.st.push([val, m]);
  }
  pop() { this.st.pop(); }
  top() { return this.st[this.st.length - 1][0]; }
  getMin() { return this.st[this.st.length - 1][1]; }
}`,
          },
        },
        {
          t: 'note',
          kind: 'tip',
          title: 'C 的設計題',
          text: 'C 沒有類別,LeetCode 用「一個 struct + 一組以 `類別名稱` 開頭的函式」模擬:`xxxCreate` 建構、每個方法第一個參數是 `xxx* obj`、最後 `xxxFree` 釋放。',
        },
      ],
    },
    {
      title: '自訂排序:比較函式',
      blocks: [
        {
          t: 'p',
          text: '排序區間要照起點、排序字串要先比長度再比字典序 —— 都要自訂規則。各語言的慣例:Python 用 **key**(把每個元素換成一個可比較的值);其他語言用**比較函式**(給兩個元素,回傳誰該在前面)。',
        },
        {
          t: 'code',
          title: '區間照起點排;起點相同時照終點由大到小',
          code: {
            python: `intervals.sort(key=lambda x: (x[0], -x[1]))   # tuple 會逐項比較`,
            c: `int cmp(const void *a, const void *b) {
    // intervals 是 int**:qsort 給的是「指向元素的指標」,也就是 int**
    const int *x = *(const int **)a, *y = *(const int **)b;
    if (x[0] != y[0]) return (x[0] > y[0]) - (x[0] < y[0]);   // 不寫 x[0] - y[0],避免溢位
    return (y[1] > x[1]) - (y[1] < x[1]);
}
qsort(intervals, intervalsSize, sizeof(int *), cmp);`,
            cpp: `sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
    if (a[0] != b[0]) return a[0] < b[0];   // 回傳 true 代表 a 要排在 b 前面
    return a[1] > b[1];
});`,
            java: `Arrays.sort(intervals, (a, b) -> {
    if (a[0] != b[0]) return Integer.compare(a[0], b[0]);   // 不寫 a[0] - b[0],避免溢位
    return Integer.compare(b[1], a[1]);
});`,
            javascript: `intervals.sort((a, b) => a[0] - b[0] || b[1] - a[1]);   // 回傳負數代表 a 在前`,
          },
        },
        {
          t: 'table',
          cols: ['語言', '比較函式的約定', '陷阱'],
          rows: [
            ['C `qsort`', '回傳負數 / 0 / 正數;參數是指向元素的指標', '`return a - b` 在大正數減大負數時溢位'],
            ['C++ `sort`', '回傳 `bool`:a 是否**嚴格**在 b 前面', '寫成 `<=` 會違反嚴格弱序,可能當掉'],
            ['Java', '回傳負數 / 0 / 正數;只能排物件陣列(`int[][]`、`Integer[]`)', '`int[]` 不能傳比較函式;`a - b` 會溢位,用 `Integer.compare`'],
            ['JavaScript', '回傳負數 / 0 / 正數', '**不給比較函式時按字串排序**:`[10, 9, 1].sort()` 得到 `[1, 10, 9]`'],
            ['Python', '`key=` 一個函式;要反序加 `reverse=True` 或對數字取負', '`cmp` 風格要用 `functools.cmp_to_key`'],
          ],
        },
      ],
    },
    {
      title: '把多個值當成一個鍵',
      blocks: [
        {
          t: 'p',
          text: '常常需要用「(列, 行)」或「(節點, 狀態)」當 Hash 表的鍵或 visited 的元素。各語言能直接當鍵的型別不一樣:',
        },
        {
          t: 'table',
          cols: ['語言', '推薦寫法', '不能這樣寫'],
          rows: [
            ['Python', '`(r, c)`(tuple 不可變,可以當鍵)', '`[r, c]`(list 不能 hash)'],
            ['C++', '`map<pair<int,int>, int>` 可以;`unordered_map` 要把兩個數壓成一個:`(long long)r * C + c`', '`unordered_map<pair<int,int>, int>`(沒有內建 hash,編譯錯誤)'],
            ['Java', '壓成 `long` 或字串 `r + "," + c`;或用 `record` / 自己寫 `equals` + `hashCode`', '`int[]` 當 HashMap 的鍵(比的是參考,永遠找不到)'],
            ['JavaScript', '字串 `r + "," + c`,或數字 `r * C + c`', '`[r, c]` 當 `Map` / `Set` 的鍵(比參考)'],
            ['C', '壓成一個整數,用陣列或 uthash', ''],
          ],
        },
      ],
    },
  ],
  pitfalls: [
    'C 的 `malloc` 出來的節點沒有初始化 `next` / `left` / `right`,裡面是垃圾值。',
    '比較函式寫 `return a - b`,遇到 `-2³¹` 和正數時溢位,排序結果錯亂。',
    'JavaScript 排數字陣列沒給比較函式,得到字典序。',
    'C++ 比較函式用 `<=`:相等時也回傳 true,違反嚴格弱序,`sort` 可能越界當掉。',
    '設計題把狀態放在全域變數或 `static`,多組測資互相汙染。',
    '用 `int[]`(Java)或陣列(JS)當 Hash 的鍵,永遠查不到。',
  ],
  quiz: [
    {
      q: 'JavaScript:`[3, 20, 100].sort()` 的結果是?',
      options: ['[3, 20, 100]', '[100, 20, 3]', '[3, 100, 20]'],
      a: 1,
      why: '預設把元素轉成字串比較:"100" < "20" < "3"。數字一定要寫 `sort((a, b) => a - b)`。',
    },
    {
      q: 'C++ `sort` 的比較函式 `cmp(a, b)` 回傳 true 代表?',
      options: ['a 應該排在 b 前面', 'a 和 b 相等', 'b 應該排在 a 前面'],
      a: 0,
      why: '它定義的是「嚴格小於」。注意 `priority_queue` 的比較方向和 `sort` 相反,見 [[c:cpp-stl]]。',
    },
    {
      q: 'Python 想用 (列, 行) 當 visited 的元素,該用?',
      options: ['list `[r, c]`', 'tuple `(r, c)`', '字典'],
      a: 1,
      why: 'set 和 dict 的元素必須可 hash(不可變)。tuple 可以,list 不行。',
    },
  ],
  next: ['heap', 'interval-scheduling', 'linked-list', 'trie'],
}

export const LANGUAGE: Concept[] = [memoryModel, pointers, arraysStrings, integers, recursion, classes]
