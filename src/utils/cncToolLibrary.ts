export type CncToolVisualDefinition = {
  code: string;
  name: string;
  description: string;
  category: string;
  imagePath: string;
  geometryPath: string;
};

const thumbnail = (file: string) =>
  `/cnc-tools/thumbnails/${file}.jpg`;

const geometry = (file: string) =>
  `/cnc-tools/geometry/${file}.jpg`;

export const CNC_TOOL_VISUALS: CncToolVisualDefinition[] = [
  {
    code: "face_mill",
    name: "Frezalna glava",
    description: "Čelno rezkalo z izmenljivimi ploščicami.",
    category: "Čelna rezkala",
    imagePath: thumbnail("face-mill"),
    geometryPath: geometry("face-mill"),
  },
  {
    code: "end_mill_flat",
    name: "Steblasti rezkar",
    description: "Standardni čelni rezkar z ravnim dnom.",
    category: "Rezkarji",
    imagePath: thumbnail("end-mill-flat"),
    geometryPath: geometry("end-mill-flat"),
  },
  {
    code: "ball_end_mill",
    name: "Kroglasti rezkar",
    description: "Rezkar s kroglastim čelnim delom.",
    category: "Rezkarji",
    imagePath: thumbnail("ball-end-mill"),
    geometryPath: thumbnail("ball-end-mill"),
  },
  {
    code: "bull_nose_end_mill",
    name: "Torusni rezkar",
    description: "Rezkar z radijem na spodnjem robu.",
    category: "Rezkarji",
    imagePath: thumbnail("bull-nose"),
    geometryPath: thumbnail("bull-nose"),
  },
  {
    code: "lollipop",
    name: "Lollipop rezkar",
    description: "Rezkar s kroglasto ali segmentno rezalno glavo.",
    category: "Rezkarji",
    imagePath: thumbnail("lollipop"),
    geometryPath: thumbnail("lollipop"),
  },
  {
    code: "t_slot_cutter",
    name: "T-rezkar",
    description: "Rezkar za izdelavo T-utora.",
    category: "Specialna orodja",
    imagePath: thumbnail("t-slot"),
    geometryPath: thumbnail("t-slot"),
  },
  {
    code: "dovetail_cutter",
    name: "Lastovičji rep",
    description: "Kotno rezkalo za lastovičje repe.",
    category: "Specialna orodja",
    imagePath: thumbnail("dovetail"),
    geometryPath: thumbnail("dovetail"),
  },
  {
    code: "thread_mill",
    name: "Navojni rezkar",
    description: "Rezkalo za izdelavo notranjih in zunanjih navojev.",
    category: "Specialna orodja",
    imagePath: thumbnail("thread-mill"),
    geometryPath: thumbnail("thread-mill"),
  },
  {
    code: "drill",
    name: "Sveder",
    description: "Standardni spiralni sveder.",
    category: "Vrtalna orodja",
    imagePath: thumbnail("twist-drill"),
    geometryPath: geometry("twist-drill"),
  },
  {
    code: "gun_drill",
    name: "Topovski sveder",
    description: "Sveder za globoke luknje z notranjim hlajenjem.",
    category: "Vrtalna orodja",
    imagePath: thumbnail("gun-drill"),
    geometryPath: geometry("gun-drill"),
  },
  {
    code: "center_drill",
    name: "Centrirni sveder",
    description: "Kratko orodje za izdelavo centrirne luknje.",
    category: "Vrtalna orodja",
    imagePath: thumbnail("center-drill"),
    geometryPath: thumbnail("center-drill"),
  },
  {
    code: "step_drill",
    name: "Stopničasti sveder",
    description: "Večpremerno stopničasto vrtalno orodje.",
    category: "Vrtalna orodja",
    imagePath: thumbnail("step-drill"),
    geometryPath: thumbnail("step-drill"),
  },
  {
    code: "reamer",
    name: "Povrtalo",
    description: "Večrezno orodje za fino obdelavo izvrtine.",
    category: "Vrtalna orodja",
    imagePath: thumbnail("reamer"),
    geometryPath: thumbnail("reamer"),
  },
  {
    code: "countersink",
    name: "Vgrezilo",
    description: "Orodje za izdelavo stožčastih vgrezov.",
    category: "Specialna orodja",
    imagePath: thumbnail("countersink"),
    geometryPath: thumbnail("countersink"),
  },
  {
    code: "chamfer_mill",
    name: "Posnemalno rezkalo",
    description: "Orodje za posnemanje robov.",
    category: "Specialna orodja",
    imagePath: thumbnail("countersink"),
    geometryPath: thumbnail("countersink"),
  },
  {
    code: "slot_mill",
    name: "Rezkalo za utore",
    description: "Ozko rezkalo za izdelavo utorov.",
    category: "Rezkarji",
    imagePath: thumbnail("t-slot"),
    geometryPath: thumbnail("t-slot"),
  },
  {
    code: "tapered_end_mill",
    name: "Stožčasto rezkalo",
    description: "Rezkar s stožčasto delovno geometrijo.",
    category: "Rezkarji",
    imagePath: thumbnail("bull-nose"),
    geometryPath: thumbnail("bull-nose"),
  },
  {
    code: "angular_mill",
    name: "Kotno rezkalo",
    description: "Rezkalo za kotne površine.",
    category: "Specialna orodja",
    imagePath: thumbnail("dovetail"),
    geometryPath: thumbnail("dovetail"),
  },
  {
    code: "custom_mill",
    name: "Drugo / po meri",
    description: "Poljubno specialno orodje.",
    category: "Drugo",
    imagePath: thumbnail("end-mill-flat"),
    geometryPath: thumbnail("end-mill-flat"),
  },
];

export function getCncToolVisual(code: string) {
  return (
    CNC_TOOL_VISUALS.find(
      (tool) => tool.code === code,
    ) ?? null
  );
}
