import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div>
      <h1 className="text-4xl lg:text-8xl text-fuchsia-950">Rue is an AI-enabled marketplace to help brands unlock the best ambassadors ever: everyday hosts.</h1>
    </div>
  );
}
