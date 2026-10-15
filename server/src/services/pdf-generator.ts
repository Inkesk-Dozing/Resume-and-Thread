import PDFDocument from 'pdfkit';
import { TailoredResume } from '../schemas/index.js';

export interface GeneratedPdfArtifact {
  buffer: Buffer;
  base64: string;
}

export async function generateResumePdf(resume: TailoredResume): Promise<GeneratedPdfArtifact> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 36, bottom: 36, left: 40, right: 40 },
        info: {
          Title: `${resume.basics.name} - Resume`,
          Author: resume.basics.name,
          Subject: `Tailored Resume for ${resume.targetJobTitle || 'Candidate'}`,
          Keywords: 'Resume, ATS, Curriculum Vitae, Bespoke Career Tailoring'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const fullBuffer = Buffer.concat(buffers);
        const base64Uri = `data:application/pdf;base64,${fullBuffer.toString('base64')}`;
        resolve({ buffer: fullBuffer, base64: base64Uri });
      });
      doc.on('error', (err) => reject(err));

      const { basics, work, skills, education } = resume;

      // 1. Header: Name & Contact
      doc.font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#111827')
        .text(basics.name.toUpperCase(), { align: 'center' });

      doc.moveDown(0.25);

      if (basics.label) {
        doc.font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor('#1b382b')
          .text(basics.label, { align: 'center' });
        doc.moveDown(0.2);
      }

      const contactItems: string[] = [];
      if (basics.email) contactItems.push(basics.email);
      if (basics.phone) contactItems.push(basics.phone);
      if (basics.location) {
        const loc = [basics.location.city, basics.location.region].filter(Boolean).join(', ');
        if (loc) contactItems.push(loc);
      }
      if (basics.url) contactItems.push(basics.url.replace(/^https?:\/\//, ''));

      doc.font('Helvetica')
        .fontSize(8.5)
        .fillColor('#4B5563')
        .text(contactItems.join('  |  '), { align: 'center' });

      doc.moveDown(0.5);

      const addSectionHeading = (title: string) => {
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor('#111827')
          .text(title.toUpperCase(), { underline: false });

        const y = doc.y;
        doc.strokeColor('#D1D5DB')
          .lineWidth(0.75)
          .moveTo(40, y + 2)
          .lineTo(572, y + 2)
          .stroke();

        doc.y = y + 6;
      };

      // 2. Summary
      if (basics.summary) {
        addSectionHeading('Professional Summary');
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#1F2937')
          .text(basics.summary, { align: 'justify', lineGap: 1.5 });
      }

      // 3. Technical Skills
      if (skills && skills.length > 0) {
        addSectionHeading('Technical Skills');
        skills.forEach(skillCategory => {
          doc.font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor('#111827')
            .text(`${skillCategory.name}: `, { continued: true });

          doc.font('Helvetica')
            .fillColor('#374151')
            .text(skillCategory.keywords.join(', '));
        });
      }

      // 4. Professional Experience
      if (work && work.length > 0) {
        addSectionHeading('Professional Experience');
        work.forEach((w) => {
          doc.moveDown(0.3);
          const dates = [w.startDate, w.endDate || 'Present'].filter(Boolean).join(' – ');

          doc.font('Helvetica-Bold')
            .fontSize(9.5)
            .fillColor('#111827')
            .text(w.position, { continued: true });

          doc.font('Helvetica')
            .fillColor('#4B5563')
            .text(`  |  ${w.name}`, { continued: false });

          doc.font('Helvetica-Oblique')
            .fontSize(8.5)
            .fillColor('#6B7280')
            .text(dates, 40, doc.y - 12, { align: 'right' });

          doc.moveDown(0.2);

          if (w.highlights && w.highlights.length > 0) {
            w.highlights.forEach(bullet => {
              doc.font('Helvetica')
                .fontSize(8.5)
                .fillColor('#1F2937')
                .text(`•  ${bullet}`, 48, doc.y, {
                  width: 524,
                  align: 'left',
                  lineGap: 1.5
                });
              doc.moveDown(0.15);
            });
          }
        });
      }

      // 5. Education
      if (education && education.length > 0) {
        addSectionHeading('Education');
        education.forEach(edu => {
          const degree = [edu.studyType, edu.area].filter(Boolean).join(' in ');
          const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');

          doc.font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#111827')
            .text(edu.institution, { continued: true });

          doc.font('Helvetica')
            .fillColor('#4B5563')
            .text(degree ? `  |  ${degree}` : '');

          if (dates) {
            doc.font('Helvetica-Oblique')
              .fontSize(8)
              .fillColor('#6B7280')
              .text(dates, 40, doc.y - 11, { align: 'right' });
          }
          doc.moveDown(0.2);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
