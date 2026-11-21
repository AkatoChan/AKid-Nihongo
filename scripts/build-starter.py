#!/usr/bin/env python3
"""Starter pack is partly adapted from OpenJLPT (CC BY-SA 4.0). See DATA-LICENSE.md."""
import json
from pathlib import Path
base=Path(__file__).resolve().parent.parent/'public/content'
base.mkdir(parents=True,exist_ok=True)
raw='''あ|あ|a|Ah|à, ô
アクセサリー|アクセサリー|akusesarii|accessory|phụ kiện
アフリカ|アフリカ|afurika|Africa|châu Phi
以下|いか|ika|less than|dưới, không quá
致す|いたす|itasu|(humble) to do|làm (khiêm nhường)
いらっしゃる|いらっしゃる|irassharu|(respectful) to be|ở, đến, đi (tôn kính)
美しい|うつくしい|utsukushii|beautiful|đẹp
運転|うんてん|unten|to drive|lái xe
オートバイ|オートバイ|ootobai|motorcycle|xe máy
起す|おこす|okosu|to wake|đánh thức
おつり|おつり|otsuri|change from purchase|tiền thối lại
思い出す|おもいだす|omoidasu|to remember|nhớ ra
折れる|おれる|oreru|to break or be folded|bị gãy
変える|かえる|kaeru|to change|thay đổi (cái gì)
形|かたち|katachi|shape|hình dạng
壁|かべ|kabe|wall|bức tường
代わり|かわり|kawari|substitute|thay thế
聞こえる|きこえる|kikoeru|to be heard|nghe thấy
決まる|きまる|kimaru|to be decided|được quyết định
教会|きょうかい|kyoukai|church|nhà thờ
首|くび|kubi|neck|cổ
警察|けいさつ|keisatsu|police|cảnh sát
けんかする|けんかする|kenkasuru|to quarrel|cãi nhau
高校|こうこう|koukou|high school|trường THPT
心|こころ|kokoro|core|trái tim, tấm lòng
このごろ|このごろ|konogoro|these days|dạo gần đây
壊れる|こわれる|kowareru|to be broken|bị hỏng
探す|さがす|sagasu|to look for|tìm kiếm
サラダ|サラダ|sarada|salad|món salad
試合|しあい|shiai|match|trận đấu
しっかり|しっかり|shikkari|firmly|chắc chắn, cẩn thận
社長|しゃちょう|shachou|company president|giám đốc công ty
出発|しゅっぱつ|shuppatsu|to depart|xuất phát
食事|しょくじ|shokuji|to have a meal|bữa ăn
新聞社|しんぶんしゃ|shinbunsha|newspaper company|tòa soạn báo
スクリーン|スクリーン|sukuriin|screen|màn hình
すばらしい|すばらしい|subarashii|wonderful|tuyệt vời
西洋|せいよう|seiyou|western countries|phương Tây
戦争|せんそう|sensou|war|chiến tranh
それで|それで|sorede|because of that|vì thế
大体|だいたい|daitai|generally|đại khái
尋ねる|たずねる|tazuneru|to ask|hỏi, thăm
楽しむ|たのしむ|tanoshimu|to enjoy oneself|tận hưởng
力|ちから|chikara|strength|sức mạnh
つき|つき|tsuki|moon|mặt trăng
つもり|つもり|tsumori|intention|dự định
手袋|てぶくろ|tebukuro|glove|găng tay
道具|どうぐ|dougu|tool|dụng cụ
特急|とっきゅう|tokkyuu|limited express train (faster than an express train)|tàu tốc hành đặc biệt
直る|なおる|naoru|to be fixed|được sửa xong
なるほど|なるほど|naruhodo|now I understand|ra là vậy
似る|にる|niru|to be similar|giống, tương tự
眠い|ねむい|nemui|sleepy|buồn ngủ
倍|ばい|bai|double|gấp đôi
発音|はつおん|hatsuon|pronunciation|phát âm
日|ひ|hi|day|ngày, mặt trời
久しぶり|ひさしぶり|hisashiburi|after a long time|lâu rồi không gặp
昼間|ひるま|hiruma|daytime|ban ngày
普通|ふつう|futsuu|usually|bình thường
文化|ぶんか|bunka|culture|văn hóa
法律|ほうりつ|houritsu|law|luật pháp
まじめ|まじめ|majime|serious|nghiêm túc
見える|みえる|mieru|to be in sight|nhìn thấy
昔|むかし|mukashi|olden days|ngày xưa
もうすぐ|もうすぐ|mousugu|soon|sắp, chẳng bao lâu nữa
間|あいだ|aida|between; interval|khoảng giữa
予定|よてい|yotei|plan; schedule|kế hoạch, lịch trình
約束|やくそく|yakusoku|promise|lời hứa, cuộc hẹn
準備|じゅんび|junbi|preparation|chuẩn bị
説明|せつめい|setsumei|explanation|giải thích
必要|ひつよう|hitsuyou|necessary|cần thiết
無理|むり|muri|impossible; unreasonable|quá sức, không thể
残念|ざんねん|zannen|regrettable|đáng tiếc
安心|あんしん|anshin|relief|yên tâm
連絡|れんらく|renraku|contact|liên lạc
場合|ばあい|baai|case; situation|trường hợp
届ける|とどける|todokeru|to deliver|giao, chuyển đến
拾う|ひろう|hirou|to pick up|nhặt
間に合う|まにあう|maniau|to be in time|kịp giờ
経験|けいけん|keiken|experience|kinh nghiệm
失敗|しっぱい|shippai|failure|thất bại
成功|せいこう|seikou|success|thành công
実は|じつは|jitsuwa|actually|thực ra
必ず|かならず|kanarazu|certainly|nhất định
なるべく|なるべく|narubeku|as much as possible|cố gắng hết mức
絶対に|ぜったいに|zettaini|absolutely|tuyệt đối
十分|じゅうぶん|juubun|enough|đầy đủ
具合|ぐあい|guai|condition|tình trạng
意見|いけん|iken|opinion|ý kiến
反対|はんたい|hantai|opposition|phản đối
賛成|さんせい|sansei|agreement|tán thành
以上|いじょう|ijou|more than; at least|từ... trở lên
以外|いがい|igai|except for|ngoài ra, ngoại trừ
目的|もくてき|mokuteki|purpose|mục đích
理由|りゆう|riyuu|reason|lý do
方法|ほうほう|houhou|method|phương pháp'''
v=[]
for i,line in enumerate(raw.splitlines()):
 parts=line.split('|'); assert len(parts)==5,parts
 word,reading,romaji,en,vi=parts
 v.append({'id':f'starter-n4-{i+1:03d}','word':word,'reading':reading,'romaji':romaji,'meanings':[en],'meaning_vi':vi,'level':'N4','examples':[], 'source':'OpenJLPT' if i<65 else 'Tự biên soạn'})
