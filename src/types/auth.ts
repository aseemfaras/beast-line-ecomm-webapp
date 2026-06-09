export type AuthMode = "login" | "register";

export interface AuthModalProps {
  mode: AuthMode;
  open: boolean;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}
