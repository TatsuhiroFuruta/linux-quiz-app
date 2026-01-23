// grep コマンドのシミュレーション
const simulateGrep = (args: string, lines: string[]): string => {
  if (args.startsWith('-v ')) {
    const pattern = args.substring(3).trim();
    return lines.filter(line => !line.includes(pattern)).join('\n');
  }

  if (args.startsWith('-i ')) {
    const pattern = args.substring(3).trim().toLowerCase();
    return lines.filter(line => line.toLowerCase().includes(pattern)).join('\n');
  }

  if (args.startsWith('-c ')) {
    const pattern = args.substring(3).trim();
    return lines.filter(line => line.includes(pattern)).length.toString();
  }

  if (args.startsWith('-n ')) {
    const pattern = args.substring(3).trim();
    return lines
      .map((line, idx) => (line.includes(pattern) ? `${idx + 1}:${line}` : null))
      .filter(Boolean)
      .join('\n');
  }

  if (args.startsWith('-w ')) {
    const pattern = args.substring(3).trim();
    const regex = new RegExp(`\\b${pattern}\\b`);
    return lines.filter(line => regex.test(line)).join('\n');
  }

  if (args.startsWith('-E ')) {
    const pattern = args.substring(3).replace(/"/g, '').trim();
    const regex = new RegExp(pattern);
    return lines.filter(line => regex.test(line)).join('\n');
  }

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

  if (args.startsWith('^')) {
    const pattern = args.substring(1);
    return lines.filter(line => line.startsWith(pattern)).join('\n');
  }

  if (args.includes('$')) {
    const pattern = args.replace(/\\\./g, '.').replace('$', '');
    return lines.filter(line => line.endsWith(pattern)).join('\n');
  }

  return lines.filter(line => line.includes(args.trim())).join('\n');
};

// sed コマンドのシミュレーション
const simulateSed = (command: string, lines: string[]): string => {
  let result = lines.slice();

  if (command.match(/sed\s+(\d+)d/)) {
    const lineNum = parseInt(command.match(/sed\s+(\d+)d/)![1]);
    result.splice(lineNum - 1, 1);
    return result.join('\n');
  }

  if (command.match(/sed\s+(\d+),(\d+)d/)) {
    const match = command.match(/sed\s+(\d+),(\d+)d/)!;
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    result.splice(start - 1, end - start + 1);
    return result.join('\n');
  }

  if (command.includes('/^$/d')) {
    return result.filter(line => line.trim() !== '').join('\n');
  }

  if (command.match(/sed\s+\/(.+)\/d/)) {
    const pattern = command.match(/sed\s+\/(.+)\/d/)![1];
    return result.filter(line => !line.includes(pattern)).join('\n');
  }

  if (command.includes('s/')) {
    const sedMatch = command.match(/sed\s+(.+)/);
    if (sedMatch) {
      const sedCmd = sedMatch[1];

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

      const match = sedCmd.match(/s\/(.+?)\/(.+?)\/(g?)/);
      if (match) {
        const [, search, replace, global] = match;
        const searchRegex = new RegExp(search, global ? 'g' : '');
        return result.map(line => line.replace(searchRegex, replace)).join('\n');
      }
    }
  }

  return result.join('\n');
};

// awk コマンドのシミュレーション
const simulateAwk = (command: string, lines: string[]): string => {
  if (command.includes('{print $1}')) {
    return lines.map(line => line.split(/\s+/)[0]).join('\n');
  }

  if (command.includes('$1 * 2')) {
    return lines.map(line => (parseInt(line.split(/\s+/)[0]) * 2).toString()).join('\n');
  }

  if (command.includes('{print $1, $3}')) {
    return lines.map(line => {
      const parts = line.split(/\s+/);
      return `${parts[0]} ${parts[2]}`;
    }).join('\n');
  }

  if (command.includes('{print NF}')) {
    return lines.map(line => line.split(/\s+/).length.toString()).join('\n');
  }

  if (command.includes('{print NR, $0}')) {
    return lines.map((line, idx) => `${idx + 1} ${line}`).join('\n');
  }

  if (command.includes('{print $NF}')) {
    return lines.map(line => {
      const parts = line.split(/\s+/);
      return parts[parts.length - 1];
    }).join('\n');
  }

  if (command.match(/awk\s+'(.+)'/)) {
    const awkCmd = command.match(/awk\s+'(.+)'/)![1];

    if (awkCmd.match(/\$2\s*>=\s*(\d+)/)) {
      const threshold = parseInt(awkCmd.match(/\$2\s*>=\s*(\d+)/)![1]);
      return lines.filter(line => {
        const parts = line.split(/\s+/);
        return parseInt(parts[1]) >= threshold;
      }).join('\n');
    }

    if (awkCmd.includes('{print $1, $2 * $3}')) {
      return lines.map(line => {
        const parts = line.split(/\s+/);
        return `${parts[0]} ${parseInt(parts[1]) * parseInt(parts[2])}`;
      }).join('\n');
    }

    if (awkCmd.includes('{sum += $1} END {print sum}')) {
      const sum = lines.reduce((acc, line) => acc + parseInt(line.split(/\s+/)[0]), 0);
      return sum.toString();
    }

    if (awkCmd.includes('lives in')) {
      return lines.map(line => {
        const parts = line.split(/\s+/);
        return `${parts[0]} lives in ${parts[1]}`;
      }).join('\n');
    }

    if (awkCmd.includes('END {print NR}')) {
      return lines.length.toString();
    }
  }

  return '(コマンド実行結果)';
};

// メインのシミュレーション関数
export const simulateCommand = (command: string, data: string): string => {
  const lines = data.split('\n');

  try {
    if (command.includes('grep')) {
      const grepMatch = command.match(/grep\s+(.+)/);
      if (!grepMatch) return '';
      return simulateGrep(grepMatch[1].trim(), lines);
    }

    if (command.includes('sed')) {
      return simulateSed(command, lines);
    }

    if (command.includes('awk')) {
      return simulateAwk(command, lines);
    }

    return '(コマンド実行結果)';
  } catch {
    return '(エラー)';
  }
};
