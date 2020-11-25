---
title: Hollywood principle with Ruby callbacks
published: false
---


Hollywood law is the better name (IMO) for `Inversion of control (IoC)` principle which is commonly used by frameworks: 

> One important characteristic of a framework is that the methods defined by the user to tailor the framework will
 often be called from within the framework itself, rather than from the user's application code. The framework often 
 plays the role of the main program in coordinating and sequencing application activity. This _inversion of control_ 
 gives frameworks the power to serve as extensible skeletons. The methods supplied by the user tailor the generic
 algorithms defined in the framework for a particular application [1]. 

It means that program (framework) can examine and call itself and take control of itself at the appropriate moment. 
We don't have to ask runtime for changes and call it afterwards - the runtime will call itself/us if something happens. 

This is possible by `reflection` and its _Reflection API_ [2] and mostly used with dependency injection pattern: 
_injection by the reflection_ [3]. 





Ruby offers `object lifecycle callbacks` also called hooks which can track changes and extend program behaviour at runtime.
This let a program being notified and u

### Extend through include 

Like classes, Ruby modules are bundles of methods and constants. Unlike classes, modules don’t have instances. 
Creation of a ruby class is equal to the creation of an instance. But modules are not useless and they can help 
organize code (modules encourage modular design) and also be mixed into classes by mixins. In Ruby, we got three types 
of mixins: `prepend`, `extend` and `include` and they are widely known for Ruby programmers as the part of Ruby 
basics indeed (i.e. used for multiple inheritance [3]). I'm not gonna go into 
mixin details because there are plenty of another sources with Ruby basics that displays what it is and for which 
purposes it's used for [4]. But the point is that mixins let class inherit methods from other modules. 
Basically, `include` mixin takes subject module methods as instance methods, `extend` takes module methods as 
class methods. And what is important - Ruby let us modify default language behaviour on the fly with _hook methods_, like in the example below - 
we can get class methods by using `include` and `Module#included` hook in the already included class instead of `extend`:
<br>
<br>
```ruby
class SomeClass
  include ExtendThroughInclude
end

module ExtendThroughInclude
  def self.included(klass)
    #klass is SomeClass
    klass.extend ClassMethods
  end

  def some_method
    puts "this is an instance method"
  end

  module ClassMethods
    def some_method
      puts "this is a class method"
    end
  end
end

SomeClass.new.some_method => "this is an instance method"
SomeClass.some_method =>  "this is a class method"
SomeClass.ancestors #=> [SomeClass, ExtendThroughInclude, Object, ...]
```
<br>
`included` is invoked while a module is included and it extends `SomeClass` by `ClassMethods`. Hook methods can change behaviour of a program at runtime, so they are the way of metaprogramming in Ruby. 
The most important are these which refers to `Module` inheritance like: `Module#prepended`, `Module#extended` (works the same as `Module#included` - but with another mixin)
and class inheritance like `Class#inherited`:
<br>

```ruby
class ParentClass
  def self.inherited(klass)
    puts klass
  end
end

class ChildClass < ParentClass; end
ChildClass.new #=> ChildClass
```

#### Method missing 
the most interesting for me - `BasicObject#method_missing` (which is useful in case of i.e. `Proxy` pattern implementation).


[1] R. E. Johnson, B. Foote., _Designing reusable classes_, "Journal of Object-Oriented Programming", 1988/06-07, Vol 1, No 2, 22-35.
[2] Reflection is the ability of the program to examine itself, see: 

[1] In the standard inheritance ruby class can inherit only from one (parent) class.
<br>
[2] [Mixins in ruby-docs](https://ruby-doc.com/docs/ProgrammingRuby/html/tut_modules.html)
