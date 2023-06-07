import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { Env } from "~/config";
import { getEnv } from "~/config";
import type { FilterParams, ForYouBill, UpdateFiltersFn } from "~/for-you";
import { ForYou, forYouData } from "~/for-you";
import type { RepLevel } from "~/levels";
import type { OfficialOffice } from "~/representatives";

interface LoaderData {
  legislation: ForYouBill[];
  offices: OfficialOffice[] | null;
  address: string | null;
  tags: string[];
  env: Env;
  filters: FilterParams;
}
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const filters: FilterParams = {
    tags: url.searchParams.get("tags")?.split(","),
    address: url.searchParams.get("address"),
    level: url.searchParams.get("level") as RepLevel,
  };

  const env = getEnv(process.env);

  const { legislation, tags, offices, address } = await forYouData({
    env,
    filters,
  });

  return json<LoaderData>({
    legislation,
    env,
    tags,
    filters,
    offices,
    address,
  });
};

interface ActionData {
  errors?: {};
}

export const action: ActionFunction = async ({ request }) => {
  return json<ActionData>({}, { status: 200 });
};

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  return {
    title: "Chicago Civi",
    viewport: "width=device-width,initial-scale=1",
    charset: "utf-8",
  };
};

export default function ForYouPage() {
  const { legislation, tags, filters, offices, env, address } =
    useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters: UpdateFiltersFn = ({ address, tags, level }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    address
      ? newSearchParams.set("address", address)
      : newSearchParams.delete("address");

    tags && Array.isArray(tags) && tags.length > 0
      ? newSearchParams.set("tags", tags.join(","))
      : newSearchParams.delete("tags");
    level
      ? newSearchParams.set("level", level)
      : newSearchParams.delete("level");
    setSearchParams(newSearchParams);
  };

  return (
    <ForYou
      env={env}
      tags={tags}
      legislation={legislation}
      offices={offices}
      address={address}
      filters={filters}
      updateFilters={updateFilters}
    />
  );
}
