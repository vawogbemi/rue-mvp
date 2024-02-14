import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useLocation,
  useOutletContext,
} from "@remix-run/react";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { createClient } from "@supabase/supabase-js";
import { Database } from "database.types";
import { Fragment, useState } from "react";
import { EventView } from "~/components/event-view";
//ADD CREATOR NAME
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();

  const supabaseService = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

  const { data: session } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/");
  }

  const { data: user } = await supabaseService
    .from("users")
    .select()
    .eq("user", session.session?.user.id as string);

  if (user && user?.length > 0 && user?.at(0)?.brand) {
    const { data: events } = await supabaseService
      .from("events")
      .select(
        "id, title, date, number_of_attendees, image, location, event_description, attendee_description, tags, creator, creator_name"
      );

    return json(
      {
        events,
      },
      {
        headers: response.headers,
      }
    );
  }

  const { data: events } = await supabaseService
    .from("events")
    .select(
      "id, title, date, number_of_attendees, image, location, event_description, attendee_description, tags, creator, creator_name"
    )
    .eq("creator", session.session?.user.id as string);

  return json(
    {
      events,
    },
    {
      headers: response.headers,
    }
  );
};

export default function Events() {
  const { events } = useLoaderData<typeof loader>();

  const { user } = useOutletContext<{
    user: {
      user: string;
      name: string | null;
      email: string | null;
      brand: boolean | null;
    };
  }>();

  const pathname = useLocation().pathname;

  const [filter, setFilter] = useState("");
  const [numberFilter, setNumberFilter] = useState(0);
  console.log(events?.at(1)?.creator_name);
  return (
    <Fragment>
      {pathname.endsWith("events") || pathname.endsWith("events/") ? (
        <div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs mb-20"
              onChange={(event) => setFilter(event.target.value.toLowerCase())}
            />
            <select
              className="select select-bordered w-full max-w-xs ml-5"
              onChange={(event) =>
                setNumberFilter(parseInt(event.target.value))
              }
            >
              <option selected value={0}>
                Number of Attendees?
              </option>
              <option value={10}>{"10+"}</option>
              <option value={20}>{"20+"}</option>
              <option value={50}>{"50+"}</option>
            </select>
          </div>
          <EventView
            events={events?.filter(
              (event) =>
                (event.tags
                  ?.split(",")
                  .some((tag) => tag.trim().startsWith(filter)) ||
                  event.creator_name?.toLowerCase().startsWith(filter) ||
                  event.title?.toLowerCase().startsWith(filter)) &&
                (event.number_of_attendees ?? 0) > numberFilter
            )}
          />
        </div>
      ) : (
        <Outlet context={{ events, user }} />
      )}
    </Fragment>
  );
}
