// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "B",
  "file": "B-process.html",
  "title": "前段製程：一片晶圓怎麼變成電晶體",
  "lead": "前段製程其實就是同一個迴圈：<b>鋪一層膜 → 用光阻畫圖形 → 把不要的挖掉（或打進雜質）→ 磨平</b>，重複幾十輪，一層一層疊上去。",
  "note": "<p class=\"muted small\">對應 taxonomy B01～B06。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "flow",
      "title": "主軸：一步一步看剖面",
      "blocks": [
        {
          "t": "html",
          "html": "<p class=\"muted small\">點下面的步驟，或用「上一步／下一步」。這是簡化版的單顆 NMOS 流程，省略了 STI 隔離、well、spacer、矽化物、high-k 金屬閘極等步驟，只留下能看懂主幹的部分。</p>"
        },
        {
          "t": "widget",
          "id": "B.flow",
          "html": "<ul class=\"steps\" id=\"steps\"></ul>\n<div class=\"stage\">\n      <svg class=\"fig\" id=\"xsec\" viewBox=\"0 0 640 300\" role=\"img\" aria-label=\"晶圓剖面圖\">\n        <defs>\n          <marker id=\"ah\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"arrow-head\"></path></marker>\n        </defs>\n        <g id=\"layers\"></g>\n      </svg>\n      <div class=\"legend\">\n        <span><i style=\"background:var(--m-sub)\"></i>矽基板</span>\n        <span><i style=\"background:var(--m-ox)\"></i>氧化層</span>\n        <span><i style=\"background:var(--m-poly)\"></i>多晶矽（閘極）</span>\n        <span><i style=\"background:var(--m-pr)\"></i>光阻</span>\n        <span><i style=\"background:var(--m-nplus)\"></i>n+ 摻雜區</span>\n        <span><i style=\"background:var(--m-ild)\"></i>介電層</span>\n        <span><i style=\"background:var(--m-w)\"></i>鎢</span>\n        <span><i style=\"background:var(--m-cu)\"></i>銅</span>\n      </div>\n      <div class=\"controls\" style=\"margin:16px 0 0\">\n        <button class=\"btn\" id=\"prev\">← 上一步</button>\n        <button class=\"btn primary\" id=\"next\">下一步 →</button>\n        <span class=\"muted small\" id=\"phase\"></span>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n        <p class=\"muted small\" id=\"stWhy\"></p>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "loop",
      "title": "迴圈：前段製程的骨架",
      "blocks": [
        {
          "t": "html",
          "html": "<figure>\n      <svg class=\"fig\" viewBox=\"0 0 880 200\" role=\"img\" aria-label=\"前段製程的重複迴圈\">\n        <defs>\n          <marker id=\"ah2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker>\n        </defs>\n        <rect class=\"bx\" x=\"10\" y=\"30\" width=\"150\" height=\"76\" rx=\"6\"></rect>\n        <text x=\"24\" y=\"54\" class=\"t-muted\">B04</text><text x=\"24\" y=\"78\" class=\"t-strong\">1 沉積</text><text x=\"24\" y=\"96\" class=\"t-small\">鋪一層膜</text>\n        <rect class=\"bx-accent\" x=\"190\" y=\"30\" width=\"150\" height=\"76\" rx=\"6\"></rect>\n        <text x=\"204\" y=\"54\" class=\"t-accent\">B02</text><text x=\"204\" y=\"78\" class=\"t-strong\">2 微影</text><text x=\"204\" y=\"96\" class=\"t-small\">用光阻畫出圖形</text>\n        <rect class=\"bx\" x=\"370\" y=\"30\" width=\"150\" height=\"76\" rx=\"6\"></rect>\n        <text x=\"384\" y=\"54\" class=\"t-muted\">B03 或 B05</text><text x=\"384\" y=\"78\" class=\"t-strong\">3 蝕刻／佈植</text><text x=\"384\" y=\"96\" class=\"t-small\">挖掉或打進雜質</text>\n        <rect class=\"bx\" x=\"550\" y=\"30\" width=\"150\" height=\"76\" rx=\"6\"></rect>\n        <text x=\"564\" y=\"54\" class=\"t-muted\">B03</text><text x=\"564\" y=\"78\" class=\"t-strong\">4 去光阻＋清洗</text><text x=\"564\" y=\"96\" class=\"t-small\">盾牌用完拿掉</text>\n        <rect class=\"bx\" x=\"730\" y=\"30\" width=\"140\" height=\"76\" rx=\"6\"></rect>\n        <text x=\"744\" y=\"54\" class=\"t-muted\">B06</text><text x=\"744\" y=\"78\" class=\"t-strong\">5 CMP</text><text x=\"744\" y=\"96\" class=\"t-small\">磨平，給下一層用</text>\n        <line class=\"ln\" x1=\"162\" y1=\"68\" x2=\"186\" y2=\"68\" marker-end=\"url(#ah2)\"></line>\n        <line class=\"ln\" x1=\"342\" y1=\"68\" x2=\"366\" y2=\"68\" marker-end=\"url(#ah2)\"></line>\n        <line class=\"ln\" x1=\"522\" y1=\"68\" x2=\"546\" y2=\"68\" marker-end=\"url(#ah2)\"></line>\n        <line class=\"ln\" x1=\"702\" y1=\"68\" x2=\"726\" y2=\"68\" marker-end=\"url(#ah2)\"></line>\n        <polyline class=\"ln dash\" points=\"800,108 800,160 85,160 85,110\" marker-end=\"url(#ah2)\"></polyline>\n        <text x=\"300\" y=\"185\" class=\"t-small\">重複幾十輪：先進製程要用到數十道光罩，每道光罩就是跑一次迴圈</text>\n      </svg>\n      <figcaption>每一站都在這個迴圈裡。看到題目先問自己：「這一步在迴圈的第幾格？它的上一步、下一步是誰？」</figcaption>\n    </figure>\n<div class=\"table-wrap\">\n    <table>\n      <tbody><tr><th>分段</th><th>做什麼</th><th>主軸步驟</th></tr>\n      <tr><td><b>FEOL</b> 前段</td><td>在矽裡面做出電晶體本身：隔離、井、閘極、源極／汲極</td><td>1～9</td></tr>\n      <tr><td><b>MOL</b> 中段</td><td>電晶體與第一層金屬之間的接點（contact），通常是鎢插塞</td><td>10～13</td></tr>\n      <tr><td><b>BEOL</b> 後段（金屬互連）</td><td>一層一層的銅導線與介電層，把幾十億顆電晶體連起來</td><td>14 之後重複</td></tr>\n    </tbody></table>\n    </div>\n<p class=\"callout small\">⚠️ 別搞混：製程裡的「後段 BEOL」還在晶圓廠裡做；taxonomy D 類講的「後段」是封裝測試（OSAT），是另一件事。</p>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "B01",
      "anchor": "b01",
      "tag": "B01",
      "name": "晶圓製備與製程分段",
      "sub": "從砂到晶圓",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>先把矽做成一根極純的單晶棒，切成薄片拋光，才有地方做電晶體。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>CZ 法（柴氏長晶）</td><td>把晶種浸進熔融矽，一邊旋轉一邊慢慢往上拉，長成單晶矽棒。約九成的元件用 CZ 料；石英坩堝會帶入氧（約 10¹⁸ cm⁻³）</td></tr>\n        <tr><td>FZ 法（浮區法）</td><td>不用坩堝，用線圈局部熔化矽棒再讓它重新結晶。含氧、含碳都極低，用在功率元件、偵測器；直徑一般只到 200 mm</td></tr>\n        <tr><td>切片、研磨、拋光</td><td>矽棒切成晶圓，再磨平、拋成鏡面。主流直徑 300 mm（12 吋），厚度約 775 µm</td></tr>\n        <tr><td>磊晶（epitaxy）</td><td>在晶圓表面再長一層晶格對齊的單晶矽，摻雜濃度可以跟底下不同</td></tr>\n        <tr><td>RCA 清洗</td><td>SC-1（水：氨水：雙氧水＝5:1:1，75～80 °C）去微粒與有機物；SC-2（水：鹽酸：雙氧水＝6:1:1）去金屬離子</td></tr>\n        <tr><td>FEOL／MOL／BEOL</td><td>製程分段，見上面的「迴圈」段</td></tr>\n        <tr><td>WAT／PCM</td><td>晶圓做完後量測放在<b>切割道（scribe line）</b>上的測試結構（test key）：單顆電晶體的 Vt、Idsat、漏電，片電阻，contact／via chain 電阻，氧化層崩潰等。用來判斷這片晶圓的製程有沒有跑在規格內，切割時 test key 就被切掉</td></tr>\n      </tbody></table></div>",
          "anchor": "b01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼一定要單晶？</b>多晶矽有晶界，載子走到晶界會被散射、被捕捉，遷移率差、漏電大。電晶體的通道一定要放在完整的單晶裡。</li>\n        <li><b>為什麼要磊晶？</b>基板的濃度是長晶時就決定的，改不了。磊晶可以在表面長一層濃度、純度都另外設定的矽，例如 CMOS 用「低濃度磊晶層＋高濃度基板」來壓低 latch-up；SiGe 磊晶也可以給通道加應變。</li>\n        <li><b>為什麼晶圓越做越大？</b>面積大，一片能切的晶片就多，邊緣浪費的比例也降低，每顆晶片的成本就下來了。但設備全部要換，所以換代很慢（200 mm → 300 mm 花了十幾年）。</li>\n        <li><b>為什麼一直在清洗？</b>前段每一步之間幾乎都會清洗。一顆微粒落在閘極上就是一個 killer defect，所以清洗是整個流程裡次數最多的步驟之一。</li>\n      </ul>",
          "anchor": "b01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>wafer map 上缺陷集中在邊緣一圈</td><td>邊緣的膜厚、應力、清洗都最難控制；晶圓邊緣夾持處容易掉微粒</td><td>加邊緣清洗（bevel clean）、調整邊緣排除區、查夾持與傳送機構</td></tr>\n        <tr><td>缺陷隨機散布、到處都有</td><td>微粒污染：清洗不足、機台或環境髒</td><td>加強清洗、查機台 particle monitor、查無塵室</td></tr>\n        <tr><td>某批次漏電普遍偏高</td><td>金屬離子污染（Fe、Cu、Na 等）擴散進矽</td><td>SC-2 清洗、查化學品與管路純度、用 getter 吸附</td></tr>\n        <tr><td>閘極氧化層提早崩潰，GOI／TDDB 測試變差</td><td>金屬污染進入氧化層或介面，形成缺陷，讓氧化層更早崩潰</td><td>同上，加強清洗與化學品純度管控，並監控 GOI test key</td></tr>\n        <tr><td>Vt 在高溫偏壓後緩慢漂移</td><td>可動離子（Na⁺、K⁺）污染氧化層，受電場推動移向介面，改變氧化層電荷</td><td>管控鈉污染來源（人、化學品、石英器材）、用 SiN／PSG 等擋離子的鈍化層；用 BTS（偏溫應力）C–V 量測確認</td></tr>\n        <tr><td>清洗後表面變粗糙，閘極氧化層容易崩潰</td><td>SC-1 裡的氨水會微微蝕刻矽</td><td>降低氨水比例（水：氨水：雙氧水從 5:1:1 降到約 5:0.2:1），去微粒效果差不多、粗糙度較低</td></tr>\n        <tr><td>功率元件電阻率或載子壽命不足</td><td>CZ 料含氧太高</td><td>改用 FZ 料（但直徑受限在 200 mm 左右）</td></tr>\n      </tbody></table></div>",
          "anchor": "b01-l3"
        }
      ]
    },
    {
      "id": "B02",
      "anchor": "b02",
      "tag": "B02",
      "name": "微影",
      "sub": "畫圖形",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>像照相一樣，把光罩上的圖形縮小投影到光阻上；光阻顯影後就變成下一步蝕刻或佈植的「盾牌」。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 640 190\" role=\"img\" aria-label=\"各世代曝光光源的波長比較\">\n        <text x=\"0\" y=\"16\" class=\"t-muted\">光源波長（nm，越短能印越細）</text>\n        <text x=\"0\" y=\"50\">i-line 汞燈</text><rect class=\"bx-soft\" x=\"150\" y=\"36\" width=\"438\" height=\"20\" rx=\"3\"></rect><text x=\"596\" y=\"50\">365</text>\n        <text x=\"0\" y=\"84\">KrF 準分子雷射</text><rect class=\"bx-soft\" x=\"150\" y=\"70\" width=\"298\" height=\"20\" rx=\"3\"></rect><text x=\"456\" y=\"84\">248</text>\n        <text x=\"0\" y=\"118\">ArF（含浸潤式）</text><rect class=\"bx-soft\" x=\"150\" y=\"104\" width=\"232\" height=\"20\" rx=\"3\"></rect><text x=\"390\" y=\"118\">193</text>\n        <text x=\"0\" y=\"152\">EUV</text><rect class=\"fill-accent\" x=\"150\" y=\"138\" width=\"16\" height=\"20\" rx=\"3\"></rect><text x=\"174\" y=\"152\" class=\"t-accent\">13.5</text>\n        <text x=\"0\" y=\"182\" class=\"t-small\">ArF 浸潤式把鏡頭和晶圓之間填滿水，等效 NA 可到 1.35；EUV 波長一口氣縮短十幾倍，但只能用反射鏡、要在真空裡跑。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>光阻（photoresist, PR）</td><td>感光材料。<b>正光阻</b>：被照到的地方顯影時溶掉；<b>負光阻</b>：被照到的地方留下來。先進製程以正光阻為主</td></tr>\n        <tr><td>光罩（mask／reticle）</td><td>畫著電路圖形的石英板。曝光機通常以 4 倍縮小投影到晶圓上</td></tr>\n        <tr><td>步驟</td><td>塗佈 → 軟烤 → 曝光 → 曝後烤 → 顯影 → 硬烤 → 檢查</td></tr>\n        <tr><td>解析度 R</td><td>能印出的最小線寬：<code>R = k₁ · λ / NA</code>。EUV（NA 0.33）約 13 nm，High-NA（0.55）約 8 nm</td></tr>\n        <tr><td>景深 DOF</td><td>焦距上下還能清楚成像的範圍：<code>DOF = k₂ · λ / NA²</code></td></tr>\n        <tr><td>NA（數值孔徑）</td><td>鏡頭收光的角度，越大越能印細。EUV 一般 0.33，High-NA EUV 0.55</td></tr>\n        <tr><td>疊對（overlay）</td><td>這一層圖形跟上一層對得準不準</td></tr>\n        <tr><td>多重曝光</td><td>一層圖形拆成兩次以上曝光或用側壁自對準加倍密度：LELE、SADP、SAQP</td></tr>\n      </tbody></table></div>",
          "anchor": "b02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>想印更細有三個把手：</b>縮短波長 λ、加大 NA、壓低 k₁（靠光罩修正 OPC、相移光罩、離軸照明等技巧）。單次曝光的 k₁ 理論下限是 0.25，量產典型約 0.4；要低於 0.25 只能靠多重曝光。</li>\n        <li><b>解析度和景深互相拉扯：</b>NA 加大，R 跟著 NA 變小，但 DOF 跟著 NA² 縮得更快。景深變淺，晶圓只要有一點不平就會失焦，所以下一層之前一定要 CMP 磨平。</li>\n        <li><b>為什麼要多重曝光？</b>EUV 還沒成熟前，193 nm 浸潤式單次曝光的極限約 36～40 nm 半間距（half-pitch）；要更密就只能拆成兩三次曝光，代價是光罩、步驟、疊對誤差都跟著翻倍。</li>\n        <li><b>EUV 貴在哪？</b>13.5 nm 的光會被所有材料吸收，連空氣也會，所以整台要抽真空、只能用多層膜反射鏡，光源又很難做亮，產能和成本都是挑戰。換來的是一次曝光取代好幾次多重曝光。</li>\n        <li><b>為什麼先進製程的設計規則要求線條單向、固定間距？</b>離軸照明、多重曝光都是針對「同一方向、同一間距的密集線」最佳化的。圖形方向和間距一亂，光學成像就變差、OPC 也修不回來。所以 poly 和低層金屬限定只能走一個方向、只用幾種固定 pitch（restricted design rules），彎折與跨層交給上下層處理。</li>\n        <li><b>為什麼光阻也有極限？</b>線越細，光阻相對變得又高又窄，顯影乾燥時會被表面張力拉倒（pattern collapse）；光阻變薄又撐不住蝕刻，要改用硬遮罩。</li>\n      </ul>",
          "anchor": "b02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>細線光阻倒塌、黏在一起</td><td>深寬比太高，顯影沖洗時表面張力把線拉倒</td><td>光阻減薄並改用硬遮罩、用低表面張力的沖洗液、放寬線寬</td></tr>\n        <tr><td>接觸孔沒對到下面的閘極或導線</td><td>疊對誤差（overlay）超標：前面的沉積、退火、CMP 造成晶圓變形，鏡頭受熱畸變，機台間差異</td><td>製程端：重做（rework：去光阻重新曝光）、調整對準補償、同一層盡量用同一台機台。設計端：加大 via／contact 外面的金屬包覆（enclosure）、用重複 via，讓小偏移不會變成開路</td></tr>\n        <tr><td>同一片晶圓線寬（CD）中心和邊緣不同</td><td>曝光劑量或焦距不均、曝後烤（PEB）溫度不均（化學放大光阻對 PEB 溫度很敏感）、晶圓不平</td><td>調整劑量／焦距補償、查烤盤均勻度、檢查前一層 CMP 的平坦度</td></tr>\n        <tr><td>線寬隨圖形疏密而變（密區和孤立線不一樣）</td><td>光學鄰近效應</td><td>光罩加 OPC 修正，或在孤立區加輔助圖形</td></tr>\n        <tr><td>光阻圖形邊緣出現波浪、底部有腳</td><td>駐波效應：光在光阻裡上下反射干涉</td><td>加抗反射層（BARC）、做曝後烤（PEB）讓邊緣平滑</td></tr>\n        <tr><td>浸潤式曝光後出現水痕、氣泡狀缺陷</td><td>殘水留在光阻上、光阻與水的附著不良</td><td>光阻上加一層 topcoat、調整掃描速度與水的回收</td></tr>\n        <tr><td>多重曝光後線寬一粗一細交替（pitch walking）</td><td>兩次曝光之間疊對偏移，或 SADP 的芯軸線寬偏差</td><td>收緊兩次曝光的 overlay、控制芯軸 CD</td></tr>\n      </tbody></table></div>",
          "anchor": "b02-l3"
        }
      ]
    },
    {
      "id": "B03",
      "anchor": "b03",
      "tag": "B03",
      "name": "蝕刻",
      "sub": "挖掉不要的",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>光阻蓋住要留的地方，蝕刻把沒蓋到的膜挖掉。好的蝕刻要<b>挖得準、挖得直、各處挖得一樣</b>。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 230\" role=\"img\" aria-label=\"選擇比、非等向性、均勻度三個指標的示意\">\n        <!-- 選擇比 -->\n        <text x=\"10\" y=\"18\" class=\"t-strong\">選擇比：挖得準</text>\n        <text x=\"10\" y=\"36\" class=\"t-small\">比的是不同材料</text>\n        <rect class=\"m-pr\" x=\"10\" y=\"60\" width=\"90\" height=\"20\"></rect>\n        <rect class=\"m-pr\" x=\"180\" y=\"60\" width=\"90\" height=\"20\"></rect>\n        <rect class=\"m-ox\" x=\"10\" y=\"80\" width=\"90\" height=\"70\"></rect>\n        <rect class=\"m-ox\" x=\"180\" y=\"80\" width=\"90\" height=\"70\"></rect>\n        <rect class=\"m-sub\" x=\"10\" y=\"150\" width=\"260\" height=\"40\"></rect>\n        <text x=\"110\" y=\"74\" class=\"t-small\">分母：光阻</text>\n        <text x=\"110\" y=\"120\" class=\"t-small\">分子：目標膜</text>\n        <text x=\"110\" y=\"176\" class=\"t-small\">分母：底層</text>\n        <text x=\"10\" y=\"215\" class=\"t-small\">目標蝕刻速率 ÷ 光阻（或底層）蝕刻速率</text>\n\n        <!-- 非等向性 -->\n        <text x=\"320\" y=\"18\" class=\"t-strong\">非等向性：挖得直</text>\n        <text x=\"320\" y=\"36\" class=\"t-small\">比的是不同方向</text>\n        <rect class=\"m-pr\" x=\"320\" y=\"60\" width=\"50\" height=\"20\"></rect>\n        <rect class=\"m-pr\" x=\"430\" y=\"60\" width=\"50\" height=\"20\"></rect>\n        <path class=\"m-ox\" d=\"M320,80 L370,80 Q370,80 368,82 Q352,96 352,150 L320,150 Z\"></path>\n        <path class=\"m-ox\" d=\"M480,80 L430,80 Q430,80 432,82 Q448,96 448,150 L480,150 Z\"></path>\n        <text x=\"352\" y=\"200\" class=\"t-small\">等向：側向底切</text>\n        <rect class=\"m-pr\" x=\"520\" y=\"60\" width=\"50\" height=\"20\"></rect>\n        <rect class=\"m-pr\" x=\"630\" y=\"60\" width=\"50\" height=\"20\"></rect>\n        <rect class=\"m-ox\" x=\"520\" y=\"80\" width=\"50\" height=\"70\"></rect>\n        <rect class=\"m-ox\" x=\"630\" y=\"80\" width=\"50\" height=\"70\"></rect>\n        <rect class=\"m-sub\" x=\"320\" y=\"150\" width=\"360\" height=\"30\"></rect>\n        <text x=\"548\" y=\"200\" class=\"t-small\">非等向：垂直側壁</text>\n\n        <!-- 均勻度 -->\n        <text x=\"730\" y=\"18\" class=\"t-strong\">均勻度：各處一樣</text>\n        <text x=\"730\" y=\"36\" class=\"t-small\">比的是不同位置</text>\n        <circle class=\"bx\" cx=\"800\" cy=\"120\" r=\"62\"></circle>\n        <circle class=\"fill-soft\" cx=\"800\" cy=\"120\" r=\"40\"></circle>\n        <text x=\"783\" y=\"125\" class=\"t-small\">中心</text>\n        <text x=\"775\" y=\"174\" class=\"t-small\">邊緣</text>\n        <text x=\"730\" y=\"215\" class=\"t-small\">整片晶圓蝕刻速率的差異</text>\n      </svg>\n      <figcaption>三個指標都寫成「速率 ÷ 速率」或速率差異，先問分子分母差在哪：材料不同 → 選擇比；方向不同 → 非等向性；位置不同 → 均勻度。</figcaption>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>濕式蝕刻</td><td>泡化學藥液，例如用 HF 蝕刻 SiO₂。各方向一起吃（等向性），選擇比高、便宜。1980 年代起關鍵層逐步改用乾式</td></tr>\n        <tr><td>乾式蝕刻（電漿蝕刻）</td><td>用電漿裡的離子和自由基。主流是 RIE（反應離子蝕刻）：化學反應加上離子往下轟擊，可以挖得很直</td></tr>\n        <tr><td id=\"b03-selectivity\">選擇比（selectivity）</td><td>目標膜的蝕刻速率 ÷ 遮罩或底層的蝕刻速率。越高越能只吃目標。例：HBr 電漿蝕刻多晶矽，對氧化層可以超過 100:1</td></tr>\n        <tr><td>非等向性（anisotropy）</td><td>垂直和水平蝕刻速率的差異。完全非等向＝側壁垂直、沒有底切</td></tr>\n        <tr><td>均勻度（uniformity）</td><td>整片晶圓（或晶圓之間）蝕刻速率的一致程度</td></tr>\n        <tr><td>終點偵測（end-point detection）</td><td>監看電漿發光光譜（OES），目標膜一挖穿，光譜裡的特定譜線就會變，表示該停了</td></tr>\n        <tr><td>ALE（原子層蝕刻）</td><td>ALD 的反向：先讓表面一層改質，再只移除改質層，一次一層、自我限制。精準但慢</td></tr>\n        <tr><td>過蝕刻（over-etch）</td><td>到終點後刻意多挖一點，確保整片晶圓都挖乾淨</td></tr>\n        <tr><td>去光阻（strip／ashing）</td><td>蝕刻完用氧電漿把光阻燒掉，再清洗</td></tr>\n      </tbody></table></div>",
          "anchor": "b03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼先進製程幾乎都用乾式？</b>濕式各方向一起吃，挖多深就往側邊吃多寬。線寬比膜厚還細的時候，濕式會把圖形整個吃掉。乾式靠垂直轟擊的離子，可以只往下挖。</li>\n        <li><b>那濕式為什麼還在？</b>選擇比極高、不傷表面、便宜，適合整面去除、清洗、去除犧牲層這類不需要畫圖形的地方。</li>\n        <li><b>為什麼需要過蝕刻？選擇比為什麼更重要？</b>整片晶圓的膜厚和蝕刻速率都有差異，最慢的地方挖穿時，最快的地方早就碰到底層了。過蝕刻的這段時間，全靠對底層的選擇比來保護。</li>\n        <li><b>非等向性和選擇比常常互相拉扯：</b>離子轟擊越強，挖得越直，但物理轟擊不挑材料，選擇比就降下來；化學成分越多，選擇比高，卻比較等向。調 recipe 就是在兩者之間找平衡。</li>\n        <li><b>為什麼要停止層？</b>直接靠時間控制很難剛好停在介面上。在目標膜下面墊一層很難被蝕刻的材料（例如 SiN 墊在 SiO₂ 下面），靠高選擇比讓蝕刻自己停住。</li>\n      </ul>",
          "anchor": "b03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>深孔的底部沒挖穿，淺的、寬的卻已經挖過頭</td><td>深寬比相依蝕刻（ARDE，又叫 RIE lag）：孔越深越窄，反應物和離子越難到底部</td><td>拉長過蝕刻並提高對底層的選擇比、調低壓力、脈衝電漿</td></tr>\n        <tr><td>圖形密的區域挖得比稀疏區慢</td><td>微負載效應（micro-loading）：密區要吃的面積大，局部反應物被耗光。⚠️ 有些文獻把它跟 ARDE 當同義詞，題目若混用，看它講的是「深寬比」還是「圖形密度」</td><td>調整氣體流量與壓力、在設計端讓圖形密度均勻（dummy pattern）</td></tr>\n        <tr><td>多晶矽閘極底部被側向咬出缺口（notching）</td><td>過蝕刻時間太長，底下氧化層表面累積電荷，把離子往側邊偏轉</td><td>縮短過蝕刻、降低偏壓功率、用脈衝電漿減少電荷累積</td></tr>\n        <tr><td>光阻底下被側向掏空、線變細</td><td>蝕刻太等向：化學成分太多、離子方向性不足</td><td>提高偏壓加強離子方向性、加側壁保護的聚合物氣體</td></tr>\n        <tr><td>底層被挖出凹陷、元件漏電</td><td>過蝕刻太多或對底層的選擇比不夠</td><td>縮短過蝕刻、改氣體配方提高選擇比、加停止層、校正終點偵測</td></tr>\n        <tr><td>挖完還有殘渣、相鄰導線短路</td><td>蝕刻不完全（終點判斷太早）或生成物沉積在側壁</td><td>延長過蝕刻、加蝕刻後清洗、查終點偵測是否太早觸發</td></tr>\n        <tr><td>光阻還沒挖完就沒了，圖形消失</td><td>對光阻的選擇比太低、光阻太薄</td><td>改用硬遮罩（SiN、TiN 等）、提高對光阻的選擇比</td></tr>\n        <tr><td>某些電晶體 Vt 偏移、閘極漏電大，都接在很長的金屬線上</td><td>天線效應：電漿蝕刻時長金屬線像天線一樣收集電荷，電荷沒地方放，只能穿過接在上面的薄閘極氧化層，造成損傷</td><td>設計端：照 antenna rule 把長線拆斷、跳到上層金屬再接回（上層金屬做完前電荷不會累積到閘極），或在閘極旁加 antenna diode 把電荷導到基板</td></tr>\n      </tbody></table></div>",
          "anchor": "b03-l3"
        }
      ]
    },
    {
      "id": "B04",
      "anchor": "b04",
      "tag": "B04",
      "name": "薄膜沉積",
      "sub": "鋪一層膜",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>在晶圓表面鋪一層膜（絕緣、導體或半導體），重點是<b>厚度準、成分對、凹凸地形上也鋪得均勻</b>。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 640 200\" role=\"img\" aria-label=\"階梯覆蓋：順形沉積與不順形沉積比較\">\n        <text x=\"10\" y=\"18\" class=\"t-strong\">順形（ALD）：溝槽內外一樣厚</text>\n        <rect class=\"m-sub\" x=\"10\" y=\"40\" width=\"80\" height=\"120\"></rect><rect class=\"m-sub\" x=\"170\" y=\"40\" width=\"80\" height=\"120\"></rect><rect class=\"m-sub\" x=\"90\" y=\"140\" width=\"80\" height=\"20\"></rect>\n        <path class=\"m-ild\" d=\"M10,30 L100,30 L100,130 L160,130 L160,30 L250,30 L250,40 L170,40 L170,140 L90,140 L90,40 L10,40 Z\"></path>\n        <text x=\"40\" y=\"186\" class=\"t-small\">底部、側壁、頂部厚度一樣</text>\n\n        <text x=\"340\" y=\"18\" class=\"t-strong\">不順形（PVD）：開口先被封住</text>\n        <rect class=\"m-sub\" x=\"340\" y=\"40\" width=\"80\" height=\"120\"></rect><rect class=\"m-sub\" x=\"500\" y=\"40\" width=\"80\" height=\"120\"></rect><rect class=\"m-sub\" x=\"420\" y=\"140\" width=\"80\" height=\"20\"></rect>\n        <path class=\"m-ild\" d=\"M340,22 L436,22 Q446,30 436,40 L420,40 L340,40 Z\"></path>\n        <path class=\"m-ild\" d=\"M580,22 L484,22 Q474,30 484,40 L500,40 L580,40 Z\"></path>\n        <rect class=\"m-ild\" x=\"420\" y=\"130\" width=\"80\" height=\"10\"></rect>\n        <text x=\"430\" y=\"18\" class=\"t-small\"></text>\n        <text x=\"440\" y=\"90\" class=\"t-small\">空洞</text>\n        <text x=\"350\" y=\"186\" class=\"t-small\">開口頂部長出懸垂（overhang），底部只鋪到一點</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>方法</th><th>原理</th><th>常用在</th></tr>\n        <tr><td>熱氧化</td><td>矽直接跟氧反應長出 SiO₂（會吃掉一部分矽）</td><td>早期的閘極氧化層、墊氧化層</td></tr>\n        <tr><td>CVD（化學氣相沉積）</td><td>氣體在表面反應，生成固體膜。LPCVD 低壓、高溫、膜質好；PECVD 用電漿輔助，溫度低</td><td>SiO₂、SiN、多晶矽、介電層</td></tr>\n        <tr><td>PVD（物理氣相沉積，濺鍍 sputter）</td><td>用離子把靶材的原子撞下來，飛到晶圓上</td><td>金屬：Ti、TiN、Ta、TaN、銅晶種層</td></tr>\n        <tr><td>ALD（原子層沉積）</td><td>兩種前驅物輪流通入，每一次只會在表面吸附一層就停（自我限制），一個循環約 0.1 nm（例：Al₂O₃ 約 0.11 nm）</td><td>high-k 閘極介電層、極薄的阻障層</td></tr>\n        <tr><td>電鍍（ECP）</td><td>在晶種層上用電化學把銅長厚</td><td>銅導線</td></tr>\n        <tr><td>階梯覆蓋（step coverage）</td><td>溝槽或孔底部（或側壁）的膜厚 ÷ 表面膜厚，越接近 100% 越好</td><td>評估填溝能力</td></tr>\n      </tbody></table></div>",
          "anchor": "b04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 ALD 階梯覆蓋最好？</b>它的反應是自我限制的：表面吸滿一層就停，不管是溝底還是頂部都只長一層，所以處處一樣厚。代價是一層一層長，很慢，只適合極薄的膜。</li>\n        <li><b>為什麼 PVD 階梯覆蓋差？</b>濺出來的原子幾乎直線飛行，開口頂部的轉角最容易接到，越長越凸（overhang），把溝底遮住，深孔就可能封口留下空洞。</li>\n        <li><b>為什麼要 PECVD？</b>後段已經有金屬導線，不能再加熱到幾百度以上（鋁會融、銅會擴散、前面的摻雜也會跑）。電漿提供反應能量，可以在較低溫下沉積。</li>\n        <li><b>熱氧化和 CVD 氧化層差在哪？</b>熱氧化是矽本身長出來的，介面最乾淨、膜質最好，但要高溫，而且只能長在矽上；CVD 可以長在任何東西上面、溫度低，但膜質和介面較差。</li>\n        <li><b>鈍化層（passivation）是什麼？</b>晶片最上面一層 SiN／SiO₂，擋水氣、離子和刮傷，保護下面的電路。</li>\n      </ul>",
          "anchor": "b04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>介電層填溝後中間有空洞（void／seam）</td><td>溝太深太窄，開口先被封住</td><td>改用填溝能力好的製程（HDP-CVD：邊沉積邊濺掉頂角；或 ALD），或沉積—回蝕—再沉積</td></tr>\n        <tr><td>深孔底部的阻障層太薄，銅擴散進介電層造成漏電</td><td>PVD 階梯覆蓋不足</td><td>改用離子化 PVD 或 ALD 阻障層、調整孔的形狀（上寬下窄）</td></tr>\n        <tr><td>膜裂開或剝落、晶圓翹曲</td><td>膜應力太大或附著力不足</td><td>調整沉積條件降低應力、加附著層、做表面前處理</td></tr>\n        <tr><td>同一片晶圓膜厚中心和邊緣不同</td><td>氣流、溫度或電漿分布不均；壓力太高時氣相反應太多</td><td>調整氣體分配、溫度分區與電漿功率；改用低壓 CVD（LPCVD）抑制氣相反應</td></tr>\n      </tbody></table></div>",
          "anchor": "b04-l3"
        }
      ]
    },
    {
      "id": "B05",
      "anchor": "b05",
      "tag": "B05",
      "name": "摻雜與熱製程",
      "sub": "改變導電性",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>把雜質原子打進矽裡改變導電性，再加熱讓它「上工」。<b>熱預算</b>是整個製程共用的額度，越後面越不能加熱。</p>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>n 型／p 型雜質</td><td>n 型：磷（P）、砷（As），多一個電子；p 型：硼（B），少一個電子（多一個電洞）</td></tr>\n        <tr><td>離子佈植（ion implantation）</td><td>把雜質變成離子、加速後直接射進矽裡。主流摻雜方式</td></tr>\n        <tr><td>劑量（dose）</td><td>每平方公分打進幾顆離子，決定<b>濃度</b></td></tr>\n        <tr><td>能量（energy）</td><td>加速電壓，決定打得<b>多深</b>。典型 10～500 keV，深度約 10 nm～1 µm；平均停下來的深度叫投影射程 Rp</td></tr>\n        <tr><td>擴散</td><td>高溫下雜質從高濃度往低濃度跑。早期的摻雜方法，現在多半是「不想要的副作用」</td></tr>\n        <tr><td>退火（anneal）</td><td>佈植後加熱：修復被撞壞的晶格，並讓雜質進到晶格位置上才會導電（活化）</td></tr>\n        <tr><td>RTA／spike／雷射退火</td><td>快速升降溫的退火：RTA 幾秒內升到 1000 °C 以上；spike 不到 1 秒；閃光燈退火毫秒級、雷射退火更短</td></tr>\n        <tr><td>熱預算（thermal budget）</td><td>溫度 × 時間的總量。累積越多，雜質擴散得越遠</td></tr>\n      </tbody></table></div>",
          "anchor": "b05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼用佈植，不用擴散？</b>佈植的劑量和深度可以分開調、精準又可重複，而且可以在室溫下用光阻當遮罩。擴散要高溫，濃度深度綁在一起，橫向也會跑。</li>\n        <li><b>為什麼佈植完一定要退火？</b>高速離子會把晶格撞亂，被打進去的雜質大多卡在晶格縫隙裡，不提供載子。退火讓晶格恢復，雜質坐上晶格位置才算活化。</li>\n        <li><b>為什麼退火越做越短？</b>要活化就要高溫，但高溫一久，雜質就會擴散，接面變深、通道變短。極短時間的高溫（spike、雷射、閃光退火）可以活化又幾乎不擴散，用來做超淺接面。</li>\n        <li><b>為什麼晶圓要傾斜約 7° 佈植？</b>單晶矽沿某些方向有「隧道」，離子順著隧道會打得特別深（channeling）。傾斜一個角度可以避開隧道，讓深度分布可預期。</li>\n        <li><b>TED 為什麼「暫態」？</b>佈植撞出很多多餘的矽間隙原子，它們會把硼踢到間隙位置、讓硼擴散快上百倍（約 800 °C 時）。這些多餘原子被退火消化掉之後，擴散就恢復正常，所以只發生在退火初期。</li>\n        <li><b>自對準（self-aligned）是什麼？</b>源極／汲極佈植時，閘極本身就是遮罩，所以源汲極一定剛好落在閘極兩側，不需要另外對準。主軸第 8 步就是這個。</li>\n      </ul>",
          "anchor": "b05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>片電阻（sheet resistance）偏高</td><td>退火不足、活化率低；或劑量打少了</td><td>檢查退火溫度與時間、量測佈植劑量、查機台劑量校正</td></tr>\n        <tr><td>接面比設計的深、短通道效應變嚴重</td><td>熱預算太多，雜質擴散；或暫態增強擴散（TED）</td><td>改用 spike／雷射退火、減少後續高溫步驟、預先非晶化（PAI）或共佈植碳抑制擴散</td></tr>\n        <tr><td>深度分布有一條長尾、元件特性不一</td><td>channeling</td><td>確認晶圓傾斜與旋轉角（常見 7° tilt／22° twist）、先做非晶化佈植、加一層薄氧化層打散離子</td></tr>\n        <tr><td>Vt 整批偏移</td><td>通道佈植劑量或能量錯誤、退火溫度偏離</td><td>對照 WAT 資料追到是哪一層佈植、查機台紀錄。只有 NMOS 偏、PMOS 正常 → 範圍縮到只影響 NMOS 的那幾層（p-well、NMOS Vt 調整佈植）；兩者同方向偏 → 先懷疑共用的步驟（閘極氧化層厚度、閘長、退火）</td></tr>\n        <tr><td>靠近 well 邊緣的電晶體 Vt 跟 well 中央的不一樣</td><td>well proximity effect（WPE）：高能量佈植 well 時，離子撞到光阻側壁被散射，打進邊緣附近的矽，讓那裡的濃度變高</td><td>匹配要求高的元件放在離 well 邊緣夠遠的地方，模擬時開啟 WPE 參數</td></tr>\n        <tr><td>晶圓出現滑移線（slip line）</td><td>RTP 溫度不均、邊緣散熱快或升降溫太快，熱應力超過矽的降伏強度</td><td>多區溫控、邊緣補償環、降低升降溫速率</td></tr>\n      </tbody></table></div>",
          "anchor": "b05-l3"
        }
      ]
    },
    {
      "id": "B06",
      "anchor": "b06",
      "tag": "B06",
      "name": "CMP 與金屬互連",
      "sub": "磨平與接線",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>CMP 把表面磨平，讓下一層微影對得到焦；銅導線靠「先挖溝、再填銅、再磨掉多的」的鑲嵌法（damascene）做出來。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 640 170\" role=\"img\" aria-label=\"CMP 的碟形凹陷與侵蝕\">\n        <text x=\"10\" y=\"18\" class=\"t-strong\">碟形凹陷（dishing）</text>\n        <text x=\"10\" y=\"36\" class=\"t-small\">寬的銅線中間被磨凹</text>\n        <rect class=\"m-ild\" x=\"10\" y=\"60\" width=\"40\" height=\"70\"></rect>\n        <path class=\"m-cu\" d=\"M50,60 Q130,84 210,60 L210,130 L50,130 Z\"></path>\n        <rect class=\"m-ild\" x=\"210\" y=\"60\" width=\"40\" height=\"70\"></rect>\n        <line class=\"ln dash\" x1=\"10\" y1=\"60\" x2=\"250\" y2=\"60\"></line>\n\n        <text x=\"340\" y=\"18\" class=\"t-strong\">侵蝕（erosion）</text>\n        <text x=\"340\" y=\"36\" class=\"t-small\">密集的細線區，連介電層一起被磨低</text>\n        <rect class=\"m-ild\" x=\"340\" y=\"60\" width=\"40\" height=\"70\"></rect>\n        <rect class=\"m-ild\" x=\"380\" y=\"72\" width=\"10\" height=\"58\"></rect><rect class=\"m-cu\" x=\"390\" y=\"72\" width=\"16\" height=\"58\"></rect>\n        <rect class=\"m-ild\" x=\"406\" y=\"72\" width=\"10\" height=\"58\"></rect><rect class=\"m-cu\" x=\"416\" y=\"72\" width=\"16\" height=\"58\"></rect>\n        <rect class=\"m-ild\" x=\"432\" y=\"72\" width=\"10\" height=\"58\"></rect><rect class=\"m-cu\" x=\"442\" y=\"72\" width=\"16\" height=\"58\"></rect>\n        <rect class=\"m-ild\" x=\"458\" y=\"72\" width=\"10\" height=\"58\"></rect><rect class=\"m-cu\" x=\"468\" y=\"72\" width=\"16\" height=\"58\"></rect>\n        <rect class=\"m-ild\" x=\"484\" y=\"72\" width=\"10\" height=\"58\"></rect>\n        <rect class=\"m-ild\" x=\"494\" y=\"60\" width=\"86\" height=\"70\"></rect>\n        <line class=\"ln dash\" x1=\"340\" y1=\"60\" x2=\"580\" y2=\"60\"></line>\n        <text x=\"10\" y=\"160\" class=\"t-small\">虛線是原本應有的平面。兩種都會讓導線變薄、電阻上升，表面不平也會吃掉下一層微影的景深。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>CMP（化學機械研磨）</td><td>晶圓壓在旋轉的研磨墊（pad）上，加研磨液（slurry）：化學成分把表面軟化，磨粒把它磨掉</td></tr>\n        <tr><td>鑲嵌（damascene）</td><td>先在介電層挖出溝槽，再填銅，最後用 CMP 磨掉溝槽外多餘的銅。<b>單鑲嵌</b>：溝和孔分兩次做；<b>雙鑲嵌</b>：溝和孔一次填</td></tr>\n        <tr><td>阻障層／襯墊層（barrier／liner）</td><td>溝槽裡先鋪一層 TaN／Ta，擋住銅往介電層擴散，也幫銅附著</td></tr>\n        <tr><td>晶種層（seed）</td><td>用 PVD 鋪一層薄銅，讓後面的電鍍有地方長</td></tr>\n        <tr><td>碟形凹陷／侵蝕</td><td>見上圖</td></tr>\n        <tr><td>dummy fill</td><td>在空曠的地方補一些不接電的假圖形，讓整片的圖形密度均勻，CMP 才磨得平</td></tr>\n        <tr><td>low-k 介電層</td><td>介電常數比 SiO₂（3.9）低的絕緣材料：摻氟氧化物約 3.5、摻碳氧化物約 3.0、多孔材料可低於 2.0</td></tr>\n        <tr><td>插塞（plug）</td><td>MOL 的接觸孔通常填鎢，再用 CMP 磨平</td></tr>\n      </tbody></table></div>",
          "anchor": "b06-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼一定要 CMP？</b>每疊一層，表面就會跟著下面的圖形高低起伏，層數一多就像丘陵。微影的景深很淺，表面不平就無法整片對焦。CMP 把每一層磨平，十幾層金屬才疊得上去。</li>\n        <li><b>為什麼從鋁換成銅？</b>銅的電阻率比鋁低約 40%，抗電遷移也好得多。線越細，導線延遲越主導速度，所以 1990 年代末開始換成銅：IBM 1997 年發表、1998 年出貨（0.22 µm 世代）。</li>\n        <li><b>為什麼銅不能像鋁一樣直接蝕刻？</b>銅和蝕刻氣體反應的生成物不會揮發，電漿挖不掉。只好倒過來做：先挖介電層的溝，再把銅填進去、磨掉多的，這就是鑲嵌法。</li>\n        <li><b>為什麼一定要阻障層？</b>銅在矽和氧化層裡擴散得很快，跑進矽會形成深能階、造成漏電，跑進介電層會造成短路。但阻障層本身電阻高，線越細它占掉的導電截面越多，所以先進製程要把它做得越薄越好。</li>\n        <li><b>為什麼要 low-k？</b>導線越密，線與線之間的電容越大，RC 延遲和功耗都上升。代價是 low-k 材料多孔、機械強度差，CMP 和封裝時容易裂。</li>\n        <li><b>dishing 和 erosion 差在哪？</b>dishing 是單一寬線中間被磨凹（銅比介電層軟）；erosion 是密集區整塊連介電層一起被磨低（局部壓力集中）。前者靠限制最大線寬，後者靠圖形密度規則與 dummy fill。</li>\n      </ul>",
          "anchor": "b06-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>先進節點的細銅線電阻比預期高很多</td><td>線越細，阻障層／襯墊層占截面的比例越大（它們的電阻比銅高很多），銅本身也因表面與晶界散射而電阻率上升</td><td>用 ALD 把阻障層做得更薄（<b>不是加厚</b>），或在最細的幾層改用鈷（Co）、釕（Ru）等可以少用或不用阻障層的金屬</td></tr>\n        <tr><td>寬的電源線電阻偏高</td><td>dishing 讓寬線中間變薄</td><td>寬線改成開槽（slotting）或拆成多條，調整研磨液選擇比與研磨時間</td></tr>\n        <tr><td>密集導線區電阻偏高、下一層微影失焦</td><td>erosion：密區整塊被磨低</td><td>依密度規則補 dummy fill、調整研磨壓力與墊子</td></tr>\n        <tr><td>相鄰導線短路</td><td>CMP 沒把溝外的銅或阻障層磨乾淨（殘留）</td><td>延長過研磨、加研磨後檢查與清洗</td></tr>\n        <tr><td>WAT 的 via chain 電阻偶發偏高，量產良率有少量開路</td><td>via 底部殘留、阻障層不連續、疊對偏移，讓少數 via 接觸不良或斷開</td><td>製程端查蝕刻後清洗與阻障層覆蓋；設計端盡量用重複 via（redundant／double via），一個壞了還有另一個</td></tr>\n        <tr><td>導線間漏電、可靠度測試失敗</td><td>阻障層太薄或不連續，銅擴散進介電層</td><td>改善阻障層覆蓋（ALD 或離子化 PVD）、檢查孔底厚度</td></tr>\n        <tr><td>表面刮傷、low-k 層裂開或剝落</td><td>研磨液顆粒團聚、研磨墊堵塞、修整器掉顆粒；low-k 機械強度低，壓力太大就裂</td><td>過濾研磨液、定期修整研磨墊（conditioning）、改用低壓研磨。刮傷事後洗不掉，只能事前防</td></tr>\n        <tr><td>長時間使用後導線斷開</td><td>電遷移（EM）：電流密度太高，電子把銅原子推著走，形成空洞（斷路）或凸丘（短路）。壽命大約跟電流密度的平方成反比（Black 方程）</td><td>加寬導線降低電流密度、改善銅與蓋層的介面；設計端遵守 EM 規則</td></tr>\n      </tbody></table></div>",
          "anchor": "b06-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>選擇比 vs 非等向性 vs 均勻度</td><td>材料之間 vs 方向之間 vs 位置之間（B03）</td></tr>\n      <tr><td>解析度 vs 景深</td><td>能印多細 vs 對焦容許範圍。NA 越大前者越好、後者越差（B02）</td></tr>\n      <tr><td>劑量 vs 能量</td><td>打多少（濃度） vs 打多深（B05）</td></tr>\n      <tr><td>擴散 vs 退火</td><td>擴散是雜質移動；退火是加熱修晶格、活化雜質，擴散是它的副作用（B05）</td></tr>\n      <tr><td>CVD vs PVD vs ALD</td><td>化學反應長膜 vs 把靶材原子撞過去 vs 一次一層自我限制。階梯覆蓋：ALD &gt; CVD &gt; PVD（B04）</td></tr>\n      <tr><td>dishing vs erosion</td><td>單一寬線中間凹 vs 密集區整塊低（B06）</td></tr>\n      <tr><td>單鑲嵌 vs 雙鑲嵌</td><td>孔和溝分兩次填 vs 一次填（B06）</td></tr>\n      <tr><td>製程 BEOL vs 封裝「後段」</td><td>晶圓廠裡的金屬互連 vs 封裝測試廠（OSAT）的切割封裝</td></tr>\n      <tr><td>正光阻 vs 負光阻</td><td>照到的溶掉 vs 照到的留下（B02）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Lithography</td><td>微影</td><td>EUV lithography removes the need for multi-patterning.</td></tr>\n      <tr><td>Overlay</td><td>疊對</td><td>Overlay error exceeded spec, so the lot was reworked.</td></tr>\n      <tr><td>Critical Dimension (CD)</td><td>關鍵尺寸、線寬</td><td>CD uniformity across the wafer is ±1 nm.</td></tr>\n      <tr><td>Depth of Focus (DOF)</td><td>景深</td><td>High NA reduces the depth of focus.</td></tr>\n      <tr><td>Selectivity</td><td>選擇比</td><td>Oxide-to-nitride selectivity is above 20:1.</td></tr>\n      <tr><td>Anisotropic</td><td>非等向性的</td><td>RIE gives an anisotropic profile.</td></tr>\n      <tr><td>End-point detection</td><td>終點偵測</td><td>OES end-point detection stops the etch.</td></tr>\n      <tr><td>Step coverage</td><td>階梯覆蓋</td><td>ALD provides nearly 100% step coverage.</td></tr>\n      <tr><td>Dose / Energy</td><td>劑量／能量</td><td>The implant dose is 1e15 cm⁻² at 20 keV.</td></tr>\n      <tr><td>Thermal budget</td><td>熱預算</td><td>BEOL steps must stay within the thermal budget.</td></tr>\n      <tr><td>Activation</td><td>活化</td><td>Spike anneal improves dopant activation.</td></tr>\n      <tr><td>Damascene</td><td>鑲嵌</td><td>Copper lines are formed by dual damascene.</td></tr>\n      <tr><td>Dishing / Erosion</td><td>碟形凹陷／侵蝕</td><td>Dummy fill reduces CMP erosion.</td></tr>\n      <tr><td>Electromigration (EM)</td><td>電遷移</td><td>The power rail failed the EM check.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\" id=\"srcList\">\n      <li><b>B01</b>　https://en.wikipedia.org/wiki/Wafer_(electronics) ；https://en.wikipedia.org/wiki/RCA_clean ；https://en.wikipedia.org/wiki/Czochralski_method ；https://en.wikipedia.org/wiki/Float-zone_silicon ；https://en.wikipedia.org/wiki/Epitaxy ；https://en.wikipedia.org/wiki/Front_end_of_line ；https://en.wikipedia.org/wiki/Back_end_of_line ；https://semiengineering.com/new-beolmol-breakthroughs ；https://patents.google.com/patent/US5919311</li>\n      <li><b>B02</b>　https://en.wikipedia.org/wiki/Photolithography ；https://en.wikipedia.org/wiki/Immersion_lithography ；https://www.asml.com/en/products/euv-lithography-systems ；https://en.wikipedia.org/wiki/Multiple_patterning ；SPIE 5376（rinse surfactant 與 pattern collapse）；https://research.ibm.com/publications/high-order-wafer-alignment-in-manufacturing ；https://www.osti.gov/biblio/900653</li>\n      <li><b>B03</b>　https://en.wikipedia.org/wiki/Etching_(microfabrication) ；https://en.wikipedia.org/wiki/Reactive-ion_etching ；https://en.wikipedia.org/wiki/Atomic_layer_etching ；SPIE 470（poly-Si 對 oxide 100:1 選擇比）；https://patents.google.com/patent/US9064812 （ARDE）；https://patents.google.com/patent/US7297560 （終點偵測）；MRS Proceedings（poly 閘極 notching）</li>\n      <li><b>B04</b>　https://en.wikipedia.org/wiki/Chemical_vapor_deposition ；https://en.wikipedia.org/wiki/Atomic_layer_deposition ；https://patents.google.com/patent/US7244670 （PVD overhang、IPVD、HDP-CVD）</li>\n      <li><b>B05</b>　https://en.wikipedia.org/wiki/Ion_implantation ；https://inst.eecs.berkeley.edu/~ee143/fa16/lectures/Lecture07-Ion%20Implantation.pdf ；https://en.wikipedia.org/wiki/Rapid_thermal_processing ；https://www.osti.gov/biblio/496650 （TED）；https://patents.google.com/patent/US6853802 （slip line）</li>\n      <li><b>B06</b>　https://en.wikipedia.org/wiki/Chemical-mechanical_polishing ；https://en.wikipedia.org/wiki/Copper_interconnects ；https://www.ibm.com/history/copper-interconnects ；https://en.wikipedia.org/wiki/Low-κ_dielectric ；https://en.wikipedia.org/wiki/Electromigration ；MIT Boning group（Cu CMP pattern dependency）；AVS CMP User Group 2016（microscratch）</li>\n      <li class=\"muted\">查證日 2026-10-01。定義與機制以教科書常識撰寫；數值與 L3 條目對照上列出處。單鑲嵌／雙鑲嵌的區分、熱預算的正式定義、佈植劑量的典型範圍未找到可引用的出處。</li>\n    </ol>"
        }
      ]
    }
  ]
}
