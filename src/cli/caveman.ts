import type { ProjectData, Task } from '../core/schema.js';
import pc from 'picocolors';

export function formatCavemanStatus(data: ProjectData): string {
  const { meta, features, tasks = [] } = data;
  const allSubFeatures = features.flatMap(f => f.subFeatures || []);
  const hasSubFeatures = allSubFeatures.length > 0;

  const lines: string[] = [];

  lines.push(`${pc.bold(pc.yellow('UGG.'))} PROJECT: ${pc.cyan(meta.name)} [${pc.green(`${meta.overallProgress}%`)} DONE] TYPE: ${meta.projectType}`);

  if (hasSubFeatures) {
    const implementedCount = allSubFeatures.filter(s => s.status === 'implemented').length;
    const inProgress = allSubFeatures.filter(s => s.status === 'in_progress');
    const missing = allSubFeatures.filter(s => s.status === 'missing');

    lines.push(`SPECS: ${pc.green(`${implementedCount}`)} IMPLEMENTED / ${pc.yellow(`${inProgress.length}`)} ACTIVE / ${pc.red(`${missing.length}`)} MISSING (TOTAL: ${allSubFeatures.length})`);

    lines.push('');
    lines.push(pc.bold('FEATURES:'));
    for (const f of features) {
      const subs = f.subFeatures || [];
      const done = subs.filter(s => s.status === 'implemented').length;
      const statColor = f.status === 'completed' ? pc.green : f.status === 'in_progress' ? pc.yellow : pc.dim;
      lines.push(`- [${statColor(`${f.progress}%`)}] ${pc.bold(f.title)} (${done}/${subs.length} sub-features)`);
      if (f.missingDetails && f.missingDetails.whatsMissing?.length > 0) {
        lines.push(`  ${pc.red('!')} GAPS: ${pc.dim(f.missingDetails.whatsMissing.slice(0, 2).join('; '))}`);
      }
    }

    // Planned gaps / focus
    const focusItems = inProgress.length > 0 ? inProgress : missing.slice(0, 3);
    if (focusItems.length > 0) {
      lines.push('');
      lines.push(pc.bold(pc.yellow("WHAT'S MISSING & NEXT PLANNED WORK (DO NOW):")));
      for (const sf of focusItems) {
        const icon = sf.status === 'in_progress' ? pc.yellow('⚡') : pc.red('!');
        lines.push(`${icon} [${pc.cyan(sf.id)}] "${pc.bold(sf.title)}" (${sf.status})`);
        lines.push(`  WHAT:  ${sf.what}`);
        lines.push(`  WHY:   ${sf.why}`);
        lines.push(`  WHERE: ${pc.underline(sf.where)}`);
        lines.push(`  HOW:   ${sf.how}`);
        lines.push(`  WHEN:  ${sf.when}`);
      }
    }
  } else {
    // Legacy task-based fallback
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const todo = tasks.filter(t => t.status === 'todo');

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
    }
  }

  lines.push('');
  lines.push(`${pc.dim('AGENT COMMANDS:')}`);
  lines.push(`- Check status:  ${pc.cyan('npx what-is-it status')}`);
  lines.push(`- Inspect specs: ${pc.cyan('npx what-is-it schema')}`);
  lines.push(`- Open UI:       ${pc.cyan('npx what-is-it')}`);

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
