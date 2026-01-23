// コマンドの比較関数（-iオプション考慮）
const compareCommands = (cmd1: string, cmd2: string, hasIgnoreCaseOption: boolean): boolean => {
  if (hasIgnoreCaseOption) {
    const normalize = (cmd: string) => {
      return cmd.replace(/(-i\s+)(\S+)/, (match, flag, pattern) => {
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
  correctCommand: string,
  fileName: string
): boolean => {
  const normalizedUser = userCommand.replace(/\s+/g, ' ');
  const normalizedCorrect = correctCommand.replace(/\s+/g, ' ');

  const hasIgnoreCaseOption = normalizedCorrect.includes('-i') || normalizedUser.includes('-i');

  // 1. 完全一致（-iオプション考慮）
  if (compareCommands(normalizedUser, normalizedCorrect, hasIgnoreCaseOption)) {
    return true;
  }

  // 2. パイプ形式 (cat file | command)
  const pipePattern = new RegExp(`cat\\s+${fileName}\\s*\\|\\s*(.+)`);
  const pipeMatch = normalizedUser.match(pipePattern);

  if (pipeMatch) {
    const commandPart = pipeMatch[1].trim();
    if (compareCommands(commandPart, normalizedCorrect, hasIgnoreCaseOption)) {
      return true;
    }
  }

  // 3. 引数形式 (command file)
  const argPattern = new RegExp(`(.+?)\\s+${fileName}$`);
  const argMatch = normalizedUser.match(argPattern);

  if (argMatch) {
    const commandPart = argMatch[1].trim();
    if (compareCommands(commandPart, normalizedCorrect, hasIgnoreCaseOption)) {
      return true;
    }
  }

  return false;
};