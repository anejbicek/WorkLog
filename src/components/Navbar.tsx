import {
  ClipboardList,
  Clock3,
  BarChart3,
  FileText,
  FolderKanban,
} from "lucide-react";

type Page =
  | "dashboard"
  | "evidenca"
  | "statistika"
  | "pdf";

type NavbarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

function Navbar({
  currentPage,
  onNavigate,
}: NavbarProps) {
  const items = [
    {
      icon: <ClipboardList size={20} />,
      text: "Delovni nalogi",
      page: "dashboard" as const,
    },
    {
      icon: <Clock3 size={20} />,
      text: "Evidenca",
      page: "evidenca" as const,
    },
    {
      icon: <BarChart3 size={20} />,
      text: "Statistika",
      page: "statistika" as const,
    },
    {
      icon: <FileText size={20} />,
      text: "PDF",
      page: "pdf" as const,
    },
  ];

  return (
    <nav
      style={{
        height: "62px",
        background: "#1d526b",
        display: "flex",
        alignItems: "center",
        padding: "0 35px",
        gap: "10px",
        boxSizing: "border-box",
        transform: "translateY(-22px)",
      }}
    >
      {items.map((item) => {
        const active =
          currentPage === item.page;

        return (
          <div
            key={item.text}
            onClick={() =>
              onNavigate(item.page)
            }
            style={{
              height: "62px",
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              gap: "9px",

              color: active
                ? "#17465d"
                : "#ffffff",

              cursor: "pointer",

              fontWeight: 600,
              fontSize: "16px",
              boxSizing: "border-box",

              background: active
                ? "#ffffff"
                : "transparent",

              borderBottom: active
                ? "3px solid #17465d"
                : "3px solid transparent",

              transition:
                "all 0.15s ease",
            }}
          >
            {item.icon}

            <span>
              {item.text}
            </span>
          </div>
        );
      })}

      {/* PROJEKTI */}

      <div
        style={{
          height: "62px",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "16px",
          boxSizing: "border-box",
          cursor: "default",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FolderKanban size={20} />

        <span
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          PROJEKTI
        </span>

        {/* RUMENO-ČRN TRAK */}

        <div
          style={{
            position: "absolute",
            left: "-12px",
            top: "50%",
            width: "145px",
            height: "10px",

            background:
              "repeating-linear-gradient(" +
              "135deg, " +
              "#f4c430 0px, " +
              "#f4c430 10px, " +
              "#222222 10px, " +
              "#222222 20px" +
              ")",

            transform:
              "translateY(-50%) rotate(-12deg)",

            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* V PRIPRAVI */}

        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform:
              "translate(-50%, -50%) rotate(-12deg)",

            color: "#ffffff",
            fontSize: "7px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",

            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          V PRIPRAVI
        </span>
      </div>
    </nav>
  );
}

export default Navbar;