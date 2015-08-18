---
layout: post
title: Promises and events
---

Asynchronous programming sometimes feels like directing a Shakespeare play with kindergarten kids as actors. One kid forgot his line, another said her line too soon. Two wanted the main role, one just cried in the corner and the bright one that actually had talent, stayed home with an upset tummy. In the end you hope the audience doesn't realise that the battle scene wasn't scripted and anyway, there isn't supposed to be one in "Romeo and Juliet". Metaphors aside, in any medium size web app, you’ll stumble on unruly Ajax requests, slowly loading images of unknown dimensions and users clicking around before the fancy animation is done. Gone are the days of linear code and global variables that reliably kept application state. Hello closures and stack traces that start out of thin air.


For better or worse, functions are first class citizens in JavaScript and can be passed as arguments to other functions. When data comes, call function foo(). On error, call bar(), which will call baz() once the error window pops up, etc. But then, if not careful, you may either end up either defining many single-use functions, or your code becomes a callback matrioshka, several levels of indentation deep. This is known as callback hell and there are several methods to avoid it (being nice to your neighbour is not one, but it doesn't hurt). Two of them are promises and events.


You could say that comparing promises to events is like comparing Apples and Androids. Some people swear by the first, while some prefer the other. Either can be used for some applications, but each lets you do things the other doesn't.


Let's take a textbook example and build a blog. Your back-end has a /post endpoint for posts and a /post/:id/comments endpoint for getting comments. Here's what the post api returns:


Here are your comments:


Promises, Promises.


Promises are objects that can be resolved or failed. Promises solve callback hell by passing success callbacks through a chain of .then() methods, with an occasional .catch() to execute an error callback. You can return a promise and continue the .then() chain elsewhere in the code. The code is fairly legible and intuitive.


In any event...


Events are a way to call functions when something happens to an object. JQuery, arguably the most widely used front-end library, uses events with DOM objects to execute code on user activity. Backbone triggers events on models and collections, so views can update. Let's see the above example using Backbone:


Backbone = require(“backbone”);
Post = Backbone.Model.extend({ urlRoot: ‘/post’ });
Comments = Backbone.Collection.extend();


function displayPost(post) {
     
} 


post = new Post({ id: 1 });
post.on(‘sync’, displayPost);


Compared to promises, events slice your code into smaller bits. It's harder to trace the consequences of events. The documentation is also a bit more complicated, as you have to check what events get triggered by what objects, and when. Most APIs will stick to a short list of events shared among many objects. If the event identifiers are intuitive enough, the code is a legible set of "on X do Y" instructions.


Let's add the comment functionality.


Comments = Backbone.Collection.extend();


Now, let's make so that the post is only displayed when all images are loaded. Images come from different sources and have different byte sizes, so there's no telling what order they get loaded in. Promises make your life easy with the Promise.all() and Promise.props() methods:


With events, in turn, we can have callbacks in various places in the code attached to the same event. (Example use case and code)


The strong point of promises is then the multiple source - single target scenario. Events win in the single trigger - multiple unrelated callbacks case. If you want the peace of mind that your callbacks are executed in order, use sequences. If you prefer a ripple effect spanning several sections of code - events. Some people will then prefer to use promises for Ajax requests, but events on the view layer.


(Code using both?)





