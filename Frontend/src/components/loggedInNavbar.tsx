import { useState,useRef, useEffect  } from "react";
import { useNavigate } from "react-router-dom";


interface LoggedInNavbarProps {
  title: string;
  type: string; }

export const LoggedInNavbar: React.FC<LoggedInNavbarProps> = ({ title, type }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [availableBalance, setAvailableBalance] = useState(0);

  const user = {
    name: "John Advertiser",
    email: "john@advertiser.com",
    avatar: "https://i.pravatar.cc/150?img=32",
  };
  const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  if (showMenu) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showMenu]);


  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-gray-50 mb-6">
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-3xl font-bold text-gray-800"> {title}</h1>

        <div className="relative flex gap-6 items-center">
          {type === "acquisition" && (
            <button
            onClick={() => setShowAddFundsModal(true)}
            className="px-6 py-2 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-700 transition"
          >
            Add Funds
          </button>
          )}
          {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 ">
          <div className="bg-white w-full max-w-md rounded-xl p-8 shadow-lg relative">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add Funds to Wallet</h2>
              <div className="text-md text-right">
                <p className="text-md text-gray-400 px-6">Available Funds</p>
                <p className="text-purple-600 text-md font-semibold px-6">${availableBalance.toFixed(3)}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAddFundsModal(false);
                setAmount("");
              }}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-2xl"
            >
              ×
            </button>

            <label className="block text-md font-medium text-gray-600 mb-1">Enter Amount</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Minimum funds is $50"
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-md"
            />

            {amount !== "" && Number(amount) < 50 && (
              <p className="text-md text-red-500 mb-2">⚠️ Amount should be at least $50</p>
            )}

            <div className="text-md text-gray-600 mb-4">
              <p>Funds to be added: ${amount || "--"}</p>
              <p>Funds in INR: ₹{amount ? (Number(amount) * 85.171).toFixed(2) : "--"}</p>
              <p>GST (18%): ₹{amount ? ((Number(amount) * 85.171) * 0.18).toFixed(2) : "--"}</p>
              <div className="mt-2 bg-gray-100 inline-block px-2 py-1 rounded text-md text-gray-700">
                Applied Conversion Rate: $1 ≈ ₹85.171
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input id="coupon" type="checkbox" className="mr-2" />
              <label htmlFor="coupon" className="text-md text-gray-700">
                I have a coupon code
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setAmount("");
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={amount === "" || Number(amount) < 50}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                onClick={() => {
                  setShowAddFundsModal(false);
                  setAmount(amount);
                }}
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

          {/* <ModeToggle /> */}

          <div
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-purple-500 cursor-pointer border flex items-center justify-center text-white font-bold border-gray-300"
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>

          {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border"
              >
                <div className="p-4 border-b">
                  <p className="font-semibold text-sm text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-700">{user.email}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  onClick={() => navigate("/login")}
                >
                  Log out
                </button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};
