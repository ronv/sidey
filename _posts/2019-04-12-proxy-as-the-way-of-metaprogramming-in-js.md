---
layout: post
title: Proxy as the way of metaprogramming in JS
description: How to use Proxy es6 object in JS for metaprogramming
summary: This is a collection of examples that show how to use a Proxy in JS.
tags: [js, proxy, metaprogramming, reflect]
comments: true
---

Important note: Described _Proxy_ JS object is something different than one of the OOP patterns.

Since I started using JS every single day I’ve experienced some weird aspects of JS. One of them annoys me - `undefined` instead of code execution error when accessing unexistent properties. The JS behavior in this aspect is slightly different from Ruby that I'm used to:

<script src="https://gist.github.com/patrykboch/48bf5dd1f626c2c889c8bfa43931dd51.js"></script>

and a Ruby equivalent:

<script src="https://gist.github.com/patrykboch/c29bb0a5faacee9c1548c23eb4eff44b.js"></script>

Ruby produces the error throw, JS returns `undefined`. Imagine working on a big JS project and a small property typo breaks an app - because of `undefined` instead of the _key not found_ throw - don’t know why and where since there are lots of possibly places for `undefined` (debugging undefined may take a long time). Luckily the ES6+ standard gives a solution to this via built-in Proxies objects.

Since the release of ES6, JS is known as fully reflective programming language as the Reflection API has been advanced.

>Reflection is the ability of a computer program to examine, introspect, and modify its own structure and behavior at runtime.

That means a program can process itself on the three noted levels. Please note ES5 has provided the ability to reflective introspection and self-modification: `Object.keys()` for introspection or `Object#delete` for self-modification - all `Object.*` methods are taken as reflective for metaprogramming, but neither they nor other ES5 features support the third level of reflection - _behavioral level_ and it was the reason for introducing proxies in ES6 that change built-in language operations.

> The Proxy object is used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc). [(official docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming)

Using proxies is a manner for virtualizing objects eg. POJOs. Virtualized object peeks the same as a given object, and any operation on a given one directs to an already created virtualized by a proxy object. By virtualization, we can take control of standard methods default behavior by intercepting invocations and re-defining them.

<script src="https://gist.github.com/patrykboch/cf189feaad1e574d01194ff9d9a04a31.js"></script>

Nothing special above, virtualization of the object and the property lookup without invoking any operations
(see: [no-op forwarding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#No-op_forwarding_proxy)). 
If you add a property for an object, the same property for a proxy object is added. Kinda symlink, but proxies are built 
for intercepting the low-level operations on the target object indeed. The first argument for the `Proxy` constructor is target, the second is handler.

## Error instead of _undefined_
_...when accessing non-existent property with the `get` trap._

Let's figure out a problem mentioned at the beginning of the article. How we can change the default behoaviour that ends with `undefined` instead of code execution error like in Ruby or Python? At the beggining let's describe the default behaviour with a proxy object:

<script src="https://gist.github.com/patrykboch/d069e35aaf76b55c5f75ffe6a35eef34.js"></script>

Let's change the default behaviour:

<script src="https://gist.github.com/patrykboch/3e2608d8ba474e311066d7bafe06127e.js"></script>

I use the `get` trap to intercept the default behavior when accessing the property. I passed three arguments to the trap: 1) the `trapTarget` - the target object for the proxy, 2) the `key` - the property and 3) the `receiver` - it's the proxy reference.
Logic ends with `Reflect` - the js object without constructor which expresses a default js behavior. Every proxy trap has an equivalent in a `Reflect` method.
<br> 
<br> 
<center><div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;lightbox&quot;:false,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxfile modified=\&quot;2019-04-28T10:57:51.851Z\&quot; host=\&quot;www.draw.io\&quot; agent=\&quot;Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36\&quot; etag=\&quot;KT1R89YZZIPHrD0EufzU\&quot; version=\&quot;10.6.5\&quot; type=\&quot;device\&quot;&gt;&lt;diagram id=\&quot;lh_yR_ml-EyFlSGjHwGa\&quot; name=\&quot;Page-1\&quot;&gt;3VnfU+IwEP5rmLl70GmbttBHFfUevNE7nbnTt0BDG680TAhC/esvoUl/JMWCUnR4orvdbpJv90t2Qw9cTFfXFM7inyRESc+xwlUPDHuOY7vBgP8ITZZrAiEJRURxKI1KxT1+RVJpSe0Ch2heM2SEJAzP6soxSVM0ZjUdpJQs62YTktRHncEIGYr7MUxM7R8csjjXDjyr1P9AOIrVyLYl30yhMpaKeQxDsqyowGUPXFBCWP40XV2gRICncMm/u9rwtpgYRSnb5oMgunGePHobXi+sx+df/5wna3Di515eYLKQC76dIQoZJqmcNcsUFMsYM3Q/g2MhL3m4e+A8ZtOESzZ/lJ4QZWi1cYp2sXCeMYhMEaMZN5EfOArWTKWPlJcl9AXAcQV2ZQdltKPCdQkIf5CY7IBP38DnN5ovEvYJ4HiDrwbOwADHgAWFnE1SRMmILC9LxflawV8IWDCnXB0yShZpiMT4VgGgcPc2fHx0sqBj1J7zDNIIsbbYm+GgKOH8eKnPownb9adnlMKsYjAjOGXziuc7oSijDFwtyr7Gas3e7TdnRRnXfAZllIulvD/wanM+SOR5fGn2VwinwFHyI5dPrFPLU4rhqmo+zKrSHaKYLxlRpVxhljt0PCk+yqHFc+lKCFlHCfjRxDIyoTgyVSYMNN7n85JfvZVSrlNz5PiDuqOcOYajXVPd1SZsHGA6NbQNUC144zp0/1aLf78ZwG3no1G1I+rZh6ReQRTfrTJFMK+gTjNdhGDwrmSyVyWy3ULi7al3mD29YRP2NMYE76OerxdAOof3RD29lmijnuftRj2gn0pBi32g2fcPQSXXoNKUhHjCWdFY//LSjWlsQXP8CkdrA5GoEnZu7Z33vCHXwAUj87ypER/ABEcpf07QRLhSHDyTakZE2TjnVSROowchDE/c/VSPrlNPUeCY1WPQUDw6XRWPtllah2gC17W1NUIxfMGE9sTwV2uCThLe3q3D4icCuxF/6UdsjY6pOabQGeQADYW/3xA70FnszMqfo4f4Fjc7PuboZYHTAP+gAX27M/QDA/35DI3FxiWoAxV1jikIntUehMbmt7MoALMQexBt/+EvBow6t78lNp1dDADzZL2jZJV9+35cWVlkYaahXEHeO2hSmoeqgXi1OyCUxSQiKUyqLUK9CShtbsgaPYH5M2Isk7e1IhxNSb2XXhnIsqW1st9LU71rHe1odXRLmfu2eTdVrgKwesU7ehZX5YffqfT73U+/wVQ3HZ/Ml7LP7m9/IVXppvu1drpsoD/aTn8xdpp8Chr5tHPbrfuxPc3RntpuoDVhqpLf2Ba/bd/NhuECgxMxTMMEHVlJaQQ98IzdqKmresfhzcXyf748TuW/peDyPw==&lt;/diagram&gt;&lt;/mxfile&gt;&quot;}"></div>
<script type="text/javascript" src="https://www.draw.io/js/viewer.min.js"></script></center>
<br> 
<br> 

