---
layout: post
title: Proxy as the way of metaprogramming in JS
description: How to use Proxy es6 object in JS for metaprogramming
summary: This is a collection of examples that show how to use a Proxy in JS.
tags: [js, proxy, metaprogramming, reflect]
comments: true
---

Important note: Described _Proxy_ object is something different than one of the OOP patterns.

I've seen several odd JS characteristics ever since I started using it on a daily basis. One of these irritates me — `undefined` rather than a code execution error when attempting to access properties that don't exist. In this regard, JS behaves somewhat differently from my experience with Ruby:

<script src="https://gist.github.com/patrykboch/48bf5dd1f626c2c889c8bfa43931dd51.js"></script>

and a Ruby equivalent:

<script src="https://gist.github.com/patrykboch/c29bb0a5faacee9c1548c23eb4eff44b.js"></script>

The error throw is produced by Ruby, but JS returns `undefined`. Imagine working on a large JS project and a simple property typo results in an app being broken because `undefined` was used instead of the _key not found_ throw. You would not know why or where this happened because `undefined` may appear throughout many different places (debugging undefined may take a long time). Fortunately, the built-in Proxies objects provided by the ES6+ standard provide a solution to the concern.

Since the release of ES6, JS is known as fully reflective programming language as the _Reflection API_ has been advanced.

>Reflection is the ability of a computer program to examine, introspect, and modify its own structure and behavior at runtime.

That implies that a program can execute on each of the three levels mentioned. Please be aware that ES5 has provided the potential of reflective introspection and self-modification - `Object.keys()` for introspection or `Object#delete` for self-modification - also all `Object.*` methods are taken as reflective for metaprogramming, but neither they nor other ES5 features support the third level of reflection - _behavioral level_ which is the reason for the introduction of proxies in ES6 that alter built-in language operations.

> The Proxy object is used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc). [(official docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming)

Using proxies is a way for virtualizing objects eg. POJOs. Virtualized object peeks the same as a given object, and any operation on a given one directs to an already created virtualized by a proxy object. By virtualization, we can take control of standard methods default behavior by intercepting invocations and re-defining them.

<script src="https://gist.github.com/patrykboch/cf189feaad1e574d01194ff9d9a04a31.js"></script>

Nothing special above, virtualization of the object and the property lookup without invoking any operations
(see: [no-op forwarding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#No-op_forwarding_proxy)). When you add a property to an object, the same property is added to the proxy object. Although it is a symlink, proxies are designed to intercept low-level operations on the target object.

## Error instead of undefined
_...when accessing non-existent property with the `get` trap._

Let's solve the issue that is raised at the beginning of the post. How can the default behavior, which terminates in `undefined` be changed to an error caused by code execution like in Ruby or Python? Let's start by describing the default behavior using a proxy object:

<script src="https://gist.github.com/patrykboch/d069e35aaf76b55c5f75ffe6a35eef34.js"></script>

Let's change the default behaviour:

<script src="https://gist.github.com/patrykboch/3e2608d8ba474e311066d7bafe06127e.js"></script>

I passed the trap the following three arguments: 1) the target object for the proxy is denoted the `trapTarget` 2) the `key` - the property and 3) the `receiver` - the proxy reference. The js object `Reflect`, which describes the default behavior of js. Please note there is a `Reflect` technique for each proxy trap.

