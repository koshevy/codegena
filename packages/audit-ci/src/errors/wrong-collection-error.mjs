class WrongCollectionError extends Error {
  constructor(collectionName, options) {
    const { index, value } = options;

    const message = [
      `${collectionName} at index "${index}" is wrong!`,
      `Wrong value is: ${JSON.stringify(value, null, 2)}`,
    ].join('\n');

    super(message, options);
    this.name = 'WrongCollectionError';
  }
}

export {
  WrongCollectionError,
};
