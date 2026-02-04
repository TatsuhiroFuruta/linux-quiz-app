// コマンドのクォートを正規化（シングル、ダブル、なしを統一）
const normalizeQuotes = (cmd: string): string => {
  // sed 's/.../' と sed "s/..." と sed s/.../ を同一視
  return cmd
    .replace(/sed\s+'/g, 'sed ')
    .replace(/sed\s+"/g, 'sed ')
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
  console.log(userCommand);
  console.log(userCommand.length);
  console.log(normalizedUser);
  console.log(normalizedUser.length);

  // 正解が配列の場合は、いずれかに一致すればOK
  const correctCommands = Array.isArray(correctCommand) ? correctCommand : [correctCommand];

  for (const correctCmd of correctCommands) {
    const normalizedCorrect = correctCmd.replace(/\s+/g, ' ');
    const hasIgnoreCaseOption = normalizedCorrect.includes('-i') || normalizedUser.includes('-i');

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
      const commandPartClean = normalizeQuotes(commandPart);
      if (compareCommands(commandPartClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
        return true;
      }
    }

    // 3. 引数形式 (command file)
    const argPattern = new RegExp(`(.+?)\\s+${fileName}$`);
    const argMatch = normalizedUser.match(argPattern);
    console.log(argMatch);

    if (argMatch) {
      const commandPart = argMatch[1].trim();
      console.log(commandPart);
      const commandPartClean = normalizeQuotes(commandPart);
      if (compareCommands(commandPartClean, normalizedCorrectClean, hasIgnoreCaseOption)) {
        return true;
      }
    }
  }

  return false;
};