(base/'n4-vocab.json').write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf8')
# Minimal N5 revision deck is original, Vietnamese-first.
raw5='''会う|あう|au|to meet|gặp
青い|あおい|aoi|blue|màu xanh
赤い|あかい|akai|red|màu đỏ
朝|あさ|asa|morning|buổi sáng
明日|あした|ashita|tomorrow|ngày mai
雨|あめ|ame|rain|mưa
家|いえ|ie|house|nhà
行く|いく|iku|to go|đi
学校|がっこう|gakkou|school|trường học
帰る|かえる|kaeru|to return|trở về
学生|がくせい|gakusei|student|sinh viên
聞く|きく|kiku|to listen|nghe
今日|きょう|kyou|today|hôm nay
勉強|べんきょう|benkyou|study|học tập
食べる|たべる|taberu|to eat|ăn
飲む|のむ|nomu|to drink|uống
話す|はなす|hanasu|to speak|nói
見る|みる|miru|to see|xem
読む|よむ|yomu|to read|đọc
書く|かく|kaku|to write|viết
大きい|おおきい|ookii|big|to
小さい|ちいさい|chiisai|small|nhỏ
新しい|あたらしい|atarashii|new|mới
古い|ふるい|furui|old|cũ
時間|じかん|jikan|time|thời gian
先生|せんせい|sensei|teacher|giáo viên
友達|ともだち|tomodachi|friend|bạn bè
日本|にほん|nihon|Japan|Nhật Bản
電車|でんしゃ|densha|train|tàu điện
駅|えき|eki|station|nhà ga'''
v5=[]
for i,line in enumerate(raw5.splitlines()):
 w,r,ro,en,vi=line.split('|');v5.append({'id':f'starter-n5-{i+1:03d}','word':w,'reading':r,'romaji':ro,'meanings':[en],'meaning_vi':vi,'level':'N5','examples':[],'source':'Tự biên soạn'})
