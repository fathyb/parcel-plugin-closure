package org.fathyb.parcel.closure

import com.google.javascript.jscomp.CompilationLevel
import com.google.javascript.jscomp.Compiler
import com.google.javascript.jscomp.CompilerOptions
import com.google.javascript.jscomp.ModuleIdentifier

internal class CompilerEntry {
	val compiler = Compiler()
	val modules = mutableListOf<InternalModule>()
	val options = CompilerOptions()

	fun apply(level: CompilationLevel, entryPoints: List<ModuleIdentifier>) {
		if(entryPoints.size == 1) {
			level.setWrappedOutputOptimizations(options)
		}

		options.dependencyOptions = createDependencyOptions(CompilerOptions.DependencyMode.STRICT, entryPoints)
	}
}
