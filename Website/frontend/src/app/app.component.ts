import { Component, OnInit } from '@angular/core';
import { backendService } from './backend.service';
import { Search, RatingRange, OpeningHours } from './models/search.model';
import { ViewChild, ElementRef } from'@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild('mapContainer', {
      static: false
  }) gmap: ElementRef;

  title = 'places';
  searchString: string = "";
  isSearching: boolean = false;
  from = -1;
  to = -1;
  rating_Values = [0, 1, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  rating_Values_To = [0, 1, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  day = -1
  user_saves_place: boolean[] = Array.from({
      length: 8
  }, () => false);
  start = 1
  errorRating: string = "";
  errorOpeningHours = "";
  errorSearchString = "";
  showNoResultsMessage: boolean = false;
  valid: boolean = true;
  toDisabled: boolean = false;
  hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  minutes = ["00", "15", "30", "45"];
  timeFrom = {
      hours: -1,
      minutes: -1
  }
  timeTo = {
      hours: -1,
      minutes: -1
  }
  places = [];
  map: google.maps.Map;
  lat = 32.8062584
  lng = 34.987423

  marker = new google.maps.Marker({})
  coordinates = new google.maps.LatLng(this.lat, this.lng);

  mapOptions: google.maps.MapOptions = {
      center: this.coordinates,
      zoom: 13,
  };
  markers = []
  numberOfReviews = 0


  constructor(public backendService: backendService) {

  }


  mapInitializer(): void {
      this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);

      //Adding Click event to default marker
      this.marker.addListener("click", () => {
          const infoWindow = new google.maps.InfoWindow({
              content: this.marker.getTitle()
          });
          infoWindow.open(this.marker.getMap(), this.marker);
      });

      //Adding default marker to map
      this.marker.setMap(this.map);

      //Adding other markers
      this.loadAllMarkers();
  }

  loadAllMarkers(): void {
      this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
      this.markers.forEach(markerInfo => {
          //Creating a new marker object
          const marker = new google.maps.Marker({
              ...markerInfo
          });

          //creating a new info window with markers info
          const infoWindow = new google.maps.InfoWindow({
              content: marker.getTitle()
          });

          //Add click event to open info window on marker
          marker.addListener("click", () => {
              infoWindow.open(marker.getMap(), marker);
          });

          //Adding marker to google map
          marker.setMap(this.map);
      });
  }
  ngOnInit() {}


  getPlaces() {
      this.markers = [];
      this.isSearching = true;
      this.errorSearchString = '';
      const search: Search = {
          searchString: this.searchString,
          filters: {}
      };
      const validRate = this.filterRating(search);
      const validOpeningHours = this.filterOpeningHours(search);
      const validClosingHours = this.filterClosingHours(search);

      this.filterReviews(search);
      let searchStringValid = true;

      if (!this.searchString) {
          this.errorSearchString = 'Please enter a search string';
          searchStringValid = false;
          this.isSearching = false;
      }

      this.valid = validRate && validOpeningHours && validClosingHours && searchStringValid;

      if (this.valid) {
          this.backendService.getPlaces(search).subscribe(
              (data) => {
                  this.places = data.places;
                  this.places.sort((a, b) => b.rating - a.rating);
                  this.isSearching = false;
                  this.user_saves_place = Array.from({
                      length: this.places.length
                  }, () => false);

                  if (this.places.length > 0) {
                      this.coordinates = new google.maps.LatLng(this.places[0].location[0], this.places[0].location[1]);
                      this.mapOptions.center = this.coordinates;

                      // Delay the map initialization and marker loading to ensure the DOM is updated
                      setTimeout(() => {
                          this.mapInitializer();
                          this.places.forEach((place) => {
                              this.createMarkerArray(place);
                          });
                          this.loadAllMarkers();
                      }, 0);
                  }
                  this.showNoResultsMessage = this.places.length === 0;
              },
              (err) => {
                  window.alert(err.message);
                  this.isSearching = false;
              }
          );
      } else {
          this.isSearching = false;
      }
  }

  filterRating(searchObj: Search) {
      this.errorRating = '';
      if (this.from > this.to) {
          this.valid = false;
          this.errorRating = "From must be less than To";
          this.isSearching = false;
          return false;
      }
      if (this.from !== -1 && this.to !== -1) {
          let ratingRange: RatingRange = {
              from: this.from,
              to: this.to
          };
          searchObj.filters.rating_range = ratingRange;
      }
      return true;
  }


  filterOpeningHours(searchObj: Search) {
    if (this.day !== -1) {
        if (this.timeFrom.hours !== -1 && this.timeFrom.minutes !== -1) {
            let hoursFrom = this.formatTime(this.timeFrom.hours) + this.formatTime(this.timeFrom.minutes);
            let openingHours: OpeningHours = {
                day: this.day,
                from: hoursFrom
            };
            searchObj.filters.opening_hours = openingHours;
            return true;
        } else {
            // No specific hours specified, allow searching by day only
            let openingHours: OpeningHours = {
                day: this.day,
                from: ""
            };
            searchObj.filters.opening_hours = openingHours;
            return true;
        }
    }

    // No day selected, proceed without setting opening hours
    return true;
}

  filterClosingHours(searchObj: Search) {
      if (this.timeTo.hours !== -1 && this.timeTo.minutes !== -1) {
          let hoursTo = this.formatTime(this.timeTo.hours) + this.formatTime(this.timeTo.minutes);
          searchObj.filters.closing_hours = hoursTo;
          return true;
      }

      if (this.timeTo.hours === -1 && this.timeTo.minutes === -1) {
          return true;
      }

      this.errorOpeningHours = "Please fill all closing hours fields";
      return false;
  }

  formatTime(time: number): string {
      return time < 10 ? "0" + time.toString() : time.toString();
  }

  filterReviews(searchObj: Search) {
      if (this.numberOfReviews != 0) {
          searchObj.filters.minimum_amount_of_ratings = this.numberOfReviews;
      }
  }

  createMarkerArray(place) {
      let options = {
          position: new google.maps.LatLng(place.location[0], place.location[1]),
          map: this.map,
          title: place.name
      }
      this.markers.push(options);
  }

  clearForm() {
      this.searchString = "";
      this.from = -1;
      this.to = -1;
      this.day = -1;
      this.timeFrom.hours = -1;
      this.timeFrom.minutes = -1;
      this.timeTo.hours = -1;
      this.timeTo.minutes = -1;
      this.numberOfReviews = 0;
      this.errorOpeningHours = '';
      this.errorRating = '';
      this.errorSearchString = '';
  }

  getCombinedError(): string {
      let combinedError = '';
      if (this.errorSearchString) {
          combinedError += this.errorSearchString + ' ';
      }
      if (this.errorRating) {
          combinedError += this.errorRating + ' ';
      }
      if (this.errorOpeningHours) {
          combinedError += this.errorOpeningHours + ' ';
      }

      return combinedError.trim();
  }

  hasErrors(): boolean {
      return !!this.getCombinedError();
  }

  getPlaceholder(value: number): string {
      return value === -1 ? "Rating From" : '';
  }

  savedPlace(index) {
      this.user_saves_place[index] = !this.user_saves_place[index];
  }

  onRatingFromChange() {
      if (this.from !== -1) {
          this.to = this.from;
          this.rating_Values_To = this.rating_Values.filter(value => value >= this.from);
          if (this.to < this.from) {
              this.to = this.from;
          }
          this.toDisabled = false;
      } else {
          this.rating_Values_To = this.rating_Values.slice();
          this.toDisabled = false;
      }
  }
}