Intercepting operations are possible by handler and a proxy trap - a function that is responsible for operation and it's passed always as the second proxy argument.
On the diagram I've displayed two branches - default behavior, and interception of a default behavior by Proxy. 
Default reflection on the basic level returns `undefined`. We can achieve the same result with proxy too. 

<script src="https://gist.github.com/patrykboch/53d8b22a4c7a58ae4951dd97574c3b0b.js"></script>

The second branch - `Proxy` intercepts default behaviour by get trap in the handler and raises an error in the code example if property doesn't exist.
Note: `get` trap is one of many others traps - 
[see all available traps for the `Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Methods_of_the_handler_object). 

## Building two-way data binding using _Proxy_
Moving on let’s dive into a more complex thing. If you’re familiar with AngularJS or VueJS you’re probably into two-way data binding concept as it's the main philosophy of these frameworks (see [AngularJS](https://docs.angularjs.org/guide/databinding) docs or [VueJs example of _v-model_](https://vuejs.org/v2/guide/forms.html))

> Two-way-data binding links the state with the view. If the state changes the view is updated and if the view changes the state will be updated.

If you want to write your own js framework based on two-way data binding then using Proxy is the way to go. A proxy can link our view with application state. Look at the following example:

<script src="https://gist.github.com/patrykboch/3d7b1627643facc4cbdf0ba273d4a877.js"></script>
<script src="https://gist.github.com/patrykboch/13f5bd92ce082e698aabe2f90032e173.js"></script>
[see live example](https://jsfiddle.net/edzv5L0q/)<br>

The view and the state have been binded. Changing the state changes the view. At first, I added a new attribute
`data-model` to the DOM input elements. The model links input value with the app state, so that's the main part of 
two-way data binding. I designed the simple state interface afterwards that contains two keys (name and hobby). 
The important thing - only keys that are set in the interface can be updated in a proxy - i.e. `state.strangerKey = 'Hello'` will raise an error.
Next thing is creating a proxy with `set` trap in the handler. Between calling default engine set behaviour we added `updateView` - 
it means that every attempt of setting state will update the input values in the view. From a view to a state direction.
I implemented listeners that listen to input value changes in the view and trigger the state change. So the important thing is 
registering listeners on DOM elements as only registered listeners can change the state via `onInputChange` event handler.  

The journey with Proxy wound up, I presented the most common proxy traps - get and set but keep in mind 
that Proxy supports twelve more handlers which can be used for different purposes, especially in metaprogramming.

PS. Metaprogramming rocks :).
<br>
