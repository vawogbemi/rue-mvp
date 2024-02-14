import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRemixForm } from "remix-hook-form";
import { Form, useLoaderData, useOutletContext } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Database } from "database.types";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { format } from "date-fns";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabaseService = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  const { error } = await supabaseService.from("events").insert({
    title: formData.get("title")?.slice(1, -1).toString(),
    date: formData.get("date")?.slice(1, -1).toString(),
    number_of_attendees: parseInt(
      formData.get("number_of_attendees") as string
    ),
    image: formData.get("image")?.slice(1, -1).toString(),
    location: formData.get("location")?.slice(1, -1).toString(),
    event_description: formData
      .get("event_description")
      ?.slice(1, -1)
      .toString(),
    attendee_description: formData
      .get("attendee_description")
      ?.slice(1, -1)
      .toString(),
    creator: formData.get("creator")?.slice(1, -1) as string,
    creator_name: formData.get("creator_name")?.slice(1, -1).toString(),
    tags: formData.get("tags")?.slice(1, -1).toString().toLowerCase(),
  });

  if (error) {
    console.log(error);
    return error;
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

export default function CreateEvent() {
  const { session } = useLoaderData<typeof loader>();

  const { supabase, user } = useOutletContext<{
    supabase: SupabaseClient<Database>;
    user: {
      user: string;
      name: string | null;
      email: string | null;
      brand: boolean | null;
    };
  }>();

  //FORM STUFF
  const CreateEventSchema = z.object({
    title: z
      .string()
      .min(1, {
        message: "Name must be at least 1 characters.",
      })
      .max(30, {
        message: "Name must not be longer than 30 characters.",
      }),
    number_of_attendees: z.coerce
      .number()
      .min(0, { message: "Number must be greater than 0" }),
    image: z.any(),
    location: z.string().min(1, { message: "select a location" }),
    event_description: z.string(),
    attendee_description: z.string(),
    tags: z.string(),
  });

  type CreateEventFormData = z.infer<typeof CreateEventSchema>;
  const resolver = zodResolver(CreateEventSchema);

  //State
  const [date, setDate] = useState<Date>();
  const [image, setImage] = useState("");

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useRemixForm<CreateEventFormData>({
    mode: "onSubmit",
    resolver: resolver,
    submitData: {
      creator: session.user.id,
      creator_name: user.name,
      date: date,
      image: image,
    },
  });

  return (
    <div className="space-y-6 w-screen">
      <div className="space-y-0.5">
        <h1 className="text-xl font-medium tracking-tight">Create an Event</h1>
        <p className="text-zinc-500">Fill out the details of your event</p>
        <div className="border-b border-gray-300 my-2" />
      </div>
      <Form className="space-y-8" method="post" onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-center">
          <div className="mx-auto bg-fuchsia-900 text-white min-w-[400px] lg:min-w-[600px] p-5 rounded-lg">
            <div className="mt-5 flex">
              <p className="mr-auto">Title</p>
              <input
                className={`input-bordered input h-8 mb-1 border-2 text-black ${
                  errors.title && "border-red-500"
                }`}
                placeholder="Event Title"
                {...register("title")}
              />
            </div>
            <div className="mt-5 flex">
              <p className="mr-auto">Number of Attendees</p>
              <input
                className={`input-bordered input h-8 mb-1 w-20 border-2 text-black ${
                  errors.number_of_attendees && "border-red-500"
                } `}
                placeholder="0"
                {...register("number_of_attendees")}
              />
            </div>
            <div className="mt-5 flex">
              <p className="mr-auto">Location</p>
              <select
                className={`select select-bordered max-w-xs border-2 text-black ${
                  errors.location && "border-red-500"
                }`}
                {...register("location")}
              >
                <option>New York</option>
              </select>
            </div>
            <div className="mt-5 flex">
              <p className="mr-auto">Event Description</p>
              <textarea
                className={`textarea textarea-bordered text-black ${
                  errors.event_description && "border-red-500"
                }`}
                placeholder="Description"
                {...register("event_description")}
              />
            </div>
            <div className="mt-5 flex">
              <p className="mr-auto">Attendee Description</p>
              <textarea
                className={`textarea textarea-bordered text-black ${
                  errors.attendee_description && "border-red-500"
                }`}
                placeholder="Description"
                {...register("attendee_description")}
              />
            </div>
            <div className="mt-5 flex">
              <p className="mr-auto">Tags</p>
              <input
                className={`input-bordered input h-8 mb-1 border-2 text-black ${
                  errors.tags && "border-red-500"
                }`}
                placeholder="Fashion, Art, Music"
                {...register("tags")}
              />
            </div>
          </div>
          <div className="mx-auto mt-20 lg:mt-1">
            <div className="mt-5 flex items-center">
              <p className="mr-8">Image</p>
              <input
                type="file"
                className="file-input w-full max-w-xs"
                {...register("image")}
                onChange={(event) => {
                  event.target.files
                    ? (setImage(
                        `https://vbuqjlgtjidxmmqviebs.supabase.co/storage/v1/object/public/events/${
                          session.user.id
                        }_${event.target.files[0].name.replace(" ", "_")}`
                      ),
                      supabase.storage
                        .from("events")
                        .upload(
                          `${
                            session.user.id
                          }_${event.target.files[0].name.replace(" ", "_")}`,
                          event.target.files[0],
                          { upsert: true }
                        ))
                    : null;
                }}
              />
            </div>
            <div className="mt-5 flex items-center">
              <p className="mr-8">Date</p>
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                footer={
                  date ? (
                    <p>{date && format(date, "PP")}.</p>
                  ) : (
                    <p className="text-red-500">Please pick a day.</p>
                  )
                }
              />
            </div>
          </div>
        </div>

        <button className="btn bg-fuchsia-900" type="submit" disabled={!date}>
          <p className="text-white">Create Event</p>
        </button>
      </Form>
    </div>
  );
}
