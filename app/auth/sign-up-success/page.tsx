import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Successful",
  description: "Thank you for signing up! Please check your email to confirm your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute top-6 left-6 z-30">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center">
            <Image
              src="/tie.png"
              alt="Company Logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </div>
          Lisco
        </div>
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
