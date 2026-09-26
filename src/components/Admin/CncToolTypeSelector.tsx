import type { SVGProps } from "react";

export type CncToolTypeDefinition = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
};

export const TOOL_TYPES: CncToolTypeDefinition[] = [
  {
    id: "end_mill_flat",
    code: "end_mill_flat",
    name: "Čelno rezkalo",
    description: "Standardno ravno čelno rezkalo.",
    category: "Rezkarji",
  },
  {
    id: "end_mill_chamfer",
    code: "end_mill_chamfer",
    name: "Rezkar s posnetjem",
    description: "Čelno rezkalo s posnetim robom.",
    category: "Rezkarji",
  },
  {
    id: "ball_end_mill",
    code: "ball_end_mill",
    name: "Kroglasto rezkalo",
    description: "Rezkar s kroglastim čelnim delom.",
    category: "Rezkarji",
  },
  {
    id: "bull_nose_end_mill",
    code: "bull_nose_end_mill",
    name: "Radialno rezkalo",
    description: "Rezkar z radijem na spodnjem robu.",
    category: "Rezkarji",
  },
  {
    id: "t_slot_cutter",
    code: "t_slot_cutter",
    name: "T-rezkalo",
    description: "Rezkalo za izdelavo T-utora.",
    category: "Specialna orodja",
  },
  {
    id: "face_mill",
    code: "face_mill",
    name: "Čelno rezkalo z izmenljivimi ploščicami",
    description: "Večrezno čelno rezkalo.",
    category: "Čelna rezkala",
  },
  {
    id: "dovetail_cutter",
    code: "dovetail_cutter",
    name: "Lastovičje repno rezkalo",
    description: "Kotno rezkalo za lastovičje repe.",
    category: "Specialna orodja",
  },
  {
    id: "chamfer_mill",
    code: "chamfer_mill",
    name: "Posnemalno rezkalo",
    description: "Orodje za posnemanje robov.",
    category: "Specialna orodja",
  },
  {
    id: "slot_mill",
    code: "slot_mill",
    name: "Rezkalo za utore",
    description: "Rezkalo za izdelavo utorov.",
    category: "Rezkarji",
  },
  {
    id: "tapered_end_mill",
    code: "tapered_end_mill",
    name: "Stožčasto rezkalo",
    description: "Rezkar s stožčasto delovno geometrijo.",
    category: "Rezkarji",
  },
  {
    id: "angular_mill",
    code: "angular_mill",
    name: "Kotno rezkalo",
    description: "Rezkalo za kotne površine.",
    category: "Specialna orodja",
  },
  {
    id: "drill",
    code: "drill",
    name: "Sveder",
    description: "Vrtalno orodje.",
    category: "Vrtalna orodja",
  },
  {
    id: "custom_mill",
    code: "custom_mill",
    name: "Drugo / po meri",
    description: "Poljubno specialno orodje.",
    category: "Drugo",
  },
];

type CncToolTypeSelectorProps = {
  selectedTypeId?: string | null;
  onSelect: (toolType: CncToolTypeDefinition) => void;
  onCancel?: () => void;
  large?: boolean;
};

type ToolGraphicProps = SVGProps<SVGSVGElement> & {
  type: string;
  diameter?: number;
  cuttingLength?: number;
  fluteLength?: number;
  overallLength?: number;
  cornerRadius?: number;
  tipAngle?: number;
};

