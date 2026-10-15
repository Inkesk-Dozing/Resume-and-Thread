import { TailoredResume } from '../schemas/index.js';

export interface GeneratedPdfArtifact {
  buffer: Buffer;
  base64: string;
}

export async function generateResumePdf(resume: TailoredResume, options?: any): Promise<GeneratedPdfArtifact> {
  return {
    buffer: Buffer.from(''),
    base64: ''
  };
}
