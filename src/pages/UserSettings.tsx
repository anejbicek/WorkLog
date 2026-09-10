import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  Lock,
  User,
  Mail,
  Save,
  Moon,
  Camera,
  Trash2,
} from "lucide-react";

import { supabase } from "../services/supabase";
import { useAdmin } from "../context/AdminContext";
import { useTheme, type ThemeMode } from "../context/ThemeContext";

function UserSettings() {
  const { settings: adminSettings } = useAdmin();
  const {
    themeMode,
    userThemeSettings,
    saveUserThemeSettings,
  } = useTheme();
  const [
    userEmail,
    setUserEmail,
  ] = useState("");

  const [
    userName,
    setUserName,
  ] = useState("");

  const [
    profileImage,
    setProfileImage,
  ] = useState("");

  const [
    profileImageChanged,
    setProfileImageChanged,
  ] = useState(false);

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    themeModeForm,
    setThemeModeForm,
  ] = useState<ThemeMode>("automatic");

  const [
    manualNightStart,
    setManualNightStart,
  ] = useState("22:00");

  const [
    manualNightEnd,
    setManualNightEnd,
  ] = useState("06:00");

  /* =========================================================
     NALOŽI UPORABNIKA
  ========================================================= */

  useEffect(() => {
    const loadUser =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const email =
          user.email ?? "";

        setUserEmail(
          email
        );

        const savedProfileImage =
          typeof user.user_metadata?.avatar_url ===
          "string"
            ? user.user_metadata.avatar_url
            : "";

        setProfileImage(
          savedProfileImage
        );

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("users")
            .select("username")
            .eq(
              "auth_user_id",
              user.id
            )
            .maybeSingle();

        if (
          !profileError &&
          profile?.username
        ) {
          setUserName(
            profile.username
          );
        } else if (email) {
          const {
            data: emailProfile,
          } =
            await supabase
              .from("users")
              .select("username")
              .eq(
                "email",
                email
              )
              .maybeSingle();

          setUserName(
            emailProfile?.username ??
              ""
          );
        }

        setLoading(false);
      };

    void loadUser();
  }, []);

  useEffect(() => {
    setThemeModeForm(themeMode);
    setManualNightStart(
      userThemeSettings.manualNightStart ||
        adminSettings.nightStart
    );
    setManualNightEnd(
      userThemeSettings.manualNightEnd ||
        adminSettings.nightEnd
    );
  }, [
    themeMode,
    userThemeSettings.manualNightStart,
    userThemeSettings.manualNightEnd,
    adminSettings.nightStart,
    adminSettings.nightEnd,
  ]);

  /* =========================================================
     PROFILNA SLIKA
  ========================================================= */

  const handleProfileImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Izberi slikovno datoteko."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Slika je prevelika. Največja dovoljena velikost je 5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (typeof result !== "string") {
        setError(
          "Slike ni bilo mogoče naložiti."
        );
        return;
      }

      const image =
        new Image();

      image.onload = () => {
        const maxSize = 400;

        let width =
          image.width;

        let height =
          image.height;

        if (
          width > maxSize ||
          height > maxSize
        ) {
          if (width >= height) {
            height =
              Math.round(
                (height / width) *
                  maxSize
              );
            width =
              maxSize;
          } else {
            width =
              Math.round(
                (width / height) *
                  maxSize
              );
            height =
              maxSize;
          }
        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const context =
          canvas.getContext(
            "2d"
          );

        if (!context) {
          setError(
            "Slike ni bilo mogoče obdelati."
          );
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.82
          );

        setProfileImage(
          compressedImage
        );

        setProfileImageChanged(
          true
        );

        setError("");
        setMessage("");
      };

      image.onerror = () => {
        setError(
          "Slike ni bilo mogoče naložiti."
        );
      };

      image.src =
        result;
    };

    reader.onerror = () => {
      setError(
        "Slike ni bilo mogoče naložiti."
      );
    };

    reader.readAsDataURL(
      file
    );

    event.target.value = "";
  };

  const removeProfileImage = () => {
    setProfileImage("");
    setProfileImageChanged(
      true
    );
    setError("");
    setMessage("");
  };

  /* =========================================================
     SHRANI
  ========================================================= */

  const handleSave =
    async () => {
      setError("");
      setMessage("");

      if (!userName.trim()) {
        setError(
          "Uporabniško ime je obvezno."
        );

        return;
      }

      if (
        newPassword ||
        confirmPassword
      ) {
        if (
          newPassword.length <
          4
        ) {
          setError(
            "Geslo mora imeti najmanj 4 znake."
          );

          return;
        }

        if (
          newPassword !==
          confirmPassword
        ) {
          setError(
            "Gesli se ne ujemata."
          );

          return;
        }
      }

      setSaving(true);

      try {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          setError(
            "Uporabnik ni prijavljen."
          );

          setSaving(false);
          return;
        }

        const normalizedUsername =
          userName
            .trim()
            .toLowerCase();

        /* ===================================================
           SHRANI UPORABNIŠKO IME
        =================================================== */

        const {
          data: updatedProfiles,
          error: profileError,
        } =
          await supabase
            .from("users")
            .update({
              username:
                normalizedUsername,
            })
            .eq(
              "auth_user_id",
              user.id
            )
            .select("id")
            .maybeSingle();

        if (profileError) {
          if (
            profileError.code ===
            "23505"
          ) {
            setError(
              "To uporabniško ime je že zasedeno."
            );

            setSaving(false);
            return;
          }

          setError(
            profileError.message
          );

          setSaving(false);
          return;
        }

        /*
         * Če uporabnik še nima povezave z auth_user_id,
         * poiščemo zapis po e-pošti.
         */

        if (!updatedProfiles) {
          const {
            data: emailProfile,
            error:
              emailProfileError,
          } =
            await supabase
              .from("users")
              .update({
                username:
                  normalizedUsername,
                auth_user_id:
                  user.id,
              })
              .eq(
                "email",
                user.email ?? ""
              )
              .select("id")
              .maybeSingle();

          if (
            emailProfileError
          ) {
            if (
              emailProfileError.code ===
              "23505"
            ) {
              setError(
                "To uporabniško ime je že zasedeno."
              );
            } else {
              setError(
                emailProfileError.message
              );
            }

            setSaving(false);
            return;
          }

          if (!emailProfile) {
            setError(
              "Uporabniškega profila ni mogoče posodobiti."
            );

            setSaving(false);
            return;
          }
        }

        /* ===================================================
           SINHRONIZACIJA UPORABNIŠKEGA IMENA Z AUTH
        =================================================== */

        const {
          error: metadataError,
        } = await supabase.auth.updateUser({
          data: {
            username: normalizedUsername,
          },
        });

        if (metadataError) {
          setError(
            metadataError.message
          );

          setSaving(false);
          return;
        }

        /* ===================================================
           SPREMEMBA GESLA
        =================================================== */

        if (newPassword) {
          const {
            error:
              passwordError,
          } =
            await supabase.auth.updateUser(
              {
                password:
                  newPassword,
              }
            );

          if (
            passwordError
          ) {
            setError(
              passwordError.message
            );

            setSaving(false);
            return;
          }
        }

        /* ===================================================
           SHRANI PROFILNO SLIKO
        =================================================== */

        if (profileImageChanged) {
          const {
            error:
              avatarError,
          } = await supabase.auth.updateUser({
            data: {
              avatar_url:
                profileImage || null,
            },
          });

          if (avatarError) {
            setError(
              avatarError.message
            );
            setSaving(false);
            return;
          }

          setProfileImageChanged(
            false
          );
        }

        saveUserThemeSettings({
          mode: themeModeForm,
          manualNightStart,
          manualNightEnd,
        });

        setUserName(
          normalizedUsername
        );

        setNewPassword("");
        setConfirmPassword("");

        setMessage(
          "Nastavitve so bile uspešno shranjene."
        );
      } catch {
        setError(
          "Nastavitev ni bilo mogoče shraniti."
        );
      }

      setSaving(false);
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          padding:
            "40px",
          color:
            "#64748b",
        }}
      >
        Nalaganje nastavitev...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth:
          "760px",
        margin:
          "0 auto",
      }}
    >
      {/* NASLOV */}

      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "14px",
          marginBottom:
            "30px",
        }}
      >
        <div
          style={{
            width:
              "46px",
            height:
              "46px",
            borderRadius:
              "12px",
            background:
              "#e6eef2",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <User
            size={24}
            color="#17465d"
          />
        </div>

        <div>
          <h1
            style={{
              margin:
                0,
              fontSize:
                "28px",
              fontWeight:
                700,
              color:
                "#17465d",
            }}
          >
            Nastavitve uporabnika
          </h1>

          <p
            style={{
              margin:
                "5px 0 0",
              color:
                "#64748b",
              fontSize:
                "14px",
            }}
          >
            Upravljaj svoje podatke za prijavo v WorkLog.
          </p>
        </div>
      </div>

      {/* OSEBNI PODATKI */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginBottom:
            "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 22px",
            fontSize:
              "18px",
            color:
              "#334155",
          }}
        >
          Podatki uporabnika
        </h2>

        {/* UPORABNIŠKO IME */}

        <div
          style={{
            marginBottom:
              "20px",
          }}
        >
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Uporabniško ime
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <User
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="text"
              value={
                userName
              }
              onChange={(
                e
              ) =>
                setUserName(
                  e.target.value
                )
              }
              placeholder="Uporabniško ime"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>

          <div
            style={{
              marginTop:
                "7px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            S tem uporabniškim imenom se lahko prijaviš v WorkLog.
          </div>
        </div>

        {/* E-POŠTA */}

        <div>
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            E-pošta
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Mail
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="email"
              value={
                userEmail
              }
              disabled
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#64748b",
                background:
                  "#f8fafc",
              }}
            />
          </div>

          <div
            style={{
              marginTop:
                "7px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            E-poštni naslov se uporablja za prijavo in obnovitev gesla.
          </div>
        </div>
      </div>

      {/* PROFILNA SLIKA */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginBottom:
            "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 8px",
            fontSize:
              "18px",
            color:
              "#334155",
          }}
        >
          Profilna slika
        </h2>

        <p
          style={{
            margin:
              "0 0 22px",
            fontSize:
              "13px",
            color:
              "#64748b",
          }}
        >
          Dodaj svojo profilno sliko. Če je ne dodaš, se uporablja privzeta ikona uporabnika.
        </p>

        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "20px",
          }}
        >
          <div
            style={{
              width:
                "92px",
              height:
                "92px",
              borderRadius:
                "50%",
              overflow:
                "hidden",
              background:
                "#e6eef2",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              flexShrink:
                0,
              border:
                "1px solid #dbe3e8",
            }}
          >
            {profileImage ? (
              <img
                src={
                  profileImage
                }
                alt="Profilna slika"
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  objectFit:
                    "cover",
                }}
              />
            ) : (
              <User
                size={42}
                color="#17465d"
              />
            )}
          </div>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap:
                "9px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                gap:
                  "8px",
                flexWrap:
                  "wrap",
              }}
            >
              <label
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                  padding:
                    "10px 14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "9px",
                  background:
                    "#ffffff",
                  color:
                    "#334155",
                  fontSize:
                    "13px",
                  fontWeight:
                    600,
                  cursor:
                    "pointer",
                }}
              >
                <Camera
                  size={17}
                  color="#17465d"
                />

                Izberi sliko

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleProfileImageChange
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>

              {profileImage && (
                <button
                  type="button"
                  onClick={
                    removeProfileImage
                  }
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap:
                      "8px",
                    padding:
                      "10px 14px",
                    border:
                      "1px solid #fecaca",
                    borderRadius:
                      "9px",
                    background:
                      "#fff5f5",
                    color:
                      "#c62828",
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  <Trash2
                    size={17}
                  />

                  Odstrani
                </button>
              )}
            </div>

            <div
              style={{
                fontSize:
                  "12px",
                color:
                  "#94a3b8",
              }}
            >
              Priporočena je kvadratna slika. Največ 5 MB.
            </div>
          </div>
        </div>
      </div>

      {/* GESLO */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginBottom:
            "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            margin:
              "0 0 8px",
            fontSize:
              "18px",
            color:
              "#334155",
          }}
        >
          Sprememba gesla
        </h2>

        <p
          style={{
            margin:
              "0 0 22px",
            fontSize:
              "13px",
            color:
              "#64748b",
          }}
        >
          Če želiš spremeniti geslo, vpiši novo geslo in ga potrdi.
        </p>

        {/* NOVO GESLO */}

        <div
          style={{
            marginBottom:
              "20px",
          }}
        >
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Novo geslo
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Lock
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="password"
              value={
                newPassword
              }
              onChange={(
                e
              ) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Vpiši novo geslo"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>
        </div>

        {/* POTRDITEV GESLA */}

        <div>
          <label
            style={{
              display:
                "block",
              marginBottom:
                "8px",
              fontSize:
                "14px",
              fontWeight:
                600,
              color:
                "#334155",
            }}
          >
            Ponovi novo geslo
          </label>

          <div
            style={{
              position:
                "relative",
            }}
          >
            <Lock
              size={18}
              color="#64748b"
              style={{
                position:
                  "absolute",
                left:
                  "13px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                e
              ) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Ponovi novo geslo"
              style={{
                width:
                  "100%",
                height:
                  "44px",
                boxSizing:
                  "border-box",
                padding:
                  "0 14px 0 42px",
                border:
                  "1px solid #d1d5db",
                borderRadius:
                  "9px",
                outline:
                  "none",
                fontSize:
                  "14px",
                color:
                  "#334155",
              }}
            />
          </div>

          <div
            style={{
              marginTop:
                "7px",
              fontSize:
                "12px",
              color:
                "#94a3b8",
            }}
          >
            Geslo mora vsebovati najmanj 4 znake.
          </div>
        </div>
      </div>

      {/* NOČNI NAČIN */}

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <Moon size={20} color="#17465d" />
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#334155",
            }}
          >
            Nočni način
          </h2>
        </div>

        <p
          style={{
            margin: "0 0 22px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Izberi, kako naj WorkLog uporablja temni način.
        </p>

        <div style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "flex", cursor: "pointer", alignItems: "flex-start", gap: "12px" }}>
            <input
              type="checkbox"
              checked={themeModeForm === "automatic"}
              onChange={() => setThemeModeForm("automatic")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span>
              <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                Samodejni nočni način
              </span>
              <span style={{ display: "block", marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>
                Uporablja ure, ki jih določi administrator: {adminSettings.nightStart}–{adminSettings.nightEnd}.
              </span>
            </span>
          </label>

          <label style={{ display: "flex", cursor: "pointer", alignItems: "flex-start", gap: "12px" }}>
            <input
              type="checkbox"
              checked={themeModeForm === "manual"}
              onChange={() => setThemeModeForm("manual")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                Ročno nastavljanje nočnega načina
              </span>
              <span style={{ display: "block", marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>
                Uporabi svoj čas začetka in konca nočnega načina.
              </span>
            </span>
          </label>

          {themeModeForm === "manual" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginLeft: "28px",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                  Začetek nočnega načina
                </label>
                <input
                  type="time"
                  value={manualNightStart}
                  onChange={(event) => setManualNightStart(event.target.value)}
                  style={{ width: "100%", height: "42px", boxSizing: "border-box", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#334155" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                  Konec nočnega načina
                </label>
                <input
                  type="time"
                  value={manualNightEnd}
                  onChange={(event) => setManualNightEnd(event.target.value)}
                  style={{ width: "100%", height: "42px", boxSizing: "border-box", padding: "0 12px", border: "1px solid #d1d5db", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#334155" }}
                />
              </div>
            </div>
          )}

          <label style={{ display: "flex", cursor: "pointer", alignItems: "flex-start", gap: "12px" }}>
            <input
              type="checkbox"
              checked={themeModeForm === "always"}
              onChange={() => setThemeModeForm("always")}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span>
              <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                Vedno uporabljaj nočni način
              </span>
              <span style={{ display: "block", marginTop: "3px", fontSize: "12px", color: "#94a3b8" }}>
                WorkLog bo vedno prikazan v temnem načinu, ne glede na uro.
              </span>
            </span>
          </label>
        </div>
      </div>

  {/* SPOROČILA */}

      {error && (
        <div
          style={{
            marginBottom:
              "15px",
            padding:
              "12px 15px",
            borderRadius:
              "9px",
            background:
              "#fff5f5",
            border:
              "1px solid #fecaca",
            color:
              "#c62828",
            fontSize:
              "14px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom:
              "15px",
            padding:
              "12px 15px",
            borderRadius:
              "9px",
            background:
              "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            color:
              "#166534",
            fontSize:
              "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* SHRANI */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
        }}
      >
        <button
          onClick={
            handleSave
          }
          disabled={
            saving
          }
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "9px",
            padding:
              "12px 20px",
            border:
              "none",
            borderRadius:
              "9px",
            background:
              saving
                ? "#94a3b8"
                : "#17465d",
            color:
              "#ffffff",
            fontSize:
              "14px",
            fontWeight:
              600,
            cursor:
              saving
                ? "default"
                : "pointer",
          }}
        >
          <Save size={17} />

          {saving
            ? "Shranjevanje..."
            : "Shrani spremembe"}
        </button>
      </div>
    </div>
  );
}

export default UserSettings;