import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

Deno.serve(async (req) => {
  /* =========================================================
     CORS
  ========================================================= */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Dovoljena je samo POST zahteva.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    /* =======================================================
       SUPABASE OKOLJE
    ======================================================= */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        "Supabase okolje ni pravilno nastavljeno."
      );
    }

    /* =======================================================
       PREVERI PRIJAVLJENEGA ADMINISTRATORJA
    ======================================================= */

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error:
            "Manjka prijava administratorja.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const userClient =
      createClient(
        supabaseUrl,
        anonKey,
        {
          global: {
            headers: {
              Authorization:
                authHeader,
            },
          },
        }
      );

    const {
      data: {
        user: caller,
      },
      error: callerError,
    } =
      await userClient.auth.getUser();

    if (
      callerError ||
      !caller
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Administrator ni prijavljen.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       ADMIN CLIENT
    ======================================================= */

    const adminClient =
      createClient(
        supabaseUrl,
        serviceRoleKey
      );

    /* =======================================================
       PREVERI ADMIN PRAVICE
    ======================================================= */

    const {
      data: adminProfile,
      error: profileError,
    } =
      await adminClient
        .from("users")
        .select(
          "role, active"
        )
        .eq(
          "auth_user_id",
          caller.id
        )
        .maybeSingle();

    if (
      profileError ||
      adminProfile?.role !==
        "admin" ||
      adminProfile.active !== true
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Za ustvarjanje uporabnikov potrebuješ administratorske pravice.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       PREBERI PODATKE IZ OBRAZCA
    ======================================================= */

    const body =
      await req.json();

    const name =
      String(
        body.name ?? ""
      ).trim();

    const email =
      String(
        body.email ?? ""
      )
        .trim()
        .toLowerCase();

    const username =
      String(
        body.username ?? ""
      )
        .trim()
        .toLowerCase();

    /*
     * ZAČETNO GESLO
     *
     * Administrator ga določi v AdminUsers.tsx.
     * Supabase ID se NE vpisuje.
     */
    const password =
      String(
        body.password ?? ""
      );

    const role =
      body.role === "admin"
        ? "admin"
        : "worker";

    const active =
      body.active !== false;

    /* =======================================================
       PREVERJANJE PODATKOV
    ======================================================= */

    if (
      !name ||
      !email ||
      !username ||
      !password
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Ime, e-pošta, uporabniško ime in začetno geslo so obvezni.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (
      password.length < 6
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Začetno geslo mora vsebovati najmanj 6 znakov.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       PREVERI UPORABNIŠKO IME
    ======================================================= */

    const {
      data: existingUsername,
      error:
        usernameError,
    } =
      await adminClient
        .from("users")
        .select("id")
        .eq(
          "username",
          username
        )
        .maybeSingle();

    if (usernameError) {
      console.error(
        "Napaka pri preverjanju uporabniškega imena:",
        usernameError
      );

      return new Response(
        JSON.stringify({
          error:
            "Napaka pri preverjanju uporabniškega imena.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (
      existingUsername
    ) {
      return new Response(
        JSON.stringify({
          error:
            "To uporabniško ime je že zasedeno.",
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       USTVARI SUPABASE AUTH UPORABNIKA
    ======================================================= */

    /*
     * Tukaj Supabase SAM ustvari:
     *
     * - UUID uporabnika
     * - Auth račun
     * - geslo
     *
     * Administrator UUID-ja ne vpisuje.
     */

    const {
      data: authData,
      error: authError,
    } =
      await adminClient.auth.admin.createUser(
        {
          email,
          password,
          email_confirm: true,
        }
      );

    if (
      authError ||
      !authData.user
    ) {
      console.error(
        "Napaka pri ustvarjanju Supabase Auth uporabnika:",
        authError
      );

      return new Response(
        JSON.stringify({
          error:
            authError?.message ??
            "Supabase Auth uporabnika ni bilo mogoče ustvariti.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       SHRANI UPORABNIKA V WORKLOG USERS
    ======================================================= */

    const {
      data: profile,
      error: insertError,
    } =
      await adminClient
        .from("users")
        .insert({
          name,
          email,
          username,

          /*
           * UUID, ki ga je ustvaril Supabase Auth.
           */
          auth_user_id:
            authData.user.id,

          role,
          active,
        })
        .select(
          "id, name, email, username, auth_user_id, role, active"
        )
        .single();

    /* =======================================================
       ČE SHRANJEVANJE USERS NE USPE
    ======================================================= */

    if (insertError) {
      console.error(
        "Napaka pri shranjevanju uporabnika v users:",
        insertError
      );

      /*
       * Ker WorkLog uporabnika ni bilo mogoče
       * ustvariti, izbrišemo tudi Auth račun.
       */
      await adminClient.auth.admin.deleteUser(
        authData.user.id
      );

      return new Response(
        JSON.stringify({
          error:
            insertError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /* =======================================================
       USPEŠEN REZULTAT
    ======================================================= */

    return new Response(
      JSON.stringify({
        success: true,
        user: profile,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    /* =======================================================
       SPLOŠNA NAPAKA
    ======================================================= */

    console.error(
      "Napaka create-user:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Neznana napaka.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});