import { useState } from "react";

export type CncToolTypeDefinition = {
  code: string;
  name: string;
  description: string;
};

type Props = {
  onSelect: (toolType: CncToolTypeDefinition) => void;
  onCancel?: () => void;
};

const TOOL_TYPES: CncToolTypeDefinition[] = [
  {
    code: "end_mill_flat",
    name: "Čelni rezkar – ravno čelo",
    description: "Standardni čelni rezkar z ravnim čelom.",
  },
  {
    code: "end_mill_chamfer",
    name: "Čelni rezkar – posneto čelo",
    description: "Čelni rezkar s posnetim spodnjim robom.",
  },
  {
    code: "ball_end_mill",
    name: "Kroglični rezkar",
    description: "Rezkar s kroglasto konico.",
  },
  {
    code: "bull_nose_end_mill",
    name: "Torusni rezkar",
    description: "Čelni rezkar z radijem na spodnjem robu.",
  },
  {
    code: "t_slot_cutter",
    name: "T-rezkar",
    description: "Rezkar za izdelavo T-utorov.",
  },
  {
    code: "face_mill",
    name: "Čelni rezkar / Face Mill",
    description: "Večrezno orodje za čelno rezkanje.",
  },
  {
    code: "dovetail_cutter",
    name: "Lastovičji rep",
    description: "Rezkar za lastovičje repe in poševne utore.",
  },
  {
    code: "chamfer_mill",
    name: "Fazni rezkar",
    description: "Orodje za posnemanje robov in faz.",
  },
  {
    code: "slot_mill",
    name: "Rezkar za utore",
    description: "Rezkar za izdelavo ozkih utorov.",
  },
  {
    code: "tapered_end_mill",
    name: "Konusni rezkar",
    description: "Čelni rezkar s konusno geometrijo.",
  },
  {
    code: "angular_mill",
    name: "Kotovni rezkar",
    description: "Rezkar za poševne in kotne površine.",
  },
  {
    code: "custom_mill",
    name: "Posebno orodje",
    description: "Orodje s poljubno uporabniško geometrijo.",
  },
];

function ToolPreview({
  type,
}: {
  type: CncToolTypeDefinition;
}) {
  const stroke = "currentColor";

  switch (type.code) {
    case "ball_end_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="58"
            y="15"
            width="44"
            height="68"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M58 83c0 27 12 43 22 49 10-6 22-22 22-49"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M64 22c28 20 28 39 0 59M96 22C68 42 68 61 96 81"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
          />
        </svg>
      );

    case "bull_nose_end_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="58"
            y="15"
            width="44"
            height="68"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M58 83c0 22 10 39 22 49 12-10 22-27 22-49"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M64 22c28 20 28 39 0 59M96 22C68 42 68 61 96 81"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
          />
        </svg>
      );

    case "t_slot_cutter":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="58"
            rx="3"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M47 70h66v25H47z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M55 95v28M105 95v28"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "face_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="48"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M34 60h92v31H34z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M43 60l15 31M63 60l15 31M83 60l15 31M103 60l15 31"
            stroke={stroke}
            strokeWidth="4"
          />
          <path
            d="M48 91v31M112 91v31"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "dovetail_cutter":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="48"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M43 60h74l-17 47H60z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M60 107v16M100 107v16"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "chamfer_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="55"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M46 67h68l-15 36H61z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M61 103v20M99 103v20"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "slot_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="56"
            y="15"
            width="48"
            height="88"
            rx="5"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M61 22c35 22 35 41 0 63M99 22C64 44 64 63 99 85"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
          />
          <path
            d="M68 103v20M92 103v20"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "tapered_end_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="45"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M61 57h38l-13 58H74z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M74 115v9M86 115v9"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "angular_mill":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="68"
            y="12"
            width="24"
            height="48"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M45 60h70l-20 42H65z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M65 102v21M95 102v21"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    case "end_mill_chamfer":
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="58"
            y="12"
            width="44"
            height="63"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M58 75h44l-11 28H69z"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M69 103v20M91 103v20"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 160 150" className="h-36 w-full">
          <rect
            x="58"
            y="12"
            width="44"
            height="91"
            rx="5"
            fill="none"
            stroke={stroke}
            strokeWidth="5"
          />
          <path
            d="M65 20c30 20 30 40 0 61M95 20C65 40 65 60 95 81"
            fill="none"
            stroke={stroke}
            strokeWidth="4"
          />
          <path
            d="M68 103v20M92 103v20"
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );
  }
}

export default function CncToolTypeSelector({
  onSelect,
  onCancel,
}: Props) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const selectedTool =
    TOOL_TYPES.find((item) => item.code === selectedCode) ?? null;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Ustvari orodje
        </h2>

        <p className="mt-1 text-sm opacity-70">
          Najprej izberi geometrijo oziroma tip orodja.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">
          Tip orodja
        </h3>

        <span className="text-sm opacity-60">
          {TOOL_TYPES.length} tipov
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {TOOL_TYPES.map((tool) => {
          const selected = tool.code === selectedCode;

          return (
            <button
              key={tool.code}
              type="button"
              onClick={() => setSelectedCode(tool.code)}
              className={[
                "group rounded-2xl border p-4 text-left transition-all",
                selected
                  ? "border-blue-500 bg-blue-500/10 shadow-lg"
                  : "border-black/10 bg-white/70 hover:border-blue-400 hover:shadow-md dark:border-white/10 dark:bg-white/5",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-3 rounded-xl p-2",
                  selected
                    ? "text-blue-500"
                    : "text-slate-700 dark:text-slate-200",
                ].join(" ")}
              >
                <ToolPreview type={tool} />
              </div>

              <div className="font-semibold">
                {tool.name}
              </div>

              <div className="mt-1 text-xs opacity-60">
                {tool.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 dark:border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          Prekliči
        </button>

        <button
          type="button"
          disabled={!selectedTool}
          onClick={() => {
            if (selectedTool) {
              onSelect(selectedTool);
            }
          }}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Naprej
        </button>
      </div>
    </div>
  );
}