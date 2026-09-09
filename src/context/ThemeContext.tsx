import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../services/supabase";
import { useAdmin } from "./AdminContext";

export type ThemeMode =
  | "automatic"
  | "manual"
  | "always";

export type UserThemeSettings = {
  mode: ThemeMode;
  manualNightStart: string;
  manualNightEnd: string;
};

type ThemeContextType = {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  userThemeSettings: UserThemeSettings;
  setThemeMode: (mode: ThemeMode) => void;
  setManualNightStart: (value: string) => void;
  setManualNightEnd: (value: string) => void;
  saveUserThemeSettings: (
    settings: UserThemeSettings
  ) => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

const DEFAULT_THEME_SETTINGS: UserThemeSettings = {
  mode: "automatic",
  manualNightStart: "22:00",
  manualNightEnd: "06:00",
};

const STORAGE_PREFIX =
  "zusta_worklog_v2_theme_";

function getStorageKey(
  authUserId: string | null
) {
  return authUserId
    ? `${STORAGE_PREFIX}${authUserId}`
    : null;
}

function readUserThemeSettings(
  authUserId: string | null,
  adminNightStart: string,
  adminNightEnd: string
): UserThemeSettings {
  const storageKey =
    getStorageKey(authUserId);

  const defaults: UserThemeSettings = {
    mode: "automatic",
    manualNightStart:
      adminNightStart ||
      DEFAULT_THEME_SETTINGS.manualNightStart,
    manualNightEnd:
      adminNightEnd ||
      DEFAULT_THEME_SETTINGS.manualNightEnd,
  };

  if (!storageKey) {
    return defaults;
  }

  try {
    const saved =
      localStorage.getItem(
        storageKey
      );

    if (!saved) {
      return defaults;
    }

    const parsed =
      JSON.parse(saved) as Partial<UserThemeSettings>;

    const mode =
      parsed.mode === "manual" ||
      parsed.mode === "always" ||
      parsed.mode === "automatic"
        ? parsed.mode
        : "automatic";

    return {
      mode,
      manualNightStart:
        parsed.manualNightStart ||
        defaults.manualNightStart,
      manualNightEnd:
        parsed.manualNightEnd ||
        defaults.manualNightEnd,
    };
  } catch {
    return defaults;
  }
}

function timeToMinutes(
  value: string
) {
  const [
    hours,
    minutes,
  ] = value
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return 0;
  }

  return hours * 60 + minutes;
}

