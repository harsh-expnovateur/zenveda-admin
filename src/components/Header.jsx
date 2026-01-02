import { FiSearch, FiBell, FiUser, FiMenu } from "react-icons/fi";

const Header = ({ collapsed, onToggleSidebar }) => {
  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16
      ${collapsed ? "left-20" : "left-64"}
      transition-all duration-300
      bg-white/70 backdrop-blur-xl border-b border-gray-200
      flex items-center justify-between px-4 md:px-6`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        {/* <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <FiMenu />
        </button> */}

        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          Dashboard
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search (Hidden on small screens) */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search anything..."
            className="w-64 rounded-xl border border-gray-200 bg-white px-4 py-2 pr-10 text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <FiBell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 
          flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
