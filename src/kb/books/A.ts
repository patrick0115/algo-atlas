// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "A",
  "file": "A-device.html",
  "title": "元件與物理：一顆 MOSFET 為什麼會開會關",
  "lead": "MOSFET 就是<b>用閘極電壓在矽表面「變出」一條導電通道</b>的開關。A 類的考點幾乎都能對到這顆電晶體的某個部位：通道、閘極、氧化層、源汲極接面、基板。",
  "note": "<p class=\"muted small\">對應 taxonomy A01～A05。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。製作流程見 <a href=\"B-process.html\">B 前段製程</a>。</p>",
  "front": [
    {
      "id": "mosfet",
      "title": "主圖：點部位看物理，拉電壓看通道",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">點剖面上的任何一塊，下方會說明它對應哪個考點。拉動 V<sub>G</sub>、V<sub>D</sub>（或按「自動播放」），看通道怎麼出現、怎麼被夾止。這是 NMOS，假設 Vt = 0.4 V。</p>"
        },
        {
          "t": "widget",
          "id": "A.mosfet",
          "html": "<div class=\"stage\">\n      <svg class=\"fig\" id=\"mos\" viewBox=\"0 0 640 330\" role=\"img\" aria-label=\"NMOS 剖面圖\">\n        <rect class=\"m-sub hot\" data-k=\"body\" x=\"20\" y=\"170\" width=\"600\" height=\"130\"></rect>\n        <rect class=\"m-dep hot\" data-k=\"dep\" x=\"42\" y=\"170\" width=\"206\" height=\"54\" rx=\"6\"></rect>\n        <rect class=\"m-dep hot\" data-k=\"dep\" x=\"392\" y=\"170\" width=\"206\" height=\"54\" rx=\"6\"></rect>\n        <rect class=\"m-dep hot\" data-k=\"gdep\" id=\"gdep\" x=\"240\" y=\"170\" width=\"160\" height=\"0\"></rect>\n        <rect class=\"m-nplus hot\" data-k=\"sd\" x=\"50\" y=\"170\" width=\"190\" height=\"44\"></rect>\n        <rect class=\"m-nplus hot\" data-k=\"sd\" x=\"400\" y=\"170\" width=\"190\" height=\"44\"></rect>\n        <polygon class=\"m-nplus hot\" data-k=\"ch\" id=\"ch\" points=\"\"></polygon>\n        <g id=\"carriers\" pointer-events=\"none\"></g>\n        <rect class=\"m-ox hot\" data-k=\"ox\" x=\"240\" y=\"158\" width=\"160\" height=\"12\"></rect>\n        <rect class=\"m-poly hot\" data-k=\"gate\" x=\"240\" y=\"100\" width=\"160\" height=\"58\"></rect>\n        <line class=\"ln-fg\" x1=\"145\" y1=\"170\" x2=\"145\" y2=\"70\"></line><text x=\"137\" y=\"62\" class=\"t-strong\">S</text>\n        <line class=\"ln-fg\" x1=\"320\" y1=\"100\" x2=\"320\" y2=\"70\"></line><text x=\"312\" y=\"62\" class=\"t-strong\">G</text>\n        <line class=\"ln-fg\" x1=\"495\" y1=\"170\" x2=\"495\" y2=\"70\"></line><text x=\"487\" y=\"62\" class=\"t-strong\">D</text>\n        <line class=\"ln-fg\" x1=\"320\" y1=\"300\" x2=\"320\" y2=\"314\"></line><text x=\"330\" y=\"322\" class=\"t-strong\">B（基板）</text>\n        <text x=\"70\" y=\"200\" class=\"t-small\">源極 n+</text>\n        <text x=\"510\" y=\"200\" class=\"t-small\">汲極 n+</text>\n        <text x=\"292\" y=\"134\">閘極</text>\n        <text x=\"410\" y=\"152\" class=\"t-small\">閘極氧化層</text>\n        <line class=\"ln\" x1=\"240\" y1=\"262\" x2=\"400\" y2=\"262\"></line>\n        <line class=\"ln\" x1=\"240\" y1=\"256\" x2=\"240\" y2=\"268\"></line><line class=\"ln\" x1=\"400\" y1=\"256\" x2=\"400\" y2=\"268\"></line>\n        <text x=\"270\" y=\"282\" class=\"t-small\">L：通道長度</text>\n        <text x=\"30\" y=\"292\" class=\"t-small\">p 型基板</text>\n        <text id=\"pinch\" x=\"376\" y=\"240\" class=\"t-small\"></text>\n        <circle cx=\"16\" cy=\"12\" r=\"3\" class=\"fill-fg\"></circle><text x=\"26\" y=\"16\" class=\"t-small\">電子：會流動、負責導電</text>\n        <circle cx=\"16\" cy=\"28\" r=\"3\" fill=\"none\" stroke=\"var(--fg)\" stroke-width=\"1\"></circle><text x=\"26\" y=\"32\" class=\"t-small\">電洞：p 型基板的多數載子</text>\n        <text x=\"12\" y=\"49\" class=\"t-muted\" style=\"font-size:12px\">−</text><text x=\"26\" y=\"48\" class=\"t-small\">游離受體：電洞被推走後留下，不會動</text>\n        <text id=\"flow\" x=\"630\" y=\"16\" text-anchor=\"end\" class=\"t-strong\"></text>\n        <text id=\"flow2\" x=\"630\" y=\"32\" text-anchor=\"end\" class=\"t-small\"></text>\n      </svg>\n      <div class=\"controls\" style=\"margin:12px 0 0\">\n        <label class=\"inline\">V<sub>G</sub> <input type=\"range\" id=\"vg\" min=\"0\" max=\"1.2\" step=\"0.05\" value=\"0.8\"> <span id=\"vgv\"></span></label>\n        <label class=\"inline\">V<sub>D</sub> <input type=\"range\" id=\"vd\" min=\"0\" max=\"1.2\" step=\"0.05\" value=\"0.3\"> <span id=\"vdv\"></span></label>\n        <button class=\"btn\" id=\"play\" type=\"button\">▶ 自動播放</button>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"region\"></h3>\n        <p id=\"regionTxt\"></p>\n      </div>\n      <div class=\"stage-info\" style=\"border-top:1px solid var(--line);padding-top:12px\">\n        <h3 id=\"partTitle\">點剖面上的一塊</h3>\n        <p id=\"partTxt\" class=\"muted\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "evolve",
      "title": "演進：閘極怎麼越包越緊",
      "blocks": [
        {
          "t": "html",
          "html": "<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 220\" role=\"img\" aria-label=\"平面、FinFET、GAA 三代結構比較\">\n        <!-- planar -->\n        <text x=\"20\" y=\"20\" class=\"t-strong\">平面 MOSFET</text>\n        <text x=\"20\" y=\"38\" class=\"t-small\">閘極只蓋在通道上面一面</text>\n        <rect class=\"m-sub\" x=\"20\" y=\"130\" width=\"240\" height=\"60\"></rect>\n        <rect class=\"m-nplus\" x=\"70\" y=\"130\" width=\"140\" height=\"8\"></rect>\n        <rect class=\"m-ox\" x=\"70\" y=\"122\" width=\"140\" height=\"8\"></rect>\n        <rect class=\"m-poly\" x=\"70\" y=\"80\" width=\"140\" height=\"42\"></rect>\n        <text x=\"215\" y=\"140\" class=\"t-small\">通道</text>\n        <!-- finfet -->\n        <text x=\"330\" y=\"20\" class=\"t-strong\">FinFET</text>\n        <text x=\"330\" y=\"38\" class=\"t-small\">鰭狀通道，閘極包三面</text>\n        <rect class=\"m-sub\" x=\"330\" y=\"160\" width=\"240\" height=\"30\"></rect>\n        <path class=\"m-poly\" d=\"M380,160 L380,62 L520,62 L520,160 L478,160 L478,92 L422,92 L422,160 Z\"></path>\n        <rect class=\"m-ox\" x=\"422\" y=\"92\" width=\"56\" height=\"68\"></rect>\n        <rect class=\"m-nplus\" x=\"430\" y=\"100\" width=\"40\" height=\"60\"></rect>\n        <text x=\"530\" y=\"120\" class=\"t-small\">鰭</text>\n        <!-- gaa -->\n        <text x=\"640\" y=\"20\" class=\"t-strong\">GAA（nanosheet）</text>\n        <text x=\"640\" y=\"38\" class=\"t-small\">一片片奈米片，閘極四面全包</text>\n        <rect class=\"m-sub\" x=\"640\" y=\"170\" width=\"240\" height=\"20\"></rect>\n        <rect class=\"m-poly\" x=\"680\" y=\"56\" width=\"160\" height=\"114\"></rect>\n        <rect class=\"m-ox\" x=\"700\" y=\"72\" width=\"120\" height=\"22\"></rect><rect class=\"m-nplus\" x=\"706\" y=\"77\" width=\"108\" height=\"12\"></rect>\n        <rect class=\"m-ox\" x=\"700\" y=\"104\" width=\"120\" height=\"22\"></rect><rect class=\"m-nplus\" x=\"706\" y=\"109\" width=\"108\" height=\"12\"></rect>\n        <rect class=\"m-ox\" x=\"700\" y=\"136\" width=\"120\" height=\"22\"></rect><rect class=\"m-nplus\" x=\"706\" y=\"141\" width=\"108\" height=\"12\"></rect>\n        <text x=\"850\" y=\"115\" class=\"t-small\">片</text>\n        <text x=\"20\" y=\"215\" class=\"t-small\">三張都是「垂直於電流方向」切開看。閘極包得越多面，越能壓住通道，短通道效應與漏電就越小。</text>\n      </svg>\n    </figure>\n<div class=\"table-wrap\"><table>\n      <tbody><tr><th>結構</th><th>閘極控制</th><th>量產時間點</th><th>為什麼換</th></tr>\n      <tr><td>平面 bulk</td><td>一面</td><td>到 28／20 nm 世代</td><td>閘長再縮，汲極電場搶走控制權，關不乾淨</td></tr>\n      <tr><td>FinFET</td><td>三面</td><td>Intel 22 nm（2011 發表、2012 Ivy Bridge 量產）、TSMC 16 nm（2015）</td><td>立起來的鰭讓閘極從兩側加上方包住通道</td></tr>\n      <tr><td>GAA／nanosheet</td><td>四面</td><td>Samsung 3 nm（2022）、TSMC N2（2025 第 4 季量產）、Intel 18A（原訂的 20A 已取消）</td><td>鰭再窄就做不出來，也無法連續調寬度；奈米片可疊、可調片寬</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "A01",
      "anchor": "a01",
      "tag": "A01",
      "name": "半導體基礎物理",
      "sub": "能帶與載子",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>電子要跳過「能隙」才能導電；摻雜決定導電的是電子（n 型）還是電洞（p 型），費米能階就是這件事的指標。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 720 200\" role=\"img\" aria-label=\"n 型、本質、p 型的能帶圖\">\n        <text x=\"10\" y=\"18\" class=\"t-strong\">n 型</text>\n        <text x=\"250\" y=\"18\" class=\"t-strong\">本質（未摻雜）</text>\n        <text x=\"490\" y=\"18\" class=\"t-strong\">p 型</text>\n        <g>\n          <line class=\"ln-fg\" x1=\"10\" y1=\"50\" x2=\"200\" y2=\"50\"></line><text x=\"205\" y=\"54\" class=\"t-small\">Ec</text>\n          <line class=\"ln-fg\" x1=\"10\" y1=\"150\" x2=\"200\" y2=\"150\"></line><text x=\"205\" y=\"154\" class=\"t-small\">Ev</text>\n          <line class=\"ln-accent dash\" x1=\"10\" y1=\"64\" x2=\"200\" y2=\"64\"></line><text x=\"120\" y=\"80\" class=\"t-accent\">E_F 靠近 Ec</text>\n        </g>\n        <g>\n          <line class=\"ln-fg\" x1=\"250\" y1=\"50\" x2=\"440\" y2=\"50\"></line><text x=\"445\" y=\"54\" class=\"t-small\">Ec</text>\n          <line class=\"ln-fg\" x1=\"250\" y1=\"150\" x2=\"440\" y2=\"150\"></line><text x=\"445\" y=\"154\" class=\"t-small\">Ev</text>\n          <line class=\"ln-accent dash\" x1=\"250\" y1=\"100\" x2=\"440\" y2=\"100\"></line><text x=\"330\" y=\"94\" class=\"t-accent\">E_F 在中間</text>\n          <line class=\"ln\" x1=\"270\" y1=\"52\" x2=\"270\" y2=\"148\"></line><text x=\"276\" y=\"128\" class=\"t-small\">Eg（Si 1.12 eV）</text>\n        </g>\n        <g>\n          <line class=\"ln-fg\" x1=\"490\" y1=\"50\" x2=\"680\" y2=\"50\"></line><text x=\"685\" y=\"54\" class=\"t-small\">Ec</text>\n          <line class=\"ln-fg\" x1=\"490\" y1=\"150\" x2=\"680\" y2=\"150\"></line><text x=\"685\" y=\"154\" class=\"t-small\">Ev</text>\n          <line class=\"ln-accent dash\" x1=\"490\" y1=\"136\" x2=\"680\" y2=\"136\"></line><text x=\"600\" y=\"128\" class=\"t-accent\">E_F 靠近 Ev</text>\n        </g>\n        <text x=\"10\" y=\"190\" class=\"t-small\">上面一條是導電帶底（Ec），下面一條是價電帶頂（Ev），中間就是能隙。費米能階 E_F 越靠近哪一邊，那一邊的載子就越多。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>導體／半導體／絕緣體</td><td>導體沒有能隙（價電帶與導電帶重疊）；半導體能隙約 0.1～4 eV，室溫下有少量載子；絕緣體能隙大（SiO₂ 約 9 eV），幾乎沒有載子</td></tr>\n        <tr><td>能隙（band gap, Eg）</td><td>價電帶和導電帶之間的能量差。Si 1.12 eV、GaAs 1.42 eV、SiC（4H）約 3.26 eV、GaN 約 3.4 eV</td></tr>\n        <tr><td>本質載子濃度 ni</td><td>沒摻雜時，熱能激發出的電子（＝電洞）濃度。Si 室溫約 1×10¹⁰ cm⁻³（修正值 9.65×10⁹；舊教科書常寫 1.5×10¹⁰，題目若給值就照題目）</td></tr>\n        <tr><td>質量作用定律</td><td><code>n · p = ni²</code>：摻雜讓一種載子變多，另一種就等比例變少</td></tr>\n        <tr><td>施體／受體</td><td>施體（P、As）多給一個電子 → n 型；受體（B）少一個電子 → p 型</td></tr>\n        <tr><td>多數／少數載子</td><td>n 型裡電子是多數載子、電洞是少數載子；p 型相反</td></tr>\n        <tr><td>遷移率（mobility, μ）</td><td>載子在電場下跑多快。Si 電子約 1400、電洞約 450 cm²/V·s，電子大約是電洞的 3 倍</td></tr>\n        <tr><td>漂移／擴散電流</td><td>漂移：被電場推著走；擴散：從濃的地方往稀的地方跑</td></tr>\n        <tr><td>費米能階（Fermi level, E_F）</td><td>電子佔據機率 50% 的能量位置；n 型靠近 Ec，p 型靠近 Ev</td></tr>\n        <tr><td>直接／間接能隙</td><td>GaAs、GaN 是直接能隙，發光效率高；Si 是間接能隙，不適合做發光元件</td></tr>\n      </tbody></table></div>",
          "anchor": "a01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 PMOS 要做得比 NMOS 寬？</b>電洞遷移率只有電子的三分之一左右，同樣尺寸 PMOS 的電流小很多。所以標準元件裡 PMOS 通常做得比 NMOS 寬，讓上拉和下拉速度接近。</li>\n        <li><b>為什麼寬能隙材料（SiC、GaN）適合功率元件？</b>能隙大 → 崩潰電場高，同樣耐壓可以做得更薄、電阻更低；高溫時熱激發的載子也少，漏電小、耐熱。</li>\n        <li><b>溫度升高會怎樣？</b>兩件事同時發生：ni 隨溫度指數上升（漏電暴增）；晶格振動加劇，遷移率下降（電流變小）。</li>\n        <li><b>為什麼摻雜濃度不是越高越好？</b>雜質太多會散射載子，遷移率下降；濃度極高時能隙還會變窄。</li>\n      </ul>",
          "anchor": "a01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>高溫下待機電流暴增</td><td>ni 與次臨界漏電都隨溫度指數上升</td><td>高 Vt 元件、電源閘控（power gating）、散熱設計；規格要寫最高溫的漏電</td></tr>\n        <tr><td>高溫時電路變慢</td><td>遷移率隨溫度下降</td><td>以最高溫 corner 做時序簽核，留足 margin</td></tr>\n        <tr><td>低電壓的先進製程，反而低溫最慢</td><td>溫度反轉（temperature inversion）：低溫時 Vt 升高的影響，蓋過遷移率變好的效果</td><td>時序簽核要同時跑低溫和高溫 corner，不能只看高溫</td></tr>\n      </tbody></table></div>",
          "anchor": "a01-l3"
        }
      ]
    },
    {
      "id": "A02",
      "anchor": "a02",
      "tag": "A02",
      "name": "PN 接面與二極體",
      "sub": "二極體",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>p 和 n 接在一起，交界處的載子互相中和，留下一片沒有自由載子的<b>空乏區</b>和內建電場；順偏把它壓薄就導通，逆偏把它撐厚就截止。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>空乏區（depletion region）</td><td>接面兩側載子被耗盡、只剩固定離子電荷的區域。主圖上虛線框住的就是</td></tr>\n        <tr><td>內建電位（built-in potential）</td><td>空乏區形成的電位差，Si 約 0.6～0.8 V（依摻雜）</td></tr>\n        <tr><td>順偏／逆偏</td><td>順偏：p 接正、n 接負，空乏區變窄，電流隨電壓指數上升；Si 導通壓降約 0.7 V，溫度每升 1 °C 約降 2 mV。逆偏：空乏區變寬，只剩極小的逆向漏電</td></tr>\n        <tr><td>接面電容 Cj</td><td>空乏區像電容的介電層。逆偏越大，空乏區越寬，電容越小（變容二極體就是靠這個）。規格書常寫 Cj（或 Ct）並註明量測時的逆偏電壓</td></tr>\n        <tr><td>擴散電容</td><td>順偏時注入的少數載子堆在接面附近形成的電荷儲存，隨順向電流增加而變大。逆偏看接面電容，順偏看擴散電容</td></tr>\n        <tr><td>蕭特基二極體（Schottky）</td><td>金屬和半導體直接接觸形成的二極體，只靠多數載子導電：順向壓降低（約 0.2～0.4 V）、幾乎沒有反向恢復，但逆向漏電較大、耐壓較低</td></tr>\n        <tr><td>崩潰（breakdown）</td><td>逆偏大到某個值，電流突然暴增。分齊納崩潰與雪崩崩潰兩種</td></tr>\n      </tbody></table></div>",
          "anchor": "a02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>空乏區寬度由什麼決定？</b>逆偏越大越寬；摻雜越淡越寬。而且空乏區主要往<b>濃度淡</b>的那一側延伸。</li>\n        <li><b>齊納 vs 雪崩：</b>齊納崩潰發生在兩側都很濃、空乏區極薄的接面，電子直接<b>穿隧</b>過去，崩潰電壓低（約 5 V 以下），溫度升高崩潰電壓下降。雪崩崩潰是載子在寬空乏區裡被加速、撞出更多載子，連鎖放大，崩潰電壓高（約 6 V 以上），溫度升高崩潰電壓上升。5～6 V 之間兩種都有，溫度係數接近零。雪崩為什麼是正溫度係數？溫度高時晶格振動強，載子還沒加速到足夠能量就被撞散（平均自由徑變短），要更高的電場才能觸發連鎖撞擊。</li>\n        <li><b>為什麼 MOSFET 裡也有 PN 接面？</b>源極、汲極（n+）跟 p 型基板就是兩個 PN 接面，平常處於逆偏。它們的接面電容是寄生電容，接面漏電是待機漏電的一部分。</li>\n        <li><b>PN 二極體為什麼有反向恢復時間？</b>順偏時少數載子堆在接面兩側；突然切到逆偏，這些電荷要先被抽乾，二極體才關得掉，這段時間會有一大股逆向電流。Schottky 沒有少數載子儲存，所以切換快，常用在高頻切換電源。</li>\n        <li><b>ESD 保護為什麼常用二極體？</b>二極體順偏導通快、能承受大電流，可以把突波導到電源或地，見 <a href=\"D-package.html#d05\">D05</a>。</li>\n      </ul>",
          "anchor": "a02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>I/O 腳逆向漏電偏高</td><td>接面缺陷、金屬污染形成產生中心；或高溫</td><td>FA 找漏電點（熱點／EMMI），回頭查製程污染；接面漏電大約每升 10 °C 加倍，先確認量測溫度</td></tr>\n        <tr><td>穩壓用的齊納二極體電壓隨溫度漂移</td><td>齊納（負溫度係數）與雪崩（正溫度係數）的區別</td><td>選崩潰電壓約 5～6 V 附近、兩種效應互相抵消的元件；或串一顆順偏二極體補償、改用帶隙參考</td></tr>\n        <tr><td>逆偏電壓不高就崩潰</td><td>兩側摻雜太濃，空乏區太窄、電場太強，觸發穿隧</td><td>降低摻雜或改用漸變接面</td></tr>\n        <tr><td>高速訊號腳上升時間變慢</td><td>ESD 二極體與接面電容太大</td><td>選低電容 ESD 結構，在 ESD 能力和電容間取捨</td></tr>\n        <tr><td>切換電源的二極體很燙、雜訊大</td><td>PN 二極體的反向恢復電流</td><td>改用 Schottky 或快恢復二極體；Schottky 要接受較大的逆向漏電與較低耐壓</td></tr>\n        <tr><td>晶片還沒上電，I/O 接到的外部訊號卻讓內部電源被「供電」起來（back-powering）</td><td>I/O 到 VDD 的 ESD 二極體（或寄生二極體）被外部訊號順偏</td><td>選 fail-safe／耐壓（tolerant）I/O、控制上電順序、外部訊號加限流或隔離</td></tr>\n        <tr><td>帶隙參考電壓隨溫度漂移超規</td><td>二極體（或 BJT）的 V<sub>BE</sub> 約 −2 mV/°C（CTAT），要和隨溫度上升的 ΔV<sub>BE</sub>（PTAT）剛好抵消；製程變異讓兩者比例偏掉</td><td>用電阻比做 trimming，把溫度曲線的頂點調回常溫附近</td></tr>\n      </tbody></table></div>",
          "anchor": "a02-l3"
        }
      ]
    },
    {
      "id": "A03",
      "anchor": "a03",
      "tag": "A03",
      "name": "MOSFET 結構與特性",
      "sub": "開與關",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>閘極電壓超過臨界電壓 Vt，表面就反轉出一條通道；V<sub>D</sub> 小時像電阻（線性區），V<sub>D</sub> 大到把汲極端的通道夾止後，電流就幾乎不再增加（飽和區）。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 640 240\" role=\"img\" aria-label=\"MOSFET 的 Id-Vd 特性曲線\">\n        <line class=\"ln-fg\" x1=\"60\" y1=\"200\" x2=\"600\" y2=\"200\"></line><text x=\"560\" y=\"222\" class=\"t-small\">V_DS</text>\n        <line class=\"ln-fg\" x1=\"60\" y1=\"200\" x2=\"60\" y2=\"20\"></line><text x=\"10\" y=\"30\" class=\"t-small\">I_D</text>\n        <path class=\"ln-accent\" d=\"M60,200 Q120,60 200,52 L590,46\"></path>\n        <path class=\"ln-accent\" d=\"M60,200 Q105,115 160,110 L590,105\"></path>\n        <path class=\"ln-accent\" d=\"M60,200 Q90,160 120,158 L590,155\"></path>\n        <path class=\"ln dash\" d=\"M60,200 Q130,120 210,40\"></path>\n        <text x=\"520\" y=\"40\" class=\"t-small\">V_GS 大</text>\n        <text x=\"520\" y=\"148\" class=\"t-small\">V_GS 小</text>\n        <text x=\"80\" y=\"70\" class=\"t-small\">線性區</text>\n        <text x=\"320\" y=\"80\" class=\"t-small\">飽和區：電流幾乎持平</text>\n        <text x=\"215\" y=\"36\" class=\"t-small\">分界 V_DS = V_GS − Vt</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>臨界電壓 Vt（threshold voltage）</td><td>讓表面反轉、形成通道所需的閘極電壓。規格書的 V<sub>GS(th)</sub> 是用「定電流法」量的：汲極電流到某個值（功率 MOSFET 常見 I<sub>D</sub> = 250 µA）時的 V<sub>GS</sub>，所以看規格要連量測條件一起看</td></tr>\n        <tr><td>截止區</td><td>V<sub>GS</sub> &lt; Vt，沒有通道；但還有微小的次臨界電流</td></tr>\n        <tr><td>線性區（三極區）</td><td>V<sub>DS</sub> &lt; V<sub>GS</sub> − Vt，通道連通，電流大致隨 V<sub>DS</sub> 線性增加，像可變電阻</td></tr>\n        <tr><td>飽和區</td><td>V<sub>DS</sub> ≥ V<sub>GS</sub> − Vt，汲極端通道夾止，電流大約 ∝ (V<sub>GS</sub> − Vt)²（長通道平方律）</td></tr>\n        <tr><td>次臨界擺幅（SS）</td><td>閘極電壓要降多少，次臨界電流才少 10 倍。室溫理論極限約 60 mV/decade</td></tr>\n        <tr><td>body effect</td><td>源極對基板的逆偏 V<sub>SB</sub> 越大，Vt 越高</td></tr>\n        <tr><td>CMOS 反相器</td><td>PMOS 上拉＋NMOS 下拉，任何穩態只有一顆導通，靜態電流幾乎為零；只有切換時才耗電</td></tr>\n      </tbody></table></div>",
          "anchor": "a03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼會飽和？</b>汲極那一端的通道電壓差是 V<sub>GS</sub> − V<sub>DS</sub>，掉到 Vt 以下就沒有反轉層了（夾止）。再加大 V<sub>DS</sub>，多出來的電壓都落在夾止區，通道本身的電壓差不變，電流就不再增加。拉主圖的 V<sub>D</sub> 可以看到。</li>\n        <li><b>為什麼 SS 有 60 mV/dec 的下限？</b>次臨界電流靠載子「翻過」能障，數量遵守熱分佈（波茲曼分佈），室溫 kT/q·ln10 ≈ 60 mV。這也是電源電壓降不下去的根本原因：要關得乾淨，Vt 不能太低。</li>\n        <li><b>Vt 由什麼決定？</b>閘極材料的功函數、氧化層厚度（越薄越低）、通道摻雜（越濃越高）、氧化層電荷、body bias。製程端主要靠通道佈植調 Vt。</li>\n        <li><b>為什麼 CMOS 會成為主流？</b>靜態幾乎不耗電，功耗主要來自切換（∝ C·V²·f），所以能把幾十億顆電晶體放在一起。</li>\n        <li><b>為什麼電流鏡、類比放大器的電晶體 L 要做長？</b>飽和區電流會隨 V<sub>DS</sub> 微微上升（通道長度調變），夾止區占通道的比例越大越明顯。L 加長，比例變小，輸出阻抗 r<sub>o</sub> 變高，電流鏡更準、增益更高；代價是面積和速度。</li>\n        <li><b>短通道下平方律不準了：</b>電場太強，載子速度飽和，電流變成大約跟 (V<sub>GS</sub> − Vt) 成正比；飽和區電流也會隨 V<sub>DS</sub> 慢慢上升（通道長度調變）。</li>\n      </ul>",
          "anchor": "a03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>整批晶片速度偏慢、Vt 偏高</td><td>通道佈植劑量偏多、氧化層偏厚、閘極功函數偏移</td><td>看 WAT 的 Vt、Idsat、Tox 追到哪一層製程</td></tr>\n        <tr><td>堆疊的電晶體（例如 NAND 上面那顆）比較慢</td><td>body effect：上方那顆的源極不在地，V<sub>SB</sub> &gt; 0，Vt 變高</td><td>關鍵路徑減少堆疊數、把最晚到的訊號接在靠近輸出的那顆</td></tr>\n        <tr><td>想降低電壓省電，但待機漏電暴增</td><td>Vt 跟著降，SS 卡在 60 mV/dec，Vt 每降約 60～100 mV，漏電就多 10 倍</td><td>多種 Vt 混用（關鍵路徑低 Vt、其他高 Vt）、電源閘控、DVFS</td></tr>\n        <tr><td>輸入訊號上升很慢時，緩衝器耗電大增、輸出還會抖動</td><td>輸入停在中間電壓時 PMOS 和 NMOS 同時導通，電源直接短路到地（短路電流，crowbar current）；雜訊讓輸出來回翻轉</td><td>輸入改用 Schmitt trigger（有遲滯）、要求訊號源的上升時間、避免浮接輸入</td></tr>\n        <tr><td>低電壓操作時，晶片間速度差異特別大</td><td>過驅動電壓 V<sub>GS</sub> − Vt 很小，電流對 Vt 的變異非常敏感（接近次臨界時是指數關係）</td><td>提高電壓或用 DVFS 依晶片調電壓（AVS）、時序簽核用統計方法</td></tr>\n      </tbody></table></div>",
          "anchor": "a03-l3"
        }
      ]
    },
    {
      "id": "A04",
      "anchor": "a04",
      "tag": "A04",
      "name": "微縮與製程變異",
      "sub": "越小越難",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>電晶體越小越快越省，但閘長短到一個程度，<b>汲極開始搶走閘極的控制權</b>，漏電與變異一起變大。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>Dennard scaling</td><td>尺寸與電壓等比例縮小，功率密度維持不變。大約 2005～2006 年起失效：電壓縮不下去，頻率也停在數 GHz</td></tr>\n        <tr><td>短通道效應（SCE）</td><td>閘長變短後，Vt 下降（Vt roll-off）、漏電上升</td></tr>\n        <tr><td>DIBL</td><td>汲極電壓越高，源極端的能障被壓得越低，Vt 下降</td></tr>\n        <tr><td>漏電來源</td><td>次臨界漏電（關不乾淨）、閘極穿隧漏電（氧化層太薄）、接面漏電、GIDL（閘極引起的汲極漏電）</td></tr>\n        <tr><td>high-k 金屬閘極（HKMG）</td><td>用介電常數高的材料（如 HfO₂）取代 SiO₂，物理厚度較厚但電性等效很薄，壓低閘極漏電。Intel 45 nm（2007）首先量產，閘極漏電降低超過 10 倍</td></tr>\n        <tr><td>PVT</td><td>製程（Process）、電壓（Voltage）、溫度（Temperature）三種變因。注意先進製程低電壓時最慢的可能是<b>低溫</b>（temperature inversion，見 <a href=\"#a01-l3\">A01 L3</a>）</td></tr>\n        <tr><td>Process corner</td><td>TT／FF／SS／FS／SF：第一個字母是 NMOS、第二個是 PMOS，T 典型、F 快、S 慢</td></tr>\n        <tr><td>全域 vs 局部變異</td><td>全域：整片或整批一起偏（用 corner 涵蓋）；局部：相鄰兩顆也不一樣（隨機摻雜擾動 RDF、線邊緣粗糙 LER）</td></tr>\n        <tr><td>Pelgrom 定律</td><td>兩顆相鄰電晶體的 Vt 不匹配 σ ∝ 1/√(W·L)：面積越大，匹配越好</td></tr>\n      </tbody></table></div>",
          "anchor": "a04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼短通道會「關不掉」？</b>通道很短時，源極和汲極的空乏區幾乎碰在一起，汲極的電場直接伸進通道，幫忙壓低能障（這就是 DIBL）。閘極不再是唯一控制通道的人。</li>\n        <li><b>為什麼 Dennard scaling 會失效？</b>電壓要降，Vt 就得跟著降；但 SS 有 60 mV/dec 的下限，Vt 一降漏電就指數上升。電壓降不下去，縮小尺寸後功率密度就上升，頻率只好停住，改走多核心。</li>\n        <li><b>為什麼要 high-k？</b>SiO₂ 薄到只剩幾個原子層（約 1.2 nm），電子直接穿隧過去，閘極漏電大到不能用。high-k 可以用較厚的物理厚度，得到同樣的閘極電容。</li>\n        <li><b>為什麼類比電路的電晶體常做得很大？</b>依 Pelgrom 定律，面積越大，隨機變異越平均掉，差動對的 offset 越小。數位電路追求小，類比電路為了匹配常刻意做大。</li>\n        <li><b>FS／SF corner 為什麼重要？</b>NMOS 和 PMOS 一快一慢時，上升和下降不對稱，最容易出事的是 SRAM 的讀寫穩定度、duty cycle 與保持時間。</li>\n      </ul>",
          "anchor": "a04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>SS corner 有 setup violation</td><td>電晶體慢、低電壓、（傳統製程）高溫</td><td>改用低 Vt 元件、加大驅動、重新切 pipeline；確認簽核 corner 是否涵蓋</td></tr>\n        <tr><td>FF corner 有 hold violation</td><td>電晶體快、資料路徑太短</td><td>在資料路徑插 delay buffer</td></tr>\n        <tr><td>同一顆晶片裡 SRAM 偶發讀錯，量產良率隨電壓下降而掉</td><td>局部變異（RDF、LER）讓少數 bit cell 不穩</td><td>提高 SRAM 的最低工作電壓、加讀寫輔助電路、ECC</td></tr>\n        <tr><td>類比差動對 offset 過大</td><td>電晶體匹配差：面積太小或佈局不對稱</td><td>加大面積、共質心（common-centroid）佈局、加 dummy、做 trimming</td></tr>\n        <tr><td>短閘長的元件 Vt 比長閘長低很多</td><td>Vt roll-off、DIBL</td><td>加 halo／pocket 佈植、淺接面、加大 L；或改用 FinFET／GAA 等閘控更強的結構</td></tr>\n        <tr><td>電晶體關閉時，汲極漏電反而在閘極加負偏時變大</td><td>GIDL：閘極與汲極重疊處電場太強，發生能帶間穿隧</td><td>降低閘汲重疊區的電場、調整汲極摻雜梯度</td></tr>\n        <tr><td>同樣尺寸的電晶體，擺在佈局不同位置電流卻不一樣</td><td>佈局相依效應：主動區長度（LOD）與 STI 擠壓的應力改變遷移率；靠近 well 邊緣時佈植被光阻邊緣散射（WPE）讓 Vt 偏移</td><td>關鍵匹配元件遠離 well 邊緣、加 dummy 讓周圍環境一致、post-layout 模擬要開啟這些效應</td></tr>\n      </tbody></table></div>",
          "anchor": "a04-l3"
        }
      ]
    },
    {
      "id": "A05",
      "anchor": "a05",
      "tag": "A05",
      "name": "先進元件結構",
      "sub": "FinFET、GAA",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>平面電晶體壓不住短通道效應之後，業界換成<b>讓閘極從更多面包住通道</b>的結構；另一條路是讓通道本身更好跑（應變、SOI）。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>FinFET</td><td>通道立成鰭狀，閘極包三面。驅動電流靠鰭的數量調整，寬度只能是「幾根鰭」的整數倍，是離散值</td></tr>\n        <tr><td>GAA（Gate-All-Around）／nanosheet</td><td>通道是一疊水平的奈米片，閘極四面包住。Samsung 叫 MBCFET、Intel 叫 RibbonFET（18A 同時導入背面供電 PowerVia）</td></tr>\n        <tr><td>SOI（Silicon-on-Insulator）</td><td>矽層下面墊一層埋入氧化層（BOX）。FD-SOI：矽層薄到完全空乏；PD-SOI：矽層較厚、部分空乏，有浮體效應</td></tr>\n        <tr><td>應變矽（strained Si）</td><td>拉伸或壓縮晶格提高遷移率：PMOS 用 SiGe 源汲極給<b>壓縮</b>應變（驅動電流約 +25%）；NMOS 用 SiN 蓋層給<b>拉伸</b>應變（約 +10%）。Intel 90 nm（2003）首先量產</td></tr>\n        <tr><td>製程節點命名</td><td>「3 nm」「2 nm」是世代名稱，已經和實際閘長或任何單一尺寸脫鉤，見 <a href=\"#a05-l2\">L2</a></td></tr>\n      </tbody></table></div>",
          "anchor": "a05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>包越多面為什麼越好？</b>閘極跟通道的接觸面越多，對通道電位的掌控越強，汲極電場就越難伸進來，DIBL 和 SS 都變好，可以用更低的電壓。</li>\n        <li><b>FinFET 為什麼還要換 GAA？</b>鰭要更窄才壓得住，但再窄就做不出來、變異也大；寬度只能用「幾根鰭」離散調整。奈米片可以垂直疊起來增加電流，片寬也能連續調整。</li>\n        <li><b>FD-SOI 好在哪？</b>BOX 擋住了往基板的漏電與寄生電容，薄矽層讓閘極容易控制；還可以從背面加偏壓（back bias）動態調 Vt。缺點是晶圓比較貴。</li>\n        <li><b>節點名稱為什麼不等於尺寸？</b>早期節點約等於閘長。後來為了延續「每代縮小約 0.7 倍」的命名，名稱繼續往下走，但實際的閘距、金屬間距縮得沒那麼快。比較不同家的製程要看電晶體密度、閘距（CPP）、金屬間距（MP）。</li>\n        <li><b>應變為什麼能提高速度？</b>晶格被拉伸或壓縮後，能帶結構改變，載子的有效質量和散射減少，遷移率上升。電子喜歡拉伸、電洞喜歡壓縮，所以 NMOS 和 PMOS 用相反的應變。</li>\n      </ul>",
          "anchor": "a05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>FinFET 電路在高電流下特性變差、可靠度下降</td><td>自熱效應：鰭很窄，熱不容易散到基板</td><td>可靠度評估要算自熱溫升，限制大電流元件的電流密度</td></tr>\n        <tr><td>從平面製程移植過來的類比電路，元件尺寸調不到想要的值</td><td>FinFET 的寬度是離散的（鰭數）</td><td>重新設計電流比例，用多個單位元件組合</td></tr>\n        <tr><td>兩家「同名 3 nm」的製程，晶片面積差很多</td><td>節點名稱不代表實際尺寸</td><td>比較電晶體密度、CPP、MP 與標準元件高度，不要只看名稱</td></tr>\n        <tr><td>PD-SOI 電路的 I–V 出現扭折（kink），延遲還跟之前的操作歷史有關</td><td>浮體效應：撞擊游離產生的電荷堆在沒接地的 body 裡，改變 body 電位與 Vt</td><td>加 body contact／body tie，或改用 FD-SOI</td></tr>\n      </tbody></table></div>",
          "anchor": "a05-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>線性區 vs 飽和區</td><td>V<sub>DS</sub> &lt; V<sub>GS</sub> − Vt 是線性區；≥ 是飽和區（A03）。注意 MOSFET 的「飽和」和 BJT 的「飽和」意思相反</td></tr>\n      <tr><td>齊納 vs 雪崩崩潰</td><td>穿隧、低電壓、負溫度係數 vs 撞擊游離、高電壓、正溫度係數（A02）</td></tr>\n      <tr><td>DIBL vs body effect</td><td>汲極電壓讓 Vt 降 vs 源極對基板的逆偏讓 Vt 升（A03、A04）</td></tr>\n      <tr><td>全域 vs 局部變異</td><td>整批一起偏，靠 corner vs 相鄰兩顆不同，靠統計與匹配佈局（A04）</td></tr>\n      <tr><td>FS vs SF</td><td>第一個字母永遠是 NMOS：FS＝NMOS 快、PMOS 慢（A04）</td></tr>\n      <tr><td>FinFET vs GAA</td><td>閘極包三面、寬度離散 vs 包四面、片可疊、寬度可調（A05）</td></tr>\n      <tr><td>遷移率 vs 速度飽和</td><td>低電場時速度 ∝ 電場（遷移率）；電場太強時速度到頂，不再增加（A03）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Band gap</td><td>能隙</td><td>GaN has a wide band gap of about 3.4 eV.</td></tr>\n      <tr><td>Mobility</td><td>遷移率</td><td>Hole mobility is about one third of electron mobility.</td></tr>\n      <tr><td>Depletion region</td><td>空乏區</td><td>The depletion region widens under reverse bias.</td></tr>\n      <tr><td>Threshold voltage (Vt)</td><td>臨界電壓</td><td>Low-Vt cells are faster but leakier.</td></tr>\n      <tr><td>Subthreshold swing</td><td>次臨界擺幅</td><td>SS is limited to about 60 mV/dec at room temperature.</td></tr>\n      <tr><td>Pinch-off</td><td>夾止</td><td>The channel pinches off near the drain in saturation.</td></tr>\n      <tr><td>DIBL</td><td>汲極引起能障降低</td><td>DIBL increases with shorter gate length.</td></tr>\n      <tr><td>Process corner</td><td>製程角落</td><td>Hold is checked at the FF corner.</td></tr>\n      <tr><td>Mismatch</td><td>不匹配</td><td>Larger devices give better mismatch.</td></tr>\n      <tr><td>Gate-all-around</td><td>環繞式閘極</td><td>GAA nanosheets replace FinFETs at the 3 nm / 2 nm generation.</td></tr>\n      <tr><td>Strain engineering</td><td>應變工程</td><td>Embedded SiGe adds compressive strain to PMOS.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\" id=\"srcList\">\n      <li><b>A01</b>　https://www.ioffe.ru/SVA/NSM/Semicond/Si/bandstr.html ；https://www.pveducation.org/node/389 （ni 修正值）；Nanoscale Res. Lett. 材料參數表（GaAs／SiC／GaN 能隙）；arXiv 1702.06454（遷移率與溫度）</li>\n      <li><b>A02</b>　UCSB ECE122 Lecture 6（PN 接面、空乏區、接面電容）；Toshiba FAQ（齊納溫度係數）；https://www.electronics-notes.com/articles/electronic_components/diode/zener-diode-theory-operation.php</li>\n      <li><b>A03</b>　arXiv 1811.09146（次臨界擺幅極限）；U of Toronto ECE331（body effect）；embeddedcomputing.com（temperature inversion）</li>\n      <li><b>A04</b>　https://en.wikipedia.org/wiki/Dennard_scaling ；All About Circuits（MOS 漏電來源、DIBL、GIDL）；IEEE Spectrum（Intel 45 nm HKMG）；ChipVerify（process corner）；Atomera（Pelgrom、RDF）；Chatterjee 1999（halo／pocket）</li>\n      <li><b>A05</b>　Samsung Newsroom（3 nm GAA）；eeNews Europe（TSMC N2 量產）；IEEE Spectrum「The Status of Moore's Law: It's Complicated」（節點命名）；Real World Tech IEDM 2003（Intel 90 nm 應變矽）；US Patent 7268024（PD／FD-SOI 浮體效應）；ISQED 2019（FinFET 自熱）</li>\n      <li class=\"muted\">查證日 2026-10-01。定義與機制以教科書常識撰寫；數值與 L3 條目對照上列出處。Intel 18A 量產狀態只見媒體轉述；長通道平方律、次臨界電流指數式是教科書標準式，未另找出處。</li>\n    </ol>"
        }
      ]
    }
  ]
}
