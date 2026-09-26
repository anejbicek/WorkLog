import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Calculator as CalculatorIcon,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../services/supabase";

type CncTool = {
  id: string;
  name: string;
  toolTypeCode: string;
  toolTypeName: string;

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
};

type CncMaterial = {
  id: string;
  name: string;
  cuttingSpeedVc: number;
  feedPerToothFz: number;
  notes: string;
};

type CncOperation = {
  id: string;
  name: string;
  code: string;
  description: string;
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
};

function numberValue(
  value: unknown,
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatNumber(
  value: number,
  digits = 2,
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString(
    "sl-SI",
    {
      minimumFractionDigits:
        digits,
      maximumFractionDigits:
        digits,
    },
  );
}

function ToolGraphic({
  tool,
}: {
  tool: CncTool;
}) {
  const diameter = Math.max(
    30,
    Math.min(
      70,
      tool.diameter || 10,
    ) * 2,
  );

  const height = Math.max(
    80,
    Math.min(
      130,
      tool.cuttingLength ||
        20,
    ) * 2,
  );

  if (
    tool.toolTypeCode ===
    "ball_end_mill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-72 w-full"
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
      </svg>
    );
  }

  if (
    tool.toolTypeCode ===
    "bull_nose_end_mill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-72 w-full"
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
          y="265"
          textAnchor="middle"
          className="fill-current text-xs"
        >
          R{" "}
          {tool.cornerRadius.toFixed(
            2,
          )}{" "}
          mm
        </text>
      </svg>
    );
  }

  if (
    tool.toolTypeCode ===
    "t_slot_cutter"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-72 w-full"
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
    tool.toolTypeCode ===
    "face_mill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-72 w-full"
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
    tool.toolTypeCode ===
    "drill"
  ) {
    return (
      <svg
        viewBox="0 0 220 280"
        className="h-72 w-full"
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
          Konica{" "}
          {tool.tipAngle}°
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 280"
      className="h-72 w-full"
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
        Ø{" "}
        {tool.diameter.toFixed(
          2,
        )}{" "}
        mm
      </text>
    </svg>
  );
}

