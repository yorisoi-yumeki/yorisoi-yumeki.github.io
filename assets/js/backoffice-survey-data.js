/**
 * backoffice-survey-data.js
 *
 * freee「バックオフィス診断」参加者アンケート（2023年11月〜2024年6月ごろ実施）のうち、
 * 杉田本人が担当した292件から集計。
 *
 * マクロ集計（292件全体）：
 *   - 対応（担当者個人）について何らかの具体的な言及があった回答は292件中50件
 *     （1件が複数テーマに触れていることがあるため、以下のテーマ別内訳の合計・元の50件とは一致しない）
 *   - テーマ別内訳（重複あり）：
 *       丁寧な対応 34件
 *       ヒアリング力・傾聴 7件
 *       的確なアドバイス 5件
 *       親身・誠実な姿勢 5件
 *       好印象・人柄 2件
 *       安心感 2件
 *   - 残り242件は、対応そのものというより診断内容についての回答が中心だった
 *
 * BACKOFFICE_VOICE_THEMES の count は上記マクロ集計の値。BACKOFFICE_VOICES は
 * そのうち実際に引用として掲載する声で、①別の設問（満足度の理由／印象に残ったこと）の
 * 回答が無関係に連結されて文脈が破綻しているもの、②担当者個人ではなく診断内容そのものに
 * ついての言及、③具体性の無い一言・似た表現が重複するもの、を除外している。そのため
 * count（マクロ件数）と実際に掲載される声の件数は一致しない（意図的な仕様。UIでは
 * 両者を明示的に分けて表示する）。
 *
 * 「安心感」は掲載できる具体的な声が0件（内容がいずれも診断内容＝制度理解への安心で、
 * 対応者個人への言及ではなかったため）。excerptもnull。
 *
 * excerpt（グラフのバー内に表示する代表的な一言）は、必ず文として完結している
 * 引用の一部を使うこと（て形やの途中で切れる抜粋にしない）。
 *
 * 生成: 元データ（Googleフォーム回答）からPythonスクリプトで抽出・整形。
 * 掲載する声の並び順・highlight・グラフのexcerptは、scoreではなく「具体性・内容の
 * 濃さ」を基準に選定している（点数が高くても内容が薄いものより、点数がやや低くても
 * 担当者の対応を具体的に描写している声を優先する）。
 */

// 292件全体の定量サマリー（杉田が担当した診断のみ。メニュー問わず全件）
var BACKOFFICE_SURVEY_STATS = {
  responseCount: 292,
  avgScore: 7.56,
  pct8plus: 58.6,
  pct9to10: 30.5,
  respondedAboutHandling: 50
};

// テーマ別マクロ集計（292件中、そのテーマに言及した件数）とグラフの代表一言。
// excerptがnullのテーマは、掲載できる具体的な声が無かったことを示す。
var BACKOFFICE_VOICE_THEMES = [
  { id: "polite", label: "丁寧な対応", count: 34, excerpt: "押売りの様な印象を全く受けなかった事です。" },
  { id: "listen", label: "ヒアリング力・傾聴", count: 7, excerpt: "ヒアリング能力が高く、顧客に対して課題の意識づけがとても上手でした。 トーク内容、質問に対する対応、とても素晴らしかったです。" },
  { id: "sharp", label: "的確なアドバイス", count: 5, excerpt: "弊社の状況を的確に判断して全体的にお話いただけたので、信頼のできるお話ができました。" },
  { id: "sincere", label: "親身・誠実な姿勢", count: 5, excerpt: "弊社の相談事にも親身に、より詳しく答えていただけそうだと感じました。" },
  { id: "likable", label: "好印象・人柄", count: 2, excerpt: "ご担当者の自己紹介は好印象でした" },
  { id: "assure", label: "安心感", count: 2, excerpt: null },
];

