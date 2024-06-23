export interface NeighborhoodProps {
  name: string;
}

export interface RawNeighborhoodProps {
  nhood: string;
}

interface IncidentCount {
  name: string;
  count: number;
}
export interface NeighborhoodDataResp {
  categoryCounts: IncidentCount[];
  countsByHour: number[];
  medianPerDay: number;
}

export interface IncidentFilterProps {
  categoryFilters: string[];
  timePeriodFilter: string;
}

export const defaultIncidentFilters = (): IncidentFilterProps => ({
  categoryFilters: [],
  timePeriodFilter: "1YEAR",
});
