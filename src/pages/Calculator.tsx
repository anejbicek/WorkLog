import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  Calculator as CalculatorIcon,
  CircleDot,
  Clock3,
  Gauge,
  Layers3,
  RefreshCw,
  Settings2,
  Sparkles,
} from "lucide-react";

import { supabase } from "../services/supabase";
import {
  getCncToolVisual,
} from "../utils/cncToolLibrary";

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

const TOOL_TYPE_ALIASES: Record<string, string> = {
  end_mill_flat: "Steblasti rezkar",
  ball_end_mill: "Kroglasti rezkar",
  bull_nose_end_mill: "Torusni rezkar",
  face_mill: "Frezalna glava",
  t_slot_cutter: "T-rezkar",
  dovetail_cutter: "Lastovičji rep",
  drill: "Sveder",
  gun_drill: "Topovski sveder",
  lollipop: "Lollipop rezkar",
  thread_mill: "Navojni rezkar",
  center_drill: "Centrirni sveder",
  step_drill: "Stopničasti sveder",
  reamer: "Povrtalo",
  countersink: "Vgrezilo",
  chamfer_mill: "Posnemalno rezkalo",
  slot_mill: "Rezkalo za utore",
  tapered_end_mill: "Stožčasto rezkalo",
  angular_mill: "Kotno rezkalo",
  custom_mill: "Drugo / po meri",
};

const DRILL_CODES = new Set([
  "drill",
  "gun_drill",
  "center_drill",
  "step_drill",
  "reamer",
  "countersink",
]);

const DRILL_OPERATION_WORDS = [
  "vrt",
  "drill",
  "globo",
];

