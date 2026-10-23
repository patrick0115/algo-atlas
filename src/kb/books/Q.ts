// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "Q",
  "file": "Q-coding-test.html",
  "title": "程式測驗常考觀念：範例過了，隱藏測資為什麼還錯",
  "lead": "HackerRank 這類線上測驗（OA）除了演算法，最常讓人失分的是三件事：<b>SQL 的分組與 NULL</b>、<b>正規表示式比到太多或太少</b>、<b>邊界條件</b>（溢位、空輸入、重複元素、差一）。範例測資通常小又乾淨，隱藏測資專門打這些地方。演算法套路見 P 章，語言細節見 H 章。",
  "note": "<p class=\"muted small\">對應 taxonomy Q01～Q03。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "main",
      "title": "主圖：一句 SQL 實際的執行順序",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>順序</th><th>子句</th><th>做什麼</th><th>常考的後果</th></tr>\n      <tr><td>1</td><td><code>FROM</code>／<code>JOIN</code></td><td>把表接起來，產生所有候選列</td><td>一對多 JOIN 會讓列變多，之後 <code>SUM</code> 會重複加</td></tr>\n      <tr><td>2</td><td><code>WHERE</code></td><td>逐列篩選</td><td>還沒分組，<b>不能用聚合函式</b>；篩 LEFT JOIN 右表欄位會把沒配到的列也刪掉</td></tr>\n      <tr><td>3</td><td><code>GROUP BY</code></td><td>分組，每組變一列</td><td>SELECT 只能放分組欄位或聚合結果</td></tr>\n      <tr><td>4</td><td><code>HAVING</code></td><td>篩「組」</td><td>這裡才能寫 <code>COUNT(*) &gt;= 2</code></td></tr>\n      <tr><td>5</td><td><code>SELECT</code></td><td>算出要輸出的欄位、window function</td><td>多數資料庫在 WHERE 裡看不到這裡取的別名</td></tr>\n      <tr><td>6</td><td><code>ORDER BY</code>／<code>LIMIT</code></td><td>排序、取前幾筆</td><td>這裡可以用 SELECT 的別名</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "Q01",
      "anchor": "q01",
      "tag": "Q01",
      "name": "SQL 查詢觀念",
      "sub": "JOIN、HAVING、NULL、window",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>先想清楚<b>每一步之後剩幾列</b>：JOIN 決定列怎麼配對、WHERE 篩列、GROUP BY 把列壓成組、HAVING 篩組。NULL 不等於任何東西，連 NULL 都不等。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>INNER JOIN</td><td>只留下兩邊都配得到的列</td></tr>\n        <tr><td>LEFT JOIN</td><td>左表全部保留，右表沒配到的欄位填 NULL</td></tr>\n        <tr><td>CROSS JOIN</td><td>兩表每一列兩兩配對（m × n 列）</td></tr>\n        <tr><td>GROUP BY</td><td>相同值分成一組，每組輸出一列</td></tr>\n        <tr><td>WHERE vs HAVING</td><td>WHERE 在分組前篩列；HAVING 在分組後篩組，可以用聚合函式</td></tr>\n        <tr><td><code>COUNT(*)</code> vs <code>COUNT(col)</code></td><td>前者數列數；後者只數 col 不是 NULL 的列</td></tr>\n        <tr><td>NULL 與三值邏輯</td><td>和 NULL 比較的結果是 UNKNOWN，不是 TRUE；要寫 <code>IS NULL</code>／<code>IS NOT NULL</code></td></tr>\n        <tr><td>window function</td><td><code>ROW_NUMBER()</code>、<code>RANK()</code>、<code>DENSE_RANK()</code>、<code>SUM() OVER (PARTITION BY … ORDER BY …)</code>：在每列旁邊算值，不把列合併</td></tr>\n        <tr><td>RANK vs DENSE_RANK</td><td>同分時 RANK 會跳號（1, 1, 3），DENSE_RANK 不跳（1, 1, 2）</td></tr>\n      </tbody></table></div>",
          "anchor": "q01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 LEFT JOIN 後在 WHERE 篩右表欄位，會變得像 INNER JOIN？</b>沒配到的列右表欄位是 NULL，<code>WHERE r.status = 'A'</code> 對 NULL 是 UNKNOWN，這些列就被刪了。要保留就把條件寫進 <code>ON</code>。</li>\n        <li><b>為什麼 <code>NOT IN (子查詢)</code> 會回空集合？</b>子查詢結果只要有一個 NULL，<code>x NOT IN (…, NULL)</code> 對每一列都是 UNKNOWN。改用 <code>NOT EXISTS</code>。</li>\n        <li><b>為什麼 JOIN 之後 SUM 變大？</b>一對多 JOIN 讓「一」那邊的列被複製成多列，它的金額就被加了好幾次。先在子查詢聚合，再 JOIN。</li>\n        <li><b>「第二高薪資」為什麼常用 DENSE_RANK？</b>最高薪有兩人同分時，第二高應該是下一個不同的金額；RANK 會跳號，ROW_NUMBER 會把同分拆開。</li>\n      </ul>\n<p class=\"codecap\">SQL：每個部門的員工數，只列 2 人以上</p>\n<pre><code>SELECT d.name, COUNT(e.id) AS cnt\nFROM dept d\nLEFT JOIN emp e ON e.dept_id = d.id\nGROUP BY d.name\nHAVING COUNT(e.id) &gt;= 2;\n-- 用 COUNT(e.id)：沒有員工的部門算 0；改成 COUNT(*) 會算成 1（那一列左表還在）</code></pre>",
          "anchor": "q01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>用了 LEFT JOIN，結果還是少了沒配到的列</td><td>右表條件寫在 WHERE</td><td>條件移到 <code>ON</code></td></tr>\n        <tr><td><code>NOT IN</code> 查詢回空</td><td>子查詢結果含 NULL</td><td>改 <code>NOT EXISTS</code>，或子查詢加 <code>WHERE col IS NOT NULL</code></td></tr>\n        <tr><td>JOIN 後總額比實際大</td><td>一對多讓列重複</td><td>先聚合再 JOIN</td></tr>\n        <tr><td><code>WHERE col = NULL</code> 查不到任何列</td><td>NULL 比較結果是 UNKNOWN</td><td>改 <code>IS NULL</code></td></tr>\n        <tr><td>沒有資料的類別在統計裡消失</td><td>用了 INNER JOIN 或 <code>COUNT(*)</code></td><td>LEFT JOIN 加 <code>COUNT(右表欄位)</code></td></tr>\n        <tr><td>排名題同分時答案錯</td><td>RANK、DENSE_RANK、ROW_NUMBER 用錯</td><td>依題意選：要不跳號用 DENSE_RANK，要唯一名次用 ROW_NUMBER</td></tr>\n      </tbody></table></div>",
          "anchor": "q01-l3"
        }
      ]
    },
    {
      "id": "Q02",
      "anchor": "q02",
      "tag": "Q02",
      "name": "正規表示式",
      "sub": "量詞、貪婪、錨點、群組",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>量詞預設<b>貪婪</b>（能多吃就多吃），驗證格式要加<b>錨點</b>（<code>^…$</code>）才不會只比到一部分，群組會改變 <code>findall</code> 回傳的東西。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>語法</th><th>意思</th></tr>\n        <tr><td><code>.</code></td><td>任一字元（預設不含換行）；要比對真的句點寫 <code>\\.</code></td></tr>\n        <tr><td><code>\\d</code> <code>\\w</code> <code>\\s</code></td><td>數字、單字字元（字母數字底線）、空白；大寫 <code>\\D \\W \\S</code> 是反面</td></tr>\n        <tr><td><code>[abc]</code> <code>[^abc]</code> <code>[a-z]</code></td><td>字元類別：其中之一、不是其中任何一個、範圍</td></tr>\n        <tr><td><code>*</code> <code>+</code> <code>?</code> <code>{m,n}</code></td><td>前一個元素 0 次以上、1 次以上、0 或 1 次、m 到 n 次</td></tr>\n        <tr><td>貪婪 vs 非貪婪</td><td>預設盡量多；量詞後加 <code>?</code>（<code>*?</code>、<code>+?</code>）變成盡量少</td></tr>\n        <tr><td><code>^</code> <code>$</code> <code>\\b</code></td><td>開頭、結尾、單字邊界</td></tr>\n        <tr><td><code>( )</code> <code>(?: )</code> <code>|</code></td><td>擷取群組、不擷取的群組、或</td></tr>\n      </tbody></table></div>",
          "anchor": "q02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 <code>&lt;.*&gt;</code> 對 <code>&lt;a&gt;&lt;b&gt;</code> 會整串比走？</b><code>.*</code> 先吃到底，再往回退到最後一個 <code>&gt;</code>。要一個一個標籤就用 <code>&lt;.*?&gt;</code> 或 <code>&lt;[^&gt;]*&gt;</code>。</li>\n        <li><b>為什麼驗證手機號碼要加 <code>^</code> 和 <code>$</code>？</b>沒有錨點時，只要字串裡「有一段」符合就算比到，<code>abc0912345678xyz</code> 也會過。Python 可直接用 <code>re.fullmatch</code>。</li>\n        <li><b>Python 的 <code>re.match</code> 和 <code>re.search</code> 差在哪？</b><code>match</code> 只從字串開頭比；<code>search</code> 從任何位置找第一個。</li>\n        <li><b>為什麼 <code>ab+</code> 不等於 <code>(ab)+</code>？</b>量詞只作用在前一個元素：<code>ab+</code> 是 a 後面一個以上的 b；<code>(ab)+</code> 才是 ab 重複。</li>\n        <li><b>為什麼有些正規表示式會跑到卡住？</b><code>(a+)+$</code> 這種巢狀量詞遇到比不到的輸入，會嘗試指數多種切法（災難性回溯）。</li>\n      </ul>\n<p class=\"codecap\">Python：這段印出什麼</p>\n<pre><code>import re\ns = \"&lt;a&gt;&lt;b&gt;\"\nprint(re.findall(r\"&lt;.*&gt;\", s))                  # ['&lt;a&gt;&lt;b&gt;']    貪婪\nprint(re.findall(r\"&lt;.*?&gt;\", s))                 # ['&lt;a&gt;', '&lt;b&gt;']\nprint(bool(re.match(r\"\\d+\", \"abc123\")))          # False：match 只從開頭\nprint(bool(re.search(r\"\\d+\", \"abc123\")))         # True\nprint(re.findall(r\"(\\d+)-(\\d+)\", \"10-20 30-40\")) # [('10', '20'), ('30', '40')]</code></pre>",
          "anchor": "q02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>格式驗證放過了不合法的字串</td><td>沒有錨點，只比到中間一段</td><td>加 <code>^…$</code> 或用 <code>fullmatch</code></td></tr>\n        <tr><td>比對範圍比預期大很多</td><td>貪婪量詞</td><td>改非貪婪，或用否定字元類別 <code>[^&gt;]*</code></td></tr>\n        <tr><td>檔名規則把 <code>logXtxt</code> 也比進來</td><td><code>.</code> 沒跳脫</td><td>寫成 <code>\\.</code></td></tr>\n        <tr><td><code>findall</code> 回傳 tuple 而不是整段字串</td><td>樣式裡有擷取群組</td><td>不需要擷取的改 <code>(?: )</code></td></tr>\n        <tr><td>某些輸入讓正規表示式跑很久</td><td>巢狀量詞造成災難性回溯</td><td>改寫成不重疊的樣式、限制輸入長度</td></tr>\n      </tbody></table></div>",
          "anchor": "q02-l3"
        }
      ]
    },
    {
      "id": "Q03",
      "anchor": "q03",
      "tag": "Q03",
      "name": "邊界條件與測資陷阱",
      "sub": "溢位、空輸入、差一",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>範例測資只證明「一般情況」對；隱藏測資會丟<b>最大值、空的、只有一個、全部一樣、剛好在邊界</b>。寫完先用這五種在腦中跑一遍。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>陷阱</th><th>典型樣子</th></tr>\n        <tr><td>整數溢位</td><td>32 位元 int 上限約 21 億；n 到 10<sup>5</sup>、值到 10<sup>9</sup> 時，加總或相乘就會超過</td></tr>\n        <tr><td>空輸入與單一元素</td><td>直接取 <code>a[0]</code>、<code>a[n-1]</code>，或迴圈假設至少兩個元素</td></tr>\n        <tr><td>重複元素</td><td>用 <code>&lt;</code> 還是 <code>&lt;=</code>、二分搜尋要找第一個還是最後一個、去重時漏算</td></tr>\n        <tr><td>差一錯誤（off-by-one）</td><td>迴圈上限 <code>&lt; n</code> 和 <code>&lt;= n</code>、區間是閉區間還是左閉右開</td></tr>\n        <tr><td>浮點數比較</td><td>直接用 <code>==</code>；輸出小數位數不符題目要求</td></tr>\n        <tr><td>初始值</td><td>求最大值時初始值設 0，遇到全部是負數就錯</td></tr>\n      </tbody></table></div>",
          "anchor": "q03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 <code>long long x = a * b;</code> 還是會溢位？</b>右邊先用 int 算完（已經溢位），結果才轉成 long long。要先轉型再乘：<code>1LL * a * b</code>。</li>\n        <li><b>為什麼二分搜尋中點寫成 <code>l + (r - l) / 2</code>？</b><code>(l + r) / 2</code> 在 l、r 都很大時相加會溢位。</li>\n        <li><b>為什麼極值初始值要用第一個元素或型別極值？</b>用 0 等於假設答案至少是 0，資料全為負數時答案就錯。</li>\n        <li><b>為什麼重複元素特別容易出錯？</b>很多寫法隱含「值都不同」的假設：排序後比相鄰、二分找位置、用值當 key 存索引，碰到重複就少算或覆蓋。</li>\n      </ul>\n<p class=\"codecap\">C++：結果是多少</p>\n<pre><code>int a = 100000, b = 100000;\nlong long bad = a * b;         // 先用 int 乘就溢位（有號溢位是 UB），再轉型已經來不及\nlong long ok  = 1LL * a * b;   // 10000000000\n\nint mx = 0;                    // 資料全是負數時，答案永遠是 0：錯\nint best = INT_MIN;            // 或直接用第一個元素當初始值</code></pre>",
          "anchor": "q03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>範例過了，隱藏測資答案錯（WA）且數字很大</td><td>整數溢位</td><td>總和、乘積改 64 位元，乘之前先轉型</td></tr>\n        <tr><td>某筆測資 runtime error</td><td>空陣列或只有一個元素時存取越界</td><td>函式開頭先處理 n = 0、n = 1</td></tr>\n        <tr><td>有重複值時答案多一或少一</td><td>比較條件 <code>&lt;</code>／<code>&lt;=</code> 或二分的邊界</td><td>用「全部一樣」的小測資手動跑一次</td></tr>\n        <tr><td>大測資逾時（TLE）</td><td>複雜度不夠</td><td>依 n 的上限反推需要的複雜度（見 P14）</td></tr>\n        <tr><td>小數答案被判錯</td><td>浮點誤差或輸出位數不符</td><td>照題目要求的位數輸出，比較用誤差容許</td></tr>\n        <tr><td>求最大值，資料全為負數時錯</td><td>初始值設成 0</td><td>用第一個元素或型別最小值</td></tr>\n      </tbody></table></div>",
          "anchor": "q03-l3"
        }
      ]
    }
  ],
  "back": [
    {
      "id": "confuse",
      "title": "容易混淆",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>WHERE vs HAVING</td><td>WHERE 分組前篩列、不能用聚合；HAVING 分組後篩組（Q01）</td></tr>\n      <tr><td>LEFT JOIN 條件寫在 ON vs WHERE</td><td>ON：決定怎麼配對，左表照樣全留；WHERE：配完再篩，NULL 那些列會被刪掉（Q01）</td></tr>\n      <tr><td><code>COUNT(*)</code> vs <code>COUNT(col)</code></td><td>前者數列數；後者略過 NULL（Q01）</td></tr>\n      <tr><td>RANK vs DENSE_RANK vs ROW_NUMBER</td><td>同分跳號、同分不跳號、同分也拆成不同名次（Q01）</td></tr>\n      <tr><td><code>re.match</code> vs <code>re.search</code> vs <code>re.fullmatch</code></td><td>從開頭比、任何位置找、整串都要符合（Q02）</td></tr>\n      <tr><td><code>.*</code> vs <code>.*?</code></td><td>盡量多 vs 盡量少（Q02）</td></tr>\n      <tr><td>閉區間 vs 左閉右開</td><td><code>[l, r]</code> 迴圈條件 <code>l &lt;= r</code>；<code>[l, r)</code> 迴圈條件 <code>l &lt; r</code>，兩種的更新方式不同（Q03、P03）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Online assessment (OA)</td><td>線上程式測驗</td><td>The OA has two coding questions in 90 minutes.</td></tr>\n      <tr><td>Hidden test cases</td><td>隱藏測資</td><td>The solution passed the samples but failed hidden test cases.</td></tr>\n      <tr><td>Edge case</td><td>邊界情況</td><td>An empty array is a common edge case.</td></tr>\n      <tr><td>Off-by-one error</td><td>差一錯誤</td><td>The loop has an off-by-one error at the upper bound.</td></tr>\n      <tr><td>Integer overflow</td><td>整數溢位</td><td>Use a 64-bit sum to avoid integer overflow.</td></tr>\n      <tr><td>Aggregate function</td><td>聚合函式</td><td>Aggregate functions are not allowed in WHERE.</td></tr>\n      <tr><td>Window function</td><td>窗函式</td><td>Use a window function to rank salaries per department.</td></tr>\n      <tr><td>Greedy quantifier</td><td>貪婪量詞</td><td>The greedy quantifier matched more than expected.</td></tr>\n      <tr><td>Anchor</td><td>錨點</td><td>Add anchors so the pattern matches the whole string.</td></tr>\n      <tr><td>Catastrophic backtracking</td><td>災難性回溯</td><td>Nested quantifiers can cause catastrophic backtracking.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>Q01</b>　https://www.postgresql.org/docs/current/queries-table-expressions.html （JOIN、WHERE、GROUP BY、HAVING 的處理順序）；https://www.postgresql.org/docs/current/functions-window.html （ROW_NUMBER、RANK、DENSE_RANK）；https://www.postgresql.org/docs/current/functions-comparison.html （NULL 比較與 IS NULL）</li>\n      <li><b>Q02</b>　https://docs.python.org/3/library/re.html （語法、match／search／fullmatch、貪婪與非貪婪、findall 與群組）</li>\n      <li><b>Q03</b>　https://en.cppreference.com/w/cpp/language/operator_arithmetic （整數運算與溢位）；https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/ （二分搜尋中點溢位）</li>\n      <li class=\"muted\">撰寫日 2026-10-15。Q02 的 Python 範例已實機執行、輸出與註解一致；Q01 的 SQL 與 Q03 的 C++ 範例未實跑，依上列文件撰寫；「SELECT 別名在 WHERE 看不到」是多數資料庫的行為，個別資料庫可能放寬。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-Q pre { background: var(--soft); border-radius: 6px; padding: 12px 14px; overflow-x: auto; font-size: 13px; line-height: 1.55; margin: 12px 0; max-width: 100%; }\n.kb-Q pre code { background: none; padding: 0; font-size: 13px; }\n.kb-Q .codecap { font-size: 12px; color: var(--muted); margin: 14px 0 -6px; font-family: var(--mono); }\n"
}
