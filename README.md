# meditation-retreat-agent
an agent that searches and compiles together upcoming meditation retreats

## Running the Calendar Application

To run this calendar application, follow these steps:

### 1. Set up a local server

You need a local server to run this application properly. Choose one of the following options:

#### Option A: Using Python

If Python is installed on your system:

1. Open a terminal or command prompt.
2. Navigate to the directory containing your `calendar.html` and `events.json` files.
3. Run one of these commands:
   - For Python 3: `python -m http.server 8000`
   - For Python 2: `python -m SimpleHTTPServer 8000`

#### Option B: Using Node.js

If Node.js is installed on your system:

1. Open a terminal or command prompt.
2. Install `http-server` globally by running: `npm install -g http-server`
3. Navigate to the directory containing your files.
4. Run: `http-server -p 8000`

### 2. View the calendar

1. Open a web browser (like Chrome, Firefox, or Edge).
2. Go to the address: `http://localhost:8000/calendar.html`

You should now see your calendar application running, displaying the events from your JSON file.

**Note:** Keep the terminal window open while using the calendar, as closing it will shut down the local server.