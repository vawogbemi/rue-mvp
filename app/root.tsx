import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css";
import { Navbar } from "./components/nav-bar";
import { json, redirect } from "@remix-run/node"; // change this import to whatever runtime you are using
import {
  createBrowserClient,
  createServerClient,
} from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { Database } from "database.types";
import { createClient } from "@supabase/supabase-js";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_SERVICE_ROLE!,
  };

  const response = new Response();
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const supabaseService = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
  );

  const url = new URL(request.url);

  if (session && url.pathname != ("/getting-started" || "/getting-started/")) {
    const { data: userData } = await supabaseService
      .from("users")
      .select("user, name, email, brand")
      .eq("user", session.user.id);

    if (
      userData?.length == 0 &&
      !["/", "/login", "/login/"].includes(url.pathname)
    ) {
      return redirect("/getting-started");
    }

    return json(
      {
        env,
        session,
        userData,
      },
      {
        headers: response.headers,
      }
    );
  }

  if (!session && !["/", "/login", "/login/"].includes(url.pathname)) {
    return redirect("/login");
  }

  return json(
    {
      env,
      session,
      userData: [],
    },
    {
      headers: response.headers,
    }
  );
};

export default function App() {
  const { env, session, userData } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  const user = userData?.at(0);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar session={session} supabase={supabase} user={user} />
        <div className="hero place-items- min-h-screen bg-white-200">
          <div className="hero-content flex max-w-7xl justify-center text-center">
            <Outlet context={{ supabase, user }} />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
