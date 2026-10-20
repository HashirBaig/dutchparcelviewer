import { Satellite, CircleCheck } from "lucide-react";

export function AppHeader() {
  return (
    <header className="relative z-20 flex w-full shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-gray-50 px-5 py-3 shadow-sm lg:px-8">
      {/* Logo and application information */}
      <div className="flex min-w-0 items-center gap-4">
        <img
          src="/assets/logo_parcellens.png"
          alt="ParcelLens logo"
          className="h-12 w-auto max-w-40 shrink-0 object-contain sm:h-14 sm:max-w-48"
        />

        {/* Vertical divider */}
        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        {/* Application information */}
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Parcel Marker Lab
          </h1>

          <p className="mt-0.5 hidden text-xs text-slate-500 md:block">
            Satellite-powered crop parcel monitoring
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Satellite data badge */}
        <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 sm:flex">
          <Satellite className="h-3.5 w-3.5" />
          Sentinel-2
        </div>

        {/* Application status */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <CircleCheck className="h-3.5 w-3.5" />
          Prototype
        </div>
      </div>
    </header>
  );
}
