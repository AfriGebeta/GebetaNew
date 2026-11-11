"use client"

import { EmptyState, Page } from "@/components/dashboard/page";
import { Wrench } from "lucide-react";

export default function MaintenanceError() {
    return (
        <Page>
            <EmptyState
                icon={<Wrench />}
                title="API usage is under maintenance"
                description="Usage data isn't available at the moment. We'll be back shortly."
            />
        </Page>
    )
}