(base/'n5-vocab.json').write_text(json.dumps(v5,ensure_ascii=False,indent=2),encoding='utf8')
# Grammar descriptions and teaching examples below are original Vietnamese explanations.
grammar_text='''〜ながら|Vます bỏ ます + ながら|vừa... vừa...|Hai hành động diễn ra đồng thời, cùng một chủ thể.|音楽を聞きながら勉強します。|Tôi vừa nghe nhạc vừa học.|Hoạt động chính đứng cuối câu.
〜たことがある|Vた + ことがある|đã từng...|Diễn tả trải nghiệm trong quá khứ.|日本へ行ったことがあります。|Tôi đã từng đến Nhật Bản.|Phủ định: 〜たことがありません.
〜つもりだ|V辞書形 / Vない + つもりだ|dự định...|Nói về ý định đã có.|来年日本語を勉強するつもりです。|Năm sau tôi định học tiếng Nhật.|Khác 予定: つもり nhấn mạnh ý định cá nhân.
〜予定だ|V辞書形 / Nの + 予定だ|dự kiến, theo lịch...|Một kế hoạch đã được sắp xếp.|明日は友達と会う予定です。|Ngày mai tôi dự kiến gặp bạn.|Thường dùng khi lịch đã được xác định.
〜たほうがいい|Vた + ほうがいい|nên...|Đưa ra lời khuyên.|早く寝たほうがいいです。|Bạn nên ngủ sớm.|Lời khuyên khá trực tiếp.
〜ないほうがいい|Vない + ほうがいい|không nên...|Khuyên tránh làm điều gì.|そんなに心配しないほうがいい。|Bạn không nên lo quá.|Dùng thể thông thường trước ほう.
〜なくてもいい|Vない bỏ い + くてもいい|không cần phải...|Không có nghĩa vụ thực hiện hành động.|明日は来なくてもいいです。|Ngày mai không cần đến cũng được.|Phân biệt 〜てはいけない: không được.
〜なければならない|Vない bỏ い + ければならない|phải...|Thể hiện nghĩa vụ cần làm.|宿題をしなければなりません。|Tôi phải làm bài tập.|Có cách nói thông dụng 〜なきゃ.
〜てしまう|Vて + しまう|lỡ..., làm xong...|Nhấn mạnh hành động hoàn tất hoặc sự tiếc nuối.|財布を忘れてしまいました。|Tôi lỡ quên ví rồi.|Văn nói: 〜ちゃう / 〜じゃう.
〜ておく|Vて + おく|làm sẵn, chuẩn bị trước|Làm điều gì để phục vụ việc sau đó.|旅行の前にホテルを予約しておきます。|Tôi đặt khách sạn trước chuyến đi.|Văn nói rút gọn: 〜とく.
〜てみる|Vて + みる|thử làm...|Thử thực hiện để xem kết quả.|この服を着てみてもいいですか。|Tôi mặc thử bộ này được không?|みる ở đây là trợ động từ.
〜そうだ (trông có vẻ)|Vます bỏ ます / Aい bỏ い / Aな bỏ な + そう|trông có vẻ...|Phán đoán qua dấu hiệu trực tiếp.|このケーキはおいしそうです。|Chiếc bánh này trông ngon.|いい → よさそう; ない → なさそう.
〜そうだ (nghe nói)|Câu thông thường + そうだ|nghe nói rằng...|Truyền đạt thông tin nghe được.|明日は雨が降るそうです。|Nghe nói ngày mai sẽ mưa.|Khác そうだ chỉ vẻ ngoài.
〜ようだ|Câu thông thường + ようだ|có vẻ như...|Phán đoán dựa trên thông tin.|外は寒いようです。|Ngoài trời hình như lạnh.|N thường dùng Nのようだ.
〜みたいだ|Câu thông thường + みたいだ|cứ như..., hình như...|Phán đoán trong văn nói.|彼は学生みたいです。|Anh ấy trông giống sinh viên.|Thân mật hơn ようだ.
〜らしい|Câu thông thường + らしい|hình như, nghe đâu...|Thông tin suy đoán hoặc gián tiếp.|田中さんは忙しいらしいです。|Hình như anh Tanaka đang bận.|Cũng dùng chỉ tính chất điển hình.
〜かもしれない|Câu thông thường + かもしれない|có lẽ, có thể...|Khả năng không chắc chắn.|彼は来ないかもしれません。|Có lẽ anh ấy không đến.|Cấp độ chắc chắn thấp hơn でしょう.
〜でしょう|Câu thông thường + でしょう|chắc là...|Phỏng đoán khá có cơ sở.|明日は晴れるでしょう。|Ngày mai chắc sẽ nắng.|Cũng dùng hỏi xác nhận.
〜ために|V辞書形 / Nの + ために|để, vì mục đích...|Chủ đích thực hiện hành động.|N4に合格するために毎日勉強します。|Tôi học mỗi ngày để đỗ N4.|Mục đích chủ động, không dùng cho khả năng.
〜ように|V辞書形 / Vない + ように|để sao cho...|Thường dùng với kết quả, khả năng.|忘れないようにメモします。|Tôi ghi chú để không quên.|Hay gặp với できる / わかる.
〜ようになる|V辞書形 / Vない + ようになる|trở nên có thể..., bắt đầu...|Mô tả sự thay đổi khả năng / thói quen.|漢字が読めるようになりました。|Tôi đã có thể đọc Kanji.|Nhấn mạnh sự thay đổi so với trước.
〜ようにする|V辞書形 / Vない + ようにする|cố gắng duy trì...|Chủ động xây dựng thói quen.|毎日日本語を話すようにしています。|Tôi cố nói tiếng Nhật mỗi ngày.|Phân biệt ようになる: kết quả tự thay đổi.
〜ば|Động từ thể điều kiện ば|nếu... thì...|Giả định điều kiện.|時間があれば、行きます。|Nếu có thời gian tôi sẽ đi.|Ví dụ 行く → 行けば.
〜たら|Vた / Aかった / Nだった + ら|nếu, sau khi...|Diễn tả giả định hoặc sau một sự kiện.|駅に着いたら電話してください。|Khi tới ga hãy gọi điện nhé.|Có thể diễn tả trình tự trong tương lai.
〜と (điều kiện)|V辞書形 + と|hễ... thì...|Kết quả tự nhiên hoặc đều đặn.|春になると花が咲きます。|Hễ xuân đến là hoa nở.|Thường không dùng với mệnh lệnh ở vế sau.
〜ても|Vて / Aくて / Nでも + も|cho dù...|Kết quả không thay đổi dù có điều kiện.|雨が降っても行きます。|Dù trời mưa tôi vẫn đi.|Dùng để nhấn mạnh nhượng bộ.
〜のに|Câu thông thường + のに|mặc dù... mà...|Thể hiện sự ngạc nhiên, tiếc nuối.|たくさん勉強したのに、忘れました。|Tôi học nhiều thế mà lại quên.|N / Aな + なのに.
〜ので|Câu thông thường + ので|vì... nên...|Nói nguyên nhân mềm mại, khách quan.|忙しいので、今日は行けません。|Vì bận nên hôm nay tôi không đi được.|Aな / N + なので.
〜んです|Câu thông thường + んです|đấy, là vì...|Giải thích hoàn cảnh, xin giải thích.|どうしたんですか。|Có chuyện gì vậy?|N / Aな + なんです.
〜はずだ|Câu thông thường + はずだ|chắc chắn là... (theo lẽ)|Phỏng đoán dựa vào lý do, logic.|彼はもう家に着いたはずです。|Theo lẽ thì anh ấy đã về nhà rồi.|N + のはず; Aな + なはず.
〜ばかり|N + ばかり|toàn, chỉ...|Việc lặp đi lặp lại mang cảm giác thiên lệch.|弟はゲームばかりしています。|Em trai tôi chỉ toàn chơi game.|〜たばかり: vừa mới làm.
〜やすい|Vます bỏ ます + やすい|dễ...|Hành động dễ thực hiện.|この漢字は覚えやすいです。|Kanji này dễ nhớ.|Ngược nghĩa 〜にくい.
〜にくい|Vます bỏ ます + にくい|khó...|Hành động khó thực hiện.|この本は読みにくいです。|Cuốn sách này khó đọc.|Không phải nghĩa phủ định.
〜すぎる|Vます bỏ ます / Aい bỏ い / Aな bỏ な + すぎる|quá...|Vượt mức vừa phải.|昨日食べすぎました。|Hôm qua tôi ăn quá nhiều.|いい → よすぎる.
〜始める|Vます bỏ ます + 始める|bắt đầu...|Bắt đầu một quá trình.|雨が降り始めました。|Trời bắt đầu mưa.|Hán tự: 始める（はじめる）.
〜終わる|Vます bỏ ます + 終わる|làm xong...|Hoàn thành quá trình.|レポートを書き終わりました。|Tôi viết xong báo cáo.|Hán tự: 終わる（おわる）.
〜続ける|Vます bỏ ます + 続ける|tiếp tục...|Hành động kéo dài liên tục.|毎日走り続けています。|Tôi tiếp tục chạy mỗi ngày.|Hán tự: 続ける（つづける）.
〜方|Vます bỏ ます + 方|cách làm...|Danh từ hóa phương pháp thực hiện.|この漢字の読み方を教えてください。|Hãy chỉ tôi cách đọc Kanji này.|方 đọc かた.
〜間|Vている / Nの + 間|trong lúc...|Hai sự việc tồn tại cùng khoảng thời gian.|夏休みの間、アルバイトをします。|Trong kì nghỉ hè tôi đi làm thêm.|間に: sự kiện xảy ra trong khoảng đó.
〜間に|Vている / Nの + 間に|trong lúc ... thì xảy ra|Sự việc diễn ra tại một điểm trong khoảng.|母が出かけている間に掃除しました。|Lúc mẹ đi vắng tôi đã dọn nhà.|Nhấn mạnh hành động trong khoảng thời gian.
〜てあげる|Vて + あげる|làm giúp ai...|Người nói làm việc có lợi cho người khác.|弟に漢字を教えてあげました。|Tôi dạy Kanji giúp em trai.|Cẩn thận khi dùng với người bề trên.
〜てくれる|Vて + くれる|ai đó làm giúp mình...|Hành động có lợi hướng về người nói.|友達が手伝ってくれました。|Bạn tôi đã giúp tôi.|Chủ thể là người làm giúp.
〜てもらう|Vて + もらう|nhờ, được ai làm giúp...|Người nói nhận sự trợ giúp.|先生に作文を直してもらいました。|Tôi nhờ thầy sửa bài viết.|Trọng tâm là người nhận giúp đỡ.
〜ことにする|V辞書形 / Vない + ことにする|quyết định...|Bản thân quyết định thực hiện.|毎朝走ることにしました。|Tôi quyết định chạy mỗi sáng.|ことになる: quyết định từ hoàn cảnh.
〜ことになる|V辞書形 / Vない + ことになる|được quyết định rằng...|Quyết định dựa trên yếu tố bên ngoài.|来月転勤することになりました。|Có quyết định tháng sau tôi chuyển công tác.|Khác ことにする: tự quyết định.'''
gram=[]
for i,line in enumerate(grammar_text.splitlines()):
 pattern,form,vi,explain,ja,trans,note=line.split('|')
 gram.append({'id':f'starter-grammar-{i+1:03d}','pattern':pattern,'level':'N4','meaning_vi':vi,'formation_vi':form,'explain_vi':explain,'examples':[{'ja':ja,'vi':trans}],'notes_vi':note,'meaning':vi,'formation':form,'tags':['N4'], 'source':'Tự biên soạn'})
