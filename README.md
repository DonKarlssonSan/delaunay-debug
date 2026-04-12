# About

This is a visualization of the Bowyer-Watson algorithm for performing delaunay triangulation for a set of points. You can run the [live demo here](https://donkarlssonsan.github.io/delaunay-debug/).

Just click the canvas to get going, keep on clicking to see each step.

You can also decide your self where the points should be placed and how many, using the settings UI in the upper right.

## Important Note
I'm using local copies of the files provided by my library [Delaunay.js](https://github.com/DonKarlssonSan/Delaunay.js) to be able to hack them as needed. If you are looking for an implementation that you can use in your own project, use that library instead. The algorithm used here is tweaked heavily for visualization purposes.

# Run locally
Install the dependencies:
```
npm install
```

This will use parcel to run a local dev server:

```
npm start
```

Look at the terminal output for the URL, normally http://localhost:1234.