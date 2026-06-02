export interface UserInfo {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserInfo;
}

export interface QuestionData {
  id: string;
  questionText: string;
  answers: string[];
  options: string[];
  createdAt: Date;
}

export interface BankFullData {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  allowReviews: boolean;
  allowRevealKey: boolean; 
  timeLimit: number;  
  maxAttempts: number;
  userId: string;
  questions: QuestionData[];
  reviews: ReviewData[];
}