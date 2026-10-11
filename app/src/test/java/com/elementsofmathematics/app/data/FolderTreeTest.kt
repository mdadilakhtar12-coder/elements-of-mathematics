package com.elementsofmathematics.app.data

import org.junit.Assert.*
import org.junit.Test

class FolderTreeTest {
    private val folder = ContentItem(id = "a", title = "Class 12", isFolder = true)
    private val child = ContentItem(id = "b", title = "Matrices", isFolder = true, parentId = "a")
    private val pdf = ContentItem(id = "p", title = "Notes", parentId = "b")
    private val items = listOf(folder, child, pdf, ContentItem(id = "old", title = "Legacy"))

    @Test fun legacyContentStaysAtRootAndFoldersHaveSeparateChildren() {
        assertEquals(listOf("a", "old"), FolderTree.children(items, "").map { it.id })
        assertEquals(listOf(pdf), FolderTree.children(items, "b"))
        assertEquals("Class 12 / Matrices", FolderTree.path(items, "b"))
    }
    @Test fun cannotMoveFolderIntoItselfOrDescendant() {
        assertTrue(runCatching { FolderTree.validate(items, folder.copy(parentId = "b")) }.isFailure)
        assertTrue(runCatching { FolderTree.validate(items, folder.copy(parentId = "a")) }.isFailure)
        assertEquals(emptyList<ContentItem>(), FolderTree.destinations(items, folder))
        FolderTree.validate(items, pdf.copy(parentId = "a"))
    }
    @Test fun missingParentAndFileParentAreRejected() {
        assertTrue(runCatching { FolderTree.validate(items, pdf.copy(parentId = "missing")) }.isFailure)
        assertTrue(runCatching { FolderTree.validate(items, child.copy(parentId = "p")) }.isFailure)
    }
    @Test fun cyclesInRemoteDataDoNotLoopForever() {
        val cycle = listOf(folder.copy(parentId = "b"), child)
        assertTrue(runCatching { FolderTree.ancestors(cycle, "a") }.isFailure)
    }
    @Test fun searchNeverTreatsFoldersAsPdfs() {
        val section = Section(id = "s", title = "Book")
        assertTrue(LibrarySearch.filter(listOf(LibraryItem(section, folder)), "class").isEmpty())
    }
}
