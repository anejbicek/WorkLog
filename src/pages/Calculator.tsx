import { useEffect, useMemo, useState } from "react";
import { Calculator as CalculatorIcon, RefreshCw } from "lucide-react";

type CncMaterialPreset = {
  id: string;
  name: string;
  cuttingSpeed: number;
  feedPerTooth: number;
};

type CncToolPreset = {
  id: string;
  name: string;
  diameter: number;
  flutes: number;
};

type CncCalculatorConfig = {
  materials: CncMaterialPreset[];
  tools: CncToolPreset[];
  correctionFactors: {
    workholding: number;
    vibration: number;
    thinWall: number;
    plunging: number;
  };
};

type CalculationInput = {
  diameter: number;
  flutes: number;
  cuttingSpeed: number;
  feedPerTooth: number;
  depthOfCut: number;
  widthOfCut: number;
  workholdingFactor: number;
  vibrationFactor: number;
  thinWallFactor: number;
  plungingFactor: number;
  operation: "milling" | "slotting" | "plunging";
};

type CalculationResult = {
  rpm: number;
  feed: number;
  chipLoad: number;
  materialRemovalRate: number;
};

const CNC_CALCULATOR_STORAGE_KEY =
  "zusta_worklog_v2_cnc_calculator";

const CNC_CALCULATOR_EVENT =
  "zusta-cnc-calculator-changed";

const DEFAULT_CNC_CALCULATOR_CONFIG: CncCalculatorConfig = {
  materials: [
    {
      id: "aluminium",
      name: "Aluminij",
      cuttingSpeed: 300,
      feedPerTooth: 0.08,
    },
    {
      id: "steel",
      name: "Jeklo",
      cuttingSpeed: 120,
      feedPerTooth: 0.05,
    },
    {
      id: "stainless",
      name: "Nerjavno jeklo",
      cuttingSpeed: 80,
      feedPerTooth: 0.04,
    },
    {
      id: "cast-iron",
      name: "Lito železo",
      cuttingSpeed: 100,
      feedPerTooth: 0.05,
    },
  ],
  tools: [
    {
      id: "endmill-6",
      name: "Čelni rezkar Ø6",
      diameter: 6,
      flutes: 4,
    },
    {
      id: "endmill-8",
      name: "Čelni rezkar Ø8",
      diameter: 8,
      flutes: 4,
    },
    {
      id: "endmill-10",
      name: "Čelni rezkar Ø10",
      diameter: 10,
      flutes: 4,
    },
    {
      id: "endmill-12",
      name: "Čelni rezkar Ø12",
      diameter: 12,
      flutes: 4,
    },
  ],
  correctionFactors: {
    workholding: 1,
    vibration: 1,
    thinWall: 1,
    plunging: 1,
  },
};

function loadCncCalculatorConfig(): CncCalculatorConfig {
  try {
    const stored = localStorage.getItem(
      CNC_CALCULATOR_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_CNC_CALCULATOR_CONFIG;
    }

    const parsed = JSON.parse(
      stored
    ) as Partial<CncCalculatorConfig>;

    return {
      materials:
        Array.isArray(parsed.materials) &&
        parsed.materials.length > 0
          ? parsed.materials
          : DEFAULT_CNC_CALCULATOR_CONFIG.materials,

      tools:
        Array.isArray(parsed.tools) &&
        parsed.tools.length > 0
          ? parsed.tools
          : DEFAULT_CNC_CALCULATOR_CONFIG.tools,

      correctionFactors: {
        ...DEFAULT_CNC_CALCULATOR_CONFIG.correctionFactors,
        ...(parsed.correctionFactors ?? {}),
      },
    };
  } catch {
    return DEFAULT_CNC_CALCULATOR_CONFIG;
  }
}

