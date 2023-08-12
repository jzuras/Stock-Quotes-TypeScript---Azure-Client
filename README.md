# Stock-Quotes-TypeScript---Azure-Client

This is part of a new version of my original Stock Quotes repo, continuing my Learning Journey.
This part is the TypeScript Client for Azure Functions. As with the original JS repo, this is not
expected to be useful to the world at large.

For this project, I started with my original TypeScript client code, which directly accessed
the TwelveData api. After simplifying the api coming from my Azure Function, the TypeScript code
became much simpler. With the new api combining both price data and error info in the return data, the
error-checking code in this client is smaller.

Since the JSON data being returned was different, I needed to redo my type-safe parsing code,
which was previously done via generated code from QuickType.io. I recently learned about Zod,
and since QuickType included that as an option, I decided to try it.

This caused me to learn all about using a Node.js package in an HTML page. I initially went down the
rabbit hole of the various bundling options like webpack, but I ended up using SkyPack CDN. I go into more detail on this in my discussion on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7092217565648723968/).

Update - I changed from Zod to a smaller package called SuperStruct. I did a separate LI post about this version [here](https://www.linkedin.com/feed/update/urn:li:share:7096125745487388672/).

The Azure Function code being called can be found on this [repo](https://github.com/jzuras/Stock-Quotes-Azure-Function).

This code is running on [GitHub Pages](https://jzuras.github.io/Stock-Quotes-TypeScript---Azure-Client/).
