import { useEffect, useState } from "react";
import { useAdmin } from "../../context/AdminContext";

export default function AdminSettings() {
  const {
    settings,
    updateSettings,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  } = useAdmin();

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleAddHoliday = () => {
    const date = holidayDate.trim();
    const name = holidayName.trim();

    if (!date || !name) {
      return;
    }

    addHoliday({
      date,
      name,
    });

    setHolidayDate("");
    setHolidayName("");
  };

  const handleHolidayNameChange = (
    id: number,
    name: string
  ) => {
    const holiday = holidays.find(
      (item) => item.id === id
    );

    if (!holiday) {
      return;
    }

    updateHoliday(id, {
      date: holiday.date,
      name,
    });
  };

  const handleHolidayDateChange = (
    id: number,
    date: string
  ) => {
    const holiday = holidays.find(
      (item) => item.id === id
    );

    if (!holiday) {
      return;
    }

    updateHoliday(id, {
      date,
      name: holiday.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          NASLOV
      ===================================================== */}

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Nastavitve WorkLoga
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Tukaj administrator določa nastavitve, ki vplivajo
          na delovanje sistema ŽustAI WorkLog.
        </p>
      </div>

      {/* =====================================================
          OSNOVNE NASTAVITVE
      ===================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Osnovne nastavitve
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Osnovne nastavitve delovnega časa in podjetja.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="companyName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Ime podjetja
            </label>

            <input
              id="companyName"
              type="text"
              value={form.companyName}
              onChange={(event) =>
                handleChange(
                  "companyName",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Ime podjetja"
            />
          </div>

          <div>
            <label
              htmlFor="workDayHours"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Dolžina delovnega dne
            </label>

            <div className="relative">
              <input
                id="workDayHours"
                type="number"
                min="0"
                step="0.5"
                value={form.workDayHours}
                onChange={(event) =>
                  handleChange(
                    "workDayHours",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ur
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="breakMinutes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Odmor
            </label>

            <div className="relative">
              <input
                id="breakMinutes"
                type="number"
                min="0"
                step="5"
                value={form.breakMinutes}
                onChange={(event) =>
                  handleChange(
                    "breakMinutes",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                minut
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="overtimeAfter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nadure po
            </label>

            <div className="relative">
              <input
                id="overtimeAfter"
                type="number"
                min="0"
                step="0.5"
                value={form.overtimeAfter}
                onChange={(event) =>
                  handleChange(
                    "overtimeAfter",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                urah
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.autoBreak}
                onChange={(event) =>
                  handleChange(
                    "autoBreak",
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />

              <span>
                <span className="block text-sm font-medium text-gray-700">
                  Samodejno odštevanje odmora
                </span>

                <span className="block text-xs text-gray-500">
                  WorkLog bo pri izračunu delovnega časa
                  samodejno odštel nastavljen odmor.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* =====================================================
          NOČNO DELO
      ===================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Nočno delo
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Določitev časovnega obdobja, ki ga WorkLog
            obravnava kot nočno delo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="nightStart"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Začetek nočnega dela
            </label>

            <input
              id="nightStart"
              type="time"
              value={form.nightStart}
              onChange={(event) =>
                handleChange(
                  "nightStart",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="nightEnd"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Konec nočnega dela
            </label>

            <input
              id="nightEnd"
              type="time"
              value={form.nightEnd}
              onChange={(event) =>
                handleChange(
                  "nightEnd",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PDF POROČILA
      ===================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            PDF poročila
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Podatki, ki se uporabljajo pri izdelavi PDF
            poročil.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="pdfCompanyName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Ime podjetja na PDF poročilu
            </label>

            <input
              id="pdfCompanyName"
              type="text"
              value={form.pdfCompanyName}
              onChange={(event) =>
                handleChange(
                  "pdfCompanyName",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Ime podjetja"
            />
          </div>

          <div>
            <label
              htmlFor="pdfResponsiblePerson"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Odgovorna oseba
            </label>

            <input
              id="pdfResponsiblePerson"
              type="text"
              value={form.pdfResponsiblePerson}
              onChange={(event) =>
                handleChange(
                  "pdfResponsiblePerson",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Ime in priimek"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          OBVESTILA
      ===================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Obvestila
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Nastavitve sistemskih obvestil WorkLoga.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={form.notificationsService}
              onChange={(event) =>
                handleChange(
                  "notificationsService",
                  event.target.checked
                )
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />

            <span>
              <span className="block text-sm font-medium text-gray-700">
                Obvestila o servisu
              </span>

              <span className="block text-xs text-gray-500">
                Omogoči sistemska obvestila, povezana s
                servisom in vzdrževanjem.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={
                form.notificationsMissingWorkOrders
              }
              onChange={(event) =>
                handleChange(
                  "notificationsMissingWorkOrders",
                  event.target.checked
                )
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />

            <span>
              <span className="block text-sm font-medium text-gray-700">
                Opozorila za manjkajoče delovne naloge
              </span>

              <span className="block text-xs text-gray-500">
                WorkLog lahko opozori administratorja, kadar
                manjkajo delovni nalogi.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* =====================================================
          PRAZNIKI
      ===================================================== */}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Prazniki
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Seznam praznikov, ki jih WorkLog upošteva pri
            obračunu delovnega časa.
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Dodaj praznik
            </h4>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto]">
              <input
                type="date"
                value={holidayDate}
                onChange={(event) =>
                  setHolidayDate(
                    event.target.value
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <input
                type="text"
                value={holidayName}
                onChange={(event) =>
                  setHolidayName(
                    event.target.value
                  )
                }
                placeholder="Ime praznika"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={handleAddHoliday}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Dodaj
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {holidays.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Trenutno ni vnesenih praznikov.
              </div>
            ) : (
              holidays
                .slice()
                .sort((a, b) =>
                  a.date.localeCompare(b.date)
                )
                .map((holiday) => (
                  <div
                    key={holiday.id}
                    className="grid grid-cols-1 items-center gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-[180px_1fr_auto]"
                  >
                    <input
                      type="date"
                      value={holiday.date}
                      onChange={(event) =>
                        handleHolidayDateChange(
                          holiday.id,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                    <input
                      type="text"
                      value={holiday.name}
                      onChange={(event) =>
                        handleHolidayNameChange(
                          holiday.id,
                          event.target.value
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        deleteHoliday(
                          holiday.id
                        )
                      }
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Izbriši
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SHRANI
      ===================================================== */}

      <div className="flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {saved && (
          <span className="text-sm font-medium text-green-600">
            Nastavitve so shranjene.
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Shrani nastavitve
        </button>
      </div>
    </div>
  );
}