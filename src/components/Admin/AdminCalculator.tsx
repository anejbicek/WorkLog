import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  X,
  RefreshCw,
  Pencil,
} from "lucide-react";

import { supabase } from "../../services/supabase";
import { useAdmin } from "../../context/AdminContext";

import CncToolTypeSelector, {
  type CncToolTypeDefinition,
} from "./CncToolTypeSelector";

type CncMaterial = {
  id: string;
  name: string;
  description: string;
  cuttingSpeedVc: number;
  feedPerToothFz: number;
  active: boolean;
};

type CncOperation = {
  id: string;
  name: string;
  code: string;
  description: string;
  previewKey: string;
  active: boolean;
};

type CncToolType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type CncTool = {
  id: string;
  toolTypeId: string;
  toolTypeCode: string;
  toolTypeName: string;

  name: string;

  diameter: number;
  shankDiameter: number;
  flutes: number;

  cuttingLength: number;
  fluteLength: number;
  overallLength: number;

  cornerRadius: number;
  tipAngle: number;

  toolMaterial: string;
  coating: string;

  geometry: Record<
    string,
    string | number | boolean
  >;

  active: boolean;
};

type CncCuttingParameter = {
  id: string;

  toolId: string;
  materialId: string;
  operationId: string;

  cuttingSpeedVc: number;
  feedPerToothFz: number;

  referenceRpm: number;
  referenceFeed: number;

  radialDepthAe: number;
  axialDepthAp: number;

  maxRadialDepthAe: number;
  maxAxialDepthAp: number;

  fullWidthReference: boolean;
  fullFluteReference: boolean;

  notes: string;
  active: boolean;
};

const DEFAULT_MATERIALS: CncMaterial[] = [
  {
    id: "default-al-6082",
    name: "Aluminij 6082",
    description: "Aluminijeva zlitina 6082.",
    cuttingSpeedVc: 300,
    feedPerToothFz: 0.08,
    active: true,
  },
  {
    id: "default-al-7075",
    name: "Aluminij 7075",
    description: "Aluminijeva zlitina 7075.",
    cuttingSpeedVc: 300,
    feedPerToothFz: 0.06,
    active: true,
  },
  {
    id: "default-s235",
    name: "S235",
    description: "Konstrukcijsko jeklo S235.",
    cuttingSpeedVc: 120,
    feedPerToothFz: 0.05,
    active: true,
  },
  {
    id: "default-c45",
    name: "C45",
    description: "Ogljikovo jeklo C45.",
    cuttingSpeedVc: 110,
    feedPerToothFz: 0.045,
    active: true,
  },
  {
    id: "default-inox-316l",
    name: "Nerjavno jeklo 316L",
    description: "Avstenitno nerjavno jeklo.",
    cuttingSpeedVc: 80,
    feedPerToothFz: 0.04,
    active: true,
  },
];

const DEFAULT_OPERATIONS: CncOperation[] = [
  {
    id: "default-milling",
    name: "Rezkanje",
    code: "milling",
    description: "Standardno rezkanje.",
    previewKey: "milling",
    active: true,
  },
  {
    id: "default-slotting",
    name: "Utor",
    code: "slotting",
    description:
      "Rezkanje s polno radialno širino orodja.",
    previewKey: "slotting",
    active: true,
  },
  {
    id: "default-plunging",
    name: "Potapljanje",
    code: "plunging",
    description:
      "Vertikalno potapljanje orodja.",
    previewKey: "plunging",
    active: true,
  },
];

function numberValue(value: unknown): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function createCode(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "_",
    )
    .replace(
      /^_+|_+$/g,
      "",
    );
}

