package org.fathyb.parcel.closure

import com.google.gson.Gson
import com.google.javascript.jscomp.AbstractCommandLineRunner
import com.google.javascript.jscomp.CompilerOptions
import com.google.javascript.jscomp.JSModule

@Suppress("unused")
class ClosureWrapper {
    private val host = FileHost()
	private val gson = Gson()

	// We synchronize this to prevent a dependency from being parsed before it's parent
	@Synchronized
	fun addFile(path: String, contents: String?, pkgFile: String?, pkgContents: String?) {
		if(pkgFile != null) {
			host.processPackage(pkgFile, pkgContents)
		}

		host.addSourceFile(path, contents)
	}

    fun process(paramsJson: String): String {
		val params = gson.fromJson(paramsJson, Parameters::class.java)
		val runner = CompilerRunner(host, params.optimization)
        val modules = mutableMapOf<String, InternalModule>()
		val inputs = mutableSetOf<String>()

        params.modules.forEach { entry ->
            val module = JSModule(entry.name)

			if(entry.dependencies.isNotEmpty()) {
				val virtual = runner.addVirtualEntryPoint(entry.entry, entry.name)
				val entrySource = host.getSourceFile(virtual)

				module.add(entrySource)
			}
			else {
				runner.addEntryPoint(entry.entry)
			}

            entry.files.forEach {file ->
				if(!file.endsWith("package.json") || !inputs.contains(file)) {
					module.add(host.getSourceFile(file))
					inputs.add(file)
				}
			}

            modules[entry.name] = InternalModule(entry.name, module, entry.dependencies, entry.exports)
        }

        modules.values.forEach { module ->
            module.dependencies.forEach { dep ->
                module.module.addDependency(modules[dep]!!.module)
            }

            runner.addModule(module)
        }


        val builtin = AbstractCommandLineRunner.getBuiltinExterns(CompilerOptions.Environment.BROWSER)
        val externs = builtin union params.externs.map { extern -> host.getSourceFile(extern) }

		return gson.toJson(runner.compile(externs.toList()))
    }
}
