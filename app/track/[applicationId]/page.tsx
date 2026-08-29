import { decodeApplication, computeTimeline } from "@/lib/applicationCodec";
import TrackerClient from "./TrackerClient";

export default function TrackPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const applicationId = decodeURIComponent(params.applicationId);
  const data = decodeApplication(applicationId);
  if (!data) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Application not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Check the link and try again. IDs start with PS and encode the filing details.
        </p>
        <a href="/chat" className="mt-6 inline-block text-brand-teal underline">
          Ask Sathi something
        </a>
      </div>
    );
  }
  const timeline = computeTimeline(data);
  return (
    <TrackerClient data={data} initialTimeline={timeline} applicationId={applicationId} />
  );
}
