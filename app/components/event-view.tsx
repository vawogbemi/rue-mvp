import { Link } from "@remix-run/react";
import { FaCalendar } from "react-icons/fa";
import { FaLocationPin, FaPerson } from "react-icons/fa6";
//ADD CREATOR NAME
export function EventView(props: {
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
    | null
    | undefined;
}) {
  return props.events && props.events.length > 0 ? (
    <div className="flex flex-wrap gap-10">
      {props.events.map((event) => (
        <Link to={event.id.toString()} key={"Event Link " + event.id}>
          <EventCard event={event} key={"Event Card " + event.id} />
        </Link>
      ))}
    </div>
  ) : (
    <p>
      No events found.{" "}
      <Link to={"/create-event"} className="text-fuchsia-900">
        create one
      </Link>
    </p>
  );
}

export function EventCard(props: {
  event: {
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
  };
}) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <img
          src={
            props.event.image ??
            "https://framerusercontent.com/images/iLTBBFmzUMZhzCWzLONq28hGk.png?scale-down-to=1024"
          }
          alt="Rue"
        />
      </figure>
      <div className="card-body">
        <div className="flex flex-wrap">
          <h2 className="card-title">{props.event.title}</h2>
          <div className="tooltip ml-auto" data-tip={props.event.creator_name}>
            <div tabIndex={0} role="button" className="m-1 ml-auto avatar">
              <div className="w-10 rounded-full bg-zinc-300 ring-offset-base-100 ring-offset-2">
                <div className="flex">
                  <p className="p-2">
                    {props.event
                      .creator_name!.match(/(\b\S)?/g)!
                      .join("")!
                      .match(/(^\S|\S$)?/g)!
                      .join("")
                      .toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap">
          <div className="badge text-white bg-fuchsia-900">
            <FaCalendar className="mr-2" /> {props.event.date}
          </div>
          <div className="badge text-white bg-fuchsia-900">
            <FaLocationPin className="mr-2" /> {props.event.location}
          </div>
          <div className="badge text-white bg-fuchsia-900">
            <FaPerson className="mr-2" /> {props.event.number_of_attendees}
          </div>
        </div>
        <div className="card-actions justify-end">
          {props.event.tags?.split(",").map((tag, key) => (
            <div key={key} className="badge badge-outline">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
