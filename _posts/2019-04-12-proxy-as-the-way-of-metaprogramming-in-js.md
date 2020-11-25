---
layout: post
title: Proxy as the way of metaprogramming in JS
description: How to use Proxy es6 object in JS for metaprogramming
summary: This is a collection of examples that show how to use a Proxy in JS.
tags: [js, proxy, metaprogramming, reflect]
comments: true
---

Important note: _Proxy_ here is something different than one of the OOP pattern.

Since I started using javascript every single after migration from backend world I’ve experienced some strange aspects of JS. One of them annoys me - _undefined_ instead of code execution error (among others when accessing property that doesn't exist). JS behavior in this aspect is slightly different from Ruby or Python that I'm used to..

```javascript
.js
const obj = { name: 'Max' };

obj.name //=> 'Max'
obj.surname //=> undefined
``` 

and a Ruby equivalent:

```ruby
.rb
obj = { name: 'Max' }

obj.fetch(:name) #=> 'Max'
obj.fetch(:surname) #=> Error! Key not found: :surname
obj[:surname] #=> nil

# tl;tr obj[:surname] is not the case here
obj.fetch(:surname) #=> Error! Key not found: :surname // not specified default value
obj.fetch(:surname, nil) #=> nil // if key does not exist it returns (default value = nil)
obj[:surname] #=> nil // as above (default value = nil by default. No need to specify)
obj[:surname] == obj.fetch(:surname, nil) #=> true // the same behaviour
```
The Ruby execution is a little bit confusing since Ruby programmers are familiar with `obj[:key]` notation which doesn't produce an error (better use `Hash#fetch` instead of `Hash[:key]`). A Python example is more proper:
 
```python
#.py
obj = { name: 'Max' }

obj['name'] #=> 'Max'
obj['surname'] #=> Error! KeyError: 'surname'
```

Python and Ruby (with non-specified `default_value`) produce the errors. If a property does not exist the code execution ends with the throw. Imagine working on a big js project and small property typo breaks all results of a computation - because of _undefined_ instead of the _key not found_ throw - don’t know why 
and where since there are lots of possibly places for _undefined_ (debugging undefined takes a long time). Don’t worry - es6 standard gives us solutions for circumventing unexpected and default javascript behavior via Proxy object.


### Proxy object as the way of metaprogramming

Yes, since ES6 has been released JS is known as fully reflective by introducing the _Reflection API_ for _reflective (meta)programming_. 

>Reflection is the ability of a computer program to examine, introspect, and modify its own structure and behavior at runtime.

In other words, reflection means that a program can process itself on three levels (_introspection_, _self-modification_, _intercession_). 
ECMAScript 5 has provided the ability to reflective introspection and self-modification, eg. `Object.keys()` for introspection or `Object#delete` for `self-modification` - all `Object.*` methods are considered as reflective methods of metaprogramming, but
neither them nor other ES5 features support the third level of reflection - _behavioral level_, and  that was the reason for introducing proxies in ECMAScript 6 that let us changing built-in language operations.

> The Proxy object is used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc). [(official docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming)

I'd say - using Proxies is a way for virtualizing objects (eg. POJOs). Virtualized object looks the same as a given object and any operation on it refers to an already created proxy object. In general, an object has a standard set of methods (which produce specific behavior) and by virtualization, we can take control of default behavior by intercepting and re-defining then.
``` javascript
const object = { name: 'Max' };
const proxy = new Proxy(object, {});

object.name //=> Max
proxy.name //=> Max

object.name = 'Claire'

proxy.name //=> Claire
object.name //=> Claire
```
Nothing special above, virtualization of the object and the property lookup without invoking any operations
(see: [no-op forwarding](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#No-op_forwarding_proxy)). 
If you add a property for an object, the same property for a proxy object will be added. Some kind of a symlink, but proxies are built 
for intercepting the low-level operations on the target object indeed. The first argument for the Proxy is a target, the second is a handler.

### Error instead of _undefined_
_...when accessing non-existent property with the `get` trap._

Let's figure out a problem mentioned at the beginning of the article. How we can change the default behoaviour that ends with _undefined_ instead of code execution error like in Ruby or Python? At the beggining let's describe the default behaviour with a proxy object:

```javascript
const object = { name: 'Max' };

object.name //=> Max
object.surname //=> undefined

// the default js behaviour with a proxy
const proxy = new Proxy(object, { // init the proxy with the target
  get(trapTarget, key, receiver) { // added the get trap
      return Reflect.get(trapTarget, key, receiver) // run default behaviour
    }
});

proxy.name //=> Max
proxy.surname //=> undefined

// comparing proxy and object via lodash isEqual returns true
// note that objects (values) in JS are incomparable via === or Object.is().
isEqual(proxy, object) //=> true
```
Let's change the default behaviour:

``` javascript
const object = { name: 'Max' };

object.name //=> Max
object.surname //=> undefined

// changing the default js behaviour with a proxy
const proxy = new Proxy(object, {
  get(trapTarget, key, receiver) {
    if (!(key in receiver)) {
      throw new TypeError(`undefined key ${key}`) // error if key does not exist
    }
    return Reflect.get(trapTarget, key, receiver)  // run the default behaviour
  }
});

object.name //=> Max
object.surname //=> TypeError: undefined key surname
```
I use the `get` trap to intercept default behavior when accessing the property. I passed three arguments to the trap: 1) the `trapTarget` - the target object for the proxy, 2) the `key` - the property and 3) the `receiver` - it's the proxy reference.
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
``` javascript
new Proxy(targetObject, {
  get(target, key, receiver) { 
    return Reflect.get(target, key, receiver)
  }; 
});
```
The second branch - `Proxy` intercepts default behaviour by get trap in the handler and raises an error in the code example if property doesn't exist.
Note: `get` trap is one of many others traps - 
[see all available traps for the `Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Methods_of_the_handler_object). 

### Building two-way data binding using _Proxy_
Moving on let’s dive into a more complex thing. If you’re familiar with AngularJS or VueJS you’re probably into two-way data binding concept as it's the main philosophy of these frameworks (see [AngularJS](https://docs.angularjs.org/guide/databinding) docs or [VueJs example of _v-model_](https://vuejs.org/v2/guide/forms.html))

> Two-way-data binding links the state with the view. If the state changes the view is updated and if the view changes the state will be updated.

If you want to write your own js framework based on two-way data binding then using Proxy is the way to go. A proxy can link our view with application state. Look at the following example:
``` html
<!-- html -->
<div class="app">
  <div class="field">
    <label for="name">My name is:</label>
    <input id="name" type="text" name="name" data-model="name" />
  </div>
  <div class="field">
    <label for="hobby">My hobby is:</label>
    <input id="hobby" type="text" name="hobby" data-model="hobby" />
  </div>
  <div class="app-state">
    <h4 data-model="app-state" />
  </div>
</div>
```
``` javascript
// set a state interface (models)
let stateInterface = {
  name: '',
  hobby: ''
};

// set a trap!
const state = new Proxy(stateInterface, {
  set(trapTarget, key, value, receiver) {
    setInputValue(key, value) // update input values in the view before setting property
    return Reflect.set(trapTarget, key, value, receiver); // call default set behaviour
  },
});

// set default values
state.name = 'John'
state.hobby = 'Football'

// find input DOM element and update its value with a state value
// linking state with the view
function setInputValue(id, value) {
  document.querySelector(`[data-model="${id}"]`).value = value;
}


// change the app state when input value changes in the DOM
// linking view with the state
function onInputChange(event) {
  state[event.target.dataset.model] = event.target.value;
};

// add listeners to inputs
Object.keys(stateInterface).map(id => {
  const element = document.querySelector(`[data-model="${id}"]`)
  element.addEventListener('keyup', onInputChange)
})
```
[see live example](https://jsfiddle.net/edzv5L0q/)<br>

The view and the state - two things have been linked. Changing the state changes the view. At first, I added a new attribute
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
