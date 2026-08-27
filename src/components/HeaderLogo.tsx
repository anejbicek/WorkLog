function HeaderLogo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* LOGOTIP */}

      <div
        style={{
          width: "82px",
          height: "82px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "10px",
        }}
      >
        <img
          src="/logo.png"
          alt="ŽustAI"
          style={{
            width: "78px",
            height: "78px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* NAPIS */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            lineHeight: "1",
            fontWeight: 700,
            color: "#17465d",
            letterSpacing: "-0.5px",
          }}
        >
          ŽustAI
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "21px",
            lineHeight: "1",
            fontWeight: 400,
            color: "#5b7180",
          }}
        >
          WorkLog
        </div>
      </div>
    </div>
  );
}

export default HeaderLogo;