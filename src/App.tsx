import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle, XCircle, Lightbulb, Home, Clock, Trophy, BookOpen } from 'lucide-react';

// 型定義
interface Question {
  title: string;
  data: string;
  task: string;
  answer: string;
  hint: string;
  explanation: string;
  file: string;
}

interface Questions {
  [key: string]: {
    [key: string]: Question[];
  };
}

interface Score {
  correct: number;
  total: number;
}

type Level = 'beginner' | 'intermediate' | 'advanced';
type CommandType = 'grep' | 'sed' | 'awk';
type Mode = 'home' | 'practice' | 'timeattack';

const LinuxCommandQuiz: React.FC = () => {
  // State管理
  const [mode, setMode] = useState<Mode>('home');
  const [level, setLevel] = useState<Level>('beginner');
  const [commandType, setCommandType] = useState<CommandType>('grep');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [commandOutput, setCommandOutput] = useState<string>('');

  // タイムアタック用State
  const [timeAttackQuestions, setTimeAttackQuestions] = useState<Question[]>([]);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimeAttackActive, setIsTimeAttackActive] = useState<boolean>(false);
  const [timeAttackFinished, setTimeAttackFinished] = useState<boolean>(false);

  const questions: Questions = {
    grep: {
      beginner: [
        {
          title: 'テキストから特定の単語を検索',
          data: 'apple\nbanana\napricot\ncherry\navocado',
          task: '「a」で始まる行を抽出してください',
          answer: 'grep ^a',
          hint: '^は行頭を意味します',
          explanation: 'grep ^a で行頭が「a」の行を抽出できます',
          file: 'fruits.txt'
        },
        {
          title: 'エラーログの抽出',
          data: 'INFO: Server started\nERROR: Connection failed\nWARN: Low memory\nERROR: Timeout\nINFO: Request completed',
          task: 'ERRORを含む行を抽出してください',
          answer: 'grep ERROR',
          hint: '単純に検索したい文字列を指定します',
          explanation: 'grep ERROR でERRORを含む行を抽出できます',
          file: 'server.log'
        },
        {
          title: '大文字小文字を区別しない検索',
          data: 'Apple\nBANANA\nCherry\napple\nbanana',
          task: 'appleを大文字小文字を区別せずに抽出してください',
          answer: 'grep -i apple',
          hint: '-iオプションで大文字小文字を無視できます',
          explanation: 'grep -i apple で大文字小文字を区別せずに検索します',
          file: 'items.txt'
        },
        {
          title: 'ファイル内の特定の数字を検索',
          data: 'ID: 12345\nName: John\nAge: 30\nID: 67890\nName: Alice',
          task: 'IDを含む行を抽出してください',
          answer: 'grep ID',
          hint: '検索したい文字列を指定します',
          explanation: 'grep ID でIDを含む行を抽出します',
          file: 'users.txt'
        },
        {
          title: '特定の文字で終わる行を検索',
          data: 'test.txt\nimage.jpg\ndocument.pdf\nscript.sh\nphoto.jpg',
          task: '.jpgで終わる行を抽出してください',
          answer: 'grep \\.jpg$',
          hint: '$は行末を意味します。.は正規表現で任意の文字を意味するため\\.でエスケープが必要です',
          explanation: 'grep \\.jpg$ で.jpgで終わる行を抽出します。$で行末を指定し、\\.でドット文字そのものをマッチさせます',
          file: 'filelist.txt'
        },
        {
          title: '空行以外を抽出',
          data: 'line1\n\nline2\nline3\n\nline4',
          task: '空行以外の行を抽出してください',
          answer: 'grep .',
          hint: '.は任意の1文字を意味します',
          explanation: 'grep . で空行以外を抽出します',
          file: 'text.txt'
        }
      ],
      intermediate: [
        {
          title: '複数パターンのマッチング',
          data: 'user01: login\nuser02: logout\nadmin: login\nuser03: login\nadmin: logout',
          task: 'loginまたはlogoutを含む行を抽出してください',
          answer: 'grep -E "login|logout"',
          hint: '-Eオプションで拡張正規表現が使えます。|はORを意味します',
          explanation: 'grep -E "login|logout" で複数パターンをマッチできます',
          file: 'access.log'
        },
        {
          title: '行番号付きで検索',
          data: 'apple\nbanana\napple pie\ncherry\napple juice',
          task: 'appleを含む行を行番号付きで表示してください',
          answer: 'grep -n apple',
          hint: '-nオプションで行番号を表示できます',
          explanation: 'grep -n apple で行番号付きで検索結果を表示します',
          file: 'menu.txt'
        },
        {
          title: 'マッチした行の前後を表示',
          data: 'line1\nline2\nERROR occurred\nline4\nline5',
          task: 'ERRORを含む行とその前後1行を表示してください',
          answer: 'grep -C 1 ERROR',
          hint: '-C N で前後N行を表示できます',
          explanation: 'grep -C 1 ERROR でマッチした行の前後1行を表示します',
          file: 'debug.log'
        },
        {
          title: '数字のみの行を検索',
          data: '123\nabc\n456\ndef789\n012',
          task: '数字のみで構成される行を抽出してください',
          answer: 'grep -E "^[0-9]+$"',
          hint: '^は行頭、$は行末、+は1回以上の繰り返し',
          explanation: 'grep -E "^[0-9]+$" で数字のみの行を抽出します',
          file: 'data.txt'
        },
        {
          title: 'マッチ回数のカウント',
          data: 'apple pie\nbanana\napple juice\ncherry\napple tart',
          task: 'appleを含む行の数をカウントしてください',
          answer: 'grep -c apple',
          hint: '-cオプションでマッチした行数を表示',
          explanation: 'grep -c apple でマッチした行数をカウントします',
          file: 'recipes.txt'
        },
        {
          title: '複数の単語を含む行',
          data: 'apple and banana\nonly apple\nbanana only\napple with cherry',
          task: 'appleとbananaの両方を含む行を抽出してください',
          answer: 'grep apple | grep banana',
          hint: 'パイプで2つのgrepを繋げます',
          explanation: 'grep apple | grep banana で両方を含む行を抽出',
          file: 'combos.txt'
        }
      ],
      advanced: [
        {
          title: '否定マッチング',
          data: '192.168.1.1 - OK\n192.168.1.2 - ERROR\n192.168.1.3 - OK\n192.168.1.4 - ERROR',
          task: 'ERRORを含まない行を抽出してください',
          answer: 'grep -v ERROR',
          hint: '-vオプションで否定マッチングができます',
          explanation: 'grep -v ERROR でERRORを含まない行を抽出します',
          file: 'status.log'
        },
        {
          title: '複雑な正規表現',
          data: 'test@example.com\ninvalid.email\nuser@domain.co.jp\nbad@\nadmin@site.org',
          task: 'メールアドレス形式の行を抽出してください',
          answer: 'grep -E "^[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]+"',
          hint: '^は行頭、+は1回以上の繰り返し、\\. はドット文字',
          explanation: '正規表現でメールアドレスのパターンをマッチさせます',
          file: 'emails.txt'
        },
        {
          title: 'IPアドレスの抽出',
          data: 'Server: 192.168.1.1\nInvalid: 999.999.999.999\nClient: 10.0.0.5\nText: hello',
          task: '正しいIPアドレス形式の行を抽出してください',
          answer: 'grep -E "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}"',
          hint: '{n,m}で繰り返し回数を指定できます',
          explanation: '正規表現でIPアドレスのパターンをマッチさせます',
          file: 'network.log'
        },
        {
          title: '複数条件の組み合わせ',
          data: 'ERROR: Connection failed at 10:00\nWARN: Disk space low\nERROR: Timeout at 11:30\nINFO: System started',
          task: 'ERRORを含み、かつ「failed」または「Timeout」を含む行を抽出してください',
          answer: 'grep ERROR | grep -E "failed|Timeout"',
          hint: 'パイプで複数のgrepを繋げることができます',
          explanation: 'grepを2回使って条件を絞り込みます',
          file: 'system.log'
        },
        {
          title: '単語境界を使った検索',
          data: 'cat\ncatch\nscat\nthe cat sat',
          task: '単語として「cat」のみを含む行を抽出してください',
          answer: 'grep -w cat',
          hint: '-wオプションで単語全体をマッチ',
          explanation: 'grep -w cat で単語境界を考慮して検索します',
          file: 'words.txt'
        },
        {
          title: '再帰的な検索シミュレーション',
          data: '/var/log/app.log: ERROR found\n/var/log/system.log: INFO message\n/var/log/app.log: WARNING',
          task: 'ERRORまたはWARNINGを含む行を抽出してください',
          answer: 'grep -E "ERROR|WARNING"',
          hint: '拡張正規表現で複数パターンをマッチ',
          explanation: 'grep -E "ERROR|WARNING" で複数パターンを検索',
          file: 'logs_list.txt'
        }
      ]
    },
    sed: {
      beginner: [
        {
          title: '文字列の置換',
          data: 'hello world\nhello everyone\nhello there',
          task: 'helloをhiに置換してください',
          answer: 'sed s/hello/hi/',
          hint: 's/検索/置換/の形式を使います',
          explanation: 'sed s/hello/hi/ で最初のhelloをhiに置換します',
          file: 'greetings.txt'
        },
        {
          title: '特定の行を削除',
          data: 'line1\nline2\nline3\nline4',
          task: '2行目を削除してください',
          answer: 'sed 2d',
          hint: '行番号dで削除できます',
          explanation: 'sed 2d で2行目を削除します',
          file: 'lines.txt'
        },
        {
          title: '空行の削除',
          data: 'line1\n\nline2\n\nline3',
          task: '空行を削除してください',
          answer: 'sed /^$/d',
          hint: '^$は空行を意味します。dで削除',
          explanation: 'sed /^$/d で空行を削除します',
          file: 'document.txt'
        },
        {
          title: '特定の文字を削除',
          data: 'a1b2c3\nd4e5f6',
          task: '数字を全て削除してください',
          answer: 'sed s/[0-9]//g',
          hint: '[0-9]は数字、//は空文字への置換、gは全て',
          explanation: 'sed s/[0-9]//g で数字を削除します',
          file: 'mixed.txt'
        },
        {
          title: 'スペースの削除',
          data: 'hello world\ngood  morning\nnice   day',
          task: '全てのスペースを削除してください',
          answer: 'sed s/ //g',
          hint: 's/ //g でスペースを空文字に置換',
          explanation: 'sed s/ //g で全てのスペースを削除します',
          file: 'spaced.txt'
        },
        {
          title: '最初の行を削除',
          data: 'header\ndata1\ndata2\ndata3',
          task: '1行目を削除してください',
          answer: 'sed 1d',
          hint: '1dで1行目を削除',
          explanation: 'sed 1d で1行目を削除します',
          file: 'table.txt'
        }
      ],
      intermediate: [
        {
          title: '全ての出現を置換',
          data: 'cat cat dog cat',
          task: '全てのcatをbirdに置換してください',
          answer: 'sed s/cat/bird/g',
          hint: '末尾にgフラグを付けます',
          explanation: 'sed s/cat/bird/g でgフラグにより全てのcatを置換します',
          file: 'animals.txt'
        },
        {
          title: '行頭・行末の操作',
          data: 'apple\nbanana\ncherry',
          task: '各行の先頭に「- 」を追加してください',
          answer: 'sed s/^/- /',
          hint: '^は行頭を意味します',
          explanation: 'sed s/^/- / で行頭に文字列を追加します',
          file: 'list.txt'
        },
        {
          title: '特定範囲の行を削除',
          data: 'line1\nline2\nline3\nline4\nline5',
          task: '2行目から4行目を削除してください',
          answer: 'sed 2,4d',
          hint: '開始,終了dで範囲削除できます',
          explanation: 'sed 2,4d で2〜4行目を削除します',
          file: 'data.txt'
        },
        {
          title: '行末に文字を追加',
          data: 'apple\nbanana\ncherry',
          task: '各行の末尾に「.txt」を追加してください',
          answer: 'sed s/$/.txt/',
          hint: '$は行末を意味します',
          explanation: 'sed s/$/.txt/ で行末に文字列を追加します',
          file: 'files.txt'
        },
        {
          title: '複数のスペースを1つに',
          data: 'hello  world\ngood   morning\nnice    day',
          task: '連続するスペースを1つのスペースに置換してください',
          answer: 'sed "s/  */ /g"',
          hint: '*は0回以上の繰り返し',
          explanation: 'sed "s/  */ /g" で複数スペースを1つに置換',
          file: 'spacing.txt'
        },
        {
          title: '特定のパターンを含む行を削除',
          data: 'keep this\ndelete ERROR\nkeep that\ndelete WARNING',
          task: 'deleteを含む行を削除してください',
          answer: 'sed /delete/d',
          hint: '/パターン/d で該当行を削除',
          explanation: 'sed /delete/d でパターンを含む行を削除します',
          file: 'filter.txt'
        }
      ],
      advanced: [
        {
          title: '複数の置換',
          data: 'IP: 192.168.1.1, Port: 8080',
          task: 'IPアドレスを xxx.xxx.xxx.xxx に、ポートを **** にマスキングしてください',
          answer: 'sed -e "s/[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+/xxx.xxx.xxx.xxx/" -e "s/[0-9]\\+/****/"',
          hint: '-eで複数のコマンドを実行できます',
          explanation: '複数の-eオプションで連続した置換を行います',
          file: 'config.txt'
        },
        {
          title: '条件付き置換',
          data: 'ERROR: failed\nINFO: success\nERROR: timeout',
          task: 'ERRORを含む行のみ、failedをFAILEDに置換してください',
          answer: 'sed "/ERROR/s/failed/FAILED/"',
          hint: '/パターン/s/検索/置換/の形式を使います',
          explanation: 'sed "/ERROR/s/failed/FAILED/" で条件付き置換ができます',
          file: 'logs.txt'
        },
        {
          title: '正規表現を使った複雑な置換',
          data: 'Price: $100.50\nPrice: $250.00\nPrice: $75.99',
          task: '価格の数値部分を0.00に置換してください',
          answer: 'sed "s/\\$[0-9]\\+\\.[0-9]\\+/\\$0.00/g"',
          hint: '\\$でドル記号をエスケープ、[0-9]\\+で数字の繰り返し',
          explanation: '正規表現で価格パターンをマッチさせて置換します',
          file: 'prices.txt'
        },
        {
          title: '行の入れ替え',
          data: 'Alice,Tokyo\nBob,Osaka\nCarol,Kyoto',
          task: 'カンマの前後を入れ替えてください（Tokyo,Alice形式に）',
          answer: 'sed "s/\\(.*\\),\\(.*\\)/\\2,\\1/"',
          hint: '\\(\\)でグループ化、\\1 \\2で参照できます',
          explanation: 'sed "s/\\(.*\\),\\(.*\\)/\\2,\\1/" でグループを入れ替えます',
          file: 'records.csv'
        },
        {
          title: '大文字小文字の変換',
          data: 'hello world\ngood morning\nnice day',
          task: '行頭の文字を大文字に変換してください',
          answer: 'sed "s/^./\\U&/"',
          hint: '&はマッチした文字列、\\Uは大文字変換',
          explanation: 'sed "s/^./\\U&/" で行頭を大文字に変換します',
          file: 'sentences.txt'
        },
        {
          title: '特定の行のみ置換',
          data: 'apple\nbanana\napple\ncherry\napple',
          task: '3行目のappleのみをorangeに置換してください',
          answer: 'sed "3s/apple/orange/"',
          hint: '行番号s/検索/置換/で特定行のみ置換',
          explanation: 'sed "3s/apple/orange/" で3行目のみ置換します',
          file: 'fruits_list.txt'
        }
      ]
    },
    awk: {
      beginner: [
        {
          title: '特定の列を抽出',
          data: 'Alice 25 Tokyo\nBob 30 Osaka\nCarol 28 Kyoto',
          task: '1列目(名前)だけを表示してください',
          answer: 'awk \'{print $1}\'',
          hint: '$1は1列目を意味します',
          explanation: 'awk \'{print $1}\' で1列目を抽出します',
          file: 'users.txt'
        },
        {
          title: '列の計算',
          data: '100\n200\n300',
          task: '各行の値を2倍にして表示してください',
          answer: 'awk \'{print $1 * 2}\'',
          hint: '$1に対して演算ができます',
          explanation: 'awk \'{print $1 * 2}\' で各値を2倍にします',
          file: 'numbers.txt'
        },
        {
          title: '複数列の表示',
          data: 'Alice 25 Tokyo\nBob 30 Osaka\nCarol 28 Kyoto',
          task: '名前(1列目)と都市(3列目)を表示してください',
          answer: 'awk \'{print $1, $3}\'',
          hint: 'カンマで区切って複数の列を指定できます',
          explanation: 'awk \'{print $1, $3}\' で1列目と3列目を表示します',
          file: 'people.txt'
        },
        {
          title: '列数のカウント',
          data: 'a b c\nd e\nf g h i',
          task: '各行の列数(フィールド数)を表示してください',
          answer: 'awk \'{print NF}\'',
          hint: 'NFは列数(フィールド数)を表す変数です',
          explanation: 'awk \'{print NF}\' で各行のフィールド数を表示します',
          file: 'fields.txt'
        },
        {
          title: '行番号の表示',
          data: 'apple\nbanana\ncherry',
          task: '各行の行番号とデータを表示してください',
          answer: 'awk \'{print NR, $0}\'',
          hint: 'NRは行番号、$0は行全体を表します',
          explanation: 'awk \'{print NR, $0}\' で行番号と内容を表示',
          file: 'items.txt'
        },
        {
          title: '最後の列を表示',
          data: 'a b c d\ne f g\nh i j k l',
          task: '各行の最後の列を表示してください',
          answer: 'awk \'{print $NF}\'',
          hint: '$NFで最後のフィールドを参照できます',
          explanation: 'awk \'{print $NF}\' で最後の列を表示します',
          file: 'columns.txt'
        }
      ],
      intermediate: [
        {
          title: '条件に基づくフィルタリング',
          data: 'Alice 25\nBob 30\nCarol 28\nDave 35',
          task: '年齢(2列目)が30以上の行を表示してください',
          answer: 'awk \'$2 >= 30\'',
          hint: '条件式だけを書くとその行全体が表示されます',
          explanation: 'awk \'$2 >= 30\' で2列目が30以上の行を抽出します',
          file: 'ages.txt'
        },
        {
          title: '複数列の操作',
          data: 'Apple 100 5\nBanana 80 10\nCherry 120 3',
          task: '商品名と合計金額(単価×数量)を表示してください',
          answer: 'awk \'{print $1, $2 * $3}\'',
          hint: 'カンマで区切って複数の値を表示できます',
          explanation: 'awk \'{print $1, $2 * $3}\' で計算結果を表示します',
          file: 'sales.txt'
        },
        {
          title: '合計の計算',
          data: '100\n200\n300\n400',
          task: '全ての数値の合計を計算してください',
          answer: 'awk \'{sum += $1} END {print sum}\'',
          hint: '変数に加算していき、ENDで最後に表示',
          explanation: 'awk \'{sum += $1} END {print sum}\' で合計を計算します',
          file: 'values.txt'
        },
        {
          title: '文字列の連結',
          data: 'Alice Tokyo\nBob Osaka\nCarol Kyoto',
          task: '「名前 lives in 都市」の形式で表示してください',
          answer: 'awk \'{print $1, "lives in", $2}\'',
          hint: 'ダブルクォートで文字列リテラルを指定できます',
          explanation: 'awk \'{print $1, "lives in", $2}\' で文字列を連結します',
          file: 'locations.txt'
        },
        {
          title: '特定の列の最大値',
          data: '10\n25\n15\n30\n20',
          task: '最大値を求めてください',
          answer: 'awk \'BEGIN {max=0} {if($1>max) max=$1} END {print max}\'',
          hint: 'BEGINで初期化、条件分岐で更新、ENDで出力',
          explanation: 'awkで最大値を計算します',
          file: 'max_data.txt'
        },
        {
          title: '行数のカウント',
          data: 'line1\nline2\nline3\nline4\nline5',
          task: '総行数を表示してください',
          answer: 'awk \'END {print NR}\'',
          hint: 'ENDブロックでNRを表示',
          explanation: 'awk \'END {print NR}\' で総行数を表示します',
          file: 'count.txt'
        }
      ],
      advanced: [
        {
          title: '集計処理',
          data: 'Alice 100\nBob 200\nAlice 150\nBob 100',
          task: '各名前ごとの合計を計算してください',
          answer: 'awk \'{sum[$1] += $2} END {for (name in sum) print name, sum[name]}\'',
          hint: '連想配列とENDブロックを使います',
          explanation: '連想配列で集計し、ENDブロックで結果を出力します',
          file: 'transactions.txt'
        },
        {
          title: 'パターンマッチと集計',
          data: 'INFO 10\nERROR 5\nINFO 20\nERROR 15\nINFO 30',
          task: 'ERRORの行の数値の合計を計算してください',
          answer: 'awk \'/ERROR/ {sum += $2} END {print sum}\'',
          hint: '/パターン/で行をフィルタし、ENDで集計結果を表示',
          explanation: 'パターンマッチで行を絞り込み、集計します',
          file: 'log_entries.txt'
        },
        {
          title: '平均値の計算',
          data: 'Alice 80\nBob 90\nCarol 85\nDave 95',
          task: '2列目の数値の平均値を計算してください',
          answer: 'awk \'{sum += $2; count++} END {print sum/count}\'',
          hint: '合計と個数を記録し、ENDで割り算',
          explanation: 'awk \'{sum += $2; count++} END {print sum/count}\' で平均を計算',
          file: 'scores.txt'
        },
        {
          title: 'CSV形式の処理',
          data: 'Alice,100,Tokyo\nBob,200,Osaka\nCarol,150,Kyoto',
          task: 'カンマ区切りのデータから、名前と金額の合計を表示してください',
          answer: 'awk -F, \'{total[$1] += $2} END {for (n in total) print n, total[n]}\'',
          hint: '-F,でカンマを区切り文字に指定できます',
          explanation: 'awk -F, でCSVを処理し、名前ごとに集計します',
          file: 'data.csv'
        },
        {
          title: '条件による分岐処理',
          data: 'Alice 85\nBob 55\nCarol 92\nDave 48',
          task: '2列目が60以上なら"Pass"、未満なら"Fail"を表示してください',
          answer: 'awk \'{if ($2 >= 60) print $1, "Pass"; else print $1, "Fail"}\'',
          hint: 'if-else文を使って条件分岐',
          explanation: 'awk内でif-else文を使って条件分岐します',
          file: 'results.txt'
        },
        {
          title: '複数の集計を同時に',
          data: 'apple 100\nbanana 200\napple 150\ncherry 80\nbanana 120',
          task: '各商品の合計と個数を表示してください',
          answer: 'awk \'{sum[$1]+=$2; count[$1]++} END {for(i in sum) print i, sum[i], count[i]}\'',
          hint: '2つの連想配列を使います',
          explanation: '複数の連想配列で同時に集計します',
          file: 'products.txt'
        }
      ]
    }
  };

  // タイマー処理
  useEffect(() => {
    let interval: number;
    if (isTimeAttackActive && !timeAttackFinished) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimeAttackActive, timeAttackFinished]);

  // ユーティリティ関数
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswer('');
    setResult(null);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setCommandOutput('');
  };

  const goHome = () => {
    setMode('home');
    resetQuiz();
    setIsTimeAttackActive(false);
    setTimeAttackFinished(false);
    setTimeElapsed(0);
  };

  // タイムアタック開始
  const startTimeAttack = (selectedLevel: Level) => {
    const allQuestions: Question[] = [];
    Object.values(questions).forEach(cmdQuestions => {
      allQuestions.push(...cmdQuestions[selectedLevel]);
    });

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    setTimeAttackQuestions(selected);
    setMode('timeattack');
    setLevel(selectedLevel);
    setCurrentQuestion(0);
    setScore({ correct: 0, total: 0 });
    setTimeElapsed(0);
    setIsTimeAttackActive(true);
    setTimeAttackFinished(false);
    setResult(null);
    setUserAnswer('');
    setCommandOutput('');
  };

  // コマンド実行のシミュレーション
  const simulateCommand = (command: string, data: string): string => {
    const lines = data.split('\n');

    try {
      // grepのシミュレーション
      if (command.includes('grep')) {
        const grepMatch = command.match(/grep\s+(.+)/);
        if (!grepMatch) return '';

        const args = grepMatch[1].trim();

        // -v オプション（否定）
        if (args.startsWith('-v ')) {
          const pattern = args.substring(3).trim();
          return lines.filter(line => !line.includes(pattern)).join('\n');
        }

        // -i オプション（大文字小文字無視）
        if (args.startsWith('-i ')) {
          const pattern = args.substring(3).trim().toLowerCase();
          return lines.filter(line => line.toLowerCase().includes(pattern)).join('\n');
        }

        // -c オプション（カウント）
        if (args.startsWith('-c ')) {
          const pattern = args.substring(3).trim();
          return lines.filter(line => line.includes(pattern)).length.toString();
        }

        // -n オプション（行番号）
        if (args.startsWith('-n ')) {
          const pattern = args.substring(3).trim();
          return lines
            .map((line, idx) => (line.includes(pattern) ? `${idx + 1}:${line}` : null))
            .filter(Boolean)
            .join('\n');
        }

        // -w オプション（単語境界）
        if (args.startsWith('-w ')) {
          const pattern = args.substring(3).trim();
          const regex = new RegExp(`\\b${pattern}\\b`);
          return lines.filter(line => regex.test(line)).join('\n');
        }

        // -E オプション（拡張正規表現）
        if (args.startsWith('-E ')) {
          const pattern = args.substring(3).replace(/"/g, '').trim();
          const regex = new RegExp(pattern);
          return lines.filter(line => regex.test(line)).join('\n');
        }

        // -C オプション（前後の行）
        if (args.match(/-C\s+(\d+)\s+(.+)/)) {
          const match = args.match(/-C\s+(\d+)\s+(.+)/);
          if (match) {
            const context = parseInt(match[1]);
            const pattern = match[2].trim();
            const result: string[] = [];
            lines.forEach((line, idx) => {
              if (line.includes(pattern)) {
                for (let i = Math.max(0, idx - context); i <= Math.min(lines.length - 1, idx + context); i++) {
                  if (!result.includes(lines[i])) result.push(lines[i]);
                }
              }
            });
            return result.join('\n');
          }
        }

        // 正規表現パターン
        if (args.startsWith('^')) {
          const pattern = args.substring(1);
          return lines.filter(line => line.startsWith(pattern)).join('\n');
        }

        if (args.includes('$')) {
          const pattern = args.replace(/\\\./g, '.').replace('$', '');
          return lines.filter(line => line.endsWith(pattern)).join('\n');
        }

        // 通常のgrep
        return lines.filter(line => line.includes(args.trim())).join('\n');
      }

      // sedのシミュレーション
      if (command.includes('sed')) {
        let result = lines.slice();

        // 行削除
        if (command.match(/sed\s+(\d+)d/)) {
          const lineNum = parseInt(command.match(/sed\s+(\d+)d/)![1]);
          result.splice(lineNum - 1, 1);
          return result.join('\n');
        }

        // 範囲削除
        if (command.match(/sed\s+(\d+),(\d+)d/)) {
          const match = command.match(/sed\s+(\d+),(\d+)d/)!;
          const start = parseInt(match[1]);
          const end = parseInt(match[2]);
          result.splice(start - 1, end - start + 1);
          return result.join('\n');
        }

        // 空行削除
        if (command.includes('/^$/d')) {
          return result.filter(line => line.trim() !== '').join('\n');
        }

        // パターン削除
        if (command.match(/sed\s+\/(.+)\/d/)) {
          const pattern = command.match(/sed\s+\/(.+)\/d/)![1];
          return result.filter(line => !line.includes(pattern)).join('\n');
        }

        // 置換
        if (command.includes('s/')) {
          const sedMatch = command.match(/sed\s+(.+)/);
          if (sedMatch) {
            const sedCmd = sedMatch[1];

            // 複数の-eオプション
            if (sedCmd.includes('-e')) {
              const eCommands = sedCmd.match(/-e\s+"([^"]+)"/g);
              if (eCommands) {
                eCommands.forEach(eCmd => {
                  const match = eCmd.match(/-e\s+"s\/(.+?)\/(.+?)\/(g?)"/);
                  if (match) {
                    const [, search, replace, global] = match;
                    const searchRegex = new RegExp(search.replace(/\\\\/g, '\\'), global ? 'g' : '');
                    result = result.map(line => line.replace(searchRegex, replace));
                  }
                });
                return result.join('\n');
              }
            }

            // 通常の置換
            const match = sedCmd.match(/s\/(.+?)\/(.+?)\/(g?)/);
            if (match) {
              const [, search, replace, global] = match;
              const searchRegex = new RegExp(search, global ? 'g' : '');
              return result.map(line => line.replace(searchRegex, replace)).join('\n');
            }
          }
        }
      }

      // awkのシミュレーション
      if (command.includes('awk')) {
        // $1の抽出
        if (command.includes('{print $1}')) {
          return lines.map(line => line.split(/\s+/)[0]).join('\n');
        }

        // 計算
        if (command.includes('$1 * 2')) {
          return lines.map(line => (parseInt(line.split(/\s+/)[0]) * 2).toString()).join('\n');
        }

        // 複数列
        if (command.includes('{print $1, $3}')) {
          return lines.map(line => {
            const parts = line.split(/\s+/);
            return `${parts[0]} ${parts[2]}`;
          }).join('\n');
        }

        // NF
        if (command.includes('{print NF}')) {
          return lines.map(line => line.split(/\s+/).length.toString()).join('\n');
        }

        // NR
        if (command.includes('{print NR, $0}')) {
          return lines.map((line, idx) => `${idx + 1} ${line}`).join('\n');
        }

        // $NF
        if (command.includes('{print $NF}')) {
          return lines.map(line => {
            const parts = line.split(/\s+/);
            return parts[parts.length - 1];
          }).join('\n');
        }

        // 条件フィルタ
        if (command.match(/awk\s+'(.+)'/)) {
          const awkCmd = command.match(/awk\s+'(.+)'/)![1];

          // $2 >= 30 のような条件
          if (awkCmd.match(/\$2\s*>=\s*(\d+)/)) {
            const threshold = parseInt(awkCmd.match(/\$2\s*>=\s*(\d+)/)![1]);
            return lines.filter(line => {
              const parts = line.split(/\s+/);
              return parseInt(parts[1]) >= threshold;
            }).join('\n');
          }

          // 計算
          if (awkCmd.includes('{print $1, $2 * $3}')) {
            return lines.map(line => {
              const parts = line.split(/\s+/);
              return `${parts[0]} ${parseInt(parts[1]) * parseInt(parts[2])}`;
            }).join('\n');
          }

          // 合計
          if (awkCmd.includes('{sum += $1} END {print sum}')) {
            const sum = lines.reduce((acc, line) => acc + parseInt(line.split(/\s+/)[0]), 0);
            return sum.toString();
          }

          // 文字列連結
          if (awkCmd.includes('lives in')) {
            return lines.map(line => {
              const parts = line.split(/\s+/);
              return `${parts[0]} lives in ${parts[1]}`;
            }).join('\n');
          }

          // 行数
          if (awkCmd.includes('END {print NR}')) {
            return lines.length.toString();
          }
        }
      }
      return '(コマンド実行結果)';
    } catch (e) {
      console.error('Command simulation error:', e);
      return '(エラー)';
    }
  };

  // 答えのチェック（複数形式対応）
  const checkAnswer = () => {
    const userCmd = userAnswer.trim();
    const currentQ = mode === 'timeattack' ? timeAttackQuestions[currentQuestion] : questions[commandType][level][currentQuestion];
    const correctCmd = currentQ.answer;
    const fileName = currentQ.file;

    // スペースの正規化
    const normalizedUser = userCmd.replace(/\s+/g, ' ');
    const normalizedCorrect = correctCmd.replace(/\s+/g, ' ');

    const hasIgnoreCaseOption = normalizedCorrect.includes('-i') || normalizedUser.includes('-i');

    const compareCommands = (cmd1: string, cmd2: string): boolean => {
      if (hasIgnoreCaseOption) {
        // -i オプションがある場合の処理
        const normalize = (cmd: string) => {
          return cmd.replace(/(-i\s+)(\S+)/, (match, flag, pattern) => {
            return flag + pattern.toLowerCase();
          }).toLowerCase();
      };
      return normalize(cmd1) === normalize(cmd2);
      }
      return cmd1 === cmd2;
    };

    // パイプ形式と引数形式の両方を許可
    let isCorrect = false;

    // 1. 完全一致（-iオプション考慮）
    if (compareCommands(normalizedUser, normalizedCorrect)) {
      isCorrect = true;
    }

    // 2. パイプ形式 (cat file | command) -> 引数形式 (command file) への変換チェック
    const pipePattern = new RegExp(`cat\\s+${fileName}\\s*\\|\\s*(.+)`);
    const pipeMatch = normalizedUser.match(pipePattern);

    if (pipeMatch && !isCorrect) {
      // パイプ形式が入力された場合、コマンド部分だけ比較
      const commandPart = pipeMatch[1].trim();
      if (compareCommands(commandPart, normalizedCorrect)) {
        isCorrect = true;
      }
    }

    if (!isCorrect) {
      // 引数形式が入力された場合
      // 正解がパイプなしの場合、ファイル名を引数に取る形式も正解とする
      const argPattern = new RegExp(`(.+?)\\s+${fileName}`);
      const argMatch = normalizedUser.match(argPattern);

      if (argMatch) {
        const commandPart = argMatch[1].trim();
        if (compareCommands(commandPart, normalizedCorrect)) {
          isCorrect = true;
        }
      }
    }

    // コマンドの実行結果を生成
    const output = simulateCommand(userCmd.includes('|') ? userCmd.split('|')[1].trim() : userCmd, currentQ.data);
    setCommandOutput(output);

    setResult(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  // 次の問題へ
  const nextQuestion = () => {
    const totalQuestions = mode === 'timeattack' ? timeAttackQuestions.length : questions[commandType][level].length;

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setResult(null);
      setShowHint(false);
      setCommandOutput('');
    } else {
      if (mode === 'timeattack') {
        setIsTimeAttackActive(false);
        setTimeAttackFinished(true);
      } else {
        alert(`お疲れ様でした！スコア: ${score.correct + (result ? 1 : 0)}/${score.total + 1}`);
        resetQuiz();
      }
    }
  };

  // ホーム画面
  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <Terminal className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold mb-2">Linux コマンド練習</h1>
            <p className="text-gray-400 text-lg">grep / sed / awk をマスターしよう</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode('practice')}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-xl shadow-xl transition transform hover:scale-105"
            >
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">練習する</h2>
              <p className="text-blue-200">じっくり学習モード</p>
              <p className="text-sm text-blue-300 mt-2">ヒント機能あり・時間制限なし</p>
            </button>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-xl shadow-xl">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">タイムアタック</h2>
              <p className="text-orange-200 mb-4">6問ランダム出題</p>

              <div className="space-y-2">
                <button
                  onClick={() => startTimeAttack('beginner')}
                  className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition hover:scale-105"
                >
                  初心者コース
                </button>
                <button
                  onClick={() => startTimeAttack('intermediate')}
                  className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition hover:scale-105"
                >
                  中級者コース
                </button>
                <button
                  onClick={() => startTimeAttack('advanced')}
                  className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition hover:scale-105"
                >
                  上級者コース
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // タイムアタック結果画面
  if (mode === 'timeattack' && timeAttackFinished) {
    const finalScore = score.correct + (result ? 1 : 0);
    const finalTotal = score.total + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gray-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">タイムアタック完了！</h1>
            <p className="text-gray-400">お疲れ様でした</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <Clock className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-400 mb-1">経過時間</p>
              <p className="text-4xl font-bold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400 mb-1">正答数</p>
              <p className="text-4xl font-bold">{finalScore} / {finalTotal}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => startTimeAttack(level)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition"
            >
              もう一度挑戦
            </button>
            <button
              onClick={goHome}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              ホームへ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // クイズ画面（練習・タイムアタック共通）
  const currentQuestions = mode === 'timeattack' ? timeAttackQuestions : questions[commandType][level];
  const currentQ = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="w-10 h-10 text-green-400" />
            <h1 className="text-3xl font-bold">
              {mode === 'timeattack' ? 'タイムアタック' : 'Linux コマンド練習'}
            </h1>
          </div>
          <button
            onClick={goHome}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホーム
          </button>
        </div>

        {mode === 'timeattack' && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-lg">
              <span className="text-gray-400">レベル: </span>
              <span className="font-bold">
                {level === 'beginner' ? '初心者' : level === 'intermediate' ? '中級者' : '上級者'}
              </span>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          {mode === 'practice' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">レベル</label>
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value as Level); resetQuiz(); }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">初心者</option>
                  <option value="intermediate">中級者</option>
                  <option value="advanced">上級者</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">コマンド</label>
                <select
                  value={commandType}
                  onChange={(e) => { setCommandType(e.target.value as CommandType); resetQuiz(); }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="grep">grep</option>
                  <option value="sed">sed</option>
                  <option value="awk">awk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">スコア</label>
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-center font-bold">
                  {score.correct} / {score.total}
                </div>
              </div>
            </div>
          )}

          {mode === 'timeattack' && (
            <div className="mb-6">
              <div className="bg-gray-700 border border-gray-600 rounded px-4 py-2 flex justify-between items-center">
                <span className="text-lg font-medium">スコア</span>
                <span className="text-2xl font-bold">{score.correct} / {score.total}</span>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-green-400">
                問題 {currentQuestion + 1} / {currentQuestions.length}
              </h3>
              <span className="text-sm text-gray-400">{currentQ.title}</span>
            </div>
            <p className="text-yellow-300 mb-3">{currentQ.task}</p>

            <div className="bg-black rounded p-3 mb-3 font-mono text-sm overflow-x-auto">
              <div className="text-gray-400 mb-1"># ファイル: {currentQ.file}</div>
              <pre className="text-green-300 whitespace-pre">{currentQ.data}</pre>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">コマンドを入力してください:</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-black rounded p-3 font-mono text-sm flex items-center">
                  <span className="text-gray-400 mr-2">$</span>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && result === null && checkAnswer()}
                    placeholder={`cat ${currentQ.file} | コマンド ...`}
                    className="flex-1 bg-transparent outline-none text-green-300"
                    disabled={result !== null}
                  />
                </div>
              </div>
            </div>

            {result === null && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={checkAnswer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  実行
                </button>
                {mode === 'practice' && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    ヒント
                  </button>
                )}
              </div>
            )}

            {showHint && result === null && mode === 'practice' && (
              <div className="bg-yellow-900 border border-yellow-600 rounded p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-100">{currentQ.hint}</p>
                </div>
              </div>
            )}

            {commandOutput && (
              <div className="bg-black rounded p-3 mb-3 font-mono text-sm overflow-x-auto">
                <div className="text-gray-400 mb-1"># 実行結果:</div>
                <pre className="text-cyan-300 whitespace-pre">{commandOutput || '(出力なし)'}</pre>
              </div>
            )}

            {result !== null && (
              <div className={`rounded p-4 mb-3 ${result ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {result ? (
                    <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-300 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold mb-1">
                      {result ? '正解です！' : '不正解です'}
                    </p>
                    {!result && (
                      <div>
                        <p className="text-sm mb-1">正解例: <code className="bg-black bg-opacity-50 px-2 py-1 rounded">{currentQ.answer}</code></p>
                        <p className="text-sm mb-1">または: <code className="bg-black bg-opacity-50 px-2 py-1 rounded">{currentQ.answer} {currentQ.file}</code></p>
                      </div>
                    )}
                    <p className="text-sm mt-2">{currentQ.explanation}</p>
                  </div>
                </div>
                <button
                  onClick={nextQuestion}
                  className="w-full bg-white bg-opacity-20 hover:bg-gray-200 hover:bg-opacity-30 text-black font-bold py-2 px-4 rounded transition mt-2"
                >
                  {currentQuestion < currentQuestions.length - 1 ? '次の問題へ' : mode === 'timeattack' ? '結果を見る' : 'クイズを終了'}
                </button>
              </div>
            )}
          </div>
        </div>

        {mode === 'practice' && (
          <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
            <h4 className="font-semibold mb-2">💡 使い方</h4>
            <ul className="space-y-1">
              <li>• レベルとコマンドを選択してクイズに挑戦</li>
              <li>• <code className="bg-gray-700 px-1 rounded">cat file.txt | grep pattern</code> または <code className="bg-gray-700 px-1 rounded">grep pattern file.txt</code> の両方の形式で入力可能</li>
              <li>• わからない場合は「ヒント」ボタンをクリック</li>
              <li>• 実行後にコマンドの出力結果が表示されます</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinuxCommandQuiz;