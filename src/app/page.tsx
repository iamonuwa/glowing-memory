import { MapContainer } from "@/components/map/MapContainer";
import { DriverList } from "@/components/DriverList";

export default function Page() {
  return (
    <div data-testid="page-container" className="h-screen w-screen grid grid-cols-4">
      <div className="col-span-1 h-full overflow-hidden">
        <DriverList />
      </div>
      <div className="col-span-3 h-full">
        <MapContainer />
      </div>
    </div>
  );
}
