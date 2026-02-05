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

// コマンドの比較関数（-iオプション考慮）
const compareCommands = (cmd1: string, cmd2: string, hasIgnoreCaseOption: boolean): boolean => {
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
export const validateCommand = (
  userCommand: string,
  correctCommand: string | string[],
  fileName: string
): boolean => {
  const normalizedUser = userCommand.replace(/\s+/g, ' ');

  // 正解が配列の場合は、いずれかに一致すればOK
  const correctCommands = Array.isArray(correctCommand) ? correctCommand : [correctCommand];

  for (const correctCmd of correctCommands) {
    const normalizedCorrect = correctCmd.replace(/\s+/g, ' ');
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
    if (compareCommands(normalizedUserClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
      return true;
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