function calculateCncParameters(
  input: CalculationInput
): CalculationResult {
  const {
    diameter,
    flutes,
    cuttingSpeed,
    feedPerTooth,
    depthOfCut,
    widthOfCut,
    workholdingFactor,
    vibrationFactor,
    thinWallFactor,
    plungingFactor,
    operation,
  } = input;

  if (
    diameter <= 0 ||
    flutes <= 0 ||
    cuttingSpeed <= 0 ||
    feedPerTooth <= 0
  ) {
    return {
      rpm: 0,
      feed: 0,
      chipLoad: 0,
      materialRemovalRate: 0,
    };
  }

  const rpm =
    (cuttingSpeed * 1000) /
    (Math.PI * diameter);

  let correction =
    workholdingFactor *
    vibrationFactor *
    thinWallFactor;

  if (operation === "plunging") {
    correction *= plungingFactor;
  }

  const correctedChipLoad =
    feedPerTooth * correction;

  const feed =
    rpm *
    flutes *
    correctedChipLoad;

  const effectiveWidth =
    operation === "slotting"
      ? diameter
      : Math.min(
          Math.max(widthOfCut, 0),
          diameter
        );

  const materialRemovalRate =
    (effectiveWidth *
      Math.max(depthOfCut, 0) *
      feed) /
    1000;

  return {
    rpm,
    feed,
    chipLoad: correctedChipLoad,
    materialRemovalRate,
  };
}

function formatNumber(
  value: number,
  digits = 2
) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString(
    "sl-SI",
    {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }
  );
}

