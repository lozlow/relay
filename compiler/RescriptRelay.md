# RescriptRelay Relay compiler fork
This is both an overview of the architecture for the ReScript support added to the Relay compiler in this fork, as well as a detailed summary of each change made.

_This is a work in progress and will be updated continuously_

## Architectural overview
### How the stock Relay compiler works
The Relay compiler supports generating both Flow and TypeScript types as a core part of the compiler. The way this is setup in the compiler heavily utilizes the fact that Flow and TypeScript mostly differs in terms of syntax, but not that much in structure. For example, a read only property of an object in Flow is printed like `+propName: string`, and in TS `readonly propName: string`.

To support both Flow and TypeScript, the Relay compiler will generate what I'll call a "printing AST". That's an AST that's _very_ geared towards just printing types in Flow and TypeScript, meaning it's designed only to allow dealing with the synctatical differences between Flow and TypeScript.

However, ReScript _isn't_ very similar in terms of type generation. So, it's not possible for us to simply build a ReScript printer from the exact building blocks that currently power the Flow and TypeScript generation. More details on why that is, and what we do instead, follows below.

### What ReScript needs
There are quite a lot of differences between ReScript and Flow/TS, but perhaps the main one is that because of how the types in ReScript work, we want to print an individual type defintion (a record) for each object in the types generated, whereas Flow/TS prints the entire response or fragment as one large, nested object. A bit of comparison below:

```rescript
// We want this:
type fragment_bestFriend = {
    name: string
}

type fragment = {
    name: string,
    bestFriend: option<fragment_bestFriend>
}
```

```typescript
// And both TS and Flow wants this, one nested structure:
type fragment = {
    name: string,
    bestFriend?: {
        name: string
    } | null
}
```

There are a few other differences here too, but this one is enough for the approach of the stock compiler to not work for ReScript type generation. And, in addition to the above, we need a bunch of separate things as well that's only relevant to RescriptRelay. Primarily, we need assets that'll help us convert back and forth between ReScript and JS values, in the cases that needs conversion.

### How we solve that
Just to get ReScript working:
* Hook into the existing type generation that's geared only towards TS/Flow
* The Relay compiler feeds us the "printing AST", which we then convert into our own intermediate representation, detailing what object/enums/input objects etc exist, and how they're connected. We then use _that_ representation to print our types.

RescriptRelay additions:
* Object maker functions
* Variable makers
* Refetch variable makers
* Conversion utils to go back and forth between ReScript/JS values
* Node interface special treatment
* getConnectionNodes helper
* Connection key inlined when available

## Changes made
Here's a complete list of all the changes made to the stock Relay compiler:

* The logic that extracts GraphQL from source files has been changed from looking for `graphql\`\`` to `%relay(\`\`)`.
* The require's generated in the Relay artifacts (for refetch operations etc) has been changed to conform to the format needed by RescriptRelay to plug into the ReScript compiler and generate the correct imports for the operations.
* A dedicated transform for ensuring that all selected fields have valid names in ReScript has been added to the compiler.
* The actual functions that generate the artifact contents for fragments and operations has been replaced by dedicated functions that call into RescriptRelay things. However, the original functions are kept intact and in place, in order to make maintenance easier.
* A `TypegenLanguage::ReScript` has been added next to `Flow` and `TypeScript`. Additional things, like the schema and current type generation definition, is passed into the ReScript typegen writer as it's constructed. These are things that the Flow and TS generators do not need to use.
* A check before deletion of whether a generated file is actually generated by Relay or not has been added. This has been PR:ed to [Relay here](https://github.com/facebook/relay/pull/3700).
* The default typegen language for the compiler CLI has been set to `ReScript` rather than `TypeScript`. This is so RescriptRelay users do not explicitly need to state that they
re using `ReScript`.
* Adjustments to various utils checking for file extensions etc has been made to work with ReScript as well.
* A transform that ensures that `__typename` is selected wherever we need it has been added to the compiler. This is to ensure that we can convert back and forth from/to unions, without the developer needing to explicitly select `__typename`.
* The `Int` and `Float` GraphQL types has been changed to output the appropriate `int` and `float` ReScript types, rather than `number`.

## Contributing
* Run commands
* Look at the produced output in the test-res project. Make sure all changes/additions are covered by generated sources there
* The main rescript-relay repo has an easy way to set up actual, proper integration tests. Everything needs to be covered by that