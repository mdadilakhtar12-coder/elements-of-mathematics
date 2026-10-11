package com.elementsofmathematics.app.data

import org.junit.Assert.*
import org.junit.Test

class LibrarySearchTest {
    private val pdf = LibraryItem(Section(id = "notes", title = "Revision Notes"), ContentItem(id = "1", title = "Relations and Functions"))
    private val video = LibraryItem(Section(id = "videos", title = "Video Lectures", type = SectionType.VIDEO), ContentItem(id = "1", title = "Integrals"))
    @Test fun matchesCaseInsensitiveTitleAndSectionWithAllQueryWords() {
        assertEquals(listOf(pdf), LibrarySearch.filter(listOf(pdf, video), "  REVISION   functions  "))
        assertEquals(listOf(video), LibrarySearch.filter(listOf(pdf, video), "integrals"))
        assertTrue(LibrarySearch.filter(listOf(pdf, video), "functions video").isEmpty())
    }
    @Test fun blankQueryDoesNotListEveryResource() { assertTrue(LibrarySearch.filter(listOf(pdf, video), "   ").isEmpty()) }
    @Test fun idsFromDifferentSectionsRemainDistinct() { assertNotEquals(pdf.key, video.key) }
}
