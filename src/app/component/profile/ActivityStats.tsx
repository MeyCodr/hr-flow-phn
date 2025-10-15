import { ProfileComponentProps } from "./ProfileComponent";

export default function ActivityStats({ stats }: ProfileComponentProps) {
  if (!stats || stats.length === 0) {
    return (
      <div>
        <h1 className="font-semibold text-xl">Activity Stats</h1>
        <p className="text-indigo-800 text-sm font-light">
          No activity recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="font-semibold text-xl">Activity Stats</h1>
        <p className="text-indigo-800 text-sm font-light">
          Your form submission overview
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 w-full my-6 flex-wrap">
        {stats.map((item, i) => (
          <div
            key={i}
            className="flex-1 min-w-[120px] flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100"
          >
            <p className={`text-2xl font-semibold ${item.color}`}>
              {item.value}
            </p>
            <p className="text-xs text-gray-700 text-center whitespace-nowrap">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
