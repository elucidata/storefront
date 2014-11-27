# Source Syntax Style Guide

Generally, your code should look like the rest of the codebase.

Basic rules-of-thumb:

- Use ES6-isms where applicable (destructuring).
- Only use semicolons when absolutely necessary.
- Line up variables under a single `var`.
- Manually hoist all variables (prefer a single `var` per scope).
- Single space after `(` or `[`.
- `else` belongs on its own line.
- Instead of `for` loops prefer using `map`, `forEach`, `filter`, `reduce`, etc.
- Assignment `=` operator has a single space after, none before.
- Prefer arrow syntax for any lamba/inline functions.
- Prefer a single export per module.

Variable names have different styles based on their usage/scope. Example:

```javascript
const CONSTANT_VARIABLE= 'Constant'

var _enclosed_data= 100,
    _other_stuff= 'yep'

module.exports=
class ClassName {

    constructor() {
        this.publicVariable= 10
        this._privateVarible= 42
    }

    methodName( paramName) {
        var local_variable= /re/
    }

    static methodNamesToo( ) {
        return {
            publiclyAccessibleVariable: true
        }
    }
}

ClassName.STATIC_CONSTANT= 404
ClassName.staticVariable= 'mutable value'

function _helperFunction( paramName) {
    return ()=> {
        return `extra ${ paramName}`
    }
}
```
