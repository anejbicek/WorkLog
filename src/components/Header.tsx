import { useEffect, useState } from "react";
import Logo from "./Logo";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { supabase } from "../services/supabase";
import { useAdmin } from "../context/AdminContext";

function Header() {
  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const [userName, setUserName] =
    useState("Uporabnik");

  const { users } = useAdmin();

  useEffect(() => {
    const loadUserName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setUserName("Uporabnik");
        return;
      }

      const adminUser = users.find(
        (adminUser) =>
          adminUser.email.toLowerCase() ===
          user.email!.toLowerCase()
      );

      if (adminUser) {
        setUserName(adminUser.name);
      } else {
        setUserName(user.email);
      }
    };

    loadUserName();
  }, [users]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      style={{
        height: "110px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        borderBottom:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          padding: "0 25px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* LEVA STRAN – LOGO + NAPIS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* LOGO */}

          <div
            style={{
              width: "82px",
              height: "82px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              flexShrink: 0,
              marginTop: "17px",
            }}
          >
            <Logo />
          </div>

          {/* NAPIS */}

          <div
            style={{
              marginLeft: "10px",
              display: "flex",
              flexDirection:
                "column",
              justifyContent:
                "center",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                lineHeight: "1",
                fontWeight: 700,
                color: "#17465d",
                letterSpacing:
                  "-0.5px",
              }}
            >
              ŽustAI
            </div>

            <div
              style={{
                marginTop: "-10px",
                fontSize: "21px",
                lineHeight: "2",
                fontWeight: 400,
                color: "#5b7180",
              }}
            >
              WorkLog
            </div>
          </div>
        </div>

        {/* DESNA STRAN – ISKANJE + UPORABNIK */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginLeft: "auto",
          }}
        >
          {/* ISKANJE */}

          <div
            style={{
              width: "280px",
              height: "42px",
              border:
                "1px solid #d1d5db",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "0 13px",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          >
            <Search
              size={19}
              color="#64748b"
            />

            <input
              type="text"
              placeholder="Išči..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                marginLeft: "9px",
                fontSize: "14px",
                color: "#334155",
                background:
                  "transparent",
              }}
            />
          </div>

          {/* UPORABNIK */}

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              onClick={() =>
                setUserMenuOpen(
                  !userMenuOpen
                )
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#334155",
                background:
                  "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {/* IKONA */}

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background:
                    "#e6eef2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                <User
                  size={19}
                  color="#17465d"
                />
              </div>

              {/* IME + PROJEKTI */}

              <div
                style={{
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {userName}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Projekti
                </div>
              </div>

              <ChevronDown
                size={16}
                color="#64748b"
                style={{
                  marginLeft: "2px",
                }}
              />
            </button>

            {/* SPUSTNI MENI */}

            {userMenuOpen && (
              <div
                style={{
                  position:
                    "absolute",
                  top: "52px",
                  right: 0,
                  width: "180px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={
                    handleLogout
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "10px",
                    padding:
                      "13px 15px",
                    border: "none",
                    background:
                      "#ffffff",
                    color: "#c62828",
                    fontSize: "14px",
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                  }}
                  onMouseEnter={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      "#fff5f5";
                  }}
                  onMouseLeave={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      "#ffffff";
                  }}
                >
                  <LogOut size={18} />

                  <span>
                    Odjava
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;