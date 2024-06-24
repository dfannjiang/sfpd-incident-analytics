import React, { useState, useEffect } from "react";
import { apiUrl } from "./config.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import ScrollDownContainer from "./ScrollDownContainer";

interface IncidentCategoryFilterProps {
  onOptionSelect: (categories: string[]) => void;
}

const IncidentCategoryFilter: React.FC<IncidentCategoryFilterProps> = ({
  onOptionSelect,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(true);

  useEffect(() => {
    // Fetch options from API
    fetch(`${apiUrl}/incident-categories`)
      .then((response) => response.json())
      .then((data) => {
        setOptions(data.categories);
        setFilteredOptions(data.categories);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleInputChange = (event: any) => {
    const query = event.target.value;
    setQuery(query);
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleOptionClick = (option: any) => {
    setSelectedOptions((prevSelectedOptions) => {
      if (prevSelectedOptions.includes(option)) {
        return prevSelectedOptions.filter(
          (selectedOption) => selectedOption !== option
        );
      } else {
        return [...prevSelectedOptions, option];
      }
    });
    setQuery("");
    setFilteredOptions(options);
  };

  useEffect(() => {
    onOptionSelect(selectedOptions);
  }, [selectedOptions]);

  const handleRemoveOption = (option: any) => {
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.filter((selectedOption) => selectedOption !== option)
    );
  };

  const handleKeyDown = (event: any) => {
    if (
      event.key === "Backspace" &&
      query === "" &&
      selectedOptions.length > 0
    ) {
      setSelectedOptions((prevSelectedOptions) =>
        prevSelectedOptions.slice(0, -1)
      );
    }
  };

  const toggleFilterOptions = () => {
    setShowFilterOptions((prevShowFilterOptions) => !prevShowFilterOptions);
  };

  const handleRemoveAllOptions = () => {
    setSelectedOptions([]);
  };

  return (
    <div className="filter-container">
      {selectedOptions.length > 0 && (
        <span
          className="remove-all-options"
          onClick={() => handleRemoveAllOptions()}
        >
          Deselect all &times;
        </span>
      )}
      <ScrollDownContainer>
        {selectedOptions.map((option) => (
          <div className="selected-option" key={option}>
            {option}
            <span
              className="remove-option"
              onClick={() => handleRemoveOption(option)}
            >
              &times;
            </span>
          </div>
        ))}
      </ScrollDownContainer>
      <div className="input-container">
        <input
          type="text"
          value={query}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          placeholder="Filter on category..."
          className="search-bar"
        />
        <button onClick={toggleFilterOptions} className="toggle-filter-button">
          <FontAwesomeIcon
            icon={showFilterOptions ? faChevronDown : faChevronUp}
          />
        </button>
      </div>
      {showFilterOptions && (
        <div className="scroll-container">
          <ul>
            {filteredOptions.map((option) => (
              <li
                key={option}
                onClick={() => handleOptionClick(option)}
                className={selectedOptions.includes(option) ? "selected" : ""}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IncidentCategoryFilter;
