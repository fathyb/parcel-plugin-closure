package org.fathyb.parcel.closure

import com.google.javascript.jscomp.CompilationLevel
import com.google.javascript.jscomp.JSModule
import com.google.javascript.jscomp.SourceFile

class Module (
    val name: String,
	val entry: String,
    val files: List<String>,
    val dependencies: List<String>,
	val exports: List<String>?
)
class Parameters(
	val modules: List<Module>,
	val externs: List<String>,
	val optimization: CompilationLevel
)

@Suppress("unused")
internal class GeneratedFile(
	val name: String,
	val contents: String
)

internal class InternalModule(
    val name: String,
    val module: JSModule,
    val dependencies: List<String>,
	val exports: List<String>?
)

internal class FileCacheEntry(
	val sourceFile: SourceFile,
	val original: String? = null
)
