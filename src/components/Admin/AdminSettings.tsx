import {
  useMemo,
  useState,
} from "react";

import {
  useAdmin,
  type AdminHoliday,
  type AdminSettings as AdminSettingsType,
} from "../../context/AdminContext";

export default function AdminSettings() {
  const {
    settings,
    updateSettings,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  } = useAdmin();

  /* =======================================================
     NASTAVITVE
  ======================================================= */

  const [form, setForm] =
    useState<AdminSettingsType>(
      settings
    );

  /* =======================================================
     PRAZNIKI
  ======================================================= */

  const [holidayForm, setHolidayForm] =
    useState<{
      date: string;
      name: string;
    }>({
      date: "",
      name: "",
    });

  const [
    editingHolidayId,
    setEditingHolidayId,
  ] = useState<number | null>(null);

  /* =======================================================
     SHRANI NASTAVITVE
  ======================================================= */

  const handleSaveSettings = () => {
    updateSettings(form);

    alert(
      "Nastavitve so bile shranjene."
    );
  };

  /* =======================================================
     PRAZNIKI – SORTIRANJE
  ======================================================= */

  const sortedHolidays =
    useMemo(() => {
      return [...holidays].sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      );
    }, [holidays]);

  /* =======================================================
     PRAZNIK – POČISTI FORMULAR
  ======================================================= */

  const clearHolidayForm = () => {
    setHolidayForm({
      date: "",
      name: "",
    });

    setEditingHolidayId(null);
  };

  /* =======================================================
     PRAZNIK – DODAJ / SHRANI
  ======================================================= */

  const handleSaveHoliday = () => {
    if (!holidayForm.date) {
      alert(
        "Izberi datum praznika."
      );

      return;
    }

    if (!holidayForm.name.trim()) {
      alert(
        "Vpiši ime praznika."
      );

      return;
    }

    const duplicate =
      holidays.some(
        (holiday) =>
          holiday.date ===
            holidayForm.date &&
          holiday.id !==
            editingHolidayId
      );

    if (duplicate) {
      alert(
        "Za ta datum praznik že obstaja."
      );

      return;
    }

    if (
      editingHolidayId !== null
    ) {
      updateHoliday(
        editingHolidayId,
        {
          date:
            holidayForm.date,
          name:
            holidayForm.name.trim(),
        }
      );
    } else {
      addHoliday({
        date:
          holidayForm.date,
        name:
          holidayForm.name.trim(),
      });
    }

    clearHolidayForm();
  };

  /* =======================================================
     PRAZNIK – UREDI
  ======================================================= */

  const handleEditHoliday = (
    holiday: AdminHoliday
  ) => {
    setEditingHolidayId(
      holiday.id
    );

    setHolidayForm({
      date: holiday.date,
      name: holiday.name,
    });
  };

  /* =======================================================
     PRAZNIK – IZBRIŠI
  ======================================================= */

  const handleDeleteHoliday = (
    holiday: AdminHoliday
  ) => {
    const confirmed =
      window.confirm(
        `Ali želiš izbrisati praznik "${holiday.name}"?`
      );

    if (!confirmed) {
      return;
    }

    deleteHoliday(
      holiday.id
    );

    if (
      editingHolidayId ===
      holiday.id
    ) {
      clearHolidayForm();
    }
  };

  /* =======================================================
     DATUM – FORMAT
  ======================================================= */

  const formatDate = (
    date: string
  ) => {
    const [year, month, day] =
      date.split("-");

    if (
      !year ||
      !month ||
      !day
    ) {
      return date;
    }

    return `${day}.${month}.${year}`;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          SPLOŠNO
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Splošno
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Osnovne nastavitve aplikacije.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ime podjetja
            </label>

            <input
              type="text"
              value={form.companyName}
              onChange={(event) =>
                setForm({
                  ...form,
                  companyName:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          DELOVNI ČAS
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Delovni čas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Nastavitve obračuna delovnega časa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Delovni dan
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={
                  form.workDayHours
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    workDayHours:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ur
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Malica
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={
                  form.breakMinutes
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    breakMinutes:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                minut
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Začetek nočnega dela
            </label>

            <input
              type="time"
              value={
                form.nightStart
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  nightStart:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Konec nočnega dela
            </label>

            <input
              type="time"
              value={
                form.nightEnd
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  nightEnd:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nadure po
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                value={
                  form.overtimeAfter
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    overtimeAfter:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ur
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={
                  form.autoBreak
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    autoBreak:
                      event.target.checked,
                  })
                }
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />

              <span className="text-sm font-medium text-slate-700">
                Samodejno odštej malico
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ===================================================
          PDF
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            PDF
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Podatki, ki se uporabljajo pri izdelavi PDF poročil.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ime podjetja v PDF
            </label>

            <input
              type="text"
              value={
                form.pdfCompanyName
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  pdfCompanyName:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Odgovorna oseba
            </label>

            <input
              type="text"
              value={
                form.pdfResponsiblePerson
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  pdfResponsiblePerson:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          OBVESTILA
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Obvestila
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Nastavitve sistemskih obvestil.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                form.notificationsService
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  notificationsService:
                    event.target.checked,
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <span className="text-sm font-medium text-slate-700">
              Obvestila o servisu
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                form.notificationsMissingWorkOrders
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  notificationsMissingWorkOrders:
                    event.target.checked,
                })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <span className="text-sm font-medium text-slate-700">
              Obvestila o manjkajočih delovnih nalogih
            </span>
          </label>
        </div>
      </section>

      {/* ===================================================
          PRAZNIKI
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Prazniki
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dela prosti dnevi, ki se uporabljajo pri obračunu delovnih ur.
            </p>
          </div>

          <button
            type="button"
            onClick={clearHolidayForm}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Dodaj praznik
          </button>
        </div>

        {/* =================================================
            FORMULAR
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingHolidayId !== null
                ? "Uredi praznik"
                : "Dodaj praznik"}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Datum
              </label>

              <input
                type="date"
                value={
                  holidayForm.date
                }
                onChange={(event) =>
                  setHolidayForm({
                    ...holidayForm,
                    date:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ime praznika
              </label>

              <input
                type="text"
                placeholder="npr. Novo leto"
                value={
                  holidayForm.name
                }
                onChange={(event) =>
                  setHolidayForm({
                    ...holidayForm,
                    name:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  handleSaveHoliday
                }
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {editingHolidayId !==
                null
                  ? "Shrani"
                  : "Dodaj"}
              </button>

              {editingHolidayId !==
                null && (
                <button
                  type="button"
                  onClick={
                    clearHolidayForm
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Prekliči
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            SEZNAM PRAZNIKOV
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[150px_1fr_180px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            <div>Datum</div>
            <div>Praznik</div>
            <div className="text-right">
              Dejanja
            </div>
          </div>

          {sortedHolidays.length ===
          0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Ni dodanih praznikov.
            </div>
          ) : (
            sortedHolidays.map(
              (holiday) => (
                <div
                  key={
                    holiday.id
                  }
                  className="grid grid-cols-[150px_1fr_180px] items-center border-b border-slate-100 px-4 py-3 last:border-b-0"
                >
                  <div className="text-sm font-medium text-slate-700">
                    {formatDate(
                      holiday.date
                    )}
                  </div>

                  <div className="text-sm text-slate-900">
                    {holiday.name}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleEditHoliday(
                          holiday
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Uredi
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteHoliday(
                          holiday
                        )
                      }
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Izbriši
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </section>

      {/* ===================================================
          SHRANI NASTAVITVE
      =================================================== */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={
            handleSaveSettings
          }
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Shrani nastavitve
        </button>
      </div>
    </div>
  );
}