export const getMetadataObject = (book1, book2, releaseCode) => {
  const buildBook = (book, useVersionUri = false) => {
    if (!book) return null;
    const isManuscript = !!book?.manuscript;
    const holding = book?.manuscript?.manuscript_holding;
    return {
      bookTitle: isManuscript ? null : {
        label: book?.text?.title_lat_prefered,
        path: useVersionUri ? book?.version_uri : book?.text?.text_uri,
      },
      bookAuthor: isManuscript ? null : book?.text?.author[0]?.author_lat_prefered,
      shelfmark: isManuscript ? book?.manuscript?.shelfmark : null,
      manuscriptHolding: isManuscript
        ? (holding?.names?.en ?? holding?.loc_uri ?? null)
        : null,
      url: book?.release_version?.url,
      wordCount: book?.release_version?.tok_length,
      versionCode: book?.version_code,
      annotationStatus: book?.release_version?.annotation_status,
    };
  };

  return {
    book1: buildBook(book1, false),
    book2: book2 ? buildBook(book2, true) : null,
    releaseCode: releaseCode,
  };
};
