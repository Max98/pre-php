## pre-php

pre-php is some kind of a php compiler that will allow you to use C-style `#ifdef` and `#ifndef` directives. That's it.

pre-php will simply copy all of your source files to a `build` directory, and then _'compile'_ the php files in there. It will never touch your original files.

### Install

`npm install -g pre-php`

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

and run `pre-php` from the the terminal on that folder.  
There is also a watch function `pre-php -w` that will watch for changes.  
You can also do `pre-php -f` for a fresh build (destroy everything in the build folder and start over)

#### config:

`defs`: An array of your defines.  
`ignoreDir`: An array of ignored directories.  
`ignoreProcess`: Unlike `ignoreDir`, this will copy the files but will not process the php files inside.  
`buildPath`: Path where the build php files will be copied. (default: './build')

### Syntax example

```
<?php

#ifdef __TEST
echo '__TEST is defined!';
#endif

#ifndef __TEST2
echo '__TEST2 is not defined!';
#endif

#ifdef __TEST3
echo '__TEST3 is defined!';
#else
echo '__TEST3 is not defined!';
#endif

#ifndef __TEST4
echo '__TEST4 is not defined!';
#else
echo '__TEST4 is defined!';
#endif

echo 'enjoy!';

```