function Calculator() {
  const [config, setConfig] =
    useState<CncCalculatorConfig>(() =>
      loadCncCalculatorConfig()
    );

  const [materialId, setMaterialId] =
    useState(
      config.materials[0]?.id ?? ""
    );

  const [toolId, setToolId] =
    useState(
      config.tools[0]?.id ?? ""
    );

  const [operation, setOperation] =
    useState<
      "milling" |
      "slotting" |
      "plunging"
    >("milling");

  const [diameter, setDiameter] =
    useState("");

  const [flutes, setFlutes] =
    useState("");

  const [cuttingSpeed, setCuttingSpeed] =
    useState("");

  const [feedPerTooth, setFeedPerTooth] =
    useState("");

  const [depthOfCut, setDepthOfCut] =
    useState("2");

  const [widthOfCut, setWidthOfCut] =
    useState("3");

  useEffect(() => {
    const refresh = () => {
      setConfig(
        loadCncCalculatorConfig()
      );
    };

    window.addEventListener(
      CNC_CALCULATOR_EVENT,
      refresh
    );

    return () => {
      window.removeEventListener(
        CNC_CALCULATOR_EVENT,
        refresh
      );
    };
  }, []);

  const material = useMemo(
    () =>
      config.materials.find(
        (item: CncMaterialPreset) =>
          item.id === materialId
      ),
    [
      config.materials,
      materialId,
    ]
  );

  const tool = useMemo(
    () =>
      config.tools.find(
        (item: CncToolPreset) =>
          item.id === toolId
      ),
    [
      config.tools,
      toolId,
    ]
  );

  useEffect(() => {
    if (!material) {
      if (config.materials[0]) {
        setMaterialId(
          config.materials[0].id
        );
      }

      return;
    }

    setCuttingSpeed(
      String(
        material.cuttingSpeed
      )
    );

    setFeedPerTooth(
      String(
        material.feedPerTooth
      )
    );
  }, [
    material,
    config.materials,
  ]);

  useEffect(() => {
    if (!tool) {
      if (config.tools[0]) {
        setToolId(
          config.tools[0].id
        );
      }

      return;
    }

    setDiameter(
      String(tool.diameter)
    );

    setFlutes(
      String(tool.flutes)
    );
  }, [
    tool,
    config.tools,
  ]);

  const result = useMemo(
    () =>
      calculateCncParameters({
        diameter: Number(
          diameter
        ),
        flutes: Number(
          flutes
        ),
        cuttingSpeed:
          Number(
            cuttingSpeed
          ),
        feedPerTooth:
          Number(
            feedPerTooth
          ),
        depthOfCut:
          Number(
            depthOfCut
          ),
        widthOfCut:
          Number(
            widthOfCut
          ),
        workholdingFactor:
          config
            .correctionFactors
            .workholding,
        vibrationFactor:
          config
            .correctionFactors
            .vibration,
        thinWallFactor:
          config
            .correctionFactors
            .thinWall,
        plungingFactor:
          config
            .correctionFactors
            .plunging,
        operation,
      }),
    [
      diameter,
      flutes,
      cuttingSpeed,
      feedPerTooth,
      depthOfCut,
      widthOfCut,
      config.correctionFactors,
      operation,
    ]
  );

  const selectMaterial = (
    value: string
  ) => {
    setMaterialId(value);

    const next =
      config.materials.find(
        (item: CncMaterialPreset) =>
          item.id === value
      );

    if (next) {
      setCuttingSpeed(
        String(
          next.cuttingSpeed
        )
      );

      setFeedPerTooth(
        String(
          next.feedPerTooth
        )
      );
    }
  };

  const selectTool = (
    value: string
  ) => {
    setToolId(value);

    const next =
      config.tools.find(
        (item: CncToolPreset) =>
          item.id === value
      );

    if (next) {
      setDiameter(
        String(
          next.diameter
        )
      );

      setFlutes(
        String(
          next.flutes
        )
      );
    }
  };

  const reset = () => {
    const defaultMaterial =
      config.materials[0];

    const defaultTool =
      config.tools[0];

    setMaterialId(
      defaultMaterial?.id ?? ""
    );

    setToolId(
      defaultTool?.id ?? ""
    );

    setOperation(
      "milling"
    );

    setCuttingSpeed(
      defaultMaterial
        ? String(
            defaultMaterial.cuttingSpeed
          )
        : ""
    );

    setFeedPerTooth(
      defaultMaterial
        ? String(
            defaultMaterial.feedPerTooth
          )
        : ""
    );

    setDiameter(
      defaultTool
        ? String(
            defaultTool.diameter
          )
        : ""
    );

    setFlutes(
      defaultTool
        ? String(
            defaultTool.flutes
          )
        : ""
    );

    setDepthOfCut("2");
    setWidthOfCut("3");
  };

  const inputStyle = {
    width: "100%",
    boxSizing:
      "border-box" as const,
    border:
      "1px solid #d1d5db",
    borderRadius: "9px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  };

  const resultCards = [
    [
      "Vrtljaji",
      `${formatNumber(
        result.rpm,
        0
      )} rpm`,
    ],
    [
      "Pomik",
      `${formatNumber(
        result.feed,
        0
      )} mm/min`,
    ],
    [
      "fz – dejanski",
      `${formatNumber(
        result.chipLoad,
        3
      )} mm/zob`,
    ],
    [
      "Vc",
      `${formatNumber(
        Number(
          cuttingSpeed
        ),
        1
      )} m/min`,
    ],
    [
      "MRR",
      `${formatNumber(
        result.materialRemovalRate,
        2
      )} cm³/min`,
    ],
  ];

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "11px",
            }}
          >
            <CalculatorIcon
              size={27}
              color="#17465d"
            />

            <h1
              style={{
                margin: 0,
                color: "#17465d",
                fontSize: "28px",
              }}
            >
              CNC Kalkulator
            </h1>
          </div>

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Izračun osnovnih
            rezalnih parametrov
            za CNC frezanje.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          style={{
            display: "flex",
            alignItems:
              "center",
            gap: "7px",
            border:
              "1px solid #d1d5db",
            background:
              "#ffffff",
            color: "#334155",
            borderRadius: "9px",
            padding:
              "9px 13px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <RefreshCw size={16} />
          Ponastavi
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "20px",
        }}
      >
        <section
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "14px",
            padding:
              "22px",
            boxShadow:
              "0 3px 12px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 18px",
              fontSize:
                "18px",
              color:
                "#1e293b",
            }}
          >
            Vhodni podatki
          </h2>

          <div
            style={{
              display:
                "grid",
              gap:
                "16px",
            }}
          >
            <div>
              <label
                style={
                  labelStyle
                }
              >
                Material
              </label>

              <select
                value={
                  materialId
                }
                onChange={(
                  event
                ) =>
                  selectMaterial(
                    event.target
                      .value
                  )
                }
                style={
                  inputStyle
                }
              >
                {config.materials.map(
                  (
                    item: CncMaterialPreset
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Orodje
              </label>

              <select
                value={
                  toolId
                }
                onChange={(
                  event
                ) =>
                  selectTool(
                    event.target
                      .value
                  )
                }
                style={
                  inputStyle
                }
              >
                {config.tools.map(
                  (
                    item: CncToolPreset
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Vrsta obdelave
              </label>

              <select
                value={
                  operation
                }
                onChange={(
                  event
                ) =>
                  setOperation(
                    event.target
                      .value as
                      | "milling"
                      | "slotting"
                      | "plunging"
                  )
                }
                style={
                  inputStyle
                }
              >
                <option value="milling">
                  Bočno frezanje
                </option>

                <option value="slotting">
                  Polno utorno frezanje
                </option>

                <option value="plunging">
                  Potapljanje orodja
                </option>
              </select>
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Premer orodja
                  [mm]
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    diameter
                  }
                  onChange={(
                    event
                  ) =>
                    setDiameter(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Število rezil
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    flutes
                  }
                  onChange={(
                    event
                  ) =>
                    setFlutes(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Vc [m/min]
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    cuttingSpeed
                  }
                  onChange={(
                    event
                  ) =>
                    setCuttingSpeed(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  fz [mm/zob]
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={
                    feedPerTooth
                  }
                  onChange={(
                    event
                  ) =>
                    setFeedPerTooth(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Globina reza
                  ap [mm]
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    depthOfCut
                  }
                  onChange={(
                    event
                  ) =>
                    setDepthOfCut(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Širina reza
                  ae [mm]
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    widthOfCut
                  }
                  onChange={(
                    event
                  ) =>
                    setWidthOfCut(
                      event.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "14px",
            padding:
              "22px",
            boxShadow:
              "0 3px 12px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 18px",
              fontSize:
                "18px",
              color:
                "#1e293b",
            }}
          >
            Izračunani
            parametri
          </h2>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap:
                "12px",
            }}
          >
            {resultCards.map(
              (
                [title, value]: string[]
              ) => (
                <div
                  key={
                    title
                  }
                  style={{
                    border:
                      "1px solid #dbe5ea",
                    borderRadius:
                      "11px",
                    padding:
                      "16px",
                    background:
                      "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginBottom:
                        "6px",
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "21px",
                      fontWeight:
                        700,
                      color:
                        "#17465d",
                    }}
                  >
                    {value}
                  </div>
                </div>
              )
            )}
          </div>

          <div
            style={{
              marginTop:
                "18px",
              padding:
                "14px",
              borderRadius:
                "10px",
              background:
                "#f1f5f9",
              color:
                "#475569",
              fontSize:
                "13px",
              lineHeight:
                1.5,
            }}
          >
            Korekcije za
            vpetje, vibracije
            in tanke stene se
            uporabljajo glede
            na nastavitve, ki
            jih določi glavni
            administrator.
          </div>
        </section>
      </div>

      <div
        style={{
          marginTop:
            "20px",
          color:
            "#64748b",
          fontSize:
            "12px",
        }}
      >
        Izračun je pripomoček
        za nastavitev začetnih
        parametrov. Končne
        vrednosti je treba
        prilagoditi dejanskemu
        orodju, materialu in
        pogojem obdelave.
      </div>
    </div>
  );
}

export default Calculator;