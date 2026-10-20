import { Satellite, CircleCheck } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex w-full items-center justify-between border-b border-white/10 bg-slate-950 px-5 py-3 text-white shadow-sm lg:px-8">
      {/* Logo and application information */}
      <div className="flex min-w-0 items-center gap-4">
        <img
          src="/assets/logo_parcellens.png"
          alt="ParcelLens logo"
          className="h-12 w-auto max-w-40 object-contain sm:h-14 sm:max-w-48"
        />

        <div className="hidden h-9 w-px bg-white/15 sm:block" />

        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Parcel Marker Lab
          </h1>
          <p className="mt-0.5 hidden text-xs text-slate-400 md:block">
            Satellite-powered crop parcel monitoring
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 sm:flex">
          <Satellite className="h-3.5 w-3.5" />
          Sentinel-2
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
          <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
          Prototype
        </div>
      </div>
    </header>
  );
}
