package org.fathyb.parcel.closure

import com.google.gson.Gson
import com.google.javascript.jscomp.CompilationLevel
import com.google.javascript.jscomp.CompilerOptions
import com.google.javascript.jscomp.ModuleIdentifier
import com.google.javascript.jscomp.SourceFile
import com.google.javascript.jscomp.WarningLevel
import com.google.javascript.jscomp.deps.ModuleLoader

internal class CompilerRegistry(private val host: FileHost, private val level: CompilationLevel) {
	private val entry = CompilerEntry()
	private val entryPoints = mutableListOf<ModuleIdentifier>()
	val gson = Gson()

	init {
		val options = entry.options

		level.setOptionsForCompilationLevel(options)
		level.setTypeBasedOptimizationOptions(options)

		options.setProcessCommonJSModules(true)
		options.moduleResolutionMode = ModuleLoader.ResolutionMode.NODE
		options.packageJsonEntryNames = listOf("es2015", "browser", "module", "main")
		options.rewritePolyfills = false
		options.languageOut = CompilerOptions.LanguageMode.ECMASCRIPT5
		options.languageIn = CompilerOptions.LanguageMode.ECMASCRIPT_NEXT
		options.setExportLocalPropertyDefinitions(true)
		options.removeUnusedPrototypePropertiesInExterns = false
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
        entry.modules.add(module)
    }

    fun compile(externs: List<SourceFile>): List<GeneratedFile> {
		val compiler = entry.compiler
		val modules = entry.modules.map { module -> module.module }

		entry.apply(level, entryPoints)

		val result = compiler.compileModules(externs, modules.toList(), entry.options)
		val filtered = result.propertyMap?.newNameToOriginalNameMap?.filter { mapEntry ->
			val original = mapEntry.value
			var shouldExport = true

			for(module in entry.modules) {
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

		return modules.map { module ->
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
}
