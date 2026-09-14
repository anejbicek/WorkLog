export type SeasonalTheme = {
  id: string;
  name: string;
  enabled: boolean;
  start: string;
  end: string;
  priority: number;
  loginImage: string;
  headerImage: string;
};

export const SEASONAL_THEME_STORAGE_KEY =
  "zusta_worklog_v2_seasonal_themes";

export const SEASONAL_THEME_EVENT =
  "zusta-seasonal-theme-changed";

export const DEFAULT_SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: "novo-leto",
    name: "Novo leto",
    enabled: true,
    start: "12-20T00:00",
    end: "01-05T23:59",
    priority: 100,
    loginImage: "/seasonal/novo-leto-login.png",
    headerImage: "/seasonal/novo-leto-header.png",
  },
  {
    id: "velika-noc",
    name: "Velika noč",
    enabled: true,
    start: "03-20T00:00",
    end: "04-15T23:59",
    priority: 90,
    loginImage: "/seasonal/velika-noc-login.png",
    headerImage: "/seasonal/velika-noc-header.png",
  },
  {
    id: "poletje",
    name: "Poletje",
    enabled: true,
    start: "06-01T00:00",
    end: "08-31T23:59",
    priority: 40,
    loginImage: "/seasonal/poletje-login.png",
    headerImage: "/seasonal/poletje-header.png",
  },
  {
    id: "jesen",
    name: "Jesen",
    enabled: true,
    start: "09-15T00:00",
    end: "11-30T23:59",
    priority: 50,
    loginImage: "/seasonal/jesen-login.png",
    headerImage: "/seasonal/jesen-header.png",
  },
];

export function loadSeasonalThemes(): SeasonalTheme[] {
  if (typeof window === "undefined") {
    return DEFAULT_SEASONAL_THEMES;
  }

  try {
    const saved = window.localStorage.getItem(
      SEASONAL_THEME_STORAGE_KEY
    );

    if (!saved) {
      return DEFAULT_SEASONAL_THEMES;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return DEFAULT_SEASONAL_THEMES;
    }

    return parsed.filter(
      (item): item is SeasonalTheme =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.enabled === "boolean" &&
        typeof item.start === "string" &&
        typeof item.end === "string" &&
        typeof item.priority === "number" &&
        typeof item.loginImage === "string" &&
        typeof item.headerImage === "string"
    );
  } catch {
    return DEFAULT_SEASONAL_THEMES;
  }
}

export function saveSeasonalThemes(
  themes: SeasonalTheme[]
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    SEASONAL_THEME_STORAGE_KEY,
    JSON.stringify(themes)
  );

  window.dispatchEvent(
    new Event(SEASONAL_THEME_EVENT)
  );
}

function toComparableDate(
  value: string,
  year: number
) {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hours || 0,
    minutes || 0,
    0,
    0
  );
}

export function isSeasonalThemeActive(
  theme: SeasonalTheme,
  now = new Date()
) {
  if (!theme.enabled) {
    return false;
  }

  const startParts = theme.start.split("T")[0].split("-").map(Number);
  const endParts = theme.end.split("T")[0].split("-").map(Number);

  const crossesYear =
    startParts[0] > endParts[0] ||
    (startParts[0] === endParts[0] && startParts[1] > endParts[1]);

  let start = toComparableDate(theme.start, now.getFullYear());
  let end = toComparableDate(theme.end, now.getFullYear());

  if (crossesYear) {
    if (now < end) {
      start = toComparableDate(
        theme.start,
        now.getFullYear() - 1
      );
    } else {
      end = toComparableDate(
        theme.end,
        now.getFullYear() + 1
      );
    }
  }

  return now >= start && now <= end;
}

export function getActiveSeasonalTheme(
  now = new Date()
): SeasonalTheme | null {
  return loadSeasonalThemes()
    .filter((theme) =>
      isSeasonalThemeActive(theme, now)
    )
    .sort(
      (a, b) => b.priority - a.priority
    )[0] ?? null;
}
