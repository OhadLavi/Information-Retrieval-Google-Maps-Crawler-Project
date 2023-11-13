# Information Retrieval - Google Maps API Crawler
## Preview
![Screenshot](https://user-images.githubusercontent.com/81176492/282477401-e969d102-ea85-48ef-b55f-d6f479d4b191.jpg)

## Description
This project is a part of the Information Retrieval course, aiming to enhance the search experience on Google Maps through a custom-built crawler using the Google Places API. Three unique features have been added to improve search functionality beyond what is available on the official Google Maps website:

1. **Rating Range Filter**: Users can filter places based on a specified range of ratings, for instance, between 3 and 4.

2. **Minimum Reviews Filter**: This feature allows users to filter places based on the minimum number of reviews written about a particular location.

3. **Opening Hours Range Filter**: Users can filter places based on the opening hours within a specified range. For example, open on Fridays from 10:00 to 14:00.

## Integration with Google Maps
The results of our filtering searches are seamlessly integrated with Google Maps. This allows users to visualize the location of each place directly on the map.

## Project Structure

### 1. Crawler (Node.js Project)
The crawler is implemented using Node.js to extract data from the Google Places API.

### 2. Website (Frontend and Backend)
The website comprises both frontend and backend components, providing a user-friendly interface for interacting with the filtered search results.

## Installation

1. Clone the project: `git clone https://github.com/OhadLavi/Information-Retrieval-Google-Maps-Crawler-Project.git`
2. Install Node.js
3. Install Angular CLI: `npm install -g @angular/cli`

## Running the Crawler Project

1. Open a terminal for the `crawler`, run these commands, and set your Google API key:
```
cd crawler
echo "module.exports = { googleApiKey: 'YOUR_GOOGLE_API_KEY' };" > config.js
node app.js
```
2. View the results displayed in the terminal.

## Running the Website Project

1. Open a terminal for the `backend`, run these commands, and set your Google API key:
```
cd backend
echo "module.exports = { googleApiKey: 'YOUR_GOOGLE_API_KEY' };" > config.js
npm install
node app.js
```
2. Open a terminal for the `frontend` and run these commands:
```
cd frontend
npm install
ng serve
```
3. Navigate to `http://localhost:4200/` in your browser.