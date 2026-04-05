import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function DashboardLoading() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <SkeletonCard key={idx} className="h-[156px]" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <SkeletonCard className="h-72" />
                <SkeletonCard className="h-72" />
            </div>
            <SkeletonCard className="h-64" />
        </div>
    );
}
