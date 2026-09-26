import { useMemo } from "react";

import {
  CNC_TOOL_VISUALS,
} from "../../utils/cncToolLibrary";

export type CncToolTypeDefinition = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  imagePath?: string;
  geometryPath?: string;
};

type CncToolTypeSelectorProps = {
  selectedTypeId?: string | null;
  onSelect: (toolType: CncToolTypeDefinition) => void;
  onCancel?: () => void;
  large?: boolean;
};

export const TOOL_TYPES: CncToolTypeDefinition[] =
  CNC_TOOL_VISUALS.map((tool) => ({
    ...tool,
    id: tool.code,
  }));

export default function CncToolTypeSelector({
  selectedTypeId,
  onSelect,
  onCancel,
  large = false,
}: CncToolTypeSelectorProps) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          TOOL_TYPES.map(
            (tool) => tool.category,
          ),
        ),
      ),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Izberi tip orodja
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Izberi obliko orodja, nato določi njegove konkretne geometrijske parametre.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            Prekliči
          </button>
        )}
      </div>

      {categories.map((category) => {
        const categoryTools = TOOL_TYPES.filter(
          (tool) => tool.category === category,
        );

        return (
          <div key={category}>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
                  selectedTypeId === tool.id ||
                  selectedTypeId === tool.code;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelect(tool)}
                    className={`group overflow-hidden rounded-2xl border bg-white text-left transition dark:bg-slate-950/40 ${
                      selected
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-slate-400 hover:shadow-md dark:border-white/10 dark:hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center overflow-hidden ${
                        large ? "h-64" : "h-52"
                      } ${
                        selected
                          ? "bg-blue-50 dark:bg-blue-950/30"
                          : "bg-slate-50 dark:bg-slate-900"
                      }`}
                    >
                      <img
                        src={tool.imagePath}
                        alt={tool.name}
                        className={`h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-105 ${
                          large ? "max-h-60" : "max-h-48"
                        }`}
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {tool.name}
                          </div>

                          <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
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
    </div>
  );
}
