# parcel-plugin-closure

Closure compiler based packager for Parcel

## Prerequisites

- Java's JDK 8 (*not the JRE*), and the `JAVA_HOME` environment variable defined

`closure-compiler-js` is not supported for now.

## Usage

You just need to add `parcel-plugin-closure` to your `devDependencies` :

`yarn add parcel-plugin-closure --dev`

or

`npm install parcel-plugin-closure --save-dev`

## Configuration

You can pass a configuration in a `.parcelclosurerc` file in the root of your project.

```js
{
	// a list of externs files to pass to Closure
	"externs": ["src/my-externs"],
	"bundles": {
		// You can configure a bundle by referencing it's entry point
		"src/dynamically-imported-file": {
			// the closure optimization level, "simple" or "advanced" defaults to advanced
			"optimization": "advanced",
			// The list of the values exported, this is only needed for dynamically
			// imported modules
			"exports": ["AnExportedValue"]
		}
	}
}
```

## Angular support

The plugin supports lazy-loading with `loadChildren`, you'll need to specify your factories exports.
It already includes the basic `externs` needed if Angular is detected.


```js
{
	"bundles": {
		"src/shared/components/lazy.module.ngfactory": {
			"exports": ["LazyModuleNgFactory"]
		}
	}
}
```

## Development

### Kotlin part

Run `yarn build:kt` to build the jar in `build/kotlin/libs`

### TypeScript part

Run `yarn build:ts` to build the JavaScript files to `build/javascript`
