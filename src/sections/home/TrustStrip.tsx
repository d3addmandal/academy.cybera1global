import type { TrustStripItem } from "@/types/cms";

/* ── Custom illustrated SVG icons ───────────────────────────────────── */

function IconCEH() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="26" cy="26" r="23" stroke="#E00000" strokeWidth="2" />
      {/* Inner ring */}
      <circle cx="26" cy="26" r="14" stroke="#E00000" strokeWidth="2" />
      {/* Crosshair top */}
      <line x1="26" y1="3" x2="26" y2="12" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Crosshair bottom */}
      <line x1="26" y1="40" x2="26" y2="49" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Crosshair left */}
      <line x1="3" y1="26" x2="12" y2="26" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Crosshair right */}
      <line x1="40" y1="26" x2="49" y2="26" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Person head */}
      <circle cx="26" cy="20" r="4.5" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      {/* Person body */}
      <path d="M18 32C18 27.5 21.5 25.5 26 25.5C30.5 25.5 34 27.5 34 32" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left person */}
      <circle cx="16" cy="17" r="5" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      <path d="M6 34C6 28 10 26 16 26C19 26 22 27 24 29" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Right person */}
      <circle cx="36" cy="17" r="5" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      <path d="M46 34C46 28 42 26 36 26C33 26 30 27 28 29" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Center person (front) */}
      <circle cx="26" cy="15" r="6" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      <path d="M13 38C13 31 18 28 26 28C34 28 39 31 39 38" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Briefcase / industry marker */}
      <rect x="22" y="42" width="8" height="6" rx="1" stroke="#E00000" strokeWidth="1.5" />
      <path d="M24 42V41C24 40.4 24.4 40 25 40H27C27.6 40 28 40.4 28 41V42" stroke="#E00000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconLabs() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flask neck */}
      <path d="M21 8L21 22L10 40C9 42 10.5 44 12.8 44H39.2C41.5 44 43 42 42 40L31 22V8" stroke="#E00000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Flask top bar */}
      <line x1="18" y1="8" x2="34" y2="8" stroke="#E00000" strokeWidth="2.5" strokeLinecap="round" />
      {/* Liquid fill */}
      <path d="M14 36Q19 32 26 36Q33 40 40 36" stroke="#E00000" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bubbles */}
      <circle cx="23" cy="40" r="2" fill="#E00000" />
      <circle cx="30" cy="38" r="1.5" fill="#E00000" />
      {/* Sparkle star */}
      <path d="M40 10L41.4 6.2L42.8 10L46.6 11.4L42.8 12.8L41.4 16.6L40 12.8L36.2 11.4Z" stroke="#E00000" strokeWidth="1.5" fill="#FEE2E2" strokeLinejoin="round" />
    </svg>
  );
}

function IconSecurity() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M26 4L44 12V28C44 38.5 26 48 26 48C26 48 8 38.5 8 28V12Z" stroke="#E00000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#FEE2E2" fillOpacity="0.4" />
      {/* Person head */}
      <circle cx="26" cy="20" r="5" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      {/* Person body */}
      <path d="M16 34C16 29 20 27 26 27C32 27 36 29 36 34" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Badge star at bottom */}
      <path d="M26 36L27 38.5L29.5 38.5L27.5 40L28.2 42.5L26 41L23.8 42.5L24.5 40L22.5 38.5L25 38.5Z" fill="#E00000" />
    </svg>
  );
}

function IconPlacement() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person */}
      <circle cx="26" cy="9" r="6" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" />
      <path d="M20 18C20 15 22.7 14 26 14C29.3 14 32 15 32 18" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Left arm */}
      <path d="M8 42C8 34 14 30 20 28L22 27" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Right arm */}
      <path d="M44 42C44 34 38 30 32 28L30 27" stroke="#E00000" strokeWidth="2" strokeLinecap="round" />
      {/* Cupped hands */}
      <path d="M8 42Q26 50 44 42" stroke="#E00000" strokeWidth="2.5" strokeLinecap="round" />
      {/* Star on hands */}
      <path d="M26 38L27.2 41L30.5 41L27.8 43L28.8 46.2L26 44.5L23.2 46.2L24.2 43L21.5 41L24.8 41Z" fill="#E00000" />
    </svg>
  );
}

