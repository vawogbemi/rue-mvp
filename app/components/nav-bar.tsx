/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Link } from "@remix-run/react";
import { Session, SupabaseClient } from "@supabase/supabase-js";

export function Navbar(props: {
  session: Session | null;
  supabase: SupabaseClient;
  user:
    | {
        email: string | null;
        brand: boolean | null;
        name: string | null;
        user: string;
      }
    | null
    | undefined;
}) {
  return (
    <div className="navbar bg-base-100 sticky top-0 z-50 border border-b border-grey-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link to={"/"}>Contact Us</Link>
            </li>
          </ul>
        </div>
        <Link to={"/"} className="btn btn-ghost text-xl text-fuchsia-900">
          Rue
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to={"/"}>Contact Us</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {props.session ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="m-1 avatar">
              <div className="w-10 rounded-full bg-zinc-300 ring-offset-base-100 ring-offset-2">
                <p className="p-2">
                  {props.user
                    ?.name!.match(/(\b\S)?/g)!
                    .join("")!
                    .match(/(^\S|\S$)?/g)!
                    .join("")
                    .toUpperCase()}
                </p>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="px-4 font-bold border-b border-zinc-300">
                  {props.user?.name}
              </li>
              <li>
                <Link to={props.session ? "/create-event" : "/login"}>
                  Create an Event
                </Link>
              </li>
              <li>
                <Link to={props.session ? "/events" : "/login"}>My Events</Link>
              </li>
              <li>
                <button onClick={() => props.supabase.auth.signOut()} className={"font-bold"}>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to={"/login"} className="btn">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
