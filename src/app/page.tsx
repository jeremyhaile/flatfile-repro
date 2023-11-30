"use client";
import { memo, useMemo } from "react";
import api, { Flatfile } from "@flatfile/api";
import FlatfileListener from "@flatfile/listener";
import { useSpace } from "@flatfile/react";
import { Property } from "@flatfile/api/api";

export default function Home() {
  const space = memo(() => {
    const fields: Property[] = [
      { key: "phone", type: "string", label: "Cell Phone" },
      { key: "first_name", type: "string", label: "First Name" },
      { key: "middle_name", type: "string", label: "Middle Name" },
      { key: "last_name", type: "string", label: "Last Name" },
    ];

    const workbook: Pick<
      Flatfile.CreateWorkbookConfig,
      "name" | "sheets" | "actions"
    > = {
      name: "Contacts",
      sheets: [
        {
          name: "Contacts",
          slug: "contacts",
          mappingConfidenceThreshold: 0.8,
          fields: fields,
        },
      ],
      actions: [
        {
          operation: "contacts:submit",
          mode: "foreground",
          label: "Import",
          description: "Imports contacts",
          primary: true,
          constraints: [{ type: "hasAllValid" }],
        },
      ],
    };

    const listener = FlatfileListener.create((listener: FlatfileListener) => {
      listener.on(
        "job:ready",
        { job: "workbook:contacts:submit" },
        async ({ context: { jobId, workbookId } }) => {
          await api.jobs.ack(jobId, {
            info: "Importing...",
            progress: 1,
          });
        },
      ); // job:ready
    });

    const envId = 'REPLACE_ME'
    const publishableKey = 'REPLACE_ME'

    return useSpace({
      name: "Import Contacts",
      publishableKey: publishableKey,
      environmentId: envId,
      workbook,
      listener,
      sidebarConfig: {
        showSidebar: false,
      },
    });
  });

  const Space = useMemo(() => {
    return space;
  }, []);
  space.displayName = "Space";

  return (
    <main>
      <Space />
      <h1>Hello, World</h1>
    </main>
  );
}
