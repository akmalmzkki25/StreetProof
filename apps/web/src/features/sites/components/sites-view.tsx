"use client";

import { asSiteTimeZone, timeZoneLabel } from "@streetproof/domain";
import type { listSitesWithLocations } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";
import { Button, buttonVariants } from "@streetproof/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@streetproof/ui/components/empty";
import { useState } from "react";

import { Link } from "@/components/locale-link";
import { SideDrawer } from "@/components/side-drawer";
import { useI18n } from "@/lib/i18n/client";

import {
  AddLocationForm,
  AddSiteForm,
  EditSiteForm,
  LocationRow,
  SiteActiveForm,
  TenantNameForm,
} from "./site-forms";

type Site = Awaited<ReturnType<typeof listSitesWithLocations>>[number];
type Drawer =
  { kind: "add" } | { kind: "organisation" } | { kind: "site"; id: string };

export function SitesView({
  sites,
  tenantName,
  appUrl,
}: {
  sites: Site[];
  tenantName: string;
  appUrl: string;
}) {
  const { t } = useI18n();
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function openDrawer(next: Drawer) {
    setDrawer(next);
    setIsDrawerOpen(true);
  }

  const selected =
    drawer?.kind === "site"
      ? sites.find((site) => site.id === drawer.id)
      : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <p className="type-caption text-muted-foreground">{tenantName}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openDrawer({ kind: "organisation" })}
          >
            {t("Organisation")}
          </Button>
          <Button size="sm" onClick={() => openDrawer({ kind: "add" })}>
            {t("Add site")}
          </Button>
        </div>
      </div>

      {sites.length === 0 ? (
        <Empty className="flex-none py-16">
          <EmptyHeader>
            <EmptyTitle>{t("No sites yet")}</EmptyTitle>
            <EmptyDescription>
              {t("Add a building to start taking reports.")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-3 p-4 sm:p-6 lg:grid-cols-2">
          {sites.map((site) => {
            const activeLocations = site.locations.filter(
              (location) => location.active,
            );
            return (
              <li
                key={site.id}
                className="flex flex-col gap-4 rounded-4xl bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="type-title">{site.name}</h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {appUrl}/report/{site.intakeCode}
                    </p>
                    {site.address ? (
                      <p className="type-caption text-muted-foreground">
                        {site.address}
                      </p>
                    ) : null}
                  </div>
                  <span className="flex gap-1">
                    <Badge variant="outline">
                      {timeZoneLabel(asSiteTimeZone(site.timezone))}
                    </Badge>
                    {site.active ? null : (
                      <Badge variant="destructive">{t("Inactive")}</Badge>
                    )}
                  </span>
                </div>
                <p className="type-caption text-muted-foreground">
                  {activeLocations.length === 0
                    ? t("No locations yet.")
                    : activeLocations
                        .map((location) => location.name)
                        .join(", ")}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDrawer({ kind: "site", id: site.id })}
                  >
                    {t("Manage")}
                  </Button>
                  {site.active ? (
                    <Link
                      href={`/print/sites/${site.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      {t("QR poster")}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <SideDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title={
          drawer?.kind === "add"
            ? t("Add a site")
            : drawer?.kind === "organisation"
              ? t("Organisation")
              : (selected?.name ?? t("Site"))
        }
      >
        {drawer?.kind === "add" ? <AddSiteForm /> : null}
        {drawer?.kind === "organisation" ? (
          <TenantNameForm name={tenantName} />
        ) : null}
        {selected ? (
          <div key={selected.id} className="flex flex-col gap-8">
            <EditSiteForm
              siteId={selected.id}
              name={selected.name}
              intakeCode={selected.intakeCode}
              timezone={selected.timezone}
              place={{
                address: selected.address,
                latitude: selected.latitude,
                longitude: selected.longitude,
              }}
            />
            <section
              aria-labelledby={`locations-${selected.id}`}
              className="flex flex-col gap-3 border-t pt-6"
            >
              <h3 id={`locations-${selected.id}`} className="type-title">
                {t("Locations")}
              </h3>
              <p className="type-caption text-muted-foreground">
                {t(
                  "Reporters choose from these. A retired location leaves the form, and its tickets keep it.",
                )}
              </p>
              {selected.locations.length > 0 ? (
                <ul className="flex flex-col divide-y">
                  {selected.locations.map((location) => (
                    <LocationRow key={location.id} location={location} />
                  ))}
                </ul>
              ) : null}
              <AddLocationForm siteId={selected.id} />
            </section>
            <SiteActiveForm siteId={selected.id} isActive={selected.active} />
          </div>
        ) : null}
      </SideDrawer>
    </>
  );
}
