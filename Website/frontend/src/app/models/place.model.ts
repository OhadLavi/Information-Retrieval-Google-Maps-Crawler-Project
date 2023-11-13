export interface Place {
    place_id: string;
    name: string;
    opening_hours: OpeningHours;
    rating: number;
    amount_of_ratings: number;
    location: number[]; //lenght of 2
    address: string;
    phone_number: string;
    maps_url: string;
    website_url: string;
}

export interface OpeningHours {
    open_now: boolean;
    opening_hours_text: string[]; //from 0 to 6
    periods: PeriodTime[]; //from 0 to 6
}

export interface PeriodTime {
    open: Time;
    close: Time;
}

export interface Time {
    day: number;
    time: string;
}
  