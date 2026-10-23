// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "J",
  "file": "J-swe.html",
  "title": "軟體工程與工具鏈：讓程式碼改得動、查得到、發得出去",
  "lead": "這一類的題目其實都在問同一件事：<b>下一次要改的時候，代價有多大？</b>模組切得好，改一處不會牽動十處；有測試，改了敢上；有版本控制與 CI，出事能找回是哪一次改壞、能退回上一版；有 log 與 profiler，慢和壞都量得到。所有取捨，最後都是在「現在多花一點」和「以後少痛一點」之間選。",
  "note": "<p class=\"muted small\">對應 taxonomy J01～J07。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "gitgraph",
      "title": "主圖：同一組 commit，merge／rebase／cherry-pick／squash 各變成什麼樣",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">起點都一樣：feature 從 B 分出去做了 D、E、F，同時 main 又多了 C。切換上面的指令，再一步一步看 commit graph 與 terminal 的變化。圓圈裡是 commit，方框是分支指標；粗框灰底是新產生的 commit，虛線是「已經沒有分支指著」的舊 commit。</p>"
        },
        {
          "t": "widget",
          "id": "J.gitgraph",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"gmode\">\n        <button data-m=\"merge\" class=\"on\">merge</button>\n        <button data-m=\"rebase\">rebase</button>\n        <button data-m=\"cherry\">cherry-pick</button>\n        <button data-m=\"squash\">squash merge</button>\n      </div>\n    </div>\n<div class=\"stage\">\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"gsvg\" viewBox=\"0 0 900 260\" role=\"img\" aria-label=\"Git commit graph\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"controls\" style=\"margin:12px 0 0\">\n        <button class=\"btn\" id=\"gprev\">← 上一步</button>\n        <button class=\"btn primary\" id=\"gnext\">下一步 →</button>\n        <span class=\"muted small\" id=\"gphase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"gTitle\"></h3>\n        <p id=\"gDesc\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "一張表看懂",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>考點</th><th>核心問題</th><th>一句判準</th><th>最常見的誤解</th></tr>\n      <tr><td>J01 架構與模組</td><td>改一處要動幾處？</td><td>介面窄、背後藏得多（深模組）；依賴只往一個方向</td><td>拆越多小類別越好</td></tr>\n      <tr><td>J02 Design Pattern</td><td>這層抽象藏住了什麼變化？</td><td>先有重複或已知變化，才套 pattern</td><td>多用 pattern＝設計好</td></tr>\n      <tr><td>J03 測試</td><td>改完敢不敢上？</td><td>大量快的 unit、少量慢的 E2E；驗證結果而不是呼叫細節</td><td>覆蓋率高＝品質好</td></tr>\n      <tr><td>J04 Git</td><td>這次要搬什麼、改不改寫歷史？</td><td>共享的分支用 merge／revert；只有自己的分支才 rebase</td><td>cherry-pick、merge、stash 是同一件事的不同寫法</td></tr>\n      <tr><td>J05 CI／CD</td><td>測過的跟發出去的是不是同一份？</td><td>乾淨環境自動 build＋test；build 一次、往下推同一份產物</td><td>CI 就是「有一台會自動編譯的機器」</td></tr>\n      <tr><td>J06 Debug 與效能</td><td>時間與記憶體花在哪？</td><td>先量測再改；log 要能回答「當時輸入是什麼、做了什麼決定」</td><td>憑感覺優化最慢的那段</td></tr>\n      <tr><td>J07 需求與取捨</td><td>要解決的到底是什麼問題？</td><td>先對齊驗收條件；可逆的決定快做，不可逆的慢做</td><td>客戶講的功能就是需求</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "J01",
      "anchor": "j01",
      "tag": "J01",
      "name": "軟體架構與模組拆分",
      "sub": "耦合、內聚、深模組",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>好的模組是「<b>介面簡單、背後做很多事</b>」的深模組；模組內部的東西都為同一件事服務（高內聚），模組之間知道彼此越少越好（低耦合）。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 200\" role=\"img\" aria-label=\"深模組與淺模組\" style=\"min-width:640px\">\n          <text x=\"10\" y=\"20\" class=\"t-strong\">上緣寬度＝介面要學的東西；面積＝背後提供的功能</text>\n          <rect class=\"bx-soft\" x=\"80\" y=\"50\" width=\"140\" height=\"110\"></rect>\n          <line class=\"ln-accent\" x1=\"80\" y1=\"50\" x2=\"220\" y2=\"50\" stroke-width=\"4\"></line>\n          <text x=\"150\" y=\"105\" text-anchor=\"middle\" class=\"t-small\">藏住格式、緩衝、</text>\n          <text x=\"150\" y=\"123\" text-anchor=\"middle\" class=\"t-small\">錯誤處理、編碼</text>\n          <text x=\"80\" y=\"40\" class=\"t-accent\">深模組</text>\n          <text x=\"80\" y=\"182\" class=\"t-small\">例：File.ReadAllText(path)</text>\n          <rect class=\"bx-soft\" x=\"400\" y=\"50\" width=\"420\" height=\"28\"></rect>\n          <line class=\"ln-accent\" x1=\"400\" y1=\"50\" x2=\"820\" y2=\"50\" stroke-width=\"4\"></line>\n          <text x=\"400\" y=\"40\" class=\"t-accent\">淺模組</text>\n          <text x=\"400\" y=\"104\" class=\"t-small\">介面跟實作差不多複雜：呼叫的人要知道的，跟自己寫差不多</text>\n          <text x=\"400\" y=\"124\" class=\"t-small\">例：Controller → Service → Manager，每層只把參數原封不動轉給下一層</text>\n          <text x=\"400\" y=\"144\" class=\"t-small\">例：開檔要自己串三個 stream 類別才讀得到資料</text>\n        </svg>\n      </div>\n      <figcaption>Ousterhout 在 A Philosophy of Software Design 的畫法。Unix 檔案 I/O 只有 open／read／write／lseek／close 五個呼叫，卻藏住整個檔案系統，是深模組的經典例子。</figcaption>\n    </figure>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 190\" role=\"img\" aria-label=\"WinForms Thin Form 分層\" style=\"min-width:640px\">\n          <defs><marker id=\"ahA\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"arrow-head\"></path></marker></defs>\n          <text x=\"10\" y=\"20\" class=\"t-strong\">WinForms 工具的分層（Thin Form）：依賴只往右</text>\n          <rect class=\"bx\" x=\"10\" y=\"40\" width=\"190\" height=\"62\" rx=\"6\"></rect><text x=\"22\" y=\"64\" class=\"t-strong\">Form（UI）</text><text x=\"22\" y=\"86\" class=\"t-small\">顯示、收事件、轉呼叫</text>\n          <rect class=\"bx\" x=\"240\" y=\"40\" width=\"190\" height=\"62\" rx=\"6\"></rect><text x=\"252\" y=\"64\" class=\"t-strong\">流程／Service</text><text x=\"252\" y=\"86\" class=\"t-small\">串步驟、async、取消</text>\n          <rect class=\"bx-accent\" x=\"470\" y=\"40\" width=\"190\" height=\"62\" rx=\"6\"></rect><text x=\"482\" y=\"64\" class=\"t-strong\">核心邏輯</text><text x=\"482\" y=\"86\" class=\"t-small\">純 C#，輸入→輸出</text>\n          <rect class=\"bx\" x=\"700\" y=\"40\" width=\"190\" height=\"62\" rx=\"6\"></rect><text x=\"712\" y=\"64\" class=\"t-strong\">外部 I/O</text><text x=\"712\" y=\"86\" class=\"t-small\">檔案、Excel、AI、硬體</text>\n          <line class=\"arrow\" x1=\"202\" y1=\"71\" x2=\"238\" y2=\"71\" marker-end=\"url(#ahA)\"></line>\n          <line class=\"arrow\" x1=\"432\" y1=\"71\" x2=\"468\" y2=\"71\" marker-end=\"url(#ahA)\"></line>\n          <line class=\"arrow\" x1=\"662\" y1=\"71\" x2=\"698\" y2=\"71\" marker-end=\"url(#ahA)\"></line>\n          <rect class=\"bx dash\" x=\"240\" y=\"128\" width=\"190\" height=\"40\" rx=\"6\"></rect><text x=\"252\" y=\"153\" class=\"t-small\">IOutputSink（介面）</text>\n          <line class=\"ln dash\" x1=\"240\" y1=\"148\" x2=\"105\" y2=\"148\"></line><line class=\"ln dash\" x1=\"105\" y1=\"148\" x2=\"105\" y2=\"104\"></line>\n          <text x=\"116\" y=\"140\" class=\"t-small\">Form 實作它</text>\n          <text x=\"470\" y=\"130\" class=\"t-small\">核心邏輯不 reference WinForms，</text>\n          <text x=\"470\" y=\"150\" class=\"t-small\">可以直接寫 unit test、給 CLI／批次重用</text>\n        </svg>\n      </div>\n      <figcaption>Service 要回報進度或輸出文字時，只認識 IOutputSink 這個小介面，不知道 Form 的存在。測試時換一個把文字收進 List 的假實作即可。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>模組（module）</td><td>任何「有介面、有實作」的單元：方法、class、namespace、DLL、服務都算</td></tr>\n        <tr><td>耦合（coupling）</td><td>模組之間互相依賴的程度。判斷法：改 A 的時候，B 要不要跟著改？</td></tr>\n        <tr><td>內聚（cohesion）</td><td>模組裡的東西是不是都為同一件事服務。「Utils」「Helper」常常是低內聚的雜物抽屜</td></tr>\n        <tr><td>分層（layering）</td><td>UI → 流程 → 核心邏輯 → 基礎設施，上層呼叫下層，下層不知道上層存在</td></tr>\n        <tr><td>介面邊界／seam</td><td>模組對外承諾的部分。seam（接縫）是「不改呼叫端就能換掉實作」的位置，測試時在這裡塞假的</td></tr>\n        <tr><td>深模組（deep module）</td><td>John Ousterhout 的說法：介面簡單、背後功能多。<b>介面簡單比實作簡單更重要</b></td></tr>\n        <tr><td>淺模組（shallow module）</td><td>介面跟它提供的功能差不多複雜，呼叫的人省不了多少力氣，反而多學一層</td></tr>\n        <tr><td>資訊隱藏（information hiding）</td><td>把可能會變的設計決定（檔案格式、演算法、暫存方式）藏在模組內，外面看不到就不會被牽動</td></tr>\n        <tr><td>依賴反轉（DIP）／依賴注入（DI）</td><td>高層邏輯依賴介面而不是具體類別；具體實作從建構子傳進來（注入），而不是自己 <code>new</code></td></tr>\n        <tr><td>擴充性（extensibility）</td><td>加新功能時，盡量是「新增一個類別或一筆設定」，而不是改動既有程式碼（開放封閉原則 OCP）</td></tr>\n        <tr><td>Thin Form</td><td>WinForms 的 Form 只做顯示與事件轉接，邏輯放在不依賴 UI 的類別（見上圖）</td></tr>\n      </tbody></table></div>",
          "anchor": "j01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼要「高內聚、低耦合」？</b>它決定一個改動的「爆炸半徑」。高內聚：要改的東西集中在一處；低耦合：改完不會連帶影響別人。兩者合起來，改一個功能只需要讀懂一個模組。</li>\n        <li><b>為什麼深模組比較好？</b>系統的複雜度主要來自「每個人要記住多少介面細節」。深模組把大量細節藏起來，使用者只要學幾個方法；而且改實作不影響呼叫端，變化被關在模組裡。</li>\n        <li><b>為什麼「拆很多小類別」不一定比較好？</b>每多一個類別就多一個介面要學。如果拆到每個類別都只是轉手（淺模組），總複雜度反而上升。拆分的目的是「藏住某個決定」，不是讓每個檔案變短。</li>\n        <li><b>為什麼 WinForms 要做 Thin Form？</b>寫在 button click 裡的邏輯，必須開視窗、按按鈕才跑得到，沒辦法 unit test，也不能給批次或命令列重用。抽到純 C# 類別後，Form 變成薄薄一層，幾乎不需要測（這種做法也叫 humble object）。</li>\n        <li><b>介面邊界該切在哪？</b>切在「會變的地方」和「外部 I/O」：檔案格式、Excel 套件、AI Gateway、硬體連線。這些包在小介面後面，換掉或測試時都不必動核心邏輯。反過來，只有一個實作、也看不出會變的東西，不需要為了「好看」硬抽介面（見 J02）。</li>\n        <li><b>擴充性要做到什麼程度？</b>只對「已經知道會變」的軸預留擴充點，例如工具每季都要支援新的 IC 型號，那就把型號差異收成一張設定表或一個 Strategy；其他地方先寫最簡單的版本。</li>\n      </ul>",
          "anchor": "j01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>改一個欄位名稱，要動十幾個檔案</td><td>耦合太高：資料結構直接外露，各處自己解析、自己存取</td><td>把這份資料的讀寫收進一個模組，對外只提供需要的操作；外面不再碰原始欄位</td></tr>\n        <tr><td>Form1.cs 好幾千行，所有事都寫在事件裡</td><td>沒有分層，UI 與邏輯混在一起</td><td>先抽出純邏輯類別（輸入→輸出）讓 Form 呼叫，再把檔案、硬體等 I/O 包成介面；一次抽一塊，每塊抽完都能編譯、能跑</td></tr>\n        <tr><td>一個功能要經過四、五層，每層只是轉呼叫</td><td>淺模組、過度分層</td><td>合併只轉手的層；留下來的每一層都要說得出「它藏住了什麼決定」</td></tr>\n        <tr><td>想寫 unit test，卻得先開視窗、接硬體、連網路</td><td>邏輯內部直接 <code>new</code> 出依賴（檔案、序列埠、HttpClient）</td><td>依賴改從建構子注入；外部 I/O 抽成小介面，測試時換成假實作</td></tr>\n        <tr><td>同一段解析邏輯在三個工具各抄一份，修 bug 要改三次</td><td>缺少共用模組</td><td>抽成共用 library（例如 git submodule），先把介面穩定下來再讓各工具引用</td></tr>\n        <tr><td>改了共用 library（submodule）一個 public 方法的參數，另一個工具更新後就編譯失敗</td><td>把公開介面當成內部實作隨手改，沒有向下相容</td><td>公開介面視為契約：新增方法或 overload，舊的先保留並標 <code>[Obsolete]</code>，過渡期後再移除；不相容的改動升版號、寫進 release note 並通知使用的工具</td></tr>\n        <tr><td>為了「以後可能需要」先做了 plugin 架構，結果只有一個 plugin</td><td>猜錯了會變化的方向，預先擴充</td><td>等第二、第三個真實需求出現，看清楚差異在哪，再抽共同介面</td></tr>\n      </tbody></table></div>",
          "anchor": "j01-l3"
        }
      ]
    },
    {
      "id": "J02",
      "anchor": "j02",
      "tag": "J02",
      "name": "Design Pattern",
      "sub": "用對地方與過度設計",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>Design pattern 是「某一類問題的常見解法」加上「它的代價」。用對了，是大家一看就懂的共同詞彙；在還沒有那個問題時套上去，就是過度設計。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>樣式</th><th>解決什麼</th><th>在 C#／WinForms 裡常長這樣</th></tr>\n        <tr><td>Strategy</td><td>同一件事有幾種做法，要能替換</td><td>不同 IC 型號的檢查規則各寫一個類別，實作同一個介面</td></tr>\n        <tr><td>Factory</td><td>把「該建哪一個具體類別」的判斷集中一處</td><td>依檔案副檔名回傳對應的 parser</td></tr>\n        <tr><td>Observer</td><td>一件事發生時通知多個關心的人，發送端不必認識接收端</td><td>C# 的 <code>event</code>、WinForms 的 Click 事件本身就是</td></tr>\n        <tr><td>Adapter</td><td>把別人的介面轉成自己要的介面</td><td>把第三方 Excel 套件包成自己的 <code>IExcelReader</code></td></tr>\n        <tr><td>Decorator</td><td>不改原類別，一層層加功能</td><td>在原本的 reader 外面加一層「加上 log」或「加上快取」</td></tr>\n        <tr><td>Command</td><td>把一個動作包成物件，可以排隊、重做、復原</td><td>編輯器的 Undo／Redo</td></tr>\n        <tr><td>Template Method</td><td>流程骨架固定，個別步驟由子類別填</td><td>基底類別定義「讀檔→解析→輸出」，子類別只覆寫解析</td></tr>\n        <tr><td>Singleton</td><td>整個程式只有一個實例</td><td>全域設定物件。常被濫用（見 L2）</td></tr>\n        <tr><td>MVP／MVVM</td><td>UI 架構樣式：把畫面與邏輯分開</td><td>WinForms 多用 MVP 或 Thin Form；MVVM 靠資料繫結，WPF 較常見</td></tr>\n        <tr><td>反模式（anti-pattern）</td><td>看起來合理、實際上會出問題的常見做法</td><td>God object（一個類別什麼都管）、到處都是 static 狀態</td></tr>\n        <tr><td>YAGNI</td><td>You Aren't Gonna Need It：預想的功能現在不要做</td><td>來自 Extreme Programming 的 Simple Design</td></tr>\n      </tbody></table></div>",
          "anchor": "j02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>pattern 到底帶來什麼好處？</b>兩件事：一是共同詞彙，說「這裡用 Strategy」，同事馬上知道結構；二是已知的取捨，前人已經踩過這個解法的坑。它不是品質指標，是溝通工具。</li>\n        <li><b>為什麼 Singleton 常被嫌？</b>它本質上是全域變數：任何地方都能偷偷用它，依賴關係從建構子上看不出來；狀態會在測試之間殘留，單獨跑會過、一起跑會掛。多數情況改成「建一個實例，從建構子傳進去」就好。</li>\n        <li><b>if／switch 什麼時候該換成 Strategy？</b>分支只有兩三個、而且不會再增加，if 最清楚。當分支會持續增加、同一組判斷散在好幾個地方、或需要在測試中替換行為時，才值得換。很多時候一張「資料表」（型號→參數）比類別階層更簡單。</li>\n        <li><b>event（Observer）的代價是什麼？</b>流程不再是一條直線，看程式碼很難追「誰會被叫到」；而且訂閱者被發送者抓住，<b>短命物件訂閱了長壽物件的事件卻沒取消，就會記憶體洩漏</b>（例如 Form 訂閱一個 static 的 Service 事件）。</li>\n        <li><b>為什麼過度設計有害？</b>Martin Fowler 整理 YAGNI 的四種成本：<b>建造成本</b>（做了沒用的東西）、<b>延遲成本</b>（真正要的功能晚上線）、<b>攜帶成本</b>（多出的複雜度讓之後每次修改都變慢）、<b>修正成本</b>（真的需要時，當初猜的設計往往不合用，還要重做）。</li>\n        <li><b>那什麼時候該預先抽象？</b>當改變的代價很高、而且很難事後補的時候：公開給別人用的介面、檔案格式、跨工具共用的 library。內部實作則等需求真的出現再重構，有測試保護時重構很便宜。</li>\n      </ul>",
          "anchor": "j02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>每個類別都配一個 <code>I</code> 開頭的介面，而且都只有一個實作</td><td>為了「好擴充、好測試」一律抽介面</td><td>只在需要替換的 seam（外部 I/O、測試要換假的）保留介面，其餘直接用類別</td></tr>\n        <tr><td>改一個小功能要追六個檔案：Factory 產生 Builder，Builder 再產生 Strategy</td><td>為了用 pattern 而用，而不是為了解決問題</td><td>每一層都問「它藏住了什麼變化？」答不出來就攤平</td></tr>\n        <tr><td>單元測試單獨跑會過，整批一起跑就失敗</td><td>Singleton 或 static 狀態在測試之間殘留</td><td>改成注入實例；暫時改不掉就在每個測試前重設狀態</td></tr>\n        <tr><td>Form 關掉後記憶體不降，開關幾次後越來越多</td><td>Form 訂閱了長壽物件的事件卻沒取消，被抓住無法回收</td><td>在 FormClosed 或 Dispose 時 <code>-=</code> 取消訂閱；或讓事件來源跟 Form 同生命週期</td></tr>\n        <tr><td>一大串 switch 判斷 IC 型號，每加一款要改五處</td><td>型號差異散落在各處</td><td>先試資料驅動：一張型號參數表就能解決的，不必上類別階層；行為真的不同才用 Strategy</td></tr>\n        <tr><td>新同事看不懂「為什麼要有這一層」</td><td>設計理由沒有留下來</td><td>在類別的 summary 註解寫明「這層隔離了什麼變化」；重大決定寫成短文件</td></tr>\n      </tbody></table></div>",
          "anchor": "j02-l3"
        }
      ]
    },
    {
      "id": "J03",
      "anchor": "j03",
      "tag": "J03",
      "name": "測試",
      "sub": "金字塔、mock、可測試性",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>大量<b>快、穩、便宜</b>的 unit test 墊底，少量慢而貴的整合與 UI 測試在上面（測試金字塔）；測試要驗證「結果對不對」，而不是「內部怎麼呼叫」。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 220\" role=\"img\" aria-label=\"測試金字塔\" style=\"min-width:640px\">\n          <polygon class=\"bx-accent\" points=\"250,30 310,30 350,80 210,80\"></polygon>\n          <polygon class=\"bx\" points=\"210,84 350,84 410,140 150,140\"></polygon>\n          <polygon class=\"bx-soft\" points=\"150,144 410,144 480,204 80,204\"></polygon>\n          <text x=\"280\" y=\"62\" text-anchor=\"middle\" class=\"t-small\">UI／E2E</text>\n          <text x=\"280\" y=\"118\" text-anchor=\"middle\">Integration</text>\n          <text x=\"280\" y=\"180\" text-anchor=\"middle\" class=\"t-strong\">Unit</text>\n          <text x=\"520\" y=\"58\" class=\"t-small\">少：最慢、最容易壞、壞了最難看出原因</text>\n          <text x=\"520\" y=\"116\" class=\"t-small\">一些：真的檔案、真的套件、模組之間接起來</text>\n          <text x=\"520\" y=\"176\" class=\"t-small\">很多：毫秒級、不碰 I/O、壞了一眼知道哪裡</text>\n          <line class=\"ln dash\" x1=\"490\" y1=\"40\" x2=\"490\" y2=\"200\"></line>\n          <text x=\"20\" y=\"40\" class=\"t-small\">越上面：</text><text x=\"20\" y=\"58\" class=\"t-small\">越像真實使用</text>\n          <text x=\"20\" y=\"180\" class=\"t-small\">越下面：</text><text x=\"20\" y=\"198\" class=\"t-small\">越快、越穩</text>\n        </svg>\n      </div>\n      <figcaption>測試金字塔由 Mike Cohn 在 Succeeding with Agile 提出。倒過來（UI 測試最多、unit 最少）叫「冰淇淋甜筒」，維護與執行都很痛苦。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Unit test</td><td>測一小段邏輯（一個方法或類別），不碰檔案、網路、資料庫，毫秒級完成</td></tr>\n        <tr><td>Integration test</td><td>把幾個模組或真的外部資源接起來測：真的讀 Excel、真的寫檔</td></tr>\n        <tr><td>E2E／UI test</td><td>從使用者操作的角度把整條流程跑一次</td></tr>\n        <tr><td>Regression test（回歸測試）</td><td>確認「以前會的現在還會」。修完 bug 補一個重現它的測試，就成了回歸測試</td></tr>\n        <tr><td>Golden file／approval test</td><td>一批真實輸入配上「已確認正確」的輸出檔，每次改完重跑比對差異。解析類工具特別好用</td></tr>\n        <tr><td>Test double（測試替身）</td><td>測試時代替真實依賴的假物件，Gerard Meszaros 分成下面五種</td></tr>\n        <tr><td>Dummy</td><td>只為了填參數，根本不會被用到</td></tr>\n        <tr><td>Fake</td><td>真的能動、但走捷徑的簡化實作，例如記憶體裡的假資料庫</td></tr>\n        <tr><td>Stub</td><td>被問什麼就回預先準備好的答案</td></tr>\n        <tr><td>Spy</td><td>stub＋記錄自己被怎麼呼叫，事後可以查</td></tr>\n        <tr><td>Mock</td><td>事先寫好「應該被怎麼呼叫」的期望，沒照做就判失敗</td></tr>\n        <tr><td>Coverage（覆蓋率）</td><td>測試執行到多少程式碼。line coverage 看行，branch coverage 看每個 if 的兩邊都走過沒</td></tr>\n        <tr><td>Mutation testing</td><td>故意把程式改壞（例如 &lt; 改成 &lt;=），看測試抓不抓得到，用來檢驗測試本身的品質</td></tr>\n        <tr><td>Flaky test</td><td>程式沒改，卻時過時不過的測試</td></tr>\n        <tr><td>AAA</td><td>Arrange（準備）→ Act（執行）→ Assert（驗證），一個測試的標準三段</td></tr>\n      </tbody></table></div>",
          "anchor": "j03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼是金字塔形？</b>越底層的測試越快、越穩、壞了越容易定位，所以大量寫；越上層越貼近真實但越慢、越容易因為不相干的原因壞掉，所以只留少量把關關鍵流程。能在下層測的檢查，就不要放到上層。</li>\n        <li><b>stub 跟 mock 差在哪？為什麼 mock 太多反而不好？</b>stub 只提供答案，測試最後檢查<b>結果與狀態</b>（state verification）；mock 檢查<b>被呼叫的方式</b>（behavior verification）。驗證呼叫方式等於把測試綁在實作細節上：重構時行為沒變，測試卻壞一片。所以優先驗證結果，mock 留給「呼叫本身就是行為」的地方，例如真的要寄出的信、要寫進硬體的暫存器。</li>\n        <li><b>為什麼覆蓋率高不代表品質好？</b>覆蓋率只說「這行被執行過」，不說「結果有被檢查」。一個沒有 assert 的測試也能把覆蓋率衝到 100%。branch coverage 比 line coverage 嚴格；mutation testing 才能直接回答「測試抓不抓得到錯」。</li>\n        <li><b>可測試性要怎麼設計進去？</b>把邏輯寫成「輸入→輸出」的純函式；依賴從外面注入；時間、亂數、檔案系統這些會變的東西也包成可替換的介面（例如傳入現在時間而不是在裡面呼叫 <code>DateTime.Now</code>）。Thin Form 就是為了這個：UI 只剩一層薄殼，邏輯全部可以直接測。</li>\n        <li><b>為什麼要先寫一個重現 bug 的測試再修？</b>先看到它紅，才能證明測試真的抓得到這個 bug；修完變綠，它就永久守著這個問題不再回來。</li>\n      </ul>",
          "anchor": "j03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>測試時過時不過（flaky）</td><td>依賴時間、執行順序、共用的檔案或 static 狀態、真實網路、用 sleep 等待</td><td>隔離共用狀態、注入時間、用「等到條件成立」取代固定 sleep；先把 flaky 測試隔離出來修，不要重跑到綠就算了</td></tr>\n        <tr><td>重構時行為沒變，測試卻壞了一大片</td><td>過度 mock，測試綁住實作細節</td><td>改成驗證輸出與狀態；mock 只留在系統邊界</td></tr>\n        <tr><td>覆蓋率 90%，上線還是出包</td><td>測試只走正常路徑或沒有 assert；格式、編碼、權限這類整合問題沒測到</td><td>補邊界值與錯誤路徑、補少量 integration test；看 branch coverage，必要時跑 mutation testing</td></tr>\n        <tr><td>想測一段邏輯，得先開 Form、按按鈕</td><td>邏輯寫在事件處理裡</td><td>抽成純類別再測；UI 只做少量冒煙測試（smoke test）</td></tr>\n        <tr><td>改了解析規則，舊樣本的結果悄悄變差</td><td>沒有回歸基準</td><td>建一組 golden set（真實檔案＋期望輸出），每次改完自動比對並列出差異</td></tr>\n        <tr><td>整套測試要跑很久，大家乾脆不跑</td><td>金字塔倒過來，大量慢的 UI／E2E 測試</td><td>能下推的檢查改寫成 unit；分層執行：每次提交跑快的，夜間跑完整的</td></tr>\n      </tbody></table></div>",
          "anchor": "j03-l3"
        }
      ]
    },
    {
      "id": "J04",
      "anchor": "j04",
      "tag": "J04",
      "name": "Git 與版本控制",
      "sub": "merge、rebase、cherry-pick",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>commit 是一份「快照＋指向上一個 commit 的指標」，分支只是一張可以移動的標籤。<b>merge 把兩條線接起來、不改舊 commit；rebase 把你的 commit 重新抄一份接到別人後面；cherry-pick 只抄一顆。</b></p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 210\" role=\"img\" aria-label=\"Git 的四個區域\" style=\"min-width:640px\">\n          <defs><marker id=\"ahG\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"arrow-head\"></path></marker></defs>\n          <text x=\"10\" y=\"20\" class=\"t-strong\">先分清楚：你的變更現在在哪一格？</text>\n          <rect class=\"bx\" x=\"20\" y=\"50\" width=\"150\" height=\"62\" rx=\"6\"></rect><text x=\"32\" y=\"74\" class=\"t-strong\">工作目錄</text><text x=\"32\" y=\"96\" class=\"t-small\">還沒 add 的修改</text>\n          <rect class=\"bx\" x=\"250\" y=\"50\" width=\"150\" height=\"62\" rx=\"6\"></rect><text x=\"262\" y=\"74\" class=\"t-strong\">暫存區 index</text><text x=\"262\" y=\"96\" class=\"t-small\">add 過、準備 commit</text>\n          <rect class=\"bx-accent\" x=\"480\" y=\"50\" width=\"150\" height=\"62\" rx=\"6\"></rect><text x=\"492\" y=\"74\" class=\"t-strong\">本機 repo</text><text x=\"492\" y=\"96\" class=\"t-small\">commit 歷史</text>\n          <rect class=\"bx\" x=\"710\" y=\"50\" width=\"150\" height=\"62\" rx=\"6\"></rect><text x=\"722\" y=\"74\" class=\"t-strong\">遠端 remote</text><text x=\"722\" y=\"96\" class=\"t-small\">push 給大家的</text>\n          <line class=\"arrow\" x1=\"172\" y1=\"70\" x2=\"248\" y2=\"70\" marker-end=\"url(#ahG)\"></line><text x=\"196\" y=\"62\" class=\"t-small\">add</text>\n          <line class=\"arrow\" x1=\"402\" y1=\"70\" x2=\"478\" y2=\"70\" marker-end=\"url(#ahG)\"></line><text x=\"416\" y=\"62\" class=\"t-small\">commit</text>\n          <line class=\"arrow\" x1=\"632\" y1=\"70\" x2=\"708\" y2=\"70\" marker-end=\"url(#ahG)\"></line><text x=\"654\" y=\"62\" class=\"t-small\">push</text>\n          <line class=\"arrow\" x1=\"708\" y1=\"96\" x2=\"632\" y2=\"96\" marker-end=\"url(#ahG)\"></line><text x=\"640\" y=\"126\" class=\"t-small\">fetch／pull</text>\n          <rect class=\"bx dash\" x=\"20\" y=\"150\" width=\"150\" height=\"40\" rx=\"6\"></rect><text x=\"32\" y=\"175\" class=\"t-small\">stash（口袋）</text>\n          <line class=\"arrow\" x1=\"60\" y1=\"114\" x2=\"60\" y2=\"148\" marker-end=\"url(#ahG)\"></line><text x=\"66\" y=\"137\" class=\"t-small\">stash</text>\n          <line class=\"arrow\" x1=\"140\" y1=\"148\" x2=\"140\" y2=\"114\" marker-end=\"url(#ahG)\"></line><text x=\"146\" y=\"137\" class=\"t-small\">pop</text>\n          <text x=\"200\" y=\"166\" class=\"t-small\">merge／rebase／cherry-pick／revert／reset 都只在「本機 repo」這格的 commit 之間動；</text>\n          <text x=\"200\" y=\"186\" class=\"t-small\">stash 處理的是還沒 commit 的工作目錄與暫存區，完全不同層。</text>\n        </svg>\n      </div>\n      <figcaption>題庫 J04 Q001 的關鍵：先問「要搬的東西 commit 了沒？」再問「要搬幾個？」。</figcaption>\n    </figure>\n<div class=\"callout\"><b>判斷法（Q001 答錯過，背這三步）：</b>①還沒 commit → <code>git stash</code> 先收進口袋；②已經 commit、整串都要 → <code>merge</code> 或 <code>rebase</code>；③已經 commit、只要其中一顆 → <code>cherry-pick</code>。要撤銷已經 push 的 commit → <code>revert</code>（產生一個反向 commit），不是 reset。</div>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>commit</td><td>整個專案的快照＋作者、訊息＋parent（上一個 commit）。hash 由內容與 parent 算出，parent 一變 hash 就變</td></tr>\n        <tr><td>branch／HEAD</td><td>branch 是指向某個 commit 的可移動標籤；HEAD 表示「你現在在哪」，通常指向一個 branch</td></tr>\n        <tr><td>merge base</td><td>兩條分支最近的共同祖先，merge 與 rebase 都從它開始算差異</td></tr>\n        <tr><td>fast-forward</td><td>目標分支沒有新 commit 時，merge 只要把指標往前移，不產生 merge commit。<code>--no-ff</code> 強制產生、<code>--ff-only</code> 不能快轉就拒絕</td></tr>\n        <tr><td>three-way merge</td><td>拿 merge base、我方、對方三份比對；兩邊改不同地方自動合，改同一段就衝突</td></tr>\n        <tr><td>merge commit</td><td>有兩個 parent 的 commit。第一個 parent 是合併當時所在的分支</td></tr>\n        <tr><td>rebase</td><td>把自己的 commit 一顆顆重新套到另一個基底上，產生 hash 全新的 commit，歷史變成一直線</td></tr>\n        <tr><td>cherry-pick</td><td>把某一顆 commit 帶來的改變，抄一份成新 commit 套到目前分支。<code>-x</code> 會在訊息加註「cherry picked from commit …」（沒衝突時才自動加）</td></tr>\n        <tr><td>squash merge</td><td><code>git merge --squash</code>：把整條分支的總改變放進暫存區，由你 commit 成一顆；新 commit 只有一個 parent</td></tr>\n        <tr><td>revert vs reset</td><td>revert：新增一個「反向」commit，歷史不動，適合已共享的分支。reset：把分支指標往回移，等於改寫歷史</td></tr>\n        <tr><td>stash</td><td>把還沒 commit 的修改暫時收起來，工作目錄回到乾淨狀態，之後 <code>stash pop</code> 拿回</td></tr>\n        <tr><td>衝突標記</td><td><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> 我方 <code>=======</code> 對方 <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>；改好後 add 再繼續</td></tr>\n        <tr><td>reflog</td><td>本機記錄「HEAD 與分支指標曾經指過哪裡」的日誌，reset、rebase 後找回舊 commit 靠它。預設保留：可到達的 90 天、已不可到達的 30 天</td></tr>\n        <tr><td>git bisect</td><td>在「已知好的版本」與「已知壞的版本」之間用二分搜尋找出第一個壞掉的 commit：每次 checkout 中間那顆，你標 good 或 bad，約 log₂N 次就收斂（200 顆約 8 次）。<code>git bisect run &lt;script&gt;</code> 可讓測試腳本自動判定</td></tr>\n        <tr><td>rerere</td><td>reuse recorded resolution：記住你解過的衝突，同樣的衝突再出現時自動套用。要設 <code>rerere.enabled</code> 才會啟用</td></tr>\n        <tr><td>分支策略</td><td><b>Git Flow</b>：main、develop、feature、release、hotfix 多條長命分支；<b>GitHub flow</b>：只有 main＋短命 feature 分支；<b>Trunk-based</b>：大家每天小步合進 trunk，未完成功能用 feature flag 藏起來</td></tr>\n        <tr><td><code>--force-with-lease</code></td><td>比 <code>--force</code> 安全：遠端分支若已經被別人推了你沒看過的 commit，就拒絕覆蓋</td></tr>\n      </tbody></table></div>",
          "anchor": "j04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>merge 和 rebase 根本差在哪？</b>merge 保留真實發生過的分岔，不動任何既有 commit，所以安全；代價是歷史有很多交叉線。rebase 重寫你的 commit（parent 變了，hash 全換），換來一條直線、好讀好 bisect；代價是「改寫歷史」。兩者合完的程式碼內容可以一模一樣，差別只在歷史長相與安全性。</li>\n        <li><b>為什麼不能 rebase 已經 push 給別人的分支（rebase 黃金規則）？</b>rebase 產生的是新 commit。別人手上還是舊的 D、E、F，他一 pull 就會同時有舊的與新的兩份，出現重複 commit 與一連串衝突。所以只 rebase「只有你自己在用」的分支；真的要改寫已推送的歷史，要事先講好，並用 <code>--force-with-lease</code>。</li>\n        <li><b>rebase 中衝突時，ours／theirs 為什麼「反過來」？</b>rebase 是站在新基底（例如 main）上，把你的 commit 一顆顆套上去。所以 <b>ours 是 main 那邊（已重播的部分），theirs 才是你自己的 commit</b>，跟 merge 時剛好相反。用 <code>-X ours</code> 之類的選項前要特別注意。</li>\n        <li><b>cherry-pick 為什麼也會衝突？為什麼常用代表策略有問題？</b>cherry-pick 搬的是「這顆 commit 相對於它的 parent 改了什麼」。如果那段程式碼在目標分支上長得不一樣（基底不同），就會衝突。而且同一個改變會以兩個不同 hash 出現在歷史裡。偶爾回填 hotfix 很正常；如果天天在 cherry-pick，通常代表分支切得不乾淨，應該改成「修在最舊需要它的分支，再往前 merge」。</li>\n        <li><b>為什麼 revert 一個 merge 要加 <code>-m 1</code>？</b>merge commit 有兩個 parent，git 不知道要以哪一邊為主線來算「反向改變」。<code>-m 1</code> 表示以第一個 parent（合併當時所在的分支）為主線。注意：revert 一個 merge 等於宣告「那條分支帶進來的東西我都不要」，之後同一條分支修好再 merge 一次，<b>舊的那些 commit 不會被帶回來</b>，要先 revert 那個 revert。</li>\n        <li><b>分支策略怎麼選？</b>Git Flow 是 2010 年為「多個版本同時在外面跑、要分別維護」的軟體設計的；作者 Vincent Driessen 在 2020 年自己補註：持續交付的 web app 應該用 GitHub flow 這類更簡單的流程。分支活越久，合回來的衝突越大，所以趨勢是短命分支＋常整合。發給使用者安裝的桌面工具，多半「main＋短命 feature 分支＋每次發版打 tag」就夠用。</li>\n      </ul>",
          "anchor": "j04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>push 被拒（non-fast-forward／rejected）</td><td>遠端有你沒有的 commit</td><td>先 fetch；自己還沒推的 commit 用 rebase 接到最新的遠端後面，或直接 merge。不要第一反應就 <code>--force</code></td></tr>\n        <tr><td>rebase 後強制推送，同事 pull 完出現一堆重複 commit</td><td>改寫了已共享的歷史</td><td>共享分支只用 merge 與 revert；非改不可時先通知，用 <code>--force-with-lease</code>，同事改用 <code>git pull --rebase</code> 或重新對齊</td></tr>\n        <tr><td><code>reset --hard</code> 或 rebase 之後，commit 不見了</td><td>commit 還在，只是沒有分支指著（不可到達）</td><td><code>git reflog</code> 找到舊 hash，<code>git branch rescue &lt;hash&gt;</code> 掛回來；不可到達的紀錄預設 30 天後才會被清</td></tr>\n        <tr><td>長命 feature 分支每次同步都在同一段衝突</td><td>分支太久沒整合，兩邊各改各的</td><td>縮短分支壽命、經常把 main 合進來；同樣的衝突反覆出現就開 rerere</td></tr>\n        <tr><td>上線後發現某次 merge 進來的功能有問題</td><td>需要撤銷，但歷史已經共享</td><td><code>git revert -m 1 &lt;merge&gt;</code>；修好後要重新帶回時，先 revert 那個 revert 再合</td></tr>\n        <tr><td>某一版開始出錯，中間隔了上百個 commit，不知道是哪一次改壞</td><td>回歸問題，但只知道「舊版好、新版壞」</td><td><code>git bisect start</code>，標出一個 good 與一個 bad，再依序測試中間版本標記；能寫成自動判定的測試就用 <code>git bisect run</code>。commit 越小顆、每顆都能編譯，bisect 越準</td></tr>\n        <tr><td>hotfix 只在 main 修了，下次從 develop 發版 bug 又回來</td><td>修正沒有回填到其他分支</td><td>修在最舊的需要分支再往前 merge；或用 <code>cherry-pick -x</code> 回填，訊息裡留來源方便追蹤</td></tr>\n      </tbody></table></div>",
          "anchor": "j04-l3"
        }
      ]
    },
    {
      "id": "J05",
      "anchor": "j05",
      "tag": "J05",
      "name": "CI／CD",
      "sub": "pipeline 與環境一致",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>每次 push 都在<b>乾淨的環境</b>自動 build＋test（CI），通過的產物<b>只 build 一次</b>，同一份往下推到測試與正式環境（CD）。目的是讓「測過的」就是「發出去的」。</p>"
        },
        {
          "t": "widget",
          "id": "J.j05",
          "html": "<div class=\"stage\" style=\"margin:20px 0 0\">\n      <ul class=\"steps\" id=\"pSteps\"></ul>\n      <div class=\"controls\" style=\"margin:0 0 8px\">\n        <div class=\"seg\" id=\"pMode\">\n          <button data-f=\"0\" class=\"on\">這一站通過</button>\n          <button data-f=\"1\">這一站失敗</button>\n        </div>\n      </div>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"psvg\" viewBox=\"0 0 900 150\" role=\"img\" aria-label=\"CI/CD pipeline\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"pTitle\"></h3>\n        <p id=\"pWhat\"></p>\n        <p id=\"pFail\" class=\"muted\"></p>\n      </div>\n    </div>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>CI（持續整合）</td><td>大家頻繁把改動合回主線，每次都自動 build＋test，壞了馬上知道</td></tr>\n        <tr><td>Continuous Delivery（持續交付）</td><td>主線隨時處於「可以發佈」的狀態，但上線由人按下去</td></tr>\n        <tr><td>Continuous Deployment（持續部署）</td><td>通過 pipeline 的改動自動上線，中間沒有人工按鈕</td></tr>\n        <tr><td>pipeline／stage</td><td>一連串自動化步驟（見上圖），前一站失敗後面就不跑</td></tr>\n        <tr><td>artifact（產物）</td><td>build 出來要發佈的東西：exe、zip、安裝檔、NuGet 套件</td></tr>\n        <tr><td>build once, deploy many</td><td>產物只 build 一次，測試環境與正式環境用的是同一份</td></tr>\n        <tr><td>環境一致性</td><td>開發機、CI、使用者端的 SDK、套件、設定盡量一致；不一致就是「我電腦可以」的來源</td></tr>\n        <tr><td>Deterministic／reproducible build</td><td>同樣的原始碼與工具，每次 build 出位元相同的結果。.NET 的 <code>ContinuousIntegrationBuild</code> 屬性在 CI 上啟用官方 build 才需要的設定，例如把內嵌的檔案路徑正規化</td></tr>\n        <tr><td>SemVer（語意化版本）</td><td>MAJOR.MINOR.PATCH：不相容的 API 改動升 MAJOR、相容的新功能升 MINOR、相容的修正升 PATCH。<code>1.0.0-alpha</code> 是預發佈版，<code>+</code> 後面是 build metadata，不影響版本先後</td></tr>\n        <tr><td>tag／release</td><td>在發版的 commit 上打標籤，之後可以精確找回「這一版是哪份原始碼」</td></tr>\n        <tr><td>feature flag</td><td>用開關把未完成或高風險的功能藏起來，讓「程式碼合進主線」與「使用者看得到」分開</td></tr>\n        <tr><td>DORA 指標</td><td>衡量交付表現：變更前置時間、部署頻率、失敗部署恢復時間（速度）；變更失敗率、部署重工率（穩定）</td></tr>\n      </tbody></table></div>",
          "anchor": "j05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼要 CI？</b>越久沒整合，兩邊改動越多、衝突越大、壞掉時越難知道是誰的哪個改動。每次 push 就驗證一次，問題在改動還很小的時候就被抓到，修起來最便宜。</li>\n        <li><b>為什麼 CI 要從乾淨環境開始？</b>開發機上有很多「剛好存在」的東西：沒進版控的檔案、全域安裝的套件、舊的編譯快取、寫死的本機路徑。乾淨環境 build 得過，才代表「任何人 clone 下來都 build 得過」。</li>\n        <li><b>為什麼要 build once, deploy many？</b>如果每個環境各自重新編譯，套件版本或設定可能悄悄不同，測過的那份就不是發出去那份。只 build 一次、往下推同一份 artifact，測試結果才有意義。</li>\n        <li><b>為什麼版號要自動帶進產物？</b>使用者回報問題時說「我用 1.4.2」，要能立刻對回是哪個 commit。把 commit hash、build 時間寫進產物的版本資訊（例如 InformationalVersion），並在發版 commit 打 tag，回報就能精確重現。</li>\n        <li><b>速度和穩定是不是互相衝突？</b>DORA 的研究框架把速度（前置時間、部署頻率）和穩定（失敗率、恢復時間）一起量，做得好的團隊兩者通常同時好：小批次、常發佈，每次改動小，壞了也容易找、容易退。</li>\n      </ul>",
          "anchor": "j05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>本機 build 得過，CI 失敗</td><td>新檔案沒進版控，或沒加進舊式 csproj 的 Compile 清單；本機獨有的套件、SDK、寫死的路徑</td><td>CI 一律從乾淨 clone build；自己發版前也偶爾在乾淨目錄 clone 一份 build 看看</td></tr>\n        <tr><td>同一個 commit，兩次 build 出來的結果不一樣</td><td>浮動的套件版本、不同 SDK 版本、內嵌時間戳</td><td>鎖定套件與 SDK 版本、在 CI 啟用 deterministic／<code>ContinuousIntegrationBuild</code>；build 時間另外記錄，不要混進會影響比對的地方</td></tr>\n        <tr><td>使用者回報 bug，卻查不出他那一版是哪個 commit</td><td>版號沒跟原始碼綁在一起</td><td>產物版本資訊帶 commit hash；每次發版打 tag；問題回報自動附上版本</td></tr>\n        <tr><td>發版靠手動步驟，每次漏一項（忘了改版號、漏附檔案）</td><td>流程沒有自動化</td><td>把步驟寫成 script 或 pipeline，人只按一次；剩下的人工步驟寫成清單</td></tr>\n        <tr><td>pipeline 太慢，大家開始繞過它</td><td>所有測試都擠在每次提交時跑</td><td>分層：提交時跑快的，夜間跑完整的；快取套件還原；平行執行</td></tr>\n        <tr><td>新版發出去之後才發現嚴重問題</td><td>沒有回滾路徑</td><td>保留上一版產物、能一鍵退回；高風險功能先用 feature flag 關著，確認後再打開</td></tr>\n      </tbody></table></div>",
          "anchor": "j05-l3"
        }
      ]
    },
    {
      "id": "J06",
      "anchor": "j06",
      "tag": "J06",
      "name": "Debug 與效能分析",
      "sub": "profiling、log、瓶頸",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b><b>先量測，再動手。</b>效能問題用 profiler 找出時間真正花在哪；記憶體問題比對兩個時間點誰還被抓著；現場問題靠事先設計好的 log 還原當時的輸入與決定。</p>\n<figure>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" viewBox=\"0 0 900 140\" role=\"img\" aria-label=\"瓶頸定位迴圈\" style=\"min-width:640px\">\n          <defs><marker id=\"ahD\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"arrow-head\"></path></marker></defs>\n          <rect class=\"bx\" x=\"10\" y=\"20\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"22\" y=\"44\" class=\"t-strong\">1 重現</text><text x=\"22\" y=\"66\" class=\"t-small\">固定輸入、固定步驟</text>\n          <rect class=\"bx\" x=\"190\" y=\"20\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"202\" y=\"44\" class=\"t-strong\">2 量測</text><text x=\"202\" y=\"66\" class=\"t-small\">計時、counters</text>\n          <rect class=\"bx-accent\" x=\"370\" y=\"20\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"382\" y=\"44\" class=\"t-strong\">3 找熱點</text><text x=\"382\" y=\"66\" class=\"t-small\">profiler 看佔比</text>\n          <rect class=\"bx\" x=\"550\" y=\"20\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"562\" y=\"44\" class=\"t-strong\">4 只改一處</text><text x=\"562\" y=\"66\" class=\"t-small\">一次一個假設</text>\n          <rect class=\"bx\" x=\"730\" y=\"20\" width=\"150\" height=\"60\" rx=\"6\"></rect><text x=\"742\" y=\"44\" class=\"t-strong\">5 再量一次</text><text x=\"742\" y=\"66\" class=\"t-small\">跟基準比</text>\n          <line class=\"arrow\" x1=\"162\" y1=\"50\" x2=\"188\" y2=\"50\" marker-end=\"url(#ahD)\"></line>\n          <line class=\"arrow\" x1=\"342\" y1=\"50\" x2=\"368\" y2=\"50\" marker-end=\"url(#ahD)\"></line>\n          <line class=\"arrow\" x1=\"522\" y1=\"50\" x2=\"548\" y2=\"50\" marker-end=\"url(#ahD)\"></line>\n          <line class=\"arrow\" x1=\"702\" y1=\"50\" x2=\"728\" y2=\"50\" marker-end=\"url(#ahD)\"></line>\n          <path class=\"ln dash\" d=\"M805,82 L805,112 L265,112 L265,84\" marker-end=\"url(#ahD)\"></path>\n          <text x=\"420\" y=\"132\" class=\"t-small\">沒達標就回到量測；達標就停，不要順手繼續優化</text>\n        </svg>\n      </div>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Profiling</td><td>量測程式執行時，時間、CPU、記憶體分別花在哪些函式</td></tr>\n        <tr><td>Sampling vs instrumentation</td><td>sampling：每隔一小段時間看一下程式停在哪，開銷小、看比例；instrumentation：在每個函式進出點插記錄，數字精確但會拖慢、扭曲時間分布</td></tr>\n        <tr><td>Hot path（熱點）</td><td>佔掉大部分執行時間的那幾段程式碼</td></tr>\n        <tr><td>CPU-bound vs I/O-bound</td><td>慢在算（CPU 滿載）vs 慢在等（檔案、網路、硬體回應，CPU 很閒）。對策完全不同</td></tr>\n        <tr><td>Amdahl 定律</td><td>整體加速 = 1 ／〔(1 − p) + p ／ s〕，p 是被加速部分的時間佔比、s 是那部分的加速倍數。95% 可平行化，最多也只快 20 倍</td></tr>\n        <tr><td>.NET 診斷工具</td><td><code>dotnet-counters</code>：先看 CPU、GC、例外率、執行緒池等即時指標，做第一層篩檢；可疑再用 <code>dotnet-trace</code> 或 PerfView 錄詳細追蹤；<code>dotnet-dump</code> 抓記憶體傾印。Visual Studio 的診斷工具也能做 CPU 與記憶體分析</td></tr>\n        <tr><td>Managed 記憶體洩漏</td><td>GC 只回收「沒人參照」的物件。還被事件、static 集合、快取抓著的物件就不會被回收</td></tr>\n        <tr><td>Handle 洩漏</td><td>GDI 物件（Bitmap、Font、Brush、Pen）與視窗 handle 是作業系統資源，每個 process 有上限（GDI 上限可用 <code>GDIProcessHandleQuota</code> 調，範圍 256～65,536），沒 Dispose 會慢慢耗光</td></tr>\n        <tr><td>Log level</td><td>.NET 的 <code>LogLevel</code>：Trace 0、Debug 1、Information 2、Warning 3、Error 4、Critical 5、None 6。設定某等級就輸出該等級以上</td></tr>\n        <tr><td>Structured logging</td><td>用 message template（<code>\"讀取 {File} 共 {Rows} 列\"</code>）記錄，參數以欄位保存，之後可以依欄位搜尋、統計</td></tr>\n        <tr><td>Scope／correlation id</td><td>同一筆工作的所有 log 帶同一個 ID，事後能把散在各處的記錄串起來</td></tr>\n      </tbody></table></div>",
          "anchor": "j06-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼一定要先量測？</b>直覺猜的瓶頸常常是錯的。用 Amdahl 定律算：只佔總時間 10% 的那段就算快到無限，整體也只快約 11%。先量出佔比最大的地方，才知道改哪裡值得。</li>\n        <li><b>為什麼先用 counters、sampling，再用 trace？</b>由粗到細。counters 幾乎沒有開銷，先回答「是 CPU、GC、例外，還是執行緒卡住？」；方向確定了再錄詳細 trace，資料量才不會爆，也比較不會被量測本身干擾。</li>\n        <li><b>有 GC 為什麼 .NET 還會記憶體洩漏？</b>GC 只負責「沒人要的」。事件訂閱沒取消、static 清單一直加、快取沒有上限，物件都還被參照著；另外 Bitmap、Font 這類包著作業系統資源的物件，GC 不保證什麼時候收，要自己 <code>Dispose</code>（用 <code>using</code>）。</li>\n        <li><b>log 要怎麼設計才有用？</b>①等級分清楚：正常流程 Information、可恢復的異常 Warning、這次操作失敗 Error；②記「輸入與決定」而不只是「跑到這裡了」：讀了哪個檔、選了哪條規則、為什麼跳過；③用 message template 而不是字串插值：效能較好、參數可查詢（.NET 有 CA2254 規則提醒）；④<b>log 要很快</b>，不要在 log 方法裡直接同步寫慢的儲存，先進記憶體佇列再由背景寫出。</li>\n        <li><b>WinForms 視窗「沒有回應」是怎麼回事？</b>所有 UI 繪製與事件都在同一條 UI thread 上排隊。耗時工作直接寫在 click 事件裡，這條線被占住，視窗就無法重繪。對策是 <code>async</code>／<code>await</code> 或背景執行，用 <code>IProgress</code> 回報進度；反過來，背景執行緒直接碰控制項會拋跨執行緒的 <code>InvalidOperationException</code>，要回到 UI thread 再更新。</li>\n        <li><b>為什麼「加 log 之後 bug 就不見了」？</b>log 改變了時序（多了 I/O、多了延遲），原本的競爭條件（race condition）被蓋掉。這是時序類 bug 的典型特徵，要改用不改變時序的工具（例如記憶體環狀緩衝區記錄、事後 dump）。</li>\n      </ul>",
          "anchor": "j06-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>處理大檔時視窗顯示「沒有回應」</td><td>耗時工作跑在 UI thread 上</td><td>改成 async 或背景執行，用 IProgress 回報進度，提供取消按鈕</td></tr>\n        <tr><td>工具開著越久越慢，記憶體一路往上</td><td>事件沒取消訂閱、快取沒上限、物件被 static 抓住</td><td>在兩個時間點各抓一次記憶體快照或 dump 比對，看哪類物件只增不減、是誰抓著；快取加上限</td></tr>\n        <tr><td>開關對話框很多次後，畫面異常或拋出「Error creating window handle」</td><td>GDI／視窗 handle 洩漏：Bitmap、Font、Brush 或子視窗沒釋放</td><td>工作管理員加開「GDI 物件」「USER 物件」欄位觀察是否只增不減；建立點加 <code>using</code> 或確實 Dispose</td></tr>\n        <tr><td>優化了好幾天，整體沒有變快</td><td>改的不是瓶頸</td><td>先 profile 找出佔比最大的熱點；用 Amdahl 估算改完最多能快多少，划不來就不做</td></tr>\n        <tr><td>現場出錯，本機重現不了，log 只有一行 Error</td><td>log 缺上下文：版本、輸入檔、參數、走了哪條分支都沒記</td><td>log 帶版本與輸入摘要、記關鍵決策；問題回報功能自動打包 log 與環境資訊</td></tr>\n        <tr><td>加了大量 debug log 後，程式明顯變慢</td><td>同步寫檔、在熱迴圈裡記錄、每次都組字串</td><td>用等級過濾、message template（等級沒開時不組字串）、批次或背景寫入；熱迴圈只記彙總</td></tr>\n      </tbody></table></div>",
          "anchor": "j06-l3"
        }
      ]
    },
    {
      "id": "J07",
      "anchor": "j07",
      "tag": "J07",
      "name": "需求分析與工程取捨",
      "sub": "釐清、整合、成本",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>使用者講的通常是<b>他想到的解法</b>，不是他的問題。先問清楚「要解決什麼、怎樣算完成」，再在<b>效能、穩定性、開發成本、時程</b>之間有意識地取捨，並且把取捨講出來。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>功能需求</td><td>系統要「做什麼」：讀入規格表、產出報告、比對兩版差異</td></tr>\n        <tr><td>非功能需求</td><td>系統要「做到什麼程度」：多快、多大檔、能不能離線、出錯怎麼呈現、好不好維護。最常被漏掉</td></tr>\n        <tr><td>驗收條件（acceptance criteria）</td><td>事先講好「怎樣算完成」，最好是具體的範例輸入與期望輸出</td></tr>\n        <tr><td>範圍（scope）</td><td>這一版做什麼、不做什麼。沒寫「不做什麼」，範圍就會一直長</td></tr>\n        <tr><td>MVP</td><td>能驗證核心價值的最小版本，先給使用者用、再依回饋加</td></tr>\n        <tr><td>技術債</td><td>為了現在快而選的簡便做法，之後每次修改都要付「利息」，直到還掉（重構）</td></tr>\n        <tr><td>系統整合</td><td>跟別的系統、別的工具、別的團隊對接：格式、單位、編碼、版本、時序都是需求的一部分</td></tr>\n        <tr><td>介面約定（contract）</td><td>雙方對輸入輸出的書面約定，含欄位、單位、錯誤時怎麼回應、怎麼改版</td></tr>\n        <tr><td>可逆 vs 不可逆的決定</td><td>可逆：UI 文案、內部實作，做錯改掉就好；不可逆或很難逆：檔案格式、公開介面、給客戶的規格，改了別人要跟著改</td></tr>\n        <tr><td>估算</td><td>把工作拆成可估的小項，標出未知與假設，給一個範圍而不是單一數字</td></tr>\n      </tbody></table></div>",
          "anchor": "j07-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼要先問「要解決什麼問題」？</b>「幫我加一個匯出 Excel 按鈕」背後可能是「我每週要把結果貼進報告」。問到真正目的，常會發現更簡單的解法（例如直接產出報告格式），也能避免做完才聽到「不是這樣」。</li>\n        <li><b>為什麼非功能需求最容易出事？</b>沒人會主動說「檔案會到 500 MB」「使用者電腦不能上網」「同事會拿去批次跑上千個檔」，但這些決定架構。釐清需求時要主動問：資料量多大、多久跑一次、誰會用、出錯時要看到什麼。</li>\n        <li><b>效能和開發成本怎麼取捨？</b>先做對、再做快：多數程式碼不在熱路徑上，優化它只增加複雜度。但「資料量級」這種架構級的效能要早想（全部讀進記憶體 vs 串流處理，事後很難改）。原則：量級在設計時決定，細節在量測後優化。</li>\n        <li><b>穩定性和新功能怎麼取捨？</b>內部工具使用者不多，但只要結果錯一次，大家就不再相信它。寧可功能少，也要「錯的時候明確告訴使用者」：清楚的錯誤訊息、可以一鍵回報、不默默產出錯誤結果。</li>\n        <li><b>系統整合為什麼特別容易卡？</b>對方的介面就是你的需求，而且常常只有口頭約定。對方「實際的行為」（例如欄位順序、空白怎麼處理）比文件更真實，別人也會開始依賴你工具的實際行為。所以整合前先交換真實範例檔，把格式、單位、版本寫下來。</li>\n        <li><b>為什麼要分可逆與不可逆的決定？</b>可逆的決定花太多時間討論是浪費，先做、看結果再改；不可逆的決定（檔案格式、公開介面）一旦有人依賴就很難改，值得多花時間想清楚，並預留版本欄位。</li>\n      </ul>",
          "anchor": "j07-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>做完交出去，對方說「不是我要的」</td><td>需求只有一句話，沒有對齊驗收條件</td><td>動手前先給範例輸出或畫面線框確認；約定「怎樣算完成」</td></tr>\n        <tr><td>需求一直加，時程一直延</td><td>範圍沒有邊界</td><td>分成「這版必做／下版再說」；每加一項，明講要換掉哪一項或延多久</td></tr>\n        <tr><td>為了效能寫得很複雜，之後沒人敢改</td><td>過早優化，沒有量測依據</td><td>先量測再優化；保留簡單版本當對照與回歸基準</td></tr>\n        <tr><td>兩個系統串接，格式三天兩頭對不上</td><td>介面約定只靠口頭，各自理解不同</td><td>寫成書面規格（欄位、單位、編碼、版本），雙方各持一組範例檔，串接時自動驗證格式</td></tr>\n        <tr><td>用 AI 輔助很快生出功能，但越改越亂</td><td>沒先決定邊界與介面就讓它寫，每次各自發揮</td><td>動手前先把決策與介面定下來，再讓 AI 補實作；小步提交、每步驗證</td></tr>\n        <tr><td>被問「下週能不能好？」，答了「可以」結果延期</td><td>沒有拆解就估、沒有標出未知項</td><td>拆成小項逐項估，列出假設與風險，給範圍（例如 3～5 天），未知項先花時間探路</td></tr>\n      </tbody></table></div>",
          "anchor": "j07-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>merge vs rebase</td><td>接起兩條線、不改舊 commit vs 把自己的 commit 重抄一份接到別人後面，歷史變直線（J04、主圖）</td></tr>\n      <tr><td>rebase vs cherry-pick</td><td>rebase 可以看成「自動把一整串 commit 依序 cherry-pick 到新基底，再把分支指標搬過去」；cherry-pick 只抄你指定的那幾顆，分支指標不搬</td></tr>\n      <tr><td>cherry-pick vs stash</td><td>搬「已經 commit」的一顆改動 vs 收起「還沒 commit」的修改。不同層（J04 四格圖）</td></tr>\n      <tr><td>revert vs reset</td><td>新增一個反向 commit、歷史不動，適合已共享 vs 把指標往回移、改寫歷史，只適合還沒推出去的</td></tr>\n      <tr><td>fast-forward vs merge commit</td><td>目標分支沒新 commit 時只移指標 vs 兩邊都有新 commit，產生一個有兩個 parent 的 commit</td></tr>\n      <tr><td>squash merge vs rebase</td><td>壓成一顆、跟原分支斷開關係（git 認為沒合過）vs 每顆都保留、只是重抄</td></tr>\n      <tr><td>stub vs mock</td><td>提供答案、事後檢查結果 vs 事先寫好期望的呼叫方式、檢查有沒有照做（J03）</td></tr>\n      <tr><td>覆蓋率 vs 測試品質</td><td>「執行過幾行」vs「改壞時抓不抓得到」；後者要看 assert 與 mutation testing</td></tr>\n      <tr><td>耦合 vs 內聚</td><td>模組「之間」依賴多少（越低越好）vs 模組「之內」是否為同一件事（越高越好）</td></tr>\n      <tr><td>深模組 vs 大類別（God object）</td><td>深是「介面窄、藏得多」，不是程式碼多；God object 是介面寬、職責雜，什麼都管</td></tr>\n      <tr><td>Continuous delivery vs deployment</td><td>隨時可以發、由人按下去 vs 通過 pipeline 就自動上線</td></tr>\n      <tr><td>log vs profiler</td><td>你事先決定要記「發生了什麼」vs 工具量測「時間與記憶體花在哪」。查錯靠 log，查慢靠 profiler</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Coupling／Cohesion</td><td>耦合／內聚</td><td>Aim for high cohesion and low coupling.</td></tr>\n      <tr><td>Deep module</td><td>深模組</td><td>A deep module hides a lot behind a simple interface.</td></tr>\n      <tr><td>Seam</td><td>接縫</td><td>Introduce a seam so the file system can be faked in tests.</td></tr>\n      <tr><td>Dependency injection</td><td>依賴注入</td><td>Pass the reader in through the constructor.</td></tr>\n      <tr><td>Over-engineering</td><td>過度設計</td><td>Three interfaces for one implementation is over-engineering.</td></tr>\n      <tr><td>Test double</td><td>測試替身</td><td>Use a stub instead of the real Excel library.</td></tr>\n      <tr><td>Flaky test</td><td>不穩定的測試</td><td>Quarantine the flaky test and fix the timing issue.</td></tr>\n      <tr><td>Merge base</td><td>共同祖先</td><td>Git computes the merge base before a three-way merge.</td></tr>\n      <tr><td>Fast-forward</td><td>快轉</td><td>The merge was a fast-forward; no merge commit was created.</td></tr>\n      <tr><td>Cherry-pick</td><td>挑選單一 commit</td><td>Cherry-pick the hotfix onto the release branch.</td></tr>\n      <tr><td>Rewrite history</td><td>改寫歷史</td><td>Don't rewrite history on a shared branch.</td></tr>\n      <tr><td>Pipeline／Artifact</td><td>流水線／產物</td><td>The pipeline publishes the build artifact.</td></tr>\n      <tr><td>Reproducible build</td><td>可重現建置</td><td>Same commit, same binary: the build is reproducible.</td></tr>\n      <tr><td>Profiling／Hot path</td><td>效能剖析／熱點</td><td>Profiling showed 80% of the time in the parser.</td></tr>\n      <tr><td>Bottleneck</td><td>瓶頸</td><td>Disk I/O is the bottleneck, not the CPU.</td></tr>\n      <tr><td>Acceptance criteria</td><td>驗收條件</td><td>Let's agree on the acceptance criteria first.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>J01</b>　https://www.nagarro.com/en/blog/deep-module-low-complexity-software-design ；https://blog.pragmaticengineer.com/a-philosophy-of-software-design-review/ ；https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/</li>\n      <li><b>J02</b>　https://martinfowler.com/bliki/Yagni.html</li>\n      <li><b>J03</b>　https://martinfowler.com/articles/practical-test-pyramid.html ；https://martinfowler.com/articles/mocksArentStubs.html</li>\n      <li><b>J04</b>　https://git-scm.com/docs/git-merge ；https://git-scm.com/docs/git-rebase ；https://git-scm.com/docs/git-push ；https://git-scm.com/docs/git-reflog ；https://code.googlesource.com/git/+/v1.6.1/Documentation/git-cherry-pick.txt ；https://code.googlesource.com/git/+/v1.6.5/Documentation/git-revert.txt ；https://code.googlesource.com/git/+/65f099b3988198f0fdf3ef7a21dc01c556d21fff/Documentation/git-rerere.txt ；https://gitkraken.com/blog/golden-rule-of-rebasing-in-git ；https://nvie.com/posts/a-successful-git-branching-model ；https://getunleash.io/trunk-based-development</li>\n      <li><b>J05</b>　https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props ；https://semver.org/ ；https://dora.dev/guides/dora-metrics-four-keys/</li>\n      <li><b>J06</b>　https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters ；https://learn.microsoft.com/en-us/dotnet/core/extensions/logging ；https://learn.microsoft.com/en-us/windows/win32/sysinfo/gdi-objects ；https://en.wikipedia.org/wiki/Amdahl%27s_law</li>\n      <li><b>J07</b>　以經驗原則為主，無單一出處；取捨引用的 YAGNI 與 Amdahl 見 J02、J06</li>\n      <li class=\"muted\">查證日 2026-10-02。未在一手來源確認：GDI 每個 process 的預設上限數值（文件只寫可調範圍 256～65,536，常見說法為 10,000，故不寫死）；Design Pattern 各樣式的定義依 GoF 慣例整理，未逐條查證；deterministic build 屬性的細節（Deterministic 屬性本身）未在 Microsoft 頁面找到說明；J07 內容為一般工程實務，非引用。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-J svg.fig .mono { font-family: var(--mono); font-size: 12px; }\n.kb-J svg.fig .on-dark { fill: var(--bg); font-weight: 700; }\n.kb-J .stage-info code { white-space: nowrap; }\n"
}
