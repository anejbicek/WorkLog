import {
  Clock3,
  Moon,
  Calendar,
  Star,
  Coffee,
} from "lucide-react";

function HoursSummary() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "20px",
        marginTop: "30px",
      }}
    >
      <HourCard
        icon={<Clock3 size={28} color="#2563eb" />}
        title="Redne ure"
        value="7h 30m"
      />

      <HourCard
        icon={<Moon size={28} color="#334155" />}
        title="Nočne ure"
        value="0h 00m"
      />

      <HourCard
        icon={<Calendar size={28} color="#334155" />}
        title="Nedelja"
        value="0h 00m"
      />

      <HourCard
        icon={<Star size={28} color="#f59e0b" />}
        title="Praznik"
        value="0h 00m"
      />

      <HourCard
        icon={<Coffee size={28} color="#334155" />}
        title="Malica"
        value="0h 30m"
      />

      <HourCard
        icon={<Clock3 size={28} color="#2563eb" />}
        title="Skupaj ur"
        value="7h 00m"
      />
    </div>
  );
}

type HourCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function HourCard({
  icon,
  title,
  value,
}: HourCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      {icon}

      <div>
        <div
          style={{
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#12344d",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default HoursSummary;