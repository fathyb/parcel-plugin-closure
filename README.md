# parcel-plugin-closure

Closure compiler based packager for Parcel

## Prerequisites

- Java's JDK 8 (*not the JRE*), and the `JAVA_HOME` environment variable defined
- `google-closure-compiler` and `parcel-bundler` installed locally

`closure-compiler-js` is not supported because it does not support modules (used for Parcel code-splitting).

## Usage

You just need to add `parcel-plugin-closure` to your `devDependencies` :

`yarn add parcel-plugin-closure --dev`

or

`npm install parcel-plugin-closure --save-dev`

## Configuration

You can pass an optional configuration in a `.parcelclosurerc` file in the root of your project.

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

This plugin is divided in two part :
- A simple Closure wrapper running in a Java virtual-machine, we need it mainly for the virtual file-system (we give it files as processed by Parcel, not from from the disk)
- The Parcel plugin, it contains a Parcel packager and a JavaScript asset. It calls the Closure wrapper using `node-java`.

### Java part (Kotlin)

You need the Java JDK 8 and Gradle 2.4+ installed.

- Download the Gradle wrapper : `gradle wrapper --gradle-version 4.4.1`
- Build the jar in `build/kotlin/libs` : `./gradlew build`

### JavaScript part (TypeScript)

You need Node.js 8+ and Yarn installed.
You can use `npm` instead of `yarn` but it will make your setup non-reproductible.

- Fetch the dependencies: `yarn` or `npm install`
- Build the JavaScript files in `build/javascript` : `yarn build:ts` or `npm run build:ts`
