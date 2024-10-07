export interface AuthContextProp {
  isAuthenticated: boolean;
  authToken: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}