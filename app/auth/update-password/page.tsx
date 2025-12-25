import Image from "next/image";
import { UpdatePasswordForm } from "@/components/update-password-form";

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
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
