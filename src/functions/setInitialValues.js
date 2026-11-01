export const setInitialValues = (values) => {
  const {
    dataLoading,
    setIsFileUploaded,
    setDataLoading,
    setMetaData,
    setChartData,
    setBooksAlignment,
    setBooks,
  } = values;

  setIsFileUploaded(false);

  setDataLoading({
    ...dataLoading,
    //uploading: true,
    //metadata: true,
    chart: true,
  });

  setMetaData({});

  setChartData({
    tokens: {
      first: "",
      second: "",
    },
    dataSets: [],
    msData: [],
  });

  setBooksAlignment([]);

  setBooks();
};
