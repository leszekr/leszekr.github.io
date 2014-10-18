---
title: Japan Today in the App store!
layout: post
published: true
---

Just refreshed the layout of this page. Working on some better showcase, some of the toy demos stopped working.

My first app has reached the app store. Japan Today ([app store link](https://itunes.apple.com/jp/app/japan-today/id681497824?l=en&mt=8)), a smartphone reader app for the [Japan Today](http://japantoday.com) news site. Made with the wonderful team at [G + Media](http://gplusmedia.com/en/).

![Japan Today screenshot ](/img/blog/japantoday.png)

Working with [Phonegap][pg] has been joyful, but seeking alternatives to [JQuery Mobile][jqm]. Too verbose, too much backwards-compatibility and the most basic optimizations for mobile have to be done with plugins or hacks. 

I'm becoming a fan of [Lungo][] by [TapQuo](https://github.com/tapquo), which seems to be exactly what I would expect from a mobile-first library:

1. HTML5, can now write `<footer>` instead of `<div class="footer">`,
2. Event-driven (and well done),
3. Touch-enabled by default, the sidebars slide as I slide my finger, not only after!

Japan Today v2 might be a Lungo/Angular app, might be a native app. Time will tell.

[pg]: http://phonegap.com
[jqm]: http://jquerymobile.com
[lungo]: http://lungo.tapquo.com