import { Head, Link, router } from "@inertiajs/react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import DeleteDialog from "@/components/commons/delete-dialog";
import PaginationNav from "@/components/commons/pagination-nav";
import TableShowTotalText from "@/components/commons/table-show-total-text";
import TableTextSearch from "@/components/commons/table-text-search";
import InputsTable from "@/components/master/table/inputs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalDeleteHook } from "@/hooks/use-global-delete-hook";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import master from "@/routes/master";
import type { BreadcrumbItem, Pagination } from "@/types";
import type { Aspect } from "@/types/aspect";
import type { MasterInput, MasterInputFilters } from "@/types/master-input";

export interface InputsIndexProps {
    page: Pagination<MasterInput>;
    aspects: Aspect[];
    filters: MasterInputFilters;
}

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
        title: "Inputs",
        href: "#",
    },
];

const useFilters = () => {
    const baseUrl = master.inputs().url;

    const updateAndVisit = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

            if (!value.trim()) {
                params.delete(key);
            } else {
                params.set(key, value);
            }

            // Changing filters should reset to first page
            params.delete("page");

            const qs = params.toString();
            const nextUrl = qs ? `${baseUrl}?${qs}` : baseUrl;

            router.visit(nextUrl, { preserveScroll: true, preserveState: true, replace: true });
        },
        [baseUrl],
    );

    const resetAll = useCallback(() => {
        router.visit(baseUrl, { preserveScroll: true, preserveState: false, replace: true });
    }, [baseUrl]);

    return { updateAndVisit, resetAll };
};

const MasterInputFilterComponent = memo(({ filters, aspects }: { filters: MasterInputFilters; aspects: Aspect[] }) => {
    const { updateAndVisit, resetAll } = useFilters();
    const hasActiveFilters = Boolean(filters.search || filters.aspect_id);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <TableTextSearch
                params={{ search: filters.search ?? "" }}
                handleSelectChange={(v) => updateAndVisit("search", v.search ?? "")}
                text="Kode / Description"
                className="w-full sm:max-w-sm"
            />

            <Select value={filters.aspect_id ?? ""} onValueChange={(v) => updateAndVisit("aspect_id", v)}>
                <SelectTrigger className="w-fit min-w-48">
                    <SelectValue placeholder="Filter by Aspect" />
                </SelectTrigger>
                <SelectContent>
                    {aspects.map((aspect) => (
                        <SelectItem key={aspect.id} value={aspect.id}>
                            {aspect.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button onClick={resetAll} variant="outline" className="gap-2" aria-label="Reset filters">
                    <RefreshCwIcon className="size-4" /> Reset
                </Button>
            )}
        </div>
    );
});
MasterInputFilterComponent.displayName = "MasterInputFilterComponent";

const InputsIndex = ({ page, aspects, filters }: InputsIndexProps) => {
    const { id, setId, showDeleteDialog, setShowDeleteDialog } = useGlobalDeleteHook();
    const formUrl = useMemo(() => master.inputs.destroy(id).url, [id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Inputs" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Inputs Management</CardTitle>
                            <CardDescription>Manage your master inputs</CardDescription>
                        </div>
                        <Button className="gap-2" asChild>
                            <Link href={master.inputs.add().url}>
                                <PlusIcon className="h-4 w-4" />
                                Add Master Input
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MasterInputFilterComponent filters={filters} aspects={aspects} />
                        <TableShowTotalText page={page} tableName="inputs" />
                        <InputsTable page={page} setId={setId} setShowDeleteDialog={setShowDeleteDialog} />
                        <PaginationNav page={page} />
                    </CardContent>
                </Card>
            </div>
            <DeleteDialog
                formAction={formUrl}
                showDeleteDialog={showDeleteDialog}
                setShowDeleteDialog={setShowDeleteDialog}
            />
        </AppLayout>
    );
};

export default InputsIndex;
