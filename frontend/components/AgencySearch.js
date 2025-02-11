import { useState, useEffect } from 'react';
import Select from 'react-select';

export function AgencySearch({ agencies, selectedAgency, onSelect }) {
  const options = agencies.map(agency => ({
    value: agency.slug,
    label: agency.name,
    agency: agency // Pass the full agency object
  }));

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      // Pass the full agency object to maintain consistency with home page clicks
      onSelect(selectedOption.agency);
    } else {
      onSelect(null);
    }
  };

  const value = selectedAgency ? {
    value: selectedAgency.slug,
    label: selectedAgency.name,
    agency: selectedAgency
  } : null;

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={options}
      isClearable
      placeholder="Select an agency..."
      className="w-full"
      classNamePrefix="select"
    />
  );
} 