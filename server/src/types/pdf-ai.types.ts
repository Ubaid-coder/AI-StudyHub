export interface PdfAiAnalysis {
  title: string;

  summary: string;

  difficulty: "beginner" | "intermediate" | "advanced";

  topics: {
    title: string;
    description: string;
  }[];

  keyConcepts: string[];

  importantDefinitions: {
    term: string;
    definition: string;
  }[];
}