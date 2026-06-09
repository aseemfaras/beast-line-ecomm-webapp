export interface LoaderProps {
  /** Full-page overlay (centered in viewport) vs inline within parent */
  fullScreen?: boolean;
  /** Optional label below spinner */
  text?: string;
  /** Custom size in px (default 40) */
  size?: number;
}
