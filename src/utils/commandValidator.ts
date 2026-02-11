// sedパターンがクォートなしで動作可能かチェックする関数
const canSedWorkWithoutQuotes = (cmd: string): boolean => {
  // sedコマンドが含まれていない場合はチェック不要
  if (!cmd.includes('sed')) {
    return true;
  }

  // -e オプション付きの場合
  if (cmd.includes(' -e ')) {
    // -e の後のパターンを抽出
    const ePatterns = cmd.match(/-e\s+(\S+)/g);
    if (!ePatterns) return false;

    // すべての -e パターンをチェック
    for (const ePattern of ePatterns) {
      const pattern = ePattern.replace(/-e\s+/, '');
      // クォートがある場合はOK
      if (pattern.startsWith("'") || pattern.startsWith('"')) {
        continue;
      }
      // クォートなしの場合、スペースや特殊文字があればNG
      if (hasSpecialCharsRequiringQuotes(pattern)) {
        return false;
      }
    }
    return true;
  }

  // 通常のsedコマンド
  const sedPattern = cmd.match(/sed\s+(.+?)(?:\s+\S+\.\S+)?$/);
  if (!sedPattern) return true;

  const pattern = sedPattern[1].trim();

  // クォートがある場合はOK
  if (pattern.startsWith("'") || pattern.startsWith('"')) {
    return true;
  }

  // クォートなしの場合、スペースや特殊文字があればNG
  return !hasSpecialCharsRequiringQuotes(pattern);
};

// クォートが必要な特殊文字を含むかチェック
const hasSpecialCharsRequiringQuotes = (pattern: string): boolean => {
  // スペースを含む場合は必ずクォートが必要
  if (pattern.includes(' ')) {
    return true;
  }

  // バックスラッシュを含む場合は必ずクォートが必要
  // 例: \+, \., \$, \(, \) などのエスケープシーケンス
  if (pattern.includes('\\')) {
    return true;
  }

  // 以下の特殊文字はシェルが解釈するためクォート必要
  const shellSpecialChars = [
    '&',   // バックグラウンド実行
    ';',   // コマンド区切り
    '<',   // リダイレクト
    '>',   // リダイレクト
    '`',   // コマンド置換
  ];

  for (const char of shellSpecialChars) {
    if (pattern.includes(char)) {
      return true;
    }
  }

  // 注: $, *, ?, [, ], (, ), ^ はsedの正規表現として使えるのでクォート不要
  // ただし、バックスラッシュでエスケープされている場合（\(, \$等）はクォート必須（上でチェック済み）
  return false;
};

// awkコマンドのクォートをチェックする関数
const hasAwkQuotes = (cmd: string): boolean => {
  // awkコマンドが含まれていない場合はチェック不要
  if (!cmd.includes('awk')) {
    return true;
  }

  // awk の後にシングルクォートがあるかチェック（ダブルクォートは不可）
  // awk '{...}' または awk -F, '{...}' など
  // ダブルクォートはシェルが$変数を展開してしまうため不可
  return /awk\s+(?:-[A-Za-z]\S*\s+)?'/.test(cmd);
};

