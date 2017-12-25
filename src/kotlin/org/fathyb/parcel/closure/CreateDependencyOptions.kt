package org.fathyb.parcel.closure

import com.google.javascript.jscomp.AbstractCommandLineRunner
import com.google.javascript.jscomp.CompilerOptions
import com.google.javascript.jscomp.DependencyOptions
import com.google.javascript.jscomp.ModuleIdentifier

internal fun createDependencyOptions(
	dependencyMode: CompilerOptions.DependencyMode, entryPoints: List<ModuleIdentifier>
) =
	if(dependencyMode == CompilerOptions.DependencyMode.STRICT) {
		if(entryPoints.isEmpty()) {
			throw AbstractCommandLineRunner.FlagUsageException(
				"When dependency_mode=STRICT, you must specify at least one entry point"
			)
		}

		DependencyOptions()
			.setDependencyPruning(true)
			.setDependencySorting(true)
			.setMoocherDropping(true)
			.setEntryPoints(entryPoints)
	}
	else if(dependencyMode == CompilerOptions.DependencyMode.LOOSE || !entryPoints.isEmpty()) {
		DependencyOptions()
			.setDependencyPruning(true)
			.setDependencySorting(true)
			.setMoocherDropping(false)
			.setEntryPoints(entryPoints)
	}
	else {
		null
	}
