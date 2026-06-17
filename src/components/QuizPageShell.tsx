// Fixed-viewport wrapper for quiz pages — pins to the area beside the sidebar
// (left:230px desktop, left:0/top:56px mobile to clear the mobile topbar) and
// scrolls only vertically. overflow-x:hidden makes horizontal scroll impossible.
// Matches the sidebar/topbar dimensions used by both AdminShell and HubShell.
export default function QuizPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .quiz-shell {
          position: fixed;
          top: 0; left: 230px; right: 0; bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2rem 2.5rem;
          background: var(--bg);
          z-index: 10;
        }
        @media (max-width: 768px) {
          .quiz-shell { left: 0; top: 56px; padding: 1.25rem 1rem; }
        }
      `}</style>
      <div className="quiz-shell">{children}</div>
    </>
  );
}
