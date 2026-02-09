import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-25">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-primary-500 mb-8">Comp'd</h1>
        <SignUp afterSignUpUrl="/onboarding" />
      </div>
    </div>
  );
}
