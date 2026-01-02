import { Head } from "@inertiajs/react";
import { TextCursorInputIcon } from "lucide-react";
import AspectsForm from "@/components/master/form/aspects";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: dashboard().url,
    },
    {
        title: "Master",
        href: "#",
    },
    {
        title: "Aspects",
        href: master.aspects().url,
    },
    {
        title: "Add",
        href: "#",
    },
];

const AspectsAdd = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add Master Aspect`} />
            <div className="flex flex-col gap-6 p-4">
                {/* Header Card */}
                <Card className="border-primary/20">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TextCursorInputIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Add Master Aspect</CardTitle>
                                <CardDescription>Add new Master Aspect information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <AspectsForm />
            </div>
        </AppLayout>
    );
};

export default AspectsAdd;
