"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { PixelTrail } from "@/components/ui/pixel-trail";

export default function Page() {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="absolute top-6 left-6 z-30">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center">
            <Image
              src="/tie.png"
              alt="Lisco Logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </div>
          Lisco
        </div>
      </div>
      <div className="relative hidden lg:block" style={{ backgroundColor: '#FAF9F5' }}>
        <PixelTrail
          pixelSize={80}
          fadeDuration={0}
          delay={1200}
          pixelClassName="rounded-full bg-[#ffa04f]"
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
            Welcome to Lisco
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md">
            Build amazing career pages with ease
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
