import { Search } from "lucide-react";

function SearchBar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "260px",
        height: "46px",
        background: "#f8fafc",
        border: "1px solid #dbe3e8",
        borderRadius: "12px",
        padding: "0 16px",
      }}
    >
      <Search
        size={18}
        color="#64748b"
      />

      <input
        type="text"
        placeholder="Išči..."
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "15px",
          color: "#334155",
        }}
      />
    </div>
  );
}

export default SearchBar;