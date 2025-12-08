/**
 * Utilidades para paginación
 */
export class PaginationUtils {
  /**
   * Calcula el rango de elementos para la página actual
   */
  static getPageRange (currentPage, itemsPerPage, totalItems) {
    const start = (currentPage - 1) * itemsPerPage + 1
    const end = Math.min(currentPage * itemsPerPage, totalItems)
    return { start, end }
  }

  /**
   * Calcula el número total de páginas
   */
  static getTotalPages (totalItems, itemsPerPage) {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage))
  }

  /**
   * Actualiza la información de paginación en el DOM
   */
  static updatePaginationInfo (start, end, total, elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = `Mostrando ${start}-${end} de ${total}`
    }
  }

  /**
   * Actualiza el estado de los botones de paginación
   */
  static updatePaginationButtons (currentPage, totalPages, prevButtonId, nextButtonId) {
    const prevButton = document.getElementById(prevButtonId)
    const nextButton = document.getElementById(nextButtonId)

    if (prevButton) {
      prevButton.disabled = currentPage <= 1
    }

    if (nextButton) {
      nextButton.disabled = currentPage >= totalPages
    }
  }

  /**
   * Renderiza una página específica de elementos
   */
  static renderPage (items, currentPage, itemsPerPage, renderFunction) {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    const pageItems = items.slice(start, end)
    return pageItems.map(renderFunction)
  }
}

