window.context = window.describe;

describe("_super", function() {
  var Friend, Animal, Mammal, Pet, Dog, CockerSpaniel;

  beforeEach(function() {
    Friend = Backbone.Model.extend({
      greet: function(personName, timeOfDay) {
        return "Good " + timeOfDay + ", " + personName + ". My name is " + this.get("name") + ".";
      }
    });

    // super needs to work even when there are classes in the
    // inheritance hierarchy that do not override the method.
    Animal = Friend.extend({ eats: "food" });

    Mammal = Animal.extend({
      greet: function(personName, timeOfDay) {
        return this._super("greet", arguments) + " I'm a mammal.";
      }
    });

    Pet = Mammal.extend({ livesInCaptivity: true });

    Dog = Pet.extend({
      greet: function(person, timeOfDay) {
        return this._super("greet", arguments) + " Ruff ruff!";
      }
    });

    CockerSpaniel = Dog.extend({ cute: true });

    spyOn(Friend.prototype, 'greet').andCallThrough();
    spyOn(Mammal.prototype, 'greet').andCallThrough();
    spyOn(Dog.prototype,    'greet').andCallThrough();
  });

  context("when used only once in the inheritance hierarchy", function() {
    context("in the class's own implementation of the method", function() {
      beforeEach(function() {
        this.friend = new Mammal({ name: "Benjie" });
      });

      itCallsTheOverriddenMethodCorrectly();
    });

    context("in a superclass's implementation of the method", function() {
      beforeEach(function() {
        this.friend = new Pet({ name: "Benjie" });
      });

      itCallsTheOverriddenMethodCorrectly();

      it("does not call the object's own method more than once", function() {
        this.friend.greet("Barbara", "morning");
        expect(Mammal.prototype.greet.callCount).toBe(1);
      });
    });
  });

  context("when used twice in the inheritance hierarchy", function() {
    context("with the first case happening in the class's own implementation", function() {
      beforeEach(function() {
        this.friend = new Dog({ name: "Benjie" });
      });

      itCallsTheOverriddenMethodCorrectly();

      it("calls both of the ancestor classes' methods", function() {
        var greeting = this.friend.greet("Barbara", "morning");
        expect(greeting).toContain("I'm a mammal.");
      });
    });

    context("with the first case happening in a superclass's implementation", function() {
      beforeEach(function() {
        this.friend = new CockerSpaniel({ name: "Benjie" });
      });

      itCallsTheOverriddenMethodCorrectly();

      it("does not call the object's own method more than once", function() {
        this.friend.greet("Barbara", "morning");
        expect(Dog.prototype.greet.callCount).toBe(1);
      });
    });
  });

  context("when the overridden method calls super by referencing its constructor explicitly", function() {
    beforeEach(function() {
      Mammal.prototype.greet = function(personName, timeOfDay) {
        return Mammal.__super__.greet.apply(this, arguments) + " I'm a mammal.";
      }
      spyOn(Mammal.prototype, 'greet').andCallThrough();

      this.friend = new CockerSpaniel({ name: "Benjie" });
    });

    itCallsTheOverriddenMethodCorrectly();
  });

  function itCallsTheOverriddenMethodCorrectly() {
    it("passes the given arguments to the overridden method", function() {
      var greeting = this.friend.greet("Barbara", "morning");
      expect(greeting).toContain("Good morning, Barbara.");
    });

    it("calls the overridden method on the recieving object", function() {
      var greeting = this.friend.greet("Barbara", "morning");
      expect(greeting).toContain("My name is Benjie.");
    });

    it("calls the overridden method only once", function() {
      this.friend.greet("Barbara", "morning");
      expect(Friend.prototype.greet.callCount).toBe(1);
      expect(Mammal.prototype.greet.callCount).toBe(1);
    });

    it("can be called multiple times with the same results", function() {
      var greeting = this.friend.greet("Barbara", "morning");
      expect(this.friend.greet("Barbara", "morning")).toBe(greeting);
      expect(this.friend.greet("Barbara", "morning")).toBe(greeting);
    });
  }
});
