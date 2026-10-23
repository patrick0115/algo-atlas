// 原 SemiDrill 講義(git 歷史裡的 public/semi/ 原檔)搬進百科的資料;內容是原講義的 HTML 片段,改這裡就是改講義。
import type { Book } from '../types'

export const book: Book = {
  "id": "N",
  "file": "N-ai.html",
  "title": "AI 與機器學習：模型分數高，不代表它在產線上有用",
  "lead": "機器學習是<b>從資料裡學出一個函數</b>：給它影像，它吐出「是瑕疵」的分數。真正難的不是訓練，而是三件事：<b>資料切得對不對</b>（有沒有偷看答案）、<b>門檻設在哪</b>（寧可錯殺還是寧可漏放）、<b>部署後還一不一樣</b>（前處理、量化、產線光源變了沒）。這一章每個考點都圍繞這三件事。",
  "note": "<p class=\"muted small\">對應 taxonomy N01～N05。難度標籤：<span class=\"lv\">L1</span>是什麼　<span class=\"lv l2\">L2</span>為什麼　<span class=\"lv l3\">L3</span>出問題怎麼辦。</p>",
  "front": [
    {
      "id": "main",
      "title": "主圖：拉門檻看混淆矩陣，拉複雜度看過擬合",
      "blocks": [
        {
          "t": "widget",
          "id": "N.main",
          "html": "<div class=\"controls\">\n      <div class=\"seg\" id=\"mode\">\n        <button data-m=\"cm\" class=\"on\">分類門檻與混淆矩陣</button>\n        <button data-m=\"fit\">模型複雜度與過擬合</button>\n      </div>\n      <span id=\"optWrap\"></span>\n    </div>\n<div class=\"stage\">\n      <div class=\"controls\" style=\"margin:0 0 12px\" id=\"sliderWrap\"></div>\n      <div class=\"table-wrap\">\n        <svg class=\"fig\" id=\"fig\" viewBox=\"0 0 900 300\" role=\"img\" aria-label=\"互動示意圖\" style=\"min-width:640px\"></svg>\n      </div>\n      <div class=\"stage-info\">\n        <h3 id=\"stTitle\"></h3>\n        <p id=\"stWhat\"></p>\n        <div class=\"table-wrap\" id=\"mtWrap\"><table id=\"mt\"></table></div>\n      </div>\n    </div>"
        }
      ]
    },
    {
      "id": "compare",
      "title": "一張表看懂：一個 AOI 瑕疵 AI 專案走一遍",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>階段</th><th>考點</th><th>這一步要問的問題</th><th>最常見的坑</th></tr>\n      <tr><td>定義問題</td><td>N01／N05</td><td>是分類（OK／NG）、偵測（框出位置）還是分割（畫出輪廓）？漏檢和誤殺哪個貴？</td><td>只說「要準」，沒先講好用哪個指標驗收</td></tr>\n      <tr><td>收資料、標註</td><td>N04</td><td>NG 樣本夠不夠？各類瑕疵的標準有沒有寫成標註規範？</td><td>兩個人標法不一樣；NG 太少（類別不平衡）</td></tr>\n      <tr><td>切資料</td><td>N01</td><td>同一片面板、同一批 lot 有沒有同時出現在訓練和測試？</td><td>近乎重複的影像跨兩邊，驗證分數虛胖（data leakage）</td></tr>\n      <tr><td>前處理／傳統影像</td><td>N03</td><td>規則法（濾波＋二值化＋形態學）夠不夠？要不要上深度學習？</td><td>光源不均勻還用全域門檻</td></tr>\n      <tr><td>訓練</td><td>N02</td><td>用預訓練模型微調？學習率、增強怎麼設？</td><td>loss 變 NaN；train 很好、val 越來越差（過擬合）</td></tr>\n      <tr><td>評估、定門檻</td><td>N05</td><td>看混淆矩陣，不只看 accuracy；門檻依成本決定</td><td>99% accuracy 但一個瑕疵都沒抓到</td></tr>\n      <tr><td>部署</td><td>N04</td><td>匯出 ONNX、量化、跑在工控機或邊緣裝置，速度與準度都要再驗一次</td><td>前處理和訓練時不一致；INT8 後掉準度</td></tr>\n      <tr><td>上線後</td><td>N01／N04</td><td>產線換光源、換機台、新產品，分數分布有沒有漂移？</td><td>沒有監控，準度默默下滑</td></tr>\n    </tbody></table></div>"
        }
      ]
    }
  ],
  "entries": [
    {
      "id": "N01",
      "anchor": "n01",
      "tag": "N01",
      "name": "機器學習基礎",
      "sub": "切分、過擬合、正則化",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>模型的目標不是把訓練資料背熟，而是對<b>沒看過的資料</b>也答得對；所以資料要切成訓練／驗證／測試三份，<b>測試集從頭到尾鎖起來</b>，用正則化和更多資料對抗過擬合。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 160\" role=\"img\" aria-label=\"資料切分與 K-fold\">\n        <text x=\"10\" y=\"40\" class=\"t-strong\">一次切分</text>\n        <rect class=\"bx-soft\" x=\"120\" y=\"20\" width=\"518\" height=\"30\" rx=\"4\"></rect><text x=\"134\" y=\"40\">訓練 train 70%：拿來學參數</text>\n        <rect class=\"bx\" x=\"638\" y=\"20\" width=\"111\" height=\"30\"></rect><text x=\"648\" y=\"40\">驗證 val</text>\n        <rect class=\"bx-accent\" x=\"749\" y=\"20\" width=\"111\" height=\"30\"></rect><text x=\"759\" y=\"40\">測試 test</text>\n        <text x=\"10\" y=\"104\" class=\"t-strong\">K-fold</text>\n        <rect class=\"bx-soft\" x=\"120\" y=\"66\" width=\"640\" height=\"10\"></rect><rect class=\"bx\" x=\"120\" y=\"66\" width=\"128\" height=\"10\"></rect>\n        <rect class=\"bx-soft\" x=\"120\" y=\"80\" width=\"640\" height=\"10\"></rect><rect class=\"bx\" x=\"248\" y=\"80\" width=\"128\" height=\"10\"></rect>\n        <rect class=\"bx-soft\" x=\"120\" y=\"94\" width=\"640\" height=\"10\"></rect><rect class=\"bx\" x=\"376\" y=\"94\" width=\"128\" height=\"10\"></rect>\n        <rect class=\"bx-soft\" x=\"120\" y=\"108\" width=\"640\" height=\"10\"></rect><rect class=\"bx\" x=\"504\" y=\"108\" width=\"128\" height=\"10\"></rect>\n        <rect class=\"bx-soft\" x=\"120\" y=\"122\" width=\"640\" height=\"10\"></rect><rect class=\"bx\" x=\"632\" y=\"122\" width=\"128\" height=\"10\"></rect>\n        <text x=\"772\" y=\"92\" class=\"t-small\">K=5：每輪換一份</text>\n        <text x=\"772\" y=\"110\" class=\"t-small\">當 val，取平均</text>\n        <text x=\"10\" y=\"154\" class=\"t-small\">test 只在最後看一次。同一片面板、同一批 lot、同一個時間段的影像要整組分到同一邊（group／time split），否則等於偷看答案。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>監督式學習（supervised）</td><td>每筆資料都有標準答案（標籤）。輸出類別叫<b>分類</b>（OK／NG），輸出連續值叫<b>回歸</b>（預測膜厚、良率）</td></tr>\n        <tr><td>非監督式學習（unsupervised）</td><td>沒有標籤，讓模型自己找結構：<b>分群</b>（k-means，把 wafer map 失效圖樣分組）、<b>降維</b>（PCA）、<b>異常偵測</b>（只學「正常長什麼樣」，偏離就報警）</td></tr>\n        <tr><td>半監督／自監督</td><td>少量標籤＋大量未標資料；自監督是從資料本身造題目（遮住一部分讓模型猜），大型語言模型就是這樣預訓練的</td></tr>\n        <tr><td>強化學習（RL）</td><td>沒有標準答案，只有做完一連串動作後的獎勵，模型學「怎麼做獎勵最高」</td></tr>\n        <tr><td>特徵（feature）／標籤（label）</td><td>輸入的描述值／要預測的答案。傳統 ML 要人工設計特徵，深度學習自己從原始像素學特徵</td></tr>\n        <tr><td>train／val／test</td><td><b>train</b> 學參數；<b>val</b>（驗證集）挑超參數、決定何時停；<b>test</b> 最後只看一次，代表上線表現。常見比例 70／15／15 或 80／10／10，資料少時用 K-fold</td></tr>\n        <tr><td>超參數（hyperparameter）</td><td>不是學出來、而是人設定的值：學習率、層數、正則化強度、多項式階數</td></tr>\n        <tr><td>過擬合（overfitting）</td><td>把訓練資料的雜訊也背下來：train 很好、val 變差。模型太複雜或資料太少</td></tr>\n        <tr><td>欠擬合（underfitting）</td><td>模型太簡單，連 train 都學不好</td></tr>\n        <tr><td>偏差—變異取捨（bias–variance）</td><td>太簡單＝偏差大（系統性學錯）；太複雜＝變異大（換一批資料結果就變）。主圖第二個模式就是這條 U 型曲線</td></tr>\n        <tr><td>正則化（regularization）</td><td>刻意限制模型、換取泛化：<b>L2</b>（權重平方和當懲罰，深度學習裡叫 weight decay）、<b>L1</b>（絕對值和，會把很多權重壓成 0）、<b>dropout</b>、<b>early stopping</b>、資料增強</td></tr>\n        <tr><td>K-fold 交叉驗證</td><td>資料切 K 份，輪流拿一份當 val、其餘當 train，K 次結果取平均，評估比單次切分穩</td></tr>\n        <tr><td>Data leakage（資料洩漏）</td><td>訓練時用到了上線時不會有的資訊（測試資料、未來資料、近乎重複的影像），分數虛胖</td></tr>\n      </tbody></table></div>",
          "anchor": "n01-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>有了 val 為什麼還要 test？</b>你拿 val 挑了幾十次超參數，等於間接用 val「訓練」了；val 分數會偏樂觀。test 沒被任何決定碰過，才是誠實的上線預估。</li>\n        <li><b>為什麼隨機切分會出事？</b>同一片面板拍了好幾張、同一個瑕疵換角度拍，隨機切會讓近乎相同的影像同時在 train 和 test，模型「認得這張」而不是「學會瑕疵」。要按面板 ID／lot／時間切（group split、time split）。時間序列更是要嚴格「過去訓練、未來測試」。</li>\n        <li><b>L1 和 L2 正則化差在哪？</b>L2 讓所有權重都變小但不為 0，模型平滑；L1 會把不重要的權重直接壓到 0，等於自動挑特徵（稀疏）。</li>\n        <li><b>為什麼正則化能防過擬合？</b>過擬合的曲線為了穿過每個雜訊點，係數會變得很大、曲線劇烈擺動；懲罰大權重等於逼模型選平滑的解。主圖勾「L2 正則化」可以看到高階曲線被拉平。</li>\n        <li><b>過擬合時，加資料和加正則化哪個好？</b>能加真實資料永遠最好（直接降低變異）；資料拿不到才靠增強與正則化。欠擬合時加資料沒用，要換更大的模型或更好的特徵。</li>\n        <li><b>類別不平衡怎麼切？</b>用分層切分（stratified），讓每份裡 NG 的比例一樣；否則 NG 只有 1% 時，val 裡可能一個 NG 都沒有。</li>\n      </ul>",
          "anchor": "n01-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>train 準確率 99%，val 只有 80%，而且差距越訓練越大</td><td>過擬合：模型太大、資料太少</td><td>加真實資料、資料增強、L2／dropout、early stopping（在 val loss 最低點停）、換小一點的模型</td></tr>\n        <tr><td>train 和 val 都很差，而且很接近</td><td>欠擬合：模型太簡單、特徵不夠，或標籤本身很亂</td><td>加大模型、延長訓練、檢查標籤品質；先確認模型能把一小批資料背到接近 100%</td></tr>\n        <tr><td>val、test 都 98%，上線後只剩 85%</td><td>資料洩漏（同一片面板跨 train／test、近乎重複影像），或上線資料分布不同</td><td>依面板／lot／時間重新切分、去重（雜湊＋感知相似度）；拿產線真實資料另做一份 test</td></tr>\n        <tr><td>同樣設定重跑幾次，val 分數差好幾個百分點</td><td>val 太小、NG 太少，分數被少數樣本左右</td><td>擴大 val、分層切分、改用 K-fold 報平均與標準差；比較兩個模型時固定亂數種子</td></tr>\n        <tr><td>反覆對 test 調參，最後 test 很好，上線普通</td><td>test 被當成 val 用，已經不誠實</td><td>保留一份從沒碰過的 hold-out；決策只看 val</td></tr>\n        <tr><td>上線幾個月後準確率慢慢下降</td><td>資料漂移（data drift）：換光源、換機台、新產品、新製程</td><td>監控分數分布與人工抽檢結果，定期收新資料重訓</td></tr>\n      </tbody></table></div>",
          "anchor": "n01-l3"
        }
      ]
    },
    {
      "id": "N02",
      "anchor": "n02",
      "tag": "N02",
      "name": "深度學習與模型架構",
      "sub": "CNN、transformer、學習率",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>深度學習是很多層可微分的運算疊起來，用<b>反向傳播</b>算出每個權重該往哪調，再用<b>學習率</b>決定一步走多大；影像用 <b>CNN</b>（只看鄰近像素、權重共用），長序列和語言用 <b>transformer</b>（每個位置直接看所有位置）。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 170\" role=\"img\" aria-label=\"CNN 與 transformer 的看法差異\">\n        <text x=\"10\" y=\"18\" class=\"t-strong\">CNN：一次只看鄰近一小塊</text>\n        <rect class=\"bx\" x=\"20\" y=\"34\" width=\"120\" height=\"120\"></rect>\n        <line class=\"ln-soft\" x1=\"20\" y1=\"64\" x2=\"140\" y2=\"64\"></line><line class=\"ln-soft\" x1=\"20\" y1=\"94\" x2=\"140\" y2=\"94\"></line><line class=\"ln-soft\" x1=\"20\" y1=\"124\" x2=\"140\" y2=\"124\"></line>\n        <line class=\"ln-soft\" x1=\"50\" y1=\"34\" x2=\"50\" y2=\"154\"></line><line class=\"ln-soft\" x1=\"80\" y1=\"34\" x2=\"80\" y2=\"154\"></line><line class=\"ln-soft\" x1=\"110\" y1=\"34\" x2=\"110\" y2=\"154\"></line>\n        <rect class=\"bx-accent\" x=\"50\" y=\"64\" width=\"60\" height=\"60\"></rect>\n        <text x=\"156\" y=\"70\" class=\"t-small\">3×3 kernel 在整張圖上滑動，</text>\n        <text x=\"156\" y=\"90\" class=\"t-small\">同一組權重到處共用；</text>\n        <text x=\"156\" y=\"110\" class=\"t-small\">疊越多層，看到的範圍</text>\n        <text x=\"156\" y=\"130\" class=\"t-small\">（receptive field）越大</text>\n        <text x=\"470\" y=\"18\" class=\"t-strong\">Transformer：每個 token 直接看全部</text>\n        <rect class=\"bx\" x=\"480\" y=\"50\" width=\"56\" height=\"28\" rx=\"4\"></rect><text x=\"492\" y=\"69\">T1</text>\n        <rect class=\"bx\" x=\"560\" y=\"50\" width=\"56\" height=\"28\" rx=\"4\"></rect><text x=\"572\" y=\"69\">T2</text>\n        <rect class=\"bx-accent\" x=\"640\" y=\"50\" width=\"56\" height=\"28\" rx=\"4\"></rect><text x=\"652\" y=\"69\">T3</text>\n        <rect class=\"bx\" x=\"720\" y=\"50\" width=\"56\" height=\"28\" rx=\"4\"></rect><text x=\"732\" y=\"69\">T4</text>\n        <path class=\"ln\" d=\"M668,78 Q588,120 508,78\"></path><path class=\"ln\" d=\"M668,78 Q628,104 588,78\"></path>\n        <path class=\"ln\" d=\"M668,78 Q708,104 748,78\"></path>\n        <text x=\"480\" y=\"132\" class=\"t-small\">self-attention：每個位置對每個位置算一次相關度，</text>\n        <text x=\"480\" y=\"150\" class=\"t-small\">可平行運算；代價是計算量隨長度平方成長（n²）</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>神經元、激活函數</td><td>加權和再過一個非線性函數。常用 <b>ReLU</b>（負的變 0）；沒有非線性，疊再多層也等於一層線性</td></tr>\n        <tr><td>損失函數（loss）</td><td>量「錯多少」。分類用交叉熵（cross-entropy），回歸用 MSE</td></tr>\n        <tr><td>反向傳播（backpropagation）</td><td>用連鎖律從輸出往回算每個權重對 loss 的梯度</td></tr>\n        <tr><td>梯度下降、SGD、Adam</td><td>沿梯度反方向更新權重。mini-batch SGD 每次用一小批資料估梯度；Adam 會為每個參數自動調步幅，常見起手學習率 1e-3（微調預訓練模型通常要更小）</td></tr>\n        <tr><td>學習率（learning rate）</td><td>每一步走多大。太大會震盪甚至發散成 NaN，太小學不動。常見排程：先 <b>warmup</b> 線性升溫，再 cosine 或階梯式衰減</td></tr>\n        <tr><td>epoch／batch／iteration</td><td>epoch＝所有訓練資料看過一輪；batch＝一次餵幾張；iteration＝更新一次權重</td></tr>\n        <tr><td>CNN</td><td>卷積層（kernel 滑動、權重共用）＋池化（pooling，縮小尺寸）＋最後的分類頭。典型：AlexNet（2012）、VGG、ResNet（2015）</td></tr>\n        <tr><td>ResNet 殘差連接</td><td>輸出＝F(x)＋x，讓梯度可以「抄近路」往回傳，網路能疊到上百層</td></tr>\n        <tr><td>Batch Normalization</td><td>把每層輸出正規化成穩定分布，訓練更穩、可用較大學習率；推論時改用訓練期間累積的平均值</td></tr>\n        <tr><td>Dropout</td><td>訓練時隨機關掉一部分神經元，逼網路不依賴單一路徑；推論時關閉</td></tr>\n        <tr><td>Transformer</td><td>2017 年〈Attention Is All You Need〉提出。核心是 self-attention：每個 token 產生 Query／Key／Value，用 Q·K 決定要看誰、加權 V。多頭（multi-head）＝平行做好幾組；位置編碼補上順序資訊</td></tr>\n        <tr><td>ViT</td><td>把影像切成小 patch 當 token 餵 transformer，資料量大時可勝過 CNN</td></tr>\n        <tr><td>遷移學習、微調（fine-tuning）</td><td>拿大資料集預訓練好的模型，只用自己少量資料再訓練。AOI 瑕疵樣本少時幾乎一定這樣做</td></tr>\n        <tr><td>LLM</td><td>大型語言模型，decoder 型 transformer，一次預測下一個 token；寫程式用的 AI 助手就是這類</td></tr>\n      </tbody></table></div>",
          "anchor": "n02-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼影像適合 CNN？</b>影像的特徵是「局部」的（一條刮痕只跟附近像素有關），而且同一種瑕疵出現在哪裡都長一樣。卷積只看鄰近、權重共用，參數少很多，也天生有平移不變的性質，資料少也學得動。</li>\n        <li><b>為什麼 transformer 取代了 RNN？</b>RNN 要一個字一個字依序算，不能平行、遠距離資訊容易忘；self-attention 讓任兩個位置一步就連上，而且整段可以平行算，GPU 用得滿。代價是注意力的計算與記憶體隨序列長度<b>平方</b>成長，所以 LLM 的 context 長度很貴。</li>\n        <li><b>為什麼深網路會梯度消失？</b>反向傳播是一路連乘，如果每層的導數都小於 1，乘幾十層就趨近 0，前面的層學不動。最典型的是 sigmoid：輸入稍大或稍小就「飽和」（曲線兩端變平），導數趨近 0，就算在中間最大也只有 0.25。ReLU 在正半邊導數固定是 1、不會飽和，所以深網路隱藏層多改用 ReLU；BatchNorm、殘差連接也是解法，ResNet 的捷徑讓梯度可以直接流回前層。</li>\n        <li><b>學習率為什麼最關鍵？</b>它同時決定能不能收斂和收斂到哪。太大就跳過谷底、loss 爆掉；太小就卡在平原、浪費時間。warmup 的用意是：一開始權重和 Adam 的統計量都還不穩，先用小步走，穩了再加速。</li>\n        <li><b>為什麼少量資料要用遷移學習？</b>預訓練模型前幾層已經學會邊緣、紋理這類通用特徵，自己只要調後面幾層。從零訓練要的資料量多很多，幾百張 NG 影像通常不夠。</li>\n        <li><b>微調時學習率為什麼要比從零訓練小？</b>預訓練權重已經在好位置，大步走會把學好的特徵洗掉（catastrophic forgetting）；常見作法是先凍結骨幹、只訓練分類頭，再用小學習率解凍微調。</li>\n      </ul>",
          "anchor": "n02-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>loss 先降一陣子，突然暴衝變 NaN</td><td>學習率太大、輸入沒正規化、混合精度（FP16）溢位，或資料裡本身有 NaN</td><td>降學習率、加 warmup、梯度裁剪（gradient clipping）、檢查輸入資料、用 loss scaling</td></tr>\n        <tr><td>loss 幾乎不動</td><td>學習率太小、標籤和影像對錯位、loss 用錯（例如 softmax 做了兩次）</td><td>先拿 10 張圖試著「背起來」：連這都做不到就是程式或資料錯，不是模型不夠大</td></tr>\n        <tr><td>train loss 持續降，val loss 從某個 epoch 起反彈</td><td>開始過擬合</td><td>early stopping、存 val 最佳的那個 checkpoint、加增強或正則化</td></tr>\n        <tr><td>拿預訓練模型微調後，反而比只訓練分類頭差</td><td>學習率太大，把預訓練特徵洗掉</td><td>先凍結骨幹、骨幹用比分類頭小 10 倍左右的學習率、分段解凍</td></tr>\n        <tr><td>GPU 記憶體不足（OOM）</td><td>batch 太大、影像解析度太高、模型太大</td><td>降 batch 並用梯度累積（gradient accumulation）湊回等效 batch、混合精度、裁切成 tile</td></tr>\n        <tr><td>推論結果每次跑都不太一樣，而且比訓練時的 val 差</td><td>推論時沒切到 eval 模式，dropout 還開著、BatchNorm 還在用當批統計</td><td>推論前呼叫 <code>model.eval()</code>（PyTorch），匯出 ONNX 前也要先切</td></tr>\n      </tbody></table></div>",
          "anchor": "n02-l3"
        }
      ]
    },
    {
      "id": "N03",
      "anchor": "n03",
      "tag": "N03",
      "name": "電腦視覺與影像處理",
      "sub": "濾波、形態學、Otsu、OCR",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>傳統影像處理是一條<b>規則管線</b>：先濾掉雜訊、再用門檻把前景切出來、用形態學修形狀、最後量面積位置來判定；條件固定時又快又可解釋，條件多變時才交給深度學習。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 120\" role=\"img\" aria-label=\"傳統 AOI 影像處理管線\">\n        <defs><marker id=\"ahN3\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <rect class=\"bx\" x=\"0\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"12\" y=\"44\" class=\"t-strong\">1 取像</text><text x=\"12\" y=\"66\" class=\"t-small\">打光、解析度</text>\n        <rect class=\"bx\" x=\"152\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"164\" y=\"44\" class=\"t-strong\">2 濾波</text><text x=\"164\" y=\"66\" class=\"t-small\">高斯／中值</text>\n        <rect class=\"bx\" x=\"304\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"316\" y=\"44\" class=\"t-strong\">3 二值化</text><text x=\"316\" y=\"66\" class=\"t-small\">Otsu／adaptive</text>\n        <rect class=\"bx\" x=\"456\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"468\" y=\"44\" class=\"t-strong\">4 形態學</text><text x=\"468\" y=\"66\" class=\"t-small\">opening／closing</text>\n        <rect class=\"bx\" x=\"608\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"620\" y=\"44\" class=\"t-strong\">5 量測</text><text x=\"620\" y=\"66\" class=\"t-small\">連通元件、面積</text>\n        <rect class=\"bx-accent\" x=\"760\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"772\" y=\"44\" class=\"t-strong\">6 判定</text><text x=\"772\" y=\"66\" class=\"t-small\">規格 vs 量測值</text>\n        <line class=\"ln\" x1=\"132\" y1=\"52\" x2=\"150\" y2=\"52\" marker-end=\"url(#ahN3)\"></line><line class=\"ln\" x1=\"284\" y1=\"52\" x2=\"302\" y2=\"52\" marker-end=\"url(#ahN3)\"></line>\n        <line class=\"ln\" x1=\"436\" y1=\"52\" x2=\"454\" y2=\"52\" marker-end=\"url(#ahN3)\"></line><line class=\"ln\" x1=\"588\" y1=\"52\" x2=\"606\" y2=\"52\" marker-end=\"url(#ahN3)\"></line>\n        <line class=\"ln\" x1=\"740\" y1=\"52\" x2=\"758\" y2=\"52\" marker-end=\"url(#ahN3)\"></line>\n        <text x=\"0\" y=\"110\" class=\"t-small\">邊緣偵測（Sobel／Canny）常接在 2 之後，用來找線路、對位邊界。第 1 步拍不清楚，後面怎麼調都救不回來。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>卷積濾波（kernel）</td><td>用一個小矩陣在影像上滑動做加權和。CNN 的卷積層就是「自己學出來的濾波器」</td></tr>\n        <tr><td>平均／高斯濾波</td><td>低通：把鄰近像素平均，去高斯雜訊，但邊緣也會變糊。高斯權重中間大、外圍小，比平均自然</td></tr>\n        <tr><td>中值濾波（median）</td><td>取鄰域的中位數，對椒鹽雜訊（零星的黑白點）最有效，而且邊緣保留得比高斯好</td></tr>\n        <tr><td>直方圖（histogram）</td><td>每個灰階值有幾個像素。前景背景分得開時會有兩個峰（雙峰）</td></tr>\n        <tr><td>全域二值化</td><td>一個門檻 T：大於 T 是白、小於是黑</td></tr>\n        <tr><td>Otsu 法</td><td>大津展之 1979 年提出，自動找門檻：試遍每個 T，挑讓兩類<b>類間變異數最大</b>（等價於類內變異數最小）的那個。假設直方圖是雙峰</td></tr>\n        <tr><td>Adaptive threshold</td><td>每個像素用它周圍一塊區域的平均（或高斯加權平均）減一個常數 C 當門檻，對光線不均勻有效。參數：block size、C</td></tr>\n        <tr><td>侵蝕／膨脹（erosion／dilation）</td><td>形態學的兩個基本動作：侵蝕讓白色區域縮一圈（小白點消失）；膨脹讓白色區域長一圈（小黑洞被填滿）。形狀由結構元素（structuring element／kernel）決定</td></tr>\n        <tr><td>Opening／Closing</td><td><b>Opening＝先侵蝕再膨脹</b>：去掉小白點雜訊，大物件形狀大致不變。<b>Closing＝先膨脹再侵蝕</b>：補掉物件內的小洞、接上小斷口</td></tr>\n        <tr><td>Top-hat</td><td>原圖減 opening 後的圖，留下比結構元素小的亮細節；常用來先扣掉不均勻背景</td></tr>\n        <tr><td>邊緣偵測</td><td><b>Sobel</b>：一階導數，算水平／垂直梯度；<b>Laplacian</b>：二階導數，對雜訊更敏感；<b>Canny</b>（1986）：高斯平滑 → 梯度 → 非極大值抑制（把粗邊變細）→ 雙門檻 → 遲滯連接（弱邊只有接到強邊才保留），高低門檻建議比例 2:1～3:1</td></tr>\n        <tr><td>連通元件（connected components／blob）</td><td>把相連的白色像素編成一個個物件，量面積、外接框、長寬比，用來判斷瑕疵大小</td></tr>\n        <tr><td>模板比對（template matching）</td><td>拿標準影像（golden sample）去比，找位置或算差異；AOI 常用「對位後跟標準片相減」</td></tr>\n        <tr><td>OCR</td><td>光學字元辨識：前處理（灰階、去雜訊、二值化、校正傾斜）→ 版面分析 → 逐行辨識 → 後處理（字典、格式檢查）。開源 Tesseract 從 4.0 起用 LSTM 引擎；官方建議影像至少 300 dpi，字高（x-height）約 20～30 px 最準</td></tr>\n      </tbody></table></div>",
          "anchor": "n03-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼邊緣偵測前要先模糊？</b>邊緣偵測是在算導數，導數會把雜訊放大；先用高斯平滑壓掉高頻雜訊，邊緣才不會滿地都是。Canny 第一步就是高斯。</li>\n        <li><b>Canny 為什麼用兩個門檻？</b>單一門檻設高會斷線、設低會冒出雜訊。雙門檻＋遲滯：強邊一定留，弱邊只在連到強邊時才留，所以邊緣連續又乾淨。</li>\n        <li><b>Otsu 什麼時候會失準？</b>它是全域門檻，前提是直方圖雙峰。光線不均（中間亮四周暗）、或瑕疵只佔畫面很小比例（小峰被大峰淹沒）時，門檻會跑掉。這時改用 adaptive threshold，或先做背景校正（top-hat、平場校正）再 Otsu。</li>\n        <li><b>Opening 和 closing 順序為什麼反過來就差很多？</b>先侵蝕會把小白點吃掉，再膨脹只能長回還存在的大物件，所以 opening 去白點；先膨脹會把小洞填掉，再侵蝕縮回原尺寸，所以 closing 補洞。要去的是「白雜訊」還是「黑洞」決定用哪個。</li>\n        <li><b>AOI 該用規則法還是深度學習？</b>規則法：條件固定（打光、對位穩）、瑕疵定義明確、要可解釋、樣本少時好用，也容易調。深度學習：瑕疵外觀變化大、背景有紋理、規則寫不完時才划算，但要標註資料和重新驗證。實務上常見混合：規則法先篩，AI 再把可疑點分類（ADC，自動瑕疵分類）以降低誤殺。</li>\n        <li><b>PDF、圖紙一定要 OCR 嗎？</b>不一定。向量 PDF 本身就有文字層和線段座標，直接讀出來比 OCR 準又快；只有掃描件或點陣圖才需要 OCR。先判斷來源是哪一種，再選工具。</li>\n      </ul>",
          "anchor": "n03-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>Otsu 二值化後，畫面一側整片變黑或變白</td><td>光照不均，單一全域門檻不適用</td><td>改 adaptive threshold；或先做平場校正、top-hat 扣背景；硬體端改善打光均勻度</td></tr>\n        <tr><td>AOI 誤殺（overkill）太多，大量良品被判 NG</td><td>門檻太嚴、對位偏移造成相減殘影、正常的製程變異被當瑕疵</td><td>改善對位、依區域設不同門檻、加最小面積條件；用 AI 分類做二次複判</td></tr>\n        <tr><td>AOI 漏檢（escape），低對比瑕疵沒抓到</td><td>瑕疵和背景灰階太接近、解析度不夠（瑕疵只佔幾個像素）</td><td>換打光方式（暗場、同軸、斜光讓刮痕凸顯）、提高倍率；門檻放寬後再靠複判壓誤殺</td></tr>\n        <tr><td>Canny 找到的邊斷斷續續</td><td>高門檻太高、平滑過頭</td><td>降低高門檻或維持 2:1～3:1 的比例調整、減小高斯 σ；必要時對結果做 closing 接斷口</td></tr>\n        <tr><td>形態學後兩個相鄰瑕疵黏成一個，或細線路斷掉</td><td>結構元素太大，或 opening／closing 用反</td><td>縮小 kernel、改用與線路方向一致的長條 kernel、確認要去的是白雜訊還是黑洞</td></tr>\n        <tr><td>二值化後細線斷斷續續，背景又滿是小雜點</td><td>雜訊和斷口同時存在；只做其中一種形態學處理不夠</td><td>先 opening 去掉小白點，再 closing 接上斷口；順序反過來，雜點會先被膨脹放大、甚至黏到線上</td></tr>\n        <tr><td>OCR 把 0／O、1／l／I、5／S 認錯</td><td>解析度不足、字型特殊、沒有格式限制</td><td>放大到約 300 dpi 等效、限定字元集（whitelist）、用正規表示式或料號規則做後檢查</td></tr>\n      </tbody></table></div>",
          "anchor": "n03-l3"
        }
      ]
    },
    {
      "id": "N04",
      "anchor": "n04",
      "tag": "N04",
      "name": "模型訓練與部署",
      "sub": "標註、增強、量化、ONNX",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>模型好壞的上限由<b>標註品質</b>決定；訓練完要<b>匯出成 ONNX 等通用格式、量化、在目標硬體上重驗一次</b>，因為前處理、精度和硬體一變，結果就可能不一樣。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 120\" role=\"img\" aria-label=\"從標註到部署\">\n        <defs><marker id=\"ahN4\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path d=\"M0,0 L10,5 L0,10 z\" class=\"fill-muted\"></path></marker></defs>\n        <rect class=\"bx\" x=\"0\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"12\" y=\"44\" class=\"t-strong\">1 標註</text><text x=\"12\" y=\"66\" class=\"t-small\">框、遮罩、規範</text>\n        <rect class=\"bx\" x=\"152\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"164\" y=\"44\" class=\"t-strong\">2 訓練</text><text x=\"164\" y=\"66\" class=\"t-small\">增強只在這裡</text>\n        <rect class=\"bx\" x=\"304\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"316\" y=\"44\" class=\"t-strong\">3 匯出</text><text x=\"316\" y=\"66\" class=\"t-small\">ONNX、固定 opset</text>\n        <rect class=\"bx\" x=\"456\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"468\" y=\"44\" class=\"t-strong\">4 量化</text><text x=\"468\" y=\"66\" class=\"t-small\">FP16／INT8</text>\n        <rect class=\"bx\" x=\"608\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"620\" y=\"44\" class=\"t-strong\">5 推論引擎</text><text x=\"620\" y=\"66\" class=\"t-small\">ORT＋EP</text>\n        <rect class=\"bx-accent\" x=\"760\" y=\"20\" width=\"130\" height=\"64\" rx=\"6\"></rect><text x=\"772\" y=\"44\" class=\"t-strong\">6 部署</text><text x=\"772\" y=\"66\" class=\"t-small\">工控機／邊緣</text>\n        <line class=\"ln\" x1=\"132\" y1=\"52\" x2=\"150\" y2=\"52\" marker-end=\"url(#ahN4)\"></line><line class=\"ln\" x1=\"284\" y1=\"52\" x2=\"302\" y2=\"52\" marker-end=\"url(#ahN4)\"></line>\n        <line class=\"ln\" x1=\"436\" y1=\"52\" x2=\"454\" y2=\"52\" marker-end=\"url(#ahN4)\"></line><line class=\"ln\" x1=\"588\" y1=\"52\" x2=\"606\" y2=\"52\" marker-end=\"url(#ahN4)\"></line>\n        <line class=\"ln\" x1=\"740\" y1=\"52\" x2=\"758\" y2=\"52\" marker-end=\"url(#ahN4)\"></line>\n        <text x=\"0\" y=\"110\" class=\"t-small\">3～6 每一步都要拿同一組測試影像比對輸出，確認跟訓練框架裡的結果一致（數值誤差在容許範圍內）。</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>標註類型</td><td>分類：整張圖一個標籤；偵測：畫外接框（bounding box）；分割：逐像素遮罩（mask）或多邊形。越細越貴</td></tr>\n        <tr><td>標註規範（guideline）</td><td>寫清楚每類瑕疵的定義、邊界怎麼框、模糊案例怎麼判，附正反例圖。沒有規範，不同人標的就是不同問題</td></tr>\n        <tr><td>標註一致性</td><td>同一批圖給兩個人標，比對一致的比例；不一致的拿出來討論、更新規範</td></tr>\n        <tr><td>主動學習（active learning）</td><td>讓模型挑出它最沒把握的圖優先送標，用較少標註量換較多進步</td></tr>\n        <tr><td>資料增強（augmentation）</td><td>訓練時對影像做翻轉、旋轉、裁切、亮度／對比變化、加雜訊、模糊，或 mixup、cutout 等，讓模型看到更多變化。只在訓練時做，推論不做</td></tr>\n        <tr><td>量化（quantization）</td><td>把 FP32 權重與運算改成 FP16 或 INT8。INT8 權重體積約為 FP32 的 1/4，整數運算單元更快更省電</td></tr>\n        <tr><td>PTQ／QAT</td><td><b>PTQ</b>（訓練後量化）：拿一小批代表性資料做校正（calibration）算出縮放係數，不用重訓；<b>QAT</b>（量化感知訓練）：訓練時就模擬量化誤差，準度通常較好但要重訓</td></tr>\n        <tr><td>靜態／動態量化</td><td>靜態：激活值的縮放係數事先用校正資料算好，推論最快；動態：推論時即時算，較準但多一點開銷。ONNX Runtime 建議 CNN 用靜態、transformer／RNN 用動態</td></tr>\n        <tr><td>剪枝、蒸餾</td><td>剪枝（pruning）：刪掉不重要的權重或通道；知識蒸餾（distillation）：用大模型的輸出教小模型</td></tr>\n        <tr><td>ONNX</td><td>開放的模型交換格式：PyTorch、TensorFlow 訓練的模型匯出成 .onnx，就能在別的推論引擎上跑。<b>opset</b> 是運算子規格的版本號，匯出端與執行端要支援同一版</td></tr>\n        <tr><td>ONNX Runtime（ORT）、EP</td><td>微軟維護的 ONNX 推論引擎，透過 Execution Provider 接不同硬體：CPU、CUDA、TensorRT、DirectML、OpenVINO 等。C#／.NET 用 NuGet 套件 <code>Microsoft.ML.OnnxRuntime</code>（GPU 版、DirectML 版另有套件）</td></tr>\n        <tr><td>TensorRT／OpenVINO／TFLite</td><td>各硬體廠的最佳化推論引擎：NVIDIA GPU／Intel CPU、GPU、NPU／手機與 MCU 類裝置（TensorFlow Lite，現名 LiteRT）</td></tr>\n        <tr><td>邊緣部署（edge）</td><td>模型直接跑在機台工控機、相機、手機或嵌入式 NPU 上，不送雲端：延遲低、不怕斷網、資料不外流；代價是算力、記憶體、功耗有限</td></tr>\n      </tbody></table></div>",
          "anchor": "n04-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼標註品質比數量重要？</b>模型學的就是標註者的判斷。兩個人對「輕微刮傷算不算 NG」意見不同，模型只會學到混亂的邊界，資料再多也卡在那個天花板。</li>\n        <li><b>增強為什麼不能亂做？</b>增強必須是「現實中會發生、而且不改變答案」的變化。文字影像水平翻轉就不是同一個字；如果瑕疵類別靠顏色區分，顏色抖動會把標籤改掉；產線相機角度固定時，大角度旋轉只是在教模型不存在的情況。</li>\n        <li><b>為什麼 INT8 會掉準度、為什麼要校正？</b>INT8 只有 256 個刻度，要用一個縮放係數把浮點範圍映射進去。範圍抓太大，細節被壓扁；抓太小，大值被截斷。校正資料就是用來估這個範圍，所以必須跟實際上線影像相似。</li>\n        <li><b>為什麼要轉 ONNX，而不是直接用 PyTorch 部署？</b>把「訓練框架」和「執行環境」切開：RD 用 Python 訓練，C#／WinForms 工具用 ORT 載入同一個 .onnx 就能推論，不必在產線電腦裝整套 Python；換硬體時只換 EP。</li>\n        <li><b>為什麼 ONNX 結果跟 PyTorch 不一樣，最常是前處理？</b>模型本身通常轉得對，錯在餵進去的東西：BGR／RGB 順序、正規化的 mean／std、resize 插值方式、NCHW／NHWC 排列、uint8 沒轉 float。這些都寫在訓練程式裡，部署端要逐項照抄。</li>\n        <li><b>邊緣部署和雲端怎麼選？</b>要即時（每片面板幾十毫秒內判完）、機台不能連外網、資料不能出廠 → 邊緣；模型很大、需要集中更新、可以接受網路延遲 → 雲端或廠內伺服器。</li>\n      </ul>",
          "anchor": "n04-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>匯出 ONNX 時報「operator X to ONNX opset version N is not supported」</td><td>該運算子在指定 opset 還沒有對應</td><td>提高匯出的 opset、更新匯出工具；或把該運算改寫成已支援的運算組合。執行端的 ORT 也要支援同一 opset</td></tr>\n        <tr><td>ONNX 推論結果跟 PyTorch 差很多</td><td>前處理不一致（色彩順序、正規化、resize），或匯出前沒切 eval 模式</td><td>同一張圖在兩邊逐步印出輸入張量比對；匯出前 <code>model.eval()</code></td></tr>\n        <tr><td>INT8 量化後準確率掉很多</td><td>校正資料不具代表性、少數層對量化特別敏感</td><td>換成產線真實影像做校正、改 per-channel 量化、把敏感層排除在量化外（ORT 可比對 FP32 與量化模型各層張量找出差異最大的層）；還不夠就改 QAT</td></tr>\n        <tr><td>在邊緣裝置上比預期慢很多</td><td>部分運算子不被加速器（EP）支援，退回 CPU 執行，資料來回搬移</td><td>查看各節點被分配到哪個 EP、把不支援的運算改寫或移出模型、縮小輸入解析度</td></tr>\n        <tr><td>實驗室很準，換到另一條產線就變差</td><td>相機、光源、對焦、產品不同（資料分布漂移）</td><td>收新產線影像加入訓練、增強時加入亮度與模糊變化、上線前用新產線影像做驗收</td></tr>\n        <tr><td>同一類瑕疵模型時判時不判，人工複查也有爭議</td><td>標註不一致，模型學到的邊界本來就模糊</td><td>補標註規範與邊界案例、雙人標註比對分歧、重標爭議樣本</td></tr>\n      </tbody></table></div>",
          "anchor": "n04-l3"
        }
      ]
    },
    {
      "id": "N05",
      "anchor": "n05",
      "tag": "N05",
      "name": "評估指標",
      "sub": "precision／recall、IoU、mAP",
      "blocks": [
        {
          "t": "html",
          "html": "<p><b>一句話：</b>先畫<b>混淆矩陣</b>再談分數：precision 問「判 NG 的有幾成真的是 NG」，recall 問「真的 NG 抓到幾成」，兩者由<b>門檻</b>互相拉扯；偵測任務再加上 <b>IoU</b> 決定框得夠不夠準。</p>\n<figure>\n      <svg class=\"fig\" viewBox=\"0 0 900 180\" role=\"img\" aria-label=\"IoU 示意\">\n        <rect class=\"bx-soft\" x=\"130\" y=\"60\" width=\"110\" height=\"80\"></rect>\n        <rect class=\"ln-accent dash\" x=\"60\" y=\"30\" width=\"180\" height=\"110\"></rect>\n        <rect class=\"ln-fg\" x=\"130\" y=\"60\" width=\"170\" height=\"100\"></rect>\n        <text x=\"60\" y=\"22\" class=\"t-small\">標準答案（ground truth）</text>\n        <text x=\"190\" y=\"176\" class=\"t-small\">預測框</text>\n        <text x=\"152\" y=\"105\" class=\"t-strong\">交集</text>\n        <text x=\"360\" y=\"44\" class=\"t-strong\">IoU ＝ 交集面積 ÷ 聯集面積（0～1）</text>\n        <text x=\"360\" y=\"76\">IoU ≥ 門檻（Pascal VOC 用 0.5）才算 TP；不到就同時算 1 個 FP＋1 個 FN</text>\n        <text x=\"360\" y=\"104\">COCO mAP：IoU 門檻 0.50、0.55 … 0.95 共 10 個，各算 AP 再平均</text>\n        <text x=\"360\" y=\"132\" class=\"t-small\">框歪一點 IoU 就掉很快：兩個同尺寸方框只要錯開 1/3 邊長，</text>\n        <text x=\"360\" y=\"150\" class=\"t-small\">IoU 就只剩 0.5（交集 2/3、聯集 4/3）</text>\n      </svg>\n    </figure>"
        },
        {
          "t": "lv",
          "lv": 1,
          "title": "是什麼",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>名詞</th><th>意思</th></tr>\n        <tr><td>混淆矩陣</td><td>實際 × 預測的 2×2 表。以「NG（瑕疵）」當正類：<b>TP</b> 真 NG 判 NG、<b>FN</b> 真 NG 判 OK（漏檢）、<b>FP</b> 真 OK 判 NG（誤殺）、<b>TN</b> 真 OK 判 OK</td></tr>\n        <tr><td>Accuracy</td><td>(TP＋TN) ÷ 全部。類別不平衡時幾乎沒有參考價值</td></tr>\n        <tr><td>Precision（精確率）</td><td>TP ÷ (TP＋FP)：判 NG 的裡面真的是 NG 的比例。低＝誤殺多</td></tr>\n        <tr><td>Recall（召回率、敏感度）</td><td>TP ÷ (TP＋FN)：真的 NG 被抓到的比例。低＝漏檢多</td></tr>\n        <tr><td>Specificity、FPR</td><td>Specificity＝TN ÷ (TN＋FP)，良品判對的比例；FPR＝1 − specificity，良品被誤殺的比例</td></tr>\n        <tr><td>F1</td><td>precision 和 recall 的<b>調和平均</b>：2PR ÷ (P＋R)。兩者只要一個低，F1 就低。Fβ 可調權重，F2 更重視 recall</td></tr>\n        <tr><td>ROC 曲線、AUC</td><td>門檻從高掃到低，畫 TPR（recall）對 FPR；曲線下面積 AUC 越接近 1 越好，0.5 等於亂猜</td></tr>\n        <tr><td>PR 曲線、AP</td><td>畫 precision 對 recall，曲線下面積是 AP（average precision）。正類很少時比 ROC 更能看出差異</td></tr>\n        <tr><td>IoU</td><td>Intersection over Union，見上圖；分割任務也用同樣的定義（逐像素）</td></tr>\n        <tr><td>mAP</td><td>每個類別算 AP 再對類別平均。<b>mAP@0.5</b>（VOC 風格）只要 IoU ≥ 0.5；<b>mAP@[.5:.95]</b>（COCO 風格）對 10 個 IoU 門檻平均，更看重框得準</td></tr>\n        <tr><td>NMS</td><td>非極大值抑制：同一個物件冒出好幾個重疊框時，留分數最高的、刪掉跟它 IoU 太高的</td></tr>\n        <tr><td>Macro／micro 平均</td><td>多類別時：macro 每類算完再平均（小類別跟大類別一樣重）；micro 全部 TP／FP／FN 加總再算（被大類別主導）</td></tr>\n        <tr><td>AOI 用語對應</td><td>誤殺／過殺（overkill、false call）≈ FP；漏檢（escape、underkill）≈ FN。各廠分母的定義不一，看報表要先問清楚</td></tr>\n      </tbody></table></div>",
          "anchor": "n05-l1"
        },
        {
          "t": "lv",
          "lv": 2,
          "title": "為什麼",
          "html": "<ul>\n        <li><b>為什麼 99% accuracy 可能一文不值？</b>NG 只佔 1% 時，模型全部判 OK 就有 99% accuracy，但 recall＝0，一個瑕疵都沒抓到。主圖切到「瑕疵率 2%」、把門檻拉到 1.0 就看得到。</li>\n        <li><b>為什麼 precision 和 recall 互相拉扯？</b>門檻往下降，更多樣本被判 NG：真 NG 抓得更多（recall 升），但良品也被拖下水（precision 降）。模型本身不變，只是工作點換了；要兩個一起升，只能讓模型把兩群分數分得更開。</li>\n        <li><b>門檻要怎麼定？</b>看錯誤的代價：漏放一顆瑕疵品到客戶端（客退、賠償）通常比誤殺一顆良品（多一次人工複判）貴得多，所以篩檢型 AOI 會先把 recall 拉高、再用人工或第二階段模型壓誤殺。</li>\n        <li><b>為什麼 F1 用調和平均，不用算術平均？</b>算術平均下 P＝1、R＝0 還有 0.5，看起來不差；調和平均會被小的那個拉下來，P＝1、R＝0 的 F1 是 0，逼你兩邊都顧。</li>\n        <li><b>為什麼不平衡時 ROC 會騙人？</b>FPR 的分母是全部良品；良品有幾萬張時，多誤殺幾百張 FPR 幾乎不動，ROC 看起來很漂亮，但 precision 已經掉很多。PR 曲線直接反映「判 NG 的有幾成是真的」。</li>\n        <li><b>precision 為什麼會隨產線瑕疵率改變，recall 不會？</b>recall 只看真 NG 那一群；precision 的分母混了良品的誤殺數，良品越多（瑕疵率越低），同樣的誤殺率造成的 FP 就越多。驗證集如果刻意補了很多 NG，算出來的 precision 會比上線樂觀。</li>\n      </ul>",
          "anchor": "n05-l2"
        },
        {
          "t": "lv",
          "lv": 3,
          "title": "出問題怎麼辦",
          "html": "<div class=\"table-wrap\"><table>\n        <tbody><tr><th>現象</th><th>最可能原因</th><th>對策</th></tr>\n        <tr><td>報告寫 accuracy 99%，產線卻抱怨瑕疵都沒抓到</td><td>類別不平衡，accuracy 被大量良品撐起來</td><td>改看混淆矩陣、recall、PR 曲線；訓練時加類別權重、對 NG 過採樣或用 focal loss；調低門檻</td></tr>\n        <tr><td>為了不漏檢把門檻調低，誤殺爆量，複判人力撐不住</td><td>工作點選在 PR 曲線太靠 recall 的那端</td><td>用成本（漏檢單價 × FN＋複判單價 × FP）找最低點；改兩階段：寬鬆初篩＋AI 或人工複判</td></tr>\n        <tr><td>驗證集 precision 90%，上線只剩 40%</td><td>驗證集刻意補了 NG，瑕疵率遠高於產線</td><td>用產線實際瑕疵率重新換算 precision，或直接拿一段時間的連續產線資料當驗收集</td></tr>\n        <tr><td>偵測模型 mAP@0.5 很高，mAP@[.5:.95] 很低</td><td>找得到物件，但框得不準</td><td>提高輸入解析度、改善框回歸（更好的 loss、anchor 設定）、檢查標註框本身是否鬆緊不一</td></tr>\n        <tr><td>小瑕疵的 AP 特別低</td><td>縮圖後瑕疵只剩幾個像素，IoU 對幾個像素的偏差特別敏感</td><td>把大圖切 tile 推論、提高解析度、小物件專用的 anchor 或模型</td></tr>\n        <tr><td>模型重訓後換了一版，同一門檻下誤殺突然變多</td><td>新模型的分數分布不同，舊門檻不再對應同一個工作點</td><td>每次換版都在驗證集重新選門檻，鎖定目標 recall 或誤殺率再發布</td></tr>\n      </tbody></table></div>",
          "anchor": "n05-l3"
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
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>這兩個</th><th>差在哪</th></tr>\n      <tr><td>Validation vs Test</td><td>拿來做決定（挑超參數、早停、選門檻）vs 最後只看一次、代表上線表現（N01）</td></tr>\n      <tr><td>Overfitting vs Underfitting</td><td>train 好、val 差 vs 兩個都差（N01）</td></tr>\n      <tr><td>L1 vs L2 正則化</td><td>把權重壓成 0（稀疏、自動選特徵）vs 全部縮小但不為 0（N01）</td></tr>\n      <tr><td>Precision vs Recall</td><td>判 NG 的裡面幾成是真的（低＝誤殺 overkill 多，FP）vs 真 NG 抓到幾成（低＝漏檢 escape 多，FN）（N05）</td></tr>\n      <tr><td>ROC vs PR 曲線</td><td>TPR 對 FPR，不平衡時偏樂觀 vs precision 對 recall，正類稀少時更誠實（N05）</td></tr>\n      <tr><td>mAP@0.5 vs mAP@[.5:.95]</td><td>框到大概位置就算對 vs 10 個 IoU 門檻平均、要框得準（N05）</td></tr>\n      <tr><td>Opening vs Closing</td><td>先侵蝕後膨脹、去小白點 vs 先膨脹後侵蝕、補小黑洞（N03）</td></tr>\n      <tr><td>Otsu vs Adaptive threshold</td><td>自動挑一個全域門檻 vs 每個區域各自一個門檻，能處理光線不均（N03）</td></tr>\n      <tr><td>高斯 vs 中值濾波</td><td>加權平均、對高斯雜訊好、邊緣會糊 vs 取中位數、對椒鹽雜訊好、邊緣保留較好（N03）</td></tr>\n      <tr><td>PTQ vs QAT</td><td>訓練後用校正資料量化、不重訓 vs 訓練時就模擬量化、較準但要重訓（N04）</td></tr>\n      <tr><td>ONNX vs ONNX Runtime</td><td>模型檔案格式（規格、opset）vs 執行這種檔案的推論引擎（N04）</td></tr>\n      <tr><td>CNN vs Transformer</td><td>只看局部、權重共用、資料少也行 vs 每個位置看全部、可平行、資料多時更強但成本隨長度平方成長（N02）</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "terms",
      "title": "英文術語",
      "blocks": [
        {
          "t": "html",
          "html": "<div class=\"table-wrap\"><table>\n      <tbody><tr><th>英文</th><th>中文</th><th>常見用法</th></tr>\n      <tr><td>Overfitting</td><td>過擬合</td><td>The model is overfitting; validation loss keeps rising.</td></tr>\n      <tr><td>Hold-out set</td><td>保留測試集</td><td>Keep a hold-out set that is never used for tuning.</td></tr>\n      <tr><td>Data leakage</td><td>資料洩漏</td><td>Near-duplicate images caused data leakage across splits.</td></tr>\n      <tr><td>Regularization</td><td>正則化</td><td>Add weight decay as L2 regularization.</td></tr>\n      <tr><td>Learning rate warmup</td><td>學習率暖身</td><td>Use a linear warmup followed by cosine decay.</td></tr>\n      <tr><td>Fine-tuning</td><td>微調</td><td>Freeze the backbone and fine-tune the head first.</td></tr>\n      <tr><td>Data augmentation</td><td>資料增強</td><td>Augmentation is applied only during training.</td></tr>\n      <tr><td>Annotation guideline</td><td>標註規範</td><td>Update the annotation guideline with edge cases.</td></tr>\n      <tr><td>Calibration dataset</td><td>校正資料集</td><td>Use production images as the INT8 calibration dataset.</td></tr>\n      <tr><td>Execution provider</td><td>執行提供者</td><td>Some nodes fell back to the CPU execution provider.</td></tr>\n      <tr><td>Confusion matrix</td><td>混淆矩陣</td><td>Check the confusion matrix, not just accuracy.</td></tr>\n      <tr><td>Class imbalance</td><td>類別不平衡</td><td>Class imbalance makes accuracy misleading.</td></tr>\n      <tr><td>Operating point</td><td>工作點（門檻）</td><td>Pick the operating point at 99% recall.</td></tr>\n      <tr><td>False call／Escape</td><td>誤殺／漏檢</td><td>AI review cut the false call rate without raising escapes.</td></tr>\n      <tr><td>Intersection over Union</td><td>交並比</td><td>A detection counts as TP when IoU ≥ 0.5.</td></tr>\n      <tr><td>Morphological opening</td><td>形態學斷開</td><td>Apply opening to remove small speckles.</td></tr>\n    </tbody></table></div>"
        }
      ]
    },
    {
      "id": "sources",
      "title": "出處",
      "blocks": [
        {
          "t": "html",
          "html": "<ol class=\"sources\">\n      <li><b>N01</b>　https://en.wikipedia.org/wiki/Leakage_(machine_learning) ；https://voxel51.com/blog/on-leaky-datasets-and-a-clever-horse ；https://theorempath.com/topics/train-test-split-and-data-leakage</li>\n      <li><b>N02</b>　https://theorempath.com/papers/attention-is-all-you-need ；https://wandb.ai/wandb_fc/tips/reports/The-Problem-with-Quadratic-Attention-in-Transformer-Architectures--Vmlldzo3MDE0Mzcz ；https://theorempath.com/papers/deep-residual-learning ；https://arxiv.org/pdf/2406.09405 （Why Warmup the Learning Rate?）；https://discuss.pytorch.org/t/tricks-for-being-able-to-use-a-higher-learning-rate/142179</li>\n      <li><b>N03</b>　https://en.wikipedia.org/wiki/Otsu%27s_method ；https://docs.opencv.org/4.11.0/d7/d4d/tutorial_py_thresholding.html ；https://docs.opencv.org/4.10.0/da/d5c/tutorial_canny_detector.html ；https://docs.opencv.org/3.4.20/d4/d76/tutorial_js_morphological_ops.html ；https://docs.wpilib.org/en/2021/docs/software/vision-processing/wpilibpi/morphological-operations.html ；https://hackernoon.com/why-your-tesseract-ocr-results-suck-and-how-to-fix-them-fast ；https://semiengineering.com/tag/automated-optical-inspection</li>\n      <li><b>N04</b>　https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html ；https://onnxruntime.ai/docs/execution-providers/ ；https://onnxruntime.ai/docs/get-started/with-csharp ；https://docs.nvidia.com/deeplearning/tensorrt/latest/inference-library/work-quantized-types.html ；https://docs.nvidia.com/tao/tao-toolkit/latest/text/quantization_aware_training.html ；https://discuss.pytorch.org/t/valueerror-unsupported-onnx-opset-version-21/221976</li>\n      <li><b>N05</b>　https://pmc.ncbi.nlm.nih.gov/articles/PMC4349800 （Saito &amp; Rehmsmeier 2015，PR vs ROC）；https://jonathan-hui.medium.com/map-mean-average-precision-for-object-detection-45c121a31173 ；https://arxiv.org/pdf/1512.04143 （COCO 與 VOC 評估差異）</li>\n      <li class=\"muted\">查證日 2026-10-02。未證實：Tesseract「x-height 20～30 px」取自二手整理；「微調時骨幹學習率約小 10 倍」為業界慣例、未找到一手出處；AOI 誤殺／漏檢的分母定義各廠不同，頁內未寫死數字；主圖的分數分布與曲線是為示意產生的假資料。</li>\n    </ol>"
        }
      ]
    }
  ],
  "css": ".kb-N .slider { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted); }\n.kb-N .slider input[type=\"range\"] { width: 220px; max-width: 50vw; }\n.kb-N .slider output { font-family: var(--mono); color: var(--fg); min-width: 3.5em; }\n.kb-N #mt td.num { font-family: var(--mono); }\n"
}