(base/'n4-grammar.json').write_text(json.dumps(gram,ensure_ascii=False,indent=2),encoding='utf8')
kanji_lines='''会|カイ|あう|gặp gỡ|6
社|シャ|やしろ|công ty, đền|7
長|チョウ|ながい|dài, trưởng|8
食|ショク|たべる|ăn|9
事|ジ|こと|sự việc|8
聞|ブン|きく|nghe|14
出|シュツ|でる|ra, xuất|5
発|ハツ|—|phát, khởi hành|9
運|ウン|はこぶ|vận chuyển|12
転|テン|ころぶ|chuyển, xoay|11
教|キョウ|おしえる|dạy|11
室|シツ|むろ|phòng|9
心|シン|こころ|tấm lòng|4
思|シ|おもう|nghĩ|9
形|ケイ|かた|hình dạng|7
力|リョク|ちから|sức mạnh|2
起|キ|おきる|thức dậy|10
予|ヨ|あらかじめ|trước|4
定|テイ|さだめる|định, quyết|8
約|ヤク|—|ước hẹn|9
束|ソク|たば|bó, buộc|7
準|ジュン|—|chuẩn|13
備|ビ|そなえる|chuẩn bị|12
説|セツ|とく|giải thích|14
明|メイ|あかるい|sáng|8
必|ヒツ|かならず|tất yếu|5
要|ヨウ|いる|cần thiết|9
安|アン|やすい|an toàn|6
連|レン|つれる|liên tiếp|10
絡|ラク|からむ|liên lạc|12
場|ジョウ|ば|nơi, trường|12
合|ゴウ|あう|hợp, phù hợp|6
経|ケイ|へる|trải qua|11
験|ケン|—|nghiệm, trải nghiệm|18
失|シツ|うしなう|mất|5
敗|ハイ|やぶれる|thua|11
成|セイ|なる|thành|6
功|コウ|—|công, thành tựu|5
意|イ|—|ý|13
見|ケン|みる|nhìn|7
反|ハン|そる|phản|4
対|タイ|—|đối|7
法|ホウ|—|pháp luật|8
律|リツ|—|luật|9
文|ブン|ふみ|văn|4
化|カ|ばける|hóa|4
昔|セキ|むかし|xưa|8
直|チョク|なおす|sửa, trực|8
理|リ|—|lý, lý do|11
由|ユウ|よし|nguyên do|5'''
kan=[]
for i,line in enumerate(kanji_lines.splitlines()):
 c,on,kun,vi,strokes=line.split('|'); kan.append({'character':c,'level':'N4','onyomi':[on],'kunyomi':[kun],'meaning_vi':vi,'meanings':[vi],'strokes':int(strokes),'source':'Tự biên soạn'})
