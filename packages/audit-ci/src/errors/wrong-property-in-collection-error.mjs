class WrongPropertyInCollectionError extends Error {
  constructor(collectionName, options) {
    const { index, propertyName, value, additionalMessage } = options;

    const message = [
      `${collectionName} at index "${index}" has wrong property "${propertyName}"!`,
      `Wrong value is: ${JSON.stringify(value, null, 2)}`,
      ...(additionalMessage ? [additionalMessage] : []),
    ].join('\n');

    super(message, options);
    this.name = 'WrongPropertyInCollectionError';
  }
}

export {
  WrongPropertyInCollectionError,
};