// awkコマンド内のスペースを正規化する関数
const normalizeAwkSpaces = (awkCmd: string): string => {
  // クォートがある場合とない場合の両方に対応
  // パターン1: awk '{...}' (クォートあり)
  let match = awkCmd.match(/awk\s+(?:-[A-Za-z]\S*\s+)?'([^']+)'/);

  // パターン2: awk {...} (クォートなし、normalizeQuotes後)
  // 複数の{...}ブロック（END など）も考慮して全体を取得
  if (!match) {
    match = awkCmd.match(/awk\s+(?:-[A-Za-z]\S*\s+)?(.+)/);
  }

  if (!match) return awkCmd;

  let normalized = match[1];

  // まず、キーワードの後に必ずスペースを入れる（保護）
  // awkのキーワード: for, if, while, print, printf, in, など
  normalized = normalized.replace(/\b(for|if|while|print|printf|return|delete|in)\(/g, '$1 (');
  normalized = normalized.replace(/\b(for|if|while)\{/g, '$1 {');
  normalized = normalized.replace(/\b(else)\{/g, '$1 {');

  // printやprintfと$の間にもスペースを入れる（print$1 → print $1）
  normalized = normalized.replace(/\b(print[f]?)(\$)/g, '$1 $2');

  // 演算子の前後のスペースを統一（削除）
  // 注意: += や -= などの複合演算子を先に処理
  normalized = normalized.replace(/\s*\+=\s*/g, '+=');
  normalized = normalized.replace(/\s*-=\s*/g, '-=');
  normalized = normalized.replace(/\s*\*=\s*/g, '*=');
  normalized = normalized.replace(/\s*\/=\s*/g, '/=');

  // 単一演算子
  normalized = normalized.replace(/\s*\*\s*/g, '*');  // * の前後
  normalized = normalized.replace(/\s*\+\s*/g, '+');  // + の前後
  normalized = normalized.replace(/\s*\/\s*/g, '/');  // / の前後
  normalized = normalized.replace(/\s*=\s*/g, '=');   // = の前後（注: ==は別処理）
  normalized = normalized.replace(/\s*>=\s*/g, '>='); // >= の前後
  normalized = normalized.replace(/\s*<=\s*/g, '<='); // <= の前後
  normalized = normalized.replace(/\s*!=\s*/g, '!='); // != の前後
  normalized = normalized.replace(/\s*==\s*/g, '=='); // == の前後
  normalized = normalized.replace(/\s*>\s*/g, '>');   // > の前後
  normalized = normalized.replace(/\s*<\s*/g, '<');   // < の前後

  // コンマの前後のスペースを削除
  normalized = normalized.replace(/\s*,\s*/g, ',');

  // 括弧の前後のスペースを削除
  normalized = normalized.replace(/\s*\(\s*/g, '(');
  normalized = normalized.replace(/\s*\)\s*/g, ')');
  normalized = normalized.replace(/\s*\{\s*/g, '{');
  normalized = normalized.replace(/\s*\}\s*/g, '}');

  // $の後のスペースを削除
  normalized = normalized.replace(/\$\s+/g, '$');

  // 複数スペースを1つに
  normalized = normalized.replace(/\s+/g, ' ');

  // 前後の空白を削除
  normalized = normalized.trim();

  return normalized;
};

// awkコマンドの掛け算の交換法則を考慮した正規化
const normalizeAwkMultiplication = (awkNormalized: string): string => {
  // $1 * 2 と 2 * $1 を同一視
  // $2 * $3 と $3 * $2 を同一視

  // パターン1: $数字 * 数字 → 数字 * $数字 に統一
  awkNormalized = awkNormalized.replace(/(\$\d+)\*(\d+)/g, '$2*$1');

  // パターン2: $数字 * $数字 → 小さい方を前に（ソート）
  awkNormalized = awkNormalized.replace(/(\$\d+)\*(\$\d+)/g, (_match, a, b) => {
    const numA = parseInt(a.substring(1));
    const numB = parseInt(b.substring(1));
    return numA <= numB ? `${a}*${b}` : `${b}*${a}`;
  });

  return awkNormalized;
};

// sedコマンドのスペース+アスタリスクパターンをチェック
const validateSedSpacePattern = (cmd: string): boolean => {
  // s/ */ /g のようなパターンを検出
  const spaceStarPattern = cmd.match(/s\/(\s+)\*\s*\/\s*\/g?/);

  if (spaceStarPattern) {
    const spaceCount = spaceStarPattern[1].length;
    // スペース2つまたは3つのみ正解
    // スペース1つ、または4つ以上は不正解
    return spaceCount === 2 || spaceCount === 3;
  }

  // このパターンが含まれていない場合はチェック不要
  return true;
};

// sedコマンドのクォートをチェックする関数（必要な場合のみ）
const hasSedQuotes = (cmd: string): boolean => {
  // sedコマンドが含まれていない場合はチェック不要
  if (!cmd.includes('sed')) {
    return true;
  }

  // クォートなしでも動作可能なコマンドかチェック
  if (canSedWorkWithoutQuotes(cmd)) {
    return true;
  }

  // クォートが必要な場合、実際にクォートがあるかチェック
  // -e オプションがある場合
  if (cmd.includes(' -e ')) {
    const ePatterns = cmd.match(/-e\s+['"]/g);
    const eCount = (cmd.match(/-e\s+/g) || []).length;
    return ePatterns !== null && ePatterns.length === eCount;
  }

  // 通常のsedコマンド: sed 's/.../' または sed "s/..."
  return /sed\s+['"]/.test(cmd);
};

// コマンドのクォートを正規化（シングル、ダブル、なしを統一）
const normalizeQuotes = (cmd: string): string => {
  // sed 's/.../' と sed "s/..." を同一視（クォートを除去）
  // awk '{...}' のシングルクォートを除去（ダブルクォートは不正解なので除去しない）
  return cmd
    .replace(/sed\s+'/g, 'sed ')
    .replace(/sed\s+"/g, 'sed ')
    .replace(/awk\s+'/g, 'awk ')
    .replace(/awk\s+-[A-Za-z]\S*\s+'/g, (match) => match.replace(/'/g, ''))
    .replace(/'/g, '')
    .replace(/"/g, '');
};

// コマンドの比較関数（-iオプション考慮、awkの柔軟な比較）
const compareCommands = (cmd1: string, cmd2: string, hasIgnoreCaseOption: boolean): boolean => {
  // sedコマンドで s/  */ /g と s/   */ /g を同一視
  if (cmd1.includes('sed') && cmd2.includes('sed')) {
    // s/ {2,3}\*/ を s/  */ に正規化（スペース2〜3個を2個に統一）
    const normalizeSedSpaces = (cmd: string) => {
      return cmd.replace(/s\/ {2,3}\*/g, 's/  *');
    };

    const sedNorm1 = normalizeSedSpaces(cmd1);
    const sedNorm2 = normalizeSedSpaces(cmd2);

    // 正規化後に比較
    if (sedNorm1 === sedNorm2) {
      return true;
    }
    // 正規化しても一致しない場合は、通常の比較に進む
  }

  // awkコマンドの場合は特別処理
  if (cmd1.includes('awk') && cmd2.includes('awk')) {
    // 片方だけに cat コマンドが含まれている場合は不一致
    // \bcat\s+ で「catの後に必ずスペース」をチェック
    // これにより catusers.txt などは除外される
    const cmd1HasCat = /\bcat\s+/.test(cmd1);
    const cmd2HasCat = /\bcat\s+/.test(cmd2);

    if (cmd1HasCat !== cmd2HasCat) {
      return false;
    }

    const normalized1 = normalizeAwkMultiplication(normalizeAwkSpaces(cmd1));
    const normalized2 = normalizeAwkMultiplication(normalizeAwkSpaces(cmd2));
    return normalized1 === normalized2;
  }

  if (hasIgnoreCaseOption) {
    const normalize = (cmd: string) => {
      return cmd.replace(/(-i\s+)(\S+)/, (_match, flag, pattern) => {
        return flag + pattern.toLowerCase();
      }).toLowerCase();
    };
    return normalize(cmd1) === normalize(cmd2);
  }
  return cmd1 === cmd2;
};

// ユーザーの入力が正解かチェック
// クォート内のスペースを保護しながら、コマンド全体のスペースを正規化
const normalizeSpaces = (cmd: string): string => {
  // シングルクォートとダブルクォート内のスペースを一時的に保護
  const quotes: string[] = [];
  let index = 0;

  // クォート内の文字列を抽出して保護
  const withPlaceholders = cmd.replace(/(['"])(.+?)\1/g, (match) => {
    const placeholder = `__QUOTE_${index}__`;
    quotes[index] = match;
    index++;
    return placeholder;
  });

  // クォート外のスペースのみ正規化
  const normalized = withPlaceholders.replace(/\s+/g, ' ');

  // クォート内の文字列を復元
  let result = normalized;
  quotes.forEach((quote, i) => {
    result = result.replace(`__QUOTE_${i}__`, quote);
  });

  return result;
};

export const validateCommand = (
  userCommand: string,
  correctCommand: string | string[],
  fileName: string
): boolean => {
  // sedのスペース+アスタリスクパターンは正規化前にチェック
  if (!validateSedSpacePattern(userCommand)) {
    if (userCommand.includes('sed')) {
      return false; // スペース数が正しくない場合は不正解
    }
  }

  // クォート内のスペースを保護しながら正規化
  const normalizedUser = normalizeSpaces(userCommand);

  // 正解が配列の場合は、いずれかに一致すればOK
  const correctCommands = Array.isArray(correctCommand) ? correctCommand : [correctCommand];

  for (const correctCmd of correctCommands) {
    const normalizedCorrect = normalizeSpaces(correctCmd);
    const hasIgnoreCaseOption = normalizedCorrect.includes('-i') || normalizedUser.includes('-i');

    // sedコマンドの場合、必要なクォートがあるかチェック
    if (!hasSedQuotes(normalizedUser)) {
      // sedコマンドでクォートが必要なのに無い場合は不正解
      if (normalizedUser.includes('sed')) {
        continue; // 次の正解候補をチェック
      }
    }

    // awkコマンドの場合、クォートが必須
    if (!hasAwkQuotes(normalizedUser)) {
      if (normalizedUser.includes('awk')) {
        continue; // 次の正解候補をチェック
      }
    }

    // クォートを正規化して比較
    const normalizedUserClean = normalizeQuotes(normalizedUser);
    const normalizedCorrectClean = normalizeQuotes(normalizedCorrect);

    // 1. 完全一致（クォート正規化 + -iオプション考慮）
    // ただし、ユーザー入力にパイプ記号が含まれている場合は、
    // パイプ形式として検証するためスキップ
    if (!normalizedUser.includes('|')) {
      if (compareCommands(normalizedUserClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
        return true;
      }
    }

    // 2. パイプ形式 (cat file | command)
    const pipePattern = new RegExp(`cat\\s+${fileName}\\s*\\|\\s*(.+)`);
    const pipeMatch = normalizedUser.match(pipePattern);

    if (pipeMatch) {
      const commandPart = pipeMatch[1].trim();

      // sedコマンドの場合、クォートチェック
      if (!hasSedQuotes(commandPart) && commandPart.includes('sed')) {
        continue;
      }

      // sedコマンドのスペースパターンチェック
      if (!validateSedSpacePattern(commandPart) && commandPart.includes('sed')) {
        continue;
      }

      // awkコマンドの場合、クォートチェック
      if (!hasAwkQuotes(commandPart) && commandPart.includes('awk')) {
        continue;
      }

      const commandPartClean = normalizeQuotes(commandPart);
      if (compareCommands(commandPartClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
        return true;
      }
    }

    // 3. 引数形式 (command file)
    const argPattern = new RegExp(`(.+?)\\s+${fileName}$`);
    const argMatch = normalizedUser.match(argPattern);

    if (argMatch) {
      const commandPart = argMatch[1].trim();

      // sedコマンドの場合、クォートチェック
      if (!hasSedQuotes(commandPart) && commandPart.includes('sed')) {
        continue;
      }

      // sedコマンドのスペースパターンチェック
      if (!validateSedSpacePattern(commandPart) && commandPart.includes('sed')) {
        continue;
      }

      // awkコマンドの場合、クォートチェック
      if (!hasAwkQuotes(commandPart) && commandPart.includes('awk')) {
        continue;
      }

      const commandPartClean = normalizeQuotes(commandPart);
      if (compareCommands(commandPartClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
        return true;
      }
    }
  }

  return false;
};
