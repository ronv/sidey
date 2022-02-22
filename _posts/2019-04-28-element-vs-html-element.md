---
title: Element vs HTMLElement
published: false
---
Imagine an old React component written in Typescript that renders an element with `React.createElement` function from top-level React API with a `ref` callback.


``` typescript
class CustomComponent extends React.Component<{}> {
  private customElement?: HTMLElement | null
  // customElement is the union type (HTMLElement or null)
    
  render() {
    return React.createElement('div', {
      ref: element => this.customElement = element
      // element instanceof Element //=> true
      // element instanceof HTMLElement //=> true or false 
    }
  }
}
```
Unfortunately, typescript compiler raises an error above: _Element is not assignable to HTLMElement_. 

When I started working with DOM elements and DOM types with Typescript I was confused (as a backend dev) since I had considered every Element in the HTML dom tree as an HTMLElement before. I was suprised about the fact that HTMLElement is only the one possible type of Element (in HTML-DOM-TREE).

Turned out that `Element` type has a wider interface scope and if using type-checking tools like Typescript we have to take care of inheritance structure then.
That's why DOM elements are commonly type-guarded or casted (always not recommended since it's always a code smell) in order to avoid errors that devs don't understand (including myself before).

Anyways, the difference becomes important if you use type checking. What else (apart from `HTMLElement`) can implement the Element interface? 

Let's consider a `Node` as the basic and generic object that represents everything which appears in a DOM tree.
Node is a html tag, comment, an html element. Or let me put that the other way around - every DOM object inherits from Node. 
``` html
<div id="note">
  <!--Who am I?-->
  <p>Name: Max</p>
  <p>Description of myself!</p>
</div>
```
``` javascript
const element = document.getElementById('note');
element.toString(); //=> HTMLDivElement

const elementList = document.querySelectorAll('p');
elementList.toString(); //=> NodeList
elementList[0].toString(); //=> HTMLParagraphElement

const tags = document.getElementsByTagName('p');
tags.toString(); //=> HTMLCollection, list of HTMLElements
tags[0].toString(); //=> HTMLParagraphElement

element instanceof Node //=> true 
element instanceof Element //=> true
```

An `Element` is a possible incarnation of a Node. So every Element is a Node, but not every Node is an Element.
`<!--Who am I?-->` comment is a Node, but neither an Element nor an HTMLElement. Every node has own type and id ([see all node types with its ids](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Node_type_constants)).

``` javascript
element.nodeType //=> 1 - it's a Node.ELEMENT_NODE with id 1
element.childNodes //=> NodeList(7) [text, comment, text, p, text, p, text]

// lets grab <!--Who am I?--> comment
element.childNodes[1].nodeType //=> 8 - it's a Node.COMMENT_NODE with id 8
element.childNodes[1].nodeType.data //=> "Who am I?"

element.childNodes[1] instanceof Element //=> false
element.childNodes[1] instanceof Comment //=> true
```
Element and HTMLElement: both are Nodes. Both are Elements, but _Element can refer to objects different from HTML universe._ And the most surprising for me is i.e to XML DOM element: 

``` xml
<!-- note.xml file -->
<?xml version="1.0" encoding="UTF-8" ?>
<note>
 <name>Name: Max</name>
 <description>Description of myself!</description>
</note>
```

``` javascript
// fetching xml 
const xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    // check instances of xml elements
    showInsanceOfElement(this)
  }
};

xhttp.open("GET", "note.xml", true);
xhttp.send();

function showInsanceOfElement(xml) {
  xmlDoc = xml.responseXML;
  const [xmlElement] = xmlDoc.getElementsByTagName('note');
    
  xmlElement instanceof Element //=> true
  xmlElement instanceof HTMLElement //=> false
}

```
And of course `Element` is the (grand)parent of `HTMLElement` children (`HTMLDivElement`, `HTMLAnchorElement`,`HTML-whatever-Element`). What is surprising for me - `HTMLUnknownElement` is an Element too:
``` javascript
// create an unknown element
const element = document.createElement('foo')

element instanceof Element //=> true
element instanceof HTMLUnknownElement //=> true
```

Summing up - `Element` could mean everything in a DOM tree and typing a DOM object to Element is not strictness and could cause a type error. That's why I recommend in code reviews to keep it more strict (eg. as a `HTMLElement` or `XMLElement`) as a future-proof. 