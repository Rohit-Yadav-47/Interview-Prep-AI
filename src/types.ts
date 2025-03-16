export interface Message {
  role: string;
  content: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
}