function numberValue(value: unknown): number {
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

function isDrillingOperation(
  tool?: CncTool,
  operation?: CncOperation,
): boolean {
  if (!tool && !operation) {
    return false;
  }

  if (
    tool &&
    DRILL_CODES.has(
      tool.toolTypeCode,
    )
  ) {
    return true;
  }

  const code =
    operation?.code
      ?.toLowerCase() ?? "";
  const name =
    operation?.name
      ?.toLowerCase() ?? "";

  return (
    DRILL_OPERATION_WORDS.some(
      (word) =>
        code.includes(word) ||
        name.includes(word),
    )
  );
}

function IconTile({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#072534] text-cyan-400">
      {children}
    </div>
  );
}

function ResultRow({
  icon,
  title,
  formula,
  value,
  unit,
}: {
  icon: React.ReactNode;
  title: string;
  formula: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-cyan-950/70 bg-[#09202c] p-3">
      <IconTile>{icon}</IconTile>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-200">
          {title}
        </div>

        <div className="mt-1 text-[11px] leading-4 text-slate-500">
          {formula}
        </div>
      </div>

      <div className="min-w-[122px] rounded-xl bg-[#061923] px-4 py-2 text-right">
        <div className="text-xl font-bold tracking-tight text-cyan-300">
          {value}
        </div>

        <div className="text-[11px] text-slate-500">
          {unit}
        </div>
      </div>
    </div>
  );
}

function GeometryRow({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-100">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-slate-500">
            {unit}
          </span>
        )}
      </span>
    </div>
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
  ] = useState<CncMaterial[]>([]);

  const [
    operations,
    setOperations,
  ] = useState<CncOperation[]>([]);

  const [
    parameters,
    setParameters,
  ] = useState<CncCuttingParameter[]>([]);

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
        toolsResult,
        materialsResult,
        operationsResult,
        parametersResult,
      ] = await Promise.all([
        supabase
          .from("cnc_tools")
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
          .eq("active", true)
          .order("name"),

        supabase
          .from("cnc_materials")
          .select(
            "id, name, cutting_speed_vc, feed_per_tooth_fz, notes",
          )
          .eq("active", true)
          .order("name"),

        supabase
          .from("cnc_operations")
          .select(
            "id, code, name, description",
          )
          .eq("active", true)
          .order("name"),

        supabase
          .from("cnc_cutting_parameters")
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
          .eq("active", true),
      ]);

      if (toolsResult.error) {
        throw toolsResult.error;
      }

      if (materialsResult.error) {
        throw materialsResult.error;
      }

      if (operationsResult.error) {
        throw operationsResult.error;
      }

      if (parametersResult.error) {
        throw parametersResult.error;
      }

      const loadedTools = (
        toolsResult.data ?? []
      ).map((row: any) => {
        const relation = Array.isArray(
          row.cnc_tool_types,
        )
          ? row.cnc_tool_types[0]
          : row.cnc_tool_types;

        return {
          id: row.id,
          name: row.name ?? "",
          toolTypeCode:
            relation?.code ?? "",
          toolTypeName:
            relation?.name ?? "",
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
            row.tool_material ?? "",
          coating:
            row.coating ?? "",
          geometry:
            row.geometry ?? {},
        };
      });

      const loadedMaterials = (
        materialsResult.data ?? []
      ).map((row) => ({
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
        notes: row.notes ?? "",
      }));

      const loadedOperations = (
        operationsResult.data ?? []
      ).map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description:
          row.description ?? "",
      }));

      const loadedParameters = (
        parametersResult.data ?? []
      ).map((row) => ({
        id: row.id,
        toolId: row.tool_id,
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
          row.full_width_reference !== false,
        fullFluteReference:
          row.full_flute_reference !== false,
        notes: row.notes ?? "",
      }));

      setTools(loadedTools);
      setMaterials(loadedMaterials);
      setOperations(loadedOperations);
      setParameters(loadedParameters);
    } catch (error) {
      setErrorMessage(
        String(
          (error as any)?.message ??
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
    if (!toolId && tools.length > 0) {
      setToolId(tools[0].id);
    }
  }, [toolId, tools]);

  useEffect(() => {
    if (
      !materialId &&
      materials.length > 0
    ) {
      setMaterialId(
        materials[0].id,
      );
    }
  }, [materialId, materials]);

  useEffect(() => {
    if (
      !operationId &&
      operations.length > 0
    ) {
      setOperationId(
        operations[0].id,
      );
    }
  }, [operationId, operations]);

  const tool = useMemo(
    () =>
      tools.find(
        (item) =>
          item.id === toolId,
      ),
    [tools, toolId],
  );

  const material = useMemo(
    () =>
      materials.find(
        (item) =>
          item.id === materialId,
      ),
    [materials, materialId],
  );

  const operation = useMemo(
    () =>
      operations.find(
        (item) =>
          item.id === operationId,
      ),
    [operations, operationId],
  );

  const parameter = useMemo(
    () =>
      parameters.find(
        (item) =>
          item.toolId === toolId &&
          item.materialId === materialId &&
          item.operationId === operationId,
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
      setAe("0");
      setAp("0");
      setManualRpm("");
      return;
    }

    setAe(
      String(parameter.radialDepthAe),
    );
    setAp(
      String(parameter.axialDepthAp),
    );

    if (parameter.referenceRpm > 0) {
      setManualRpm(
        String(parameter.referenceRpm),
      );
    }
  }, [parameter]);

  const vc =
    parameter?.cuttingSpeedVc ??
    material?.cuttingSpeedVc ??
    0;

  const fz =
    parameter?.feedPerToothFz ??
    material?.feedPerToothFz ??
    0;

  const drilling =
    isDrillingOperation(
      tool,
      operation,
    );

  const calculatedRpm =
    tool &&
    tool.diameter > 0 &&
    vc > 0
      ? (vc * 1000) /
        (Math.PI * tool.diameter)
      : 0;

  const rpm =
    manualRpmEnabled &&
    Number(manualRpm) > 0
      ? Number(manualRpm)
      : calculatedRpm;

  const feed = drilling
    ? rpm > 0 && fz > 0
      ? rpm * fz
      : 0
    : tool && rpm > 0 && fz > 0
      ? rpm *
        Math.max(tool.flutes, 1) *
        fz
      : 0;

  const effectiveAe = drilling
    ? 0
    : operation?.code === "slotting"
      ? tool?.diameter ?? 0
      : Math.min(
          Math.max(
            Number(ae) || 0,
            0,
          ),
          tool?.diameter ?? 0,
        );

  const effectiveAp =
    Number(ap) || 0;

  const mrr = drilling
    ? tool && feed > 0
      ? ((Math.PI *
          Math.pow(
            tool.diameter,
            2,
          )) /
          4) *
        (feed / 1000)
      : 0
    : (effectiveAe *
        effectiveAp *
        feed) /
      1000;

  const drillingTime = drilling
    ? effectiveAp > 0 && feed > 0
      ? effectiveAp / feed
      : 0
    : 0;

  const maxAe =
    parameter?.maxRadialDepthAe ??
    0;

  const maxAp =
    parameter?.maxAxialDepthAp ??
    0;

  const aeWarning =
    !drilling &&
    maxAe > 0 &&
    effectiveAe > maxAe;

  const apWarning =
    effectiveAp > maxAp &&
    maxAp > 0;

  const parameterMissing =
    !parameter;

  const toolVisual =
    getCncToolVisual(
      tool?.toolTypeCode ?? "",
    );

  const toolTitle =
    toolVisual?.name ??
    TOOL_TYPE_ALIASES[
      tool?.toolTypeCode ?? ""
    ] ??
    tool?.toolTypeName ??
    tool?.name ??
    "Orodje";

  const toolSubtitle =
    toolVisual?.description ??
    "Konkretno orodje iz CNC knjižnice.";

  const geometryPath =
    toolVisual?.geometryPath ??
    toolVisual?.imagePath ??
    "/cnc-tools/thumbnails/end-mill-flat.jpg";

  const inputStyle =
    "w-full rounded-xl border border-cyan-900/80 bg-[#071d29] px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500";

  const smallCardStyle =
    "rounded-2xl border border-cyan-950/70 bg-[#081c27]";

  if (loading) {
    return (
      <div className="rounded-3xl border border-cyan-950/70 bg-[#061a24] p-8 text-slate-200">
        <div className="flex items-center gap-3">
          <RefreshCw
            size={18}
            className="animate-spin text-cyan-400"
          />
          <span>
            Nalagam CNC kalkulator ...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-10 min-h-full bg-[#04131c] px-10 py-8 text-slate-100">
      <div className="mx-auto w-full max-w-[1500px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CalculatorIcon
              size={31}
              className="text-cyan-400"
            />

            <h1 className="text-3xl font-bold tracking-tight">
              CNC Kalkulator
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Izračun rezalnih parametrov na podlagi konkretnega orodja, materiala in operacije.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadData()
          }
          className="flex items-center gap-2 rounded-xl border border-cyan-900/80 bg-[#0a2431] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-600 hover:text-white"
        >
          <RefreshCw size={16} />
          Osveži
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 2xl:grid-cols-[0.95fr_1.18fr_1fr]">
        {/* Vhodni podatki */}
        <section className={`${smallCardStyle} p-5`}>
          <h2 className="mb-5 text-xl font-bold">
            Vhodni podatki
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-400">
                Orodje
              </label>

              <div className="relative overflow-hidden rounded-2xl border border-cyan-900/80 bg-[#071d29]">
                <div className="flex min-h-[76px] items-center gap-3 px-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0b2a39]">
                    <img
                      src={
                        toolVisual?.imagePath ??
                        "/cnc-tools/thumbnails/end-mill-flat.jpg"
                      }
                      alt={toolTitle}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-100">
                      {toolTitle}
                    </div>

                    <div className="truncate text-xs text-slate-500">
                      {tool?.name ??
                        toolSubtitle}
                    </div>
                  </div>

                  <ArrowRight
                    size={17}
                    className="rotate-90 text-slate-500"
                  />
                </div>

                <select
                  value={toolId}
                  onChange={(event) =>
                    setToolId(
                      event.target.value,
                    )
                  }
                  aria-label="Izberi orodje"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
                  {tools.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {TOOL_TYPE_ALIASES[
                          item.toolTypeCode
                        ] ??
                          item.toolTypeName ??
                          item.name}
                        {" — Ø"}
                        {item.diameter}
                        {" — Z"}
                        {item.flutes}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-400">
                Material obdelovanca
              </label>

              <select
                value={materialId}
                onChange={(event) =>
                  setMaterialId(
                    event.target.value,
                  )
                }
                className={inputStyle}
              >
                {materials.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-400">
                Operacija
              </label>

              <div className="relative">
                <select
                  value={operationId}
                  onChange={(event) =>
                    setOperationId(
                      event.target.value,
                    )
                  }
                  className={inputStyle}
                >
                  {operations.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {operation?.description && (
                <div className="mt-2 rounded-xl bg-[#061923] px-3 py-2 text-xs leading-5 text-slate-500">
                  {operation.description}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-400">
                  {drilling
                    ? "Premer luknje"
                    : "ae"}
                </span>

                <div className="flex overflow-hidden rounded-xl border border-cyan-900/80 bg-[#071d29]">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      drilling
                        ? tool?.diameter ?? 0
                        : ae
                    }
                    disabled={drilling}
                    onChange={(event) =>
                      setAe(
                        event.target.value,
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none disabled:opacity-70"
                  />

                  <span className="flex items-center bg-slate-100 px-3 text-xs text-slate-500">
                    mm
                  </span>
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-400">
                  {drilling
                    ? "Globina luknje"
                    : "ap"}
                </span>

                <div className="flex overflow-hidden rounded-xl border border-cyan-900/80 bg-[#071d29]">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ap}
                    onChange={(event) =>
                      setAp(
                        event.target.value,
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  />

                  <span className="flex items-center bg-slate-100 px-3 text-xs text-slate-500">
                    mm
                  </span>
                </div>
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-cyan-900/80 bg-[#071d29] p-3">
              <input
                type="checkbox"
                checked={
                  manualRpmEnabled
                }
                onChange={(event) =>
                  setManualRpmEnabled(
                    event.target.checked,
                  )
                }
                className="h-4 w-4 accent-cyan-500"
              />

              <span className="text-sm font-semibold text-slate-300">
                Ročno nastavi RPM
              </span>
            </label>

            {manualRpmEnabled && (
              <label>
                <span className="mb-1.5 block text-sm font-medium text-slate-400">
                  RPM
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={manualRpm}
                  onChange={(event) =>
                    setManualRpm(
                      event.target.value,
                    )
                  }
                  className={inputStyle}
                  placeholder="npr. 8000"
                />
              </label>
            )}

            {parameterMissing && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-300">
                Za to kombinacijo trenutno ni shranjenih konkretnih rezalnih parametrov. Uporabljene bodo osnovne vrednosti materiala.
              </div>
            )}
          </div>
        </section>

        {/* Geometrija orodja */}
        <section className={`${smallCardStyle} p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Geometrija orodja
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Aktivno izbrano orodje in njegove geometrijske vrednosti.
              </p>
            </div>

            <Settings2
              size={19}
              className="text-cyan-500"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex min-h-[530px] items-center justify-center overflow-hidden rounded-2xl border border-cyan-950/70 bg-[#061923] p-3">
              <img
                src={geometryPath}
                alt={toolTitle}
                className="max-h-[505px] w-full object-contain"
              />
            </div>

            <div className="rounded-2xl border border-cyan-950/70 bg-[#071d29] p-4">
              <div className="mb-2 text-sm font-bold text-slate-200">
                Geometrijski podatki
              </div>

              <GeometryRow
                label="Premer (D)"
                value={formatNumber(
                  tool?.diameter ?? 0,
                  2,
                )}
                unit="mm"
              />

              <GeometryRow
                label="Rezalna dolžina (Lc)"
                value={formatNumber(
                  tool?.cuttingLength ??
                    0,
                  2,
                )}
                unit="mm"
              />

              <GeometryRow
                label="Skupna dolžina (L)"
                value={formatNumber(
                  tool?.overallLength ??
                    0,
                  2,
                )}
                unit="mm"
              />

              <GeometryRow
                label="Premer stebla"
                value={formatNumber(
                  tool?.shankDiameter ??
                    0,
                  2,
                )}
                unit="mm"
              />

              <GeometryRow
                label="Število zob (Z)"
                value={formatNumber(
                  tool?.flutes ?? 0,
                  0,
                )}
              />

              {!drilling && (
                <GeometryRow
                  label="Radij (R)"
                  value={formatNumber(
                    tool?.cornerRadius ??
                      0,
                    2,
                  )}
                  unit="mm"
                />
              )}

              {drilling && (
                <GeometryRow
                  label="Kot konice (α)"
                  value={formatNumber(
                    tool?.tipAngle ?? 0,
                    1,
                  )}
                  unit="°"
                />
              )}

              <div className="my-3 border-t border-white/5" />

              <GeometryRow
                label="Material orodja"
                value={
                  tool?.toolMaterial ||
                  "—"
                }
              />

              <GeometryRow
                label="Premaz"
                value={
                  tool?.coating ||
                  "—"
                }
              />

              <div className="mt-4 rounded-xl bg-[#061923] p-3 text-xs leading-5 text-slate-500">
                {toolSubtitle}
              </div>
            </div>
          </div>
        </section>

        {/* Izračunani parametri */}
        <section className={`${smallCardStyle} p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Izračunani parametri
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Vrednosti se preračunajo takoj ob spremembi vnosa.
              </p>
            </div>

            <Sparkles
              size={19}
              className="text-cyan-500"
            />
          </div>

          <div className="space-y-3">
            <ResultRow
              icon={
                <Gauge size={23} />
              }
              title="Vc – rezalna hitrost"
              formula="Vc = π × D × n / 1000"
              value={formatNumber(
                vc,
                1,
              )}
              unit="m/min"
            />

            <ResultRow
              icon={
                <Settings2 size={23} />
              }
              title="Vrtljaji (n)"
              formula="n = 1000 × Vc / (π × D)"
              value={formatNumber(
                rpm,
                0,
              )}
              unit="rpm"
            />

            <ResultRow
              icon={
                <ArrowRight size={25} />
              }
              title={
                drilling
                  ? "f – podajanje na vrtljaj"
                  : "fz – podajanje na zob"
              }
              formula={
                drilling
                  ? "f = podajanje na vrtljaj"
                  : "fz = podajanje na zob"
              }
              value={formatNumber(
                fz,
                3,
              )}
              unit={
                drilling
                  ? "mm/vrt"
                  : "mm/zob"
              }
            />

            <ResultRow
              icon={
                <Activity size={23} />
              }
              title="Podajanje (Vf)"
              formula={
                drilling
                  ? "Vf = f × n"
                  : "Vf = fz × Z × n"
              }
              value={formatNumber(
                feed,
                0,
              )}
              unit="mm/min"
            />

            {!drilling && (
              <ResultRow
                icon={
                  <Layers3 size={23} />
                }
                title="ae × ap"
                formula="radialni × aksialni vkorak"
                value={`${formatNumber(
                  effectiveAe,
                  2,
                )} × ${formatNumber(
                  effectiveAp,
                  2,
                )}`}
                unit="mm"
              />
            )}

            {drilling && (
              <ResultRow
                icon={
                  <CircleDot size={23} />
                }
                title="Premer luknje"
                formula="D = premer izbranega svedra"
                value={formatNumber(
                  tool?.diameter ?? 0,
                  2,
                )}
                unit="mm"
              />
            )}

            <ResultRow
              icon={
                <CircleDot size={23} />
              }
              title="MRR – odrez"
              formula={
                drilling
                  ? "MRR = (π × D² / 4) × Vf"
                  : "MRR = ae × ap × Vf"
              }
              value={formatNumber(
                mrr,
                2,
              )}
              unit="cm³/min"
            />

            {drilling && (
              <ResultRow
                icon={
                  <Clock3 size={23} />
                }
                title="Čas vrtanja"
                formula="t = Lc / Vf"
                value={formatNumber(
                  drillingTime,
                  2,
                )}
                unit="min"
              />
            )}

            {operation?.code.includes(
              "helix",
            ) && !drilling && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                <GeometryRow
                  label="Helix korak (ap)"
                  value={formatNumber(
                    effectiveAp,
                    2,
                  )}
                  unit="mm"
                />

                <GeometryRow
                  label="Premer helikse"
                  value={formatNumber(
                    Math.max(
                      tool?.diameter ??
                        0,
                      (tool?.diameter ??
                        0) +
                        2 *
                          effectiveAe,
                    ),
                    2,
                  )}
                  unit="mm"
                />
              </div>
            )}
          </div>

          {(aeWarning || apWarning) && (
            <div className="mt-4 space-y-2">
              {aeWarning && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-red-300">
                  <strong>
                    Opozorilo ae:
                  </strong>{" "}
                  vneseni ae je večji od maksimalnega ae ({formatNumber(maxAe, 2)} mm).
                </div>
              )}

              {apWarning && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-red-300">
                  <strong>
                    Opozorilo ap:
                  </strong>{" "}
                  vneseni ap je večji od maksimalnega ap ({formatNumber(maxAp, 2)} mm).
                </div>
              )}
            </div>
          )}

          {manualRpmEnabled && (
            <div className="mt-4 rounded-xl border border-cyan-900/80 bg-cyan-500/10 p-3 text-xs leading-5 text-cyan-200">
              RPM je nastavljen ročno. Podajanje je preračunano iz nastavljenega RPM in vnesenega podatka fz oziroma f.
            </div>
          )}

          {parameter?.notes && (
            <div className="mt-4 rounded-xl border border-white/5 bg-[#061923] p-3 text-xs leading-5 text-slate-400">
              <strong className="text-slate-200">
                Opomba administratorja:
              </strong>{" "}
              {parameter.notes}
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
        <Clock3 size={13} />
        <span>
          Kalkulator uporablja referenčne parametre, ki jih določi administrator za konkretno kombinacijo orodja, materiala in operacije.
        </span>
      </div>
    </div>
    </div>
  );
}
