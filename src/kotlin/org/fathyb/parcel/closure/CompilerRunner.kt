package org.fathyb.parcel.closure

import com.google.gson.Gson
import com.google.javascript.jscomp.AbstractCommandLineRunner
import com.google.javascript.jscomp.CompilationLevel
import com.google.javascript.jscomp.Compiler
import com.google.javascript.jscomp.CompilerOptions
import com.google.javascript.jscomp.DependencyOptions
import com.google.javascript.jscomp.ModuleIdentifier
import com.google.javascript.jscomp.SourceFile
import com.google.javascript.jscomp.WarningLevel
import com.google.javascript.jscomp.deps.ModuleLoader

internal class CompilerRunner(private val host: FileHost, private val level: CompilationLevel) {
	private val entryPoints = mutableListOf<ModuleIdentifier>()
	private val gson = Gson()
	private val compiler = Compiler()
	private val modules = mutableListOf<InternalModule>()
	private val options = CompilerOptions()
	private val dependencyMode = CompilerOptions.DependencyMode.STRICT

	init {
		level.setOptionsForCompilationLevel(options)
		level.setTypeBasedOptimizationOptions(options)

		options.setProcessCommonJSModules(true)
		options.moduleResolutionMode = ModuleLoader.ResolutionMode.NODE
		options.packageJsonEntryNames = listOf("es2015", "browser", "module", "main")
		options.rewritePolyfills = false
		options.languageOut = CompilerOptions.LanguageMode.ECMASCRIPT5
		options.languageIn = CompilerOptions.LanguageMode.ECMASCRIPT_NEXT
		options.setExportLocalPropertyDefinitions(true)
		options.generateExports = true

		WarningLevel.QUIET.setOptionsForWarningLevel(options)
	}

	fun addEntryPoint(path: String) {
		entryPoints.add(ModuleIdentifier.forFile(path))
	}

	fun addVirtualEntryPoint(path: String, name: String): String {
		val virtual = host.addVirtualEntry(path, name)

		addEntryPoint(virtual)

		return virtual
	}

    fun addModule(module: InternalModule) {
        modules.add(module)
    }

    fun compile(externs: List<SourceFile>): List<GeneratedFile> {
		createDependencyOptions()

		val jsModules = modules.map { module -> module.module }
		val result = compiler.compileModules(externs, jsModules.toList(), options)
		val filtered = result.propertyMap?.newNameToOriginalNameMap?.filter { mapEntry ->
			val original = mapEntry.value
			var shouldExport = true

			for(module in modules) {
				if(module.exports != null) {
					shouldExport = false

					for(export in module.exports) {
						if(export == original) {
							return@filter true
						}
					}
				}
			}

			shouldExport
		}
		val renamings = gson.toJson(filtered)

		return jsModules.map { module ->
			GeneratedFile(module.name, wrap(compiler.toSource(module), renamings))
		}
    }

    private fun wrap(code: String, renamings: String): String {
		var wrapped = code.replace("__REPLACE_RENAMINGS", renamings)

		if(entryPoints.size == 1) {
			wrapped = "(function(){$wrapped})()"
		}

		return wrapped
	}

	private fun createDependencyOptions() {
		if(entryPoints.size == 1) {
			level.setWrappedOutputOptimizations(options)
		}

		options.dependencyOptions = DependencyOptions().setEntryPoints(entryPoints)

		if(dependencyMode == CompilerOptions.DependencyMode.STRICT) {
			if(entryPoints.isEmpty()) {
				throw AbstractCommandLineRunner.FlagUsageException(
					"When dependency_mode=STRICT, you must specify at least one entry point"
				)
			}

			options.dependencyOptions
				.setDependencyPruning(true)
				.setDependencySorting(true)
				.setMoocherDropping(true)
		}
		else if(dependencyMode == CompilerOptions.DependencyMode.LOOSE || !entryPoints.isEmpty()) {
			options.dependencyOptions
				.setDependencyPruning(true)
				.setDependencySorting(true)
				.setMoocherDropping(false)
		}
	}
}
