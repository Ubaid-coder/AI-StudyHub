export type PdfStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

export type PdfDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export interface PdfTopic {
  title: string;
  description: string;
}

export interface PdfDefinition {
  term: string;
  definition: string;
}

export interface PdfSummary {
  _id: string;
  originalName: string;
  size: number;
  status: PdfStatus;
  title?: string;
  difficulty?: PdfDifficulty;
  topics: PdfTopic[];
  createdAt: string;
  updatedAt: string;
}

export interface Pdf extends PdfSummary {
  summary?: string;
  keyConcepts: string[];
  importantDefinitions: PdfDefinition[];
}

export interface GetPdfsResponse {
  success: boolean;
  data: {
    pdfs: PdfSummary[];
  };
}

export interface GetPdfResponse {
  success: boolean;
  data: {
    pdf: Pdf;
  };
}