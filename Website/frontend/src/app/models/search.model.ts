export interface Search {
    searchString: string;
    filters: Filters;
}

export interface Filters {
    rating_range?: RatingRange;
    minimum_amount_of_ratings?: number;
    opening_hours?: OpeningHours;
    closing_hours?: string; 
}

export interface RatingRange {
    from: number; //from 0
    to: number; //to 5
}

export interface OpeningHours {
    day: number; //from 0 to 6
    from: string; //1400
    to?: string; //1200
}