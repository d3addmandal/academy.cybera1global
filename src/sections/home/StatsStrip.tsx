import type { StatsConfig } from "@/types/cms";

const DEFAULTS: StatsConfig = {
  trainers: "200+",
  labs: "50+",
  students: "1000+",
  workshops: "100+",
};

const ITEMS = [
  { key: "trainers"  as const, label: "Expert Trainers"    },
  { key: "labs"      as const, label: "Hands-on Labs"       },
  { key: "students"  as const, label: "Students Trained"    },
  { key: "workshops" as const, label: "Workshops & Events"  },
];

export default function StatsStrip({ stats }: { stats?: StatsConfig | null }) {
  const s = stats ?? DEFAULTS;

  return (
    <section className="bg-red-700 py-8">
      <div className="site-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6">
          {ITEMS.map((item, i) => (
            <div
              key={item.key}
              className={`text-center${i < ITEMS.length - 1 ? " lg:border-r lg:border-red-600" : ""}`}
            >
              <p className="text-3xl lg:text-4xl font-black text-white mb-1">{s[item.key]}</p>
              <p className="text-sm font-semibold text-red-200">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