// 実際に掲載する声（本文）。1件が複数テーマに該当することもある。
// 並び順・highlightは「具体性スコア」（文字数+テーマ数ボーナス）の降順。
// highlight: true の声は、グラフのどのバーもクリックしていない初期状態で表示する。
var BACKOFFICE_VOICES = [
  {
    score: 8,
    themes: ["listen", "sincere", "likable"],
    quote: "ヒアリング能力が高く、顧客に対して課題の意識づけがとても上手でした。 トーク内容、質問に対する対応、とても素晴らしかったです。 杉田さんは、お客様にとって非常に良いと思います。 商品を押し付けることもなく、さりげなく自社を褒める謙虚な姿勢も好印象でした。",
    highlight: true
  },
  {
    score: 7,
    themes: ["polite"],
    quote: "システム導入以前の問題が多い(社員のIT能力等)のですが、一つ一つ丁寧に解決策の例や他社様の事案等交えてご説明頂き、私が認識すらしていなかった課題が見え、大変有意義でした。",
    highlight: true
  },
  {
    score: 9,
    themes: ["sincere"],
    quote: "100名未満の多くの会社のご相談にのられているとお聞きしたので、弊社の相談事にも親身に、より詳しく答えていただけそうだと感じました。本当に的場さんに似ていらっしゃいますね。",
    highlight: true
  },
  {
    score: 10,
    themes: ["listen"],
    quote: "正直、全く期待していなかったのですが、業務整理をしていただけて本当に助かりました。ERP導入検討をした時でもヒアリングされながら業務整理いただけなかったので、感謝です。",
    highlight: true
  },
  {
    score: 8,
    themes: ["listen"],
    quote: "ヒアリングをしていただいて私自身の頭の整理ができました。あまり時間はありませんが、電帳法の対応について検討を進めていきます。ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite", "sincere"],
    quote: "丁寧に分かり易く説明して頂いたので満足です。 押売りの様な印象を全く受けなかった事です。",
    highlight: true
  },
  {
    score: 10,
    themes: ["sharp"],
    quote: "対話全体の中で、システム連携の話をして、弊社の状況を的確に判断して全体的にお話いただけたので、信頼のできるお話ができました。",
    highlight: true
  },
  {
    score: 10,
    themes: ["polite", "sincere"],
    quote: "担当者の方の誠実な対応がとてもよかった。わからないことも丁寧に教えていただいた。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "私が勉強不足だったので分からないことをすぐに教えて頂きました。 丁寧に説明してくれてありがとうございます。",
    highlight: false
  },
  {
    score: 6,
    themes: ["polite", "listen"],
    quote: "ヒアリング内容を、図解し見える化して頂けた。 丁寧でした",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "ご丁寧に状況を整理していただき、今後の課題をあらいだしていただきました。ありがとうございます。",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "今回は、前回の時よりも とても親切にわかりやす教えて頂きました。 ありがとうございました。",
    highlight: false
  },
  {
    score: 10,
    themes: ["sharp"],
    quote: "現状を的確に把握して下さり、今後検討した方が良いことのアドバイスを頂き大変助かりました。",
    highlight: true
  },
  {
    score: 9,
    themes: ["polite"],
    quote: "当社の現状を把握していただいて、どうすべきかの説明がとても丁寧で分かりやすかったです。",
    highlight: false
  },
  {
    score: 8,
    themes: ["polite"],
    quote: "希望する内容がなかったのに丁寧に説明をしていただき、ありがとうございました。",
    highlight: false
  },
  {
    score: 6,
    themes: ["listen"],
    quote: "ヒアリング内容から、その場でいくつかソリューションを提示してくれたこと",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "説明の間で都度質問をなげかけても丁寧な対応をしていただけました",
    highlight: false
  },
  {
    score: 10,
    themes: ["polite"],
    quote: "丁寧なご説明をして頂き、またお話をお伺いしたいと思いました。",
    highlight: false
  },
  {
    score: 9,
    themes: ["listen"],
    quote: "冷静にヒアリング頂き、短時間で整理できたのはすばらしい",
    highlight: false
  },
  {
    score: 10,
    themes: ["listen"],
    quote: "こちらの課題に真摯に耳を傾けて下さったこと。",
    highlight: false
  },
  {
    score: 8,
    themes: ["sharp"],
    quote: "弊社の状況に的確なアドバイスをいただけた。",
    highlight: false
  },
  {
    score: 6,
    themes: ["sharp"],
    quote: "現状に対し的確なご意見を頂きましたので",
    highlight: false
  },
  {
    score: 5,
    themes: ["likable"],
    quote: "ご担当者の自己紹介は好印象でした。",
    highlight: true
  },
];