function isWithinNightPeriod(
  start: string,
  end: string,
  now = new Date()
) {
  const startMinutes =
    timeToMinutes(start);

  const endMinutes =
    timeToMinutes(end);

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  /*
   * Enak začetek in konec pomeni,
   * da časovni interval ni veljaven
   * in se samodejni način ne vklopi.
   */
  if (
    startMinutes ===
    endMinutes
  ) {
    return false;
  }

  /*
   * Obdobje čez polnoč:
   * npr. 22:00–06:00.
   */
  if (
    startMinutes >
    endMinutes
  ) {
    return (
      currentMinutes >=
        startMinutes ||
      currentMinutes <
        endMinutes
    );
  }

  /*
   * Obdobje znotraj istega dne:
   * npr. 08:00–16:00.
   */
  return (
    currentMinutes >=
      startMinutes &&
    currentMinutes <
      endMinutes
  );
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const {
    settings: adminSettings,
  } = useAdmin();

  const [
    authUserId,
    setAuthUserId,
  ] = useState<
    string | null
  >(null);

  const [
    userThemeSettings,
    setUserThemeSettings,
  ] =
    useState<UserThemeSettings>(
      () =>
        readUserThemeSettings(
          null,
          adminSettings.nightStart,
          adminSettings.nightEnd
        )
    );

  const loadThemeForCurrentUser =
    async () => {
      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      const nextAuthUserId =
        user?.id ?? null;

      setAuthUserId(
        nextAuthUserId
      );

      setUserThemeSettings(
        readUserThemeSettings(
          nextAuthUserId,
          adminSettings.nightStart,
          adminSettings.nightEnd
        )
      );
    };

  /*
   * Preveri uporabnika ob zagonu
   * in ob prijavi/odjavi.
   */
  useEffect(() => {
    void loadThemeForCurrentUser();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        () => {
          window.setTimeout(
            () => {
              void loadThemeForCurrentUser();
            },
            0
          );
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, [
    adminSettings.nightStart,
    adminSettings.nightEnd,
  ]);

  /*
   * Če administrator spremeni nočni urnik,
   * se ta takoj upošteva pri samodejnem načinu.
   */
  const isDarkMode =
    useMemo(() => {
      if (
        userThemeSettings.mode ===
        "always"
      ) {
        return true;
      }

      if (
        userThemeSettings.mode ===
        "manual"
      ) {
        return isWithinNightPeriod(
          userThemeSettings.manualNightStart,
          userThemeSettings.manualNightEnd
        );
      }

      return isWithinNightPeriod(
        adminSettings.nightStart,
        adminSettings.nightEnd
      );
    }, [
      userThemeSettings,
      adminSettings.nightStart,
      adminSettings.nightEnd,
    ]);

  /*
   * Preklop teme na document.
   * Tako lahko tudi Login uporablja isti
   * nočni način, še preden je uporabnik prijavljen.
   */
  useEffect(() => {
    const root =
      document.documentElement;

    root.setAttribute(
      "data-theme",
      isDarkMode
        ? "dark"
        : "light"
    );

    document.body.classList.toggle(
      "worklog-dark",
      isDarkMode
    );

    return () => {
      root.removeAttribute(
        "data-theme"
      );
      document.body.classList.remove(
        "worklog-dark"
      );
    };
  }, [isDarkMode]);

  /*
   * Samodejni način se mora preverjati
   * tudi med odprto aplikacijo.
   */
  useEffect(() => {
    if (
      userThemeSettings.mode ===
      "always"
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setUserThemeSettings(
            (
              previous
            ) => ({
              ...previous,
            })
          );
        },
        60_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    userThemeSettings.mode,
  ]);

  /*
   * Poskrbimo, da se sprememba iz UserSettings
   * takoj vidi tudi v drugih komponentah.
   */
  useEffect(() => {
    const handleThemeSettingsChanged =
      () => {
        setUserThemeSettings(
          readUserThemeSettings(
            authUserId,
            adminSettings.nightStart,
            adminSettings.nightEnd
          )
        );
      };

    window.addEventListener(
      "zusta-theme-settings-changed",
      handleThemeSettingsChanged
    );

    return () => {
      window.removeEventListener(
        "zusta-theme-settings-changed",
        handleThemeSettingsChanged
      );
    };
  }, [
    authUserId,
    adminSettings.nightStart,
    adminSettings.nightEnd,
  ]);

  const saveUserThemeSettings =
    (
      nextSettings: UserThemeSettings
    ) => {
      const storageKey =
        getStorageKey(
          authUserId
        );

      if (storageKey) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(
            nextSettings
          )
        );
      }

      setUserThemeSettings(
        nextSettings
      );

      window.dispatchEvent(
        new Event(
          "zusta-theme-settings-changed"
        )
      );
    };

  const setThemeMode = (
    mode: ThemeMode
  ) => {
    saveUserThemeSettings({
      ...userThemeSettings,
      mode,
    });
  };

  const setManualNightStart = (
    value: string
  ) => {
    saveUserThemeSettings({
      ...userThemeSettings,
      manualNightStart:
        value,
    });
  };

  const setManualNightEnd = (
    value: string
  ) => {
    saveUserThemeSettings({
      ...userThemeSettings,
      manualNightEnd:
        value,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        themeMode:
          userThemeSettings.mode,
        userThemeSettings,
        setThemeMode,
        setManualNightStart,
        setManualNightEnd,
        saveUserThemeSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme mora biti uporabljen znotraj ThemeProvider."
    );
  }

  return context;
}