function GeometryField({
  label,
  value,
  onChange,
  unit,
  step = "0.01",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium opacity-70">
        {label}
      </span>

      <div className="flex">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) =>
            onChange(
              Number(event.target.value),
            )
          }
          className="w-full rounded-l-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
        />

        {unit && (
          <span className="flex items-center rounded-r-xl border border-l-0 border-black/10 bg-black/[0.03] px-3 text-xs opacity-60 dark:border-white/10 dark:bg-white/5">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

function ToolGeometryPreview({
  toolType,
  tool,
}: {
  toolType: CncToolTypeDefinition | null;
  tool: CncTool;
}) {
  if (!toolType) {
    return null;
  }

  const diameter = Math.max(
    30,
    Math.min(70, tool.diameter || 10) * 2,
  );

  const height = Math.max(
    70,
    Math.min(
      130,
      tool.cuttingLength || 20,
    ) * 2,
  );

  if (toolType.code === "ball_end_mill") {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-80 w-full"
      >
        <rect
          x={110 - diameter / 2}
          y="20"
          width={diameter}
          height={height}
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d={`M${110 - diameter / 2} ${
            20 + height
          } Q110 250 ${
            110 + diameter / 2
          } ${20 + height}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d={`M${110 - diameter / 3} 30
          C145 70 75 110 ${
            110 - diameter / 3
          } 165`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <path
          d={`M${110 + diameter / 3} 30
          C75 70 145 110 ${
            110 + diameter / 3
          } 165`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <text
          x="110"
          y="270"
          textAnchor="middle"
          className="fill-current text-xs"
        >
          Ø {tool.diameter.toFixed(2)} mm
        </text>
      </svg>
    );
  }

  if (
    toolType.code ===
    "bull_nose_end_mill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-80 w-full"
      >
        <rect
          x={110 - diameter / 2}
          y="20"
          width={diameter}
          height={height}
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d={`M${110 - diameter / 2} ${
            20 + height
          } Q110 250 ${
            110 + diameter / 2
          } ${20 + height}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <text
          x="110"
          y="270"
          textAnchor="middle"
          className="fill-current text-xs"
        >
          R {tool.cornerRadius.toFixed(2)} mm
        </text>
      </svg>
    );
  }

  if (
    toolType.code ===
    "t_slot_cutter"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-80 w-full"
      >
        <rect
          x="96"
          y="20"
          width="28"
          height="105"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <rect
          x="50"
          y="115"
          width="120"
          height="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <line
          x1="65"
          y1="165"
          x2="65"
          y2="220"
          stroke="currentColor"
          strokeWidth="4"
        />

        <line
          x1="155"
          y1="165"
          x2="155"
          y2="220"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
    );
  }

  if (
    toolType.code ===
    "face_mill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-80 w-full"
      >
        <rect
          x="98"
          y="20"
          width="24"
          height="90"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <circle
          cx="110"
          cy="135"
          r="58"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        {[55, 75, 95, 115, 135, 155].map(
          (x) => (
            <line
              key={x}
              x1={x}
              y1="95"
              x2={x + 20}
              y2="175"
              stroke="currentColor"
              strokeWidth="3"
            />
          ),
        )}
      </svg>
    );
  }

  if (
    toolType.code === "drill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-80 w-full"
      >
        <rect
          x="92"
          y="20"
          width="36"
          height="125"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d="M92 145 L110 205 L128 145"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <text
          x="110"
          y="245"
          textAnchor="middle"
          className="fill-current text-xs"
        >
          Konica {tool.tipAngle}°
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 280"
      className="h-80 w-full"
    >
      <rect
        x={110 - diameter / 2}
        y="20"
        width={diameter}
        height={height}
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        d={`M${110 - diameter / 3} 30
        C145 70 75 110 ${
          110 - diameter / 3
        } 165`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        d={`M${110 + diameter / 3} 30
        C75 70 145 110 ${
          110 + diameter / 3
        } 165`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <text
        x="110"
        y="250"
        textAnchor="middle"
        className="fill-current text-xs"
      >
        Ø {tool.diameter.toFixed(2)} mm
      </text>
    </svg>
  );
}

function OperationPreview({
  operation,
}: {
  operation: CncOperation;
}) {
  if (
    operation.previewKey ===
    "plunging"
  ) {
    return (
      <svg
        viewBox="0 0 160 90"
        className="h-20 w-full"
      >
        <rect
          x="65"
          y="8"
          width="30"
          height="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <path
          d="M80 45v30"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d="M70 65l10 10 10-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />

        <line
          x1="25"
          y1="78"
          x2="135"
          y2="78"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if (
    operation.previewKey ===
    "slotting"
  ) {
    return (
      <svg
        viewBox="0 0 160 90"
        className="h-20 w-full"
      >
        <rect
          x="20"
          y="60"
          width="120"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <rect
          x="62"
          y="12"
          width="36"
          height="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <path
          d="M80 20v48"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          d="M72 60l8 10 8-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 160 90"
      className="h-20 w-full"
    >
      <rect
        x="20"
        y="58"
        width="120"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <rect
        x="58"
        y="12"
        width="44"
        height="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        d="M30 45h90"
        stroke="currentColor"
        strokeWidth="4"
      />

      <path
        d="M110 35l10 10-10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
}

function ParameterField({
  label,
  value,
  onChange,
  unit,
  step = "0.01",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium opacity-70">
        {label}
      </span>

      <div className="flex">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) =>
            onChange(
              Number(event.target.value),
            )
          }
          className="w-full rounded-l-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
        />

        {unit && (
          <span className="flex items-center rounded-r-xl border border-l-0 border-black/10 bg-black/[0.03] px-3 text-xs opacity-60 dark:border-white/10 dark:bg-white/5">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

export default function AdminCalculator() {
  const {
    currentUserRole,
    users,
  } = useAdmin();

  const [toolTypes, setToolTypes] =
    useState<CncToolType[]>([]);

  const [tools, setTools] =
    useState<CncTool[]>([]);

  const [materials, setMaterials] =
    useState<CncMaterial[]>([]);

  const [operations, setOperations] =
    useState<CncOperation[]>([]);

  const [
    cuttingParameters,
    setCuttingParameters,
  ] = useState<CncCuttingParameter[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<
      | "tools"
      | "materials"
      | "operations"
      | "parameters"
    >("tools");

  const [
    showToolSelector,
    setShowToolSelector,
  ] = useState(false);

  const [
    selectedToolType,
    setSelectedToolType,
  ] =
    useState<CncToolTypeDefinition | null>(
      null,
    );

  const [
    editingTool,
    setEditingTool,
  ] = useState<CncTool | null>(null);

  const [
    editingParameterId,
    setEditingParameterId,
  ] = useState<string | null>(null);

  const [
    parameterToolId,
    setParameterToolId,
  ] = useState("");

  const [
    parameterMaterialId,
    setParameterMaterialId,
  ] = useState("");

  const [
    parameterOperationId,
    setParameterOperationId,
  ] = useState("");

  const [
    parameterVc,
    setParameterVc,
  ] = useState("0");

  const [
    parameterFz,
    setParameterFz,
  ] = useState("0");

  const [
    parameterRpm,
    setParameterRpm,
  ] = useState("0");

  const [
    parameterFeed,
    setParameterFeed,
  ] = useState("0");

  const [
    parameterAe,
    setParameterAe,
  ] = useState("0");

  const [
    parameterAp,
    setParameterAp,
  ] = useState("0");

  const [
    parameterMaxAe,
    setParameterMaxAe,
  ] = useState("0");

  const [
    parameterMaxAp,
    setParameterMaxAp,
  ] = useState("0");

  const [
    parameterFullWidth,
    setParameterFullWidth,
  ] = useState(true);

  const [
    parameterFullFlute,
    setParameterFullFlute,
  ] = useState(true);

  const [
    parameterNotes,
    setParameterNotes,
  ] = useState("");

  const [
    materialName,
    setMaterialName,
  ] = useState("");

  const [
    materialDescription,
    setMaterialDescription,
  ] = useState("");

  const [
    materialVc,
    setMaterialVc,
  ] = useState("0");

  const [
    materialFz,
    setMaterialFz,
  ] = useState("0");

  const [
    operationName,
    setOperationName,
  ] = useState("");

  const [
    operationDescription,
    setOperationDescription,
  ] = useState("");

  const isOwner = useMemo(() => {
    return (
      currentUserRole ===
      "admin"
    );
  }, [currentUserRole]);

  const toolTypeByCode = useMemo(() => {
    const map: Record<
      string,
      CncToolType
    > = {};

    for (const type of toolTypes) {
      map[type.code] = type;
    }

    return map;
  }, [toolTypes]);

  const toolById = useMemo(() => {
    const map: Record<
      string,
      CncTool
    > = {};

    for (const tool of tools) {
      map[tool.id] = tool;
    }

    return map;
  }, [tools]);

  const materialById = useMemo(() => {
    const map: Record<
      string,
      CncMaterial
    > = {};

    for (const material of materials) {
      map[material.id] =
        material;
    }

    return map;
  }, [materials]);

  const operationById = useMemo(() => {
    const map: Record<
      string,
      CncOperation
    > = {};

    for (const operation of operations) {
      map[operation.id] =
        operation;
    }

    return map;
  }, [operations]);

  const resetParameterForm = () => {
    setEditingParameterId(null);
    setParameterToolId(
      tools[0]?.id ?? "",
    );
    setParameterMaterialId(
      materials[0]?.id ?? "",
    );
    setParameterOperationId(
      operations[0]?.id ?? "",
    );

    const material =
      materials[0];

    const tool =
      tools[0];

    const vc =
      material?.cuttingSpeedVc ??
      0;

    const fz =
      material?.feedPerToothFz ??
      0;

    const rpm =
      tool && vc > 0
        ? Math.round(
            (vc * 1000) /
              (Math.PI *
                Math.max(
                  tool.diameter,
                  0.001,
                )),
          )
        : 0;

    const feed =
      tool && rpm > 0
        ? rpm *
          Math.max(
            tool.flutes,
            1,
          ) *
          fz
        : 0;

    setParameterVc(
      String(vc),
    );

    setParameterFz(
      String(fz),
    );

    setParameterRpm(
      String(rpm),
    );

    setParameterFeed(
      String(
        Number(feed.toFixed(2)),
      ),
    );

    setParameterAe(
      String(
        tool?.diameter ?? 0,
      ),
    );

    setParameterAp("0");

    setParameterMaxAe(
      String(
        tool?.diameter ?? 0,
      ),
    );

    setParameterMaxAp(
      String(
        tool?.cuttingLength ??
          0,
      ),
    );

    setParameterFullWidth(true);
    setParameterFullFlute(true);
    setParameterNotes("");
  };

  const loadData = async () => {
    if (!supabase) {
      setErrorMessage(
        "Supabase ni konfiguriran.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [
        toolTypesResult,
        toolsResult,
        materialsResult,
        operationsResult,
        parametersResult,
      ] =
        await Promise.all([
          supabase
            .from(
              "cnc_tool_types",
            )
            .select(
              "id, code, name, description",
            )
            .eq(
              "active",
              true,
            )
            .order("name"),

          supabase
            .from("cnc_tools")
            .select(
              `
                id,
                tool_type_id,
                name,
                diameter,
                shank_diameter,
                flutes,
                cutting_length,
                flute_length,
                overall_length,
                corner_radius,
                tip_angle,
                tool_material,
                coating,
                geometry,
                active,
                cnc_tool_types (
                  code,
                  name
                )
              `,
            )
            .eq(
              "active",
              true,
            )
            .order("name"),

          supabase
            .from(
              "cnc_materials",
            )
            .select(
              "id, name, cutting_speed_vc, feed_per_tooth_fz, notes, active",
            )
            .eq(
              "active",
              true,
            )
            .order("name"),

          supabase
            .from(
              "cnc_operations",
            )
            .select(
              "id, code, name, description, active",
            )
            .eq(
              "active",
              true,
            )
            .order("name"),

          supabase
            .from(
              "cnc_cutting_parameters",
            )
            .select(
              `
                id,
                tool_id,
                material_id,
                operation_id,
                cutting_speed_vc,
                feed_per_tooth_fz,
                reference_rpm,
                reference_feed,
                radial_depth_ae,
                axial_depth_ap,
                max_radial_depth_ae,
                max_axial_depth_ap,
                full_width_reference,
                full_flute_reference,
                notes,
                active
              `,
            )
            .eq(
              "active",
              true,
            ),
        ]);

      if (
        toolTypesResult.error
      ) {
        throw toolTypesResult.error;
      }

      if (
        toolsResult.error
      ) {
        throw toolsResult.error;
      }

      if (
        materialsResult.error
      ) {
        throw materialsResult.error;
      }

      if (
        operationsResult.error
      ) {
        throw operationsResult.error;
      }

      if (
        parametersResult.error
      ) {
        throw parametersResult.error;
      }

      const loadedToolTypes =
        (
          toolTypesResult.data ??
          []
        ).map(
          (row) => ({
            id: row.id,
            code: row.code,
            name: row.name,
            description:
              row.description ??
              null,
          }),
        );

      const loadedTools =
        (
          toolsResult.data ??
          []
        ).map(
          (row: any) => {
            const relation =
              Array.isArray(
                row.cnc_tool_types,
              )
                ? row.cnc_tool_types[0]
                : row.cnc_tool_types;

            return {
              id: row.id,
              toolTypeId:
                row.tool_type_id,
              toolTypeCode:
                relation?.code ??
                "",
              toolTypeName:
                relation?.name ??
                "",
              name:
                row.name ??
                "",
              diameter:
                numberValue(
                  row.diameter,
                ),
              shankDiameter:
                numberValue(
                  row.shank_diameter,
                ),
              flutes:
                numberValue(
                  row.flutes,
                ),
              cuttingLength:
                numberValue(
                  row.cutting_length,
                ),
              fluteLength:
                numberValue(
                  row.flute_length,
                ),
              overallLength:
                numberValue(
                  row.overall_length,
                ),
              cornerRadius:
                numberValue(
                  row.corner_radius,
                ),
              tipAngle:
                numberValue(
                  row.tip_angle,
                ),
              toolMaterial:
                row.tool_material ??
                "",
              coating:
                row.coating ??
                "",
              geometry:
                row.geometry ??
                {},
              active:
                row.active !==
                false,
            };
          },
        );

      const loadedMaterials =
        (
          materialsResult.data ??
          []
        ).map(
          (row) => ({
            id: row.id,
            name: row.name,
            description:
              row.notes ??
              "",
            cuttingSpeedVc:
              numberValue(
                row.cutting_speed_vc,
              ),
            feedPerToothFz:
              numberValue(
                row.feed_per_tooth_fz,
              ),
            active:
              row.active !==
              false,
          }),
        );

      const loadedOperations =
        (
          operationsResult.data ??
          []
        ).map(
          (row) => ({
            id: row.id,
            name: row.name,
            code: row.code,
            description:
              row.description ??
              "",
            previewKey:
              row.code,
            active:
              row.active !==
              false,
          }),
        );

      const loadedParameters =
        (
          parametersResult.data ??
          []
        ).map(
          (row) => ({
            id: row.id,
            toolId:
              row.tool_id,
            materialId:
              row.material_id,
            operationId:
              row.operation_id,
            cuttingSpeedVc:
              numberValue(
                row.cutting_speed_vc,
              ),
            feedPerToothFz:
              numberValue(
                row.feed_per_tooth_fz,
              ),
            referenceRpm:
              numberValue(
                row.reference_rpm,
              ),
            referenceFeed:
              numberValue(
                row.reference_feed,
              ),
            radialDepthAe:
              numberValue(
                row.radial_depth_ae,
              ),
            axialDepthAp:
              numberValue(
                row.axial_depth_ap,
              ),
            maxRadialDepthAe:
              numberValue(
                row.max_radial_depth_ae,
              ),
            maxAxialDepthAp:
              numberValue(
                row.max_axial_depth_ap,
              ),
            fullWidthReference:
              row.full_width_reference !==
              false,
            fullFluteReference:
              row.full_flute_reference !==
              false,
            notes:
              row.notes ??
              "",
            active:
              row.active !==
              false,
          }),
        );

      setToolTypes(
        loadedToolTypes,
      );

      setTools(
        loadedTools,
      );

      setMaterials(
        loadedMaterials.length >
        0
          ? loadedMaterials
          : DEFAULT_MATERIALS,
      );

      setOperations(
        loadedOperations.length >
        0
          ? loadedOperations
          : DEFAULT_OPERATIONS,
      );

      setCuttingParameters(
        loadedParameters,
      );
    } catch (error) {
      setErrorMessage(
        String(
          (error as any)
            ?.message ??
            "Napaka pri nalaganju CNC podatkov.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (
      activeSection ===
      "parameters" &&
      !parameterToolId &&
      tools.length > 0
    ) {
      resetParameterForm();
    }
  }, [
    activeSection,
    parameterToolId,
    tools,
    materials,
    operations,
  ]);

  const createTool = (
    selectedType: CncToolTypeDefinition,
  ) => {
    const databaseType =
      toolTypeByCode[
        selectedType.code
      ];

    if (!databaseType) {
      setErrorMessage(
        `Tip orodja "${selectedType.name}" ni najden v Supabase.`,
      );
      return;
    }

    const tool: CncTool = {
      id: crypto.randomUUID(),
      toolTypeId:
        databaseType.id,
      toolTypeCode:
        databaseType.code,
      toolTypeName:
        databaseType.name,
      name:
        databaseType.name,
      diameter: 10,
      shankDiameter: 10,
      flutes: 4,
      cuttingLength: 20,
      fluteLength: 20,
      overallLength: 70,
      cornerRadius:
        selectedType.code ===
        "bull_nose_end_mill"
          ? 1
          : 0,
      tipAngle:
        selectedType.code ===
        "drill"
          ? 118
          : 0,
      toolMaterial: "VHM",
      coating: "AlTiN",
      geometry: {},
      active: true,
    };

    setSelectedToolType(
      selectedType,
    );

    setEditingTool(tool);
    setShowToolSelector(false);
    setErrorMessage("");
  };

  const updateEditingTool = (
    patch: Partial<CncTool>,
  ) => {
    setEditingTool(
      (current) =>
        current
          ? {
              ...current,
              ...patch,
            }
          : null,
    );
  };

  const saveTool = async () => {
    if (
      !supabase ||
      !editingTool
    ) {
      return;
    }

    if (
      !editingTool.name.trim()
    ) {
      setErrorMessage(
        "Ime orodja je obvezno.",
      );
      return;
    }

    if (
      !editingTool.toolMaterial
    ) {
      setErrorMessage(
        "Material orodja je obvezen.",
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        tool_type_id:
          editingTool.toolTypeId,
        name:
          editingTool.name.trim(),
        diameter:
          editingTool.diameter,
        shank_diameter:
          editingTool.shankDiameter,
        flutes:
          editingTool.flutes,
        cutting_length:
          editingTool.cuttingLength,
        flute_length:
          editingTool.fluteLength,
        overall_length:
          editingTool.overallLength,
        corner_radius:
          editingTool.cornerRadius,
        tip_angle:
          selectedToolType?.code ===
          "drill"
            ? editingTool.tipAngle
            : null,
        tool_material:
          editingTool.toolMaterial,
        coating:
          editingTool.coating ||
          null,
        geometry:
          editingTool.geometry,
        active:
          editingTool.active,
      };

      const existing =
        tools.some(
          (tool) =>
            tool.id ===
            editingTool.id,
        );

      if (existing) {
        const {
          error,
        } = await supabase
          .from("cnc_tools")
          .update(payload)
          .eq(
            "id",
            editingTool.id,
          );

        if (error) {
          throw error;
        }

        setTools(
          (current) =>
            current.map(
              (tool) =>
                tool.id ===
                editingTool.id
                  ? {
                      ...editingTool,
                    }
                  : tool,
            ),
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("cnc_tools")
          .insert(
            payload,
          )
          .select(
            `
              id,
              tool_type_id,
              name,
              diameter,
              shank_diameter,
              flutes,
              cutting_length,
              flute_length,
              overall_length,
              corner_radius,
              tip_angle,
              tool_material,
              coating,
              geometry,
              active,
              cnc_tool_types (
                code,
                name
              )
            `,
          )
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const relation =
            Array.isArray(
              (data as any)
                .cnc_tool_types,
            )
              ? (data as any)
                  .cnc_tool_types[0]
              : (data as any)
                  .cnc_tool_types;

          const savedTool: CncTool =
            {
              id:
                (data as any)
                  .id,
              toolTypeId:
                (data as any)
                  .tool_type_id,
              toolTypeCode:
                relation?.code ??
                editingTool.toolTypeCode,
              toolTypeName:
                relation?.name ??
                editingTool.toolTypeName,
              name:
                (data as any)
                  .name,
              diameter:
                numberValue(
                  (data as any)
                    .diameter,
                ),
              shankDiameter:
                numberValue(
                  (data as any)
                    .shank_diameter,
                ),
              flutes:
                numberValue(
                  (data as any)
                    .flutes,
                ),
              cuttingLength:
                numberValue(
                  (data as any)
                    .cutting_length,
                ),
              fluteLength:
                numberValue(
                  (data as any)
                    .flute_length,
                ),
              overallLength:
                numberValue(
                  (data as any)
                    .overall_length,
                ),
              cornerRadius:
                numberValue(
                  (data as any)
                    .corner_radius,
                ),
              tipAngle:
                numberValue(
                  (data as any)
                    .tip_angle,
                ),
              toolMaterial:
                (data as any)
                  .tool_material ??
                "",
              coating:
                (data as any)
                  .coating ??
                "",
              geometry:
                (data as any)
                  .geometry ??
                {},
              active:
                (data as any)
                  .active !==
                false,
            };

          setTools(
            (current) => [
              ...current,
              savedTool,
            ],
          );
        }
      }

      setEditingTool(null);
      setSelectedToolType(null);
    } catch (error) {
      setErrorMessage(
        String(
          (error as any)
            ?.message ??
            "Napaka pri shranjevanju orodja.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteTool = async (
    id: string,
  ) => {
    if (!supabase) {
      return;
    }

    if (
      !window.confirm(
        "Ali želiš izbrisati to orodje?",
      )
    ) {
      return;
    }

    setErrorMessage("");

    const {
      error,
    } = await supabase
      .from("cnc_tools")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(
        error.message,
      );
      return;
    }

    setTools(
      (current) =>
        current.filter(
          (tool) =>
            tool.id !== id,
        ),
    );

    setCuttingParameters(
      (current) =>
        current.filter(
          (item) =>
            item.toolId !== id,
        ),
    );
  };

  const addMaterial = async () => {
    if (!supabase) {
      return;
    }

    const name =
      materialName.trim();

    if (!name) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("cnc_materials")
        .insert({
          name,
          cutting_speed_vc:
            Number(
              materialVc,
            ) || null,
          feed_per_tooth_fz:
            Number(
              materialFz,
            ) || null,
          notes:
            materialDescription.trim() ||
            null,
          active: true,
        })
        .select(
          "id, name, cutting_speed_vc, feed_per_tooth_fz, notes, active",
        )
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setMaterials(
          (current) => [
            ...current,
            {
              id: data.id,
              name: data.name,
              description:
                data.notes ??
                "",
              cuttingSpeedVc:
                numberValue(
                  data.cutting_speed_vc,
                ),
              feedPerToothFz:
                numberValue(
                  data.feed_per_tooth_fz,
                ),
              active:
                data.active !==
                false,
            },
          ],
        );
      }

      setMaterialName("");
      setMaterialDescription("");
      setMaterialVc("0");
      setMaterialFz("0");
    } catch (error) {
      setErrorMessage(
        String(
          (error as any)
            ?.message ??
            "Napaka pri dodajanju materiala.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMaterial = async (
    id: string,
  ) => {
    if (!supabase) {
      return;
    }

    if (
      !window.confirm(
        "Ali želiš izbrisati ta material?",
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("cnc_materials")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(
        error.message,
      );
      return;
    }

    setMaterials(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id,
        ),
    );
  };

  const addOperation = async () => {
    if (!supabase) {
      return;
    }

    const name =
      operationName.trim();

    if (!name) {
      return;
    }

    const code =
      createCode(name);

    if (!code) {
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("cnc_operations")
        .insert({
          code,
          name,
          description:
            operationDescription.trim() ||
            null,
          active: true,
        })
        .select(
          "id, code, name, description, active",
        )
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setOperations(
          (current) => [
            ...current,
            {
              id: data.id,
              name: data.name,
              code: data.code,
              description:
                data.description ??
                "",
              previewKey:
                data.code,
              active:
                data.active !==
                false,
            },
          ],
        );
      }

      setOperationName("");
      setOperationDescription("");
    } catch (error) {
      setErrorMessage(
        String(
          (error as any)
            ?.message ??
            "Napaka pri dodajanju obdelave.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteOperation = async (
    id: string,
  ) => {
    if (!supabase) {
      return;
    }

    if (
      !window.confirm(
        "Ali želiš izbrisati to vrsto obdelave?",
      )
    ) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("cnc_operations")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(
        error.message,
      );
      return;
    }

    setOperations(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id,
        ),
    );
  };

  const calculateReferenceValues =
    () => {
      const tool =
        toolById[
          parameterToolId
        ];

      if (!tool) {
        return;
      }

      const vc =
        Number(
          parameterVc,
        ) || 0;

      const fz =
        Number(
          parameterFz,
        ) || 0;

      const rpm =
        vc > 0 &&
        tool.diameter > 0
          ? Math.round(
              (vc * 1000) /
                (Math.PI *
                  tool.diameter),
            )
          : 0;

      const feed =
        rpm *
        Math.max(
          tool.flutes,
          1,
        ) *
        fz;

      setParameterRpm(
        String(rpm),
      );

      setParameterFeed(
        String(
          Number(
            feed.toFixed(2),
          ),
        ),
      );
    };

  const saveCuttingParameter =
    async () => {
      if (!supabase) {
        return;
      }

      if (
        !parameterToolId ||
        !parameterMaterialId ||
        !parameterOperationId
      ) {
        setErrorMessage(
          "Izberi orodje, material in vrsto obdelave.",
        );
        return;
      }

      const tool =
        toolById[
          parameterToolId
        ];

      if (!tool) {
        setErrorMessage(
          "Izbrano orodje ni najdeno.",
        );
        return;
      }

      const payload = {
        tool_id:
          parameterToolId,
        material_id:
          parameterMaterialId,
        operation_id:
          parameterOperationId,
        cutting_speed_vc:
          Number(
            parameterVc,
          ) || null,
        feed_per_tooth_fz:
          Number(
            parameterFz,
          ) || null,
        reference_rpm:
          Number(
            parameterRpm,
          ) || null,
        reference_feed:
          Number(
            parameterFeed,
          ) || null,
        radial_depth_ae:
          Number(
            parameterAe,
          ) || null,
        axial_depth_ap:
          Number(
            parameterAp,
          ) || null,
        max_radial_depth_ae:
          Number(
            parameterMaxAe,
          ) || null,
        max_axial_depth_ap:
          Number(
            parameterMaxAp,
          ) || null,
        full_width_reference:
          parameterFullWidth,
        full_flute_reference:
          parameterFullFlute,
        notes:
          parameterNotes.trim() ||
          null,
        active: true,
      };

      setSaving(true);
      setErrorMessage("");

      try {
        if (
          editingParameterId
        ) {
          const {
            error,
          } = await supabase
            .from(
              "cnc_cutting_parameters",
            )
            .update(payload)
            .eq(
              "id",
              editingParameterId,
            );

          if (error) {
            throw error;
          }

          setCuttingParameters(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  editingParameterId
                    ? {
                        ...item,
                        toolId:
                          parameterToolId,
                        materialId:
                          parameterMaterialId,
                        operationId:
                          parameterOperationId,
                        cuttingSpeedVc:
                          Number(
                            parameterVc,
                          ) || 0,
                        feedPerToothFz:
                          Number(
                            parameterFz,
                          ) || 0,
                        referenceRpm:
                          Number(
                            parameterRpm,
                          ) || 0,
                        referenceFeed:
                          Number(
                            parameterFeed,
                          ) || 0,
                        radialDepthAe:
                          Number(
                            parameterAe,
                          ) || 0,
                        axialDepthAp:
                          Number(
                            parameterAp,
                          ) || 0,
                        maxRadialDepthAe:
                          Number(
                            parameterMaxAe,
                          ) || 0,
                        maxAxialDepthAp:
                          Number(
                            parameterMaxAp,
                          ) || 0,
                        fullWidthReference:
                          parameterFullWidth,
                        fullFluteReference:
                          parameterFullFlute,
                        notes:
                          parameterNotes,
                      }
                    : item,
              ),
          );
        } else {
          const {
            data,
            error,
          } = await supabase
            .from(
              "cnc_cutting_parameters",
            )
            .insert(
              payload,
            )
            .select(
              `
                id,
                tool_id,
                material_id,
                operation_id,
                cutting_speed_vc,
                feed_per_tooth_fz,
                reference_rpm,
                reference_feed,
                radial_depth_ae,
                axial_depth_ap,
                max_radial_depth_ae,
                max_axial_depth_ap,
                full_width_reference,
                full_flute_reference,
                notes,
                active
              `,
            )
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setCuttingParameters(
              (current) => [
                ...current,
                {
                  id:
                    data.id,
                  toolId:
                    data.tool_id,
                  materialId:
                    data.material_id,
                  operationId:
                    data.operation_id,
                  cuttingSpeedVc:
                    numberValue(
                      data.cutting_speed_vc,
                    ),
                  feedPerToothFz:
                    numberValue(
                      data.feed_per_tooth_fz,
                    ),
                  referenceRpm:
                    numberValue(
                      data.reference_rpm,
                    ),
                  referenceFeed:
                    numberValue(
                      data.reference_feed,
                    ),
                  radialDepthAe:
                    numberValue(
                      data.radial_depth_ae,
                    ),
                  axialDepthAp:
                    numberValue(
                      data.axial_depth_ap,
                    ),
                  maxRadialDepthAe:
                    numberValue(
                      data.max_radial_depth_ae,
                    ),
                  maxAxialDepthAp:
                    numberValue(
                      data.max_axial_depth_ap,
                    ),
                  fullWidthReference:
                    data.full_width_reference !==
                    false,
                  fullFluteReference:
                    data.full_flute_reference !==
                    false,
                  notes:
                    data.notes ??
                    "",
                  active:
                    data.active !==
                    false,
                },
              ],
            );
          }
        }

        resetParameterForm();
      } catch (error) {
        setErrorMessage(
          String(
            (error as any)
              ?.message ??
              "Napaka pri shranjevanju rezalnih parametrov.",
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const editCuttingParameter =
    (
      parameter: CncCuttingParameter,
    ) => {
      setEditingParameterId(
        parameter.id,
      );

      setParameterToolId(
        parameter.toolId,
      );

      setParameterMaterialId(
        parameter.materialId,
      );

      setParameterOperationId(
        parameter.operationId,
      );

      setParameterVc(
        String(
          parameter.cuttingSpeedVc,
        ),
      );

      setParameterFz(
        String(
          parameter.feedPerToothFz,
        ),
      );

      setParameterRpm(
        String(
          parameter.referenceRpm,
        ),
      );

      setParameterFeed(
        String(
          parameter.referenceFeed,
        ),
      );

      setParameterAe(
        String(
          parameter.radialDepthAe,
        ),
      );

      setParameterAp(
        String(
          parameter.axialDepthAp,
        ),
      );

      setParameterMaxAe(
        String(
          parameter.maxRadialDepthAe,
        ),
      );

      setParameterMaxAp(
        String(
          parameter.maxAxialDepthAp,
        ),
      );

      setParameterFullWidth(
        parameter.fullWidthReference,
      );

      setParameterFullFlute(
        parameter.fullFluteReference,
      );

      setParameterNotes(
        parameter.notes,
      );

      setActiveSection(
        "parameters",
      );
    };

  const deleteCuttingParameter =
    async (
      id: string,
    ) => {
      if (!supabase) {
        return;
      }

      if (
        !window.confirm(
          "Ali želiš izbrisati te rezalne parametre?",
        )
      ) {
        return;
      }

      const {
        error,
      } = await supabase
        .from(
          "cnc_cutting_parameters",
        )
        .delete()
        .eq(
          "id",
          id,
        );

      if (error) {
        setErrorMessage(
          error.message,
        );
        return;
      }

      setCuttingParameters(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id,
          ),
      );

      if (
        editingParameterId ===
        id
      ) {
        resetParameterForm();
      }
    };

  if (!isOwner) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold">
          CNC kalkulator
        </h2>

        <p className="mt-2 text-sm opacity-70">
          Nastavitve CNC
          kalkulatorja lahko
          spreminja samo glavni
          administrator.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
        <RefreshCw
          size={18}
          className="animate-spin"
        />

        <span>
          Nalagam CNC
          knjižnico ...
        </span>
      </div>
    );
  }

  if (showToolSelector) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <CncToolTypeSelector
          onSelect={
            createTool
          }
          onCancel={() =>
            setShowToolSelector(
              false,
            )
          }
        />
      </div>
    );
  }

  if (
    editingTool &&
    selectedToolType
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Definicija
              orodja
            </h2>

            <p className="mt-1 text-sm opacity-60">
              {
                selectedToolType.name
              }
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTool(
                null,
              );
              setSelectedToolType(
                null,
              );
            }}
            className="rounded-xl border border-black/10 p-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 text-sm font-semibold">
              Grafični
              prikaz
            </div>

            <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
              <ToolGeometryPreview
                toolType={
                  selectedToolType
                }
                tool={
                  editingTool
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <label className="mb-5 block">
              <span className="mb-1 block text-xs font-medium opacity-70">
                Ime orodja
              </span>

              <input
                type="text"
                value={
                  editingTool.name
                }
                onChange={(
                  event,
                ) =>
                  updateEditingTool(
                    {
                      name:
                        event
                          .target
                          .value,
                    },
                  )
                }
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <h3 className="mb-3 text-sm font-semibold">
              Geometrija
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <GeometryField
                label="Premer D"
                value={
                  editingTool.diameter
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      diameter:
                        value,
                    },
                  )
                }
              />

              <GeometryField
                label="Premer stebla"
                value={
                  editingTool.shankDiameter
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      shankDiameter:
                        value,
                    },
                  )
                }
              />

              <GeometryField
                label="Število zob Z"
                value={
                  editingTool.flutes
                }
                step="1"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      flutes:
                        Math.max(
                          1,
                          Math.round(
                            value,
                          ),
                        ),
                    },
                  )
                }
              />

              <GeometryField
                label="Rezalna dolžina"
                value={
                  editingTool.cuttingLength
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      cuttingLength:
                        value,
                    },
                  )
                }
              />

              <GeometryField
                label="Dolžina rezila"
                value={
                  editingTool.fluteLength
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      fluteLength:
                        value,
                    },
                  )
                }
              />

              <GeometryField
                label="Celotna dolžina"
                value={
                  editingTool.overallLength
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      overallLength:
                        value,
                    },
                  )
                }
              />

              <GeometryField
                label="Radij R"
                value={
                  editingTool.cornerRadius
                }
                unit="mm"
                onChange={(
                  value,
                ) =>
                  updateEditingTool(
                    {
                      cornerRadius:
                        value,
                    },
                  )
                }
              />

              {selectedToolType.code ===
                "drill" && (
                <GeometryField
                  label="Kot konice"
                  value={
                    editingTool.tipAngle
                  }
                  unit="°"
                  onChange={(
                    value,
                  ) =>
                    updateEditingTool(
                      {
                        tipAngle:
                          value,
                      },
                    )
                  }
                />
              )}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">
                Material in
                prevleka
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Material orodja *
                  </span>

                  <select
                    value={
                      editingTool.toolMaterial
                    }
                    onChange={(
                      event,
                    ) =>
                      updateEditingTool(
                        {
                          toolMaterial:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="">
                      Izberi material
                    </option>

                    <option value="VHM">
                      VHM
                    </option>

                    <option value="HSS">
                      HSS
                    </option>

                    <option value="HSS-E">
                      HSS-E
                    </option>

                    <option value="HM">
                      HM
                    </option>

                    <option value="PCD">
                      PCD
                    </option>

                    <option value="CBN">
                      CBN
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Prevleka
                  </span>

                  <select
                    value={
                      editingTool.coating
                    }
                    onChange={(
                      event,
                    ) =>
                      updateEditingTool(
                        {
                          coating:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="">
                      Brez prevleke
                    </option>

                    <option value="AlTiN">
                      AlTiN
                    </option>

                    <option value="TiAlN">
                      TiAlN
                    </option>

                    <option value="TiN">
                      TiN
                    </option>

                    <option value="TiCN">
                      TiCN
                    </option>

                    <option value="DLC">
                      DLC
                    </option>

                    <option value="AlCrN">
                      AlCrN
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-black/10 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setEditingTool(
                    null,
                  );
                  setSelectedToolType(
                    null,
                  );
                }}
                className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium dark:border-white/10"
              >
                Prekliči
              </button>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void saveTool()
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={17}
                  />
                )}

                Shrani
                orodje
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            CNC kalkulator
          </h2>

          <p className="mt-1 text-sm opacity-60">
            Upravljanje CNC
            orodij, materialov,
            operacij in rezalnih
            parametrov.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadData()
          }
          className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm dark:border-white/10"
        >
          <RefreshCw size={16} />
          Osveži
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-black/10 pb-3 dark:border-white/10">
        {(
          [
            [
              "tools",
              "Orodja",
            ],
            [
              "materials",
              "Materiali",
            ],
            [
              "operations",
              "Vrste obdelave",
            ],
            [
              "parameters",
              "Rezalni parametri",
            ],
          ] as const
        ).map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setActiveSection(
                  key,
                )
              }
              className={[
                "rounded-xl px-4 py-2 text-sm font-medium",
                activeSection ===
                key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {activeSection ===
        "tools" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                CNC orodja
              </h3>

              <p className="text-sm opacity-60">
                Konkretna orodja
                in njihova
                geometrija.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowToolSelector(
                  true,
                )
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Dodaj orodje
            </button>
          </div>

          {tools.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
              <p className="font-medium">
                Še ni dodanih
                orodij.
              </p>

              <p className="mt-1 text-sm opacity-60">
                Klikni »Dodaj
                orodje« in
                izberi tip
                orodja.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tools.map(
                (tool) => (
                  <div
                    key={
                      tool.id
                    }
                    className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {
                            tool.name
                          }
                        </div>

                        <div className="mt-1 text-xs opacity-60">
                          {
                            tool.toolTypeName
                          }
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void deleteTool(
                            tool.id,
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                        <div className="opacity-50">
                          D
                        </div>

                        <div className="mt-1 font-semibold">
                          {
                            tool.diameter
                          }{" "}
                          mm
                        </div>
                      </div>

                      <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                        <div className="opacity-50">
                          Z
                        </div>

                        <div className="mt-1 font-semibold">
                          {
                            tool.flutes
                          }
                        </div>
                      </div>

                      <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                        <div className="opacity-50">
                          Material
                        </div>

                        <div className="mt-1 font-semibold">
                          {
                            tool.toolMaterial
                          }
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const type =
                          toolTypes.find(
                            (
                              item,
                            ) =>
                              item.code ===
                              tool.toolTypeCode,
                          );

                        if (!type) {
                          return;
                        }

                        setSelectedToolType(
                          {
                            code:
                              type.code,
                            name:
                              type.name,
                            description:
                              type.description ??
                              "",
                          },
                        );

                        setEditingTool(
                          tool,
                        );
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <Pencil
                        size={15}
                      />
                      Uredi
                    </button>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}

      {activeSection ===
        "materials" && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold">
              Materiali
              obdelovanca
            </h3>

            <p className="text-sm opacity-60">
              Osnovne vrednosti
              Vc in fz so
              uporabljene kot
              privzete vrednosti.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <input
                type="text"
                placeholder="Ime materiala"
                value={
                  materialName
                }
                onChange={(
                  event,
                ) =>
                  setMaterialName(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <input
                type="text"
                placeholder="Opis"
                value={
                  materialDescription
                }
                onChange={(
                  event,
                ) =>
                  setMaterialDescription(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <input
                type="number"
                min="0"
                step="1"
                placeholder="Vc [m/min]"
                value={
                  materialVc
                }
                onChange={(
                  event,
                ) =>
                  setMaterialVc(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="fz [mm/zob]"
                value={
                  materialFz
                }
                onChange={(
                  event,
                ) =>
                  setMaterialFz(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void addMaterial()
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus size={17} />
                Dodaj
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {materials.map(
              (material) => (
                <div
                  key={
                    material.id
                  }
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <div className="font-medium">
                      {
                        material.name
                      }
                    </div>

                    <div className="mt-1 text-xs opacity-60">
                      Vc{" "}
                      {
                        material.cuttingSpeedVc
                      }{" "}
                      m/min · fz{" "}
                      {
                        material.feedPerToothFz
                      }{" "}
                      mm/zob
                    </div>

                    {material.description && (
                      <div className="mt-1 text-xs opacity-60">
                        {
                          material.description
                        }
                      </div>
                    )}
                  </div>

                  {!material.id.startsWith(
                    "default-",
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteMaterial(
                          material.id,
                        )
                      }
                      className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {activeSection ===
        "operations" && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold">
              Vrste obdelave
            </h3>

            <p className="text-sm opacity-60">
              Operacije se
              povezujejo z
              rezalnimi
              parametri.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operations.map(
              (operation) => (
                <div
                  key={
                    operation.id
                  }
                  className="rounded-2xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <OperationPreview
                    operation={
                      operation
                    }
                  />

                  <div className="mt-2 font-semibold">
                    {
                      operation.name
                    }
                  </div>

                  <div className="mt-1 text-xs opacity-60">
                    {
                      operation.description
                    }
                  </div>

                  {!operation.id.startsWith(
                    "default-",
                  ) && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteOperation(
                          operation.id,
                        )
                      }
                      className="mt-3 rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Ime vrste obdelave"
                value={
                  operationName
                }
                onChange={(
                  event,
                ) =>
                  setOperationName(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <input
                type="text"
                placeholder="Opis"
                value={
                  operationDescription
                }
                onChange={(
                  event,
                ) =>
                  setOperationDescription(
                    event
                      .target
                      .value,
                  )
                }
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              />

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void addOperation()
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus size={17} />
                Dodaj
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection ===
        "parameters" && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold">
              Rezalni parametri
            </h3>

            <p className="text-sm opacity-60">
              Za vsako konkretno
              orodje, material in
              operacijo določi
              referenčne vrednosti.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">
                    {editingParameterId
                      ? "Uredi parametre"
                      : "Nov zapis"}
                  </h4>

                  <p className="mt-1 text-xs opacity-60">
                    Referenčne
                    vrednosti za
                    izbrano
                    kombinacijo.
                  </p>
                </div>

                {editingParameterId && (
                  <button
                    type="button"
                    onClick={
                      resetParameterForm
                    }
                    className="rounded-xl border border-black/10 px-3 py-2 text-xs dark:border-white/10"
                  >
                    Nov zapis
                  </button>
                )}
              </div>

              <div className="grid gap-4">
                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Konkretno
                    orodje
                  </span>

                  <select
                    value={
                      parameterToolId
                    }
                    onChange={(
                      event,
                    ) => {
                      const value =
                        event
                          .target
                          .value;

                      setParameterToolId(
                        value,
                      );

                      const tool =
                        toolById[
                          value
                        ];

                      if (
                        tool &&
                        Number(
                          parameterVc,
                        ) > 0
                      ) {
                        const rpm =
                          Math.round(
                            (Number(
                              parameterVc,
                            ) *
                              1000) /
                              (Math.PI *
                                Math.max(
                                  tool.diameter,
                                  0.001,
                                )),
                          );

                        setParameterRpm(
                          String(
                            rpm,
                          ),
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="">
                      Izberi orodje
                    </option>

                    {tools.map(
                      (tool) => (
                        <option
                          key={
                            tool.id
                          }
                          value={
                            tool.id
                          }
                        >
                          {
                            tool.name
                          }{" "}
                          — Ø
                          {
                            tool.diameter
                          }{" "}
                          — Z
                          {
                            tool.flutes
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Material
                    obdelovanca
                  </span>

                  <select
                    value={
                      parameterMaterialId
                    }
                    onChange={(
                      event,
                    ) => {
                      const value =
                        event
                          .target
                          .value;

                      setParameterMaterialId(
                        value,
                      );

                      const material =
                        materialById[
                          value
                        ];

                      if (
                        material
                      ) {
                        setParameterVc(
                          String(
                            material.cuttingSpeedVc,
                          ),
                        );

                        setParameterFz(
                          String(
                            material.feedPerToothFz,
                          ),
                        );
                      }
                    }}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="">
                      Izberi material
                    </option>

                    {materials.map(
                      (
                        material,
                      ) => (
                        <option
                          key={
                            material.id
                          }
                          value={
                            material.id
                          }
                        >
                          {
                            material.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Vrsta
                    operacije
                  </span>

                  <select
                    value={
                      parameterOperationId
                    }
                    onChange={(
                      event,
                    ) =>
                      setParameterOperationId(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="">
                      Izberi operacijo
                    </option>

                    {operations.map(
                      (
                        operation,
                      ) => (
                        <option
                          key={
                            operation.id
                          }
                          value={
                            operation.id
                          }
                        >
                          {
                            operation.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ParameterField
                    label="Vc"
                    value={
                      Number(
                        parameterVc,
                      ) || 0
                    }
                    unit="m/min"
                    step="1"
                    onChange={(
                      value,
                    ) => {
                      setParameterVc(
                        String(
                          value,
                        ),
                      );
                    }}
                  />

                  <ParameterField
                    label="fz"
                    value={
                      Number(
                        parameterFz,
                      ) || 0
                    }
                    unit="mm/zob"
                    step="0.001"
                    onChange={(
                      value,
                    ) =>
                      setParameterFz(
                        String(
                          value,
                        ),
                      )
                    }
                  />

                  <ParameterField
                    label="Referenčni RPM"
                    value={
                      Number(
                        parameterRpm,
                      ) || 0
                    }
                    unit="rpm"
                    step="1"
                    onChange={(
                      value,
                    ) =>
                      setParameterRpm(
                        String(
                          value,
                        ),
                      )
                    }
                  />

                  <ParameterField
                    label="Referenčni pomik"
                    value={
                      Number(
                        parameterFeed,
                      ) || 0
                    }
                    unit="mm/min"
                    step="1"
                    onChange={(
                      value,
                    ) =>
                      setParameterFeed(
                        String(
                          value,
                        ),
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    calculateReferenceValues
                  }
                  className="rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-600/10"
                >
                  Izračunaj RPM in
                  pomik iz Vc/fz
                </button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ParameterField
                    label="Referenčni ae"
                    value={
                      Number(
                        parameterAe,
                      ) || 0
                    }
                    unit="mm"
                    onChange={(
                      value,
                    ) =>
                      setParameterAe(
                        String(
                          value,
                        ),
                      )
                    }
                  />

                  <ParameterField
                    label="Referenčni ap"
                    value={
                      Number(
                        parameterAp,
                      ) || 0
                    }
                    unit="mm"
                    onChange={(
                      value,
                    ) =>
                      setParameterAp(
                        String(
                          value,
                        ),
                      )
                    }
                  />

                  <ParameterField
                    label="Maksimalni ae"
                    value={
                      Number(
                        parameterMaxAe,
                      ) || 0
                    }
                    unit="mm"
                    onChange={(
                      value,
                    ) =>
                      setParameterMaxAe(
                        String(
                          value,
                        ),
                      )
                    }
                  />

                  <ParameterField
                    label="Maksimalni ap"
                    value={
                      Number(
                        parameterMaxAp,
                      ) || 0
                    }
                    unit="mm"
                    onChange={(
                      value,
                    ) =>
                      setParameterMaxAp(
                        String(
                          value,
                        ),
                      )
                    }
                  />
                </div>

                <div className="grid gap-3">
                  <label className="flex items-center gap-3 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={
                        parameterFullWidth
                      }
                      onChange={(
                        event,
                      ) =>
                        setParameterFullWidth(
                          event
                            .target
                            .checked,
                        )
                      }
                    />

                    Referenčna
                    vrednost za
                    polno širino
                    (100 % ae)
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={
                        parameterFullFlute
                      }
                      onChange={(
                        event,
                      ) =>
                        setParameterFullFlute(
                          event
                            .target
                            .checked,
                        )
                      }
                    />

                    Referenčna
                    vrednost za
                    polno dolžino
                    rezila
                  </label>
                </div>

                <label>
                  <span className="mb-1 block text-xs font-medium opacity-70">
                    Opombe
                  </span>

                  <textarea
                    value={
                      parameterNotes
                    }
                    onChange={(
                      event,
                    ) =>
                      setParameterNotes(
                        event
                          .target
                          .value,
                      )
                    }
                    rows={4}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5"
                    placeholder="Posebne opombe za kombinacijo orodje/material/operacija..."
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    void saveCuttingParameter()
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {editingParameterId
                    ? "Shrani spremembe"
                    : "Shrani parametre"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4">
                <h4 className="font-semibold">
                  Shranjeni
                  parametri
                </h4>

                <p className="mt-1 text-xs opacity-60">
                  Vsak zapis
                  predstavlja eno
                  kombinacijo.
                </p>
              </div>

              {cuttingParameters.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-black/15 p-8 text-center text-sm opacity-60 dark:border-white/15">
                  Še ni
                  definiranih
                  rezalnih
                  parametrov.
                </div>
              ) : (
                <div className="space-y-3">
                  {cuttingParameters.map(
                    (
                      parameter,
                    ) => {
                      const tool =
                        toolById[
                          parameter.toolId
                        ];

                      const material =
                        materialById[
                          parameter.materialId
                        ];

                      const operation =
                        operationById[
                          parameter.operationId
                        ];

                      return (
                        <div
                          key={
                            parameter.id
                          }
                          className="rounded-xl border border-black/10 p-4 dark:border-white/10"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">
                                {
                                  tool?.name ??
                                  "Neznano orodje"
                                }
                              </div>

                              <div className="mt-1 text-xs opacity-60">
                                {
                                  material?.name ??
                                  "Neznan material"
                                }{" "}
                                ·{" "}
                                {
                                  operation?.name ??
                                  "Neznana operacija"
                                }
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  editCuttingParameter(
                                    parameter,
                                  )
                                }
                                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                <Pencil
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void deleteCuttingParameter(
                                    parameter.id,
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                              <div className="text-[10px] opacity-50">
                                Vc
                              </div>

                              <div className="mt-1 text-sm font-semibold">
                                {
                                  parameter.cuttingSpeedVc
                                }{" "}
                                m/min
                              </div>
                            </div>

                            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                              <div className="text-[10px] opacity-50">
                                fz
                              </div>

                              <div className="mt-1 text-sm font-semibold">
                                {
                                  parameter.feedPerToothFz
                                }
                              </div>
                            </div>

                            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                              <div className="text-[10px] opacity-50">
                                RPM
                              </div>

                              <div className="mt-1 text-sm font-semibold">
                                {
                                  parameter.referenceRpm
                                }
                              </div>
                            </div>

                            <div className="rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                              <div className="text-[10px] opacity-50">
                                Feed
                              </div>

                              <div className="mt-1 text-sm font-semibold">
                                {
                                  parameter.referenceFeed
                                }{" "}
                                mm/min
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs opacity-60">
                            ae{" "}
                            {
                              parameter.radialDepthAe
                            }{" "}
                            mm · ap{" "}
                            {
                              parameter.axialDepthAp
                            }{" "}
                            mm · max ae{" "}
                            {
                              parameter.maxRadialDepthAe
                            }{" "}
                            mm · max ap{" "}
                            {
                              parameter.maxAxialDepthAp
                            }{" "}
                            mm
                          </div>

                          {parameter.notes && (
                            <div className="mt-2 rounded-lg bg-black/[0.03] p-2 text-xs opacity-70 dark:bg-white/5">
                              {
                                parameter.notes
                              }
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}