# Why Another Flux Implementation?

> YAFI <small>Yet Another Flux Implementaion</small>

Good question. 'Cause I suffer from NIH-syndrome.

OK, not really. _Actually_, after playing with Flux there are a few things I got tired of managing/dealing with. As such I wanted to build a system that technically supported everything the (quasi) official [Facebook Flux]() version does, but with these rules in mind:

- No need to talk to a dispatcher directly.
- No need to know any dispatchTokens.
- No `switch` blocks of doom.
- No keeping a constants file.
- No need for consumers to require several files to work with a single store: Flux should be an implementation detail, consumers should be able to deal with a Store like a plain object.
- The term 'Action Creator' is weird and too verbose.

Not to be overly negative, there are excellent parts of Flux that are kept:

- Singleton Dispatcher.
- Sequenceable dispatching.
- Synchronicity of dispatching and store updates.


[Facebook Flux]: http://facebook.github.io/flux/docs/overview.html
