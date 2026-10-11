package com.elementsofmathematics.app.data

/** Folders share a section's collection and content type. Legacy files remain at the root. */
object FolderTree {
    fun children(items: List<ContentItem>, parentId: String?) =
        items.filter { it.parentId.orEmpty() == parentId.orEmpty() }

    fun ancestors(items: List<ContentItem>, folderId: String?): List<ContentItem> {
        val byId = items.associateBy { it.id }
        val seen = mutableSetOf<String>()
        val result = mutableListOf<ContentItem>()
        var id = folderId.orEmpty()
        while (id.isNotEmpty()) {
            require(seen.add(id)) { "Folder cannot contain itself" }
            val folder = byId[id]
            require(folder?.isFolder == true) { "Folder no longer exists" }
            result.add(folder!!)
            id = folder.parentId.orEmpty()
        }
        return result.reversed()
    }

    fun validate(items: List<ContentItem>, item: ContentItem) {
        require(item.title.isNotBlank() && item.title.length <= 200) { "Enter a title (up to 200 characters)" }
        val path = ancestors(items, item.parentId)
        require(path.none { it.id == item.id && item.id.isNotEmpty() }) { "Cannot move a folder into itself or its subfolder" }
        require(path.size < 20) { "Maximum folder depth is 20" }
        if (item.isFolder) require(item.url.isEmpty() && item.storagePath.isEmpty()) { "Folders cannot contain file data" }
    }

    fun destinations(items: List<ContentItem>, item: ContentItem) = items.filter { candidate ->
        candidate.isFolder && runCatching { validate(items, item.copy(parentId = candidate.id)) }.isSuccess
    }

    fun path(items: List<ContentItem>, folderId: String?) =
        ancestors(items, folderId).joinToString(" / ") { it.title }.ifEmpty { "Section root" }
}
