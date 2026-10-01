import { formatDuration, formatPrice } from "@/libs/utils";
import { ServiceDetailDTO } from "@/types/service";
import Link from "next/link";


export default function ServiceCard({ service }: { service: ServiceDetailDTO }) {
  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="font-serif text-xl font-bold text-gray-900">{service.name}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-700">{service.description}</p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">{formatDuration(service.durationMinutes)}</span>
        <span className="font-semibold text-accent-dark">{formatPrice(service.price)}</span>
      </div>

      <Link
        href={`/booking?serviceId=${service.id}`}
        className="mt-5 inline-flex justify-center rounded-full bg-accent px-6 py-2 font-semibold text-gray-900 hover:brightness-95"
      >
        Book now
      </Link>
    </article>
  );
}
