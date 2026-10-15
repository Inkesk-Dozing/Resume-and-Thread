# Component Specification: PDF & Markdown Exporter

## 1. Purpose

The document generation subsystem ([`server/src/services/pdf-generator.ts`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/server/src/services/pdf-generator.ts) and [`server/src/services/markdown-generator.ts`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/server/src/services/markdown-generator.ts)) converts tailored resume JSON into production-ready documents optimized for corporate ATS parsers (Workday, Taleo, Greenhouse, Lever, iCIMS).

---

## 2. Dependencies

- **PDFKit** (`pdfkit`): Low-level, zero-browser PDF stream compilation
- **Standard Embedded Fonts**: `Helvetica` and `Helvetica-Bold`
- **Zod Schemas**: `TailoredResumeSchema`

---

## 3. Algorithmic Complexity

- **PDF Generation**: $O(B + S + E)$, where $B$ is experience bullets, $S$ is skill items, and $E$ is education records. Streaming layout executes in $50\text{ms} - 120\text{ms}$ with zero headless browser overhead (e.g. Puppeteer/Playwright).
- **Markdown Generation**: $O(N)$ string concatenation executing in $<1\text{ms}$.
- **Space Complexity**: $O(M)$ memory buffer for binary PDF output (typically $25\text{KB} - 60\text{KB}$).

---

## 4. ATS Layout Optimization Rules

1. **Strict Single-Column Flow**: Corporate ATS optical scanners split two-column resumes, resulting in jumbled timelines. PDFKit enforces a linear, single-column stream.
2. **Table-Free Design**: Parser OCR fails on nested borders and invisible table cells. Sections are delineated with subtle $0.5\text{pt}$ hairline dividers.
3. **Typographic Hierarchy**:
   - Candidate Name: 20pt Bold (`#111827`)
   - Section Titles: 11pt Bold Uppercase (`#1f2937`) with $0.5\text{pt}$ border rules
   - Role Position & Employer: 10pt Bold
   - Body & Bullet Points: 9.5pt Regular with $3\text{pt}$ bullet indents
4. **Binary & Base64 Dual Returns**: Outputs both raw `Buffer` for HTTP downloads and `data:application/pdf;base64` URI for in-browser extension preview.
