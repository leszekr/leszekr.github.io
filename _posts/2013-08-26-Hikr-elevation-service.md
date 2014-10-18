---
title: Hikr elevation service
layout: post
published: true
---

As part of the long-upcoming [hikr.jp](http://hikr.jp) service, I decided to publish a small script that adds elevation data to geoJSON, as an open service: paste or drag your geoJSON, will send you the same [GeoJSON](http://geojson.org/) with geographic coordinates extended by elevation.

**[Go check it out](http://elevation.hikr.jp)**

The source (minus the elevation data) is available [on my github page](https://github.com/nadsumatal/elevation.hikr.jp).

### How does it work?

[SRTM](http://en.wikipedia.org/wiki/Shuttle_Radar_Topography_Mission) stands for Shuttle Radar Topography Mission, an international project to gather elevation data for the whole planet. The data is available from various sources, I got mine from [here](ftp://ftp.glcf.umiacs.umd.edu/glcf/SRTM/), having found `.hgt` files the most suitable for my needs.

Each `hgt` file spans a single degree latitude and single degree longitude. A square (spherical geometry be damned) or 1200x1200 elevation pixels, each a two-byte big-endian integer, row major order. Thus finding the elevation of `[138.731E, 35.358N]` (top of mt Fuji) is a case of reading the correct two bytes in `N35E138.hgt`. I got this information from [this stackexchange answer](http://gis.stackexchange.com/questions/43743/how-to-extract-elevation-from-hgt-file).

The same `hgt` files were used to make [this demo](http://leszek.rybicki.cc/toys/mangledplain.html).

### What is this for?

In short, to display elevation of hand-drawn paths. 

A hand-drawn path, made in [geojson.io](http://geojson.io) by [MapBox](http://mapbox.com), looks like this:
<script src="https://gist.github.com/nadsumatal/6270746.js"></script>

This is a trail I went on last Sunday, drawn some time before the hike. 

### Alternatives

There are several elevation services on the market, with various restrictions applied. Most notably, [Google's elevation API](https://developers.google.com/maps/documentation/elevation/) may only be used to display results together with a Google map. I don't know of any that takes GeoJSON as input AND output.

### Work in progress

I'm working on expanding the area to the whole planet (gigabytes of data in `.hgt` files). May have to throttle access a bit if it actually gets some popularity.

The `hgt` files are full of holes, i.e. pixels where the value is unknown, represented as the number 32768 in the data. They need to be cleaned up a bit (a LOT). This is especially important if I want to use this for mountain areas.

I'm aware that I'm not fully supporting the GeoJSON format. Only supporting `Point`, `LineString` and `Polygon` at this point. 

Also, planning to make little visualizer, a bit like the [Mangled Plain](http://leszek.rybicki.cc/toys/mangledplain.html) demo. 

Happy mapping!