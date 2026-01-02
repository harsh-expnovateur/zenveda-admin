const Card = ({ title, value, change }) => {
  const isPositive = change.startsWith("+");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      {/* Accent */}
      <div
        className={`absolute right-0 top-0 h-full w-1 ${
          isPositive ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <p className="text-sm text-gray-500">{title}</p>

      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-800">{value}</p>

        <span
          className={`text-sm font-medium ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {change}
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-400">Compared to total orders</p>
    </div>
  );
};

export default Card;