function OperationGraphic({
  operation,
}: {
  operation: CncOperation;
}) {
  if (
    operation.code ===
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
    operation.code ===
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

export default function Calculator() {
  const [
    tools,
    setTools,
  ] = useState<CncTool[]>([]);

  const [
    materials,
    setMaterials,
  ] = useState<CncMaterial[]>(
    [],
  );

  const [
    operations,
    setOperations,
  ] = useState<CncOperation[]>(
    [],
  );

  const [
    parameters,
    setParameters,
  ] = useState<
    CncCuttingParameter[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    toolId,
    setToolId,
  ] = useState("");

  const [
    materialId,
    setMaterialId,
  ] = useState("");

  const [
    operationId,
    setOperationId,
  ] = useState("");

  const [
    ae,
    setAe,
  ] = useState("0");

  const [
    ap,
    setAp,
  ] = useState("0");

  const [
    manualRpmEnabled,
    setManualRpmEnabled,
  ] = useState(false);

  const [
    manualRpm,
    setManualRpm,
  ] = useState("");

  const loadData =
    async () => {
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
          toolsResult,
          materialsResult,
          operationsResult,
          parametersResult,
        ] =
          await Promise.all([
            supabase
              .from(
                "cnc_tools",
              )
              .select(
                `
                  id,
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
                "id, name, cutting_speed_vc, feed_per_tooth_fz, notes",
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
                "id, code, name, description",
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
                  notes
                `,
              )
              .eq(
                "active",
                true,
              ),
          ]);

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
                  ? row
                      .cnc_tool_types[0]
                  : row.cnc_tool_types;

              return {
                id: row.id,
                name:
                  row.name ??
                  "",
                toolTypeCode:
                  relation?.code ??
                  "",
                toolTypeName:
                  relation?.name ??
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
              cuttingSpeedVc:
                numberValue(
                  row.cutting_speed_vc,
                ),
              feedPerToothFz:
                numberValue(
                  row.feed_per_tooth_fz,
                ),
              notes:
                row.notes ??
                "",
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
            }),
          );

        setTools(
          loadedTools,
        );

        setMaterials(
          loadedMaterials,
        );

        setOperations(
          loadedOperations,
        );

        setParameters(
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
      !toolId &&
      tools.length > 0
    ) {
      setToolId(
        tools[0].id,
      );
    }
  }, [
    toolId,
    tools,
  ]);

  useEffect(() => {
    if (
      !materialId &&
      materials.length > 0
    ) {
      setMaterialId(
        materials[0].id,
      );
    }
  }, [
    materialId,
    materials,
  ]);

  useEffect(() => {
    if (
      !operationId &&
      operations.length > 0
    ) {
      setOperationId(
        operations[0].id,
      );
    }
  }, [
    operationId,
    operations,
  ]);

  const tool = useMemo(
    () =>
      tools.find(
        (item) =>
          item.id ===
          toolId,
      ),
    [
      tools,
      toolId,
    ],
  );

  const material = useMemo(
    () =>
      materials.find(
        (item) =>
          item.id ===
          materialId,
      ),
    [
      materials,
      materialId,
    ],
  );

  const operation = useMemo(
    () =>
      operations.find(
        (item) =>
          item.id ===
          operationId,
      ),
    [
      operations,
      operationId,
    ],
  );

  const parameter =
    useMemo(
      () =>
        parameters.find(
          (item) =>
            item.toolId ===
              toolId &&
            item.materialId ===
              materialId &&
            item.operationId ===
              operationId,
        ),
      [
        parameters,
        toolId,
        materialId,
        operationId,
      ],
    );

  useEffect(() => {
    if (!parameter) {
      if (material) {
        setAe(
          String(
            material.id ===
              materialId
              ? 0
              : 0,
          ),
        );

        setAp("0");
      }

      setManualRpm("");

      return;
    }

    setAe(
      String(
        parameter.radialDepthAe,
      ),
    );

    setAp(
      String(
        parameter.axialDepthAp,
      ),
    );

    if (
      parameter.referenceRpm >
      0
    ) {
      setManualRpm(
        String(
          parameter.referenceRpm,
        ),
      );
    }
  }, [
    parameter,
    material,
    materialId,
  ]);

  const vc =
    parameter?.cuttingSpeedVc ??
    material?.cuttingSpeedVc ??
    0;

  const fz =
    parameter?.feedPerToothFz ??
    material?.feedPerToothFz ??
    0;

  const calculatedRpm =
    tool &&
    tool.diameter > 0 &&
    vc > 0
      ? (vc * 1000) /
        (Math.PI *
          tool.diameter)
      : 0;

  const rpm =
    manualRpmEnabled &&
    Number(manualRpm) > 0
      ? Number(manualRpm)
      : calculatedRpm;

  const feed =
    tool &&
    rpm > 0 &&
    fz > 0
      ? rpm *
        Math.max(
          tool.flutes,
          1,
        ) *
        fz
      : 0;

  const effectiveAe =
    operation?.code ===
    "slotting"
      ? tool?.diameter ?? 0
      : Math.min(
          Math.max(
            Number(ae) || 0,
            0,
          ),
          tool?.diameter ??
            0,
        );

  const effectiveAp =
    Number(ap) || 0;

  const mrr =
    effectiveAe *
    effectiveAp *
    feed /
    1000;

  const maxAe =
    parameter?.maxRadialDepthAe ??
    0;

  const maxAp =
    parameter?.maxAxialDepthAp ??
    0;

  const aeWarning =
    maxAe > 0 &&
    effectiveAe > maxAe;

  const apWarning =
    maxAp > 0 &&
    effectiveAp > maxAp;

  const parameterMissing =
    !parameter;

  const inputStyle =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5";

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
        <RefreshCw
          size={18}
          className="animate-spin"
        />

        <span>
          Nalagam CNC
          kalkulator ...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div className="mb-6 flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <CalculatorIcon
              size={28}
              color="#17465d"
            />

            <h1 className="m-0 text-3xl font-bold text-[#17465d]">
              CNC Kalkulator
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Izračun rezalnih
            parametrov na
            podlagi konkretnega
            orodja, materiala in
            operacije.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadData()
          }
          className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium dark:border-white/10 dark:bg-white/5"
        >
          <RefreshCw size={16} />
          Osveži
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Vhodni podatki
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Orodje
              </span>

              <select
                value={
                  toolId
                }
                onChange={(
                  event,
                ) =>
                  setToolId(
                    event
                      .target
                      .value,
                  )
                }
                className={
                  inputStyle
                }
              >
                {tools.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }{" "}
                      — Ø
                      {
                        item.diameter
                      }{" "}
                      — Z
                      {
                        item.flutes
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Material obdelovanca
              </span>

              <select
                value={
                  materialId
                }
                onChange={(
                  event,
                ) =>
                  setMaterialId(
                    event
                      .target
                      .value,
                  )
                }
                className={
                  inputStyle
                }
              >
                {materials.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Vrsta obdelave
              </span>

              <select
                value={
                  operationId
                }
                onChange={(
                  event,
                ) =>
                  setOperationId(
                    event
                      .target
                      .value,
                  )
                }
                className={
                  inputStyle
                }
              >
                {operations.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            {tool && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400">
                      Tip
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {
                        tool.toolTypeName
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">
                      Material orodja
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {
                        tool.toolMaterial
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">
                      Premer
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {
                        tool.diameter
                      }{" "}
                      mm
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">
                      Število zob
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {
                        tool.flutes
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">
                      Rezalna dolžina
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {
                        tool.cuttingLength
                      }{" "}
                      mm
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">
                      Prevleka
                    </div>

                    <div className="mt-1 font-semibold text-slate-700">
                      {tool.coating ||
                        "Brez"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  ae
                </span>

                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ae}
                    onChange={(
                      event,
                    ) =>
                      setAe(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-l-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  />

                  <span className="flex items-center rounded-r-xl border border-l-0 border-black/10 bg-slate-50 px-3 text-xs text-slate-500">
                    mm
                  </span>
                </div>
              </label>

              <label>
                <span className="mb-1 block text-xs font-semibold text-slate-600">
                  ap
                </span>

                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ap}
                    onChange={(
                      event,
                    ) =>
                      setAp(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-l-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
                  />

                  <span className="flex items-center rounded-r-xl border border-l-0 border-black/10 bg-slate-50 px-3 text-xs text-slate-500">
                    mm
                  </span>
                </div>
              </label>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    manualRpmEnabled
                  }
                  onChange={(
                    event,
                  ) =>
                    setManualRpmEnabled(
                      event
                        .target
                        .checked,
                    )
                  }
                />

                <span className="text-sm font-semibold text-slate-700">
                  Ročno nastavi
                  RPM
                </span>
              </label>

              {manualRpmEnabled && (
                <div className="mt-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                      RPM
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        manualRpm
                      }
                      onChange={(
                        event,
                      ) =>
                        setManualRpm(
                          event
                            .target
                            .value,
                        )
                      }
                      className={
                        inputStyle
                      }
                      placeholder="npr. 8000"
                    />
                  </label>

                  <p className="mt-2 text-xs text-slate-500">
                    Pri ročno
                    nastavljenih
                    vrtljajih se
                    pomik izračuna
                    iz RPM × Z × fz.
                  </p>
                </div>
              )}
            </div>

            {parameterMissing && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
                Za to kombinacijo
                trenutno ni
                shranjenih konkretnih
                rezalnih parametrov.
                Uporabljene bodo
                osnovne vrednosti
                materiala.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Orodje in operacija
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {tool && (
              <div className="rounded-xl border border-slate-200 p-3 text-slate-700">
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  ORODJE
                </div>

                <ToolGraphic
                  tool={tool}
                />

                <div className="mt-2 text-center text-sm font-semibold">
                  {
                    tool.name
                  }
                </div>
              </div>
            )}

            {operation && (
              <div className="rounded-xl border border-slate-200 p-3 text-slate-700">
                <div className="mb-2 text-xs font-semibold text-slate-500">
                  OPERACIJA
                </div>

                <div className="flex min-h-72 items-center justify-center">
                  <OperationGraphic
                    operation={
                      operation
                    }
                  />
                </div>

                <div className="mt-2 text-center text-sm font-semibold">
                  {
                    operation.name
                  }
                </div>

                <div className="mt-1 text-center text-xs text-slate-500">
                  {
                    operation.description
                  }
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                Vc
              </div>

              <div className="mt-1 text-xl font-bold text-[#17465d]">
                {formatNumber(
                  vc,
                  1,
                )}{" "}
                <span className="text-xs font-normal">
                  m/min
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                fz
              </div>

              <div className="mt-1 text-xl font-bold text-[#17465d]">
                {formatNumber(
                  fz,
                  3,
                )}{" "}
                <span className="text-xs font-normal">
                  mm/zob
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                Z
              </div>

              <div className="mt-1 text-xl font-bold text-[#17465d]">
                {
                  tool?.flutes ??
                  0
                }
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-800">
          Izračunani parametri
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Vrtljaji
            </div>

            <div className="mt-1 text-2xl font-bold text-[#17465d]">
              {formatNumber(
                rpm,
                0,
              )}{" "}
              <span className="text-xs font-normal">
                rpm
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Pomik
            </div>

            <div className="mt-1 text-2xl font-bold text-[#17465d]">
              {formatNumber(
                feed,
                0,
              )}{" "}
              <span className="text-xs font-normal">
                mm/min
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              fz
            </div>

            <div className="mt-1 text-2xl font-bold text-[#17465d]">
              {formatNumber(
                fz,
                3,
              )}{" "}
              <span className="text-xs font-normal">
                mm/zob
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              ae × ap
            </div>

            <div className="mt-1 text-2xl font-bold text-[#17465d]">
              {formatNumber(
                effectiveAe,
                2,
              )}{" "}
              ×{" "}
              {formatNumber(
                effectiveAp,
                2,
              )}{" "}
              <span className="text-xs font-normal">
                mm
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              MRR
            </div>

            <div className="mt-1 text-2xl font-bold text-[#17465d]">
              {formatNumber(
                mrr,
                2,
              )}{" "}
              <span className="text-xs font-normal">
                cm³/min
              </span>
            </div>
          </div>
        </div>

        {aeWarning && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
            <strong>
              Opozorilo ae:
            </strong>{" "}
            vneseni ae je
            večji od
            maksimalnega ae
            ({formatNumber(
              maxAe,
              2,
            )}{" "}
            mm), določenega v
            administraciji.
          </div>
        )}

        {apWarning && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
            <strong>
              Opozorilo ap:
            </strong>{" "}
            vneseni ap je
            večji od
            maksimalnega ap
            ({formatNumber(
              maxAp,
              2,
            )}{" "}
            mm), določenega v
            administraciji.
          </div>
        )}

        {manualRpmEnabled && (
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-700">
            RPM je nastavljen
            ročno. Pomik je
            preračunan iz
            nastavljenega RPM,
            števila zob in fz.
          </div>
        )}

        {parameter?.notes && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <strong>
              Opomba administratorja:
            </strong>{" "}
            {
              parameter.notes
            }
          </div>
        )}
      </section>

      <div className="mt-4 text-xs text-slate-500">
        Kalkulator uporablja
        referenčne parametre,
        ki jih določi glavni
        administrator za konkretno
        kombinacijo orodja,
        materiala in operacije.
        Končne vrednosti je treba
        preveriti glede na dejanske
        pogoje obdelave.
      </div>
    </div>
  );
}