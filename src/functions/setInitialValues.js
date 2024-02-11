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
    uploading: true,
    metadata: true,
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

  setBooksAlignment({
    // alignment strings:
    s1: "",
    s2: "",
    // part of the milestones before the alignment:
    beforeAlignment1: "",
    beforeAlignment2: "",
    // part of the milestones after the alignment:
    afterAlignment1: "",
    afterAlignment2: "",
    // token (*w*ord) offset of *b*eginning and *e*nd of the alignment:
    bw1: 0,
    ew1: 0,
    bw2: 0,
    ew2: 0,
    // *c*haracter offset of *b*eginning and *e*nd of the alignment:
    bc1: 0,
    ec1: 0,
    bc2: 0,
    ec2: 0,
  });

  setBooks();
};