To recap, operations can be intercepted using a handler and a proxy trap, which is a function that is always supplied as the second proxy argument and is in charge of the operation.
<br> 
<br> 
<center><div class="mxgraph" style="max-width:100%;border:1px solid transparent;" data-mxgraph="{&quot;highlight&quot;:&quot;#0000ff&quot;,&quot;lightbox&quot;:false,&quot;nav&quot;:true,&quot;resize&quot;:true,&quot;toolbar&quot;:&quot;zoom&quot;,&quot;edit&quot;:&quot;_blank&quot;,&quot;xml&quot;:&quot;&lt;mxfile modified=\&quot;2019-04-28T10:57:51.851Z\&quot; host=\&quot;www.draw.io\&quot; agent=\&quot;Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36\&quot; etag=\&quot;KT1R89YZZIPHrD0EufzU\&quot; version=\&quot;10.6.5\&quot; type=\&quot;device\&quot;&gt;&lt;diagram id=\&quot;lh_yR_ml-EyFlSGjHwGa\&quot; name=\&quot;Page-1\&quot;&gt;3VnfU+IwEP5rmLl70GmbttBHFfUevNE7nbnTt0BDG680TAhC/esvoUl/JMWCUnR4orvdbpJv90t2Qw9cTFfXFM7inyRESc+xwlUPDHuOY7vBgP8ITZZrAiEJRURxKI1KxT1+RVJpSe0Ch2heM2SEJAzP6soxSVM0ZjUdpJQs62YTktRHncEIGYr7MUxM7R8csjjXDjyr1P9AOIrVyLYl30yhMpaKeQxDsqyowGUPXFBCWP40XV2gRICncMm/u9rwtpgYRSnb5oMgunGePHobXi+sx+df/5wna3Di515eYLKQC76dIQoZJqmcNcsUFMsYM3Q/g2MhL3m4e+A8ZtOESzZ/lJ4QZWi1cYp2sXCeMYhMEaMZN5EfOArWTKWPlJcl9AXAcQV2ZQdltKPCdQkIf5CY7IBP38DnN5ovEvYJ4HiDrwbOwADHgAWFnE1SRMmILC9LxflawV8IWDCnXB0yShZpiMT4VgGgcPc2fHx0sqBj1J7zDNIIsbbYm+GgKOH8eKnPownb9adnlMKsYjAjOGXziuc7oSijDFwtyr7Gas3e7TdnRRnXfAZllIulvD/wanM+SOR5fGn2VwinwFHyI5dPrFPLU4rhqmo+zKrSHaKYLxlRpVxhljt0PCk+yqHFc+lKCFlHCfjRxDIyoTgyVSYMNN7n85JfvZVSrlNz5PiDuqOcOYajXVPd1SZsHGA6NbQNUC144zp0/1aLf78ZwG3no1G1I+rZh6ReQRTfrTJFMK+gTjNdhGDwrmSyVyWy3ULi7al3mD29YRP2NMYE76OerxdAOof3RD29lmijnuftRj2gn0pBi32g2fcPQSXXoNKUhHjCWdFY//LSjWlsQXP8CkdrA5GoEnZu7Z33vCHXwAUj87ypER/ABEcpf07QRLhSHDyTakZE2TjnVSROowchDE/c/VSPrlNPUeCY1WPQUDw6XRWPtllah2gC17W1NUIxfMGE9sTwV2uCThLe3q3D4icCuxF/6UdsjY6pOabQGeQADYW/3xA70FnszMqfo4f4Fjc7PuboZYHTAP+gAX27M/QDA/35DI3FxiWoAxV1jikIntUehMbmt7MoALMQexBt/+EvBow6t78lNp1dDADzZL2jZJV9+35cWVlkYaahXEHeO2hSmoeqgXi1OyCUxSQiKUyqLUK9CShtbsgaPYH5M2Isk7e1IhxNSb2XXhnIsqW1st9LU71rHe1odXRLmfu2eTdVrgKwesU7ehZX5YffqfT73U+/wVQ3HZ/Ml7LP7m9/IVXppvu1drpsoD/aTn8xdpp8Chr5tHPbrfuxPc3RntpuoDVhqpLf2Ba/bd/NhuECgxMxTMMEHVlJaQQ98IzdqKmresfhzcXyf748TuW/peDyPw==&lt;/diagram&gt;&lt;/mxfile&gt;&quot;}"></div>
<script type="text/javascript" src="https://www.draw.io/js/viewer.min.js"></script></center>
<br> 
<br> 

I've shown two branches on the diagram: the default behavior and the proxy's interception of the default behavior.
On the most fundamental level, default reflection yields `undefined`. The same outcome is also possible with a proxy.

The second branch - `Proxy` intercepts default behaviour by get trap in the handler and raises an error in the code example if property doesn't exist.
Note: `get` trap is one of many others traps - 
[see all available traps for the `Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Methods_of_the_handler_object). 

## Building two-way data binding using _Proxy_
Moving on let’s dive into a more complex thing. If you’re familiar with AngularJS or VueJS you’re probably into two-way data binding concept as it's the main philosophy of these frameworks (see [AngularJS](https://docs.angularjs.org/guide/databinding) docs or [VueJs example of _v-model_](https://vuejs.org/v2/guide/forms.html))

> Two-way-data binding links the state with the view. If the state changes the view is updated and if the view changes the state will be updated.

Using Proxy is the way to go if you want to create your own two-way data binding-based js framework. Our view can be connected to application state through a proxy. Consider the following illustration:
<script src="https://gist.github.com/patrykboch/3d7b1627643facc4cbdf0ba273d4a877.js"></script>
<script src="https://gist.github.com/patrykboch/13f5bd92ce082e698aabe2f90032e173.js"></script>
[see live example](https://jsfiddle.net/edzv5L0q/)

The state and the view are now bound. The view alters as the state does. First, I gave the DOM input elements a brand-new attribute called `data-model`. The key component of two-way data binding is the model, which connects input value and app state. After that, I created the straightforward state interface with two keys (name and hobby).
It's good to note that only keys that have been set in the interface can be modified in a proxy; otherwise, an error will be raised if eg. `state.strangerKey = "Hello"`. The next step is to build a proxy that has a `set` trap in the handler; `updateView` is added between calls to the default engine set behavior, which means that each time the state is attempted to be changed, the input values in the view will also be altered. From a view to a state direction. Also listeners have been provided to the view that detect input value changes and trigger the state change. So registering listeners on DOM elements is crucial because only registered listeners can change the state via the `onInputChange` event handler.

For now, the journey with Proxy wound up, I've presented the most common proxy traps - `get` and `set` but keep in mind 
that Proxy supports twelve more handlers which can be used for different purposes, especially in metaprogramming.

PS. Metaprogramming rocks :).
<br>
