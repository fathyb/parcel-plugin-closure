package org.fathyb.parcel.closure

import com.google.gson.Gson
import com.google.javascript.jscomp.SourceFile
import java.io.File

internal class FileHost {
    private class PackageJson {
        val es2015: String? = null
        val module: String? = null
        val browser: String? = null
        val main: String? = null
    }

    companion object {
        private val RXJS_RE = Regex("node_modules/rxjs/")
    }

    private val gson = Gson()
    private val cache = mutableMapOf<String, FileCacheEntry>()
    private val aliases = mutableMapOf<String, String>()
	private val packages = mutableSetOf<String>()

	fun processPackage(path: String, packageContents: String?) {
		if(packages.contains(path)) {
			return
		}

		packages.add(path)

		val file = File(path)
		val contents = packageContents ?: file.readText()
		val pkg = gson.fromJson(contents, PackageJson::class.java)
		val pathRe = Regex("^\\./")
		var module = pkg.es2015?.replace(pathRe, "")

		if(module != null) {
			if(!module.endsWith(".js")) {
				module += ".js"
			}

			listOf(pkg.module, pkg.browser, pkg.main).forEach { entry ->
				if(entry != null) {
					val normalEntry = entry.replace(pathRe, "")
					val dir = file.parent
					val to = normalize("$dir/$module")
					var from = normalize("$dir/$normalEntry")

					if(!from.endsWith(".js")) {
						from += ".js"
					}

					aliases[from] = to
				}
			}
		}

		addSourceFile(path, packageContents)
	}

    fun addSourceFile(path: String, contents: String? = null) {
        if(path.contains(RXJS_RE)) {
            return
        }

        val normalized = normalize(path)
        val entry = cache[normalized]

        if(entry != null && (entry.original == contents || contents == null)) {
            return
        }

        if(contents == null) {
            readSource(normalized)
        }
        else {
            cache[normalized] = FileCacheEntry(SourceFile.fromCode(normalized, contents), contents)
        }
    }

    fun getSourceFile(path: String): SourceFile {
        val source = cache[path]?.sourceFile

        if(source != null) {
            return source
        }

        return readSource(path)
    }

	fun addVirtualEntry(entry: String, name: String): String {
		val fileName = "$entry.closure-virtual-entry.js"
		val base = File(entry).name
		val identifier = name.replace(".js", "")
		val contents = "import * as _${identifier}_ from './$base'\n__C('$identifier', _${identifier}_)"

		cache[fileName] = FileCacheEntry(SourceFile.fromCode(fileName, contents), contents)

		return fileName
	}

    private fun resolve(path: String): String {
        val normalized = normalize(path)

        if(normalized.endsWith("/package.json")) {
            return normalized
        }

        return normalized.replace("node_modules/rxjs/", "node_modules/rxjs/_esm2015/")
    }

    private fun readSource(path: String): SourceFile {
        val normalized = normalize(path)
        val resolved = resolve(path)
		val contents = File(resolved).readText()
        val source = SourceFile.fromCode(normalized, contents)
        val entry = FileCacheEntry(source, contents)

        cache[normalized] = entry

        return source
    }

    private fun normalize(path: String): String {
        val normalized = File(path).toPath().normalize().toFile().absolutePath
        val alias = aliases[normalized]

        return alias ?: normalized
    }
}
