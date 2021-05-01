## pre-php

pre-php is some kind of a php compiler that will allow you to use C-style `#ifdef` and `#ifndef` directives. That's it.

pre-php will simply copy all of your source files to a `build` directory, and then _'compile'_ the php files in there. It will never touch your original files.

### How to use:

You will need to create a `pphp.json` config file at the root of your project:

```
{
    "defs": ["__TEST"],
    "ignoreDir": ["node_modules", "vendor"],
    "ignoreProcess": ["storage"],
    "buildPath:": "./build"
}
```

and run
`prephp` from the the terminal on that folder.

#### config:

`defs`: An array of your defines.  
`ignoreDir`: An array of ignored directories.  
`ignoreProcess`: Unlike `ignoreDir`, this will copy the files but will not process the php files inside.  
`buildPath`: Path where the build php files will be copied. (default: './build')

### Install

Since pre-php is still not published into the npm repo, you can clone the source code and run:  
`npm install`  
then  
`npm link`

Note: This is a hacky way to do it, do not forget to run `npm unlink` to uninstall it!
