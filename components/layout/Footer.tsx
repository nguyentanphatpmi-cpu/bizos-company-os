import { Mail, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/dict";

export function Footer({ locale = "vi" }: { locale?: Locale }) {
  const vn = locale === "vi";

  return (
    <footer className="mt-10 border-t border-[var(--line-soft)] bg-white/70">
      <div className="mx-auto px-6 py-6 text-sm text-zinc-600">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="font-semibold text-zinc-900">
              BIZOS — Business Operating System
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