function ToolGraphic({
  type,
  className = "",
  ...props
}: ToolGraphicProps) {
  const common = {
    width: 180,
    height: 220,
    viewBox: "0 0 180 220",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: `text-slate-700 ${className}`,
    ...props,
  };

  switch (type) {
    case "ball_end_mill":
      return (
        <svg {...common}>
          <rect
            x="73"
            y="18"
            width="34"
            height="90"
            rx="5"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="73"
            y="18"
            width="34"
            height="90"
            rx="5"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M73 108C73 137 82 153 90 153C98 153 107 137 107 108"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M73 108C73 137 82 153 90 153C98 153 107 137 107 108"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 153V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 18V5"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "bull_nose_end_mill":
      return (
        <svg {...common}>
          <rect
            x="70"
            y="18"
            width="40"
            height="92"
            rx="5"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="70"
            y="18"
            width="40"
            height="92"
            rx="5"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M70 110C70 130 78 143 90 143C102 143 110 130 110 110"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M70 110C70 130 78 143 90 143C102 143 110 130 110 110"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 143V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 18V5"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "end_mill_chamfer":
      return (
        <svg {...common}>
          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M70 123L78 143H102L110 123"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M70 123L78 143H102L110 123"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 143V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 18V5"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "t_slot_cutter":
      return (
        <svg {...common}>
          <rect
            x="78"
            y="12"
            width="24"
            height="70"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="78"
            y="12"
            width="24"
            height="70"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M60 82H120V115H60Z"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M60 82H120V115H60Z"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M60 115L68 132H112L120 115"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M60 115L68 132H112L120 115"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 132V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 12V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "face_mill":
      return (
        <svg {...common}>
          <rect
            x="78"
            y="10"
            width="24"
            height="45"
            rx="4"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="78"
            y="10"
            width="24"
            height="45"
            rx="4"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M48 55H132V105H48Z"
            fill="currentColor"
            opacity="0.12"
          />

          <path
            d="M48 55H132V105H48Z"
            stroke="currentColor"
            strokeWidth="3"
          />

          <circle
            cx="60"
            cy="65"
            r="5"
            fill="currentColor"
          />

          <circle
            cx="90"
            cy="65"
            r="5"
            fill="currentColor"
          />

          <circle
            cx="120"
            cy="65"
            r="5"
            fill="currentColor"
          />

          <circle
            cx="60"
            cy="95"
            r="5"
            fill="currentColor"
          />

          <circle
            cx="90"
            cy="95"
            r="5"
            fill="currentColor"
          />

          <circle
            cx="120"
            cy="95"
            r="5"
            fill="currentColor"
          />

          <path
            d="M90 105V202"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "dovetail_cutter":
      return (
        <svg {...common}>
          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M55 77L75 125H105L125 77"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M55 77L75 125H105L125 77"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M75 125L82 140H98L105 125"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 140V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 12V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "chamfer_mill":
      return (
        <svg {...common}>
          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M52 78L75 126H105L128 78"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M52 78L75 126H105L128 78"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 126V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 12V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "slot_mill":
      return (
        <svg {...common}>
          <rect
            x="72"
            y="15"
            width="36"
            height="100"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="72"
            y="15"
            width="36"
            height="100"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M72 115L78 135H102L108 115"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M72 115L78 135H102L108 115"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 135V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 15V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "tapered_end_mill":
      return (
        <svg {...common}>
          <path
            d="M76 15H104L112 125H68L76 15Z"
            fill="currentColor"
            opacity="0.12"
          />

          <path
            d="M76 15H104L112 125H68L76 15Z"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M68 125L76 142H104L112 125"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M68 125L76 142H104L112 125"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 142V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 15V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "angular_mill":
      return (
        <svg {...common}>
          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="80"
            y="12"
            width="20"
            height="65"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M55 77H125L108 118H72L55 77Z"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M55 77H125L108 118H72L55 77Z"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 118V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 12V3"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );

    case "drill":
      return (
        <svg {...common}>
          <rect
            x="76"
            y="15"
            width="28"
            height="105"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="76"
            y="15"
            width="28"
            height="105"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M76 120L90 153L104 120"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M76 120L90 153L104 120"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 153V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 15V3"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M76 65H104"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.7"
          />

          <path
            d="M76 85H104"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.7"
          />
        </svg>
      );

    case "custom_mill":
      return (
        <svg {...common}>
          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            rx="5"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            rx="5"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M65 123L72 143H108L115 123"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M65 123L72 143H108L115 123"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 143V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 18V5"
            stroke="currentColor"
            strokeWidth="3"
          />

          <circle
            cx="90"
            cy="75"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

    case "end_mill_flat":
    default:
      return (
        <svg {...common}>
          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            rx="4"
            fill="currentColor"
            opacity="0.12"
          />

          <rect
            x="70"
            y="18"
            width="40"
            height="105"
            rx="4"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M70 123H110V138H70Z"
            fill="currentColor"
            opacity="0.18"
          />

          <path
            d="M70 123H110V138H70Z"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 138V202"
            stroke="currentColor"
            strokeWidth="3"
          />

          <path
            d="M90 18V5"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      );
  }
}

export function CncToolGraphic({
  type,
  ...props
}: Omit<ToolGraphicProps, "className"> & {
  type: string;
}) {
  return (
    <ToolGraphic
      type={type}
      {...props}
      className="h-48 w-40"
    />
  );
}

export default function CncToolTypeSelector({
  selectedTypeId,
  onSelect,
  onCancel,
  large = false,
}: CncToolTypeSelectorProps) {
  const categories = Array.from(
    new Set(TOOL_TYPES.map((tool) => tool.category)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          Izberi tip orodja
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Izberi obliko orodja, nato določi njegove konkretne
          geometrijske parametre.
        </p>
      </div>

      {categories.map((category) => {
        const categoryTools = TOOL_TYPES.filter(
          (tool) => tool.category === category,
        );

        return (
          <div key={category}>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              {category}
            </h4>

            <div
              className={`grid gap-4 ${
                large
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {categoryTools.map((tool) => {
                const selected =
                  selectedTypeId === tool.id;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelect(tool)}
                    className={`group overflow-hidden rounded-2xl border bg-white text-left transition ${
                      selected
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-400 hover:shadow-md"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center ${
                        large
                          ? "h-64"
                          : "h-52"
                      } ${
                        selected
                          ? "bg-blue-50"
                          : "bg-slate-50"
                      }`}
                    >
                      <ToolGraphic
                        type={tool.id}
                        className={
                          large
                            ? "h-56 w-44"
                            : "h-44 w-36"
                        }
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            {tool.name}
                          </div>

                          <div className="mt-1 text-xs leading-5 text-slate-500">
                            {tool.description}
                          </div>
                        </div>

                        {selected && (
                          <span className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-bold text-white">
                            IZBRANO
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedTypeId && (
        <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Izbrano orodje
            </div>

            <div className="mt-1 font-bold text-blue-950">
              {TOOL_TYPES.find(
                (tool) => tool.id === selectedTypeId,
              )?.name ?? selectedTypeId}
            </div>
          </div>

          <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            {selectedTypeId}
          </div>
        </div>
      )}

      {onCancel && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            Prekliči
          </button>
        </div>
      )}
    </div>
  );
}