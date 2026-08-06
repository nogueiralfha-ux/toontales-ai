export type StoryTheme = 'Bíblico' | 'Aventura' | 'Educativo' | 'Livre';
export type AgeGroup = '2-6' | '7-12' | 'adulto';

export interface StoryScene {
  pageNumber: number;
  text: string;
  illustrationSvg: string; // SVG inline colorido e rico
  coloringSvg: string;     // SVG inline apenas com contornos para colorir
  illustrationUrl?: string; // URL da imagem colorida real gerada por IA
  coloringUrl?: string;     // URL da imagem de colorir (outline) real gerada por IA
  audioUrl?: string;        // URL do arquivo de áudio narrado real
}

export interface Story {
  id: string;
  title: string;
  theme: StoryTheme;
  ageGroup: AgeGroup;
  createdAt: Date;
  scenes: StoryScene[];
  moralLesson?: string;       // Lição de vida / CTA no final da história
  bibleReference?: string;    // Referência bíblica (Livro, cap, versículo + testamento)
  audioUrl?: string;          // URL do áudio livro completo compilado
}
