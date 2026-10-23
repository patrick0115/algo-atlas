// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "H",
  "file": "H-programming.html",
  "title": "程式語言與演算法：資料變大十倍時，你的程式會怎樣",
  "lead": "寫程式要顧兩件事：<b>資源誰負責收</b>（記憶體、檔案、執行緒，C++ 靠 RAII、C# 靠 GC＋Dispose、Python 靠參考計數＋with），以及<b>工作量怎麼隨資料長大</b>（Big-O）。前者決定程式會不會漏、會不會卡死；後者決定 1,000 筆跑得動的工具，100 萬筆時是慢 1,000 倍還是慢 100 萬倍。",
  "note": "<p class=\"muted small\">對應 taxonomy H01～H12（H07～H12 是各語言的細節題，常以「讀程式碼判斷輸出」出題）。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "main",
      "title": "主圖：Big-O 到底在比什麼",
      "blocks": [
        {
          "t": "widget",
          "id": "H.main",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"mode\">\n        <button data-m=\"big\" class=\"on\">拉桿比一比</button>\n        <button data-m=\"bin\">二分搜尋逐步</button>\n      </div>\n    </div>\n<div class=\"stage\">\n      <div class=\"controls\" id=\"optBig\" style=\"margin:0 0 12px\">\n        <label class=\"inline\">資料筆數 n <input type=\"range\" id=\"nRange\" min=\"0\" max=\"60\" value=\"30\"></label>\n        <b id=\"nVal\" style=\"font-family:var(--mono)\"></b>\n        <label class=\"inline\"><input type=\"checkbox\" id=\"logScale\" checked=\"\"> 長條用對數刻度</label>\n      </div>\n      <div class=\"controls\" id=\"optBin\" style=\"margin:0 0 12px;display:none\">\n        <label class=\"inline\">要找的值\n          <select id=\"target\"><option>47</option><option>3</option><option>85</option><option>21</option><option>50</option></select>\n        </label>\n        <button class=\"btn\" id=\"prev\">← 上一步</button>\n        <button class=\"btn primary\" id=\"next\">下一步 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"mf\" viewBox=\"0 0 900 300\" role=\"img\" aria-label=\"Big-O 互動圖\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "三種語言一張表",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th></th><th>C／C++</th><th>C#／.NET</th><th>Python（CPython）</th></tr>\n      <tr><td>怎麼執行</td><td>編譯成機器碼，直接跑</td><td>編譯成 IL，執行時 JIT 成機器碼</td><td>編譯成 bytecode，直譯器逐條執行</td></tr>\n      <tr><td>記憶體誰收</td><td>自己收；用 RAII／智慧指標讓解構子代勞</td><td>GC 收記憶體；檔案、handle 等要 <code>Dispose</code></td><td>參考計數歸零立刻收，循環參考靠 GC 補</td></tr>\n      <tr><td>資源清理慣用法</td><td>解構子（RAII）</td><td><code>using</code>／<code>IDisposable</code></td><td><code>with</code>（context manager）</td></tr>\n      <tr><td>寫錯的代價</td><td>UB：可能當機、也可能看起來正常</td><td>例外（NullReference、InvalidCast…），可攔</td><td>例外（TypeError、KeyError…），可攔</td></tr>\n      <tr><td>並行</td><td>真多執行緒，自己管鎖</td><td>Task／async-await，WinForms 有 UI 執行緒規則</td><td>GIL：同時只有一條執行緒跑 Python bytecode（3.13 起有 free-threaded 版）</td></tr>\n      <tr><td>內建排序</td><td><code>std::sort</code>（不穩定）、<code>std::stable_sort</code></td><td><code>Array.Sort</code>／<code>List.Sort</code>（introsort，不穩定）、LINQ <code>OrderBy</code>（穩定）</td><td><code>list.sort</code>／<code>sorted</code>（穩定，Timsort 系）</td></tr>\n      <tr><td>典型用途</td><td>韌體、驅動、效能核心</td><td>WinForms 桌面工具</td><td>自動化腳本、資料整理、量測腳本</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "H01",
      "anchor": "h01",
      "tag": "H01",
      "name": "C／C++ 核心",
      "sub": "指標、RAII、UB、const",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>C／C++ 讓你直接碰記憶體，所以<b>誰配置、誰釋放、何時失效</b>全要自己顧；現代 C++ 的答案是 <b>RAII</b>：把資源綁在物件的生命週期上，離開 scope 自動釋放。違反語言規則的程式是 <b>UB</b>，編譯器不保證任何結果。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 230\" role=\"img\" aria-label=\"stack 與 heap、指標與懸空指標\" style=\"min-width:640px\">\n        <defs><marker id=\"ah1\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"10\" y=\"20\" class=\"t-strong\">Stack（函式框架，離開就消失）</text>\n        <text x=\"500\" y=\"20\" class=\"t-strong\">Heap（new／malloc 來的，要有人還）</text>\n        <rect class=\"bx\" x=\"10\" y=\"36\" width=\"330\" height=\"176\" rx=\"6\"></rect>\n        <text x=\"22\" y=\"58\" class=\"t-small\">void Work() 的框架</text>\n        <rect class=\"bx\" x=\"22\" y=\"68\" width=\"300\" height=\"30\" rx=\"4\"></rect><text x=\"32\" y=\"88\">int x = 5;</text>\n        <rect class=\"bx\" x=\"22\" y=\"106\" width=\"300\" height=\"30\" rx=\"4\"></rect><text x=\"32\" y=\"126\">int* p = new int[4];</text>\n        <rect class=\"bx-accent\" x=\"22\" y=\"144\" width=\"300\" height=\"30\" rx=\"4\"></rect><text x=\"32\" y=\"164\">auto u = make_unique&lt;Buf&gt;();</text>\n        <rect class=\"bx\" x=\"22\" y=\"182\" width=\"300\" height=\"24\" rx=\"4\"></rect><text x=\"32\" y=\"199\" class=\"t-small\">int* q = p;（另一個指標指向同一塊）</text>\n        <rect class=\"bx\" x=\"500\" y=\"96\" width=\"180\" height=\"40\" rx=\"4\"></rect><text x=\"512\" y=\"121\">int[4]（16 bytes）</text>\n        <rect class=\"bx-accent\" x=\"500\" y=\"150\" width=\"180\" height=\"40\" rx=\"4\"></rect><text x=\"512\" y=\"175\">Buf 物件</text>\n        <line class=\"ln\" x1=\"322\" y1=\"121\" x2=\"498\" y2=\"116\" marker-end=\"url(#ah1)\"></line>\n        <line class=\"ln-accent\" x1=\"322\" y1=\"159\" x2=\"498\" y2=\"168\" marker-end=\"url(#ah1)\"></line>\n        <line class=\"ln dash\" x1=\"322\" y1=\"194\" x2=\"498\" y2=\"128\" marker-end=\"url(#ah1)\"></line>\n        <text x=\"700\" y=\"114\" class=\"t-small\">忘了 delete[] → 洩漏</text>\n        <text x=\"700\" y=\"132\" class=\"t-small\">delete[] p 後再用 q → 懸空</text>\n        <text x=\"700\" y=\"166\" class=\"t-small\">u 離開 scope：解構子</text>\n        <text x=\"700\" y=\"184\" class=\"t-small\">自動 delete（RAII）</text>\n      </svg>\n      </div>\n      <figcaption>stack 上的變數離開函式就消失；heap 上的東西只有在有人 delete 時才還。RAII 讓「某個 stack 物件的解構子」去負責 delete，例外或提早 return 都不會漏。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>指標（pointer）</td><td>存「位址」的變數。可以是 <code>nullptr</code>、可以改指別處、可以做位址運算。<code>*p</code> 取值、<code>&amp;x</code> 取位址</td></tr>\n        <tr><td>參考（reference）</td><td>C++ 的別名，<code>int&amp; r = x;</code>。宣告時一定要綁定、之後不能改綁、沒有「空參考」。函式參數用 <code>const T&amp;</code> 可以不複製又不讓對方改</td></tr>\n        <tr><td>stack／heap</td><td>stack：區域變數，函式結束自動釋放，空間小（數 MB 等級）。heap：<code>new</code>／<code>malloc</code> 動態配置，空間大，要 <code>delete</code>／<code>free</code> 還</td></tr>\n        <tr><td>new／delete vs malloc／free</td><td><code>new</code> 會呼叫建構子、<code>delete</code> 會呼叫解構子；<code>malloc</code>／<code>free</code> 只管位元組。<code>new[]</code> 要配 <code>delete[]</code>，混用是 UB</td></tr>\n        <tr><td>RAII</td><td>Resource Acquisition Is Initialization：建構子取得資源、解構子釋放。<code>std::vector</code>、<code>std::string</code>、<code>std::lock_guard</code>、<code>std::fstream</code> 都是</td></tr>\n        <tr><td>智慧指標</td><td><code>unique_ptr</code>：唯一擁有者，不能複製只能 move，零額外成本；<code>shared_ptr</code>：參考計數，最後一個放手才刪；<code>weak_ptr</code>：看得到但不算擁有，用來打破循環</td></tr>\n        <tr><td>Rule of 0／3／5</td><td>類別若自己管資源，就要一起定義解構子、複製建構、複製指定（3）＋移動建構、移動指定（5）。最好的作法是 Rule of 0：成員全用 RAII 型別，五個都不用寫</td></tr>\n        <tr><td>Undefined behavior（UB）</td><td>違反語言規則，標準不規定結果：陣列越界、解參考 null 或已釋放的指標、<b>有號整數溢位</b>、讀未初始化變數、資料競爭（data race）</td></tr>\n        <tr><td>implementation-defined／unspecified</td><td>前者：各編譯器可以不同但要寫在文件（如 <code>int</code> 幾位元）；後者：可以不同也不必寫（如函式參數的求值順序）。兩者都不是 UB</td></tr>\n        <tr><td>const 正確性</td><td><code>const int* p</code>：不能透過 p 改值；<code>int* const p</code>：p 不能改指；<code>void f() const</code>：成員函式不改物件。<code>constexpr</code>：編譯期就能算出</td></tr>\n        <tr><td>volatile</td><td>告訴編譯器「這個值可能被外部改」（硬體暫存器、ISR 共用變數），每次都要真的去讀。<b>不是</b>執行緒同步工具，多執行緒要用 <code>std::atomic</code> 或鎖</td></tr>\n      </tbody></table></div>",
          "anchor": "h01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 RAII 比「記得 delete」安全？</b>函式中間丟例外、提早 return、多一個分支，手動 delete 都可能被跳過。解構子在離開 scope 時<b>一定</b>會跑（stack unwinding），所以資源不會漏。C# 的 <code>using</code>、Python 的 <code>with</code> 是同一個想法。</li>\n        <li><b>為什麼 UB 可怕到「Debug 正常、Release 壞掉」？</b>編譯器被允許假設 UB 永遠不會發生，然後據此最佳化。例：<code>return x + 1 &gt; x;</code> 因為有號溢位是 UB，編譯器可以直接改成 <code>return true;</code>；越界讀取的迴圈可能被整段改寫。最佳化等級一變，行為就變。</li>\n        <li><b>為什麼 vector <code>push_back</code> 之後，之前拿的指標會失效？</b>容量不夠時 vector 會配一塊更大的新記憶體、把元素搬過去、釋放舊的。所有舊指標、參考、iterator 都指向已釋放的地方。容量夠時只有 <code>end()</code> 失效。事先 <code>reserve()</code> 或改存索引可以避免。</li>\n        <li><b>unique_ptr 和 shared_ptr 怎麼選？</b>預設用 <code>unique_ptr</code>：擁有權清楚、沒有額外成本。真的有多個擁有者才用 <code>shared_ptr</code>，代價是參考計數（多執行緒下是原子操作）和控制區塊；兩個物件互相 <code>shared_ptr</code> 會形成循環、永遠不歸零，一邊要改 <code>weak_ptr</code>。</li>\n        <li><b>const 正確性有什麼用？</b>它是給編譯器檢查的<b>契約</b>：<code>const T&amp;</code> 參數保證不改呼叫方的資料、又不用複製；const 成員函式讓物件在 const 情境下還能用。漏一個 const，往上整串呼叫鏈都得拿掉 const，所以要從一開始就加。</li>\n        <li><b>韌體為什麼一定要 volatile？</b>迴圈裡反覆讀狀態暫存器（例如等 SPI busy 位元清掉），沒有 volatile 時編譯器會認為「值沒被這段程式改過」而只讀一次，變成死迴圈或跳過等待。</li>\n      </ul>\n<p class=\"codecap\">C++：RAII 與一個典型 UB</p>\n<pre><code>#include &lt;memory&gt;\n#include &lt;vector&gt;\n\nvoid Work() {\n    auto buf = std::make_unique&lt;uint8_t[]&gt;(4096); // 離開函式自動 delete[]\n    std::vector&lt;int&gt; v{1, 2, 3};\n    int* first = &amp;v[0];\n    v.push_back(4);          // 可能重新配置：first 變成懸空指標\n    // *first = 9;           // UB：可能正常、可能當機、可能悄悄改到別的資料\n    int i = v.size() - 1;    // 改存索引，重新配置後依然有效\n    v[i] = 9;\n}                            // buf 在這裡被釋放，就算中間丟例外也一樣\n\nbool Next(int x) { return x + 1 &gt; x; }  // 有號溢位是 UB，編譯器可直接回 true</code></pre>",
          "anchor": "h01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>Debug 版正常，Release 版當機或結果錯</td><td>UB：讀未初始化變數、陣列越界、有號溢位，被最佳化放大</td><td>開 <code>-Wall -Wextra</code>（MSVC <code>/W4</code>），用 AddressSanitizer／UBSan（<code>-fsanitize=address,undefined</code>）跑測試；變數宣告時就初始化</td></tr>\n        <tr><td>長時間執行記憶體一直漲</td><td>有路徑沒 delete（例外、提早 return），或 <code>shared_ptr</code> 循環參考</td><td>改用 <code>unique_ptr</code>／容器，循環的一邊改 <code>weak_ptr</code>；用 LeakSanitizer、Valgrind 或 Visual Studio 診斷工具抓</td></tr>\n        <tr><td>函式回傳的陣列一開始看起來正常，多呼叫幾個函式後內容變亂碼</td><td>回傳了區域變數（stack 上）的位址：函式結束後那塊 stack 已歸還，下一個函式呼叫會重用並覆寫它，指標變成懸空</td><td>不要回傳區域變數的指標或參考；改回傳 <code>std::vector</code>／<code>std::array</code>（值），或由呼叫端傳入緩衝區；開編譯器警告（回傳區域位址多半會被警告）</td></tr>\n        <tr><td>往 vector 加元素後，之前存的指標讀到垃圾</td><td>重新配置讓指標、參考、iterator 全失效</td><td>改存索引；或先 <code>reserve()</code> 足夠容量；迴圈中不要邊走訪邊插入</td></tr>\n        <tr><td>韌體等暫存器的迴圈，開最佳化後卡死或不等</td><td>狀態暫存器沒宣告 <code>volatile</code>，讀取被最佳化掉</td><td>暫存器與 ISR 共用變數宣告 <code>volatile</code>；多核或 RTOS 之間的同步改用 atomic／鎖</td></tr>\n        <tr><td>計時或計數值跑一陣子後突然變負數、邏輯錯亂</td><td>有號整數溢位（UB），例如 32-bit 毫秒計數約 24.8 天就溢位</td><td>改用無號型別（溢位是定義好的取模）並用差值比較 <code>now - start &gt;= timeout</code>；或改用 64-bit</td></tr>\n        <tr><td>同一份程式換編譯器後輸出不同</td><td>依賴了 unspecified 的求值順序（如 <code>f(i++, i++)</code>）或 implementation-defined 的型別大小</td><td>拆成多行明確順序；用 <code>&lt;cstdint&gt;</code> 的 <code>int32_t</code> 等固定寬度型別</td></tr>\n      </tbody></table></div>",
          "anchor": "h01-l3"
        }
      ]
    },
    {
      "id": "H02",
      "anchor": "h02",
      "tag": "H02",
      "name": "C#／.NET",
      "sub": "GC、async、Dispose、LINQ",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>.NET 的 <b>GC 只管記憶體</b>，檔案、handle、連線要你 <b>Dispose</b>；<b>async／await 不等於開執行緒</b>，它讓 UI 執行緒在等 I/O 時去做別的事，但你一旦用 <code>.Result</code> 擋住 UI 執行緒，就會自己鎖死自己。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 150\" role=\"img\" aria-label=\"GC 世代\" style=\"min-width:640px\">\n        <defs><marker id=\"ah2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"10\" y=\"20\" class=\"t-strong\">GC 世代：大部分物件活不過第一次回收</text>\n        <rect class=\"bx-accent\" x=\"10\" y=\"40\" width=\"190\" height=\"60\" rx=\"6\"></rect><text x=\"22\" y=\"64\" class=\"t-strong\">Gen 0</text><text x=\"22\" y=\"86\" class=\"t-small\">新物件，最常回收、最快</text>\n        <rect class=\"bx\" x=\"260\" y=\"40\" width=\"190\" height=\"60\" rx=\"6\"></rect><text x=\"272\" y=\"64\" class=\"t-strong\">Gen 1</text><text x=\"272\" y=\"86\" class=\"t-small\">緩衝區</text>\n        <rect class=\"bx\" x=\"510\" y=\"40\" width=\"190\" height=\"60\" rx=\"6\"></rect><text x=\"522\" y=\"64\" class=\"t-strong\">Gen 2</text><text x=\"522\" y=\"86\" class=\"t-small\">長命物件；收它＝full GC</text>\n        <rect class=\"bx-soft\" x=\"740\" y=\"40\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"752\" y=\"64\" class=\"t-strong\">LOH</text><text x=\"752\" y=\"86\" class=\"t-small\">≥ 85,000 bytes</text>\n        <line class=\"ln\" x1=\"202\" y1=\"70\" x2=\"258\" y2=\"70\" marker-end=\"url(#ah2)\"></line>\n        <line class=\"ln\" x1=\"452\" y1=\"70\" x2=\"508\" y2=\"70\" marker-end=\"url(#ah2)\"></line>\n        <text x=\"206\" y=\"62\" class=\"t-small\">活下來</text><text x=\"456\" y=\"62\" class=\"t-small\">活下來</text>\n        <text x=\"10\" y=\"128\" class=\"t-small\">LOH 隨 Gen 2 一起回收，預設不壓縮（搬大物件太貴），所以反覆配置大陣列容易碎片化。</text>\n      </svg>\n      </div>\n    </figure>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 190\" role=\"img\" aria-label=\"UI 執行緒上用 Result 造成死結\" style=\"min-width:640px\">\n        <defs><marker id=\"ah3\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"10\" y=\"20\" class=\"t-strong\">經典死結：在 UI 執行緒上 .Result 一個 async 方法</text>\n        <text x=\"10\" y=\"62\" class=\"t-strong\">UI 執行緒</text>\n        <text x=\"10\" y=\"142\" class=\"t-strong\">I/O 完成</text>\n        <line class=\"ln-soft\" x1=\"110\" y1=\"58\" x2=\"890\" y2=\"58\"></line>\n        <line class=\"ln-soft\" x1=\"110\" y1=\"138\" x2=\"890\" y2=\"138\"></line>\n        <rect class=\"bx\" x=\"110\" y=\"42\" width=\"150\" height=\"32\" rx=\"4\"></rect><text x=\"120\" y=\"63\" class=\"t-small\">btn_Click 開始</text>\n        <rect class=\"bx-accent\" x=\"270\" y=\"42\" width=\"610\" height=\"32\" rx=\"4\"></rect><text x=\"282\" y=\"63\">LoadAsync().Result → UI 執行緒被擋住，等 Task 完成</text>\n        <rect class=\"bx\" x=\"420\" y=\"122\" width=\"200\" height=\"32\" rx=\"4\"></rect><text x=\"430\" y=\"143\" class=\"t-small\">檔案／網路讀完了</text>\n        <line class=\"ln-accent\" x1=\"600\" y1=\"120\" x2=\"600\" y2=\"78\" marker-end=\"url(#ah3)\"></line>\n        <text x=\"614\" y=\"98\" class=\"t-small\">await 的後半段要回 UI 執行緒跑</text>\n        <text x=\"614\" y=\"116\" class=\"t-accent\">✕ 排不進去：UI 正被擋住</text>\n        <text x=\"10\" y=\"180\" class=\"t-small\">UI 等 Task 完成；Task 的後半段等 UI 有空 → 兩邊互等。解法：一路 await 到底（async all the way），不要 .Result／.Wait()。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>值型別 vs 參考型別</td><td><code>struct</code>、<code>int</code>、<code>double</code>、<code>enum</code> 是值型別：指定時<b>複製整份</b>，存在宣告它的地方（區域變數或物件欄位裡）。<code>class</code>、<code>string</code>、陣列是參考型別：物件在 managed heap，變數只存參考，指定時兩個變數指向同一個物件</td></tr>\n        <tr><td>Boxing／unboxing</td><td>值型別被當成 <code>object</code> 或介面使用時，在 heap 上包一個物件把值複製進去（boxing，隱式）；轉回來要明確轉型（unboxing），型別不對丟 <code>InvalidCastException</code>，對 null 丟 <code>NullReferenceException</code></td></tr>\n        <tr><td>GC 世代</td><td>Gen 0（新）→ Gen 1（緩衝）→ Gen 2（長命）。活過一次回收就晉升一代。收 Gen 2 會連同 0、1 一起收，稱 full GC</td></tr>\n        <tr><td>LOH</td><td>Large Object Heap，≥ 85,000 bytes 的物件（通常是大陣列）。邏輯上隨 Gen 2 回收，預設不壓縮；可用 <code>GCSettings.LargeObjectHeapCompactionMode</code> 要求壓縮一次</td></tr>\n        <tr><td>IDisposable／using</td><td><code>Dispose()</code> 用來<b>立刻</b>釋放非受控資源（檔案、GDI 物件、序列埠、DB 連線）。<code>using (var f = ...) { }</code> 或 C# 8 的 <code>using var f = ...;</code> 保證離開 scope 時呼叫 Dispose，即使丟例外</td></tr>\n        <tr><td>Finalizer／SafeHandle</td><td>Finalizer（<code>~Class()</code>）是忘了 Dispose 時的最後保險，時間不確定、會讓物件多活一輪。直接包 OS handle 時官方建議用 <code>SafeHandle</code>，自己不用寫 finalizer</td></tr>\n        <tr><td>async／await、Task</td><td><code>Task</code> 代表「一個未來會完成的工作」。<code>await</code> 遇到未完成的 Task 就先返回，讓出目前執行緒；完成後再接著跑後半段</td></tr>\n        <tr><td>SynchronizationContext</td><td>決定 await 之後「回哪裡跑」。WinForms／WPF 的 UI 執行緒有一個，會把後半段排回 UI 執行緒；ASP.NET Core 和 console 沒有，後半段在 thread pool 跑</td></tr>\n        <tr><td>ConfigureAwait(false)</td><td>告訴 await「後半段不用回原來的 context」。.NET 8 起另有 <code>ConfigureAwaitOptions</code>（如 <code>ForceYielding</code>、<code>SuppressThrowing</code>）</td></tr>\n        <tr><td>async void</td><td>沒有 Task 可以 await，例外直接丟到 SynchronizationContext 上、外面接不到。只該用在事件處理器（<code>button1_Click</code>）</td></tr>\n        <tr><td>LINQ 延遲執行</td><td><code>Where</code>、<code>Select</code>、<code>OrderBy</code> 這類回傳 <code>IEnumerable&lt;T&gt;</code> 的只是「查詢定義」，<code>foreach</code> 時才真的跑；<code>ToList()</code>、<code>Count()</code>、<code>First()</code>、<code>Sum()</code> 立即執行</td></tr>\n      </tbody></table></div>",
          "anchor": "h02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 GC 要分世代？</b>經驗法則：新物件大多很快就沒用了（暫存字串、迴圈裡的小物件）。只掃 Gen 0 這一小塊比掃整個 heap 快得多，而且通常就收得回足夠空間。活下來的才晉升，之後不必每次都重新檢查。</li>\n        <li><b>有 GC 為什麼還要 Dispose？</b>GC 只知道「記憶體不夠了」，不知道「檔案還鎖著」「GDI handle 快用完了」。它什麼時候跑不確定，可能幾秒後、也可能很久。檔案、序列埠、<code>Bitmap</code>、<code>Font</code>、<code>Pen</code> 這些包著 OS 資源的物件要你用 <code>using</code> 準時還。</li>\n        <li><b>await 為什麼不會卡 UI？</b>UI 執行緒只有一條，同時負責畫面與事件。<code>await File.ReadAllTextAsync(...)</code> 時，UI 執行緒不是在等，而是回去處理訊息迴圈（重畫、按鈕）；I/O 完成後，後半段被排回 UI 執行緒執行，所以 await 之後可以直接改控制項。<b>它不會自己開執行緒</b>，CPU 重的運算要另外 <code>Task.Run</code>。</li>\n        <li><b>死結的機制是什麼？</b>見上圖。<code>.Result</code> 讓 UI 執行緒「坐著等」；Task 的後半段被排回 UI 執行緒，但 UI 執行緒正在坐著等，永遠輪不到。<code>ConfigureAwait(false)</code> 能避開，是因為後半段改在 thread pool 跑、不需要 UI 執行緒。</li>\n        <li><b>ConfigureAwait(false) 該加在哪？</b>官方 FAQ 的原則：<b>通用函式庫每個 await 都加</b>（不該假設呼叫者是 UI）；<b>應用程式碼（Form 裡）不要加</b>，因為 await 之後你通常要碰控制項。它是保險，不是解藥，真正的解法是不要在 UI 執行緒上同步等待。</li>\n        <li><b>LINQ 延遲執行會咬人在哪？</b>一、同一個查詢變數 <code>foreach</code> 兩次就執行兩次（若來源是檔案或資料庫就讀兩次）；二、結果取決於「列舉當下」的資料，定義之後再改來源，結果會變；三、例外延後到列舉時才丟，堆疊看起來跟定義的地方無關。要固定結果就 <code>ToList()</code> 一次。</li>\n        <li><b>struct 什麼時候比 class 好？</b>官方設計準則：代表單一值、實例小於 16 bytes、不可變、不會常被 boxing，四項都成立才考慮 struct。否則複製成本與 boxing 反而更慢。<code>List&lt;Point&gt;</code> 裡改 <code>list[0].X</code> 會編譯錯誤，因為拿到的是複本。</li>\n        <li><b>boxing 為什麼慢？</b>每次都要在 heap 配一個新物件並複製值，給 GC 增加工作。舊的非泛型集合（<code>ArrayList</code>、<code>Hashtable</code>）存 int 時每筆都 boxing；用泛型 <code>List&lt;int&gt;</code> 就沒有。</li>\n      </ul>\n<p class=\"codecap\">C#（WinForms）：不會卡、也不會死結的寫法</p>\n<pre><code>// 事件處理器是唯一該用 async void 的地方\nprivate async void btnLoad_Click(object sender, EventArgs e)\n{\n    btnLoad.Enabled = false;\n    try\n    {\n        string text = await File.ReadAllTextAsync(path);        // I/O：await，UI 不卡\n        var rows = await Task.Run(() =&gt; Parser.Parse(text));    // CPU 重：丟到 thread pool\n        grid.DataSource = rows;                                 // await 後回到 UI 執行緒，可直接改控制項\n    }\n    catch (IOException ex) { MessageBox.Show(ex.Message); }    // async void 的例外要在裡面接\n    finally { btnLoad.Enabled = true; }\n}\n\n// 錯誤示範：string text = File.ReadAllTextAsync(path).Result;  // UI 執行緒上同步等待 → 卡住或死結\n\n// 資源：離開 scope 自動 Dispose\nusing var port = new SerialPort(\"COM3\", 115200);\n\n// LINQ：查詢只是定義，ToList() 才執行一次並固定結果\nvar failed = pins.Where(p =&gt; p.Voltage &gt; limit);   // 還沒跑\nvar snapshot = failed.ToList();                    // 現在跑，之後重複使用 snapshot</code></pre>",
          "anchor": "h02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>按下按鈕後視窗「沒有回應」，處理完才恢復</td><td>在 UI 執行緒上做同步 I/O 或重運算</td><td>I/O 改 async API 並 await；CPU 重的包 <code>Task.Run</code>；進度用 <code>IProgress&lt;T&gt;</code> 回報</td></tr>\n        <tr><td>按下按鈕後永遠卡住，CPU 0%</td><td>UI 執行緒上 <code>.Result</code>／<code>.Wait()</code> 一個 async 方法，造成死結</td><td>一路 async 到底；函式庫內的 await 加 <code>ConfigureAwait(false)</code> 當保險</td></tr>\n        <tr><td>「跨執行緒作業無效」<code>InvalidOperationException</code></td><td>在背景執行緒（<code>Task.Run</code> 裡、<code>SerialPort.DataReceived</code> 事件）直接改控制項</td><td>把結果 return 出來、await 後在 UI 執行緒更新；或 <code>Control.Invoke</code>／<code>BeginInvoke</code>；不要把 <code>CheckForIllegalCrossThreadCalls</code> 關掉</td></tr>\n        <tr><td>檔案被鎖住刪不掉、GDI 物件數一直漲最後畫面破圖</td><td>沒有 Dispose：<code>FileStream</code>、<code>Bitmap</code>、<code>Font</code>、<code>Graphics</code> 等</td><td>一律 <code>using</code>；Form 擁有的元件加進 <code>components</code> 或在 <code>Dispose(bool)</code> 裡釋放；工作管理員開「GDI 物件」欄位觀察</td></tr>\n        <tr><td>處理大檔時記憶體鋸齒狀暴漲、偶發 OutOfMemory</td><td>反覆配置 ≥ 85,000 bytes 的大陣列進 LOH，回收慢又不壓縮、碎片化</td><td>重複使用緩衝區或用 <code>ArrayPool&lt;T&gt;.Shared</code>；串流處理不要一次讀全檔</td></tr>\n        <tr><td>同一個 LINQ 結果算兩次數字不同，或變得很慢</td><td>延遲執行：多次列舉每次重跑，且來源在中間被改過</td><td>需要重複用就 <code>ToList()</code> 一次；在 <code>foreach</code> 裡不要改正在被查詢的集合</td></tr>\n      </tbody></table></div>",
          "anchor": "h02-l3"
        }
      ]
    },
    {
      "id": "H03",
      "anchor": "h03",
      "tag": "H03",
      "name": "Python 與自動化腳本",
      "sub": "GIL、venv、例外、測試",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>Python 寫腳本最快，但要記住三件事：<b>GIL 讓多執行緒加速不了 CPU 運算</b>、<b>每個專案用自己的 venv</b>、<b>例外要接具體的類型並留下紀錄</b>，否則腳本「跑完了」不代表「做對了」。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>GIL</td><td>Global Interpreter Lock：CPython 同一時間只讓一條執行緒執行 Python bytecode。等 I/O（檔案、網路、儀器）時會放開</td></tr>\n        <tr><td>Free-threaded build</td><td>拿掉 GIL 的 CPython 版本（PEP 703）。3.13 為實驗性，3.14 起依 PEP 779 轉為正式支援但仍是選配；單執行緒會稍慢</td></tr>\n        <tr><td>threading／multiprocessing／asyncio</td><td>threading：多執行緒，適合 I/O；multiprocessing（或 <code>ProcessPoolExecutor</code>）：多個行程、各有自己的 GIL，適合 CPU 運算；asyncio：單執行緒事件迴圈，適合大量並發 I/O</td></tr>\n        <tr><td>venv</td><td>虛擬環境：專案自己的一套 site-packages。<code>python -m venv .venv</code> 建立，啟用後 <code>pip install</code> 只裝進這個專案</td></tr>\n        <tr><td>requirements.txt／pyproject.toml</td><td>記錄依賴與版本。<code>pip freeze &gt; requirements.txt</code> 鎖版本，別人 <code>pip install -r</code> 重現；pyproject.toml 是新式的專案設定檔</td></tr>\n        <tr><td>PEP 668（externally-managed-environment）</td><td>Linux 發行版、Homebrew 把系統 Python 標成「外部管理」，pip 拒絕直接裝進去，要你用 venv</td></tr>\n        <tr><td>try／except／else／finally</td><td>except 接指定例外；else 在沒例外時跑；finally 一定跑。<code>raise NewError(...) from e</code> 保留原始原因</td></tr>\n        <tr><td>with（context manager）</td><td>Python 版的 RAII／using：<code>with open(...) as f:</code> 離開區塊自動關檔，即使丟例外</td></tr>\n        <tr><td>pytest</td><td>最常用的測試框架：函式名 <code>test_</code> 開頭、直接寫 <code>assert</code>；<code>@pytest.mark.parametrize</code> 一次跑多組輸入；fixture 管理準備與清理</td></tr>\n        <tr><td>exit code</td><td>腳本結束碼：0 成功、非 0 失敗。CI 或批次檔靠它判斷，<code>sys.exit(1)</code> 回報失敗</td></tr>\n      </tbody></table></div>",
          "anchor": "h03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼要有 GIL？</b>CPython 用參考計數管理記憶體，每個物件的計數一直在加減。一把大鎖讓這件事不用到處加細鎖，單執行緒快、C 擴充好寫。代價是純 Python 的 CPU 運算開再多執行緒也只用到一顆核心。</li>\n        <li><b>那為什麼 numpy 多執行緒有時會變快？</b>很多 C 擴充在做大量運算時會主動放開 GIL，那段時間其他執行緒可以跑。I/O 也一樣：等儀器回應時 GIL 是放開的，所以多執行緒同時控制幾台儀器是有效的。</li>\n        <li><b>為什麼每個專案都要 venv？</b>A 專案要 pandas 1.x、B 專案要 2.x，裝在同一個全域環境一定有人壞。venv 讓依賴跟著專案走，配上鎖版本的 requirements.txt，換電腦、給同事都能重現。</li>\n        <li><b>為什麼不要寫 <code>except: pass</code>？</b>光 <code>except:</code> 連 <code>KeyboardInterrupt</code>、<code>SystemExit</code> 都接走，Ctrl+C 停不下來；<code>pass</code> 讓錯誤消失，腳本回 0、看起來成功。至少接 <code>Exception</code>，最好接具體類型，並且 log 下來或重新 raise。</li>\n        <li><b>預設參數為什麼會「記住」上一次的值？</b>預設值只在函式<b>定義時</b>算一次。<code>def f(x, acc=[])</code> 每次呼叫共用同一個 list，越呼叫越長。慣用法是 <code>acc=None</code>，進函式再建新的。</li>\n        <li><b>腳本化測試要顧什麼？</b>測試要能<b>自己判斷成敗</b>（assert，而不是印出來給人看）、失敗時回非 0 exit code、呼叫外部程式時檢查回傳碼（<code>subprocess.run(..., check=True)</code>）、每次從乾淨狀態開始（fixture）。</li>\n      </ul>\n<p class=\"codecap\">Python：venv、例外、預設參數</p>\n<pre><code># 建立並使用專案自己的環境（Windows）\n#   python -m venv .venv\n#   .venv\\Scripts\\activate\n#   pip install -r requirements.txt\n\nimport logging, subprocess, sys\n\ndef collect(value, acc=None):          # 不要寫 acc=[]\n    if acc is None:\n        acc = []\n    acc.append(value)\n    return acc\n\ndef main() -&gt; int:\n    try:\n        with open(\"result.csv\", encoding=\"utf-8\") as f:   # 離開區塊自動關檔\n            rows = f.read().splitlines()\n        subprocess.run([\"flash_tool.exe\", \"--verify\"], check=True)  # 回傳非 0 會丟例外\n    except FileNotFoundError as e:\n        logging.error(\"找不到檔案：%s\", e)\n        return 1\n    except subprocess.CalledProcessError as e:\n        logging.error(\"燒錄驗證失敗，exit code %d\", e.returncode)\n        return 2\n    return 0\n\nif __name__ == \"__main__\":\n    sys.exit(main())                   # 讓批次檔／CI 看得到成敗</code></pre>",
          "anchor": "h03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>開 8 條執行緒算資料，速度跟 1 條一樣</td><td>GIL：純 Python 的 CPU 運算無法並行</td><td>改 <code>multiprocessing</code>／<code>ProcessPoolExecutor</code>；或改用 numpy 向量化；I/O 為主的才用 threading</td></tr>\n        <tr><td>自己電腦能跑，同事電腦 ImportError 或結果不同</td><td>沒用 venv、依賴版本沒鎖</td><td>每個專案建 venv，<code>pip freeze</code> 鎖版本進 repo；README 寫明 Python 版本</td></tr>\n        <tr><td><code>pip install</code> 報 externally-managed-environment</td><td>PEP 668：系統 Python 不讓 pip 直接改</td><td>建 venv 再裝；不要用 <code>--break-system-packages</code> 硬裝</td></tr>\n        <tr><td>批次測試全部「通過」，實際有板子沒燒進去</td><td><code>except: pass</code> 吞掉錯誤、外部工具回傳碼沒檢查、腳本永遠回 0</td><td>接具體例外並 log；<code>subprocess.run(check=True)</code>；失敗時 <code>sys.exit</code> 非 0；用 assert 判定</td></tr>\n        <tr><td>函式第二次呼叫起結果夾帶上一次的資料</td><td>可變預設參數（<code>def f(x=[])</code>）只建立一次</td><td>預設值用 <code>None</code>，函式內再建新物件</td></tr>\n        <tr><td>走訪很深的資料夾或樹狀結構時 <code>RecursionError</code></td><td>遞迴深度超過預設上限（通常 1000）</td><td>改成迭代＋自己管的 stack／queue；或 <code>os.walk</code>；不要只靠調高 <code>sys.setrecursionlimit</code></td></tr>\n      </tbody></table></div>",
          "anchor": "h03-l3"
        }
      ]
    },
    {
      "id": "H04",
      "anchor": "h04",
      "tag": "H04",
      "name": "物件導向設計",
      "sub": "SOLID、組合、介面",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>物件導向的目的不是「用很多 class」，而是<b>讓改一個地方不會牽動一大片</b>：把會變的東西藏在介面後面（封裝＋多型），能用「組合」就不要用「繼承」。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>封裝</td><td>把資料和操作它的方法包在一起，外面只能透過公開方法改，內部規則（如「電壓不能超過上限」）不會被繞過</td></tr>\n        <tr><td>繼承</td><td>子類別沿用父類別的成員並擴充。「is-a」關係</td></tr>\n        <tr><td>多型</td><td>同一個呼叫，依實際物件型別跑不同實作（C# <code>virtual</code>／<code>override</code>、介面；C++ <code>virtual</code>；Python 鴨子型別）</td></tr>\n        <tr><td>組合</td><td>物件「擁有」另一個物件並委派工作給它。「has-a」關係</td></tr>\n        <tr><td>介面 vs 抽象類別</td><td>介面：只定契約，一個類別可實作多個；C# 8 起可帶預設實作，但不能有實例欄位。抽象類別：可以有欄位、建構子與部分實作，只能單一繼承</td></tr>\n        <tr><td>S：單一職責</td><td>一個類別只有一個「改變的理由」</td></tr>\n        <tr><td>O：開放封閉</td><td>對擴充開放、對修改封閉：加新功能靠新增類別，不改舊程式</td></tr>\n        <tr><td>L：Liskov 替換</td><td>任何用父類別的地方換成子類別，行為都要正確</td></tr>\n        <tr><td>I：介面隔離</td><td>不要逼使用者依賴用不到的方法；大介面拆小</td></tr>\n        <tr><td>D：依賴反轉</td><td>高層邏輯依賴抽象（介面），不依賴具體類別；具體物件由外部注入（DI）</td></tr>\n      </tbody></table></div>",
          "anchor": "h04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼「組合優於繼承」？</b>繼承把子類別和父類別的內部實作綁死：父類別改一行，所有子類別都可能壞（脆弱基底類別問題），而且關係在編譯時就固定。組合只依賴對方的公開介面，執行時還能換掉（換一個輸出方式、換一種通訊介面）。</li>\n        <li><b>介面和抽象類別怎麼選？</b>要表達「能做什麼」（<code>IComparable</code>、<code>IDisposable</code>）、而且可能多個能力並存 → 介面。一群類別真的共用狀態和大半流程，只有少數步驟不同 → 抽象類別（template method）。不確定時先用介面，比較好改。</li>\n        <li><b>Liskov 原則在防什麼？</b>經典反例：正方形繼承長方形，設寬度時偷偷改高度，拿長方形來算面積的程式就錯了。症狀是子類別出現 <code>throw new NotSupportedException()</code>，或呼叫端開始寫 <code>if (x is Square)</code>。</li>\n        <li><b>依賴反轉對寫工具有什麼實際好處？</b>可以測試。Form 裡直接 <code>new SerialPort()</code>、直接寫檔，就沒辦法在沒有硬體時測解析邏輯；把「通訊」「輸出」抽成介面、由外部注入，測試時塞假的實作即可。Thin Form（Form 只轉發事件）也是同一個想法。</li>\n        <li><b>Python 沒有 interface 關鍵字怎麼辦？</b>靠鴨子型別：有那個方法就能用。要明確契約時用 <code>abc.ABC</code>＋<code>@abstractmethod</code>（忘了實作會在建立時報錯），或 <code>typing.Protocol</code>（給型別檢查器看的結構化介面）。</li>\n      </ul>\n<p class=\"codecap\">C#：介面＋組合，換通訊方式不用改主流程</p>\n<pre><code>internal interface IChipLink\n{\n    /// &lt;summary&gt;寫一個暫存器。&lt;/summary&gt;\n    void Write(byte reg, byte value);\n}\n\ninternal sealed class I2cLink : IChipLink\n{\n    public void Write(byte reg, byte value) { /* 透過 I²C 寫進晶片 */ }\n}\ninternal sealed class FakeLink : IChipLink                // 測試用：只記錄寫了什麼\n{\n    public List&lt;(byte Reg, byte Value)&gt; Log { get; } = new();\n    public void Write(byte reg, byte value) =&gt; Log.Add((reg, value));\n}\n\ninternal sealed class GammaWriter\n{\n    private readonly IChipLink _link;                  // 組合：擁有一個 link，而不是繼承它\n    public GammaWriter(IChipLink link) =&gt; _link = link; // 依賴由外部注入\n    public void Apply(byte[] table)\n    {\n        for (int i = 0; i &lt; table.Length; i++) _link.Write((byte)i, table[i]);\n    }\n}\n// 正式：new GammaWriter(new I2cLink())；單元測試：new GammaWriter(new FakeLink())</code></pre>",
          "anchor": "h04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>改了父類別一個方法，好幾個子類別一起出錯</td><td>脆弱基底類別：子類別依賴父類別的內部實作</td><td>改用組合＋介面；必須繼承時，把可覆寫點縮到少數 <code>protected virtual</code> 方法</td></tr>\n        <tr><td>Form1.cs 好幾千行，改一個功能常弄壞別的</td><td>違反單一職責：UI、解析、通訊、檔案全寫在 Form 裡</td><td>Thin Form：Form 只轉事件，邏輯搬到獨立類別；按「改變的理由」拆檔</td></tr>\n        <tr><td>每加一種新晶片型號，就要改好幾處 <code>switch</code></td><td>違反開放封閉：型號差異散在各處的條件判斷裡</td><td>每個型號一個實作同介面的類別（策略模式），新增型號只加一個類別＋註冊</td></tr>\n        <tr><td>解析邏輯沒有硬體就沒辦法測</td><td>直接 <code>new</code> 具體類別（SerialPort、檔案系統），沒有接縫</td><td>依賴反轉：抽出介面、建構子注入；測試用假實作</td></tr>\n        <tr><td>子類別一堆方法 <code>throw new NotSupportedException()</code></td><td>違反 Liskov／介面隔離：父類別或介面太大，子類別其實不是 is-a</td><td>把大介面拆成幾個小介面，只實作需要的；重新檢查繼承關係是否成立</td></tr>\n      </tbody></table></div>",
          "anchor": "h04-l3"
        }
      ]
    },
    {
      "id": "H05",
      "anchor": "h05",
      "tag": "H05",
      "name": "資料結構",
      "sub": "什麼時候用哪個",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>選資料結構就是在選<b>哪個操作要快</b>：要用索引拿 → 陣列；要用 key 查 → hash；要保持排序或查範圍 → 樹；只要一直拿最小（或最大）→ heap；先進先出 → queue。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 170\" role=\"img\" aria-label=\"hash table 查找\" style=\"min-width:640px\">\n        <defs><marker id=\"ah5\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <text x=\"10\" y=\"20\" class=\"t-strong\">Hash 為什麼是 O(1)：key 直接算出要去哪一格，不用一格一格找</text>\n        <rect class=\"bx\" x=\"10\" y=\"62\" width=\"110\" height=\"36\" rx=\"4\"></rect><text x=\"22\" y=\"85\">key \"VGH\"</text>\n        <rect class=\"bx-accent\" x=\"160\" y=\"62\" width=\"160\" height=\"36\" rx=\"4\"></rect><text x=\"172\" y=\"85\">GetHashCode()</text>\n        <rect class=\"bx\" x=\"360\" y=\"62\" width=\"130\" height=\"36\" rx=\"4\"></rect><text x=\"372\" y=\"85\">% 8 → 第 3 格</text>\n        <line class=\"ln\" x1=\"122\" y1=\"80\" x2=\"158\" y2=\"80\" marker-end=\"url(#ah5)\"></line>\n        <line class=\"ln\" x1=\"322\" y1=\"80\" x2=\"358\" y2=\"80\" marker-end=\"url(#ah5)\"></line>\n        <g>\n          <rect class=\"bx\" x=\"540\" y=\"40\" width=\"40\" height=\"28\"></rect><rect class=\"bx\" x=\"580\" y=\"40\" width=\"40\" height=\"28\"></rect>\n          <rect class=\"bx\" x=\"620\" y=\"40\" width=\"40\" height=\"28\"></rect><rect class=\"bx-accent\" x=\"660\" y=\"40\" width=\"40\" height=\"28\"></rect>\n          <rect class=\"bx\" x=\"700\" y=\"40\" width=\"40\" height=\"28\"></rect><rect class=\"bx\" x=\"740\" y=\"40\" width=\"40\" height=\"28\"></rect>\n          <rect class=\"bx\" x=\"780\" y=\"40\" width=\"40\" height=\"28\"></rect><rect class=\"bx\" x=\"820\" y=\"40\" width=\"40\" height=\"28\"></rect>\n          <text x=\"555\" y=\"59\" class=\"t-small\">0</text><text x=\"595\" y=\"59\" class=\"t-small\">1</text><text x=\"635\" y=\"59\" class=\"t-small\">2</text><text x=\"675\" y=\"59\" class=\"t-accent\">3</text>\n          <text x=\"715\" y=\"59\" class=\"t-small\">4</text><text x=\"755\" y=\"59\" class=\"t-small\">5</text><text x=\"795\" y=\"59\" class=\"t-small\">6</text><text x=\"835\" y=\"59\" class=\"t-small\">7</text>\n        </g>\n        <line class=\"ln\" x1=\"492\" y1=\"80\" x2=\"676\" y2=\"70\" marker-end=\"url(#ah5)\"></line>\n        <rect class=\"bx\" x=\"640\" y=\"100\" width=\"100\" height=\"26\" rx=\"4\"></rect><text x=\"650\" y=\"118\" class=\"t-small\">VGH → 18.0</text>\n        <line class=\"ln\" x1=\"680\" y1=\"68\" x2=\"680\" y2=\"100\"></line>\n        <text x=\"10\" y=\"150\" class=\"t-small\">兩個 key 落在同一格叫碰撞，要再比對 Equals。碰撞全擠在一格時退化成 O(n)；key 放進去後若被改掉，hash 變了就再也找不到。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>結構</th><th>C#／C++／Python</th><th>快的操作</th><th>慢的操作</th><th>什麼時候用</th></tr>\n        <tr><td>陣列／動態陣列</td><td><code>T[]</code>、<code>List&lt;T&gt;</code>／<code>std::vector</code>／<code>list</code></td><td>索引存取 O(1)、尾端加入均攤 O(1)</td><td>中間插入刪除 O(n)、找值 O(n)</td><td>預設首選；依序處理、用索引拿</td></tr>\n        <tr><td>鏈結串列</td><td><code>LinkedList&lt;T&gt;</code>／<code>std::list</code></td><td>已拿到節點時插入刪除 O(1)</td><td>索引存取 O(n)、cache 不友善</td><td>很少真的比較好；LRU cache 內部會用</td></tr>\n        <tr><td>Hash 表／集合</td><td><code>Dictionary</code>、<code>HashSet</code>／<code>unordered_map</code>／<code>dict</code>、<code>set</code></td><td>用 key 查、加、刪 平均 O(1)</td><td>沒有順序；最壞 O(n)</td><td>用名字、ID 查；去重；「有沒有出現過」</td></tr>\n        <tr><td>平衡樹</td><td><code>SortedDictionary</code>、<code>SortedSet</code>／<code>std::map</code>、<code>std::set</code></td><td>查、加、刪 O(log n)，<b>保持排序</b></td><td>比 hash 慢一個常數</td><td>要按順序走訪、找範圍、找最接近的值</td></tr>\n        <tr><td>Heap（優先佇列）</td><td><code>PriorityQueue&lt;TElement,TPriority&gt;</code>（.NET 6 起）／<code>std::priority_queue</code>／<code>heapq</code></td><td>拿最小 O(1)、取出或加入 O(log n)</td><td>找任意元素 O(n)</td><td>排程、Top-K、Dijkstra</td></tr>\n        <tr><td>Queue／Stack</td><td><code>Queue&lt;T&gt;</code>、<code>Stack&lt;T&gt;</code>／<code>std::queue</code>／<code>collections.deque</code></td><td>兩端加入取出 O(1)</td><td>中間存取</td><td>FIFO：生產者消費者、BFS；LIFO：復原、DFS</td></tr>\n      </tbody></table></div>",
          "anchor": "h05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼陣列實際上常常贏過理論上更好的結構？</b>元素連續存放，CPU 一次把整條 cache line 載進來，順序走訪幾乎都命中 cache。鏈結串列每個節點散在 heap 各處，每走一步都可能 cache miss，所以就算插入是 O(1)，小到中等規模常常還是輸給 vector。</li>\n        <li><b>動態陣列的「均攤 O(1)」是什麼意思？</b><code>List&lt;T&gt;</code>／<code>vector</code> 滿了就配一塊更大的（通常約兩倍）再整批複製，那一次是 O(n)。但容量倍增，複製越來越少發生，平均攤到每次加入還是常數。知道大概數量時先給容量（<code>new List&lt;T&gt;(n)</code>、<code>reserve</code>）可以省掉複製。</li>\n        <li><b>自訂 class 當 key，為什麼「內容一樣」的新物件查不到？</b>C# 的 class 預設 <code>Equals</code>／<code>GetHashCode</code> 比的是<b>是不是同一個物件（參考）</b>，不是內容。兩個欄位完全相同的新物件，對 Dictionary 來說是不同的 key。要依內容比較，就兩個一起覆寫，或改用 <code>record</code>（編譯器自動依內容產生），或建 Dictionary 時給一個 <code>IEqualityComparer&lt;T&gt;</code>。</li>\n        <li><b>hash 什麼時候會出事？</b>一、key 物件放進去之後被改掉，hash 值變了，再也找不到；二、自訂型別只覆寫了 <code>Equals</code> 沒覆寫 <code>GetHashCode</code>（兩者要一致）；三、多執行緒同時寫普通 <code>Dictionary</code> 會毀損內部結構，要用 <code>ConcurrentDictionary</code> 或鎖。</li>\n        <li><b>什麼時候用樹不用 hash？</b>需要「順序」的時候：依時間走訪事件、找某電壓以下的所有點、找最接近的 key。hash 每次要排序都得 O(n log n) 重排，樹一直保持排序。</li>\n        <li><b>heap 為什麼不乾脆排序？</b>如果資料一直進來、每次只要拿目前最小的，排序要每次重排；heap 只維持「頂端最小」這一個性質，加入和取出都是 O(log n)。.NET 的 <code>PriorityQueue</code> 是陣列實作的四元 heap，<b>優先值小的先出</b>。</li>\n        <li><b>Python 的 list 拿來當 queue 有什麼問題？</b><code>list.pop(0)</code> 要把後面全部往前搬，是 O(n)；資料多時整個 queue 變 O(n²)。用 <code>collections.deque</code> 的 <code>popleft()</code> 才是 O(1)。</li>\n      </ul>",
          "anchor": "h05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>比對兩份腳位表，幾百筆一下子，幾萬筆要好幾分鐘</td><td>迴圈裡用 <code>List.Contains</code>／<code>IndexOf</code> 找，整體 O(n²)</td><td>先把一份轉成 <code>HashSet</code>／<code>Dictionary</code>，查找變 O(1)，整體 O(n)</td></tr>\n        <tr><td>Dictionary 明明加過的 key 卻找不到</td><td>key 物件被改過（hash 變了），或自訂型別 <code>Equals</code>／<code>GetHashCode</code> 不一致；字串大小寫、空白不同</td><td>key 用不可變型別（string、record）；需要時給 <code>StringComparer.OrdinalIgnoreCase</code>；先正規化字串</td></tr>\n        <tr><td>自訂類別當 key，用欄位內容相同的新物件去查卻查不到</td><td>class 沒覆寫 <code>Equals</code>／<code>GetHashCode</code>，預設比參考，只認放進去的那一個物件</td><td>兩個一起覆寫（依同一組欄位）；或改用 <code>record</code>；或傳 <code>IEqualityComparer&lt;T&gt;</code> 給 Dictionary／HashSet</td></tr>\n        <tr><td><code>KeyNotFoundException</code></td><td>用 <code>dict[key]</code> 讀不存在的 key</td><td>用 <code>TryGetValue</code>（Python 用 <code>dict.get</code>）；查不到時的行為要明確決定</td></tr>\n        <tr><td>背景執行緒和 UI 同時寫一個 Dictionary，偶發例外或卡在 100% CPU</td><td>普通 Dictionary 不是執行緒安全，併發寫入毀損內部結構</td><td>改 <code>ConcurrentDictionary</code>，或統一用 lock；或只讓一條執行緒寫</td></tr>\n        <tr><td>Python 處理佇列越跑越慢</td><td>用 <code>list.pop(0)</code> 當 queue，每次 O(n)</td><td>改 <code>collections.deque</code>；多執行緒生產者消費者用 <code>queue.Queue</code></td></tr>\n        <tr><td>每次畫面更新都把整個清單重新排序，筆數大時明顯延遲</td><td>反覆 O(n log n) 排序，其實只是少量增減</td><td>改用保持排序的結構（<code>SortedList</code>／<code>SortedDictionary</code>），或只把新元素用二分搜尋插到正確位置</td></tr>\n      </tbody></table></div>",
          "anchor": "h05-l3"
        }
      ]
    },
    {
      "id": "H06",
      "anchor": "h06",
      "tag": "H06",
      "name": "演算法與複雜度",
      "sub": "Big-O、排序、遞迴",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>Big-O 不是在算「跑幾秒」，而是在回答<b>「資料變 2 倍、10 倍時，工作量變幾倍」</b>。O(n) 是跟著變 2 倍；O(n²) 變 4 倍；O(log n) 只多<b>一步</b>。</p>\n<figure>\n      <div class=\"table-wrap\">\n      <svg class=\"fig\" viewBox=\"0 0 900 210\" role=\"img\" aria-label=\"二分搜尋每一步範圍減半\" style=\"min-width:640px\">\n        <text x=\"10\" y=\"20\" class=\"t-strong\">log n 的直覺：每一步丟掉一半，問「要對折幾次才剩 1 筆」</text>\n        <rect class=\"bx-accent\" x=\"110\" y=\"36\" width=\"640\" height=\"22\" rx=\"3\"></rect><text x=\"10\" y=\"52\">第 0 步</text><text x=\"764\" y=\"52\">16 筆</text>\n        <rect class=\"bx-accent\" x=\"110\" y=\"68\" width=\"320\" height=\"22\" rx=\"3\"></rect><rect class=\"bx-soft\" x=\"430\" y=\"68\" width=\"320\" height=\"22\" rx=\"3\"></rect><text x=\"10\" y=\"84\">第 1 步</text><text x=\"764\" y=\"84\">8 筆</text>\n        <rect class=\"bx-accent\" x=\"110\" y=\"100\" width=\"160\" height=\"22\" rx=\"3\"></rect><rect class=\"bx-soft\" x=\"270\" y=\"100\" width=\"480\" height=\"22\" rx=\"3\"></rect><text x=\"10\" y=\"116\">第 2 步</text><text x=\"764\" y=\"116\">4 筆</text>\n        <rect class=\"bx-accent\" x=\"110\" y=\"132\" width=\"80\" height=\"22\" rx=\"3\"></rect><rect class=\"bx-soft\" x=\"190\" y=\"132\" width=\"560\" height=\"22\" rx=\"3\"></rect><text x=\"10\" y=\"148\">第 3 步</text><text x=\"764\" y=\"148\">2 筆</text>\n        <rect class=\"bx-accent\" x=\"110\" y=\"164\" width=\"40\" height=\"22\" rx=\"3\"></rect><rect class=\"bx-soft\" x=\"150\" y=\"164\" width=\"600\" height=\"22\" rx=\"3\"></rect><text x=\"10\" y=\"180\">第 4 步</text><text x=\"764\" y=\"180\">1 筆 ← log₂16 = 4</text>\n        <text x=\"10\" y=\"204\" class=\"t-small\">反過來看：步數每多 1，能處理的資料量就翻倍。所以 100 萬筆只要約 20 步、10 億筆約 30 步。</text>\n      </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<p><b>先講定義。</b>每個名詞都給「正式定義」和「白話」兩種說法，考題用的是正式定義，理解靠白話。</p>\n<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>正式定義</th><th>白話</th></tr>\n        <tr><td>演算法（algorithm）</td><td>一組有限、明確的步驟，能把給定的輸入在有限步之內轉換成正確的輸出</td><td>解一個問題的 SOP，照著做一定做得完、答案是對的</td></tr>\n        <tr><td>輸入規模 n</td><td>衡量輸入大小的數字</td><td>資料有多少：排序 100 個數 n = 100</td></tr>\n        <tr><td>複雜度（complexity）</td><td>演算法執行所需的資源量，表示成 n 的函數</td><td>資料變多時，要花的力氣漲得多快</td></tr>\n        <tr><td>時間複雜度</td><td>執行所需的基本運算次數，表示成 n 的函數</td><td>要跑多久。算的是<b>步數</b>不是秒數，秒數會隨電腦快慢變</td></tr>\n        <tr><td>空間複雜度</td><td>執行所需的額外記憶體量，表示成 n 的函數</td><td>要多佔多少記憶體</td></tr>\n        <tr><td>最好／平均／最壞情況</td><td>所有大小為 n 的輸入中，步數的最小值／期望值／最大值</td><td>一張張翻考卷找人：第一張就是他（1 次）、平均翻一半（n/2）、他在最後一張（n 次）。沒特別說就指最壞，因為它是保證</td></tr>\n      </tbody></table></div>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>演算法的五個條件（Knuth）</th><th>正式意思</th><th>白話</th></tr>\n        <tr><td>輸入</td><td>有 0 個以上的輸入</td><td>要先給它材料</td></tr>\n        <tr><td>輸出</td><td>至少 1 個輸出</td><td>一定要交出結果</td></tr>\n        <tr><td>明確性</td><td>每一步意思唯一、不含糊</td><td>誰來做都做得一樣</td></tr>\n        <tr><td>有限性</td><td>一定在有限步內結束</td><td>不會無限做下去</td></tr>\n        <tr><td>有效性</td><td>每一步都做得到</td><td>不能寫「憑感覺挑最好的」</td></tr>\n      </tbody></table></div>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>符號</th><th>正式定義</th><th>白話</th><th>類比</th></tr>\n        <tr><td>f(n) = O(g(n))</td><td>存在常數 c &gt; 0 和 n₀，使所有 n ≥ n₀ 都有 f(n) ≤ c·g(n)</td><td>n 夠大以後，f 成長<b>不會快過</b> g（允許乘固定倍數）；上界</td><td>「最多 100 元」</td></tr>\n        <tr><td>f(n) = Ω(g(n))</td><td>存在 c &gt; 0 和 n₀，使所有 n ≥ n₀ 都有 f(n) ≥ c·g(n)</td><td>至少是這個等級；下界</td><td>「至少 100 元」</td></tr>\n        <tr><td>f(n) = Θ(g(n))</td><td>f(n) 同時是 O(g(n)) 和 Ω(g(n))</td><td>剛好就是這個等級；上下都夾住</td><td>「大約 100 元」</td></tr>\n      </tbody></table></div>\n<p><b>例：</b>某演算法要做 3n + 5 步。取 c = 4、n₀ = 5，n ≥ 5 時 3n + 5 ≤ 4n 成立，所以 3n + 5 = O(n)。這就是常數倍和小項可以丟掉的原因：n 很大時它們不改變等級。</p>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>問題難度分類</th><th>正式定義</th><th>白話</th></tr>\n        <tr><td>多項式時間</td><td>複雜度為 O(nᵏ)，k 為常數</td><td>「跑得完」的標準</td></tr>\n        <tr><td>P</td><td>能在多項式時間內<b>解出</b>的決策問題</td><td>好解的問題</td></tr>\n        <tr><td>NP</td><td>給一個答案，能在多項式時間內<b>驗證</b>對錯的決策問題</td><td>好檢查、不一定好解。數獨：檢查填好的盤面很快，從空盤解很難</td></tr>\n        <tr><td>NP-hard</td><td>所有 NP 問題都能在多項式時間內轉換成它</td><td>至少跟 NP 裡最難的一樣難</td></tr>\n        <tr><td>NP-complete</td><td>屬於 NP，又是 NP-hard</td><td>NP 裡最難的那群</td></tr>\n        <tr><td>近似演算法</td><td>多項式時間內，保證結果與最佳解差距不超過某個比例</td><td>不是最好，但保證不會差太多</td></tr>\n        <tr><td>啟發式（heuristic）</td><td>依經驗法則求解，不保證品質</td><td>夠好就好，例如模擬退火</td></tr>\n      </tbody></table></div>\n<p>P = NP（好檢查的是否都好解）至今未解。EDA 的擺放（placement）、繞線（routing）多是 NP-hard，n 又是上億，所以實務上用近似或啟發式，不求最佳解。</p>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>複雜度</th><th>白話</th><th>n 變 2 倍時</th><th>典型例子</th></tr>\n        <tr><td>O(1)</td><td>跟資料多少無關</td><td>不變</td><td>陣列用索引拿、hash 查 key</td></tr>\n        <tr><td>O(log n)</td><td>每步砍掉一部分（通常一半）</td><td><b>多 1 步</b></td><td>二分搜尋、平衡樹查找、heap 加入取出</td></tr>\n        <tr><td>O(n)</td><td>每筆看一次</td><td>2 倍</td><td>線性搜尋、加總、走訪一遍</td></tr>\n        <tr><td>O(n log n)</td><td>n 筆、每筆做 log n 的事</td><td>略多於 2 倍</td><td>好的排序（merge、heap、introsort、Timsort）</td></tr>\n        <tr><td>O(n²)</td><td>每筆跟每筆比</td><td>4 倍</td><td>雙層迴圈、泡沫排序、插入排序（最壞）、迴圈裡呼叫 <code>List.Contains</code></td></tr>\n        <tr><td>O(2ⁿ)</td><td>每多一筆工作量翻倍</td><td>平方</td><td>暴力列舉所有子集、沒記憶的遞迴費氏數列</td></tr>\n      </tbody></table></div>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th class=\"num\">n</th><th class=\"num\">log₂ n（二分搜尋最多比幾次）</th><th class=\"num\">n（線性搜尋最多比幾次）</th></tr>\n        <tr><td class=\"num\">16</td><td class=\"num\">4</td><td class=\"num\">16</td></tr>\n        <tr><td class=\"num\">1,000</td><td class=\"num\">約 10</td><td class=\"num\">1,000</td></tr>\n        <tr><td class=\"num\">1,000,000</td><td class=\"num\">約 20</td><td class=\"num\">1,000,000</td></tr>\n        <tr><td class=\"num\">1,000,000,000</td><td class=\"num\">約 30</td><td class=\"num\">1,000,000,000</td></tr>\n      </tbody></table></div>\n<div class=\"table-wrap\" style=\"margin-top:12px\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>最好／平均／最壞情況</td><td>同一個演算法對不同輸入的表現。Big-O 沒特別說明時通常指最壞。快速排序平均 O(n log n)、最壞 O(n²)</td></tr>\n        <tr><td>均攤（amortized）</td><td>偶爾一次很貴、平均攤下來很便宜，例如動態陣列尾端加入</td></tr>\n        <tr><td>空間複雜度</td><td>額外要多少記憶體。merge sort 要 O(n) 暫存；heap sort 原地 O(1)；遞迴本身吃 O(深度) 的 stack</td></tr>\n        <tr><td>穩定排序</td><td>key 相同的元素排序後維持原來順序。Python <code>sorted</code>、LINQ <code>OrderBy</code>、<code>std::stable_sort</code> 穩定；<code>Array.Sort</code>／<code>List.Sort</code>、<code>std::sort</code> 不穩定</td></tr>\n        <tr><td>常見排序</td><td>泡沫／插入 O(n²)（插入排序對幾乎排好的資料接近 O(n)）；merge O(n log n) 穩定；quick 平均 O(n log n)；heap O(n log n) 原地；.NET 用 introsort（小段插入排序、遞迴太深改 heap sort，其餘 quick sort）；Python 用 Timsort 系列（3.11 起合併策略改為 Powersort）</td></tr>\n        <tr><td>二分搜尋</td><td>前提是<b>已排序</b>。看中間：比目標大就丟右半、比目標小就丟左半，最壞 O(log n)。C# <code>Array.BinarySearch</code>、C++ <code>std::lower_bound</code>、Python <code>bisect</code></td></tr>\n        <tr><td>遞迴 vs 迭代</td><td>遞迴：函式呼叫自己，每層佔一格 stack；迭代：用迴圈加自己管的 stack／queue。能互相改寫</td></tr>\n        <tr><td>Memoization／DP</td><td>把算過的子問題結果存起來，下次直接查，用空間換時間</td></tr>\n      </tbody></table></div>",
          "anchor": "h06-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>Big-O 到底怎麼「感覺」？</b>別記公式，問一句：<b>資料翻倍，工作量怎麼變？</b>一筆一筆看（O(n)）→ 也翻倍；每筆跟每筆比（O(n²)）→ 變 4 倍；每一步都丟掉一半（O(log n)）→ 只多一步。所以二分搜尋在 1,000 筆是約 10 步，在 100 萬筆也才約 20 步。主圖拉桿拉到 100 萬，看 O(n²) 的長條怎麼把其他全部壓扁。</li>\n        <li><b>怎麼從程式碼看出複雜度？</b>一層迴圈跑 n 次 → O(n)；兩層各跑 n 次 → O(n²)；迴圈變數每次 ×2 或範圍每次砍半 → O(log n)；呼叫內建排序 → O(n log n)；<b>小心藏起來的迴圈</b>：<code>List.Contains</code>、<code>IndexOf</code>、<code>list.remove</code>、<code>string +=</code> 本身就是 O(n)，放進迴圈就變 O(n²)。</li>\n        <li><b>為什麼可以丟掉常數和低次項？</b>Big-O 只在乎 n 很大時誰主導。3n² + 100n 在 n = 100 萬時，100n 只佔不到萬分之一。常數在 n 小時很重要（所以 .NET 在 16 筆以下改用插入排序），但它不會改變「翻倍時變幾倍」。</li>\n        <li><b>為什麼排序很難比 O(n log n) 更快？</b>只靠「兩兩比較」的排序有下限 Ω(n log n)：n 筆有 n! 種排列，每次比較最多排除一半可能，至少要 log₂(n!) ≈ n log n 次。計數排序、基數排序更快，是因為它們不靠比較，而是利用 key 的範圍（例如 0～255 的灰階值）。</li>\n        <li><b>快速排序最壞 O(n²) 怎麼避免？</b>每次 pivot 都挑到最大或最小（例如對已排序資料固定取第一個），分割完全不平均。函式庫的解法是隨機或三數取中選 pivot，或像 introsort 遞迴太深就切換 heap sort，把最壞壓回 O(n log n)。自己寫排序幾乎都比不上內建。</li>\n        <li><b>時間與空間怎麼權衡？</b>用記憶體換速度是最常見的優化：hash 索引、memoization、查表。顯示驅動 IC 裡的 gamma LUT 就是：不在每個像素即時算 gamma 曲線，而是事先把 256（或 1024）階的結果存成表，一次查表 O(1)。反過來，記憶體很緊的韌體可能寧可每次重算。</li>\n        <li><b>遞迴和迭代怎麼選？</b>遞迴寫樹、分治（merge sort、走訪資料夾）很自然，但每層佔 stack：Python 預設深度上限約 1000，超過丟 <code>RecursionError</code>；.NET 的 <code>StackOverflowException</code> <b>接不到、整個行程直接結束</b>。C# 和 Python 都不保證尾遞迴最佳化。深度可能很大（使用者資料決定）時改成迭代＋顯式 stack。</li>\n        <li><b>二分搜尋為什麼容易寫錯？</b>邊界：<code>while (lo &lt;= hi)</code> 還是 <code>&lt;</code>、更新用 <code>mid</code> 還是 <code>mid ± 1</code>，錯一個就漏找或死迴圈。還有經典溢位：<code>(lo + hi) / 2</code> 在陣列超過約 10 億筆時 int 溢位，2006 年 Joshua Bloch 在 Google 部落格撰文說明，Java 函式庫的 <code>Arrays.binarySearch</code>（他自己寫的）就藏了這個 bug，是被人回報後才發現；寫成 <code>lo + (hi - lo) / 2</code> 就安全。</li>\n      </ul>\n<p class=\"codecap\">同一個二分搜尋，三種語言（回傳索引，找不到回 -1）</p>\n<pre><code>// C\nint bsearch_i(const int *a, int n, int target) {\n    int lo = 0, hi = n - 1;\n    while (lo &lt;= hi) {\n        int mid = lo + (hi - lo) / 2;      // 不寫 (lo + hi) / 2，避免溢位\n        if (a[mid] == target) return mid;\n        if (a[mid] &lt; target) lo = mid + 1; // 丟掉左半（含 mid）\n        else                 hi = mid - 1; // 丟掉右半（含 mid）\n    }\n    return -1;\n}</code></pre>\n<pre><code>// C#：實務上直接用內建\nint idx = Array.BinarySearch(sorted, target);   // 找不到回負數（~idx 是應插入的位置）\nvar set = new HashSet&lt;string&gt;(pinNames);        // 只問「有沒有」時，hash 更快：O(1)</code></pre>\n<pre><code># Python：bisect 回傳插入位置\nimport bisect\ni = bisect.bisect_left(sorted_list, target)\nfound = i &lt; len(sorted_list) and sorted_list[i] == target</code></pre>",
          "anchor": "h06-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>工具處理 1,000 筆瞬間完成，10 萬筆跑半小時</td><td>藏起來的 O(n²)：迴圈裡 <code>Contains</code>／<code>IndexOf</code>／<code>Remove</code>、迴圈裡 <code>string +=</code>、雙層迴圈比對</td><td>用 profiler 找熱點；查找改 hash；字串改 <code>StringBuilder</code>（Python 用 <code>\"\".join</code>）；兩份資料比對先建索引</td></tr>\n        <tr><td>自己寫的二分搜尋偶爾找不到明明存在的值，或卡死</td><td>邊界錯（<code>&lt;</code>／<code>&lt;=</code>、<code>mid</code>／<code>mid±1</code>）、陣列其實沒排序、排序與搜尋用的比較規則不同</td><td>用內建（<code>Array.BinarySearch</code>、<code>bisect</code>、<code>std::lower_bound</code>）；確認排序和搜尋用同一個 comparer；邊界值寫單元測試</td></tr>\n        <tr><td>遞迴走訪資料夾或樹，遇到特別深的資料時程式直接消失</td><td>遞迴太深：.NET <code>StackOverflowException</code> 無法攔截、行程終止</td><td>改成迭代＋<code>Stack&lt;T&gt;</code>／<code>Queue&lt;T&gt;</code>；或限制深度並回報</td></tr>\n        <tr><td>依「站別」排序後，同站別的資料順序每次都不一樣</td><td><code>Array.Sort</code>／<code>List.Sort</code> 是不穩定排序</td><td>改用 LINQ <code>OrderBy(...).ThenBy(...)</code>（穩定），或在比較裡加第二排序鍵（如原始索引）</td></tr>\n        <tr><td>自寫快速排序對「已經排好」的資料特別慢</td><td>pivot 固定取第一個或最後一個，退化成 O(n²)</td><td>改用內建排序；一定要自己寫就隨機或三數取中選 pivot</td></tr>\n        <tr><td>加了快取後速度變快，但記憶體一路長到被系統砍掉</td><td>memoization 快取沒有上限</td><td>限制大小（LRU，例如 Python <code>functools.lru_cache(maxsize=...)</code>）；只快取真的會重複的子問題</td></tr>\n      </tbody></table></div>",
          "anchor": "h06-l3"
        }
      ]
    },
    {
      "id": "H07",
      "anchor": "h07",
      "tag": "H07",
      "name": "C 語言細節",
      "sub": "陣列退化、padding、巨集",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>C 幾乎不幫你檢查：陣列一傳進函式就<b>退化成指標</b>、巨集是<b>純文字替換</b>、有號和無號混算時<b>有號會被轉成無號</b>。考題多半是「這段印出什麼」，答案藏在這些隱性轉換裡。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>陣列退化（array decay）</td><td>陣列名在大多數運算式裡會變成「指向第一個元素的指標」。例外：<code>sizeof arr</code>、<code>&amp;arr</code>、用字串常值初始化陣列。函式參數寫 <code>int a[10]</code> 其實就是 <code>int *a</code></td></tr>\n        <tr><td>指標運算</td><td><code>p + 1</code> 前進一個元素（<code>sizeof *p</code> 個位元組）；兩個指標相減得到元素個數。只有在同一個陣列內（含尾後一格）才有定義</td></tr>\n        <tr><td>struct 對齊與 padding</td><td>成員要放在自己對齊要求的位址上，編譯器會在中間或尾端塞空白；整個 struct 大小是最大對齊的倍數。例：<code>{char c; int i; char d;}</code> 在常見平台是 12 bytes，改成 <code>{int i; char c; char d;}</code> 只要 8</td></tr>\n        <tr><td>巨集（#define）</td><td>前置處理器做的文字替換，不懂型別也不管優先序。參數出現幾次就會被求值幾次</td></tr>\n        <tr><td>C 字串</td><td>以 <code>'\\0'</code> 結尾的 char 陣列。<code>strlen</code> 不含結尾，<code>sizeof(\"abc\")</code> 是 4。<code>strcpy</code> 不檢查長度，<code>strncpy</code> 截斷時不保證補 <code>'\\0'</code></td></tr>\n        <tr><td>static／extern</td><td>檔案層級的 <code>static</code>：只有這個 .c 看得到（內部連結）。函式內的 <code>static</code>：整個程式期間都存在、只初始化一次。<code>extern</code>：宣告「定義在別的檔案」</td></tr>\n        <tr><td>整數提升與一般算術轉換</td><td>比 <code>int</code> 小的型別（char、short）運算前先升成 <code>int</code>；有號和同等級的無號混算時，有號會被轉成無號</td></tr>\n      </tbody></table></div>",
          "anchor": "h07-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼在函式裡用 <code>sizeof(a)/sizeof(a[0])</code> 算不出陣列長度？</b>傳進來的已經是指標，<code>sizeof(a)</code> 是指標大小（常見 8），不是整個陣列。長度一定要另外傳。</li>\n        <li><b>為什麼 <code>-1 &lt; sizeof(int)</code> 是假？</b><code>sizeof</code> 的型別是無號的 <code>size_t</code>，<code>-1</code> 被轉成無號後變成極大的數。</li>\n        <li><b>為什麼巨集要整個加括號，多行巨集要包 <code>do { } while (0)</code>？</b>替換後的文字會和前後運算子結合；不包的話，接在 <code>if</code> 後面只有第一行受條件控制。</li>\n        <li><b>為什麼 struct 不能直接 <code>memcpy</code> 到通訊封包？</b>padding 和位元組順序（endianness）隨編譯器與平台不同，另一端解讀會錯位。</li>\n        <li><b>為什麼函式內的 static 變數在多執行緒或 ISR 裡危險？</b>它只有一份，所有呼叫共用，函式就不可重入（not reentrant）。</li>\n      </ul>\n<p class=\"codecap\">C：這段印出什麼</p>\n<pre><code>#include &lt;stdio.h&gt;\n#define SQ(x) x * x\n\nvoid f(int a[10]) { printf(\"%zu\\n\", sizeof(a)); }    /* 指標大小，例如 8 */\n\nint main(void) {\n    int arr[10];\n    printf(\"%zu\\n\", sizeof(arr));      /* 40（int 為 4 bytes 時） */\n    f(arr);\n    printf(\"%d\\n\", SQ(1 + 2));         /* 1 + 2 * 1 + 2 = 5，不是 9 */\n    if (-1 &lt; sizeof(int)) puts(\"yes\");\n    else                  puts(\"no\");  /* no：-1 被轉成極大的無號數 */\n    return 0;\n}</code></pre>",
          "anchor": "h07-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>函式裡算出的陣列長度永遠是 2 或 1</td><td>陣列傳進函式已退化成指標</td><td>長度當參數一起傳；或在定義陣列的那一層算好</td></tr>\n        <tr><td>struct 經 UART／檔案傳到另一平台後欄位錯位</td><td>padding 或 endianness 不同</td><td>用固定寬度型別逐欄位序列化；要用 packed 時注意未對齊存取的效能與硬體限制</td></tr>\n        <tr><td>字串後面偶爾帶出亂碼</td><td>沒有 <code>'\\0'</code> 結尾（例如 <code>strncpy</code> 剛好截斷）</td><td>手動補 <code>'\\0'</code>，或改用 <code>snprintf</code></td></tr>\n        <tr><td><code>for (unsigned i = n - 1; i &gt;= 0; i--)</code> 永遠不結束</td><td>無號數永遠 <code>&gt;= 0</code>，減到 0 再減會繞回最大值</td><td>改用有號型別，或寫成 <code>for (i = n; i-- &gt; 0;)</code></td></tr>\n        <tr><td>兩個 .c 檔同名全域變數，連結失敗或互相干擾</td><td>都是外部連結，名稱衝突</td><td>只有自己用的加 <code>static</code>；要共用的在 .h 寫 <code>extern</code> 宣告、只在一個 .c 定義</td></tr>\n        <tr><td><code>MAX(i++, j)</code> 的結果和預期不同</td><td>巨集參數被求值兩次</td><td>改用 <code>static inline</code> 函式</td></tr>\n      </tbody></table></div>",
          "anchor": "h07-l3"
        }
      ]
    },
    {
      "id": "H08",
      "anchor": "h08",
      "tag": "H08",
      "name": "C++ 物件模型",
      "sub": "vtable、slicing、move",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>多型靠每個物件裡的 <b>vptr 指向 vtable</b>，只有透過<b>指標或參考</b>呼叫才會查表；以值複製會被 <b>slicing</b> 切掉衍生部分。建構從基底往衍生走、解構反過來，建構期間 virtual 呼叫只會到正在建構的那一層。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>建構與解構順序</td><td>建構：基底類別 → 成員（照<b>宣告順序</b>，不是初始化串列的順序）→ 建構子本體。解構完全相反</td></tr>\n        <tr><td>virtual 與 vtable</td><td>類別有 virtual 函式時，每個物件多一個 vptr 指向該類別的函式表；透過基底指標或參考呼叫時，執行期查表決定呼叫哪個版本（動態繫結）</td></tr>\n        <tr><td>virtual 解構子</td><td>要透過基底指標 <code>delete</code> 衍生物件，基底解構子必須是 virtual，否則是 UB（常見結果是只跑基底解構子）</td></tr>\n        <tr><td>object slicing</td><td>把衍生物件以「值」指定或複製給基底型別，衍生的成員被切掉，之後的 virtual 呼叫也變成基底版本</td></tr>\n        <tr><td>move 語意</td><td>右值參考 <code>T&amp;&amp;</code> 讓物件把資源「交出來」而不是複製。<code>std::move</code> 只是轉型，本身不搬任何東西；被移走的物件處於「有效但未指定」的狀態</td></tr>\n        <tr><td>複製省略（RVO）</td><td>回傳區域物件時，編譯器可以直接在呼叫端建構，連 move 都省掉；C++17 起回傳暫時物件保證省略</td></tr>\n        <tr><td>override／final</td><td><code>override</code>：要求編譯器確認真的覆寫到基底的 virtual；<code>final</code>：禁止再被覆寫或繼承</td></tr>\n      </tbody></table></div>",
          "anchor": "h08-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼建構子裡呼叫 virtual 不會跑到衍生版本？</b>基底建構子執行時，衍生部分還沒建好，物件此刻的動態型別就是基底，vptr 指向基底的 vtable。解構子裡同理。</li>\n        <li><b>為什麼一定要寫 override？</b>簽章只差一點（少個 <code>const</code>、參數型別不同）就變成一個新函式而不是覆寫，編譯不會報錯，多型悄悄失效。加了 <code>override</code> 編譯器會擋。</li>\n        <li><b>為什麼 <code>return std::move(local);</code> 反而比較差？</b>它把回傳值變成右值參考運算式，阻止了 RVO，原本零成本的回傳變成一次 move。</li>\n        <li><b>為什麼多型容器要存指標？</b><code>std::vector&lt;Base&gt;</code> 每格只放得下 Base 的大小，放進去就 slicing；要存 <code>std::unique_ptr&lt;Base&gt;</code>。</li>\n      </ul>\n<p class=\"codecap\">C++：這段印出什麼</p>\n<pre><code>#include &lt;iostream&gt;\nstruct Base {\n    Base() { hello(); }                  // 建構期間呼叫 virtual：只到 Base 版\n    virtual void hello() { std::cout &lt;&lt; \"Base\\n\"; }\n    virtual ~Base() = default;\n};\nstruct Derived : Base {\n    void hello() override { std::cout &lt;&lt; \"Derived\\n\"; }\n};\n\nint main() {\n    Derived d;       // 印 Base\n    Base b = d;      // slicing：只複製 Base 部分（複製建構子，不會再印）\n    b.hello();       // Base\n    Base&amp; r = d;\n    r.hello();       // Derived：參考保留多型\n}</code></pre>",
          "anchor": "h08-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>用基底指標 delete 後記憶體洩漏，衍生解構子沒跑</td><td>基底解構子不是 virtual</td><td>有 virtual 函式的基底一律給 <code>virtual ~Base()</code></td></tr>\n        <tr><td>物件放進 <code>vector&lt;Base&gt;</code> 後多型失效</td><td>slicing</td><td>改存 <code>unique_ptr&lt;Base&gt;</code></td></tr>\n        <tr><td>改了基底函式簽章後，衍生類別的「覆寫」悄悄不再被呼叫</td><td>衍生類別沒寫 <code>override</code>，變成新函式</td><td>所有覆寫都加 <code>override</code>，開 <code>-Wsuggest-override</code></td></tr>\n        <tr><td>成員初始化讀到垃圾值</td><td>初始化串列用了另一個成員，但那個成員宣告在後面、還沒初始化</td><td>照宣告順序寫初始化串列；開 <code>-Wreorder</code></td></tr>\n        <tr><td>物件被 move 之後再使用，行為怪異</td><td>使用了被移走後的狀態</td><td>move 之後只重新賦值或讓它銷毀</td></tr>\n      </tbody></table></div>",
          "anchor": "h08-l3"
        }
      ]
    },
    {
      "id": "H09",
      "anchor": "h09",
      "tag": "H09",
      "name": "C++ 模板與 STL",
      "sub": "容器、iterator、lambda",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>選容器先看<b>要不要連續記憶體、要不要排序、在哪裡插入</b>；改動容器時要記得哪些 <b>iterator 會失效</b>。template 在編譯期依型別產生程式碼，所以定義要讓使用處看得到。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>容器／名詞</th><th>重點</th></tr>\n        <tr><td><code>vector</code></td><td>連續記憶體；隨機存取 O(1)、尾端加入均攤 O(1)、中間插入刪除 O(n)</td></tr>\n        <tr><td><code>deque</code></td><td>兩端加入刪除 O(1)，隨機存取 O(1)，但不是一整塊連續記憶體</td></tr>\n        <tr><td><code>list</code></td><td>雙向鏈結；已知位置插入刪除 O(1)，不能隨機存取，對 cache 不友善</td></tr>\n        <tr><td><code>map</code>／<code>set</code></td><td>平衡樹（通常紅黑樹），有序，查找插入 O(log n)</td></tr>\n        <tr><td><code>unordered_map</code>／<code>unordered_set</code></td><td>雜湊表，平均 O(1)、最差 O(n)，沒有順序</td></tr>\n        <tr><td>iterator 失效</td><td><code>vector</code> 重新配置時全部失效，<code>erase</code> 讓被刪的和之後的失效；<code>map</code> 的 <code>erase</code> 只影響被刪那個；<code>unordered_map</code> rehash 讓 iterator 失效</td></tr>\n        <tr><td>template／特化</td><td>template 依型別在編譯期產生程式碼；特化是替某個型別提供專屬實作</td></tr>\n        <tr><td>lambda capture</td><td><code>[=]</code> 複製、<code>[&amp;]</code> 參考、<code>[x, &amp;y]</code> 逐一指定、<code>[this]</code> 捕捉物件指標。預設呼叫運算子是 const，值捕捉的變數要改得加 <code>mutable</code></td></tr>\n        <tr><td><code>constexpr</code></td><td>可以在編譯期算出的變數或函式，結果可用在陣列大小、template 參數</td></tr>\n      </tbody></table></div>",
          "anchor": "h09-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼中間插入也常常是 vector 比 list 快？</b>vector 搬移的是連續記憶體，cache 命中率高；list 每個節點各配置一次，找到位置要一路追指標，實際常數很大。</li>\n        <li><b>為什麼邊走訪邊刪要寫 <code>it = v.erase(it)</code>？</b><code>erase</code> 讓目前的 iterator 失效，回傳值才是下一個有效位置；寫 <code>v.erase(it); ++it;</code> 是對失效的 iterator 做運算。</li>\n        <li><b>為什麼 <code>m[key]</code> 拿來查詢會讓 map 變大？</b><code>operator[]</code> 找不到時會插入一個預設值。只想查就用 <code>find</code>、<code>count</code> 或 C++20 的 <code>contains</code>。</li>\n        <li><b>為什麼 template 的定義要放在標頭檔？</b>編譯器要在使用處依實際型別產生程式碼，只看到宣告就產生不出來，連結時會缺符號。</li>\n      </ul>\n<p class=\"codecap\">C++：常見陷阱</p>\n<pre><code>#include &lt;functional&gt;\n#include &lt;map&gt;\n#include &lt;string&gt;\n#include &lt;vector&gt;\n\nstd::function&lt;int()&gt; make() {\n    int n = 5;\n    return [&amp;n] { return n; };      // 懸空：make() 結束時 n 已經消失\n}\n\nint main() {\n    std::vector&lt;int&gt; v{1, 2, 3, 4};\n    for (auto it = v.begin(); it != v.end(); ) {\n        if (*it % 2 == 0) it = v.erase(it);   // 回傳下一個有效 iterator\n        else ++it;\n    }                                        // v = {1, 3}\n    std::map&lt;std::string, int&gt; m;\n    if (m[\"x\"] == 0) {}                      // 副作用：插入 \"x\"，m.size() 變 1\n}</code></pre>",
          "anchor": "h09-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>迴圈中 <code>push_back</code> 或 <code>erase</code> 後當機</td><td>iterator 失效</td><td>用回傳的 iterator、改用索引，或先收集再一次刪（erase-remove）</td></tr>\n        <tr><td>只是查 map，<code>size()</code> 卻變大</td><td><code>operator[]</code> 插入預設值</td><td>改用 <code>find</code>／<code>contains</code></td></tr>\n        <tr><td><code>unordered_map</code> 突然變很慢</td><td>雜湊函式不好，大量碰撞</td><td>換雜湊函式，事先 <code>reserve</code></td></tr>\n        <tr><td>callback 執行時讀到亂值</td><td>lambda 用參考捕捉了已經結束的區域變數</td><td>改值捕捉，或確保被捕捉的物件活得比 lambda 久</td></tr>\n        <tr><td>連結錯誤 undefined reference to 某個 template 函式</td><td>template 定義寫在 .cpp，使用處看不到</td><td>定義移到標頭檔，或在 .cpp 顯式實例化</td></tr>\n        <tr><td>自訂型別放進 <code>set</code> 後有元素「不見」</td><td>比較函式不是嚴格弱序（例如用了 <code>&lt;=</code>）</td><td>比較只用 <code>&lt;</code> 語意，相等時回 false</td></tr>\n      </tbody></table></div>",
          "anchor": "h09-l3"
        }
      ]
    },
    {
      "id": "H10",
      "anchor": "h10",
      "tag": "H10",
      "name": "Python 語言細節",
      "sub": "預設參數、複製、閉包",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>Python 的變數是<b>貼在物件上的名字</b>，不是裝值的盒子。複製只複製名字、預設參數只建立一次、閉包抓的是變數本身而不是當下的值——大部分「印出什麼」的題目都從這裡來。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>可變預設參數</td><td><code>def f(x, acc=[])</code> 的 <code>[]</code> 在 <code>def</code> 執行時建立一次，之後每次呼叫共用。慣用法是預設 <code>None</code>，在函式內再建</td></tr>\n        <tr><td>淺複製 vs 深複製</td><td><code>a[:]</code>、<code>list(a)</code>、<code>copy.copy</code> 只複製外層，內層物件共用；<code>copy.deepcopy</code> 整棵複製</td></tr>\n        <tr><td>閉包與延遲綁定</td><td>閉包記住的是外層變數，呼叫時才去查值。<code>[lambda: i for i in range(3)]</code> 每個都回傳 2</td></tr>\n        <tr><td>generator</td><td>含 <code>yield</code> 的函式，呼叫後回傳 generator，一次產生一個值，<b>只能走一遍</b>；<code>(x for x in ...)</code> 是 generator 運算式</td></tr>\n        <tr><td>iterator 協定</td><td><code>__iter__</code> 回傳自己、<code>__next__</code> 給下一個，沒了就丟 <code>StopIteration</code>；for 迴圈就是這樣跑的</td></tr>\n        <tr><td>decorator</td><td><code>@deco</code> 放在 <code>def f</code> 上，等於 <code>f = deco(f)</code>。包裝函式要加 <code>functools.wraps</code> 保留原名稱與說明</td></tr>\n        <tr><td><code>is</code> vs <code>==</code></td><td><code>is</code> 比是不是同一個物件，<code>==</code> 比值。判斷 <code>None</code> 用 <code>is</code>；小整數或字串剛好 <code>is</code> 成立是直譯器的快取細節，不能依賴</td></tr>\n      </tbody></table></div>",
          "anchor": "h10-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼預設值只算一次？</b><code>def</code> 是執行期的陳述式，執行時把預設值算好存在函式物件上，之後呼叫都拿同一個物件。</li>\n        <li><b>為什麼 <code>[[0] * 3] * 3</code> 改一格會整欄一起變？</b>外層的 <code>* 3</code> 複製的是「指向同一個內層 list 的參考」三次。要寫 <code>[[0] * 3 for _ in range(3)]</code>。</li>\n        <li><b>為什麼閉包都拿到最後的值？</b>lambda 裡的 <code>i</code> 是在呼叫時才查，那時迴圈已跑完。用預設參數 <code>lambda i=i: i</code> 在定義時把值綁住。</li>\n        <li><b>為什麼大檔案要用 generator？</b>一次只在記憶體放一筆，不必先建出整個 list。</li>\n        <li><b>tuple 不可變，為什麼裡面的 list 還能改？</b>tuple 不可變的是「放哪幾個物件」，物件本身可不可變另當別論。</li>\n      </ul>\n<p class=\"codecap\">Python：這段印出什麼</p>\n<pre><code>def add(item, bucket=[]):      # 預設 list 只建立一次\n    bucket.append(item)\n    return bucket\n\nprint(add(1))                  # [1]\nprint(add(2))                  # [1, 2]  ← 不是 [2]\n\ngrid = [[0] * 3] * 3\ngrid[0][0] = 1\nprint(grid)                    # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]\n\nfs = [lambda: i for i in range(3)]\nprint([f() for f in fs])       # [2, 2, 2]\n\ng = (x * x for x in range(3))\nprint(sum(g), sum(g))          # 5 0  ← generator 只能走一遍</code></pre>",
          "anchor": "h10-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>函式多呼叫幾次，結果越積越多</td><td>可變預設參數</td><td>預設 <code>None</code>，函式內 <code>if acc is None: acc = []</code></td></tr>\n        <tr><td>改了「副本」卻改到原資料</td><td>只做了淺複製</td><td><code>copy.deepcopy</code>，或明確重建內層</td></tr>\n        <tr><td>二維陣列改一格，整欄都變</td><td>用 <code>*</code> 複製了同一個內層 list</td><td>改用 list comprehension 建每一列</td></tr>\n        <tr><td>迴圈裡註冊的 callback 全都用到最後一個值</td><td>閉包延遲綁定</td><td>預設參數綁值，或 <code>functools.partial</code></td></tr>\n        <tr><td>第二次走訪拿不到任何資料</td><td>generator 已經耗盡</td><td>需要多次就轉成 list，或每次重新建立</td></tr>\n        <tr><td>加了 decorator 後 log 裡函式名都變成 wrapper</td><td>沒用 <code>functools.wraps</code></td><td>包裝函式加上 <code>@functools.wraps(func)</code></td></tr>\n      </tbody></table></div>",
          "anchor": "h10-l3"
        }
      ]
    },
    {
      "id": "H11",
      "anchor": "h11",
      "tag": "H11",
      "name": "C# 語言細節",
      "sub": "delegate、泛型、finally",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>delegate 是型別安全的函式參考，event 是只准外部訂閱、退訂的 delegate；<b>訂閱了就要退訂</b>，否則發佈者會一直抓著訂閱者。string 不可變、<code>finally</code> 一定跑、record 比內容——這些是 C# 題最常考的細節。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>delegate</td><td>型別安全的函式參考，可以 <code>+=</code> 串成多播；內建 <code>Action</code>（沒回傳）與 <code>Func</code>（有回傳）</td></tr>\n        <tr><td>event</td><td>包住 delegate：外部只能 <code>+=</code>、<code>-=</code>，只有宣告它的類別能觸發</td></tr>\n        <tr><td>泛型約束</td><td><code>where T : class</code>／<code>struct</code>／<code>new()</code>／某介面或基底類別；有約束才能在泛型裡用那些成員</td></tr>\n        <tr><td>例外與 finally</td><td><code>finally</code> 不管正常結束、return 或丟例外都會執行（行程被直接終止時除外）。重新丟出用 <code>throw;</code> 保留原堆疊，<code>throw ex;</code> 會重設堆疊</td></tr>\n        <tr><td>string 不可變</td><td>每次 <code>+</code> 都產生新字串；迴圈中大量串接用 <code>StringBuilder</code> 或 <code>string.Join</code></td></tr>\n        <tr><td>property</td><td><code>get</code>／<code>set</code> 存取子，外面看像欄位、裡面可以加驗證；<code>init</code> 只允許建立時設定</td></tr>\n        <tr><td>record</td><td>值相等（比內容）、可用 <code>with</code> 複製改幾個欄位，適合不可變資料</td></tr>\n        <tr><td>nullable 參考型別</td><td>C# 8 起可開啟，<code>string?</code> 表示可能是 null，編譯器據此警告；只是編譯期分析，執行時照樣可能拿到 null。<code>int?</code> 則是 <code>Nullable&lt;int&gt;</code></td></tr>\n      </tbody></table></div>",
          "anchor": "h11-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼忘了退訂 event 會洩漏記憶體？</b>發佈者的 delegate 持有訂閱者的參考。發佈者活得比較久（例如全域服務、主視窗）時，訂閱者永遠收不掉。</li>\n        <li><b>為什麼要用 <code>throw;</code>？</b><code>throw ex;</code> 把堆疊起點改成這個 catch，原本出錯的那一行就看不到了。</li>\n        <li><b>為什麼迴圈中用 <code>+</code> 串字串會變慢？</b>每次都配置新字串並複製全部內容，總成本約 O(n²)；<code>StringBuilder</code> 在同一塊緩衝區後面追加。</li>\n        <li><b>為什麼 for 迴圈裡的 lambda 都拿到最後的值，foreach 卻不會？</b>for 的迴圈變數整個迴圈只有一個；C# 5 起 foreach 每一圈是新變數。</li>\n        <li><b>為什麼兩個內容一樣的物件 <code>==</code> 是 false？</b>class 預設比參考（是不是同一個物件）；record 自動產生比內容的 <code>Equals</code> 與 <code>==</code>。</li>\n      </ul>\n<p class=\"codecap\">C#：這段印出什麼</p>\n<pre><code>var actions = new List&lt;Action&gt;();\nfor (int i = 0; i &lt; 3; i++) actions.Add(() =&gt; Console.Write(i));\nforeach (var a in actions) a();            // 333：for 的 i 只有一個\n\nvar acts2 = new List&lt;Action&gt;();\nforeach (var n in new[] { \"a\", \"b\", \"c\" }) acts2.Add(() =&gt; Console.Write(n));\nforeach (var a in acts2) a();              // abc：foreach 每圈是新變數\n\nConsole.WriteLine(new Point(1, 2) == new Point(1, 2));   // True：record 比內容\nConsole.WriteLine(F());                    // 先印 F，再印 1\n\nstatic int F() { try { return 1; } finally { Console.Write(\"F\"); } }\nrecord Point(int X, int Y);</code></pre>",
          "anchor": "h11-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>子視窗關掉後記憶體不降</td><td>子視窗訂閱了長壽物件的 event 沒退訂</td><td>在 <code>FormClosed</code>／<code>Dispose</code> 中 <code>-=</code>；或改用弱事件</td></tr>\n        <tr><td>log 裡的例外堆疊只到 catch 那一層</td><td>用了 <code>throw ex;</code></td><td>改成 <code>throw;</code>，或包成新例外並把原例外放進 InnerException</td></tr>\n        <tr><td>組大量文字的報表很慢</td><td>迴圈中用 <code>+</code> 串接 string</td><td>改用 <code>StringBuilder</code> 或 <code>string.Join</code></td></tr>\n        <tr><td>迴圈中建立的 callback 都用到最後一個值</td><td>for 迴圈變數被閉包共用</td><td>迴圈內先複製一份 <code>var k = i;</code> 再捕捉</td></tr>\n        <tr><td>開了 nullable 警告還是 NullReferenceException</td><td>外部輸入、反序列化、<code>!</code> 運算子繞過了編譯期分析</td><td>在系統邊界檢查 null，不濫用 <code>!</code></td></tr>\n      </tbody></table></div>",
          "anchor": "h11-l3"
        }
      ]
    },
    {
      "id": "H12",
      "anchor": "h12",
      "tag": "H12",
      "name": "通用程式觀念",
      "sub": "傳值、浮點、優先序",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>跨語言都會考的四件事：參數到底是<b>傳值還是傳參考</b>、浮點數<b>不能直接比相等</b>、整數有<b>寬度和溢位</b>、運算子有<b>優先序和短路</b>。看懂這四件，大部分「印出什麼」的題目就能推得出來。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>傳值 vs 傳參考</td><td>傳值：函式拿到一份複本；傳參考：函式能改到呼叫端的變數（C++ <code>&amp;</code>、C# <code>ref</code>／<code>out</code>）。Python、Java、C# 的參考型別是「傳物件參考的值」：改物件內容會反映回去，重新指定參數則不會</td></tr>\n        <tr><td>作用域 vs 生命週期</td><td>作用域：名字在哪些程式碼看得到（編譯期）；生命週期：物件存在多久（執行期）。函式內的 static 變數作用域小、生命週期整個程式</td></tr>\n        <tr><td>浮點數精度</td><td>IEEE 754 二進位浮點數無法精確表示 0.1，所以 <code>0.1 + 0.2 == 0.3</code> 為假；比較要用誤差容許。<code>NaN</code> 不等於任何值，連自己都不等</td></tr>\n        <tr><td>整數表示與溢位</td><td>有號整數用二補數，n 位元範圍是 −2<sup>n−1</sup>～2<sup>n−1</sup>−1（32 位元約 ±21 億）。C／C++ 無號溢位是取模、有號溢位是 UB；C# 預設不檢查（繞回），<code>checked</code> 才丟例外；Python 整數沒有上限</td></tr>\n        <tr><td>短路求值</td><td><code>&amp;&amp;</code>、<code>||</code>（Python 的 <code>and</code>、<code>or</code>）左邊已能決定結果時，右邊不會執行</td></tr>\n        <tr><td>運算子優先序</td><td>C 系語言中比較運算 <code>==</code> 比位元運算 <code>&amp;</code>、<code>|</code> 優先，<code>x &amp; 1 == 0</code> 等於 <code>x &amp; (1 == 0)</code></td></tr>\n        <tr><td>編譯／直譯／JIT</td><td>C／C++ 事先編譯成機器碼；CPython 編譯成 bytecode 再直譯執行；.NET、Java 執行時才由 JIT 編成機器碼</td></tr>\n      </tbody></table></div>",
          "anchor": "h12-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 0.1 + 0.2 不等於 0.3？</b>1/10 在二進位是無限循環小數，只能存最接近的值；兩個近似值相加的誤差剛好讓結果和 0.3 的近似值差一點。</li>\n        <li><b>為什麼金額不能用 double？</b>累加誤差會讓總和差幾分錢。用整數存「分」，或用十進位型別（C# <code>decimal</code>、Python <code>Decimal</code>）。</li>\n        <li><b>為什麼 Python 函式裡 <code>a.append()</code> 改得到外面，<code>a = [...]</code> 卻改不到？</b>append 是改那個共用的物件；<code>=</code> 只是讓區域名稱 <code>a</code> 改貼到新物件上。</li>\n        <li><b>為什麼 <code>p != NULL &amp;&amp; p-&gt;ok</code> 的順序不能反過來？</b>短路求值保證先確認不是 null 才解參考；反過來會先解參考空指標。</li>\n        <li><b>為什麼 .NET 程式第一次執行某個功能特別慢？</b>那段程式第一次被呼叫時才被 JIT 編譯，之後就是機器碼。</li>\n      </ul>\n<p class=\"codecap\">Python 與 C：這兩段印出什麼</p>\n<pre><code>def f(a):\n    a.append(4)        # 改到呼叫端的同一個 list\n    a = [0]            # 只是讓區域名稱 a 貼到新 list，不影響呼叫端\n\nx = [1, 2, 3]\nf(x)\nprint(x)                              # [1, 2, 3, 4]\nprint(0.1 + 0.2 == 0.3)               # False\nprint(abs(0.1 + 0.2 - 0.3) &lt; 1e-9)    # True</code></pre>\n<pre><code>int x = 4;\nif (x &amp; 1 == 0) puts(\"even\");        /* 不會印：先算 1 == 0，變成 x &amp; 0 */\nif ((x &amp; 1) == 0) puts(\"even\");      /* 印 even */</code></pre>",
          "anchor": "h12-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>金額加總差了幾分錢</td><td>用浮點數累加</td><td>以整數「分」計算，或用十進位型別</td></tr>\n        <tr><td><code>for (x = 0; x != 1.0; x += 0.1)</code> 停不下來</td><td>浮點累加永遠不會剛好等於 1.0</td><td>用整數計數再換算，或用 <code>&lt;</code> 判斷</td></tr>\n        <tr><td>判斷奇偶永遠失敗</td><td>優先序：<code>x &amp; 1 == 0</code></td><td>位元運算一律加括號</td></tr>\n        <tr><td><code>if (p-&gt;ok &amp;&amp; p != NULL)</code> 偶爾當機</td><td>條件順序寫反，先解參考了 null</td><td>先檢查 null，再取成員</td></tr>\n        <tr><td>兩個 int 相乘結果變成負數</td><td>32 位元有號溢位</td><td>先轉 64 位元再乘：<code>(long long)a * b</code></td></tr>\n        <tr><td>.NET 工具第一次按某功能卡一下</td><td>JIT 與冷啟動</td><td>啟動時預先呼叫一次，或用 ReadyToRun 預先編譯</td></tr>\n      </tbody></table></div>",
          "anchor": "h12-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>指標 vs 參考（C++）</td><td>指標可為 null、可改指、要 <code>*</code> 取值；參考一定綁定、不能改綁、用起來像原變數（H01）</td></tr>\n      <tr><td>UB vs implementation-defined</td><td>前者沒有任何保證、編譯器可隨意最佳化；後者每家可以不同但要寫在文件裡、行為是確定的（H01）</td></tr>\n      <tr><td>volatile vs atomic</td><td>volatile：每次真的去讀（硬體暫存器）；atomic：多執行緒下不可分割且有記憶體順序保證。volatile 不能拿來做執行緒同步（H01）</td></tr>\n      <tr><td>Dispose vs Finalizer</td><td>Dispose：你主動、立刻、確定釋放；Finalizer：GC 決定何時、時間不確定、是忘了 Dispose 時的保險（H02）</td></tr>\n      <tr><td>async／await vs 多執行緒</td><td>await 等 I/O 時不佔任何執行緒，也不會自己開新執行緒；要把 CPU 運算移出 UI 執行緒得 <code>Task.Run</code>（H02）</td></tr>\n      <tr><td><code>.Result</code> vs <code>await</code></td><td><code>.Result</code> 讓目前執行緒坐著等（UI 上會卡或死結）；<code>await</code> 讓出執行緒、完成後再回來（H02）</td></tr>\n      <tr><td>LINQ 延遲 vs 立即執行</td><td><code>Where</code>／<code>Select</code>／<code>OrderBy</code> 只是定義，列舉時才跑、每次列舉重跑；<code>ToList</code>／<code>Count</code>／<code>First</code> 當場執行（H02）</td></tr>\n      <tr><td>threading vs multiprocessing（Python）</td><td>threading 共用一個 GIL，適合等 I/O；multiprocessing 每個行程各有 GIL，適合 CPU 運算，但資料要序列化傳遞（H03）</td></tr>\n      <tr><td>介面 vs 抽象類別</td><td>介面：能力契約、可多個、不能有實例欄位；抽象類別：可帶狀態和部分實作、只能繼承一個（H04）</td></tr>\n      <tr><td>Hash vs 平衡樹</td><td>hash 平均 O(1) 但沒順序；樹 O(log n) 但保持排序、能查範圍（H05）</td></tr>\n      <tr><td>O(log n) vs O(n log n)</td><td>前者是「找一筆」（二分搜尋）；後者是「排好全部」（排序）。二分搜尋的前提是已經付過排序的成本（H06）</td></tr>\n      <tr><td>穩定 vs 不穩定排序</td><td>相同 key 是否維持原順序。<code>OrderBy</code>、Python <code>sorted</code> 穩定；<code>List.Sort</code>、<code>std::sort</code> 不穩定（H06）</td></tr>\n      <tr><td><code>sizeof(arr)</code> vs <code>sizeof(p)</code></td><td>在定義陣列那一層是整個陣列大小；傳進函式後是指標大小（H07）</td></tr>\n      <tr><td>巨集 vs inline 函式</td><td>巨集是文字替換、參數可能重複求值、不檢查型別；inline 函式是真的函式，參數只算一次（H07）</td></tr>\n      <tr><td>覆寫（override）vs 隱藏（hiding）</td><td>簽章完全相同的 virtual 才是覆寫；名稱相同但簽章不同會隱藏基底版本，多型不生效（H08）</td></tr>\n      <tr><td><code>std::move</code> vs 真的搬移</td><td><code>std::move</code> 只是轉成右值；真正搬資源的是被呼叫到的 move 建構子或 move 指定（H08）</td></tr>\n      <tr><td><code>map[key]</code> vs <code>map.find(key)</code></td><td>前者找不到會插入預設值；後者只查不改（H09）</td></tr>\n      <tr><td><code>is</code> vs <code>==</code>（Python）</td><td><code>is</code> 比是不是同一個物件；<code>==</code> 比值（H10）</td></tr>\n      <tr><td>淺複製 vs 深複製</td><td>淺複製只複製外層，內層物件共用；深複製整棵複製（H10）</td></tr>\n      <tr><td><code>throw;</code> vs <code>throw ex;</code></td><td>前者保留原堆疊；後者把堆疊起點改成目前的 catch（H11）</td></tr>\n      <tr><td>class vs record 的相等</td><td>class 預設比參考；record 比內容（H11）</td></tr>\n      <tr><td>作用域 vs 生命週期</td><td>作用域是名字在哪看得到；生命週期是物件活多久（H12）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Dangling pointer</td><td>懸空指標</td><td>The pointer was left dangling after the vector reallocated.</td></tr>\n      <tr><td>Undefined behavior</td><td>未定義行為</td><td>Signed integer overflow is undefined behavior.</td></tr>\n      <tr><td>Memory leak</td><td>記憶體洩漏</td><td>A missing delete on the error path causes a memory leak.</td></tr>\n      <tr><td>Garbage collection</td><td>垃圾回收</td><td>A Gen 2 collection pauses the UI briefly.</td></tr>\n      <tr><td>Boxing</td><td>裝箱</td><td>Adding an int to an ArrayList causes boxing.</td></tr>\n      <tr><td>Deadlock</td><td>死結</td><td>Calling .Result on the UI thread can deadlock.</td></tr>\n      <tr><td>Deferred execution</td><td>延遲執行</td><td>The LINQ query uses deferred execution.</td></tr>\n      <tr><td>Virtual environment</td><td>虛擬環境</td><td>Create a virtual environment for each project.</td></tr>\n      <tr><td>Global Interpreter Lock</td><td>全域直譯器鎖</td><td>The GIL prevents threads from running Python bytecode in parallel.</td></tr>\n      <tr><td>Composition over inheritance</td><td>組合優於繼承</td><td>We favor composition over inheritance for device drivers.</td></tr>\n      <tr><td>Dependency injection</td><td>依賴注入</td><td>Inject the serial link so the parser can be unit tested.</td></tr>\n      <tr><td>Time complexity</td><td>時間複雜度</td><td>Binary search has O(log n) time complexity.</td></tr>\n      <tr><td>Amortized</td><td>均攤</td><td>Appending to a List is amortized O(1).</td></tr>\n      <tr><td>Stable sort</td><td>穩定排序</td><td>OrderBy performs a stable sort.</td></tr>\n      <tr><td>Stack overflow</td><td>堆疊溢位</td><td>Deep recursion caused a stack overflow.</td></tr>\n      <tr><td>Hash collision</td><td>雜湊碰撞</td><td>Too many hash collisions degrade lookups to O(n).</td></tr>\n      <tr><td>Array decay</td><td>陣列退化</td><td>The array decays to a pointer when passed to the function.</td></tr>\n      <tr><td>Padding</td><td>填充位元組</td><td>The compiler inserts padding to align the int field.</td></tr>\n      <tr><td>Object slicing</td><td>物件切割</td><td>Storing Derived in a vector of Base causes object slicing.</td></tr>\n      <tr><td>Iterator invalidation</td><td>iterator 失效</td><td>push_back may cause iterator invalidation.</td></tr>\n      <tr><td>Late binding</td><td>延遲綁定</td><td>Closures in Python use late binding for loop variables.</td></tr>\n      <tr><td>Shallow copy</td><td>淺複製</td><td>A shallow copy shares the nested lists.</td></tr>\n      <tr><td>Short-circuit evaluation</td><td>短路求值</td><td>Short-circuit evaluation skips the null dereference.</td></tr>\n      <tr><td>Operator precedence</td><td>運算子優先序</td><td>Add parentheses; == has higher precedence than &amp;.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>H01</b>　https://en.cppreference.com/w/cpp/language/ub （UB 範例、implementation-defined／unspecified）；https://cppreference.com/cpp/container/vector/push_back （重新配置讓 iterator 失效）</li>\n      <li><b>H02</b>　https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals （世代、LOH 85,000 bytes、LOH 壓縮）；https://devblogs.microsoft.com/dotnet/configureawait-faq/ （死結機制、函式庫 vs 應用程式）；https://blog.stephencleary.com/2023/11/configureawait-in-net-8.html （ConfigureAwaitOptions）；https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose （Dispose 模式、SafeHandle）；https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries （延遲／立即執行）；https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing ；https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct （struct 16 bytes 準則）；https://learn.microsoft.com/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming （async void）；https://learn.microsoft.com/en-us/dotnet/desktop/winforms/controls/how-to-make-thread-safe-calls （跨執行緒呼叫）</li>\n      <li><b>H03</b>　https://docs.python.org/3/howto/free-threading-python.html （3.13 實驗性 free-threaded、單執行緒額外成本約 1%～8%）；https://peps.python.org/pep-0779/ （3.14 起正式支援）；https://pythonspeed.com/articles/externally-managed-environment-pep-668 （PEP 668）；https://note.nkmk.me/en/python-sys-recursionlimit/ （遞迴上限預設 1000）</li>\n      <li><b>H05</b>　https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.add （Add 的 O(1)／O(n)）；https://andrewlock.net/behind-the-implementation-of-dotnets-priorityqueue （四元 min-heap）</li>\n      <li><b>H06</b>　https://learn.microsoft.com/en-us/dotnet/api/system.array.sort （introsort、16 筆門檻、不穩定）；https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.orderby （OrderBy 穩定）；https://www.i-programmer.info/news/216-python/15954-python-now-uses-powersort.html （Python 3.11 Powersort 合併策略）；https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/ （二分搜尋中點溢位）；https://learn.microsoft.com/en-us/dotnet/api/system.stackoverflowexception （無法攔截）</li>\n      <li><b>H07～H12</b>（2026-10-15 補）　https://en.cppreference.com/w/c/language/conversion （整數提升、一般算術轉換）；https://en.cppreference.com/w/cpp/language/virtual （virtual、override、建構期間的 virtual 呼叫）；https://en.cppreference.com/w/cpp/language/copy_elision ；https://en.cppreference.com/w/cpp/container （容器與 iterator 失效規則）；https://docs.python.org/3/reference/compound_stmts.html#function-definitions （預設值在定義時求值）；https://docs.python.org/3/faq/programming.html （閉包延遲綁定、可變預設值）；https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record ；https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements ；https://docs.python.org/3/tutorial/floatingpoint.html 。<span class=\"muted\">H10、H11、H12 的 Python 與 C# 範例已實機執行（Python 3、.NET），輸出與註解一致；H07～H09 與 H12 的 C／C++ 範例因本機沒有 C 編譯器未實跑，依上列文件撰寫；struct 大小、指標大小以常見 64 位元平台為例</span></li>\n      <li class=\"muted\">查證日 2026-10-02。未逐一查證、依通用知識撰寫：主圖「每秒約 1 億次簡單操作」只是數量級粗估；動態陣列「約兩倍」擴容是實作細節；32-bit 毫秒計數約 24.8 天溢位為計算值；Python 預設遞迴上限依環境可能不同；H04 SOLID 內容依通論撰寫、未附一手出處。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-H pre { background: var(--soft); border-radius: 6px; padding: 12px 14px; overflow-x: auto; font-size: 13px; line-height: 1.55; margin: 12px 0; max-width: 100%; }\n.kb-H pre code { background: none; padding: 0; font-size: 13px; }\n.kb-H .codecap { font-size: 12px; color: var(--muted); margin: 14px 0 -6px; font-family: var(--mono); }\n.kb-H #bigTbl td.num { font-family: var(--mono); }\n"
}
