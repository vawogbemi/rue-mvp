import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Database } from "database.types";
import { FaCalendar } from "react-icons/fa";
import { FaLocationPin, FaPerson } from "react-icons/fa6";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const response = new Response();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

  const session = await supabase.auth.getSession();

  return json(
    {
      eventParam: params.event,
      session,
    },
    {
      headers: response.headers,
    }
  );
};

export default function Event() {
  const { eventParam, session } = useLoaderData<typeof loader>();

  const { events, user } = useOutletContext<{
    events:
      | {
          id: number;
          title: string | null;
          date: string | null;
          number_of_attendees: number | null;
          image: string | null;
          location: string | null;
          event_description: string | null;
          attendee_description: string | null;
          tags: string | null;
          creator: string | null;
          creator_name: string | null;
        }[]
      | null;
    user: {
      user: string;
      name: string | null;
      email: string | null;
      brand: boolean | null;
    };
  }>();

  const event = events?.find(
    (event) =>
      event.id == parseInt(eventParam as string) &&
      (event.creator == session.data.session?.user.id || user.brand)
  );

  return event ? (
    <div className="min-h-screen max-w-[25rem] lg:max-w-[60rem]">
      <img
        src={
          event?.image ??
          "https://framerusercontent.com/images/iLTBBFmzUMZhzCWzLONq28hGk.png?scale-down-to=1024"
        }
        alt="Event"
        className="max-h-[40rem] mx-auto"
      />
      <h1 className="text-4xl lg:text-6xl border-b-2 border-zinc-300">
        {event?.title}
      </h1>

      <div className="flex flex-wrap gap-7 p-4">
        <div className="flex items-center">
          {" "}
          <FaCalendar className="mr-2" /> {event?.date}
        </div>
        <div className="flex items-center">
          {" "}
          <FaLocationPin className="mr-2" /> {event?.location}
        </div>
        <div className="flex items-center">
          {" "}
          <FaPerson className="mr-2" /> {event?.number_of_attendees}
        </div>
        <div className="card-actions items-center">
          {event?.tags?.split(",").map((tag) => (
            <div key={tag} className="badge badge-outline">
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div className="float-left p-4 text-left ">
        <div className="">
          <p className="font-bold text-xl">Event Description</p>
          <p className="text-pretty truncate">{event?.event_description}</p>
        </div>
        <div className="mt-4">
          <p className="font-bold text-xl">Attendee Description</p>
          <p>{event?.attendee_description}</p>
        </div>
      </div>

      <div className="flex w-full p-4 border-2 border-zinc-300 items-center">
      <p className="p-2 font-bold">Event Host</p>
        <div tabIndex={0} role="button" className="m-1 ml-auto avatar w-full">
          <div className="w-10 rounded-full bg-zinc-300 ring-offset-base-100 ring-offset-2">
            <div className="flex">
              <p className="p-2">
                {event
                  .creator_name!.match(/(\b\S)?/g)!
                  .join("")!
                  .match(/(^\S|\S$)?/g)!
                  .join("")
                  .toUpperCase()}
              </p>
            </div>
          </div>
          <p className="p-2">{event.creator_name}</p>
        </div>
      </div>
    </div>
  ) : (
    <p>Error</p>
  );
}
