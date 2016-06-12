# Uber Price Tracker

Uber price data provides interesting insight into the effects of supply and demand
on the cost of taking an uber.  This application will allow a user to compile real
time price data into a csv file or SQLite Database.

## Prerequisites

### Node Installation

To run this script, you will need to have nodeJS installed on your machine. Go
to the [NodeJS website](https://nodejs.org) and follow the instructions specific
to your machine.

### Uber API Access

You will need to create an Uber developer account, and register an app to gain
API Access.  You can do both from the [Uber developer website](https://developer.uber.com/).

After registering your app, ensure that grab the Server Token. This will be
necessary to run the application.

## Setup

### Uber Server Token

To access the uber api, you will need to add your uber server token to the app. To do so,
open config.json and add your token next to the 'serverToken' property.

### Configure Locations

The application allows the user to specify which locations the user would like to
get price data for.  They can do so by modifying the locations.json file.  The file
is templated with Boston neighborhoods, but you can swap the information in the file
out with locations of your choice. You can get the latitude and longitude of your
desired locations via Google Maps.

The end destination is also configurable.  You can modify the destination in the
config.json file.

## Running the application

Now that the setup is complete, you will be able to run the application.  Open
your terminal/command prompt and navigate to the root of the application.  Run
npm install to add necessary dependencies first.

```bash
npm install
```

To gather your data in csv format, run

```bash
node index.js
```

If you prefer your data stored in a sqlite database, run

```bash
node index.js sqlite
```
