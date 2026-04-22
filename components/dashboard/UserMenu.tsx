"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export default function UserMenu({ name, email, image, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 group"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
          {image ? (
            <img src={image} alt={name || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span>{name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}</span>
          )}
        </div>

        {/* Name + Role (hidden on mobile) */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-white leading-tight">{name || "Student"}</span>
          <span className="text-xs text-white/50 capitalize">{role || "student"}</span>
        </div>

        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-dark-100 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-white/40 truncate">{email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
