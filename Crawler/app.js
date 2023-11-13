const https = require('https');
const fs = require('fs');
const { config } = require('process');

const GOOGLE_MAPS_API_KEY = config.googleApiKey;
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';

const getPlaces = (search) => {
  const { searchString } = search;
  const url = buildApiUrl('place/textsearch/json', { query: searchString });

  const options = {
    method: 'GET',
  };

  let request = https.request(url, options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to get an OK from the server. Status Code: ${res.statusCode}`);
      res.resume();
      return;
    }

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('close', () => {
      const dataJson = JSON.parse(data);
      const places = getPlacesIdFromResult(dataJson.results);

      if (dataJson.next_page_token) {
        getPlacesFromNextPage(dataJson.next_page_token, places, search);
      } else {
        getPlacesFullData(places, 0, search);
      }
    });
  });

  request.end();

  request.on('error', (err) => {
    console.error(`Error making a request: ${err.message}`);
  });
};

const getPlacesIdFromResult = (results) => {
  return results.map(result => ({
    place_id: result.place_id,
    data: undefined,
  }));
};

const buildApiUrl = (endpoint, params) => {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${GOOGLE_MAPS_API_URL}/${endpoint}?${paramString}&key=${GOOGLE_MAPS_API_KEY}`;
};

const getPlacesFromNextPage = (token, places, search) => {
  setTimeout(() => {
    const url = buildApiUrl('place/textsearch/json', { key: GOOGLE_MAPS_API_KEY, pagetoken: token });

    const options = {
      method: 'GET',
    };

    let request = https.request(url, options, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to get an OK from the server. Status Code: ${res.statusCode}`);
        res.resume();
        return;
      }

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('close', () => {
        const dataJson = JSON.parse(data);
        const newPlaces = getPlacesIdFromResult(dataJson.results);

        places.push(...newPlaces);

        if (dataJson.next_page_token) {
          getPlacesFromNextPage(dataJson.next_page_token, places, search);
        } else {
          getPlacesFullData(places, 0, search);
        }
      });
    });

    request.end();

    request.on('error', (err) => {
      console.error(`Error making a request: ${err.message}`);
    });
  }, 2000);
};

const getPlacesFullData = (places, index, search) => {
  if (places.length <= index) {
    places = getPlacesData(places);
    places = filterPlaces(places, search.filters);

    const output = {
      search: search,
      amount_of_places: places.length,
      places: places
    };
    console.timeEnd();
    fs.writeFileSync(`${search.searchString}.json`, JSON.stringify(output));
    return;
  }

  const url = buildApiUrl('place/details/json', { place_id: places[index].place_id });

  const options = {
    method: 'GET',
  };

  let request = https.request(url, options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to get an OK from the server. Status Code: ${res.statusCode}`);
      res.resume();
      return;
    }

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('close', () => {
      const dataJson = JSON.parse(data);
      places[index].data = dataJson.result;
      getPlacesFullData(places, index + 1, search);
    });
  });

  request.end();

  request.on('error', (err) => {
    console.error(`Error making a request: ${err.message}`);
  });
};

const getPlacesData = (placesFullData) => {
  return placesFullData.map(placeFullData => ({
    place_id: placeFullData.place_id,
    rating: placeFullData.data.rating,
    name: placeFullData.data.name,
    amount_of_ratings: placeFullData.data.user_ratings_total,
    address: placeFullData.data.formatted_address,
    phone_number: placeFullData.data.formatted_phone_number,
    maps_url: placeFullData.data.url,
    website_url: placeFullData.data.website,
    opening_hours: placeFullData.data.opening_hours,
    location: placeFullData.data.geometry && placeFullData.data.geometry.location
      ? [placeFullData.data.geometry.location.lat, placeFullData.data.geometry.location.lng]
      : []
  }));
};

const filterPlaces = (places, filters) => {
  return places.filter(place => !(
    needToFilterByMinimumAmountOfRatings(place, filters) ||
    needToFilterByRatingsRange(place, filters) ||
    needToFilterByOpeningHoursRange(place, filters)
  ));
};

const needToFilterByMinimumAmountOfRatings = (place, filters) => {
  if (filters.minimum_amount_of_ratings && (!place.amount_of_ratings || place.amount_of_ratings < filters.minimum_amount_of_ratings)) {
    return true;
  }
  return false;
};

const needToFilterByRatingsRange = (place, filters) => {
  if (filters.rating_range &&
    (!place.rating || place.rating < filters.rating_range.from || place.rating > filters.rating_range.to)) {
    return true;
  }
  return false;
};

const needToFilterByOpeningHoursRange = (place, filters) => {
  if (filters.opening_hours &&
    (!place.opening_hours || !place.opening_hours.periods || !place.opening_hours.periods[filters.opening_hours.day])) {
    return true;
  }

  const timeRange = place.opening_hours.periods[filters.opening_hours.day];
  const openingTime = timeRange.open.time;
  const closingTime = timeRange.close.time;

  if (timeCompare(filters.opening_hours.from, openingTime) < 0 ||
    (timeCompare(filters.opening_hours.to, closingTime) > 0 && filters.opening_hours.day === timeRange.close.day)) {
    return true;
  }

  return false;
};

const timeCompare = (time1, time2) => {
  const time1Hour = parseInt(time1.trim().substring(0, 2), 10);
  const time2Hour = parseInt(time2.trim().substring(0, 2), 10);
  const time1Minutes = parseInt(time1.trim().substring(2, 4), 10);
  const time2Minutes = parseInt(time2.trim().substring(2, 4), 10);

  if (time1Hour > time2Hour) {
    return 1;
  } else if (time1Hour < time2Hour) {
    return -1;
  }

  if (time1Minutes > time2Minutes) {
    return 1;
  } else if (time1Minutes < time2Minutes) {
    return -1;
  }

  return 0;
};

console.time();

const filters = {
  rating_range: { from: 2.5, to: 5.0 },
  minimum_amount_of_ratings: 5,
  opening_hours: { day: 3, from: '1400', to: '1600' }
};

const searchString = 'haifa italian restaurant';

const search = {
  searchString,
  filters,
};

getPlaces(search);