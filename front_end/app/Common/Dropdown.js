import React, { useState, useRef, useEffect } from "react";

export const DropdownSelect = ({
  options = [],
  multiselect = false,
  selected,
  onChange,
  setMultiselect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const singleKeys = ['Unknown', 'Mixed'];

  const toggleOption = (option) => {
    if (singleKeys.includes(option)) {
      onChange(option);
      setIsOpen(false);
      setMultiselect(false);
    } else {
      if (multiselect) {
        const newSelected = selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option];
        onChange(newSelected);
      } else {
        onChange([option]);
        setMultiselect(true);
      }
    }
  };

  const isSelected = (option) =>
    multiselect ? selected.includes(option) : selected === option;

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-left"
      >
        {multiselect
          ? selected.length > 0
            ? selected.join(", ")
            : "Select options"
          : selected || "Select an option"}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border-b outline-none"
          />
          <ul className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${isSelected(option) ? "bg-blue-500 text-white" : ""
                    }`}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