function IconCorporate() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Building */}
      <rect x="10" y="22" width="32" height="26" rx="1.5" stroke="#E00000" strokeWidth="2" fill="#FEE2E2" fillOpacity="0.3" />
      {/* Roof */}
      <path d="M6 24L26 8L46 24" stroke="#E00000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Door */}
      <rect x="21" y="35" width="10" height="13" rx="1" stroke="#E00000" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="13" y="26" width="8" height="7" rx="0.5" stroke="#E00000" strokeWidth="1.5" />
      <rect x="31" y="26" width="8" height="7" rx="0.5" stroke="#E00000" strokeWidth="1.5" />
      {/* People on roof */}
      <circle cx="19" cy="5" r="3" stroke="#E00000" strokeWidth="1.5" fill="#FEE2E2" />
      <circle cx="33" cy="5" r="3" stroke="#E00000" strokeWidth="1.5" fill="#FEE2E2" />
      <path d="M15 8C15 6 16.7 5.5 19 5.5C21.3 5.5 23 6 23 8" stroke="#E00000" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 8C29 6 30.7 5.5 33 5.5C35.3 5.5 37 6 37 8" stroke="#E00000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Icon resolver ───────────────────────────────────────────────────── */

const ICON_MAP: Record<string, () => React.JSX.Element> = {
  Award: IconCEH,
  Briefcase: IconProjects,
  FlaskConical: IconLabs,
  Shield: IconSecurity,
  Users: IconPlacement,
  Building2: IconCorporate,
  CheckCircle2: IconCEH,
  BookOpen: IconProjects,
};

const DEFAULT_ITEMS: TrustStripItem[] = [
  { icon: "Award",       label: "CEH Certified Trainers" },
  { icon: "Briefcase",   label: "Real Industry Projects" },
  { icon: "FlaskConical",label: "Practical Labs" },
  { icon: "Shield",      label: "Enterprise Security Exposure" },
  { icon: "Users",       label: "Placement Support" },
  { icon: "Building2",   label: "Corporate Training Programs" },
];

/* ── Component ───────────────────────────────────────────────────────── */

export default function TrustStrip({ items }: { items?: TrustStripItem[] | null }) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <section className="bg-white border-y border-gray-100 shadow-[0_1px_8px_0_rgba(0,0,0,0.06)]">
      {/* Desktop: static justified row */}
      <div className="hidden lg:block site-container">
        <div className="flex items-stretch">
          {display.map((item, i) => {
            const Icon = ICON_MAP[item.icon] ?? IconSecurity;
            return (
              <div key={item.label} className="flex items-stretch flex-1">
                <div className="flex items-center gap-3.5 py-5 px-4 flex-1 justify-center">
                  <span className="flex-shrink-0"><Icon /></span>
                  <span className="text-[13.5px] font-bold text-gray-900 leading-snug max-w-[100px]">
                    {item.label}
                  </span>
                </div>
                {i < display.length - 1 && (
                  <div className="w-px bg-gray-200 my-4 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: horizontal scroll marquee */}
      <div className="lg:hidden overflow-hidden py-4">
        <div className="flex whitespace-nowrap">
          {[0, 1].map((key) => (
            <div key={key} aria-hidden={key === 1} className="flex items-center gap-2 flex-shrink-0 scroll-x">
              {display.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? IconSecurity;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2.5 px-5">
                    <span className="flex-shrink-0"><Icon /></span>
                    <span className="text-sm font-bold text-gray-900 whitespace-normal max-w-[90px] leading-tight">
                      {item.label}
                    </span>
                    <span className="w-px h-8 bg-gray-200 ml-3 flex-shrink-0" />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}