"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, Github } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "About",
      href: "/about",
      icon: <Info className="h-4 w-4" />,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">WebPlayer</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/70"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
          <a
            href="https://github.com/WilsonRIP"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent/50 text-foreground/70"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
