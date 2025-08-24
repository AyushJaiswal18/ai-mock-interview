import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 
                "bg-white text-black hover:bg-gray-100",
              card: "bg-black border border-white/10",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: 
                "bg-white/10 border border-white/20 text-white hover:bg-white/20",
              formFieldLabel: "text-white",
              formFieldInput: 
                "bg-white/10 border border-white/20 text-white placeholder:text-gray-400",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-300",
            },
          }}
        />
      </div>
    </div>
  );
}
