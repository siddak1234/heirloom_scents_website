/** Props shared by the delay-driven motion wrappers (Reveal, FadeUp). */
export interface MotionWrapperProps {
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
  /** Seconds. Staggers a group by giving each child a later delay. */
  readonly delay?: number;
}