(base/'n4-kanji.json').write_text(json.dumps(kan,ensure_ascii=False,indent=2),encoding='utf8')
(base/'n5-kanji.json').write_text('[]\n',encoding='utf8')
(base/'n5-grammar.json').write_text('[]\n',encoding='utf8')
reading=[
('Đi đến thư viện','図書館で','昨日、私は友達と図書館へ行きました。日本語の本を二冊借りました。来週の月曜日までに返さなければなりません。帰りに駅の近くでコーヒーを飲みました。',[
('昨日、どこへ行きましたか。',['学校','図書館','映画館','病院'],1,'Bạn ấy đã tới thư viện.'),('何冊借りましたか。',['一冊','三冊','二冊','四冊'],2,'Đã mượn hai cuốn sách.'),('いつまでに返しますか。',['今日','来週の月曜日','日曜日','来月'],1,'Hạn trả là thứ Hai tuần sau.')]),
('Thông báo ở trường','学校のお知らせ','来週の金曜日に学校で日本語のスピーチ大会があります。参加したい学生は、火曜日までに先生に名前を教えてください。大会は午後二時から始まります。',[
('何曜日に大会がありますか。',['火曜日','木曜日','金曜日','日曜日'],2,'Cuộc thi diễn ra thứ Sáu.'),('何時に始まりますか。',['午前二時','午後二時','午後四時','午前十時'],1,'Bắt đầu lúc 2 giờ chiều.'),('参加する人は何をしますか。',['先生に名前を教える','早く帰る','本を返す','電話を買う'],0,'Người tham gia phải báo tên cho giáo viên.')]),
('Tin nhắn hẹn gặp','友達からのメール','明日いっしょに映画を見ませんか。午後三時の映画を見ようと思っています。二時半に駅の前で会いましょう。雨が降ったら、駅の中のカフェで待っていてください。',[
('映画は何時からですか。',['二時半','三時','四時','六時'],1,'Bộ phim bắt đầu lúc 3 giờ.'),('雨が降ったらどこで待ちますか。',['公園','学校','駅の中のカフェ','映画館の外'],2,'Nếu trời mưa sẽ chờ ở quán cà phê trong ga.')]),
('Sức khỏe và thói quen','毎日の生活','私は最近、健康のために毎朝三十分歩くようにしています。前はバスで学校へ行きましたが、今は天気がいい日は自転車で行きます。雨の日はバスに乗ります。',[
('毎朝何をしていますか。',['三十分歩く','走る','泳ぐ','寝る'],0,'Mỗi sáng đi bộ 30 phút.'),('雨の日はどうやって学校へ行きますか。',['歩いて','自転車で','電車で','バスで'],3,'Ngày mưa đi bằng xe buýt.')]),
('Ở cửa hàng','お店で','この店では、土曜日と日曜日にかばんを二割引で売っています。しかし、くつは安くなりません。店は朝十時から夜八時まで開いています。',[
('何が安くなりますか。',['くつ','かばん','本','時計'],1,'Túi xách được giảm giá.'),('お店は何時に閉まりますか。',['午前八時','午後六時','午後八時','午後十時'],2,'Cửa hàng đóng lúc 8 giờ tối.')]),
('Kỳ nghỉ','夏休みの予定','今年の夏休みは京都へ旅行するつもりです。ホテルはもう予約してありますが、新幹線の切符はまだ買っていません。出発する前に買っておこうと思います。',[
('ホテルはどうなっていますか。',['予約した','まだ探している','キャンセルした','満室だ'],0,'Khách sạn đã đặt rồi.'),('まだ買っていないものは何ですか。',['おみやげ','新幹線の切符','かばん','本'],1,'Chưa mua vé tàu Shinkansen.')]),
('Công việc làm thêm','アルバイト','田中さんは毎週月曜日から木曜日までレストランで働いています。金曜日は大学の授業が遅くまであるので、アルバイトをしません。土曜日には友達とテニスをすることが多いです。',[
('田中さんは金曜日に働きますか。',['はい','いいえ','毎週ではない','わかりません'],1,'Thứ Sáu không làm do có giờ học.'),('土曜日によく何をしますか。',['勉強','買い物','テニス','料理'],2,'Thường chơi tennis với bạn.')]),
('Quy định nhà ở','アパートのルール','このアパートでは、夜十時以降に大きな音を出してはいけません。ごみは月曜日と木曜日の朝に出してください。自転車は建物の右側に置くことができます。',[
('何時以降は静かにしなければなりませんか。',['午後八時','午後九時','午後十時','午前十時'],2,'Sau 10 giờ tối phải giữ yên lặng.'),('ごみを出せる曜日はどれですか。',['月曜日と木曜日','火曜日と金曜日','水曜日だけ','日曜日'],0,'Đổ rác vào sáng thứ Hai và thứ Năm.')])
]
rd=[]
for i,(title,category,body,qs) in enumerate(reading):
 rd.append({'id':f'original-reading-{i+1:02d}','title':title,'category':category,'level':'N4','text':body,
            'questions':[{'question':q,'options':opts,'answer':ans,'explanation_vi':exp} for q,opts,ans,exp in qs],
            'source':'Tự biên soạn'})
(base/'readings.json').write_text(json.dumps(rd,ensure_ascii=False,indent=2),encoding='utf8')
meta={'content_version':'starter-0.1','corpus':'starter','downloaded_at':None,'source_name':'OpenJLPT (subset of N4 headwords) + original Vietnamese explanations and practice','source_url':'https://github.com/evanclan/OpenJLPT','license':'CC BY-SA 4.0 for adapted OpenJLPT entries; original app code MIT; see DATA-LICENSE.md','counts':{'n4_vocab':len(v),'n5_vocab':len(v5),'n4_grammar':len(gram),'n4_kanji':len(kan),'readings':len(rd)}}
(base/'manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
print(meta['counts'])
