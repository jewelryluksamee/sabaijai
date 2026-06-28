import SignOutButton from "@/components/SignOutButton";
import FeedbackButton from "@/components/FeedbackButton";

export default function Header() {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <FeedbackButton />
      <SignOutButton />
    </div>
  );
}
