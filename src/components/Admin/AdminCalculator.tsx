import { useEffect, useMemo, useState } from "react";
import CncToolTypeSelector, {
  CncToolGraphic,
  TOOL_TYPES,
  type CncToolTypeDefinition,
} from "./CncToolTypeSelector";
import { useAdmin } from "../../context/AdminContext";

type ToolMaterial = "VHM" | "HSS" | "HSS-E" | "HM" | "PCD" | "CBN";

type CncTool = {
  id: string;
  name: string;
  type: string;
  diameter: number;
  shankDiameter: number;
  flutes: number;
  cuttingLength: number;
  fluteLength: number;
  overallLength: number;
  cornerRadius: number;
  tipAngle?: number;
  toolMaterial: ToolMaterial;
  coating: string;
};

type CncMaterial = {
  id: string;
  name: string;
  vc: number;
  fz: number;
};

type CncOperation = {
  id: string;
  name: string;
  description: string;
  code: string;
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

const TOOLS_KEY = "zusta_worklog_v2_cnc_tools";
const MATERIALS_KEY = "zusta_worklog_v2_cnc_materials";
const OPERATIONS_KEY = "zusta_worklog_v2_cnc_operations";
const PARAMETERS_KEY = "zusta_worklog_v2_cnc_cutting_parameters";

const CHANGE_EVENT = "zusta-cnc-calculator-changed";

const DEFAULT_MATERIALS: CncMaterial[] = [
  {
    id: "material-aluminium",
    name: "Aluminij",
    vc: 300,
    fz: 0.08,
  },
  {
    id: "material-steel",
    name: "Jeklo",
    vc: 120,
    fz: 0.05,
  },
  {
    id: "material-stainless",
    name: "Nerjavno jeklo",
    vc: 80,
    fz: 0.04,
  },
  {
    id: "material-cast-iron",
    name: "Lito železo",
    vc: 100,
    fz: 0.05,
  },
];

const DEFAULT_OPERATIONS: CncOperation[] = [
  {
    id: "operation-milling",
    name: "Rezkanje",
    code: "milling",
    description: "Klasično bočno oziroma čelno rezkanje.",
  },
  {
    id: "operation-slotting",
    name: "Polna širina",
    code: "slotting",
    description: "Rezkanje po celotni širini orodja.",
  },
  {
    id: "operation-plunging",
    name: "Potapljanje",
    code: "plunging",
    description: "Navpično potapljanje orodja.",
  },
];

const TOOL_MATERIALS: ToolMaterial[] = [
  "VHM",
  "HSS",
  "HSS-E",
  "HM",
  "PCD",
  "CBN",
];

const COATINGS = [
  "Brez prevleke",
  "AlTiN",
  "TiAlN",
  "TiN",
  "TiCN",
  "DLC",
  "AlCrN",
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function calculateReferenceFeed(
  rpm: number,
  flutes: number,
  fz: number,
): number {
  return rpm * flutes * fz;
}

function calculateReferenceRpm(vc: number, diameter: number): number {
  if (diameter <= 0) {
    return 0;
  }

  return (vc * 1000) / (Math.PI * diameter);
}

function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString("sl-SI", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function getToolType(
  typeId: string,
): CncToolTypeDefinition | undefined {
  return TOOL_TYPES.find((item) => item.id === typeId);
}

function ToolGeometryPreview({
  tool,
}: {
  tool: CncTool;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-700">
        Grafični prikaz
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-slate-50">
        <CncToolGraphic
          type={tool.type}
          diameter={tool.diameter}
          cuttingLength={tool.cuttingLength}
          fluteLength={tool.fluteLength}
          overallLength={tool.overallLength}
          cornerRadius={tool.cornerRadius}
          tipAngle={tool.tipAngle}
        />
      </div>
    </div>
  );
}

function OperationGraphic({
  operation,
}: {
  operation: CncOperation;
}) {
  if (operation.code === "slotting") {
    return (
      <svg
        viewBox="0 0 180 110"
        className="h-24 w-36"
        aria-label="Polna širina"
      >
        <rect
          x="35"
          y="35"
          width="110"
          height="40"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <line
          x1="20"
          y1="55"
          x2="160"
          y2="55"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="7 5"
        />
        <line
          x1="90"
          y1="8"
          x2="90"
          y2="102"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M82 20 L90 8 L98 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if (operation.code === "plunging") {
    return (
      <svg
        viewBox="0 0 180 110"
        className="h-24 w-36"
        aria-label="Potapljanje"
      >
        <rect
          x="76"
          y="10"
          width="28"
          height="45"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M65 55 L90 88 L115 55"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
        <line
          x1="90"
          y1="60"
          x2="90"
          y2="103"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M82 92 L90 103 L98 92"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 180 110"
      className="h-24 w-36"
      aria-label="Rezkanje"
    >
      <rect
        x="72"
        y="10"
        width="36"
        height="50"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <rect
        x="35"
        y="65"
        width="110"
        height="25"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <line
        x1="90"
        y1="52"
        x2="90"
        y2="82"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M82 72 L90 82 L98 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function AdminCalculator() {
  const { currentUserRole } = useAdmin();

  const isMainAdministrator =
    currentUserRole === "admin" ||
    currentUserRole === "super_admin";

  const [activeSection, setActiveSection] = useState<
    "tools" | "materials" | "operations" | "parameters"
  >("tools");

  const [tools, setTools] = useState<CncTool[]>(() =>
    loadLocal<CncTool[]>(TOOLS_KEY, []),
  );

  const [materials, setMaterials] = useState<CncMaterial[]>(() =>
    loadLocal<CncMaterial[]>(MATERIALS_KEY, DEFAULT_MATERIALS),
  );

  const [operations, setOperations] = useState<CncOperation[]>(() =>
    loadLocal<CncOperation[]>(
      OPERATIONS_KEY,
      DEFAULT_OPERATIONS,
    ),
  );

  const [parameters, setParameters] = useState<
    CncCuttingParameter[]
  >(() =>
    loadLocal<CncCuttingParameter[]>(PARAMETERS_KEY, []),
  );

  const [selectedToolType, setSelectedToolType] = useState<
    string | null
  >(null);

  const [editingTool, setEditingTool] = useState<CncTool | null>(
    null,
  );

  const [editingMaterial, setEditingMaterial] =
    useState<CncMaterial | null>(null);

  const [editingOperation, setEditingOperation] =
    useState<CncOperation | null>(null);

  const [editingParameter, setEditingParameter] =
    useState<CncCuttingParameter | null>(null);

  const [selectedParameterToolId, setSelectedParameterToolId] =
    useState("");

  const [
    selectedParameterMaterialId,
    setSelectedParameterMaterialId,
  ] = useState("");

  const [
    selectedParameterOperationId,
    setSelectedParameterOperationId,
  ] = useState("");

  useEffect(() => {
    const handleChange = () => {
      setTools(loadLocal<CncTool[]>(TOOLS_KEY, []));
      setMaterials(
        loadLocal<CncMaterial[]>(MATERIALS_KEY, DEFAULT_MATERIALS),
      );
      setOperations(
        loadLocal<CncOperation[]>(
          OPERATIONS_KEY,
          DEFAULT_OPERATIONS,
        ),
      );
      setParameters(
        loadLocal<CncCuttingParameter[]>(PARAMETERS_KEY, []),
      );
    };

    window.addEventListener(CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
    };
  }, []);

  const selectedTool = useMemo(
    () =>
      tools.find(
        (tool) => tool.id === selectedParameterToolId,
      ) ?? null,
    [tools, selectedParameterToolId],
  );

  const selectedMaterial = useMemo(
    () =>
      materials.find(
        (material) =>
          material.id === selectedParameterMaterialId,
      ) ?? null,
    [materials, selectedParameterMaterialId],
  );

  const selectedOperation = useMemo(
    () =>
      operations.find(
        (operation) =>
          operation.id === selectedParameterOperationId,
      ) ?? null,
    [operations, selectedParameterOperationId],
  );

  function resetToolEditor() {
    setEditingTool(null);
    setSelectedToolType(null);
  }

  function createNewTool() {
    setEditingTool({
      id: createId("tool"),
      name: "",
      type: TOOL_TYPES[0]?.id ?? "end_mill_flat",
      diameter: 10,
      shankDiameter: 10,
      flutes: 4,
      cuttingLength: 25,
      fluteLength: 15,
      overallLength: 75,
      cornerRadius: 0,
      tipAngle: undefined,
      toolMaterial: "VHM",
      coating: "AlTiN",
    });

    setSelectedToolType(
      TOOL_TYPES[0]?.id ?? "end_mill_flat",
    );
  }

  function saveTool() {
    if (!editingTool) {
      return;
    }

    if (!editingTool.name.trim()) {
      alert("Vnesi ime orodja.");
      return;
    }

    if (editingTool.diameter <= 0) {
      alert("Premer orodja mora biti večji od 0.");
      return;
    }

    if (!editingTool.toolMaterial) {
      alert("Material orodja je obvezen.");
      return;
    }

    const exists = tools.some(
      (tool) => tool.id === editingTool.id,
    );

    const next = exists
      ? tools.map((tool) =>
          tool.id === editingTool.id
            ? editingTool
            : tool,
        )
      : [...tools, editingTool];

    setTools(next);
    saveLocal(TOOLS_KEY, next);

    setEditingTool(null);
    setSelectedToolType(null);
  }

  function deleteTool(id: string) {
    if (
      !window.confirm(
        "Ali res želiš izbrisati to orodje?",
      )
    ) {
      return;
    }

    const next = tools.filter((tool) => tool.id !== id);

    setTools(next);
    saveLocal(TOOLS_KEY, next);

    const filteredParameters = parameters.filter(
      (parameter) => parameter.toolId !== id,
    );

    setParameters(filteredParameters);
    saveLocal(PARAMETERS_KEY, filteredParameters);
  }

  function createNewMaterial() {
    setEditingMaterial({
      id: createId("material"),
      name: "",
      vc: 100,
      fz: 0.05,
    });
  }

  function saveMaterial() {
    if (!editingMaterial) {
      return;
    }

    if (!editingMaterial.name.trim()) {
      alert("Vnesi ime materiala.");
      return;
    }

    const exists = materials.some(
      (material) =>
        material.id === editingMaterial.id,
    );

    const next = exists
      ? materials.map((material) =>
          material.id === editingMaterial.id
            ? editingMaterial
            : material,
        )
      : [...materials, editingMaterial];

    setMaterials(next);
    saveLocal(MATERIALS_KEY, next);
    setEditingMaterial(null);
  }

  function deleteMaterial(id: string) {
    if (
      !window.confirm(
        "Ali res želiš izbrisati ta material?",
      )
    ) {
      return;
    }

    const next = materials.filter(
      (material) => material.id !== id,
    );

    setMaterials(next);
    saveLocal(MATERIALS_KEY, next);

    const filteredParameters = parameters.filter(
      (parameter) => parameter.materialId !== id,
    );

    setParameters(filteredParameters);
    saveLocal(PARAMETERS_KEY, filteredParameters);
  }

  function createNewOperation() {
    setEditingOperation({
      id: createId("operation"),
      name: "",
      code: `custom-${Date.now()}`,
      description: "",
    });
  }

  function saveOperation() {
    if (!editingOperation) {
      return;
    }

    if (!editingOperation.name.trim()) {
      alert("Vnesi ime operacije.");
      return;
    }

    const exists = operations.some(
      (operation) =>
        operation.id === editingOperation.id,
    );

    const next = exists
      ? operations.map((operation) =>
          operation.id === editingOperation.id
            ? editingOperation
            : operation,
        )
      : [...operations, editingOperation];

    setOperations(next);
    saveLocal(OPERATIONS_KEY, next);
    setEditingOperation(null);
  }

  function deleteOperation(id: string) {
    if (
      !window.confirm(
        "Ali res želiš izbrisati to operacijo?",
      )
    ) {
      return;
    }

    const next = operations.filter(
      (operation) => operation.id !== id,
    );

    setOperations(next);
    saveLocal(OPERATIONS_KEY, next);

    const filteredParameters = parameters.filter(
      (parameter) => parameter.operationId !== id,
    );

    setParameters(filteredParameters);
    saveLocal(PARAMETERS_KEY, filteredParameters);
  }

  function createNewParameter() {
    if (!selectedTool || !selectedMaterial || !selectedOperation) {
      alert(
        "Najprej izberi orodje, material in operacijo.",
      );
      return;
    }

    const rpm = Math.round(
      calculateReferenceRpm(
        selectedMaterial.vc,
        selectedTool.diameter,
      ),
    );

    const feed = calculateReferenceFeed(
      rpm,
      selectedTool.flutes,
      selectedMaterial.fz,
    );

    setEditingParameter({
      id: createId("parameter"),
      toolId: selectedTool.id,
      materialId: selectedMaterial.id,
      operationId: selectedOperation.id,

      cuttingSpeedVc: selectedMaterial.vc,
      feedPerToothFz: selectedMaterial.fz,

      referenceRpm: rpm,
      referenceFeed: feed,

      radialDepthAe: selectedTool.diameter,
      axialDepthAp: selectedTool.cuttingLength,

      maxRadialDepthAe: selectedTool.diameter,
      maxAxialDepthAp: selectedTool.cuttingLength,

      fullWidthReference:
        selectedOperation.code === "slotting",

      fullFluteReference: true,

      notes: "",
      active: true,
    });
  }

  function saveParameter() {
    if (!editingParameter) {
      return;
    }

    if (editingParameter.cuttingSpeedVc <= 0) {
      alert("Vc mora biti večji od 0.");
      return;
    }

    if (editingParameter.feedPerToothFz <= 0) {
      alert("fz mora biti večji od 0.");
      return;
    }

    const duplicate = parameters.find(
      (parameter) =>
        parameter.toolId === editingParameter.toolId &&
        parameter.materialId ===
          editingParameter.materialId &&
        parameter.operationId ===
          editingParameter.operationId &&
        parameter.id !== editingParameter.id,
    );

    if (duplicate) {
      alert(
        "Za to kombinacijo orodja, materiala in operacije parameter že obstaja.",
      );
      return;
    }

    const exists = parameters.some(
      (parameter) =>
        parameter.id === editingParameter.id,
    );

    const next = exists
      ? parameters.map((parameter) =>
          parameter.id === editingParameter.id
            ? editingParameter
            : parameter,
        )
      : [...parameters, editingParameter];

    setParameters(next);
    saveLocal(PARAMETERS_KEY, next);

    setEditingParameter(null);
  }

  function deleteParameter(id: string) {
    if (
      !window.confirm(
        "Ali res želiš izbrisati ta rezalni parameter?",
      )
    ) {
      return;
    }

    const next = parameters.filter(
      (parameter) => parameter.id !== id,
    );

    setParameters(next);
    saveLocal(PARAMETERS_KEY, next);
  }

  function editParameter(parameter: CncCuttingParameter) {
    setEditingParameter({
      ...parameter,
    });

    setSelectedParameterToolId(parameter.toolId);
    setSelectedParameterMaterialId(
      parameter.materialId,
    );
    setSelectedParameterOperationId(
      parameter.operationId,
    );
  }

  function selectToolType(typeId: string) {
    setSelectedToolType(typeId);

    if (!editingTool) {
      return;
    }

    const definition = getToolType(typeId);

    setEditingTool({
      ...editingTool,
      type: typeId,
      tipAngle:
        typeId === "drill"
          ? editingTool.tipAngle ?? 118
          : undefined,
      cornerRadius:
        definition?.id === "ball_end_mill"
          ? editingTool.diameter / 2
          : editingTool.cornerRadius,
    });
  }

  if (!isMainAdministrator) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-xl font-bold text-amber-900">
          Kalkulator CNC
        </h2>

        <p className="mt-2 text-sm text-amber-800">
          Nastavitve kalkulatorja lahko spreminja samo
          glavni administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          CNC kalkulator
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Upravljanje orodij, materialov, operacij in
          referenčnih rezalnih parametrov.
        </p>
      </div>

      {/* =====================================================
          NAVIGACIJA
          ===================================================== */}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSection("tools")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            activeSection === "tools"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Orodja
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("materials")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            activeSection === "materials"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Materiali
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("operations")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            activeSection === "operations"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Operacije
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("parameters")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            activeSection === "parameters"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rezalni parametri
        </button>
      </div>

      {/* =====================================================
          ORODJA
          ===================================================== */}

      {activeSection === "tools" && (
        <section className="space-y-5">
          {!editingTool ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Knjižnica orodij
                  </h2>

                  <p className="text-sm text-slate-500">
                    Vsako konkretno orodje ima svojo geometrijo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={createNewTool}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  + Dodaj orodje
                </button>
              </div>

              {tools.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                  Še ni dodanih konkretnih orodij.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {tools.map((tool) => {
                    const type = getToolType(tool.type);

                    return (
                      <div
                        key={tool.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="flex h-52 items-center justify-center bg-slate-50">
                          <CncToolGraphic
                            type={tool.type}
                            diameter={tool.diameter}
                            cuttingLength={
                              tool.cuttingLength
                            }
                            fluteLength={tool.fluteLength}
                            overallLength={
                              tool.overallLength
                            }
                            cornerRadius={
                              tool.cornerRadius
                            }
                            tipAngle={tool.tipAngle}
                          />
                        </div>

                        <div className="p-4">
                          <div className="text-base font-bold text-slate-900">
                            {tool.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {type?.name ?? tool.type}
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">
                                Ø
                              </span>{" "}
                              <strong>
                                {formatNumber(
                                  tool.diameter,
                                )}{" "}
                                mm
                              </strong>
                            </div>

                            <div>
                              <span className="text-slate-500">
                                Z
                              </span>{" "}
                              <strong>
                                {tool.flutes}
                              </strong>
                            </div>

                            <div>
                              <span className="text-slate-500">
                                Material
                              </span>{" "}
                              <strong>
                                {tool.toolMaterial}
                              </strong>
                            </div>

                            <div>
                              <span className="text-slate-500">
                                Prevleka
                              </span>{" "}
                              <strong>
                                {tool.coating}
                              </strong>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTool({
                                  ...tool,
                                });
                                setSelectedToolType(
                                  tool.type,
                                );
                              }}
                              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                            >
                              Uredi
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteTool(tool.id)
                              }
                              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                              Izbriši
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingTool.name
                      ? "Uredi orodje"
                      : "Novo orodje"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Najprej izberi tip orodja.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetToolEditor}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Nazaj
                </button>
              </div>

              <CncToolTypeSelector
                selectedTypeId={
                  selectedToolType ?? editingTool.type
                }
                onSelect={selectToolType}
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900">
                    Geometrija orodja
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ime orodja
                    </label>

                    <input
                      value={editingTool.name}
                      onChange={(event) =>
                        setEditingTool({
                          ...editingTool,
                          name: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="npr. Ø10 VHM 4Z AlTiN"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      label="Premer D [mm]"
                      value={editingTool.diameter}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          diameter: value,
                        })
                      }
                    />

                    <NumberInput
                      label="Držalo Ø [mm]"
                      value={editingTool.shankDiameter}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          shankDiameter: value,
                        })
                      }
                    />

                    <NumberInput
                      label="Število zob Z"
                      value={editingTool.flutes}
                      step={1}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          flutes: Math.max(
                            1,
                            Math.round(value),
                          ),
                        })
                      }
                    />

                    <NumberInput
                      label="Dolžina rezanja [mm]"
                      value={editingTool.cuttingLength}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          cuttingLength: value,
                        })
                      }
                    />

                    <NumberInput
                      label="Dolžina zob [mm]"
                      value={editingTool.fluteLength}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          fluteLength: value,
                        })
                      }
                    />

                    <NumberInput
                      label="Skupna dolžina [mm]"
                      value={editingTool.overallLength}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          overallLength: value,
                        })
                      }
                    />

                    <NumberInput
                      label="Radij R [mm]"
                      value={editingTool.cornerRadius}
                      onChange={(value) =>
                        setEditingTool({
                          ...editingTool,
                          cornerRadius: value,
                        })
                      }
                    />

                    {editingTool.type === "drill" && (
                      <NumberInput
                        label="Konica [°]"
                        value={editingTool.tipAngle ?? 118}
                        onChange={(value) =>
                          setEditingTool({
                            ...editingTool,
                            tipAngle: value,
                          })
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Material orodja *
                    </label>

                    <select
                      value={editingTool.toolMaterial}
                      onChange={(event) =>
                        setEditingTool({
                          ...editingTool,
                          toolMaterial:
                            event.target
                              .value as ToolMaterial,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    >
                      {TOOL_MATERIALS.map((material) => (
                        <option
                          key={material}
                          value={material}
                        >
                          {material}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Prevleka
                    </label>

                    <select
                      value={editingTool.coating}
                      onChange={(event) =>
                        setEditingTool({
                          ...editingTool,
                          coating: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    >
                      {COATINGS.map((coating) => (
                        <option
                          key={coating}
                          value={coating}
                        >
                          {coating}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={saveTool}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Shrani orodje
                  </button>
                </div>

                <ToolGeometryPreview
                  tool={editingTool}
                />
              </div>
            </>
          )}
        </section>
      )}

      {/* =====================================================
          MATERIALI
          ===================================================== */}

      {activeSection === "materials" && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Materiali obdelovanca
              </h2>

              <p className="text-sm text-slate-500">
                Osnovne referenčne vrednosti za Vc in fz.
              </p>
            </div>

            <button
              type="button"
              onClick={createNewMaterial}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              + Dodaj material
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {material.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Vc {formatNumber(material.vc)} m/min
                      {" · "}
                      fz {formatNumber(material.fz, 3)} mm/zob
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMaterial({
                          ...material,
                        })
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                    >
                      Uredi
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMaterial(material.id)
                      }
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                    >
                      Izbriši
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {editingMaterial && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-bold text-slate-900">
                Uredi material
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ime
                  </label>

                  <input
                    value={editingMaterial.name}
                    onChange={(event) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>

                <NumberInput
                  label="Vc [m/min]"
                  value={editingMaterial.vc}
                  onChange={(value) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      vc: value,
                    })
                  }
                />

                <NumberInput
                  label="fz [mm/zob]"
                  value={editingMaterial.fz}
                  step={0.001}
                  onChange={(value) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      fz: value,
                    })
                  }
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={saveMaterial}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Shrani
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingMaterial(null)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold"
                >
                  Prekliči
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          OPERACIJE
          ===================================================== */}

      {activeSection === "operations" && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Operacije
              </h2>

              <p className="text-sm text-slate-500">
                Način obdelave, za katerega določamo parametre.
              </p>
            </div>

            <button
              type="button"
              onClick={createNewOperation}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              + Dodaj operacijo
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-center rounded-xl bg-slate-50 py-3 text-slate-700">
                  <OperationGraphic operation={operation} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  {operation.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {operation.description}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingOperation({
                        ...operation,
                      })
                    }
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                  >
                    Uredi
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteOperation(operation.id)
                    }
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                  >
                    Izbriši
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingOperation && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-bold text-slate-900">
                Uredi operacijo
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ime
                  </label>

                  <input
                    value={editingOperation.name}
                    onChange={(event) =>
                      setEditingOperation({
                        ...editingOperation,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Opis
                  </label>

                  <input
                    value={editingOperation.description}
                    onChange={(event) =>
                      setEditingOperation({
                        ...editingOperation,
                        description:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={saveOperation}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Shrani
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingOperation(null)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold"
                >
                  Prekliči
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          REZALNI PARAMETRI
          ===================================================== */}

      {activeSection === "parameters" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Rezalni parametri
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Referenčni parametri za konkretno kombinacijo
              orodja, materiala in operacije.
            </p>
          </div>

          {/* IZBIRA KOMBINACIJE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">
              Nova kombinacija
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Orodje
                </label>

                <select
                  value={selectedParameterToolId}
                  onChange={(event) =>
                    setSelectedParameterToolId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="">
                    Izberi orodje
                  </option>

                  {tools.map((tool) => (
                    <option
                      key={tool.id}
                      value={tool.id}
                    >
                      {tool.name} — Ø
                      {formatNumber(tool.diameter)} Z
                      {tool.flutes}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Material
                </label>

                <select
                  value={selectedParameterMaterialId}
                  onChange={(event) =>
                    setSelectedParameterMaterialId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="">
                    Izberi material
                  </option>

                  {materials.map((material) => (
                    <option
                      key={material.id}
                      value={material.id}
                    >
                      {material.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Operacija
                </label>

                <select
                  value={selectedParameterOperationId}
                  onChange={(event) =>
                    setSelectedParameterOperationId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="">
                    Izberi operacijo
                  </option>

                  {operations.map((operation) => (
                    <option
                      key={operation.id}
                      value={operation.id}
                    >
                      {operation.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={createNewParameter}
              disabled={
                !selectedTool ||
                !selectedMaterial ||
                !selectedOperation
              }
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Dodaj rezalne parametre
            </button>
          </div>

          {/* UREJANJE PARAMETRA */}

          {editingParameter && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Rezalni parametri
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {tools.find(
                      (tool) =>
                        tool.id ===
                        editingParameter.toolId,
                    )?.name ?? "Orodje"}{" "}
                    ×{" "}
                    {materials.find(
                      (material) =>
                        material.id ===
                        editingParameter.materialId,
                    )?.name ?? "Material"}{" "}
                    ×{" "}
                    {operations.find(
                      (operation) =>
                        operation.id ===
                        editingParameter.operationId,
                    )?.name ?? "Operacija"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <NumberInput
                  label="Vc [m/min]"
                  value={
                    editingParameter.cuttingSpeedVc
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      cuttingSpeedVc: value,
                      referenceRpm: Math.round(
                        calculateReferenceRpm(
                          value,
                          selectedTool?.diameter ??
                            tools.find(
                              (tool) =>
                                tool.id ===
                                editingParameter.toolId,
                            )?.diameter ??
                            0,
                        ),
                      ),
                    })
                  }
                />

                <NumberInput
                  label="fz [mm/zob]"
                  value={
                    editingParameter.feedPerToothFz
                  }
                  step={0.001}
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      feedPerToothFz: value,
                      referenceFeed:
                        calculateReferenceFeed(
                          editingParameter.referenceRpm,
                          selectedTool?.flutes ??
                            tools.find(
                              (tool) =>
                                tool.id ===
                                editingParameter.toolId,
                            )?.flutes ??
                            1,
                          value,
                        ),
                    })
                  }
                />

                <NumberInput
                  label="Referenčni RPM"
                  value={
                    editingParameter.referenceRpm
                  }
                  step={1}
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      referenceRpm: value,
                      referenceFeed:
                        calculateReferenceFeed(
                          value,
                          selectedTool?.flutes ??
                            tools.find(
                              (tool) =>
                                tool.id ===
                                editingParameter.toolId,
                            )?.flutes ??
                            1,
                          editingParameter.feedPerToothFz,
                        ),
                    })
                  }
                />

                <NumberInput
                  label="Referenčni Feed [mm/min]"
                  value={
                    editingParameter.referenceFeed
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      referenceFeed: value,
                    })
                  }
                />

                <NumberInput
                  label="ae [mm]"
                  value={
                    editingParameter.radialDepthAe
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      radialDepthAe: value,
                    })
                  }
                />

                <NumberInput
                  label="ap [mm]"
                  value={
                    editingParameter.axialDepthAp
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      axialDepthAp: value,
                    })
                  }
                />

                <NumberInput
                  label="Max ae [mm]"
                  value={
                    editingParameter.maxRadialDepthAe
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      maxRadialDepthAe: value,
                    })
                  }
                />

                <NumberInput
                  label="Max ap [mm]"
                  value={
                    editingParameter.maxAxialDepthAp
                  }
                  onChange={(value) =>
                    setEditingParameter({
                      ...editingParameter,
                      maxAxialDepthAp: value,
                    })
                  }
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input
                    type="checkbox"
                    checked={
                      editingParameter.fullWidthReference
                    }
                    onChange={(event) =>
                      setEditingParameter({
                        ...editingParameter,
                        fullWidthReference:
                          event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      Polna širina orodja
                    </div>

                    <div className="text-xs text-slate-500">
                      Referenca velja za polni ae.
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input
                    type="checkbox"
                    checked={
                      editingParameter.fullFluteReference
                    }
                    onChange={(event) =>
                      setEditingParameter({
                        ...editingParameter,
                        fullFluteReference:
                          event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <div>
                    <div className="text-sm font-semibold">
                      Polno število zob
                    </div>

                    <div className="text-xs text-slate-500">
                      Referenca uporablja vse zobe orodja.
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">
                  Opombe
                </label>

                <textarea
                  value={editingParameter.notes}
                  onChange={(event) =>
                    setEditingParameter({
                      ...editingParameter,
                      notes: event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  placeholder="npr. priporočeno za stabilno vpenjanje..."
                />
              </div>

              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingParameter.active}
                  onChange={(event) =>
                    setEditingParameter({
                      ...editingParameter,
                      active: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Parameter je aktiven
                </span>
              </label>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveParameter}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white"
                >
                  Shrani parametre
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingParameter(null)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold"
                >
                  Prekliči
                </button>
              </div>
            </div>
          )}

          {/* SEZNAM PARAMETROV */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="font-bold text-slate-900">
                Shranjeni parametri
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Vsaka kombinacija orodje × material ×
                operacija ima svoj zapis.
              </p>
            </div>

            {parameters.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Še ni shranjenih rezalnih parametrov.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {parameters.map((parameter) => {
                  const tool = tools.find(
                    (item) =>
                      item.id === parameter.toolId,
                  );

                  const material = materials.find(
                    (item) =>
                      item.id ===
                      parameter.materialId,
                  );

                  const operation = operations.find(
                    (item) =>
                      item.id ===
                      parameter.operationId,
                  );

                  return (
                    <div
                      key={parameter.id}
                      className="p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-900">
                            {tool?.name ??
                              "Neznano orodje"}
                          </div>

                          <div className="mt-1 text-sm text-slate-500">
                            {material?.name ??
                              "Neznan material"}{" "}
                            ×{" "}
                            {operation?.name ??
                              "Neznana operacija"}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              editParameter(
                                parameter,
                              )
                            }
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                          >
                            Uredi
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteParameter(
                                parameter.id,
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                          >
                            Izbriši
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <ParameterValue
                          label="Vc"
                          value={`${formatNumber(
                            parameter.cuttingSpeedVc,
                          )} m/min`}
                        />

                        <ParameterValue
                          label="fz"
                          value={`${formatNumber(
                            parameter.feedPerToothFz,
                            3,
                          )} mm/zob`}
                        />

                        <ParameterValue
                          label="RPM"
                          value={formatNumber(
                            parameter.referenceRpm,
                            0,
                          )}
                        />

                        <ParameterValue
                          label="Feed"
                          value={`${formatNumber(
                            parameter.referenceFeed,
                            0,
                          )} mm/min`}
                        />

                        <ParameterValue
                          label="ae"
                          value={`${formatNumber(
                            parameter.radialDepthAe,
                          )} mm`}
                        />

                        <ParameterValue
                          label="ap"
                          value={`${formatNumber(
                            parameter.axialDepthAp,
                          )} mm`}
                        />

                        <ParameterValue
                          label="Max ae"
                          value={`${formatNumber(
                            parameter.maxRadialDepthAe,
                          )} mm`}
                        />

                        <ParameterValue
                          label="Max ap"
                          value={`${formatNumber(
                            parameter.maxAxialDepthAp,
                          )} mm`}
                        />
                      </div>

                      {(parameter.fullWidthReference ||
                        parameter.fullFluteReference ||
                        parameter.notes) && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                          <div className="flex flex-wrap gap-2">
                            {parameter.fullWidthReference && (
                              <span className="rounded-lg bg-white px-2 py-1">
                                Polna širina
                              </span>
                            )}

                            {parameter.fullFluteReference && (
                              <span className="rounded-lg bg-white px-2 py-1">
                                Polno število zob
                              </span>
                            )}
                          </div>

                          {parameter.notes && (
                            <p className="mt-2">
                              {parameter.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function NumberInput({
  label,
  value,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
      />
    </div>
  );
}

function ParameterValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs text-slate-500">
        {label}
      </div>

      <div className="mt-1 font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
