import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, MetaDescriptor, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "database.types";

export const metadata: MetaDescriptor = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      request,
      response,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return redirect(
      process.env.NODE_ENV == "development"
        ? "http://localhost:3000"
        : "https://rue-mvp.fly.dev/"
    );
  }

  return json(
    {
      errors: false,
    },
    {
      headers: response.headers,
    }
  );
};

//https://github.com/shadcn-ui/ui/blob/main/apps/www/app/examples/authentication/page.tsx
export default function AuthenticationPage() {
  const { supabase } = useOutletContext<{
    supabase: SupabaseClient<Database>;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  }>();

  return (
    <>
      <div className="container relative flex min-h-screen -my-10 flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-fuchsia-950" />
          <div className="relative my-auto z-20 flex flex-wrap items-center text-lg font-medium w-[400px]">
            <p className="text-lg">POP-UPS MADE CASUAL</p>
            <p className="text-lg">EVERYDAY GATHERINGS MADE UNIQUE</p>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, or welcome back. Either way, we&apos;re glad
                you&apos;re here!
              </p>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#701a75",
                      brandAccent: "#a21caf",
                    },
                  },
                },
              }}
              view="magic_link"
              providers={["google"]}
              showLinks={false}
              redirectTo={
                process.env.NODE_ENV == "development"
                  ? "http://localhost:3000"
                  : "https://rue-mvp.fly.dev/"
              }
            />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By logging in, you agree to our{" "}
              <Link
                to="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
