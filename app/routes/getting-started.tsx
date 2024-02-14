import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRemixForm } from "remix-hook-form";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Database } from "database.types";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { createClient } from "@supabase/supabase-js";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
  );

  const { error } = await supabase.from("users").insert({
    user: formData.get("user")?.slice(1, -1) as string,
    email: formData.get("email")?.slice(1, -1) as string,
    name: formData.get("name")?.slice(1, -1) as string,
  });

  if (error) {
    console.log(error);
    return json(error);
  }

  return redirect("/");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

  if (!session) {
    return redirect("/");
  }

  return json(
    {
      session,
    },
    {
      headers: response.headers,
    }
  );
};

export default function GettingStarted() {
  const { session } = useLoaderData<typeof loader>();

  //FORM STUFF
  const accountFormSchema = z.object({
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(30, {
        message: "Name must not be longer than 30 characters.",
      }),
  });

  type AccountFormData = z.infer<typeof accountFormSchema>;
  const resolver = zodResolver(accountFormSchema);

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useRemixForm<AccountFormData>({
    mode: "onSubmit",
    resolver: resolver,
    submitData: { user: session.user.id, email: session.user.email },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-xl font-medium tracking-tight">Almost there</h1>
        <p className="text-zinc-500">We just need to know your name</p>
        <div className="border-b border-gray-300 my-2" />
      </div>
      <Form className="space-y-8" method="post" onSubmit={handleSubmit}>
        <div className="mt-4 flex items-center">
          <p className="mr-8">Name</p>
          <input
            className="input-bordered input h-8 mb-1"
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
        <button className="btn bg-fuchsia-900" type="submit">
          <p className="text-white">Finalize Account</p>
        </button>
      </Form>
    </div>
  );
}
