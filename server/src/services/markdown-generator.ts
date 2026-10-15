import { TailoredResume } from '../schemas/index.js';

export function generateResumeMarkdown(resume: TailoredResume): string {
  const { basics, work, skills, education, targetJobTitle, targetCompany } = resume;

  const lines: string[] = [];

  lines.push(`# ${basics.name}`);
  const contactParts: string[] = [];
  if (basics.label) contactParts.push(`**${basics.label}**`);
  if (basics.email) contactParts.push(`[${basics.email}](mailto:${basics.email})`);
  if (basics.phone) contactParts.push(basics.phone);
  if (basics.url) contactParts.push(`[${basics.url}](${basics.url})`);
  if (basics.location) {
    const loc = [basics.location.city, basics.location.region, basics.location.countryCode].filter(Boolean).join(', ');
    if (loc) contactParts.push(loc);
  }
  lines.push(contactParts.join(' • '));
  lines.push('');

  if (targetJobTitle || targetCompany) {
    lines.push(`> *Bespoke Tailoring for: ${[targetJobTitle, targetCompany].filter(Boolean).join(' at ')}*`);
    lines.push('');
  }

  if (basics.summary) {
    lines.push('## Professional Summary');
    lines.push(basics.summary);
    lines.push('');
  }

  if (skills && skills.length > 0) {
    lines.push('## Technical Skills');
    skills.forEach(s => {
      lines.push(`- **${s.name}:** ${s.keywords.join(', ')}`);
    });
    lines.push('');
  }

  if (work && work.length > 0) {
    lines.push('## Professional Experience');
    work.forEach(w => {
      const dates = [w.startDate, w.endDate || 'Present'].filter(Boolean).join(' – ');
      lines.push(`### ${w.position} | **${w.name}** *(${dates})*`);
      if (w.summary) {
        lines.push(`*${w.summary}*`);
      }
      if (w.highlights && w.highlights.length > 0) {
        w.highlights.forEach(h => {
          lines.push(`- ${h}`);
        });
      }
      lines.push('');
    });
  }

  if (education && education.length > 0) {
    lines.push('## Education');
    education.forEach(e => {
      const dates = [e.startDate, e.endDate].filter(Boolean).join(' – ');
      const degree = [e.studyType, e.area].filter(Boolean).join(' in ');
      lines.push(`- **${e.institution}** — ${degree} ${dates ? `*(${dates})*` : ''}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
