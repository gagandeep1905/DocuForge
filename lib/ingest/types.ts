export type Role = 'route' | 'model' | 'component' | 'config' | 'test' | 'util' | 'doc' | 'other';

export interface ExtractedFile { path: string; content: string; bytes: number }
export interface ExtractResult { files: ExtractedFile[]; skipped: Record<string, number>; totalEntries: number }

export interface LanguageStat {
  [key: string]: string | number;
  name: string;
  bytes: number;
  percent: number;
}
export interface StackInfo {
  languages: LanguageStat[];
  frameworks: string[];
  manifests: string[];
  hasReadme: boolean;
}

export interface Coverage {
  [key: string]: number | boolean | string[] | Record<string, number> | LanguageStat[];
  total_files: number;
  analyzed: number;
  skipped: Record<string, number>;
  redactions: number;
  languages: LanguageStat[];
  frameworks: string[];
  manifests: string[];
  has_readme: boolean;
}
