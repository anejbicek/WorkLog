function WorkOrderActions() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "15px",
        marginTop: "35px",
      }}
    >
      {/* Počisti */}
      <button
        style={{
          padding: "12px 24px",
          border: "1px solid #d1d5db",
          borderRadius: "10px",
          background: "#ffffff",
          color: "#475569",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        Počisti
      </button>

      {/* Dodaj */}
      <button
        style={{
          padding: "12px 26px",
          border: "none",
          borderRadius: "10px",
          background: "#184e43",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        + Dodaj nalog
      </button>
    </div>
  );
}

export default WorkOrderActions;