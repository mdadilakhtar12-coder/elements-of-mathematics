package com.elementsofmathematics.app.data

data class LibraryItem(val section: Section, val item: ContentItem) {
    val key get() = "${section.id}/${item.id}"
}
data class LibraryCatalog(val items: List<LibraryItem> = emptyList(), val loading: Boolean = true)
data class DownloadEntry(val fileName: String, val title: String, val docKey: String, val sectionTitle: String)

object LibrarySearch {
    fun filter(items: List<LibraryItem>, query: String): List<LibraryItem> {
        val terms = query.trim().split(Regex("\\s+")).filter(String::isNotBlank)
        if (terms.isEmpty()) return emptyList()
        return items.filter { entry -> !entry.item.isFolder && terms.all { term ->
            entry.item.title.contains(term, ignoreCase = true) || entry.section.title.contains(term, ignoreCase = true)
        } }
    }
}
