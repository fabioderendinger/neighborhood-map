# Neighborhood Map Project
This web app is a project for the Udacity [Full Stack Developer Nanodegree](https://www.udacity.com/course/full-stack-web-developer-nanodegree--nd004).

## About
The Neighborhood Map project involves developing a single page application featuring a map of my neighborhood with the KnockoutJS framework and various API's. Aside from the Google Maps API, additional information is added to the project locations with the Wikipedia API loaded asynchronously. KnockoutJS allows the project to be organized with the MVVM pattern.

## Features
- A Google Maps implemenation that shows a list of places around my hometown Zurich, CH.
- Filter option that uses an input field to filter both the list view and the map markers displayed by default on load
- Fully responsive design / Mobile friendly

## APIs
- Google Maps API is used here to show the map, generate the marker, get place details, etc.
- Wikipedia API is used to fetch more information about a specific location and show the user a snippet from the related Wikipedia article

## Code
CSS
- `styles.css` (custom css styles for the app)
- `materialize.min.css` (Materialize frameworkr)

JS
- `knockout-3.4.2.js` (Knockout framework)
- `app.js` (Main application file)
- `materialize.min.js` (Materialize framework)

HTML
- `index.html` is where all the magic happens and all the data is binded.

## Installation
Clone or download this repo, open the index.html file in your browser and enjoy!

## Live Demo
You can find a live demo of this project [here](https://fabioderendinger.github.io/neighborhood-map/).