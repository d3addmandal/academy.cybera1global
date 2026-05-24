"use client";
import {
  Shield, Terminal, Activity, Brain, Globe, Cloud, Lock, Code2,
  Target, FileCheck, Cpu, Wifi, Bug, Award,
} from "lucide-react";

const ICONS = [
  { name: "Shield",    Icon: Shield    },
  { name: "Terminal",  Icon: Terminal  },
  { name: "Activity",  Icon: Activity  },
  { name: "Brain",     Icon: Brain     },
  { name: "Globe",     Icon: Globe     },
  { name: "Cloud",     Icon: Cloud     },
  { name: "Lock",      Icon: Lock      },
  { name: "Code2",     Icon: Code2     },
  { name: "Target",    Icon: Target    },
  { name: "FileCheck", Icon: FileCheck },
  { name: "Cpu",       Icon: Cpu       },
  { name: "Wifi",      Icon: Wifi      },
  { name: "Bug",       Icon: Bug       },
  { name: "Award",     Icon: Award     },
] as const;

interface Props {
  value?: string;
  onChange: (name: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICONS.map(({ name, Icon }) => {
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            title={name}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all w-[68px] ${
              selected
                ? "border-red-500 bg-red-50"
                : "border-slate-200 hover:border-red-300 bg-white"
            }`}
          >
            <Icon
              className={selected ? "text-red-600" : "text-slate-500"}
              style={{ width: 22, height: 22 }}
            />
            <span className={`text-[10px] font-medium leading-tight text-center ${selected ? "text-red-600" : "text-slate-400"}`}>
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
