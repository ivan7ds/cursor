/**
 * Transformar elements de tariff al formato OCPI 2.2
 * @param {Object} tariffData - Datos de la tarifa
 * @returns {Object} Tarifa con elements transformados
 */
function transformTariffElements(tariffData) {
  if (!tariffData.elements) {
    return tariffData;
  }

  const transformedElements = tariffData.elements.map(element => {
    if (element.price_components) {
      return {
        price_components: element.price_components
      };
    }

    if (element.component_type && element.price !== undefined) {
      return {
        price_components: [{
          type: element.component_type,
          price: element.price,
          vat: element.vat || 0,
          step_size: element.step || 1
        }]
      };
    }

    return {
      price_components: []
    };
  });

  return {
    ...tariffData,
    elements: transformedElements
  };
}

module.exports = {
    transformTariffElements
};

