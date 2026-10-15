# Component Specification: ATS Scorer

## 1. Purpose

The `AtsScorer` tool ([`server/src/mastra/tools/ats-scorer.ts`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/server/src/mastra/tools/ats-scorer.ts)) evaluates a candidate's resume against target job description requirements. It calculates keyword coverage ($C_{kw}$), action verb strength ($R_{verb}$), and quantified metric ratio ($R_{metric}$) to produce an objective composite score ($S_{ats}$) bounded between 0 and 100.

---

## 2. Dependencies

- **Zod Schemas**: `JobSpecSchema`, `MasterResumeSchema`, `AtsScoreSchema`
- **Internal Modules**: `extractKeywordsFromText`, `calculateAtsScore`
- **Standard Library**: Native JavaScript `Set`, `RegExp`, `Array`

---

## 3. Algorithmic Complexity

- **Keyword Tokenization & Frequency Analysis**: $O(T + K \log K)$, where $T$ is the total token count of the raw text and $K$ is the number of distinct candidate tokens sorted by frequency.
- **Set Intersections (Keyword Overlap)**: $O(M)$ average time complexity using a hash set containing the candidate's combined experience and skill tokens.
- **Action Verb & Metric Scanning**: $O(B \cdot L)$, where $B$ is the count of work highlight bullets (typically $8 \le B \le 30$) and $L$ is average bullet token length.
- **Overall Time Complexity**: Deterministic $<2\text{ms}$ execution latency with zero external system calls.
- **Space Complexity**: $O(K + B)$ for keyword frequency tables and token lookup sets.

---

## 4. Formulation & Weighting

$$S_{ats} = \text{round}\left(0.55 \cdot C_{kw} + 0.25 \cdot R_{verb} + 0.20 \cdot R_{metric}\right)$$

| Dimension | Weight | Definition & Detection Heuristics |
|---|---|---|
| **Keyword Coverage ($C_{kw}$)** | 55% | Normalized overlap ratio between job keywords and candidate resume tokens. |
| **Action Verb Ratio ($R_{verb}$)** | 25% | Percentage of work bullets initiated with a word from the 80+ executive action verb lexicon. |
| **Metric Density ($R_{metric}$)** | 20% | Percentage of bullets containing numerical KPIs (percentages `%`, currency `$`, counts `500k`, multipliers `10x`). |
