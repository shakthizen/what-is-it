import type { ProjectData, Task } from '../core/schema.js';
import pc from 'picocolors';

export function formatCavemanStatus(data: ProjectData): string {
  const { meta, features, tasks } = data;
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const todo = tasks.filter(t => t.status === 'todo');

  const lines: string[] = [];

  lines.push(`${pc.bold(pc.yellow('UGG.'))} PROJECT: ${pc.cyan(meta.name)} [${pc.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);
  lines.push(`TASKS: ${pc.green(`${done}`)} DONE / ${pc.yellow(`${inProgress.length}`)} ACTIVE / ${pc.white(`${todo.length}`)} TODO (TOTAL: ${total})`);

  lines.push('');
  lines.push(pc.bold('FEATURES:'));
  for (const f of features) {
    const fTasks = tasks.filter(t => t.featureId === f.id);
    const fDone = fTasks.filter(t => t.status === 'done').length;
    const statColor = f.status === 'completed' ? pc.green : f.status === 'in_progress' ? pc.yellow : pc.dim;
    lines.push(`- [${statColor(`${f.progress}%`)}] ${pc.bold(f.title)} (${fDone}/${fTasks.length} tasks)`);
  }

  if (inProgress.length > 0) {
    lines.push('');
    lines.push(pc.bold(pc.yellow('CURRENT FOCUS (DO NOW):')));
    for (const t of inProgress) {
      lines.push(`* [${pc.cyan(t.id)}] "${pc.bold(t.title)}"`);
      lines.push(`  WHY:   ${t.why}`);
      lines.push(`  WHERE: ${pc.underline(t.where)}`);
      lines.push(`  HOW:   ${t.how}`);
      lines.push(`  WHEN:  ${t.when}`);
    }
  } else if (todo.length > 0) {
    const nextTask = todo[0];
    lines.push('');
    lines.push(pc.bold('NEXT QUEUED TASK:'));
    lines.push(`* [${pc.cyan(nextTask.id)}] "${pc.bold(nextTask.title)}"`);
    lines.push(`  WHY:   ${nextTask.why}`);
    lines.push(`  WHERE: ${pc.underline(nextTask.where)}`);
    lines.push(`  HOW:   ${nextTask.how}`);
  }

  lines.push('');
  lines.push(`${pc.dim('AGENT COMMANDS:')}`);
  lines.push(`- Mark done: ${pc.cyan('npx what-is-it task done <id>')}`);
  lines.push(`- Add task:  ${pc.cyan('npx what-is-it task add --title "..." --why "..." --where "..."')}`);
  lines.push(`- Open UI:   ${pc.cyan('npx what-is-it')}`);

  return lines.join('\n');
}

export function formatCavemanSuccess(action: string, id?: string, detail?: string): string {
  let msg = `${pc.bold(pc.yellow('UGG.'))} ${pc.green(action.toUpperCase())}`;
  if (id) msg += ` [${pc.cyan(id)}]`;
  if (detail) msg += ` - ${detail}`;
  return msg;
}

export function formatCavemanError(err: string): string {
  return `${pc.bold(pc.red('GRR.'))} ERROR: ${err}. RUN ${pc.cyan('npx what-is-it status')} TO CHECK.`;
}
